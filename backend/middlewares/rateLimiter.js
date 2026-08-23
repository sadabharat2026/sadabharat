const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

const envInt = (name, fallback) => {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const enabled = () => process.env.RATE_LIMIT_ENABLED !== 'false';

const ipKey = (req) => {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  return ipKeyGenerator(ip, 56);
};

const tooMany = (req, res, _next, options) => {
  const retryAfterSec = Math.ceil(options.windowMs / 1000);
  res.set('Retry-After', String(retryAfterSec));
  res.status(options.statusCode).json({
    success: false,
    message: 'Too many requests. Please try again later.',
    retryAfterSec,
  });
};

const makeLimiter = (max, windowMs) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: ipKey,
    handler: tooMany,
    skip: () => !enabled(),
  });

const limiters = {
  otp: makeLimiter(
    envInt('RATE_LIMIT_OTP_MAX', 5),
    envInt('RATE_LIMIT_OTP_WINDOW_MS', 60_000)
  ),
  auth: makeLimiter(
    envInt('RATE_LIMIT_AUTH_MAX', 15),
    envInt('RATE_LIMIT_AUTH_WINDOW_MS', 60_000)
  ),
  public: makeLimiter(
    envInt('RATE_LIMIT_PUBLIC_MAX', 3500),
    envInt('RATE_LIMIT_PUBLIC_WINDOW_MS', 60_000)
  ),
  app: makeLimiter(
    envInt('RATE_LIMIT_APP_MAX', envInt('RATE_LIMIT_MAX', 120)),
    envInt('RATE_LIMIT_APP_WINDOW_MS', envInt('RATE_LIMIT_WINDOW_MS', 60_000))
  ),
  upload: makeLimiter(
    envInt('RATE_LIMIT_UPLOAD_MAX', 20),
    envInt('RATE_LIMIT_UPLOAD_WINDOW_MS', 60_000)
  ),
  coupon: makeLimiter(
    envInt('RATE_LIMIT_COUPON_MAX', 30),
    envInt('RATE_LIMIT_COUPON_WINDOW_MS', 60_000)
  ),
  consult: makeLimiter(
    envInt('RATE_LIMIT_CONSULT_MAX', 10),
    envInt('RATE_LIMIT_CONSULT_WINDOW_MS', 60_000)
  ),
};

const exact = (path, pathname) => path === pathname;

const classify = (req) => {
  const path = String(req.originalUrl || req.path || '').split('?')[0].replace(/\/+$/, '') || '/';
  const method = req.method.toUpperCase();

  if (method === 'POST' && exact(path, '/api/shipping/webhook')) return 'skip';
  if (method === 'GET' && (path === '/' || path === '')) return 'skip';

  if (
    method === 'POST' &&
    (exact(path, '/api/users/send-otp') || exact(path, '/api/users/send-register-otp'))
  ) {
    return 'otp';
  }

  if (
    method === 'POST' &&
    (exact(path, '/api/users/login') ||
      exact(path, '/api/users/signup') ||
      exact(path, '/api/users/register') ||
      exact(path, '/api/users/verify-otp') ||
      exact(path, '/api/vendors/login') ||
      exact(path, '/api/vendors/register'))
  ) {
    return 'auth';
  }

  if (method === 'POST' && (exact(path, '/api/upload') || path.startsWith('/api/upload/'))) {
    return 'upload';
  }
  if (method === 'POST' && exact(path, '/api/coupons/validate')) return 'coupon';
  if (method === 'POST' && exact(path, '/api/consultations')) return 'consult';

  if (method === 'GET') {
    const publicPrefixes = [
      '/api/products',
      '/api/categories',
      '/api/banners',
      '/api/settings',
      '/api/offers',
      '/api/blogs',
      '/api/coupons/public',
      '/api/testimonials',
      '/api/instagram',
      '/api/locations',
      '/api/policies',
    ];
    const isAdminish = path.includes('/admin');
    if (!isAdminish && publicPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
      return 'public';
    }
  }

  return 'app';
};

/** Per-IP dispatcher. Must run after express.json() so body is available to OTP mobile cap. */
const ipRateLimiter = (req, res, next) => {
  if (!enabled()) return next();
  const tier = classify(req);
  if (tier === 'skip') return next();
  const limiter = limiters[tier] || limiters.app;
  return limiter(req, res, next);
};

/** Extra cap: same mobile cannot request OTP faster than OTP_RATE_LIMIT / OTP_RATE_WINDOW. */
const otpMobileHits = new Map();

const otpMobileLimiter = (req, res, next) => {
  if (!enabled()) return next();

  const max = envInt('OTP_RATE_LIMIT', 5);
  const windowMs = envInt('OTP_RATE_WINDOW', 600) * 1000;
  const mobile = String(req.body?.mobile || '').replace(/\D/g, '');
  if (!mobile) return next();

  const now = Date.now();
  const rec = otpMobileHits.get(mobile);
  if (!rec || now >= rec.resetAt) {
    otpMobileHits.set(mobile, { count: 1, resetAt: now + windowMs });
    return next();
  }
  if (rec.count >= max) {
    const retryAfterSec = Math.max(1, Math.ceil((rec.resetAt - now) / 1000));
    res.set('Retry-After', String(retryAfterSec));
    return res.status(429).json({
      success: false,
      message: 'Too many OTP requests for this number. Please try again later.',
      retryAfterSec,
    });
  }
  rec.count += 1;
  return next();
};

setInterval(() => {
  const now = Date.now();
  for (const [key, rec] of otpMobileHits.entries()) {
    if (now >= rec.resetAt) otpMobileHits.delete(key);
  }
}, 60_000).unref();

module.exports = {
  ipRateLimiter,
  otpMobileLimiter,
  classify,
};

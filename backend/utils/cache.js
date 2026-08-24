const { cacheGet, cacheSet, cacheDel } = require('../config/redis');
const { optimizeMediaUrls } = require('./imageOptimize');

const PREFIX = 'sadabharat:catalog:v4:';

const CATALOG_KEYS = {
  products: `${PREFIX}products`,
  categories: `${PREFIX}categories`,
  banners: `${PREFIX}banners`,
  offers: `${PREFIX}offers`,
  settings: `${PREFIX}settings`,
  testimonials: `${PREFIX}testimonials`,
  instagram: `${PREFIX}instagram`,
  blogs: `${PREFIX}blogs`,
  coupons: `${PREFIX}coupons-public`,
  policies: `${PREFIX}policies`,
  locations: `${PREFIX}locations`
};

const catalogKey = (name, extra) => {
  const base = CATALOG_KEYS[name] || `${PREFIX}${name}`;
  return extra ? `${base}:${extra}` : base;
};

const invalidateCatalog = async (...names) => {
  const keys = names.flat().map((name) => catalogKey(name));
  await cacheDel(...keys);
};

const cachePublic = (name, ttlSeconds = 60) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();

    const extra = req.params && req.params.id
      ? req.params.id
      : req.params && req.params.type
        ? req.params.type
        : '';
    const key = catalogKey(name, extra);

    try {
      const hit = await cacheGet(key);
      if (hit) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', `public, max-age=20, stale-while-revalidate=${ttlSeconds}`);
        return res.status(200).json(optimizeMediaUrls(hit));
      }
    } catch (err) {
      // Fall through to the database on cache errors
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      const payload = optimizeMediaUrls(body);
      const ok = res.statusCode < 400 && payload && payload.success !== false && payload.status !== 'fail';
      if (ok) {
        cacheSet(key, payload, ttlSeconds).catch(() => {});
      }
      if (!res.get('X-Cache')) res.set('X-Cache', 'MISS');
      res.set('Cache-Control', `public, max-age=20, stale-while-revalidate=${ttlSeconds}`);
      return originalJson(payload);
    };

    next();
  };
};

module.exports = {
  CATALOG_KEYS,
  catalogKey,
  invalidateCatalog,
  cachePublic
};

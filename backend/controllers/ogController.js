const Product = require('../models/productModel');

// Serves a bot-only HTML page with per-product Open Graph tags so link
// previews (WhatsApp, Facebook, Telegram, etc.) show the product photo
// instead of the site logo. Real browsers never see this — nginx should
// only route known crawler user-agents here for /product/:id (see deploy
// notes); everyone else gets the normal SPA.
const SITE_URL = (process.env.FRONTEND_URL || 'https://sadabharatayurvedic.com').replace(/\/$/, '');

const escapeHtml = (str = '') =>
  String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

const toAbsoluteUrl = (url) => {
  if (!url) return `${SITE_URL}/logo.png`;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getProductOgHtml = async (req, res) => {
  const { id } = req.params;
  const productUrl = `${SITE_URL}/product/${id}`;

  let product = null;
  try {
    product = await Product.findOne({ _id: id, status: 'approved' }).select('name description image').lean();
  } catch (err) {
    // invalid id or db error — fall through to generic fallback below
  }

  const title = product ? `${product.name} | Sada Bharat Ayurvedic` : 'Sada Bharat Ayurvedic';
  const description = product?.description
    ? String(product.description).slice(0, 200)
    : 'Pure Ayurvedic products for strong, healthy & beautiful hair and skin.';
  const image = toAbsoluteUrl(product?.image);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
  res.status(200).send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />

  <meta property="og:type" content="product" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:url" content="${escapeHtml(productUrl)}" />
  <meta property="og:site_name" content="Sada Bharat Ayurvedic" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
</head>
<body>
  <a href="${escapeHtml(productUrl)}">${escapeHtml(title)}</a>
</body>
</html>`);
};

module.exports = { getProductOgHtml };

// Vercel serverless function. Only hit by social-media link-preview bots
// (see vercel.json rewrites) so they get real per-product og:image/og:title
// instead of the SPA shell, which only has the site logo as a static fallback.

const SITE_URL = 'https://sadabharatayurvedic.com';
const API_URL = process.env.VITE_API_URL || process.env.BACKEND_API_URL || 'https://api.sadabharatayurvedic.com/api';

const escapeHtml = (str = '') =>
  String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

const toAbsoluteUrl = (path) => {
  if (!path) return `${SITE_URL}/logo.png`;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default async function handler(req, res) {
  const { id } = req.query;
  const productUrl = `${SITE_URL}/product/${id}`;

  let product = null;
  try {
    const r = await fetch(`${API_URL}/products/${id}`);
    if (r.ok) {
      const json = await r.json();
      product = json?.data || null;
    }
  } catch (err) {
    // fall through to generic fallback below
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
}

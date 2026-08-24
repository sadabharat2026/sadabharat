export const isUsableImageUrl = (url) =>
  typeof url === 'string' && url.trim() !== '' && !url.startsWith('blob:');

const CLOUDINARY_HOST = 'res.cloudinary.com';
const WEB_TRANSFORM = 'f_webp,q_80,c_limit,w_1600';
const TRANSFORM_PREFIX = /^(c|w|h|f|q|g|x|y|z|e|b|r|a|t|o|u|l|dpr|fl|bo|co|d|ac|so|eo|vs|dl|fn|if|ar|pg|dn|cs|af)_/;

const isNonImageUrl = (url) =>
  /\/(video|raw|audio)\//.test(url)
  || /\.(mp4|webm|mov|avi|mkv|pdf|svg)(\?|#|$)/i.test(url);

const unsplashToWebp = (url) => {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('fm', 'webp');
    if (!parsed.searchParams.get('q')) parsed.searchParams.set('q', '80');
    return parsed.toString();
  } catch {
    return url;
  }
};

const isTransformSegment = (seg) => {
  if (!seg || /^v\d+$/.test(seg)) return false;
  if (seg.includes(',')) return true;
  return TRANSFORM_PREFIX.test(seg);
};

const rebuildCloudinaryUrl = (url, transform) => {
  const marker = '/upload/';
  const at = url.indexOf(marker);
  if (at === -1) return url;
  const prefix = url.slice(0, at + marker.length);
  const parts = url.slice(at + marker.length).split('/').filter(Boolean);
  while (parts.length && isTransformSegment(parts[0])) parts.shift();
  if (!parts.length) return url;
  return `${prefix}${transform}/${parts.join('/')}`;
};

export const toWebpUrl = (url) => {
  if (typeof url !== 'string' || !url) return url;
  if (url.includes('images.unsplash.com')) return unsplashToWebp(url);
  if (!url.includes(CLOUDINARY_HOST) || !url.includes('/upload/')) return url;
  if (isNonImageUrl(url)) return url;
  return rebuildCloudinaryUrl(url, WEB_TRANSFORM);
};

export const cloudinaryAssetKey = (url) => {
  if (typeof url !== 'string' || !url.includes(CLOUDINARY_HOST) || !url.includes('/upload/')) {
    return url;
  }
  const marker = '/upload/';
  const at = url.indexOf(marker);
  const parts = url.slice(at + marker.length).split('/').filter(Boolean);
  while (parts.length && isTransformSegment(parts[0])) parts.shift();
  return parts.join('/');
};

export const optimizeMediaUrls = (value, seen = new WeakSet()) => {
  if (value && typeof value === 'object' && value.$__ && value._doc) {
    return optimizeMediaUrls(value._doc, seen);
  }
  if (typeof value === 'string') {
    if (!value.includes(CLOUDINARY_HOST) && !value.includes('images.unsplash.com')) return value;
    return value.replace(/https?:\/\/[^\s"'\\<>]+/g, (match) => toWebpUrl(match));
  }
  if (!value || typeof value !== 'object') return value;
  if (value instanceof Date) return value;
  if (seen.has(value)) return value;
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => optimizeMediaUrls(item, seen));
  if (value.constructor && value.constructor !== Object) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [key, optimizeMediaUrls(nested, seen)])
  );
};

export const resolveUploadedUrl = (uploadedUrl) => {
  if (!uploadedUrl) return '';
  if (uploadedUrl.startsWith('http://') || uploadedUrl.startsWith('https://')) return toWebpUrl(uploadedUrl);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const backendUrl = apiUrl.replace(/\/api\/?$/, '');
  return `${backendUrl}${uploadedUrl.startsWith('/') ? uploadedUrl : `/${uploadedUrl}`}`;
};

export const getStoredProductImages = (product) => {
  if (!product) return [];
  const seen = new Set();
  const out = [];
  const list = [
    ...(Array.isArray(product.images) ? product.images : []),
    product.image,
  ].filter(isUsableImageUrl);
  list.forEach((url) => {
    const key = cloudinaryAssetKey(url) || url;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(toWebpUrl(url));
  });
  return out;
};

export const expandSingleImageGallery = (url) => {
  if (!isUsableImageUrl(url)) return [];
  if (url.includes(CLOUDINARY_HOST) && url.includes('/upload/')) {
    return [
      toWebpUrl(url),
      rebuildCloudinaryUrl(url, 'f_webp,q_80,c_fill,g_center,z_1.22,w_900,h_900'),
      rebuildCloudinaryUrl(url, 'f_webp,q_80,c_fill,g_auto,z_1.42,w_900,h_900'),
    ];
  }
  if (url.includes('images.unsplash.com')) {
    const base = url.split('?')[0];
    return [
      toWebpUrl(url),
      toWebpUrl(`${base}?w=800&h=800&fit=crop&crop=entropy&q=80`),
      toWebpUrl(`${base}?w=800&h=800&fit=crop&crop=top&q=80`),
    ];
  }
  return [url];
};

export const getProductImages = (product) => {
  const stored = getStoredProductImages(product);
  if (stored.length >= 2) return stored;
  return expandSingleImageGallery(stored[0] || product?.image);
};

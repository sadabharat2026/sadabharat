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

const toWebpUrl = (url) => {
  if (typeof url !== 'string' || !url) return url;
  if (url.includes('images.unsplash.com')) return unsplashToWebp(url);
  if (!url.includes(CLOUDINARY_HOST) || !url.includes('/upload/')) return url;
  if (isNonImageUrl(url)) return url;
  return rebuildCloudinaryUrl(url, WEB_TRANSFORM);
};

const optimizeInString = (value) => {
  if (typeof value !== 'string') return value;
  if (!value.includes(CLOUDINARY_HOST) && !value.includes('images.unsplash.com')) return value;
  return value.replace(/https?:\/\/[^\s"'\\<>]+/g, (match) => toWebpUrl(match));
};

const toPlainJson = (value) => {
  if (value && typeof value === 'object' && value.$__ && typeof value.toJSON === 'function') {
    return value.toJSON();
  }
  if (value && typeof value === 'object' && value.$__ && value._doc) {
    return value._doc;
  }
  return value;
};

const isObjectId = (value) => Boolean(
  value
  && typeof value === 'object'
  && (value._bsontype === 'ObjectId' || value.constructor?.name === 'ObjectId')
);

const isPlainObject = (value) => Boolean(
  value
  && typeof value === 'object'
  && (value.constructor === Object || Object.getPrototypeOf(value) === Object.prototype)
);

const optimizeMediaUrls = (value, seen = new WeakSet()) => {
  value = toPlainJson(value);
  if (typeof value === 'string') return optimizeInString(value);
  if (value == null || typeof value !== 'object') return value;
  if (value instanceof Date) return value;
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) return value;
  if (isObjectId(value)) return value;
  if (seen.has(value)) return value;
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => optimizeMediaUrls(item, seen));
  if (!isPlainObject(value)) return value;
  const out = {};
  for (const [key, nested] of Object.entries(value)) {
    out[key] = optimizeMediaUrls(nested, seen);
  }
  return out;
};

module.exports = { toWebpUrl, optimizeMediaUrls };

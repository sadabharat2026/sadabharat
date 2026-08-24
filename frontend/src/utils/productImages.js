export const isUsableImageUrl = (url) =>
  typeof url === 'string' && url.trim() !== '' && !url.startsWith('blob:');

export const resolveUploadedUrl = (uploadedUrl) => {
  if (!uploadedUrl) return '';
  if (uploadedUrl.startsWith('http://') || uploadedUrl.startsWith('https://')) return uploadedUrl;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const backendUrl = apiUrl.replace(/\/api\/?$/, '');
  return `${backendUrl}${uploadedUrl.startsWith('/') ? uploadedUrl : `/${uploadedUrl}`}`;
};

const insertCloudinaryTransform = (url, transform) => {
  const marker = '/upload/';
  const at = url.indexOf(marker);
  if (at === -1) return url;
  const rest = url.slice(at + marker.length);
  return `${url.slice(0, at + marker.length)}${transform}/${rest}`;
};

export const expandSingleImageGallery = (url) => {
  if (!isUsableImageUrl(url)) return [];

  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    return [
      url,
      insertCloudinaryTransform(url, 'c_fill,g_center,z_1.22,w_900,h_900,q_auto,f_auto'),
      insertCloudinaryTransform(url, 'c_fill,g_auto,z_1.42,w_900,h_900,q_auto,f_auto'),
    ];
  }

  if (url.includes('images.unsplash.com')) {
    const base = url.split('?')[0];
    return [
      url,
      `${base}?w=800&h=800&fit=crop&crop=entropy&q=80`,
      `${base}?w=800&h=800&fit=crop&crop=top&q=80`,
    ];
  }

  return [url];
};

export const getProductImages = (product) => {
  if (!product) return [];
  const list = [
    ...(Array.isArray(product.images) ? product.images : []),
    ...(Array.isArray(product.gallery) ? product.gallery : []),
    product.image,
  ].filter(isUsableImageUrl);
  const unique = [...new Set(list)];
  if (unique.length >= 2) return unique;
  return expandSingleImageGallery(unique[0] || product.image);
};


/** Products customers can open / buy. All others show Coming Soon. */
export const MAIN_PRODUCT_SLUGS = [
  'sada-bharat-ayurvedic-hair-oil',
  'sada-bharat-ayurvedic-hair-serum',
  'sada-bharat-ayurvedic-hair-spray',
  'sada-bharat-complete-hair-care-kit',
];

export const MAIN_PRODUCT_IMAGES = [
  '/product1.jpeg',
  '/product2.jpeg',
  '/product3.jpeg',
  '/combo1.jpeg',
  '/combo2.jpeg',
  '/combo3.jpeg',
  '/hair-oil-lifestyle.webp',
  '/hair-serum-lifestyle.webp',
  '/hair-spray-lifestyle.webp',
  '/combo-kit-gift.jpg',
  '/combo-kit-alt.webp',
  '/combo-trio-wood.webp',
  '/combo-trio-white.webp',
];

const normalize = (value) => String(value || '').trim().toLowerCase();

export const isMainProduct = (product) => {
  if (!product) return false;
  if (product.comingSoon === true) return false;
  if (product.comingSoon === false && product.sku && MAIN_PRODUCT_SLUGS.includes(normalize(product.sku))) {
    return true;
  }
  const image = normalize(product.image);
  if (MAIN_PRODUCT_IMAGES.some((path) => image.endsWith(path) || image.includes(path.slice(1)))) {
    return true;
  }
  const name = normalize(product.name);
  const category = normalize(product.category);
  if (category === 'combo' || name.includes('hair care kit')) {
    return true;
  }
  return (
    (name.includes('hair oil') && name.includes('sada bharat')) ||
    (name.includes('hair serum') && name.includes('sada bharat')) ||
    (name.includes('hair spray') && name.includes('sada bharat'))
  );
};

export const isComingSoonProduct = (product) => {
  if (!product) return true;
  if (typeof product.comingSoon === 'boolean') return product.comingSoon;
  return !isMainProduct(product);
};

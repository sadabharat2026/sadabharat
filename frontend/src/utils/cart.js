export const sameId = (a, b) => String(a ?? '') === String(b ?? '');

export const normalizeSize = (size) => {
  if (size == null || size === '') return '';
  return String(size).trim().toLowerCase().replace(/\s+/g, ' ');
};

export const getProductVariants = (product) => {
  if (!product) return [];
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants;
  }
  if (product.packSize) {
    return [{ size: product.packSize, price: product.price, oldPrice: product.oldPrice }];
  }
  return [];
};

export const resolveSelectedSize = (product, selectedSize) => {
  const variants = getProductVariants(product);
  return selectedSize || variants[0]?.size || product?.packSize || null;
};

export const isSameCartLine = (item, productId, size) => {
  if (!item || !sameId(item._id, productId)) return false;
  const itemSize = normalizeSize(item.selectedSize ?? item.packSize ?? item.size);
  const compareSize = normalizeSize(size);
  if (itemSize === compareSize) return true;
  // Older cart rows may have no size — count them for the selected unit
  if (!itemSize || !compareSize) return true;
  return false;
};

export const getCartQty = (cart, productId, size) => {
  if (!Array.isArray(cart)) return 0;
  return cart
    .filter((item) => isSameCartLine(item, productId, size))
    .reduce((sum, item) => sum + (item.quantity || 0), 0);
};

export const getCartQtyForProduct = (cart, productId) => {
  if (!Array.isArray(cart)) return 0;
  return cart
    .filter((item) => sameId(item._id, productId))
    .reduce((sum, item) => sum + (item.quantity || 0), 0);
};

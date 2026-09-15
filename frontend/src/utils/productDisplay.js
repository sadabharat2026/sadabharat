/**
 * Resolve display pack size from product / selected variant.
 */
export const getDisplayPackSize = (product, selectedSize) => {
  if (!product) return '';
  const size = String(selectedSize || product.packSize || product.variants?.[0]?.size || '').trim();
  return size;
};

/**
 * Description text with pack size injected dynamically when missing.
 * Admin/vendor can change packSize or description independently — UI stays in sync.
 */
export const formatProductDescription = (product, selectedSize) => {
  if (!product) return '';
  const pack = getDisplayPackSize(product, selectedSize);
  const name = String(product.name || '').trim();
  let desc = String(product.description || '').trim();

  if (!desc) {
    return pack
      ? `${name || 'Product'} (${pack}) is crafted for strong, healthy & beautiful results with Ayurvedic care.`
      : `${name || 'Product'} — premium Ayurvedic care.`;
  }

  if (!pack) return desc;

  const packEscaped = pack.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (new RegExp(packEscaped, 'i').test(desc)) return desc;

  if (name && new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(desc)) {
    return desc.replace(new RegExp(`^(${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i'), `$1 (${pack})`);
  }

  return `${desc} Pack size: ${pack}.`;
};

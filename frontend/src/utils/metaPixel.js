/**
 * Meta Pixel helpers for Facebook / Instagram ad visit & conversion tracking.
 * Pixel is initialized in index.html; these helpers fire SPA page views and events.
 */

export const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '1003264154124222';

const isStorefrontPath = (pathname = '') =>
  !pathname.startsWith('/admin') && !pathname.startsWith('/vendor');

export const isMetaPixelReady = () =>
  typeof window !== 'undefined' && typeof window.fbq === 'function';

/** Track a standard Meta event (PageView, ViewContent, AddToCart, Purchase, …) */
export const trackMeta = (event, params) => {
  if (!isMetaPixelReady()) return;
  if (params) {
    window.fbq('track', event, params);
  } else {
    window.fbq('track', event);
  }
};

/** Fire PageView for storefront routes only (skip admin/vendor panels) */
export const trackMetaPageView = (pathname) => {
  if (!isStorefrontPath(pathname)) return;
  trackMeta('PageView');
};

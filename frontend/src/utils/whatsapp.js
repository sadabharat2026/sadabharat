export const WHATSAPP_PHONE = '919772777736';

const DEFAULT_MESSAGE =
  'Hello Sada Bharat Ayurvedic, I have an inquiry regarding your organic products.';

const isMobileDevice = () =>
  /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

export const getWhatsAppHref = (text = DEFAULT_MESSAGE) => {
  const encoded = encodeURIComponent(text);
  return `https://web.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encoded}`;
};

/** Opens WhatsApp chat directly — app on mobile, WhatsApp Web chat on desktop. */
export const openWhatsAppChat = (text = DEFAULT_MESSAGE) => {
  const encoded = encodeURIComponent(text);
  if (isMobileDevice()) {
    window.location.href = `whatsapp://send?phone=${WHATSAPP_PHONE}&text=${encoded}`;
    return;
  }
  window.open(
    `https://web.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encoded}`,
    '_blank',
    'noopener,noreferrer'
  );
};

export const handleWhatsAppClick = (text = DEFAULT_MESSAGE) => (e) => {
  e.preventDefault();
  openWhatsAppChat(text);
};

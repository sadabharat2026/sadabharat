import html2pdf from 'html2pdf.js';

export const generateInvoice = async (order) => {
  const element = document.createElement('div');
  element.style.padding = '40px';
  element.style.background = '#fff';
  element.style.color = '#333';
  element.style.fontFamily = 'serif';
  element.style.width = '700px';

  const date = new Date(order.createdAt).toLocaleDateString();
  const subTotal = order.itemsPrice ?? order.subTotal ?? 0;
  const taxAmount = order.taxPrice ?? order.taxAmount ?? 0;
  const taxRate = order.taxRate ?? '';
  const shippingAmount = order.shippingPrice ?? order.actualShippingAmount ?? order.shippingAmount ?? 0;
  const grandTotal = order.totalPrice ?? order.totalAmount ?? 0;
  const couponLabel = order.couponCode || order.couponApplied || '';

  element.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 2px solid #5C2E3E; padding-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 20px;">
        <img src="/logo_invoice.jpg" style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px;" />
        <div>
          <h1 style="color: #5C2E3E; margin: 0; font-size: 28px; text-transform: uppercase; font-weight: 900;">Sada Bharat</h1>
          <p style="margin: 5px 0; font-size: 10px; color: #666; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Sacred Organic Beauty Rituals</p>
        </div>
      </div>
      <div style="text-align: right; font-size: 10px; color: #666; font-weight: bold; line-height: 1.4;">
        <p style="margin: 0;">Lajpat Nagar, Near Radha Swami Bhawan</p>
        <p style="margin: 0;">Fatehabad - 125050, Haryana</p>
        <p style="margin: 0;">GSTIN: 06AAKCS7164N1Z2 (PROVISIONAL)</p>
        <p style="margin: 0;">Contact: +91 97727 77736</p>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
      <div>
        <h3 style="font-size: 12px; text-transform: uppercase; color: #5C2E3E; margin-bottom: 10px;">Billed To:</h3>
        <p style="margin: 0; font-size: 11px; font-weight: bold;">${order.shippingAddress.name || 'Valued Client'}</p>
        <p style="margin: 5px 0; font-size: 10px; max-width: 250px;">${order.shippingAddress.address || ''}</p>
        <p style="margin: 0; font-size: 10px;">
          ${order.shippingAddress.city ? order.shippingAddress.city + (order.shippingAddress.district ? ', ' + order.shippingAddress.district : '') : (order.shippingAddress.district || '')}
          ${order.shippingAddress.state ? (order.shippingAddress.city || order.shippingAddress.district ? ', ' : '') + order.shippingAddress.state : ''}
          ${order.shippingAddress.pincode ? ' - ' + order.shippingAddress.pincode : ''}
        </p>
        <p style="margin: 5px 0; font-size: 10px;">Phone: ${order.shippingAddress.phone || 'N/A'}</p>
      </div>
      <div style="text-align: right;">
        <h3 style="font-size: 12px; text-transform: uppercase; color: #5C2E3E; margin-bottom: 10px;">Invoice Details:</h3>
        <p style="margin: 0; font-size: 10px;"><strong>Order ID:</strong> ${order.orderId}</p>
        <p style="margin: 5px 0; font-size: 10px;"><strong>Date:</strong> ${date}</p>
        <p style="margin: 0; font-size: 10px;"><strong>Status:</strong> ${order.status}</p>
        <p style="margin: 5px 0; font-size: 10px;"><strong>Payment:</strong> ${order.paymentStatus || 'Success'} (${order.paymentMethod || 'PayNow'})</p>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <thead>
        <tr style="background: #5C2E3E; color: #fff; text-transform: uppercase; font-size: 9px; letter-spacing: 1px;">
          <th style="padding: 12px; text-align: left;">Item Selection</th>
          <th style="padding: 12px; text-align: center;">Price</th>
          <th style="padding: 12px; text-align: center;">Qty</th>
          <th style="padding: 12px; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map(item => `
          <tr style="border-bottom: 1px solid #f0f0f0; font-size: 10px;">
            <td style="padding: 12px;">
              <p style="margin: 0; font-weight: bold; color: #333;">${item.name}</p>
              ${item.size ? `<p style="margin: 2px 0 0; font-size: 8px; color: #A35266; font-weight: bold; text-transform: uppercase;">Size: ${item.size}</p>` : ''}
            </td>
            <td style="padding: 12px; text-align: center;">₹${item.price}</td>
            <td style="padding: 12px; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; text-align: right; font-weight: bold;">₹${item.lineTotal ?? item.price}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="display: flex; justify-content: flex-end;">
      <div style="width: 250px;">
        <div style="display: flex; justify-content: space-between; padding: 5px 0; font-size: 11px;">
          <span style="color: #666;">Subtotal (Incl. GST & Shipping):</span>
          <span style="font-weight: bold;">₹${subTotal}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 5px 0; font-size: 11px;">
          <span style="color: #666;">Tax (GST ${taxRate}% Included):</span>
          <span style="font-weight: bold;">₹${taxAmount}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 5px 0; font-size: 11px;">
          <span style="color: #666;">Sacred Shipping (Included):</span>
          <span style="font-weight: bold;">₹${shippingAmount}</span>
        </div>
        ${couponLabel ? `
          <div style="display: flex; justify-content: space-between; padding: 5px 0; font-size: 11px; color: #A35266;">
            <span>Ritual Key Used (${couponLabel}):</span>
            <span style="font-weight: bold;">Applied</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #5C2E3E; margin-top: 10px; font-size: 16px; font-weight: 900; color: #5C2E3E;">
          <span>Grand Total:</span>
          <span>₹${grandTotal}</span>
        </div>
      </div>
    </div>

    <div style="margin-top: 50px; text-align: center; border-top: 1px dashed #ddd; padding-top: 20px;">
      <p style="font-size: 10px; color: #999; font-style: italic;">"This is a digitally generated sacred invoice for your ritual treasures at Sada Bharat."</p>
      <p style="font-size: 8px; color: #bbb; margin-top: 10px;">Return Policy: 2 Days from delivery date. Visit sadabharat.com for details.</p>
    </div>
  `;

  const opt = {
    margin: 10,
    filename: `Invoice_${order.orderId}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().from(element).set(opt).save();
  } catch (err) {
    console.error("Invoice generation failed:", err);
    alert("Invoice download failed. Please try again.");
  }
};

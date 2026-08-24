import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFilter, FiExternalLink, FiTruck, FiCheckCircle, FiClock, FiMoreVertical, FiEye, FiArrowLeft, FiUsers, FiDownload, FiCreditCard } from 'react-icons/fi';
import { RefreshCw, Search } from 'lucide-react';
import api from '../../utils/api';
import { useShop } from '../../context/ShopContext';
import html2pdf from 'html2pdf.js';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [shipmentModal, setShipmentModal] = useState({ isOpen: false, orderId: null });
  const [isShipping, setIsShipping] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/admin');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch admin orders:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId, itemId, status, trackingNumber) => {
    try {
      await api.put(`/orders/${orderId}/item/${itemId}/status`, { status, trackingNumber });
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        const updatedOrder = { ...selectedOrder };
        const itemIndex = updatedOrder.orderItems.findIndex(i => i._id === itemId);
        if (itemIndex > -1) {
          if (status) updatedOrder.orderItems[itemIndex].status = status;
          if (trackingNumber !== undefined) updatedOrder.orderItems[itemIndex].trackingNumber = trackingNumber;
        }
        setSelectedOrder(updatedOrder);
      }
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateShipment = async () => {
    if (!shipmentModal.orderId) return;
    try {
      setIsShipping(true);
      await api.post('/shipping/create', { orderId: shipmentModal.orderId });
      alert('Success! The shipment has been created and the courier has been assigned.');
      fetchOrders();
    } catch (err) {
      alert("Oops! Failed to create the shipment. Reason: " + (err.response?.data?.message || err.message));
    } finally {
      setIsShipping(false);
      setShipmentModal({ isOpen: false, orderId: null });
    }
  };

  const handlePrint = () => {
    const element = document.getElementById('printable-invoice');
    const opt = {
      margin: 10,
      filename: `invoice_${selectedOrder._id.slice(-6)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  // Flatten orders into items for the main table
  const orderItemsList = orders.flatMap(order => 
    (order.orderItems || []).map(item => ({
      orderId: order._id,
      itemId: item._id,
      displayOrderId: `#${order._id.slice(-6).toUpperCase()}`,
      customer: order.user ? order.user.name : 'Unknown Customer',
      customerEmail: order.user ? order.user.email : '',
      productName: item.name,
      qty: item.qty,
      price: item.price,
      totalAmount: `₹${Number(item.lineTotal ?? item.price).toLocaleString()}`,
      date: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: item.status,
      trackingNumber: item.trackingNumber || '',
      paymentMethod: order.paymentMethod,
      vendorName: item.vendor?.fullName || item.vendor?.storeName || (item.admin ? (item.admin.name || 'Admin') : 'System'),
      fullOrder: order
    }))
  );

  const filteredItems = orderItemsList.filter(item => {
    const matchesFilter = filter === 'All' || item.status === filter;
    const nameMatch = (item.customer || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    const idMatch = (item.displayOrderId || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    const emailMatch = (item.customerEmail || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    const vendorMatch = (item.vendorName || '').toLowerCase().includes((searchQuery || '').toLowerCase());

    return matchesFilter && (nameMatch || idMatch || emailMatch || vendorMatch);
  });

  if (selectedOrder) {
    const orderTotal = selectedOrder.totalPrice || 0;
    const shipping = selectedOrder.shippingPrice || 0;
    
    return (
      <div className="max-w-7xl mx-auto space-y-4 font-sans">
        <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <button
            onClick={() => { setSelectedOrder(null); setTrackingInput(''); }}
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#054425] transition-colors"
          >
            <FiArrowLeft size={16} /> Back to Orders
          </button>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-gray-200 rounded text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
              <FiDownload size={14} /> Print PDF
            </button>
          </div>
        </div>

        <div id="printable-invoice" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Order Meta & Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Order #{selectedOrder._id.slice(-6).toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold text-gray-900">{selectedOrder.user?.name || selectedOrder.shippingAddress?.name || 'Guest User'}</p>
                    <p className="text-xs text-gray-500">{selectedOrder.user?.email || 'No email'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.orderItems?.map((item, i) => (
                    <div key={i} className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 mb-1">{item.name} <span className="text-gray-500 font-normal">x{item.qty}</span></p>
                        <p className="text-xs text-gray-500 mb-2">
                          Vendor: <span className="font-medium text-gray-700">{item.vendor?.fullName || item.vendor?.storeName || (item.admin ? (item.admin.name || 'Admin') : 'System')}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-2" data-html2canvas-ignore="true">
                          <select
                            value={item.status}
                            onChange={(e) => handleUpdateStatus(selectedOrder._id, item._id, e.target.value, item.trackingNumber)}
                            className="bg-white border border-gray-300 text-xs font-semibold px-2 py-1.5 rounded outline-none focus:border-[#054425]"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          {['Packed', 'Shipped', 'Delivered'].includes(item.status) && (
                            <input 
                              type="text" 
                              placeholder="Tracking Number" 
                              defaultValue={item.trackingNumber}
                              onBlur={(e) => {
                                if (e.target.value !== item.trackingNumber) {
                                  handleUpdateStatus(selectedOrder._id, item._id, item.status, e.target.value);
                                }
                              }}
                              className="w-32 px-2 py-1.5 border border-gray-300 rounded text-xs outline-none focus:border-[#054425]" 
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-start sm:items-end min-w-[80px]">
                        <span className="text-sm font-bold text-gray-900">₹{item.lineTotal ?? item.price}</span>
                        <span className={`mt-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                          item.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                          item.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 mt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center py-2 text-sm text-gray-600">
                    <span>Shipping Charge</span>
                    <span className="font-semibold text-green-600">{shipping > 0 ? `₹${shipping}` : 'Free Delivery'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-base font-bold text-gray-900 border-t border-gray-100 mt-2">
                    <span>Total Amount ({selectedOrder.paymentMethod || 'COD'})</span>
                    <span className="text-[#054425]">₹{orderTotal + shipping}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2 mb-3">
                    <FiUsers className="text-[#054425]" /> Customer Details
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="font-semibold text-gray-900">{selectedOrder.user?.name || 'Unknown'}</p>
                    <p>{selectedOrder.user?.email || 'No email'}</p>
                    <p>{selectedOrder.shippingAddress?.phone || 'No phone'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2 mb-3">
                    <FiTruck className="text-[#054425]" /> Shipping Address
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedOrder.shippingAddress?.address || 'No Address Provided'}<br />
                    {selectedOrder.shippingAddress?.city}{selectedOrder.shippingAddress?.postalCode ? ' - ' + selectedOrder.shippingAddress.postalCode : ''}<br />
                    {selectedOrder.shippingAddress?.country}
                  </p>
                </div>

                {selectedOrder.shiprocketOrderId && (
                  <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mt-4">
                    <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2 border-b border-blue-200/50 pb-2 mb-3">
                      Shiprocket Tracking
                    </h3>
                    <div className="space-y-2 text-sm text-blue-800">
                      <div className="flex justify-between">
                        <span className="font-semibold">Order ID:</span>
                        <span>{selectedOrder.shiprocketOrderId}</span>
                      </div>
                      {selectedOrder.awbCode && (
                        <div className="flex justify-between">
                          <span className="font-semibold">AWB Code:</span>
                          <span className="font-mono bg-blue-100 px-1 rounded">{selectedOrder.awbCode}</span>
                        </div>
                      )}
                      {selectedOrder.courierName && (
                        <div className="flex justify-between">
                          <span className="font-semibold">Courier:</span>
                          <span>{selectedOrder.courierName}</span>
                        </div>
                      )}
                      {selectedOrder.shippingStatus && (
                        <div className="flex justify-between">
                          <span className="font-semibold">Status:</span>
                          <span>{selectedOrder.shippingStatus}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 max-w-[1400px] mx-auto -mt-2 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 leading-tight">
            Order Management
          </h1>
          <p className="text-[12px] text-gray-500 mt-0.5 font-sans">
            Live transaction tracking divided by division/vendor.
          </p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
        <div className="p-3 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="Search Order ID, Customer, Vendor..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 sm:flex-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] font-medium text-gray-700 outline-none hover:bg-gray-50 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Processing">Processing</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead>
              <tr className="bg-gray-50/50 text-[11px] text-gray-500 uppercase tracking-widest border-b border-gray-100">
                <th className="px-4 py-3 font-semibold">Order ID</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Total Amount</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Owner</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={`${item.orderId}-${item.itemId}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-[12px] text-gray-800">
                    <td className="px-4 py-2.5 font-medium">{item.displayOrderId}</td>
                    <td className="px-4 py-2.5 font-medium">{item.customer}</td>
                    <td className="px-4 py-2.5 text-gray-600 font-medium">
                      {item.productName} <span className="text-gray-400 font-normal ml-1">(x{item.qty})</span>
                    </td>
                    <td className="px-4 py-2.5 font-medium">{item.totalAmount}</td>
                    <td className="px-4 py-2.5 text-gray-500 font-medium">{item.date}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 font-medium whitespace-nowrap">
                        {item.vendorName}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                        item.status === 'Delivered' ? 'bg-[#E8F5E9] text-[#2E7D32]' :
                        item.status === 'Shipped' ? 'bg-blue-50 text-blue-700' :
                        item.status === 'Processing' ? 'bg-[#FFF8E1] text-[#F9A825]' :
                        item.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
                        'bg-purple-50 text-purple-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => setSelectedOrder(item.fullOrder)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-[11px] font-medium rounded hover:bg-gray-50 transition-colors whitespace-nowrap"
                        >
                          <FiEye size={12} /> View
                        </button>
                        {!item.fullOrder.shiprocketOrderId && (
                          <button
                            onClick={() => setShipmentModal({ isOpen: true, orderId: item.fullOrder._id })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#054425] text-white text-[11px] font-medium rounded hover:bg-[#04331c] transition-colors whitespace-nowrap"
                          >
                            <FiTruck size={12} /> Ship
                          </button>
                        )}
                        {item.fullOrder.shiprocketOrderId && (
                          <span className="text-[10px] text-gray-500 italic whitespace-nowrap px-1">
                            {item.fullOrder.shippingStatus || 'Shipped'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400 text-sm">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipment Confirmation Modal */}
      {shipmentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTruck className="text-blue-600 w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to Ship?</h2>
              <p className="text-sm text-gray-500 mb-6">
                This will generate the shipping label, AWB code, and schedule a pickup with the courier.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShipmentModal({ isOpen: false, orderId: null })}
                  disabled={isShipping}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateShipment}
                  disabled={isShipping}
                  className="px-4 py-2 bg-[#054425] text-white font-semibold rounded-lg hover:bg-[#04331c] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isShipping ? 'Processing...' : 'Yes, Ship Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

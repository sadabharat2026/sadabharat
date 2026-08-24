import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Eye, MoreHorizontal, PackageOpen, Truck, CheckCircle2, RefreshCw } from 'lucide-react';
import { FiArrowLeft, FiDownload, FiUsers, FiTruck } from 'react-icons/fi';
import html2pdf from 'html2pdf.js';
import api from '../../utils/api';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All Statuses');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/orders/vendor');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId, itemId, status, trackingNumber) => {
    setIsUpdating(true);
    try {
      await api.put(`/orders/${orderId}/item/${itemId}/status`, { status, trackingNumber });
      fetchOrders();
      // Update selected order view dynamically if open
      if (selectedOrder && selectedOrder._id === orderId) {
        const updatedOrder = { ...selectedOrder };
        const itemIndex = updatedOrder.orderItems.findIndex(i => i._id === itemId);
        if (itemIndex > -1) {
          if (status) updatedOrder.orderItems[itemIndex].status = status;
          if (trackingNumber !== undefined) updatedOrder.orderItems[itemIndex].trackingNumber = trackingNumber;
        }
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      alert("Failed to update status: " + (error.response?.data?.message || error.message));
    } finally {
      setIsUpdating(false);
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

  // Flatten orders into items since status is tracked per-item
  const orderItemsList = orders.flatMap(order => 
    order.orderItems.map(item => ({
      orderId: order._id,
      itemId: item._id,
      displayOrderId: `#${order._id.slice(-6).toUpperCase()}`,
      customer: order.user ? order.user.name : 'Unknown Customer',
      productName: item.name,
      qty: item.qty,
      price: item.price,
      totalAmount: `₹${Number(item.lineTotal ?? item.price).toLocaleString()}`,
      date: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: item.status,
      trackingNumber: item.trackingNumber || '',
      fullOrder: order
    }))
  );

  const filteredItems = orderItemsList.filter(item => {
    const matchesSearch = item.displayOrderId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.productName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter !== 'All Statuses') return matchesSearch && item.status === filter;
    return matchesSearch;
  });

  if (selectedOrder) {
    const orderTotal = selectedOrder.vendorAmount ?? 0;
    const shipping = selectedOrder.shippingPrice ?? 0; 
    
    return (
      <div className="max-w-7xl mx-auto space-y-4 font-sans">
        <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <button
            onClick={() => { setSelectedOrder(null); }}
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
                        <div className="flex flex-wrap items-center gap-2" data-html2canvas-ignore="true">
                          <select
                            value={item.status}
                            onChange={(e) => handleUpdateStatus(selectedOrder._id, item._id, e.target.value, item.trackingNumber)}
                            disabled={isUpdating}
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
                              disabled={isUpdating}
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
                  <div className="flex justify-between items-center py-2 text-base font-bold text-gray-900 mt-2">
                    <span>Total Amount for Your Items ({selectedOrder.paymentMethod || 'COD'})</span>
                    <span className="text-[#054425]">₹{orderTotal}</span>
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
                    <p className="font-semibold text-gray-900">{selectedOrder.user?.name || selectedOrder.shippingAddress?.name || 'Unknown'}</p>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 max-w-[1400px] mx-auto -mt-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 leading-tight">Order Management</h1>
          <p className="text-[12px] text-gray-500 mt-0.5 font-sans">Track and process your customer orders.</p>
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
              placeholder="Search Order ID, Customer, Product..." 
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
              <option>All Statuses</option>
              <option>Processing</option>
              <option>Packed</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[11px] text-gray-500 uppercase tracking-widest border-b border-gray-100">
                <th className="px-4 py-3 font-semibold">Order ID</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Total Amount</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold min-w-[250px]">Status Update</th>
              </tr>
            </thead>
            <tbody className="text-[12px] text-gray-800">
              {filteredItems.map((item, i) => (
                <tr 
                  key={`${item.orderId}-${item.itemId}`} 
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedOrder(item.fullOrder)}
                >
                  <td className="px-4 py-2.5 font-medium text-gray-800">{item.displayOrderId}</td>
                  <td className="px-4 py-2.5 font-medium">{item.customer}</td>
                  <td className="px-4 py-2.5 text-gray-600 font-medium">
                    {item.productName} <span className="text-gray-400 font-normal ml-1">(x{item.qty})</span>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-gray-800">{item.totalAmount}</td>
                  <td className="px-4 py-2.5 text-gray-500 font-medium">{item.date}</td>
                  <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <select 
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item.orderId, item.itemId, e.target.value, item.trackingNumber)}
                        disabled={isUpdating}
                        className={`text-[10px] font-bold px-2 py-1 rounded border outline-none cursor-pointer disabled:opacity-50 ${
                          item.status === 'Delivered' ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]' :
                          item.status === 'Shipped' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                          item.status === 'Packed' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                          item.status === 'Cancelled' ? 'bg-red-50 border-red-200 text-red-700' :
                          'bg-[#FFF8E1] text-[#F9A825] border-[#FFECB3]'
                        }`}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      
                      {['Packed', 'Shipped', 'Delivered'].includes(item.status) && (
                        <div className="flex items-center gap-1">
                          <input 
                            type="text" 
                            placeholder="Tracking #" 
                            defaultValue={item.trackingNumber}
                            onBlur={(e) => {
                              if (e.target.value !== item.trackingNumber) {
                                handleUpdateStatus(item.orderId, item.itemId, item.status, e.target.value);
                              }
                            }}
                            disabled={isUpdating}
                            className="w-24 px-2 py-1 border border-gray-200 rounded text-[11px] outline-none focus:border-[#054425]" 
                          />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
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
    </div>
  );
};

export default VendorOrders;

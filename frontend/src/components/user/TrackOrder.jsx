import React, { useEffect, useState } from 'react';
import { FiArrowLeft, FiCheck, FiMapPin, FiPackage, FiTruck, FiNavigation, FiCreditCard, FiPlusCircle, FiImage } from 'react-icons/fi';
import { AnimatePresence } from 'framer-motion';
import { RMAModal } from './UserOrders';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { useShop } from '../../context/ShopContext';
import ChatWindow from '../shared/ChatWindow';
import { getConversationId } from '../../services/chatService';
import { motion } from 'framer-motion';

const TrackOrder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRmaModal, setShowRmaModal] = useState(false);
  const [isBankOnly, setIsBankOnly] = useState(false);
  
  const { user, isAuthenticated } = useShop();
  const [isSupportChatOpen, setIsSupportChatOpen] = useState(false);

  const handleSupportClick = () => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    setIsSupportChatOpen(true);
  };

  useEffect(() => {
    if (orderId) {
      api.get(`/orders/${orderId}`)
        .then(res => {
          if (res.data.success) {
            setOrder(res.data.data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [orderId]);

  if (loading) return <div className="min-h-screen bg-gray-50 p-8 text-center text-gray-500">Loading tracking details...</div>;
  if (!order) return <div className="min-h-screen bg-gray-50 p-8 text-center text-gray-500">Order not found.</div>;

  // Determine overall status based on items (minimum status)
  const statusLevels = { 'Processing': 1, 'Packed': 2, 'Shipped': 3, 'Delivered': 4, 'Cancelled': -1 };
  let minStatusLevel = 4;
  let hasCancelled = false;
  order.orderItems.forEach(item => {
    const level = statusLevels[item.status] || 1;
    if (level === -1) hasCancelled = true;
    else if (level < minStatusLevel) minStatusLevel = level;
  });
  
  if (minStatusLevel === 4 && order.orderItems.length === 0) minStatusLevel = 1;

  let currentStatus = 'Processing';
  if (minStatusLevel === 2) currentStatus = 'Packed';
  if (minStatusLevel === 3) currentStatus = 'Shipped';
  if (minStatusLevel === 4) currentStatus = 'Delivered';
  if (hasCancelled && order.orderItems.length === 1) currentStatus = 'Cancelled';

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const timeline = [
    { title: 'Order Placed', date: orderDate, completed: true, isNext: false, icon: <FiPackage size={12} /> },
    { title: 'Processing', date: minStatusLevel >= 1 ? 'Started' : '', completed: minStatusLevel >= 1, isNext: minStatusLevel === 1, icon: <FiCheck size={12} /> },
    { title: 'Packed', date: minStatusLevel >= 2 ? 'Packed' : '', completed: minStatusLevel >= 2, isNext: minStatusLevel === 2, icon: <FiPackage size={12} /> },
    { title: 'Shipped', date: minStatusLevel >= 3 ? 'In Transit' : '', completed: minStatusLevel >= 3, isNext: minStatusLevel === 3, icon: <FiTruck size={12} /> },
    { title: 'Delivered', date: minStatusLevel >= 4 ? 'Delivered' : 'Pending', completed: minStatusLevel >= 4, isNext: minStatusLevel === 4, icon: <FiCheck size={12} /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-['Poppins'] py-4 px-2 md:px-6">
      <AnimatePresence>
        {showRmaModal && order && (
          <RMAModal
            order={order}
            isBankOnly={isBankOnly}
            onClose={() => { setShowRmaModal(false); setIsBankOnly(false); }}
          />
        )}
      </AnimatePresence>
      <div className="w-full max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="flex items-center mb-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-1 text-gray-500 hover:text-[#054425] transition-colors text-[11px] md:text-xs font-medium font-['Poppins']">
            <FiArrowLeft size={14} /> Back to Home
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            
            {/* Left Column: Tracking Timeline */}
            <div className="md:col-span-8">
                <div className="bg-[#F4F8F5] border border-[#054425]/10 rounded-lg shadow-sm p-4 md:p-6">
                    <div className="flex justify-between items-start mb-4 border-b border-[#054425]/10 pb-3">
                        <div>
                            <h1 className="text-lg md:text-xl font-bold font-['Poppins'] text-[#054425] mb-0.5 tracking-normal">Order Tracking</h1>
                            <p className="text-[11px] md:text-xs font-['Poppins'] text-gray-500">Tracking ID: <span className="font-semibold text-gray-900">#{order._id?.slice(-6).toUpperCase()}</span></p>
                        </div>
                        <div className="text-right hidden sm:block">
                            <span className="inline-block bg-[#054425]/10 text-[#054425] font-['Poppins'] px-2.5 py-1 rounded text-[10px] font-semibold">
                                {currentStatus}
                            </span>
                        </div>
                    </div>

                    {/* Vertical Stepper Timeline - Super Compact */}
                    <div className="relative pl-3 md:pl-4 py-1">
                        {/* Connecting Line behind the icons */}
                        <div className="absolute top-3 bottom-6 left-[23px] md:left-[27px] w-[2px] bg-gray-200 z-0"></div>
                        
                        <div className="space-y-4">
                            {timeline.map((step, idx) => (
                            <div key={idx} className="relative z-10 flex gap-4">
                                
                                {/* Icon Container */}
                                <div className="relative flex flex-col items-center">
                                    <div 
                                        className={`w-6 h-6 rounded-full flex items-center justify-center border shadow-sm transition-colors duration-300
                                        ${step.completed 
                                            ? 'bg-[#054425] border-[#054425] text-white' 
                                            : step.isNext 
                                            ? 'bg-white border-[#054425] text-[#054425] animate-pulse' 
                                            : 'bg-white border-gray-200 text-gray-300'
                                        }
                                        `}
                                    >
                                        {step.completed ? (
                                        <FiCheck size={12} strokeWidth={3} />
                                        ) : (
                                        <div className={`w-1.5 h-1.5 rounded-full ${step.isNext ? 'bg-[#054425]' : 'bg-gray-200'}`}></div>
                                        )}
                                    </div>
                                    
                                    {/* Fill the line for completed steps dynamically */}
                                    {step.completed && idx < timeline.length - 1 && (
                                        <div className="absolute top-6 w-[2px] h-5 bg-[#054425] z-20"></div>
                                    )}
                                </div>

                                {/* Content */}
                                <div>
                                    <h3 className={`text-xs md:text-sm font-semibold font-['Poppins'] tracking-normal ${step.completed ? 'text-[#054425]' : step.isNext ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {step.title}
                                    </h3>
                                    <p className={`text-[10px] md:text-xs font-['Poppins'] mt-0.5 ${step.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                                        {step.date}
                                    </p>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>


                </div>
            </div>

            {/* Right Column: Order Details Summary */}
            <div className="md:col-span-4 space-y-4 md:space-y-6">
                <div className="bg-[#F4F8F5] border border-[#054425]/10 rounded-lg shadow-sm p-4 md:p-5">
                    <h3 className="text-xs md:text-sm font-bold font-['Poppins'] text-gray-900 mb-3 border-b border-[#054425]/10 pb-2 tracking-normal">Delivery Details</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-[10px] md:text-xs font-['Poppins'] text-gray-500 mb-0.5">Expected Delivery</p>
                            <p className="text-xs md:text-sm font-semibold font-['Poppins'] text-[#054425]">16 May 2024</p>
                        </div>
                        <div>
                            <p className="text-[10px] md:text-xs font-['Poppins'] text-gray-500 mb-0.5">Shipping Address</p>
                            <p className="text-[11px] md:text-xs font-['Poppins'] text-gray-700 leading-relaxed">
                                {order.shippingAddress?.address}<br/>
                                {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br/>
                                {order.shippingAddress?.country}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] md:text-xs font-['Poppins'] text-gray-500 mb-0.5">Courier Partner</p>
                            <p className="text-[11px] md:text-xs font-['Poppins'] text-gray-700 flex items-center gap-1.5">
                                <FiTruck size={12} className="text-gray-400" /> Express Logistics
                            </p>
                        </div>
                    </div>
                </div>

                {/* Return and Replacement Box */}
                {minStatusLevel >= 4 && (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                            <h4 className="text-xs md:text-sm font-bold font-['Poppins'] text-gray-900 flex items-center gap-2">
                                {(!order.returnStatus || order.returnStatus === 'Not Requested') ? 'Return & Replacement' : 'RMA Status'}
                            </h4>
                        </div>
                        
                        {order.returnStatus === 'Return Approved' && !order.refundAccountDetails && (
                            <div className="bg-pink-50 border border-pink-100 rounded-lg p-3 mb-3">
                                <p className="text-[10px] font-medium text-gray-800 flex items-center gap-2 mb-2">
                                    <FiCreditCard className="text-pink-600" />
                                    Please fill your account details for refund
                                </p>
                                <button
                                    onClick={() => { setIsBankOnly(true); setShowRmaModal(true); }}
                                    className="w-full bg-gray-900 text-white text-[10px] font-bold uppercase py-1.5 rounded-md hover:bg-pink-600 transition-colors"
                                >
                                    Fill Details
                                </button>
                            </div>
                        )}

                        {(!order.returnStatus || order.returnStatus === 'Not Requested') ? (
                            <div className="text-center py-2">
                                <p className="text-[10px] md:text-[11px] font-['Poppins'] text-gray-500 mb-3">
                                    Not satisfied with your product? You can initiate a return or replacement request.
                                </p>
                                <button
                                    onClick={() => setShowRmaModal(true)}
                                    className="w-full flex items-center justify-center gap-2 bg-[#054425] text-white px-4 py-2 rounded text-[11px] md:text-xs font-semibold font-['Poppins'] hover:bg-[#04331c] transition-colors"
                                >
                                    <FiPlusCircle /> Initiate Request
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-100">
                                <span className={`text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-sm border ${['Returned', 'Replaced'].includes(order.returnStatus) ? 'bg-green-50 text-green-600 border-green-200' : order.returnStatus?.includes('Rejected') ? 'bg-red-50 text-red-500 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                    {order.returnStatus}
                                </span>
                                {order.returnImages?.length > 0 && <FiImage className="text-pink-600" size={16} title="Evidence Attached" />}
                            </div>
                        )}
                    </div>
                )}

                <div className="bg-[#F4F8F5] border border-[#054425]/10 rounded-lg shadow-sm p-4 md:p-5 text-center">
                    <h4 className="text-xs md:text-sm font-bold font-['Poppins'] text-[#054425] mb-1.5 tracking-normal">Need Help?</h4>
                    <p className="text-[10px] md:text-[11px] font-['Poppins'] text-gray-600 mb-3 leading-relaxed">If you have any questions regarding your order, our support team is here for you.</p>
                    <button 
                        onClick={handleSupportClick}
                        className="px-4 py-1.5 bg-white text-[#054425] border border-[#054425]/20 rounded text-[10px] md:text-xs font-semibold font-['Poppins'] hover:bg-gray-50 transition-colors"
                    >
                        Contact Support
                    </button>
                </div>
            </div>

        </div>
      </div>

      {/* Support Chat Modal */}
      <AnimatePresence>
        {isSupportChatOpen && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setIsSupportChatOpen(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="w-full sm:max-w-md h-[85dvh] sm:h-[560px] bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <ChatWindow
                conversationId={getConversationId.userAdmin(user._id)}
                metadata={{
                  type: 'user-admin',
                  userId: user._id,
                  userName: user.name || user.fullName || 'User',
                }}
                currentUser={{ id: user._id, name: user.name || user.fullName || 'User', role: 'user' }}
                recipientName="Sada Bharat Support"
                onClose={() => setIsSupportChatOpen(false)}
                className="h-full flex-1 border-0 rounded-none shadow-none"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrackOrder;

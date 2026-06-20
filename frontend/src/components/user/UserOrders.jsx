import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiBox, FiX, FiUploadCloud, FiImage, FiPlusCircle, FiCreditCard, FiDownload, FiMessageCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';

import api from '../../utils/api';
import ProfileSidebar from './ProfileSidebar';
import ChatWindow from '../shared/ChatWindow';
import { getConversationId } from '../../services/chatService';

export const RMAModal = ({ order, onClose, isBankOnly = false }) => {

    const { user } = useShop();
    const [reason, setReason] = useState('');
    const [action, setAction] = useState('Refund'); // Default
    const [images, setImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Bank Details State (Prefilled from profile)
    const [bankDetails, setBankDetails] = useState({
        accountName: user?.bankDetails?.accountName || '',
        bankName: user?.bankDetails?.bankName || '',
        accountNumber: user?.bankDetails?.accountNumber || '',
        ifscCode: user?.bankDetails?.ifscCode || ''
    });

    // Convert file to Base64 to store in DB directly (as there's no upload endpoint available)
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);
        try {
            const uploadPromises = files.map(file => fileToBase64(file));
            const base64Images = await Promise.all(uploadPromises);
            setImages(prev => [...prev, ...base64Images]);
        } catch (err) {
            console.error(err);
            alert("Visual verification upload failed. Please try smaller files.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!reason.trim()) return alert("Please clarify the ritual defect.");
        setIsSubmitting(true);
        try {
            const payload = {
                returnReason: reason,
                returnAction: action,
                returnImages: images
            };

            if (action === 'Refund') {
                if (!bankDetails.accountName.trim() || !bankDetails.bankName.trim()) {
                    return alert("Please provide a valid Account Holder Name and Bank Name.");
                }
                if (!bankDetails.accountNumber || bankDetails.accountNumber.length < 9) {
                    return alert("Please enter a valid Account Number (minimum 9 digits).");
                }
                if (!bankDetails.ifscCode || bankDetails.ifscCode.length !== 11) {
                    return alert("Please enter a valid 11-character IFSC Code.");
                }
                payload.refundAccountDetails = bankDetails;
            }

            if (isBankOnly) {
                await api.patch(`/orders/${order._id}/update-refund-details`, { refundAccountDetails: bankDetails });
            } else {
                await api.patch(`/orders/${order._id}/request-return`, payload);
            }
            window.location.reload();

        } catch (error) {
            alert(error.response?.data?.message || "RMA Submission Failure.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-brand-dark/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-y-auto max-h-[88dvh] mx-auto scrollbar-hide"
                data-lenis-prevent
            >
                {/* Header */}
                <div className="bg-brand-dark px-5 py-3 flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h2 className="text-white text-[10px] font-black uppercase tracking-widest leading-none mb-1">Ritual Restoration</h2>
                        <p className="text-white/40 text-[7px] font-bold uppercase tracking-widest">Order ID: {order._id?.slice(-6).toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Action Selector */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Desired Outcome</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setAction('Refund')}
                                className={`py-4 px-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${action === 'Refund' ? 'bg-[#054425]/10 border-[#054425] text-[#054425] shadow-inner' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200'}`}
                            >
                                <FiTruck size={16} />
                                <span className="text-[8px] font-black uppercase tracking-widest font-['Poppins']">Return & Refund</span>
                            </button>
                            <button
                                onClick={() => setAction('Replace')}
                                className={`py-3 px-3 border rounded-xl flex flex-col items-center gap-1.5 transition-all ${action === 'Replace' ? 'bg-[#054425]/10 border-[#054425] text-[#054425] shadow-inner' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200'}`}
                            >
                                <FiBox size={16} />
                                <span className="text-[8px] font-black uppercase tracking-widest font-['Poppins']">Replacement</span>
                            </button>
                        </div>
                    </div>

                    {isBankOnly && (
                        <div className="p-5 bg-brand-gold/10 border border-brand-gold/20 rounded-2xl flex items-start gap-4">
                            <FiCreditCard className="text-brand-gold shrink-0 mt-1" size={20} />
                            <div>
                                <h4 className="text-[10px] font-black text-brand-dark uppercase tracking-widest mb-1">Ritual Approved</h4>
                                <p className="text-[9px] text-gray-500 font-serif italic leading-relaxed">
                                    "Your return has been blessed by the curators. Please provide your sacred destination details to begin the gold restoration process."
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Clarification */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Describe the Discrepancy</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Detail the issue..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-['Poppins'] text-gray-800 outline-none focus:border-[#054425]/30 h-20 resize-none transition-all"
                        />
                    </div>

                    {/* Images */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex justify-between">
                            Visual Evidence {isUploading && <span className="text-[8px] animate-pulse text-brand-pink uppercase">Uploading...</span>}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {images.map((img, i) => (
                                <div key={i} className="w-14 h-14 rounded-lg overflow-hidden border border-gray-100 relative group">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                    <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><FiX size={10} /></button>
                                </div>
                            ))}
                            <label className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-brand-pink/20 text-gray-300">
                                <FiUploadCloud size={16} />
                                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>
                    </div>

                    {/* Bank Details for Refund */}
                    {(action === 'Refund' || isBankOnly) && (

                        <div className="p-4 bg-brand-pink/5 rounded-2xl border border-brand-pink/10 space-y-4">
                            <h4 className="text-[9px] font-black text-brand-dark uppercase tracking-[0.2em] flex items-center gap-2">
                                <FiCreditCard className="text-brand-pink" /> Sacred Refund Destination
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[7.5px] font-black uppercase text-gray-400">Account Holder</label>
                                    <input
                                        type="text"
                                        value={bankDetails.accountName}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                            setBankDetails({ ...bankDetails, accountName: val });
                                        }}
                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-800 font-['Poppins'] focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                                        placeholder="Name on account"
                                        maxLength={50}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[7.5px] font-black uppercase text-gray-400">Account Number</label>
                                    <input
                                        type="text"
                                        value={bankDetails.accountNumber}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, ''); // Only digits
                                            setBankDetails({ ...bankDetails, accountNumber: val });
                                        }}
                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-800 font-['Poppins'] focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                                        placeholder="000000000000"
                                        maxLength={18}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[7.5px] font-black uppercase text-gray-400">Bank Name</label>
                                    <input
                                        type="text"
                                        value={bankDetails.bankName}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                            setBankDetails({ ...bankDetails, bankName: val });
                                        }}
                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-800 font-['Poppins'] focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                                        placeholder="Bank Name"
                                        maxLength={50}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[7.5px] font-black uppercase text-gray-400">IFSC Code</label>
                                    <input
                                        type="text"
                                        value={bankDetails.ifscCode}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                                            setBankDetails({ ...bankDetails, ifscCode: val });
                                        }}
                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-800 font-['Poppins'] focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                                        placeholder="IFSC0000000"
                                        maxLength={11}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-5 py-4 bg-gray-50 flex items-center justify-between sticky bottom-0 z-10 border-t border-gray-100">
                    <button onClick={onClose} className="text-[9px] font-black uppercase text-gray-400">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={isUploading || isSubmitting}
                        className="bg-brand-dark text-white px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl hover:bg-brand-pink transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? 'Submitting...' : isBankOnly ? 'Submit Details' : 'Submit Request'}
                    </button>

                </div>
            </motion.div>
        </motion.div>
    );
};

const UserOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showRmaModal, setShowRmaModal] = useState(false);
    const [isBankOnly, setIsBankOnly] = useState(false);
    const [chatOrder, setChatOrder] = useState(null); // for vendor chat
    const { user } = useShop();
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders/my-orders');
                setOrders(res.data.data.orders);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] pt-4 md:pt-6 pb-12 font-sans selection:bg-[#054425] selection:text-white">
                <div className="w-full px-4 lg:px-8 flex flex-col lg:flex-row gap-6">
                    <ProfileSidebar activeTab="orders" />
                    <div className="flex-1 flex flex-col gap-5 pt-24 pb-20 items-center justify-center bg-white border border-gray-100 rounded-2xl">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#5C2E3E]/40 animate-pulse">
                            Retrieving Sacred Scripts...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] pt-4 md:pt-6 pb-12 font-sans selection:bg-[#054425] selection:text-white">
                <div className="w-full px-4 lg:px-8 flex flex-col lg:flex-row gap-6">
                    <ProfileSidebar activeTab="orders" />
                    <div className="flex-1 flex flex-col items-center justify-center bg-white border border-gray-100 rounded-2xl shadow-sm py-12 md:py-20 px-4">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-pink/10 rounded-full flex items-center justify-center text-brand-pink mb-4 md:mb-6 shadow-inner">
                            <FiPackage size={32} className="md:w-10 md:h-10" />
                        </div>
                        <h2 className="text-lg md:text-2xl font-serif font-black text-brand-dark uppercase tracking-widest mb-1 md:mb-2 text-center">No Sacred Orders Yet</h2>
                        <p className="text-gray-400 text-[10px] md:text-xs uppercase tracking-widest mb-5 md:mb-8 text-center max-w-sm leading-relaxed">
                            Your ritual history is empty. Begin your journey into divine beauty.
                        </p>
                        <Link
                            to="/shop"
                            className="bg-brand-dark text-white px-8 py-2.5 md:px-10 md:py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-brand-pink transition-all"
                        >
                            Discover Treasures
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] pt-4 md:pt-6 pb-12 font-sans selection:bg-[#054425] selection:text-white">
            <AnimatePresence>
                {showRmaModal && selectedOrder && (
                    <RMAModal
                        order={selectedOrder}
                        isBankOnly={isBankOnly}
                        onClose={() => { setShowRmaModal(false); setSelectedOrder(null); setIsBankOnly(false); }}
                    />
                )}
            </AnimatePresence>


            <div className="w-full px-4 lg:px-8 flex flex-col lg:flex-row gap-6">
                <ProfileSidebar activeTab="orders" />
                
                <div className="flex-1 flex flex-col gap-4">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                        <div>
                            <h1 className="text-2xl font-bold text-[#054425]">
                                My Orders
                            </h1>
                            <p className="text-xs text-gray-500 font-medium mt-1">
                                You have {orders.length} orders
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {orders.map((order) => (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group"
                            >
                                <div className="bg-gray-50/50 py-3 px-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Processing' ? 'bg-amber-100 text-amber-600' :
                                                'bg-[#054425]/10 text-[#054425]'
                                            }`}>
                                            {order.status === 'Delivered' ? <FiCheckCircle size={16} /> : order.status === 'Processing' ? <FiClock size={16} /> : <FiTruck size={16} />}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Order ID</p>
                                            <p className="text-sm font-bold text-gray-900">#{order._id?.slice(-6).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs text-gray-500 font-medium">Placed On</p>
                                            <p className="text-sm font-semibold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 font-medium">Total</p>
                                            <p className="text-sm font-bold text-[#054425]">₹{order.totalPrice}</p>
                                        </div>                                        <div className="flex items-center gap-2">
                                             {user && (
                                                <button
                                                    onClick={() => setChatOrder(order)}
                                                    className="bg-white border border-[#054425] text-[#054425] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#EAF0EC] transition-all flex items-center gap-1 shadow-sm"
                                                >
                                                    <FiMessageCircle size={13} /> Chat Support
                                                </button>
                                            )}
                                             <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    import('../../utils/invoiceHelper').then(m => m.generateInvoice(order));
                                                }}
                                                className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-all flex items-center gap-1 shadow-sm"
                                            >
                                                <FiDownload />
                                                Invoice
                                            </button>
                                            <Link
                                                to={`/track-order?id=${order._id}`}
                                                className="bg-[#054425] text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#04331c] transition-colors shadow-sm"
                                            >
                                                Track Order
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="py-2 px-4">
                                    <div className="space-y-2">
                                        {order.orderItems?.map((item, index) => (
                                            <Link
                                                key={index}
                                                to={`/track-order?id=${order._id}`}
                                                className="flex gap-4 items-center py-1.5 px-2 hover:bg-gray-50 transition-colors rounded-lg group border border-transparent hover:border-gray-200"
                                            >
                                                <div className="w-14 h-14 bg-white rounded-md overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                                                    <img src={item.image || 'https://via.placeholder.com/150'} alt={item.name} className="max-w-full max-h-full object-contain" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#054425] transition-colors line-clamp-1">{item.name}</h4>
                                                    <p className="text-xs text-gray-500 font-medium mt-0.5">Qty: {item.qty}</p>
                                                </div>
                                                <div className="text-right pr-2">
                                                    <span className="text-sm font-bold text-gray-900">₹{item.price}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>

                                    {order.status === 'Shipped' && order.trackingId && (
                                        <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                                            <span className="text-[9px] font-black text-[#5C2E3E]/60 uppercase tracking-widest flex items-center gap-2">
                                                <FiBox /> Tracking Constellation
                                            </span>
                                            <span className="text-[10px] font-bold text-brand-pink uppercase tracking-widest px-3 py-1 bg-brand-pink/5 rounded-md border border-brand-pink/10">
                                                {order.trackingId}
                                            </span>
                                        </div>
                                    )}

                                    {order.status === 'Delivered' && (
                                        <div className="mt-6 pt-4 border-t border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <span className="text-[9px] font-black text-[#5C2E3E]/60 uppercase tracking-widest flex items-center gap-2">
                                                {(!order.returnStatus || order.returnStatus === 'Not Requested') ? 'Need Support?' : 'RMA Status'}
                                            </span>

                                            {order.returnStatus === 'Return Approved' && !order.refundAccountDetails && (
                                                <div className="flex-1 px-4">
                                                    <div className="bg-brand-pink/5 border border-brand-pink/10 rounded-xl p-3 flex items-center justify-between">
                                                        <p className="text-[9px] font-bold text-brand-dark uppercase tracking-widest flex items-center gap-2">
                                                            <FiCreditCard className="text-brand-pink" />
                                                            Please fill your account details for refund
                                                        </p>
                                                        <button
                                                            onClick={() => { setSelectedOrder(order); setIsBankOnly(true); setShowRmaModal(true); }}
                                                            className="bg-brand-dark text-white text-[8px] font-black uppercase px-4 py-1.5 rounded-full hover:bg-brand-pink transition-colors"
                                                        >
                                                            Fill Details
                                                        </button>
                                                    </div>
                                                </div>
                                            )}


                                            {(!order.returnStatus || order.returnStatus === 'Not Requested') ? (
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => { setSelectedOrder(order); setShowRmaModal(true); }}
                                                        className="text-[9px] font-bold text-brand-dark uppercase tracking-widest px-6 py-2.5 bg-brand-light border border-brand-dark hover:bg-brand-dark hover:text-white transition-all shadow-sm flex items-center gap-2"
                                                    >
                                                        <FiPlusCircle /> Initiate Restoration
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        {order.returnImages?.length > 0 && <FiImage className="text-brand-pink" size={14} title="Evidence Attached" />}
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm border ${['Returned', 'Replaced'].includes(order.returnStatus) ? 'bg-green-50 text-green-600 border-green-200' : order.returnStatus?.includes('Rejected') ? 'bg-red-50 text-red-500 border-red-200' : 'bg-brand-gold/10 text-brand-gold border-brand-gold/20'}`}>
                                                            {order.returnStatus}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Vendor Chat Modal */}
            <AnimatePresence>
                {chatOrder && user && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4"
                        onClick={() => setChatOrder(null)}
                    >
                        <motion.div
                            initial={{ y: 60, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 60, opacity: 0 }}
                            className="w-full sm:max-w-md h-[85dvh] sm:h-[560px] flex flex-col min-h-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ChatWindow
                                conversationId={getConversationId.userAdmin(user._id)}
                                metadata={{
                                    type: 'user-admin',
                                    userId: user._id,
                                    userName: user.name,
                                    orderId: chatOrder._id,
                                }}
                                currentUser={{ id: user._id, name: user.name, role: 'user' }}
                                recipientName="Sada Bharat Support"
                                onClose={() => setChatOrder(null)}
                                className="h-full flex-1 border-0 sm:rounded-2xl rounded-t-2xl shadow-none"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserOrders;

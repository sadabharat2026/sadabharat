import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRotateCcw, FiRefreshCw, FiSearch, FiCheck, FiX, FiMessageSquare, FiImage } from 'react-icons/fi';

import api from '../../utils/api';


const AdminReturns = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Refunds'); // 'Refunds' or 'Replacements'
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get('/orders/admin');
            // Filter out orders that are NOT null and NOT 'Not Requested' safely
            const rmaOrders = (res.data?.data || []).filter(
                o => ['Refund', 'Replace'].includes(o.returnAction) && o.returnStatus !== 'Not Requested'
            );
            setOrders(rmaOrders);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const updateReturnStatus = async (id, newStatus) => {
        try {
            await api.patch(`/orders/${id}/admin-update-return`, { returnStatus: newStatus });
            fetchRequests();
        } catch (error) {
            alert("Failed to update status: " + (error.response?.data?.message || error.message));
        }
    };

    // Split items into tabs dynamically securely safely.
    const displayedOrders = orders.filter(o =>
        (activeTab === 'Refunds' ? o.returnAction === 'Refund' : o.returnAction === 'Replace') &&
        (
            o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.returnReason?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const BankDetailsModal = ({ order, mode, onMarkRefunded, onClose }) => {
        if (!order) return null;
        const isReplacement = mode === 'Replacements';

        return createPortal(
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="bg-[#5C2E3E] px-6 py-4 flex justify-between items-center text-white">
                    <h3 className="text-xs font-black uppercase tracking-widest">
                        {isReplacement ? 'Replacement Details' : 'Bank Ritual Details'}
                    </h3>
                    <button onClick={onClose}><FiX size={20} /></button>
                </div>
                <div className="p-8 space-y-6">
                    {isReplacement ? (
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                {order.orderItems?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-2 rounded-lg">
                                        <img src={item.image} alt="" className="w-10 h-10 object-cover rounded-md bg-white" />
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-[#5C2E3E]">{item.name}</span>
                                            <span className="text-[9px] text-gray-500">Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <p className="text-[9px] text-blue-800 font-['Cormorant',_serif] italic leading-relaxed">
                                    "Confirm only once the replacement item has been dispatched to the customer. This action is irreversible."
                                </p>
                            </div>
                        </div>
                    ) : order.refundAccountDetails ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Name</p>
                                    <p className="text-[11px] font-bold text-[#5C2E3E]">{order.refundAccountDetails.accountName}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Bank Name</p>
                                    <p className="text-[11px] font-bold text-[#5C2E3E]">{order.refundAccountDetails.bankName}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Number</p>
                                    <p className="text-[11px] font-black text-admin-gold tracking-widest">{order.refundAccountDetails.accountNumber}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">IFSC Code</p>
                                    <p className="text-[11px] font-black text-admin-gold tracking-widest">{order.refundAccountDetails.ifscCode}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <p className="text-[9px] text-blue-800 font-['Cormorant',_serif] italic leading-relaxed">
                                    "Verify the sacred digits before committing the refund. This action is irreversible."
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
                            <FiCheck className="text-gray-200" size={40} />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Awaiting Customer Details</p>
                        </div>
                    )}
                </div>
                <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-100">
                    <button onClick={onClose} className="text-[10px] font-black uppercase text-gray-400">Cancel</button>
                    {(isReplacement || order.refundAccountDetails) && (
                        <button
                            onClick={() => { onMarkRefunded(order._id); onClose(); }}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-sans font-medium text-gray-800 capitalize shadow-lg hover:bg-green-700 transition-all"
                        >
                            {isReplacement ? 'Confirm & Mark Replaced' : 'Confirm & Refund'}
                        </button>
                    )}
                </div>
            </motion.div>
            </motion.div>,
            document.body
        );
    };

    return (

        <div className="space-y-6 lg:space-y-8 pt-4 md:pt-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-['Cormorant',_serif] text-admin-dark font-black tracking-tighter flex items-center gap-3">
                        <FiRotateCcw className="text-admin-accent" /> RMA <span className="text-admin-accent">Centre</span>
                    </h1>
                    <p className="text-sm font-sans font-medium text-gray-500 capitalize mt-2">
                        Process Returns, Refunds & Replacements comprehensively
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="SEARCH BY ID OR REASON..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-gray-100 pl-10 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-admin-accent transition-colors h-10 shadow-sm"
                        />
                    </div>
                    <button onClick={fetchRequests} className="h-10 px-4 bg-admin-dark text-white flex items-center justify-center hover:bg-admin-accent transition-colors shadow-md">
                        <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 mb-6">
                <button
                    onClick={() => setActiveTab('Refunds')}
                    className={`flex-1 md:flex-none px-8 py-3 text-sm font-sans font-medium text-gray-800 capitalize transition-colors ${activeTab === 'Refunds' ? 'text-white bg-admin-accent shadow-md' : 'text-gray-400 hover:text-admin-accent hover:bg-admin-accent/5'
                        }`}
                >
                    Return & Refund
                </button>
                <button
                    onClick={() => setActiveTab('Replacements')}
                    className={`flex-1 md:flex-none px-8 py-3 text-sm font-sans font-medium text-gray-800 capitalize transition-colors ${activeTab === 'Replacements' ? 'text-white bg-admin-gold shadow-md' : 'text-gray-400 hover:text-admin-gold hover:bg-admin-gold/5'
                        }`}
                >
                    Replacements
                </button>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center bg-white border border-gray-100 shadow-sm">
                    <div className="w-8 h-8 rounded-full border-2 border-admin-accent border-t-transparent animate-spin"></div>
                </div>
            ) : displayedOrders.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center bg-white border border-gray-100 shadow-sm">
                    {activeTab === 'Refunds' ? <FiRotateCcw className="text-4xl text-gray-200 mb-3" /> : <FiRefreshCw className="text-4xl text-gray-200 mb-3" />}
                    <p className="text-sm font-sans font-medium text-gray-400 tracking-wider capitalize">No Active {activeTab} Selected</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#FDFCFB] border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-sans font-bold uppercase tracking-widest text-gray-400">Order ID</th>
                                    <th className="px-6 py-4 text-xs font-sans font-bold uppercase tracking-widest text-gray-400">Customer</th>
                                    <th className="px-6 py-4 text-xs font-sans font-bold uppercase tracking-widest text-gray-400">Issue Details</th>
                                    <th className="px-6 py-4 text-xs font-sans font-bold uppercase tracking-widest text-gray-400 text-center">Amount</th>
                                    <th className="px-6 py-4 text-xs font-sans font-bold uppercase tracking-widest text-gray-400 text-center">Status</th>
                                    <th className="px-6 py-4 text-xs font-sans font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <AnimatePresence>
                                    {displayedOrders.map((order) => (
                                        <motion.tr
                                            key={order._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className={`group transition-colors ${order.returnStatus?.includes('Requested') ? 'bg-orange-50/50 hover:bg-orange-50' : 'hover:bg-gray-50'}`}
                                        >
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium font-sans text-gray-800 line-clamp-1">{order._id?.slice(-6).toUpperCase()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-sans font-medium text-gray-800">{order.shippingAddress?.name || order.user?.name}</span>
                                                    <span className="text-xs font-medium text-gray-500 truncate max-w-[120px]">{order.shippingAddress?.phone || order.user?.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 max-w-sm">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex gap-2 items-center flex-wrap">
                                                        {order.orderItems?.slice(0, 2).map((item, idx) => (
                                                            <div key={idx} className="flex items-center gap-1.5 bg-white border border-gray-100 p-1 rounded-sm">
                                                                <img src={item.image} alt="" className="w-6 h-6 object-cover bg-gray-50" />
                                                                <span className="text-xs font-medium text-gray-700 truncate max-w-[80px]">{item.name}</span>
                                                            </div>
                                                        ))}
                                                        {order.orderItems?.length > 2 && <span className="text-xs font-medium text-gray-400">+{order.orderItems.length - 2} more</span>}
                                                    </div>
                                                    {order.returnReason && (
                                                        <div className="mt-1 flex gap-2 items-start bg-red-50 p-2 rounded-sm border border-red-100/50">
                                                            <FiMessageSquare className="text-red-400 mt-0.5 shrink-0" size={12} />
                                                            <p className="text-sm font-['Cormorant',_serif] italic text-red-900 leading-snug break-words">"{order.returnReason}"</p>
                                                        </div>
                                                    )}
                                                    {order.returnImages?.length > 0 && (
                                                        <div className="mt-2 flex gap-1.5 flex-wrap">
                                                            {order.returnImages.map((img, i) => (
                                                                <a key={i} href={img} target="_blank" rel="noreferrer" className="w-10 h-10 rounded border border-gray-100 overflow-hidden hover:scale-110 transition-transform shadow-sm">
                                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-sans font-medium text-admin-dark">₹{order.totalPrice}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-block px-2.5 py-1 text-xs font-sans font-bold uppercase tracking-widest rounded-sm ${['Returned', 'Replaced'].includes(order.returnStatus) ? 'bg-green-100 text-green-700' :
                                                    order.returnStatus?.includes('Rejected') ? 'bg-red-100 text-red-700' :
                                                        order.returnStatus?.includes('Approved') ? 'bg-blue-100 text-blue-700' :
                                                            'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {order.returnStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {order.returnStatus?.includes('Requested') && (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => updateReturnStatus(order._id, activeTab === 'Refunds' ? 'Return Approved' : 'Replace Approved')}
                                                            className="p-1.5 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white rounded-md transition-all border border-green-200 hover:border-green-500 shadow-sm"
                                                            title={`Approve ${activeTab}`}
                                                        >
                                                            <FiCheck size={12} strokeWidth={3} />
                                                        </button>
                                                        <button
                                                            onClick={() => updateReturnStatus(order._id, activeTab === 'Refunds' ? 'Return Rejected' : 'Replace Rejected')}
                                                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-md transition-all border border-red-200 hover:border-red-500 shadow-sm"
                                                            title={`Reject ${activeTab}`}
                                                        >
                                                            <FiX size={12} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                )}

                                                {order.returnStatus?.includes('Approved') && (
                                                    <div className="flex flex-col gap-2 items-end">
                                                        <button
                                                            onClick={() => setSelectedOrderDetails(order)}
                                                            className="px-3 py-1.5 bg-admin-gold text-white text-xs font-sans font-bold uppercase tracking-widest rounded-md hover:bg-admin-dark shadow-md transition-colors w-[100px]"
                                                        >
                                                            {activeTab === 'Replacements' ? 'Mark Replaced' : 'Show Details'}
                                                        </button>
                                                        {activeTab === 'Refunds' && !order.refundAccountDetails && (
                                                            <span className="text-[7px] font-black text-red-400 uppercase tracking-tighter animate-pulse">Awaiting Bank Info</span>
                                                        )}
                                                    </div>
                                                )}


                                                {['Returned', 'Replaced', 'Return Rejected', 'Replace Rejected'].includes(order.returnStatus) && (
                                                    <span className="text-xs font-sans font-bold uppercase tracking-widest text-gray-300">Resolved</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {selectedOrderDetails && (
                    <BankDetailsModal
                        order={selectedOrderDetails}
                        mode={activeTab}
                        onClose={() => setSelectedOrderDetails(null)}
                        onMarkRefunded={(id) => updateReturnStatus(id, activeTab === 'Refunds' ? 'Returned' : 'Replaced')}
                    />
                )}
            </AnimatePresence>
        </div>

    );
};

export default AdminReturns;

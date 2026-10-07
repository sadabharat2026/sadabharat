import React, { useState, useEffect, useCallback } from 'react';
import { Tag, Plus, Edit2, Trash2, Clock, CheckCircle, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import api from '../../utils/api';

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const emptyForm = {
        code: '',
        discountType: 'percentage',
        discountValue: '',
        isActive: true,
        usageLimit: '',
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: ''
    };
    const [form, setForm] = useState({ ...emptyForm });

    const fetchCoupons = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/coupons');
            const fetched = res.data?.data?.coupons;
            if (fetched && fetched.length > 0) {
                setCoupons(fetched);
            } else {
                setCoupons([]);
            }
        } catch (err) {
            console.error("Failed to fetch coupons:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    const handleDelete = async (id) => {
        if (window.confirm("Permanently remove this promo code?")) {
            try {
                await api.delete(`/coupons/${id}`);
                fetchCoupons();
            } catch (err) {
                alert("Failed to delete coupon");
            }
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await api.patch(`/coupons/${id}`, { isActive: !currentStatus });
            fetchCoupons();
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const startEdit = (c) => {
        setEditingCoupon(c);
        setForm({
            code: c.code,
            discountType: c.discountType,
            discountValue: c.discountValue,
            isActive: c.isActive,
            usageLimit: c.usageLimit || '',
            startDate: c.startDate ? new Date(c.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            expiryDate: new Date(c.expiryDate).toISOString().split('T')[0]
        });
        setIsAdding(true);
    };

    const handleAdd = async (e) => {
        e.preventDefault();

        if (form.startDate && form.expiryDate && form.startDate > form.expiryDate) {
            alert('Start date must be before the expiry date.');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = { ...form };
            if (!payload.usageLimit) payload.usageLimit = null; // Infinite usages if empty

            if (editingCoupon) {
                await api.patch(`/coupons/${editingCoupon._id}`, payload);
            } else {
                await api.post('/coupons', payload);
            }
            fetchCoupons();
            setIsAdding(false);
            setEditingCoupon(null);
            setForm({ ...emptyForm });
        } catch (err) {
            alert(err.response?.data?.message || "Failed to save coupon");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 pb-6 max-w-[1400px] mx-auto -mt-2">
            <AnimatePresence mode="wait">
                {!isAdding ? (
                    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-serif font-bold text-gray-900 leading-tight">Coupons</h1>
                                <p className="text-[12px] text-gray-500 mt-0.5 font-sans">Manage your discount codes and promotions.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setEditingCoupon(null); setForm({ ...emptyForm }); setIsAdding(true); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#054425] text-white rounded-lg text-[12px] font-medium shadow-sm hover:bg-[#04331c] transition-colors"
                                >
                                    <Plus size={14} /> Create Coupon
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 text-[11px] text-gray-500 uppercase tracking-widest border-b border-gray-100">
                                            <th className="px-4 py-3 font-semibold">Code</th>
                                            <th className="px-4 py-3 font-semibold">Discount</th>
                                            <th className="px-4 py-3 font-semibold">Usage</th>
                                            <th className="px-4 py-3 font-semibold">Start Date</th>
                                            <th className="px-4 py-3 font-semibold">Expiry Date</th>
                                            <th className="px-4 py-3 font-semibold">Status</th>
                                            <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[12px] text-gray-800">
                                        {loading ? (
                                            <tr><td colSpan="7" className="px-4 py-10 text-center text-gray-400 font-medium">Loading coupons...</td></tr>
                                        ) : coupons.length > 0 ? (
                                            coupons.map((c) => (
                                                <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center gap-2">
                                                           <Tag size={14} className="text-[#388E3C]" />
                                                           <span className="font-medium text-gray-800">{c.code}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2.5 font-medium text-gray-800">
                                                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-gray-600 font-medium">
                                                        {c.usedCount} <span className="text-gray-400">/ {c.usageLimit || '∞'}</span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-gray-500 font-medium">
                                                        {c.startDate ? new Date(c.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-gray-500 font-medium">
                                                        {new Date(c.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <button onClick={() => handleToggleStatus(c._id, c.isActive)} className="focus:outline-none">
                                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                                              c.isActive ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]' : 'bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]'
                                                            }`}>
                                                              {c.isActive ? 'Active' : 'Paused'}
                                                            </span>
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right">
                                                        <div className="flex items-center gap-2 justify-end text-gray-400">
                                                            <button onClick={() => startEdit(c)} className="p-1 hover:text-[#054425] transition-colors"><Edit2 size={14} /></button>
                                                            <button onClick={() => handleDelete(c._id)} className="p-1 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="7" className="px-4 py-10 text-center text-gray-400 font-medium">No coupons found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="add" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-xl mx-auto bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 p-6 relative overflow-hidden">
                        <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={16} />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-xl font-serif font-bold text-gray-900 leading-tight">
                                {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                            </h2>
                            <p className="text-[12px] text-gray-500 mt-0.5 font-sans">Set up your discount code parameters</p>
                        </div>

                        <form onSubmit={handleAdd} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Coupon Code</label>
                                <input type="text" placeholder="e.g. SUMMER20" className="w-full border border-gray-200 p-2.5 rounded-lg text-sm text-gray-800 outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] transition-all" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Discount Type</label>
                                    <select className="w-full border border-gray-200 p-2.5 rounded-lg text-sm text-gray-800 outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] transition-all" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Discount Value</label>
                                    <input type="number" placeholder="Enter value" className="w-full border border-gray-200 p-2.5 rounded-lg text-sm text-gray-800 outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] transition-all" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} required min="1" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Usage Limit (number of times this code can be used)</label>
                                <input
                                    type="number"
                                    placeholder="Leave empty for unlimited uses"
                                    className="w-full border border-gray-200 p-2.5 rounded-lg text-sm text-gray-800 outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] transition-all"
                                    value={form.usageLimit}
                                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                                    min="1"
                                    max="1000000"
                                    step="1"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-200 p-2.5 rounded-lg text-sm text-gray-800 outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] transition-all"
                                        value={form.startDate}
                                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Expiry Date</label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-200 p-2.5 rounded-lg text-sm text-gray-800 outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] transition-all"
                                        value={form.expiryDate}
                                        onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                                        required
                                        min={form.startDate || new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button type="submit" disabled={isSubmitting} className="w-full bg-[#054425] text-white py-2.5 rounded-lg text-[13px] font-medium shadow-sm hover:bg-[#04331c] transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                                    {isSubmitting ? 'Saving...' : (editingCoupon ? 'Save Changes' : 'Create Coupon')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCoupons;

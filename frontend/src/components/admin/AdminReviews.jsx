import React, { useState, useEffect, useCallback } from 'react';
import { FiStar, FiTrash2, FiCheckCircle, FiXCircle, FiRefreshCw, FiMessageSquare, FiX, FiSend } from 'react-icons/fi';
import api from '../../utils/api';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replying, setReplying] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [savingReply, setSavingReply] = useState(false);

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/admins/reviews');
            setReviews(res.data.data.reviews || []);
        } catch (err) {
            console.error('Failed to fetch product reviews:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this review permanently?')) return;
        try {
            await api.delete(`/admins/reviews/${id}`);
            fetchReviews();
        } catch {
            alert('Failed to delete review.');
        }
    };

    const handleToggleApproval = async (id) => {
        try {
            await api.patch(`/admins/reviews/${id}/toggle-approval`);
            fetchReviews();
        } catch {
            alert('Failed to update review status.');
        }
    };

    const openReply = (review) => {
        setReplying(review);
        setReplyText(review.adminReply || '');
    };

    const handleSaveReply = async (e) => {
        e.preventDefault();
        if (!replying || !replyText.trim()) {
            alert('Please write a reply.');
            return;
        }
        setSavingReply(true);
        try {
            await api.patch(`/admins/reviews/${replying._id}/reply`, { reply: replyText.trim() });
            setReplying(null);
            setReplyText('');
            fetchReviews();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save reply.');
        } finally {
            setSavingReply(false);
        }
    };

    const getImage = (product) => {
        if (!product) return null;
        if (product.images?.length > 0) return product.images[0];
        if (product.image) return product.image;
        return null;
    };

    return (
        <div className="px-6 py-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-xl font-semibold text-gray-800">Feedback Ledger</h1>
                    <p className="text-xs text-gray-400 mt-0.5">Verified product ratings & customer commentary</p>
                </div>
                <button
                    onClick={fetchReviews}
                    className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <FiRefreshCw size={11} className={loading ? 'animate-spin' : ''} />
                    Sync Reviews
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/60">
                                <th className="px-4 py-2.5 text-[11px] font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Product</th>
                                <th className="px-4 py-2.5 text-[11px] font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Customer</th>
                                <th className="px-4 py-2.5 text-[11px] font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Rating / Comment</th>
                                <th className="px-4 py-2.5 text-[11px] font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                                <th className="px-4 py-2.5 text-[11px] font-medium text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-400 text-xs animate-pulse">
                                        Loading reviews...
                                    </td>
                                </tr>
                            ) : reviews.length > 0 ? (
                                reviews.map((r) => (
                                    <tr key={r._id} className="hover:bg-gray-50/40 transition-colors">
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0 overflow-hidden">
                                                    {getImage(r.product) ? (
                                                        <img
                                                            src={getImage(r.product)}
                                                            alt=""
                                                            className="w-full h-full object-contain mix-blend-multiply"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 rounded-lg" />
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-700 font-medium line-clamp-1 max-w-[130px]">
                                                    {r.product?.name || '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <span className="text-xs text-gray-700">{r.user?.name || '—'}</span>
                                            {(r.user?.phone || r.user?.mobile) && (
                                                <p className="text-[10px] text-gray-400 mt-0.5">{r.user.phone || r.user.mobile}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 max-w-[240px]">
                                            <div className="flex items-center gap-0.5 text-amber-400 mb-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <FiStar
                                                        key={i}
                                                        size={10}
                                                        className={i < r.rating ? 'fill-amber-400 stroke-amber-400' : 'stroke-gray-200 fill-gray-100'}
                                                    />
                                                ))}
                                                <span className="text-[10px] text-amber-500 ml-1 font-medium">{r.rating}.0</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 line-clamp-1 italic">
                                                {r.comment ? `"${r.comment}"` : <span className="text-gray-300 not-italic">No comment</span>}
                                            </p>
                                            {r.adminReply ? (
                                                <p className="text-[10px] text-[#054425] mt-1 line-clamp-1">
                                                    Reply: {r.adminReply}
                                                </p>
                                            ) : (
                                                <p className="text-[10px] text-gray-300 mt-1">No reply yet</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-2">
                                            <button onClick={() => handleToggleApproval(r._id)} title="Click to toggle">
                                                {r.isApproved ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-green-50 text-green-600 border border-green-100 rounded-md hover:bg-green-100 transition-colors cursor-pointer">
                                                        <FiCheckCircle size={9} /> Approved
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-red-50 text-red-500 border border-red-100 rounded-md hover:bg-red-100 transition-colors cursor-pointer">
                                                        <FiXCircle size={9} /> Hidden
                                                    </span>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <div className="inline-flex items-center gap-2">
                                                <button
                                                    onClick={() => openReply(r)}
                                                    title={r.adminReply ? 'Edit reply' : 'Reply'}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                                                        r.adminReply
                                                            ? 'text-white bg-[#054425] border-[#054425] hover:bg-[#04331c]'
                                                            : 'text-[#054425] bg-[#E8F5E9] border-green-200 hover:bg-[#d7eedb]'
                                                    }`}
                                                >
                                                    <FiMessageSquare size={14} />
                                                    {r.adminReply ? 'Edit' : 'Reply'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(r._id)}
                                                    title="Delete"
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:text-red-700 transition-all"
                                                >
                                                    <FiTrash2 size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-10 text-center text-gray-400 text-xs italic">
                                        No product reviews found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {replying && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setReplying(null)}
                        aria-label="Close reply"
                    />
                    <form
                        onSubmit={handleSaveReply}
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-5 space-y-4"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Reply to feedback</h3>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                    {replying.user?.name || 'Customer'} · {replying.product?.name || 'Product'}
                                </p>
                            </div>
                            <button type="button" onClick={() => setReplying(null)} className="text-gray-400 hover:text-gray-700">
                                <FiX size={18} />
                            </button>
                        </div>

                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                            <div className="flex items-center gap-0.5 text-amber-400 mb-1">
                                {[...Array(5)].map((_, i) => (
                                    <FiStar
                                        key={i}
                                        size={11}
                                        className={i < replying.rating ? 'fill-amber-400 stroke-amber-400' : 'stroke-gray-200 fill-gray-100'}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-gray-600 italic">
                                {replying.comment ? `"${replying.comment}"` : 'No comment'}
                            </p>
                        </div>

                        <label className="block space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Your reply</span>
                            <textarea
                                required
                                rows={4}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply for this customer..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#054425] resize-none"
                            />
                        </label>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setReplying(null)}
                                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={savingReply}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#054425] text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                            >
                                <FiSend size={12} />
                                {savingReply ? 'Saving...' : (replying.adminReply ? 'Update reply' : 'Send reply')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminReviews;

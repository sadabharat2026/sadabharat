import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import api from '../../utils/api';

const VendorReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/vendors/reviews');
        if (res.data.success) {
          setReviews(res.data.data.reviews);
        }
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const getImage = (product) => {
    if (!product) return null;
    if (product.images?.length > 0) return product.images[0];
    if (product.image) return product.image;
    return null;
  };

  if (loading) return (
    <div className="h-60 flex items-center justify-center text-xs text-gray-400 animate-pulse">
      Loading reviews...
    </div>
  );

  return (
    <div className="px-6 py-4 space-y-3">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Reviews</h1>
        <p className="text-xs text-gray-400 mt-0.5">Customer feedback on your products</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-4 py-2.5 text-[11px] font-medium text-gray-500 uppercase tracking-wide">Product</th>
                <th className="px-4 py-2.5 text-[11px] font-medium text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="px-4 py-2.5 text-[11px] font-medium text-gray-500 uppercase tracking-wide">Rating</th>
                <th className="px-4 py-2.5 text-[11px] font-medium text-gray-500 uppercase tracking-wide">Review</th>
                <th className="px-4 py-2.5 text-[11px] font-medium text-gray-500 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reviews.length > 0 ? reviews.map((rev) => (
                <tr key={rev._id} className="hover:bg-gray-50/40 transition-colors">
                  {/* Product */}
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0 overflow-hidden">
                        {getImage(rev.product) ? (
                          <img
                            src={getImage(rev.product)}
                            alt=""
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-lg" />
                        )}
                      </div>
                      <span className="text-xs text-gray-700 font-medium line-clamp-1 max-w-[130px]">
                        {rev.product?.name || '—'}
                      </span>
                    </div>
                  </td>
                  {/* Customer */}
                  <td className="px-4 py-2">
                    <span className="text-xs text-gray-700">{rev.user?.name || 'Anonymous'}</span>
                    {rev.user?.phone && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{rev.user.phone}</p>
                    )}
                  </td>
                  {/* Rating */}
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          size={11}
                          fill={idx < rev.rating ? 'currentColor' : 'none'}
                          className={idx >= rev.rating ? 'text-gray-200' : ''}
                        />
                      ))}
                      <span className="text-[10px] text-amber-500 ml-1 font-medium">{rev.rating}.0</span>
                    </div>
                  </td>
                  {/* Comment */}
                  <td className="px-4 py-2 max-w-[220px]">
                    <p className="text-[11px] text-gray-500 italic line-clamp-2">
                      {rev.comment ? `"${rev.comment}"` : <span className="text-gray-300 not-italic">No comment</span>}
                    </p>
                    {rev.adminReply && (
                      <p className="text-[10px] text-[#054425] mt-1 line-clamp-2">
                        Admin: {rev.adminReply}
                      </p>
                    )}
                  </td>
                  {/* Date */}
                  <td className="px-4 py-2 text-[11px] text-gray-400 whitespace-nowrap">
                    {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-4 py-10 text-center text-gray-400 text-xs italic">
                    No reviews found for your products yet.
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

export default VendorReviews;

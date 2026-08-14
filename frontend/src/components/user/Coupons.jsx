import React, { useState, useEffect, useCallback } from 'react';
import ProfileSidebar from './ProfileSidebar';
import { FiTag, FiClock } from 'react-icons/fi';
import { useShop } from '../../context/ShopContext';
import api from '../../utils/api';

const Coupons = () => {
  const { user } = useShop();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = useCallback(async () => {
      try {
          setLoading(true);
          const res = await api.get('/coupons/public');
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

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-4 md:pt-6 pb-12 font-sans selection:bg-[#054425] selection:text-white">
      <div className="w-full px-4 lg:px-8 flex flex-col lg:flex-row gap-6">
        
        <ProfileSidebar activeTab="coupons" />
        
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#054425] mb-1">My Coupons</h1>
              <p className="text-xs text-gray-500 font-medium">Available discounts and offers</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-5 shadow-sm min-h-[400px]">
            {loading ? (
                <div className="py-20 text-center text-gray-400 font-medium">Loading coupons...</div>
            ) : coupons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coupons.map(coupon => (
                        <div key={coupon._id} className="border border-green-100 rounded-lg p-4 bg-green-50/30 flex items-start gap-4 hover:border-green-200 transition-colors">
                            <div className="w-12 h-12 bg-[#054425] rounded-full flex items-center justify-center text-white shrink-0">
                                <FiTag size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg mb-0.5 tracking-wide">{coupon.code}</h3>
                                <p className="text-sm font-semibold text-[#054425] mb-2">
                                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} FLAT OFF`}
                                </p>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-white w-fit px-2 py-1 rounded border border-gray-100">
                                    <FiClock size={12} />
                                    <span>Valid till {new Date(coupon.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-500">
                    <FiTag className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">No active coupons</h3>
                  <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto">
                    You don't have any available coupons at the moment. Check back later for special offers!
                  </p>
                </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Coupons;

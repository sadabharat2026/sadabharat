import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const TrendingOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await api.get('/offers');
        if (res.data?.success) {
          setOffers(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch trending offers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  if (loading) return null;

  return (
    <section className="pt-4 md:pt-6 pb-2 md:pb-4 bg-white overflow-hidden">
      <div className="w-full px-4 md:px-8">
        
        {/* Header Block matching mockup */}
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-2xl font-serif font-black text-[#054425] tracking-tight">
              Trending Offers
            </h2>
          </div>

          <Link
            to="/offers"
            className="flex items-center gap-1.5 text-xs font-bold text-[#054425] hover:text-[#0d5c34] transition-colors tracking-tight uppercase"
          >
            <span>View All</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>

        {/* Running Scroll Animation (Marquee) for Offers */}
        <div className="w-full overflow-hidden relative">
          <motion.div 
            className="flex gap-4 md:gap-6 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
          >
            {[...offers, ...offers].map((offer, index) => (
              <div
                key={offer._id ? `${offer._id}-${index}` : index}
                className="relative w-[300px] md:w-[450px] shrink-0 aspect-[3.5/2.1] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group border border-gray-100 bg-[#F4F8F5]"
              >
                {/* Product Background Image */}
                <img
                  src={offer.image}
                  alt={offer.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />

                {/* Overlay with details - Decreased opacity */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/40 to-transparent flex flex-col justify-center p-6 md:p-8 z-10">
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    {offer.badge.includes('Free') ? 'Gift Offer' : 'Deal'}
                  </span>
                  
                  {/* Main discount badge */}
                  <h3 className="text-[#054425] font-serif font-black text-xl md:text-3xl leading-none mb-1">
                    {offer.badge}
                  </h3>
                  
                  {/* Product target title */}
                  <p className="text-gray-800 text-xs md:text-sm font-semibold mb-4 whitespace-pre-line leading-tight">
                    {offer.title}
                  </p>

                  {/* Pill-shaped Dark Green Shop Now Button */}
                  <Link
                    to={`/shop?category=${offer.category}`}
                    className="bg-[#054425] hover:bg-[#0d5c34] text-white px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors w-fit shadow-md hover:shadow-lg active:scale-95"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrendingOffers;

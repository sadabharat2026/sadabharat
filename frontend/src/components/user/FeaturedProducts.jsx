import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ScrollHeading from '../shared/ScrollHeading';
import ScrollReveal from '../shared/ScrollReveal';

import 'swiper/css';

const TABS = ['All', 'Best Sellers', 'New Arrivals'];

const FeaturedProducts = () => {
  const { products, loading } = useShop();
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [activeTab, setActiveTab] = useState('All');

  const getProducts = () => {
    let base = [...products].filter(
      p => p.recommended === true || p.category?.toLowerCase() === 'skin care'
    );
    if (activeTab === 'Best Sellers') {
      base = base.filter(p => p.bestseller || p.rating >= 4.5).sort((a, b) => b.rating - a.rating);
    } else if (activeTab === 'New Arrivals') {
      // treat last 30% of IDs as new arrivals
      base = base.slice(Math.floor(base.length * 0.6));
    }
    return base.slice(0, 8);
  };

  const recommended = getProducts();

  // Assign badges to some cards
  const getBadge = (product, index) => {
    if (activeTab === 'New Arrivals') return 'new';
    if (activeTab === 'Best Sellers') return index === 0 ? 'limited' : undefined;
    // In "All" mode — sprinkle badges on alternating cards
    if (index % 4 === 0) return 'new';
    if (index % 4 === 2) return 'limited';
    return undefined;
  };

  if (loading && products.length === 0) {
    return (
      <div className="py-10 bg-white flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#054425]"></div>
      </div>
    );
  }

  return (
    <section className="pt-2 pb-2 md:pt-4 md:pb-4 bg-white">
      <div className="w-full px-4 md:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
          <ScrollHeading as="h2" className="text-lg md:text-2xl font-serif font-black text-[#054425] tracking-tight">
            Recommended For You
          </ScrollHeading>
          <Link
            to="/shop?sort=Top Rated"
            className="flex items-center gap-1.5 text-xs font-bold text-[#054425] hover:text-[#0d5c34] transition-colors tracking-tight uppercase"
          >
            <span>View All</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border transition-all duration-200
                ${activeTab === tab
                  ? 'bg-[#054425] text-white border-[#054425] shadow-sm'
                  : 'bg-white text-[#054425] border-[#054425]/30 hover:border-[#054425]/60'
                }`}
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Swiper with side floating arrows */}
        <ScrollReveal y={20} amount={0.12}>
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => swiperInstance?.slidePrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-[#054425] hover:bg-[#054425] hover:text-white hover:border-[#054425] transition-all duration-200 active:scale-95"
          >
            <FiChevronLeft size={15} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => swiperInstance?.slideNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-[#054425] hover:bg-[#054425] hover:text-white hover:border-[#054425] transition-all duration-200 active:scale-95"
          >
            <FiChevronRight size={15} />
          </button>

          <Swiper
            key={activeTab}
            spaceBetween={16}
            slidesPerView={2}
            speed={800}
            onSwiper={setSwiperInstance}
            breakpoints={{
              480:  { slidesPerView: 3, spaceBetween: 12 },
              768:  { slidesPerView: 4, spaceBetween: 16 },
              1024: { slidesPerView: 5, spaceBetween: 16 },
              1280: { slidesPerView: 6, spaceBetween: 20 },
              1536: { slidesPerView: 7, spaceBetween: 20 },
            }}
            className="recommended-swiper"
          >
            {recommended.map((product, index) => (
              <SwiperSlide key={product._id || product.id}>
                <ProductCard product={product} badge={getBadge(product, index)} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default FeaturedProducts;

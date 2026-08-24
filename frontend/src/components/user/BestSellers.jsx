import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ScrollHeading from '../shared/ScrollHeading';
import ScrollReveal from '../shared/ScrollReveal';

import 'swiper/css';

const BestSellers = () => {
  const { products, loading } = useShop();
  const [swiperInstance, setSwiperInstance] = useState(null);

  const bestSellers = [...products]
    .filter(p => p.bestseller === true || p.category?.toLowerCase() !== 'innerwear')
    .sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews))
    .slice(0, 8);

  if (loading && products.length === 0) {
    return (
      <div className="py-10 bg-white flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#054425]"></div>
      </div>
    );
  }

  return (
    <section className="pt-2 md:pt-4 pb-8 md:pb-12 bg-[#F2F6E8]">
      <div className="w-full px-4 md:px-8">

        {/* Header — clean, no arrows here */}
        <div className="flex items-center justify-between mb-4 pb-1">
          <ScrollHeading as="h2" className="text-lg md:text-2xl font-serif font-black text-[#054425] tracking-tight">
            Best Selling Products
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
            spaceBetween={16}
            slidesPerView={2}
            onSwiper={setSwiperInstance}
            breakpoints={{
              768:  { slidesPerView: 3, spaceBetween: 24 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
              1280: { slidesPerView: 5, spaceBetween: 24 },
            }}
            className="bestseller-swiper"
          >
            {bestSellers.map((product) => (
              <SwiperSlide key={product._id || product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default BestSellers;

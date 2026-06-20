import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../../utils/api';

import 'swiper/css';
import 'swiper/css/navigation';

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <FiStar
        key={star}
        size={11}
        className={star <= rating ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-gray-300'}
      />
    ))}
  </div>
);

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await api.get('/testimonials');
        const data = res.data?.data?.testimonials;
        if (data && data.length > 0) {
          setTestimonials(data);
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  if (loading || testimonials.length === 0) return null;

  return (
    <section className="pt-2 pb-10 md:pt-4 md:pb-14 bg-[#F2F6E8] overflow-hidden relative">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-[#054425]/5 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-[#D4AF37]/5 translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full px-4 md:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-6 md:mb-8"
        >
          <div>
            <h2 className="text-lg md:text-2xl font-serif font-black text-[#054425] tracking-tight">
              What Our Customers Say
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-[2px] w-10 bg-[#D4AF37] rounded-full" />
              <span className="text-[10px] md:text-xs text-[#054425]/60 font-semibold uppercase tracking-widest">
                Real Reviews · Real People
              </span>
            </div>
          </div>
        </motion.div>

        {/* Swiper */}
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={14}
          slidesPerView={1.15}
          loop={testimonials.length > 3}
          autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
          breakpoints={{
            480:  { slidesPerView: 1.4, spaceBetween: 14 },
            640:  { slidesPerView: 2.1, spaceBetween: 16 },
            768:  { slidesPerView: 2.5, spaceBetween: 18 },
            1024: { slidesPerView: 3.2, spaceBetween: 20 },
            1280: { slidesPerView: 4,   spaceBetween: 20 },
          }}
          className="testimonials-ayur-swiper !overflow-visible"
        >
          {testimonials.map((item, index) => (
            <SwiperSlide key={item._id} className="!h-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="bg-white rounded-xl p-3 shadow-sm border border-[#054425]/8 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 h-full flex flex-col"
              >
                {/* Top: Avatar + Name */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-[#054425]/20"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=054425&color=fff&size=36`;
                      }}
                    />
                    {/* verified badge */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#054425] rounded-full flex items-center justify-center">
                      <svg viewBox="0 0 12 12" className="w-2 h-2 text-white fill-white">
                        <path d="M10 3L4.5 8.5 2 6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-black text-[#054425] truncate">{item.name}</p>
                    {item.location && (
                      <p className="text-[9px] text-gray-400 font-medium">{item.location}</p>
                    )}
                  </div>
                  <StarRating rating={item.rating || 5} />
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-[#054425]/10 via-[#D4AF37]/20 to-transparent mb-2" />

                {/* Quote */}
                <div className="flex-1 relative pb-2">
                  <p className="text-[#0B3B24]/80 text-[13px] sm:text-sm leading-relaxed font-serif italic line-clamp-4 relative z-10">
                    "{item.content}"
                  </p>
                </div>

                {/* Product tag or empty placeholder to maintain height */}
                <div className="mt-auto pt-2 border-t border-gray-50 h-8 flex items-center">
                  {item.product && (
                    <span className="inline-flex items-center gap-1 bg-[#F2F6E8] text-[#054425] text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                      <span className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                      {item.product}
                    </span>
                  )}
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Testimonials;

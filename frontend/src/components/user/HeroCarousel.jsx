import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../../context/ShopContext';

const HeroCarousel = () => {
  const { banners: allBanners } = useShop();
  // Filter only 'Main Slider' type banners
  const banners = allBanners ? allBanners.filter(b => b.type === 'Main Slider') : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const nextSlide = () => {
    if (banners.length === 0) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    if (banners.length === 0) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="w-full">
      <div className="relative w-full aspect-video max-h-[380px] bg-[#F4F8F5] overflow-hidden border-b border-gray-100 group">
        <AnimatePresence initial={false} custom={direction}>
          {banners.map((banner, index) => {
            if (index !== currentIndex) return null;
            return (
              <motion.div
                key={banner._id || banner.id || index}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                className="absolute inset-0 w-full h-full"
              >
                {/* Banner image */}
                <img
                  src={banner.image}
                  alt={`Sada Bharat Banner ${index + 1}`}
                  className="w-full h-full object-cover object-center opacity-[0.92] select-none"
                />

                {/* Optional Text Overlay */}
                {(banner.heading || banner.subtitle) && (
                  <div className="absolute inset-0 flex items-center">
                    <div className="pl-6 sm:pl-10 md:pl-14 lg:pl-20 max-w-[55%] sm:max-w-[50%] md:max-w-[45%]">
                      {/* Badge */}
                      {banner.badge && (
                      <div className="flex items-center gap-1.5 mb-2 md:mb-3">
                        <span className="text-[#054425] text-sm md:text-base">🌿</span>
                        <span 
                          className="text-[9px] sm:text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#054425]"
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                          {banner.badge}
                        </span>
                      </div>
                      )}

                      {/* Main Heading */}
                      {(banner.heading || banner.title) && (
                      <h2 
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[64px] mb-2 md:mb-3"
                        style={{ 
                          fontFamily: "'Cormorant Garamond', serif", 
                          fontWeight: 700, 
                          lineHeight: 1.1, 
                          letterSpacing: '-1px', 
                          color: '#0B3D1F' 
                        }}
                        dangerouslySetInnerHTML={{ __html: banner.heading || banner.title }}
                      />
                      )}

                      {/* Subtitle */}
                      {(banner.subtitle || banner.description) && (
                      <p 
                        className="text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-600 mb-3 md:mb-5 leading-relaxed"
                        style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
                        dangerouslySetInnerHTML={{ __html: banner.subtitle || banner.description }}
                      />
                      )}

                      {/* Button */}
                      {(banner.buttonText || banner.btnText) && (
                      <a
                        href={banner.link || '#'}
                        className="inline-flex items-center gap-2 bg-[#054425] hover:bg-[#1E4D2B] text-white text-[10px] sm:text-xs md:text-sm font-semibold px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-md"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        {banner.buttonText || banner.btnText}
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/70 hover:bg-white text-[#054425] rounded-full flex items-center justify-center shadow-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/70 hover:bg-white text-[#054425] rounded-full flex items-center justify-center shadow-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        </button>
        {/* Dynamic slider pagination dots inside the banner */}
        <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 flex justify-center items-center gap-2 select-none z-20">
          {banners.map((_, index) => (
            <span 
              key={index} 
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full cursor-pointer transition-all ${
                currentIndex === index ? 'bg-[#054425] scale-125' : 'bg-white/60 hover:bg-white/90'
              }`}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;

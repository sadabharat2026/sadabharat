import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../../context/ShopContext';

const HeroCarousel = () => {
  const { banners: allBanners } = useShop();
  // Filter only 'Main Slider' type banners
  const banners = useMemo(() => (
    (allBanners || [])
      .filter((b) => b.type === 'Main Slider')
      .slice()
      .sort((a, b) => (a.slot ?? a.sequence ?? 999) - (b.slot ?? b.sequence ?? 999))
  ), [allBanners]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const videoRef = React.useRef(null);

  const nextSlide = React.useCallback(() => {
    if (banners.length === 0) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = () => {
    if (banners.length === 0) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Dynamic interval: 2.5s for image banners, longer/video based for video banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const currentBanner = banners[currentIndex];
    const isVideoBanner = currentBanner && (
      currentBanner.isVideo || 
      (typeof currentBanner.image === 'string' && (currentBanner.image.endsWith('.mp4') || currentBanner.image.endsWith('.webm') || currentBanner.image.includes('video')))
    );

    // If current is video, allow it to play for 7.5 seconds before auto-transitioning, else 2.5s for image banners
    const duration = isVideoBanner ? 7500 : 2500;

    const timer = setTimeout(() => {
      nextSlide();
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, banners, nextSlide]);

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 600 : -600,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 600 : -600,
      opacity: 0
    })
  };

  return (
    <div className="w-full">
      <div className="relative w-full aspect-[4/5] sm:aspect-[16/10] md:aspect-video min-h-[420px] sm:min-h-[480px] max-h-[560px] md:min-h-[520px] md:max-h-[600px] bg-[#021d10] overflow-hidden border-b border-gray-100 group">
        <AnimatePresence initial={false} custom={direction}>
          {banners.map((banner, index) => {
            if (index !== currentIndex) return null;
            const isVideo = banner.isVideo || (typeof banner.image === 'string' && (banner.image.endsWith('.mp4') || banner.image.endsWith('.webm') || banner.image.includes('video')));
            
            return (
              <motion.div
                key={banner._id || banner.id || index}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: "spring", stiffness: 260, damping: 28 }, opacity: { duration: 0.4 } }}
                className="absolute inset-0 w-full h-full"
              >
                {/* Video or Image Banner */}
                {isVideo ? (
                  <div className="w-full h-full relative overflow-hidden bg-black">
                    <motion.video
                      ref={videoRef}
                      src={banner.image}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover object-center select-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                    {/* Subtle Gradient Overlays for readable text without darkening the entire video */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent pointer-events-none" />
                  </div>
                ) : (
                  <div className="w-full h-full relative overflow-hidden bg-black">
                    <motion.img
                      src={banner.image}
                      alt={`Sada Bharat Banner ${index + 1}`}
                      className="w-full h-full object-cover object-center opacity-[0.88] select-none"
                      initial={{ scale: 1.08 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 2.5, ease: 'easeOut' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/60 pointer-events-none" />
                  </div>
                )}

                {/* Text Overlay with Smooth Staggered Fade-In / Fade-Out Animations */}
                {(banner.heading || banner.title || banner.subtitle || banner.description) && (
                  <div className="absolute inset-0 flex items-center pt-16 md:pt-20">
                    <div className="pl-6 sm:pl-10 md:pl-14 lg:pl-20 max-w-[65%] sm:max-w-[55%] md:max-w-[50%] z-10">
                      {/* Badge */}
                      {banner.badge && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                          transition={{ duration: 0.45, delay: 0.1 }}
                          className="flex items-center gap-1.5 mb-2 md:mb-3"
                        >
                          <span className="text-[#D4AF37] text-sm md:text-base">🌿</span>
                          <span 
                            className="text-[9px] sm:text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#D4AF37] bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-md border border-[#D4AF37]/40 shadow-sm"
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                          >
                            {banner.badge}
                          </span>
                        </motion.div>
                      )}

                      {/* Main Heading (Fade in & Fade out with Motion Blur) */}
                      {(banner.heading || banner.title) && (
                        <motion.h2 
                          initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
                          transition={{ duration: 0.55, delay: 0.18, ease: "easeOut" }}
                          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[54px] mb-2 md:mb-3 font-serif font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                          style={{ 
                            lineHeight: 1.15, 
                            letterSpacing: '-0.5px'
                          }}
                          dangerouslySetInnerHTML={{ __html: banner.heading || banner.title }}
                        />
                      )}

                      {/* Subtitle */}
                      {(banner.subtitle || banner.description) && (
                        <motion.p 
                          initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                          transition={{ duration: 0.5, delay: 0.28, ease: "easeOut" }}
                          className="text-[10px] sm:text-xs md:text-sm lg:text-base mb-3 md:mb-5 leading-relaxed line-clamp-2 text-gray-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                          dangerouslySetInnerHTML={{ __html: banner.subtitle || banner.description }}
                        />
                      )}

                      {/* Button */}
                      {(banner.buttonText || banner.btnText) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.85, filter: 'blur(3px)' }}
                          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, scale: 0.85, filter: 'blur(3px)' }}
                          transition={{ duration: 0.45, delay: 0.36 }}
                        >
                          <a
                            href={banner.link || '#'}
                            className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#b59226] text-[#054425] hover:text-white text-[10px] sm:text-xs md:text-sm font-bold px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl border border-[#D4AF37]/50"
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                          >
                            {banner.buttonText || banner.btnText}
                            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </a>
                        </motion.div>
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
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/70 hover:bg-white text-[#054425] rounded-full flex items-center justify-center shadow-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/70 hover:bg-white text-[#054425] rounded-full flex items-center justify-center shadow-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20"
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

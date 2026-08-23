import React, { useState, useEffect, useRef } from 'react';
import { FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../../utils/api';
import ScrollHeading from '../shared/ScrollHeading';

const DEFAULT_TESTIMONIALS = [
  {
    _id: '1',
    name: 'Anjali Sharma',
    location: 'New Delhi',
    rating: 5,
    product: 'Pure Glow Kumkumadi Tailam',
    content: 'Sada Bharat Ayurvedic has completely transformed my skincare routine. The authenticity of the herbs is unmatched!',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  },
  {
    _id: '2',
    name: 'Dr. Rohan Mehta',
    location: 'Bangalore',
    rating: 5,
    product: 'Shilajit & Ashwagandha Resin',
    content: 'The potency and lab-certified purity of Sada Bharat products give me genuine daily energy and vitality.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
  },
  {
    _id: '3',
    name: 'Pooja Verma',
    location: 'Mumbai',
    rating: 5,
    product: 'Bhringraj Hair Growth Oil',
    content: 'Within 3 weeks, my hair fall reduced noticeably. The herbal aroma is soothing and completely chemical-free.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
  },
  {
    _id: '4',
    name: 'Vikram Joshi',
    location: 'Pune',
    rating: 5,
    product: 'Herbal Digestion Churna',
    content: 'Traditional Ayurvedic recipes prepared with utmost cleanliness and premium glass packaging. Highly recommended!',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
  },
  {
    _id: '5',
    name: 'Sneha Kapoor',
    location: 'Jaipur',
    rating: 5,
    product: 'Wild Forest Raw Honey',
    content: 'You can immediately taste the difference compared to commercial brands. It is thick, aromatic, and 100% pure.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
  },
  {
    _id: '6',
    name: 'Rajesh Nair',
    location: 'Kochi',
    rating: 5,
    product: 'Pain Relief Ayurvedic Oil',
    content: 'My joint stiffness relieved within days. Very effective classical preparation and fast delivery.',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80'
  },
  {
    _id: '7',
    name: 'Kavita Sundaram',
    location: 'Chennai',
    rating: 5,
    product: 'Triphala & Amla Detox Juice',
    content: 'Clean ingredients without artificial sweeteners or preservatives. Feel energized throughout the whole day!',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
  },
  {
    _id: '8',
    name: 'Manish Tiwari',
    location: 'Lucknow',
    rating: 5,
    product: 'Chyawanprash Awaleha',
    content: 'Takes me back to traditional homemade purity. Kids love it and immunity stays solid through seasons.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80'
  }
];

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollScrub, setScrollScrub] = useState(0);
  const containerRef = useRef(null);

  // Fetch API testimonials or fallback
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await api.get('/testimonials');
        const data = res.data?.data?.testimonials;
        if (data && data.length >= 4) {
          setTestimonials(data);
        }
      } catch (err) {
        // use fallback
      }
    };
    fetchTestimonials();
  }, []);

  const total = testimonials.length;
  const angleStep = (2 * Math.PI) / total;

  // Responsive radius so bigger avatars fit comfortably
  const [radius, setRadius] = useState(250);

  useEffect(() => {
    const updateDimensions = () => {
      if (window.innerWidth < 640) {
        setRadius(165);
      } else if (window.innerWidth < 1024) {
        setRadius(215);
      } else {
        setRadius(250);
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Autoplay rotation
  useEffect(() => {
    if (total <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 4500);
    return () => clearInterval(interval);
  }, [total]);

  // Fast & dynamic scroll scrub effect
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
      const clamped = Math.max(0, Math.min(1, progress));
      // Wider scrub angle (-65deg to +65deg) for fast, responsive movement on scroll
      setScrollScrub(65 - clamped * 130);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeItem = testimonials[activeIndex] || testimonials[0];

  // Wheel rotation calculation
  const activeRotationDeg = -(activeIndex * (360 / total));
  const totalWheelRotation = activeRotationDeg + scrollScrub;

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden py-8 md:py-10 flex flex-col items-center justify-center bg-gradient-to-b from-[#032415] via-[#054425] to-[#032012] text-white select-none"
    >
      {/* Background Subtle Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(212, 175, 55, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(212, 175, 55, 0.15) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, transparent 80%)'
        }}
      />

      {/* Center Golden Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full blur-[80px] opacity-20"
        style={{
          width: '360px',
          height: '360px',
          background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)'
        }}
      />

      {/* Compact Header */}
      <div className="relative z-10 text-center max-w-lg px-4 mb-2">
        <ScrollHeading as="div" className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 border border-[#D4AF37]/30 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-1.5 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_6px_#D4AF37]" />
          <span>Real Experiences · Real People</span>
        </ScrollHeading>
        <ScrollHeading as="h2" className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-white to-amber-200">
          What Our Customers Say
        </ScrollHeading>
        <ScrollHeading as="p" className="text-white/70 text-[11px] sm:text-xs mt-0.5 max-w-sm mx-auto leading-normal">
          Authentic feedback from families who trust Sada Bharat for holistic Ayurvedic wellness.
        </ScrollHeading>
      </div>

      {/* Compact Orbital Stage */}
      <div className="relative w-full max-w-3xl h-[370px] sm:h-[410px] md:h-[440px] flex items-center justify-center">
        
        {/* Rotating Avatar Wheel with fast, fluid transition */}
        <div
          className="absolute w-[340px] sm:w-[440px] md:w-[520px] h-[340px] sm:h-[440px] md:h-[520px] transition-transform duration-300 ease-out pointer-events-none"
          style={{
            transform: `rotate(${totalWheelRotation}deg)`
          }}
        >
          {testimonials.map((item, index) => {
            const angle = -Math.PI / 2 + index * angleStep;
            const stageCenter = window.innerWidth < 640 ? 170 : window.innerWidth < 1024 ? 220 : 260;
            const x = stageCenter + radius * Math.cos(angle);
            const y = stageCenter + radius * Math.sin(angle);
            const isActive = index === activeIndex;

            return (
              <button
                key={item._id || index}
                onClick={() => setActiveIndex(index)}
                aria-label={`View testimonial from ${item.name}`}
                className="absolute p-0 border-0 bg-transparent cursor-pointer outline-none transition-all duration-500 group pointer-events-auto"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: `translate(-50%, -50%) rotate(${-totalWheelRotation}deg) scale(${isActive ? 1.25 : 0.9})`,
                  zIndex: isActive ? 40 : 20
                }}
              >
                {/* Larger Customer Avatar with Enhanced Glow */}
                <div
                  className={`rounded-full overflow-hidden transition-all duration-500 bg-[#021d10] ${
                    isActive
                      ? 'w-[56px] h-[56px] sm:w-[68px] sm:h-[68px] md:w-[74px] md:h-[74px] border-[3.5px] border-[#D4AF37] shadow-[0_0_22px_rgba(212,175,55,0.95),0_0_45px_rgba(212,175,55,0.5)]'
                      : 'w-[44px] h-[44px] sm:w-[54px] sm:h-[54px] md:w-[58px] md:h-[58px] border-2 border-white/30 opacity-75 group-hover:opacity-100 group-hover:border-[#D4AF37]/80 group-hover:scale-105 shadow-md'
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        item.name
                      )}&background=054425&color=fff&size=80`;
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Center Testimonial Card - Compact (Zero Wasted Space) */}
        <div className="relative z-30 w-[84%] max-w-[310px] sm:max-w-[350px] md:max-w-[380px] px-4 py-4 sm:px-5 sm:py-5 text-center bg-[#042d19]/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.45)] transition-all duration-500">
          
          {/* Quote Icon */}
          <div className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 text-[#D4AF37] opacity-95">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>

          {/* Comment - Clean, snug font */}
          <p className="text-[12px] sm:text-[13px] md:text-[14px] font-serif italic text-amber-50 leading-relaxed mb-2 flex items-center justify-center line-clamp-3">
            "{activeItem.content}"
          </p>

          {/* Golden Divider */}
          <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mb-2" />

          {/* Star Rating */}
          <div className="flex justify-center items-center gap-1 mb-1 text-[#D4AF37]">
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar
                key={star}
                size={11}
                className={star <= (activeItem.rating || 5) ? 'fill-[#D4AF37]' : 'text-gray-500'}
              />
            ))}
          </div>

          {/* Author Details */}
          <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide leading-tight">
            {activeItem.name}
          </h4>
          <p className="text-[10px] sm:text-[11px] text-[#D4AF37] font-medium mt-0.5 leading-tight">
            {activeItem.location ? `${activeItem.location} • ` : ''}
            {activeItem.product || 'Verified Buyer'}
          </p>
        </div>

      </div>

      {/* Navigation Arrow Controls */}
      <div className="relative z-30 flex items-center justify-center gap-3">
        <button
          onClick={() => setActiveIndex((prev) => (prev - 1 + total) % total)}
          aria-label="Previous Testimonial"
          className="w-7 h-7 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-[#054425] transition-all duration-300 shadow-sm active:scale-95 text-xs"
        >
          <FiChevronLeft size={14} />
        </button>

        <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-[#D4AF37]">
          0{activeIndex + 1} / 0{total}
        </span>

        <button
          onClick={() => setActiveIndex((prev) => (prev + 1) % total)}
          aria-label="Next Testimonial"
          className="w-7 h-7 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-[#054425] transition-all duration-300 shadow-sm active:scale-95 text-xs"
        >
          <FiChevronRight size={14} />
        </button>
      </div>

      {/* Bottom Subtle Fade */}
      <div className="absolute bottom-0 left-0 w-full h-8 pointer-events-none bg-gradient-to-t from-white to-transparent opacity-50" />
    </section>
  );
};

export default Testimonials;

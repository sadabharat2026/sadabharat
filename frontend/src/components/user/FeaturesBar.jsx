import React from 'react';
import { motion } from 'framer-motion';
import { revealContainer, revealItem } from '../shared/ScrollReveal';

const FeaturesBar = () => {
  const features = [
    {
      id: 1,
      title: '100% Natural',
      subtitle: 'Pure & Safe Ingredients',
      icon: (
        <svg className="w-6 h-6 text-[#054425]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 15c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" />
        </svg>
      )
    },
    {
      id: 2,
      title: 'Free Delivery',
      subtitle: 'On Orders Above ₹499',
      icon: (
        <svg className="w-6 h-6 text-[#054425]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="3" width="15" height="13" rx="2" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      )
    },
    {
      id: 3,
      title: 'Easy Returns',
      subtitle: '7 Days Return Policy',
      icon: (
        <svg className="w-6 h-6 text-[#054425]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
        </svg>
      )
    },
    {
      id: 4,
      title: 'Secure Payment',
      subtitle: '100% Secure Payments',
      icon: (
        <svg className="w-6 h-6 text-[#054425]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )
    }
  ];

  return (
    <div className="bg-[#F4F8F5] border-t border-gray-100 py-4">
      <div className="w-full px-4 md:px-8">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 justify-items-center"
          variants={revealContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
        >
          {features.map((item) => (
            <motion.div
              key={item.id}
              variants={revealItem}
              whileHover={{ y: -3 }}
              className="flex items-center gap-2.5 w-fit text-left"
            >
              <div className="shrink-0 bg-white p-1.5 rounded-lg shadow-sm border border-gray-100">
                {item.icon}
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[11px] md:text-xs font-bold text-[#054425] uppercase tracking-wide"
                  style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {item.title}
                </span>
                <span className="text-[9px] md:text-[10px] text-gray-500 font-medium mt-0.5"
                  style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {item.subtitle}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturesBar;

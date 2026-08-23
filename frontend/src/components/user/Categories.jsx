import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import ProductCard from './ProductCard';
import { FiArrowRight, FiChevronDown } from 'react-icons/fi';
import { Leaf } from 'lucide-react';
import iconHairCare from '../../assets/images/icons/icon_hair_care_1779911677580.png';
import iconSkinCare from '../../assets/images/icons/icon_skin_care_1779911695841.png';
import iconHealthCare from '../../assets/images/icons/icon_health_care_1779911711916.png';
import iconHerbalTea from '../../assets/images/icons/icon_herbal_tea_1779911729080.png';
import iconSupplements from '../../assets/images/icons/icon_supplements_1779911746926.png';
import iconBodyCare from '../../assets/images/icons/icon_body_care_1779911767707.png';
import iconAromatherapy from '../../assets/images/icons/icon_aromatherapy_1779911786264.png';
import iconBabyCare from '../../assets/images/icons/icon_baby_care_1779911800390.png';

import ScrollHeading from '../shared/ScrollHeading';

const Categories = () => {
  const { categories, products, loading } = useShop();
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [isCategoriesVisible, setIsCategoriesVisible] = React.useState(false);
  
  // Custom Generated Icons for Sada Bharat Ayurvedic categories
  const getCategoryIcon = (name) => {
    const n = name?.toLowerCase() || '';
    let iconSrc = iconHairCare;
    
    if (n.includes('hair')) iconSrc = iconHairCare;
    else if (n.includes('skin')) iconSrc = iconSkinCare;
    else if (n.includes('health') || n.includes('well') || n.includes('immun')) iconSrc = iconHealthCare;
    else if (n.includes('tea') || n.includes('herbal')) iconSrc = iconHerbalTea;
    else if (n.includes('supplement') || n.includes('digest')) iconSrc = iconSupplements;
    else if (n.includes('body')) iconSrc = iconBodyCare;
    else if (n.includes('aroma')) iconSrc = iconAromatherapy;
    else if (n.includes('baby')) iconSrc = iconBabyCare;
    
    return <img src={iconSrc} alt={name} className="w-14 h-14 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px] object-cover rounded-full" />;
  };

  if (loading && categories.length === 0) {
    return (
      <div className="py-8 bg-white">
        <div className="container mx-auto px-4 flex justify-center gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="pt-3 md:pt-5 pb-4 bg-[#F2F6E8] overflow-hidden">
      <div className="w-full px-4 md:px-8">
        
        {/* Header Block matching mockup */}
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setIsCategoriesVisible(!isCategoriesVisible)}>
            <ScrollHeading as="h2" className="text-lg md:text-2xl font-serif font-black text-[#054425] tracking-tight leading-none">
              Shop by Category
            </ScrollHeading>
            <span className="text-[#054425] bg-[#054425]/10 w-6 h-6 md:w-7 md:h-7 rounded-full group-hover:bg-[#054425]/20 transition-colors flex items-center justify-center shrink-0 mt-1 md:mt-1.5">
              <FiChevronDown className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 ${isCategoriesVisible ? 'rotate-180' : ''}`} />
            </span>
          </div>

          <Link
            to="/shop"
            className="flex items-center gap-1.5 text-xs font-bold text-[#054425] hover:text-[#0d5c34] transition-colors tracking-tight uppercase"
          >
            <span>View All</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>

        {/* Category Circular Icons Slider */}
        <AnimatePresence>
          {isCategoriesVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div 
                className="flex justify-start w-full gap-6 md:gap-10 lg:gap-16 overflow-x-auto snap-x snap-mandatory pb-4 pt-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categories.map((cat, index) => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <div
                      key={cat._id || index}
                      onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                      className="flex flex-col items-center group cursor-pointer snap-start shrink-0"
                    >
                      <motion.div
                        initial={{ opacity: 0, rotateY: 90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.6, type: 'spring' }}
                        className="flex flex-col items-center"
                      >
                        <div 
                          className={`rounded-full flex items-center justify-center mb-2 transition-all duration-300 shadow-sm ${
                            isSelected ? 'scale-105 ring-2 ring-[#054425] ring-offset-2' : 'group-hover:scale-105 group-hover:shadow-md'
                          }`}
                        >
                          {cat.image ? (
                            <img src={cat.image} alt={cat.name} className="w-14 h-14 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px] object-cover rounded-full bg-white shadow-sm" />
                          ) : getCategoryIcon(cat.name)}
                        </div>
                        <h3 
                          className={`text-sm md:text-base font-bold transition-colors text-center tracking-tight max-w-[100px] ${
                            isSelected ? 'text-[#054425]' : 'text-[#054425] group-hover:text-[#0d5c34]'
                          }`}
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {cat.name}
                        </h3>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Tiered Products Section */}
        <AnimatePresence>
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-12 space-y-8 bg-[#F4F8F5] p-6 md:p-8 rounded-2xl border border-gray-100"
            >
              {[
                { title: "Pure Ayurvedic Essentials", subtitle: "(Recommended Items)", filter: (p) => p.price <= 500 }
              ].map((tier, tidx) => {
                const tierProducts = products
                  .filter(p => p.category === selectedCategory && tier.filter(p))
                  .slice(0, 5);

                if (tierProducts.length === 0) return (
                  <div key={tidx} className="text-center py-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No fallback products under this category</p>
                  </div>
                );

                return (
                  <div key={tidx} className="space-y-4">
                    <div className="flex items-end justify-between border-b border-gray-200/50 pb-2">
                      <div>
                        <h4 className="text-base md:text-xl font-serif font-black text-[#054425] leading-none mb-1">{tier.title}</h4>
                        <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">{tier.subtitle}</p>
                      </div>
                      <Link
                        to={`/shop?category=${encodeURIComponent(selectedCategory)}`}
                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#054425] hover:text-[#0d5c34] transition-colors"
                      >
                        Browse All <FiArrowRight />
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                      {tierProducts.map(product => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Categories;

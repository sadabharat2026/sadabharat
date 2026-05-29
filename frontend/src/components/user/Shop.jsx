import React, { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiChevronDown, FiGrid, FiList, FiCheck, FiFilter, FiX, FiStar } from 'react-icons/fi';

import { useSearchParams } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import ConsultationCTA from './ConsultationCTA';

const Shop = () => {
  const { products, categories: dynamicCategories, loading } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') || 'all';
  const urlSort = searchParams.get('sort') || 'New Arrivals';
  const urlSearch = searchParams.get('search') || '';

  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const [sortBy, setSortBy] = useState(urlSort);
  const [visibleCount, setVisibleCount] = useState(15);
  const [priceSegment, setPriceSegment] = useState('All');
  const [searchQuery, setSearchQuery] = useState(urlSearch);

  // Fallback subcategories if not provided by backend (can be enhanced)
  const subCategoriesMap = {
    'Skincare': ['Cleanser', 'Face Wash', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen'],
    'Soaps': ['Natural', 'Herbal', 'Handmade'],
    'Haircare': ['Hair Oil', 'Shampoo', 'Conditioner'],
    'Makeup': ['Foundation', 'Compact', 'Lipstick', 'Lip Balm', 'Eyes', 'Kajal'],
    'Artificial Jewellery': ['Traditional', 'Modern', 'Antique'],
    'Innerwear': ['Daily', 'Premium', 'Lace'],
    'Wellness': ['Supplements', 'Detox'],
    'Combos': ['Gifts', 'Festive'],
  };

  // Sync state with URL when it changes
  useEffect(() => {
    setActiveCategory(searchParams.get('category') || 'all');
    setSortBy(searchParams.get('sort') || 'New Arrivals');
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setActiveSubCategory(null);
    setSearchParams({ category: catId, sort: sortBy });
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setIsSortOpen(false);
    setSearchParams({ category: activeCategory, sort: newSort });
  };

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Advanced Filters State
  const [skinTypeFilter, setSkinTypeFilter] = useState('All');
  const [concernFilter, setConcernFilter] = useState('All');
  const [priceRange, setPriceRange] = useState(50000);

  const sortRef = useRef(null);
  const sortOptions = ['Top Rated', 'Price: Low to High', 'Price: High to Low', 'New Arrivals'];

  // Handle outside click for sorting
  useEffect(() => {
    const handleClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setIsSortOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const showOffersOnly = searchParams.get('offers') === 'true';
    if (showOffersOnly && !p.discount && !p.flashSale) return false;

    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSubCategory = !activeSubCategory || p.subCategory === activeSubCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subCategory?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkin = skinTypeFilter === 'All' || p.skinType === skinTypeFilter || p.skinType === 'All';
    const matchesConcern = concernFilter === 'All' || p.skinConcern === concernFilter || p.skinConcern === 'All';
    const matchesPrice = p.price <= priceRange;

    // Exact segments from user request
    const matchesPriceSegment = priceSegment === 'All' ||
      (priceSegment === 'Budget' && p.price < 500) || // Simplified to match broad ranges
      (priceSegment === 'Daily' && p.price >= 500 && p.price <= 1000) ||
      (priceSegment === 'Luxury' && p.price > 1000);

    return matchesCategory && matchesSubCategory && matchesSearch && matchesSkin && matchesConcern && matchesPrice && matchesPriceSegment;
  }).sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    if (sortBy === 'Top Rated') return b.rating - a.rating;
    return b._id > a._id ? -1 : 1;
  });

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans selection:bg-brand-pink selection:text-white pb-20">

      {/* MAIN CONTENT AREA: SIDEBAR + GRID */}
      <div className="w-full px-4 lg:px-8 pt-6 lg:pt-8 pb-8 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* MOBILE FILTER TOGGLE & SEARCH */}
        <div className="lg:hidden w-full flex flex-col gap-4 mb-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold uppercase tracking-widest text-[#054425]"
            >
              <FiFilter /> Filters
            </button>
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold uppercase tracking-widest text-[#054425]"
              >
                Sort by <FiChevronDown />
              </button>
              <AnimatePresence>
                {isSortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    {sortOptions.map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleSortChange(opt)}
                        className={`w-full text-left px-4 py-3 text-xs font-medium transition-colors ${sortBy === opt ? 'bg-[#054425]/5 text-[#054425] font-bold' : 'hover:bg-gray-50'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#054425] focus:ring-1 focus:ring-[#054425] outline-none"
            />
          </div>
        </div>

        {/* LEFT SIDEBAR FILTERS (Hidden on mobile unless toggled) */}
        <aside data-lenis-prevent="true" className={`${isFilterOpen ? 'block' : 'hidden'} lg:flex w-full lg:w-[260px] shrink-0 flex-col gap-6 bg-white lg:bg-transparent p-6 lg:p-0 rounded-2xl lg:rounded-none lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pr-2 mb-6 lg:mb-0 z-10`}>
          <div className="flex items-center justify-between lg:hidden mb-4">
            <h2 className="text-lg font-black text-[#054425]">Filters</h2>
            <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-gray-50 rounded-full"><FiX /></button>
          </div>

          <div className="hidden lg:flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
            <h2 className="text-lg font-black text-[#054425]">Filters</h2>
            <button 
              onClick={() => { setActiveCategory('all'); setPriceSegment('All'); setConcernFilter('All'); }}
              className="text-xs font-bold text-gray-400 hover:text-[#054425]"
            >
              Clear All
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex justify-between items-center">
              Category <FiChevronDown />
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="category" checked={activeCategory === 'all'} onChange={() => handleCategoryChange('all')} className="w-4 h-4 accent-[#054425]" />
                <span className={`text-sm ${activeCategory === 'all' ? 'text-[#054425] font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>All Products</span>
              </label>
              {dynamicCategories.map(cat => (
                <label key={cat.name} className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="category" checked={activeCategory === cat.name} onChange={() => handleCategoryChange(cat.name)} className="w-4 h-4 accent-[#054425]" />
                  <span className={`text-sm ${activeCategory === cat.name ? 'text-[#054425] font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex justify-between items-center">
              Price Range <FiChevronDown />
            </h3>
            <div className="space-y-2">
              {[
                { id: 'All', label: 'All Prices' },
                { id: 'Budget', label: '₹0 - ₹500' },
                { id: 'Daily', label: '₹500 - ₹1000' },
                { id: 'Luxury', label: '₹1000+' }
              ].map(s => (
                <label key={s.id} className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="price" checked={priceSegment === s.id} onChange={() => setPriceSegment(s.id)} className="w-4 h-4 accent-[#054425]" />
                  <span className={`text-sm ${priceSegment === s.id ? 'text-[#054425] font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating Filter (Visual) */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex justify-between items-center">
              Rating <FiChevronDown />
            </h3>
            <div className="space-y-2">
              {[4, 3, 2, 1].map(stars => (
                <label key={stars} className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="rating" className="w-4 h-4 accent-[#054425]" />
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    {stars} <FiStar className="fill-[#054425] text-[#054425] w-3 h-3" /> & above
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT: PRODUCT GRID */}
        <main className="flex-1 w-full">
          {/* Top Bar (Desktop) */}
          <div className="hidden lg:flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold text-gray-900">
                {filteredProducts.length} Results <span className="font-normal text-gray-500">{searchQuery ? `for "${searchQuery}"` : ''}</span>
              </h1>
              <div className="relative ml-4">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-full text-sm w-48 md:w-64 focus:border-[#054425] focus:ring-1 focus:ring-[#054425] outline-none transition-all shadow-sm"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <div className="relative">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-[#054425]"
                >
                  {sortBy} <FiChevronDown />
                </button>
                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      {sortOptions.map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleSortChange(opt)}
                          className={`w-full text-left px-4 py-3 text-xs font-medium transition-colors ${sortBy === opt ? 'bg-[#054425]/5 text-[#054425] font-bold' : 'hover:bg-gray-50'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.slice(0, visibleCount).map((product) => (
                <motion.div key={product._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredProducts.length === 0 && (
            <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 mt-4">
              <h3 className="text-xl font-serif font-black text-gray-400 mb-2 italic">"No matches found"</h3>
              <p className="text-xs text-gray-500 mb-6">Try adjusting your filters or search query.</p>
              <button
                onClick={() => { setSearchQuery(''); setSkinTypeFilter('All'); setConcernFilter('All'); setActiveCategory('all'); setPriceSegment('All'); }}
                className="px-8 py-3 bg-white border border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-widest rounded-full hover:bg-gray-50 shadow-sm transition-all"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      <ConsultationCTA />
    </div>
  );
};

export default Shop;

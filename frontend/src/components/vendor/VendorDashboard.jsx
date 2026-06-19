import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, ShoppingBag, ClipboardList, 
  User, Star, Eye, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import bannerImg1 from '../../assets/images/sadabharat_banner.png';
import bannerImg2 from '../../assets/images/sadabharat_banner1.png';
import api from '../../utils/api';

const StatCard = ({ title, value, trend, trendUp, date, icon: Icon, iconBg, iconColor, cardBg }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`${cardBg} p-1.5 xs:p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-sm border border-gray-100/50 flex flex-col justify-between h-full hover:shadow-md transition-shadow`}
    >
      <div className="flex justify-between items-start mb-1 sm:mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-gray-700 text-[9px] sm:text-[10px] md:text-[11px] font-bold font-sans mb-0.5 truncate">{title}</p>
          <h3 className="text-sm sm:text-base md:text-lg text-gray-800 font-semibold font-sans tracking-tight truncate">
            {value}
          </h3>
        </div>
        <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 ${iconBg} ${iconColor} ml-1`}>
          <Icon size={12} className="sm:w-4 sm:h-4" strokeWidth={2.5} />
        </div>
      </div>
      <div className="flex items-center gap-0.5 sm:gap-1 mt-auto flex-wrap sm:flex-nowrap">
        {trendUp ? (
          <TrendingUp size={11} className="text-green-700 shrink-0" strokeWidth={2.5} />
        ) : (
          <TrendingDown size={11} className="text-red-600 shrink-0" strokeWidth={2.5} />
        ) }
        <span className={`text-[10px] sm:text-[12px] font-black shrink-0 ${trendUp ? 'text-green-700' : 'text-red-600'}`}>
          {trend}
        </span>
        <span className="text-[8px] sm:text-[11px] text-gray-600 font-bold ml-0.5 shrink-0">vs {date}</span>
      </div>
    </motion.div>
  );
};

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('June 2026');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [vendorBanners, setVendorBanners] = useState([]);
  
  const [stats, setStats] = useState({
    totalSales: '₹0',
    totalOrders: 0,
    totalCustomers: 0,
    storeRating: '4.5',
    recentOrders: [],
    topProducts: [],
    commission: '₹0',
    payouts: '₹0',
    availableBalance: '₹0'
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vendors/dashboard-stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching vendor dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await api.get('/banners');
        if (data.success) {
          const vBanners = data.data.banners.filter(b => b.type === 'Vendor Dashboard');
          if (vBanners.length > 0) {
            setVendorBanners(vBanners);
          }
        }
      } catch (error) {
        console.error('Error fetching vendor banners:', error);
      }
    };
    fetchBanners();
  }, []);

  const staticBanners = [
    {
      image: bannerImg1,
      badge: "📈 Partner Spotlight",
      title: "Boost Sales By 45% with Prime Badge",
      desc: "Join our exclusive Prime Seller network and show up in top searches across India.",
      btn: "Upgrade Now",
      action: () => window.showVendorToast?.('Redirecting to partner benefits...', 'info')
    },
    {
      image: bannerImg2,
      badge: "🌿 Flat 5% Platform Fees",
      title: "Keep More Profits In Your Pocket",
      desc: "Special seasonal discount: Platform fee slashed to flat 5% for all Premium Ayurvedic Sellers.",
      btn: "Learn More",
      action: () => window.showVendorToast?.('Opening commission guide...', 'info')
    },
    {
      image: bannerImg1,
      badge: "🏆 Seller of the Month",
      title: "Herbal Essence Achieved Highest Growth!",
      desc: "Upgrade to premium today to unlock a dedicated home-page showcase feature next month.",
      btn: "Get Premium",
      action: () => window.showVendorToast?.('Opening Premium dashboard...', 'info')
    }
  ];

  const getBannerImage = (imgUrl, index) => {
    if (!imgUrl || imgUrl.includes('via.placeholder.com')) {
      return index % 2 === 0 ? bannerImg1 : bannerImg2;
    }
    if (imgUrl.startsWith('/') && !imgUrl.startsWith('/src')) {
      const backendUrl = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5000';
      return `${backendUrl}${imgUrl}`;
    }
    return imgUrl;
  };

  const displayBanners = vendorBanners.length > 0 
    ? vendorBanners.map((b, idx) => ({
        image: getBannerImage(b.image, idx),
        badge: b.badge || "Partner Spotlight",
        title: b.title || b.heading || "Special Offer",
        desc: b.description || "Exciting news for our vendors.",
        btn: b.btnText || "Learn More",
        action: () => window.showVendorToast?.(b.link ? `Redirecting to ${b.link}...` : `Action for: ${b.title}`, 'info')
      }))
    : staticBanners;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.max(1, displayBanners.length));
    }, 4500);
    return () => clearInterval(timer);
  }, [displayBanners.length]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#FAF7F8]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#054425]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 max-w-[1400px] mx-auto px-4 pt-1">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center relative z-20 gap-1.5 w-full px-0.5 py-1"
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-base sm:text-2xl font-serif font-black text-gray-900 leading-none truncate">Dashboard</h1>
          <p className="hidden sm:block text-[12px] text-gray-500 mt-1 font-sans">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="relative shrink-0">
          <button 
            onClick={() => setShowCalendar(!showCalendar)}
            className="bg-white border border-gray-200 text-gray-700 text-[10px] sm:text-[12px] font-bold px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg shadow-sm flex items-center gap-1 sm:gap-2 cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            <Calendar size={12} className="text-[#054425] shrink-0" />
            <span className="shrink-0 leading-none">{selectedMonth}</span>
            <svg className="w-2.5 h-2.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
          </button>
        </div>
      </motion.div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-1.5 sm:gap-3">
        <StatCard 
          title="Total Sales" 
          value={stats.totalSales} 
          trend={`${stats.salesTrend >= 0 ? '↑' : '↓'} ${Math.abs(stats.salesTrend || 0)}%`} 
          trendUp={stats.salesTrend >= 0} 
          date="last month"
          icon={ShoppingBag}
          iconBg="bg-green-200/60"
          iconColor="text-green-800"
          cardBg="bg-green-100"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          trend={`${stats.ordersTrend >= 0 ? '↑' : '↓'} ${Math.abs(stats.ordersTrend || 0)}%`} 
          trendUp={stats.ordersTrend >= 0} 
          date="last month"
          icon={ClipboardList}
          iconBg="bg-blue-200/60"
          iconColor="text-blue-800"
          cardBg="bg-blue-100"
        />
        <StatCard 
          title="Total Customers" 
          value={stats.totalCustomers} 
          trend={`${stats.customersTrend >= 0 ? '↑' : '↓'} ${Math.abs(stats.customersTrend || 0)}%`} 
          trendUp={stats.customersTrend >= 0} 
          date="last month"
          icon={User}
          iconBg="bg-purple-200/60"
          iconColor="text-purple-800"
          cardBg="bg-purple-100"
        />
        <StatCard 
          title="Store Rating" 
          value={stats.storeRating} 
          trend={`${stats.ratingTrend >= 0 ? '↑' : '↓'} ${Math.abs(stats.ratingTrend || 0)}`} 
          trendUp={stats.ratingTrend >= 0} 
          date="last month"
          icon={Star}
          iconBg="bg-orange-200/60"
          iconColor="text-orange-800"
          cardBg="bg-orange-100"
        />
      </div>

      {/* Compact Image-based Sliding Advertisement Banner */}
      <div className="relative w-full rounded-xl overflow-hidden shadow-sm h-[135px] sm:h-[185px] md:h-[220px] border border-green-100/70 group select-none">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/60 via-black/45 to-transparent pointer-events-none"></div>
        
        {/* Slides */}
        <AnimatePresence mode="wait">
          {displayBanners.map((slide, idx) => {
            if (idx !== currentSlide) return null;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 w-full h-full"
              >
                {/* Background Image */}
                <img 
                  src={slide.image} 
                  alt="Banner slide" 
                  className="w-full h-full object-cover object-center"
                />
                
                {/* Overlaid Content */}
                <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 sm:px-10 text-white max-w-[75%] md:max-w-[65%]">
                  <span className="inline-block bg-[#054425]/90 border border-green-300/30 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full w-fit mb-1.5 shadow-sm text-yellow-400 font-sans">
                    {slide.badge}
                  </span>
                  <h3 className="text-sm sm:text-base md:text-lg font-serif font-black tracking-wide leading-tight mb-1 text-white text-shadow-sm">
                    {slide.title}
                  </h3>
                  <p className="text-[10px] text-gray-200 leading-normal line-clamp-1 mb-2.5 font-sans">
                    {slide.desc}
                  </p>
                  <button 
                    onClick={slide.action}
                    className="bg-white hover:bg-gray-100 text-[#054425] text-[9px] font-black px-3.5 py-1.5 rounded-lg w-fit transition-all duration-300 hover:scale-105 active:scale-95 shadow-md font-sans"
                  >
                    {slide.btn}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Navigation Dot Indicators */}
        <div className="absolute bottom-2.5 right-4 z-20 flex gap-1.5 pointer-events-auto">
          {displayBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === i ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Middle Row: Charts, Order Status, Earnings */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2 sm:gap-3">
        
        {/* Sales Overview Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.1 }}
          className="xl:col-span-6 bg-white p-1.5 xs:p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col"
        >
          <div className="flex justify-between items-center mb-1.5 sm:mb-2">
            <h3 className="text-xs sm:text-[13px] font-bold font-sans text-gray-900">Sales Overview</h3>
            <select className="text-[9px] sm:text-[10px] bg-white border border-gray-200 rounded-md px-1.5 py-0.5 sm:px-2 sm:py-1 font-semibold text-gray-600 outline-none shadow-sm cursor-pointer">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex-1 relative min-h-[110px] sm:min-h-[140px] flex items-end pt-2">
             <svg viewBox="0 0 500 150" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#388E3C" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#388E3C" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                
                {(() => {
                  const pts = [90, 112, 56, 101, 71, 90, 45, 105, 15, 78, 41];
                  const dPath = `M0,${pts[0]} ` + pts.slice(1).map((y, i) => {
                    const x = (i + 1) * 50;
                    const prevX = i * 50;
                    const cX = prevX + 25;
                    return `S${cX},${y} ${x},${y}`;
                  }).join(' ');
 
                  return (
                    <>
                      <motion.path 
                        d={`${dPath} L500,150 L0,150 Z`}
                        fill="url(#chartGradient2)" 
                        initial={{ opacity: 0 }}
                        animate={{ d: `${dPath} L500,150 L0,150 Z`, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                      />
                      <motion.path 
                        d={dPath}
                        fill="none" 
                        stroke="#388E3C" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        initial={{ pathLength: 0 }}
                        animate={{ d: dPath, pathLength: 1 }}
                        transition={{ duration: 0.8, ease: "linear" }}
                      />
                    </>
                  );
                })()}
                
                {[
                  {x: 0, y: 90, val: "₹16,000"}, {x: 50, y: 112, val: "₹10,000"}, {x: 100, y: 56, val: "₹25,000"}, 
                  {x: 150, y: 101, val: "₹13,000"}, {x: 200, y: 71, val: "₹21,000"}, {x: 250, y: 90, val: "₹16,000"}, 
                  {x: 300, y: 45, val: "₹28,000"}, {x: 350, y: 105, val: "₹12,000"}, {x: 400, y: 15, val: "₹36,000"},
                  {x: 450, y: 78, val: "₹19,000"}, {x: 500, y: 41, val: "₹29,000"}
                ].map((point, index) => (
                  <motion.circle 
                    key={index}
                    cx={point.x} cy={point.y} r="4" 
                    fill="white" stroke="#388E3C" strokeWidth="2.5" 
                    className="cursor-pointer hover:stroke-[4px] hover:r-5 transition-all"
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1 + (index * 0.1), type: "spring" }}
                  >
                    <title>{point.val} on May {index * 3 + 1}</title>
                  </motion.circle>
                ))}
             </svg>
             <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[8px] sm:text-[9px] text-gray-400 pb-5 font-semibold">
                <span>₹40K</span>
                <span>₹30K</span>
                <span>₹20K</span>
                <span>₹10K</span>
                <span>₹0</span>
             </div>
             <div className="absolute bottom-0 left-10 right-0 flex justify-between text-[8px] sm:text-[10px] text-gray-400 font-semibold">
                <span>June 1</span>
                <span>June 7</span>
                <span>June 13</span>
                <span>June 19</span>
                <span>June 25</span>
                <span>June 31</span>
             </div>
          </div>
        </motion.div>
 
        {/* Order Status Donut */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.2 }}
          className="xl:col-span-3 bg-white p-1.5 xs:p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col relative"
        >
          <h3 className="text-xs sm:text-[13px] font-bold font-sans text-gray-900 mb-1.5 sm:mb-2">Order Status</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
             <div className="relative w-20 h-20 sm:w-28 sm:h-28 mb-2 sm:mb-3">
                <svg viewBox="0 0 36 36" className="w-full h-full circular-chart">
                  <motion.path 
                    className="text-[#388E3C] stroke-current cursor-pointer hover:stroke-[#2E7D32] transition-colors" strokeWidth="4.5" fill="none" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    initial={{ strokeDasharray: "0, 100" }}
                    whileInView={{ strokeDasharray: "65, 100" }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                  <motion.path 
                    className="text-[#FBC02D] stroke-current cursor-pointer hover:stroke-[#F9A825] transition-colors" strokeWidth="4.5" strokeDashoffset="-65" fill="none" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    initial={{ strokeDasharray: "0, 100" }}
                    whileInView={{ strokeDasharray: "18, 100" }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                  />
                  <motion.path 
                    className="text-[#1B5E20] stroke-current cursor-pointer hover:stroke-[#154618] transition-colors" strokeWidth="4.5" strokeDashoffset="-83" fill="none" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    initial={{ strokeDasharray: "0, 100" }}
                    whileInView={{ strokeDasharray: "11, 100" }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                  />
               </svg>
               <motion.div 
                 className="absolute inset-0 flex flex-col items-center justify-center"
                 initial={{ opacity: 0, scale: 0.8 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 0.8, duration: 0.4 }}
               >
                  <span className="text-sm sm:text-xl font-bold font-sans text-gray-800 leading-none">{stats.totalOrders}</span>
                  <span className="text-[7px] sm:text-[9px] text-gray-500 font-bold mt-0.5 whitespace-nowrap">Total Orders</span>
               </motion.div>
             </div>
             
             <div className="w-full grid grid-cols-2 gap-y-1 sm:gap-y-2 gap-x-1.5 text-[8px] sm:text-[10px]">
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#388E3C] shrink-0"></div><span className="text-gray-600 font-semibold flex-1 truncate">Delivered</span><span className="text-gray-800 font-bold">{Math.round(stats.totalOrders * 0.7)}</span></div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#FBC02D] shrink-0"></div><span className="text-gray-600 font-semibold flex-1 truncate">Processing</span><span className="text-gray-800 font-bold">{Math.round(stats.totalOrders * 0.2)}</span></div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#1B5E20] shrink-0"></div><span className="text-gray-600 font-semibold flex-1 truncate">Shipped</span><span className="text-gray-800 font-bold">{Math.round(stats.totalOrders * 0.1)}</span></div>
             </div>
          </div>
        </motion.div>
 
        {/* Earnings Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.3 }}
          className="xl:col-span-3 bg-white p-1.5 xs:p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between relative"
        >
          <div>
            <div className="flex justify-between items-center mb-1.5 sm:mb-2">
              <h3 className="text-xs sm:text-[13px] font-bold font-sans text-gray-900">Earnings</h3>
            </div>
            
            <div className="space-y-1.5 sm:space-y-2.5 text-[9px] sm:text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-semibold">Total Sales</span>
                <span className="text-gray-800 font-medium">{stats.totalSales}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-semibold">Commission</span>
                <span className="text-gray-800 font-medium">{stats.commission}</span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-gray-600 font-semibold">Payouts</span>
                <span className="text-gray-800 font-medium">{stats.payouts}</span>
              </div>
            </div>
          </div>
 
          <div className="mt-2 bg-[#F6FBF7] rounded-lg sm:rounded-xl p-2 sm:p-3 border border-green-100/50 flex flex-col gap-1 sm:gap-1.5">
            <div>
              <p className="text-[8px] sm:text-[10px] text-gray-600 font-medium">Available Balance</p>
              <p className="text-xs sm:text-[15px] font-bold text-[#054425]">{stats.availableBalance}</p>
            </div>
            <button 
              onClick={() => navigate('/vendor/payouts')}
              className="w-full bg-[#054425] hover:bg-[#04331c] text-white text-[9px] sm:text-[10px] font-bold py-1.5 rounded-lg shadow-sm transition-colors active:scale-95"
            >
              Request Payout
            </button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* Recent Orders */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.1 }}
          className="lg:col-span-8 bg-white p-3 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[13px] font-bold font-sans text-gray-900">Recent Orders</h3>
            <button onClick={() => navigate('/vendor/orders')} className="text-[10px] font-medium text-[#054425] hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="text-[11px] text-gray-500 font-semibold border-b border-gray-100">
                  <th className="pb-2">Order ID</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-[11px] text-gray-800 font-sans font-medium">
                {stats.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2 font-medium text-gray-800">{order.id}</td>
                      <td className="py-2 font-medium">{order.customer}</td>
                      <td className="py-2 text-gray-500 font-medium">{order.date}</td>
                      <td className="py-2 font-medium">{order.amount}</td>
                      <td className="py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${order.color}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2 text-center">
                        <button onClick={() => navigate('/vendor/orders')} className="text-gray-400 hover:text-[#054425] transition-colors"><Eye size={14} /></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-400">No recent orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Top Selling Products */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.2 }}
          className="lg:col-span-4 bg-white p-3 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[13px] font-bold font-sans text-gray-900">Top Selling Products</h3>
            <button onClick={() => navigate('/vendor/products')} className="text-[10px] font-medium text-[#054425] hover:underline">View All</button>
          </div>
          <div className="space-y-2.5 pt-1">
            {stats.topProducts && stats.topProducts.length > 0 ? (
              stats.topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-[#F6FBF7] rounded-lg flex items-center justify-center p-1 border border-green-50">
                    <img src="https://cdn-icons-png.flaticon.com/512/1892/1892695.png" alt={p.name} className="max-w-full max-h-full mix-blend-multiply opacity-95" style={{ filter: 'hue-rotate(60deg) brightness(0.8)' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] font-medium text-gray-800 leading-tight mb-0.5 truncate max-w-[150px]">{p.name}</p>
                    <p className="text-[11px] text-gray-500 font-medium">{p.units}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-gray-800 font-medium">{p.sales}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-400 text-xs">No sales data recorded yet</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VendorDashboard;

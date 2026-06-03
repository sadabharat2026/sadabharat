import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Package, PlusCircle, Archive, 
  ShoppingCart, RotateCcw, IndianRupee, CreditCard, 
  Tag, Star, Bell, TrendingUp, HelpCircle, Settings,
  Search, MessageSquare, Menu, X, LogOut
} from 'lucide-react';
import vendorLogo from '../../assets/images/WhatsApp Image 2026-05-26 at 1.34.49 PM.jpeg';

const VendorLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  const handleSignOut = () => {
    localStorage.removeItem('vendor_auth');
    if (window.showVendorToast) {
      window.showVendorToast('Logged out successfully!', 'success');
    }
    navigate('/vendor/login');
  };
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  const notificationRef = useRef(null);
  const messageRef = useRef(null);
  const sidebarRef = useRef(null);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    window.showVendorToast = (message, type = 'success') => {
      setToast({ message, type });
      setTimeout(() => {
        setToast(null);
      }, 3000);
    };

    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (messageRef.current && !messageRef.current.contains(event.target)) {
        setShowMessages(false);
      }
      // Close sidebar if clicking outside of it on mobile
      if (window.innerWidth < 1024 && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        const isHamburgerClick = event.target.closest('header button') || event.target.closest('header svg');
        if (!isHamburgerClick) {
          setSidebarOpen(false);
        }
      }
    };

    let prevWidth = window.innerWidth;
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (prevWidth >= 1024 && currentWidth < 1024) {
        setSidebarOpen(false);
      } else if (prevWidth < 1024 && currentWidth >= 1024) {
        setSidebarOpen(true);
      }
      prevWidth = currentWidth;
    };

    document.addEventListener('click', handleClickOutside);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      window.showVendorToast = null;
    };
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/vendor', icon: LayoutDashboard },
    { name: 'Products', path: '/vendor/products', icon: Package },
    { name: 'Add Product', path: '/vendor/add-product', icon: PlusCircle },
    { name: 'Inventory', path: '/vendor/inventory', icon: Archive },
    { name: 'Orders', path: '/vendor/orders', icon: ShoppingCart },
    { name: 'Returns', path: '/vendor/returns', icon: RotateCcw },
    { name: 'Earnings', path: '/vendor/earnings', icon: IndianRupee },
    { name: 'Payouts', path: '/vendor/payouts', icon: CreditCard },
    { name: 'Coupons', path: '/vendor/coupons', icon: Tag },
    { name: 'Reviews', path: '/vendor/reviews', icon: Star },
    { name: 'Notifications', path: '/vendor/notifications', icon: Bell, badge: 3 },
    { name: 'Analytics', path: '/vendor/analytics', icon: TrendingUp },
    { name: 'Support', path: '/vendor/support', icon: HelpCircle },
    { name: 'Settings', path: '/vendor/settings', icon: Settings },
  ];

  return (
    <div className="h-screen flex bg-[#FDFBF7] font-vendor-panel font-poppins">
      {/* Fixed Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-50 bg-[#054425] text-white flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:translate-x-0 lg:w-[72px]'
        } lg:relative`}
      >
        <div className={`h-14 flex items-center border-b border-white/10 shrink-0 ${
          sidebarOpen ? 'justify-between px-4' : 'justify-center px-0'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shrink-0">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain rounded-full" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/40"; }} />
            </div>
            <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${sidebarOpen ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0 hidden'}`}>
              <h1 className="font-normal text-lg tracking-wide leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>SADA BHARAT</h1>
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/70">Ayurvedic</p>
            </div>
          </div>
          <button className={`lg:hidden text-white/70 hover:text-white ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>
        
        <div 
          className="flex-1 overflow-y-auto scrollbar-hide pb-6"
          onWheel={(e) => e.stopPropagation()}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="w-full py-3 px-3 space-y-0.5 mt-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/vendor'}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-white/10 text-white font-medium shadow-[0_4px_12px_rgba(0,0,0,0.1)] backdrop-blur-sm' 
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  } ${!sidebarOpen ? 'justify-center px-0' : 'justify-between'}`
                }
                title={!sidebarOpen ? item.name : ""}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className="shrink-0" />
                  <span className={`text-[13px] font-medium font-poppins transition-all duration-300 whitespace-nowrap overflow-hidden ${
                    sidebarOpen ? 'opacity-100 max-w-full block' : 'opacity-0 max-w-0 hidden'
                  }`}>
                    {item.name}
                  </span>
                </div>
                {item.badge && sidebarOpen && (
                  <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none shrink-0">
                    {item.badge}
                  </span>
                )}
                {item.badge && !sidebarOpen && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </NavLink>
            ))}
            
            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className={`w-full flex items-center px-4 py-2.5 mt-2 rounded-lg transition-all duration-200 text-white/70 hover:bg-white/5 hover:text-white ${
                !sidebarOpen ? 'justify-center px-0' : 'justify-between'
              }`}
              title={!sidebarOpen ? "Sign Out" : ""}
            >
              <div className="flex items-center gap-3">
                <LogOut size={18} className="shrink-0 text-red-400" />
                <span className={`text-[13px] font-medium font-poppins transition-all duration-300 whitespace-nowrap overflow-hidden ${
                  sidebarOpen ? 'opacity-100 max-w-full block' : 'opacity-0 max-w-0 hidden'
                }`}>
                  Sign Out
                </span>
              </div>
            </button>
          </div>

          {/* Bottom Card */}
          <div className={`px-4 pb-4 pt-2 transition-all overflow-hidden ${sidebarOpen ? 'opacity-100 max-h-48' : 'opacity-0 max-h-0 p-0'}`}>
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-3.5 text-center backdrop-blur-md relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-brand-gold/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
               <h4 className="text-[13px] font-bold text-white mb-1">Grow Your Business</h4>
               <p className="text-[11px] text-white/70 mb-3 leading-relaxed">Increase your visibility and boost sales with Sada Bharat.</p>
               <button onClick={() => window.showVendorToast?.("Opening growth portal...", "success")} className="w-full bg-white text-[#054425] text-[11px] font-bold py-1.5 rounded-lg hover:bg-gray-100 transition-colors shadow-sm">
                 Learn More
               </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className="flex-1 overflow-y-auto overflow-x-hidden h-screen bg-[#FDFBF7] overscroll-contain touch-pan-y"
        onWheel={(e) => e.stopPropagation()}
        style={{ backgroundColor: '#FDFBF7', WebkitOverflowScrolling: 'touch' }} 
      >
        {/* Sticky Header */}
        <header className="sticky top-0 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-40 shadow-sm shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button className="text-gray-500 hover:text-gray-900 shrink-0" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={24} />
            </button>
            <h2 className="block text-[13px] sm:text-[15px] font-serif font-black text-black shrink-0 tracking-wide uppercase">Vendor Panel</h2>
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search products, orders..." 
                  className="w-full pl-8 pr-4 py-1.5 bg-white border border-gray-200 rounded-full text-[12px] focus:outline-none focus:ring-1 focus:ring-[#054425]/50 focus:border-[#054425] transition-all font-sans font-medium text-gray-800 shadow-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Mobile Search */}
            <button 
              onClick={() => window.showVendorToast?.('Search overlay coming soon...', 'info')} 
              className="block md:hidden text-gray-500 hover:text-[#054425] transition-colors"
            >
              <Search size={20} />
            </button>

            {/* Notifications */}
            <div ref={notificationRef} className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowMessages(false); }} 
                className="relative text-gray-500 hover:text-[#054425] transition-colors"
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full text-[7px] font-bold text-white flex items-center justify-center">3</span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-[12px] font-bold text-gray-900">Notifications</h3>
                    <button className="text-[10px] text-[#054425] font-semibold hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {[
                      { title: 'New Order Received', time: '5 mins ago', desc: 'Order #SB12345678 from Rohit Sharma' },
                      { title: 'Low Stock Alert', time: '1 hour ago', desc: 'NEEM TULSI Face Wash is running low (12 units left).' },
                      { title: 'Payment Successful', time: '2 hours ago', desc: 'Payout of ₹1,06,000 has been processed.' }
                    ].map((n, i) => (
                      <div key={i} className="p-3 border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors last:border-0">
                        <p className="text-[11px] font-bold text-gray-800">{n.title}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{n.desc}</p>
                        <p className="text-[9px] text-gray-400 mt-1 font-medium">{n.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 text-center border-t border-gray-100 bg-gray-50/50">
                     <button className="text-[11px] font-bold text-[#054425] hover:underline">View All Notifications</button>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div ref={messageRef} className="relative hidden sm:block">
              <button 
                onClick={() => { setShowMessages(!showMessages); setShowNotifications(false); }} 
                className="relative text-gray-500 hover:text-[#054425] transition-colors"
              >
                <MessageSquare size={20} />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full text-[7px] font-bold text-white flex items-center justify-center">2</span>
              </button>
              {showMessages && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-[12px] font-bold text-gray-900">Recent Messages</h3>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {[
                      { name: 'Support Team', time: '10:30 AM', msg: 'Your issue #1029 has been resolved.' },
                      { name: 'Rohit Sharma', time: 'Yesterday', msg: 'Can I change my delivery address?' }
                    ].map((m, i) => (
                      <div key={i} className="p-3 border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors last:border-0 flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <span className="text-[#054425] font-bold text-[10px]">{m.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="flex justify-between items-baseline gap-2">
                            <p className="text-[11px] font-bold text-gray-800">{m.name}</p>
                            <p className="text-[9px] text-gray-400 font-medium shrink-0">{m.time}</p>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-tight line-clamp-1">{m.msg}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 text-center border-t border-gray-100 bg-gray-50/50">
                     <button className="text-[11px] font-bold text-[#054425] hover:underline">Open Inbox</button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/vendor/settings')}>
              <div className="text-right hidden sm:block">
                <p className="text-[12px] font-bold text-gray-900 font-sans leading-tight">Herbal Essence</p>
                <p className="text-[10px] font-medium text-gray-500 font-poppins">Vendor</p>
              </div>
              <img src="https://ui-avatars.com/api/?name=Herbal+Essence&background=054425&color=fff" alt="Vendor" className="w-8 h-8 rounded-full border border-gray-100 shadow-sm" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-5 lg:p-6">
          <Outlet />
        </div>
      </main>

      {/* Premium Toast Container */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.08)] flex items-center gap-2.5 min-w-[280px] border backdrop-blur-md ${
              toast.type === 'success' 
                ? 'bg-emerald-50/95 text-emerald-800 border-emerald-100/80 shadow-emerald-100/20' 
                : toast.type === 'warning'
                ? 'bg-rose-50/95 text-rose-800 border-rose-100/80 shadow-rose-100/20'
                : 'bg-amber-50/95 text-amber-800 border-amber-100/80 shadow-amber-100/20'
            }`}
          >
            <span className="text-sm shrink-0">
              {toast.type === 'success' ? '🌿' : toast.type === 'warning' ? '⚠️' : '⚡'}
            </span>
            <span className="text-[12px] font-bold font-sans tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VendorLayout;

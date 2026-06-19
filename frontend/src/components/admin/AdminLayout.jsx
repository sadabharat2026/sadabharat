import React, { useState } from 'react';
import { Link, useLocation, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import {
  FiGrid,
  FiShoppingBag,
  FiUsers,
  FiLayers,
  FiImage,
  FiSettings,
  FiLogOut,
  FiBell,
  FiSearch,
  FiTrendingUp,
  FiMenu,
  FiX,
  FiChevronDown,
  FiRotateCcw,
  FiRefreshCw,
  FiBox,
  FiTag,
  FiDollarSign,
  FiUser,
  FiMessageSquare,
  FiHelpCircle,
  FiTruck,
  FiMapPin,
  FiZap,
  FiShield
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';


const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading, logout, user } = useShop();

  React.useEffect(() => {
    // Close sidebar automatically when navigating on mobile
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location]);

  const [openMenus, setOpenMenus] = useState({ Vendors: true });

  const toggleMenu = (title) => {
    setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAdminNotifications = async () => {
    try {
      const { default: api } = await import('../../utils/api');
      const res = await api.get('/notifications/me');
      if (res.data?.success) {
        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.notifications.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error('Failed to fetch admin notifications', err);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchAdminNotifications();
      const intervalId = setInterval(fetchAdminNotifications, 60000); // poll every minute
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated]);

  const handleMarkAllReadHeader = async () => {
    try {
      const { default: api } = await import('../../utils/api');
      await api.patch('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) { /* silently fail */ }
  };

  // Route protection
  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF7F8]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C2E3E]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const removeNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
    if (notifications.length <= 1) setIsNotificationsOpen(false);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm('Securely terminating admin session. Proceed to exit?')) {
      logout();
      navigate('/admin/login');
    }
  };

  const menuItems = [
    { title: 'Overview', path: '/admin', icon: <FiBox /> },
    { title: 'Categories', path: '/admin/categories', icon: <FiLayers /> },
    { title: 'Products', path: '/admin/products', icon: <FiShoppingBag /> },
    { title: 'Inventory', path: '/admin/inventory', icon: <FiBox /> },
    { 
      title: 'Vendors', 
      icon: <FiUsers />,
      subItems: [
        { title: 'Existing Vendors', path: '/admin/vendors' },
        { title: 'New Joining Requests', path: '/admin/vendors/pending' },
        { title: 'Blocked Vendors', path: '/admin/vendors/blocked' },
        { title: 'Vendor Chats', path: '/admin/vendor-chats' }
      ]
    },
    { 
      title: 'Customers', 
      icon: <FiUsers />,
      subItems: [
        { title: 'Active Customers', path: '/admin/customers' },
        { title: 'Blocked Customers', path: '/admin/customers/blocked' }
      ]
    },
    { title: 'Orders', path: '/admin/orders', icon: <FiShoppingBag /> },
    { title: 'Logistics & Taxes', path: '/admin/logistics', icon: <FiTruck /> },
    { title: 'Service Locations', path: '/admin/locations', icon: <FiMapPin /> },
    { 
      title: 'Finance & Payouts', 
      icon: <FiDollarSign />,
      subItems: [
        { title: 'Store Finance', path: '/admin/finance' },
        { title: 'Vendor Payouts', path: '/admin/payouts' }
      ]
    },
    { title: 'Returns & Replace', path: '/admin/returns', icon: <FiRotateCcw /> },
    { title: 'Coupons', path: '/admin/coupons', icon: <FiTag /> },
    { title: 'Divine Offers', path: '/admin/offers', icon: <FiZap /> },
    { title: 'Banners', path: '/admin/banners', icon: <FiImage /> },
    { title: 'Blogs', path: '/admin/blogs', icon: <FiLayers /> },
    { title: 'Feedback Ledger', path: '/admin/reviews', icon: <FiMessageSquare /> },
    { title: 'Notifications', path: '/admin/notifications', icon: <FiBell /> },
    { title: 'Support Chats', path: '/admin/support', icon: <FiMessageSquare /> },
    { title: 'Legal & Policies', path: '/admin/policies', icon: <FiShield /> },
    { title: 'Settings', path: '/admin/settings', icon: <FiSettings /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#FDFBF7] font-poppins overflow-x-hidden">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Persistent Mini Mode or Full Mode */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 256 : 64 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-admin-dark text-white flex flex-col fixed h-screen z-50 shadow-2xl overflow-hidden border-r border-white/5"
      >
        <div className={`h-14 flex items-center border-b border-white/10 shrink-0 mt-2 ${
          !isSidebarOpen ? 'justify-center px-0' : 'justify-between px-4'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shrink-0">
              <img src="/logo.png" alt="Sada Bharat Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isSidebarOpen ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0 hidden'}`}>
              <h1 className="font-normal text-lg tracking-wide leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>SADA BHARAT</h1>
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/70">Ayurvedic</p>
            </div>
          </div>
        </div>

        <nav
          className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto custom-sidebar-scrollbar"
          data-lenis-prevent
        >
          {menuItems.map((item) => (
            <React.Fragment key={item.title}>
              {item.subItems ? (
                <div>
                  <button
                    onClick={() => {
                      if (!isSidebarOpen) setIsSidebarOpen(true);
                      toggleMenu(item.title);
                    }}
                    title={!isSidebarOpen ? item.title : ''}
                    className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 text-white/70 hover:bg-white/5 hover:text-white ${!isSidebarOpen ? 'justify-center px-0' : 'justify-between'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`shrink-0 transition-all duration-300 ${location.pathname.startsWith(item.subItems[0].path) ? 'text-white' : ''}`}>
                        {React.cloneElement(item.icon, { size: 18 })}
                      </div>
                      <span className={`text-[13px] font-medium font-poppins transition-all duration-300 whitespace-nowrap overflow-hidden ${
                        isSidebarOpen ? 'opacity-100 max-w-full block' : 'opacity-0 max-w-0 hidden'
                      }`}>
                        {item.title}
                      </span>
                    </div>
                    {isSidebarOpen && (
                      <FiChevronDown size={14} className={`transition-transform duration-300 ${openMenus[item.title] ? 'rotate-180 text-white' : ''}`} />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {isSidebarOpen && openMenus[item.title] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-9 mt-1 space-y-1 relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                          {item.subItems.map(sub => (
                            <Link
                              key={sub.title}
                              to={sub.path}
                              className={`block px-4 py-1.5 text-[11px] font-medium font-poppins rounded-lg transition-all duration-200 relative ${
                                location.pathname === sub.path
                                  ? 'text-white bg-white/5 before:absolute before:left-[-1px] before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[3px] before:rounded-full before:bg-admin-gold'
                                  : 'text-white/50 hover:text-white/90 hover:bg-white/5'
                              }`}
                            >
                              {sub.title}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to={item.path}
                  title={!isSidebarOpen ? item.title : ''}
                  className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${location.pathname === item.path
                    ? 'bg-white/10 text-white font-medium shadow-[0_4px_12px_rgba(0,0,0,0.1)] backdrop-blur-sm'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                    } ${!isSidebarOpen ? 'justify-center px-0' : 'justify-between'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`shrink-0 transition-all duration-300 ${location.pathname === item.path ? 'text-white' : ''}`}>
                      {React.cloneElement(item.icon, { size: 18 })}
                    </div>

                    <span className={`text-[13px] font-medium font-poppins transition-all duration-300 whitespace-nowrap overflow-hidden ${
                      isSidebarOpen ? 'opacity-100 max-w-full block' : 'opacity-0 max-w-0 hidden'
                    }`}>
                      {item.title}
                    </span>
                  </div>

                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute left-0 w-1 bg-admin-gold h-4 top-1/2 -translate-y-1/2 rounded-r-full"
                    />
                  )}
                </Link>
              )}
            </React.Fragment>
          ))}
          <div className="h-20 w-full flex-shrink-0" />
        </nav>

        <div className="p-4 border-t border-white/5 flex-shrink-0">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-4 py-2.5 mt-2 rounded-lg transition-all duration-200 text-white/70 hover:bg-white/5 hover:text-white ${
              !isSidebarOpen ? 'justify-center px-0' : 'justify-between'
            }`}
            title={!isSidebarOpen ? "Logout" : ""}
          >
            <div className="flex items-center gap-3">
              <FiLogOut size={18} className={`shrink-0 text-red-400 ${isSidebarOpen ? 'rotate-180' : ''}`} />
              <span className={`text-[13px] font-medium font-poppins transition-all duration-300 whitespace-nowrap overflow-hidden ${
                isSidebarOpen ? 'opacity-100 max-w-full block' : 'opacity-0 max-w-0 hidden'
              }`}>
                Logout
              </span>
            </div>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Header - Premium Navigation */}
        <header className="sticky top-0 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-40 shadow-sm shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button className="text-gray-500 hover:text-gray-900 shrink-0" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <FiMenu size={24} />
            </button>
            <h2 className="block text-[13px] sm:text-[15px] font-['Cormorant',_serif] font-black text-black shrink-0 tracking-widest uppercase">ADMIN PANEL</h2>
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="relative w-full max-w-md">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search products, orders..." 
                  className="w-full pl-8 pr-4 py-1.5 bg-white border border-gray-200 rounded-full text-[12px] focus:outline-none focus:ring-1 focus:ring-admin-dark/50 focus:border-admin-dark transition-all font-sans font-medium text-gray-800 shadow-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Mobile Search */}
            <button className="block md:hidden text-gray-500 hover:text-admin-dark transition-colors">
              <FiSearch size={20} />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                className="relative text-gray-500 hover:text-admin-dark transition-colors"
              >
                <FiBell size={20} className="text-[#5C2E3E]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full text-[7px] font-bold text-white flex items-center justify-center">{unreadCount}</span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                      <h3 className="font-bold text-gray-900 font-serif">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllReadHeader}
                          className="text-xs text-[#054425] font-semibold hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
                      ) : (
                        notifications.map(notification => (
                          <div key={notification._id || notification.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 flex items-start gap-3 transition-colors ${!notification.isRead ? 'bg-[#FAF7F8]' : ''}`}>
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                              <FiMessageSquare className="text-blue-600" size={14} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900 font-semibold">{notification.title || 'Notification'}</p>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <Link 
                      to="/admin/notifications"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="block w-full text-center py-2 text-xs font-bold text-[#5C2E3E] bg-gray-50 hover:bg-gray-100 rounded-b-xl"
                    >
                      View All Notifications
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Messages */}
            <div className="relative hidden sm:block">
              <button className="relative text-gray-500 hover:text-admin-dark transition-colors">
                <FiMessageSquare size={20} />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full text-[7px] font-bold text-white flex items-center justify-center">2</span>
              </button>
            </div>

            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
            
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 cursor-pointer outline-none"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-[12px] font-bold text-gray-900 font-sans leading-tight">{user?.name || 'Admin User'}</p>
                  <p className="text-[10px] font-medium text-gray-500 font-poppins">{user?.role || 'Super Admin'}</p>
                </div>
                <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin+User'}&background=054425&color=fff`} alt="Admin" className="w-8 h-8 rounded-full border border-gray-100 shadow-sm" />
                <FiChevronDown size={14} className={`text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50 py-2"
                  >
                    <div className="px-4 py-3 border-b border-gray-50 mb-2">
                      <p className="text-sm font-bold text-gray-900 leading-tight truncate">{user?.name || 'Admin User'}</p>
                      <p className="text-[11px] text-gray-500 font-medium truncate">{user?.email || 'admin@sada-bharat.com'}</p>
                    </div>
                    
                    <Link 
                      to="/admin/settings" 
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:text-admin-dark transition-colors"
                    >
                      <FiSettings size={16} className="text-gray-400" />
                      Portal Settings
                    </Link>
                    
                    <button 
                      onClick={() => { setIsProfileOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-3 px-4 py-2 mt-1 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FiLogOut size={16} className="text-red-500" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="bg-[#FDFBF7] relative min-h-[calc(100vh-56px)] overflow-x-hidden p-4 md:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

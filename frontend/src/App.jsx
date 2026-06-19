import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { ShopProvider, useShop } from './context/ShopContext';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { FaWhatsapp } from 'react-icons/fa';
// Routing Guards
import ProtectedRoute from './components/routing/ProtectedRoute';
import GuestRoute from './components/routing/GuestRoute';

// User Module Imports
import Navbar from './components/user/Navbar';
import Home from './components/user/Home';
import AboutSection from './components/user/AboutSection';
import Contact from './components/user/Contact';
import Shop from './components/user/Shop';
import Wishlist from './components/user/Wishlist';
import Checkout from './components/user/Checkout';
import TrackOrder from './components/user/TrackOrder';
import Footer from './components/user/Footer';
import CartDrawer from './components/user/CartDrawer';
import Auth from './components/user/Auth';
import Register from './components/user/Register';
import Profile from './components/user/Profile';
import MyReviews from './components/user/MyReviews';
import Coupons from './components/user/Coupons';
import Notifications from './components/user/Notifications';
import ChangePassword from './components/user/ChangePassword';
import Settings from './components/user/Settings';
import BlogSection from './components/user/BlogSection';
import BlogDetail from './components/user/BlogDetail';
import Offers from './components/user/Offers';
import ProductDetail from './components/user/ProductDetail';
import Bag from './components/user/Bag';
import UserOrders from './components/user/UserOrders';
import ScrollToTop from './components/user/ScrollToTop';
import RaiseTicket from './components/user/RaiseTicket';
import Consultation from './components/user/Consultation';
import { initializePushNotifications, setupForegroundNotificationHandler } from './services/pushNotificationService';

// Policy Imports
import PrivacyPolicy from './components/user/policies/PrivacyPolicy';
import ReturnPolicy from './components/user/policies/ReturnPolicy';
import TermsAndConditions from './components/user/policies/TermsAndConditions';
import CancelPolicy from './components/user/policies/CancelPolicy';
import ShippingPolicy from './components/user/policies/ShippingPolicy';

// Admin Module Imports
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProducts from './components/admin/AdminProducts';
import AdminCategories from './components/admin/AdminCategories';
import AdminUsers from './components/admin/AdminUsers';
import AdminOrders from './components/admin/AdminOrders';
import AdminFinance from './components/admin/AdminFinance';
import AdminPayouts from './components/admin/AdminPayouts';
import AdminBanners from './components/admin/AdminBanners';
import AdminSettings from './components/admin/AdminSettings';
import AdminLayout from './components/admin/AdminLayout';
import AdminComingSoon from './components/admin/AdminComingSoon';
import AdminInventory from './components/admin/AdminInventory';
import AdminCoupons from './components/admin/AdminCoupons';
import AdminOffers from './components/admin/AdminOffers';
import AdminVendors from './components/admin/AdminVendors';
import AdminReturns from './components/admin/AdminReturns';
import AdminBlogs from './components/admin/AdminBlogs';
import AdminInstagram from './components/admin/AdminInstagram';
import AdminReplacements from './components/admin/AdminReplacements';
import AdminReviews from './components/admin/AdminReviews';
import AdminNotifications from './components/admin/AdminNotifications';
import AdminSupport from './components/admin/AdminSupport';
import AdminLogistics from './components/admin/AdminLogistics';
import AdminLocations from './components/admin/AdminLocations';
import AdminLogin from './components/admin/AdminLogin';
import AdminPolicies from './components/admin/AdminPolicies';

// Vendor Module Imports
import VendorLayout from './components/vendor/VendorLayout';
import VendorDashboard from './components/vendor/VendorDashboard';
import VendorProducts from './components/vendor/VendorProducts';
import VendorAddProduct from './components/vendor/VendorAddProduct';
import VendorInventory from './components/vendor/VendorInventory';
import VendorOrders from './components/vendor/VendorOrders';
import VendorReturns from './components/vendor/VendorReturns';
import VendorEarnings from './components/vendor/VendorEarnings';
import VendorPayouts from './components/vendor/VendorPayouts';
import VendorCoupons from './components/vendor/VendorCoupons';
import VendorReviews from './components/vendor/VendorReviews';
import VendorNotifications from './components/vendor/VendorNotifications';
import VendorAnalytics from './components/vendor/VendorAnalytics';
import VendorSupport from './components/vendor/VendorSupport';
import VendorSettings from './components/vendor/VendorSettings';
import VendorLogistics from './components/vendor/VendorLogistics';
import VendorLogin from './components/vendor/VendorLogin';
import VendorRegister from './components/vendor/VendorRegister';
import VendorAuthGuard from './components/vendor/VendorAuthGuard';

const PublicLayout = () => {
  const location = useLocation();
  const hideWhatsApp = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      <CartDrawer />
      <div className="min-h-screen bg-brand-light">
        <Navbar />
        <main>
          <Outlet />
        </main>
        <Footer />

        {/* Global Animated WhatsApp Chat Widget */}
        {!hideWhatsApp && (
          <motion.a
            drag
            dragMomentum={false}
            draggable={false}
            whileDrag={{ scale: 1.05 }}
            href="https://wa.me/917407175567?text=Hello%20Sada%20Bharat%20Ayurvedic,%20I%20have%20an%20inquiry%20regarding%20your%20organic%20products."
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-[9999] flex items-center gap-3 group cursor-grab active:cursor-grabbing"
          >
            <div className="bg-white text-[#054425] border border-[#054425]/10 text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl pointer-events-none select-none translate-x-4 group-hover:translate-x-0 hidden lg:block">
              Chat with us
            </div>
            
            <div className="relative pointer-events-none">
              {/* Ripple Effect */}
              <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-60"></div>
              
              <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_8px_20px_rgba(37,211,102,0.4)] transition-transform duration-300 hover:scale-110 active:scale-95 border-2 border-white">
                <FaWhatsapp className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-sm" />
              </div>
            </div>
          </motion.a>
        )}
      </div>
    </>
  );
};

const UserRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutSection />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/blog" element={<BlogSection />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/consultation" element={<Consultation />} />
        <Route path="/bag" element={<Bag />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        <Route path="/terms-conditions" element={<TermsAndConditions />} />
        <Route path="/cancellation-policy" element={<CancelPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />

        {/* Guest Routes (Only unauthenticated users) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected User Routes (Only authenticated users) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/reviews" element={<MyReviews />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/orders" element={<UserOrders />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/support" element={<RaiseTicket />} />
        </Route>
      </Route>
    </Routes>
  );
};



const AdminRoutes = () => (
  <Routes>
    {/* Standalone Route for Admin Login */}
    <Route path="/login" element={<AdminLogin />} />

    {/* Nested Routes inside AdminLayout */}
    <Route element={<AdminLayout />}>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/products" element={<AdminProducts />} />
      <Route path="/categories" element={<AdminCategories />} />
      <Route path="/users" element={<AdminUsers />} />
      <Route path="/orders" element={<AdminOrders />} />
      <Route path="/finance" element={<AdminFinance />} />
      <Route path="/payouts" element={<AdminPayouts />} />
      <Route path="/banners" element={<AdminBanners />} />
      <Route path="/settings" element={<AdminSettings />} />
      <Route path="/inventory" element={<AdminInventory />} />
      <Route path="/vendors" element={<AdminVendors />} />
      <Route path="/vendors/pending" element={<AdminVendors />} />
      <Route path="/vendors/blocked" element={<AdminVendors />} />
      <Route path="/returns" element={<AdminReturns />} />
      <Route path="/coupons" element={<AdminCoupons />} />
      <Route path="/offers" element={<AdminOffers />} />
      <Route path="/customers" element={<AdminUsers />} />
      <Route path="/customers/blocked" element={<AdminUsers />} />
      <Route path="/blogs" element={<AdminBlogs />} />
      <Route path="/reviews" element={<AdminReviews />} />
      <Route path="/notifications" element={<AdminNotifications />} />
      <Route path="/support" element={<AdminSupport />} />
      <Route path="/vendor-chats" element={<AdminSupport />} />
      <Route path="/logistics" element={<AdminLogistics />} />
      <Route path="/locations" element={<AdminLocations />} />
      <Route path="/policies" element={<AdminPolicies />} />
    </Route>
  </Routes>
);

const VendorRoutes = () => (
  <Routes>
    {/* Public Vendor Routes */}
    <Route path="/login" element={<VendorLogin />} />
    <Route path="/register" element={<VendorRegister />} />
    {/* Protected Vendor Routes */}
    <Route element={<VendorAuthGuard />}>
      <Route element={<VendorLayout />}>
        <Route path="/" element={<VendorDashboard />} />
        <Route path="/products" element={<VendorProducts />} />
        <Route path="/add-product" element={<VendorAddProduct />} />
        <Route path="/edit-product/:id" element={<VendorAddProduct />} />
        <Route path="/inventory" element={<VendorInventory />} />
        <Route path="/orders" element={<VendorOrders />} />
        <Route path="/returns" element={<VendorReturns />} />
        <Route path="/logistics" element={<VendorLogistics />} />
        <Route path="/earnings" element={<VendorEarnings />} />
        <Route path="/payouts" element={<VendorPayouts />} />
        <Route path="/coupons" element={<VendorCoupons />} />
        <Route path="/reviews" element={<VendorReviews />} />
        <Route path="/notifications" element={<VendorNotifications />} />
        <Route path="/analytics" element={<VendorAnalytics />} />
        <Route path="/support" element={<VendorSupport />} />
        <Route path="/settings" element={<VendorSettings />} />
      </Route>
    </Route>
  </Routes>
);



// MOCK API for Frontend-Only mode
const api = {
  get: async () => ({ data: { data: { products: [], categories: [], banners: [], settings: {}, orders: [], users: [], stats: [], recentTransactions: [], dailyRevenue: [], vendors: [], blogs: [], returns: [], testimonials: [], reviews: [], replacements: [], supportTickets: [], locations: [], coupons: [], logs: [] }, status: 'success' } }),
  post: async () => ({ data: { data: { order: { orderId: 'MOCK-ORDER-123' } }, status: 'success' } }),
  patch: async () => ({ data: { status: 'success' } }),
  delete: async () => ({ data: { status: 'success' } })
};

import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiBell } from 'react-icons/fi';

const NotificationListener = () => {
  return null;
};

function App() {
  React.useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  React.useEffect(() => {
    initializePushNotifications();
    setupForegroundNotificationHandler((payload) => {
      console.log('App: Foreground notification received:', payload);
    });
  }, []);

  return (
    <ShopProvider>
      <NotificationListener />
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/vendor/*" element={<VendorRoutes />} />
          <Route path="/*" element={<UserRoutes />} />
        </Routes>
      </Router>
    </ShopProvider>
  );
}

export default App;

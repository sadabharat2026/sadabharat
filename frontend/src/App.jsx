import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ShopProvider, useShop } from './context/ShopContext';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

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
import BlogSection from './components/user/BlogSection';
import BlogDetail from './components/user/BlogDetail';
import Offers from './components/user/Offers';
import ProductDetail from './components/user/ProductDetail';
import Bag from './components/user/Bag';
import UserOrders from './components/user/UserOrders';
import ScrollToTop from './components/user/ScrollToTop';
import RaiseTicket from './components/user/RaiseTicket';
import Consultation from './components/user/Consultation';

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
import AdminBanners from './components/admin/AdminBanners';
import AdminSettings from './components/admin/AdminSettings';
import AdminLayout from './components/admin/AdminLayout';
import AdminComingSoon from './components/admin/AdminComingSoon';
import AdminInventory from './components/admin/AdminInventory';
import AdminCoupons from './components/admin/AdminCoupons';
import AdminOffers from './components/admin/AdminOffers';
import AdminReturns from './components/admin/AdminReturns';
import AdminBlogs from './components/admin/AdminBlogs';
import AdminTestimonials from './components/admin/AdminTestimonials';
import AdminInstagram from './components/admin/AdminInstagram';
import AdminReplacements from './components/admin/AdminReplacements';
import AdminReviews from './components/admin/AdminReviews';
import AdminSupport from './components/admin/AdminSupport';
import AdminLogistics from './components/admin/AdminLogistics';
import AdminLocations from './components/admin/AdminLocations';
import { FiBox, FiRotateCcw, FiRefreshCw, FiTag, FiShoppingBag, FiUsers } from 'react-icons/fi';

const UserRoutes = () => (
  <>
    <CartDrawer />
    <div className="min-h-screen bg-brand-light">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutSection />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/blog" element={<BlogSection />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<UserOrders />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/bag" element={<Bag />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/return-policy" element={<ReturnPolicy />} />
          <Route path="/terms-conditions" element={<TermsAndConditions />} />
          <Route path="/cancellation-policy" element={<CancelPolicy />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/support" element={<RaiseTicket />} />
        </Routes>
      </main>
      <Footer />

      {/* Global Animated WhatsApp Chat Widget */}
      <a
        href="https://wa.me/917407175567?text=Hello%20Sada%20Bharat%20Ayurvedic,%20I%20have%20an%20inquiry%20regarding%20your%20organic%20products."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 group cursor-pointer"
      >
        <div className="bg-white text-[#054425] border border-[#054425]/10 text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl pointer-events-none select-none translate-x-4 group-hover:translate-x-0">
          Chat with us
        </div>
        
        <div className="relative">
          {/* Ripple Effect */}
          <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-75"></div>
          
          <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-[#1EBE5D] to-[#25D366] flex items-center justify-center shadow-[0_10px_20px_rgba(37,211,102,0.4)] transition-transform duration-300 hover:scale-110 active:scale-95 border-2 border-white animate-bounce-slow">
            <svg className="w-8 h-8 md:w-9 md:h-9 fill-current text-white drop-shadow-sm" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.338 5.393.007 11.95.007c3.179 0 6.167 1.24 8.413 3.488a11.83 11.83 0 0 1 3.485 8.418c-.006 6.557-5.338 11.89-11.894 11.89-1.996 0-3.957-.5-5.69-1.448L0 24zM6.59 17.586l.361.214a9.873 9.873 0 0 0 5.031 1.378h.004c5.447 0 9.882-4.434 9.885-9.888a9.824 9.824 0 0 0-2.894-6.995c-1.865-1.867-4.348-2.9-6.988-2.9-5.452 0-9.887 4.434-9.889 9.889a9.863 9.863 0 0 0 1.51 5.26l.235.374-1.002 3.655 3.743-.982zm10.882-3.204c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            </svg>
          </div>
        </div>
      </a>
    </div>
  </>
);

const AdminRoutes = () => (
  <Routes>
    {/* Standalone Route for Admin Login */}
    <Route path="/login" element={<Auth />} />

    {/* Nested Routes inside AdminLayout */}
    <Route element={<AdminLayout />}>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/products" element={<AdminProducts />} />
      <Route path="/categories" element={<AdminCategories />} />
      <Route path="/users" element={<AdminUsers />} />
      <Route path="/orders" element={<AdminOrders />} />
      <Route path="/finance" element={<AdminFinance />} />
      <Route path="/banners" element={<AdminBanners />} />
      <Route path="/settings" element={<AdminSettings />} />
      <Route path="/inventory" element={<AdminInventory />} />
      <Route path="/returns" element={<AdminReturns />} />
      <Route path="/coupons" element={<AdminCoupons />} />
      <Route path="/offers" element={<AdminOffers />} />
      <Route path="/customers" element={<AdminUsers />} />
      <Route path="/blogs" element={<AdminBlogs />} />
      <Route path="/testimonials" element={<AdminTestimonials />} />
      <Route path="/instagram" element={<AdminInstagram />} />
      <Route path="/reviews" element={<AdminReviews />} />
      <Route path="/support" element={<AdminSupport />} />
      <Route path="/logistics" element={<AdminLogistics />} />
      <Route path="/locations" element={<AdminLocations />} />
    </Route>
  </Routes>
);

import { onMessageListener, requestForToken } from './utils/firebase-config';
import api from './utils/api';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiBell } from 'react-icons/fi';

const NotificationListener = () => {
  const { user, isAuthenticated } = useShop();

  React.useEffect(() => {
    // 1. Sync Token
    const syncToken = async () => {
      if (isAuthenticated) {
        const token = await requestForToken();
        if (token) {
          try {
            await api.post('/auth/save-fcm-token', { token, platform: 'web' });
          } catch (e) {
            console.warn("Backend offline: FCM Token sync skipped.");
          }
        }
      }
    };
    syncToken();

    // 2. Listen for Foreground Messages (Fire Native Browser Notification only)
    const unsubscribe = onMessageListener((payload) => {
      console.log('Received foreground message:', payload);

      const displayData = payload.notification || {
        title: payload.data?.title || "Saundarya Shringar",
        body: payload.data?.body || "New update received."
      };

      // Trigger Native System Notification like Chrome card
      if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(displayData.title, {
            body: displayData.body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            data: payload.data
          });
        });
      }
    });

    return () => unsubscribe && unsubscribe();
  }, [isAuthenticated]);

  return null; // No In-App UI, only Browser alerts
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

  return (
    <ShopProvider>
      <NotificationListener />
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/*" element={<UserRoutes />} />
        </Routes>
      </Router>
    </ShopProvider>
  );
}

export default App;

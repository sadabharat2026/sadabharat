import React from 'react';
import { useShop } from '../../context/ShopContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiUser, FiShoppingBag, FiMapPin, FiHeart, FiStar, FiTag, 
  FiBell, FiLock, FiSettings, FiLogOut, FiCheck, FiMessageSquare
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWindow from '../shared/ChatWindow';
import { getConversationId } from '../../services/chatService';

const ProfileSidebar = ({ activeTab = 'profile' }) => {
  const { user, logout } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSupportChatOpen, setIsSupportChatOpen] = React.useState(false);

  React.useEffect(() => {
    if (window.innerWidth < 1024) {
      const timer = setTimeout(() => {
        const sidebar = document.getElementById('profile-sidebar');
        if (sidebar) {
          const bottom = sidebar.getBoundingClientRect().bottom + window.scrollY;
          // Only scroll if we are near the top (e.g. after a navigation reset)
          if (window.scrollY < bottom - 100) {
            window.scrollTo({ top: bottom - 70, behavior: 'smooth' });
          }
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { id: 'profile', name: 'My Profile', icon: FiUser, link: '/profile' },
    { id: 'orders', name: 'My Orders', icon: FiShoppingBag, link: '/orders' },
    { id: 'addresses', name: 'My Addresses', icon: FiMapPin, link: '/profile' },
    { id: 'wishlist', name: 'Wishlist', icon: FiHeart, link: '/wishlist' },
    { id: 'reviews', name: 'My Reviews', icon: FiStar, link: '/reviews' },
    { id: 'coupons', name: 'Coupons', icon: FiTag, link: '/coupons' },
    { id: 'notifications', name: 'Notifications', icon: FiBell, link: '/notifications' },
    { id: 'password', name: 'Change Password', icon: FiLock, link: '/change-password' },
    { id: 'settings', name: 'Settings', icon: FiSettings, link: '/settings' },
  ];

  return (
    <div className="w-full lg:w-[260px] shrink-0" id="profile-sidebar">
      <div className="bg-[#F8FAF9] border border-gray-100 rounded-2xl flex flex-col shadow-sm overflow-hidden sticky top-24 lg:-mt-1.5">
        
        {/* User Info Section */}
        <div className="px-5 pt-3 pb-4 flex items-center gap-4 border-b border-gray-100">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-gray-100 bg-white flex items-center justify-center text-[#054425] shrink-0 shadow-sm">
            <FiUser className="w-6 h-6" />
          </div>
          <div className="flex flex-col items-start text-left overflow-hidden">
            <h2 className="font-bold text-gray-900 text-sm truncate w-full">{user.name}</h2>
            <p className="text-gray-500 text-[11px] mb-1.5 truncate w-full">{user.email}</p>
            <div className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1">
              <FiCheck className="w-3 h-3" /> Verified
            </div>
          </div>
        </div>

        {/* Navigation Menu Section */}
        <div className="flex flex-col p-3 gap-1">
          {navItems.map((item) => {
            const isActive = item.id === activeTab;
            return (
              <Link
                key={item.id}
                to={item.link}
                className={`flex items-center gap-4 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${
                  isActive 
                    ? 'bg-white shadow-sm text-[#054425]' 
                    : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
          <div className="mt-2 pt-2 border-t border-gray-50">
            <button 
              onClick={() => setIsSupportChatOpen(true)}
              className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-[13px] font-bold text-gray-600 hover:bg-white/50 hover:text-gray-900 transition-colors"
            >
              <FiMessageSquare className="w-4 h-4" />
              Contact Support
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-[13px] font-bold text-red-500 hover:bg-red-50 transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

      </div>

      {/* Support Chat Modal */}
      <AnimatePresence>
        {isSupportChatOpen && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setIsSupportChatOpen(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="w-full sm:max-w-md h-[85dvh] sm:h-[560px] flex flex-col min-h-0"
              onClick={(e) => e.stopPropagation()}
            >
              <ChatWindow
                conversationId={getConversationId.userAdmin(user._id)}
                metadata={{
                  type: 'user-admin',
                  userId: user._id,
                  userName: user.name || user.fullName || 'User',
                }}
                currentUser={{ id: user._id, name: user.name || user.fullName || 'User', role: 'user' }}
                recipientName="Sada Bharat Support"
                onClose={() => setIsSupportChatOpen(false)}
                className="h-full flex-1 border-0 sm:rounded-2xl rounded-t-2xl shadow-none"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileSidebar;

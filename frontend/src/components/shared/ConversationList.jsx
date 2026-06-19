import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMessageCircle, FiClock, FiCheckCircle, FiUser, FiPackage } from 'react-icons/fi';
import { subscribeToInbox } from '../../services/chatService';

const timeAgo = (timestamp) => {
  if (!timestamp) return '';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const ConversationList = ({
  filterPrefix,         // e.g. 'user-admin' | 'vendor-admin' | 'user-vendor-{vendorId}'
  selectedId,
  onSelect,
  currentUserRole,      // 'admin' | 'vendor'
  emptyMessage = 'No conversations yet.',
}) => {
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!filterPrefix) return;

    setLoading(true);
    unsubscribeRef.current = subscribeToInbox(filterPrefix, (convs) => {
      setConversations(convs);
      setLoading(false);
    });

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [filterPrefix]);

  const filtered = conversations.filter((c) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.userName?.toLowerCase().includes(q) ||
      c.vendorName?.toLowerCase().includes(q) ||
      c.lastMessage?.toLowerCase().includes(q) ||
      c.orderId?.toLowerCase().includes(q)
    );
  });

  const getDisplayName = (conv) => {
    if (currentUserRole === 'admin') {
      if (conv.type === 'vendor-admin') return conv.vendorName || 'Vendor';
      return conv.userName || 'User';
    }
    if (currentUserRole === 'vendor') {
      if (conv.type === 'vendor-admin') return 'Platform Admin';
      return conv.userName || 'User';
    }
    return conv.userName || 'Support';
  };

  const getIcon = (conv) => {
    if (conv.type === 'vendor-admin') return <FiUser size={16} className="text-purple-500" />;
    if (conv.orderId) return <FiPackage size={16} className="text-amber-500" />;
    return <FiMessageCircle size={16} className="text-[#054425]" />;
  };

  const hasUnread = (conv) => {
    return conv[`unread_${currentUserRole}`] === true;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <FiSearch
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#054425]/40 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto" data-lenis-prevent>
        {loading ? (
          <div className="flex flex-col gap-2 p-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-12 px-4 text-center opacity-50">
            <FiMessageCircle size={32} className="text-gray-400" />
            <p className="text-xs text-gray-500 font-medium">{emptyMessage}</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((conv) => (
              <motion.button
                key={conv.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => onSelect(conv)}
                className={`w-full flex items-start gap-3 px-4 py-3 transition-all border-b border-gray-50 text-left ${
                  selectedId === conv.id
                    ? 'bg-[#054425]/5 border-l-2 border-l-[#054425]'
                    : 'hover:bg-gray-50 border-l-2 border-l-transparent'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#054425]/10 to-[#054425]/20 flex items-center justify-center text-sm font-bold text-[#054425]">
                    {getDisplayName(conv).charAt(0).toUpperCase()}
                  </div>
                  {hasUnread(conv) && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-sm font-semibold truncate ${hasUnread(conv) ? 'text-gray-900' : 'text-gray-700'}`}>
                      {getDisplayName(conv)}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {timeAgo(conv.lastMessageAt)}
                    </span>
                  </div>

                  {/* Context tag */}
                  {(conv.orderId || conv.productId) && (
                    <div className="flex items-center gap-1 mb-0.5">
                      {getIcon(conv)}
                      <span className="text-[10px] text-gray-400 truncate">
                        {conv.orderId
                          ? `Order #${conv.orderId.slice(-6).toUpperCase()}`
                          : 'Product Inquiry'}
                      </span>
                    </div>
                  )}

                  <p className={`text-[11px] truncate ${hasUnread(conv) ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                    {conv.lastMessage || 'No messages yet'}
                  </p>
                </div>

                {/* Status */}
                {conv.status === 'resolved' && (
                  <FiCheckCircle size={14} className="text-green-500 shrink-0 mt-1" />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ConversationList;

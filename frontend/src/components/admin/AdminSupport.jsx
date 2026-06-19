import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiMessageCircle } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import ChatWindow from '../shared/ChatWindow';
import ConversationList from '../shared/ConversationList';
import { resolveConversation } from '../../services/chatService';

const ADMIN_USER = { id: 'admin', name: 'Admin Support', role: 'admin' };

const AdminSupport = () => {
  const location = useLocation();
  const isVendorChatsRoute = location.pathname.includes('vendor-chats');
  
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [inboxFilter, setInboxFilter] = useState(isVendorChatsRoute ? 'user-vendor' : 'user-admin'); 

  useEffect(() => {
    // Reset state when route changes
    setInboxFilter(location.pathname.includes('vendor-chats') ? 'user-vendor' : 'user-admin');
    setSelectedConversation(null);
  }, [location.pathname]);

  const handleResolveChat = async () => {
    if (!selectedConversation) return;
    await resolveConversation(selectedConversation.id);
    setSelectedConversation(prev => ({ ...prev, status: 'resolved' }));
  };

  return (
    <div className="flex flex-col space-y-4 min-h-0 w-full" style={{ height: 'calc(100vh - 104px)' }}>
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#5C2E3E]">
            {isVendorChatsRoute ? 'Vendor Chats Monitoring' : 'Support Inbox'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isVendorChatsRoute ? 'Monitor communications between users and vendors.' : 'Manage direct communications with patrons and vendors.'}
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex-1 flex min-h-0"
      >
        {/* ─ Left: Inbox ─ */}
        <div className="w-72 shrink-0 border-r border-gray-100 flex flex-col h-full bg-[#FAF7F8]/30">
          {/* Filter tabs */}
          {!isVendorChatsRoute && (
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => { setInboxFilter('user-admin'); setSelectedConversation(null); }}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                  inboxFilter === 'user-admin' ? 'bg-white text-[#5C2E3E] border-b-2 border-[#5C2E3E]' : 'text-gray-400 hover:text-gray-600 bg-transparent border-b-2 border-transparent'
                }`}
              >
                Patrons
              </button>
              <button
                onClick={() => { setInboxFilter('vendor-admin'); setSelectedConversation(null); }}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                  inboxFilter === 'vendor-admin' ? 'bg-white text-[#5C2E3E] border-b-2 border-[#5C2E3E]' : 'text-gray-400 hover:text-gray-600 bg-transparent border-b-2 border-transparent'
                }`}
              >
                Vendors
              </button>
            </div>
          )}
          {isVendorChatsRoute && (
             <div className="flex border-b border-gray-100">
               <button className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-white text-[#5C2E3E] border-b-2 border-[#5C2E3E]">
                 Vendor-User Chats
               </button>
             </div>
          )}

          <div className="flex-1 overflow-hidden">
            <ConversationList
              filterPrefix={inboxFilter}
              selectedId={selectedConversation?.id}
              onSelect={setSelectedConversation}
              currentUserRole="admin"
              emptyMessage={`No ${inboxFilter.replace('-', ' ')} chats yet.`}
            />
          </div>
        </div>

        {/* ─ Right: Chat Window ─ */}
        <div className="flex-1 flex flex-col h-full bg-white min-h-0">
          {selectedConversation ? (
            <>
              {/* Resolve button */}
              {selectedConversation.status !== 'resolved' && (
                <div className="px-4 py-2 border-b border-gray-50 flex justify-end bg-white/50 backdrop-blur-md z-10">
                  <button
                    onClick={handleResolveChat}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-[11px] font-bold hover:bg-green-100 transition-all shadow-sm"
                  >
                    <FiCheckCircle size={13} /> Mark as Resolved
                  </button>
                </div>
              )}
              <div className="flex-1 overflow-hidden relative min-h-0 flex flex-col">
                <ChatWindow
                  conversationId={selectedConversation.id}
                  metadata={selectedConversation}
                  currentUser={ADMIN_USER}
                  recipientName={
                    selectedConversation.type === 'vendor-admin'
                      ? selectedConversation.vendorName || 'Vendor'
                      : selectedConversation.type === 'user-vendor' 
                        ? `${selectedConversation.userName || 'User'} & ${selectedConversation.vendorName || 'Vendor'}`
                        : selectedConversation.userName || 'User'
                  }
                  className="flex-1 rounded-none border-0 shadow-none !bg-transparent"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-40 bg-[#FAF7F8]/20">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <FiMessageCircle size={32} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 font-medium">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSupport;

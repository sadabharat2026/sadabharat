import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiMessageCircle, FiInbox, FiCheckCircle, FiSearch, FiPackage } from 'react-icons/fi';
import api from '../../utils/api';
import ChatWindow from '../shared/ChatWindow';
import ConversationList from '../shared/ConversationList';
import { getConversationId } from '../../services/chatService';

const VendorSupport = () => {
  const [vendorInfo, setVendorInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'admin-chat'
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorProfile = async () => {
      try {
        const res = await api.get('/vendors/profile');
        if (res.data.success) {
          setVendorInfo(res.data.data.vendor);
        }
      } catch (err) {
        console.error('Failed to fetch vendor profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorProfile();
  }, []);

  if (loading || !vendorInfo) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-8 h-8 border-2 border-[#054425] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentVendorUser = {
    id: vendorInfo._id,
    name: vendorInfo.storeName || vendorInfo.fullName || 'Vendor',
    role: 'vendor'
  };

  const adminChatMetadata = {
    type: 'vendor-admin',
    vendorId: vendorInfo._id,
    vendorName: vendorInfo.storeName || vendorInfo.fullName || 'Vendor',
  };

  return (
    <div className="space-y-4 pb-6 max-w-[1400px] mx-auto -mt-2">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 leading-tight">Support Hub</h1>
          <p className="text-[12px] text-gray-500 mt-0.5 font-sans">Chat with customers and platform administration.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm w-fit">
        <button
          onClick={() => { setActiveTab('inbox'); setSelectedConversation(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'inbox' ? 'bg-[#054425] text-white shadow-sm' : 'text-gray-500 hover:text-[#054425]'
          }`}
        >
          <FiInbox size={14} /> Customer Inbox
        </button>
        <button
          onClick={() => { setActiveTab('admin-chat'); setSelectedConversation(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'admin-chat' ? 'bg-[#054425] text-white shadow-sm' : 'text-gray-500 hover:text-[#054425]'
          }`}
        >
          <FiMessageSquare size={14} /> Admin Support
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden h-[70vh]">
        {activeTab === 'inbox' ? (
          <div className="flex h-full">
            {/* ─ Left: Customer Inbox ─ */}
            <div className="w-80 shrink-0 border-r border-gray-100 flex flex-col">
              <div className="p-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                  <FiMessageCircle /> Customer Inquiries
                </h3>
              </div>
              <div className="flex-1 overflow-hidden">
                <ConversationList
                  filterPrefix={`user-vendor-`}
                  selectedId={selectedConversation?.id}
                  onSelect={setSelectedConversation}
                  currentUserRole="vendor"
                  emptyMessage="No customer messages yet."
                />
              </div>
            </div>

            {/* ─ Right: Chat Window ─ */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <ChatWindow
                  conversationId={selectedConversation.id}
                  metadata={selectedConversation}
                  currentUser={currentVendorUser}
                  recipientName={selectedConversation.userName || 'Customer'}
                  className="h-full rounded-none border-0 shadow-none"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-30 bg-gray-50">
                  <FiMessageCircle size={48} className="text-gray-300" />
                  <p className="text-sm text-gray-500 font-medium">Select a customer conversation to start chatting</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Admin Chat Channel */
          <div className="flex h-full">
             <div className="hidden md:flex w-64 shrink-0 border-r border-gray-100 flex-col bg-gray-50 p-6 items-center justify-center text-center">
                <div className="w-16 h-16 bg-[#054425]/10 text-[#054425] rounded-full flex items-center justify-center mb-4">
                  <FiMessageSquare size={24} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Platform Support</h3>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                  Chat directly with the Sada Bharat admin team for any account, payment, or platform issues.
                </p>
             </div>
             <div className="flex-1 flex flex-col relative">
                <ChatWindow
                  conversationId={getConversationId.vendorAdmin(vendorInfo._id)}
                  metadata={adminChatMetadata}
                  currentUser={currentVendorUser}
                  recipientName="Platform Admin"
                  className="h-full rounded-none border-0 shadow-none"
                />
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorSupport;

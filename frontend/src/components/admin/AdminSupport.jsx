import React, { useState } from 'react';
import { FiMessageSquare, FiUsers, FiMessageCircle } from 'react-icons/fi';
import { useShop } from '../../context/ShopContext';
import ChatWindow from '../shared/ChatWindow';
import ConversationList from '../shared/ConversationList';

const AdminSupport = () => {
  const { user } = useShop();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'vendors'
  const [selectedConversation, setSelectedConversation] = useState(null);

  const currentAdminUser = {
    id: user?._id || user?.id || 'admin',
    name: user?.name || 'Admin',
    role: 'admin',
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedConversation(null);
  };

  return (
    <div className="space-y-6 lg:space-y-8 pt-4 md:pt-6">
      <div>
        <h1 className="text-3xl lg:text-4xl font-['Cormorant',_serif] text-admin-dark font-black tracking-tighter flex items-center gap-3">
          <FiMessageSquare className="text-admin-accent" /> Support <span className="text-admin-accent">Centre</span>
        </h1>
        <p className="text-sm font-sans font-medium text-gray-500 capitalize mt-2">
          Chat directly with customers and vendors
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm w-fit">
        <button
          onClick={() => handleTabChange('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'users' ? 'bg-admin-accent text-white shadow-sm' : 'text-gray-500 hover:text-admin-accent'
          }`}
        >
          <FiMessageCircle size={14} /> Customer Support
        </button>
        <button
          onClick={() => handleTabChange('vendors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'vendors' ? 'bg-admin-accent text-white shadow-sm' : 'text-gray-500 hover:text-admin-accent'
          }`}
        >
          <FiUsers size={14} /> Vendor Support
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden h-[70vh] rounded-xl">
        <div className="flex h-full">
          {/* Left: Inbox */}
          <div className="w-80 shrink-0 border-r border-gray-100 flex flex-col">
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                {activeTab === 'users' ? <FiMessageCircle /> : <FiUsers />}
                {activeTab === 'users' ? 'Customer Inquiries' : 'Vendor Inquiries'}
              </h3>
            </div>
            <div className="flex-1 overflow-hidden">
              <ConversationList
                filterPrefix={activeTab === 'users' ? 'user-admin-' : 'vendor-admin-'}
                selectedId={selectedConversation?.id}
                onSelect={setSelectedConversation}
                currentUserRole="admin"
                emptyMessage={activeTab === 'users' ? 'No customer messages yet.' : 'No vendor messages yet.'}
              />
            </div>
          </div>

          {/* Right: Chat Window */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <ChatWindow
                conversationId={selectedConversation.id}
                metadata={selectedConversation}
                currentUser={currentAdminUser}
                recipientName={
                  activeTab === 'users'
                    ? (selectedConversation.userName || 'Customer')
                    : (selectedConversation.vendorName || 'Vendor')
                }
                className="h-full rounded-none border-0 shadow-none"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-30 bg-gray-50">
                <FiMessageCircle size={48} className="text-gray-300" />
                <p className="text-sm text-gray-500 font-medium">
                  Select a conversation to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;

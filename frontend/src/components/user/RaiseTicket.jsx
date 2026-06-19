import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiSend, FiClock, FiCheckCircle, FiAlertCircle, FiArrowLeft, FiPlus, FiTag, FiHash, FiMessageCircle } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import api from '../../utils/api';
import ChatWindow from '../shared/ChatWindow';
import { getConversationId } from '../../services/chatService';

const RaiseTicket = () => {
  const { user, isAuthenticated } = useShop();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRaising, setIsRaising] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'tickets'
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'Medium',
    orderId: ''
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets/my-tickets');
      setTickets(res.data.data.tickets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) return alert('Please fill in required fields.');
    
    try {
      setFormLoading(true);
      await api.post('/tickets', formData);
      setFormData({ subject: '', description: '', priority: 'Medium', orderId: '' });
      setIsRaising(false);
      fetchTickets();
    } catch (err) {
      alert('Failed to raise ticket');
    } finally {
      setFormLoading(false);
    }
  };

  // Conversation details for User ↔ Admin live chat
  const conversationId = user ? getConversationId.userAdmin(user._id) : null;
  const currentChatUser = user ? { id: user._id, name: user.name, role: 'user' } : null;
  const chatMetadata = user ? {
    type: 'user-admin',
    userId: user._id,
    userName: user.name,
  } : null;

  return (
    <div className="min-h-screen bg-[#FDFCFB] pt-4 md:pt-8 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link 
            to="/profile" 
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#5C2E3E] hover:text-brand-pink transition-all"
          >
            <FiArrowLeft size={12} /> Back to Sanctuary
          </Link>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl md:text-3xl font-serif font-black text-[#5C2E3E] uppercase tracking-tighter mb-1 leading-none">
            Support <span className="text-brand-pink italic">Gateway</span>
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-6">Resolution sanctuary for your needs</p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-100 shadow-sm">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'chat' 
                ? 'bg-[#5C2E3E] text-white shadow-sm' 
                : 'text-gray-500 hover:text-[#5C2E3E]'
            }`}
          >
            <FiMessageCircle size={14} />
            Live Chat
          </button>
          <button
            onClick={() => { setActiveTab('tickets'); setIsRaising(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'tickets' 
                ? 'bg-[#5C2E3E] text-white shadow-sm' 
                : 'text-gray-500 hover:text-[#5C2E3E]'
            }`}
          >
            <FiMessageSquare size={14} />
            Tickets {tickets.length > 0 && <span className="bg-brand-pink text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">{tickets.length}</span>}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ── LIVE CHAT TAB ── */}
          {activeTab === 'chat' && (
            <motion.div
              key="chat-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {!isAuthenticated || !user ? (
                <div className="bg-white rounded-2xl p-12 border border-dashed border-gray-200 text-center">
                  <FiMessageCircle size={32} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-sm font-bold text-gray-500 mb-4">Please log in to access live chat support.</p>
                  <Link to="/login" className="bg-[#5C2E3E] text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Login
                  </Link>
                </div>
              ) : (
                <ChatWindow
                  conversationId={conversationId}
                  metadata={chatMetadata}
                  currentUser={currentChatUser}
                  recipientName="Sada Bharat Support"
                  className="h-[560px]"
                />
              )}
            </motion.div>
          )}

          {/* ── TICKETS TAB ── */}
          {activeTab === 'tickets' && (
            <motion.div
              key="tickets-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setIsRaising(!isRaising)}
                  className="bg-[#5C2E3E] text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-brand-pink shadow-lg shadow-brand-pink/20 transition-all"
                >
                  {isRaising ? <FiArrowLeft /> : <FiPlus />} {isRaising ? 'View History' : 'Raise New Issue'}
                </button>
              </div>

              <AnimatePresence mode='wait'>
                {isRaising ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl"
                  >
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#5C2E3E]/60 ml-1">Subject Essence *</label>
                          <input
                            type="text"
                            className="w-full bg-[#F9F6F4] border-none rounded-xl px-5 py-3.5 text-xs font-bold text-[#5C2E3E] focus:ring-2 focus:ring-brand-pink/20 outline-none"
                            placeholder="e.g., Order Delayed, Product Issue"
                            value={formData.subject}
                            onChange={e => setFormData({...formData, subject: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#5C2E3E]/60 ml-1">Priority Level</label>
                          <select
                            className="w-full bg-[#F9F6F4] border-none rounded-xl px-5 py-3.5 text-xs font-bold text-[#5C2E3E] focus:ring-2 focus:ring-brand-pink/20 outline-none appearance-none"
                            value={formData.priority}
                            onChange={e => setFormData({...formData, priority: e.target.value})}
                          >
                            <option value="Low">Low - General Query</option>
                            <option value="Medium">Medium - Regular Issue</option>
                            <option value="High">High - Urgent Resolve</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#5C2E3E]/60 ml-1">Order Ritual ID (Optional)</label>
                        <div className="relative">
                          <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" size={14} />
                          <input
                            type="text"
                            className="w-full bg-[#F9F6F4] border-none rounded-xl pl-12 pr-5 py-3.5 text-xs font-bold text-[#5C2E3E] focus:ring-2 focus:ring-brand-pink/20 outline-none"
                            placeholder="SS-XXXXXX"
                            value={formData.orderId}
                            onChange={e => setFormData({...formData, orderId: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#5C2E3E]/60 ml-1">Issue Manifest *</label>
                        <textarea
                          rows={6}
                          className="w-full bg-[#F9F6F4] border-none rounded-2xl px-5 py-4 text-xs font-bold text-[#5C2E3E] focus:ring-2 focus:ring-brand-pink/20 outline-none resize-none leading-relaxed"
                          placeholder="Describe your ritual experience or concern in detail..."
                          value={formData.description}
                          onChange={e => setFormData({...formData, description: e.target.value})}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={formLoading}
                        className="w-full h-14 bg-[#5C2E3E] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl shadow-[#5C2E3E]/20 flex items-center justify-center gap-3 hover:bg-brand-pink transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {formLoading ? 'Submitting to Vault...' : <><FiSend /> Initiate Resolution</>}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-20 opacity-20">
                        <FiClock size={40} className="animate-spin mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Searching Archives...</p>
                      </div>
                    ) : tickets.length === 0 ? (
                      <div className="bg-white border border-dashed border-gray-200 rounded-[2rem] p-16 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                          <FiMessageSquare size={24} />
                        </div>
                        <h3 className="text-sm font-serif font-bold text-[#5C2E3E] mb-2 uppercase tracking-widest">No Active Inquiries</h3>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Your sanctuary is peaceful and error-free.</p>
                      </div>
                    ) : (
                      tickets.map((ticket) => (
                        <div key={ticket._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                  ticket.priority === 'High' ? 'bg-red-50 text-red-500' :
                                  ticket.priority === 'Medium' ? 'bg-orange-50 text-orange-500' :
                                  'bg-blue-50 text-blue-500'
                                }`}>
                                  {ticket.priority} Priority
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                  ticket.status === 'Open' ? 'bg-green-50 text-green-500' :
                                  ticket.status === 'Resolved' ? 'bg-brand-dark text-white' :
                                  'bg-gray-50 text-gray-400'
                                }`}>
                                  {ticket.status}
                                </span>
                              </div>
                              <h3 className="text-sm md:text-base font-serif font-black text-[#5C2E3E] truncate max-w-md">{ticket.subject}</h3>
                              <p className="text-[11px] text-gray-500 leading-relaxed font-medium">{ticket.description}</p>
                              
                              {ticket.adminNote && (
                                <div className="mt-4 bg-[#F9F6F4] p-3 rounded-lg border-l-2 border-brand-gold italic">
                                  <p className="text-[8px] font-black uppercase tracking-widest text-brand-gold mb-1">Ritual Master Note:</p>
                                  <p className="text-[10px] text-brand-dark font-medium leading-relaxed">{ticket.adminNote}</p>
                                </div>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                              <p className="text-[9px] font-bold text-[#5C2E3E] mt-1 italic">Ticket #{ticket._id.slice(-6)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RaiseTicket;

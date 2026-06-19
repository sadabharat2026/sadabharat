import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiImage, FiX, FiCheck, FiCheckCircle, FiAlertTriangle, FiZoomIn } from 'react-icons/fi';
import { subscribeToMessages, sendMessage, getOrCreateConversation, uploadChatImage, markAsRead } from '../../services/chatService';

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// Lightbox for image preview
const ImageLightbox = ({ src, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <button
      className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
      onClick={onClose}
    >
      <FiX size={20} />
    </button>
    <img
      src={src}
      alt="Full size"
      className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    />
  </motion.div>
);

const ChatWindow = ({
  conversationId,
  metadata,         // { type, userId, userName, vendorId, vendorName, productId, orderId }
  currentUser,      // { id, name, role }
  recipientName,
  onClose,
  className = '',
  style = {},
}) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [isResolved, setIsResolved] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // Initialize conversation and subscribe to messages
  useEffect(() => {
    if (!conversationId || !currentUser?.id) return;

    let isActive = true;

    const init = async () => {
      try {
        setIsLoading(true);
        await getOrCreateConversation(conversationId, metadata);

        if (!isActive) return;

        unsubscribeRef.current = subscribeToMessages(conversationId, (msgs) => {
          if (!isActive) return;
          setMessages(msgs);
          setIsLoading(false);
          // Check if conversation is resolved
          if (msgs.length === 0) setIsLoading(false);
        });

        // Mark as read
        await markAsRead(conversationId, currentUser.role);
      } catch (err) {
        console.error('ChatWindow: Failed to init conversation', err);
        setIsLoading(false);
      }
    };

    init();

    return () => {
      isActive = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [conversationId, currentUser?.id]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = useCallback(async (imageUrl = null) => {
    const text = inputText.trim();
    if (!text && !imageUrl) return;
    if (isResolved) return;

    setIsSending(true);
    setInputText('');

    try {
      await sendMessage(conversationId, {
        senderId: currentUser.id,
        senderRole: currentUser.role,
        senderName: currentUser.name,
        text,
        imageUrl,
      });
    } catch (err) {
      console.error('ChatWindow: Failed to send message', err);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }, [inputText, conversationId, currentUser, isResolved]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be selected again
    e.target.value = '';

    setIsUploading(true);
    try {
      const url = await uploadChatImage(file);
      await handleSend(url);
    } catch (err) {
      console.error('ChatWindow: Image upload failed', err);
      alert('Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Group messages by date for date separators
  const groupedMessages = messages.reduce((groups, msg) => {
    const dateLabel = formatDate(msg.timestamp);
    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(msg);
    return groups;
  }, {});

  const isOwnMessage = (msg) => msg.senderId === currentUser.id;

  return (
    <>
      <AnimatePresence>
        {lightboxSrc && (
          <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
        )}
      </AnimatePresence>

      <div
        className={`flex flex-col min-h-0 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 ${className}`}
        style={style}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#054425] to-[#0a6b3a] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
              {recipientName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">{recipientName}</p>
              {isResolved ? (
                <span className="text-[10px] text-green-300 font-semibold flex items-center gap-1">
                  <FiCheckCircle size={10} /> Resolved
                </span>
              ) : (
                <span className="text-[10px] text-white/60">Active</span>
              )}
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        {/* ── Context Banner (product/order info) ── */}
        {(metadata?.productId || metadata?.orderId) && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
            <FiAlertTriangle size={13} className="text-amber-600 shrink-0" />
            <p className="text-[11px] text-amber-700 font-semibold truncate">
              {metadata.orderId
                ? `Re: Order #${metadata.orderId.slice(-6).toUpperCase()}`
                : `Re: Product Inquiry`}
            </p>
          </div>
        )}

        {/* ── Messages ── */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-3 space-y-1 bg-[#F7F8FA]" 
          style={{ minHeight: 0 }}
          data-lenis-prevent
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
              <div className="w-6 h-6 border-2 border-[#054425] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500">Loading chat...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 opacity-40">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                <FiSend size={24} className="text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 font-medium">No messages yet. Say hello!</p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([dateLabel, dayMsgs]) => (
              <div key={dateLabel}>
                {/* Date separator */}
                <div className="flex items-center gap-2 my-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[10px] text-gray-400 font-semibold px-2">{dateLabel}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {dayMsgs.map((msg) => {
                  const own = isOwnMessage(msg);
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex mb-2 ${own ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Avatar for non-own messages */}
                      {!own && (
                        <div className="w-7 h-7 rounded-full bg-[#054425]/10 text-[#054425] flex items-center justify-center text-[11px] font-bold shrink-0 mr-2 mt-1">
                          {msg.senderName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}

                      <div className={`max-w-[75%] ${own ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                        {/* Sender name for non-own messages */}
                        {!own && (
                          <span className="text-[10px] text-gray-500 font-semibold ml-1">
                            {msg.senderName}
                          </span>
                        )}

                        {/* Image message */}
                        {msg.imageUrl && (
                          <div
                            className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 ${
                              own ? 'border-[#054425]/30' : 'border-gray-200'
                            }`}
                            onClick={() => setLightboxSrc(msg.imageUrl)}
                          >
                            <img
                              src={msg.imageUrl}
                              alt="Shared image"
                              className="max-w-[200px] max-h-[200px] object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
                              <FiZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-all" size={20} />
                            </div>
                          </div>
                        )}

                        {/* Text message */}
                        {msg.text && (
                          <div
                            className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                              own
                                ? 'bg-[#054425] text-white rounded-tr-sm'
                                : 'bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100'
                            }`}
                          >
                            {msg.text}
                          </div>
                        )}

                        {/* Timestamp */}
                        <span className={`text-[10px] text-gray-400 px-1 ${own ? 'text-right' : ''}`}>
                          {formatTime(msg.timestamp)}
                          {own && <FiCheck size={10} className="inline ml-1 text-gray-400" />}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Resolved Banner ── */}
        {isResolved && (
          <div className="px-4 py-2 bg-green-50 border-t border-green-100 text-center">
            <p className="text-[11px] text-green-700 font-semibold flex items-center justify-center gap-1">
              <FiCheckCircle size={12} /> This conversation has been resolved.
            </p>
          </div>
        )}

        {/* ── Input Area ── */}
        {!isResolved && (
          <div className="px-3 py-3 bg-white border-t border-gray-100 flex items-end gap-2 shrink-0">
            {/* Image upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all shrink-0 disabled:opacity-50"
              title="Send image"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiImage size={16} />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />

            {/* Text input */}
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 resize-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#054425]/40 focus:bg-white transition-all max-h-28 leading-relaxed"
              style={{ scrollbarWidth: 'none' }}
              data-lenis-prevent
            />

            {/* Send button */}
            <button
              onClick={() => handleSend()}
              disabled={(!inputText.trim() && !isUploading) || isSending}
              className="w-9 h-9 rounded-full bg-[#054425] hover:bg-[#0a6b3a] flex items-center justify-center text-white transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiSend size={14} />
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatWindow;

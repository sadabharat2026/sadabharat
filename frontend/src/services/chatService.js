import { db } from '../firebase';
import {
  ref,
  push,
  set,
  get,
  onValue,
  off,
  serverTimestamp,
  query,
  orderByChild,
  update,
} from 'firebase/database';
import api from '../utils/api';

// ──────────────────────────────────────────────
// Conversation ID helpers
// ──────────────────────────────────────────────
export const getConversationId = {
  userAdmin: (userId) => `user-admin-${userId}`,
  userVendor: (userId, vendorId) => `user-vendor-${userId}-${vendorId}`,
  vendorAdmin: (vendorId) => `vendor-admin-${vendorId}`,
};

// ──────────────────────────────────────────────
// Get or create a conversation node in RTDB
// ──────────────────────────────────────────────
export async function getOrCreateConversation(conversationId, metadata) {
  const convRef = ref(db, `chats/${conversationId}/metadata`);
  const snapshot = await get(convRef);

  if (!snapshot.exists()) {
    await set(convRef, {
      ...metadata,
      createdAt: Date.now(),
      lastMessageAt: Date.now(),
      lastMessage: '',
      status: 'open',
    });
  }

  return conversationId;
}

// ──────────────────────────────────────────────
// Send a message to a conversation
// ──────────────────────────────────────────────
export async function sendMessage(conversationId, { senderId, senderRole, senderName, text, imageUrl }) {
  const messagesRef = ref(db, `chats/${conversationId}/messages`);
  const metaRef = ref(db, `chats/${conversationId}/metadata`);

  const messageData = {
    senderId,
    senderRole,
    senderName,
    text: text || '',
    imageUrl: imageUrl || null,
    timestamp: Date.now(),
    isRead: false,
  };

  await push(messagesRef, messageData);

  // Update conversation metadata with last message preview
  const preview = imageUrl ? '📷 Image' : (text?.slice(0, 60) || '');
  await update(metaRef, {
    lastMessage: preview,
    lastMessageAt: Date.now(),
    [`unread_${senderRole === 'user' ? 'admin' : senderRole === 'vendor' ? 'admin' : 'user'}`]: true,
  });

  // Trigger backend notification
  try {
    let recipientRole = 'user';
    let recipientId = null;

    if (conversationId.startsWith('vendor-admin-')) {
      recipientRole = senderRole === 'vendor' ? 'admin' : 'vendor';
      recipientId = conversationId.replace('vendor-admin-', '');
    } else if (conversationId.startsWith('user-admin-')) {
      recipientRole = senderRole === 'user' ? 'admin' : 'user';
      recipientId = conversationId.replace('user-admin-', '');
    } else if (conversationId.startsWith('user-vendor-')) {
      const parts = conversationId.split('-'); // user-vendor-userId-vendorId
      if (senderRole === 'user') {
        recipientRole = 'vendor';
        recipientId = parts[3];
      } else {
        recipientRole = 'user';
        recipientId = parts[2];
      }
    }

    if (recipientId) {
      await api.post('/notifications/chat', {
        recipientId,
        recipientRole,
        title: `New Message from ${senderName}`,
        message: text || 'Sent an image'
      });
    }
  } catch (err) {
    console.error('Failed to trigger chat push notification', err);
  }

  return messageData;
}

// ──────────────────────────────────────────────
// Subscribe to messages in a conversation (real-time)
// Returns the unsubscribe function
// ──────────────────────────────────────────────
export function subscribeToMessages(conversationId, callback) {
  const messagesRef = ref(db, `chats/${conversationId}/messages`);

  onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const messages = Object.entries(data).map(([key, value]) => ({
      id: key,
      ...value,
    }));
    // Sort by timestamp ascending
    messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    callback(messages);
  });

  // Return unsubscribe function
  return () => off(messagesRef);
}

// ──────────────────────────────────────────────
// Subscribe to conversation metadata (for list views)
// Returns the unsubscribe function
// ──────────────────────────────────────────────
export function subscribeToConversation(conversationId, callback) {
  const metaRef = ref(db, `chats/${conversationId}/metadata`);
  onValue(metaRef, (snapshot) => {
    callback(snapshot.val());
  });
  return () => off(metaRef);
}

// ──────────────────────────────────────────────
// Subscribe to all conversations for admin/vendor (inbox)
// type: 'user-admin' | 'vendor-admin' | 'user-vendor-{vendorId}'
// Returns the unsubscribe function
// ──────────────────────────────────────────────
export function subscribeToInbox(filterPrefix, callback) {
  const chatsRef = ref(db, 'chats');

  onValue(chatsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }

    const conversations = Object.entries(data)
      .filter(([key]) => key.startsWith(filterPrefix))
      .map(([key, value]) => ({
        id: key,
        ...value.metadata,
      }))
      .filter(Boolean)
      .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));

    callback(conversations);
  });

  return () => off(chatsRef);
}

// ──────────────────────────────────────────────
// Mark messages as read for a given reader role
// ──────────────────────────────────────────────
export async function markAsRead(conversationId, readerRole) {
  const metaRef = ref(db, `chats/${conversationId}/metadata`);
  await update(metaRef, {
    [`unread_${readerRole}`]: false,
  });
}

// ──────────────────────────────────────────────
// Mark a conversation as resolved
// ──────────────────────────────────────────────
export async function resolveConversation(conversationId) {
  const metaRef = ref(db, `chats/${conversationId}/metadata`);
  await update(metaRef, { status: 'resolved' });
}

// ──────────────────────────────────────────────
// Upload image to Cloudinary via backend and return URL
// ──────────────────────────────────────────────
export async function uploadChatImage(file) {
  const formData = new FormData();
  formData.append('documents', file);

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  if (response.data.success && response.data.data.length > 0) {
    return response.data.data[0];
  }
  throw new Error('Image upload failed');
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { messageService } from '../services/messageService';
import { getSocket } from '../../../services/socket';

export function useMessages() {
  const navigate = useNavigate();
  const token = localStorage.getItem('campusconnect_token');
  const loggedInUser = JSON.parse(localStorage.getItem('campusconnect_user') || 'null');
  const [searchParams, setSearchParams] = useSearchParams();

  const activeWithId = searchParams.get('with') || '';

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [thread, setThread] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);

  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // 1. Fetch conversations list
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchConversations = async () => {
      try {
        const data = await messageService.getConversations();
        if (Array.isArray(data)) {
          setConversations(data);
          if (!activeWithId && data.length > 0) {
            setSearchParams({ with: data[0].id });
          }
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      }
    };

    fetchConversations();
  }, [token, activeWithId, navigate, setSearchParams]);

  // 2. Fetch active thread & mark messages as read
  useEffect(() => {
    if (!token || !activeWithId) return;

    const fetchThread = async () => {
      try {
        const data = await messageService.getThread(activeWithId);
        if (data) {
          setActivePartner(data.partner);
          setActiveConversationId(data.conversationId);
          setThread(Array.isArray(data.thread) ? data.thread : []);

          // Emit read receipt via socket
          const socket = getSocket();
          if (socket && socket.connected) {
            socket.emit('mark_read', {
              conversationId: data.conversationId,
              partnerId: activeWithId
            });
          }

          // Decrement unread counter in local conversation list
          setConversations((prev) =>
            prev.map((c) => (c.id === activeWithId ? { ...c, unread: 0 } : c))
          );
        }
      } catch (err) {
        console.error('Failed to load thread:', err);
      }
    };

    fetchThread();
  }, [token, activeWithId]);

  // 3. Socket.IO Real-time event listeners
  useEffect(() => {
    if (!token) return;
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (payload) => {
      const msg = payload.message || payload;
      const convId = payload.conversationId;

      const fromId = msg.fromUser?._id || msg.fromUser;
      const toId = msg.toUser?._id || msg.toUser;

      // Update current open thread if message belongs to it
      if (
        (fromId === activeWithId && toId === loggedInUser?.id) ||
        (fromId === loggedInUser?.id && toId === activeWithId)
      ) {
        setThread((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();

        // Mark as read immediately if chat is open
        if (fromId === activeWithId) {
          socket.emit('mark_read', { conversationId: convId, partnerId: activeWithId });
        }
      }

      // Update conversation list item
      setConversations((prev) => {
        const partnerId = fromId === loggedInUser?.id ? toId : fromId;
        const exists = prev.some((c) => c.id === partnerId);

        if (exists) {
          return prev
            .map((c) => {
              if (c.id === partnerId) {
                return {
                  ...c,
                  last_msg: msg.body,
                  last_time: msg.createdAt,
                  unread:
                    partnerId === activeWithId ? 0 : (c.unread || 0) + (fromId === partnerId ? 1 : 0)
                };
              }
              return c;
            })
            .sort((a, b) => new Date(b.last_time || 0) - new Date(a.last_time || 0));
        }

        return prev;
      });
    };

    const handleUserTyping = (data) => {
      if (data.userId === activeWithId) {
        setPartnerIsTyping(Boolean(data.isTyping));
      }
    };

    const handleMessagesRead = (data) => {
      if (data.byUserId === activeWithId) {
        setThread((prev) =>
          prev.map((m) =>
            m.fromUser === loggedInUser?.id || m.fromUser?._id === loggedInUser?.id
              ? { ...m, isRead: true, status: 'read' }
              : m
          )
        );
      }
    };

    const handleUserStatusChange = ({ userId, isOnline }) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === userId ? { ...c, isOnline } : c))
      );
      if (activePartner && activePartner._id === userId) {
        setActivePartner((prev) => ({ ...prev, isOnline }));
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_sent', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('messages_read', handleMessagesRead);
    socket.on('user_status_change', handleUserStatusChange);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_sent', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('messages_read', handleMessagesRead);
      socket.off('user_status_change', handleUserStatusChange);
    };
  }, [token, activeWithId, activePartner, loggedInUser?.id, scrollToBottom]);

  // 4. Scroll to bottom on thread updates
  useEffect(() => {
    scrollToBottom();
  }, [thread, scrollToBottom]);

  // Handle Typing notification debounce
  const handleTyping = (text) => {
    setNewMessage(text);
    const socket = getSocket();
    if (!socket || !activeWithId) return;

    socket.emit('typing_start', {
      toUserId: activeWithId,
      conversationId: activeConversationId
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', {
        toUserId: activeWithId,
        conversationId: activeConversationId
      });
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activeWithId) return;

    const msgText = newMessage.trim();
    setNewMessage('');
    setError('');

    const socket = getSocket();
    if (socket) {
      socket.emit('typing_stop', {
        toUserId: activeWithId,
        conversationId: activeConversationId
      });
    }

    const tempId = 'temp-' + Date.now();
    const optimisticMsg = {
      _id: tempId,
      fromUser: loggedInUser?.id,
      toUser: activeWithId,
      body: msgText,
      createdAt: new Date().toISOString(),
      isRead: false,
      status: 'sending'
    };

    setThread((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    // Prefer real-time socket emit with HTTP fallback
    if (socket && socket.connected) {
      socket.emit(
        'send_message',
        {
          toUserId: activeWithId,
          body: msgText,
          conversationId: activeConversationId,
          tempId
        },
        (res) => {
          if (res?.success && res.message) {
            setThread((prev) =>
              prev.map((m) => (m._id === tempId ? { ...res.message, status: 'sent' } : m))
            );
          } else if (res?.error) {
            setError(res.error);
            setThread((prev) => prev.filter((m) => m._id !== tempId));
          }
        }
      );
    } else {
      // HTTP API Fallback
      try {
        const res = await messageService.sendMessage(activeWithId, msgText);
        const savedMsg = res.data || res;
        setThread((prev) => prev.map((m) => (m._id === tempId ? savedMsg : m)));
      } catch (err) {
        setError(err.message || 'Failed to send message');
        setThread((prev) => prev.filter((m) => m._id !== tempId));
      }
    }
  };

  return {
    conversations,
    activePartner,
    thread,
    newMessage,
    setNewMessage,
    handleTyping,
    partnerIsTyping,
    error,
    activeWithId,
    chatEndRef,
    scrollToBottom,
    handleSendMessage,
    loggedInUser,
    token
  };
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { messageService } from '../services/messageService';

export function useMessages() {
  const navigate = useNavigate();
  const token = localStorage.getItem('campusconnect_token');
  const loggedInUser = JSON.parse(localStorage.getItem('campusconnect_user') || 'null');
  const [searchParams, setSearchParams] = useSearchParams();

  const activeWithId = searchParams.get('with') || '';

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [thread, setThread] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');

  const chatEndRef = useRef(null);

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
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [token, activeWithId, navigate, setSearchParams]);

  // 2. Fetch active thread
  useEffect(() => {
    if (!token || !activeWithId) return;

    const fetchThread = async () => {
      try {
        const data = await messageService.getThread(activeWithId);
        if (data) {
          setActivePartner(data.partner);
          setThread(Array.isArray(data.thread) ? data.thread : []);
        }
      } catch (err) {
        console.error('Failed to load thread:', err);
      }
    };

    fetchThread();
    const interval = setInterval(fetchThread, 5000);
    return () => clearInterval(interval);
  }, [token, activeWithId]);

  // 3. Scroll to bottom on thread updates
  useEffect(() => {
    scrollToBottom();
  }, [thread, scrollToBottom]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activeWithId) return;

    const msgText = newMessage.trim();
    setNewMessage('');
    setError('');

    const tempId = 'temp-' + Date.now();
    const optimisticMsg = {
      _id: tempId,
      fromUser: loggedInUser?.id,
      toUser: activeWithId,
      body: msgText,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setThread((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      const res = await messageService.sendMessage(activeWithId, msgText);
      const savedMsg = res.data || res;
      setThread((prev) => prev.map((m) => (m._id === tempId ? savedMsg : m)));
    } catch (err) {
      setError(err.message || 'Failed to send message');
      setThread((prev) => prev.filter((m) => m._id !== tempId));
    }
  };

  return {
    conversations,
    activePartner,
    thread,
    newMessage,
    setNewMessage,
    error,
    activeWithId,
    chatEndRef,
    scrollToBottom,
    handleSendMessage,
    loggedInUser,
    token
  };
}

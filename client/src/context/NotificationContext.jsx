import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { apiClient } from '../services/apiClient';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { token } = useAuth();
  const [notifCount, setNotifCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const fetchBadges = async () => {
    if (!token) return;
    try {
      const notifData = await apiClient('/api/notifications');
      setNotifications(Array.isArray(notifData) ? notifData : []);
      setNotifCount(Array.isArray(notifData) ? notifData.filter((n) => !n.isRead).length : 0);

      const convData = await apiClient('/api/messages/conversations');
      const unreadSum = Array.isArray(convData) ? convData.reduce((acc, conv) => acc + (conv.unread || 0), 0) : 0;
      setMsgCount(unreadSum);
    } catch (err) {}
  };

  useEffect(() => {
    fetchBadges();
    const interval = setInterval(fetchBadges, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const markAllRead = async () => {
    try {
      await apiClient('/api/notifications/mark-read', { method: 'POST' });
      setNotifCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  return (
    <NotificationContext.Provider value={{ notifCount, msgCount, notifications, fetchBadges, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
};

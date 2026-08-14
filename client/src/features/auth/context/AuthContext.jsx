import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('campusconnect_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('campusconnect_token') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('campusconnect_refresh_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    authService.getMe()
      .then((userData) => {
        setUser(userData);
        localStorage.setItem('campusconnect_user', JSON.stringify(userData));
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const login = (authToken, userData, newRefreshToken) => {
    localStorage.setItem('campusconnect_token', authToken);
    localStorage.setItem('campusconnect_user', JSON.stringify(userData));
    if (newRefreshToken) {
      localStorage.setItem('campusconnect_refresh_token', newRefreshToken);
      setRefreshToken(newRefreshToken);
    }
    setToken(authToken);
    setUser(userData);
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('campusconnect_token');
    localStorage.removeItem('campusconnect_refresh_token');
    localStorage.removeItem('campusconnect_user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('campusconnect_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, loading, login, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

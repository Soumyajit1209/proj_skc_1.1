"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const decodeJWT = useCallback((token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }, []);

  const isTokenExpired = useCallback((token) => {
    if (!token) return true;
    
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }, [decodeJWT]);

  const getCookies = useCallback(() => {
    if (typeof document === 'undefined') return {};
    
    return document.cookie.split('; ').reduce((acc, cookie) => {
      const [name, value] = cookie.split('=');
      if (name && value) {
        acc[name] = decodeURIComponent(value);
      }
      return acc;
    }, {});
  }, []);

  const clearExpiredToken = useCallback(() => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
  }, []);

  const checkAuthStatus = useCallback(() => {
    const cookies = getCookies();
    const token = cookies.token;
    const role = cookies.role;
    const userData = cookies.user_data;

    console.log('Checking auth status:', { token, role, userData });

    if (!token || !role) {
      setUser(null);
      setLoading(false);
      return;
    }

    if (isTokenExpired(token)) {
      console.log('Token expired, clearing auth state');
      clearExpiredToken();
      setLoading(false);
      return;
    }

    let parsedUserData = {};
    if (userData) {
      try {
        parsedUserData = JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    setUser({ 
      token, 
      role,
      ...parsedUserData
    });
    setLoading(false);
  }, [getCookies, isTokenExpired, clearExpiredToken]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (!user?.token) return;

    const interval = setInterval(() => {
      const cookies = getCookies();
      const token = cookies.token;

      if (token && isTokenExpired(token)) {
        console.log('Token expired during session, logging out');
        clearExpiredToken();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [user?.token, getCookies, isTokenExpired, clearExpiredToken]);

  const login = useCallback((token, role, userData = {}) => {
    if (isTokenExpired(token)) {
      console.error('Cannot login with expired token');
      return;
    }

    console.log('Logging in user:', { token, role, userData });

    document.cookie = `token=${encodeURIComponent(token)}; path=/; secure; samesite=strict`;
    document.cookie = `role=${encodeURIComponent(role)}; path=/; secure; samesite=strict`;
    
    if (userData && Object.keys(userData).length > 0) {
      document.cookie = `user_data=${encodeURIComponent(JSON.stringify(userData))}; path=/; secure; samesite=strict`;
    }

    setUser({ token, role, ...userData });
  }, [isTokenExpired]);

  const logout = useCallback(() => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
  }, []);

  const isAdmin = useCallback(() => {
    return user?.role === 'admin' || user?.role === 'superadmin';
  }, [user?.role]);

  const isSuperAdmin = useCallback(() => {
    return user?.role === 'superadmin';
  }, [user?.role]);

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin,
    isSuperAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
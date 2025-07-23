
"use client"
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  // Helper function to decode JWT token
  const decodeJWT = useCallback((token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }, []);

  // Helper function to check if token is expired
  const isTokenExpired = useCallback((token) => {
    if (!token) return true;
    
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }, [decodeJWT]);

  // Helper function to get cookies
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

  // Function to clear expired token
  const clearExpiredToken = useCallback(() => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
    router.push('/login');
  }, [router]);

  // Function to check auth status
  const checkAuthStatus = useCallback(() => {
    const cookies = getCookies();
    const token = cookies.token;
    const role = cookies.role;

    if (!token || !role) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      console.log('Token expired, clearing auth state');
      clearExpiredToken();
      setLoading(false);
      return;
    }

    // Token is valid, set user
    setUser({ token, role });
    setLoading(false);
  }, [getCookies, isTokenExpired, clearExpiredToken]);

  // Function to check token expiration periodically
  const checkTokenExpiration = useCallback(() => {
    const cookies = getCookies();
    const token = cookies.token;

    if (token && isTokenExpired(token)) {
      console.log('Token expired during session, logging out');
      clearExpiredToken();
    }
  }, [getCookies, isTokenExpired, clearExpiredToken]);

  // Initial auth check
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Set up periodic token expiration check
  useEffect(() => {
    if (!user?.token) return;

    const interval = setInterval(() => {
      checkTokenExpiration();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user?.token, checkTokenExpiration]);

  const login = useCallback((token, role) => {
    // Check if the new token is already expired
    if (isTokenExpired(token)) {
      console.error('Cannot login with expired token');
      return;
    }

    document.cookie = `token=${encodeURIComponent(token)}; path=/; secure; samesite=strict`;
    document.cookie = `role=${encodeURIComponent(role)}; path=/; secure; samesite=strict`;
    setUser({ token, role });
    router.push('/');
  }, [isTokenExpired, router]);

  const logout = useCallback(() => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
    router.push('/login');
  }, [router]);

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
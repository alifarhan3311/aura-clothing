import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, setAuthToken } from '../lib/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Keep the API client token in sync with auth state
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  // Restore session on mount
  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          const meData = res.user || res.data || res;
          setUser(meData);
          localStorage.setItem('auth_user', JSON.stringify(meData));
        } catch (err) {
          console.warn('Session restoration failed:', err.message);
          // If token expired/invalid, clear local auth
          if (err.status === 401) {
            logout(false);
          }
        }
      }
      setLoading(false);
    }

    initAuth();
  }, []);

  // Save token and user session
  const saveSession = (authToken, userData) => {
    if (authToken) {
      setAuthToken(authToken);
      setToken(authToken);
      localStorage.setItem('token', authToken);
    }
    if (userData) {
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
    }
  };

  // Login action
  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      if (res.token && res.user) {
        saveSession(res.token, res.user);
      }
      return res;
    } catch (err) {
      throw err;
    }
  };

  // Register action
  const register = async (name, email, password) => {
    try {
      const res = await authApi.register({ name, email, password });
      return res;
    } catch (err) {
      throw err;
    }
  };

  // Verify OTP action
  const verifyOTP = async (email, otp) => {
    try {
      const res = await authApi.verifyOTP({ email, otp });
      if (res.token && res.user) {
        saveSession(res.token, res.user);
      }
      return res;
    } catch (err) {
      throw err;
    }
  };

  // Logout action
  const logout = (showToast = true) => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('auth_user');

    if (showToast) {
      toast.success('Logged out successfully', {
        style: { fontFamily: 'Inter, sans-serif', fontSize: '13px', borderRadius: '8px', background: '#1a1a1a', color: '#fff' },
      });
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === 'admin',
    login,
    register,
    verifyOTP,
    logout,
    saveSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

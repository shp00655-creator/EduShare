import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/profile');
        setUser(data);
      } catch (error) {
        console.error('Session validation failed:', error.message);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // Register user
  const signup = async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      localStorage.setItem('token', data.token);
      setUser(data);
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Registration failed';
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser(data);
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Login failed';
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Update profile
  const updateProfile = async (formData) => {
    try {
      const { data } = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      setUser(data);
      return { success: true, user: data };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Profile update failed';
      return { success: false, error: errMsg };
    }
  };

  // Change password
  const changePassword = async (oldPassword, newPassword) => {
    try {
      await api.put('/auth/password', { oldPassword, newPassword });
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Password update failed';
      return { success: false, error: errMsg };
    }
  };

  // Utility to refresh user bookmarks & credits in context
  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/profile');
      setUser(data);
    } catch (error) {
      console.error('Error refreshing profile:', error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout, updateProfile, changePassword, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

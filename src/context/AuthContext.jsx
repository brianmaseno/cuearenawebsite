import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      if (userInfo && userInfo.token) {
        try {
          // Set authorization header for the verification call
          api.defaults.headers.common['Authorization'] = `Bearer ${userInfo.token}`;
          const { data } = await api.get('/auth/me');
          // Update user info including latest status from server
          const updatedUser = { ...userInfo, ...data };
          sessionStorage.setItem('userInfo', JSON.stringify(updatedUser));
          setUser(updatedUser);
        } catch (err) {
          console.error('Token verification failed:', err);
          sessionStorage.removeItem('userInfo');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    sessionStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    sessionStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout log failed:', err);
    }
    sessionStorage.removeItem('userInfo');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    const updatedUser = { ...user, ...data };
    sessionStorage.setItem('userInfo', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  const value = useMemo(() => ({ 
    user, 
    loading, 
    login, 
    register, 
    logout, 
    updateProfile 
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

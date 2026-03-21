import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo && userInfo.token) {
        try {
          // Set authorization header for the verification call
          api.defaults.headers.common['Authorization'] = `Bearer ${userInfo.token}`;
          const { data } = await api.get('/auth/me');
          // Update user info including latest status from server
          const updatedUser = { ...userInfo, ...data };
          localStorage.setItem('userInfo', JSON.stringify(updatedUser));
          setUser(updatedUser);
        } catch (err) {
          console.error('Token verification failed:', err);
          localStorage.removeItem('userInfo');
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
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    const updatedUser = { ...user, ...data };
    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

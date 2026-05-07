import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const userStr = sessionStorage.getItem('userInfo');
      console.log('🔍 AuthContext: Verifying user...', userStr ? 'User data found' : 'No user data');
      
      if (userStr && userStr !== 'undefined' && userStr !== 'null') {
        try {
          const userInfo = JSON.parse(userStr);
          console.log('✅ AuthContext: Parsed user info:', userInfo.email, userInfo.role);
          
          if (userInfo && userInfo.token) {
            // Set user immediately from sessionStorage
            console.log('✅ AuthContext: Setting user from sessionStorage');
            setUser(userInfo);
            
            // Then try to verify with server
            api.defaults.headers.common['Authorization'] = `Bearer ${userInfo.token}`;
            try {
              console.log('🔄 AuthContext: Verifying with server...');
              const { data } = await api.get('/auth/me');
              console.log('✅ AuthContext: Server verification successful');
              // Update user info including latest status from server
              const updatedUser = { ...userInfo, ...data };
              sessionStorage.setItem('userInfo', JSON.stringify(updatedUser));
              setUser(updatedUser);
            } catch (verifyErr) {
              // If verification fails, keep the user from sessionStorage
              // Only log the error, don't clear the user
              console.warn('⚠️ AuthContext: Server verification failed, using cached data:', verifyErr.message);
              console.warn('⚠️ AuthContext: Error details:', verifyErr.response?.data);
              // User is already set from sessionStorage, so dashboard will still work
            }
          }
        } catch (err) {
          console.error('❌ AuthContext: Token parsing failed:', err);
          sessionStorage.removeItem('userInfo');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        }
      } else {
        console.log('ℹ️ AuthContext: No user in sessionStorage');
      }
      setLoading(false);
      console.log('✅ AuthContext: Verification complete');
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

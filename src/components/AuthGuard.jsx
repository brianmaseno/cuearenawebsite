import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();

  // If loading, don't do anything yet to avoid flashes
  if (loading) return null;

  // If user is already authenticated, redirect them to their dashboard
  if (user) {
    const dashboard = 
      user.role === 'admin' ? '/admin' : 
      user.role === 'moderator' ? '/moderator/ongoing' : 
      '/dashboard';
    return <Navigate to={dashboard} replace />;
  }

  // If not authenticated, allow access to public auth pages (login/register)
  return children;
};

export default AuthGuard;

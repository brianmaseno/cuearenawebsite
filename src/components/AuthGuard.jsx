import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();

  // Show spinner while auth check is in progress
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

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

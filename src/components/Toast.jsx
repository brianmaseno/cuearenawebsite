import React from 'react';
import { Toaster } from 'react-hot-toast';

/**
 * Enhanced Toast Configuration
 * Wraps react-hot-toast with custom styling
 */
const Toast = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options
        duration: 4000,
        style: {
          background: 'var(--color-base3)',
          color: 'var(--color-text-emphasis)',
          border: '1px solid var(--color-base2)',
          borderRadius: '1rem',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '700',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          backdropFilter: 'blur(16px)',
        },
        // Success
        success: {
          duration: 3000,
          style: {
            background: 'var(--color-base3)',
            border: '2px solid var(--color-green)',
            boxShadow: '0 8px 32px rgba(133, 153, 0, 0.2)',
          },
          iconTheme: {
            primary: 'var(--color-green)',
            secondary: 'var(--color-base3)',
          },
        },
        // Error
        error: {
          duration: 5000,
          style: {
            background: 'var(--color-base3)',
            border: '2px solid var(--color-red)',
            boxShadow: '0 8px 32px rgba(220, 50, 47, 0.2)',
          },
          iconTheme: {
            primary: 'var(--color-red)',
            secondary: 'var(--color-base3)',
          },
        },
        // Loading
        loading: {
          style: {
            background: 'var(--color-base3)',
            border: '2px solid var(--color-primary)',
            boxShadow: '0 8px 32px rgba(38, 139, 210, 0.2)',
          },
          iconTheme: {
            primary: 'var(--color-primary)',
            secondary: 'var(--color-base3)',
          },
        },
      }}
    />
  );
};

export default Toast;

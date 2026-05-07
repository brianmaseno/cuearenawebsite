import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * Enhanced Button Component with modern animations and variants
 * 
 * @param {string} variant - 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success'
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} disabled - Disable button
 * @param {React.ReactNode} icon - Icon component (from lucide-react)
 * @param {string} iconPosition - 'left' | 'right'
 * @param {boolean} fullWidth - Make button full width
 * @param {string} className - Additional CSS classes
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'right',
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-black uppercase tracking-wider transition-all duration-300 relative overflow-hidden';

  const variantClasses = {
    primary: 'aura-btn',
    secondary: 'bg-violet text-text-light hover:bg-violet/90 rounded-2xl shadow-lg hover:shadow-xl',
    ghost: 'btn-ghost',
    outline: 'btn-outline',
    danger: 'aura-btn-rose',
    success: 'aura-btn-emerald',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs rounded-xl',
    md: 'px-6 py-3 text-sm rounded-2xl',
    lg: 'px-8 py-4 text-base rounded-2xl',
    xl: 'px-12 py-5 text-lg rounded-2xl',
  };

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';
  const widthClasses = fullWidth ? 'w-full' : '';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${widthClasses} ${className}`;

  return (
    <motion.button
      type={type}
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={size === 'sm' ? 14 : size === 'md' ? 16 : size === 'lg' ? 18 : 20} className="animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : size === 'md' ? 16 : size === 'lg' ? 18 : 20} />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : size === 'md' ? 16 : size === 'lg' ? 18 : 20} />}
        </>
      )}
    </motion.button>
  );
};

export default Button;

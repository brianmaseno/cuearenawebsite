import React from 'react';
import { motion } from 'framer-motion';

/**
 * Enhanced Badge Component for status indicators
 * 
 * @param {string} variant - 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {React.ReactNode} icon - Icon component (from lucide-react)
 * @param {boolean} pulse - Add pulse animation
 * @param {boolean} dot - Show dot indicator
 * @param {string} className - Additional CSS classes
 */
const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  pulse = false,
  dot = false,
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary: 'badge-primary',
    success: 'badge-success',
    danger: 'badge-danger',
    warning: 'badge-warning',
    info: 'bg-blue/10 text-blue border border-blue/20',
    neutral: 'bg-base2/50 text-text border border-base2',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-4 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  const combinedClasses = `badge ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <motion.span
      className={combinedClasses}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {dot && (
        <span className={`relative inline-block w-1.5 h-1.5 rounded-full ${pulse ? 'pulse-dot' : 'bg-current'}`} />
      )}
      {Icon && <Icon size={iconSizes[size]} />}
      <span>{children}</span>
    </motion.span>
  );
};

/**
 * Status Badge - Pre-configured badge for common statuses
 */
export const StatusBadgeEnhanced = ({ status, ...props }) => {
  const statusConfig = {
    active: { variant: 'success', text: 'Active', pulse: true },
    inactive: { variant: 'neutral', text: 'Inactive' },
    pending: { variant: 'warning', text: 'Pending', pulse: true },
    completed: { variant: 'success', text: 'Completed' },
    cancelled: { variant: 'danger', text: 'Cancelled' },
    ongoing: { variant: 'primary', text: 'Ongoing', pulse: true },
    open: { variant: 'info', text: 'Open' },
    closed: { variant: 'neutral', text: 'Closed' },
  };

  const config = statusConfig[status] || { variant: 'neutral', text: status };

  return (
    <Badge
      variant={config.variant}
      pulse={config.pulse}
      dot={config.pulse}
      {...props}
    >
      {config.text}
    </Badge>
  );
};

export default Badge;

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Enhanced Card Component with modern animations and variants
 * 
 * @param {string} variant - 'default' | 'premium' | 'aura' | 'glass'
 * @param {boolean} hoverable - Enable hover effects
 * @param {boolean} clickable - Enable click effects
 * @param {React.ReactNode} header - Card header content
 * @param {React.ReactNode} footer - Card footer content
 * @param {string} className - Additional CSS classes
 */
const Card = ({
  children,
  variant = 'default',
  hoverable = true,
  clickable = false,
  header,
  footer,
  className = '',
  onClick,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-base3 border border-base2 rounded-2xl shadow-sm',
    premium: 'card-premium',
    aura: 'aura-card',
    glass: 'glass-premium rounded-3xl',
  };

  const hoverClasses = hoverable && !clickable ? 'hover-lift' : '';
  const clickableClasses = clickable ? 'cursor-pointer active:scale-[0.98]' : '';

  const combinedClasses = `${variantClasses[variant]} ${hoverClasses} ${clickableClasses} ${className}`;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    },
    hover: hoverable ? {
      y: -8,
      transition: { duration: 0.3, ease: 'easeOut' }
    } : {}
  };

  return (
    <motion.div
      className={combinedClasses}
      onClick={onClick}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      {...props}
    >
      {header && (
        <div className="border-b border-base2/50 p-6 bg-base3/40">
          {header}
        </div>
      )}
      
      <div className="p-6">
        {children}
      </div>

      {footer && (
        <div className="border-t border-base2/50 p-6 bg-base3/40">
          {footer}
        </div>
      )}
    </motion.div>
  );
};

export default Card;

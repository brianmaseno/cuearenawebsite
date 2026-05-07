import React from 'react';
import { motion } from 'framer-motion';

/**
 * Loading Skeleton Component for better loading states
 * 
 * @param {string} variant - 'text' | 'circle' | 'rectangle' | 'card'
 * @param {number} width - Width in pixels or percentage string
 * @param {number} height - Height in pixels
 * @param {number} count - Number of skeleton items to render
 * @param {string} className - Additional CSS classes
 */
const LoadingSkeleton = ({
  variant = 'rectangle',
  width,
  height,
  count = 1,
  className = '',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'skeleton-text';
      case 'circle':
        return 'skeleton-circle';
      case 'card':
        return 'skeleton rounded-3xl';
      default:
        return 'skeleton';
    }
  };

  const getDefaultDimensions = () => {
    switch (variant) {
      case 'text':
        return { width: '100%', height: 16 };
      case 'circle':
        return { width: 48, height: 48 };
      case 'card':
        return { width: '100%', height: 200 };
      default:
        return { width: '100%', height: 40 };
    }
  };

  const defaults = getDefaultDimensions();
  const finalWidth = width || defaults.width;
  const finalHeight = height || defaults.height;

  const style = {
    width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
    height: `${finalHeight}px`,
  };

  const shimmerVariants = {
    initial: { backgroundPosition: '-200% 0' },
    animate: {
      backgroundPosition: '200% 0',
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className={`${getVariantClasses()} ${className}`}
          style={style}
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
        />
      ))}
    </>
  );
};

/**
 * Card Skeleton - Pre-configured skeleton for card layouts
 */
export const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-base3 border border-base2 rounded-3xl p-6 ${className}`}>
    <div className="flex items-center gap-4 mb-4">
      <LoadingSkeleton variant="circle" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <LoadingSkeleton variant="text" width="60%" height={16} />
        <LoadingSkeleton variant="text" width="40%" height={12} />
      </div>
    </div>
    <div className="space-y-3">
      <LoadingSkeleton variant="text" width="100%" height={12} />
      <LoadingSkeleton variant="text" width="90%" height={12} />
      <LoadingSkeleton variant="text" width="70%" height={12} />
    </div>
    <div className="mt-6">
      <LoadingSkeleton variant="rectangle" width="100%" height={40} />
    </div>
  </div>
);

/**
 * Table Skeleton - Pre-configured skeleton for table layouts
 */
export const TableSkeleton = ({ rows = 5, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="flex items-center gap-4">
        <LoadingSkeleton variant="circle" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" width="80%" height={14} />
          <LoadingSkeleton variant="text" width="60%" height={12} />
        </div>
        <LoadingSkeleton variant="rectangle" width={80} height={32} />
      </div>
    ))}
  </div>
);

/**
 * Dashboard Skeleton - Pre-configured skeleton for dashboard stats
 */
export const DashboardSkeleton = ({ cards = 4, className = '' }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
    {Array.from({ length: cards }).map((_, index) => (
      <div key={index} className="bg-base3 border border-base2 rounded-2xl p-6">
        <div className="flex justify-between items-start mb-4">
          <LoadingSkeleton variant="circle" width={48} height={48} />
          <LoadingSkeleton variant="rectangle" width={60} height={24} />
        </div>
        <LoadingSkeleton variant="text" width="40%" height={12} className="mb-2" />
        <LoadingSkeleton variant="text" width="60%" height={32} className="mb-4" />
        <LoadingSkeleton variant="text" width="80%" height={10} />
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;

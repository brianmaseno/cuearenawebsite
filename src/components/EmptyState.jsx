import React from 'react';
import { motion } from 'framer-motion';
import { Inbox, Search, AlertCircle, FileQuestion, Trophy, Users } from 'lucide-react';
import Button from './Button';

/**
 * Enhanced Empty State Component
 * 
 * @param {string} variant - 'default' | 'search' | 'error' | 'tournament' | 'users'
 * @param {string} title - Main heading
 * @param {string} description - Description text
 * @param {React.ReactNode} icon - Custom icon component
 * @param {React.ReactNode} action - Action button or component
 * @param {string} className - Additional CSS classes
 */
const EmptyState = ({
  variant = 'default',
  title,
  description,
  icon: CustomIcon,
  action,
  className = '',
}) => {
  const getDefaultIcon = () => {
    switch (variant) {
      case 'search':
        return Search;
      case 'error':
        return AlertCircle;
      case 'tournament':
        return Trophy;
      case 'users':
        return Users;
      default:
        return Inbox;
    }
  };

  const Icon = CustomIcon || getDefaultIcon();

  const getDefaultContent = () => {
    switch (variant) {
      case 'search':
        return {
          title: title || 'No results found',
          description: description || 'Try adjusting your search or filters to find what you\'re looking for.',
        };
      case 'error':
        return {
          title: title || 'Something went wrong',
          description: description || 'We encountered an error loading this content. Please try again.',
        };
      case 'tournament':
        return {
          title: title || 'No tournaments yet',
          description: description || 'Create your first tournament to get started.',
        };
      case 'users':
        return {
          title: title || 'No users found',
          description: description || 'There are no users matching your criteria.',
        };
      default:
        return {
          title: title || 'Nothing here yet',
          description: description || 'Get started by creating your first item.',
        };
    }
  };

  const content = getDefaultContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}
    >
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative mb-6"
      >
        {/* Background Glow */}
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-150" />
        
        {/* Icon Container */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative w-24 h-24 bg-base2/50 rounded-3xl flex items-center justify-center text-text/30 border border-base2"
        >
          <Icon size={48} strokeWidth={1.5} />
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-2xl font-black text-text-emphasis mb-3 tracking-tight"
      >
        {content.title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-text/60 font-medium max-w-md mb-8 leading-relaxed"
      >
        {content.description}
      </motion.p>

      {/* Action */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * Pre-configured Empty States
 */
export const NoTournaments = ({ onCreateClick }) => (
  <EmptyState
    variant="tournament"
    title="No active tournaments"
    description="Create your first tournament and start competing with players around you."
    action={
      onCreateClick && (
        <Button variant="primary" onClick={onCreateClick}>
          Create Tournament
        </Button>
      )
    }
  />
);

export const NoSearchResults = ({ searchTerm }) => (
  <EmptyState
    variant="search"
    title="No results found"
    description={searchTerm ? `No results found for "${searchTerm}". Try different keywords.` : 'Try adjusting your search criteria.'}
  />
);

export const ErrorState = ({ onRetry }) => (
  <EmptyState
    variant="error"
    title="Oops! Something went wrong"
    description="We couldn't load this content. Please try again or contact support if the problem persists."
    action={
      onRetry && (
        <Button variant="primary" onClick={onRetry}>
          Try Again
        </Button>
      )
    }
  />
);

export default EmptyState;

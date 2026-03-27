import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trophy, Target, X, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Only show for moderators (Admins have their own full panels)
  if (!user || user.role !== 'moderator') return null;

  const actions = [
    {
      label: 'New Tournament',
      path: '/moderator/create-tournament',
      color: 'bg-violet-600',
      icon: Trophy
    },
    {
      label: 'New Match',
      path: '/moderator/create-match',
      color: 'bg-blue-600',
      icon: Target
    },
    {
      label: 'New Battle',
      path: '/moderator/create-battle',
      color: 'bg-amber-600',
      icon: Shield
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="flex flex-col items-end gap-2 mb-2"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.path}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  navigate(action.path);
                  setIsOpen(false);
                }}
                className={`${action.color} text-base3 px-5 py-3 rounded-2xl shadow-xl hover:scale-105 transition-all active:scale-95 font-bold text-sm whitespace-nowrap flex items-center gap-3 border border-white/10`}
              >
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                   <action.icon size={14} />
                </div>
                {action.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-base2 text-text-emphasis rotate-90' : 'bg-primary text-base3'
        } hover:scale-105 active:scale-95`}
      >
        {isOpen ? <X size={28} /> : <Plus size={28} />}
      </button>

      {/* Backdrop for closing when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-transparent z-[-1]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default FloatingActionButton;

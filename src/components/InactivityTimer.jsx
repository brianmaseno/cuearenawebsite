import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock, LogOut } from 'lucide-react';

const InactivityTimer = () => {
  const { user, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes warning countdown

  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  const TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours
  const WARNING_COUNTDOWN = 5 * 60; // 5 minutes
  const WARNING_TIME = TIMEOUT - (WARNING_COUNTDOWN * 1000);

  const handleLogout = useCallback(() => {
    logout();
    setShowWarning(false);
  }, [logout]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setTimeLeft(WARNING_COUNTDOWN);
    }
  }, [showWarning]);

  useEffect(() => {
    if (!user) return;

    // Reset activity timer when user state changes (on login)
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setTimeLeft(WARNING_COUNTDOWN);

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    const activityHandler = () => resetTimer();

    events.forEach(event => {
      window.addEventListener(event, activityHandler);
    });

    // Main check interval
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const diff = now - lastActivityRef.current;

      if (diff >= TIMEOUT) {
        handleLogout();
      } else if (diff >= WARNING_TIME && !showWarning) {
        setShowWarning(true);
        setTimeLeft(Math.ceil((TIMEOUT - diff) / 1000));
      }
    }, 1000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, activityHandler);
      });
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [user, resetTimer, handleLogout, showWarning]);

  // Countdown logic when warning is shown
  useEffect(() => {
    if (showWarning && timeLeft > 0) {
      countdownRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownRef.current) clearInterval(countdownRef.current);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [showWarning, timeLeft]);

  if (!user || !showWarning) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[#fcf9f1] dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-700"
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400">
                <AlertCircle size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Inactivity Warning</h3>
                <p className="text-slate-500 dark:text-slate-400">You've been idle for a while.</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-6 flex items-center justify-between border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Clock className="text-primary" size={20} />
                <span className="font-medium text-slate-700 dark:text-slate-300">Logging out in</span>
              </div>
              <span className="text-2xl font-black text-primary tabular-nums">
                {Math.ceil(timeLeft / 60)}m
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <LogOut size={18} />
                Logout Now
              </button>
              <button
                onClick={resetTimer}
                className="px-4 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors"
              >
                Stay Logged In
              </button>
            </div>
          </div>

          <div className="h-1.5 bg-slate-100 dark:bg-slate-700 w-full overflow-hidden">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: timeLeft, ease: "linear" }}
              className="h-full bg-primary"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InactivityTimer;

import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const useActivityTracker = () => {
  const { user } = useAuth();
  const location = useLocation();
  const logQueue = useRef([]);
  const timerRef = useRef(null);

  const flushLogs = useCallback(async () => {
    if (logQueue.current.length === 0 || !user) return;

    const logsToSend = [...logQueue.current];
    logQueue.current = [];

    try {
      await api.post('/admin/audit/log', { logs: logsToSend });
    } catch (err) {
      console.error('Failed to send activity logs:', err);
      // Put back in queue if failed? For now, we just drop to avoid loops
    }
  }, [user]);

  const addLog = useCallback((action, description, details = {}) => {
    if (!user) return;

    logQueue.current.push({
      action,
      description,
      severity: 'info',
      ...details
    });

    if (logQueue.current.length >= 10) {
      flushLogs();
    }
  }, [user, flushLogs]);

  // Track Navigation
  useEffect(() => {
    if (user) {
      addLog('NAVIGATION', `User navigated to ${location.pathname}`);
    }
  }, [location.pathname, user, addLog]);

  // Track Clicks
  useEffect(() => {
    if (!user) return;

    const handleClick = (e) => {
      const target = e.target.closest('button, a, [role="button"]');
      if (target) {
        const text = target.innerText || target.getAttribute('aria-label') || target.getAttribute('title') || 'unlabeled element';
        const type = target.tagName.toLowerCase() === 'button' ? 'BUTTON_CLICK' : 
                     target.tagName.toLowerCase() === 'a' ? 'LINK_CLICK' : 'ELEMENT_CLICK';
        
        addLog(type, `User clicked: "${text.trim().substring(0, 50)}"`);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [user, addLog]);

  // Periodic Flush
  useEffect(() => {
    timerRef.current = setInterval(flushLogs, 10000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      flushLogs(); // Final flush on unmount
    };
  }, [flushLogs]);

  return null;
};

export default useActivityTracker;

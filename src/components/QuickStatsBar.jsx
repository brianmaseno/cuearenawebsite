import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const QuickStatsBar = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data } = await api.get('/users/me/metrics');
        setMetrics(data);
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4 bg-base3/50 rounded-2xl border border-base2/50 animate-pulse">
        <Loader2 size={16} className="animate-spin text-primary/40" />
        <div className="h-4 bg-base2/50 rounded w-48"></div>
      </div>
    );
  }

  if (!metrics || !metrics.stats) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mb-8"
    >
      <div className="shrink-0">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text/30 mb-1">{metrics.title}</h4>
        <div className="h-1 w-8 bg-primary/20 rounded-full"></div>
      </div>
      
      <div className="flex flex-wrap gap-3 md:gap-6 items-center">
        {metrics.stats.map((stat, idx) => (
          <div key={idx} className="flex items-center gap-3 group">
            <div className={`p-2 rounded-xl bg-${stat.color || 'primary'}/10 border border-${stat.color || 'primary'}/20 group-hover:scale-110 transition-transform`}>
               <div className={`w-1.5 h-1.5 rounded-full bg-${stat.color || 'primary'}`} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-text/40 leading-none mb-1">{stat.label}</p>
              <p className="text-lg font-black text-text-emphasis leading-none tabular-nums tracking-tighter">{stat.value}</p>
            </div>
            {idx < metrics.stats.length - 1 && (
              <div className="hidden md:block w-px h-6 bg-base2/50 ml-2" />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickStatsBar;

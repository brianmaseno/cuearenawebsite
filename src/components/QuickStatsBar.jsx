import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  Target, 
  Trophy, 
  Activity, 
  Star, 
  Shield, 
  Users, 
  ClipboardList, 
  Clock,
  Wallet
} from 'lucide-react';

const icons = {
  Target,
  Trophy,
  Activity,
  Star,
  Shield,
  Users,
  ClipboardList,
  Clock,
  Wallet
};

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 bg-base3/50 rounded-2xl border border-base2/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!metrics || !metrics.stats) return null;

  return (
    <div className="mb-8">
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {metrics.stats.map((stat, idx) => {
          const Icon = icons[stat.icon] || Activity;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`card-premium p-4 rounded-2xl flex items-center justify-between group cursor-default border-none ring-1 ring-base2 shadow-sm hover:shadow-md hover:ring-primary/20 ${
                idx >= 2 ? 'hidden md:flex' : 'flex'
              }`}
            >
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-text/40 mb-1 group-hover:text-primary transition-colors">
                  {stat.label}
                </p>
                {stat.value && (
                  <p className="text-xl font-black text-text-emphasis leading-none tabular-nums tracking-tighter">
                    {stat.value}
                  </p>
                )}
                {stat.form && (
                  <div className="flex gap-1.5 mt-2">
                    {stat.form.map((res, i) => (
                      <span 
                        key={i} 
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black shadow-sm ${
                          res === 'W' ? 'bg-green text-base3' : 'bg-red text-base3'
                        }`}
                      >
                        {res}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className={`p-2.5 rounded-xl bg-${stat.color || 'primary'}/10 text-${stat.color || 'primary'} group-hover:scale-110 transition-transform shadow-inner`}>
                <Icon size={20} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickStatsBar;

import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Loader2, 
  Target, 
  Trophy, 
  Activity, 
  Shield, 
  Users, 
  ClipboardList, 
  Clock,
  Wallet
} from 'lucide-react';
import AuraCard from './AuraCard';

const icons = {
  Target,
  Trophy,
  Activity,
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
          const color = stat.color || 'primary';
          
          // Map standard colors to Aura/System Intelligence tokens
          const colorMap = {
            'blue': 'primary',
            'purple': 'aura-violet',
            'green': 'emerald-500',
            'orange': 'amber-500',
            'red': 'aura-crimson',
            'primary': 'primary'
          };
          
          const themeColor = colorMap[color] || color;

          return (
            <AuraCard 
              key={idx}
              className={`p-5 flex flex-col justify-between group cursor-default relative overflow-hidden transition-all duration-300 ${
                idx >= 4 ? 'hidden xl:flex' : idx >= 2 ? 'hidden md:flex' : 'flex'
              } border-2 border-${themeColor}/20 bg-${themeColor}/[0.04] min-h-[140px]`}
            >
              <div className={`absolute inset-0 bg-${themeColor}/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
              
              {/* Top Row: Icon */}
              <div className="flex justify-between items-start mb-4 relative z-10 w-full">
                <div className={`p-2.5 rounded-xl bg-${themeColor}/10 text-${themeColor} group-hover:scale-110 group-hover:rotate-3 transition-all shadow-inner border border-${themeColor}/20 relative z-10`}>
                  <Icon size={20} />
                </div>
              </div>

              {/* Content Area */}
              <div className="min-w-0 relative z-10">
                <p className={`text-[10px] font-black uppercase tracking-widest text-${themeColor}/60 mb-1.5 group-hover:text-${themeColor} transition-colors`}>
                  {stat.label}
                </p>
                {stat.value && (
                  <p className="text-3xl font-black text-text-emphasis leading-none tabular-nums tracking-tighter">
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

              <div className={`absolute -right-4 -bottom-4 w-12 h-12 bg-${themeColor}/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700`} />
            </AuraCard>
          );
        })}
      </div>
    </div>
  );
};

export default QuickStatsBar;

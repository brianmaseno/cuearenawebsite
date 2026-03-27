import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart,
  BarChart,
  Calendar,
  LayoutDashboard,
  Wallet,
  Zap
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import AuraCard from '../../components/AuraCard';

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/metrics/detailed?range=${timeRange}`);
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading && !stats) return (
    <DashboardLayout title="System Analytics">
      <div className="p-4 md:p-8 animate-pulse space-y-8 max-w-[1400px] mx-auto">
        <div className="h-32 bg-base3/40 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-base3/40 rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80 bg-base3/40 rounded-3xl"></div>
          <div className="h-80 bg-base3/40 rounded-3xl"></div>
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Performance Insights">
      <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto font-sans">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-text-emphasis flex items-center gap-3 tracking-tight">
              <span className="p-2.5 bg-primary/10 rounded-2xl border border-primary/20 shadow-lg shadow-primary/5">
                <LayoutDashboard className="text-primary w-8 h-8" />
              </span>
              System <span className="text-primary">Intelligence</span>
            </h1>
            <p className="text-text/60 mt-2 font-medium">Real-time financial performance and operational health metrics.</p>
          </div>
          
          <div className="flex items-center gap-1.5 bg-base3/60 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl shadow-inner">
            {[
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: 'all', label: 'All Time' }
            ].map((period) => (
              <button 
                key={period.id}
                onClick={() => setTimeRange(period.id)}
                className={`px-5 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
                  timeRange === period.id 
                  ? 'bg-primary text-text-light shadow-lg shadow-primary/30 scale-[1.02]' 
                  : 'text-text/40 hover:text-text-emphasis hover:bg-base2/20'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Main KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={itemVariants}>
              <AuraCard className="relative group overflow-hidden border-emerald-500/20 bg-emerald-500/[0.04] p-6 lg:p-7 min-h-[160px] flex flex-col justify-between shadow-sm">
                 <div className="flex justify-between items-start relative z-10 w-full mb-4">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-[10px] font-black uppercase text-emerald-600/80 tracking-[0.2em] mb-3 truncate">Total Revenue</p>
                      <h2 className="text-3xl font-black text-slate-850 leading-none whitespace-nowrap overflow-hidden text-ellipsis">
                        <span className="text-emerald-500 mr-1.5 text-xl">KES</span>
                        {stats?.totalRevenue?.toLocaleString() || '0'}
                      </h2>
                    </div>
                    <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/10 group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                      <Wallet size={24} />
                    </div>
                 </div>
                 <div className="flex items-center gap-2 text-[11px] font-black text-emerald-600 relative z-10 mt-auto">
                    <div className="flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/10">
                      <ArrowUpRight size={14} className="mr-1" />
                      <span>{stats?.revenueTrend || '12.5'}%</span>
                    </div>
                    <span className="opacity-50 font-bold uppercase tracking-tighter">vs previous</span>
                 </div>
                 <motion.div 
                   className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500 opacity-[0.05] blur-[50px] pointer-events-none"
                   animate={{ scale: [1, 1.4, 1], opacity: [0.05, 0.12, 0.05] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 />
              </AuraCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <AuraCard className="relative group overflow-hidden border-blue-500/20 bg-blue-500/[0.04] p-6 lg:p-7 min-h-[160px] flex flex-col justify-between shadow-sm">
                 <div className="flex justify-between items-start relative z-10 w-full mb-4">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-[10px] font-black uppercase text-blue-600/80 tracking-[0.2em] mb-3 truncate">New Players</p>
                      <h2 className="text-3xl font-black text-slate-850 leading-none whitespace-nowrap overflow-hidden text-ellipsis">
                        {stats?.activePlayers || '0'}
                      </h2>
                    </div>
                    <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl border border-blue-500/10 group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                      <Users size={24} />
                    </div>
                 </div>
                 <div className="flex items-center gap-2 text-[11px] font-black text-blue-600 relative z-10 mt-auto">
                    <div className="flex items-center bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/10">
                      <ArrowUpRight size={14} className="mr-1" />
                      <span>+{stats?.newPlayers || '48'}</span>
                    </div>
                    <span className="opacity-50 font-bold uppercase tracking-tighter">Growth trend</span>
                 </div>
                 <motion.div 
                   className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500 opacity-[0.05] blur-[50px] pointer-events-none"
                   animate={{ scale: [1, 1.4, 1], opacity: [0.05, 0.12, 0.05] }}
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                 />
              </AuraCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <AuraCard className="relative group overflow-hidden border-primary/20 bg-primary/[0.04] p-6 lg:p-7 min-h-[160px] flex flex-col justify-between shadow-sm">
                 <div className="flex justify-between items-start relative z-10 w-full mb-4">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-[10px] font-black uppercase text-primary/70 tracking-[0.2em] mb-3 truncate">Live Capacity</p>
                      <h2 className="text-3xl font-black text-slate-850 leading-none whitespace-nowrap overflow-hidden text-ellipsis">
                        {stats?.occupancyRate || '0'}%
                      </h2>
                    </div>
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl border border-primary/10 group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                      <Zap size={24} />
                    </div>
                 </div>
                 <div className="flex items-center gap-2 text-[11px] font-black text-primary relative z-10 mt-auto">
                    <div className="flex items-center bg-primary/10 px-2 py-0.5 rounded-full border border-primary/10">
                      <Activity size={14} className="mr-1" />
                      <span>{stats?.occupancyRate > 70 ? 'High' : 'Optimal'}</span>
                    </div>
                    <span className="opacity-50 font-bold uppercase tracking-tighter">Peak: {stats?.peakTime || '10 PM'}</span>
                 </div>
                 <motion.div 
                   className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary opacity-[0.05] blur-[50px] pointer-events-none"
                   animate={{ scale: [1, 1.4, 1], opacity: [0.05, 0.12, 0.05] }}
                   transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                 />
              </AuraCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <AuraCard className="relative group overflow-hidden border-orange/20 bg-orange/[0.04] p-6 lg:p-7 min-h-[160px] flex flex-col justify-between shadow-sm">
                 <div className="flex justify-between items-start relative z-10 w-full mb-4">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-[10px] font-black uppercase text-orange/70 tracking-[0.2em] mb-3 truncate">Total Events</p>
                      <h2 className="text-3xl font-black text-slate-850 leading-none whitespace-nowrap overflow-hidden text-ellipsis">
                        {stats?.totalTournaments || '0'}
                      </h2>
                    </div>
                    <div className="p-3 bg-orange/10 text-orange rounded-2xl border border-orange/10 group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                      <Calendar size={24} />
                    </div>
                 </div>
                 <div className="flex items-center gap-2 text-[11px] font-black text-orange relative z-10 mt-auto">
                    <div className="flex items-center bg-orange/10 px-2 py-0.5 rounded-full border border-orange/10">
                      <TrendingUp size={14} className="mr-1" />
                      <span>Active</span>
                    </div>
                    <span className="opacity-50 font-bold uppercase tracking-tighter">Cumulative Total</span>
                 </div>
                 <motion.div 
                   className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange opacity-[0.05] blur-[50px] pointer-events-none"
                   animate={{ scale: [1, 1.4, 1], opacity: [0.05, 0.12, 0.05] }}
                   transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                 />
              </AuraCard>
            </motion.div>
          </div>

          {/* Visual Data Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div variants={itemVariants}>
              <AuraCard className="h-[440px] flex flex-col p-6 lg:p-8 bg-base3/20 backdrop-blur-2xl">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="font-black text-text-emphasis flex items-center gap-2 uppercase tracking-[0.2em] text-xs">
                      <BarChart size={18} className="text-primary" />
                      Weekly Performance
                    </h3>
                    <p className="text-[10px] text-text/40 font-bold uppercase mt-1">Growth trajectory over 7 days</p>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Positive</span>
                  </div>
                </div>
                
                <div className="flex-1 flex items-end gap-3 lg:gap-4 pb-4">
                  {[45, 65, 40, 85, 75, 95, 60].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                      <div className="relative w-full h-full flex items-end">
                        {/* Bar Segment */}
                        <motion.div 
                          className="w-full bg-gradient-to-t from-primary/10 to-primary/50 group-hover:from-primary/20 group-hover:to-primary/70 transition-all duration-500 rounded-t-xl relative border-x border-t border-primary/20 shadow-lg shadow-primary/5"
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                        >
                          {/* Value Tooltip */}
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 z-20 pointer-events-none">
                             <div className="bg-base3 text-text-emphasis text-[10px] px-2.5 py-1.5 rounded-xl font-black whitespace-nowrap shadow-2xl border border-primary/20">
                               KES {(h * 1.5).toFixed(1)}K
                             </div>
                             <div className="w-2.5 h-2.5 bg-base3 rotate-45 -mt-1.5 mx-auto border-r border-b border-primary/20"></div>
                          </div>
                        </motion.div>
                      </div>
                      <span className="text-[10px] text-text/30 font-black uppercase tracking-widest mt-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </AuraCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <AuraCard className="h-[440px] flex flex-col p-6 lg:p-8 bg-base3/20 backdrop-blur-2xl">
                 <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="font-black text-text-emphasis flex items-center gap-2 uppercase tracking-[0.2em] text-xs">
                      <PieChart size={18} className="text-blue-500" />
                      Activity Insight
                    </h3>
                    <p className="text-[10px] text-text/40 font-bold uppercase mt-1">Activity type by session volume</p>
                  </div>
                  <Activity size={20} className="text-blue-500 opacity-50" />
                </div>

                <div className="flex-1 flex flex-col gap-10 justify-center">
                  {[
                    { label: 'Tournaments', value: 45, color: 'bg-primary' },
                    { label: 'Direct Matches', value: 35, color: 'bg-blue-500' },
                    { label: 'Battle Mode', value: 20, color: 'bg-emerald-500' }
                  ].map((item, idx) => (
                    <div key={item.label} className="space-y-4">
                       <div className="flex justify-between items-end">
                         <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${item.color} shadow-lg shadow-base3/5`} />
                            <span className="text-xs font-black uppercase tracking-[0.1em] text-text/60">{item.label}</span>
                         </div>
                         <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-text-emphasis tracking-tighter">{item.value}</span>
                            <span className="text-[10px] font-black text-text/30 uppercase">%</span>
                         </div>
                       </div>
                       <div className="w-full h-3 bg-base3/80 rounded-full overflow-hidden border border-base3/5 relative shadow-inner">
                         <motion.div 
                           className={`h-full ${item.color} shadow-[0_0_20px_-5px_rgba(38,139,210,0.4)]`}
                           initial={{ width: 0 }}
                           animate={{ width: `${item.value}%` }}
                           transition={{ duration: 1.5, delay: 0.5 + idx * 0.2, ease: "easeOut" }}
                         />
                       </div>
                    </div>
                  ))}
                </div>
              </AuraCard>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;

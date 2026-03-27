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
  Calendar
} from 'lucide-react';
import AuraCard from '../../components/AuraCard';

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/metrics/detailed');
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
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) return (
    <div className="p-8 animate-pulse space-y-8">
      <div className="h-32 bg-dark-lighter rounded-2xl"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-dark-lighter rounded-xl"></div>)}
      </div>
      <div className="h-64 bg-dark-lighter rounded-2xl"></div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="text-primary w-8 h-8" />
            System Analytics
          </h1>
          <p className="text-gray-400">Financial performance and operational insights</p>
        </div>
        <div className="flex items-center gap-2 bg-dark-lighter p-1 rounded-xl border border-white/5">
          <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-lg">Last 30 Days</button>
          <button className="px-4 py-2 text-gray-500 text-xs font-bold hover:text-white transition-colors">90 Days</button>
          <button className="px-4 py-2 text-gray-500 text-xs font-bold hover:text-white transition-colors">All Time</button>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={itemVariants}>
            <AuraCard className="relative overflow-hidden">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Total Revenue</p>
                    <h2 className="text-3xl font-black text-white leading-none">KES {stats?.totalRevenue?.toLocaleString() || '0'}</h2>
                  </div>
                  <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                    <DollarSign size={20} />
                  </div>
               </div>
               <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-500">
                  <ArrowUpRight size={14} />
                  <span>12.5% vs last month</span>
               </div>
               <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-green-500/5 blur-2xl rounded-full"></div>
            </AuraCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <AuraCard className="relative overflow-hidden">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Active Players</p>
                    <h2 className="text-3xl font-black text-white leading-none">{stats?.activePlayers || '0'}</h2>
                  </div>
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                    <Users size={20} />
                  </div>
               </div>
               <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-500">
                  <ArrowUpRight size={14} />
                  <span>+48 this week</span>
               </div>
               <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-500/5 blur-2xl rounded-full"></div>
            </AuraCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <AuraCard className="relative overflow-hidden">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Table Occupancy</p>
                    <h2 className="text-3xl font-black text-white leading-none">{stats?.occupancyRate || '65'}%</h2>
                  </div>
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Activity size={20} />
                  </div>
               </div>
               <div className="mt-4 flex items-center gap-2 text-xs font-bold text-primary">
                  <TrendingUp size={14} />
                  <span>Peak at 9:00 PM</span>
               </div>
               <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-primary/5 blur-2xl rounded-full"></div>
            </AuraCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <AuraCard className="relative overflow-hidden">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Tournament Volume</p>
                    <h2 className="text-3xl font-black text-white leading-none">{stats?.totalTournaments || '0'}</h2>
                  </div>
                  <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                    <Calendar size={20} />
                  </div>
               </div>
               <div className="mt-4 flex items-center gap-2 text-xs font-bold text-red-500">
                  <ArrowDownRight size={14} />
                  <span>-2 from last week</span>
               </div>
               <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-purple-500/5 blur-2xl rounded-full"></div>
            </AuraCard>
          </motion.div>
        </div>

        {/* Breakdown Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div variants={itemVariants}>
            <AuraCard className="h-80 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <BarChart size={18} className="text-primary" />
                  Revenue by Stream
                </h3>
              </div>
              <div className="flex-1 flex items-end gap-2 pb-4">
                {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-lg relative group"
                      style={{ height: `${h}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 bg-white text-dark text-[10px] px-1.5 py-0.5 rounded font-black whitespace-nowrap transition-opacity">
                        KES {h*1000}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-600 font-bold uppercase">M-T-W-T-F-S-S'[i]</span>
                  </div>
                ))}
              </div>
            </AuraCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <AuraCard className="h-80 flex flex-col">
               <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <PieChart size={18} className="text-primary" />
                  Activity Distribution
                </h3>
              </div>
              <div className="flex-1 flex flex-col gap-4 justify-center px-4">
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold">
                     <span className="text-gray-400">Tournaments</span>
                     <span className="text-white">45%</span>
                   </div>
                   <div className="w-full h-2 bg-dark-lighter rounded-full overflow-hidden">
                     <div className="h-full bg-primary w-[45%]"></div>
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold">
                     <span className="text-gray-400">Direct Matches</span>
                     <span className="text-white">35%</span>
                   </div>
                   <div className="w-full h-2 bg-dark-lighter rounded-full overflow-hidden">
                     <div className="h-full bg-blue w-[35%]"></div>
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold">
                     <span className="text-gray-400">Battles</span>
                     <span className="text-white">20%</span>
                   </div>
                   <div className="w-full h-2 bg-dark-lighter rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 w-[20%]"></div>
                   </div>
                </div>
              </div>
            </AuraCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;

import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Calendar,
  Wallet,
  Zap
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import MetricCard from '../../components/ui/MetricCard';
import MiniBarChart from '../../components/ui/MiniBarChart';

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
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-sm text-text-muted">Financial performance and operational health.</p>
          <div className="flex gap-1 p-1 rounded-xl bg-surface border border-base2/30">
            {[
              { id: '30d', label: '30 days' },
              { id: '90d', label: '90 days' },
              { id: 'all', label: 'All time' }
            ].map((period) => (
              <button
                key={period.id}
                type="button"
                onClick={() => setTimeRange(period.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  timeRange === period.id
                    ? 'bg-gradient-to-r from-magenta to-violet text-white'
                    : 'text-text-muted hover:text-text-emphasis'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <MetricCard
                featured
                label="Total revenue"
                prefix="KES"
                value={stats?.totalRevenue?.toLocaleString() || '0'}
                icon={Wallet}
                trend={{ value: `${stats?.revenueTrend || '12.5'}%`, positive: true, label: 'vs previous period' }}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <MetricCard
                label="New players"
                value={stats?.activePlayers || '0'}
                icon={Users}
                trend={{ value: `+${stats?.newPlayers || '48'}`, positive: true, label: 'Growth trend' }}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <MetricCard
                label="Live capacity"
                value={`${stats?.occupancyRate || '0'}%`}
                icon={Zap}
                trend={{ value: stats?.occupancyRate > 70 ? 'High' : 'Optimal', label: `Peak: ${stats?.peakTime || '10 PM'}` }}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <MetricCard
                label="Total events"
                value={stats?.totalTournaments || '0'}
                icon={Calendar}
                trend={{ value: 'Active', positive: true, label: 'Cumulative total' }}
              />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div variants={itemVariants} className="chart-panel">
              <p className="chart-panel-title">Weekly performance</p>
              <p className="chart-panel-desc">Revenue trajectory over 7 days</p>
              <MiniBarChart
                data={stats?.weeklyRevenue || [45, 65, 40, 85, 75, 95, 60]}
                labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
                height={200}
                barClass="bg-gradient-to-t from-magenta/40 to-magenta"
              />
            </motion.div>
            <motion.div variants={itemVariants} className="chart-panel">
              <p className="chart-panel-title">Activity mix</p>
              <p className="chart-panel-desc">Sessions by competition type</p>
              <div className="space-y-5 mt-2">
                {[
                  { label: 'Tournaments', value: stats?.tournamentShare || 45, color: 'bg-magenta' },
                  { label: 'Direct matches', value: stats?.matchShare || 35, color: 'bg-violet' },
                  { label: 'Battles', value: stats?.battleShare || 20, color: 'bg-green' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-text-muted">{item.label}</span>
                      <span className="font-semibold text-text-emphasis">{item.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;

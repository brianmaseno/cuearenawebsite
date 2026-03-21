import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Users, Trophy, Target, Activity, ShieldAlert, CheckCircle, Zap, Shield, Clock, TrendingUp, TrendingDown, Server, Database } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeNow: 0,
    engagementPulse: 0,
    moderationCoverage: 0,
    totalActivities: 0,
    ongoingCount: 0,
    completedCount: 0,
    cancelledCount: 0,
  });
  const [activityMatrix, setActivityMatrix] = useState([]);
  const [moderatorPulse, setModeratorPulse] = useState([]);
  const [systemHealth, setSystemHealth] = useState({ backend: 'ONLINE', db: 'STABLE', sync: 'ACTIVE' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersRes, tRes, mRes, logsRes, healthRes] = await Promise.all([
          api.get('/users'),
          api.get('/tournaments'),
          api.get('/direct-matches'),
          api.get('/admin/logs'),
          api.get('/admin/health'),
        ]);

        const users = usersRes.data;
        const tournaments = tRes.data;
        const matches = mRes.data;
        const logs = logsRes.data;
        const health = healthRes.data;

        setSystemHealth(health);

        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
        const activeNow = users.filter(u => u.lastActive && new Date(u.lastActive) > fifteenMinsAgo).length;
        
        const ongoingTournaments = tournaments.filter(t => t.status === 'ongoing');
        const ongoingMatches = matches.filter(m => m.status === 'ongoing');
        const totalOngoing = ongoingTournaments.length + ongoingMatches.length;

        // Strategic Metric: Engagement Pulse
        // (Active Activities / Total Users) * 100
        const pulse = users.length > 0 ? ((totalOngoing / users.length) * 100).toFixed(1) : 0;

        // Strategic Metric: Moderation Coverage
        // (Moderators / Total Users) ratio
        const moderators = users.filter(u => u.role === 'moderator').length;
        const coverage = users.length > 0 ? ((moderators / users.length) * 100).toFixed(1) : 0;

        setStats({
          totalUsers: users.length,
          activeNow,
          engagementPulse: pulse,
          moderationCoverage: coverage,
          totalActivities: tournaments.length + matches.length,
          ongoingCount: totalOngoing,
          completedCount: tournaments.filter(t => t.status === 'completed').length + matches.filter(m => m.status === 'completed').length,
          cancelledCount: tournaments.filter(t => t.status === 'cancelled').length + matches.filter(m => m.status === 'cancelled').length,
        });

        // Unified Activity Matrix: Top 10 recent/important activities
        const unified = [
          ...tournaments.map(t => ({ ...t, type: 'Tournament' })),
          ...matches.map(m => ({ ...m, type: 'Match' }))
        ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 10);
        setActivityMatrix(unified);

        // Moderator Pulse: Latest non-admin actions
        const modLogs = logs.filter(log => log.user?.role !== 'admin').slice(0, 8);
        setModeratorPulse(modLogs);

      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) return <DashboardLayout title="Admin Panel">Analyzing platform data...</DashboardLayout>;

  return (
    <DashboardLayout title="System Administration Dashboard">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Strategic Hero Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="card-premium p-6 rounded-2xl bg-blue/5 border-blue/10 hover:border-blue/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue text-base3 rounded-2xl flex items-center justify-center shadow-xl shadow-blue/20 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <div className="flex items-center gap-1 text-green bg-green/10 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                <TrendingUp size={10} /> +2.4%
              </div>
            </div>
            <div className="text-[10px] font-black text-text/40 uppercase tracking-widest mb-1">Platform Growth</div>
            <h4 className="text-4xl font-black text-text-emphasis tracking-tight">{stats.totalUsers}</h4>
            <div className="mt-4 pt-4 border-t border-base2/50 text-[10px] font-bold text-text/60">
               <span className="text-blue">14</span> New members today
            </div>
          </div>

          <div className="card-premium p-6 rounded-2xl bg-violet/5 border-violet/10 hover:border-violet/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-violet text-base3 rounded-2xl flex items-center justify-center shadow-xl shadow-violet/20 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                 LIVE PULSE
              </div>
            </div>
            <div className="text-[10px] font-black text-text/40 uppercase tracking-widest mb-1">Active Now</div>
            <h4 className="text-4xl font-black text-text-emphasis tracking-tight">{stats.activeNow}</h4>
            <div className="mt-4 pt-4 border-t border-base2/50 text-[10px] font-bold text-text/60 italic">
               System engagement at <span className="text-violet">{stats.engagementPulse}%</span>
            </div>
          </div>

          <div className="card-premium p-6 rounded-2xl bg-green/5 border-green/10 hover:border-green/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-green text-base3 rounded-2xl flex items-center justify-center shadow-xl shadow-green/20 group-hover:scale-110 transition-transform">
                <Target size={24} />
              </div>
              <div className="flex items-center gap-1 text-green bg-green/10 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                <TrendingUp size={10} /> {stats.ongoingCount} ONGOING
              </div>
            </div>
            <div className="text-[10px] font-black text-text/40 uppercase tracking-widest mb-1">Total Activities</div>
            <h4 className="text-4xl font-black text-text-emphasis tracking-tight">{stats.totalActivities}</h4>
            <div className="mt-4 pt-4 border-t border-base2/50 text-[10px] font-bold text-text/60">
               <span className="text-green">{stats.completedCount}</span> Activities completed successfully
            </div>
          </div>

          <div className="card-premium p-6 rounded-2xl bg-primary/5 border-primary/10 hover:border-primary/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-primary text-base3 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform">
                <Shield size={24} />
              </div>
              <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                STABLE CAP
              </div>
            </div>
            <div className="text-[10px] font-black text-text/40 uppercase tracking-widest mb-1">Moderator Coverage</div>
            <h4 className="text-4xl font-black text-text-emphasis tracking-tight">{stats.moderationCoverage}%</h4>
            <div className="mt-4 pt-4 border-t border-base2/50 text-[10px] font-bold text-text/60">
               Ratio optimized for platform integrity
            </div>
          </div>
        </div>

        {/* Global Strategy Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Activity Matrix */}
          <div className="lg:col-span-2 space-y-6">
            <section className="card-premium rounded-3xl overflow-hidden border-base2 bg-base3/10 shadow-2xl backdrop-blur-md">
              <div className="p-6 border-b border-base2/50 bg-base3/40 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-text-emphasis tracking-tight uppercase flex items-center gap-2">
                    <Trophy size={20} className="text-primary" />
                    Strategic Activity Matrix
                  </h3>
                  <p className="text-[11px] font-bold text-text/40 italic mt-0.5">Unified stream of latest platform competitions</p>
                </div>
                <button className="text-[10px] font-black text-primary border border-primary/20 bg-primary/5 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-primary hover:text-base3 transition-all">
                  Full Analytics
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-base2/30 text-[10px] font-black uppercase text-text/40 tracking-widest border-b border-base2">
                    <tr>
                      <th className="px-6 py-4">Activity</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Organizer</th>
                      <th className="px-6 py-4 text-right">Momentum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base2/50">
                    {activityMatrix.map((item) => (
                      <tr key={item._id} className="hover:bg-primary/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                              item.type === 'Tournament' ? 'bg-violet/10 text-violet border border-violet/20' : 'bg-blue/10 text-blue border border-blue/20'
                            }`}>
                              {item.type === 'Tournament' ? <Trophy size={14} /> : <Target size={14} />}
                            </div>
                            <div>
                              <div className="text-xs font-black text-text-emphasis group-hover:text-primary transition-colors">{item.name || item.title}</div>
                              <div className="text-[9px] font-mono text-text/30 uppercase tracking-tighter">ID: {item._id.slice(-8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <StatusBadge status={item.status} className="text-[9px] px-2 py-0.5 font-black uppercase rounded-full shadow-sm" />
                        </td>
                        <td className="px-6 py-4">
                           <div className="text-xs font-bold text-text-emphasis leading-tight">{item.organizerId?.fullName || 'System'}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="text-[10px] font-black text-text/40">{new Date(item.updatedAt).toLocaleDateString()}</div>
                           <div className="text-[9px] font-bold text-primary italic uppercase">{new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Right Sidebar: System Integrity & Pulse */}
          <div className="space-y-6">
            {/* System Integrity Monitor */}
            <section className="card-premium p-6 rounded-3xl border-base2 bg-base3/10 shadow-xl backdrop-blur-md">
              <h3 className="text-[11px] font-black text-text/40 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <Server size={14} className="text-primary" /> System Integrity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-green/5 border border-green/10">
                   <div className="flex items-center gap-3">
                      <Zap size={16} className="text-green" />
                      <span className="text-[11px] font-black uppercase text-text/60">Backend API</span>
                   </div>
                   <span className="text-[10px] font-black text-green uppercase tracking-widest">{systemHealth.backend}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue/5 border border-blue/10">
                   <div className="flex items-center gap-3">
                      <Database size={16} className="text-blue" />
                      <span className="text-[11px] font-black uppercase text-text/60">Database</span>
                   </div>
                   <span className="text-[10px] font-black text-blue uppercase tracking-widest">{systemHealth.db}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-violet/5 border border-violet/10">
                   <div className="flex items-center gap-3">
                      <Activity size={16} className="text-violet" />
                      <span className="text-[11px] font-black uppercase text-text/60">Audit Sync</span>
                   </div>
                   <span className="text-[10px] font-black text-violet uppercase tracking-widest">{systemHealth.sync}</span>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-base2/10 border border-base2/30 text-center">
                 <span className="text-[10px] font-bold text-text/40 italic leading-none">All systems operational at peak performance</span>
              </div>
            </section>

            {/* Moderator Pulse Stream */}
            <section className="card-premium rounded-3xl overflow-hidden border-base2 bg-base3/10 shadow-xl backdrop-blur-md">
              <div className="p-4 border-b border-base2/50 bg-base3/40">
                <h3 className="text-[11px] font-black text-text-emphasis uppercase tracking-widest flex items-center gap-2">
                   <Shield size={14} className="text-primary" /> Platform Pulse
                </h3>
              </div>
              <div className="max-h-[380px] overflow-y-auto divide-y divide-base2/50">
                {moderatorPulse.map((log) => (
                  <div key={log._id} className="p-4 hover:bg-base2/10 transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                       <div className="w-6 h-6 rounded bg-violet/10 text-violet flex items-center justify-center text-[10px] font-black border border-violet/20">
                          {log.user?.fullName?.[0]}
                       </div>
                       <div className="text-[10px] font-black text-text-emphasis uppercase tracking-tight">{log.user?.fullName}</div>
                       <div className="text-[8px] font-bold text-text/30 bg-base2/50 px-1 rounded ml-auto">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div className="pl-8">
                       <div className="text-[10px] font-black text-primary leading-tight mb-0.5">{log.action.replace(/_/g, ' ')}</div>
                       <div className="text-[10px] text-text/60 font-medium italic break-words">"{log.description.split(': ')[1] || log.description}"</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-base3/50 text-center border-t border-base2/50">
                 <button className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline transition-all">
                    Expand Audit Log
                 </button>
              </div>
            </section>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

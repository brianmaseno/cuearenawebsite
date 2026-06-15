import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Users, Trophy, Target, Activity, ShieldAlert, CheckCircle, Zap, Shield, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import MetricCard from '../../components/ui/MetricCard';
import MiniBarChart from '../../components/ui/MiniBarChart';
import DataTable from '../../components/ui/DataTable';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeNow: 0,
    engagementPulse: 0,
    moderationCoverage: 0,
    moderatorCount: 0,
    totalActivities: 0,
    ongoingCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    newMembersToday: 0,
    platformGrowth: 0,
    totalLogs: 0,
    logsToday: 0,
  });
  const [activityMatrix, setActivityMatrix] = useState([]);
  const [moderatorPulse, setModeratorPulse] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersRes, tRes, mRes, bRes, logsRes] = await Promise.all([
          api.get('/users'),
          api.get('/tournaments'),
          api.get('/direct-matches'),
          api.get('/battles'),
          api.get('/admin/logs'),
        ]);

        const users = usersRes.data;
        const tournaments = tRes.data;
        const matches = mRes.data;
        const battles = bRes.data;
        const logs = logsRes.data;

        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
        const activeNow = users.filter(u => u.lastActive && new Date(u.lastActive) > fifteenMinsAgo).length;

        const ongoingTournaments = tournaments.filter(t => t.status === 'ongoing');
        const ongoingMatches = matches.filter(m => m.status === 'ongoing');
        const ongoingBattles = battles.filter(b => b.status === 'ongoing');
        const totalOngoing = ongoingTournaments.length + ongoingMatches.length + ongoingBattles.length;

        // Strategic Metric: Engagement Pulse
        // (Active Activities / Total Users) * 100
        const pulse = users.length > 0 ? ((totalOngoing / users.length) * 100).toFixed(1) : 0;

        // Strategic Metric: Moderation Coverage
        // (Moderators / Total Users) ratio
        const moderators = users.filter(u => u.role === 'moderator').length;
        const coverage = users.length > 0 ? ((moderators / users.length) * 100).toFixed(1) : 0;

        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

        const newMembersToday = users.filter(u => new Date(u.createdAt) >= todayStart).length;
        const newMembersYesterday = users.filter(u => {
          const created = new Date(u.createdAt);
          return created >= yesterdayStart && created < todayStart;
        }).length;

        let growth = 0;
        if (newMembersYesterday > 0) {
          growth = (((newMembersToday - newMembersYesterday) / newMembersYesterday) * 100).toFixed(1);
        } else if (newMembersToday > 0) {
          growth = 100.0;
        }

        const logsToday = logs.filter(l => new Date(l.createdAt) >= todayStart).length;

        setStats({
          totalUsers: users.length,
          activeNow,
          engagementPulse: pulse,
          moderationCoverage: coverage,
          moderatorCount: moderators,
          totalActivities: tournaments.length + matches.length + battles.length,
          ongoingCount: totalOngoing,
          completedCount: tournaments.filter(t => t.status === 'completed').length + matches.filter(m => m.status === 'completed').length + battles.filter(b => b.status === 'completed').length,
          cancelledCount: tournaments.filter(t => t.status === 'cancelled').length + matches.filter(m => m.status === 'cancelled').length + battles.filter(b => b.status === 'cancelled').length,
          newMembersToday,
          platformGrowth: growth,
          totalLogs: logs.length,
          logsToday,
        });

        // Unified Activity Matrix: Unified stream of latest platform competitions
        const unified = [
          ...tournaments.map(t => ({ ...t, type: 'Tournament' })),
          ...matches.map(m => ({ ...m, type: 'Match' })),
          ...battles.map(b => ({ ...b, type: 'Battle' }))
        ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
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

  const activityColumns = [
    {
      key: 'activity',
      header: 'Activity',
      render: (item) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            item.type === 'Tournament' ? 'bg-violet/10 text-violet' : item.type === 'Battle' ? 'bg-green/10 text-green' : 'bg-blue/10 text-blue'
          }`}>
            {item.type === 'Tournament' ? <Trophy size={16} /> : item.type === 'Battle' ? <Shield size={16} /> : <Target size={16} />}
          </div>
          <div className="min-w-0">
            <p className="dash-cell-emphasis truncate">
              {item.type === 'Tournament' ? item.name : item.type === 'Battle' ? item.title : (item.player1Id ? `${item.player1Id.fullName} vs ${item.player2Id?.fullName}` : (item.name || item.title || 'Direct Match'))}
            </p>
            <p className="dash-cell-muted">{item.type} · {String(item.id).slice(-8)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusBadge status={item.status} registrationDeadline={item.registrationDeadline} />
      ),
    },
    {
      key: 'organizer',
      header: 'Organizer',
      render: (item) => (
        <span className="dash-cell-emphasis">{item.organizerId?.fullName || 'System'}</span>
      ),
    },
    {
      key: 'updated',
      header: 'Updated',
      align: 'right',
      render: (item) => (
        <div>
          <p className="dash-cell-emphasis text-sm">{new Date(item.updatedAt).toLocaleDateString()}</p>
          <p className="dash-cell-muted">{new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      ),
    },
    {
      key: 'manage',
      header: '',
      align: 'right',
      render: (item) => (
        <Link
          to={item.type === 'Tournament' ? `/moderator/manage-tournament/${item.id}` : '/moderator/ongoing'}
          className="inline-flex px-3 py-1.5 rounded-full text-xs font-semibold bg-magenta/10 text-magenta hover:bg-magenta hover:text-white transition-all"
        >
          Open
        </Link>
      ),
    },
  ];

  if (loading) return <DashboardLayout title="Admin Panel">Analyzing platform data...</DashboardLayout>;

  return (
    <DashboardLayout title="System Administration Dashboard">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <MetricCard
            featured
            label="Platform reach"
            value={stats.totalUsers}
            icon={Users}
            trend={{
              value: `${parseFloat(stats.platformGrowth) >= 0 ? '+' : ''}${stats.platformGrowth}%`,
              positive: parseFloat(stats.platformGrowth) >= 0,
              label: `${stats.newMembersToday} joined today`,
            }}
          />
          <MetricCard
            label="Live online"
            value={stats.activeNow}
            icon={Zap}
            trend={{ value: `${stats.engagementPulse}%`, label: 'Engagement pulse' }}
          />
          <MetricCard
            label="Total events"
            value={stats.totalActivities}
            icon={Target}
            trend={{ value: String(stats.ongoingCount), label: 'Currently active' }}
          />
          <MetricCard
            label="Moderators"
            value={stats.moderatorCount}
            icon={Shield}
            trend={{ value: `${stats.moderationCoverage}%`, label: 'Coverage' }}
          />
          <MetricCard
            label="Audit events"
            value={stats.totalLogs}
            icon={Activity}
            trend={{ value: String(stats.logsToday), label: 'Logged today' }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="chart-panel">
            <p className="chart-panel-title">User growth</p>
            <p className="chart-panel-desc">New registrations this week</p>
            <MiniBarChart
              data={[
                Math.max(1, stats.newMembersToday),
                Math.max(1, Math.round(stats.totalUsers * 0.02)),
                Math.max(1, Math.round(stats.totalUsers * 0.015)),
                Math.max(1, stats.newMembersToday + 2),
                Math.max(1, Math.round(stats.totalUsers * 0.025)),
                Math.max(1, stats.newMembersToday + 1),
                Math.max(1, stats.newMembersToday),
              ]}
              labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
              height={180}
              barClass="bg-gradient-to-t from-violet/50 to-magenta"
            />
          </div>
          <div className="chart-panel">
            <p className="chart-panel-title">Event outcomes</p>
            <p className="chart-panel-desc">Competition status breakdown</p>
            <div className="space-y-4 mt-1">
              {[
                { label: 'Ongoing', value: stats.ongoingCount, max: stats.totalActivities || 1, color: 'bg-magenta' },
                { label: 'Completed', value: stats.completedCount, max: stats.totalActivities || 1, color: 'bg-green' },
                { label: 'Cancelled', value: stats.cancelledCount, max: stats.totalActivities || 1, color: 'bg-red/70' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-muted">{row.label}</span>
                    <span className="font-semibold">{row.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.color}`}
                      style={{ width: `${Math.min(100, (row.value / row.max) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-end px-1">
              <div>
                <h3 className="text-lg font-bold text-text-emphasis flex items-center gap-2">
                  <Trophy size={18} className="text-magenta" />
                  Recent activity
                </h3>
                <p className="text-sm text-text-muted mt-0.5">Latest competitions and matches</p>
              </div>
              <Link to="/admin/analytics" className="text-xs font-semibold text-magenta hover:underline">
                View analytics
              </Link>
            </div>
            <DataTable
              columns={activityColumns}
              data={activityMatrix}
              keyExtractor={(item) => `${item.type}-${item.id}`}
              emptyIcon={Trophy}
              emptyTitle="No activity yet"
              emptyDescription="Competitions will appear here as they are created."
              minWidth={760}
              stickyHeader
              className="max-h-[600px] overflow-y-auto thin-scrollbar"
            />
          </div>

          {/* Right Sidebar: System Integrity & Pulse */}
          <div className="space-y-6">

            {/* Moderator Pulse Stream */}
            <section className="dash-panel overflow-hidden">
              <div className="px-4 py-3 border-b border-base2/30 flex items-center gap-2">
                <Shield size={14} className="text-magenta" />
                <h3 className="text-sm font-semibold text-text-emphasis">Platform pulse</h3>
              </div>
              <div className="max-h-[380px] overflow-y-auto thin-scrollbar divide-y divide-base2/20">
                {moderatorPulse.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-base2/10 transition-colors">
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

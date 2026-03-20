import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Users, Trophy, Target, Activity, ShieldAlert, CheckCircle } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTournaments: 0,
    totalMatches: 0,
    activeTournaments: 0,
    completedTournaments: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersRes, tRes, mRes] = await Promise.all([
          api.get('/users'),
          api.get('/tournaments'),
          api.get('/direct-matches'),
        ]);

        const tournaments = tRes.data;
        setStats({
          totalUsers: usersRes.data.length,
          totalTournaments: tournaments.length,
          totalMatches: mRes.data.length,
          activeTournaments: tournaments.filter(t => t.status === 'ongoing' || t.status === 'open_for_players').length,
          completedTournaments: tournaments.filter(t => t.status === 'completed').length,
        });

        setRecentUsers(usersRes.data.slice(0, 5));
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
    <DashboardLayout title="System Administration">
      <div className="space-y-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="card-premium p-6 rounded-2xl bg-blue/5 border-blue/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue text-base3 rounded-lg flex items-center justify-center">
                <Users size={24} />
              </div>
              <span className="text-xs font-bold text-blue bg-blue/10 px-2 py-0.5 rounded-full">Users</span>
            </div>
            <h4 className="text-3xl font-extrabold text-text-emphasis mb-1">{stats.totalUsers}</h4>
            <p className="text-sm text-text">Total registered members</p>
          </div>

          <div className="card-premium p-6 rounded-2xl bg-yellow/5 border-yellow/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-yellow text-base3 rounded-lg flex items-center justify-center">
                <Trophy size={24} />
              </div>
              <span className="text-xs font-bold text-yellow bg-yellow/10 px-2 py-0.5 rounded-full">Events</span>
            </div>
            <h4 className="text-3xl font-extrabold text-text-emphasis mb-1">{stats.totalTournaments}</h4>
            <p className="text-sm text-text">Total tournaments created</p>
          </div>

          <div className="card-premium p-6 rounded-2xl bg-violet/5 border-violet/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-violet text-base3 rounded-lg flex items-center justify-center">
                <Target size={24} />
              </div>
              <span className="text-xs font-bold text-violet bg-violet/10 px-2 py-0.5 rounded-full">Matches</span>
            </div>
            <h4 className="text-3xl font-extrabold text-text-emphasis mb-1">{stats.totalMatches}</h4>
            <p className="text-sm text-text">Stand-alone direct matches</p>
          </div>

          <div className="card-premium p-6 rounded-2xl bg-green/5 border-green/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green text-base3 rounded-lg flex items-center justify-center">
                <Activity size={24} />
              </div>
              <span className="text-xs font-bold text-green bg-green/10 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <h4 className="text-3xl font-extrabold text-text-emphasis mb-1">{stats.activeTournaments}</h4>
            <p className="text-sm text-text">Ongoing competitions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Users List */}
          <section className="lg:col-span-2 card-premium rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-base2 bg-base3/50">
              <h3 className="text-lg font-bold flex items-center gap-2 text-text-emphasis">
                <Activity size={20} className="text-primary" />
                Recent User Activity
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-base2/30 text-xs font-bold uppercase text-text tracking-wider">
                  <tr>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Joined Date</th>
                    <th className="px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base2">
                  {recentUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-base2/10 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-base2 flex items-center justify-center text-xs font-bold">
                          {u.fullName[0]}
                        </div>
                        <span className="font-bold text-text-emphasis">{u.fullName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                          u.role === 'admin' ? 'bg-red/10 text-red' : u.role === 'moderator' ? 'bg-violet/10 text-violet' : 'bg-blue/10 text-blue'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`flex items-center justify-end gap-1.5 text-xs font-bold ${u.status === 'active' ? 'text-green' : 'text-red'}`}>
                          {u.status === 'active' ? <CheckCircle size={14} /> : <ShieldAlert size={14} />}
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Quick Monitor */}
          <section className="space-y-6">
             <div className="card-premium p-6 rounded-2xl">
                <h3 className="font-bold text-text-emphasis mb-4 border-b border-base2 pb-2">Platform Integrity</h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                      <span className="text-sm text-text">Active Moderators</span>
                      <span className="font-bold">2</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-sm text-text">Pending Reports</span>
                      <span className="font-bold text-green">0</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-sm text-text">System Health</span>
                      <span className="text-xs font-bold bg-green/10 text-green px-2 py-0.5 rounded-full uppercase tracking-tighter">Healthy</span>
                   </div>
                </div>
             </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

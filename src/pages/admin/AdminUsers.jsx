import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { 
  Users as UsersIcon, 
  Search, 
  Shield, 
  User, 
  UserCheck, 
  UserX,
  Ban,
  Slash,
  Mail,
  Calendar,
  Key,
  History,
  Info,
  Trophy,
  Target,
  ExternalLink,
  X,
  Phone
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserStatsBadge = ({ userId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get(`/users/${userId}/stats`);
        setStats(data);
      } catch (err) {
        console.error('Stats failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [userId]);

  if (loading) return <div className="w-12 h-4 bg-base2 animate-pulse rounded" />;
  if (!stats) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow/5 text-yellow border border-yellow/10 rounded text-[9px] font-black" title="Total Wins">
        <Trophy size={10} />
        {stats.totalWins}
      </div>
      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue/5 text-blue border border-blue/10 rounded text-[9px] font-black" title="Total Games">
        <Target size={10} />
        {stats.totalGames}
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusToggle = async (userId) => {
    try {
      const { data } = await api.put(`/users/${userId}/status`);
      toast.success(data.message);
      fetchUsers();
      if (selectedUser?._id === userId) setSelectedUser(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleBlockToggle = async (userId) => {
    try {
      const { data } = await api.put(`/users/${userId}/block`);
      toast.success(data.message);
      fetchUsers();
      if (selectedUser?._id === userId) setSelectedUser(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Block action failed');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { data } = await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success(data.message);
      fetchUsers();
      if (selectedUser?._id === userId) setSelectedUser(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Role update failed');
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm('Are you sure you want to reset this user\'s password?')) return;
    try {
      const { data } = await api.put(`/users/${userId}/reset-password`);
      toast.success(data.message, { duration: 6000 });
      // We don't really need to fetch users again as password is not shown
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const matchesStatus = filterStatus === 'ALL' || u.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleStyle = (role) => {
    switch (role) {
      case 'admin': return 'bg-red/10 text-red border-red/20';
      case 'moderator': return 'bg-purple/10 text-purple border-purple/20';
      default: return 'bg-blue/10 text-blue border-blue/20';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald/10 text-emerald border-emerald/20';
      case 'suspended': return 'bg-yellow/10 text-yellow border-yellow/20';
      case 'blocked': return 'bg-base2 text-text border-base2 line-through opacity-60';
      default: return 'bg-base2 text-text border-base2';
    }
  };

  return (
    <DashboardLayout title="Member Management">
      <div 
        className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-160px)]"
        style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif' }}
      >
        {/* Main List Column */}
        <div className={`flex-1 transition-all duration-300 space-y-6 overflow-y-auto pr-2 ${selectedUser ? 'hidden xl:block' : ''}`}>
          {/* Statistics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-base3 border border-base2 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-blue/10 text-blue rounded-xl flex items-center justify-center">
                 <UsersIcon size={20} />
              </div>
              <div>
                 <p className="text-[10px] text-text uppercase font-black tracking-widest leading-none mb-1">Total Community</p>
                 <p className="text-xl font-black text-text-emphasis leading-none">{users.length}</p>
              </div>
            </div>
            <div className="bg-base3 border border-base2 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-purple/10 text-purple rounded-xl flex items-center justify-center">
                 <Shield size={20} />
              </div>
              <div>
                 <p className="text-[10px] text-text uppercase font-black tracking-widest leading-none mb-1">Moderation Team</p>
                 <p className="text-xl font-black text-text-emphasis leading-none">{users.filter(u => u.role === 'moderator').length}</p>
              </div>
            </div>
            <div className="bg-base3 border border-base2 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-red/10 text-red rounded-xl flex items-center justify-center">
                 <Ban size={20} />
              </div>
              <div>
                 <p className="text-[10px] text-text uppercase font-black tracking-widest leading-none mb-1">Restricted Access</p>
                 <p className="text-xl font-black text-text-emphasis leading-none">{users.filter(u => u.status !== 'active').length}</p>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text/40" size={18} />
              <input 
                type="text"
                placeholder="Lookup member by name or unique email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-base3 border border-base2 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2.5 bg-base3 border border-base2 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold min-w-[130px]"
              >
                <option value="ALL">All Roles</option>
                <option value="moderator">Moderators</option>
                <option value="player">Players</option>
                <option value="admin">Admins</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2.5 bg-base3 border border-base2 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold min-w-[130px]"
              >
                <option value="ALL">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          {/* High-Density Users Table */}
          <div className="bg-base3 border border-base2 rounded-2xl overflow-hidden shadow-sm animate-reveal">
            {loading ? (
              <div className="p-16 text-center">
                <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-sm text-text">Fetching community data...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-16 text-center">
                 <UserX size={40} className="mx-auto text-base2 mb-3" />
                 <p className="text-text-emphasis font-bold">No members found</p>
                 <p className="text-xs text-text">Try different search or filter settings</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
                  <thead>
                    <tr className="border-b border-base2 bg-base2/20 text-text/60 uppercase text-[9px] font-black tracking-widest">
                      <th className="px-4 py-3 w-[22%] uppercase font-black">Member Profile</th>
                      <th className="px-4 py-3 w-[12%] text-center uppercase font-black">Platform Stats</th>
                      <th className="px-4 py-3 w-[12%] text-center uppercase font-black">Identified Role</th>
                      <th className="px-4 py-3 w-[12%] text-center uppercase font-black">Auth Status</th>
                      <th className="px-4 py-3 w-[12%] text-center uppercase font-black">Join Date</th>
                      <th className="px-4 py-3 w-[30%] text-right uppercase font-black pr-6">Governing Options</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base2/50">
                    {filteredUsers.map((u) => (
                      <tr 
                        key={u._id} 
                        onClick={() => setSelectedUser(u)}
                        className={`hover:bg-primary/5 transition-colors cursor-pointer group ${selectedUser?._id === u._id ? 'bg-primary/5 ring-1 ring-inset ring-primary/10' : ''}`}
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-base2 flex items-center justify-center font-black text-xs ring-1 ring-base2 shrink-0 ${u.status === 'blocked' ? 'opacity-30' : 'text-primary'}`}>
                              {u.fullName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className={`font-black text-text-emphasis text-[13px] truncate leading-tight ${u.status === 'blocked' ? 'line-through text-text/40' : ''}`}>
                                {u.fullName}
                              </p>
                              <div className="flex items-center gap-1.5 text-[9px] text-text/60 truncate uppercase font-bold tracking-tight">
                                <Mail size={10} className="shrink-0" />
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                           <div className="flex justify-center">
                              <UserStatsBadge userId={u._id} />
                           </div>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-tighter uppercase border inline-flex items-center gap-1 ${getRoleStyle(u.role)}`}>
                            {u.role === 'admin' && <Shield size={9} />}
                            {u.role === 'moderator' && <Calendar size={9} />}
                            {u.role === 'player' && <User size={9} />}
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${getStatusStyle(u.status)}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                           <span className="text-[10px] font-bold text-text/60 uppercase whitespace-nowrap">
                              {new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                           </span>
                        </td>
                        <td className="px-4 py-2.5 text-right pr-6">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={(e) => { e.stopPropagation(); navigate(`/admin/logs?search=${u.fullName}`); }}
                                className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter text-text/60 hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20 flex items-center gap-1"
                             >
                                <History size={12} /> Logs
                             </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleResetPassword(u._id); }}
                                disabled={u.role === 'admin'}
                                className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter text-text/60 hover:text-yellow hover:bg-yellow/10 transition-all border border-transparent hover:border-yellow/20 disabled:opacity-20 flex items-center gap-1"
                             >
                                <Key size={12} /> Reset
                             </button>
                             <div className="w-px h-3 bg-base2 mx-1" />
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleStatusToggle(u._id); }}
                                disabled={u.role === 'admin' || u.status === 'blocked'}
                                className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter transition-all border flex items-center gap-1 ${
                                  u.status === 'suspended' 
                                    ? 'bg-emerald/10 text-emerald border-emerald/20 hover:bg-emerald/20' 
                                    : 'bg-yellow/5 text-yellow border-transparent hover:border-yellow/20 hover:bg-yellow/10 disabled:opacity-20'
                                }`}
                             >
                                {u.status === 'suspended' ? <UserCheck size={12} /> : <Slash size={12} />}
                                {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                             </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleBlockToggle(u._id); }}
                                disabled={u.role === 'admin'}
                                className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter transition-all border flex items-center gap-1 ${
                                  u.status === 'blocked' 
                                    ? 'bg-blue/10 text-blue border-blue/20 hover:bg-blue/20' 
                                    : 'bg-red/5 text-red border-transparent hover:border-red/20 hover:bg-red/10'
                                }`}
                             >
                                {u.status === 'blocked' ? <UserCheck size={12} /> : <Ban size={12} />}
                                {u.status === 'blocked' ? 'Unblock' : 'Block'}
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* User Detail Side Panel */}
        {selectedUser && (
          <div className="w-full lg:w-[320px] bg-base3 border border-base2 rounded-2xl flex flex-col animate-reveal-right shadow-xl overflow-hidden">
            <div className="p-4 border-b border-base2 flex items-center justify-between sticky top-0 bg-base3/80 backdrop-blur-md z-10">
               <h3 className="font-black uppercase text-xs tracking-widest text-text-emphasis">Member Dossier</h3>
               <button onClick={() => setSelectedUser(null)} className="p-1.5 hover:bg-base2 rounded-lg transition-all">
                  <X size={18} />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
               {/* Identity Card */}
               <div className="text-center space-y-3">
                  <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto text-3xl font-black shadow-inner ring-4 ring-base2">
                     {selectedUser.fullName.charAt(0)}
                  </div>
                  <div>
                     <h2 className="text-xl font-black text-text-emphasis leading-tight">{selectedUser.fullName}</h2>
                     <p className="text-xs text-text font-bold uppercase tracking-widest opacity-60 underline decoration-primary decoration-2 underline-offset-4">{selectedUser.role}</p>
                  </div>
               </div>

               {/* Stats Overview */}
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-base2/30 p-4 rounded-2xl border border-base2/50 text-center">
                     <p className="text-[9px] uppercase font-black text-text/40 mb-1">Total Battles</p>
                     <p className="text-2xl font-black text-text-emphasis leading-none">
                        <UserStatsValue userId={selectedUser._id} field="totalGames" />
                     </p>
                  </div>
                  <div className="bg-yellow/5 p-4 rounded-2xl border border-yellow/10 text-center">
                     <p className="text-[9px] uppercase font-black text-yellow/40 mb-1">Arena Victories</p>
                     <p className="text-2xl font-black text-yellow leading-none">
                        <UserStatsValue userId={selectedUser._id} field="totalWins" />
                     </p>
                  </div>
               </div>

               {/* Detailed Information */}
               <div className="space-y-4">
                  <div className="space-y-1">
                     <p className="text-[9px] uppercase font-black text-text/40">Registered Email</p>
                     <div className="flex items-center gap-2 p-3 bg-base2/30 rounded-xl border border-base2/50">
                        <Mail size={16} className="text-primary/60" />
                        <span className="text-xs font-bold truncate">{selectedUser.email}</span>
                     </div>
                  </div>
                  {selectedUser.phone && (
                  <div className="space-y-1">
                     <p className="text-[9px] uppercase font-black text-text/40">Verified Timeline</p>
                     <div className="flex items-center gap-2 p-3 bg-base2/30 rounded-xl border border-base2/50">
                        <Phone size={16} className="text-primary/60" />
                        <span className="text-xs font-bold truncate">{selectedUser.phone}</span>
                     </div>
                  </div>
                  )}
                  <div className="space-y-1">
                     <p className="text-[9px] uppercase font-black text-text/40">Member Since</p>
                     <div className="flex items-center gap-2 p-3 bg-base2/30 rounded-xl border border-base2/50">
                        <Calendar size={16} className="text-primary/60" />
                        <span className="text-xs font-bold">{new Date(selectedUser.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                     </div>
                  </div>
               </div>

               {/* Role Management */}
               <div className="space-y-3 pt-4 border-t border-base2">
                  <p className="text-[9px] uppercase font-black text-primary tracking-widest">Authority Control</p>
                  <div className="grid grid-cols-2 gap-2">
                     <button 
                        onClick={() => handleRoleChange(selectedUser._id, 'moderator')}
                        disabled={selectedUser.role === 'moderator' || selectedUser.role === 'admin'}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-purple/10 text-purple border border-purple/20 rounded-xl text-[10px] font-black uppercase hover:bg-purple/20 transition-all disabled:opacity-20"
                     >
                        <Shield size={14} /> Promote
                     </button>
                     <button 
                        onClick={() => handleRoleChange(selectedUser._id, 'player')}
                        disabled={selectedUser.role === 'player' || selectedUser.role === 'admin'}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue/10 text-blue border border-blue/20 rounded-xl text-[10px] font-black uppercase hover:bg-blue/20 transition-all disabled:opacity-20"
                     >
                        <User size={14} /> Demote
                     </button>
                  </div>
               </div>
            </div>

            <div className="p-4 bg-base2/30 border-t border-base2 space-y-2">
               <button 
                  onClick={() => { navigate(`/admin/logs?search=${selectedUser.fullName}`); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-base3 border border-base2 rounded-xl text-[10px] font-black uppercase hover:bg-primary/10 hover:text-primary transition-all group"
               >
                  <History size={16} className="group-hover:animate-spin-slow" /> View Audit Trail
               </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

// Helper for side panel stats
const UserStatsValue = ({ userId, field }) => {
  const [val, setVal] = useState('...');
  useEffect(() => {
    api.get(`/users/${userId}/stats`).then(({data}) => setVal(data[field]));
  }, [userId, field]);
  return val;
};

export default AdminUsers;

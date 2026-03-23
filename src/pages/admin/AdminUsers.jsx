import React, { useState, useEffect, useRef } from 'react';
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
  Phone,
  Camera,
  Save,
  CheckCircle2,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

// No longer needed separately as we'll fetch stats for all users once or include in user object
const UserStatsBadge = ({ stats, loading }) => {
  if (loading) return <div className="w-12 h-4 bg-base2/50 animate-pulse rounded" />;
  if (!stats) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow/5 text-yellow border border-yellow/10 rounded text-[9px] font-black group-hover:scale-110 transition-transform" title="Total Wins">
        <Trophy size={10} />
        {stats.totalWins || 0}
      </div>
      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue/5 text-blue border border-blue/10 rounded text-[9px] font-black group-hover:scale-110 transition-transform" title="Total Games">
        <Target size={10} />
        {stats.totalGames || 0}
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({}); // Local cache for stats
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);

  // New User Form State
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'player',
    profilePhoto: ''
  });
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editData, setEditData] = useState(null);

  const dossierFileRef = useRef(null);
  const newUserFileRef = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      setEditData({
        fullName: selectedUser.fullName,
        bio: selectedUser.bio || '',
        phone: selectedUser.phone || '',
        profilePhoto: selectedUser.profilePhoto || ''
      });
    } else {
      setEditData(null);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      setUsers(data);
      
      // Batch fetch stats for all users after getting the list
      fetchAllStats(data);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStats = async (userList) => {
    setStatsLoading(true);
    try {
      // Since there's no batch endpoint, we'll fetch in parallel for visible users or just fetch all
      // For now, let's assume we fetch all to simplify caching logic in this component
      const statsPromises = userList.slice(0, 50).map(u => 
        api.get(`/users/${u._id}/stats`).then(res => ({ id: u._id, stats: res.data }))
      );
      const results = await Promise.allSettled(statsPromises);
      const newStats = {};
      results.forEach(res => {
        if (res.status === 'fulfilled') {
          newStats[res.value.id] = res.value.stats;
        }
      });
      setUserStats(prev => ({ ...prev, ...newStats }));
    } catch (err) {
      console.error('Batch stats error', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const { data } = await api.post('/users', newUser);
      toast.success(data.message);
      setNewUser({ fullName: '', email: '', password: '', role: 'player', profilePhoto: '' });
      fetchUsers();
      setShowAddModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Creation failed');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusToggle = async (userId) => {
    try {
      const { data } = await api.put(`/users/${userId}/status`);
      toast.success(data.message);
      fetchUsers();
      if (selectedUser?._id === userId) setSelectedUser({ ...selectedUser, status: data.user.status });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleBlockToggle = async (userId) => {
    try {
      const { data } = await api.put(`/users/${userId}/block`);
      toast.success(data.message);
      fetchUsers();
      if (selectedUser?._id === userId) setSelectedUser({ ...selectedUser, status: data.user.status });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Block action failed');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { data } = await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success(data.message);
      fetchUsers();
      if (selectedUser?._id === userId) setSelectedUser({ ...selectedUser, role: newRole });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Role update failed');
    }
  };

  const handleUpdateUser = async (e) => {
    if (e) e.preventDefault();
    try {
      setUpdating(true);
      const { data } = await api.put(`/users/${selectedUser._id}`, editData);
      toast.success(data.message);
      fetchUsers();
      setSelectedUser({ ...selectedUser, ...editData });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handlePhotoUpload = (e, target) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.error('Max 2MB');
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'new') {
          setNewUser({ ...newUser, profilePhoto: reader.result });
        } else {
          setEditData({ ...editData, profilePhoto: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm('Are you sure you want to reset this user\'s password?')) return;
    try {
      const { data } = await api.put(`/users/${userId}/reset-password`);
      toast.success(data.message, { duration: 6000 });
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
        className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-160px)] glass rounded-3xl p-1"
        style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif' }}
      >
        {/* Main Pillar */}
        <div className={`flex-1 transition-all duration-300 space-y-6 flex flex-col min-h-0 ${selectedUser ? 'hidden xl:flex' : 'flex'}`}>
          {/* Statistics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 animate-reveal">
            <div className="bg-base3 border border-base2 p-3 rounded-2xl">
              <p className="text-[9px] text-red uppercase font-black tracking-widest leading-none mb-1">Admins</p>
              <p className="text-xl font-black text-text-emphasis leading-none">{users.filter(u => u.role === 'admin').length}</p>
            </div>
            <div className="bg-base3 border border-base2 p-3 rounded-2xl">
              <p className="text-[9px] text-purple uppercase font-black tracking-widest leading-none mb-1">Moderators</p>
              <p className="text-xl font-black text-text-emphasis leading-none">{users.filter(u => u.role === 'moderator').length}</p>
            </div>
            <div className="bg-base3 border border-base2 p-3 rounded-2xl">
              <p className="text-[9px] text-blue uppercase font-black tracking-widest leading-none mb-1">Players</p>
              <p className="text-xl font-black text-text-emphasis leading-none">{users.filter(u => u.role === 'player').length}</p>
            </div>
            <div className="bg-base3 border border-base2 p-3 rounded-2xl text-center">
              <p className="text-[9px] text-emerald uppercase font-black tracking-widest leading-none mb-1">Logged In</p>
              <p className="text-xl font-black text-emerald leading-none">
                {users.filter(u => (new Date() - new Date(u.lastActive)) <= 600000).length}
              </p>
            </div>
            <div className="bg-base3 border border-base2 p-3 rounded-2xl text-center">
              <p className="text-[9px] text-yellow uppercase font-black tracking-widest leading-none mb-1">Suspended</p>
              <p className="text-xl font-black text-yellow leading-none">{users.filter(u => u.status === 'suspended').length}</p>
            </div>
            <div className="bg-base3 border border-base2 p-3 rounded-2xl text-center">
              <p className="text-[9px] text-red uppercase font-black tracking-widest leading-none mb-1">Blocked</p>
              <p className="text-xl font-black text-red leading-none">{users.filter(u => u.status === 'blocked').length}</p>
            </div>
          </div>

          {/* Filters & Actions Bar */}
          <div className="flex flex-col md:flex-row gap-3 animate-reveal" style={{ animationDelay: '0.1s' }}>
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
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-base3 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-xs uppercase tracking-widest"
              >
                <UserCheck size={16} /> Add User
              </button>
            </div>
          </div>

          {/* User Directory Table */}
          <div className="flex-1 overflow-y-auto pr-2 min-h-0">
            <div className="bg-base3 border border-base2 rounded-2xl overflow-hidden shadow-sm animate-reveal" style={{ animationDelay: '0.2s' }}>
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
                  <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-base2 bg-base2/20 text-text/60 uppercase text-[9px] font-black tracking-widest">
                        <th className="px-4 py-3 w-[20%] uppercase font-black">Member Profile</th>
                        <th className="px-4 py-3 w-[10%] text-center uppercase font-black">Stats</th>
                        <th className="px-4 py-3 w-[10%] text-center uppercase font-black">Role</th>
                        <th className="px-4 py-3 w-[10%] text-center uppercase font-black">Auth</th>
                        <th className="px-4 py-3 w-[10%] text-center uppercase font-black">Joined</th>
                        <th className="px-4 py-3 w-[10%] text-center uppercase font-black">Points</th>
                        <th className="px-4 py-3 w-[16%] text-center uppercase font-black">Activity Detail</th>
                        <th className="px-4 py-3 w-[24%] text-right uppercase font-black pr-6">Governing Options</th>
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
                              <div className="relative">
                                <div className={`w-8 h-8 rounded-lg bg-base2 flex items-center justify-center font-black text-xs ring-1 ring-base2 shrink-0 ${u.status === 'blocked' ? 'opacity-30' : 'text-primary'}`}>
                                  {u.fullName.charAt(0)}
                                </div>
                                {(new Date() - new Date(u.lastActive)) <= 600000 && (
                                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald rounded-full border-2 border-base3 animate-pulse" title="Online Now" />
                                )}
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
                                <UserStatsBadge stats={userStats[u._id]} loading={statsLoading && !userStats[u._id]} />
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
                          <td className="px-4 py-2.5 text-center">
                            <span className="text-[12px] font-black text-primary/80 uppercase whitespace-nowrap">
                                {u.points || 0}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center justify-center gap-2">
                              <div className="flex flex-col items-center leading-none shrink-0 min-w-[50px]">
                                <span className="text-[9px] font-black text-text-emphasis uppercase">
                                  {new Date(u.lastActive).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                                <span className="text-[7px] font-bold text-text/40 uppercase">
                                  {new Date(u.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <span className="px-1.5 py-0.5 bg-base2/50 border border-base2 rounded text-[7px] font-black text-text/60 truncate max-w-[80px] uppercase tracking-tighter" title={u.lastAction}>
                                {u.lastAction || 'JOINED'}
                              </span>
                            </div>
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
        </div>

        {/* User Detail Side Panel */}
        {selectedUser && (
          <div className="w-full lg:w-[320px] bg-base3 border border-base2 rounded-2xl flex flex-col animate-reveal-right shadow-xl overflow-hidden h-full shrink-0">
            <div className="p-4 border-b border-base2 flex items-center justify-between sticky top-0 bg-base3/80 backdrop-blur-md z-10">
               <h3 className="font-black uppercase text-xs tracking-widest text-text-emphasis">Member Dossier</h3>
               <button onClick={() => setSelectedUser(null)} className="p-1.5 hover:bg-base2 rounded-lg transition-all">
                  <X size={18} />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
               {/* Identity Card */}
               <div className="text-center space-y-4">
                  <div 
                    className="relative w-20 h-20 mx-auto group cursor-pointer"
                    onClick={() => dossierFileRef.current.click()}
                  >
                    <img 
                      src={editData?.profilePhoto || `https://ui-avatars.com/api/?name=${selectedUser.fullName}&background=random`} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-[28px] object-cover ring-2 ring-base2 shadow-lg group-hover:scale-[1.02] transition-all"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-[28px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
                      <Camera className="text-white mb-0.5" size={16} />
                      <span className="text-[7px] text-white font-medium uppercase tracking-widest">Change</span>
                    </div>
                    <input 
                      type="file" 
                      ref={dossierFileRef} 
                      onChange={(e) => handlePhotoUpload(e, 'dossier')} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                  <div>
                     <input 
                        type="text"
                        value={editData?.fullName || ''}
                        onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                        className="text-xl font-medium text-text-emphasis leading-tight text-center bg-transparent border-none focus:ring-0 outline-none w-full"
                     />
                     <p className="text-[10px] text-text font-medium uppercase tracking-widest opacity-60 underline decoration-primary decoration-2 underline-offset-4 mt-1">{selectedUser.role}</p>
                  </div>
               </div>

                {/* Stats Overview */}
               <div className="grid grid-cols-3 gap-2">
                  <div className="bg-primary/5 p-3 rounded-2xl border border-primary/10 text-center backdrop-blur-sm group hover:border-primary/30 transition-all">
                     <p className="text-[8px] uppercase font-black text-primary/60 mb-1 tracking-tighter">Prestige</p>
                     <p className="text-xl font-black text-primary leading-none">
                        {selectedUser.points || 0}
                     </p>
                  </div>
                  <div className="bg-base2/20 p-3 rounded-2xl border border-base2/40 text-center backdrop-blur-sm group hover:border-text/30 transition-all">
                     <p className="text-[8px] uppercase font-black text-text/40 mb-1 tracking-tighter">Battles</p>
                     <p className="text-xl font-black text-text-emphasis leading-none">
                        {userStats[selectedUser._id]?.totalGames || 0}
                     </p>
                  </div>
                  <div className="bg-yellow/5 p-3 rounded-2xl border border-yellow/20 text-center backdrop-blur-sm group hover:border-yellow transition-all">
                     <p className="text-[8px] uppercase font-black text-yellow/60 mb-1 tracking-tighter">Victories</p>
                     <p className="text-xl font-black text-yellow leading-none">
                        {userStats[selectedUser._id]?.totalWins || 0}
                     </p>
                  </div>
               </div>

               {/* Detailed Information */}
               <div className="space-y-4">
                  <div className="space-y-1">
                     <p className="text-[9px] uppercase font-medium text-text/40">Registered Email</p>
                     <div className="flex items-center gap-2 p-3 bg-base2/30 rounded-xl border border-base2/50 opacity-60">
                        <Mail size={14} className="text-primary/60" />
                        <span className="text-xs font-medium truncate">{selectedUser.email}</span>
                     </div>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] uppercase font-medium text-text/40">Mobile Contact</p>
                     <div className="flex items-center gap-2 p-1 bg-base2/30 rounded-xl border border-base2/50 focus-within:border-primary/30 transition-all">
                        <Phone size={13} className="text-primary/60 ml-2" />
                        <input 
                           type="text"
                           value={editData?.phone || ''}
                           onChange={(e) => setEditData({...editData, phone: e.target.value})}
                           className="bg-transparent border-none focus:ring-0 outline-none text-[11px] font-medium w-full py-1"
                           placeholder="No phone set"
                        />
                     </div>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] uppercase font-medium text-text/40">Member Bio</p>
                     <div className="flex items-start gap-2 p-1 bg-base2/30 rounded-xl border border-base2/50 focus-within:border-primary/30 transition-all">
                        <FileText size={13} className="text-primary/60 ml-2 mt-2" />
                        <textarea 
                           value={editData?.bio || ''}
                           onChange={(e) => setEditData({...editData, bio: e.target.value})}
                           className="bg-transparent border-none focus:ring-0 outline-none text-[11px] font-medium w-full py-1 resize-none italic leading-tight"
                           rows="2"
                           placeholder="No bio available"
                        />
                     </div>
                  </div>
                  
                  <div className="pt-2">
                     <button 
                        onClick={handleUpdateUser}
                        disabled={updating}
                        className="w-full py-2.5 bg-primary text-base3 rounded-xl font-medium text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                     >
                        {updating ? <div className="animate-spin w-3 h-3 border-2 border-base3 border-t-transparent rounded-full" /> : <Save size={14} />}
                        Save Member Profile
                     </button>
                  </div>
               </div>

               {/* Role Management */}
               <div className="space-y-2 pt-3 border-t border-base2">
                  <p className="text-[8px] uppercase font-medium text-primary tracking-widest">Authority Control</p>
                  <div className="grid grid-cols-2 gap-2">
                     <button 
                        onClick={() => handleRoleChange(selectedUser._id, 'moderator')}
                        disabled={selectedUser.role === 'moderator' || selectedUser.role === 'admin'}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-purple/10 text-purple border border-purple/20 rounded-xl text-[9px] font-medium uppercase hover:bg-purple/20 transition-all disabled:opacity-20"
                     >
                        <Shield size={12} /> Promote
                     </button>
                     <button 
                        onClick={() => handleRoleChange(selectedUser._id, 'player')}
                        disabled={selectedUser.role === 'player' || selectedUser.role === 'admin'}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue/10 text-blue border border-blue/20 rounded-xl text-[9px] font-medium uppercase hover:bg-blue/20 transition-all disabled:opacity-20"
                     >
                        <User size={12} /> Demote
                     </button>
                  </div>
               </div>
            </div>

            <div className="p-3 bg-base2/30 border-t border-base2">
               <button 
                  onClick={() => { navigate(`/admin/logs?search=${selectedUser.fullName}`); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-base3 border border-base2 rounded-xl text-[9px] font-medium uppercase hover:bg-primary/10 hover:text-primary transition-all group"
               >
                  <History size={14} className="group-hover:animate-spin-slow" /> View Audit Trail
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-base3/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-base2 border border-base2 rounded-2xl shadow-2xl animate-reveal-up overflow-hidden">
              <div className="p-4 border-b border-base2/30 flex items-center justify-between bg-base2/50">
                <div className="flex items-center gap-4">
                  <div 
                    className="relative w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center cursor-pointer group/addpic overflow-hidden"
                    onClick={() => newUserFileRef.current.click()}
                  >
                    {newUser.profilePhoto ? (
                      <img src={newUser.profilePhoto} className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={20} />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/addpic:opacity-100 flex items-center justify-center transition-all">
                       <Camera size={14} className="text-white" />
                    </div>
                    <input 
                      type="file" 
                      ref={newUserFileRef} 
                      onChange={(e) => handlePhotoUpload(e, 'new')} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                  <div>
                    <h3 className="font-medium uppercase text-sm tracking-widest text-text-emphasis">New Member Onboarding</h3>
                    <p className="text-[10px] text-text/40 font-medium uppercase tracking-tight">Register a new system authority</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-base3 rounded-xl transition-all text-text/40 hover:text-red">
                   <X size={20} />
                </button>
              </div>

             <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text/40 uppercase tracking-widest px-1">Full Identity</label>
                    <input 
                      type="text"
                      required
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                      placeholder="Full name of member"
                      className="w-full px-5 py-3.5 bg-base3 border border-base2 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold transition-all placeholder:text-text/20"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text/40 uppercase tracking-widest px-1">Access Email</label>
                    <input 
                      type="email"
                      required
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="member@cuearena.com"
                      className="w-full px-5 py-3.5 bg-base3 border border-base2 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold transition-all placeholder:text-text/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text/40 uppercase tracking-widest px-1">Authority Role</label>
                      <select 
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        className="w-full px-4 py-3.5 bg-base3 border border-base2 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold transition-all"
                      >
                        <option value="player">Player</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text/40 uppercase tracking-widest px-1">Initial Key</label>
                      <div className="relative">
                        <input 
                          type="password"
                          required
                          value={newUser.password}
                          onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                          placeholder="Password"
                          className="w-full pl-5 pr-10 py-3.5 bg-base3 border border-base2 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold transition-all placeholder:text-text/20"
                        />
                        <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-text/20" size={16} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={creating}
                    className="w-full py-4 bg-primary text-base3 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 shadow-xl shadow-primary/30 flex items-center justify-center gap-3 group"
                  >
                    {creating ? (
                      <div className="animate-spin w-5 h-5 border-3 border-base3 border-t-transparent rounded-full" />
                    ) : (
                      <>
                        Deploy Member Account
                        <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-[9px] text-text/30 font-bold uppercase tracking-widest mt-4">Manual registration bypasses standard email verification</p>
                </div>
             </form>
          </div>
        </div>
      )}
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

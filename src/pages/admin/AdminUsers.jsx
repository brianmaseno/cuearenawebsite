import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import StatusPill from '../../components/ui/StatusPill';
import api from '../../api/axios';
import MetricCard from '../../components/ui/MetricCard';
import MemberDetailPanel from '../../components/admin/MemberDetailPanel';
import { DashField, dashInputClass } from '../../components/ui/DashPanel';
import toast from 'react-hot-toast';
import {
  Search,
  Shield,
  User,
  UserCheck,
  UserX,
  Ban,
  Slash,
  Mail,
  Calendar,
  Trophy,
  Target,
  X,
  Camera,
  UserPlus,
  Loader2,
} from 'lucide-react';

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
        api.get(`/users/${u.id}/stats`).then(res => ({ id: u.id, stats: res.data }))
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
      if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, status: data.user.status });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleBlockToggle = async (userId) => {
    try {
      const { data } = await api.put(`/users/${userId}/block`);
      toast.success(data.message);
      fetchUsers();
      if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, status: data.user.status });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Block action failed');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { data } = await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success(data.message);
      fetchUsers();
      if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, role: newRole });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Role update failed');
    }
  };

  const handleUpdateUser = async (e) => {
    if (e) e.preventDefault();
    try {
      setUpdating(true);
      const { data } = await api.put(`/users/${selectedUser.id}`, editData);
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

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('PERMANENT DELETION: Are you sure you want to terminate this account and all associated data? This action is IRREVOCABLE.')) return;
    try {
      setLoading(true);
      const { data } = await api.delete(`/users/${userId}`);
      toast.success(data.message);
      fetchUsers();
      if (selectedUser?.id === userId) setSelectedUser(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Deletion failed');
    } finally {
      setLoading(false);
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

  const getStatusTone = (status) => {
    if (status === 'active') return 'success';
    if (status === 'suspended') return 'warning';
    if (status === 'blocked') return 'danger';
    return 'neutral';
  };

  const userColumns = [
    {
      key: 'profile',
      header: 'Member',
      render: (u) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className={`dash-avatar-sm ${u.status === 'blocked' ? 'opacity-40' : ''}`}>
              {u.fullName.charAt(0)}
            </div>
            {(new Date() - new Date(u.lastActive)) <= 600000 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green rounded-full border-2 border-surface" title="Online" />
            )}
          </div>
          <div className="min-w-0">
            <p className={`dash-cell-emphasis truncate ${u.status === 'blocked' ? 'line-through opacity-50' : ''}`}>
              {u.fullName}
            </p>
            <p className="dash-cell-muted flex items-center gap-1 truncate">
              <Mail size={11} /> {u.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'stats',
      header: 'Stats',
      align: 'center',
      render: (u) => (
        <UserStatsBadge stats={userStats[u.id]} loading={statsLoading && !userStats[u.id]} />
      ),
    },
    {
      key: 'role',
      header: 'Role',
      align: 'center',
      render: (u) => (
        <StatusPill tone={u.role === 'admin' ? 'danger' : u.role === 'moderator' ? 'info' : 'neutral'}>
          {u.role}
        </StatusPill>
      ),
    },
    {
      key: 'auth',
      header: 'Status',
      align: 'center',
      render: (u) => <StatusPill tone={getStatusTone(u.status)}>{u.status}</StatusPill>,
    },
    {
      key: 'joined',
      header: 'Joined',
      align: 'center',
      render: (u) => (
        <span className="dash-cell-muted whitespace-nowrap">
          {new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'points',
      header: 'Points',
      align: 'center',
      render: (u) => <span className="font-semibold text-magenta tabular-nums">{u.points || 0}</span>,
    },
    {
      key: 'activity',
      header: 'Last active',
      render: (u) => (
        <div className="text-center">
          <p className="dash-cell-emphasis text-sm">
            {new Date(u.lastActive).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </p>
          <p className="dash-cell-muted">{u.lastAction || 'Joined'}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cellClassName: 'group',
      render: (u) => (
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => navigate(`/admin/logs?search=${u.fullName}`)} className="px-2 py-1 rounded-lg text-xs font-medium text-text-muted hover:text-magenta hover:bg-magenta/10">Logs</button>
          <button type="button" onClick={() => handleResetPassword(u.id)} disabled={u.role === 'admin'} className="px-2 py-1 rounded-lg text-xs font-medium text-text-muted hover:text-yellow disabled:opacity-30">Reset</button>
          <button type="button" onClick={() => handleStatusToggle(u.id)} disabled={u.role === 'admin' || u.status === 'blocked'} className="px-2 py-1 rounded-lg text-xs font-medium text-text-muted hover:text-green disabled:opacity-30">{u.status === 'suspended' ? 'Activate' : 'Suspend'}</button>
          <button type="button" onClick={() => handleBlockToggle(u.id)} disabled={u.role === 'admin'} className="px-2 py-1 rounded-lg text-xs font-medium text-text-muted hover:text-red disabled:opacity-30">{u.status === 'blocked' ? 'Unblock' : 'Block'}</button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Member Management">
      <div
        className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-160px)]"
      >
        {/* Main Pillar */}
        <div className={`flex-1 transition-all duration-300 space-y-6 flex flex-col min-h-0 ${selectedUser ? 'hidden xl:flex' : 'flex'}`}>
          {/* Statistics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <MetricCard compact label="Admins" value={users.filter(u => u.role === 'admin').length} icon={Shield} />
            <MetricCard compact label="Moderators" value={users.filter(u => u.role === 'moderator').length} icon={Calendar} />
            <div className="hidden md:block"><MetricCard compact label="Players" value={users.filter(u => u.role === 'player').length} icon={User} /></div>
            <div className="hidden md:block"><MetricCard compact label="Logged in" value={users.filter(u => (new Date() - new Date(u.lastActive)) <= 600000).length} icon={UserCheck} /></div>
            <div className="hidden md:block"><MetricCard compact label="Suspended" value={users.filter(u => u.status === 'suspended').length} icon={Slash} /></div>
            <div className="hidden md:block"><MetricCard compact label="Blocked" value={users.filter(u => u.status === 'blocked').length} icon={Ban} /></div>
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
                className="w-full pl-11 pr-4 py-2.5 bg-surface border border-base2 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all text-text-emphasis"
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
                className="aura-btn px-6 py-2.5 shadow-lg shadow-primary/20 text-xs flex items-center gap-2"
              >
                <UserCheck size={16} /> Add User
              </button>
            </div>
          </div>

          {/* User Directory Table */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <DataTable
              columns={userColumns}
              data={filteredUsers}
              keyExtractor={(u) => u.id}
              onRowClick={(u) => setSelectedUser(u)}
              selectedKey={selectedUser?.id}
              loading={loading}
              loadingMessage="Fetching members…"
              emptyIcon={UserX}
              emptyTitle="No members found"
              emptyDescription="Try different search or filter settings."
              minWidth={1000}
              stickyHeader
            />
          </div>
        </div>

        {/* User Detail Side Panel */}
        {selectedUser && (
          <MemberDetailPanel
            user={selectedUser}
            editData={editData}
            setEditData={setEditData}
            userStats={userStats}
            updating={updating}
            onClose={() => setSelectedUser(null)}
            onSave={handleUpdateUser}
            onPhotoClick={() => dossierFileRef.current?.click()}
            fileInputRef={dossierFileRef}
            onPhotoChange={(e) => handlePhotoUpload(e, 'dossier')}
            onRoleChange={handleRoleChange}
            onViewLogs={() => navigate(`/admin/logs?search=${selectedUser.fullName}`)}
            onDelete={handleDeleteUser}
          />
        )}
      </div>

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="dash-detail-modal w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="dash-detail-header">
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => newUserFileRef.current?.click()}
                    className="relative w-12 h-12 rounded-xl overflow-hidden bg-magenta/10 flex items-center justify-center shrink-0 group"
                  >
                    {newUser.profilePhoto ? (
                      <img src={newUser.profilePhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={20} className="text-magenta" />
                    )}
                    <input
                      type="file"
                      ref={newUserFileRef}
                      onChange={(e) => handlePhotoUpload(e, 'new')}
                      accept="image/*"
                      className="hidden"
                    />
                  </button>
                  <div>
                    <h3 className="text-base font-semibold text-text-emphasis">Add member</h3>
                    <p className="text-xs text-text-muted">Create a new account</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowAddModal(false)} className="p-2 rounded-xl hover:bg-base2/40 text-text-muted">
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="dash-detail-body">
              <DashField label="Full name">
                <input
                  type="text"
                  required
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  placeholder="Member name"
                  className={dashInputClass}
                />
              </DashField>
              <DashField label="Email">
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="member@cuearena.com"
                  className={dashInputClass}
                />
              </DashField>
              <div className="grid grid-cols-2 gap-3">
                <DashField label="Role">
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className={dashInputClass}
                  >
                    <option value="player">Player</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </DashField>
                <DashField label="Password">
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="••••••••"
                    className={dashInputClass}
                  />
                </DashField>
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-magenta to-violet text-white text-sm font-semibold disabled:opacity-50"
              >
                {creating ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                Create account
              </button>
              <p className="text-xs text-text-muted text-center">Skips standard email verification</p>
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
    api.get(`/users/${userId}/stats`).then(({ data }) => setVal(data[field]));
  }, [userId, field]);
  return val;
};

export default AdminUsers;

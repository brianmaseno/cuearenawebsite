import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { 
  Users as UsersIcon, 
  Search, 
  UserPlus, 
  MoreVertical, 
  Shield, 
  User, 
  UserCheck, 
  UserX,
  Ban,
  Slash,
  ChevronDown,
  Mail,
  Calendar,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleBlockToggle = async (userId) => {
    try {
      const { data } = await api.put(`/users/${userId}/block`);
      toast.success(data.message);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Block action failed');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { data } = await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success(data.message);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Role update failed');
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
      <div className="space-y-6 animate-reveal">
        {/* Statistics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-base3 border border-base2 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-blue/10 text-blue rounded-xl flex items-center justify-center">
               <UsersIcon size={20} />
            </div>
            <div>
               <p className="text-xs text-text uppercase font-black tracking-widest">Total Members</p>
               <p className="text-xl font-black text-text-emphasis">{users.length}</p>
            </div>
          </div>
          <div className="bg-base3 border border-base2 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-purple/10 text-purple rounded-xl flex items-center justify-center">
               <Shield size={20} />
            </div>
            <div>
               <p className="text-xs text-text uppercase font-black tracking-widest">Moderators</p>
               <p className="text-xl font-black text-text-emphasis">{users.filter(u => u.role === 'moderator').length}</p>
            </div>
          </div>
          <div className="bg-base3 border border-base2 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-red/10 text-red rounded-xl flex items-center justify-center">
               <Ban size={20} />
            </div>
            <div>
               <p className="text-xs text-text uppercase font-black tracking-widest">Restricted</p>
               <p className="text-xl font-black text-text-emphasis">{users.filter(u => u.status !== 'active').length}</p>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text/40" size={18} />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-base3 border border-base2 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2.5 bg-base3 border border-base2 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm min-w-[130px]"
            >
              <option value="ALL">All Roles</option>
              <option value="admin">Admins</option>
              <option value="moderator">Moderators</option>
              <option value="player">Players</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 bg-base3 border border-base2 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm min-w-[130px]"
            >
              <option value="ALL">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        {/* High-Density Users Table */}
        <div className="bg-base3 border border-base2 rounded-2xl overflow-hidden shadow-sm">
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
                  <tr className="border-b border-base2 bg-base2/20 text-text/60 uppercase text-[10px] font-black tracking-widest">
                    <th className="px-4 py-3 w-[25%]">Member Profile</th>
                    <th className="px-4 py-3 w-[12%] text-center">Differentiated Role</th>
                    <th className="px-4 py-3 w-[12%] text-center">Auth Status</th>
                    <th className="px-4 py-3 w-[15%]">Join Date</th>
                    <th className="px-4 py-3 w-[36%] text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base2/50">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-base2 flex items-center justify-center font-black text-sm ring-1 ring-base2 shrink-0 ${u.status === 'blocked' ? 'opacity-30' : 'text-primary'}`}>
                            {u.fullName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className={`font-black text-text-emphasis text-sm truncate leading-tight ${u.status === 'blocked' ? 'line-through text-text/40' : ''}`}>
                              {u.fullName}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-text/60 truncate uppercase font-bold tracking-tight">
                              <Mail size={10} />
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-tighter uppercase border inline-flex items-center gap-1 ${getRoleStyle(u.role)}`}>
                          {u.role === 'admin' && <Shield size={10} />}
                          {u.role === 'moderator' && <Calendar size={10} />}
                          {u.role === 'player' && <User size={10} />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusStyle(u.status)}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-text/70">
                          <Calendar size={12} className="text-primary/40 shrink-0" />
                          <span className="text-[11px] font-bold uppercase">{new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Role Actions */}
                          <div className="flex bg-base2/50 rounded-lg p-0.5 ring-1 ring-base2">
                            <button 
                              onClick={() => handleRoleChange(u._id, 'moderator')}
                              disabled={u.role === 'moderator' || u.role === 'admin'}
                              className={`p-1.5 rounded-md transition-all ${u.role === 'moderator' ? 'bg-purple text-white shadow-sm' : 'text-text/40 hover:text-purple hover:bg-purple/10 disabled:opacity-30'}`}
                              title="Set as Moderator"
                            >
                              <Shield size={14} />
                            </button>
                            <button 
                              onClick={() => handleRoleChange(u._id, 'player')}
                              disabled={u.role === 'player' || u.role === 'admin'}
                              className={`p-1.5 rounded-md transition-all ${u.role === 'player' ? 'bg-blue text-white shadow-sm' : 'text-text/40 hover:text-blue hover:bg-blue/10 disabled:opacity-30'}`}
                              title="Set as Player"
                            >
                              <User size={14} />
                            </button>
                          </div>

                          <div className="w-px h-4 bg-base2 mx-1" />

                          {/* Status Actions */}
                          <button 
                            onClick={() => handleStatusToggle(u._id)}
                            disabled={u.role === 'admin' || u.status === 'blocked'}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border ${
                              u.status === 'suspended' 
                                ? 'bg-emerald/10 text-emerald border-emerald/20 hover:bg-emerald/20' 
                                : 'bg-yellow/10 text-yellow border-yellow/20 hover:bg-yellow/20 disabled:opacity-30 disabled:border-transparent'
                            }`}
                          >
                            {u.status === 'suspended' ? <UserCheck size={14} /> : <Slash size={14} />}
                            {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                          </button>

                          <button 
                            onClick={() => handleBlockToggle(u._id)}
                            disabled={u.role === 'admin'}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border ${
                              u.status === 'blocked' 
                                ? 'bg-blue/10 text-blue border-blue/20 hover:bg-blue/20 shadow-sm' 
                                : 'bg-red/10 text-red border-red/20 hover:bg-red/20'
                            }`}
                          >
                            {u.status === 'blocked' ? <UserCheck size={14} /> : <Ban size={14} />}
                            {u.status === 'blocked' ? 'Unblock' : 'Block Access'}
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

        {/* Administrative Policy */}
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-start gap-3">
          <Shield size={20} className="text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
             <p className="text-xs font-black text-text-emphasis uppercase">Governance Protocol</p>
             <p className="text-[11px] text-text italic leading-relaxed">
               Administrators have absolute authority over membership status. Suspensions restrict participation in future tournaments, while Blocking revokes platform access entirely. All administrative actions are permanently recorded in the Audit Trail.
             </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;

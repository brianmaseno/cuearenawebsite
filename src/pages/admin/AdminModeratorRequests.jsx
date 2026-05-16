import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Shield, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  MoreVertical,
  Search,
  Filter,
  ArrowRight,
  Loader2,
  XCircle,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { maskEmail } from '../../utils/emailHelper';

const AdminModeratorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, aRes] = await Promise.all([
        api.get('/moderator-requests'),
        api.get('/users?role=admin')
      ]);
      setRequests(rRes.data);
      setAdmins(aRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (requestId, adminId) => {
    try {
      await api.patch(`/moderator-requests/${requestId}/assign`, { adminId });
      toast.success('Request allocated successfully');
      fetchData();
    } catch (err) {
      toast.error('Allocation failed');
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      setUpdating(true);
      await api.patch(`/moderator-requests/${requestId}/status`, { status, adminNotes: notes });
      toast.success(`Request marked as ${status}`);
      setShowActionModal(false);
      setNotes('');
      fetchData();
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const filteredRequests = requests
    .filter(r => {
      const matchesSearch = r.fullName.toLowerCase().includes(search.toLowerCase()) || 
                           r.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow/10 text-yellow border-yellow/20';
      case 'allocated': return 'bg-blue/10 text-blue border-blue/20';
      case 'on-hold': return 'bg-orange/10 text-orange border-orange/20';
      case 'rejected': return 'bg-red/10 text-red border-red/20';
      case 'created': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-base2 text-text/40 border-base2';
    }
  };

  return (
    <DashboardLayout title="Moderator Applications">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-base3/40 to-base2/20 p-6 rounded-[24px] border-2 border-primary/20 backdrop-blur-md shadow-inner">
        <div>
          <h1 className="text-2xl font-black text-text-emphasis mb-1 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
              <Shield className="text-primary" size={24} />
            </div>
            Moderator Applications
          </h1>
          <p className="text-[11px] text-text/60 font-bold uppercase tracking-wider opacity-60">Elite Community Governance</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="bg-base2/40 backdrop-blur-xl rounded-xl px-4 py-2 border border-base2/60 shadow-sm group hover:border-primary/20 transition-all">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text/40 block">Incoming Queue</span>
            <span className="text-xl font-black text-text-emphasis tabular-nums">{requests.length}</span>
          </div>
          <div className="bg-yellow/5 backdrop-blur-xl rounded-xl px-4 py-2 border border-yellow/20 shadow-sm group hover:border-yellow/50 transition-all">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow/50 block">Attention Required</span>
            <span className="text-xl font-black text-yellow tabular-nums">{requests.filter(r => r.status === 'pending').length}</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text/30 group-focus-within:text-primary transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search applicants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-base3/30 border border-base2 rounded-xl pl-11 pr-4 py-2.5 text-sm text-text-emphasis focus:ring-1 focus:ring-primary/40 outline-none transition-all font-bold"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-base3/30 border border-base2 rounded-xl pl-4 pr-10 py-2.5 text-text-emphasis font-black text-[11px] uppercase tracking-wider focus:ring-1 focus:ring-primary/40 outline-none transition-all cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="allocated">Allocated</option>
              <option value="on-hold">On Hold</option>
              <option value="rejected">Rejected</option>
              <option value="created">Created</option>
            </select>
            <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text/30 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Requests Grid/Table */}
      <div className="bg-base3/20 border border-base2/40 rounded-[20px] overflow-hidden glass shadow-xl shadow-black/[0.02]">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-base2/10 border-b border-base2/40 backdrop-blur-md">
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-text/40">Identity</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-text/40">Status</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-text/40">Authority</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-text/40">Date</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-text/40 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base2/30">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-8 py-10"><div className="h-12 bg-base2/30 rounded-2xl w-full"></div></td>
                  </tr>
                ))
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="w-16 h-16 bg-base2 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Shield size={32} className="text-text/20" />
                    </div>
                    <p className="text-text/40 font-bold">No applications found</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-base2/5 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-blue/10 flex items-center justify-center border border-primary/20 shadow-sm group-hover:scale-110 transition-transform">
                          <User size={16} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-text-emphasis leading-tight group-hover:text-primary transition-colors text-sm">{request.fullName}</h3>
                          <div className="flex items-center gap-1 text-[9px] font-bold text-text/40 uppercase tracking-tighter">
                            <Mail size={9} /> {maskEmail(request.email)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="relative group/assign">
                        <select
                          className="appearance-none bg-base2/30 border border-base2/50 rounded-lg pl-3 pr-8 py-1.5 text-[11px] font-bold text-text-emphasis hover:bg-base2/50 transition-all cursor-pointer outline-none w-40"
                          value={request.assignedAdminUser?.id || ''}
                          onChange={(e) => handleAssign(request.id, e.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {admins.map(admin => (
                            <option key={admin.id} value={admin.id}>{admin.fullName}</option>
                          ))}
                        </select>
                        <UserPlus size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text/30 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-text/40">
                        <Calendar size={12} />
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-text/40">
                         {request.actionedByUser && (
                           <div className="flex flex-col">
                             <span className="text-[9px] text-text/30 uppercase">Actioned By</span>
                             <span>{request.actionedByUser.fullName}</span>
                           </div>
                         )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button 
                        onClick={() => {
                          setSelectedRequest(request);
                          setNotes(request.adminNotes || '');
                          setShowActionModal(true);
                        }}
                        className="p-2 rounded-lg bg-base2/50 text-text/40 hover:bg-primary hover:text-base3 transition-all active:scale-95 shadow-sm border border-transparent hover:border-primary/20"
                      >
                        <ArrowRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {showActionModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowActionModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-2xl bg-base3/90 backdrop-blur-2xl border border-base2 rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border mb-4 inline-block ${getStatusStyle(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                    <h2 className="text-4xl font-black text-text-emphasis tracking-tight">{selectedRequest.fullName}</h2>
                    <p className="text-text/60 font-medium text-lg">{maskEmail(selectedRequest.email)}</p>
                    {selectedRequest.phone && (
                      <div className="flex items-center gap-2 text-text/40 font-bold text-sm mt-1">
                        <Phone size={14} /> {selectedRequest.phone}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setShowActionModal(false)} className="p-3 rounded-2xl hover:bg-base2/50 transition-colors">
                    <XCircle size={28} className="text-text/30" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-black text-text/30 uppercase tracking-[0.2em] mb-4">Application Experience</h4>
                    <div className="bg-base2/30 rounded-3xl p-6 border border-base2/50 text-text/80 font-medium leading-relaxed italic">
                      "{selectedRequest.experience}"
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-text/30 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                       <MessageSquare size={12} /> Admin Notes & Tracking
                    </h4>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about interviews, background checks, or next steps..."
                      className="w-full bg-base2/30 border border-base2/50 rounded-2xl px-6 py-4 text-text-emphasis focus:ring-2 focus:ring-primary/50 outline-none transition-all font-medium resize-none"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'on-hold')}
                      disabled={updating}
                      className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-orange/10 text-orange border border-orange/20 font-black hover:bg-orange/20 transition-all active:scale-95"
                    >
                      <Clock size={18} /> Mark On Hold
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'rejected')}
                      disabled={updating}
                      className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-red/10 text-red border border-red/20 font-black hover:bg-red/20 transition-all active:scale-95"
                    >
                      <XCircle size={18} /> Reject Application
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'created')}
                      disabled={updating}
                      className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-500/10 text-green-500 border border-green-500/20 font-black hover:bg-green-500/20 transition-all active:scale-95"
                    >
                      <CheckCircle2 size={18} /> Account Created
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </DashboardLayout>
);
};

export default AdminModeratorRequests;

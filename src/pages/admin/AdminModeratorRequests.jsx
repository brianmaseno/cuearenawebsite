import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
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

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.fullName.toLowerCase().includes(search.toLowerCase()) || 
                         r.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow/10 text-yellow border-yellow/20';
      case 'allocated': return 'bg-blue/10 text-blue border-blue/20';
      case 'inprogress': return 'bg-violet/10 text-violet border-violet/20';
      case 'closed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-base2 text-text/40 border-base2';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-base3/30 p-8 rounded-[32px] border border-base2/50 backdrop-blur-sm">
        <div>
          <h1 className="text-3xl font-black text-text-emphasis mb-2 flex items-center gap-3">
            <Shield className="text-primary" size={32} />
            Moderator Applications
          </h1>
          <p className="text-text/60 font-medium">Manage and allocate potential community managers.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="bg-base2/30 rounded-2xl px-4 py-2 border border-base2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text/40 block mb-1">Total Requests</span>
            <span className="text-xl font-black text-text-emphasis">{requests.length}</span>
          </div>
          <div className="bg-yellow/5 rounded-2xl px-4 py-2 border border-yellow/10">
            <span className="text-[10px] font-black uppercase tracking-widest text-yellow/50 block mb-1">Pending</span>
            <span className="text-xl font-black text-yellow">{requests.filter(r => r.status === 'pending').length}</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-text/30 group-focus-within:text-primary transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search applicants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-base3/50 border border-base2 rounded-[20px] pl-14 pr-6 py-4 text-text-emphasis focus:ring-2 focus:ring-primary/50 outline-none transition-all font-medium"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-base3/50 border border-base2 rounded-[20px] pl-6 pr-12 py-4 text-text-emphasis font-black text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="allocated">Allocated</option>
              <option value="inprogress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
            <Filter size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-text/30 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Requests Grid/Table */}
      <div className="bg-base3/30 border border-base2/50 rounded-[40px] overflow-hidden backdrop-blur-xl shadow-2xl shadow-black/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-base2/20 border-b border-base2/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text/40">Applicant</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text/40">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text/40">Assigned To</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text/40">Applied Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text/40 text-right">Actions</th>
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
                  <tr key={request._id} className="hover:bg-base2/10 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center border border-primary/20">
                          <User size={20} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-black text-text-emphasis leading-tight">{request.fullName}</h3>
                          <div className="flex items-center gap-2 text-xs font-medium text-text/50">
                            <Mail size={12} /> {request.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="relative group/assign">
                        <select
                          className="appearance-none bg-base2/50 border border-base2 rounded-xl pl-4 pr-10 py-2 text-xs font-black text-text-emphasis hover:bg-base2 transition-all cursor-pointer outline-none w-48"
                          value={request.assignedAdmin?._id || ''}
                          onChange={(e) => handleAssign(request._id, e.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {admins.map(admin => (
                            <option key={admin._id} value={admin._id}>{admin.fullName}</option>
                          ))}
                        </select>
                        <UserPlus size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text/30 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-text/60">
                        <Calendar size={14} />
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => {
                          setSelectedRequest(request);
                          setNotes(request.adminNotes || '');
                          setShowActionModal(true);
                        }}
                        className="p-3 rounded-xl bg-base2/50 text-text/40 hover:bg-primary hover:text-white transition-all active:scale-95"
                      >
                        <ArrowRight size={18} />
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-base3 border border-base2 rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border mb-4 inline-block ${getStatusStyle(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                    <h2 className="text-4xl font-black text-text-emphasis tracking-tight">{selectedRequest.fullName}</h2>
                    <p className="text-text/60 font-medium text-lg">{selectedRequest.email}</p>
                    {selectedRequest.phone && <p className="text-text/40 font-bold text-sm mt-1">{selectedRequest.phone}</p>}
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

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest._id, 'inprogress')}
                      disabled={updating}
                      className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-violet/10 text-violet border border-violet/20 font-black hover:bg-violet/20 transition-all active:scale-95"
                    >
                      <Clock size={18} /> Move to Progress
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest._id, 'closed')}
                      disabled={updating}
                      className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-500/10 text-green-500 border border-green-500/20 font-black hover:bg-green-500/20 transition-all active:scale-95"
                    >
                      <CheckCircle2 size={18} /> Close & Finalize
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminModeratorRequests;

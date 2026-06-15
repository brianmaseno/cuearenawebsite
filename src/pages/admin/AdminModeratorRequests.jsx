import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import StatusPill from '../../components/ui/StatusPill';
import { DashPanel, dashInputClass } from '../../components/ui/DashPanel';
import { 
  Shield, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  Search,
  Filter,
  ArrowRight,
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

  const getStatusTone = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'allocated': return 'info';
      case 'on-hold': return 'warning';
      case 'rejected': return 'danger';
      case 'created': return 'success';
      default: return 'neutral';
    }
  };

  const columns = [
    {
      key: 'identity',
      header: 'Applicant',
      render: (request) => (
        <div className="flex items-center gap-3">
          <div className="dash-avatar-sm">
            <User size={16} />
          </div>
          <div>
            <p className="dash-cell-emphasis">{request.fullName}</p>
            <p className="dash-cell-muted flex items-center gap-1">
              <Mail size={11} /> {maskEmail(request.email)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (request) => (
        <StatusPill tone={getStatusTone(request.status)}>{request.status}</StatusPill>
      ),
    },
    {
      key: 'authority',
      header: 'Assigned to',
      render: (request) => (
        <div className="relative">
          <select
            className="appearance-none bg-surface/80 border border-base2/40 rounded-xl pl-3 pr-8 py-2 text-sm text-text-emphasis outline-none cursor-pointer w-full max-w-[180px] focus:ring-2 focus:ring-magenta/25"
            value={request.assignedAdminUser?.id || ''}
            onChange={(e) => handleAssign(request.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">Unassigned</option>
            {admins.map(admin => (
              <option key={admin.id} value={admin.id}>{admin.fullName}</option>
            ))}
          </select>
          <UserPlus size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Applied',
      render: (request) => (
        <span className="dash-cell-muted flex items-center gap-1.5">
          <Calendar size={13} />
          {new Date(request.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'action',
      header: '',
      align: 'right',
      render: (request) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRequest(request);
            setNotes(request.adminNotes || '');
            setShowActionModal(true);
          }}
          className="p-2.5 rounded-xl bg-surface border border-base2/40 text-text-muted hover:text-white hover:bg-magenta hover:border-magenta transition-all"
        >
          <ArrowRight size={16} />
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout title="Moderator Applications">
      <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-text-muted">Review and process moderator applications.</p>
        </div>
        <div className="flex gap-3">
          <div className="dash-stat-card py-3 px-4 min-w-[120px]">
            <div>
              <p className="dash-stat-label">Total</p>
              <p className="dash-stat-value text-lg">{requests.length}</p>
            </div>
          </div>
          <div className="dash-stat-card py-3 px-4 min-w-[120px]">
            <div>
              <p className="dash-stat-label">Pending</p>
              <p className="dash-stat-value text-lg text-yellow">{requests.filter(r => r.status === 'pending').length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search applicants…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-base2/40 rounded-xl pl-11 pr-4 py-2.5 text-sm text-text-emphasis focus:ring-2 focus:ring-magenta/25 outline-none"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-surface border border-base2/40 rounded-xl pl-4 pr-10 py-2.5 text-sm text-text-emphasis outline-none cursor-pointer focus:ring-2 focus:ring-magenta/25"
          >
            <option value="all">All status</option>
            <option value="pending">Pending</option>
            <option value="allocated">Allocated</option>
            <option value="on-hold">On hold</option>
            <option value="rejected">Rejected</option>
            <option value="created">Created</option>
          </select>
          <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredRequests}
        loading={loading}
        loadingMessage="Loading applications…"
        emptyIcon={Shield}
        emptyTitle="No applications found"
        minWidth={720}
      />

      {/* Detail panel */}
      <AnimatePresence>
        {showActionModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowActionModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="dash-detail-modal relative z-10 sm:max-h-[90vh] rounded-t-[22px] sm:rounded-[22px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dash-detail-header">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <StatusPill tone={getStatusTone(selectedRequest.status)} className="mb-3">
                      {selectedRequest.status}
                    </StatusPill>
                    <h2 className="text-xl font-bold text-text-emphasis">{selectedRequest.fullName}</h2>
                    <p className="text-sm text-text-muted mt-1">{maskEmail(selectedRequest.email)}</p>
                    {selectedRequest.phone && (
                      <p className="text-sm text-text-muted flex items-center gap-1.5 mt-1">
                        <Phone size={14} /> {selectedRequest.phone}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowActionModal(false)}
                    className="p-2 rounded-xl hover:bg-base2/40 text-text-muted shrink-0"
                  >
                    <XCircle size={22} />
                  </button>
                </div>
              </div>

              <div className="dash-detail-body">
                <div>
                  <p className="dash-detail-section-title">Application experience</p>
                  <div className="dash-detail-quote">{selectedRequest.experience || '—'}</div>
                </div>
                <div>
                  <p className="dash-detail-section-title flex items-center gap-1.5">
                    <MessageSquare size={12} /> Admin notes
                  </p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Interviews, background checks, next steps…"
                    className={`${dashInputClass} resize-none min-h-[100px]`}
                    rows={4}
                  />
                </div>
              </div>

              <div className="dash-detail-actions">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'on-hold')}
                  disabled={updating}
                  className="dash-action-btn dash-action-btn-warn"
                >
                  <Clock size={16} /> Mark on hold
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'rejected')}
                  disabled={updating}
                  className="dash-action-btn dash-action-btn-danger"
                >
                  <XCircle size={16} /> Reject application
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'created')}
                  disabled={updating}
                  className="dash-action-btn dash-action-btn-success"
                >
                  <CheckCircle2 size={16} /> Account created
                </button>
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

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import StatusPill from '../../components/ui/StatusPill';
import api from '../../api/axios';
import { 
  Activity, 
  Search, 
  RotateCcw,
  Shield,
  Monitor,
  Smartphone,
  Globe
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminLogs = () => {
  const [searchParams] = useSearchParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/logs');
      setLogs(data);
    } catch (err) {
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    const matchesSeverity = filterSeverity === 'ALL' || log.severity === filterSeverity;
    
    return matchesSearch && matchesAction && matchesSeverity;
  });

  const actions = ['ALL', ...new Set(logs.map(l => l.action))];
  const severities = ['ALL', 'info', 'warning', 'error'];

  const getDeviceIcon = (ua) => {
    if (!ua) return <Globe size={14} />;
    if (ua.toLowerCase().includes('mobi')) return <Smartphone size={14} />;
    return <Monitor size={14} />;
  };

  const parseUA = (ua) => {
    if (!ua) return 'Unknown Device';
    if (ua.includes('Chrome')) return 'Chrome Browser';
    if (ua.includes('Firefox')) return 'Firefox Browser';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari Browser';
    return 'Web Browser';
  };

  const getActionTone = (action) => {
    if (action === 'LOGIN') return 'info';
    if (action === 'REGISTER') return 'success';
    if (action === 'TOGGLE_USER_STATUS') return 'danger';
    return 'neutral';
  };

  const getSeverityTone = (severity) => {
    if (severity === 'error') return 'danger';
    if (severity === 'warning') return 'warning';
    return 'info';
  };

  const columns = [
    {
      key: 'subject',
      header: 'Subject',
      width: '22%',
      render: (log) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="dash-avatar-sm">
            {log.user?.fullName?.charAt(0) || '?'}
          </div>
          <div className="min-w-0">
            <p className="dash-cell-emphasis truncate">{log.user?.fullName || 'System'}</p>
            <p className="dash-cell-muted capitalize">{log.user?.role || 'automatic'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'event',
      header: 'Event',
      align: 'center',
      width: '15%',
      render: (log) => (
        <div className="flex flex-col items-center gap-1.5">
          <StatusPill tone={getActionTone(log.action)}>
            {log.action?.replace(/_/g, ' ')}
          </StatusPill>
          <StatusPill tone={getSeverityTone(log.severity)} className="text-[11px] py-0.5">
            {log.severity}
          </StatusPill>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      width: '33%',
      render: (log) => (
        <p className="text-sm text-text line-clamp-2 leading-snug">{log.description}</p>
      ),
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      width: '15%',
      render: (log) => (
        <div>
          <p className="dash-cell-emphasis">
            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </p>
          <p className="dash-cell-muted">
            {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </p>
        </div>
      ),
    },
    {
      key: 'origin',
      header: 'Origin',
      width: '15%',
      render: (log) => (
        <div>
          <div className="flex items-center gap-1.5 text-text-muted text-xs font-medium">
            {getDeviceIcon(log.userAgent)}
            <span className="truncate">{parseUA(log.userAgent)}</span>
          </div>
          <p className="dash-cell-mono mt-0.5">{log.ipAddress || '—'}</p>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Platform Audit Logs">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm text-text-muted">Real-time audit trail of administrative and user actions.</p>
          <button 
            type="button"
            onClick={fetchLogs}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-surface hover:bg-base2/40 rounded-xl transition-all text-sm font-medium w-full sm:w-auto border border-base2/40"
          >
            <RotateCcw size={16} />
            Refresh
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text"
              placeholder="Filter by user, action, description…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-surface border border-base2/40 rounded-xl focus:ring-2 focus:ring-magenta/25 outline-none text-sm transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-2.5 bg-surface border border-base2/40 rounded-xl focus:ring-2 focus:ring-magenta/25 outline-none text-sm min-w-[140px]"
            >
              <option value="ALL">All actions</option>
              {actions.filter(a => a !== 'ALL').map(action => (
                <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2.5 bg-surface border border-base2/40 rounded-xl focus:ring-2 focus:ring-magenta/25 outline-none text-sm min-w-[120px]"
            >
              <option value="ALL">All levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredLogs}
          loading={loading}
          loadingMessage="Syncing audit trail…"
          emptyIcon={Activity}
          emptyTitle="No results matching filters"
          emptyDescription="Try broadening your search criteria."
          minWidth={900}
          stickyHeader
        />

        <div className="flex items-center gap-3 px-4 py-3 bg-surface rounded-xl border border-base2/30">
          <Shield size={16} className="text-magenta shrink-0" />
          <p className="text-xs text-text-muted">
            Tamper-proof audit logs retained for 90 days for compliance and oversight.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminLogs;

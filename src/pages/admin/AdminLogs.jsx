import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { 
  Activity, 
  Search, 
  Calendar, 
  User, 
  ChevronRight,
  RotateCcw,
  Shield,
  Info,
  AlertCircle,
  AlertTriangle,
  Monitor,
  Smartphone,
  Globe
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

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

  const getActionColor = (action) => {
    switch (action) {
      case 'LOGIN': return 'bg-blue/10 text-blue border-blue/20';
      case 'REGISTER': return 'bg-emerald/10 text-emerald border-emerald/20';
      case 'CREATE_TOURNAMENT': 
      case 'CREATE_MATCH': return 'bg-primary/10 text-primary border-primary/20';
      case 'TOGGLE_USER_STATUS': return 'bg-red/10 text-red border-red/20';
      case 'BUTTON_CLICK': return 'bg-violet/10 text-violet border-violet/20';
      case 'NAVIGATION': return 'bg-orange/10 text-orange border-orange/20';
      case 'LINK_CLICK': return 'bg-cyan/10 text-cyan border-cyan/20';
      default: return 'bg-base2 text-text border-base2';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error': return <AlertCircle size={14} className="text-red" />;
      case 'warning': return <AlertTriangle size={14} className="text-yellow" />;
      default: return <Info size={14} className="text-blue" />;
    }
  };

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

  return (
    <DashboardLayout title="Platform Audit Logs">
      <div className="space-y-6 animate-reveal">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm text-text">Real-time audit trail of all administrative and user actions.</p>
          <button 
            onClick={fetchLogs}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-base2 hover:bg-base3 rounded-xl transition-all border border-base2 text-sm font-bold w-full sm:w-auto shadow-sm"
          >
            <RotateCcw size={16} />
            Refresh Trail
          </button>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text/40" size={18} />
            <input 
              type="text"
              placeholder="Filter by user, action, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-base3 border border-base2 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-2.5 bg-base3 border border-base2 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm min-w-[140px]"
            >
              <option value="ALL">All Actions</option>
              {actions.filter(a => a !== 'ALL').map(action => (
                <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2.5 bg-base3 border border-base2 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm min-w-[120px]"
            >
              <option value="ALL">All Levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        {/* High-Density Logs Table */}
        <div className="bg-base3 border-2 border-primary/20 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-16 text-center">
              <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-text">Syncing audit trail...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-16 text-center">
              <Activity size={40} className="mx-auto text-base2 mb-3" />
              <p className="text-text-emphasis font-bold">No results matching filters</p>
              <p className="text-xs text-text">Try broadening your search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
                <thead>
                  <tr className="border-b border-base2 bg-base2/20 text-text/60 uppercase text-[10px] font-black tracking-widest">
                    <th className="px-4 py-3 w-[22%]">Subject</th>
                    <th className="px-4 py-3 w-[15%] text-center">Event</th>
                    <th className="px-4 py-3 w-[33%]">Description</th>
                    <th className="px-4 py-3 w-[15%]">Timestamp</th>
                    <th className="px-4 py-3 w-[15%]">Origin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base2/50">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-base2 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-base2 shrink-0">
                            {log.user?.fullName?.charAt(0) || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-text-emphasis text-sm truncate leading-tight">
                              {log.user?.fullName || 'System'}
                            </p>
                            <p className="text-[10px] text-text/60 truncate uppercase">{log.user?.role || 'automatic'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-tighter uppercase border ${getActionColor(log.action)}`}>
                            {log.action?.replace(/_/g, ' ')}
                          </span>
                          <div className="flex items-center gap-1 opacity-60">
                            {getSeverityIcon(log.severity)}
                            <span className="text-[9px] font-bold uppercase">{log.severity}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="text-sm text-text-emphasis leading-tight line-clamp-2">{log.description}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-text-emphasis leading-none">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </p>
                          <p className="text-[10px] text-text/60 uppercase font-medium">
                            {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-text/70">
                            {getDeviceIcon(log.userAgent)}
                            <span className="text-[10px] font-bold truncate">{parseUA(log.userAgent)}</span>
                          </div>
                          <p className="text-[10px] font-mono text-text/40">{log.ipAddress || '—'}</p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Audit Disclaimer */}
        <div className="flex items-center gap-2 px-4 py-3 bg-primary/5 rounded-xl border-2 border-primary/20">
          <Shield size={16} className="text-primary" />
          <p className="text-xs text-text italic">
            Tamper-proof audit logs. This trail is retained for 90 days for compliance and oversight.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminLogs;

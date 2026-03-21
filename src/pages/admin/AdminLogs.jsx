import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Activity, 
  Search, 
  Calendar, 
  User, 
  ChevronRight,
  RotateCcw,
  Shield,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

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
    
    return matchesSearch && matchesAction;
  });

  const actions = ['ALL', ...new Set(logs.map(l => l.action))];

  const getActionColor = (action) => {
    switch (action) {
      case 'LOGIN': return 'bg-blue/10 text-blue';
      case 'REGISTER': return 'bg-emerald/10 text-emerald';
      case 'CREATE_TOURNAMENT': return 'bg-primary/10 text-primary';
      case 'UPDATE_TOURNAMENT': return 'bg-orange/10 text-orange';
      case 'COMPLETE_TOURNAMENT': return 'bg-purple/10 text-purple';
      case 'TOGGLE_USER_STATUS': return 'bg-red/10 text-red';
      default: return 'bg-base2 text-text';
    }
  };

  return (
    <div className="space-y-8 animate-reveal">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-emphasis flex items-center gap-3">
            <Activity className="text-primary" size={32} />
            System Activity Logs
          </h1>
          <p className="text-text mt-2">Track and audit user actions across the platform</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 bg-base2 hover:bg-base3 rounded-xl transition-all border border-base2"
        >
          <RotateCcw size={18} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text/50" size={20} />
          <input 
            type="text"
            placeholder="Search logs by user, action, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-base3 border border-base2 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-4 py-3 bg-base3 border border-base2 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
        >
          {actions.map(action => (
            <option key={action} value={action}>{action}</option>
          ))}
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-base3 border border-base2 rounded-3xl overflow-hidden shadow-xl shadow-black/5">
        {loading ? (
          <div className="p-20 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-text">Loading activity logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-20 text-center">
            <Activity size={48} className="mx-auto text-base2 mb-4" />
            <p className="text-text-emphasis font-medium">No logs found</p>
            <p className="text-text text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-base2 bg-base2/30 text-text uppercase text-xs font-bold tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base2">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-base2/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {log.user?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-text-emphasis leading-none mb-1">
                            {log.user?.fullName || 'Deleted User'}
                          </p>
                          <p className="text-xs text-text">{log.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-tight uppercase ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-text-emphasis line-clamp-2 max-w-md">{log.description}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-text/80">
                        <Calendar size={14} className="text-primary" />
                        <span className="text-sm font-medium">
                          {new Date(log.createdAt).toLocaleString('en-US', { 
                            month: 'short', 
                            day: '2-digit', 
                            year: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false 
                          }).replace(',', ' ·')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono bg-base2 px-2 py-1 rounded text-text/60">
                        {log.ipAddress || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom info */}
      <div className="bg-base2/50 rounded-2xl p-4 flex items-start gap-3 border border-base2">
        <Info className="text-primary shrink-0" size={20} />
        <p className="text-sm text-text leading-relaxed">
          The audit logs store up to the 500 most recent actions for security and performance. 
          Use the search bar to filter for specific users or events. All timestamps are displayed in your local timezone.
        </p>
      </div>
    </div>
  );
};

export default AdminLogs;

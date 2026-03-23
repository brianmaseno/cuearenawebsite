import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  History, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft,
  DollarSign,
  PieChart,
  Users
} from 'lucide-react';

const AdminFinance = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalEscrow: 0,
    totalRevenue: 0,
    totalDeposits: 0,
    totalWithdrawals: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/wallet/admin/all-transactions');
      setTransactions(data);
      
      // Calculate stats (Mock logic for now, should ideally come from backend)
      const escrow = data.filter(t => t.status === 'pending').reduce((acc, t) => acc + t.amount, 0);
      const revenue = data.filter(t => t.type === 'platform_fee').reduce((acc, t) => acc + t.amount, 0);
      const deposits = data.filter(t => t.type === 'deposit').reduce((acc, t) => acc + t.amount, 0);
      const withdrawals = data.filter(t => t.type === 'withdrawal').reduce((acc, t) => acc + t.amount, 0);
      
      setStats({
        totalEscrow: escrow,
        totalRevenue: revenue,
        totalDeposits: deposits,
        totalWithdrawals: withdrawals
      });
    } catch (err) {
      console.error('Failed to load admin finance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTransactions = transactions.filter(t => 
    filter === 'all' || t.type === filter
  );

  return (
    <DashboardLayout title="Financial Oversight">
      <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <ShieldCheck size={24} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Escrow</span>
            </div>
            <p className="text-2xl font-black text-slate-800">KES {stats.totalEscrow.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">Locked in active events</p>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <TrendingUp size={24} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Platform Revenue</span>
            </div>
            <p className="text-2xl font-black text-slate-800">KES {stats.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">Total fees collected (5%)</p>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <ArrowUpRight size={24} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deposits</span>
            </div>
            <p className="text-2xl font-black text-slate-800">KES {stats.totalDeposits.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">Lifetime player deposits</p>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                <ArrowDownLeft size={24} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Withdrawals</span>
            </div>
            <p className="text-2xl font-black text-slate-800">KES {stats.totalWithdrawals.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">Processed payouts</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {['all', 'deposit', 'withdrawal', 'platform_fee', 'stake_lock'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all ${
                  filter === f ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="relative min-w-[300px]">
            <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by User ID or Ref..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map(tx => (
                <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    <p className="text-[10px] text-slate-400">{new Date(tx.createdAt).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-600">{tx.userId?.fullName || tx.userId || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 capitalize">
                      {tx.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`text-sm font-black ${
                      ['deposit', 'platform_fee', 'moderator_fee'].includes(tx.type) ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      KES {tx.amount.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      tx.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      tx.status === 'failed' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">
                    {tx.referenceId ? tx.referenceId.toString().slice(-8).toUpperCase() : 'N/A'}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">
                    No financial data found for the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminFinance;

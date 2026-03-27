import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';
import AuraCard from '../../components/AuraCard';
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
      const [txRes, statsRes] = await Promise.all([
        api.get('/wallet/admin/transactions'),
        api.get('/wallet/admin/stats')
      ]);
      
      setTransactions(txRes.data);
      setStats(statsRes.data);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AuraCard className="p-5 flex items-center gap-4 border-2 border-aura-violet/20 bg-aura-violet/[0.04] relative overflow-hidden group">
            <div className="absolute inset-0 bg-aura-violet/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="p-3 bg-aura-violet/10 text-aura-violet rounded-2xl shrink-0 shadow-inner border border-aura-violet/20">
              <ShieldCheck size={20} />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-black text-aura-violet/60 uppercase tracking-widest block mb-0.5">Total Escrow</span>
              <p className="text-xl font-black text-text-emphasis tracking-tight">KES {stats.totalEscrow.toLocaleString()}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-aura-violet/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700" />
          </AuraCard>

          <AuraCard className="p-5 flex items-center gap-4 border-2 border-emerald-500/20 bg-emerald-500/[0.04] relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl shrink-0 shadow-inner border border-emerald-500/20">
              <TrendingUp size={20} />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest block mb-0.5">Revenue</span>
              <p className="text-xl font-black text-text-emphasis tracking-tight">KES {stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700" />
          </AuraCard>

          <AuraCard className="p-5 flex items-center gap-4 border-2 border-amber-500/20 bg-amber-500/[0.04] relative overflow-hidden group">
            <div className="absolute inset-0 bg-amber-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl shrink-0 shadow-inner border border-amber-500/20">
              <ArrowUpRight size={20} />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest block mb-0.5">Deposits</span>
              <p className="text-xl font-black text-text-emphasis tracking-tight">KES {stats.totalDeposits.toLocaleString()}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700" />
          </AuraCard>

          <AuraCard className="p-5 flex items-center gap-4 border-2 border-rose-500/20 bg-rose-500/[0.04] relative overflow-hidden group">
            <div className="absolute inset-0 bg-rose-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="p-3 bg-rose-500/10 text-rose-600 rounded-2xl shrink-0 shadow-inner border border-rose-500/20">
              <ArrowDownLeft size={20} />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-black text-rose-600/60 uppercase tracking-widest block mb-0.5">Withdrawals</span>
              <p className="text-xl font-black text-text-emphasis tracking-tight">KES {stats.totalWithdrawals.toLocaleString()}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-rose-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700" />
          </AuraCard>
        </div>

        {/* Filters & Search */}
        <div className="bg-base3 p-3 rounded-2xl border-2 border-primary/20 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex gap-2 flex-wrap">
            {['all', 'deposit', 'withdrawal', 'platform_fee', 'moderation_fee', 'prize_payout', 'stake_lock', 'stake_refund'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold capitalize transition-all duration-300 ${
                  filter === f 
                    ? 'bg-primary text-base3 shadow-md shadow-primary/30 ring-2 ring-primary/10' 
                    : 'text-text/60 bg-base2/20 hover:bg-base2/40 hover:text-text'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="relative min-w-[300px] flex-1 md:flex-none">
            <Search size={16} className="absolute left-4 top-2.5 text-text/40" />
            <input 
              type="text" 
              placeholder="Search by User ID or Ref..." 
              className="w-full pl-10 pr-4 py-2 bg-base2/20 border-none rounded-full text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-text/30 shadow-inner"
            />
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-base3 rounded-[2rem] border border-base2/50 shadow-sm overflow-hidden transform transition-all">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-base2/10 border-b border-base2/50">
                <th className="px-6 py-3 text-[10px] font-black text-text/40 uppercase tracking-widest">Date</th>
                <th className="px-6 py-3 text-[10px] font-black text-text/40 uppercase tracking-widest">User</th>
                <th className="px-6 py-3 text-[10px] font-black text-text/40 uppercase tracking-widest">Type</th>
                <th className="px-6 py-3 text-[10px] font-black text-text/40 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-3 text-[10px] font-black text-text/40 uppercase tracking-widest">Status</th>
                <th className="px-6 py-3 text-[10px] font-black text-text/40 uppercase tracking-widest">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base2/20">
              {filteredTransactions.map(tx => (
                <tr key={tx._id} className="hover:bg-base2/10 transition-colors group">
                  <td className="px-6 py-3">
                    <p className="text-[12px] font-black text-text-emphasis tracking-tight">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    <p className="text-[9px] text-text/40 font-bold">{new Date(tx.createdAt).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-6 py-3">
                    <p className="text-[12px] font-bold text-text/70">{tx.userId?.fullName || tx.userId || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-base2/40 text-text/50 uppercase tracking-widest border border-base2/30">
                      {tx.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <p className={`text-[13px] font-black tracking-tighter ${
                      ['deposit', 'platform_fee', 'moderation_fee'].includes(tx.type) ? 'text-emerald-600' : 
                      ['withdrawal', 'prize_payout'].includes(tx.type) ? 'text-rose-600' : 'text-text-emphasis'
                    }`}>
                      KES {tx.amount.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1 w-fit uppercase tracking-widest ${
                      tx.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      tx.status === 'failed' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      <div className={`w-1 h-1 rounded-full ${tx.status === 'completed' ? 'bg-emerald-500' : tx.status === 'failed' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-[10px] font-mono font-bold text-text/20 group-hover:text-text/40 transition-colors">
                    {tx.referenceId ? tx.referenceId.toString().slice(-12).toUpperCase() : 'N/A'}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-text/30 italic font-medium text-xs">
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

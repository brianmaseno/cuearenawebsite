import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import StatusPill from '../../components/ui/StatusPill';
import { 
  TrendingUp, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownLeft,
  History,
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

  const statusTone = (status) => {
    if (status === 'completed') return 'success';
    if (status === 'failed') return 'danger';
    return 'warning';
  };

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (tx) => (
        <div>
          <p className="dash-cell-emphasis">{new Date(tx.createdAt).toLocaleDateString()}</p>
          <p className="dash-cell-muted">{new Date(tx.createdAt).toLocaleTimeString()}</p>
        </div>
      ),
    },
    {
      key: 'user',
      header: 'User',
      render: (tx) => (
        <span className="dash-cell-emphasis">{tx.userId?.fullName || tx.userId || 'N/A'}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (tx) => (
        <StatusPill tone="neutral">{tx.type.replace(/_/g, ' ')}</StatusPill>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (tx) => {
        const positive = ['deposit', 'platform_fee', 'moderation_fee'].includes(tx.type);
        const negative = ['withdrawal', 'prize_payout'].includes(tx.type);
        return (
          <span className={`font-semibold tabular-nums ${
            positive ? 'text-green' : negative ? 'text-red' : 'dash-cell-emphasis'
          }`}>
            KES {tx.amount.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (tx) => <StatusPill tone={statusTone(tx.status)}>{tx.status}</StatusPill>,
    },
    {
      key: 'reference',
      header: 'Reference',
      align: 'right',
      render: (tx) => (
        <span className="dash-cell-mono">
          {tx.referenceId ? tx.referenceId.toString().slice(-12).toUpperCase() : '—'}
        </span>
      ),
    },
  ];

  const statCards = [
    { label: 'Total escrow', value: stats.totalEscrow, icon: ShieldCheck, color: 'text-violet', bg: 'bg-violet/10' },
    { label: 'Revenue', value: stats.totalRevenue, icon: TrendingUp, color: 'text-green', bg: 'bg-green/10' },
    { label: 'Deposits', value: stats.totalDeposits, icon: ArrowUpRight, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Withdrawals', value: stats.totalWithdrawals, icon: ArrowDownLeft, color: 'text-red', bg: 'bg-red/10' },
  ];

  return (
    <DashboardLayout title="Financial Oversight">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-20">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="dash-stat-card">
              <div className={`dash-stat-icon ${bg} ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="dash-stat-label">{label}</p>
                <p className="dash-stat-value">KES {value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="dash-filter-bar">
          <div className="flex gap-1.5 flex-wrap">
            {['all', 'deposit', 'withdrawal', 'platform_fee', 'moderation_fee', 'prize_payout', 'stake_lock', 'stake_refund'].map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`dash-filter-chip ${filter === f ? 'dash-filter-chip-active' : ''}`}
              >
                {f.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredTransactions}
          loading={loading}
          loadingMessage="Loading transactions…"
          emptyIcon={History}
          emptyTitle="No transactions found"
          emptyDescription="Try a different filter to see financial activity."
          minWidth={800}
        />

      </div>
    </DashboardLayout>
  );
};

export default AdminFinance;

import React, { useState, useEffect } from 'react';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Plus, 
  Minus,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';

const WalletPage = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wallet');
      setWallet(res.data.wallet);
      setTransactions(res.data.transactions);
      setError(null);
    } catch (err) {
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/wallet/deposit', { amount: Number(amount) });
      setSuccessMsg(`Successfully deposited KES ${amount}`);
      setAmount('');
      setShowDeposit(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Deposit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/wallet/withdraw', { amount: Number(amount) });
      setSuccessMsg(`Successfully withdrawn KES ${amount}`);
      setAmount('');
      setShowWithdraw(false);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit': return <Plus className="text-emerald-500" />;
      case 'withdrawal': return <Minus className="text-rose-500" />;
      case 'stake_lock': return <Clock className="text-amber-500" />;
      case 'stake_refund': return <ArrowDownLeft className="text-emerald-500" />;
      case 'prize_payout': return <Plus className="text-indigo-500" />;
      case 'moderation_fee': return <TrendingUp className="text-emerald-500" />;
      case 'platform_fee': return <TrendingUp className="text-emerald-500" />;
      default: return <History className="text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'failed': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading && !wallet) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <DashboardLayout title="My Wallet">
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Digital Wallet</h1>
            <p className="text-slate-500">
              {userInfo?.role === 'moderator' 
                ? 'Track your event commissions and manage earnings' 
                : userInfo?.role === 'admin'
                  ? 'Monitor platform revenue and manage withdrawals'
                  : 'Manage your funds and track your tournament winnings'}
            </p>
          </div>
          <div className="flex gap-2">
            {userInfo?.role === 'player' && (
              <button 
                onClick={() => { setShowDeposit(true); setShowWithdraw(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100 text-xs font-bold"
              >
                <Plus size={16} /> Deposit
              </button>
            )}
            <button 
              onClick={() => { setShowWithdraw(true); setShowDeposit(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-xs font-bold"
            >
              <Minus size={16} /> Withdraw
            </button>
          </div>
        </div>

        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3"
          >
            <CheckCircle2 size={20} className="shrink-0" />
            {successMsg}
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3"
          >
            <AlertCircle size={20} className="shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Main Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          {/* Physical Card Style */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-[1.586/1] w-full max-w-[360px] rounded-[2rem] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#312e81] p-6 text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] overflow-hidden hover:shadow-indigo-500/10 transition-all border border-white/5 group"
            >
              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-30 group-hover:opacity-50 transition-opacity"></div>
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div className="w-12 h-8 bg-gradient-to-br from-[#fde68a] via-[#fbbf24] to-[#b45309] rounded shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_2px_4px_rgba(0,0,0,0.3)] flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_25%,rgba(0,0,0,0.1)_25%,rgba(0,0,0,0.1)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.1)_75%)] opacity-30"></div>
                      <div className="w-8 h-5 border border-black/5 rounded-sm flex flex-col justify-between p-0.5">
                        <div className="h-px bg-black/10 w-full"></div>
                        <div className="h-px bg-black/10 w-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black tracking-tight tabular-nums drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80 pr-1">
                      {wallet?.balance?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">
                      {JSON.parse(localStorage.getItem('userInfo'))?.fullName || 'PREMIUM PLAYER'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/5 rounded-full blur-[60px]"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none"></div>
            </motion.div>
          </div>

          {/* Individual Stats Blocks */}
          <div className="lg:col-span-1">
            <motion.div 
              whileHover={{ y: -3, scale: 1.01 }}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-amber-200 transition-all group group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1.5 relative z-10">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-100 transition-colors shadow-inner">
                  <Clock size={20} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 italic">ESCROW</span>
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5 tracking-tight">Active Stakes</p>
                <p className="text-2xl font-black text-slate-900 tabular-nums tracking-tighter">KES {wallet?.lockedBalance?.toLocaleString()}</p>
              </div>
              <div className="absolute -right-3 -bottom-3 opacity-[0.02] text-amber-500 group-hover:scale-105 transition-transform pointer-events-none">
                <ShieldCheck size={80} />
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div 
              whileHover={{ y: -3, scale: 1.01 }}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1.5 relative z-10">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-colors shadow-inner">
                  <TrendingUp size={20} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 italic">
                    {userInfo?.role === 'moderator' ? 'EARNINGS' : 'YIELD'}
                  </span>
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5 tracking-tight">
                  {userInfo?.role === 'moderator' ? 'Total Commission' : 'Net Returns'}
                </p>
                <p className="text-2xl font-black text-slate-900 tabular-nums tracking-tighter">
                  KES {transactions?.filter(t => t.type === (userInfo?.role === 'moderator' ? 'moderation_fee' : 'prize_payout')).reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="absolute -right-3 -bottom-3 opacity-[0.02] text-emerald-500 group-hover:scale-105 transition-transform pointer-events-none">
                <TrendingUp size={80} />
              </div>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Transaction History */}
          <div className={`${showDeposit || showWithdraw ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <History size={20} className="text-indigo-600" /> Recent Transactions
              </h2>
              <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View All</button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-50">
                {transactions.length > 0 && (
                  <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <div className="col-span-5">Transaction Details</div>
                    <div className="col-span-2 text-center">Ref ID</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-3 text-right">Running Balance</div>
                  </div>
                )}
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <div key={tx._id} className="p-4 md:px-6 hover:bg-slate-50 transition-colors flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 md:items-center">
                      <div className="col-span-5 flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                          tx.type === 'deposit' || tx.type === 'prize_payout' || tx.type === 'stake_refund' || tx.type === 'moderation_fee' || tx.type === 'platform_fee' ? 'bg-emerald-50' : 
                          tx.type === 'withdrawal' ? 'bg-rose-50' : 'bg-slate-50'
                        }`}>
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 capitalize truncate leading-tight">{tx.type.replace('_', ' ')}</p>
                          <p className="text-[10px] text-slate-400 font-medium truncate">
                            {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {tx.description && <span className="hidden lg:inline"> • {tx.description}</span>}
                          </p>
                        </div>
                      </div>

                      <div className="col-span-2 md:text-center">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                          {tx.txRef || 'LEGACY'}
                        </span>
                      </div>

                      <div className="col-span-2 md:text-right">
                        <p className={`font-black tracking-tight ${
                          ['deposit', 'prize_payout', 'stake_refund', 'moderation_fee', 'platform_fee'].includes(tx.type) ? 'text-emerald-600' : 'text-slate-900'
                        }`}>
                          {['deposit', 'prize_payout', 'stake_refund', 'moderation_fee', 'platform_fee'].includes(tx.type) ? '+' : '-'} {tx.amount.toLocaleString()}
                        </p>
                      </div>

                      <div className="col-span-3 text-right flex md:block items-center justify-between">
                        <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase tracking-wider">Balance</span>
                        <div className="flex flex-col items-end">
                          <p className="font-black text-slate-600 tabular-nums tracking-tight">Ksh {tx.postBalance?.toLocaleString() || '-'}</p>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border ${getStatusColor(tx.status)} font-black uppercase mt-0.5`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <History className="text-slate-300" size={32} />
                    </div>
                    <p className="text-slate-500 font-medium">No transactions found</p>
                    <p className="text-slate-400 text-sm">Your activity will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Panel */}
          {(showDeposit || showWithdraw) && (
            <div className="lg:col-span-1 space-y-6">
              <AnimatePresence mode="wait">
              {showDeposit ? (
                <motion.div 
                  key="deposit"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Deposit Funds</h3>
                    <button onClick={() => setShowDeposit(false)} className="p-2 hover:bg-white/10 rounded-full">
                      <AlertCircle size={18} className="rotate-45" />
                    </button>
                  </div>
                  <form onSubmit={handleDeposit} className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-2">Amount (KES)</label>
                      <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-200 text-xs">
                      <p className="flex items-center gap-2 mb-1"><CheckCircle2 size={12} /> Instant processing</p>
                      <p className="flex items-center gap-2"><CheckCircle2 size={12} /> Zero transaction fees</p>
                    </div>
                    <button 
                      disabled={submitting}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                    >
                      {submitting ? 'Processing...' : <>Confirm Deposit <ArrowRight size={18} /></>}
                    </button>
                  </form>
                </motion.div>
              ) : showWithdraw ? (
                <motion.div 
                  key="withdraw"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Withdraw Funds</h3>
                    <button onClick={() => setShowWithdraw(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                      <AlertCircle size={18} className="rotate-45" />
                    </button>
                  </div>
                  <form onSubmit={handleWithdraw} className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-2">Amount (KES)</label>
                      <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Min. KES 100"
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl text-slate-500 text-xs font-medium">
                      Available: KES {wallet?.balance?.toLocaleString()}
                    </div>
                    <button 
                      disabled={submitting || Number(amount) > wallet?.balance}
                      className="w-full py-4 bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                    >
                      {submitting ? 'Processing...' : <>Confirm Withdrawal <ArrowRight size={18} /></>}
                    </button>
                  </form>
                </motion.div>
              ) : null}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WalletPage;

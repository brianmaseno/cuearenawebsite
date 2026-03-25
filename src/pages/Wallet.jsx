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
  ShieldCheck,
  Loader2,
  X
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
      case 'withdrawal': return <Minus className="text-red" />;
      case 'stake_lock': return <Clock className="text-amber-500" />;
      case 'stake_refund': return <ArrowDownLeft className="text-emerald-500" />;
      case 'prize_payout': return <Plus className="text-primary" />;
      case 'moderation_fee': return <TrendingUp className="text-emerald-500" />;
      case 'platform_fee': return <TrendingUp className="text-emerald-500" />;
      default: return <History className="text-text/30" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'failed': return 'bg-red/5 text-red border-red/10';
      default: return 'bg-base2/50 text-text/40 border-base2';
    }
  };

  if (loading && !wallet) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <DashboardLayout title="Wallet">
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-text-emphasis tracking-tight">Digital Wallet</h1>
            <p className="text-sm font-bold text-text/60 mt-1">
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
                className="flex items-center gap-2 px-4 py-1.5 md:px-6 md:py-2 bg-primary text-base3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 text-[10px] md:text-xs font-black uppercase tracking-widest"
              >
                <Plus size={16} /> Deposit
              </button>
            )}
            <button 
              onClick={() => { setShowWithdraw(true); setShowDeposit(false); }}
              className="flex items-center gap-2 px-4 py-1.5 md:px-6 md:py-2 bg-base3 text-text-emphasis border border-base2 rounded-xl hover:bg-base2/20 transition-all shadow-sm text-[10px] md:text-xs font-black uppercase tracking-widest"
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 items-start">
          {/* Physical Card Style */}
          <div className="col-span-2 lg:col-span-2 space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-video md:aspect-[1.586/1] w-full max-w-[400px] mx-auto md:mx-0 rounded-[2.5rem] bg-gradient-to-br from-[#073642] via-[#002b36] to-[#073642] p-5 md:p-8 text-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] overflow-hidden transition-all border border-white/10 group"
            >
              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-20 group-hover:opacity-40 transition-opacity"></div>
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div className="w-12 h-8 md:w-14 md:h-10 bg-gradient-to-br from-[#fdf6e3] via-[#eee8d5] to-[#93a1a1] rounded-lg shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_4px_rgba(0,0,0,0.4)] flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_25%,rgba(0,0,0,0.1)_25%,rgba(0,0,0,0.1)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.1)_75%)] opacity-20"></div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-[12px] font-black text-white/50 tracking-[0.3em] uppercase leading-none italic font-mono">CUE MASTERS</p>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <p className="text-[10px] md:text-xs font-black text-white/40 uppercase tracking-[0.2em] leading-none mb-2">Available Balance</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-6xl font-black tracking-tighter tabular-nums drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 pr-1">
                      {wallet?.balance?.toLocaleString()}
                    </span>
                    <span className="text-sm md:text-xl font-bold text-white/30 uppercase tracking-widest">KES</span>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-2">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em] leading-none">Account Holder</p>
                    <p className="text-xs md:text-base font-black text-white tracking-[0.15em] uppercase drop-shadow-sm">
                      {JSON.parse(localStorage.getItem('userInfo'))?.fullName || 'PREMIUM PLAYER'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-xl transition-transform group-hover:scale-110">
                      <ShieldCheck size={20} className="text-white/80" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none grayscale"></div>
            </motion.div>

            {/* Action Panel - Moved here to open below balance card */}
            <AnimatePresence mode="wait">
              {showDeposit ? (
                <motion.div 
                  key="deposit"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-text-emphasis p-8 rounded-[2.5rem] text-base3 shadow-2xl border border-white/5"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black uppercase tracking-tight">Deposit Funds</h3>
                    <button onClick={() => setShowDeposit(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-red/20 hover:text-red transition-all">
                      <X size={18} />
                    </button>
                  </div>
                  <form onSubmit={handleDeposit} className="space-y-6">
                    <div>
                      <label className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] block mb-2.5 ml-1">Amount (KES)</label>
                      <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-lg font-black placeholder:text-white/20 focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 text-primary-light text-xs font-bold space-y-2">
                      <p className="flex items-center gap-2"><CheckCircle2 size={14} /> Instant verification via M-Pesa</p>
                      <p className="flex items-center gap-2"><CheckCircle2 size={14} /> No hidden transaction fees</p>
                    </div>
                    <button 
                      disabled={submitting}
                      className="w-full py-4 bg-primary hover:bg-primary-dark disabled:opacity-50 text-base3 font-black rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                    >
                      {submitting ? <Loader2 className="animate-spin" /> : <>Confirm Deposit <ArrowRight size={18} /></>}
                    </button>
                  </form>
                </motion.div>
              ) : showWithdraw ? (
                <motion.div 
                  key="withdraw"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-base3 p-8 rounded-[2.5rem] border border-base2 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black uppercase tracking-tight text-text-emphasis">Withdraw Funds</h3>
                    <button onClick={() => setShowWithdraw(false)} className="w-10 h-10 rounded-full bg-base2/30 flex items-center justify-center hover:bg-red/10 text-text/40 hover:text-red transition-all">
                      <X size={18} />
                    </button>
                  </div>
                  <form onSubmit={handleWithdraw} className="space-y-6">
                    <div>
                      <label className="text-[10px] text-text/40 font-black uppercase tracking-[0.2em] block mb-2.5 ml-1">Amount (KES)</label>
                      <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Min. KES 100"
                        className="w-full bg-base2/20 border border-base2 rounded-2xl px-6 py-4 text-text-emphasis text-lg font-black placeholder:text-text/20 focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="p-4 bg-base2/10 rounded-2xl text-text/60 text-xs font-bold flex justify-between items-center px-6">
                      <span className="uppercase tracking-widest text-[9px]">Available</span>
                      <span className="text-text-emphasis font-black tabular-nums">KES {wallet?.balance?.toLocaleString()}</span>
                    </div>
                    <button 
                      disabled={submitting || Number(amount) > wallet?.balance}
                      className="w-full py-4 bg-text-emphasis hover:bg-base03 disabled:opacity-50 text-base3 font-black rounded-2xl transition-all shadow-xl shadow-base02/20 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                    >
                      {submitting ? <Loader2 className="animate-spin" /> : <>Confirm Withdrawal <ArrowRight size={18} /></>}
                    </button>
                  </form>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Individual Stats Blocks */}
          <div className="col-span-1 lg:col-span-1">
            <motion.div 
              whileHover={{ y: -3, scale: 1.01 }}
              className="card-premium p-4 md:p-6 flex flex-col justify-between hover:border-amber-500/40 relative overflow-hidden h-full"
            >
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-inner border border-amber-100">
                  <Clock size={20} />
                </div>
                <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100 italic">ESCROW</span>
              </div>
              <div className="relative z-10 mt-auto">
                <p className="text-[10px] font-black text-text/40 uppercase mb-1 tracking-widest">Active Stakes</p>
                <div className="flex items-baseline gap-1.5">
                   <span className="text-2xl font-black text-text-emphasis tabular-nums tracking-tighter">KES {wallet?.lockedBalance?.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-span-1 lg:col-span-1">
            <motion.div 
              whileHover={{ y: -3, scale: 1.01 }}
              className="card-premium p-4 md:p-6 flex flex-col justify-between hover:border-emerald-500/40 relative overflow-hidden h-full"
            >
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner border border-emerald-100">
                  <TrendingUp size={20} />
                </div>
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 italic">
                  {userInfo?.role === 'moderator' ? 'EARNINGS' : 'YIELD'}
                </span>
              </div>
              <div className="relative z-10 mt-auto">
                <p className="text-[10px] font-black text-text/40 uppercase mb-1 tracking-widest">
                  {userInfo?.role === 'moderator' ? 'Total Commission' : 'Net Returns'}
                </p>
                <div className="flex items-baseline gap-1.5">
                   <span className="text-2xl font-black text-text-emphasis tabular-nums tracking-tighter">KES {transactions?.filter(t => t.type === (userInfo?.role === 'moderator' ? 'moderation_fee' : 'prize_payout')).reduce((acc, t) => acc + t.amount, 0).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Transaction History - Simplified grid spanning full width */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-0">
              <h2 className="text-xl font-black text-text-emphasis tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                   <History size={20} />
                </div>
                Recent Activity
              </h2>
              <button className="text-xs font-black uppercase tracking-widest text-primary hover:underline">View All</button>
            </div>
            {/* ... Rest of transaction history ... */}

            <div className="bg-base3 rounded-[2.5rem] border border-base2 shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="divide-y divide-base2/10">
                {transactions.length > 0 && (
                  <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 bg-base2/20 text-[10px] font-black text-text/40 uppercase tracking-[0.2em]">
                    <div className="col-span-5">Transaction Details</div>
                    <div className="col-span-2 text-center">Reference</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-3 text-right">Post Balance</div>
                  </div>
                )}
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <div key={tx._id} className="p-3 md:px-6 hover:bg-base2/10 transition-colors flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 md:items-center group">
                      <div className="md:col-span-5 flex items-center gap-3 overflow-hidden">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${
                          tx.type === 'deposit' || tx.type === 'prize_payout' || tx.type === 'stake_refund' || tx.type === 'moderation_fee' || tx.type === 'platform_fee' 
                             ? 'bg-emerald-50 border-emerald-100' 
                             : tx.type === 'withdrawal' ? 'bg-rose-50 border-rose-100' : 'bg-base2/30 border-base2/50'
                        }`}>
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-text-emphasis capitalize truncate text-sm tracking-tight mb-0">{tx.type.replace('_', ' ')}</p>
                          <p className="text-[9px] text-text/40 font-bold uppercase tracking-widest">
                            {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="md:col-span-2 flex md:justify-center items-center gap-3">
                        <span className="md:hidden text-[9px] font-black text-text/20 uppercase tracking-[0.2em]">Ref</span>
                        <span className="text-[10px] md:text-[11px] font-mono font-black bg-base2/30 text-text/60 px-3 py-1 rounded-lg border border-base2/50 tracking-tighter italic">
                          {tx.txRef || 'LEGACY'}
                        </span>
                      </div>

                      <div className="md:col-span-2 flex md:justify-end items-center gap-3">
                        <span className="md:hidden text-[9px] font-black text-text/20 uppercase tracking-[0.2em]">Amount</span>
                        <p className={`font-black tracking-tighter text-sm md:text-base ${
                          ['deposit', 'prize_payout', 'stake_refund', 'moderation_fee', 'platform_fee'].includes(tx.type) ? 'text-emerald-600' : 'text-text-emphasis'
                        }`}>
                          {['deposit', 'prize_payout', 'stake_refund', 'moderation_fee', 'platform_fee'].includes(tx.type) ? '+' : '-'} {tx.amount.toLocaleString()}
                        </p>
                      </div>

                      <div className="md:col-span-3 flex md:flex-col items-center md:items-end justify-between gap-0.5">
                        <div className="flex items-center gap-3">
                          <span className="md:hidden text-[9px] font-black text-text/20 uppercase tracking-[0.2em]">Balance</span>
                          <p className="text-xs font-black text-text/60 tabular-nums tracking-tighter">KES {tx.postBalance?.toLocaleString() || '-'}</p>
                        </div>
                        <span className={`text-[8px] md:text-[9px] px-2 py-0.5 rounded-md border shadow-sm ${getStatusColor(tx.status)} font-black uppercase tracking-widest`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center">
                    <div className="bg-base2/10 w-20 h-20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-dashed border-base2">
                      <History className="text-text/10" size={40} />
                    </div>
                    <p className="text-text-emphasis font-black uppercase tracking-widest text-sm">Clear History</p>
                    <p className="text-text/40 text-xs font-bold mt-2">No transaction signals recorded yet.</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
};

export default WalletPage;

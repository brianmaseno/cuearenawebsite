import React, { useState, useEffect } from 'react';
import { Trophy, X, DollarSign, Award, Users, AlertCircle, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { calculatePotSplit } from '../../utils/potSplit';

const TournamentPayoutModal = ({ isOpen, onClose, tournament, onSuccess }) => {
  const getInitialPayouts = () => {
    if (tournament?.prizesDistributed && tournament?.payouts?.length > 0) {
      return tournament.payouts;
    }

    const positions = tournament?.rewardPositions || 3;
    const matches = tournament?.matches || [];
    const maxRound = Math.max(...matches.map(m => m.round), 0);
    
    const finalMatch = matches.find(m => m.round === maxRound && m.matchType === 'bracket');
    const thirdPlaceMatch = matches.find(m => m.matchType === 'third_place_playoff');

    const initial = [];
    for (let i = 0; i < positions; i++) {
        let playerId = '';
        let rankLabel = `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} Place`;

        if (i === 0) {
            playerId = tournament?.winner?.id || tournament?.winner || '';
        } else if (i === 1 && finalMatch && finalMatch.status === 'completed') {
            playerId = (finalMatch.winnerId?.id || finalMatch.winnerId || '').toString() === (finalMatch.player1Id?.id || finalMatch.player1Id || '').toString()
                ? finalMatch.player2Id?.id || finalMatch.player2Id
                : finalMatch.player1Id?.id || finalMatch.player1Id;
        } else if (i === 2 && thirdPlaceMatch && thirdPlaceMatch.status === 'completed') {
            playerId = thirdPlaceMatch.winnerId?.id || thirdPlaceMatch.winnerId || '';
        } else if (i === 3 && thirdPlaceMatch && thirdPlaceMatch.status === 'completed') {
            playerId = (thirdPlaceMatch.winnerId?.id || thirdPlaceMatch.winnerId || '').toString() === (thirdPlaceMatch.player1Id?.id || thirdPlaceMatch.player1Id || '').toString()
                ? thirdPlaceMatch.player2Id?.id || thirdPlaceMatch.player2Id
                : thirdPlaceMatch.player1Id?.id || thirdPlaceMatch.player1Id;
        }

        initial.push({
            rank: rankLabel,
            playerId: playerId || '',
            amount: ''
        });
    }
    return initial;
  };

  const [payouts, setPayouts] = useState(getInitialPayouts());
  const [loading, setLoading] = useState(false);

  // Re-initialize if tournament changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setPayouts(getInitialPayouts());
    }
  }, [isOpen, tournament]);

  if (!isOpen || !tournament) return null;

  const isDistributed = tournament.prizesDistributed;

  const totalPot = tournament.confirmedPlayers?.length * (tournament.stakePerPlayer || 0) || 0;
  const { platformFee, moderationFee, winnerPrize: availablePrizePool } = calculatePotSplit(totalPot, tournament.moderatorFee);
  
  const currentTotalPayout = payouts.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const remainingPool = availablePrizePool - currentTotalPayout;

  const handlePayoutChange = (index, field, value) => {
    if (isDistributed) return;
    const newPayouts = [...payouts];
    newPayouts[index][field] = value;
    setPayouts(newPayouts);
  };

  const addPayoutRow = () => {
    if (isDistributed) return;
    setPayouts([...payouts, { rank: `Rank ${payouts.length + 1}`, playerId: '', amount: '' }]);
  };

  const removePayoutRow = (index) => {
    if (payouts.length <= 1) return;
    setPayouts(payouts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const validPayouts = payouts.filter(p => p.playerId && p.amount > 0);
    if (validPayouts.length === 0) {
      toast.error('Please add at least one valid payout');
      return;
    }

    if (currentTotalPayout > availablePrizePool) {
      toast.error('Total payouts exceed the available prize pool');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/tournaments/${tournament.id}/distribute-prizes`, { payouts: validPayouts });
      toast.success('Prizes distributed successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to distribute prizes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-base3 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 bg-gradient-to-br from-slate-900 to-indigo-950 text-text-emphasis relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-base3/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-400/20 text-amber-400 rounded-2xl border border-amber-400/20">
              <Trophy size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase italic line-clamp-1">Distribute Prizes</h2>
              <p className="text-text-emphasis/50 text-sm font-medium">{tournament.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-[10px] font-black text-text-emphasis/40 uppercase tracking-widest mb-1">Total Pot</p>
              <p className="text-lg font-bold">KES {totalPot.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-text-emphasis/40 uppercase tracking-widest mb-1">Net Prize Pool</p>
              <p className="text-lg font-bold text-amber-400">KES {availablePrizePool.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-text-emphasis/40 uppercase tracking-widest mb-1">Fee (15%)</p>
              <p className="text-lg font-bold text-text-emphasis/60">KES {(platformFee + moderationFee).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Winnings Allocation</p>
                <div className={`text-xs font-bold px-2 py-1 rounded-lg ${remainingPool >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  Remaining: KES {remainingPool.toLocaleString()}
                </div>
              </div>

              {payouts.map((payout, index) => (
                <div key={index} className="flex gap-3 group">
                  <div className="w-1/4">
                    <input 
                      type="text"
                      value={payout.rank}
                      onChange={(e) => handlePayoutChange(index, 'rank', e.target.value)}
                      placeholder="e.g. 1st Place"
                      className="w-full bg-slate-50 border-slate-100 rounded-2xl p-3 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500 transition-all"
                      disabled={isDistributed}
                    />
                  </div>
                  <div className="flex-1">
                    <select
                      value={payout.playerId}
                      onChange={(e) => handlePayoutChange(index, 'playerId', e.target.value)}
                      className="w-full bg-slate-50 border-slate-100 rounded-2xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                      disabled={isDistributed}
                    >
                      <option value="">Select Player</option>
                      {tournament?.confirmedPlayers?.map(player => (
                        <option key={player.id} value={player.id}>{player.fullName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-1/4 relative">
                    <input 
                      type="number"
                      value={payout.amount}
                      onChange={(e) => handlePayoutChange(index, 'amount', e.target.value)}
                      placeholder="Amount"
                      className="w-full bg-slate-50 border-slate-100 rounded-2xl p-3 pr-8 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500 transition-all"
                      required
                      disabled={isDistributed}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-[10px]">KES</div>
                  </div>
                  {!isDistributed && (
                    <button 
                      type="button"
                      onClick={() => removePayoutRow(index)}
                      className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {!isDistributed && (
              <button 
                type="button"
                onClick={addPayoutRow}
                className="w-full border-2 border-dashed border-slate-100 rounded-[1.5rem] py-3 text-slate-400 text-xs font-black uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all"
              >
                + Add Payout Tier
              </button>
            )}

            <div className="pt-6">
              <button
                type={isDistributed ? "button" : "submit"}
                onClick={isDistributed ? onClose : undefined}
                disabled={loading || (!isDistributed && remainingPool < 0)}
                className={`w-full py-4 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3
                  ${loading || (!isDistributed && remainingPool < 0)
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : isDistributed ? 'bg-emerald-500 text-text-emphasis shadow-emerald-200' : 'bg-indigo-600 text-text-emphasis hover:bg-indigo-700 shadow-indigo-200'}
                `}
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : isDistributed ? (
                  <>
                    <CheckCircle2 size={20} />
                    Prizes Distributed
                  </>
                ) : (
                  <>
                    <Award size={20} />
                    Confirm Payouts
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default TournamentPayoutModal;

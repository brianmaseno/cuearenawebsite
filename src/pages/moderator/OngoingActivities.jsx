import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Trophy, Target, Clock, Users, ChevronRight, Loader2, AlertCircle, CheckCircle2, XCircle, Trash2, Award, X, Shield, Play, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuraCard from '../../components/AuraCard';
import StatusBadge from '../../components/StatusBadge';
import QuickStatsBar from '../../components/QuickStatsBar';
import toast from 'react-hot-toast';

const OngoingActivities = () => {
  const [data, setData] = useState({ tournaments: [], matches: [], battles: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeSetMap, setActiveSetMap] = useState({});
  const [selectingWinnerForSetMap, setSelectingWinnerForSetMap] = useState({});
  const [expandedBattles, setExpandedBattles] = useState({});
  const [tables, setTables] = useState([]);
  const [showTableModal, setShowTableModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null); // { id, type }
  const [selectedTableId, setSelectedTableId] = useState('');

  const fetchOngoing = async () => {
    try {
      const { data } = await api.get('/moderator/ongoing');
      setData({
        tournaments: data.tournaments || [],
        matches: data.matches || [],
        battles: data.battles || []
      });
    } catch (err) {
      toast.error('Failed to load ongoing activities');
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const { data } = await api.get('/users/me/tables');
      setTables(data || []);
    } catch (err) {
      console.error('Failed to fetch tables');
    }
  };

  useEffect(() => {
    fetchOngoing();
    fetchTables();
  }, []);

  const handleSetWinner = async (matchId, player) => {
    if (!window.confirm(`Set ${player.fullName} as the winner? This will complete the match and move it to history.`)) return;

    setActionLoading(true);
    try {
      await api.put(`/direct-matches/${matchId}/winner`, { winnerId: player._id });
      toast.success('Winner recorded! Match completed.');
      fetchOngoing();
    } catch (err) {
      toast.error('Failed to set winner');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelMatch = async (matchId) => {
    if (!window.confirm('Are you sure you want to cancel this match? This action cannot be undone.')) return;

    setActionLoading(true);
    try {
      await api.put(`/direct-matches/${matchId}/cancel`);
      toast.success('Match cancelled.');
      fetchOngoing();
    } catch (err) {
      toast.error('Failed to cancel match');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordSetWinner = async (match, setIndex, winnerId) => {
    setActionLoading(true);
    try {
      const targetSetIdx = selectingWinnerForSetMap[match._id] !== undefined ? selectingWinnerForSetMap[match._id] : setIndex;

      const endpoint = match.isTournamentMatch
        ? `/tournaments/matches/${match._id}/set-winner`
        : `/direct-matches/${match._id}/set-winner`;

      await api.put(endpoint, { setIndex: targetSetIdx, winnerId });
      toast.success(`Set ${targetSetIdx + 1} recorded!`);

      // Auto-advance to next set if not finished
      // For tournament matches, the backend handles winner logic and progression
      if (!match.isTournamentMatch && targetSetIdx + 1 < match.setsCount && !match.winnerId) {
        setActiveSetMap(prev => ({ ...prev, [match._id]: targetSetIdx + 1 }));
      }

      setSelectingWinnerForSetMap(prev => {
        const next = { ...prev };
        delete next[match._id];
        return next;
      });
      fetchOngoing();
    } catch (err) {
      toast.error('Failed to record set winner');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartBattle = async (battleId) => {
    if (tables.length > 0) {
      setSelectedActivity({ id: battleId, type: 'battle' });
      setShowTableModal(true);
      return;
    }

    if (!window.confirm('Start this battle? This will cancel all remaining pending invitations.')) return;
    setActionLoading(true);
    try {
      await api.put(`/battles/${battleId}/start`);
      toast.success('Battle started!');
      fetchOngoing();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start battle');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartMatch = async (match, isTournament = false) => {
    if (tables.length > 0) {
      setSelectedActivity({ id: match._id, type: isTournament ? 'tournament_match' : 'match' });
      setShowTableModal(true);
      return;
    }

    if (!window.confirm('Start this match?')) return;
    setActionLoading(true);
    try {
      await api.put(`/direct-matches/${matchId}/start`);
      toast.success('Match started!');
      fetchOngoing();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start match');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmStartWithTable = async () => {
    if (!selectedActivity) return;

    setActionLoading(true);
    try {
      let endpoint = '';
      if (selectedActivity.type === 'battle') {
        endpoint = `/battles/${selectedActivity.id}/start`;
      } else if (selectedActivity.type === 'tournament_match') {
        endpoint = `/tournaments/matches/${selectedActivity.id}/start`;
      } else {
        endpoint = `/direct-matches/${selectedActivity.id}/start`;
      }

      await api.put(endpoint, { poolTableId: selectedTableId || undefined });
      const activityLabel = selectedActivity.type === 'battle' ? 'Battle' : 'Match';
      toast.success(`${activityLabel} started! Table Unlocked successfully 🎱`, { icon: '🔓', duration: 4000 });
      setShowTableModal(false);
      setSelectedActivity(null);
      setSelectedTableId('');
      fetchOngoing();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start activity');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordBattleWinner = async (battleId, winnerId, winnerName) => {
    if (!window.confirm(`Confirm ${winnerName} as the winner of this battle?`)) return;
    setActionLoading(true);
    try {
      await api.put(`/battles/${battleId}/result`, { winnerId });
      toast.success('Battle result recorded!');
      fetchOngoing();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record winner');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBattle = async (battleId) => {
    if (!window.confirm('Cancel this battle? All accepted stakes will be refunded.')) return;
    setActionLoading(true);
    try {
      await api.put(`/battles/${battleId}`);
      toast.success('Battle cancelled.');
      fetchOngoing();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel battle');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Active Activities">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Active Activities">
      <div className="space-y-4 md:space-y-6 pb-20">
        <QuickStatsBar />
        {/* Tabs */}
        <div className="flex bg-base3 p-1 rounded-2xl border border-base2 w-full sm:w-fit overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'matches' ? 'bg-primary text-base3 shadow-lg' : 'text-text hover:bg-base2/50'
              }`}
          >
            <Target size={18} />
            Matches ({data.matches.length})
          </button>
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'tournaments' ? 'bg-primary text-base3 shadow-lg' : 'text-text hover:bg-base2/50'
              }`}
          >
            <Trophy size={18} />
            Tournaments ({data.tournaments.length})
          </button>
          <button
            onClick={() => setActiveTab('battles')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'battles' ? 'bg-primary text-base3 shadow-lg' : 'text-text hover:bg-base2/50'
              }`}
          >
            <Shield size={18} />
            Battles ({data.battles.length})
          </button>
        </div>

        {activeTab === 'matches' ? (
          <div className="grid-dashboard">
            {data.matches.length === 0 ? (
              <div className="col-span-full card-premium p-12 text-center text-text italic">
                No active matches found.
              </div>
            ) : (
              data.matches.map((match) => {
                let defaultActive = 0;
                if (match.setsResults && match.status !== 'completed') {
                  for (let i = 0; i < (match.setsCount || 1); i++) {
                    if (!match.setsResults.find(s => s.setIndex === i)) {
                      defaultActive = i;
                      break;
                    }
                  }
                }
                const currentActiveSet = activeSetMap[match._id] !== undefined ? activeSetMap[match._id] : defaultActive;
                const setRes = match.setsResults?.find(s => s.setIndex === currentActiveSet);
                 const isMatchFinished = match.status === 'completed';
                 const isOngoing = match.status === 'ongoing';
                 const isConfirmed = match.status === 'confirmed';
                const selectingSetIdx = selectingWinnerForSetMap[match._id];

                return (
                  <AuraCard key={match._id} className="p-0 rounded-2xl overflow-hidden group hover:ring-2 ring-primary/20 transition-all border-none perspective-1000">
                    <div className="bg-base2/10 p-3 flex justify-between items-center border-b border-base2 preserve-3d">
                      <div className="flex items-center gap-2">
                        {match.isTournamentMatch ? (
                          <div className="w-6 h-6 bg-primary/10 flex items-center justify-center text-primary rounded shadow-sm">
                            <Trophy size={12} />
                          </div>
                        ) : (
                          <img src="/favicon.png" alt="7 Ball" className="w-6 h-6 drop-shadow-sm" />
                        )}
                        <h3 className="text-sm font-black uppercase tracking-tighter text-text-emphasis truncate max-w-[150px]">
                          {match.isTournamentMatch ? (match.tournamentId?.name || 'Tournament') : 'Cue Tournament'}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {match.stakeAmount > 0 && !match.isTournamentMatch && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                            <Award size={10} className="text-emerald-500" />
                            PRIZE: KES {(match.stakeAmount * 2 * 0.85).toLocaleString()}
                          </span>
                        )}
                        {match.isTournamentMatch && match.tournamentId?.stakePerPlayer > 0 && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                            <Award size={10} className="text-emerald-500" />
                            PRIZE: KES {((match.tournamentId.stakePerPlayer * (match.tournamentId.confirmedPlayers?.length || match.tournamentId.maxPlayers)) * 0.85).toLocaleString()}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          {match.status === 'cancelled' && match.declinedBy ? (
                            <span className="text-xs font-black uppercase text-red px-2 py-1 bg-red/10 rounded-lg border border-red/20 animate-pulse">
                              {match.declinedBy.fullName} Declined
                            </span>
                          ) : (
                            <StatusBadge status={match.status} />
                          )}
                          <button
                            disabled={actionLoading}
                            onClick={() => handleCancelMatch(match._id)}
                            className="p-1.5 text-red hover:bg-red/10 rounded-lg transition-colors"
                            title="Cancel Match"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2 relative">
                        {/* Player 1 */}
                        <div
                          className="flex-1 flex-col items-center gap-2 transition-transform flex"
                        >
                          <div className="relative">
                            {match.player1Id ? (
                              <>
                                <img
                                  src={match.player1Id.profilePhoto || `https://ui-avatars.com/api/?name=${match.player1Id.fullName}&background=random`}
                                  alt={match.player1Id.fullName}
                                  className={`w-14 h-14 rounded-2xl object-cover ring-2 shadow-md transition-all ${(match.winnerId?._id || match.winnerId)?.toString() === (match.player1Id?._id || match.player1Id)?.toString() ? 'ring-green scale-105' :
                                      ((setRes?.winnerId?._id || setRes?.winnerId)?.toString() === (match.player1Id?._id || match.player1Id)?.toString() ? 'ring-primary border-4 border-primary/20' : 'ring-base3')
                                    }`}
                                />
                                {!isMatchFinished && setRes && (
                                  <div className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center border shadow-sm transition-all ${(setRes.winnerId?._id || setRes.winnerId)?.toString() === (match.player1Id._id || match.player1Id)?.toString() ? 'bg-primary text-base3 border-primary' : 'bg-base3 text-text/20 border-base2'
                                    }`}>
                                    <CheckCircle2 size={12} />
                                  </div>
                                )}
                                <div className={`absolute -bottom-1 -right-1 p-1 rounded-full shadow-sm ${match.player1Status === 'accepted' ? 'bg-green text-base3' : 'bg-yellow text-base3'
                                  }`}>
                                  {match.player1Status === 'accepted' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                </div>
                              </>
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-base2/50 flex items-center justify-center border-2 border-dashed border-base2 text-text/20">
                                <Users size={24} />
                              </div>
                            )}
                          </div>
                          <div className="text-center">
                            <p className={`text-sm font-bold truncate max-w-[120px] ${match.player1Id && (match.winnerId === (match.player1Id._id || match.player1Id) ? 'text-green' : (setRes?.winnerId === (match.player1Id._id || match.player1Id) ? 'text-primary' : 'text-text-emphasis'))
                              }`}>
                              {match.player1Id?.fullName || 'TBD'}
                            </p>
                            <p className="text-xs font-black uppercase text-primary/60 tracking-wider mt-1">
                              Won: {match.player1Id ? (match.setsResults?.filter(s => (s.winnerId?._id || s.winnerId || '').toString() === (match.player1Id?._id || match.player1Id || '').toString()).length || 0) : 0}/{match.setsCount}
                            </p>
                            {match.winnerId && (
                              <p className={`text-sm font-black uppercase tracking-widest mt-1 px-2 py-1 rounded bg-green/10 ${match.winnerId === (match.player1Id._id || match.player1Id) ? 'text-green' : 'text-red/40 line-through'
                                }`}>
                                {match.winnerId === (match.player1Id._id || match.player1Id) ? 'WON' : 'LOST'}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <div className="text-[10px] font-black uppercase tracking-[0.1em] text-primary/60 text-center max-w-[150px] leading-tight mb-1">
                            {match.title || 'Exhibition Match'}
                          </div>
                          <div className="text-lg font-black text-primary/5 italic leading-none">VS</div>
                        </div>

                        {/* Player 2 */}
                        <div
                          className="flex-1 flex-col items-center gap-2 transition-transform flex"
                        >
                          <div className="relative">
                            {match.player2Id ? (
                              <>
                                <img
                                  src={match.player2Id.profilePhoto || `https://ui-avatars.com/api/?name=${match.player2Id.fullName}&background=random`}
                                  alt={match.player2Id.fullName}
                                  className={`w-14 h-14 rounded-2xl object-cover ring-2 shadow-md transition-all ${(match.winnerId?._id || match.winnerId)?.toString() === (match.player2Id?._id || match.player2Id)?.toString() ? 'ring-green scale-105' :
                                      ((setRes?.winnerId?._id || setRes?.winnerId)?.toString() === (match.player2Id?._id || match.player2Id)?.toString() ? 'ring-violet border-4 border-violet/20' : 'ring-base3')
                                    }`}
                                />
                                {!isMatchFinished && setRes && (
                                  <div className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center border shadow-sm transition-all ${(setRes.winnerId?._id || setRes.winnerId)?.toString() === (match.player2Id._id || match.player2Id)?.toString() ? 'bg-violet text-base3 border-violet' : 'bg-base3 text-text/20 border-base2'
                                    }`}>
                                    <CheckCircle2 size={12} />
                                  </div>
                                )}
                                <div className={`absolute -bottom-1 -right-1 p-1 rounded-full shadow-sm ${match.player2Status === 'accepted' ? 'bg-green text-base3' : 'bg-yellow text-base3'
                                  }`}>
                                  {match.player2Status === 'accepted' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                </div>
                              </>
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-base2/50 flex items-center justify-center border-2 border-dashed border-base2 text-text/20">
                                <Users size={24} />
                              </div>
                            )}
                          </div>
                          <div className="text-center">
                            <p className={`text-sm font-bold truncate max-w-[120px] ${match.player2Id && (match.winnerId === (match.player2Id._id || match.player2Id) ? 'text-green' : (setRes?.winnerId === (match.player2Id._id || match.player2Id) ? 'text-violet' : 'text-text-emphasis'))
                              }`}>
                              {match.player2Id?.fullName || 'TBD'}
                            </p>
                            <p className="text-xs font-black uppercase text-violet/60 tracking-wider mt-1">
                              Won: {match.player2Id ? (match.setsResults?.filter(s => (s.winnerId?._id || s.winnerId || '').toString() === (match.player2Id?._id || match.player2Id || '').toString()).length || 0) : 0}/{match.setsCount}
                            </p>
                            {match.winnerId && match.player2Id && (
                              <p className={`text-sm font-black uppercase tracking-widest mt-1 px-2 py-1 rounded bg-green/10 ${(match.winnerId?._id || match.winnerId).toString() === (match.player2Id?._id || match.player2Id).toString() ? 'text-green' : 'text-red/40 line-through'
                                }`}>
                                {(match.winnerId?._id || match.winnerId).toString() === (match.player2Id?._id || match.player2Id).toString() ? 'WON' : 'LOST'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Redesigned Set Management */}
                    <div className="bg-gradient-to-b from-base2/30 to-transparent p-2 border-t border-base2 mt-auto space-y-2 relative">

                      {/* Set Tabs Container */}
                      <div className="flex flex-wrap gap-1.5 justify-center relative">
                        {Array.from({ length: match.setsCount || 1 }).map((_, idx) => {
                          const sRes = match.setsResults?.find(s => s.setIndex === idx);
                          const isActive = currentActiveSet === idx;
                          // Lock if match not ongoing (unless it's already completed history)
                          const isLocked = !isOngoing && !isMatchFinished ? true : (idx > defaultActive);

                          let tabLabel = `Set ${idx + 1}`;
                          let isWon = false;
                          if (sRes) {
                            const winnerIdStr = (sRes.winnerId?._id || sRes.winnerId || '').toString();
                            const p1IdStr = (match.player1Id?._id || match.player1Id || '').toString();
                            const p2IdStr = (match.player2Id?._id || match.player2Id || '').toString();

                            if (match.player1Id && winnerIdStr === p1IdStr) {
                              tabLabel = match.player1Id.fullName?.split(' ')[0] || '?';
                            } else if (match.player2Id && winnerIdStr === p2IdStr) {
                              tabLabel = match.player2Id.fullName?.split(' ')[0] || '?';
                            }
                            isWon = true;
                          }

                          return (
                            <div key={idx} className="flex-1 min-w-[56px] max-w-[85px]">
                              <button
                                disabled={(isLocked || !isOngoing) && !isMatchFinished}
                                onClick={() => {
                                  if (!isLocked && isOngoing && !sRes && !isMatchFinished) {
                                    setSelectingWinnerForSetMap(prev => ({ ...prev, [match._id]: idx }));
                                  } else {
                                    setActiveSetMap(prev => ({ ...prev, [match._id]: idx }));
                                    setSelectingWinnerForSetMap(prev => { const n = { ...prev }; delete n[match._id]; return n; });
                                  }
                                }}
                                className={`w-full px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all border flex flex-col items-center justify-center min-h-[48px] ${isActive
                                    ? 'bg-blue text-base3 border-blue shadow-lg shadow-blue/20 -translate-y-1 z-20'
                                    : (sRes ? 'bg-base3/80 border-base2/50 opacity-90' : 'bg-base2/5 border-transparent text-text/10')
                                  } ${(isLocked || !isOngoing) && !isMatchFinished ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
                              >
                                <span className={`truncate max-w-full ${isWon ? 'text-sm' : ''}`}>{tabLabel}</span>
                              </button>
                            </div>
                          );
                        })}

                        {/* Centered Overlay for Winner Selection */}
                        {selectingSetIdx !== undefined && (
                          <div className="absolute inset-x-0 inset-y-[-6px] flex justify-center z-50">
                            <div className="w-[420px] bg-base3 rounded-2xl shadow-2xl flex items-center p-2.5 gap-2.5 animate-in zoom-in-95 duration-200 border border-base2/50">
                              <button
                                disabled={!match.player1Id}
                                onClick={() => match.player1Id && handleRecordSetWinner(match, selectingSetIdx, (match.player1Id._id || match.player1Id))}
                                className={`flex-1 flex items-center justify-center h-12 bg-primary/10 hover:bg-primary text-primary hover:text-base3 transition-all rounded-xl text-sm font-black px-4 text-center border border-primary/20 ${!match.player1Id ? 'opacity-30 cursor-not-allowed' : ''}`}
                              >
                                {match.player1Id?.fullName || 'TBD'}
                              </button>
                              <div className="w-px h-8 bg-base2/50"></div>
                              <button
                                disabled={!match.player2Id}
                                onClick={() => match.player2Id && handleRecordSetWinner(match, selectingSetIdx, (match.player2Id._id || match.player2Id))}
                                className={`flex-1 flex items-center justify-center h-12 bg-violet/10 hover:bg-violet text-violet hover:text-base3 transition-all rounded-xl text-sm font-black px-4 text-center border border-violet/20 ${!match.player2Id ? 'opacity-30 cursor-not-allowed' : ''}`}
                              >
                                {match.player2Id?.fullName || 'TBD'}
                              </button>
                              <button
                                onClick={() => setSelectingWinnerForSetMap(prev => { const n = { ...prev }; delete n[match._id]; return n; })}
                                className="w-8 h-8 flex items-center justify-center text-text/20 hover:text-red transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Pending Acceptance Message */}
                        {!isOngoing && !isMatchFinished && (
                          <div className="absolute inset-x-0 bottom-0 top-[0px] bg-base3/60 backdrop-blur-[2px] flex items-center justify-center z-40 rounded-xl border border-dashed border-base2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-emphasis animate-pulse bg-base3 px-4 py-1.5 rounded-full shadow-lg border border-base2 translate-y-[-2px]">
                              Awaiting Players
                            </p>
                          </div>
                        )}
                      </div>

                      {isMatchFinished ? (
                        <div className="w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-sm border bg-green/10 text-green border-green/20">
                          🏆 MATCH COMPLETED: {match.scorePlayer1} - {match.scorePlayer2}
                        </div>
                      ) : (isConfirmed || (match.player1Status === 'accepted' && match.player2Status === 'accepted' && !isOngoing)) ? (
                         <button
                           onClick={() => handleStartMatch(match, match.isTournamentMatch)}
                           className="w-full bg-emerald-600 text-base3 py-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-md shadow-emerald-600/20"
                         >
                           <Play size={14} fill="white" />
                           START MATCH
                         </button>
                       ) : isOngoing ? (
                         <div className="w-full bg-primary/5 text-primary py-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 animate-pulse border border-primary/20 shadow-sm">
                           ⚡ ONGOING MATCH {match.poolTable && <span className="opacity-80 ml-1 tracking-widest text-primary italic">"{typeof match.poolTable === 'object' ? match.poolTable.tableId : match.poolTable}"</span>}
                         </div>
                       ) : (
                         <Link
                           to={match.isTournamentMatch ? `/moderator/manage-tournament/${match.tournamentId?._id || match.tournamentId}` : '#'}
                           className="w-full bg-primary text-base3 py-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-md shadow-primary/20"
                         >
                           <Trophy size={14} />
                           {match.isTournamentMatch ? 'ENTER ROOM' : 'VIEW DETAILS'}
                         </Link>
                       )}
                    </div>
                  </AuraCard>
                );
              })
            )}
          </div>
        ) : activeTab === 'tournaments' ? (
          <div className="grid-dashboard">
            {data.tournaments.length === 0 ? (
              <div className="col-span-full card-premium p-12 text-center text-text italic">
                No active tournaments found.
              </div>
            ) : (
              data.tournaments.map((t) => (
                  <AuraCard key={t._id} className="p-0 rounded-2xl overflow-hidden flex flex-col group border-none shadow-sm transition-all hover:shadow-md perspective-1000">
                    <div className="bg-base2/10 p-4 flex justify-between items-center border-b border-base2 preserve-3d">
                    <div className="w-8 h-8 bg-primary/10 flex items-center justify-center text-primary rounded-lg">
                      <Trophy size={16} />
                    </div>
                    <StatusBadge status={t.status} entryType={t.entryType} registrationDeadline={t.registrationDeadline} startDate={t.startDate} />
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-bold text-text-emphasis mb-2 truncate">{t.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-text/70 mb-4">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Users size={14} className="text-primary" />
                        {t.confirmedPlayers.length}/{t.maxPlayers}
                      </div>
                      {t.stakePerPlayer > 0 && (
                        <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                          <Trophy size={14} className="text-emerald-600" />
                          PRIZE: KES {((t.stakePerPlayer * (t.confirmedPlayers?.length || t.maxPlayers)) * 0.85).toLocaleString()}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 font-bold capitalize">
                        <Award size={14} className="text-yellow" />
                        {t.format.split('_')[0]}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-base2/50">
                      <Link
                        to={`/moderator/manage-tournament/${t._id}`}
                        className="w-full bg-primary text-base3 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:scale-[1.02] transition-all"
                      >
                        Enter Room
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                    </div>
                  </AuraCard>
              ))
            )}
          </div>
        ) : (
          <div className="grid-dashboard">
            {data.battles.length === 0 ? (
              <div className="col-span-full card-premium p-12 text-center text-text italic">
                No active multiplayer battles found.
              </div>
            ) : (
              data.battles.map((battle) => (
                  <AuraCard key={battle._id} className="p-0 rounded-2xl overflow-hidden flex flex-col group border-none shadow-sm transition-all hover:shadow-md perspective-1000">
                    <div className="bg-base2/10 p-4 flex justify-between items-center border-b border-base2 preserve-3d">
                    <div className="w-8 h-8 bg-primary/10 flex items-center justify-center text-primary rounded-lg">
                      <Shield size={16} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                        <Award size={10} className="text-emerald-500" />
                        PRIZE: KES {(battle.stakeAmount * battle.participants.filter(p => p.status === 'accepted').length * 0.85).toLocaleString()}
                      </span>
                      <StatusBadge status={battle.status} />
                      <button
                        disabled={actionLoading}
                        onClick={() => handleCancelBattle(battle._id)}
                        className="p-1 text-red hover:bg-red/10 rounded-lg transition-colors"
                        title="Cancel Battle"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-base font-bold text-text-emphasis mb-1 truncate">{battle.title}</h3>
                    <p className="text-[10px] text-text/60 mb-3 flex items-center gap-1">
                      <MapPin size={10} /> {battle.venue}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-xl text-center">
                        <p className="text-[9px] font-black uppercase text-emerald-600/60 leading-none mb-1">STAKE</p>
                        <p className="text-xs font-black text-emerald-600 leading-none">KES {battle.stakeAmount.toLocaleString()}</p>
                      </div>
                      <div className="bg-primary/5 border border-primary/10 p-2 rounded-xl text-center">
                        <p className="text-[9px] font-black uppercase text-primary/60 leading-none mb-1">TOTAL POT</p>
                        <p className="text-xs font-black text-primary leading-none">KES {(battle.stakeAmount * battle.participants.filter(p => p.status === 'accepted').length).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 max-h-[220px] overflow-y-auto pr-2 thin-scrollbar flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-text/40 mb-1">
                        {battle.status === 'ongoing' ? 'SELECT WINNER' : 'Participants'}
                      </p>
                      {battle.participants
                        .filter(p => {
                          if (battle.status === 'ongoing') return p.status === 'accepted';
                          if (battle.status === 'completed' && !expandedBattles[battle._id]) {
                            return (battle.winnerId?._id || battle.winnerId) === (p.userId?._id || p.userId);
                          }
                          return true;
                        })
                        .map((p) => {
                          const isWinner = (battle.winnerId?._id || battle.winnerId || '').toString() === (p.userId?._id || p.userId || '').toString();
                          return (
                            <div key={p.userId?._id} className={`flex items-center justify-between p-2 rounded-xl border transition-all ${isWinner ? 'bg-green/10 border-green/30' : 'bg-base2/20 border-base2'
                              }`}>
                              <div className="flex items-center gap-2 overflow-hidden">
                                <img
                                  src={p.userId?.profilePhoto || `https://ui-avatars.com/api/?name=${p.userId?.fullName}&background=random`}
                                  className="w-6 h-6 rounded-lg object-cover ring-1 ring-base2 shadow-sm"
                                  alt=""
                                />
                                <span className={`text-[11px] font-bold truncate ${isWinner ? 'text-green' : 'text-text-emphasis'}`}>
                                  {p.userId?.fullName}
                                </span>
                                {isWinner && <Trophy size={10} className="text-green shrink-0 animate-bounce" />}
                              </div>
                              <div className="flex items-center gap-2">
                                {battle.status === 'ongoing' && !battle.winnerId && (
                                  <button
                                    disabled={actionLoading}
                                    onClick={() => handleRecordBattleWinner(battle._id, p.userId?._id, p.userId?.fullName)}
                                    className="px-2 py-0.5 bg-green text-base3 rounded text-[9px] font-black uppercase hover:scale-105 transition-all shadow-sm"
                                  >
                                    WINNER
                                  </button>
                                )}
                                {battle.status !== 'ongoing' && (
                                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${p.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                      p.status === 'declined' ? 'bg-red/5 text-red/60 border-red/10' : 'bg-yellow/5 text-yellow border-yellow/10'
                                    }`}>
                                    {p.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}

                      {battle.status === 'completed' && battle.participants.length > 1 && (
                        <button
                          onClick={() => setExpandedBattles(prev => ({ ...prev, [battle._id]: !prev[battle._id] }))}
                          className="w-full py-1.5 text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center justify-center gap-2 mt-1 border border-dashed border-primary/20 rounded-lg hover:bg-primary/5"
                        >
                          {expandedBattles[battle._id] ? (
                            <>HIDE OTHERS <ChevronRight size={10} className="rotate-90" /></>
                          ) : (
                            <>VIEW ALL PARTICIPANTS ({battle.participants.length}) <ChevronRight size={10} /></>
                          )}
                        </button>
                      )}
                    </div>

                    {battle.status === 'pending' && (
                      <button
                        disabled={actionLoading || battle.participants.filter(p => p.status === 'accepted').length < 2}
                        onClick={() => handleStartBattle(battle._id)}
                        className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all ${battle.participants.filter(p => p.status === 'accepted').length < 2
                            ? 'bg-base2 text-text/40 cursor-not-allowed grayscale'
                            : 'bg-primary text-base3 shadow-primary/20 hover:scale-[1.02]'
                          }`}
                      >
                        <Play size={14} fill="currentColor" />
                        START BATTLE
                      </button>
                    )}

                    {battle.status === 'ongoing' && !battle.winnerId && (
                      <div className="w-full bg-primary/5 text-primary py-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 animate-pulse border border-primary/20">
                        ⚡ BATTLE IN PROGRESS {battle.poolTable && <span className="opacity-80 ml-1 tracking-widest text-primary italic">"{typeof battle.poolTable === 'object' ? battle.poolTable.tableId : battle.poolTable}"</span>}
                      </div>
                    )}

                    {battle.status === 'completed' && (
                      <div className="w-full bg-green/10 text-green py-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 border border-green/20">
                        🏆 BATTLE COMPLETED
                      </div>
                    )}
                  </div>
                </AuraCard>
              ))
            )}
          </div>
        )}
      </div>

      {/* IoT Table Selection Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-base3/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="card-premium w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => { setShowTableModal(false); setSelectedActivity(null); }}
              className="absolute top-4 right-4 text-text/40 hover:text-red transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-500/10 flex items-center justify-center text-emerald-500 rounded-2xl">
                <Play size={24} fill="currentColor" />
              </div>
              <div>
                <h2 className="text-xl font-black text-text-emphasis leading-tight">Identify Pool Table</h2>
                <p className="text-xs text-text/60">Select hardware to trigger ball release</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary">Assigned Table Location/Number</label>
                 <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 thin-scrollbar">
                   {tables.filter(t => t.status === 'available').map(table => (
                    <button
                      key={table._id}
                      onClick={() => setSelectedTableId(table.tableId)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedTableId === table.tableId
                          ? 'border-emerald-500 bg-emerald-500/5 ring-4 ring-emerald-500/10'
                          : 'border-base2 bg-base3 hover:border-primary/30'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedTableId === table.tableId ? 'bg-emerald-500 text-text-emphasis' : 'bg-base2 text-text/40'}`}>
                          <MapPin size={16} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-text-emphasis leading-none">{table.tableId}</p>
                          <p className="text-[10px] text-text/40 font-bold uppercase mt-1">{table.location || 'Default Venue'}</p>
                        </div>
                      </div>
                      {selectedTableId === table.tableId && <CheckCircle2 size={18} className="text-emerald-500" />}
                    </button>
                  ))}

                  <button
                    onClick={() => setSelectedTableId('')}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 border-dashed transition-all ${selectedTableId === ''
                        ? 'border-primary bg-primary/5'
                        : 'border-base2 bg-base3 hover:border-primary/30'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-base2 flex items-center justify-center text-text/40">
                        <AlertCircle size={16} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-text-emphasis">Manual Unlock (No IoT)</p>
                        <p className="text-[10px] text-text/40 uppercase">Proceed without automated trigger</p>
                      </div>
                    </div>
                    {selectedTableId === '' && <CheckCircle2 size={18} className="text-primary" />}
                  </button>
                </div>
              </div>

              <button
                disabled={actionLoading}
                onClick={confirmStartWithTable}
                className="w-full bg-emerald-600 text-base3 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
                START GAME & TRIGGER PULSE
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OngoingActivities;


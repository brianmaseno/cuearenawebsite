import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Trophy, Target, Clock, Users, ChevronRight, Loader2, AlertCircle, CheckCircle2, XCircle, Trash2, Award, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const OngoingActivities = () => {
  const [data, setData] = useState({ tournaments: [], matches: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeSetMap, setActiveSetMap] = useState({});
  const [selectingWinnerForSetMap, setSelectingWinnerForSetMap] = useState({});

  const fetchOngoing = async () => {
    try {
      const { data } = await api.get('/moderator/ongoing');
      setData(data);
    } catch (err) {
      toast.error('Failed to load ongoing activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOngoing();
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
      <div className="space-y-6 pb-20">
        {/* Tabs */}
        <div className="flex bg-base3 p-1 rounded-2xl border border-base2 w-fit">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'matches' ? 'bg-primary text-base3 shadow-lg' : 'text-text hover:bg-base2/50'
            }`}
          >
            <Target size={18} />
            Matches ({data.matches.length})
          </button>
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'tournaments' ? 'bg-primary text-base3 shadow-lg' : 'text-text hover:bg-base2/50'
            }`}
          >
            <Trophy size={18} />
            Tournaments ({data.tournaments.length})
          </button>
        </div>

        {activeTab === 'matches' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                const isOngoing = ['ongoing', 'confirmed'].includes(match.status);
                const selectingSetIdx = selectingWinnerForSetMap[match._id];

                return (
                <div key={match._id} className="card-premium p-0 rounded-2xl overflow-hidden group hover:ring-2 ring-primary/20 transition-all border-none">
                  <div className="bg-base2/10 p-4 flex justify-between items-center border-b border-base2">
                     <div className="flex items-center gap-3">
                        {match.isTournamentMatch ? (
                           <div className="w-7 h-7 bg-primary/10 flex items-center justify-center text-primary rounded shadow-sm">
                              <Trophy size={14} />
                           </div>
                        ) : (
                           <img src="/favicon.png" alt="7 Ball" className="w-7 h-7 drop-shadow-sm" />
                        )}
                        <h3 className="text-sm font-black uppercase tracking-tighter text-text-emphasis">
                           {match.isTournamentMatch ? (match.tournamentId?.name || 'Tournament') : 'Cue Arena'}
                        </h3>
                     </div>
                    <div className="flex items-center gap-1">
                       {match.status === 'cancelled' && match.declinedBy ? (
                         <span className="text-[10px] font-black uppercase text-red px-2 py-1 bg-red/10 rounded-lg border border-red/20 animate-pulse">
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
                                className={`w-14 h-14 rounded-2xl object-cover ring-2 shadow-md transition-all ${
                                  (match.winnerId?._id || match.winnerId)?.toString() === (match.player1Id?._id || match.player1Id)?.toString() ? 'ring-green scale-105' : 
                                  ((setRes?.winnerId?._id || setRes?.winnerId)?.toString() === (match.player1Id?._id || match.player1Id)?.toString() ? 'ring-primary border-4 border-primary/20' : 'ring-base3')
                                }`}
                              />
                              {!isMatchFinished && setRes && (
                                <div className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center border shadow-sm transition-all ${
                                    (setRes.winnerId?._id || setRes.winnerId)?.toString() === (match.player1Id._id || match.player1Id)?.toString() ? 'bg-primary text-base3 border-primary' : 'bg-base3 text-text/20 border-base2'
                                }`}>
                                    <CheckCircle2 size={12} />
                                </div>
                              )}
                              <div className={`absolute -bottom-1 -right-1 p-1 rounded-full shadow-sm ${
                                match.player1Status === 'accepted' ? 'bg-green text-base3' : 'bg-yellow text-base3'
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
                          <p className={`text-sm font-bold truncate max-w-[120px] ${
                             match.player1Id && (match.winnerId === (match.player1Id._id || match.player1Id) ? 'text-green' : (setRes?.winnerId === (match.player1Id._id || match.player1Id) ? 'text-primary' : 'text-text-emphasis'))
                          }`}>
                             {match.player1Id?.fullName || 'TBD'}
                          </p>
                          <p className="text-[10px] font-black uppercase text-primary/60 tracking-wider mt-0.5">
                             Won: {match.player1Id ? (match.setsResults?.filter(s => (s.winnerId?._id || s.winnerId || '').toString() === (match.player1Id?._id || match.player1Id || '').toString()).length || 0) : 0}/{match.setsCount}
                          </p>
                          {match.winnerId && (
                             <p className={`text-[11px] font-black uppercase tracking-widest mt-0.5 px-2 py-0.5 rounded bg-green/10 ${
                                match.winnerId === (match.player1Id._id || match.player1Id) ? 'text-green' : 'text-red/40 line-through'
                             }`}>
                                {match.winnerId === (match.player1Id._id || match.player1Id) ? 'WON' : 'LOST'}
                             </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                         <div className="text-xs font-black uppercase tracking-[0.3em] text-primary/80 text-center max-w-[120px] leading-tight mb-2 drop-shadow-sm">
                            {match.title || 'Exhibition Match'}
                         </div>
                         <div className="text-xl font-black text-primary/10 italic">VS</div>
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
                                className={`w-14 h-14 rounded-2xl object-cover ring-2 shadow-md transition-all ${
                                  (match.winnerId?._id || match.winnerId)?.toString() === (match.player2Id?._id || match.player2Id)?.toString() ? 'ring-green scale-105' : 
                                  ((setRes?.winnerId?._id || setRes?.winnerId)?.toString() === (match.player2Id?._id || match.player2Id)?.toString() ? 'ring-violet border-4 border-violet/20' : 'ring-base3')
                                }`}
                              />
                              {!isMatchFinished && setRes && (
                                <div className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center border shadow-sm transition-all ${
                                    (setRes.winnerId?._id || setRes.winnerId)?.toString() === (match.player2Id._id || match.player2Id)?.toString() ? 'bg-violet text-base3 border-violet' : 'bg-base3 text-text/20 border-base2'
                                }`}>
                                    <CheckCircle2 size={12} />
                                </div>
                              )}
                              <div className={`absolute -bottom-1 -right-1 p-1 rounded-full shadow-sm ${
                                match.player2Status === 'accepted' ? 'bg-green text-base3' : 'bg-yellow text-base3'
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
                          <p className={`text-sm font-bold truncate max-w-[120px] ${
                             match.player2Id && (match.winnerId === (match.player2Id._id || match.player2Id) ? 'text-green' : (setRes?.winnerId === (match.player2Id._id || match.player2Id) ? 'text-violet' : 'text-text-emphasis'))
                          }`}>
                             {match.player2Id?.fullName || 'TBD'}
                          </p>
                          <p className="text-[10px] font-black uppercase text-violet/60 tracking-wider mt-0.5">
                             Won: {match.player2Id ? (match.setsResults?.filter(s => (s.winnerId?._id || s.winnerId || '').toString() === (match.player2Id?._id || match.player2Id || '').toString()).length || 0) : 0}/{match.setsCount}
                          </p>
                          {match.winnerId && match.player2Id && (
                             <p className={`text-[11px] font-black uppercase tracking-widest mt-0.5 px-2 py-0.5 rounded bg-green/10 ${
                                (match.winnerId?._id || match.winnerId).toString() === (match.player2Id?._id || match.player2Id).toString() ? 'text-green' : 'text-red/40 line-through'
                             }`}>
                                {(match.winnerId?._id || match.winnerId).toString() === (match.player2Id?._id || match.player2Id).toString() ? 'WON' : 'LOST'}
                             </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Redesigned Set Management */}
                  <div className="bg-gradient-to-b from-base2/30 to-transparent p-4 border-t border-base2 mt-auto space-y-4 relative">
                     
                     {/* Set Tabs Container */}
                     <div className="flex flex-wrap gap-2 justify-center relative">
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
                            <div key={idx} className="flex-1 min-w-[60px] max-w-[80px]">
                                 <button
                                  disabled={(isLocked || !isOngoing) && !isMatchFinished}
                                  onClick={() => {
                                     if (!isLocked && isOngoing && !sRes && !isMatchFinished) {
                                        setSelectingWinnerForSetMap(prev => ({ ...prev, [match._id]: idx }));
                                     } else {
                                        setActiveSetMap(prev => ({ ...prev, [match._id]: idx }));
                                        setSelectingWinnerForSetMap(prev => { const n = {...prev}; delete n[match._id]; return n; });
                                     }
                                  }}
                                  className={`w-full px-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-tight transition-all border-2 flex flex-col items-center justify-center ${
                                    isActive 
                                      ? 'bg-blue text-base3 border-blue shadow-[0_12px_24px_-8px_rgba(38,139,210,0.5)] -translate-y-1.5 scale-110 z-20' 
                                      : (sRes ? 'bg-base3/80 border-base2/50 opacity-90 hover:opacity-100 hover:border-primary/30' : 'bg-base2/10 border-transparent text-text/20')
                                  } ${(isLocked || !isOngoing) && !isMatchFinished ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
                                >
                                   <span className={`truncate max-w-full ${isWon ? 'text-[10px]' : ''}`}>{tabLabel}</span>
                                </button>
                            </div>
                          );
                        })}

                        {/* Centered Overlay for Winner Selection */}
                        {selectingSetIdx !== undefined && (
                           <div className="absolute inset-x-0 inset-y-[-4px] flex justify-center z-50">
                              <div className="w-[380px] bg-base3 border-2 border-primary rounded-2xl shadow-2xl flex items-center p-2 gap-2 animate-in zoom-in-95 duration-200">
                                 <button 
                                   disabled={!match.player1Id}
                                   onClick={() => match.player1Id && handleRecordSetWinner(match, selectingSetIdx, (match.player1Id._id || match.player1Id))}
                                   className={`flex-1 h-full py-2.5 bg-primary/5 hover:bg-primary text-primary hover:text-base3 transition-all rounded-xl text-[10px] font-black uppercase px-2 text-center border border-primary/10 ${!match.player1Id ? 'opacity-30 cursor-not-allowed' : ''}`}
                                 >
                                    {match.player1Id?.fullName || 'TBD'}
                                 </button>
                                 <div className="w-px h-6 bg-base2"></div>
                                 <button 
                                   disabled={!match.player2Id}
                                   onClick={() => match.player2Id && handleRecordSetWinner(match, selectingSetIdx, (match.player2Id._id || match.player2Id))}
                                   className={`flex-1 h-full py-2.5 bg-violet/5 hover:bg-violet text-violet hover:text-base3 transition-all rounded-xl text-[10px] font-black uppercase px-2 text-center border border-violet/10 ${!match.player2Id ? 'opacity-30 cursor-not-allowed' : ''}`}
                                 >
                                    {match.player2Id?.fullName || 'TBD'}
                                 </button>
                                 <button 
                                   onClick={() => setSelectingWinnerForSetMap(prev => { const n = {...prev}; delete n[match._id]; return n; })}
                                   className="w-8 h-8 flex items-center justify-center text-text/20 hover:text-red transition-colors"
                                 >
                                    <X size={16} />
                                 </button>
                              </div>
                           </div>
                        )}

                        {/* Pending Acceptance Message */}
                        {!isOngoing && !isMatchFinished && (
                           <div className="absolute inset-0 bg-base3/40 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl border border-dashed border-base2">
                              <p className="text-xs font-black uppercase tracking-widest text-text/40 animate-pulse bg-base3 px-4 py-1.5 rounded-full shadow-sm border border-base2">
                                 Waiting for players to accept
                              </p>
                           </div>
                        )}
                     </div>

                     {isMatchFinished && (
                        <div className="w-full py-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 shadow-sm border bg-green/10 text-green border-green/20">
                           🏆 MATCH COMPLETED: {match.scorePlayer1} - {match.scorePlayer2}
                        </div>
                     )}
                  </div>
                </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.tournaments.length === 0 ? (
              <div className="col-span-full card-premium p-12 text-center text-text italic">
                No active tournaments found.
              </div>
            ) : (
              data.tournaments.map((t) => (
                <div key={t._id} className="card-premium p-0 rounded-2xl overflow-hidden flex flex-col group border-none shadow-sm transition-all hover:shadow-md">
                  <div className="bg-base2/10 p-4 flex justify-between items-center border-b border-base2">
                    <div className="w-8 h-8 bg-primary/10 flex items-center justify-center text-primary rounded-lg">
                       <Trophy size={16} />
                    </div>
                    <StatusBadge status={t.status} entryType={t.entryType} registrationDeadline={t.registrationDeadline} />
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-sm font-bold text-text-emphasis mb-2 truncate">{t.name}</h3>
                    <div className="flex items-center gap-3 text-[10px] text-text/70 mb-4">
                      <div className="flex items-center gap-1.5 font-bold">
                         <Users size={12} className="text-primary" />
                         {t.confirmedPlayers.length}/{t.maxPlayers}
                      </div>
                      <div className="flex items-center gap-1.5 font-bold capitalize">
                         <Award size={12} className="text-yellow" />
                         {t.format.split('_')[0]}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-base2/50">
                      <Link 
                        to={`/moderator/manage-tournament/${t._id}`}
                        className="w-full bg-primary text-base3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] transition-all"
                      >
                        Enter Room
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OngoingActivities;

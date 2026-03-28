import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import {
  Trophy as TrophyIcon,
  User,
  Users,
  Target as TargetIcon,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  Award as AwardIcon,
  CheckCircle2 as CheckIcon,
  XCircle as CancelIcon,
  Loader2,
  Shield,
  MapPin,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const History = () => {
  const [data, setData] = useState({ tournaments: [], matches: [], battles: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');
  const [subFilter, setSubFilter] = useState('all');
  const [expandedBattles, setExpandedBattles] = useState({});

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/moderator/history');
      setData({
        tournaments: data.tournaments || [],
        matches: data.matches || [],
        battles: data.battles || []
      });
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleRebook = async (type, id) => {
    try {
      setLoading(true);
      const endpoint = type === 'battle' ? `/battles/${id}/rebook` : `/direct-matches/${id}/rebook`;
      await api.post(endpoint);
      toast.success('Rematch created! Invitations sent.');
      window.location.href = '/moderator';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to rebook');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getFilteredData = () => {
    let list = [];
    if (activeTab === 'matches') list = data.matches;
    else if (activeTab === 'battles') list = data.battles;
    else list = data.tournaments;
    
    if (subFilter === 'all') return list;
    return list.filter(item => item.status === (subFilter === 'completed' ? 'completed' : 'cancelled'));
  };

  const filteredData = getFilteredData();

  if (loading) {
    return (
      <DashboardLayout title="Activity History">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Activity History">
      <div className="space-y-10 pb-20 max-w-[1600px] mx-auto px-4 md:px-8 bg-background min-h-screen" style={{ fontFamily: "'Outfit', sans-serif" }}>
        {/* Header Section */}
        <div className="pt-8">
          <h1 className="text-4xl md:text-5xl font-black text-text-emphasis tracking-tight mb-2">
            Activity <span className="text-primary">History</span>
          </h1>
          <p className="text-text/60 font-medium">Review and manage past tournaments, matches, and battles.</p>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex items-center p-1 bg-base2/50 backdrop-blur-xl rounded-[24px] md:rounded-[28px] border-[3px] border-primary/20 shadow-inner w-full sm:w-fit overflow-x-auto no-scrollbar">
            {[
              { id: 'matches', label: 'Matches', count: data.matches.length, icon: TargetIcon, color: 'bg-blue-500', shadow: 'shadow-blue-500/40' },
              { id: 'tournaments', label: 'Tournaments', count: data.tournaments.length, icon: TrophyIcon, color: 'bg-amber-500', shadow: 'shadow-amber-500/40' },
              { id: 'battles', label: 'Battles', count: data.battles.length, icon: Shield, color: 'bg-emerald-600', shadow: 'shadow-emerald-600/40' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSubFilter('all'); }}
                className={`flex-1 md:flex-none px-3 sm:px-8 py-3 md:py-3.5 text-[10px] sm:text-[12px] font-black uppercase tracking-wider md:tracking-[0.15em] rounded-[18px] md:rounded-[22px] transition-all duration-500 flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                  activeTab === tab.id 
                  ? `${tab.color} text-base3 shadow-lg ${tab.shadow} scale-[1.02]` 
                  : 'text-text/60 hover:text-primary hover:bg-base2/50'
                }`}
              >
                <tab.icon size={14} className="sm:w-4 sm:h-4" />
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Sub-Filters */}
          <div className="flex items-center p-1 bg-base2/30 rounded-[24px] border-[3px] border-primary/20 w-full sm:w-fit overflow-x-auto no-scrollbar scroll-smooth">
            {[
              { id: 'all', label: 'All', icon: TargetIcon },
              { id: 'completed', label: 'Completed', icon: CheckIcon },
              { id: 'cancelled', label: 'Cancelled', icon: CancelIcon }
            ].map(f => {
              const currentList = activeTab === 'matches' ? data.matches : (activeTab === 'tournaments' ? data.tournaments : data.battles);
              const count = currentList?.filter(item => f.id === 'all' ? true : item.status === f.id).length || 0;

              return (
                <button
                  key={f.id}
                  onClick={() => setSubFilter(f.id)}
                  className={`flex-1 sm:flex-none px-3 sm:px-6 py-2.5 rounded-[18px] text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap ${subFilter === f.id
                      ? 'bg-surface text-primary shadow-sm border border-base2'
                      : 'text-text/40 hover:text-text/60'
                    }`}
                >
                  <f.icon size={12} />
                  {f.label}
                  <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] ${subFilter === f.id ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === 'matches' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.length === 0 ? (
              <div className="col-span-full card-premium p-12 text-center text-text italic">
                No {subFilter !== 'all' ? subFilter : ''} match history found.
              </div>
            ) : (
              filteredData.map((match) => {
                const winnerIdObj = match.winnerId?._id || match.winnerId;
                const p1IdObj = match.player1Id?._id || match.player1Id;
                const p2IdObj = match.player2Id?._id || match.player2Id;

                const isP1Winner = winnerIdObj && winnerIdObj.toString() === p1IdObj?.toString();
                const isP2Winner = winnerIdObj && winnerIdObj.toString() === p2IdObj?.toString();
                const isCancelled = match.status === 'cancelled';

                const winnerName = match.winnerId?.fullName || (isP1Winner ? match.player1Id?.fullName : isP2Winner ? match.player2Id?.fullName : null);

                return (
                  <div key={match._id} className="card-premium p-0 rounded-2xl overflow-hidden group transition-all border-[3px] border-primary/20 bg-base3/10 shadow-sm hover:shadow-md">
                    <div className="bg-base2/5 p-3 flex flex-wrap md:flex-nowrap gap-2 justify-between items-center border-b border-base2/50 overflow-hidden">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <img src="/favicon.png" alt="7 Ball" className="w-5 h-5 md:w-6 md:h-6 shrink-0 drop-shadow-sm" />
                        <h3 className="text-[clamp(10px,1.1vw,13px)] font-black uppercase tracking-tighter text-text-emphasis truncate min-w-0 drop-shadow-sm">
                          {match.isTournamentMatch ? (match.tournamentId?.name || 'Tournament') : 'Exhibition'}
                        </h3>
                      </div>
                      <div className="flex flex-wrap md:flex-nowrap items-center gap-1.5 justify-end shrink-0">
                        {match.isTournamentMatch ? (
                          match.tournamentId?.stakePerPlayer > 0 && (
                          <span className="text-[clamp(7.5px,0.85vw,9.5px)] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border-[1.5px] border-emerald-100 flex items-center gap-1 shrink-0 whitespace-nowrap drop-shadow-sm">
                            <AwardIcon size={10} className="text-emerald-500" />
                            PRIZE: KES {((match.tournamentId.stakePerPlayer * (match.tournamentId.confirmedPlayers?.length || match.tournamentId.maxPlayers)) * 0.85).toLocaleString()}
                          </span>
                        )
                      ) : (
                        match.stakeAmount > 0 && (
                          <span className="text-[clamp(7.5px,0.85vw,9.5px)] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border-[1.5px] border-emerald-100 flex items-center gap-1 shrink-0 whitespace-nowrap drop-shadow-sm">
                            <AwardIcon size={10} className="text-emerald-500" />
                            PRIZE: KES {(match.stakeAmount * 2 * 0.85).toLocaleString()}
                          </span>
                        )
                      )}
                        {isCancelled ? (
                          <span className="text-[clamp(7.5px,0.85vw,9.5px)] font-black uppercase text-red bg-red/10 px-1.5 py-0.5 rounded-md tracking-widest border-[1.5px] border-red/10 whitespace-nowrap shrink-0 drop-shadow-sm">Cancelled</span>
                        ) : (
                          <span className="text-[clamp(7.5px,0.85vw,9.5px)] font-black uppercase text-green bg-green/10 px-1.5 py-0.5 rounded-md tracking-widest border-[1.5px] border-green/10 whitespace-nowrap shrink-0 drop-shadow-sm">Completed</span>
                        )}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2 relative">
                        {/* Player 1 */}
                        <div className="flex-1 flex flex-col items-center gap-2">
                          <div className="relative">
                            <img
                              src={match.player1Id?.profilePhoto || `https://ui-avatars.com/api/?name=${match.player1Id?.fullName}&background=random`}
                              alt={match.player1Id?.fullName}
                              className={`w-14 h-14 rounded-2xl object-cover ring-2 shadow-md transition-all ${isP1Winner ? 'ring-green scale-105' : 'ring-base3 opacity-60'
                                }`}
                            />
                            {isP1Winner && (
                              <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-green text-base3 flex items-center justify-center border border-white shadow-sm">
                                <TrophyIcon size={10} />
                              </div>
                            )}
                            {!isCancelled && (
                              <div className={`absolute -bottom-1 -right-1 p-1 rounded-full shadow-sm bg-green text-base3`}>
                                <CheckIcon size={10} />
                              </div>
                            )}
                          </div>
                          <div className="text-center">
                            <p className={`text-[11px] font-bold truncate max-w-[80px] ${isP1Winner ? 'text-green' : 'text-text/40'}`}>
                              {match.player1Id?.fullName}
                            </p>
                            <p className="text-[8px] font-black uppercase text-primary/60 tracking-wider mt-0.5">
                              Sets won: {match.scorePlayer1 || 0}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                          <div className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/80 text-center max-w-[200px] leading-tight mb-2 drop-shadow-sm">
                            {match.title || 'Exhibition Match'}
                          </div>
                          <div className="text-xl font-black text-primary/10 italic">VS</div>
                        </div>

                        {/* Player 2 */}
                        <div className="flex-1 flex flex-col items-center gap-2">
                          <div className="relative">
                            <img
                              src={match.player2Id?.profilePhoto || `https://ui-avatars.com/api/?name=${match.player2Id?.fullName}&background=random`}
                              alt={match.player2Id?.fullName}
                              className={`w-14 h-14 rounded-2xl object-cover ring-2 shadow-md transition-all ${isP2Winner ? 'ring-green scale-105' : 'ring-base3 opacity-60'
                                }`}
                            />
                            {isP2Winner && (
                              <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-green text-base3 flex items-center justify-center border border-white shadow-sm">
                                <TrophyIcon size={10} />
                              </div>
                            )}
                            {!isCancelled && (
                              <div className={`absolute -bottom-1 -right-1 p-1 rounded-full shadow-sm bg-green text-base3`}>
                                <CheckIcon size={10} />
                              </div>
                            )}
                          </div>
                          <div className="text-center">
                            <p className={`text-[11px] font-bold truncate max-w-[80px] ${isP2Winner ? 'text-green' : 'text-text/40'}`}>
                              {match.player2Id?.fullName}
                            </p>
                            <p className="text-[8px] font-black uppercase text-violet/60 tracking-wider mt-0.5">
                              Sets won: {match.scorePlayer2 || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-base2/10 p-4 border-t border-base2 space-y-3 relative overflow-visible mt-auto">
                      <div className="flex flex-col items-center justify-center text-center space-y-2">
                        <div className={`flex items-center gap-2 font-black uppercase tracking-widest text-[10px] sm:text-[11px] flex-wrap justify-center ${isCancelled ? 'text-red/60' : 'text-green'}`}>
                          {isCancelled ? <CancelIcon size={14} /> : <AwardIcon size={14} />}
                          <span className="truncate max-w-[140px] xs:max-w-[200px]">
                            {isCancelled ? (
                              match.declinedBy ? `Declined: by ${match.declinedBy.fullName}` : 'Match Cancelled'
                            ) : (winnerName ? `Winner: ${winnerName}` : 'No Winner Announced')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-text/40 font-bold text-[10px]">
                          <div className="flex items-center gap-1.5 leading-none">
                            <CalendarIcon size={12} />
                            {new Date(match.updatedAt).toLocaleDateString()}
                          </div>
                          <div className="h-3 w-px bg-base2/50"></div>
                          <div className="flex items-center gap-1.5 leading-none">
                            <ClockIcon size={12} />
                            {new Date(match.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        {!match.isTournamentMatch && (
                          <button
                            onClick={() => handleRebook('match', match._id)}
                            className="mt-4 w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-primary/20"
                          >
                            <RefreshCw size={12} />
                            Rebook Rematch
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : activeTab === 'battles' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.length === 0 ? (
              <div className="col-span-full card-premium p-12 text-center text-text italic">
                No {subFilter !== 'all' ? subFilter : ''} battle history found.
              </div>
            ) : (
                filteredData.map((battle) => {
                  const isCancelled = battle.status === 'cancelled';
                  return (
                    <div key={battle._id} className="card-premium p-0 rounded-2xl overflow-hidden flex flex-col transition-all shadow-sm hover:shadow-md border-[3px] border-primary/20 bg-base3/10">
                      <div className="bg-base2/5 p-4 flex flex-wrap md:flex-nowrap gap-3 justify-between items-center border-b border-base2/50 overflow-hidden">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                           <div className="w-8 h-8 bg-primary/10 flex items-center justify-center text-primary rounded-lg shadow-sm shrink-0">
                              <Shield size={16} />
                           </div>
                           <span className="text-[clamp(10px,1.1vw,13px)] font-black uppercase text-text/40 tracking-widest truncate min-w-0">Battle Room</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                        {isCancelled ? (
                          <span className="text-[clamp(7.5px,0.85vw,9.5px)] font-black uppercase text-red bg-red/10 px-1.5 py-0.5 rounded-md tracking-widest border border-red/10 whitespace-nowrap">Cancelled</span>
                        ) : (
                          <span className="text-[clamp(7.5px,0.85vw,9.5px)] font-black uppercase text-green bg-green/10 px-1.5 py-0.5 rounded-md tracking-widest border border-green/10 whitespace-nowrap">Completed</span>
                        )}
                      </div>
                    </div>
                      
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-sm font-bold text-text-emphasis mb-1 truncate">{battle.title}</h3>
                        <p className="text-[10px] text-text/60 mb-3 flex items-center gap-1">
                          <MapPin size={10} /> {battle.venue}
                        </p>

                        {!isCancelled && (
                          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl mb-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green text-base3 flex items-center justify-center shadow-sm">
                               <TrophyIcon size={20} />
                            </div>
                            <div>
                               <p className="text-[8px] font-black uppercase text-text/40 leading-none mb-0.5">Winner</p>
                               <p className="text-sm font-bold text-text-emphasis">
                                  {battle.winnerId?.fullName || 'No Winner'}
                               </p>
                            </div>
                          </div>
                        )}

                        {expandedBattles[battle._id] && (
                          <div className="space-y-2 mb-4 max-h-[140px] overflow-y-auto pr-2 thin-scrollbar flex-1 opacity-60 animate-in slide-in-from-top-2 duration-300">
                            {battle.participants.map((p) => {
                              const isWinner = battle.winnerId?._id === p.userId?._id;
                              return (
                                <div key={p.userId?._id} className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                                  isWinner ? 'bg-green/10 border-green/30' : 'bg-base2/20 border-base2'
                                }`}>
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <img 
                                      src={p.userId?.profilePhoto || `https://ui-avatars.com/api/?name=${p.userId?.fullName}&background=random`} 
                                      className="w-5 h-5 rounded object-cover"
                                      alt=""
                                    />
                                    <span className={`text-[10px] font-bold truncate ${isWinner ? 'text-green' : 'text-text-emphasis'}`}>
                                      {p.userId?.fullName}
                                    </span>
                                  </div>
                                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                    p.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red/5 text-red/60 border-red/10'
                                  }`}>
                                    {p.status}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <button
                          onClick={() => setExpandedBattles(prev => ({ ...prev, [battle._id]: !prev[battle._id] }))}
                          className="w-full py-1.5 text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center justify-center gap-2 mb-4 border border-dashed border-primary/20 rounded-lg hover:bg-primary/5"
                        >
                           {expandedBattles[battle._id] ? (
                             <>Hide Participants <ChevronRight size={10} className="rotate-90" /></>
                           ) : (
                             <>View Participants ({battle.participants.length}) <ChevronRight size={10} /></>
                           )}
                        </button>
                      </div>

                      <div className="bg-base2/10 p-4 border-t border-base2 mt-auto">
                        <div className="flex items-center justify-between text-[10px] font-bold text-text/40 mb-3">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon size={12} />
                              {new Date(battle.updatedAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <ClockIcon size={12} />
                              {new Date(battle.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRebook('battle', battle._id)}
                          className="w-full py-2 bg-primary text-base3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-md active:scale-95"
                        >
                          <RefreshCw size={12} />
                          Rebook Battle
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.length === 0 ? (
              <div className="col-span-full card-premium p-12 text-center text-text italic">
                No {subFilter !== 'all' ? subFilter : ''} tournament history found.
              </div>
            ) : (
              filteredData.map((t) => {
                const isCancelled = t.status === 'cancelled';
                return (
                  <div key={t._id} className="card-premium p-0 rounded-2xl overflow-hidden flex flex-col group transition-all shadow-sm hover:shadow-md h-full border-[3px] border-primary/20 bg-base3/10">
                    <div className="bg-base2/5 p-4 flex flex-wrap md:flex-nowrap gap-2 justify-between items-center border-b border-base2/50 overflow-hidden">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <img src="/favicon.png" alt="7 Ball" className="w-6 h-6 shrink-0 drop-shadow-sm" />
                        <h3 className="text-[clamp(10px,1.1vw,13px)] font-black uppercase tracking-tighter text-text-emphasis truncate min-w-0">{t.name || 'Cue Tournament'}</h3>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5">
                        {isCancelled ? (
                          <span className="text-[clamp(7.5px,0.85vw,9.5px)] font-black uppercase text-red bg-red/10 px-1.5 py-0.5 rounded-md tracking-widest border border-red/10 whitespace-nowrap">Cancelled</span>
                        ) : (
                          <span className="text-[clamp(7.5px,0.85vw,9.5px)] font-black uppercase text-green bg-green/10 px-1.5 py-0.5 rounded-md tracking-widest border border-green/10 whitespace-nowrap">Completed</span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 flex-1">
                      <h3 className="text-base font-bold text-text-emphasis mb-3 truncate">{t.name || 'Untitled Tournament'}</h3>
                      <div className="flex items-center gap-3 text-[10px] text-text/70 mb-4">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Users size={12} className="text-primary" />
                          {t.confirmedPlayers?.length || 0} Players
                        </div>
                        <div className="flex items-center gap-1.5 font-bold capitalize">
                          <AwardIcon size={12} className="text-yellow" />
                          {t.format?.split('_')[0] || 'N/A'}
                        </div>
                      </div>

                      {t.winner && (
                        <div className="p-3 bg-yellow/5 border border-yellow/20 rounded-xl mb-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-yellow/10 flex items-center justify-center text-yellow">
                            <TrophyIcon size={20} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase text-yellow/60 tracking-tighter">Tournament Winner</p>
                            <p className="text-sm font-bold text-text-emphasis truncate">{t.winner?.fullName || (typeof t.winner === 'string' ? t.winner : 'N/A')}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Completion Metadata Footer matching Match Style */}
                    <div className="bg-base2/10 p-4 border-t border-base2 mt-auto">
                      <div className="flex items-center justify-between text-[10px] font-bold text-text/40">
                        <Link to={`/moderator/manage-tournament/${t._id}`} className="flex items-center gap-1.5 font-black uppercase tracking-wider text-primary hover:text-primary-focus transition-colors">
                          <TargetIcon size={12} />
                          View Tournament Details
                        </Link>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {t.updatedAt ? new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default History;

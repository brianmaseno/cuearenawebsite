import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Trophy, Target, Clock, Users, ChevronRight, Loader2, Target as TargetIcon, Trophy as TrophyIcon, ArrowRight, Bell, MessageSquare, XCircle, CheckCircle2, Award, Wallet as WalletIcon, Shield, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuraCard from '../../components/AuraCard';
import StatusBadge from '../../components/StatusBadge';
import QuickStatsBar from '../../components/QuickStatsBar';
import toast from 'react-hot-toast';

const PlayerDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ tournaments: [], matches: [], invitations: [], notifications: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');
  const [userId, setUserId] = useState(null);
  const [activeSetMap, setActiveSetMap] = useState({});

  const fetchData = async () => {
    try {
      const [ongoingRes, notifRes] = await Promise.all([
        api.get('/direct-matches/player/ongoing'),
        api.get('/notifications/my'),
      ]);
      
      const userStr = localStorage.getItem('userInfo');
      if (userStr) {
        const u = JSON.parse(userStr);
        setUserId(u._id);
      }

      setData({
        matches: ongoingRes.data.matches || [],
        tournamentMatches: ongoingRes.data.tournamentMatches || [],
        battles: ongoingRes.data.battles || [],
        tournaments: ongoingRes.data.tournaments || [],
        notifications: notifRes.data || [],
        // Calculate invitations from all sources
        invitations: [
          ...(ongoingRes.data.matches || []).filter(m => m.myStatus === 'pending'),
          ...(ongoingRes.data.tournamentMatches || []).filter(m => m.myStatus === 'pending'),
          ...(ongoingRes.data.battles || []).filter(b => b.myStatus === 'pending'),
          ...(ongoingRes.data.tournaments || []).filter(t => t.myStatus === 'pending')
        ]
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleInvitationResponse = async (invitationId, status, type = null, targetId = null) => {
    try {
      if (!invitationId && (!type || !targetId)) {
        toast.error('Invitation ID or target info not found');
        return;
      }
      
      if (invitationId) {
        await api.post(`/invitations/${invitationId}/respond`, { status });
      } else {
        await api.post(`/invitations/respond-by-target/${type}/${targetId}`, { status });
      }

      toast.success(`Invitation ${status}`);
      fetchData();
    } catch (err) {
      console.error('Error responding to invitation:', err);
      const message = err.response?.data?.message || '';
      
      if (message.toLowerCase().includes('insufficient funds')) {
        toast.error(
          (t) => (
            <div className="flex flex-col gap-2">
              <span className="font-bold">Insufficient Funds</span>
              <span className="text-xs opacity-90">You need more funds in your wallet to accept this invitation.</span>
              <button 
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate('/wallet');
                }}
                className="mt-1 bg-white text-rose-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors"
              >
                Go to Wallet <ArrowRight size={12} />
              </button>
            </div>
          ),
          { duration: 6000, position: 'top-center', style: { border: '1px solid #fee2e2', background: '#fef2f2', color: '#991b1b' } }
        );
      } else {
        toast.error(message || 'Error responding to invitation');
      }
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

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
      <div className="space-y-8 pb-20">
        

        {/* Quick Stats */}
        <QuickStatsBar />

        {/* Tabs */}
        <div className="flex bg-base3 p-1 rounded-2xl border border-base2 w-full sm:w-fit overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'matches' ? 'bg-primary text-base3 shadow-lg' : 'text-text hover:bg-base2/50'
            }`}
          >
            <Target size={18} />
            Matches ({data.matches.length + (data.tournamentMatches?.length || 0)})
          </button>
          <button
            onClick={() => setActiveTab('battles')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'battles' ? 'bg-primary text-base3 shadow-lg' : 'text-text hover:bg-base2/50'
            }`}
          >
            <Shield size={18} />
            Battles ({data.battles.length})
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
          <div className="grid-dashboard">
            {data.matches.length === 0 && data.tournamentMatches.length === 0 ? (
              <div className="col-span-full card-premium p-12 text-center text-text italic rounded-2xl border-dashed">
                No active matches found.
              </div>
            ) : (
              [
                ...data.matches.map(m => ({ ...m, type: 'direct' })), 
                ...data.tournamentMatches.map(m => ({ ...m, type: 'tournament' }))
              ].map((match) => {
                let defaultActive = 0;
                if (match.setsResults && match.status !== 'completed') {
                  for (let i = 0; i < (match.setsCount || 1); i++) {
                    if (!match.setsResults.find(s => s.setIndex === i)) {
                      defaultActive = i;
                      break;
                    }
                  }
                }
                const currentActiveSet = defaultActive;
                const activeSetRes = match.setsResults?.find(s => s.setIndex === currentActiveSet);
                const isMatchFinished = match.status === 'completed';

                return (
                <AuraCard key={match._id} className="p-0 rounded-2xl overflow-hidden group hover:ring-2 ring-primary/20 transition-all border-none perspective-1000">
                  <div className="bg-base2/10 px-4 py-2.5 flex items-center justify-between border-b border-base2 preserve-3d">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {match.type === 'tournament' ? (
                        <div className="w-6 h-6 bg-primary/10 flex items-center justify-center text-primary rounded shadow-sm shrink-0">
                          <Trophy size={12} />
                        </div>
                      ) : (
                        <img src="/favicon.png" alt="7 Ball" className="w-6 h-6 drop-shadow-sm shrink-0" />
                      )}
                      <h3 className="text-[13px] font-black uppercase tracking-tighter text-text-emphasis truncate">
                        {match.type === 'tournament' ? match.tournamentId?.name : 'Exhibition Match'}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {(match.stakeAmount > 0 || (match.type === 'tournament' && match.tournamentId?.stakePerPlayer > 0)) && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                             <Award size={10} className="text-emerald-500" />
                             KES {(match.type === 'tournament' ? match.tournamentId?.stakePerPlayer : match.stakeAmount).toLocaleString()}
                          </span>
                          <span className="text-[10px] font-bold text-blue bg-blue/5 px-2 py-0.5 rounded-md border border-blue/10 flex items-center gap-1">
                            <Target size={10} className="text-blue/70" />
                            PRIZE: KES {match.type === 'tournament'
                              ? ((match.tournamentId?.stakePerPlayer || 0) * (match.tournamentId?.maxPlayers || 0) * 0.85).toLocaleString()
                              : (match.stakeAmount * 2 * 0.85).toLocaleString()
                            }
                          </span>
                        </div>
                      )}
                      <StatusBadge status={match.status} />
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
                            className={`w-14 h-14 rounded-2xl object-cover ring-2 shadow-md transition-all ${
                               (match.winnerId?._id || match.winnerId || '').toString() === (match.player1Id?._id || '').toString() ? 'ring-green scale-105' : 
                               ((activeSetRes?.winnerId?._id || activeSetRes?.winnerId || '').toString() === (match.player1Id?._id || '').toString() ? 'ring-primary border-4 border-primary/20' : 'ring-base3')
                            }`}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold truncate max-w-[120px] text-text-emphasis">
                             {match.player1Id?.fullName}
                          </p>
                          <div className="mt-1 flex flex-col items-center gap-0.5">
                            <span className="text-xs font-black text-primary">
                              {match.setsResults?.filter(s => (s.winnerId?._id || s.winnerId || '').toString() === (match.player1Id?._id || '').toString()).length || 0} / {match.setsCount}
                            </span>
                            <span className={`text-xs font-black uppercase tracking-wider ${match.player1Accepted ? 'text-green' : 'text-orange'}`}>
                               {match.player1Accepted ? 'Accepted' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                         <div className="text-xs font-black uppercase tracking-[0.3em] text-primary/80 text-center max-w-[120px] leading-tight">
                            {match.type === 'tournament' ? `Round ${match.round}` : (match.title || 'Direct')}
                         </div>
                         <div className="text-xl font-black text-primary/10 italic">VS</div>
                          <div className="flex flex-col items-center gap-1">
                            <p className="text-xs font-bold text-text/60">
                               {match.type === 'tournament' ? 'Tournament Match' : `Org: ${match.organizerId?.fullName}`}
                            </p>
                            <p className="text-xs font-bold text-text/60">{match.location || match.venue || 'Cue Tournament'}</p>
                          </div>
                      </div>

                      {/* Player 2 */}
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative">
                          <img 
                            src={match.player2Id?.profilePhoto || `https://ui-avatars.com/api/?name=${match.player2Id?.fullName}&background=random`} 
                            alt={match.player2Id?.fullName} 
                            className={`w-14 h-14 rounded-2xl object-cover ring-2 shadow-md transition-all ${
                               (match.winnerId?._id || match.winnerId || '').toString() === (match.player2Id?._id || '').toString() ? 'ring-green scale-105' : 
                               ((activeSetRes?.winnerId?._id || activeSetRes?.winnerId || '').toString() === (match.player2Id?._id || '').toString() ? 'ring-violet border-4 border-violet/20' : 'ring-base3')
                            }`}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold truncate max-w-[120px] text-text-emphasis">
                             {match.player2Id?.fullName}
                          </p>
                          <div className="mt-1 flex flex-col items-center gap-0.5">
                            <span className="text-xs font-black text-primary">
                              {match.setsResults?.filter(s => (s.winnerId?._id || s.winnerId || '').toString() === (match.player2Id?._id || '').toString()).length || 0} / {match.setsCount}
                            </span>
                            <span className={`text-xs font-black uppercase tracking-wider ${match.player2Accepted ? 'text-green' : 'text-orange'}`}>
                               {match.player2Accepted ? 'Accepted' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-b from-base2/30 to-transparent p-4 border-t border-base2 mt-auto space-y-4 relative">
                     {match.myStatus === 'pending' ? (
                        <div className="flex gap-2">
                           <button
                             onClick={() => handleInvitationResponse(match.invitationId, 'declined', match.type === 'tournament' ? 'tournament_match' : 'direct_match', match._id)}
                             className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border border-red/20 text-red hover:bg-red/5 transition-all"
                           >
                             <XCircle size={16} />
                             Decline
                           </button>
                           <button
                             onClick={() => handleInvitationResponse(match.invitationId, 'accepted', match.type === 'tournament' ? 'tournament_match' : 'direct_match', match._id)}
                             className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-base3 text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transition-all"
                           >
                             <CheckCircle2 size={16} />
                             Accept Match
                           </button>
                        </div>
                     ) : (
                        <div className="space-y-4">
                           {/* Set Scoreboard */}
                           <div className="flex flex-wrap gap-2 justify-center">
                              {Array.from({ length: match.setsCount || 1 }).map((_, idx) => {
                                 const sRes = match.setsResults?.find(s => s.setIndex === idx);
                                 const isActive = currentActiveSet === idx;
                                 const isP1 = userId === (match.player1Id?._id || '').toString();
                                 const isP2 = userId === (match.player2Id?._id || '').toString();
                                 const isParticipant = isP1 || isP2;
                                 
                                 let tabLabel = `SET ${idx + 1}`;
                                 let winnerColor = '';
                                 
                                 if (sRes) {
                                    const winnerIdStr = (sRes.winnerId?._id || sRes.winnerId || '').toString();
                                    if (isParticipant) {
                                       const userWon = winnerIdStr === (userId || '').toString();
                                       tabLabel = userWon ? 'WON' : 'LOST';
                                       winnerColor = userWon ? 'text-green' : 'text-red';
                                    } else {
                                       if (winnerIdStr === (match.player1Id?._id || '').toString()) {
                                          tabLabel = match.player1Id?.fullName.split(' ')[0] || 'P1';
                                          winnerColor = 'text-primary';
                                       } else {
                                          tabLabel = match.player2Id?.fullName.split(' ')[0] || 'P2';
                                          winnerColor = 'text-violet';
                                       }
                                    }
                                 }

                                 return (
                                     <div
                                        key={idx}
                                        className={`flex-1 min-w-[50px] py-1.5 rounded-lg text-xs font-black uppercase transition-all border flex flex-col items-center justify-center ${
                                           isActive 
                                              ? 'bg-primary text-base3 border-primary shadow-lg shadow-primary/20 scale-110 z-10' 
                                              : (sRes ? 'bg-base3/80 border-base2/50 opacity-90 border-primary/30' : 'bg-base2/10 border-transparent text-text/20')
                                        }`}
                                     >
                                       <span className={winnerColor || (isActive ? 'text-base3' : 'text-text/40')}>
                                          {tabLabel}
                                       </span>
                                    </div>
                                 );
                              })}
                           </div>

                           {/* Match Status Header */}
                           {match.status === 'completed' ? (
                                (() => {
                                  const myWonMatch = (match.winnerId?._id || match.winnerId || '').toString() === (userId || '').toString();
                                  
                                  if (match.type === 'tournament') {
                                    const isEliminated = myWonMatch ? !match.nextMatchId : !match.loserNextMatchId;
                                    
                                    if (!isEliminated) {
                                      if (myWonMatch) {
                                        return (
                                          <div className="w-full py-3 rounded-xl text-sm font-black flex flex-col items-center justify-center gap-1 shadow-sm border bg-emerald-50 text-emerald-600 border-emerald-100">
                                            <div className="flex items-center gap-1.5 uppercase tracking-tighter italic">
                                              <CheckCircle2 size={14} /> YOU WON!
                                            </div>
                                            <span className="text-[10px] opacity-75 uppercase tracking-widest font-bold">Games Ongoing...</span>
                                            <span className="text-xs font-black">
                                              + KES {((match.tournamentId?.stakePerPlayer || 0) * (match.tournamentId?.maxPlayers || 0) * 0.85).toLocaleString()}
                                            </span>
                                          </div>
                                        );
                                      } else {
                                        const nextMatchDate = match.loserNextMatchId?.scheduledAt;
                                        return (
                                          <div className="w-full py-3 rounded-xl text-sm font-black flex flex-col items-center justify-center gap-1 shadow-sm border bg-orange/5 text-orange border-orange/20">
                                            <div className="flex items-center gap-1.5 uppercase tracking-tighter italic">
                                              <XCircle size={14} /> YOU LOST!
                                            </div>
                                            <span className="text-[10px] opacity-75 uppercase tracking-widest font-bold">
                                              Your next match is {nextMatchDate ? `on ${new Date(nextMatchDate).toLocaleDateString()}` : 'on the way'}
                                            </span>
                                          </div>
                                        );
                                      }
                                    }
                                  }

                                  // Standard completed display (Final or Direct Match)
                                  const isTournament = match.type === 'tournament';
                                  return (
                                    <div className={`w-full py-3 rounded-xl text-sm font-black flex flex-col items-center justify-center gap-1 shadow-sm border ${
                                      myWonMatch ? 'bg-green/10 text-green border-green/20' : 'bg-red/10 text-red border-red/20'
                                    }`}>
                                      <span>{myWonMatch ? 'You Won!' : 'You Lost!'}</span>
                                      {(!isTournament || myWonMatch) && (
                                        <span className="text-base">
                                          {myWonMatch ? (
                                            `+ KES ${((isTournament ? match.tournamentId?.stakePerPlayer : match.stakeAmount) * 2 * 0.85).toLocaleString()}`
                                          ) : (
                                            `- KES ${match.stakeAmount.toLocaleString()}`
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })()
                           ) : (match.player1Accepted && match.player2Accepted) ? (
                              match.type === 'tournament' ? (
                                  <Link 
                                     to={`/dashboard/tournament/${match.tournamentId?._id || match.tournamentId}#bracket`}
                                     className="w-full bg-primary text-base3 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-md shadow-primary/20"
                                  >
                                     <Trophy size={16} />
                                     ENTER ROOM
                                  </Link>
                               ) : (
                                  <div className="w-full bg-primary/5 text-primary py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 animate-pulse border border-primary/20 shadow-sm">
                                      ⚡ ONGOING MATCH
                                  </div>
                               )
                            ) : (
                               <div className="w-full bg-orange/5 text-orange py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 border border-orange/20 shadow-sm">
                                  ⏳ WAITING FOR OPPONENT
                               </div>
                            )}
                        </div>
                     )}
                  </div>
                </AuraCard>
                );
              })
            )}
          </div>
        ) : activeTab === 'battles' ? (
          <div className="grid-dashboard">
            {data.battles.length === 0 ? (
              <div className="col-span-full card-premium p-12 text-center text-text italic rounded-2xl border-dashed">
                No active multiplayer battles found.
              </div>
            ) : (
                data.battles.map((battle) => (
                  <AuraCard key={battle._id} className="p-0 rounded-2xl overflow-hidden flex flex-col group border-none shadow-sm transition-all hover:shadow-md perspective-1000">
                    <div className="bg-base2/10 p-4 flex justify-between items-center border-b border-base2 preserve-3d">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 flex items-center justify-center text-primary rounded-lg shadow-sm">
                           <Shield size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase text-text/40 tracking-widest">Multiplayer Battle</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                           <Award size={10} className="text-emerald-500" />
                           PRIZE: KES {(battle.stakeAmount * battle.participants.filter(p => p.status === 'accepted').length * 0.85).toLocaleString()}
                        </span>
                        <StatusBadge status={battle.status} />
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

                      <div className="space-y-2 mb-4 max-h-[160px] overflow-y-auto pr-2 thin-scrollbar flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text/40 mb-1">Participants</p>
                        {battle.participants.map((p) => {
                          const isMe = p.userId?._id === userId;
                          const isWinner = battle.winnerId?._id === p.userId?._id;
                          return (
                            <div key={p.userId?._id} className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                              isWinner ? 'bg-green/10 border-green/30' : (isMe ? 'bg-primary/5 border-primary/20' : 'bg-base2/20 border-base2')
                            }`}>
                              <div className="flex items-center gap-2 overflow-hidden">
                                <img 
                                  src={p.userId?.profilePhoto || `https://ui-avatars.com/api/?name=${p.userId?.fullName}&background=random`} 
                                  className="w-6 h-6 rounded-lg object-cover ring-1 ring-base2 shadow-sm"
                                  alt=""
                                />
                                <span className={`text-[11px] font-bold truncate ${isMe ? 'text-primary' : (isWinner ? 'text-green' : 'text-text-emphasis')}`}>
                                  {p.userId?.fullName} {isMe && "(You)"}
                                </span>
                                {isWinner && <TrophyIcon size={10} className="text-green shrink-0 animate-bounce" />}
                              </div>
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                p.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                p.status === 'declined' ? 'bg-red/5 text-red/60 border-red/10' : 'bg-yellow/5 text-yellow border-yellow/10'
                              }`}>
                                {p.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {battle.myStatus === 'pending' ? (
                        <div className="flex gap-2">
                           <button
                             onClick={() => handleInvitationResponse(battle.invitationId, 'declined', 'battle', battle._id)}
                             className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black border border-red/20 text-red hover:bg-red/5 transition-all uppercase"
                           >
                             <XCircle size={14} />
                             Decline
                           </button>
                           <button
                             onClick={() => handleInvitationResponse(battle.invitationId, 'accepted', 'battle', battle._id)}
                             className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-base3 text-xs font-black hover:shadow-lg hover:shadow-primary/20 transition-all uppercase"
                           >
                             <CheckCircle2 size={14} />
                             Accept
                           </button>
                        </div>
                      ) : (
                        <div className="w-full">
                           {battle.status === 'ongoing' && !battle.winnerId && (
                            <div className="w-full bg-primary/5 text-primary py-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 animate-pulse border border-primary/20 uppercase tracking-tighter">
                               ⚡ ONGOING MATCH
                            </div>
                          )}

                          {battle.status === 'completed' && (
                            <div className={`w-full py-2.5 rounded-xl text-[10px] font-black flex flex-col items-center justify-center gap-1 border ${
                                battle.winnerId?._id === userId ? 'bg-green/10 text-green border-green/20' : 'bg-red/10 text-red border-red/20'
                            }`}>
                              <span className="flex items-center gap-2">
                                 {battle.winnerId?._id === userId ? <TrophyIcon size={12} /> : <XCircle size={12} />}
                                 {battle.winnerId?._id === userId ? 'YOU WON THE BATTLE!' : 'BATTLE COMPLETED'}
                              </span>
                              {battle.winnerId?._id === userId && (
                                <span className="text-xs font-black">+ KES {(battle.stakeAmount * battle.participants.filter(p => p.status === 'accepted').length * 0.85).toLocaleString()}</span>
                              )}
                            </div>
                          )}

                          {battle.status === 'pending' && battle.myStatus === 'accepted' && (
                            <div className="w-full bg-emerald-50 text-emerald-600 py-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 border border-emerald-100">
                               <Clock size={12} /> WAITING TO START
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </AuraCard>
                ))
            )}
          </div>
        ) : (
          <div className="grid-dashboard">
            {data.tournaments.length === 0 ? (
              <div className="col-span-full card-premium p-12 text-center text-text italic rounded-2xl border-dashed">
                No active tournaments found.
              </div>
            ) : (
              data.tournaments.map((t) => (
                <AuraCard key={t._id} className="p-0 rounded-2xl overflow-hidden flex flex-col group border-none shadow-sm transition-all hover:shadow-md h-full relative perspective-1000">
                  {/* Status Badge Watermark */}
                  {t.myStatus === 'accepted' && (
                    <div className="absolute top-[45%] right-4 -translate-y-1/2 pointer-events-none z-10 preserve-3d">
                      <div className="bg-primary/20 border border-primary/40 rounded-lg px-1.5 py-0.5 text-primary text-[8px] font-black uppercase tracking-[0.1em] text-center select-none shadow-md">
                        {t.confirmedPlayers?.length < t.maxPlayers ? (
                          <>Accepted<br/>Waiting for players</>
                        ) : "Ongoing"}
                      </div>
                    </div>
                  )}
                  <div className="bg-base2/10 p-4 flex justify-between items-center border-b border-base2 preserve-3d">
                    <div className="w-8 h-8 bg-primary/10 flex items-center justify-center text-primary rounded-lg">
                       <TrophyIcon size={16} />
                    </div>
                     <StatusBadge status={t.status} entryType={t.entryType} registrationDeadline={t.registrationDeadline} startDate={t.startDate} />
                  </div>
                  
                  <div className="p-5 flex-1 preserve-3d">
                    <h3 className="text-base font-bold text-text-emphasis mb-2 truncate">{t.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-text/70 mb-4">
                      <div className="flex items-center gap-1.5 font-bold">
                         <Users size={12} className="text-primary" />
                         {t.confirmedPlayers?.length || 0}/{t.maxPlayers}
                      </div>
                       {t.stakePerPlayer > 0 && (
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-600 text-xs">
                             <WalletIcon size={14} className="fill-emerald-600/20" />
                             Entry: KES {t.stakePerPlayer.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1.5 font-bold text-blue text-xs">
                             <TrophyIcon size={14} className="text-blue" />
                             Prize: KES {((t.stakePerPlayer * t.maxPlayers) * 0.85).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 border-t border-base2 mt-auto preserve-3d">
                    {t.myStatus === 'pending' ? (
                       <div className="flex gap-2">
                          <button
                            onClick={() => handleInvitationResponse(t.invitationId, 'declined', 'tournament', t._id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border border-red/20 text-red hover:bg-red/5 transition-all"
                          >
                            <XCircle size={16} />
                            Decline
                          </button>
                          <button
                            onClick={() => handleInvitationResponse(t.invitationId, 'accepted', 'tournament', t._id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-base3 text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transition-all"
                          >
                            <CheckCircle2 size={16} />
                            Accept Tournament
                          </button>
                       </div>
                     ) : t.myStatus === 'available' ? (
                       <Link 
                         to={`/dashboard/tournament/${t._id}`}
                         className="w-full bg-blue text-base3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] transition-all hover:bg-blue/90"
                       >
                         <TrophyIcon size={14} />
                         View Tournament Details
                       </Link>
                     ) : (
                        <Link 
                          to={`/dashboard/tournament/${t._id}`}
                          className="w-full bg-primary text-base3 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:scale-[1.02] transition-all"
                        >
                          Enter Room
                          <ChevronRight size={16} />
                        </Link>
                     )}
                  </div>
                </AuraCard>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PlayerDashboard;

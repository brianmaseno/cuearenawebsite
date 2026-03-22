import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Trophy, Target, Clock, Users, ChevronRight, Loader2, Target as TargetIcon, Trophy as TrophyIcon, ArrowRight, Bell, MessageSquare, XCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const PlayerDashboard = () => {
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
        tournaments: ongoingRes.data.tournaments || [],
        notifications: notifRes.data || [],
        // Calculate invitations from all sources
        invitations: [
          ...(ongoingRes.data.matches || []).filter(m => m.myStatus === 'pending'),
          ...(ongoingRes.data.tournamentMatches || []).filter(m => m.myStatus === 'pending'),
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

  const handleInvitationResponse = async (invitationId, status) => {
    try {
      if (!invitationId) {
        toast.error('Invitation ID not found');
        return;
      }
      await api.post(`/invitations/${invitationId}/respond`, { status });
      toast.success(`Invitation ${status}`);
      fetchData();
    } catch (err) {
      console.error('Error responding to invitation:', err);
      toast.error(err.response?.data?.message || 'Error responding to invitation');
    }
  };

  useEffect(() => {
    fetchData();
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

  const unreadNotifs = data.notifications.filter(n => !n.isRead).length;

  return (
    <DashboardLayout title="Active Activities">
      <div className="space-y-8 pb-20">
        
        {/* Alerts Container */}
        {unreadNotifs > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <Link 
              to="/notifications" 
              className="group flex items-center gap-2 px-6 py-2 bg-blue/5 border border-blue/10 rounded-full hover:bg-blue/10 transition-all animate-in slide-in-from-top duration-700"
            >
              <span className="text-sm font-bold text-text/60 group-hover:text-text transition-colors">
                You have <span className="text-blue font-black">{unreadNotifs}</span> unread {unreadNotifs === 1 ? 'notification' : 'notifications'}
              </span>
              <ArrowRight size={14} className="text-blue opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        )}

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
                const currentActiveSet = activeSetMap[match._id] !== undefined ? activeSetMap[match._id] : defaultActive;
                const activeSetRes = match.setsResults?.find(s => s.setIndex === currentActiveSet);
                const isMatchFinished = match.status === 'completed';

                return (
                <div key={match._id} className="card-premium p-0 rounded-2xl overflow-hidden group hover:ring-2 ring-primary/20 transition-all border-none">
                  <div className="bg-base2/10 p-4 flex justify-between items-center border-b border-base2">
                     <div className="flex items-center gap-3">
                        {match.type === 'tournament' ? (
                           <div className="w-7 h-7 bg-primary/10 flex items-center justify-center text-primary rounded shadow-sm">
                              <Trophy size={14} />
                           </div>
                        ) : (
                           <img src="/favicon.png" alt="7 Ball" className="w-7 h-7 drop-shadow-sm" />
                        )}
                        <h3 className="text-sm font-black uppercase tracking-tighter text-text-emphasis">
                           {match.type === 'tournament' ? match.tournamentId?.name : 'Exhibition'}
                        </h3>
                     </div>
                    <StatusBadge status={match.status} />
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
                            <span className={`text-[10px] font-black uppercase tracking-wider ${match.player1Accepted ? 'text-green' : 'text-orange'}`}>
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
                         <div className="flex flex-col items-center gap-0.5">
                            <p className="text-[10px] font-bold text-text/60">
                               {match.type === 'tournament' ? 'Tournament Match' : `Org: ${match.organizerId?.fullName}`}
                            </p>
                            <p className="text-[10px] font-bold text-text/60">{match.location || match.venue || 'Cue Arena'}</p>
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
                            <span className={`text-[10px] font-black uppercase tracking-wider ${match.player2Accepted ? 'text-green' : 'text-orange'}`}>
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
                             onClick={() => handleInvitationResponse(match.invitationId, 'declined')}
                             className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold border border-red/20 text-red hover:bg-red/5 transition-all"
                           >
                             <XCircle size={14} />
                             Decline
                           </button>
                           <button
                             onClick={() => handleInvitationResponse(match.invitationId, 'accepted')}
                             className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green text-base3 text-[10px] font-bold hover:opacity-90 transition-all"
                           >
                             <CheckCircle2 size={14} />
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
                                    <button
                                       key={idx}
                                       onClick={() => setActiveSetMap(prev => ({ ...prev, [match._id]: idx }))}
                                       className={`flex-1 min-w-[54px] py-3.5 rounded-2xl text-[9px] font-black uppercase transition-all border-2 flex flex-col items-center justify-center gap-0.5 ${
                                          isActive 
                                             ? 'bg-primary text-base3 border-primary shadow-lg shadow-primary/20 scale-105 z-10' 
                                             : (sRes ? 'bg-base3/80 border-base2/50 opacity-90 hover:opacity-100 hover:border-primary/30' : 'bg-base2/10 border-transparent text-text/20')
                                       }`}
                                    >
                                       <span className={winnerColor || (isActive ? 'text-base3' : 'text-text/40')}>
                                          {tabLabel}
                                       </span>
                                    </button>
                                 );
                              })}
                           </div>

                           {/* Match Status Header */}
                           {match.status === 'completed' ? (
                              <div className={`w-full py-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 shadow-sm border ${
                                 (match.winnerId?._id || match.winnerId || '').toString() === (userId || '').toString() ? 'bg-green/10 text-green border-green/20' : 'bg-red/10 text-red border-red/20'
                              }`}>
                                 {(match.winnerId?._id || match.winnerId || '').toString() === (userId || '').toString() ? 'You Won!' : 'You Lost!'}
                              </div>
                           ) : (match.player1Accepted && match.player2Accepted) ? (
                              <div className="w-full bg-primary/5 text-primary py-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 animate-pulse border border-primary/20 shadow-sm">
                                 ⚡ ONGOING MATCH
                              </div>
                           ) : (
                              <div className="w-full bg-orange/5 text-orange py-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 border border-orange/20 shadow-sm">
                                 ⏳ WAITING FOR OPPONENT
                              </div>
                           )}
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
              <div className="col-span-full card-premium p-12 text-center text-text italic rounded-2xl border-dashed">
                No active tournaments found.
              </div>
            ) : (
              data.tournaments.map((t) => (
                <div key={t._id} className="card-premium p-0 rounded-2xl overflow-hidden flex flex-col group border-none shadow-sm transition-all hover:shadow-md h-full">
                  <div className="bg-base2/10 p-4 flex justify-between items-center border-b border-base2">
                    <div className="w-8 h-8 bg-primary/10 flex items-center justify-center text-primary rounded-lg">
                       <Trophy size={16} />
                    </div>
                    <StatusBadge status={t.status} entryType={t.entryType} registrationDeadline={t.registrationDeadline} />
                  </div>
                  
                  <div className="p-5 flex-1">
                    <h3 className="text-sm font-bold text-text-emphasis mb-2 truncate">{t.name}</h3>
                    <div className="flex items-center gap-3 text-[10px] text-text/70 mb-4">
                      <div className="flex items-center gap-1.5 font-bold">
                         <Users size={12} className="text-primary" />
                         {t.confirmedPlayers?.length || 0}/{t.maxPlayers}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border-t border-base2 mt-auto">
                    {t.myStatus === 'pending' ? (
                       <div className="flex gap-2">
                          <button
                            onClick={() => handleInvitationResponse(t.invitationId, 'declined')}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold border border-red/20 text-red hover:bg-red/5 transition-all"
                          >
                            <XCircle size={14} />
                            Decline
                          </button>
                          <button
                            onClick={() => handleInvitationResponse(t.invitationId, 'accepted')}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green text-base3 text-[10px] font-bold hover:opacity-90 transition-all"
                          >
                            <CheckCircle2 size={14} />
                            Accept Tournament
                          </button>
                       </div>
                    ) : (
                      <Link 
                        to={`/dashboard/tournament/${t._id}`}
                        className="w-full bg-primary text-base3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] transition-all"
                      >
                        Tournament Room
                        <ChevronRight size={14} />
                      </Link>
                    )}
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

export default PlayerDashboard;

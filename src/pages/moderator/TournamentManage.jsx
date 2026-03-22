import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import {
   Trophy,
   Users,
   Settings,
   Calendar,
   Target,
   Award,
   Loader2,
   ChevronRight,
   UserPlus,
   Zap,
   Target as TargetIcon,
   Trash2,
   Search,
   X,
   Send,
   Minus
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const BracketMatchCard = ({ match, isFinal = false, onClick }) => {
   const { user } = useAuth();
   return (
   <div 
      onClick={onClick}
      className={`group relative p-3.5 rounded-2xl bg-base3/80 backdrop-blur-md border border-base2/50 transition-all shadow-sm min-w-[160px] cursor-pointer
         ${isFinal ? 'ring-2 ring-yellow/40 bg-yellow/5 hover:border-yellow/60' : 'hover:border-primary/40 hover:shadow-md'}
      `}
   >
      {/* Subtle Status Indicator */}
      <div className="absolute -top-1 -right-1">
         {match.status === 'pending_invites' ? (
            <span className="flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-orange"></span>
            </span>
         ) : match.status === 'ongoing' ? (
            <span className="flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
         ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
         {[
            { id: match.player1Id, score: match.scorePlayer1, accepted: match.player1Accepted },
            { id: match.player2Id, score: match.scorePlayer2, accepted: match.player2Accepted }
         ].map((p, i) => {
            const isWinner = (match.winnerId?._id || match.winnerId) === (p.id?._id || p.id) && match.status === 'completed';
            const isLoser = (match.winnerId?._id || match.winnerId) && (match.winnerId?._id || match.winnerId) !== (p.id?._id || p.id) && match.status === 'completed';
            return (
               <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 ${
                  isWinner ? 'bg-green/10 text-green font-bold scale-[1.02] shadow-sm' : 
                  isLoser ? 'opacity-40 grayscale-[0.5]' : 'text-text/80'
               }`}>
                  <div className="flex items-center gap-2.5 overflow-hidden mr-4">
                     <div className={`w-1.5 h-1.5 rounded-full ${p.id ? (p.accepted ? 'bg-green' : 'bg-orange') : 'bg-base2'}`}></div>
                     <span className="text-sm font-bold tracking-tight truncate max-w-[110px]">
                        {p.id?.fullName || 'TBD'}
                        {p.id?._id === user?._id && <span className="opacity-70 text-[10px] ml-1">(me)</span>}
                     </span>
                  </div>
                  <span className={`text-sm font-black font-mono shrink-0 ${isWinner ? 'text-green' : 'text-primary'}`}>
                     {p.score || 0}/{match.setsCount || 1}
                  </span>
               </div>
            );
         })}
      </div>
   </div>
   );
};

const TournamentManage = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const { socket, joinTournamentRoom, leaveTournamentRoom } = useSocket();
   const [tournament, setTournament] = useState(null);
   const [loading, setLoading] = useState(true);
   const [availablePlayers, setAvailablePlayers] = useState([]);
   const [actionLoading, setActionLoading] = useState(false);
   const [selectedMatchForSets, setSelectedMatchForSets] = useState(null);
   const [activeSetInModal, setActiveSetInModal] = useState(null);
   const [selectingWinnerForSetInModal, setSelectingWinnerForSetInModal] = useState(null);
   const [playerSearchQuery, setPlayerSearchQuery] = useState('');
   const [selectedPlayers, setSelectedPlayers] = useState([]);
   const [invitations, setInvitations] = useState([]);

   const togglePlayerSelection = (player) => {
      setSelectedPlayers(prev => {
         const exists = prev.find(p => p._id === player._id);
         if (exists) return prev.filter(p => p._id !== player._id);
         return [...prev, { _id: player._id, fullName: player.fullName, email: player.email }];
      });
   };

   const handleBulkInvite = async () => {
      if (selectedPlayers.length === 0) return;
      setActionLoading(true);
      try {
         const { data } = await api.post(`/tournaments/${id}/invite-bulk`, {
            playerIds: selectedPlayers.map(p => p._id)
         });
         toast.success(data.message);
         setSelectedPlayers([]);
         fetchTournamentData();
      } catch (err) {
         toast.error(err.response?.data?.message || 'Failed to send bulk invitations');
      } finally {
         setActionLoading(false);
      }
   };


   const fetchTournamentData = async () => {
      try {
         const [{ data: tourney }, { data: players }, { data: invites }] = await Promise.all([
            api.get(`/tournaments/${id}`),
            api.get('/users/players'),
            api.get(`/invitations/tournament/${id}`)
         ]);
         setTournament(tourney);
         setAvailablePlayers(players);
         setInvitations(invites);
      } catch (err) {
         toast.error('Failed to load tournament data');
         navigate('/moderator/ongoing');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchTournamentData();

      if (id) {
         joinTournamentRoom(id);
      }

      return () => {
         if (id) leaveTournamentRoom(id);
      };
   }, [id]);

   useEffect(() => {
      if (socket) {
         socket.on('TOURNAMENT_UPDATE', (data) => {
            if (data && data._id) {
               setTournament(data);
            } else {
               fetchTournamentData();
            }
            toast.info('Tournament updated!', { id: 'tourney-update' });
         });

         return () => {
            socket.off('TOURNAMENT_UPDATE');
         };
      }
   }, [socket]);

   const handleInvite = async (playerId) => {
      setActionLoading(true);
      try {
         await api.post(`/tournaments/${id}/invite`, { playerId });
         toast.success('Invitation sent');
         fetchTournamentData();
      } catch (err) {
         toast.error(err.response?.data?.message || 'Failed to send invitation');
      } finally {
         setActionLoading(false);
      }
   };


   const handlePublish = async () => {
      setActionLoading(true);
      try {
         await api.post(`/tournaments/${id}/publish`);
         toast.success('Tournament is now open for players!');
         fetchTournamentData();
      } catch (err) {
         toast.error('Failed to publish tournament');
      } finally {
         setActionLoading(false);
      }
   };

   const handleRecordTournamentSetWinner = async (matchId, setIndex, winnerId) => {
      try {
         const { data: updatedMatch } = await api.put(`/tournaments/matches/${matchId}/set-winner`, {
            setIndex,
            winnerId
         });

         setSelectedMatchForSets(updatedMatch);
         setSelectingWinnerForSetInModal(null);
         setActiveSetInModal(null);
         fetchTournamentData();
         toast.success('Set result recorded');
      } catch (err) {
         toast.error(err.response?.data?.message || 'Failed to record set winner');
      }
   };

   const handleUpdateSettings = async (field, value) => {
      setActionLoading(true);
      try {
         await api.put(`/tournaments/${id}`, { [field]: value });
         toast.success('Settings updated');
         fetchTournamentData();
      } catch (err) {
         toast.error('Failed to update settings');
      } finally {
         setActionLoading(false);
      }
   };

   if (loading) {
      return (
         <DashboardLayout title="Tournament Management">
            <div className="flex items-center justify-center h-64">
               <Loader2 className="animate-spin text-primary" size={32} />
            </div>
         </DashboardLayout>
      );
   }

   return (
      <DashboardLayout title="Manage Tournament">
         <div className="space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-base2">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <StatusBadge status={tournament.status} entryType={tournament.entryType} registrationDeadline={tournament.registrationDeadline} />
                     <div className="flex items-center gap-2 text-text/40 text-xs font-bold uppercase tracking-widest">
                        <Calendar size={14} />
                        Created {new Date(tournament.createdAt).toLocaleDateString()}
                     </div>
                  </div>
                  <h2 className="text-3xl font-black text-text-emphasis tracking-tight">{tournament.name}</h2>
                  {tournament.status === 'full' && (
                     <div className="mt-2 flex items-center gap-2 text-primary font-bold bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 w-fit animate-pulse">
                        <Zap size={16} fill="currentColor" />
                        <span>Tournament full, set to start on {new Date(tournament.startDate).toLocaleDateString()} at {new Date(tournament.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                     </div>
                  )}
               </div>

               <div className="flex items-center gap-3">
                  {(tournament.status === 'draft' || tournament.status === 'open_for_players' || tournament.status === 'full') && (
                     <div className="flex items-center gap-2 bg-base2/20 px-4 py-2 rounded-2xl border border-base2">
                        <span className="text-[10px] font-black uppercase text-text/40 tracking-widest">Sets/Match</span>
                        <select
                           value={tournament.matchSetsCount || 1}
                           disabled={actionLoading}
                           onChange={(e) => handleUpdateSettings('matchSetsCount', parseInt(e.target.value))}
                           className="bg-transparent text-sm font-black text-primary outline-none cursor-pointer"
                        >
                           {[1, 3, 5, 7, 9, 11].map(num => (
                              <option key={num} value={num} className="bg-base3 text-text">Best of {num}</option>
                           ))}
                        </select>
                     </div>
                  )}
                  {tournament.status === 'draft' && (
                     <button
                        onClick={handlePublish}
                        disabled={actionLoading}
                        className="bg-green hover:bg-green-dark text-base3 px-8 py-3 rounded-2xl font-black shadow-lg shadow-green/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                     >
                        <Trophy size={20} />
                        {tournament.entryType === 'invite_only' ? 'Set to Private' : 'Open for Registration'}
                     </button>
                  )}
               </div>
            </div>

            {/* Brackets Section - Minimalist */}
            {(tournament.status === 'ongoing' || tournament.status === 'completed') && (
               <section className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <style>
                     {`
                        .bracket-column {
                           display: flex;
                           flex-direction: column;
                           justify-content: space-around;
                           gap: 1.5rem;
                           position: relative;
                        }
                        .match-card-wrapper {
                           position: relative;
                           padding: 0.25rem 0;
                           z-index: 10;
                        }

                        /* Professional Connectors - Left Side */
                        .left-wing .bracket-column::after {
                           content: '';
                           position: absolute;
                           right: -4rem;
                           top: 25%;
                           bottom: 25%;
                           width: 2px;
                           background: var(--color-base2);
                           opacity: 0.5;
                        }

                        .left-wing .match-card-wrapper::after {
                           content: '';
                           position: absolute;
                           right: -4rem;
                           top: 50%;
                           width: 4rem;
                           height: 2px;
                           background: var(--color-base2);
                           opacity: 0.5;
                        }
                        
                        .left-wing .match-card-wrapper.has-prev::before {
                           content: '';
                           position: absolute;
                           left: -4rem;
                           top: 50%;
                           width: 4rem;
                           height: 2px;
                           background: var(--color-base2);
                           opacity: 0.5;
                        }

                        /* Professional Connectors - Right Side */
                        .right-wing .bracket-column::after {
                           content: '';
                           position: absolute;
                           left: -4rem;
                           top: 25%;
                           bottom: 25%;
                           width: 2px;
                           background: var(--color-base2);
                           opacity: 0.5;
                        }

                        .right-wing .match-card-wrapper::after {
                           content: '';
                           position: absolute;
                           left: -4rem;
                           top: 50%;
                           width: 4rem;
                           height: 2px;
                           background: var(--color-base2);
                           opacity: 0.5;
                        }
                        
                        .right-wing .match-card-wrapper.has-prev::before {
                           content: '';
                           position: absolute;
                           right: -4rem;
                           top: 50%;
                           width: 4rem;
                           height: 2px;
                           background: var(--color-base2);
                           opacity: 0.5;
                        }

                        /* Final Stage Connectors */
                        .final-match-card::before {
                           content: '';
                           position: absolute;
                           left: -5rem;
                           top: 50%;
                           width: 5rem;
                           height: 2px;
                           background: var(--color-base2);
                           opacity: 0.5;
                        }
                        .final-match-card::after {
                           content: '';
                           position: absolute;
                           right: -5rem;
                           top: 50%;
                           width: 5rem;
                           height: 2px;
                           background: var(--color-base2);
                           opacity: 0.5;
                        }

                        .thin-scrollbar::-webkit-scrollbar {
                           height: 4px;
                        }
                        .thin-scrollbar::-webkit-scrollbar-thumb {
                           background: var(--color-primary);
                           border-radius: 10px;
                        }
                     `}
                  </style>

                  <div className="overflow-x-auto pb-8 pt-2 px-2 thin-scrollbar">
                     <div className="min-w-[1000px] flex justify-center items-stretch gap-0">
                        
                        {/* LEFT WING */}
                        <div className="flex gap-32 items-stretch left-wing">
                           {tournament.matches && [...new Set(tournament.matches.map(m => m.round))]
                              .filter(r => r < Math.max(...tournament.matches.map(m => m.round)))
                              .sort((a, b) => a - b)
                              .map(roundNum => (
                                 <div key={`left-r-${roundNum}`} className="bracket-column">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary text-center mb-4">Round {roundNum}</h4>
                                    {tournament.matches
                                        .filter(m => m.round === roundNum && m.matchIndex < (tournament.matches.filter(mf => mf.round === roundNum).length / 2))
                                        .map(match => (
                                           <div key={match._id} className={`match-card-wrapper ${roundNum > 1 ? 'has-prev' : ''}`}>
                                              <BracketMatchCard match={match} onClick={() => { setSelectedMatchForSets(match); setActiveSetInModal(null); }} />
                                              {match.winnerId && tournament.status !== 'pending_invites' && (
                                                 <div className="absolute right-[-4rem] top-1/2 -translate-y-1/2 w-[4rem] flex items-center justify-center z-10 pointer-events-none">
                                                    <div className="bg-base2 border-y border-x border-primary/20 shadow-md px-2 py-0.5 rounded text-center truncate max-w-[95%]">
                                                       <span className="text-[10px] font-black text-primary truncate leading-tight">{match.winnerId.fullName}</span>
                                                    </div>
                                                 </div>
                                              )}
                                           </div>
                                        ))}
                                 </div>
                              ))}
                        </div>

                           {/* CENTER STAGE - Finals */}
                           <div className="flex flex-col items-center justify-center px-16 relative">
                              {/* Vertical Divider Decoration */}
                              <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-base2 to-transparent opacity-50"></div>
                              <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-base2 to-transparent opacity-50"></div>
                              
                              <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-yellow mb-8 animate-pulse">Championship Final</h4>

                              {tournament.status === 'completed' && tournament.winner && (
                                 <div className="flex items-center gap-2 mb-4 bg-yellow/10 px-6 py-2 rounded-full border border-yellow/20 animate-in zoom-in-95 duration-700">
                                    <Trophy size={16} className="text-yellow" />
                                    <span className="text-sm font-black text-text-emphasis truncate">{tournament.winner.fullName}</span>
                                 </div>
                              )}

                              {tournament.matches && tournament.matches
                               .filter(m => m.round === Math.max(...tournament.matches.map(mf => mf.round)))
                               .map(match => (
                                  <div key={match._id} className="scale-110 final-match-card relative z-20">
                                     <BracketMatchCard match={match} isFinal={true} onClick={() => { setSelectedMatchForSets(match); setActiveSetInModal(null); }} />
                                  </div>
                               ))}
                        </div>

                        {/* RIGHT WING - Rounds before Final (Reversed) */}
                        <div className="flex gap-32 items-stretch right-wing">
                           {tournament.matches && [...new Set(tournament.matches.map(m => m.round))]
                              .filter(r => r < Math.max(...tournament.matches.map(m => m.round)))
                              .sort((a, b) => b - a)
                              .map(roundNum => (
                                 <div key={`right-r-${roundNum}`} className="bracket-column">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary text-center mb-4">Round {roundNum}</h4>
                                    {tournament.matches
                                        .filter(m => m.round === roundNum && m.matchIndex >= (tournament.matches.filter(mf => mf.round === roundNum).length / 2))
                                        .map(match => (
                                           <div key={match._id} className={`match-card-wrapper ${roundNum > 1 ? 'has-prev' : ''}`}>
                                              <BracketMatchCard match={match} onClick={() => { setSelectedMatchForSets(match); setActiveSetInModal(null); }} />
                                              {match.winnerId && tournament.status !== 'pending_invites' && (
                                                 <div className="absolute left-[-4rem] top-1/2 -translate-y-1/2 w-[4rem] flex items-center justify-center z-10 pointer-events-none">
                                                    <div className="bg-base2 border-y border-x border-primary/20 shadow-md px-2 py-0.5 rounded text-center truncate max-w-[95%]">
                                                       <span className="text-[10px] font-black text-primary truncate leading-tight">{match.winnerId.fullName}</span>
                                                    </div>
                                                 </div>
                                              )}
                                           </div>
                                        ))}
                                 </div>
                              ))}
                        </div>
                     </div>
                  </div>
               </section>
            )}

            {/* Players & Invite Sidebar */}
            {tournament.status !== 'ongoing' && tournament.status !== 'completed' && (
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* List of Confirmed Players */}
                  <div className="lg:col-span-2 card-premium p-8 rounded-2xl">
                     <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                        <Users size={24} className="text-primary" />
                        Joined Players
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tournament.confirmedPlayers.map(p => (
                           <div key={p._id} className="flex items-center gap-4 p-4 bg-base3 border border-base2 rounded-2xl">
                              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                 {p.fullName[0]}
                              </div>
                              <div>
                                 <p className="font-bold text-text-emphasis">{p.fullName}</p>
                                 <p className="text-xs text-text">{p.email}</p>
                              </div>
                           </div>
                        ))}
                        {tournament.confirmedPlayers.length === 0 && (
                           <p className="col-span-full text-center text-text italic py-8">Waiting for players to join...</p>
                        )}
                     </div>
                  </div>

                  {/* Invite Section */}
                  <div className="card-premium p-6 rounded-2xl">
                     <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                        <UserPlus size={20} className="text-violet" />
                        Invite Players
                     </h3>

                     {/* Search Input */}
                     <div className="relative mb-6">
                        <Search size={16} className="absolute left-3 top-2.5 text-text/40" />
                        <input
                           type="text"
                           placeholder="Filter players by name..."
                           value={playerSearchQuery}
                           onChange={(e) => setPlayerSearchQuery(e.target.value)}
                           className="w-full bg-base2/20 border border-base2/50 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold placeholder:font-medium"
                        />
                     </div>

                     <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 thin-scrollbar">
                        {playerSearchQuery.trim().length >= 2 ? (
                           <>
                              {availablePlayers
                                 .filter(p => !tournament.confirmedPlayers.some(cp => cp._id === p._id))
                                 .filter(p => 
                                    p.fullName.toLowerCase().includes(playerSearchQuery.toLowerCase()) || 
                                    (p.email || '').toLowerCase().includes(playerSearchQuery.toLowerCase())
                                 )
                                 .map(p => (
                                 <div key={p._id} className="flex items-center justify-between p-3 bg-base2/10 rounded-xl hover:bg-base2/20 transition-colors group">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-full bg-violet/10 text-violet flex items-center justify-center text-xs font-bold shadow-sm">
                                          {p.fullName?.[0]}
                                       </div>
                                       <div>
                                          <p className="text-sm font-bold text-text-emphasis leading-tight group-hover:text-primary transition-colors">{p.fullName}</p>
                                          <p className="text-[10px] text-text/40 font-medium">{p.email}</p>
                                       </div>
                                    </div>
                                    {tournament.invitedPlayers?.some(ip => (ip._id || ip).toString() === p._id.toString()) ? (
                                       <span className="text-[10px] font-black uppercase text-green tracking-widest bg-green/10 px-2 py-1 rounded-lg border border-green/20">Invited</span>
                                    ) : (
                                       <button
                                          onClick={() => togglePlayerSelection(p)}
                                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                             selectedPlayers.some(sp => sp._id === p._id) 
                                             ? 'bg-red text-base3 shadow-lg shadow-red/20 rotate-45' 
                                             : 'bg-primary text-base3 shadow-lg shadow-primary/20'
                                          }`}
                                          type="button"
                                       >
                                          <UserPlus size={16} />
                                       </button>
                                    )}
                                 </div>
                              ))}
                              {availablePlayers
                                 .filter(p => !tournament.confirmedPlayers.some(cp => cp._id === p._id))
                                 .filter(p => 
                                    p.fullName.toLowerCase().includes(playerSearchQuery.toLowerCase()) || 
                                    (p.email || '').toLowerCase().includes(playerSearchQuery.toLowerCase())
                                 ).length === 0 && (
                                    <p className="text-center py-4 text-xs italic text-text/30 font-bold">No matches found for "{playerSearchQuery}"</p>
                              )}
                           </>
                        ) : (
                           <div className="text-center py-6">
                              <p className="text-xs text-text/40 font-black italic uppercase tracking-widest leading-relaxed">
                                Enter at least 2 characters<br/>to search players
                              </p>
                           </div>
                        )}
                     </div>

                     {/* Attached Draft (Bulk Invite) */}
                     {selectedPlayers.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-base2/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                           <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase text-violet tracking-widest">Selected for Invite ({selectedPlayers.length})</span>
                              <button 
                                 onClick={() => setSelectedPlayers([])}
                                 className="text-[10px] font-black uppercase text-red hover:underline"
                              >
                                 Clear
                              </button>
                           </div>
                           <div className="flex flex-wrap gap-2 p-3 bg-violet/5 rounded-2xl border border-violet/10">
                              {selectedPlayers.map(p => (
                                 <div key={p._id} className="flex items-center gap-2 bg-base3 px-3 py-1.5 rounded-xl border border-base2 shadow-sm animate-in zoom-in-95">
                                    <span className="text-xs font-bold text-text-emphasis truncate max-w-[100px]">{p.fullName}</span>
                                    <button onClick={() => togglePlayerSelection(p)} className="text-text/40 hover:text-red transition-colors">
                                       <X size={14} />
                                    </button>
                                 </div>
                              ))}
                           </div>
                           <button
                              onClick={handleBulkInvite}
                              disabled={actionLoading}
                              className="w-full bg-violet hover:bg-violet-dark text-base3 py-3 rounded-2xl font-black shadow-lg shadow-violet/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                           >
                              {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                              Send Invites to ({selectedPlayers.length})
                           </button>
                        </div>
                     )}

                     {/* Invitation Status Tracking */}
                     {invitations.filter(inv => inv.status !== 'accepted').length > 0 && (
                        <div className="mt-8 pt-6 border-t border-base2/50 space-y-4">
                           <h4 className="text-[10px] font-black uppercase text-text/40 tracking-[0.2em] mb-4">Sent Invitation Status</h4>
                           <div className="space-y-2">
                              {invitations
                                 .filter(inv => inv.status !== 'accepted')
                                 .map((inv) => (
                                 <div key={inv._id} className="flex items-center justify-between p-2.5 bg-base2/10 rounded-xl border border-base2/30">
                                    <div className="min-w-0">
                                       <p className="text-[11px] font-bold text-text-emphasis truncate">{inv.playerId?.fullName}</p>
                                       <p className="text-[9px] text-text/40">{inv.playerId?.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                       <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                          inv.status === 'pending' ? 'bg-orange/10 text-orange' : 
                                          inv.status === 'declined' ? 'bg-red/10 text-red' : 'bg-base2 text-text/40'
                                       }`}>
                                          {inv.status}
                                       </span>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            )}
         </div>

         {/* Match Console Modal */}
         {selectedMatchForSets && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-base1/80 backdrop-blur-sm animate-in fade-in duration-300">
               <div className="bg-base3 w-full max-w-2xl rounded-[40px] shadow-2xl border border-base2 overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="p-8 border-b border-base2 flex justify-between items-center bg-base2/10">
                     <div className="flex items-center gap-4">
                        <img src="/favicon.png" alt="7 Ball" className="w-10 h-10 drop-shadow-md" />
                        <div>
                           <h3 className="text-3xl font-black text-text-emphasis tracking-tight">Cue Arena</h3>
                           <p className="text-xs font-black uppercase text-primary tracking-widest mt-1">Tournament System Engine</p>
                        </div>
                     </div>
                     <button
                        onClick={() => setSelectedMatchForSets(null)}
                        className="w-10 h-10 rounded-full bg-base2 flex items-center justify-center text-text hover:bg-red hover:text-white transition-all font-bold"
                     >
                        ✕
                     </button>
                  </div>

                  <div className="p-8 space-y-8">
                     {/* Match Summary */}
                     <div className="flex items-center justify-between bg-base2/20 p-6 rounded-3xl border border-base2">
                         <div className="text-center flex-1">
                            <p className="text-xl font-black text-text-emphasis">{selectedMatchForSets.player1Id?.fullName}</p>
                            <div className="flex flex-col items-center gap-1 mt-1">
                               <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">
                                  Won: {selectedMatchForSets.status === 'completed' && (!selectedMatchForSets.setsResults || selectedMatchForSets.setsResults.length === 0) ? selectedMatchForSets.scorePlayer1 : (selectedMatchForSets.setsResults?.filter(s => (s.winnerId?._id || s.winnerId || '').toString() === (selectedMatchForSets.player1Id?._id || selectedMatchForSets.player1Id || '').toString()).length || 0)} / {selectedMatchForSets.setsCount}
                               </p>
                               <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded leading-none ${selectedMatchForSets.player1Accepted ? 'bg-green/10 text-green' : 'bg-orange/10 text-orange'}`}>
                                  {selectedMatchForSets.player1Accepted ? 'Accepted' : 'Pending'}
                               </span>
                            </div>
                            <p className="text-4xl font-black text-primary mt-4">{selectedMatchForSets.scorePlayer1}</p>
                         </div>
                         <div className="px-6 flex flex-col items-center gap-2">
                            <div className="text-xs font-black uppercase tracking-[0.3em] text-primary/80 text-center leading-tight mb-2 drop-shadow-sm">
                               {tournament.name} • Match
                            </div>
                            <div className="text-base font-black italic text-text/20">VS</div>
                         </div>
                         <div className="text-center flex-1">
                            <p className="text-xl font-black text-text-emphasis">{selectedMatchForSets.player2Id?.fullName}</p>
                            <div className="flex flex-col items-center gap-1 mt-1">
                               <p className="text-[10px] font-black uppercase text-violet tracking-widest leading-none">
                                  Won: {selectedMatchForSets.status === 'completed' && (!selectedMatchForSets.setsResults || selectedMatchForSets.setsResults.length === 0) ? selectedMatchForSets.scorePlayer2 : (selectedMatchForSets.setsResults?.filter(s => (s.winnerId?._id || s.winnerId || '').toString() === (selectedMatchForSets.player2Id?._id || selectedMatchForSets.player2Id || '').toString()).length || 0)} / {selectedMatchForSets.setsCount}
                               </p>
                               <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded leading-none ${selectedMatchForSets.player2Accepted ? 'bg-green/10 text-green' : 'bg-orange/10 text-orange'}`}>
                                  {selectedMatchForSets.player2Accepted ? 'Accepted' : 'Pending'}
                               </span>
                            </div>
                            <p className="text-4xl font-black text-violet mt-4">{selectedMatchForSets.scorePlayer2}</p>
                         </div>
                     </div>

                     {/* Set Tabs Container */}
                     <div className="flex flex-wrap gap-4 justify-center relative min-h-[72px]">
                        {(() => {
                           // Precompute firstUnplayed globally for the match
                           let firstUnplayed = (selectedMatchForSets.setsCount || 1) - 1;
                           for (let i = 0; i < (selectedMatchForSets.setsCount || 1); i++) {
                              if (!selectedMatchForSets.setsResults?.find(s => s.setIndex === i)) {
                                 firstUnplayed = i;
                                 break;
                              }
                           }
                           const currentActiveDefault = firstUnplayed;
                           const currentActive = activeSetInModal !== null ? activeSetInModal : currentActiveDefault;

                           return Array.from({ length: selectedMatchForSets.setsCount || 1 }).map((_, idx) => {
                              const sRes = selectedMatchForSets.setsResults?.find(s => s.setIndex === idx);
                              const isOngoing = selectedMatchForSets.status === 'ongoing';
                              const isMatchFinished = selectedMatchForSets.status === 'completed';

                              const isActive = currentActive === idx;
                              const isLocked = (!isOngoing && !isMatchFinished) ? true : (idx > firstUnplayed);
                           
                           let tabLabel = `SET ${idx + 1}`;
                           let winnerColor = '';
                           if (sRes) {
                              if (sRes.winnerId === selectedMatchForSets.player1Id?._id) {
                                 tabLabel = selectedMatchForSets.player1Id?.fullName.split(' ')[0];
                                 winnerColor = 'text-primary';
                              } else {
                                 tabLabel = selectedMatchForSets.player2Id?.fullName.split(' ')[0];
                                 winnerColor = 'text-violet';
                              }
                           }
                           return (
                              <div key={idx} className="relative z-0">
                                 <button
                                    disabled={((isLocked || !isOngoing) && !isMatchFinished) || sRes}
                                    onClick={() => {
                                       if (!isLocked && isOngoing && !sRes && !isMatchFinished) {
                                          setSelectingWinnerForSetInModal(idx);
                                       } else {
                                          setActiveSetInModal(idx);
                                          setSelectingWinnerForSetInModal(null);
                                       }
                                    }}
                                    className={`min-w-[140px] h-[72px] px-6 rounded-[28px] font-black text-xs uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1 border-2 ${isActive
                                          ? 'bg-base3 border-primary shadow-xl shadow-primary/10'
                                          : (sRes ? 'bg-base2/20 border-base2/30 opacity-60 hover:opacity-100' : 'bg-base2/10 border-transparent')
                                       } ${((isLocked || !isOngoing) && !isMatchFinished) ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
                                 >
                                    <span className={`text-base font-black ${winnerColor || (isActive ? 'text-primary' : 'text-text/30')}`}>
                                       {tabLabel}
                                    </span>
                                 </button>
                              </div>
                           );
                        })})()}

                        {/* Pending Acceptance Message */}
                        {selectedMatchForSets.status === 'pending_invites' && (
                           <div className="absolute inset-x-0 inset-y-[-8px] bg-base3/60 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-[28px] border border-dashed border-base2">
                              <p className="text-xs font-black uppercase tracking-widest text-orange animate-pulse bg-base3 px-6 py-2 rounded-full shadow-lg shadow-orange/10 border border-orange/20 flex items-center gap-2">
                                 <Loader2 className="animate-spin" size={16} /> Waiting for players to accept
                              </p>
                           </div>
                        )}
                        
                        {/* Cancelled/Declined Message */}
                        {selectedMatchForSets.status === 'cancelled' && selectedMatchForSets.declinedBy && (
                           <div className="absolute inset-x-0 inset-y-[-8px] bg-base3/60 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-[28px] border border-dashed border-base2">
                              <p className="text-xs font-black uppercase tracking-widest text-red animate-pulse bg-base3 px-6 py-2 rounded-full shadow-lg shadow-red/10 border border-red/20 flex items-center gap-2">
                                 <X size={16} /> Declined by {selectedMatchForSets.declinedBy.fullName}
                              </p>
                           </div>
                        )}

                        {selectingWinnerForSetInModal !== null && (
                           <div className="absolute inset-x-0 inset-y-[-8px] flex justify-center z-50">
                              <div className="w-[420px] bg-base3 border-2 border-primary rounded-[32px] shadow-2xl flex items-center p-2 gap-3 animate-in zoom-in-95 duration-200">
                                 <div className="px-4 py-2 bg-primary/10 rounded-2xl flex flex-col items-center justify-center min-w-[80px]">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Set {selectingWinnerForSetInModal + 1}</span>
                                 </div>
                                 <div className="flex-1 flex gap-2">
                                    <button
                                       disabled={!selectedMatchForSets.player1Id}
                                       onClick={() => selectedMatchForSets.player1Id && handleRecordTournamentSetWinner(selectedMatchForSets._id, selectingWinnerForSetInModal, (selectedMatchForSets.player1Id?._id || selectedMatchForSets.player1Id))}
                                       className={`flex-1 py-3 bg-primary/5 hover:bg-primary text-primary hover:text-base3 rounded-2xl text-[11px] font-black transition-all flex flex-col items-center justify-center gap-0.5 border border-primary/10 ${!selectedMatchForSets.player1Id ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    >
                                       {selectedMatchForSets.player1Id?.fullName || 'TBD'}
                                    </button>
                                    <button
                                       disabled={!selectedMatchForSets.player2Id}
                                       onClick={() => selectedMatchForSets.player2Id && handleRecordTournamentSetWinner(selectedMatchForSets._id, selectingWinnerForSetInModal, (selectedMatchForSets.player2Id?._id || selectedMatchForSets.player2Id))}
                                       className={`flex-1 py-3 bg-violet/5 hover:bg-violet text-violet hover:text-base3 rounded-2xl text-[11px] font-black transition-all flex flex-col items-center justify-center gap-0.5 border border-violet/10 ${!selectedMatchForSets.player2Id ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    >
                                       {selectedMatchForSets.player2Id?.fullName || 'TBD'}
                                    </button>
                                 </div>
                                 <button
                                    onClick={() => setSelectingWinnerForSetInModal(null)}
                                    className="w-12 h-12 flex items-center justify-center text-text/20 hover:text-red transition-all rounded-full hover:bg-red/5"
                                 >
                                    <X size={20} />
                                 </button>
                              </div>
                           </div>
                        )}
                     </div>

                     {selectedMatchForSets.status === 'completed' && (
                        <div className="bg-green/10 border border-green/20 p-8 rounded-[32px] text-center">
                           <Trophy className="mx-auto text-green mb-4" size={48} />
                           <h4 className="text-3xl font-black text-text-emphasis italic tracking-tight">MATCH CONCLUDED</h4>
                           <p className="text-base font-bold text-green-700 mt-2 uppercase tracking-widest">Victor: {selectedMatchForSets.winnerId?.fullName}</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}
      </DashboardLayout>
   );
};

export default TournamentManage;

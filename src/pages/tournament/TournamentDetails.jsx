import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Trophy, Calendar, MapPin, Users, Info, ArrowLeft, CheckCircle, XCircle, Zap, Target, ChevronRight } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';

const BracketMatchCard = ({ match, isFinal = false }) => (
   <div className={`group relative p-3.5 rounded-2xl bg-base3/80 backdrop-blur-md border border-base2/50 hover:border-primary/40 transition-all shadow-sm hover:shadow-md min-w-[160px] ${isFinal ? 'ring-2 ring-yellow/40 bg-yellow/5' : ''}`}>
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

const TournamentDetails = () => {
   const { id } = useParams();
   const location = useLocation();
   const { socket, joinTournamentRoom, leaveTournamentRoom } = useSocket();
   const [tournament, setTournament] = useState(null);
   const [loading, setLoading] = useState(true);
   const [pendingInvite, setPendingInvite] = useState(null);
   const [activeTab, setActiveTab] = useState(location.hash === '#bracket' ? 'bracket' : 'overview');

   useEffect(() => {
      if (location.hash === '#bracket') {
         setActiveTab('bracket');
      }
   }, [location.hash]);

   const fetchTournament = async () => {
      try {
         const { data } = await api.get(`/tournaments/${id}`);
         setTournament(data);
      } catch (err) {
         toast.error('Tournament not found');
      } finally {
         setLoading(false);
      }
   };

   const checkPendingInvite = async () => {
      try {
         const { data } = await api.get(`/invitations/check/tournament/${id}`);
         setPendingInvite(data);
      } catch (err) {
         setPendingInvite(null);
      }
   };

   const handleInviteResponse = async (status) => {
      if (!pendingInvite) return;
      try {
         await api.post(`/invitations/${pendingInvite._id}/respond`, { status });
         toast.success(`Invitation ${status}`);
         setPendingInvite(null);
         fetchTournament();
      } catch (err) {
         toast.error('Error responding to invitation');
      }
   };

   useEffect(() => {
      fetchTournament();
      checkPendingInvite();

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
               fetchTournament();
            }
            toast.info('Tournament updated!', { id: 'tourney-update-view' });
         });

         return () => {
            socket.off('TOURNAMENT_UPDATE');
         };
      }
   }, [socket]);

   if (loading) return <DashboardLayout title="Tournament Details">Loading...</DashboardLayout>;
   if (!tournament) return <DashboardLayout title="Error">Tournament not found</DashboardLayout>;

   return (
      <DashboardLayout title="Tournament Overview">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <Link to="/dashboard" className="flex items-center gap-2 text-primary font-bold hover:underline">
               <ArrowLeft size={20} /> Back to Active Tournaments
            </Link>
            
            <div className="flex bg-base3 p-1 rounded-2xl border border-base2 w-fit self-end">
               <button 
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'overview' ? 'bg-primary text-base3 shadow-lg shadow-primary/20' : 'text-text/60 hover:text-text hover:bg-base2/50'}`}
               >
                  Tournament Overview
               </button>
               <button 
                  onClick={() => setActiveTab('bracket')}
                  className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'bracket' ? 'bg-primary text-base3 shadow-lg shadow-primary/20' : 'text-text/60 hover:text-text hover:bg-base2/50'}`}
               >
                  Tournament Table
               </button>
            </div>
         </div>

         {activeTab === 'overview' ? (
            <>
               {new Date(tournament.registrationDeadline) < new Date() && tournament.status === 'open_for_players' && (
                  <div className="card-premium p-6 rounded-3xl bg-red/5 border-red/20 mb-8 flex items-center gap-4 text-red">
                     <XCircle size={32} />
                     <div>
                        <p className="font-bold">Registration Closed</p>
                        <p className="text-sm opacity-80">The registration deadline for this tournament has passed. Unfilled tournaments will be cancelled.</p>
                     </div>
                  </div>
               )}

               {tournament.status === 'full' && (
                  <div className="card-premium p-6 rounded-3xl bg-violet/5 border-violet/20 mb-8 flex items-center gap-4 text-violet">
                     <Zap size={32} fill="currentColor" />
                     <div>
                        <p className="font-bold">Tournament Full & Scheduled</p>
                        <p className="text-sm opacity-80">The tournament is full. Matches will be generated on {new Date(tournament.startDate).toLocaleDateString()} at {new Date(tournament.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.</p>
                     </div>
                  </div>
               )}

               {pendingInvite && (
                  <div className="card-premium p-8 rounded-3xl bg-orange/5 border-2 border-orange/20 mb-8 animate-in slide-in-from-top-4 duration-500">
                     <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex gap-4">
                           <div className="w-14 h-14 rounded-2xl bg-orange/20 text-orange flex items-center justify-center shrink-0">
                              <Trophy size={32} />
                           </div>
                           <div>
                              <h4 className="text-xl font-bold text-text-emphasis">Tournament Invitation</h4>
                              <p className="text-text">You have been invited to join <span className="font-bold">{tournament.name}</span> by <span className="font-bold">{pendingInvite.sentBy?.fullName}</span>.</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                           <button
                              onClick={() => handleInviteResponse('declined')}
                              className="flex-1 md:flex-none px-8 py-3 rounded-xl border border-red/20 text-red font-bold hover:bg-red/5 transition-all text-sm"
                           >
                              Decline
                           </button>
                           <button
                              onClick={() => handleInviteResponse('accepted')}
                              disabled={new Date(tournament.registrationDeadline) < new Date()}
                              className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-green text-base3 font-bold hover:opacity-90 shadow-lg shadow-green/20 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                              Join Tournament
                           </button>
                        </div>
                     </div>
                  </div>
               )}

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                  <div className="lg:col-span-2 space-y-8">
                     <section className="card-premium p-8 rounded-3xl bg-base3">
                        <div className="flex justify-between items-start mb-6">
                           <div>
                              <StatusBadge status={tournament.status} entryType={tournament.entryType} registrationDeadline={tournament.registrationDeadline} />
                              <h3 className="text-4xl font-black text-text-emphasis mt-3 tracking-tight">{tournament.name}</h3>
                           </div>
                           <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 text-center min-w-[120px]">
                              <p className="text-[10px] font-bold uppercase text-primary tracking-widest mb-1">Entry Type</p>
                              <p className="font-bold text-text-emphasis">{(tournament.entryType || '').replace('_', ' ')}</p>
                           </div>
                        </div>

                        <p className="text-lg text-text leading-relaxed mb-8">
                           {tournament.description || 'No description provided for this tournament.'}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-t border-base2">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue/10 text-blue flex items-center justify-center">
                                 <Calendar size={20} />
                              </div>
                              <div>
                                 <p className="text-[10px] font-bold text-text uppercase">Start Date</p>
                                 <p className="font-bold text-text-emphasis">{new Date(tournament.startDate).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-green/10 text-green flex items-center justify-center">
                                 <MapPin size={20} />
                              </div>
                              <div>
                                 <p className="text-[10px] font-bold text-text uppercase">Venue</p>
                                 <p className="font-bold text-text-emphasis">{tournament.venue}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-yellow/10 text-yellow flex items-center justify-center">
                                 <Users size={20} />
                              </div>
                              <div>
                                 <p className="text-[10px] font-bold text-text uppercase">Organizer</p>
                                 <p className="font-bold text-text-emphasis">{tournament.organizerId?.fullName || 'N/A'}</p>
                              </div>
                           </div>
                        </div>
                     </section>

                     <section className="card-premium p-8 rounded-3xl">
                        <h4 className="text-xl font-bold text-text-emphasis mb-6 flex items-center gap-2">
                           <Info size={22} className="text-primary" />
                           Tournament Format & Rules
                        </h4>
                        <div className="prose prose-slate max-w-none text-text">
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                              <div className="p-4 bg-base2/30 rounded-2xl text-center">
                                 <p className="text-xs font-bold text-text uppercase mb-1">Format</p>
                                 <p className="font-bold text-text-emphasis capitalize">{(tournament.format || '').replace('_', ' ')}</p>
                              </div>
                              <div className="p-4 bg-base2/30 rounded-2xl text-center">
                                 <p className="text-xs font-bold text-text uppercase mb-1">No. of players</p>
                                 <p className="font-bold text-text-emphasis">{tournament.maxPlayers}</p>
                              </div>
                              <div className="p-4 bg-base2/30 rounded-2xl text-center">
                                 <p className="text-xs font-bold text-text uppercase mb-1">Confirmed</p>
                                 <p className="font-bold text-primary">{tournament.confirmedPlayers.length}</p>
                              </div>
                           </div>
                           <p className="italic text-sm">
                              {tournament.rules || 'Standard tournament rules apply. Contact the organizer for specific requirements.'}
                           </p>
                        </div>
                     </section>
                  </div>

                  <div className="space-y-8">
                     <section className="card-premium p-6 rounded-3xl bg-base3/50">
                        <h4 className="font-bold text-text-emphasis mb-4 border-b border-base2 pb-2">Confirmed Players</h4>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                           {tournament.confirmedPlayers.map(p => (
                              <div key={p._id} className="flex items-center gap-3 p-2 bg-base3 rounded-xl border border-base2">
                                 <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                    {p.fullName?.[0] || '?'}
                                 </div>
                                 <span className="text-sm font-bold text-text-emphasis">{p.fullName || 'Anonymous'}</span>
                                 <CheckCircle size={14} className="ml-auto text-green" />
                              </div>
                           ))}
                           {tournament.confirmedPlayers.length === 0 && (
                              <p className="text-sm text-text italic p-4 text-center">No players joined yet.</p>
                           )}
                        </div>
                     </section>

                     {tournament.status === 'completed' && tournament.winner && (
                        <section className="card-premium p-6 rounded-3xl bg-yellow/5 border-yellow/20 ring-4 ring-yellow/5">
                           <div className="flex flex-col items-center text-center">
                              <Trophy size={48} className="text-yellow mb-4" />
                              <h4 className="text-xs font-bold uppercase tracking-widest text-yellow mb-1">Tournament Winner</h4>
                              <p className="text-2xl font-black text-text-emphasis">{tournament.winner?.fullName || 'Winner Declared'}</p>
                           </div>
                        </section>
                     )}
                  </div>
               </div>
            </>
         ) : (
            <>
               {/* Minimalist Tournament Bracket Section */}
               {(tournament.matches && tournament.matches.length > 0) ? (
                  <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
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
                           
                           {/* LEFT WING - Rounds before Final */}
                           <div className="flex gap-32 items-stretch left-wing">
                              {[...new Set(tournament.matches.map(m => m.round))]
                                 .filter(r => r < Math.max(...tournament.matches.map(m => m.round)))
                                 .sort((a, b) => a - b)
                                 .map(roundNum => (
                                    <div key={`left-r-${roundNum}`} className="bracket-column">
                                       <h4 className="text-[10px] font-black uppercase tracking-widest text-primary text-center mb-4">Round {roundNum}</h4>
                                       {tournament.matches
                                          .filter(m => m.round === roundNum && m.matchIndex < (tournament.matches.filter(mf => mf.round === roundNum).length / 2))
                                        .map(match => (
                                           <div key={match._id} className={`match-card-wrapper ${roundNum > 1 ? 'has-prev' : ''}`}>
                                              <BracketMatchCard match={match} />
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

                              {tournament.matches
                                  .filter(m => m.round === Math.max(...tournament.matches.map(mf => mf.round)))
                                  .map(match => (
                                     <div key={match._id} className="scale-110 final-match-card relative z-20">
                                        <BracketMatchCard match={match} isFinal={true} />
                                     </div>
                                  ))}
                           </div>

                           {/* RIGHT WING - Rounds before Final (Reversed) */}
                           <div className="flex gap-32 items-stretch right-wing">
                              {[...new Set(tournament.matches.map(m => m.round))]
                                 .filter(r => r < Math.max(...tournament.matches.map(m => m.round)))
                                 .sort((a, b) => b - a)
                                 .map(roundNum => (
                                    <div key={`right-r-${roundNum}`} className="bracket-column">
                                       <h4 className="text-[10px] font-black uppercase tracking-widest text-primary text-center mb-4">Round {roundNum}</h4>
                                       {tournament.matches
                                          .filter(m => m.round === roundNum && m.matchIndex >= (tournament.matches.filter(mf => mf.round === roundNum).length / 2))
                                        .map(match => (
                                           <div key={match._id} className={`match-card-wrapper ${roundNum > 1 ? 'has-prev' : ''}`}>
                                              <BracketMatchCard match={match} />
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
                  </div>
               ) : (
                  <div className="card-premium p-12 rounded-3xl bg-base3 flex flex-col items-center justify-center text-center py-20 min-h-[400px]">
                     <Zap size={64} className="text-base2 mb-4" />
                     <h4 className="text-2xl font-bold text-text-emphasis mb-2">Tournament Table Not Ready</h4>
                     <p className="text-text max-w-md">The bracket will be generated once the tournament is full and the start date is reached.</p>
                  </div>
               )}
            </>
         )}
      </DashboardLayout>
   );
};

export default TournamentDetails;

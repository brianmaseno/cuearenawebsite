import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Trophy, Calendar, MapPin, Users, Info, ArrowLeft, CheckCircle, XCircle, Zap } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';

const TournamentDetails = () => {
   const { id } = useParams();
   const { socket, joinTournamentRoom, leaveTournamentRoom } = useSocket();
   const [tournament, setTournament] = useState(null);
   const [loading, setLoading] = useState(true);
   const [pendingInvite, setPendingInvite] = useState(null);

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
         <Link to="/tournaments" className="flex items-center gap-2 text-primary font-bold mb-6 hover:underline">
            <ArrowLeft size={20} /> Back to Browse
         </Link>

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

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
               <section className="card-premium p-8 rounded-3xl bg-base3">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <StatusBadge status={tournament.status} entryType={tournament.entryType} registrationDeadline={tournament.registrationDeadline} />
                        <h3 className="text-4xl font-black text-text-emphasis mt-3 tracking-tight">{tournament.name}</h3>
                     </div>
                     <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 text-center min-w-[120px]">
                        <p className="text-[10px] font-bold uppercase text-primary tracking-widest mb-1">Entry Type</p>
                        <p className="font-bold text-text-emphasis">{tournament.entryType.replace('_', ' ')}</p>
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
                           <p className="font-bold text-text-emphasis">{tournament.organizerId.fullName}</p>
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
                           <p className="font-bold text-text-emphasis capitalize">{tournament.format.replace('_', ' ')}</p>
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
                              {p.fullName[0]}
                           </div>
                           <span className="text-sm font-bold text-text-emphasis">{p.fullName}</span>
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
                        <p className="text-2xl font-black text-text-emphasis">{tournament.winner.fullName}</p>
                     </div>
                  </section>
               )}
            </div>

            {/* Tournament Bracket Section */}
            {(tournament.matches && tournament.matches.length > 0) && (
               <div className="mt-12 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="flex items-center gap-4 px-4 border-t border-base2 pt-8">
                     <h3 className="text-2xl font-black text-text-emphasis tracking-tighter uppercase flex items-center gap-3">
                        <Target size={24} className="text-primary" />
                        Tournament Bracket
                     </h3>
                     <div className="h-px flex-1 bg-gradient-to-r from-base2 to-transparent opacity-50"></div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 overflow-x-auto pb-8 snap-x thin-scrollbar">
                     {Object.entries(
                        tournament.matches.reduce((acc, m) => {
                           const r = m.round || 1;
                           if (!acc[r]) acc[r] = [];
                           acc[r].push(m);
                           return acc;
                        }, {})
                     ).sort((a, b) => a[0] - b[0]).map(([round, roundMatches]) => (
                        <div key={round} className="space-y-6 min-w-[320px] snap-center">
                           <div className="flex items-center gap-2 mb-4">
                              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-sm border border-primary/20 shadow-sm">
                                 {round}
                               </span>
                              <h4 className="font-black text-text-emphasis uppercase tracking-widest text-sm">Round {round}</h4>
                           </div>
                           
                           <div className="grid grid-cols-1 gap-4">
                              {roundMatches.map((match) => (
                                 <div key={match._id} className="card-premium p-5 rounded-3xl bg-base3 border border-base2 hover:border-primary/30 transition-all group relative overflow-hidden shadow-lg">
                                    <div className="absolute top-0 right-0 p-3">
                                       <StatusBadge status={match.status} />
                                    </div>
                                    <div className="flex flex-col gap-2 mt-4">
                                       <div className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                                          (match.winnerId?._id || match.winnerId) === (match.player1Id?._id || match.player1Id) && match.status === 'completed'
                                          ? 'bg-green/5 border-green/30 text-green shadow-sm' 
                                          : 'bg-base2/20 border-base2'
                                       }`}>
                                          <div className="flex items-center gap-2">
                                             <div className="w-6 h-6 rounded-full bg-base3 flex items-center justify-center text-[10px] font-bold shadow-xs">
                                                {match.player1Id?.fullName?.[0] || '?'}
                                             </div>
                                             <span className="text-sm font-bold truncate max-w-[140px] uppercase tracking-tight">{match.player1Id?.fullName || 'TBD'}</span>
                                          </div>
                                          <span className="text-sm font-black font-mono">{match.scorePlayer1}</span>
                                       </div>

                                       <div className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                                          (match.winnerId?._id || match.winnerId) === (match.player2Id?._id || match.player2Id) && match.status === 'completed'
                                          ? 'bg-green/5 border-green/30 text-green shadow-sm' 
                                          : 'bg-base2/20 border-base2'
                                       }`}>
                                          <div className="flex items-center gap-2">
                                             <div className="w-6 h-6 rounded-full bg-base3 flex items-center justify-center text-[10px] font-bold shadow-xs">
                                                {match.player2Id?.fullName?.[0] || '?'}
                                             </div>
                                             <span className="text-sm font-bold truncate max-w-[140px] uppercase tracking-tight">{match.player2Id?.fullName || 'TBD'}</span>
                                          </div>
                                          <span className="text-sm font-black font-mono">{match.scorePlayer2}</span>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </div>
      </DashboardLayout>
   );
};

export default TournamentDetails;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Trophy, Users, Calendar, MapPin, Zap, Info, Loader2, ArrowLeft, Trophy as TrophyIcon, CheckCircle2 } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import BracketCanvas from "../../components/Tournament/BracketCanvas";
import StatusBadge from "../../components/StatusBadge";
import toast from "react-hot-toast";

const TournamentDetails = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const [tournament, setTournament] = useState(null);
   const [loading, setLoading] = useState(true);
   const [user, setUser] = useState(null);

   useEffect(() => {
      const fetchTournament = async () => {
         try {
            const [tRes, uRes] = await Promise.all([
               api.get(`/tournaments/${id}`),
               api.get("/auth/me")
            ]);
            setTournament(tRes.data);
            setUser(uRes.data);

            // Check for hash and scroll
            if (window.location.hash === '#bracket') {
               setTimeout(() => {
                  const el = document.getElementById('bracket');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
               }, 500);
            }
         } catch (err) {
            console.error("Error fetching tournament:", err);
            toast.error("Failed to load tournament details");
         } finally {
            setLoading(false);
         }
      };
      fetchTournament();
   }, [id]);

   const handleJoinTournament = async () => {
      try {
         await api.post(`/tournaments/${id}/join`);
         toast.success("Successfully joined the tournament!");
         // Refresh data
         const { data } = await api.get(`/tournaments/${id}`);
         setTournament(data);
      } catch (err) {
         toast.error(err.response?.data?.message || "Failed to join tournament");
      }
   };

   if (loading) {
      return (
         <DashboardLayout title="Tournament Details">
            <div className="flex items-center justify-center h-[60vh]">
               <Loader2 className="animate-spin text-primary" size={48} />
            </div>
         </DashboardLayout>
      );
   }

   if (!tournament) {
      return (
         <DashboardLayout title="Tournament Not Found">
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
               <Trophy size={64} className="text-base2 mb-4" />
               <h2 className="text-2xl font-bold text-text-emphasis">Tournament Not Found</h2>
               <button onClick={() => navigate(-1)} className="mt-4 text-primary font-bold flex items-center gap-2">
                  <ArrowLeft size={18} /> Go Back
               </button>
            </div>
         </DashboardLayout>
      );
   }

   const isPlayerConfirmed = tournament.confirmedPlayers?.some(p => p._id === user?._id);
   const isRegistrationOpen = tournament.status === 'open_for_players';
   const isFull = tournament.confirmedPlayers?.length >= tournament.maxPlayers;

   return (
      <DashboardLayout title={tournament.name}>
         <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Context Navigation */}
            <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-text/60 hover:text-primary transition-colors font-bold text-sm">
               <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
               Back to Tournaments
            </button>

            {/* Registration Banner - Only show if not registered and tournament is open */}
            {!isPlayerConfirmed && isRegistrationOpen && (
               <div className="card-premium p-1 rounded-3xl bg-base2/50 border-none shadow-xl overflow-hidden">
                  <div className="bg-base3 p-8 rounded-[1.5rem] flex flex-col md:flex-row items-center justify-between gap-8 border border-base2/50">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-green/10 text-green rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                           <Zap size={32} />
                        </div>
                        <div>
                           <h4 className="text-2xl font-black text-text-emphasis tracking-tight">
                              {tournament.status === 'full' ? 'Joining Closed' : 'Registration Open!'}
                           </h4>
                           <p className="text-text/70 font-medium max-w-md leading-relaxed mt-1">
                              {tournament.status === 'full' 
                                 ? 'This tournament has reached its maximum capacity. Follow the bracket to stay updated!' 
                                 : 'This tournament is open for public entry. Join now to compete for the championship!'}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                           onClick={handleJoinTournament}
                           disabled={tournament.status === 'full' || new Date(tournament.registrationDeadline) < new Date()}
                           className={`w-full md:w-auto px-10 py-4 rounded-2xl ${tournament.status === 'full' ? 'bg-base2 text-text/40' : 'bg-green text-base3 shadow-green/20 hover:bg-green/90 hover:scale-105'} font-black shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-widest`}
                        >
                           {tournament.status === 'full' ? 'Tournament Full' : 'Join Tournament'}
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
                           <StatusBadge status={tournament.status} entryType={tournament.entryType} registrationDeadline={tournament.registrationDeadline} startDate={tournament.startDate} />
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
                     <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {tournament.confirmedPlayers?.length > 0 ? (
                           tournament.confirmedPlayers.map((player) => (
                              <div key={player._id} className="flex items-center justify-between p-3 bg-base3 rounded-xl border border-base2/50 group hover:border-primary/30 transition-all hover:translate-x-1">
                                 <div className="flex items-center gap-3">
                                    <img 
                                       src={player.profilePhoto || `https://ui-avatars.com/api/?name=${player.fullName}&background=random`} 
                                       alt={player.fullName} 
                                       className="w-10 h-10 rounded-lg object-cover ring-2 ring-base2 group-hover:ring-primary/20"
                                    />
                                    <div>
                                       <p className="text-sm font-bold text-text-emphasis">{player.fullName}</p>
                                       <p className="text-[10px] text-text/50 font-black uppercase tracking-wider">Confirmed Entrance</p>
                                    </div>
                                 </div>
                                 <div className="w-8 h-8 rounded-lg bg-green/10 text-green flex items-center justify-center">
                                    <CheckCircle2 size={16} />
                                 </div>
                              </div>
                           ))
                        ) : (
                           <p className="text-sm text-center text-text italic py-4">No players confirmed yet.</p>
                        )}
                     </div>
                  </section>

                  {tournament.status === 'completed' && tournament.winner && (
                     <section className="card-premium p-6 rounded-3xl bg-yellow/5 border-yellow/20 ring-4 ring-yellow/5">
                        <div className="flex flex-col items-center text-center">
                           <TrophyIcon size={48} className="text-yellow mb-4" />
                           <h4 className="text-xs font-bold uppercase tracking-widest text-yellow mb-1">Tournament Winner</h4>
                           <p className="text-2xl font-black text-text-emphasis">{tournament.winner?.fullName || 'Winner Declared'}</p>
                        </div>
                     </section>
                  )}
               </div>
            </div>

            {/* Explicit Bracket Anchor */}
            <div id="bracket" className="pt-8 active-anchor">
               {(tournament.matches && tournament.matches.length > 0) ? (
                  <BracketCanvas tournament={tournament} user={user} />
               ) : (
                  <div className="card-premium p-12 rounded-3xl bg-base3 flex flex-col items-center justify-center text-center py-20 min-h-[400px]">
                     <Zap size={64} className="text-base2 mb-4" />
                     <h4 className="text-2xl font-bold text-text-emphasis mb-2">Tournament Table Not Ready</h4>
                     <p className="text-text max-w-md">The bracket will be generated once the tournament is full and the start date is reached.</p>
                  </div>
               )}
            </div>
         </div>
      </DashboardLayout>
   );
};

export default TournamentDetails;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Trophy, Users, Calendar, MapPin, Zap, Info, Loader2, ArrowLeft, Trophy as TrophyIcon, CheckCircle2, Target } from "lucide-react";
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
   const [activeTab, setActiveTab] = useState('info'); // 'info' or 'brackets'

   useEffect(() => {
      const fetchTournament = async () => {
         try {
            const [tRes, uRes] = await Promise.all([
               api.get(`/tournaments/${id}`),
               api.get("/auth/me")
            ]);
            setTournament(tRes.data);
            setUser(uRes.data);

            // Auto-switch to brackets if ongoing/completed or hash is present
            if (window.location.hash === '#bracket' || tRes.data.status === 'ongoing' || tRes.data.status === 'completed') {
               setActiveTab('brackets');
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
      if (tournament.stakePerPlayer > 0) {
         if (!window.confirm(`Joining this tournament requires a stake of KES ${tournament.stakePerPlayer.toLocaleString()}. This amount will be locked from your balance until the tournament concludes or is cancelled. Proceed?`)) {
            return;
         }
      }
      try {
         await api.post(`/tournaments/${id}/join`);
         toast.success("Successfully joined the tournament!");
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

   return (
      <DashboardLayout title={tournament.name}>
         <div className="max-w-[1400px] mx-auto space-y-4 animate-in fade-in duration-700">
            {/* Context Navigation */}
            <div className="flex items-center justify-between">
               <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-text/60 hover:text-primary transition-colors font-bold text-xs uppercase tracking-wider">
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Back
               </button>
            </div>

            {/* Registration Banner */}
            {!isPlayerConfirmed && isRegistrationOpen && (
               <div className="card-premium p-1 rounded-2xl bg-base2/50 border-none shadow-sm overflow-hidden">
                  <div className="bg-base3 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-base2/50">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green/10 text-green rounded-lg flex items-center justify-center shrink-0">
                           <Zap size={20} />
                        </div>
                        <div>
                           <h4 className="text-xl font-black text-text-emphasis tracking-tight">
                              {tournament.status === 'full' ? 'Joining Closed' : 'Registration Open!'}
                           </h4>
                           <p className="text-xs text-text/60 font-medium">
                              {tournament.status === 'full' 
                                 ? 'Tournament at max capacity.' 
                                 : 'Join now to compete for the championship!'}
                           </p>
                        </div>
                     </div>
                     <button
                        onClick={handleJoinTournament}
                        disabled={tournament.status === 'full' || new Date(tournament.registrationDeadline) < new Date()}
                        className="px-6 py-2.5 rounded-xl bg-green text-base3 font-black shadow-lg shadow-green/20 hover:bg-green/90 transition-all active:scale-95 disabled:opacity-50 text-xs uppercase tracking-widest"
                     >
                        Join Tournament
                     </button>
                  </div>
               </div>
            )}

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 bg-base2/10 p-1 rounded-2xl w-fit">
               <button
                  onClick={() => setActiveTab('info')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                     activeTab === 'info' 
                        ? 'bg-base3 text-primary shadow-lg shadow-primary/5 border border-primary/10' 
                        : 'text-text/40 hover:text-text hover:bg-base2/20'
                  }`}
               >
                  <Info size={14} />
                  Info
               </button>
               <button
                  onClick={() => setActiveTab('brackets')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                     activeTab === 'brackets' 
                        ? 'bg-base3 text-primary shadow-lg shadow-primary/5 border border-primary/10' 
                        : 'text-text/40 hover:text-text hover:bg-base2/20'
                  }`}
               >
                  <Target size={14} />
                  Brackets
               </button>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               {activeTab === 'info' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                     <div className="lg:col-span-2 space-y-8">
                        <section className="card-premium p-8 rounded-3xl bg-base3">
                           <div className="flex justify-between items-start mb-6">
                              <div>
                                 <StatusBadge status={tournament.status} entryType={tournament.entryType} registrationDeadline={tournament.registrationDeadline} startDate={tournament.startDate} />
                                 <h3 className="text-3xl font-black text-text-emphasis mt-3 tracking-tight">{tournament.name}</h3>
                              </div>
                              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 text-center min-w-[120px]">
                                 <p className="text-[10px] font-bold uppercase text-primary tracking-widest mb-1">Entry</p>
                                 <p className="font-bold text-text-emphasis text-sm">{(tournament.entryType || '').replace('_', ' ')}</p>
                              </div>
                              {tournament.stakePerPlayer > 0 && (
                                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center min-w-[120px]">
                                   <p className="text-[10px] font-bold uppercase text-emerald-600 tracking-widest mb-1">Stake</p>
                                   <p className="font-bold text-emerald-700 text-sm">KES {tournament.stakePerPlayer.toLocaleString()}</p>
                                </div>
                              )}
                           </div>
                           <p className="text-base text-text leading-relaxed mb-8">
                              {tournament.description || 'No description provided.'}
                           </p>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-t border-base2">
                              {[{ icon: Calendar, label: 'Date', val: new Date(tournament.startDate).toLocaleDateString(), color: 'blue' },
                                { icon: MapPin, label: 'Venue', val: tournament.venue, color: 'green' },
                                { icon: Users, label: 'Organizer', val: tournament.organizerId?.fullName, color: 'yellow' }].map((item, idx) => (
                                 <div key={idx} className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl bg-${item.color}/10 text-${item.color} flex items-center justify-center`}>
                                       <item.icon size={20} />
                                    </div>
                                    <div>
                                       <p className="text-[10px] font-bold text-text uppercase">{item.label}</p>
                                       <p className="font-bold text-text-emphasis text-sm">{item.val || 'N/A'}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </section>

                        <section className="card-premium p-8 rounded-3xl">
                           <h4 className="text-lg font-bold text-text-emphasis mb-6 flex items-center gap-2">
                              <Info size={20} className="text-primary" />
                              Format & Rules
                           </h4>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                              {[{ l: 'Format', v: tournament.format }, { l: 'Max Players', v: tournament.maxPlayers }, { l: 'Confirmed', v: tournament.confirmedPlayers.length }].map((stat, i) => (
                                 <div key={i} className="p-4 bg-base2/30 rounded-2xl text-center">
                                    <p className="text-[10px] font-bold text-text uppercase mb-1">{stat.l}</p>
                                    <p className="font-bold text-text-emphasis capitalize text-sm">{(stat.v || '').toString().replace('_', ' ')}</p>
                                 </div>
                              ))}
                           </div>
                           <p className="italic text-sm text-text/70 bg-base2/10 p-4 rounded-xl border border-base2/30">
                              {tournament.rules || 'Standard tournament rules apply.'}
                           </p>
                        </section>
                     </div>

                     <div className="space-y-8">
                        <section className="card-premium p-6 rounded-3xl bg-base3/50">
                           <h4 className="font-bold text-sm text-text-emphasis mb-4 border-b border-base2 pb-2 flex items-center gap-2">
                              <Users size={16} className="text-primary" />
                              Confirmed Players
                           </h4>
                           <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 thin-scrollbar">
                              {tournament.confirmedPlayers.map((player) => (
                                 <div key={player._id} className="flex items-center justify-between p-3 bg-base3 rounded-xl border border-base2/50 group transition-all hover:border-primary/30">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                                          {player.fullName[0]}
                                       </div>
                                       <p className="text-sm font-bold text-text-emphasis truncate max-w-[120px]">{player.fullName}</p>
                                    </div>
                                    <CheckCircle2 size={16} className="text-green opacity-40" />
                                 </div>
                              ))}
                           </div>
                        </section>
                        {tournament.status === 'completed' && tournament.winner && (
                           <div className="card-premium p-6 rounded-3xl bg-yellow/5 border-yellow/20 text-center animate-in zoom-in-95">
                              <Trophy size={40} className="text-yellow mx-auto mb-3" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-yellow mb-1">Champion</p>
                              <p className="text-xl font-black text-text-emphasis">{tournament.winner.fullName}</p>
                           </div>
                        )}
                     </div>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {tournament.matches?.length > 0 ? (
                        <BracketCanvas tournament={tournament} user={user} />
                     ) : (
                        <div className="card-premium p-12 rounded-3xl bg-base3 flex flex-col items-center justify-center text-center py-20 min-h-[400px]">
                           <Zap size={48} className="text-base2 mb-4" />
                           <h4 className="text-xl font-bold text-text-emphasis mb-2">Bracket Not Ready</h4>
                           <p className="text-sm text-text/60 max-w-sm">The bracket will be generated once the tournament is and started by the moderator.</p>
                        </div>
                     )}
                  </div>
               )}
            </div>
         </div>
      </DashboardLayout>
   );
};

export default TournamentDetails;

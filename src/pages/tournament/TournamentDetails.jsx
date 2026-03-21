import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Trophy, Calendar, MapPin, Users, Info, ArrowLeft, CheckCircle } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const TournamentDetails = () => {
   const { id } = useParams();
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
   }, [id]);

   if (loading) return <DashboardLayout title="Tournament Details">Loading...</DashboardLayout>;
   if (!tournament) return <DashboardLayout title="Error">Tournament not found</DashboardLayout>;

   return (
      <DashboardLayout title="Tournament Overview">
         <Link to="/tournaments" className="flex items-center gap-2 text-primary font-bold mb-6 hover:underline">
            <ArrowLeft size={20} /> Back to Browse
         </Link>

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
                        className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-green text-base3 font-bold hover:opacity-90 shadow-lg shadow-green/20 transition-all text-sm"
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
                        <StatusBadge status={tournament.status} entryType={tournament.entryType} />
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
                           <p className="text-xs font-bold text-text uppercase mb-1">Min Players</p>
                           <p className="font-bold text-text-emphasis">{tournament.minPlayers}</p>
                        </div>
                        <div className="p-4 bg-base2/30 rounded-2xl text-center">
                           <p className="text-xs font-bold text-text uppercase mb-1">Max Players</p>
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
         </div>
      </DashboardLayout>
   );
};

export default TournamentDetails;

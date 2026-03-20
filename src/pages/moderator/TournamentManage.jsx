import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Trophy, Users, UserPlus, Play, CheckCircle, Clock, MapPin, Loader2, ArrowLeft } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const TournamentManage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [tRes, pRes] = await Promise.all([
        api.get(`/tournaments/${id}`),
        api.get('/users/players'),
      ]);
      setTournament(tRes.data);
      setAvailablePlayers(pRes.data);
    } catch (err) {
      toast.error('Failed to load tournament data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handlePublish = async () => {
    setActionLoading(true);
    try {
      await api.post(`/tournaments/${id}/publish`);
      toast.success('Tournament published! Open for players.');
      fetchData();
    } catch (err) {
      toast.error('Failed to publish');
    } finally {
      setActionLoading(false);
    }
  };

  const handleInvite = async (playerId) => {
    try {
      await api.post(`/tournaments/${id}/invite`, { playerId });
      toast.success('Invitation sent!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending invite');
    }
  };

  const handleStart = async () => {
    setActionLoading(true);
    try {
      await api.post(`/tournaments/${id}/start`);
      toast.success('Tournament started! Good luck to players.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error starting tournament');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    const winnerId = prompt('Enter winner player ID (or leave blank):');
    setActionLoading(true);
    try {
      await api.post(`/tournaments/${id}/complete`, { winnerId });
      toast.success('Tournament completed!');
      fetchData();
    } catch (err) {
      toast.error('Error completing tournament');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <DashboardLayout title="Tournament Management">Loading...</DashboardLayout>;
  if (!tournament) return <DashboardLayout title="Tournament Management text-red">Tournament not found</DashboardLayout>;

  return (
    <DashboardLayout title={`Manage: ${tournament.name}`}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary font-bold mb-6 hover:underline">
        <ArrowLeft size={20} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info Card */}
        <div className="lg:col-span-2 space-y-8">
          <section className="card-premium p-8 rounded-2xl relative overflow-hidden">
             <div className="flex justify-between items-start mb-6">
                <div>
                  <StatusBadge status={tournament.status} />
                  <h3 className="text-3xl font-extrabold text-text-emphasis mt-2">{tournament.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text font-bold uppercase tracking-widest">Capacity</p>
                  <p className="text-2xl font-black text-primary">{tournament.confirmedPlayers.length} / {tournament.maxPlayers}</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 border-t border-base2 pt-6">
                <div className="flex items-center gap-2 text-text">
                  <Calendar size={18} />
                  <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-text">
                  <MapPin size={18} />
                  <span>{tournament.venue}</span>
                </div>
             </div>

             {/* Actions Bar */}
             <div className="mt-8 flex flex-wrap gap-4">
                {tournament.status === 'draft' && (
                  <button onClick={handlePublish} disabled={actionLoading} className="btn-primary px-8 py-3 flex items-center gap-2 shadow-lg ring-4 ring-primary/5">
                    <CheckCircle size={20} /> Publish & Open
                  </button>
                )}
                {tournament.status === 'open_for_players' && tournament.confirmedPlayers.length >= tournament.minPlayers && (
                  <button onClick={handleStart} disabled={actionLoading} className="bg-green text-base3 px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg ring-4 ring-green/5">
                    <Play size={20} /> Start Tournament
                  </button>
                )}
                {tournament.status === 'ongoing' && (
                  <button onClick={handleComplete} disabled={actionLoading} className="bg-base1 text-base3 px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg ring-4 ring-base1/5">
                    <Trophy size={20} /> Complete Tournament
                  </button>
                )}
             </div>
          </section>

          {/* Confirmed Players */}
          <section className="card-premium rounded-2xl overflow-hidden">
             <div className="p-6 border-b border-base2 flex items-center gap-2 bg-base3/50 font-bold">
                <Users size={20} className="text-primary" />
                Confirmed Participants ({tournament.confirmedPlayers.length})
             </div>
             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {tournament.confirmedPlayers.map(p => (
                  <div key={p._id} className="flex items-center gap-3 p-3 bg-base2/20 rounded-xl border border-base2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {p.fullName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-text-emphasis text-sm">{p.fullName}</p>
                      <p className="text-xs text-text">{p.email}</p>
                    </div>
                  </div>
                ))}
                {tournament.confirmedPlayers.length === 0 && (
                  <p className="text-text italic py-4">No confirmed players yet.</p>
                )}
             </div>
          </section>
        </div>

        {/* Sidebar: Invites */}
        <div className="space-y-8">
           <section className="card-premium rounded-2xl overflow-hidden flex flex-col h-[600px]">
              <div className="p-6 border-b border-base2 bg-base3/50">
                 <h3 className="text-lg font-bold flex items-center gap-2">
                    <UserPlus size={20} className="text-violet" />
                    Invite Players
                 </h3>
              </div>
              <div className="p-4 border-b border-base2 bg-base2/10">
                 <input 
                    type="text" 
                    placeholder="Search players..." 
                    className="w-full bg-base3 border border-base2 rounded-lg px-3 py-2 text-sm"
                 />
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                 {availablePlayers.filter(p => !tournament.confirmedPlayers.some(cp => cp._id === p._id)).map(p => (
                   <div key={p._id} className="flex items-center justify-between p-3 bg-base3 border border-base2 rounded-xl hover:border-violet/30 transition-all">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-violet/10 text-violet flex items-center justify-center text-xs font-bold">
                            {p.fullName[0]}
                         </div>
                         <span className="text-sm font-bold text-text-emphasis">{p.fullName}</span>
                      </div>
                      <button 
                        onClick={() => handleInvite(p._id)}
                        className="text-primary hover:text-primary-dark transition-colors"
                        disabled={tournament.invitedPlayers.some(ip => ip._id === p._id)}
                      >
                         <UserPlus size={18} className={tournament.invitedPlayers.some(ip => ip._id === p._id) ? 'opacity-30' : ''} />
                      </button>
                   </div>
                 ))}
              </div>
           </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TournamentManage;

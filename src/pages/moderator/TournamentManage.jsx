import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Trophy, Users, UserPlus, Play, CheckCircle, Clock, MapPin, Loader2, ArrowLeft, ChevronRight, User, Target } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const TournamentManage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
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
      
      if (tRes.data.status === 'ongoing' || tRes.data.status === 'completed') {
        const mRes = await api.get(`/tournaments/${id}/matches`);
        setMatches(mRes.data);
      }
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
      toast.success('Tournament started and bracket generated!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error starting tournament');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetWinner = async (matchId, winnerId) => {
    if (!winnerId) return;
    setActionLoading(true);
    try {
      await api.put(`/tournaments/matches/${matchId}/winner`, { winnerId });
      toast.success('Winner recorded and bracket updated!');
      fetchData();
    } catch (err) {
      toast.error('Failed to set winner');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <DashboardLayout title="Tournament Management"><div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div></DashboardLayout>;
  if (!tournament) return <DashboardLayout title="Tournament Management"><div className="text-red font-bold text-center p-20">Tournament not found</div></DashboardLayout>;

  // Group matches by round
  const rounds = Array.from(new Set(matches.map(m => m.round))).sort((a, b) => a - b);

  return (
    <DashboardLayout title={`Manage: ${tournament.name}`}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary font-bold mb-6 hover:underline">
        <ArrowLeft size={20} /> Back
      </button>

      <div className="space-y-8 pb-20">
        {/* Header Section */}
        <section className="card-premium p-8 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <StatusBadge status={tournament.status} />
              <h3 className="text-3xl font-bold text-text-emphasis mt-2">{tournament.name}</h3>
            </div>
            <div className="text-right">
              <p className="text-sm text-text font-bold uppercase tracking-widest">Confirmed Players</p>
              <p className="text-2xl font-bold text-primary">{tournament.confirmedPlayers.length} / {tournament.maxPlayers}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 border-t border-base2 pt-6">
            <div className="flex items-center gap-2 text-text font-bold">
              <Clock size={18} className="text-primary" />
              <span>{new Date(tournament.startDate || tournament.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-text font-bold">
              <MapPin size={18} className="text-violet" />
              <span>{tournament.venue || 'TBD'}</span>
            </div>
            <div className="flex items-center gap-2 text-text font-bold capitalize">
              <Trophy size={18} className="text-yellow" />
              <span>{tournament.format.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-8 flex flex-wrap gap-4">
            {tournament.status === 'draft' && (
              <button onClick={handlePublish} disabled={actionLoading} className="bg-primary text-base3 px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
                <CheckCircle size={20} /> Publish Tournament
              </button>
            )}
            {tournament.status === 'open_for_players' && tournament.confirmedPlayers.length >= tournament.minPlayers && (
              <button onClick={handleStart} disabled={actionLoading} className="bg-green text-base3 px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
                <Play size={20} /> Start & Generate Bracket
              </button>
            )}
            {tournament.status === 'completed' && (
              <div className="p-4 bg-yellow/10 border border-yellow/20 rounded-xl flex items-center gap-3 text-yellow-700">
                 <Trophy size={24} className="text-yellow" />
                 <div>
                    <p className="text-xs font-bold uppercase">Tournament Winner</p>
                    <p className="text-lg font-bold">{tournament.winner?.fullName || 'N/A'}</p>
                 </div>
              </div>
            )}
          </div>
        </section>

        {/* Bracket Logic / Match Progression */}
        {(tournament.status === 'ongoing' || tournament.status === 'completed') && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-xl font-bold flex items-center gap-2">
                  <Target size={24} className="text-primary" />
                  Tournament Bracket
               </h3>
               <div className="text-xs font-bold text-text bg-base2 px-3 py-1 rounded-full">
                  Click on a player to set them as the winner
               </div>
            </div>

            <div className="flex gap-8 overflow-x-auto pb-8 min-h-[400px]">
              {rounds.map(roundNum => (
                <div key={roundNum} className="flex-shrink-0 w-80 space-y-8">
                  <div className="text-center font-bold text-text uppercase tracking-widest text-sm py-2 bg-base3 border border-base2 rounded-lg">
                    {roundNum === rounds.length ? 'Final' : `Round ${roundNum}`}
                  </div>
                  <div className="space-y-12">
                    {matches.filter(m => m.round === roundNum).map(match => (
                      <div key={match._id} className="relative group">
                        <div className={`card-premium p-0 rounded-xl overflow-hidden border-2 transition-all ${
                          match.status === 'ongoing' ? 'border-primary ring-4 ring-primary/5 shadow-xl' : 'border-base2'
                        }`}>
                          {/* Player 1 */}
                          <button
                            disabled={match.status !== 'ongoing' || actionLoading}
                            onClick={() => handleSetWinner(match._id, match.player1Id?._id)}
                            className={`w-full p-4 flex items-center justify-between group/p1 transition-colors ${
                              match.winnerId?._id === match.player1Id?._id ? 'bg-green/10' : 'hover:bg-base2/30'
                            }`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                match.winnerId?._id === match.player1Id?._id ? 'bg-green text-base3' : 'bg-base2 text-text'
                              }`}>
                                {match.player1Id?.fullName[0] || '?'}
                              </div>
                              <span className={`text-sm font-bold truncate ${match.winnerId?._id === match.player1Id?._id ? 'text-green-700' : 'text-text-emphasis'}`}>
                                {match.player1Id?.fullName || 'TBD'}
                              </span>
                            </div>
                            {match.winnerId?._id === match.player1Id?._id && <CheckCircle size={16} className="text-green" />}
                          </button>

                          <div className="border-t border-base2"></div>

                          {/* Player 2 */}
                          <button
                            disabled={match.status !== 'ongoing' || actionLoading}
                            onClick={() => handleSetWinner(match._id, match.player2Id?._id)}
                            className={`w-full p-4 flex items-center justify-between group/p2 transition-colors ${
                              match.winnerId?._id === match.player2Id?._id ? 'bg-green/10' : 'hover:bg-base2/30'
                            }`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                match.winnerId?._id === match.player2Id?._id ? 'bg-green text-base3' : 'bg-base2 text-text'
                              }`}>
                                {match.player2Id?.fullName[0] || '?'}
                              </div>
                              <span className={`text-sm font-bold truncate ${match.winnerId?._id === match.player2Id?._id ? 'text-green-700' : 'text-text-emphasis'}`}>
                                {match.player2Id?.fullName || 'TBD'}
                              </span>
                            </div>
                            {match.winnerId?._id === match.player2Id?._id && <CheckCircle size={16} className="text-green" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                   {availablePlayers.filter(p => !tournament.confirmedPlayers.some(cp => cp._id === p._id)).map(p => (
                     <div key={p._id} className="flex items-center justify-between p-3 bg-base2/30 rounded-xl hover:bg-base2/50 transition-colors">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-violet/10 text-violet flex items-center justify-center text-xs font-bold">
                              {p.fullName[0]}
                           </div>
                           <span className="text-sm font-bold text-text-emphasis">{p.fullName}</span>
                        </div>
                        <button 
                          onClick={() => handleInvite(p._id)}
                          disabled={tournament.invitedPlayers.some(ip => ip._id === p._id)}
                          className="text-primary disabled:opacity-30 hover:scale-110 transition-transform"
                        >
                           <UserPlus size={18} />
                        </button>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TournamentManage;

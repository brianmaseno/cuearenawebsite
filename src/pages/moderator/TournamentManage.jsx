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
  X
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const TournamentManage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedMatchForSets, setSelectedMatchForSets] = useState(null);
  const [activeSetInModal, setActiveSetInModal] = useState(0);
  const [selectingWinnerForSetInModal, setSelectingWinnerForSetInModal] = useState(null);

  const fetchTournamentData = async () => {
    try {
      const [{ data: tourney }, { data: players }] = await Promise.all([
        api.get(`/tournaments/${id}`),
        api.get('/users/players')
      ]);
      setTournament(tourney);
      setAvailablePlayers(players);
    } catch (err) {
      toast.error('Failed to load tournament data');
      navigate('/moderator/ongoing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournamentData();
  }, [id]);

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

  const handleStartTournament = async () => {
    if (tournament.confirmedPlayers.length < 2) {
      return toast.error('Need at least 2 confirmed players to start');
    }
    setActionLoading(true);
    try {
      await api.post(`/tournaments/${id}/start`);
      toast.success('Tournament started! Brackets generated.');
      fetchTournamentData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start tournament');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordTournamentSetWinner = async (matchId, setIndex, winnerId) => {
    try {
      const { data: updatedMatch } = await api.post(`/tournaments/matches/${matchId}/sets`, {
        setIndex,
        winnerId
      });
      
      // Update local state for the match modal
      setSelectedMatchForSets(updatedMatch);
      setSelectingWinnerForSetInModal(null);
      setActiveSetInModal(setIndex); // Stay on the set that was just played or move forward?
      
      // Refresh total tournament data to update brackets/standings
      fetchTournamentData();
      toast.success('Set result recorded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record set winner');
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
              <StatusBadge status={tournament.status} />
              <div className="flex items-center gap-2 text-text/40 text-xs font-bold uppercase tracking-widest">
                <Calendar size={14} />
                Created {new Date(tournament.createdAt).toLocaleDateString()}
              </div>
            </div>
            <h2 className="text-3xl font-black text-text-emphasis tracking-tight">{tournament.name}</h2>
          </div>

          <div className="flex items-center gap-3">
             {tournament.status === 'scheduled' && (
                <button
                  onClick={handleStartTournament}
                  disabled={actionLoading}
                  className="bg-primary hover:bg-primary-dark text-base3 px-8 py-3 rounded-2xl font-black shadow-lg shadow-primary/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                   <Zap size={20} fill="currentColor" />
                   Start Tournament
                </button>
             )}
          </div>
        </div>

        {/* Brackets Section - Only if ongoing/completed */}
        {(tournament.status === 'ongoing' || tournament.status === 'completed') && (
          <section className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                   <Target size={24} className="text-primary" />
                   Tournament Brackets
                </h3>
             </div>
             
             {/* Simple List of Matches per Round */}
             <div className="space-y-8">
                {tournament.matches && [...new Set(tournament.matches.map(m => m.round))].sort((a,b) => a-b).map(roundNum => (
                  <div key={roundNum} className="space-y-4">
                     <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-base2"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text/30">Round {roundNum}</span>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-base2"></div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tournament.matches.filter(m => m.round === roundNum).map(match => (
                          <div 
                            key={match._id} 
                            onClick={() => setSelectedMatchForSets(match)}
                            className="card-premium p-6 rounded-2xl cursor-pointer hover:ring-2 ring-primary/20 transition-all flex flex-col gap-4 border-none shadow-sm"
                          >
                             <div className="flex justify-between items-center bg-base2/20 -mx-6 -mt-6 p-4 border-b border-base2">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                   match.status === 'completed' ? 'bg-green/10 text-green' : 'bg-primary/10 text-primary'
                                }`}>
                                   {match.status}
                                </span>
                                <ChevronRight size={14} className="text-text/20" />
                             </div>
                             
                             <div className="flex flex-col gap-3 mt-2">
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                         match.winnerId === match.player1Id?._id ? 'bg-primary text-base3' : 'bg-base2/40 text-text/40'
                                      }`}>
                                         {match.player1Id?.fullName[0]}
                                      </div>
                                      <span className={`text-sm font-bold truncate max-w-[120px] ${
                                         match.winnerId === match.player1Id?._id ? 'text-primary' : 'text-text'
                                      }`}>
                                         {match.player1Id?.fullName}
                                      </span>
                                   </div>
                                   <span className="text-lg font-black">{match.scorePlayer1}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                         match.winnerId === match.player2Id?._id ? 'bg-violet text-base3' : 'bg-base2/40 text-text/40'
                                      }`}>
                                         {match.player2Id?.fullName[0]}
                                      </div>
                                      <span className={`text-sm font-bold truncate max-w-[120px] ${
                                         match.winnerId === match.player2Id?._id ? 'text-violet' : 'text-text'
                                      }`}>
                                         {match.player2Id?.fullName}
                                      </span>
                                   </div>
                                   <span className="text-lg font-black">{match.scorePlayer2}</span>
                                </div>
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

      {/* Match Console Modal */}
      {selectedMatchForSets && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-base1/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-base3 w-full max-w-2xl rounded-[40px] shadow-2xl border border-base2 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-base2 flex justify-between items-center bg-base2/10">
                  <div className="flex items-center gap-4">
                     <img src="/favicon.png" alt="7 Ball" className="w-10 h-10 drop-shadow-md" />
                     <div>
                        <h3 className="text-2xl font-black text-text-emphasis tracking-tight">Cue Arena</h3>
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-1">Tournament System Engine</p>
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
                       <p className="text-lg font-black text-text-emphasis">{selectedMatchForSets.player1Id?.fullName}</p>
                       <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-1 mb-2">
                          Won: {selectedMatchForSets.setsResults?.filter(s => s.winnerId === selectedMatchForSets.player1Id?._id).length || 0} / {selectedMatchForSets.setsCount}
                       </p>
                       <p className="text-3xl font-black text-primary mt-2">{selectedMatchForSets.scorePlayer1}</p>
                    </div>
                    <div className="px-6 flex flex-col items-center gap-2">
                        <div className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/80 text-center leading-tight mb-2 drop-shadow-sm">
                           {tournament.name} • Match
                        </div>
                        <div className="text-sm font-black italic text-text/20">VS</div>
                    </div>
                    <div className="text-center flex-1">
                       <p className="text-lg font-black text-text-emphasis">{selectedMatchForSets.player2Id?.fullName}</p>
                       <p className="text-[10px] font-black uppercase text-violet tracking-widest mt-1 mb-2">
                          Won: {selectedMatchForSets.setsResults?.filter(s => s.winnerId === selectedMatchForSets.player2Id?._id).length || 0} / {selectedMatchForSets.setsCount}
                       </p>
                       <p className="text-3xl font-black text-violet mt-2">{selectedMatchForSets.scorePlayer2}</p>
                    </div>
                 </div>

                 {/* Set Tabs Container */}
                 <div className="flex flex-wrap gap-4 justify-center relative">
                    {Array.from({ length: selectedMatchForSets.setsCount || 1 }).map((_, idx) => {
                       const sRes = selectedMatchForSets.setsResults?.find(s => s.setIndex === idx);
                       
                       // Find the first unplayed set index
                       let firstUnplayed = 0;
                       for (let i = 0; i < selectedMatchForSets.setsCount; i++) {
                          if (!selectedMatchForSets.setsResults?.find(s => s.setIndex === i)) {
                             firstUnplayed = i;
                             break;
                          }
                       }

                       const isActive = activeSetInModal === idx;
                       const isLocked = idx > firstUnplayed;
                       
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
                          <div key={idx}>
                             <button
                               disabled={isLocked && selectedMatchForSets.status !== 'completed'}
                               onClick={() => {
                                  if (!isLocked && !sRes && selectedMatchForSets.status !== 'completed') {
                                     setSelectingWinnerForSetInModal(idx);
                                  } else {
                                     setActiveSetInModal(idx);
                                     setSelectingWinnerForSetInModal(null);
                                  }
                               }}
                               className={`min-w-[120px] h-[64px] px-6 rounded-[28px] font-black text-[10px] uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1 border-2 ${
                                 isActive 
                                    ? 'bg-base3 border-primary shadow-xl shadow-primary/10' 
                                    : (sRes ? 'bg-base2/20 border-base2/30 opacity-60 hover:opacity-100' : 'bg-base2/10 border-transparent')
                               } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                             >
                                <span className={`text-sm font-black ${winnerColor || (isActive ? 'text-primary' : 'text-text/30')}`}>
                                   {tabLabel}
                                 </span>
                             </button>
                          </div>
                       );
                    })}

                    {/* Centered Overlay for Winner Selection */}
                    {selectingWinnerForSetInModal !== null && (
                       <div className="absolute inset-x-0 inset-y-[-8px] flex justify-center z-50">
                          <div className="w-[420px] bg-base3 border-2 border-primary rounded-[32px] shadow-2xl flex items-center p-2 gap-3 animate-in zoom-in-95 duration-200">
                             <div className="px-4 py-2 bg-primary/10 rounded-2xl flex flex-col items-center justify-center min-w-[80px]">
                                <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Set {selectingWinnerForSetInModal + 1}</span>
                             </div>
                             <div className="flex-1 flex gap-2">
                                <button 
                                  onClick={() => handleRecordTournamentSetWinner(selectedMatchForSets._id, selectingWinnerForSetInModal, selectedMatchForSets.player1Id?._id)}
                                  className="flex-1 py-3 bg-primary/5 hover:bg-primary text-primary hover:text-base3 rounded-2xl text-[11px] font-black transition-all flex flex-col items-center justify-center gap-0.5 border border-primary/10"
                                >
                                   {selectedMatchForSets.player1Id?.fullName}
                                </button>
                                <button 
                                  onClick={() => handleRecordTournamentSetWinner(selectedMatchForSets._id, selectingWinnerForSetInModal, selectedMatchForSets.player2Id?._id)}
                                  className="flex-1 py-3 bg-violet/5 hover:bg-violet text-violet hover:text-base3 rounded-2xl text-[11px] font-black transition-all flex flex-col items-center justify-center gap-0.5 border border-violet/10"
                                >
                                   {selectedMatchForSets.player2Id?.fullName}
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
                       <h4 className="text-2xl font-black text-text-emphasis italic tracking-tight">MATCH CONCLUDED</h4>
                       <p className="text-sm font-bold text-green-700 mt-2 uppercase tracking-widest">Victor: {selectedMatchForSets.winnerId?.fullName}</p>
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

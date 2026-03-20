import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Trophy, Users, UserPlus, Play, CheckCircle, Clock, MapPin, Loader2, ArrowLeft, ChevronRight, User, Target, X } from 'lucide-react';
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
  const [selectedMatchForSets, setSelectedMatchForSets] = useState(null);
  const [activeSetInModal, setActiveSetInModal] = useState(0);
  const [selectingWinnerForSetInModal, setSelectingWinnerForSetInModal] = useState(null);

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

  const handleRecordTournamentSetWinner = async (matchId, setIndex, winnerId) => {
    setActionLoading(true);
    try {
      const targetSetIdx = selectingWinnerForSetInModal !== null ? selectingWinnerForSetInModal : setIndex;
      const { data } = await api.put(`/tournaments/matches/${matchId}/set-winner`, { setIndex: targetSetIdx, winnerId });
      toast.success(`Set ${targetSetIdx + 1} recorded!`);
      
      setSelectedMatchForSets(data);
      
      // Auto-advance
      if (targetSetIdx + 1 < data.setsCount && !data.winnerId) {
        setActiveSetInModal(targetSetIdx + 1);
      }
      
      setSelectingWinnerForSetInModal(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to record set winner');
    } finally {
      setActionLoading(false);
    }
  };

  const openMatchConsole = (match) => {
    setSelectedMatchForSets(match);
    setSelectingWinnerForSetInModal(null);
    
    // Determine active set (first unplayed)
    let firstUnplayed = 0;
    for (let i = 0; i < match.setsCount; i++) {
        if (!match.setsResults.find(s => s.setIndex === i)) {
            firstUnplayed = i;
            break;
        }
    }
    setActiveSetInModal(firstUnplayed);
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
                          {/* Match Header (Sets Info) */}
                          <div className="bg-base2/10 px-4 py-2 flex justify-between items-center border-b border-base2">
                             <span className="text-[9px] font-black text-text/40 uppercase tracking-widest">
                                {match.setsCount > 1 ? `${match.setsCount} Sets` : 'Single Match'}
                             </span>
                             {match.status === 'ongoing' && match.setsCount > 1 && (
                                <button 
                                  onClick={() => openMatchConsole(match)}
                                  className="text-[9px] font-black text-primary uppercase hover:underline"
                                >
                                   Manage Sets
                                </button>
                             )}
                          </div>

                          {/* Player 1 */}
                          <button
                            disabled={(match.status !== 'ongoing' && match.status !== 'completed') || actionLoading}
                            onClick={() => {
                               if (match.setsCount > 1) openMatchConsole(match);
                               else handleSetWinner(match._id, match.player1Id?._id);
                            }}
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
                            <div className="flex items-center gap-2">
                               {match.setsCount > 1 && <span className="text-lg font-black tabular-nums">{match.scorePlayer1}</span>}
                               {match.winnerId?._id === match.player1Id?._id && <CheckCircle size={16} className="text-green" />}
                            </div>
                          </button>

                          <div className="border-t border-base2"></div>

                          {/* Player 2 */}
                          <button
                            disabled={(match.status !== 'ongoing' && match.status !== 'completed') || actionLoading}
                            onClick={() => {
                               if (match.setsCount > 1) openMatchConsole(match);
                               else handleSetWinner(match._id, match.player2Id?._id);
                            }}
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
                            <div className="flex items-center gap-2">
                               {match.setsCount > 1 && <span className="text-lg font-black tabular-nums">{match.scorePlayer2}</span>}
                               {match.winnerId?._id === match.player2Id?._id && <CheckCircle size={16} className="text-green" />}
                            </div>
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

      {/* Match Console Modal */}
      {selectedMatchForSets && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-base1/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-base3 w-full max-w-2xl rounded-[40px] shadow-2xl border border-base2 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-base2 flex justify-between items-center bg-base2/10">
                 <div>
                    <h3 className="text-2xl font-black text-text-emphasis tracking-tight">Match Console</h3>
                    <p className="text-[10px] font-black uppercase text-text/40 tracking-widest mt-1">Tournament System Engine</p>
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
                       <p className="text-lg font-black text-text-emphasis ">{selectedMatchForSets.player1Id?.fullName}</p>
                       <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-1 mb-2">
                          Won: {selectedMatchForSets.setsResults?.filter(s => s.winnerId === selectedMatchForSets.player1Id?._id).length || 0} / {selectedMatchForSets.setsCount}
                       </p>
                       <p className="text-3xl font-black text-primary mt-2">{selectedMatchForSets.scorePlayer1}</p>
                    </div>
                    <div className="px-6 text-sm font-black italic text-text/20">VS</div>
                    <div className="text-center flex-1">
                       <p className="text-lg font-black text-text-emphasis ">{selectedMatchForSets.player2Id?.fullName}</p>
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

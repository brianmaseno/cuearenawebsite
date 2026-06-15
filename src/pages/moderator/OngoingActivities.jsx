import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Trophy, Target, Clock, Users, ChevronRight, Loader2, CheckCircle2, Trash2, Award, X, Shield, Play, MapPin, AlertCircle, Pencil, UserPlus, Search, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import QuickStatsBar from '../../components/QuickStatsBar';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import { winnerPrize } from '../../utils/potSplit';


const OngoingActivities = () => {
  const [data, setData] = useState({ tournaments: [], matches: [], battles: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeSetMap, setActiveSetMap] = useState({});
  const [selectingWinnerForSetMap, setSelectingWinnerForSetMap] = useState({});
  const [expandedBattles, setExpandedBattles] = useState({});
  const [tables, setTables] = useState([]);
  const [showTableModal, setShowTableModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null); // { id, type }
  const [selectedTableId, setSelectedTableId] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [inviteTarget, setInviteTarget] = useState(null);
  const [inviteSearch, setInviteSearch] = useState('');
  const [inviteResults, setInviteResults] = useState([]);
  const [selectedInvitePlayers, setSelectedInvitePlayers] = useState([]);
  const { socket, joinMatchRoom, leaveMatchRoom, joinTournamentRoom, leaveTournamentRoom } = useSocket();

  const getBattleParticipantStatus = (participant) => participant?.BattleParticipants?.status || participant?.status || 'pending';
  const getBattleParticipantId = (participant) => participant?.id || participant?.userId?.id || participant?.userId;
  const getBattleParticipantName = (participant) => participant?.fullName || participant?.userId?.fullName || 'Player';
  const getBattleParticipantPhoto = (participant) => participant?.profilePhoto || participant?.userId?.profilePhoto;


  const fetchOngoing = async () => {
    try {
      const { data } = await api.get('/moderator/ongoing');
      setData({
        tournaments: data.tournaments || [],
        matches: data.matches || [],
        battles: data.battles || []
      });
    } catch (err) {
      toast.error('Failed to load ongoing activities');
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const { data } = await api.get('/users/me/tables');
      setTables(data || []);
    } catch (err) {
      console.error('Failed to fetch tables');
    }
  };

  useEffect(() => {
    fetchOngoing();
    fetchTables();
  }, []);

  useEffect(() => {
    const searchPlayers = async () => {
      if (!inviteTarget || inviteSearch.trim().length < 2) {
        setInviteResults([]);
        return;
      }

      try {
        const { data } = await api.get(`/users/players?search=${encodeURIComponent(inviteSearch.trim())}`);
        const existingIds = new Set((inviteTarget.existingIds || []).map((id) => id?.toString()));
        const selectedIds = new Set(selectedInvitePlayers.map((player) => player.id.toString()));
        setInviteResults((data || []).filter((player) => !existingIds.has(player.id.toString()) && !selectedIds.has(player.id.toString())));
      } catch (err) {
        setInviteResults([]);
      }
    };

    const timer = setTimeout(searchPlayers, 250);
    return () => clearTimeout(timer);
  }, [inviteSearch, inviteTarget, selectedInvitePlayers]);


  // Real-time updates with room joining
  useEffect(() => {
    if (!socket || !data.matches.length) return;

    // Join rooms for all matches and tournaments
    data.matches.forEach(match => {
      joinMatchRoom(match.id);
      if (match.tournamentId) {
        joinTournamentRoom(match.tournamentId.id || match.tournamentId);
      }
    });

    const handleMatchUpdate = (update) => {
      console.log('Real-time MATCH_UPDATE:', update);
      // Refresh all data to ensure enriched status fields are correct
      fetchOngoing();
    };

    const handleTournamentUpdate = (update) => {
      console.log('Real-time TOURNAMENT_UPDATE:', update);
      fetchOngoing();
    };

    socket.on('MATCH_UPDATE', handleMatchUpdate);
    socket.on('TOURNAMENT_UPDATE', handleTournamentUpdate);
    socket.on('ONGOING_UPDATES', fetchOngoing); 

    return () => {
      data.matches.forEach(match => {
        leaveMatchRoom(match.id);
        if (match.tournamentId) {
          leaveTournamentRoom(match.tournamentId.id || match.tournamentId);
        }
      });
      socket.off('MATCH_UPDATE', handleMatchUpdate);
      socket.off('TOURNAMENT_UPDATE', handleTournamentUpdate);
      socket.off('ONGOING_UPDATES', fetchOngoing);
    };
  }, [socket, data.matches.length, data.tournaments.length]); 


  const handleSetWinner = async (matchId, player) => {
    if (!window.confirm(`Set ${player.fullName} as the winner? This will complete the match and move it to history.`)) return;

    setActionLoading(true);
    try {
      await api.put(`/direct-matches/${matchId}/winner`, { winnerId: player.id });
      toast.success('Winner recorded! Match completed.');
      fetchOngoing();
    } catch (err) {
      toast.error('Failed to set winner');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelMatch = async (matchId) => {
    if (!window.confirm('Are you sure you want to cancel this match? This action cannot be undone.')) return;

    setActionLoading(true);
    try {
      console.log('Cancelling match:', matchId);
      await api.put(`/direct-matches/${matchId}/cancel`);
      toast.success('Match cancelled.');
      fetchOngoing();
    } catch (err) {
      toast.error('Failed to cancel match');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordSetWinner = async (match, setIndex, winnerId) => {
    setActionLoading(true);
    try {
      const targetSetIdx = selectingWinnerForSetMap[match.id] !== undefined ? selectingWinnerForSetMap[match.id] : setIndex;

      const endpoint = match.isTournamentMatch
        ? `/tournaments/matches/${match.id}/set-winner`
        : `/direct-matches/${match.id}/set-winner`;

      await api.put(endpoint, { setIndex: targetSetIdx, winnerId });
      toast.success(`Set ${targetSetIdx + 1} recorded!`);

      // Auto-advance to next set if not finished
      // For tournament matches, the backend handles winner logic and progression
      if (!match.isTournamentMatch && targetSetIdx + 1 < match.setsCount && !match.winnerId) {
        setActiveSetMap(prev => ({ ...prev, [match.id]: targetSetIdx + 1 }));
      }

      setSelectingWinnerForSetMap(prev => {
        const next = { ...prev };
        delete next[match.id];
        return next;
      });
      fetchOngoing();
    } catch (err) {
      toast.error('Failed to record set winner');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartBattle = async (battleId) => {
    if (tables.length > 0) {
      setSelectedActivity({ id: battleId, type: 'battle' });
      setShowTableModal(true);
      return;
    }

    if (!window.confirm('Start this battle? This will cancel all remaining pending invitations.')) return;
    setActionLoading(true);
    try {
      await api.put(`/battles/${battleId}/start`);
      toast.success('Battle started!');
      fetchOngoing();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start battle');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartMatch = async (match, isTournament = false) => {
    console.log('handleStartMatch triggered for:', match.id, 'isTournament:', isTournament);
    setSelectedActivity({ id: match.id, type: isTournament ? 'tournament_match' : 'match' });
    setShowTableModal(true);
    return;
  };

  const confirmStartWithTable = async () => {
    if (!selectedActivity) return;

    setActionLoading(true);
    try {
      let endpoint = '';
      if (selectedActivity.type === 'battle') {
        endpoint = `/battles/${selectedActivity.id}/start`;
      } else if (selectedActivity.type === 'tournament_match') {
        endpoint = `/tournaments/matches/${selectedActivity.id}/start`;
      } else {
        endpoint = `/direct-matches/${selectedActivity.id}/start`;
      }

      await api.put(endpoint, { poolTableId: selectedTableId || undefined });
      const activityLabel = selectedActivity.type === 'battle' ? 'Battle' : 'Match';
      toast.success(`${activityLabel} started! Table Unlocked successfully 🎱`, { icon: '🔓', duration: 4000 });
      setShowTableModal(false);
      setSelectedActivity(null);
      setSelectedTableId('');
      fetchOngoing();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start activity');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordBattleWinner = async (battleId, winnerId, winnerName) => {
    if (!window.confirm(`Confirm ${winnerName} as the winner of this battle?`)) return;
    setActionLoading(true);
    try {
      await api.put(`/battles/${battleId}/result`, { winnerId });
      toast.success('Battle result recorded!');
      fetchOngoing();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record winner');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBattle = async (battleId) => {
    if (!window.confirm('Cancel this battle? All accepted stakes will be refunded.')) return;
    setActionLoading(true);
    try {
      await api.put(`/battles/${battleId}/cancel`);
      toast.success('Battle cancelled.');
      fetchOngoing();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel battle');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (type, item) => {
    setEditingItem({ type, id: item.id });
    if (type === 'tournament') {
      setEditForm({
        name: item.name || '',
        venue: item.venue || '',
        location: item.location || '',
        stakePerPlayer: item.stakePerPlayer || 0,
        maxPlayers: item.maxPlayers || 2,
        minPlayers: item.minPlayers || 2,
        startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0, 16) : ''
      });
    } else {
      setEditForm({
        title: item.title || '',
        venue: item.venue || '',
        location: item.location || '',
        stakeAmount: item.stakeAmount || 0,
        scheduledAt: item.scheduledAt ? new Date(item.scheduledAt).toISOString().slice(0, 16) : ''
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    setActionLoading(true);
    try {
      const payload = { ...editForm };
      if (payload.startDate) payload.startDate = new Date(payload.startDate).toISOString();
      if (payload.scheduledAt) payload.scheduledAt = new Date(payload.scheduledAt).toISOString();

      const endpoint = editingItem.type === 'tournament'
        ? `/tournaments/${editingItem.id}`
        : `/battles/${editingItem.id}`;
      await api.put(endpoint, payload);
      toast.success(`${editingItem.type === 'tournament' ? 'Tournament' : 'Battle'} updated.`);
      setEditingItem(null);
      setEditForm({});
      fetchOngoing();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update activity');
    } finally {
      setActionLoading(false);
    }
  };

  const openInviteModal = (type, item) => {
    const existingIds = type === 'tournament'
      ? (item.confirmedPlayers || []).map((player) => player.id)
      : (item.participants || []).map(getBattleParticipantId);
    setInviteTarget({ type, id: item.id, title: item.name || item.title, existingIds });
    setInviteSearch('');
    setInviteResults([]);
    setSelectedInvitePlayers([]);
  };

  const handleInviteSubmit = async () => {
    if (!inviteTarget || selectedInvitePlayers.length === 0) return;
    setActionLoading(true);
    try {
      const ids = selectedInvitePlayers.map((player) => player.id);
      if (inviteTarget.type === 'tournament') {
        await api.post(`/tournaments/${inviteTarget.id}/invite-bulk`, { playerIds: ids });
      } else {
        await api.post(`/battles/${inviteTarget.id}/invite`, { playerIds: ids });
      }
      toast.success(`Sent ${ids.length} invitation${ids.length === 1 ? '' : 's'}.`);
      setInviteTarget(null);
      setSelectedInvitePlayers([]);
      fetchOngoing();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invitations');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTournament = async (tournamentId) => {
    if (!window.confirm('Delete this tournament? Active tournaments will be safely cancelled and stakes refunded.')) return;
    setActionLoading(true);
    try {
      await api.delete(`/tournaments/${tournamentId}`);
      toast.success('Tournament deleted.');
      fetchOngoing();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete tournament');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBattle = async (battleId) => {
    if (!window.confirm('Delete this battle? Active battles will be safely cancelled and stakes refunded.')) return;
    setActionLoading(true);
    try {
      await api.delete(`/battles/${battleId}`);
      toast.success('Battle deleted.');
      fetchOngoing();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete battle');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Active Activities">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Active Activities">
      <div className="space-y-10 pb-20 max-w-[1600px] mx-auto px-4 md:px-8 bg-background min-h-screen" style={{ fontFamily: "'Outfit', sans-serif" }}>
        {/* Header Section */}
        <div className="pt-8">
          <h1 className="text-4xl md:text-5xl font-black text-text-emphasis tracking-tight mb-2">
            Active <span className="text-primary">Activities</span>
          </h1>
          <p className="text-text/60 font-medium">Manage and moderate ongoing games in real-time.</p>
        </div>

        <QuickStatsBar />
        {/* Tabs */}
        <div className="flex items-center p-1 bg-surface backdrop-blur-xl rounded-2xl border border-base2 shadow-sm w-full sm:w-fit overflow-x-auto no-scrollbar">
          {[
            { id: 'matches', label: 'Matches', count: data.matches.length, icon: Target, color: 'bg-blue-500', shadow: 'shadow-blue-500/40' },
            { id: 'tournaments', label: 'Tournaments', count: data.tournaments.length, icon: Trophy, color: 'bg-amber-500', shadow: 'shadow-amber-500/40' },
            { id: 'battles', label: 'Battles', count: data.battles.length, icon: Shield, color: 'bg-emerald-600', shadow: 'shadow-emerald-600/40' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 md:flex-none px-3 sm:px-8 py-3 md:py-3.5 text-[10px] sm:text-[12px] font-black uppercase tracking-wider md:tracking-[0.15em] rounded-[18px] md:rounded-[22px] transition-all duration-500 flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === tab.id
                  ? `${tab.color} text-base3 shadow-lg ${tab.shadow} scale-[1.02]`
                  : 'text-text/60 hover:text-primary hover:bg-base2/50'
                }`}
            >
              <tab.icon size={14} className="sm:w-4 sm:h-4" />
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {activeTab === 'matches' ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            {data.matches.length === 0 ? (
              <div className="col-span-full card-premium p-12 text-center text-text italic">
                No active matches found.
              </div>
            ) : (
              data.matches.map((match) => {
                let defaultActive = 0;
                if (match.setsResults && match.status !== 'completed') {
                  for (let i = 0; i < (match.setsCount || 1); i++) {
                    if (!match.setsResults.find(s => s.setIndex === i)) {
                      defaultActive = i;
                      break;
                    }
                  }
                }
                const currentActiveSet = activeSetMap[match.id] !== undefined ? activeSetMap[match.id] : defaultActive;
                const setRes = match.setsResults?.find(s => s.setIndex === currentActiveSet);
                const isMatchFinished = match.status === 'completed';
                const isOngoing = match.status === 'ongoing';
                const isConfirmed = match.status === 'confirmed';
                const selectingSetIdx = selectingWinnerForSetMap[match.id];

                return (
                  <div id={`match-${match.id}`} key={match.id} className="card-premium p-0 rounded-2xl overflow-visible group border border-base2 bg-surface shadow-sm transition-all hover:border-primary/30 hover:shadow-lg">
                    <div className="bg-base2/5 p-3 flex flex-wrap md:flex-nowrap gap-2 justify-between items-center border-b border-base2/50 preserve-3d overflow-hidden">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {match.isTournamentMatch ? (
                          <div className="w-6 h-6 bg-primary/10 flex items-center justify-center text-primary rounded shadow-sm shrink-0">
                            <Trophy size={12} />
                          </div>
                        ) : (
                          <img src="/favicon.png" alt="7 Ball" className="w-5 h-5 shrink-0 drop-shadow-sm" />
                        )}
                        <h3 className="text-[clamp(10px,1.1vw,13px)] font-black uppercase tracking-tighter text-text-emphasis truncate min-w-0 drop-shadow-sm">
                          {match.isTournamentMatch ? (match.tournamentId?.name || 'Tournament') : 'Cue Tournament'}
                        </h3>
                      </div>
                      <div className="flex flex-wrap md:flex-nowrap items-center gap-1.5 justify-end shrink-0">
                        {match.stakeAmount > 0 && !match.isTournamentMatch && (
                          <span className="text-[clamp(7.5px,0.85vw,9.5px)] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border-[1.5px] border-emerald-100 flex items-center gap-1 shrink-0 whitespace-nowrap drop-shadow-sm">
                            <Award size={10} className="text-emerald-500" />
                            PRIZE: KES {winnerPrize(match.stakeAmount * 2, match.moderatorFee).toLocaleString()}
                          </span>
                        )}
                        {match.isTournamentMatch && match.tournamentId?.stakePerPlayer > 0 && (
                          <span className="text-[clamp(7.5px,0.85vw,9.5px)] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border-[1.5px] border-emerald-100 flex items-center gap-1 shrink-0 whitespace-nowrap drop-shadow-sm">
                            <Award size={10} className="text-emerald-500" />
                            PRIZE: KES {winnerPrize((match.tournamentId.stakePerPlayer * (match.tournamentId.confirmedPlayers?.length || match.tournamentId.maxPlayers)), match.tournamentId.moderatorFee).toLocaleString()}
                          </span>
                        )}
                        <div className="flex items-center gap-1 shrink-0">
                          {match.status === 'cancelled' && match.declinedBy ? (
                            <span className="text-[clamp(7.5px,0.85vw,9.5px)] font-black uppercase text-red px-1.5 py-0.5 bg-red/10 rounded-md border-[1.5px] border-red/20 animate-pulse truncate max-w-[120px] sm:max-w-[200px] shrink-0 drop-shadow-sm">
                              {match.declinedBy.fullName} Declined
                            </span>
                          ) : (
                            <StatusBadge status={match.status} className="text-[clamp(7.5px,0.85vw,9.5px)]" />
                          )}
                          <button
                            disabled={actionLoading}
                            onClick={() => handleCancelMatch(match.id)}
                            className="p-1.5 text-red hover:bg-red/10 rounded-lg transition-colors relative z-50 overflow-visible"
                            title="Cancel Match"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2 relative">
                        {/* Player 1 */}
                        <div
                          className="flex-1 flex-col items-center gap-2 transition-transform flex"
                        >
                          <div className="relative">
                            {match.player1Id ? (
                              <>
                                <img
                                  src={match.player1Id.profilePhoto || `https://ui-avatars.com/api/?name=${match.player1Id.fullName}&background=random`}
                                  alt={match.player1Id.fullName}
                                  className={`w-14 h-14 rounded-2xl object-cover ring-2 shadow-md transition-all ${(match.winnerId?.id || match.winnerId)?.toString() === (match.player1Id?.id || match.player1Id)?.toString() ? 'ring-green scale-105' :
                                    ((setRes?.winnerId?.id || setRes?.winnerId)?.toString() === (match.player1Id?.id || match.player1Id)?.toString() ? 'ring-primary border-4 border-primary/20' : 'ring-base3')
                                    }`}
                                />
                                {!isMatchFinished && setRes && (
                                  <div className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center border shadow-sm transition-all ${(setRes.winnerId?.id || setRes.winnerId)?.toString() === (match.player1Id.id || match.player1Id)?.toString() ? 'bg-primary text-base3 border-primary' : 'bg-base3 text-text/20 border-base2'
                                    }`}>
                                    <CheckCircle2 size={12} />
                                  </div>
                                )}
                                <div className={`absolute -bottom-1 -right-1 p-1 rounded-full shadow-sm ${match.player1Status === 'accepted' ? 'bg-green text-base3' : 'bg-yellow text-base3'
                                  }`}>
                                  {match.player1Status === 'accepted' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                </div>
                              </>
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-base2/50 flex items-center justify-center border-[3px] border-dashed border-base2 text-text/20">
                                <Users size={24} />
                              </div>
                            )}
                          </div>
                          <div className="text-center">
                            <p className={`text-sm font-bold truncate max-w-[120px] ${match.player1Id && (match.winnerId === (match.player1Id.id || match.player1Id) ? 'text-green' : (setRes?.winnerId === (match.player1Id.id || match.player1Id) ? 'text-primary' : 'text-text-emphasis'))
                              }`}>
                              {match.player1Id?.fullName || 'TBD'}
                            </p>
                            <p className="text-xs font-black uppercase text-primary/60 tracking-wider mt-1">
                              Won: {match.player1Id ? (match.setsResults?.filter(s => (s.winnerId?.id || s.winnerId || '').toString() === (match.player1Id?.id || match.player1Id || '').toString()).length || 0) : 0}/{match.setsCount}
                            </p>
                            {match.winnerId && (
                              <p className={`text-sm font-black uppercase tracking-widest mt-1 px-2 py-1 rounded bg-green/10 ${match.winnerId === (match.player1Id.id || match.player1Id) ? 'text-green' : 'text-red/40 line-through'
                                }`}>
                                {match.winnerId === (match.player1Id.id || match.player1Id) ? 'WON' : 'LOST'}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <div className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/80 text-center max-w-[200px] leading-tight mb-2 drop-shadow-sm">
                            {match.title || 'Exhibition Match'}
                          </div>
                          <div className="text-lg font-black text-primary/5 italic leading-none">VS</div>
                        </div>

                        {/* Player 2 */}
                        <div
                          className="flex-1 flex-col items-center gap-2 transition-transform flex"
                        >
                          <div className="relative">
                            {match.player2Id ? (
                              <>
                                <img
                                  src={match.player2Id.profilePhoto || `https://ui-avatars.com/api/?name=${match.player2Id.fullName}&background=random`}
                                  alt={match.player2Id.fullName}
                                  className={`w-14 h-14 rounded-2xl object-cover ring-2 shadow-md transition-all ${(match.winnerId?.id || match.winnerId)?.toString() === (match.player2Id?.id || match.player2Id)?.toString() ? 'ring-green scale-105' :
                                    ((setRes?.winnerId?.id || setRes?.winnerId)?.toString() === (match.player2Id?.id || match.player2Id)?.toString() ? 'ring-violet border-4 border-violet/20' : 'ring-base3')
                                    }`}
                                />
                                {!isMatchFinished && setRes && (
                                  <div className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center border shadow-sm transition-all ${(setRes.winnerId?.id || setRes.winnerId)?.toString() === (match.player2Id.id || match.player2Id)?.toString() ? 'bg-violet text-base3 border-violet' : 'bg-base3 text-text/20 border-base2'
                                    }`}>
                                    <CheckCircle2 size={12} />
                                  </div>
                                )}
                                <div className={`absolute -bottom-1 -right-1 p-1 rounded-full shadow-sm ${match.player2Status === 'accepted' ? 'bg-green text-base3' : 'bg-yellow text-base3'
                                  }`}>
                                  {match.player2Status === 'accepted' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                </div>
                              </>
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-base2/50 flex items-center justify-center border-[3px] border-dashed border-base2 text-text/20">
                                <Users size={24} />
                              </div>
                            )}
                          </div>
                          <div className="text-center">
                            <p className={`text-sm font-bold truncate max-w-[120px] ${match.player2Id && (match.winnerId === (match.player2Id.id || match.player2Id) ? 'text-green' : (setRes?.winnerId === (match.player2Id.id || match.player2Id) ? 'text-violet' : 'text-text-emphasis'))
                              }`}>
                              {match.player2Id?.fullName || 'TBD'}
                            </p>
                            <p className="text-xs font-black uppercase text-violet/60 tracking-wider mt-1">
                              Won: {match.player2Id ? (match.setsResults?.filter(s => (s.winnerId?.id || s.winnerId || '').toString() === (match.player2Id?.id || match.player2Id || '').toString()).length || 0) : 0}/{match.setsCount}
                            </p>
                            {match.winnerId && match.player2Id && (
                              <p className={`text-sm font-black uppercase tracking-widest mt-1 px-2 py-1 rounded bg-green/10 ${(match.winnerId?.id || match.winnerId).toString() === (match.player2Id?.id || match.player2Id).toString() ? 'text-green' : 'text-red/40 line-through'
                                }`}>
                                {(match.winnerId?.id || match.winnerId).toString() === (match.player2Id?.id || match.player2Id).toString() ? 'WON' : 'LOST'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Redesigned Set Management */}
                    <div className="bg-gradient-to-b from-base2/30 to-transparent p-2 border-t border-base2 mt-auto space-y-2 relative">

                      {/* Set Tabs Container */}
                      <div className="flex flex-wrap gap-1.5 justify-center relative">
                        {Array.from({ length: match.setsCount || 1 }).map((_, idx) => {
                          const sRes = match.setsResults?.find(s => s.setIndex === idx);
                          const isActive = currentActiveSet === idx;
                          // Lock if match not ongoing (unless it's already completed history)
                          const isLocked = !isOngoing && !isMatchFinished ? true : (idx > defaultActive);

                          let tabLabel = `Set ${idx + 1}`;
                          let isWon = false;
                          if (sRes) {
                            const winnerIdStr = (sRes.winnerId?.id || sRes.winnerId || '').toString();
                            const p1IdStr = (match.player1Id?.id || match.player1Id || '').toString();
                            const p2IdStr = (match.player2Id?.id || match.player2Id || '').toString();

                            if (match.player1Id && winnerIdStr === p1IdStr) {
                              tabLabel = match.player1Id.fullName?.split(' ')[0] || '?';
                            } else if (match.player2Id && winnerIdStr === p2IdStr) {
                              tabLabel = match.player2Id.fullName?.split(' ')[0] || '?';
                            }
                            isWon = true;
                          }

                          return (
                            <div key={idx} className="flex-1 min-w-[56px] max-w-[85px]">
                              <button
                                disabled={(isLocked || !isOngoing) && !isMatchFinished}
                                onClick={() => {
                                  if (!isLocked && isOngoing && !sRes && !isMatchFinished) {
                                    setSelectingWinnerForSetMap(prev => ({ ...prev, [match.id]: idx }));
                                  } else {
                                    setActiveSetMap(prev => ({ ...prev, [match.id]: idx }));
                                    setSelectingWinnerForSetMap(prev => { const n = { ...prev }; delete n[match.id]; return n; });
                                  }
                                }}
                                className={`w-full px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all border flex flex-col items-center justify-center min-h-[48px] ${isActive
                                  ? 'bg-blue text-base3 border-blue shadow-lg shadow-blue/20 -translate-y-1 z-20'
                                  : (sRes ? 'bg-base3/80 border-base2/50 opacity-90' : 'bg-base2/5 border-transparent text-text/10')
                                  } ${(isLocked || !isOngoing) && !isMatchFinished ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
                              >
                                <span className={`truncate max-w-full ${isWon ? 'text-sm' : ''}`}>{tabLabel}</span>
                              </button>
                            </div>
                          );
                        })}

                        {/* Centered Overlay for Winner Selection */}
                        {selectingSetIdx !== undefined && (
                          <div className="absolute inset-x-0 inset-y-[-6px] flex justify-center z-50">
                            <div className="w-[420px] bg-base3 rounded-2xl shadow-2xl flex items-center p-2.5 gap-2.5 animate-in zoom-in-95 duration-200 border border-base2/50">
                              <button
                                disabled={!match.player1Id}
                                onClick={() => match.player1Id && handleRecordSetWinner(match, selectingSetIdx, (match.player1Id.id || match.player1Id))}
                                className={`flex-1 flex items-center justify-center h-12 bg-primary/10 hover:bg-primary text-primary hover:text-base3 transition-all rounded-xl text-sm font-black px-4 text-center border border-primary/20 ${!match.player1Id ? 'opacity-30 cursor-not-allowed' : ''}`}
                              >
                                {match.player1Id?.fullName || 'TBD'}
                              </button>
                              <div className="w-px h-8 bg-base2/50"></div>
                              <button
                                disabled={!match.player2Id}
                                onClick={() => match.player2Id && handleRecordSetWinner(match, selectingSetIdx, (match.player2Id.id || match.player2Id))}
                                className={`flex-1 flex items-center justify-center h-12 bg-violet/10 hover:bg-violet text-violet hover:text-base3 transition-all rounded-xl text-sm font-black px-4 text-center border border-violet/20 ${!match.player2Id ? 'opacity-30 cursor-not-allowed' : ''}`}
                              >
                                {match.player2Id?.fullName || 'TBD'}
                              </button>
                              <button
                                onClick={() => setSelectingWinnerForSetMap(prev => { const n = { ...prev }; delete n[match.id]; return n; })}
                                className="w-8 h-8 flex items-center justify-center text-text/20 hover:text-red transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Pending Acceptance Message - Hide if match is already confirmed or both players accepted */}
                        {['pending', 'pending_invites', 'awaiting_players'].includes(match.status) && 
                         !(match.player1Status === 'accepted' && match.player2Status === 'accepted') && (
                          <div className="absolute inset-x-0 bottom-0 top-[0px] bg-base3/60 backdrop-blur-[2px] flex items-center justify-center z-40 rounded-xl border border-dashed border-base2 pointer-events-none">
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-emphasis animate-pulse bg-base3 px-4 py-1.5 rounded-full shadow-lg border border-base2 translate-y-[-2px]">
                              Awaiting Players
                            </p>
                          </div>
                        )}

                      </div>

                      {isMatchFinished ? (
                        <div className="w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-sm border bg-green/10 text-green border-green/20">
                          🏆 MATCH COMPLETED: {match.scorePlayer1} - {match.scorePlayer2}
                        </div>
                      ) : (isConfirmed || (match.player1Status === 'accepted' && match.player2Status === 'accepted' && !isOngoing)) ? (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleStartMatch(match, match.isTournamentMatch)}
                          className="w-full bg-emerald-600 text-base3 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-md shadow-emerald-600/20 relative z-50 pointer-events-auto disabled:opacity-60"
                        >
                          <Play size={14} fill="white" />
                          START MATCH
                        </button>
                      ) : isOngoing ? (
                        <div className="w-full bg-primary/5 text-primary py-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 animate-pulse border border-primary/20 shadow-sm">
                          ⚡ ONGOING MATCH {match.poolTable && <span className="opacity-80 ml-1 tracking-widest text-primary italic">"{typeof match.poolTable === 'object' ? match.poolTable.tableId : match.poolTable}"</span>}
                        </div>
                      ) : match.isTournamentMatch ? (
                        <Link
                          to={`/moderator/manage-tournament/${match.tournamentId?.id || match.tournamentId}`}
                          className="w-full bg-primary text-base3 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-md shadow-primary/20 relative z-50"
                        >
                          <Trophy size={14} />
                          ENTER ROOM
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toast.success('Match details are displayed on this card.')}
                          className="w-full bg-primary text-base3 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-md shadow-primary/20 relative z-50"
                        >
                          <Target size={14} />
                          VIEW DETAILS
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : activeTab === 'tournaments' ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            {data.tournaments.length === 0 ? (
              <div className="col-span-full card-premium p-12 text-center text-text italic">
                No active tournaments found.
              </div>
            ) : (
              data.tournaments.map((t) => (
                <div key={t.id} className="card-premium p-0 rounded-2xl overflow-visible flex flex-col group border border-base2 bg-surface shadow-sm transition-all hover:border-primary/30 hover:shadow-lg">
                  <div className="bg-base2/10 p-4 flex justify-between items-center border-b border-base2 preserve-3d overflow-hidden">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-primary/10 flex items-center justify-center text-primary rounded-lg shrink-0">
                        <Trophy size={16} />
                      </div>
                      <h3 className="text-[clamp(10px,1.1vw,13px)] font-black uppercase text-text/40 tracking-widest truncate min-w-0">Tournament Room</h3>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <StatusBadge status={t.status} entryType={t.entryType} registrationDeadline={t.registrationDeadline} startDate={t.startDate} className="text-[clamp(7.5px,0.85vw,9.5px)] shrink-0" />
                      <button
                        type="button"
                        disabled={actionLoading || ['ongoing', 'completed', 'cancelled'].includes(t.status)}
                        onClick={() => openEditModal('tournament', t)}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-40"
                        title="Edit Tournament"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading || ['ongoing', 'completed', 'cancelled'].includes(t.status)}
                        onClick={() => openInviteModal('tournament', t)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-colors disabled:opacity-40"
                        title="Invite Players"
                      >
                        <UserPlus size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading || ['completed', 'cancelled'].includes(t.status)}
                        onClick={() => handleDeleteTournament(t.id)}
                        className="p-1.5 text-red hover:bg-red/10 rounded-lg transition-colors disabled:opacity-40"
                        title="Delete Tournament"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-bold text-text-emphasis mb-2 truncate">{t.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-text/70 mb-4">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Users size={14} className="text-primary" />
                        {t.confirmedPlayers.length}/{t.maxPlayers}
                      </div>
                      {t.stakePerPlayer > 0 && (
                        <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                          <Trophy size={14} className="text-emerald-600" />
                          PRIZE: KES {winnerPrize(t.stakePerPlayer * (t.confirmedPlayers?.length || t.maxPlayers), t.moderatorFee).toLocaleString()}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 font-bold capitalize">
                        <Award size={14} className="text-yellow" />
                        {t.format.split('_')[0]}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-base2/50">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Link
                          to={`/moderator/manage-tournament/${t.id}`}
                          className="sm:col-span-3 w-full bg-primary text-base3 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:scale-[1.02] transition-all"
                        >
                          Enter Room
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            {data.battles.length === 0 ? (
              <div className="col-span-full card-premium p-12 text-center text-text italic">
                No active multiplayer battles found.
              </div>
            ) : (
              data.battles.map((battle) => (
                <div key={battle.id} className="card-premium p-0 rounded-2xl overflow-visible flex flex-col group border border-base2 bg-surface shadow-sm transition-all hover:border-primary/30 hover:shadow-lg">
                  <div className="bg-base2/10 p-4 flex justify-between items-center border-b border-base2 preserve-3d overflow-hidden">
                    <div className="w-8 h-8 bg-primary/10 flex items-center justify-center text-primary rounded-lg shrink-0">
                      <Shield size={16} />
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[clamp(7.5px,0.85vw,9.5px)] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1 whitespace-nowrap">
                        <Award size={10} className="text-emerald-500" />
                        PRIZE: KES {winnerPrize(battle.stakeAmount * battle.participants.filter(p => getBattleParticipantStatus(p) === 'accepted').length, battle.moderatorFee).toLocaleString()}
                      </span>
                      <StatusBadge status={battle.status} className="text-[clamp(7.5px,0.85vw,9.5px)]" />
                      <button
                        type="button"
                        disabled={actionLoading || ['ongoing', 'completed', 'cancelled'].includes(battle.status)}
                        onClick={() => openEditModal('battle', battle)}
                        className="p-1 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-40"
                        title="Edit Battle"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading || ['ongoing', 'completed', 'cancelled'].includes(battle.status)}
                        onClick={() => openInviteModal('battle', battle)}
                        className="p-1 text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-colors disabled:opacity-40"
                        title="Invite Players"
                      >
                        <UserPlus size={14} />
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleDeleteBattle(battle.id)}
                        className="p-1 text-red hover:bg-red/10 rounded-lg transition-colors"
                        title="Delete Battle"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-base font-bold text-text-emphasis mb-1 truncate">{battle.title}</h3>
                    <p className="text-[10px] text-text/60 mb-3 flex items-center gap-1">
                      <MapPin size={10} /> {battle.venue}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-xl text-center">
                        <p className="text-[9px] font-black uppercase text-emerald-600/60 leading-none mb-1">STAKE</p>
                        <p className="text-xs font-black text-emerald-600 leading-none">KES {battle.stakeAmount.toLocaleString()}</p>
                      </div>
                      <div className="bg-primary/5 border border-primary/10 p-2 rounded-xl text-center">
                        <p className="text-[9px] font-black uppercase text-primary/60 leading-none mb-1">TOTAL POT</p>
                        <p className="text-xs font-black text-primary leading-none">KES {(battle.stakeAmount * battle.participants.filter(p => getBattleParticipantStatus(p) === 'accepted').length).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 max-h-[220px] overflow-y-auto pr-2 thin-scrollbar flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-text/40 mb-1">
                        {battle.status === 'ongoing' ? 'SELECT WINNER' : 'Participants'}
                      </p>
                      {battle.participants
                        .filter(p => {
                          if (battle.status === 'ongoing') return getBattleParticipantStatus(p) === 'accepted';
                          if (battle.status === 'completed' && !expandedBattles[battle.id]) {
                            return (battle.winnerId?.id || battle.winnerId) === getBattleParticipantId(p);
                          }
                          return true;
                        })
                        .map((p) => {
                          const participantId = getBattleParticipantId(p);
                          const participantName = getBattleParticipantName(p);
                          const participantStatus = getBattleParticipantStatus(p);
                          const isWinner = (battle.winnerId?.id || battle.winnerId || '').toString() === (participantId || '').toString();
                          return (
                            <div key={participantId} className={`flex items-center justify-between p-2 rounded-xl border transition-all ${isWinner ? 'bg-green/10 border-green/30' : 'bg-base2/20 border-base2'
                              }`}>
                              <div className="flex items-center gap-2 overflow-hidden">
                                <img
                                  src={getBattleParticipantPhoto(p) || `https://ui-avatars.com/api/?name=${participantName}&background=random`}
                                  className="w-6 h-6 rounded-lg object-cover ring-1 ring-base2 shadow-sm"
                                  alt=""
                                />
                                <span className={`text-[11px] font-bold truncate ${isWinner ? 'text-green' : 'text-text-emphasis'}`}>
                                  {participantName}
                                </span>
                                {isWinner && <Trophy size={10} className="text-green shrink-0 animate-bounce" />}
                              </div>
                              <div className="flex items-center gap-2">
                                {battle.status === 'ongoing' && !battle.winnerId && (
                                  <button
                                    disabled={actionLoading}
                                    onClick={() => handleRecordBattleWinner(battle.id, participantId, participantName)}
                                    className="px-2 py-0.5 bg-green text-base3 rounded text-[9px] font-black uppercase hover:scale-105 transition-all shadow-sm"
                                  >
                                    WINNER
                                  </button>
                                )}
                                {battle.status !== 'ongoing' && (
                                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${participantStatus === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    participantStatus === 'declined' ? 'bg-red/5 text-red/60 border-red/10' : 'bg-yellow/5 text-yellow border-yellow/10'
                                    }`}>
                                    {participantStatus}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}

                      {battle.status === 'completed' && battle.participants.length > 1 && (
                        <button
                          onClick={() => setExpandedBattles(prev => ({ ...prev, [battle.id]: !prev[battle.id] }))}
                          className="w-full py-1.5 text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center justify-center gap-2 mt-1 border border-dashed border-primary/20 rounded-lg hover:bg-primary/5"
                        >
                          {expandedBattles[battle.id] ? (
                            <>HIDE OTHERS <ChevronRight size={10} className="rotate-90" /></>
                          ) : (
                            <>VIEW ALL PARTICIPANTS ({battle.participants.length}) <ChevronRight size={10} /></>
                          )}
                        </button>
                      )}
                    </div>

                    {battle.status === 'pending' && (
                      <button
                        disabled={actionLoading || battle.participants.filter(p => getBattleParticipantStatus(p) === 'accepted').length < 2}
                        onClick={() => handleStartBattle(battle.id)}
                        className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all ${battle.participants.filter(p => getBattleParticipantStatus(p) === 'accepted').length < 2
                          ? 'bg-base2 text-text/40 cursor-not-allowed grayscale'
                          : 'bg-primary text-base3 shadow-primary/20 hover:scale-[1.02]'
                          }`}
                      >
                        <Play size={14} fill="currentColor" />
                        START BATTLE
                      </button>
                    )}

                    {battle.status === 'ongoing' && !battle.winnerId && (
                      <div className="w-full bg-primary/5 text-primary py-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 animate-pulse border border-primary/20">
                        ⚡ BATTLE IN PROGRESS {battle.poolTable && <span className="opacity-80 ml-1 tracking-widest text-primary italic">"{typeof battle.poolTable === 'object' ? battle.poolTable.tableId : battle.poolTable}"</span>}
                      </div>
                    )}

                    {battle.status === 'completed' && (
                      <div className="w-full bg-green/10 text-green py-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 border border-green/20">
                        🏆 BATTLE COMPLETED
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Edit Activity Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-base1/75 backdrop-blur-sm">
          <form onSubmit={handleEditSubmit} className="w-full max-w-xl bg-surface border border-base2 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Edit {editingItem.type}</p>
                <h3 className="text-2xl font-black text-text-emphasis tracking-tight">Update Details</h3>
              </div>
              <button type="button" onClick={() => setEditingItem(null)} className="w-10 h-10 rounded-xl bg-base2/40 text-text/60 hover:text-red flex items-center justify-center">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="md:col-span-2 space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-text/50">{editingItem.type === 'tournament' ? 'Tournament Name' : 'Battle Title'}</span>
                <input
                  required
                  value={editingItem.type === 'tournament' ? editForm.name : editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, [editingItem.type === 'tournament' ? 'name' : 'title']: e.target.value }))}
                  className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 text-sm font-bold text-text-emphasis outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-text/50">Venue</span>
                <input
                  required
                  value={editForm.venue || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, venue: e.target.value }))}
                  className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 text-sm font-bold text-text-emphasis outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-text/50">Location</span>
                <input
                  value={editForm.location || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 text-sm font-bold text-text-emphasis outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-text/50">{editingItem.type === 'tournament' ? 'Stake Per Player' : 'Stake Amount'}</span>
                <input
                  type="number"
                  min="0"
                  value={editingItem.type === 'tournament' ? editForm.stakePerPlayer : editForm.stakeAmount}
                  onChange={(e) => setEditForm(prev => ({ ...prev, [editingItem.type === 'tournament' ? 'stakePerPlayer' : 'stakeAmount']: e.target.value }))}
                  className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 text-sm font-bold text-text-emphasis outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-text/50">{editingItem.type === 'tournament' ? 'Start Date' : 'Scheduled At'}</span>
                <input
                  type="datetime-local"
                  value={editingItem.type === 'tournament' ? editForm.startDate : editForm.scheduledAt}
                  onChange={(e) => setEditForm(prev => ({ ...prev, [editingItem.type === 'tournament' ? 'startDate' : 'scheduledAt']: e.target.value }))}
                  className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 text-sm font-bold text-text-emphasis outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              {editingItem.type === 'tournament' && (
                <>
                  <label className="space-y-1">
                    <span className="text-xs font-black uppercase tracking-widest text-text/50">Min Players</span>
                    <input
                      type="number"
                      min="2"
                      value={editForm.minPlayers}
                      onChange={(e) => setEditForm(prev => ({ ...prev, minPlayers: e.target.value }))}
                      className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 text-sm font-bold text-text-emphasis outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-black uppercase tracking-widest text-text/50">Max Players</span>
                    <input
                      type="number"
                      min="2"
                      value={editForm.maxPlayers}
                      onChange={(e) => setEditForm(prev => ({ ...prev, maxPlayers: e.target.value }))}
                      className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 text-sm font-bold text-text-emphasis outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                </>
              )}
            </div>

            <button type="submit" disabled={actionLoading} className="w-full bg-primary text-base3 py-3 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
              {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Invite Players Modal */}
      {inviteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-base1/75 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-surface border border-base2 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Invite Players</p>
                <h3 className="text-2xl font-black text-text-emphasis tracking-tight truncate">{inviteTarget.title}</h3>
              </div>
              <button type="button" onClick={() => setInviteTarget(null)} className="w-10 h-10 rounded-xl bg-base2/40 text-text/60 hover:text-red flex items-center justify-center">
                <X size={20} />
              </button>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-3.5 text-text/40" />
              <input
                value={inviteSearch}
                onChange={(e) => setInviteSearch(e.target.value)}
                placeholder="Search players..."
                className="w-full bg-base2/30 border border-base2 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-text-emphasis outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {inviteResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto thin-scrollbar border border-base2 rounded-xl divide-y divide-base2">
                {inviteResults.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => {
                      setSelectedInvitePlayers(prev => [...prev, player]);
                      setInviteSearch('');
                      setInviteResults([]);
                    }}
                    className="w-full p-3 flex items-center justify-between text-left hover:bg-primary/5"
                  >
                    <span className="text-sm font-bold text-text-emphasis">{player.fullName}</span>
                    <UserPlus size={16} className="text-primary" />
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-widest text-text/50">Selected ({selectedInvitePlayers.length})</p>
              {selectedInvitePlayers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-base2 p-5 text-center text-sm font-bold text-text/40">No players selected</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedInvitePlayers.map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => setSelectedInvitePlayers(prev => prev.filter(p => p.id !== player.id))}
                      className="px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-black flex items-center gap-2"
                    >
                      {player.fullName}
                      <X size={14} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button type="button" disabled={actionLoading || selectedInvitePlayers.length === 0} onClick={handleInviteSubmit} className="w-full bg-primary text-base3 py-3 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
              {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              Send Invitations
            </button>
          </div>
        </div>
      )}

      {/* IoT Table Selection Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-base3/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="card-premium w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => { setShowTableModal(false); setSelectedActivity(null); }}
              className="absolute top-4 right-4 text-text/40 hover:text-red transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-500/10 flex items-center justify-center text-emerald-500 rounded-2xl">
                <Play size={24} fill="currentColor" />
              </div>
              <div>
                <h2 className="text-xl font-black text-text-emphasis leading-tight">Identify Pool Table</h2>
                <p className="text-xs text-text/60">Select hardware to trigger ball release</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary">Assigned Table Location/Number</label>
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 thin-scrollbar">
                  {tables.filter(t => t.status === 'available').map(table => (
                    <button
                      key={table.id}
                      onClick={() => setSelectedTableId(table.tableId)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedTableId === table.tableId
                        ? 'border-emerald-500 bg-emerald-500/5 ring-4 ring-emerald-500/10'
                        : 'border-base2 bg-base3 hover:border-primary/30'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedTableId === table.tableId ? 'bg-emerald-500 text-text-emphasis' : 'bg-base2 text-text/40'}`}>
                          <MapPin size={16} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-text-emphasis leading-none">{table.tableId}</p>
                          <p className="text-[10px] text-text/40 font-bold uppercase mt-1">{table.location || 'Default Venue'}</p>
                        </div>
                      </div>
                      {selectedTableId === table.tableId && <CheckCircle2 size={18} className="text-emerald-500" />}
                    </button>
                  ))}

                  <button
                    onClick={() => setSelectedTableId('')}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 border-dashed transition-all ${selectedTableId === ''
                      ? 'border-primary bg-primary/5'
                      : 'border-base2 bg-base3 hover:border-primary/30'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-base2 flex items-center justify-center text-text/40">
                        <AlertCircle size={16} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-text-emphasis">Manual Unlock (No IoT)</p>
                        <p className="text-[10px] text-text/40 uppercase">Proceed without automated trigger</p>
                      </div>
                    </div>
                    {selectedTableId === '' && <CheckCircle2 size={18} className="text-primary" />}
                  </button>
                </div>
              </div>

              <button
                disabled={actionLoading}
                onClick={confirmStartWithTable}
                className="w-full bg-emerald-600 text-base3 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
                START GAME & TRIGGER PULSE
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OngoingActivities;


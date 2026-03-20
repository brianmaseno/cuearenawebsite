import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Trophy, Target, Clock, Users, ChevronRight, Loader2, AlertCircle, CheckCircle2, XCircle, Trash2, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const OngoingActivities = () => {
  const [data, setData] = useState({ tournaments: [], matches: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOngoing = async () => {
    try {
      const { data } = await api.get('/moderator/ongoing');
      setData(data);
    } catch (err) {
      toast.error('Failed to load ongoing activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOngoing();
  }, []);

  const handleSetWinner = async (matchId, player) => {
    if (!window.confirm(`Set ${player.fullName} as the winner? This will complete the match and move it to history.`)) return;
    
    setActionLoading(true);
    try {
      await api.put(`/direct-matches/${matchId}/winner`, { winnerId: player._id });
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
      await api.put(`/direct-matches/${matchId}/cancel`);
      toast.success('Match cancelled.');
      fetchOngoing();
    } catch (err) {
      toast.error('Failed to cancel match');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Ongoing Management">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Ongoing Management">
      <div className="space-y-6 pb-20">
        {/* Tabs */}
        <div className="flex bg-base3 p-1 rounded-2xl border border-base2 w-fit">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'matches' ? 'bg-primary text-base3 shadow-lg' : 'text-text hover:bg-base2/50'
            }`}
          >
            <Target size={18} />
            Direct Matches ({data.matches.length})
          </button>
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'tournaments' ? 'bg-primary text-base3 shadow-lg' : 'text-text hover:bg-base2/50'
            }`}
          >
            <Trophy size={18} />
            Tournaments ({data.tournaments.length})
          </button>
        </div>

        {activeTab === 'matches' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.matches.length === 0 ? (
              <div className="col-span-full card-premium p-12 text-center text-text italic">
                No active direct matches found.
              </div>
            ) : (
              data.matches.map((match) => (
                <div key={match._id} className="card-premium p-0 rounded-2xl overflow-hidden group hover:ring-2 ring-primary/20 transition-all border-none">
                  <div className="bg-base2/10 p-4 flex justify-between items-center border-b border-base2">
                    <div className="flex items-center gap-2">
                       <Target size={16} className="text-violet" />
                       <h3 className="text-sm font-bold text-text-emphasis truncate max-w-[120px]">{match.title || 'Exhibition'}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                       <StatusBadge status={match.status} />
                       <button 
                         disabled={actionLoading}
                         onClick={() => handleCancelMatch(match._id)}
                         className="p-1.5 text-red hover:bg-red/10 rounded-lg transition-colors"
                         title="Cancel Match"
                       >
                          <Trash2 size={14} />
                       </button>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 relative">
                      {/* Player 1 */}
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative">
                          <img 
                            src={match.player1Id.profilePhoto || `https://ui-avatars.com/api/?name=${match.player1Id.fullName}&background=random`} 
                            alt={match.player1Id.fullName} 
                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-base3 shadow-md"
                          />
                          <div className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full shadow-sm ${
                            match.player1Status === 'accepted' ? 'bg-green text-base3' : 'bg-yellow text-base3'
                          }`}>
                             {match.player1Status === 'accepted' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-text-emphasis truncate max-w-[80px]">{match.player1Id.fullName}</p>
                        </div>
                        <button 
                          disabled={actionLoading || match.status === 'pending_invites'}
                          onClick={() => handleSetWinner(match._id, match.player1Id)}
                          className="text-[9px] font-bold uppercase text-primary border border-primary/20 px-2 py-1 rounded-md hover:bg-primary hover:text-base3 transition-all"
                        >
                           Winner
                        </button>
                      </div>

                      <div className="text-lg font-black text-base1 opacity-10 italic">VS</div>

                      {/* Player 2 */}
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative">
                          <img 
                            src={match.player2Id.profilePhoto || `https://ui-avatars.com/api/?name=${match.player2Id.fullName}&background=random`} 
                            alt={match.player2Id.fullName} 
                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-base3 shadow-md"
                          />
                          <div className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full shadow-sm ${
                            match.player2Status === 'accepted' ? 'bg-green text-base3' : 'bg-yellow text-base3'
                          }`}>
                             {match.player2Status === 'accepted' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-text-emphasis truncate max-w-[80px]">{match.player2Id.fullName}</p>
                        </div>
                        <button 
                          disabled={actionLoading || match.status === 'pending_invites'}
                          onClick={() => handleSetWinner(match._id, match.player2Id)}
                          className="text-[9px] font-bold uppercase text-primary border border-primary/20 px-2 py-1 rounded-md hover:bg-primary hover:text-base3 transition-all"
                        >
                           Winner
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-base2/5 p-3 border-t border-base2 flex justify-center items-center text-[10px] font-bold text-text/50">
                     <div className="flex items-center gap-1.5">
                        <Clock size={10} />
                        <span>{match.scheduledAt ? new Date(match.scheduledAt).toLocaleString() : 'As soon as possible'}</span>
                     </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.tournaments.length === 0 ? (
              <div className="col-span-full card-premium p-12 text-center text-text italic">
                No active tournaments found.
              </div>
            ) : (
              data.tournaments.map((t) => (
                <div key={t._id} className="card-premium p-0 rounded-2xl overflow-hidden flex flex-col group border-none shadow-sm transition-all hover:shadow-md">
                  <div className="bg-base2/10 p-4 flex justify-between items-center border-b border-base2">
                    <div className="w-8 h-8 bg-primary/10 flex items-center justify-center text-primary rounded-lg">
                       <Trophy size={16} />
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-sm font-bold text-text-emphasis mb-2 truncate">{t.name}</h3>
                    <div className="flex items-center gap-3 text-[10px] text-text/70 mb-4">
                      <div className="flex items-center gap-1.5 font-bold">
                         <Users size={12} className="text-primary" />
                         {t.confirmedPlayers.length}/{t.maxPlayers}
                      </div>
                      <div className="flex items-center gap-1.5 font-bold capitalize">
                         <Award size={12} className="text-yellow" />
                         {t.format.split('_')[0]}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-base2/50">
                      <Link 
                        to={`/moderator/manage-tournament/${t._id}`}
                        className="w-full bg-primary text-base3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] transition-all"
                      >
                        Enter Room
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OngoingActivities;

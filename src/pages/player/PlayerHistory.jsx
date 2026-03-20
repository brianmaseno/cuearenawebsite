import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { 
  Trophy as TrophyIcon, 
  Target as TargetIcon, 
  Clock as ClockIcon, 
  Calendar as CalendarIcon, 
  Award as AwardIcon, 
  CheckCircle2 as CheckIcon, 
  XCircle as CancelIcon, 
  ChevronRight as ArrowIcon,
  Loader2,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const PlayerHistory = () => {
  const [data, setData] = useState({ tournaments: [], matches: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');
  const [subFilter, setSubFilter] = useState('all');

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/direct-matches/player/history');
      setData(data);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getFilteredData = () => {
    const list = activeTab === 'matches' ? data.matches : data.tournaments;
    if (subFilter === 'all') return list;
    return list.filter(item => item.status === (subFilter === 'completed' ? 'completed' : 'cancelled'));
  };

  const filteredData = getFilteredData();

  if (loading) {
    return (
      <DashboardLayout title="Activity History">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Activity History">
      <div className="space-y-6 pb-20">
        <div className="flex flex-col gap-6">
           <div className="flex bg-base3 p-1 rounded-2xl border border-base2 w-fit">
              <button
                onClick={() => { setActiveTab('matches'); setSubFilter('all'); }}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  activeTab === 'matches' ? 'bg-primary text-base3 shadow-lg' : 'text-text hover:bg-base2/50'
                }`}
              >
                <TargetIcon size={18} />
                Matches ({data.matches.length})
              </button>
              <button
                onClick={() => { setActiveTab('tournaments'); setSubFilter('all'); }}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  activeTab === 'tournaments' ? 'bg-primary text-base3 shadow-lg' : 'text-text hover:bg-base2/50'
                }`}
              >
                <TrophyIcon size={18} />
                Tournaments ({data.tournaments.length})
              </button>
           </div>

           {/* Sub-Filters */}
           <div className="flex items-center gap-2 bg-base2/20 p-1.5 rounded-2xl w-fit border border-base2/50">
              {[
                { id: 'all', label: 'All', icon: ArrowIcon },
                { id: 'completed', label: 'Completed', icon: CheckIcon },
                { id: 'cancelled', label: 'Cancelled', icon: CancelIcon }
              ].map(f => {
                const count = (activeTab === 'matches' ? data.matches : data.tournaments)
                  .filter(item => f.id === 'all' ? true : item.status === f.id).length;
                
                return (
                  <button
                    key={f.id}
                    onClick={() => setSubFilter(f.id)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2.5 ${
                      subFilter === f.id 
                        ? 'bg-primary/10 text-primary shadow-sm border border-primary/20' 
                        : 'text-text/60 hover:text-text hover:bg-base2/50 border border-transparent'
                    }`}
                  >
                    <f.icon size={14} />
                    {f.label}
                    <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${
                      subFilter === f.id ? 'bg-primary/10 text-primary' : 'bg-base2 text-text/30'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
           </div>
        </div>

        {activeTab === 'matches' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.length === 0 ? (
              <div className="col-span-full card-premium p-12 text-center text-text italic">
                No {subFilter !== 'all' ? subFilter : ''} match history found.
              </div>
            ) : (
              filteredData.map((match) => {
                const winnerIdObj = match.winnerId?._id || match.winnerId;
                const p1IdObj = match.player1Id?._id || match.player1Id;
                const p2IdObj = match.player2Id?._id || match.player2Id;
                
                const isP1Winner = winnerIdObj && winnerIdObj.toString() === p1IdObj?.toString();
                const isP2Winner = winnerIdObj && winnerIdObj.toString() === p2IdObj?.toString();
                const isCancelled = match.status === 'cancelled';
                
                const winnerName = match.winnerId?.fullName || (isP1Winner ? match.player1Id?.fullName : isP2Winner ? match.player2Id?.fullName : null);

                return (
                <div key={match._id} className="card-premium p-0 rounded-2xl overflow-hidden group hover:ring-2 ring-primary/20 transition-all border-none">
                  <div className="bg-base2/10 p-4 flex justify-between items-center border-b border-base2">
                    <div className="flex items-center gap-3">
                       <img src="/favicon.png" alt="7 Ball" className="w-7 h-7 drop-shadow-sm" />
                       <h3 className="text-sm font-black uppercase tracking-tighter text-text-emphasis">Cue Arena</h3>
                    </div>
                    <div>
                       {isCancelled ? (
                         <span className="text-[10px] font-black uppercase text-red bg-red/10 px-2 py-0.5 rounded tracking-widest">Cancelled</span>
                       ) : (
                         <span className="text-[10px] font-black uppercase text-green bg-green/10 px-2 py-0.5 rounded tracking-widest">Completed</span>
                       )}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 relative">
                      {/* Player 1 */}
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative">
                          <img 
                            src={match.player1Id?.profilePhoto || `https://ui-avatars.com/api/?name=${match.player1Id?.fullName}&background=random`} 
                            alt={match.player1Id?.fullName} 
                            className={`w-14 h-14 rounded-2xl object-cover ring-2 shadow-md transition-all ${
                               isP1Winner ? 'ring-green scale-105' : 'ring-base3 opacity-60'
                            }`}
                          />
                        </div>
                        <div className="text-center">
                          <p className={`text-[11px] font-bold truncate max-w-[80px] ${isP1Winner ? 'text-green' : 'text-text/40'}`}>
                             {match.player1Id?.fullName}
                          </p>
                          <p className="text-[8px] font-black uppercase text-primary/60 tracking-wider mt-0.5">
                             Sets won: {match.scorePlayer1 || 0}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                        <div className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/80 text-center max-w-[120px] leading-tight mb-2 drop-shadow-sm">
                           {match.title || 'Exhibition Match'}
                        </div>
                        <div className="text-xl font-black text-primary/10 italic">VS</div>
                      </div>

                      {/* Player 2 */}
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative">
                          <img 
                            src={match.player2Id?.profilePhoto || `https://ui-avatars.com/api/?name=${match.player2Id?.fullName}&background=random`} 
                            alt={match.player2Id?.fullName} 
                            className={`w-14 h-14 rounded-2xl object-cover ring-2 shadow-md transition-all ${
                               isP2Winner ? 'ring-green scale-105' : 'ring-base3 opacity-60'
                            }`}
                          />
                        </div>
                        <div className="text-center">
                          <p className={`text-[11px] font-bold truncate max-w-[80px] ${isP2Winner ? 'text-green' : 'text-text/40'}`}>
                             {match.player2Id?.fullName}
                          </p>
                          <p className="text-[8px] font-black uppercase text-violet/60 tracking-wider mt-0.5">
                             Sets won: {match.scorePlayer2 || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-base2/10 p-4 border-t border-base2 space-y-3 relative overflow-visible mt-auto">
                     <div className="flex flex-col items-center justify-center text-center space-y-2">
                        <div className={`flex items-center gap-2 font-black uppercase tracking-widest text-[11px] ${isCancelled ? 'text-red/60' : 'text-green'}`}>
                           {isCancelled ? <CancelIcon size={16} /> : <AwardIcon size={16} />}
                           {isCancelled ? 'Match Cancelled' : (winnerName ? `Winner: ${winnerName}` : 'No Winner Announced')}
                        </div>
                        <div className="flex items-center gap-4 text-text/40 font-bold text-[10px]">
                           <div className="flex items-center gap-1.5 leading-none">
                              <CalendarIcon size={12} />
                              {new Date(match.updatedAt).toLocaleDateString()}
                           </div>
                           <div className="h-3 w-px bg-base2/50"></div>
                           <div className="flex items-center gap-1.5 leading-none">
                              <ClockIcon size={12} />
                              {new Date(match.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.length === 0 ? (
              <div className="col-span-full card-premium p-12 text-center text-text italic">
                No {subFilter !== 'all' ? subFilter : ''} tournament history found.
              </div>
            ) : (
              filteredData.map((t) => {
                const isCancelled = t.status === 'cancelled';
                return (
                  <div key={t._id} className="card-premium p-0 rounded-2xl overflow-hidden flex flex-col group border-none shadow-sm transition-all hover:shadow-md h-full">
                     <div className="bg-base2/10 p-4 flex justify-between items-center border-b border-base2">
                      <div className="flex items-center gap-3">
                         <img src="/favicon.png" alt="7 Ball" className="w-7 h-7 drop-shadow-sm" />
                         <h3 className="text-sm font-black uppercase tracking-tighter text-text-emphasis">Cue Arena</h3>
                      </div>
                      <div>
                         {isCancelled ? (
                           <span className="text-[10px] font-black uppercase text-red bg-red/10 px-2 py-0.5 rounded tracking-widest">Cancelled</span>
                         ) : (
                           <span className="text-[10px] font-black uppercase text-green bg-green/10 px-2 py-0.5 rounded tracking-widest">Completed</span>
                         )}
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1">
                      <div className="flex items-center gap-3 text-[10px] text-text/70 mb-4">
                        <div className="flex items-center gap-1.5 font-bold">
                           <Users size={12} className="text-primary" />
                           {t.confirmedPlayers?.length || 0} Players
                        </div>
                        <div className="flex items-center gap-1.5 font-bold capitalize">
                           <AwardIcon size={12} className="text-yellow" />
                           {t.format?.split('_')[0] || 'Tournament'}
                        </div>
                      </div>
  
                      {t.winner && (
                         <div className="p-3 bg-yellow/5 border border-yellow/20 rounded-xl mb-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-yellow/10 flex items-center justify-center text-yellow">
                               <TrophyIcon size={20} />
                            </div>
                            <div>
                               <p className="text-[9px] font-black uppercase text-yellow/60 tracking-tighter">Tournament Winner</p>
                               <p className="text-sm font-bold text-text-emphasis truncate">{t.winner.fullName || t.winner}</p>
                            </div>
                         </div>
                      )}
                    </div>
  
                    {/* Completion Metadata Footer matching Match Style */}
                    <div className="bg-base2/10 p-4 border-t border-base2 mt-auto">
                      <div className="flex items-center justify-between text-[10px] font-bold text-text/40">
                         <div className="flex items-center gap-1.5 font-black uppercase tracking-wider">
                            <ClockIcon size={12} className="text-primary/30" />
                            History Archive
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                               {new Date(t.updatedAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1.5">
                               {new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PlayerHistory;

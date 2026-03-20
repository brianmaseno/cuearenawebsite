import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Target, Users, MapPin, Calendar, CheckCircle, Trophy, Loader2, ArrowLeft, X } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const MatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSet, setActiveSet] = useState(0);
  const [selectingWinnerForSet, setSelectingWinnerForSet] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [resultData, setResultData] = useState({
    scorePlayer1: 0,
    scorePlayer2: 0,
    winnerId: '',
  });

  const handleRecordSetWinner = async (winnerId) => {
    setActionLoading(true);
    try {
      await api.put(`/direct-matches/${id}/set-winner`, { setIndex: selectingWinnerForSet !== null ? selectingWinnerForSet : activeSet, winnerId });
      toast.success(`Set ${(selectingWinnerForSet !== null ? selectingWinnerForSet : activeSet) + 1} recorded!`);
      
      // Auto-advance
      const currentIdx = selectingWinnerForSet !== null ? selectingWinnerForSet : activeSet;
      if (currentIdx + 1 < match.setsCount && !match.winnerId) {
        setActiveSet(currentIdx + 1);
      }
      
      setSelectingWinnerForSet(null);
      fetchMatch();
    } catch (err) {
      toast.error('Failed to record set winner');
    } finally {
      setActionLoading(false);
    }
  };

  const activeSetRes = match?.setsResults?.find(s => s.setIndex === activeSet);

  const fetchMatch = async () => {
    try {
      const { data } = await api.get(`/direct-matches/${id}`);
      setMatch(data);
      
      // Auto-set active set to the first unplayed one
      if (data.setsResults && data.status !== 'completed') {
        let firstUnplayed = 0;
        for (let i = 0; i < data.setsCount; i++) {
          if (!data.setsResults.find(s => s.setIndex === i)) {
            firstUnplayed = i;
            break;
          }
        }
        setActiveSet(firstUnplayed);
      }

      if (data.scorePlayer1 !== null) {
        setResultData({
          scorePlayer1: data.scorePlayer1,
          scorePlayer2: data.scorePlayer2,
          winnerId: data.winnerId?._id || '',
        });
      }
    } catch (err) {
      toast.error('Match not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
  }, [id]);

  const handleRecordResult = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/direct-matches/${id}/result`, resultData);
      toast.success('Result recorded successfully!');
      fetchMatch();
    } catch (err) {
      toast.error('Error recording result');
    }
  };

  if (loading) return <DashboardLayout title="Match Details">Loading...</DashboardLayout>;
  if (!match) return <DashboardLayout title="Match Error">Match not found</DashboardLayout>;

  return (
    <DashboardLayout title={`Match: ${match.title}`}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary font-bold mb-6 hover:underline">
        <ArrowLeft size={20} /> Back
      </button>

      <div className="max-w-4xl space-y-8">
        {/* Match Card */}
        <div className="card-premium p-8 rounded-3xl relative overflow-hidden bg-violet/5 border-violet/10">
          <div className="flex justify-between items-start mb-8">
            <StatusBadge status={match.status} />
            <span className="text-xs text-text flex items-center gap-1">
              <Calendar size={14} />
              {new Date(match.scheduledAt).toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-12 py-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-primary/20 p-1">
                 <div className="w-full h-full rounded-full bg-base3 flex items-center justify-center text-3xl font-black">
                    {match.player1Id.fullName[0]}
                 </div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-text-emphasis">{match.player1Id.fullName}</h4>
                <p className={`text-xs font-bold uppercase ${match.player1Accepted ? 'text-green' : 'text-orange'}`}>
                   {match.player1Accepted ? 'Ready' : 'Pending Invite'}
                </p>
              </div>
              {match.status === 'completed' && <span className="text-4xl font-black text-primary">{match.scorePlayer1}</span>}
            </div>

            <div className="flex flex-col items-center gap-2">
               <div className="text-sm font-black text-base1 italic tracking-widest opacity-30">VS</div>
               <div className="h-20 w-px bg-base2"></div>
            </div>

            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-24 h-24 rounded-full bg-violet/10 flex items-center justify-center text-violet border-4 border-violet/20 p-1">
                 <div className="w-full h-full rounded-full bg-base3 flex items-center justify-center text-3xl font-black">
                    {match.player2Id.fullName[0]}
                 </div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-text-emphasis">{match.player2Id.fullName}</h4>
                <p className={`text-xs font-bold uppercase ${match.player2Accepted ? 'text-green' : 'text-orange'}`}>
                   {match.player2Accepted ? 'Ready' : 'Pending Invite'}
                </p>
              </div>
              {match.status === 'completed' && <span className="text-4xl font-black text-violet">{match.scorePlayer2}</span>}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-base2 flex items-center gap-6 text-sm text-text">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{match.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>Organizer: {match.organizerId.fullName}</span>
            </div>
          </div>
        </div>

        {/* Record Result section (Moderator Only) */}
        {(match.status === 'confirmed' || match.status === 'ongoing') && (
          <section className="card-premium p-8 rounded-2xl bg-base3 space-y-8">
             <div className="flex items-center justify-between border-b border-base2 pb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                   <Target size={20} className="text-primary" />
                   Match Console (Sets Management)
                </h3>
                <div className="text-[10px] font-black uppercase tracking-widest text-text/40">
                   Best of {match.setsCount} Sets
                </div>
             </div>

             {/* Set Tabs */}
             <div className="flex flex-wrap gap-4">
                {Array.from({ length: match.setsCount || 1 }).map((_, idx) => {
                   const sRes = match.setsResults?.find(s => s.setIndex === idx);
                   
                   // Find the first unplayed set index
                   let firstUnplayed = 0;
                   for (let i = 0; i < match.setsCount; i++) {
                      if (!match.setsResults?.find(s => s.setIndex === i)) {
                         firstUnplayed = i;
                         break;
                      }
                   }

                   const isActive = activeSet === idx;
                   const isLocked = idx > firstUnplayed;
                   const isSelecting = selectingWinnerForSet === idx;
                   
                   let tabLabel = `SET ${idx + 1}`;
                   let winnerColor = '';
                   
                   if (sRes) {
                      if (sRes.winnerId === match.player1Id._id) {
                         tabLabel = match.player1Id.fullName.split(' ')[0];
                         winnerColor = 'text-primary';
                      } else {
                         tabLabel = match.player2Id.fullName.split(' ')[0];
                         winnerColor = 'text-violet';
                      }
                   }

                   return (
                      <div key={idx} className="relative">
                         {isSelecting ? (
                            <div className="min-w-[240px] h-[64px] bg-base3 border-2 border-primary rounded-3xl shadow-2xl flex items-center p-1.5 gap-2 animate-in zoom-in-95 duration-200 z-30">
                               <button 
                                 onClick={() => handleRecordSetWinner(match.player1Id._id)}
                                 className="flex-1 h-full bg-primary/10 hover:bg-primary text-primary hover:text-base3 rounded-2xl text-[10px] font-black transition-all truncate px-3 flex flex-col items-center justify-center gap-0.5"
                               >
                                  <span className="opacity-40 text-[7px] uppercase">P1</span>
                                  {match.player1Id.fullName}
                               </button>
                               <div className="w-px h-8 bg-base2"></div>
                               <button 
                                 onClick={() => handleRecordSetWinner(match.player2Id._id)}
                                 className="flex-1 h-full bg-violet/10 hover:bg-violet text-violet hover:text-base3 rounded-2xl text-[10px] font-black transition-all truncate px-3 flex flex-col items-center justify-center gap-0.5"
                               >
                                  <span className="opacity-40 text-[7px] uppercase">P2</span>
                                  {match.player2Id.fullName}
                               </button>
                               <button 
                                 onClick={() => setSelectingWinnerForSet(null)}
                                 className="w-10 h-10 flex items-center justify-center text-text/20 hover:text-red transition-colors rounded-2xl hover:bg-red/5"
                               >
                                  <X size={18} />
                               </button>
                            </div>
                         ) : (
                            <button
                              disabled={isLocked && match.status !== 'completed'}
                              onClick={() => {
                                 if (!isLocked && !sRes && match.status !== 'completed') {
                                    setSelectingWinnerForSet(idx);
                                 } else {
                                    setActiveSet(idx);
                                    setSelectingWinnerForSet(null);
                                 }
                              }}
                              className={`min-w-[120px] h-[64px] px-6 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1 border-2 ${
                                isActive 
                                  ? 'bg-base3 border-primary shadow-xl shadow-primary/10' 
                                  : (sRes ? 'bg-base2/20 border-base2/30 opacity-60 hover:opacity-100' : 'bg-base2/10 border-transparent')
                              } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                               <span className={`text-sm font-black ${winnerColor || (isActive ? 'text-primary' : 'text-text/30')}`}>
                                  {tabLabel}
                               </span>
                            </button>
                         )}
                      </div>
                   );
                })}
             </div>


             <div className="pt-4 border-t border-base2">
                <h4 className="text-xs font-black uppercase tracking-widest text-text/30 mb-4">Manual Override (Final Score)</h4>
                <form onSubmit={handleRecordResult} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div>
                       <label className="block text-[10px] font-black uppercase text-text/50 mb-2">{match.player1Id.fullName} Final Score</label>
                       <input 
                          type="number" 
                          value={resultData.scorePlayer1}
                          onChange={(e) => setResultData({...resultData, scorePlayer1: parseInt(e.target.value)})}
                          className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 text-lg font-bold"
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black uppercase text-text/50 mb-2">{match.player2Id.fullName} Final Score</label>
                       <input 
                          type="number" 
                          value={resultData.scorePlayer2}
                          onChange={(e) => setResultData({...resultData, scorePlayer2: parseInt(e.target.value)})}
                          className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 text-lg font-bold"
                       />
                    </div>
                    <button type="submit" className="btn-primary py-3.5 rounded-xl font-bold shadow-lg">
                       Force Final Result
                    </button>
                    
                    <div className="md:col-span-3">
                       <label className="block text-[10px] font-black uppercase text-text/50 mb-2">Winner Selection</label>
                       <div className="flex gap-4">
                          <button 
                            type="button"
                            onClick={() => setResultData({...resultData, winnerId: match.player1Id._id})}
                            className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                              resultData.winnerId === match.player1Id._id ? 'border-primary bg-primary/10 text-primary' : 'border-base2 bg-base3 text-text/50'
                            }`}
                          >
                             {match.player1Id.fullName}
                          </button>
                          <button 
                            type="button"
                            onClick={() => setResultData({...resultData, winnerId: match.player2Id._id})}
                            className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                              resultData.winnerId === match.player2Id._id ? 'border-primary bg-primary/10 text-primary' : 'border-base2 bg-base3 text-text/50'
                            }`}
                          >
                             {match.player2Id.fullName}
                          </button>
                       </div>
                    </div>
                </form>
             </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MatchDetails;

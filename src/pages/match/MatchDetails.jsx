import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Target, Users, MapPin, Calendar, CheckCircle, Trophy, Loader2, ArrowLeft } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const MatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSet, setActiveSet] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [resultData, setResultData] = useState({
    scorePlayer1: 0,
    scorePlayer2: 0,
    winnerId: '',
  });

  const handleRecordSetWinner = async (winnerId) => {
    setActionLoading(true);
    try {
      await api.put(`/direct-matches/${id}/set-winner`, { setIndex: activeSet, winnerId });
      toast.success(`Set ${activeSet + 1} recorded!`);
      
      // Auto-advance
      if (activeSet + 1 < match.setsCount && !match.winnerId) {
        setActiveSet(activeSet + 1);
      }
      
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
             <div className="flex flex-wrap gap-2">
                {Array.from({ length: match.setsCount || 1 }).map((_, idx) => {
                   const sRes = match.setsResults?.find(s => s.setIndex === idx);
                   const isActive = activeSet === idx;
                   return (
                      <button
                        key={idx}
                        onClick={() => setActiveSet(idx)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                          isActive 
                            ? 'bg-primary text-base3 border-primary shadow-lg shadow-primary/20 scale-105' 
                            : (sRes ? 'bg-primary/10 text-primary border-primary/20' : 'bg-base2/30 text-text/50 border-transparent hover:border-base2/50')
                        }`}
                      >
                         SET {idx + 1}
                         {sRes && <span className="ml-2 opacity-50">✓</span>}
                      </button>
                   );
                })}
             </div>

             {/* Record Set Winner */}
             <div className="bg-base2/20 p-8 rounded-3xl border border-base2 text-center space-y-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-text/40">Select Winner for Set {activeSet + 1}</p>
                <div className="flex items-center justify-center gap-8">
                   <button 
                     onClick={() => handleRecordSetWinner(match.player1Id._id)}
                     className={`flex flex-col items-center gap-4 group transition-all ${activeSetRes?.winnerId === match.player1Id._id ? 'scale-110' : 'hover:scale-105'}`}
                   >
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black border-4 transition-all ${
                         activeSetRes?.winnerId === match.player1Id._id ? 'bg-primary text-base3 border-primary shadow-xl shadow-primary/30' : 'bg-base3 text-text border-base2 group-hover:border-primary/50'
                      }`}>
                         {match.player1Id.fullName[0]}
                      </div>
                      <span className={`text-sm font-bold ${activeSetRes?.winnerId === match.player1Id._id ? 'text-primary' : 'text-text'}`}>
                         {match.player1Id.fullName.split(' ')[0]}
                      </span>
                   </button>

                   <div className="text-xl font-black italic opacity-10">VS</div>

                   <button 
                     onClick={() => handleRecordSetWinner(match.player2Id._id)}
                     className={`flex flex-col items-center gap-4 group transition-all ${activeSetRes?.winnerId === match.player2Id._id ? 'scale-110' : 'hover:scale-105'}`}
                   >
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black border-4 transition-all ${
                         activeSetRes?.winnerId === match.player2Id._id ? 'bg-violet text-base3 border-violet shadow-xl shadow-violet/30' : 'bg-base3 text-text border-base2 group-hover:border-violet/50'
                      }`}>
                         {match.player2Id.fullName[0]}
                      </div>
                      <span className={`text-sm font-bold ${activeSetRes?.winnerId === match.player2Id._id ? 'text-violet' : 'text-text'}`}>
                         {match.player2Id.fullName.split(' ')[0]}
                      </span>
                   </button>
                </div>
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

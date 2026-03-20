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
  const [resultData, setResultData] = useState({
    scorePlayer1: 0,
    scorePlayer2: 0,
    winnerId: '',
  });

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
        {match.status === 'confirmed' || match.status === 'ongoing' ? (
          <section className="card-premium p-8 rounded-2xl bg-base3">
             <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Trophy size={20} className="text-yellow" />
                Record Final Result
             </h3>
             <form onSubmit={handleRecordResult} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div>
                   <label className="block text-xs font-bold uppercase text-text mb-2">{match.player1Id.fullName} Score</label>
                   <input 
                      type="number" 
                      value={resultData.scorePlayer1}
                      onChange={(e) => setResultData({...resultData, scorePlayer1: parseInt(e.target.value)})}
                      className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 text-lg font-bold"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold uppercase text-text mb-2">{match.player2Id.fullName} Score</label>
                   <input 
                      type="number" 
                      value={resultData.scorePlayer2}
                      onChange={(e) => setResultData({...resultData, scorePlayer2: parseInt(e.target.value)})}
                      className="w-full bg-base2/30 border border-base2 rounded-xl px-4 py-3 text-lg font-bold"
                   />
                </div>
                <div className="md:col-span-1">
                   <button type="submit" className="w-full btn-primary py-3.5 rounded-xl font-bold shadow-lg shadow-primary/20">
                      Submit Result
                   </button>
                </div>
                
                <div className="md:col-span-3">
                   <label className="block text-xs font-bold uppercase text-text mb-2">Winner Selection</label>
                   <div className="flex gap-4">
                      <button 
                        type="button"
                        onClick={() => setResultData({...resultData, winnerId: match.player1Id._id})}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                          resultData.winnerId === match.player1Id._id ? 'border-primary bg-primary/10 text-primary' : 'border-base2 bg-base3'
                        }`}
                      >
                         {match.player1Id.fullName}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setResultData({...resultData, winnerId: match.player2Id._id})}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                          resultData.winnerId === match.player2Id._id ? 'border-primary bg-primary/10 text-primary' : 'border-base2 bg-base3'
                        }`}
                      >
                         {match.player2Id.fullName}
                      </button>
                   </div>
                </div>
             </form>
          </section>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default MatchDetails;

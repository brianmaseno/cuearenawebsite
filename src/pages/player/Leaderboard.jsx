import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, TrendingUp, User, Loader2, ChevronUp, ChevronDown, Minus, Info } from 'lucide-react';
import AuraCard from '../../components/AuraCard';
import DashboardLayout from '../../components/DashboardLayout';

const Leaderboard = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRankData, setMyRankData] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [user?._id]);

  const fetchLeaderboard = async () => {
    try {
      const [leaderboardRes, metricsRes] = await Promise.all([
        api.get('/users/leaderboard'),
        user?.role === 'player' ? api.get('/users/me/metrics') : Promise.resolve(null)
      ]);

      setPlayers(leaderboardRes.data);

      if (metricsRes?.data) {
        const rankValue = metricsRes.data.stats.find(s => s.label === 'Global Rank')?.value;
        const rank = parseInt(rankValue?.replace('#', '')) || 0;
        
        // Find user points from auth or if needed from user object
        // The metrics endpoint doesn't return raw points, but we have them in AuthContext user object
        setMyRankData({
          rank,
          points: user.points || 0
        });
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Trophy className="w-8 h-8 text-yellow-400" />;
      case 1: return <Medal className="w-8 h-8 text-gray-300" />;
      case 2: return <Medal className="w-8 h-8 text-amber-600" />;
      default: return <span className="text-xl font-bold text-gray-500">#{index + 1}</span>;
    }
  };

  return (
    <DashboardLayout title="Leaderboard">
      <div className="max-w-5xl mx-auto pb-10 px-4 md:px-8 bg-[#fcf9f1] min-h-screen" style={{ fontFamily: "'Outfit', sans-serif" }}>
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-8 gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black text-[#1a1a1b] tracking-tight">
              Global <span className="text-blue-500">Hall of Fame</span>
            </h1>
            <p className="text-slate-500 font-medium">The world's most elite cue masters.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-[#f5f1e4]/50 backdrop-blur-xl px-6 py-4 rounded-[28px] border-2 border-primary/20 shadow-inner group transition-all hover:border-blue-500/20">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black leading-none mb-1">Active Field</div>
              <div className="text-xl font-black text-[#1a1a1b] leading-none">{players.length}+ Ranked Masters</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
             <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {/* Table Header - Hidden on Mobile */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-text/30 border-b border-base2/20">
              <div className="col-span-1">Rank</div>
              <div className="col-span-6">Elite Player</div>
              <div className="col-span-2 text-center text-primary/70">Mastery</div>
              <div className="col-span-3 text-right">Momentum</div>
            </div>

            {players.map((player, index) => {
              const isMe = user?._id === player._id;
              
              return (
                <motion.div 
                  key={player._id} 
                  variants={isMe ? {} : itemVariants}
                  initial={isMe ? { opacity: 1, y: 0 } : "hidden"}
                  animate={isMe ? { opacity: 1, y: 0 } : "visible"}
                >
                  <div className={`group relative backdrop-blur-xl border rounded-2xl p-2.5 md:px-6 md:py-3.5 transition-all duration-400 flex md:grid md:grid-cols-12 md:items-center gap-3 md:gap-4 overflow-hidden ${
                    isMe 
                    ? 'bg-primary/20 border-primary/40 ring-1 ring-primary/20' 
                    : index === 0 
                    ? 'bg-gradient-to-br from-primary/[0.06] to-transparent border-primary/20 shadow-sm' 
                    : index === 1
                    ? 'bg-gradient-to-br from-text/[0.04] to-transparent border-text/15'
                    : index === 2
                    ? 'bg-gradient-to-br from-orange/[0.04] to-transparent border-orange/15'
                    : 'bg-base3/40 border-base2/20 hover:bg-base2/10 hover:border-primary/10'
                  }`}>
                    {/* Artistic Breathing Glow for Top Players */}
                    {index < 3 && (
                      <motion.div 
                        className={`absolute -inset-10 opacity-[0.08] blur-[80px] pointer-events-none z-0 ${
                          index === 0 ? 'bg-primary' : index === 1 ? 'bg-text' : 'bg-orange'
                        }`}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.12, 0.05] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}

                    {/* Top Rank Shimmer */}
                    {index === 0 && <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-[0.1] z-0" />}
                    
                    {/* Combined Rank & Info for Mobile Horizontal Density */}
                    <div className="md:col-span-7 flex items-center gap-3 md:gap-4 relative z-10 flex-1 min-w-0">
                      {/* Rank Indicator */}
                      <div className={`shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center shadow-lg border transition-transform group-hover:scale-105 duration-400 ${
                        index === 0 ? 'bg-primary text-base3 border-primary/50 shadow-primary/20' :
                        index === 1 ? 'bg-text/5 border-text/10 text-text/50 ring-1 ring-text/5' :
                        index === 2 ? 'bg-orange/5 border-orange/10 text-orange/80 ring-1 ring-orange/5' :
                        'bg-base2/20 border-base2/40 text-text/25'
                      }`}>
                        {index < 3 ? getRankIcon(index) : <span className="font-black text-[9px] sm:text-[10px] tracking-tighter">#{index + 1}</span>}
                      </div>

                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl border overflow-hidden bg-base3 p-0.5 transition-all duration-400 ${
                          index === 0 ? 'border-primary shadow-sm scale-105' : isMe ? 'border-primary/40' : 'border-base2 group-hover:border-primary/20'
                        }`}>
                          {player.profilePhoto ? (
                            <img src={player.profilePhoto} alt={player.fullName} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/2 rounded-lg">
                              <User className="text-primary h-4 w-4 md:h-5 md:w-5 opacity-15" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Name & Bio */}
                      <div className="min-w-0">
                        <h3 className={`font-black tracking-tight transition-colors duration-400 truncate ${
                          index === 0 ? 'text-sm md:text-base text-primary' : isMe ? 'text-xs md:text-sm text-primary' : 'text-xs md:text-sm text-text-emphasis group-hover:text-primary'
                        }`}>
                          {player.fullName}
                        </h3>
                        <p className="hidden md:block text-[9px] text-text/30 font-bold italic truncate max-w-[200px]">
                          {player.bio || 'Elite competition master...'}
                        </p>
                      </div>
                    </div>

                    {/* Points & Momentum Combined for Mobile */}
                    <div className="md:col-span-5 flex items-center justify-end gap-3 md:gap-10 relative z-10 shrink-0">
                      <div className="flex flex-col md:items-center">
                        <span className="hidden md:block text-[7px] font-black uppercase tracking-[0.3em] text-text/15 mb-0.5">Points</span>
                        <div className={`font-black tabular-nums transition-all duration-400 ${
                          index === 0 ? 'text-base md:text-xl text-primary' : isMe ? 'text-sm md:text-base text-primary' : 'text-sm md:text-base text-text-emphasis group-hover:text-primary'
                        }`}>
                          {player.points || 0}
                        </div>
                      </div>

                      <div className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border transition-all duration-400 ${
                        isMe ? 'bg-primary/10 border-primary/20' : index === 0 ? 'bg-primary/5 border-primary/10' : 'bg-base2/5 border-transparent group-hover:border-base2/40'
                      }`}>
                        {player.rankTrend === 'up' && <ChevronUp size={10} className="text-green" />}
                        {player.rankTrend === 'down' && <ChevronDown size={10} className="text-red" />}
                        {player.rankTrend === 'new' && <Info size={10} className="text-primary" />}
                        {(!player.rankTrend || player.rankTrend === 'stable') && <Minus size={10} className="text-text/20" />}
                        <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${
                          player.rankTrend === 'up' ? 'text-green' :
                          player.rankTrend === 'down' ? 'text-red' :
                          player.rankTrend === 'new' ? 'text-primary' : 'text-text/30'
                        }`}>
                          {player.rankTrend || 'STABLE'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Personalized "Me" row if not in top list */}
            {user?.role === 'player' && myRankData && !players.find(p => p._id === user._id) && (
              <div className="pt-2 border-t border-primary/20 mt-4">
                <div className="group relative backdrop-blur-xl border border-primary/40 bg-primary/20 ring-1 ring-primary/20 rounded-2xl p-2.5 md:px-6 md:py-3.5 transition-all duration-400 flex md:grid md:grid-cols-12 md:items-center gap-3 md:gap-4 overflow-hidden">
                  {/* Combined Rank & Info for Mobile */}
                  <div className="md:col-span-7 flex items-center gap-3 md:gap-4 relative z-10 flex-1 min-w-0">
                    {/* Rank Indicator */}
                    <div className="shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center shadow-lg border bg-base2/40 border-primary/30 text-primary">
                       <span className="font-black text-[9px] sm:text-[10px] tracking-tighter">#{myRankData.rank}</span>
                    </div>

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl border border-primary/40 overflow-hidden bg-base3 p-0.5">
                        {user.profilePhoto ? (
                          <img src={user.profilePhoto} alt={user.fullName} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/2 rounded-lg">
                            <User className="text-primary h-4 w-4 md:h-5 md:w-5 opacity-15" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Name & Bio */}
                    <div className="min-w-0">
                      <h3 className="font-black tracking-tight text-xs md:text-sm text-primary truncate">
                        {user.fullName} <span className="text-[10px] text-primary/60 font-medium ml-1">(Me)</span>
                      </h3>
                      <p className="hidden md:block text-[9px] text-text/30 font-bold italic truncate max-w-[200px]">
                        {user.bio || 'Aiming for the top...'}
                      </p>
                    </div>
                  </div>

                  {/* Points & Momentum Combined for Mobile */}
                  <div className="md:col-span-5 flex items-center justify-end gap-3 md:gap-10 relative z-10 shrink-0">
                    <div className="flex flex-col md:items-center">
                      <span className="hidden md:block text-[7px] font-black uppercase tracking-[0.3em] text-text/15 mb-0.5">Points</span>
                      <div className="font-black tabular-nums text-sm md:text-base text-primary">
                        {myRankData.points}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border bg-primary/5 border-primary/10">
                      <Minus size={10} className="text-text/20" />
                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-text/30">
                        STABLE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;

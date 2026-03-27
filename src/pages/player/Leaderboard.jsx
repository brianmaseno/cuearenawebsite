import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, TrendingUp, User } from 'lucide-react';
import AuraCard from '../../components/AuraCard';

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await api.get('/users');
      // Sort by points descending
      const sorted = data
        .filter(p => p.role === 'player')
        .sort((a, b) => (b.points || 0) - (a.points || 0))
        .slice(0, 20); // Top 20
      setPlayers(sorted);
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
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Trophy className="text-yellow-400 h-8 w-8" />
            Global Hall of Fame
          </h1>
          <p className="text-gray-400">The world's most elite cue masters. Are you among them?</p>
        </div>
        <div className="bg-dark-lighter p-4 rounded-xl border border-white/5 flex items-center gap-4 bg-opacity-50 backdrop-blur-md">
          <TrendingUp className="text-primary w-6 h-6" />
          <div>
            <div className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Active Players</div>
            <div className="text-xl font-bold text-white">{players.length}+ Ranked</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-dark-lighter rounded-2xl border border-white/5"></div>
          ))}
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {players.map((player, index) => (
            <motion.div key={player._id} variants={itemVariants}>
              <AuraCard className="h-full overflow-hidden relative group">
                <div className="absolute top-4 right-4 z-10">
                  {getRankIcon(index)}
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full border-2 border-primary/30 overflow-hidden bg-dark-lighter ring-4 ring-white/5">
                    {player.profilePhoto ? (
                      <img src={player.profilePhoto} alt={player.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <User className="text-primary h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors truncate max-w-[150px]">
                      {player.fullName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <span className="font-mono text-primary font-bold">{player.points || 0} PTS</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium italic">"{player.bio || 'Challenger...'}"</span>
                  </div>
                  
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">Status</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        player.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {player.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">Trend</span>
                      <div className="flex items-center gap-1 text-sm font-bold text-white">
                        {player.rankTrend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                        {player.rankTrend === 'down' && <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />}
                        {(!player.rankTrend || player.rankTrend === 'stable') && <div className="w-2 h-0.5 bg-gray-500 rounded-full" />}
                        <span className="uppercase text-[10px]">{player.rankTrend || 'STABLE'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Visual Accent */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 blur-3xl rounded-full group-hover:bg-primary/20 transition-all duration-700" />
              </AuraCard>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Leaderboard;

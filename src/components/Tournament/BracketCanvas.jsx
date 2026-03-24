import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Activity, Eye, Settings } from 'lucide-react';

const BracketCanvas = ({ tournament, onMatchClick, user }) => {
   const containerRef = useRef(null);
   const innerRef = useRef(null);
   const [scale, setScale] = useState(1);

   useEffect(() => {
      const calculateScale = () => {
         if (!containerRef.current || !innerRef.current) return;
         
         const containerWidth = containerRef.current.offsetWidth;
         const innerWidth = innerRef.current.scrollWidth;
         
         if (innerWidth > containerWidth) {
            const newScale = containerWidth / (innerWidth + 40); // 40px buffer
            setScale(Math.max(0.4, newScale)); 
         } else {
            setScale(1);
         }
      };

      calculateScale();
      window.addEventListener('resize', calculateScale);
      
      const observer = new ResizeObserver(calculateScale);
      if (containerRef.current) observer.observe(containerRef.current);

      return () => {
         window.removeEventListener('resize', calculateScale);
         observer.disconnect();
      };
   }, [tournament]);

   const BracketMatchCard = ({ match, isFinal = false, onClick }) => {
      const isOngoing = match.status === 'ongoing';
      const isCompleted = match.status === 'completed';
      const isModerator = user?.role === 'moderator' || user?.role === 'admin';

      return (
         <div 
            onClick={onClick}
            className={`group relative p-2.5 rounded-2xl bg-base3/95 backdrop-blur-xl border-2 transition-all duration-500 shadow-sm min-w-[190px] cursor-pointer
               ${isOngoing ? 'border-primary/60 shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.15)] animate-pulse-glow z-30' : 
                 isFinal ? 'border-yellow/40 bg-yellow/5 hover:border-yellow/60' : 
                 match.matchType === 'third_place_playoff' ? 'border-violet/40 bg-violet/5 hover:border-violet/60' :
                 'border-base2/40 hover:border-primary/40 hover:shadow-lg'}
            `}
         >
            {/* Live Status Badge */}
            {isOngoing && (
               <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-base3 text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full shadow-lg shadow-primary/30 flex items-center gap-1.5 z-40 animate-bounce-subtle font-sans">
                  <span className="flex h-1.5 w-1.5 relative">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-base3 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-base3"></span>
                  </span>
                  LIVE
               </div>
            )}

            {match.rankLabel && (
               <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 z-40 whitespace-nowrap
                  ${match.matchType === 'third_place_playoff' ? 'bg-violet text-white shadow-violet/30' : 'bg-base2 text-text shadow-base1/30'}
               `}>
                  {match.rankLabel}
               </div>
            )}

            {/* Quick Action Hint */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center z-10 pointer-events-none">
               <div className="bg-base3/90 backdrop-blur-sm px-2 py-1 rounded-xl border border-primary/20 shadow-xl scale-90 group-hover:scale-100 transition-transform flex items-center gap-1.5">
                  {isModerator ? <Settings size={10} className="text-primary" /> : <Eye size={10} className="text-primary" />}
                  <span className="text-[8px] font-black text-primary uppercase tracking-widest font-sans">{isModerator ? 'Manage' : 'View'}</span>
               </div>
            </div>

            <div className="flex flex-col gap-1.5 relative z-20">
               {[
                  { id: match.player1Id, score: match.scorePlayer1, accepted: match.player1Accepted },
                  { id: match.player2Id, score: match.scorePlayer2, accepted: match.player2Accepted }
               ].map((p, i) => {
                  const isWinner = isCompleted && (match.winnerId?._id || match.winnerId) === (p.id?._id || p.id);
                  const isLoser = isCompleted && (match.winnerId?._id || match.winnerId) && (match.winnerId?._id || match.winnerId) !== (p.id?._id || p.id);
                  
                  return (
                     <div key={i} className={`flex items-center justify-between px-2 py-1.5 rounded-xl transition-all duration-300 ${
                        isWinner ? 'bg-green/10 text-green font-bold scale-[1.01] border border-green/10 shadow-sm' : 
                        isLoser ? 'opacity-25 grayscale' : 'text-text/80'
                     }`}>
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                           <div className={`w-1.5 h-1.5 rounded-full shadow-sm ${
                              p.id ? (p.accepted ? 'bg-green animate-pulse-slow' : 'bg-orange') : 'bg-base2/50'
                           }`}></div>
                           <span className="text-[12px] font-bold font-sans tracking-tight truncate max-w-[130px] leading-tight">
                              {p.id?.fullName || 'TBD'}
                           </span>
                        </div>
                        <span className={`text-[14px] font-black font-mono shrink-0 ${isWinner ? 'text-green' : isOngoing ? 'text-primary' : 'text-text/40'}`}>
                           {p.score || 0}
                        </span>
                     </div>
                  );
               })}
            </div>
         </div>
      );
   };

   if (!tournament) return null;

   if (!tournament.matches || tournament.matches.length === 0) {
      return (
         <div className="bracket-canvas-fixed flex flex-col items-center justify-center p-8 text-center bg-base3/10 min-h-[400px]">
            <Trophy size={40} className="text-base2 mb-4 opacity-50" />
            <h4 className="text-xl font-bold text-text-emphasis mb-2 opacity-60 font-sans">Bracket Will Appear Soon</h4>
            <p className="text-sm text-text/40 max-w-sm font-sans mx-auto">
               The tournament tree will be generated once registration closes.
            </p>
         </div>
      );
   }

   const sortedRounds = [...new Set(tournament.matches.map(m => m.round))].sort((a, b) => a - b);
   const maxRound = Math.max(...sortedRounds);

   return (
      <section className="mt-4 space-y-4 animate-in fade-in duration-700 overflow-hidden font-sans">
         <style>
            {`
               @keyframes pulse-glow {
                  0%, 100% { border-color: rgba(var(--color-primary-rgb), 0.6); box-shadow: 0 0 15px rgba(var(--color-primary-rgb), 0.1); }
                  50% { border-color: rgba(var(--color-primary-rgb), 0.9); box-shadow: 0 0 30px rgba(var(--color-primary-rgb), 0.2); }
               }
               @keyframes bounce-subtle {
                  0%, 100% { transform: translate(-50%, 0); }
                  50% { transform: translate(-50%, -3px); }
               }
               @keyframes pulse-slow {
                  0%, 100% { opacity: 1; transform: scale(1); }
                  50% { opacity: 0.6; transform: scale(0.9); }
               }

               .animate-pulse-glow { animation: pulse-glow 2.5s infinite ease-in-out; }
               .animate-bounce-subtle { animation: bounce-subtle 3s infinite ease-in-out; }
               .animate-pulse-slow { animation: pulse-slow 2.5s infinite ease-in-out; }

               .bracket-compact-container {
                  display: flex;
                  gap: 1.25rem;
                  padding: 1.5rem 0.5rem;
                  transform-origin: top left;
                  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
               }

               .round-column {
                  display: flex;
                  flex-direction: column;
                  justify-content: space-around;
                  gap: 0.75rem;
                  position: relative;
                  width: 200px;
               }

               .round-header {
                  padding: 0.4rem;
                  background: var(--color-base3);
                  border-radius: 12px;
                  text-align: center;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                  margin-bottom: 1rem;
                  border: 1px solid var(--color-base2);
               }

               .match-node {
                  position: relative;
                  z-index: 10;
                  padding: 0.25rem 0;
               }

               /* Connectors */
               .match-node::after {
                  content: '';
                  position: absolute;
                  right: -0.625rem;
                  top: 50%;
                  width: 0.625rem;
                  height: 1.5px;
                  background: var(--color-base2);
                  opacity: 0.15;
               }

               .round-column:last-of-type .match-node::after { display: none; }

               .round-column:not(:first-of-type) .match-node::before {
                  content: '';
                  position: absolute;
                  left: -0.625rem;
                  top: 0;
                  bottom: 0;
                  width: 1.5px;
                  background: var(--color-base2);
                  opacity: 0.15;
               }

               .bracket-canvas-fixed {
                  background-image: radial-gradient(var(--color-base2) 0.5px, transparent 0.5px);
                  background-size: 16px 16px;
                  border-radius: 1.5rem;
                  border: 1px border-base2/20;
                  min-height: 400px;
                  display: flex;
                  justify-content: center;
                  overflow: hidden;
                  background-color: rgba(var(--color-base3-rgb), 0.2);
               }
            `}
         </style>

         <div ref={containerRef} className="bracket-canvas-fixed">
            <div ref={innerRef} className="bracket-compact-container" style={{ transform: `scale(${scale})` }}>
               {sortedRounds.map(roundNum => (
                  <div key={`round-${roundNum}`} className="round-column">
                     <div className="round-header">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 font-sans">
                           {roundNum === maxRound 
                               ? (tournament.matches.filter(m => m.round === maxRound).length > 1 ? 'Finals & Playoff' : 'Final') 
                               : `Stage ${roundNum}`}
                        </span>
                     </div>
                     <div className="flex-1 flex flex-col justify-around py-2">
                        {tournament.matches
                           .filter(m => m.round === roundNum)
                           .sort((a, b) => a.matchIndex - b.matchIndex)
                           .map(match => (
                              <div key={match._id} className="match-node">
                                 <BracketMatchCard 
                                    match={match} 
                                    isFinal={roundNum === maxRound}
                                    onClick={() => onMatchClick?.(match)} 
                                 />
                                 
                                 {match.status === 'ongoing' && roundNum < maxRound && (
                                    <div className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                                       <Activity size={12} className="text-primary animate-pulse" />
                                    </div>
                                 )}
                              </div>
                           ))}
                     </div>
                  </div>
               ))}

               {tournament.winner && (
                  <div className="round-column flex items-center justify-center pl-6 border-l border-dashed border-base2/20">
                     <div className="text-center p-6 bg-gradient-to-br from-yellow/10 to-transparent rounded-[32px] border-2 border-yellow/30 shadow-2xl shadow-yellow/5">
                        <Trophy size={32} className="text-yellow mx-auto mb-3 drop-shadow-lg" />
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-yellow mb-2 font-sans text-center">Victor</p>
                        <h3 className="text-base font-black text-text-emphasis truncate max-w-[150px] uppercase tracking-tighter font-sans">{tournament.winner?.fullName}</h3>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </section>
   );
};

export default BracketCanvas;

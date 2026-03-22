import React, { useState, useEffect, useRef } from 'react';
import { Trophy, ChevronRight } from 'lucide-react';

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
            setScale(Math.max(0.4, newScale)); // Don't scale below 40%
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

   const BracketMatchCard = ({ match, isFinal = false, onClick }) => (
      <div 
         onClick={onClick}
         className={`group relative p-2 rounded-xl bg-base3/90 backdrop-blur-md border border-base2/50 transition-all shadow-sm min-w-[150px] cursor-pointer
            ${isFinal ? 'ring-1 ring-yellow/40 bg-yellow/5 hover:border-yellow/60' : 'hover:border-primary/40 hover:shadow-md'}
         `}
      >
         <div className="flex flex-col gap-1">
            {[
               { id: match.player1Id, score: match.scorePlayer1, accepted: match.player1Accepted },
               { id: match.player2Id, score: match.scorePlayer2, accepted: match.player2Accepted }
            ].map((p, i) => {
               const isWinner = (match.winnerId?._id || match.winnerId) === (p.id?._id || p.id) && match.status === 'completed';
               const isLoser = (match.winnerId?._id || match.winnerId) && (match.winnerId?._id || match.winnerId) !== (p.id?._id || p.id) && match.status === 'completed';
               return (
                  <div key={i} className={`flex items-center justify-between px-2 py-1 rounded-lg transition-all duration-300 ${
                     isWinner ? 'bg-green/10 text-green font-bold' : 
                     isLoser ? 'opacity-30 grayscale' : 'text-text/70'
                  }`}>
                     <div className="flex items-center gap-2 overflow-hidden mr-2">
                        <div className={`w-1 h-1 rounded-full ${p.id ? (p.accepted ? 'bg-green' : 'bg-orange') : 'bg-base2'}`}></div>
                        <span className="text-[11px] font-bold tracking-tight truncate max-w-[100px]">
                           {p.id?.fullName || 'TBD'}
                        </span>
                     </div>
                     <span className={`text-[11px] font-black font-mono shrink-0 ${isWinner ? 'text-green' : 'text-primary'}`}>
                        {p.score || 0}
                     </span>
                  </div>
               );
            })}
         </div>
      </div>
   );

   if (!tournament || (tournament.status !== 'ongoing' && tournament.status !== 'completed')) return null;

   const sortedRounds = [...new Set(tournament.matches.map(m => m.round))].sort((a, b) => a - b);
   const maxRound = Math.max(...sortedRounds);

   return (
      <section className="mt-4 space-y-4 animate-in fade-in duration-500 overflow-hidden">
         <style>
            {`
               .bracket-compact-container {
                  display: flex;
                  gap: 1.5rem;
                  padding: 1rem;
                  transform-origin: top left;
                  transition: transform 0.3s ease-out;
               }

               .round-column {
                  display: flex;
                  flex-direction: column;
                  justify-content: space-around;
                  gap: 1.5rem;
                  position: relative;
                  width: 160px;
               }

               .round-header {
                  padding: 0.4rem;
                  background: var(--color-base3);
                  border-radius: 8px;
                  border: 1px border-base2;
                  text-align: center;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                  margin-bottom: 1rem;
               }

               .match-node {
                  position: relative;
                  z-index: 10;
                  padding: 0.5rem 0;
               }

               /* Compact Connector Lines */
               .match-node::after {
                  content: '';
                  position: absolute;
                  right: -0.75rem;
                  top: 50%;
                  width: 0.75rem;
                  height: 1px;
                  background: var(--color-base2);
                  opacity: 0.2;
               }

               .round-column:last-of-type .match-node::after {
                  display: none;
               }

               .round-column:not(:first-of-type) .match-node::before {
                  content: '';
                  position: absolute;
                  left: -0.75rem;
                  top: 0;
                  bottom: 0;
                  width: 1px;
                  background: var(--color-base2);
                  opacity: 0.2;
               }

               .bracket-canvas-fixed {
                  background-image: radial-gradient(var(--color-base2) 0.5px, transparent 0.5px);
                  background-size: 16px 16px;
                  border-radius: 1.5rem;
                  border: 1px border-base2/30;
                  min-height: 400px;
                  display: flex;
                  justify-content: center;
                  overflow: hidden;
               }
            `}
         </style>

         <div 
            ref={containerRef}
            className="bracket-canvas-fixed bg-base3/20"
         >
            <div 
               ref={innerRef}
               className="bracket-compact-container"
               style={{ transform: `scale(${scale})` }}
            >
               {sortedRounds.map(roundNum => (
                  <div key={`round-${roundNum}`} className="round-column">
                     <div className="round-header">
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">
                           {roundNum === maxRound ? 'Final' : `Round ${roundNum}`}
                        </span>
                     </div>
                     <div className="flex-1 flex flex-col justify-around py-4">
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
                                 
                                 {match.winnerId && roundNum < maxRound && (
                                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none opacity-40">
                                       <ChevronRight size={12} className="text-primary" />
                                    </div>
                                 )}
                              </div>
                           ))}
                     </div>
                  </div>
               ))}

               {/* Standardized Champion Stage */}
               {tournament.winner && (
                  <div className="round-column flex items-center justify-center pl-4 border-l border-dashed border-base2/20">
                     <div className="text-center p-4 bg-yellow/5 rounded-2xl border border-yellow/20">
                        <Trophy size={20} className="text-yellow mx-auto mb-2" />
                        <p className="text-[8px] font-black uppercase tracking-widest text-yellow/60 mb-1">Victor</p>
                        <h3 className="text-sm font-black text-text-emphasis truncate max-w-[120px]">{tournament.winner.fullName.split(' ')[0]}</h3>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </section>
   );
};

export default BracketCanvas;

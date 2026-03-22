import React, { useState, useRef } from 'react';
import { Trophy } from 'lucide-react';

const BracketCanvas = ({ tournament, onMatchClick, user }) => {
   const [isDragging, setIsDragging] = useState(false);
   const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
   const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
   const bracketRef = useRef(null);

   const handleMouseDown = (e) => {
      if (!bracketRef.current) return;
      setIsDragging(true);
      setDragStart({ x: e.pageX - bracketRef.current.offsetLeft, y: e.pageY - bracketRef.current.offsetTop });
      setScrollStart({ x: bracketRef.current.scrollLeft, y: bracketRef.current.scrollTop });
   };

   const handleMouseMove = (e) => {
      if (!isDragging || !bracketRef.current) return;
      e.preventDefault();
      const x = e.pageX - bracketRef.current.offsetLeft;
      const y = e.pageY - bracketRef.current.offsetTop;
      const walkX = (x - dragStart.x) * 1.5;
      const walkY = (y - dragStart.y) * 1.5;
      bracketRef.current.scrollLeft = scrollStart.x - walkX;
      bracketRef.current.scrollTop = scrollStart.y - walkY;
   };

   const handleMouseUpOrLeave = () => {
      setIsDragging(false);
   };

   const BracketMatchCard = ({ match, isFinal = false, onClick }) => (
      <div 
         onClick={onClick}
         className={`group relative p-3.5 rounded-2xl bg-base3/80 backdrop-blur-md border border-base2/50 transition-all shadow-sm min-w-[180px] cursor-pointer
            ${isFinal ? 'ring-2 ring-yellow/40 bg-yellow/5 hover:border-yellow/60 scale-110' : 'hover:border-primary/40 hover:shadow-md'}
         `}
      >
         {/* Subtle Status Indicator */}
         <div className="absolute -top-1 -right-1">
            {match.status === 'pending_invites' ? (
               <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange"></span>
               </span>
            ) : match.status === 'ongoing' ? (
               <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
               </span>
            ) : null}
         </div>

         <div className="flex flex-col gap-1.5">
            {[
               { id: match.player1Id, score: match.scorePlayer1, accepted: match.player1Accepted },
               { id: match.player2Id, score: match.scorePlayer2, accepted: match.player2Accepted }
            ].map((p, i) => {
               const isWinner = (match.winnerId?._id || match.winnerId) === (p.id?._id || p.id) && match.status === 'completed';
               const isLoser = (match.winnerId?._id || match.winnerId) && (match.winnerId?._id || match.winnerId) !== (p.id?._id || p.id) && match.status === 'completed';
               return (
                  <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 ${
                     isWinner ? 'bg-green/10 text-green font-bold scale-[1.02] shadow-sm' : 
                     isLoser ? 'opacity-40 grayscale-[0.5]' : 'text-text/80'
                  }`}>
                     <div className="flex items-center gap-2.5 overflow-hidden mr-4">
                        <div className={`w-1.5 h-1.5 rounded-full ${p.id ? (p.accepted ? 'bg-green' : 'bg-orange') : 'bg-base2'}`}></div>
                        <span className="text-sm font-bold tracking-tight truncate max-w-[110px]">
                           {p.id?.fullName || 'TBD'}
                           {p.id?._id === user?._id && <span className="opacity-70 text-[10px] ml-1 font-black">(me)</span>}
                        </span>
                     </div>
                     <span className={`text-sm font-black font-mono shrink-0 ${isWinner ? 'text-green' : 'text-primary'}`}>
                        {p.score || 0}/{match.setsCount || 1}
                     </span>
                  </div>
               );
            })}
         </div>
      </div>
   );

   if (!tournament || (tournament.status !== 'ongoing' && tournament.status !== 'completed')) return null;

   return (
      <section className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
         <style>
            {`
               .bracket-column {
                  display: flex;
                  flex-direction: column;
                  justify-content: space-around;
                  gap: 1.5rem;
                  position: relative;
               }
               .match-card-wrapper {
                  position: relative;
                  padding: 0.25rem 0;
                  z-index: 10;
               }

               /* Professional Connectors - Left Side */
               .left-wing .bracket-column::after {
                  content: '';
                  position: absolute;
                  right: calc(var(--bracket-gap) / -2);
                  top: 25%;
                  bottom: 25%;
                  width: 2px;
                  background: var(--color-base2);
                  opacity: 0.4;
               }

               .left-wing .match-card-wrapper::after {
                  content: '';
                  position: absolute;
                  right: calc(var(--bracket-gap) / -2);
                  top: 50%;
                  width: calc(var(--bracket-gap) / 2);
                  height: 2px;
                  background: var(--color-base2);
                  opacity: 0.4;
               }
               
               .left-wing .match-card-wrapper.has-prev::before {
                  content: '';
                  position: absolute;
                  left: calc(var(--bracket-gap) / -2);
                  top: 50%;
                  width: calc(var(--bracket-gap) / 2);
                  height: 2px;
                  background: var(--color-base2);
                  opacity: 0.4;
               }

               /* Professional Connectors - Right Side */
               .right-wing .bracket-column::after {
                  content: '';
                  position: absolute;
                  left: calc(var(--bracket-gap) / -2);
                  top: 25%;
                  bottom: 25%;
                  width: 2px;
                  background: var(--color-base2);
                  opacity: 0.4;
               }

               .right-wing .match-card-wrapper::after {
                  content: '';
                  position: absolute;
                  left: calc(var(--bracket-gap) / -2);
                  top: 50%;
                  width: calc(var(--bracket-gap) / 2);
                  height: 2px;
                  background: var(--color-base2);
                  opacity: 0.4;
               }
               
               .right-wing .match-card-wrapper.has-prev::before {
                  content: '';
                  position: absolute;
                  right: calc(var(--bracket-gap) / -2);
                  top: 50%;
                  width: calc(var(--bracket-gap) / 2);
                  height: 2px;
                  background: var(--color-base2);
                  opacity: 0.4;
               }

               /* Final Stage Connectors */
               .final-match-card-anchor::before {
                  content: '';
                  position: absolute;
                  left: -5rem;
                  top: 50%;
                  width: 5rem;
                  height: 2px;
                  background: var(--color-base2);
                  opacity: 0.4;
               }
               .final-match-card-anchor::after {
                  content: '';
                  position: absolute;
                  right: -5rem;
                  top: 50%;
                  width: 5rem;
                  height: 2px;
                  background: var(--color-base2);
                  opacity: 0.4;
               }

               .thin-scrollbar::-webkit-scrollbar {
                  height: 6px;
                  width: 6px;
               }
               .thin-scrollbar::-webkit-scrollbar-thumb {
                  background: var(--color-primary);
                  border-radius: 10px;
               }

               /* Dynamic Spacing & Blueprint Grid */
               :root {
                  --bracket-gap: 8rem;
               }
               @media (max-width: 1400px) { :root { --bracket-gap: 6rem; } }
               @media (max-width: 1200px) { :root { --bracket-gap: 4rem; } }
               @media (max-width: 768px) { :root { --bracket-gap: 2.5rem; } }

               .bracket-canvas {
                  background-image: radial-gradient(var(--color-base2) 1.5px, transparent 1.5px);
                  background-size: 40px 40px;
                  background-position: -1px -1px;
                  background-attachment: local;
                  border-radius: 2.5rem;
                  position: relative;
               }

               .bracket-canvas::before {
                  content: '';
                  position: absolute;
                  inset: 0;
                  background: linear-gradient(to right, var(--color-base3), transparent 15%, transparent 85%, var(--color-base3));
                  pointer-events: none;
                  z-index: 5;
                  border-radius: 2.5rem;
               }
            `}
         </style>

         <div 
            ref={bracketRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={`overflow-auto pb-12 pt-8 px-12 thin-scrollbar bracket-canvas select-none border border-base2/30 shadow-inner ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ maxHeight: '85vh' }}
         >
            <div className="flex justify-center items-stretch py-16" style={{ minWidth: 'max-content' }}>
               
               {/* LEFT WING */}
               <div className="flex items-stretch left-wing" style={{ gap: 'var(--bracket-gap)' }}>
                  {tournament.matches && [...new Set(tournament.matches.map(m => m.round))]
                     .filter(r => r < Math.max(...tournament.matches.map(m => m.round)))
                     .sort((a, b) => a - b)
                     .map(roundNum => (
                        <div key={`left-r-${roundNum}`} className="bracket-column">
                           <div className="sticky top-0 z-[60] py-3 bg-base3/90 backdrop-blur-md rounded-xl border border-base2/50 shadow-sm mb-6 text-center transform hover:scale-105 transition-transform duration-300">
                              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Round {roundNum}</h4>
                           </div>
                           <div className="flex-1 flex flex-col justify-around gap-12">
                              {tournament.matches
                                  .filter(m => m.round === roundNum && m.matchIndex < (tournament.matches.filter(mf => mf.round === roundNum).length / 2))
                                  .map(match => (
                                     <div key={match._id} className={`match-card-wrapper ${roundNum > 1 ? 'has-prev' : ''}`}>
                                        <BracketMatchCard match={match} onClick={() => onMatchClick?.(match)} />
                                        {match.winnerId && tournament.status !== 'pending_invites' && (
                                           <div className="absolute right-[calc(var(--bracket-gap)*-0.5)] top-1/2 -translate-y-1/2 w-[calc(var(--bracket-gap)*0.5)] flex items-center justify-center z-10 pointer-events-none animate-in fade-in zoom-in duration-500">
                                              <div className="bg-base2/90 backdrop-blur-sm border-2 border-primary/20 shadow-xl px-4 py-1.5 rounded-full text-center truncate max-w-[90%] transform translate-x-1/2">
                                                 <span className="text-[11px] font-black text-primary truncate leading-none uppercase tracking-tighter shadow-sm">{match.winnerId.fullName}</span>
                                              </div>
                                           </div>
                                        )}
                                     </div>
                                  ))}
                           </div>
                        </div>
                     ))}
               </div>

               {/* CENTER STAGE - Finals */}
               <div className="flex flex-col items-center justify-center px-24 relative">
                  {/* Vertical Ornamentation */}
                  <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent"></div>
                  <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent"></div>
                  
                  <div className="mb-12 text-center animate-in slide-in-from-top-4 duration-700">
                     <div className="inline-flex items-center gap-3 bg-yellow/10 px-8 py-3 rounded-full border-2 border-yellow/20 shadow-2xl animate-bounce-subtle">
                        <Trophy size={20} className="text-yellow" />
                        <h4 className="text-[14px] font-black uppercase tracking-[0.4em] text-yellow drop-shadow-sm">Grand Finale</h4>
                     </div>
                  </div>

                  {tournament.status === 'completed' && tournament.winner && (
                     <div className="mb-12 p-8 bg-gradient-to-br from-yellow/30 via-yellow/10 to-transparent rounded-[32px] border-2 border-yellow/40 shadow-[0_0_50px_rgba(255,191,0,0.15)] text-center group animate-in zoom-in-90 duration-1000 relative">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow px-4 py-1 rounded-full text-[9px] font-black text-base3 uppercase tracking-[0.2em] shadow-lg">Champion</div>
                        <div className="text-3xl font-black text-text-emphasis tracking-tight group-hover:scale-105 transition-transform duration-500">{tournament.winner.fullName}</div>
                        <div className="text-[10px] text-text/40 font-bold uppercase mt-2 tracking-widest">{tournament.name} Victor</div>
                     </div>
                  )}

                  {tournament.matches && tournament.matches
                   .filter(m => m.round === Math.max(...tournament.matches.map(mf => mf.round)))
                   .map(match => (
                      <div key={match._id} className="final-match-card-anchor relative z-20 transform hover:scale-105 transition-all duration-500">
                         <BracketMatchCard match={match} isFinal={true} onClick={() => onMatchClick?.(match)} />
                      </div>
                   ))}
               </div>

               {/* RIGHT WING - Rounds before Final (Reversed) */}
               <div className="flex items-stretch right-wing" style={{ gap: 'var(--bracket-gap)' }}>
                  {tournament.matches && [...new Set(tournament.matches.map(m => m.round))]
                     .filter(r => r < Math.max(...tournament.matches.map(m => m.round)))
                     .sort((a, b) => b - a)
                     .map(roundNum => (
                        <div key={`right-r-${roundNum}`} className="bracket-column">
                           <div className="sticky top-0 z-[60] py-3 bg-base3/90 backdrop-blur-md rounded-xl border border-base2/50 shadow-sm mb-6 text-center transform hover:scale-105 transition-transform duration-300">
                              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Round {roundNum}</h4>
                           </div>
                           <div className="flex-1 flex flex-col justify-around gap-12">
                              {tournament.matches
                                  .filter(m => m.round === roundNum && m.matchIndex >= (tournament.matches.filter(mf => mf.round === roundNum).length / 2))
                                  .map(match => (
                                     <div key={match._id} className={`match-card-wrapper ${roundNum > 1 ? 'has-prev' : ''}`}>
                                        <BracketMatchCard match={match} onClick={() => onMatchClick?.(match)} />
                                        {match.winnerId && tournament.status !== 'pending_invites' && (
                                           <div className="absolute left-[calc(var(--bracket-gap)*-0.5)] top-1/2 -translate-y-1/2 w-[calc(var(--bracket-gap)*0.5)] flex items-center justify-center z-10 pointer-events-none animate-in fade-in zoom-in duration-500">
                                              <div className="bg-base2/90 backdrop-blur-sm border-2 border-primary/20 shadow-xl px-4 py-1.5 rounded-full text-center truncate max-w-[90%] transform -translate-x-1/2">
                                                 <span className="text-[11px] font-black text-primary truncate leading-none uppercase tracking-tighter shadow-sm">{match.winnerId.fullName}</span>
                                              </div>
                                           </div>
                                        )}
                                     </div>
                                  ))}
                           </div>
                        </div>
                     ))}
               </div>
            </div>
         </div>
      </section>
   );
};

export default BracketCanvas;

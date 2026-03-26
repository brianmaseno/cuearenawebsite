import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Calendar, ArrowRight, Target, MapPin, Shield, Zap, Globe, Star, Send, Loader2, User, Mail, Phone, Menu, X, LogIn, ChevronUp, ChevronDown, Minus, Info } from 'lucide-react';
import { animate } from 'framer-motion';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

const AnimatedCounter = ({ value, duration = 2, suffix = "" }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const isK = value.toString().includes('k');
    const targetValue = isK ? parseFloat(value.toString()) * 1000 : parseInt(value);
    
    const controls = animate(0, targetValue, {
      duration: duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        setCount(Math.floor(latest));
      }
    });
    
    return () => controls.stop();
  }, [value, duration]);

  const displayValue = count >= 1000 ? (count / 1000).toFixed(1) + 'k' : count;
  return <span>{displayValue}{suffix}</span>;
};

const Landing = () => {
  const [tournaments, setTournaments] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({ totalTournaments: 0, totalMatches: 0, totalPlayers: 0 });
  const [loading, setLoading] = useState(true);
  const [footerForm, setFooterForm] = useState({ fullName: '', email: '', phone: '' });
  const [footerSubmitting, setFooterSubmitting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.pageYOffset / totalScroll) * 100;
      setScrollProgress(progress);
    };

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleFooterSubmit = async (e) => {
    e.preventDefault();
    if (!footerForm.fullName || !footerForm.email || !footerForm.phone) {
      return toast.error('Please fill in Name, Email and Phone');
    }

    setFooterSubmitting(true);
    try {
      await api.post('/moderator-requests', {
        ...footerForm,
        experience: 'Applied via landing page footer.'
      });
      toast.success('Application sent! We will contact you soon.');
      setFooterForm({ fullName: '', email: '', phone: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setFooterSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tResponse, sResponse, lResponse] = await Promise.all([
          api.get('/tournaments'),
          api.get('/tournaments/public/stats'),
          api.get('/users/leaderboard?limit=10')
        ]);
        
        const active = tResponse.data
          .filter(t => ['open_for_players', 'full', 'ongoing'].includes(t.status) && t.entryType === 'open_request')
          .slice(0, 4);
        
        setTournaments(active);
        setStats(sResponse.data);
        setLeaderboard(lResponse.data);
      } catch (err) {
        console.error('Error fetching landing data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 relative">
      {/* Global Cursor Glow */}
      <div 
        className="fixed pointer-events-none z-[9999] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 hidden lg:block"
        style={{ left: mousePos.x, top: mousePos.y, opacity: 0.4 }}
      />

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[1000]">
        <motion.div 
          className="h-full bg-gradient-to-r from-primary via-indigo-500 to-special-red"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <nav className="border-b border-base2/50 bg-base3/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group relative">
            <span className="text-xl md:text-2xl brand-premium font-black tracking-tight">Cue-Arena</span>
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-text/60 hover:text-primary transition-colors"
          >
            <Menu size={24} />
          </button>

          <div className="hidden md:flex items-center gap-10">
            <Link to="/login" className="text-text hover:text-primary font-bold transition-all">Login</Link>
            <Link to="/register" className="btn-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 px-6 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0">
              Get started
            </Link>
          </div>

        </div>
      </nav>

      {/* Mobile Menu Overlay - Final Polished Style */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/5 backdrop-blur-[1px] z-[100] md:hidden"
            />
            <motion.div 
              initial={{ x: 20, y: -20, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              exit={{ x: 20, y: -20, opacity: 0 }}
              className="fixed top-0 right-0 w-[200px] bg-transparent backdrop-blur-md border-l border-b border-white/10 z-[110] md:hidden p-5 rounded-bl-[32px] flex flex-col items-center pt-8"
            >
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-text/40 hover:text-text transition-colors"
              >
                <X size={16} />
              </button>

              <div className="w-full space-y-2 mt-2">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="group flex items-center justify-between bg-base2/50 text-primary h-11 px-4 font-black text-sm rounded-xl hover:bg-base2 transition-all active:scale-95 shadow-md">
                  Login <LogIn size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="group flex items-center justify-between bg-base2/50 text-primary h-11 px-4 font-black text-sm rounded-xl hover:bg-base2 transition-all active:scale-95 shadow-md">
                  Get started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <header className="relative min-h-[90vh] flex items-center pt-20 pb-16 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '0s' }}></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-special-red/20 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] animate-blob" style={{ animationDelay: '4s' }}></div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="max-w-4xl mx-auto text-center">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-base2/50 border border-base2 text-primary text-sm font-bold mb-8 backdrop-blur-md">
              <Star size={14} fill="currentColor" />
              <span className="uppercase tracking-widest text-[10px]">Elite Pool Tournament Management</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl lg:text-8xl font-black text-text-emphasis mb-6 sm:mb-8 tracking-tighter leading-[1] sm:leading-[0.9]">
              The tournament for <br className="hidden sm:block" />
              <span className="text-gradient-premium animate-gradient-x">true champions.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-xl lg:text-2xl text-text/80 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
              Elevate your pool tournaments with industry-leading tools. Real-time bracket sync, professional officiating, and premium match-day experiences.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/register" className="btn-primary text-xl px-12 py-5 rounded-2xl flex items-center gap-3 shadow-2xl shadow-primary/25 hover:shadow-primary/50 transition-all hover:scale-105 active:scale-95 group relative overflow-hidden">
                <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-50"></div>
                Register tournament <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 py-8 sm:py-10 px-6 sm:px-8 rounded-3xl bg-base3/30 border border-base2/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden group/stats">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover/stats:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative text-center">
                <div className="text-3xl sm:text-4xl font-black text-primary mb-1">
                  <AnimatedCounter value={stats.totalTournaments || 12} />
                </div>
                <div className="text-[10px] font-bold text-text/50 uppercase tracking-widest text-[10px]">Active tournaments</div>
              </div>
              <div className="relative text-center sm:border-x border-base2/40 sm:px-4">
                <div className="text-3xl sm:text-4xl font-black text-text-emphasis mb-1">
                  <AnimatedCounter value={stats.totalMatches || 450} />
                </div>
                <div className="text-[10px] font-bold text-text/50 uppercase tracking-widest text-[10px]">Matches played</div>
              </div>
              <div className="relative text-center sm:col-span-2 lg:col-span-1 border-t sm:border-t-0 pt-6 sm:pt-0 border-base2/40">
                <div className="text-3xl sm:text-4xl font-black text-special-red mb-1">
                  <AnimatedCounter value={stats.totalPlayers || '1.2k'} />
                </div>
                <div className="text-[10px] font-bold text-text/50 uppercase tracking-widest text-[10px]">Players joined</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Evolution Section: Highlighting the transition from manual to digital */}
      <section className="py-16 sm:py-24 bg-base2/20 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-1/2 relative group"
            >
              <div className="absolute -inset-6 bg-gradient-to-r from-special-red/30 via-primary/30 to-indigo-500/30 rounded-[48px] blur-3xl opacity-40 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative rounded-[32px] overflow-hidden border border-white/20 shadow-2xl transition-all duration-700 hover:rotate-1 hover:scale-[1.02]">
                <img src="/images/old_way.png" alt="Traditional tournament management" className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-special-red flex items-center justify-center text-base3 shadow-lg shadow-special-red/40 animate-pulse">
                      <X size={28} strokeWidth={3} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-base3 uppercase tracking-tighter leading-none italic">No more manual brackets</h4>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full lg:w-1/2 space-y-6 sm:space-y-8 text-center lg:text-left"
            >
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-special-red font-black text-[10px] uppercase tracking-[0.3em]">The evolution</h3>
                <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black text-text-emphasis leading-[0.95] tracking-tighter">
                  No more, try <br />
                  <span className="text-primary italic text-gradient-premium">Cue-Arena App</span>
                </h2>
                <p className="text-lg sm:text-xl text-text/70 leading-relaxed font-medium max-w-xl mx-auto lg:mx-0">
                  Manual brackets are history. Upgrade to precision and real-time synchronization.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {[
                  { title: "Instant brackets", desc: "Automated tree generation and updates." },
                  { title: "Live updates", desc: "Match data synced instantly to every player." },
                  { title: "Secure flows", desc: "Automated fees and payout distribution." },
                  { title: "Elite design", desc: "A premium interface for modern halls." }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-[20px] bg-base3/80 backdrop-blur-sm border border-base2/50 shadow-sm hover:shadow-md transition-all group text-left">
                    <h4 className="text-xs sm:text-sm font-black text-text-emphasis mb-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item.title}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-text/60 leading-normal font-bold uppercase tracking-tight">{item.desc}</p>
                  </div>
                ))}
              </div>

              <Link to="/login" className="inline-flex items-center gap-3 btn-primary px-8 py-3.5 sm:px-10 sm:py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto justify-center text-sm">
                Get Started Now <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="tournaments-section" className="py-24 bg-base3/50 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col xl:flex-row gap-12">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                  <h2 className="text-4xl lg:text-5xl font-black text-text-emphasis mb-4 tracking-tight">Active tournaments</h2>
                  <p className="text-lg text-text/70 font-medium">Join high-stakes competitions and prove your mastery.</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-80 bg-base2/30 rounded-3xl animate-pulse"></div>)}
                  </div>
                ) : tournaments.length > 0 ? (
                  <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {tournaments.map((t, idx) => {
                      const colors = [
                        { border: 'hover:border-primary/60', shadow: 'shadow-primary/20', accent: 'bg-primary' },
                        { border: 'hover:border-indigo-500/60', shadow: 'shadow-indigo-500/20', accent: 'bg-indigo-500' },
                        { border: 'hover:border-special-red/60', shadow: 'shadow-special-red/20', accent: 'bg-special-red' },
                        { border: 'hover:border-emerald-500/60', shadow: 'shadow-emerald-500/20', accent: 'bg-emerald-500' }
                      ];
                      const style = colors[idx % colors.length];
                      return (
                        <motion.div key={t._id} variants={itemVariants} className={`group relative h-full bg-base3/80 backdrop-blur-md border border-base2/50 rounded-[40px] overflow-hidden ${style.border} hover:shadow-3xl ${style.shadow} transition-all duration-700 hover:-translate-y-2`}>
                          <div className="absolute top-0 left-0 w-full h-2 bg-base2">
                            <motion.div initial={{ width: 0 }} whileInView={{ width: `${(t.confirmedPlayers.length / t.maxPlayers) * 100}%` }} transition={{ duration: 1.5 }} className={`h-full ${style.accent} shadow-[0_0_15px_rgba(38,139,210,0.5)]`} />
                          </div>
                          <div className="p-8 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                              <StatusBadge status={t.status} registrationDeadline={t.registrationDeadline} />
                              <span className="text-[10px] font-black text-text/60 bg-base2 px-3 py-1 rounded-full uppercase tracking-[0.2em]">{t.format.replace('_', ' ')}</span>
                            </div>
                            <h3 className="text-xl font-black text-text-emphasis mb-5 group-hover:text-primary transition-colors line-clamp-2 leading-tight">{t.name}</h3>
                            <div className="grid grid-cols-1 gap-3 mb-6 flex-1 text-xs font-bold text-text/80">
                              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-base2/30">
                                <MapPin size={16} className="text-primary" /> <span className="truncate">{t.venue}</span>
                              </div>
                              <div className="flex gap-3">
                                <div className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-base2/30">
                                  <Users size={16} className="text-blue" /> <span>{t.confirmedPlayers.length}/{t.maxPlayers}</span>
                                </div>
                                <div className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-base2/30">
                                  <Calendar size={16} className="text-special-red" /> <span>{new Date(t.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                </div>
                              </div>
                            </div>
                             <Link to="/login" className="w-full py-3 rounded-xl btn-primary text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/10 transition-all">
                               Join tournament <ArrowRight size={16} />
                             </Link>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-base3/30 border-2 border-dashed border-base2 rounded-[32px] h-full flex flex-col justify-center">
                    <Trophy size={48} className="text-text/20 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-text-emphasis mb-2">The tournaments are silent.</h3>
                    <p className="text-sm text-text/60">Be the first to host a competition.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-full xl:w-[420px] shrink-0">
               <div className="mb-10 text-center xl:text-left">
                <h2 className="text-4xl lg:text-5xl font-black text-text-emphasis mb-4 tracking-tight">Elite rank</h2>
                <p className="text-lg text-text/70 font-medium">The most prestigious players.</p>
              </div>
              <div className="bg-base3/50 backdrop-blur-xl border border-base2 rounded-[32px] overflow-hidden shadow-2xl relative h-auto">
                <div className="divide-y divide-base2/50 max-h-[850px] overflow-y-auto custom-scrollbar">
                  {leaderboard.map((p, i) => (
                    <motion.div 
                      key={p._id} 
                      initial={{ opacity: 0, x: -20 }} 
                      whileInView={{ opacity: 1, x: 0 }} 
                      viewport={{ once: true }} 
                      transition={{ delay: i * 0.05 }} 
                      className={`flex items-center gap-4 p-4 transition-all group relative overflow-hidden ${i === 0 ? 'bg-gradient-to-r from-yellow/10 to-transparent border-y border-yellow/20' : 'hover:bg-base2/20'}`}
                    >
                      {i === 0 && (
                        <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-20"></div>
                      )}
                      <div className="flex flex-col items-center justify-center min-w-[24px]">
                        {p.rankTrend === 'up' ? (
                          <ChevronUp size={14} className="text-emerald-500 mb-0.5" />
                        ) : p.rankTrend === 'down' ? (
                          <ChevronDown size={14} className="text-special-red mb-0.5" />
                        ) : p.rankTrend === 'new' ? (
                          <Info size={14} className="text-blue mx-auto mb-0.5" />
                        ) : (
                          <Minus size={14} className="text-text/20 mb-0.5" />
                        )}
                        <div className={`w-9 h-9 flex items-center justify-center rounded-xl font-black text-[11px] shadow-inner ${i === 0 ? 'bg-yellow text-base3 shadow-[0_0_15px_rgba(181,137,0,0.4)]' : i === 1 ? 'bg-text/5 text-text ring-1 ring-text/20' : i === 2 ? 'bg-special-red/5 text-special-red ring-1 ring-special-red/20' : 'bg-base2 text-text/40'}`}>{i + 1}</div>
                      </div>
                      <div className={`w-12 h-12 rounded-full p-0.5 shrink-0 ${i === 0 ? 'bg-yellow shadow-[0_0_15px_rgba(181,137,0,0.5)] scale-110' : 'bg-gradient-to-br from-primary to-special-red'}`}>
                        <img src={p.profilePhoto || `https://ui-avatars.com/api/?name=${p.fullName}&background=random`} alt={p.fullName} className="w-full h-full rounded-full object-cover border-2 border-base3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-black truncate ${i === 0 ? 'text-text-emphasis text-base' : 'text-sm text-text-emphasis'}`}>{p.fullName}</h3>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] leading-none mb-1 ${i === 0 ? 'text-yellow' : 'text-text/30'}`}>Points</span>
                        <div className={`font-black leading-none ${i === 0 ? 'text-2xl text-yellow' : 'text-xl text-gradient-premium'}`}>{p.points || 0}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background border-b border-base2/30">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { icon: Zap, title: "Hyper Sync", color: "blue", desc: "Live match updates with zero latency. Every shot, every set, instantly synchronized." },
            { icon: Shield, title: "Pro Guard", color: "red", desc: "Secure results verification and moderator-only conflict resolution protocols." },
            { icon: Globe, title: "Open Access", color: "green", desc: "Access from any device. Mobile-optimized for real-time play monitoring." }
          ].map((f, i) => (
            <div key={i} className="group p-10 rounded-3xl bg-base3/50 border border-base2/50 hover:border-primary/40 hover:bg-base3 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-base2 flex items-center justify-center mb-8 group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-inner"><f.icon size={32} /></div>
              <h3 className="text-2xl font-black text-text-emphasis mb-4">{f.title}</h3>
              <p className="text-text/75 font-medium leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="p-16 rounded-[48px] bg-gradient-to-br from-primary via-primary-dark to-special-red relative overflow-hidden shadow-3xl text-center">
            <h2 className="text-5xl lg:text-7xl font-black text-base3 mb-8 leading-[0.9] tracking-tighter">Ready to claim <br />your title?</h2>
            <div className="flex justify-center gap-6">
              <Link to="/register" className="px-12 py-5 rounded-2xl bg-base2 text-primary font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl">Join elite now</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="pt-24 pb-12 bg-base3 border-t border-base2/50">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-16 mb-20">
          <div className="md:col-span-1">
            <span className="text-2xl brand-premium font-black tracking-tight mb-8 block">Cue-Arena</span>
            <p className="text-text/60 font-medium">The definitive platform for pool match-making and tournament administration. Precise. Professional. Premium.</p>
          </div>
          <div>
            <h4 className="text-sm font-black text-text-emphasis uppercase tracking-[0.2em] mb-8">Platform</h4>
            <ul className="space-y-4 font-bold text-text/60">
              <li><Link to="/tournaments" className="hover:text-primary">Tournaments</Link></li>
              <li><Link to="/matches" className="hover:text-primary">Matches</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-black text-text-emphasis uppercase tracking-[0.2em] mb-8">Company</h4>
            <ul className="space-y-4 font-bold text-text/60">
              <li><Link to="/moderator-apply" className="hover:text-primary">Apply as Moderator</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact Support</Link></li>
            </ul>
          </div>
          <div className="md:col-span-2 bg-base2/30 p-8 rounded-3xl border border-primary/20 shadow-xl">
            <h4 className="text-sm font-black text-text-emphasis mb-4 flex items-center gap-2"><Shield size={16} className="text-primary" /> Want to be a Moderator?</h4>
            <p className="text-[10px] text-text/60 font-bold mb-6 italic">Interested to organize tournaments and matches, apply to become a moderator</p>
            <form onSubmit={handleFooterSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Full Name" value={footerForm.fullName} onChange={(e) => setFooterForm({ ...footerForm, fullName: e.target.value })} className="bg-base3 border border-base2 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary" />
                <input type="email" placeholder="Email" value={footerForm.email} onChange={(e) => setFooterForm({ ...footerForm, email: e.target.value })} className="bg-base3 border border-base2 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary" />
              </div>
              <input type="text" placeholder="Phone" value={footerForm.phone} onChange={(e) => setFooterForm({ ...footerForm, phone: e.target.value })} className="w-full bg-base3 border border-base2 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary" />
              <button type="submit" disabled={footerSubmitting} className="w-full py-2.5 bg-primary text-base3 rounded-xl font-black text-xs hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50">
                {footerSubmitting ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> Apply now</>}
              </button>
            </form>
          </div>
        </div>
        <div className="container mx-auto px-6 pt-12 border-t border-base2/30 flex justify-between items-center text-sm font-bold text-text/40">
          <p>© 2026 Cue-Arena. Designed for champions.</p>
          <div className="flex gap-8 uppercase tracking-widest text-[10px]"><a>Twitter</a><a>Discord</a></div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

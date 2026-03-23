import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Calendar, ArrowRight, Target, MapPin, Shield, Zap, Globe, Star, Send, Loader2, User, Mail, Phone } from 'lucide-react';
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
          api.get('/users/leaderboard?limit=8')
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
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <nav className="border-b border-base2/50 bg-base3/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group relative">
            <span className="text-2xl brand-premium font-black tracking-tight">Cue-Arena</span>
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <Link to="/tournaments" className="text-text/70 hover:text-primary font-semibold transition-all hover:scale-105 active:scale-95">Tournaments</Link>
            <Link to="/features" className="text-text/70 hover:text-primary font-semibold transition-all hover:scale-105 active:scale-95">Features</Link>
            <div className="h-6 w-px bg-base2/50"></div>
            <Link to="/login" className="text-text hover:text-primary font-bold transition-all">Login</Link>
            <Link to="/register" className="btn-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 px-6 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <header className="relative min-h-[90vh] flex items-center pt-20 pb-16 overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 translate-x-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/4 right-0 translate-x-[20%] w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="max-w-4xl mx-auto text-center">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-base2/50 border border-base2 text-primary text-sm font-bold mb-8 backdrop-blur-md">
              <Star size={14} fill="currentColor" />
              <span className="uppercase tracking-widest text-[10px]">Elite Pool Tournament Management</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-6xl lg:text-8xl font-black text-text-emphasis mb-8 tracking-tighter leading-[0.9]">
              The Tournament for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-primary to-special-red animate-gradient">True Champions.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-xl lg:text-2xl text-text/80 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
              Elevate your pool tournaments with industry-leading tools. Real-time bracket sync, professional officiating, and premium match-day experiences.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/register" className="btn-primary text-xl px-12 py-5 rounded-2xl flex items-center gap-3 shadow-2xl shadow-primary/25 hover:shadow-primary/50 transition-all hover:scale-105 active:scale-95 group">
                Register Tournament <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-24 grid grid-cols-2 md:grid-cols-3 gap-8 py-10 px-8 rounded-3xl bg-base3/30 border border-base2/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden group/stats">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover/stats:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative text-center">
                <div className="text-4xl font-black text-primary mb-1">
                  <AnimatedCounter value={stats.totalTournaments || 12} />
                </div>
                <div className="text-xs font-bold text-text/50 uppercase tracking-widest">Active Tournaments</div>
              </div>
              <div className="relative text-center border-x border-base2/40 md:px-4">
                <div className="text-4xl font-black text-text-emphasis mb-1">
                  <AnimatedCounter value={stats.totalMatches || 450} />
                </div>
                <div className="text-xs font-bold text-text/50 uppercase tracking-widest">Matches Played</div>
              </div>
              <div className="relative text-center col-span-2 md:col-span-1">
                <div className="text-4xl font-black text-special-red mb-1">
                  <AnimatedCounter value={stats.totalPlayers || '1.2k'} />
                </div>
                <div className="text-xs font-bold text-text/50 uppercase tracking-widest">Players Joined</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      <section id="tournaments-section" className="py-24 bg-base3/50 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col xl:flex-row gap-12">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                  <h2 className="text-4xl lg:text-5xl font-black text-text-emphasis mb-4 tracking-tight">Active Tournaments</h2>
                  <p className="text-lg text-text/70 font-medium">Join high-stakes competitions and prove your mastery.</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-80 bg-base2/30 rounded-3xl animate-pulse"></div>)}
                  </div>
                ) : tournaments.length > 0 ? (
                  <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tournaments.map((t, idx) => {
                      const colors = [
                        { border: 'hover:border-primary/40', shadow: 'shadow-primary/10', accent: 'bg-primary' },
                        { border: 'hover:border-blue-500/40', shadow: 'shadow-blue-500/10', accent: 'bg-blue-500' },
                        { border: 'hover:border-special-red/40', shadow: 'shadow-special-red/10', accent: 'bg-special-red' },
                        { border: 'hover:border-green-500/40', shadow: 'shadow-green-500/10', accent: 'bg-green-500' }
                      ];
                      const style = colors[idx % colors.length];
                      return (
                        <motion.div key={t._id} variants={itemVariants} className={`group relative h-full bg-base3 border border-base2/50 rounded-3xl overflow-hidden ${style.border} hover:shadow-2xl ${style.shadow} transition-all duration-500`}>
                          <div className="absolute top-0 left-0 w-full h-1.5 bg-base2">
                            <motion.div initial={{ width: 0 }} whileInView={{ width: `${(t.confirmedPlayers.length / t.maxPlayers) * 100}%` }} transition={{ duration: 1.5 }} className={`h-full ${style.accent}`} />
                          </div>
                          <div className="p-6 flex flex-col h-full">
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
                            <Link to="/register" className={`w-full py-3 rounded-xl bg-base2 font-black text-text-emphasis text-sm flex items-center justify-center gap-2 group-hover:text-white transition-all ${style.accent.replace('bg-', 'hover:bg-')}`}>
                              Join Tournament <ArrowRight size={16} />
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
                <h2 className="text-4xl lg:text-5xl font-black text-text-emphasis mb-4 tracking-tight">Elite Rank</h2>
                <p className="text-lg text-text/70 font-medium">The most prestigious players.</p>
              </div>
              <div className="bg-base3/50 backdrop-blur-xl border border-base2 rounded-[32px] overflow-hidden shadow-2xl relative h-auto">
                <div className="divide-y divide-base2/50 max-h-[850px] overflow-y-auto custom-scrollbar">
                  {leaderboard.map((p, i) => (
                    <motion.div key={p._id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 p-3 hover:bg-base2/20 transition-colors group">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-xl font-black text-sm shadow-inner ${i === 0 ? 'bg-yellow/10 text-yellow ring-1 ring-yellow/30' : i === 1 ? 'bg-text/5 text-text ring-1 ring-text/20' : i === 2 ? 'bg-special-red/5 text-special-red ring-1 ring-special-red/20' : 'bg-base2 text-text/40'}`}>#{i + 1}</div>
                      <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-br from-primary to-special-red shrink-0">
                        <img src={p.profilePhoto || `https://ui-avatars.com/api/?name=${p.fullName}&background=random`} alt={p.fullName} className="w-full h-full rounded-full object-cover border-2 border-base3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black text-text-emphasis truncate">{p.fullName}</h3>
                        <p className="text-[10px] font-bold text-text/50 truncate">Prestige Champion</p>
                      </div>
                      <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">{p.points || 0}</div>
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
            <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 leading-[0.9] tracking-tighter">Ready to Claim <br />Your Title?</h2>
            <div className="flex justify-center gap-6">
              <Link to="/register" className="px-12 py-5 rounded-2xl bg-white text-primary font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl">Join Elite Now</Link>
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
              <button type="submit" disabled={footerSubmitting} className="w-full py-2.5 bg-primary text-white rounded-xl font-black text-xs hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50">
                {footerSubmitting ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> Apply Now</>}
              </button>
            </form>
          </div>
        </div>
        <div className="container mx-auto px-6 pt-12 border-t border-base2/30 flex justify-between items-center text-sm font-bold text-text/40">
          <p>© 2026 Cue-Arena. Designed for Champions.</p>
          <div className="flex gap-8 uppercase tracking-widest text-[10px]"><a>Twitter</a><a>Discord</a></div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

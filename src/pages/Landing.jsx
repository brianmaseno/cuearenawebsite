import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Trophy, Users, ArrowRight, Target, MapPin, Shield, Zap, Globe, Star, Send, Loader2, X } from 'lucide-react';
import { animate } from 'framer-motion';
import api from '../api/axios';
import PublicLayout from '../components/public/PublicLayout';
import { TournamentCard, LeaderboardPanel } from '../components/public/PublicCards';
import toast from 'react-hot-toast';

const AnimatedCounter = ({ value, duration = 2, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const isK = value?.toString().includes('k');
    const targetValue = isK ? parseFloat(value.toString()) * 1000 : (parseInt(value) || 0);

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

const ParallaxIcon = ({ icon: LucideIcon, color, size = 24, top, left, delay = 0, speed = 1 }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -200 * speed]);
  const bounceDuration = 4 + (speed * 0.5);

  if (!LucideIcon) return null;

  return (
    <motion.div
      style={{ y, top, left, perspective: 1000 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.15, scale: 1 }}
      transition={{ delay, duration: 1 }}
      className={`absolute z-0 pointer-events-none ${color}`}
    >
      <motion.div
        animate={{
          rotateX: [0, 20, 0],
          rotateY: [0, 30, 0],
          y: [0, -10, 0]
        }}
        transition={{ duration: bounceDuration, repeat: Infinity, ease: "easeInOut" }}
      >
        <LucideIcon size={size} />
      </motion.div>
    </motion.div>
  );
};

const Landing = () => {
  const [tournaments, setTournaments] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({ totalTournaments: 0, totalMatches: 0, totalPlayers: 0 });
  const [loading, setLoading] = useState(true);
  const [footerForm, setFooterForm] = useState({ fullName: '', email: '', phone: '' });
  const [footerSubmitting, setFooterSubmitting] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!motion) return; // Satisfy linter for false-positive unused-var
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
      return toast.error('Please fill in name, email and phone');
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
    hidden: { y: 30, opacity: 0, rotateX: -15 },
    visible: { y: 0, opacity: 1, rotateX: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  const card3DVariants = {
    hover: {
      scale: 1.05,
      rotateX: 5,
      rotateY: 5,
      z: 50,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <PublicLayout showFooter={false}>
      <div className="selection:bg-primary/30 relative">
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

      <header className="relative min-h-[90vh] flex items-center pt-12 pb-16 overflow-hidden">
        {/* 3D Parallax Ornaments */}
        <ParallaxIcon icon={Trophy} color="text-yellow" size={40} top="15%" left="10%" delay={0.2} speed={1.2} />
        <ParallaxIcon icon={Target} color="text-primary" size={32} top="65%" left="5%" delay={0.4} speed={0.8} />
        <ParallaxIcon icon={Zap} color="text-special-red" size={28} top="25%" left="85%" delay={0.6} speed={1.5} />
        <ParallaxIcon icon={Star} color="text-indigo-500" size={36} top="75%" left="90%" delay={0.8} speed={1} />
        <ParallaxIcon icon={Target} color="text-emerald-500" size={24} top="45%" left="75%" delay={1} speed={1.3} />

        <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-special-red/20 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="max-w-4xl mx-auto" style={{ perspective: 1200 }}>
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-base2/50 border border-base2 text-primary text-sm font-bold mb-8 backdrop-blur-md">
              <Star size={14} fill="currentColor" /><span className="uppercase tracking-widest text-[10px]">Elite pool tournament management</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl lg:text-8xl font-black text-text-emphasis mb-6 sm:mb-8 tracking-tighter leading-[1] sm:leading-[0.9]">The tournament for <br className="hidden sm:block" /><span className="text-gradient-premium animate-gradient-x">true champions.</span></motion.h1>
            <motion.p variants={itemVariants} className="text-xl lg:text-2xl text-text/80 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">Elevate your pool tournaments with industry-leading tools. Real-time bracket sync, professional officiating, and premium match-day experiences.</motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/register" className="aura-btn text-xl px-14 py-6 flex items-center gap-3">
                Register tournament <ArrowRight size={22} />
              </Link>
            </motion.div>
            <motion.div variants={itemVariants} className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 py-8 sm:py-10 px-6 sm:px-8 aura-card relative overflow-hidden group/stats text-center" style={{ transformStyle: 'preserve-3d' }}>
              <motion.div whileHover={{ translateZ: 20 }} className="relative">
                <div className="text-3xl sm:text-4xl font-black text-primary mb-1 text-aura"><AnimatedCounter value={stats.totalTournaments || 12} /></div>
                <div className="text-[10px] font-bold text-text/50 uppercase tracking-widest">Active tournaments</div>
              </motion.div>
              <motion.div whileHover={{ translateZ: 20 }} className="sm:border-x border-base2/40 sm:px-4 relative">
                <div className="text-3xl sm:text-4xl font-black text-text-emphasis mb-1"><AnimatedCounter value={stats.totalMatches || 450} /></div>
                <div className="text-[10px] font-bold text-text/50 uppercase tracking-widest">Matches played</div>
              </motion.div>
              <motion.div whileHover={{ translateZ: 20 }} className="sm:col-span-2 lg:col-span-1 border-t sm:border-t-0 pt-6 sm:pt-0 border-base2/40 relative">
                <div className="text-3xl sm:text-4xl font-black text-aura mb-1"><AnimatedCounter value={stats.totalPlayers || '1.2k'} /></div>
                <div className="text-[10px] font-bold text-text/50 uppercase tracking-widest">Players joined</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Evolution Section */}
      <section className="py-24 bg-base3/40 relative overflow-hidden" style={{ perspective: 1500 }}>
        <ParallaxIcon icon={Shield} color="text-primary" size={24} top="20%" left="5%" delay={0.5} speed={0.5} />
        <ParallaxIcon icon={Zap} color="text-indigo-500" size={20} top="80%" left="90%" delay={0.7} speed={0.7} />

        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: -20 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-full lg:w-1/2 relative group"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute -inset-6 bg-gradient-to-r from-special-red/30 via-primary/30 to-indigo-500/30 rounded-[48px] blur-3xl opacity-40 group-hover:opacity-100 transition-opacity duration-1000" />
              <motion.div
                whileHover={{ rotateY: 10, rotateX: 5, z: 20 }}
                className="relative rounded-[32px] overflow-hidden border border-base3/20 shadow-2xl transition-all duration-700"
              >
                <img src="/images/old_way.png" alt="Traditional way" className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 text-left">
                  <div className="flex items-center gap-3" style={{ translateZ: 40 }}>
                    <div className="w-12 h-12 rounded-full bg-special-red flex items-center justify-center text-base3 shadow-lg shadow-special-red/40 animate-pulse">
                      <X size={28} strokeWidth={3} />
                    </div>
                    <h4 className="text-2xl font-black text-base3 uppercase tracking-tighter leading-none italic text-left">No more manual brackets</h4>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50, rotateY: 20 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="w-full lg:w-1/2 space-y-8 text-center lg:text-left"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="space-y-4 text-left" style={{ translateZ: 30 }}>
                <h3 className="text-special-red font-black text-[10px] uppercase tracking-[0.3em]">The evolution</h3>
                <h2 className="text-4xl sm:text-w-7xl font-black text-text-emphasis leading-[0.95] tracking-tighter">No more, try <br /><span className="text-primary italic text-gradient-premium">Cue-Arena app</span></h2>
                <p className="text-lg sm:text-xl text-text/70 leading-relaxed font-medium max-w-xl mx-auto lg:mx-0">Manual brackets are history. Upgrade to precision and real-time synchronization.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                {[{ title: "Instant brackets", desc: "Automated tree generation." }, { title: "Live updates", desc: "Match data synced instantly." }, { title: "Secure flows", desc: "Automated fee distribution." }, { title: "Elite design", desc: "A premium interface." }].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-[20px] bg-base3/80 backdrop-blur-sm border border-base2/50 shadow-sm hover:shadow-md transition-all group">
                    <h4 className="text-sm font-black text-text-emphasis mb-1 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" />{item.title}</h4>
                    <p className="text-[10px] text-text/60 leading-normal font-bold uppercase tracking-tight">{item.desc}</p>
                  </div>
                ))}
              </div>
              <Link to="/login" className="inline-flex items-center gap-3 aura-btn px-12 py-5 shadow-xl transition-all w-full sm:w-auto justify-center text-sm">Get started now <ArrowRight size={18} /></Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h3 className="text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-4 text-left lg:text-center">The experience</h3>
            <h2 className="text-4xl sm:text-6xl font-black text-text-emphasis tracking-tighter leading-none mb-6 text-left lg:text-center">Designed for the <span className="text-gradient-premium">modern player.</span></h2>
            <p className="text-lg text-text/70 font-medium text-left lg:text-center">Step into a world where technology meets the table. Professionalism in every pixel.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[600px] text-left" style={{ perspective: 2000 }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true }}
              variants={card3DVariants}
              className="lg:col-span-8 aura-card relative overflow-hidden group shadow-2xl border-none"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <img src="/images/hall_digital.png" alt="Digital hall" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent p-10 flex flex-col justify-end text-left">
                <motion.div style={{ translateZ: 30 }}>
                  <h4 className="text-3xl font-black text-text-emphasis mb-2 uppercase tracking-tighter">Smart venues</h4>
                  <p className="text-text/70 max-w-md font-medium text-left">Digital tournament boards and automated table control for a seamless match-day experience.</p>
                </motion.div>
              </div>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              variants={card3DVariants}
              className="lg:col-span-4 aura-card relative overflow-hidden group shadow-2xl border-none text-left"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <img src="/images/trophy_app.png" alt="App" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent p-10 flex flex-col justify-end">
                <motion.div style={{ translateZ: 30 }}>
                  <h4 className="text-2xl font-black text-text-emphasis mb-2 uppercase tracking-tighter text-left">Your stats, anywhere</h4>
                  <p className="text-text/70 font-medium text-sm text-left">Real-time brackets and secure wallet access right in your pocket.</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-base3/50 border-y border-base2/50 text-left">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/3 text-left">
              <h3 className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4">How it works</h3>
              <h2 className="text-4xl sm:text-5xl font-black text-text-emphasis tracking-tighter leading-tight mb-6">From entry to <span className="text-indigo-500">victory.</span></h2>
              <p className="text-lg text-text/70 mb-8 font-medium">Starting your professional journey is simpler than a straight-in shot.</p>
              <Link to="/register" className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-500 text-base3 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20">Join now <ArrowRight size={20} /></Link>
            </div>
            <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[{ step: "01", icon: Target, title: "Register", desc: "Browse active tournaments and join with a single tap. Secure your spot." }, { step: "02", icon: Zap, title: "Play", desc: "Arrive at the hall, scan your entry, and play. Real-time sync." }, { step: "03", icon: Trophy, title: "Win", desc: "Claim your title. Platform-automated payouts ensure winnings are instant." }].map((item, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="p-8 aura-card relative group border-none transition-colors text-left">
                  <span className="absolute top-8 right-8 text-4xl font-black text-primary/10 group-hover:text-primary/20 transition-colors">{item.step}</span>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6"><item.icon size={28} /></div>
                  <h4 className="text-xl font-black text-text-emphasis mb-3 text-left">{item.title}</h4>
                  <p className="text-sm text-text/60 leading-relaxed font-medium text-left">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tournaments and Leaderboard */}
      <section id="tournaments-section" className="py-24 bg-base3/50 relative overflow-hidden text-left">
        <div className="container mx-auto px-6">
          <div className="flex flex-col xl:flex-row gap-10 xl:gap-12">
            <div className="flex-1 min-w-0">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-magenta mb-2">Live competitions</p>
                <h2 className="text-3xl lg:text-4xl font-bold text-text-emphasis tracking-tight">Active tournaments</h2>
                <p className="mt-2 text-text-muted">Join high-stakes competitions and prove your mastery.</p>
              </div>
              <AnimatePresence mode="wait">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-72 rounded-[20px] bg-base2/30 animate-pulse" />
                    ))}
                  </div>
                ) : tournaments.length > 0 ? (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                  >
                    {tournaments.map((t) => (
                      <motion.div key={t.id} variants={itemVariants}>
                        <TournamentCard tournament={t} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-[20px] border border-dashed border-base2 bg-surface/50 py-16 text-center"
                  >
                    <Trophy size={40} className="text-text-muted/30 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-text-emphasis">No active tournaments</h3>
                    <p className="text-sm text-text-muted mt-1">Check back soon for new competitions.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="w-full xl:w-[380px] shrink-0">
              <LeaderboardPanel
                players={leaderboard}
                title="Elite rank"
                subtitle="The most prestigious players"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Formats */}
      <section className="py-24 bg-base3/30 text-left">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-16">
            <h3 className="text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-4">Game types</h3>
            <h2 className="text-4xl sm:text-5xl font-black text-text-emphasis tracking-tight mb-4">Diverse game formats</h2>
            <p className="text-lg text-text/60 font-medium">Tournament-ready for every discipline.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "8-Ball", balls: "8", desc: "Call-shot classic", accent: "from-black to-neutral-800" },
              { name: "9-Ball", balls: "9", desc: "Fast rotation game", accent: "from-yellow to-amber-600" },
              { name: "10-Ball", balls: "10", desc: "Precision call-shot", accent: "from-blue to-cyan-600" },
              { name: "Straight Pool", balls: "14.1", desc: "Endless run challenge", accent: "from-special-red to-rose-600" }
            ].map((game, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6, scale: 1.02 }}
                className="metric-card group cursor-default text-center"
              >
                <div className="metric-card-grid" />
                <div className="relative z-10 flex flex-col items-center py-3">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.accent} shadow-lg flex items-center justify-center text-white font-black text-xl mb-4 group-hover:scale-110 transition-transform`}>
                    {game.balls}
                  </div>
                  <p className="metric-card-value text-base">{game.name}</p>
                  <p className="metric-card-foot text-center">{game.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Detail */}
      <section className="py-24 bg-background border-b border-base2/30 text-left">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { icon: Zap, title: "Hyper sync", color: "from-blue-500/20 to-blue-500/5", iconColor: "text-blue", desc: "Live match updates with zero latency. Every shot, every set, instantly synchronized." },
            { icon: Shield, title: "Pro guard", color: "from-special-red/20 to-special-red/5", iconColor: "text-special-red", desc: "Secure results verification and moderator-only conflict resolution protocols." },
            { icon: Globe, title: "Open access", color: "from-emerald-500/20 to-emerald-500/5", iconColor: "text-emerald-500", desc: "Access from any device. Mobile-optimized for real-time play monitoring." }
          ].map((f, i) => (
            <div key={i} className="group aura-card p-10 border-none transition-all relative overflow-hidden text-left">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${f.color} blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />
              <div className={`w-16 h-16 rounded-2xl bg-base2 flex items-center justify-center mb-8 ${f.iconColor} shadow-inner relativo z-10`}><f.icon size={32} /></div>
              <h3 className="text-2xl font-black text-text-emphasis mb-4 relativo z-10 text-left">{f.title}</h3>
              <p className="text-text/75 font-medium leading-relaxed relativo z-10 text-left">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-background overflow-hidden text-left">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16 p-10 lg:p-20 rounded-[48px] bg-base3 border border-base2 shadow-3xl relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
            <div className="w-full lg:w-1/2 relative space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 text-left"><Globe size={12} /> Live matches now</div>
              <h2 className="text-4xl sm:text-6xl font-black text-text-emphasis leading-[0.9] tracking-tighter text-left">Trusted by hall owners <span className="text-emerald-500">& players.</span></h2>
              <div className="space-y-6 text-left"><p className="text-lg text-text/70 italic font-medium text-left">"Cue-Arena transformed how we run tournaments. We went from chaotic whiteboards to a digital powerhouse overnight. Our players love the real-time brackets and instant payouts."</p>
                <div className="flex items-center gap-4 text-left"><div className="w-14 h-14 rounded-full border-2 border-emerald-500/30 p-1"><img src="https://ui-avatars.com/api/?name=Sam+Owner&background=random" alt="User" className="w-full h-full rounded-full" /></div><div><h4 className="font-black text-text-emphasis text-left">Sam Rodriguez</h4><p className="text-xs text-text/50 font-bold uppercase text-left">Owner, Elite Billiards Hall</p></div></div>
              </div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.9, rotate: -2 }} whileInView={{ opacity: 1, scale: 1, rotate: 0 }} viewport={{ once: true }} className="w-full lg:w-1/2 relative text-left">
              <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full" />
              <div className="relative rounded-[40px] overflow-hidden shadow-2xl skew-y-1">
                <img src="/images/players_win.png" alt="Winner" className="w-full h-auto object-cover" />
                <div className="absolute top-6 right-6 px-4 py-2 rounded-2xl bg-base3/90 backdrop-blur-md shadow-xl border border-base3/20 flex items-center gap-3 animate-float text-left">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-base3 flex items-center justify-center text-left"><Trophy size={16} /></div>
                  <div className="text-left"><p className="text-[10px] font-black text-text-emphasis uppercase leading-none text-left">+ $1,200.00</p><p className="text-[8px] font-bold text-text/50 leading-none text-left">Instant payout</p></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden text-left" style={{ perspective: 1500 }}>
        <ParallaxIcon icon={Star} color="text-text-light" size={32} top="10%" left="5%" delay={0} speed={0.4} />
        <ParallaxIcon icon={Trophy} color="text-yellow" size={24} top="70%" left="92%" delay={0.3} speed={0.6} />

        <div className="container mx-auto px-6">
          <motion.div
            whileHover={{ rotateX: 2, rotateY: -2, scale: 1.01 }}
            className="p-16 rounded-[48px] bg-gradient-to-br from-primary via-primary-dark to-special-red relative overflow-hidden shadow-3xl text-center group"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="absolute inset-0 bg-base3/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-shimmer" />
            <motion.h2 style={{ translateZ: 50 }} className="text-5xl lg:text-7xl font-black text-text-light mb-8 leading-[0.9] tracking-tighter text-center">Ready to claim <br />your title?</motion.h2>
            <motion.div style={{ translateZ: 30 }} className="flex justify-center gap-6"><Link to="/register" className="px-12 py-5 rounded-2xl bg-base2 text-primary font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl group/btn overflow-hidden relative"><div className="absolute inset-0 bg-primary/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" /><span className="relative">Join elite now</span></Link></motion.div>
          </motion.div>
        </div>
      </section>

      <footer className="pt-24 pb-12 bg-base3 border-t border-base2/50 text-left relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <ParallaxIcon icon={Globe} color="text-primary" size={200} top="20%" left="-10%" delay={0} speed={0.2} />
        </div>
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-16 mb-20 text-left">
          <div className="md:col-span-1 text-left"><span className="text-2xl brand-premium font-black tracking-tight mb-8 block text-left">Cue-Arena</span><p className="text-text/60 font-medium text-left">The definitive platform for pool match-making and tournament administration. Precise. Professional. Premium.</p></div>
          <div className="text-left"><h4 className="text-sm font-black text-text-emphasis uppercase tracking-[0.2em] mb-8 text-left">Platform</h4><ul className="space-y-4 font-bold text-text/60 text-left"><li><Link to="/tournaments" className="hover:text-primary">Tournaments</Link></li><li><Link to="/matches" className="hover:text-primary">Matches</Link></li></ul></div>
          <div className="text-left"><h4 className="text-sm font-black text-text-emphasis uppercase tracking-[0.2em] mb-8 text-left">Company</h4><ul className="space-y-4 font-bold text-text/60 text-left"><li><Link to="/moderator-apply" className="hover:text-primary">Apply as Moderator</Link></li><li><Link to="/contact" className="hover:text-primary">Contact Support</Link></li></ul></div>
          <div className="md:col-span-2 bg-base2/30 p-8 rounded-3xl border border-primary/20 shadow-xl text-left">
            <h4 className="text-sm font-black text-text-emphasis mb-4 flex items-center gap-2 text-left"><Shield size={16} className="text-primary" /> Want to be a Moderator?</h4>
            <p className="text-[10px] text-text/60 font-bold mb-6 italic text-left">Interested to organize tournaments and matches, apply to become a moderator</p>
            <form onSubmit={handleFooterSubmit} className="space-y-3 text-left">
              <div className="grid grid-cols-2 gap-3 text-left">
                <input type="text" placeholder="Full Name" value={footerForm.fullName} onChange={(e) => setFooterForm({ ...footerForm, fullName: e.target.value })} className="bg-base3 border border-base2 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary" />
                <input type="email" placeholder="Email" value={footerForm.email} onChange={(e) => setFooterForm({ ...footerForm, email: e.target.value })} className="bg-base3 border border-base2 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary" />
              </div>
              <input type="text" placeholder="Phone" value={footerForm.phone} onChange={(e) => setFooterForm({ ...footerForm, phone: e.target.value })} className="w-full bg-base3 border border-base2 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary text-left" />
              <button type="submit" disabled={footerSubmitting} className="w-full py-2.5 bg-primary text-base3 rounded-xl font-black text-xs hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 text-left">{footerSubmitting ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> Apply now</>}</button>
            </form>
          </div>
        </div>
        <div className="container mx-auto px-6 pt-12 border-t border-base2/30 flex justify-between items-center text-sm font-bold text-text/40 text-left"><p>© 2026 Cue-Arena. Designed for champions.</p><div className="flex gap-8 uppercase tracking-widest text-[10px] text-left"><a>Twitter</a><a>Discord</a></div></div>
      </footer>
      </div>
    </PublicLayout>
  );
};

export default Landing;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Calendar, ArrowRight, Target, MapPin, Shield, Zap, Globe, Star } from 'lucide-react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const Landing = () => {
  const [tournaments, setTournaments] = useState([]);
  const [stats, setStats] = useState({ totalTournaments: 0, totalMatches: 0, totalPlayers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tResponse, sResponse] = await Promise.all([
          api.get('/tournaments'),
          api.get('/tournaments/public/stats')
        ]);
        
        const active = tResponse.data
          .filter(t => t.status !== 'draft' && t.status !== 'cancelled' && t.entryType === 'open')
          .slice(0, 6);
        
        setTournaments(active);
        setStats(sResponse.data);
      } catch (err) {
        console.error('Error fetching landing data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const scrollToTournaments = () => {
    document.getElementById('tournaments-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      {/* Navbar */}
      <nav className="border-b border-base2/50 bg-base3/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group relative">
            <span className="text-2xl brand-premium font-black tracking-tight">Cue-Arena</span>
            <div className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-blue-500 to-red-500 group-hover:w-full transition-all duration-300 rounded-full"></div>
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <Link to="/tournaments" className="text-text/70 hover:text-primary font-semibold transition-all hover:scale-105 active:scale-95">Tournaments</Link>
            <Link to="/about" className="text-text/70 hover:text-primary font-semibold transition-all hover:scale-105 active:scale-95">Features</Link>
            <div className="h-6 w-px bg-base2/50"></div>
            <Link to="/login" className="text-text hover:text-primary font-bold transition-all">Login</Link>
            <Link to="/register" className="btn-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 px-6 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0">
              Get Started
            </Link>
          </div>
          <Link to="/login" className="md:hidden btn-primary px-4 py-2 rounded-lg text-sm">Sign In</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-[90vh] flex items-center pt-20 pb-16 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 translate-x-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/4 right-0 translate-x-[20%] w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-base2/50 border border-base2 text-primary text-sm font-bold mb-8 backdrop-blur-md">
              <Star size={14} fill="currentColor" />
              <span className="uppercase tracking-widest text-[10px]">Elite Pool Tournament Management</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-6xl lg:text-8xl font-black text-text-emphasis mb-8 tracking-tighter leading-[0.9]">
              The Arena for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-primary to-special-red animate-gradient">True Champions.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-xl lg:text-2xl text-text/80 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
              Elevate your pool tournaments with industry-leading tools. Real-time bracket sync, professional officiating, and premium match-day experiences.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/register" className="btn-primary text-xl px-12 py-5 rounded-2xl flex items-center gap-3 shadow-2xl shadow-primary/25 hover:shadow-primary/50 transition-all hover:scale-105 active:scale-95 group">
                Register Arena <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={scrollToTournaments}
                className="px-12 py-5 rounded-2xl border-2 border-base2 hover:border-primary/50 hover:bg-base2/50 transition-all font-bold text-text-emphasis backdrop-blur-sm group"
              >
                Watch Matches
              </button>
            </motion.div>

            {/* Stats Bar */}
            <motion.div 
              variants={itemVariants}
              className="mt-24 grid grid-cols-2 md:grid-cols-3 gap-8 py-10 px-8 rounded-3xl bg-base3/30 border border-base2/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden group/stats"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover/stats:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative text-center">
                <div className="text-4xl font-black text-primary mb-1">{stats.totalTournaments || '12'}</div>
                <div className="text-xs font-bold text-text/50 uppercase tracking-widest">Active Arenas</div>
              </div>
              <div className="relative text-center border-x border-base2/40 md:px-4">
                <div className="text-4xl font-black text-text-emphasis mb-1">{stats.totalMatches || '450'}</div>
                <div className="text-xs font-bold text-text/50 uppercase tracking-widest">Matches Played</div>
              </div>
              <div className="relative text-center col-span-2 md:col-span-1">
                <div className="text-4xl font-black text-special-red mb-1">{stats.totalPlayers || '1.2k'}</div>
                <div className="text-xs font-bold text-text/50 uppercase tracking-widest">Players Joined</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Why Choose Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-text-emphasis mb-4 tracking-tight">Engineered for Victory</h2>
            <p className="text-text/70 max-w-xl mx-auto font-medium">Built by pool enthusiasts for the next generation of professional match management.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Zap, title: "Hyper Sync", color: "blue", desc: "Live match updates with zero latency. Every shot, every set, instantly synchronized." },
              { icon: Shield, title: "Pro Guard", color: "red", desc: "Secure results verification and moderator-only conflict resolution protocols." },
              { icon: Globe, title: "Open Access", color: "green", desc: "Access the arena from any device. Mobile-optimized for real-time play monitoring." }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group p-10 rounded-3xl bg-base3/50 border border-base2/50 hover:border-primary/40 hover:bg-base3 transition-all cursor-default relative overflow-hidden"
              >
                <div className={`w-16 h-16 rounded-2xl bg-base2 flex items-center justify-center mb-8 group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-inner`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-text-emphasis mb-4">{feature.title}</h3>
                <p className="text-text/75 leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tournaments Section */}
      <section id="tournaments-section" className="py-24 bg-base3/50 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-5xl font-black text-text-emphasis mb-6 tracking-tight">Active Arenas</h2>
              <p className="text-xl text-text/70 font-medium">Join high-stakes competitions and prove your mastery on the green felt.</p>
            </div>
            <Link to="/register" className="inline-flex items-center gap-3 text-primary font-black group px-8 py-4 bg-primary/5 rounded-2xl hover:bg-primary/10 transition-all active:scale-95">
              Register to Explore <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-96 bg-base2/30 rounded-3xl animate-pulse"></div>
                ))}
              </div>
            ) : tournaments.length > 0 ? (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {tournaments.map(t => (
                  <motion.div 
                    key={t._id} 
                    variants={itemVariants}
                    className="group relative h-full bg-base3 border border-base2/50 rounded-3xl overflow-hidden hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
                  >
                    {/* Status Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-base2">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(t.confirmedPlayers.length / t.maxPlayers) * 100}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full ${t.status === 'ongoing' ? 'bg-blue pulse' : 'bg-primary'}`}
                      />
                    </div>

                    <div className="p-8 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                        <StatusBadge status={t.status} registrationDeadline={t.registrationDeadline} />
                        <span className="text-[10px] font-black text-text/60 bg-base2 px-3 py-1 rounded-full uppercase tracking-[0.2em]">
                          {t.format.replace('_', ' ')}
                        </span>
                      </div>

                      <h3 className="text-2xl font-black text-text-emphasis mb-6 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {t.name}
                      </h3>

                      <div className="grid grid-cols-1 gap-4 mb-8 flex-1 text-sm font-bold text-text/80">
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-base2/30 group-hover:bg-base2/50 transition-colors">
                          <MapPin size={18} className="text-primary" />
                          <span className="truncate">{t.venue}</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-base2/30 group-hover:bg-base2/50 transition-colors">
                          <Users size={18} className="text-blue" />
                          <span>{t.confirmedPlayers.length} / {t.maxPlayers} Slots</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-base2/30 group-hover:bg-base2/50 transition-colors">
                          <Calendar size={18} className="text-special-red" />
                          <span>{new Date(t.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <Link to={`/register`} className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-base2 font-black text-text-emphasis group-hover:bg-primary group-hover:text-base3 transition-all active:scale-[0.98]">
                        Join Arena <ArrowRight size={18} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-center py-24 bg-base3/30 border-2 border-dashed border-base2 rounded-[40px]"
              >
                <div className="w-20 h-20 bg-base2 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Trophy size={40} className="text-text/30" />
                </div>
                <h3 className="text-2xl font-black text-text-emphasis mb-2">The arena is silent.</h3>
                <p className="text-text/60 font-medium">Be the first to host a tournament and lead the conquest.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="p-16 rounded-[48px] bg-gradient-to-br from-primary via-primary-dark to-special-red relative overflow-hidden shadow-3xl">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 max-w-3xl">
              <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 leading-[0.9] tracking-tighter">
                Ready to Claim <br />Your Title?
              </h2>
              <p className="text-xl lg:text-2xl text-white/80 mb-12 font-medium">
                Join thousands of players and organizers in the world's most advanced pool management system.
              </p>
              <div className="flex flex-wrap gap-6">
                <Link to="/register" className="px-12 py-5 rounded-2xl bg-white text-primary font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20">
                  Join Elite Now
                </Link>
                <Link to="/login" className="px-12 py-5 rounded-2xl bg-primary-dark/30 border-2 border-white/20 text-white font-black text-xl hover:bg-primary-dark/40 transition-all backdrop-blur-md">
                  Login Arena
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-24 pb-12 bg-base3 border-t border-base2/50 mt-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-1">
               <Link to="/" className="flex items-center gap-2 mb-8 group">
                <span className="text-2xl brand-premium font-black tracking-tight">Cue-Arena</span>
              </Link>
              <p className="text-text/60 font-medium leading-relaxed">
                The definitive platform for pool match-making and tournament administration. Precise. Professional. Premium.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-black text-text-emphasis uppercase tracking-[0.2em] mb-8">Platform</h4>
              <ul className="space-y-4">
                <li><Link to="/tournaments" className="text-text/60 hover:text-primary transition-colors font-bold">Tournaments</Link></li>
                <li><Link to="/matches" className="text-text/60 hover:text-primary transition-colors font-bold">Global Matches</Link></li>
                <li><Link to="/rankings" className="text-text/60 hover:text-primary transition-colors font-bold">Player Rankings</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black text-text-emphasis uppercase tracking-[0.2em] mb-8">Company</h4>
              <ul className="space-y-4">
                <li><Link to="/about" className="text-text/60 hover:text-primary transition-colors font-bold">Our Vision</Link></li>
                <li><Link to="/contact" className="text-text/60 hover:text-primary transition-colors font-bold">Contact Support</Link></li>
                <li><Link to="/terms" className="text-text/60 hover:text-primary transition-colors font-bold">Legal Terms</Link></li>
              </ul>
            </div>
            <div className="bg-base2/30 p-8 rounded-3xl border border-base2">
               <h4 className="text-sm font-black text-text-emphasis uppercase tracking-[0.2em] mb-4">Elite Newsletter</h4>
               <p className="text-xs text-text/60 font-bold mb-6 italic">Stay updated on top-tier events.</p>
               <div className="relative">
                 <input type="email" placeholder="Your email..." className="w-full bg-base3 border border-base2 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all pr-12" />
                 <button className="absolute right-2 top-1.5 p-2 bg-primary text-base3 rounded-lg hover:scale-105 transition-all">
                   <ArrowRight size={16} />
                 </button>
               </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-base2/30 gap-6">
            <p className="text-sm font-bold text-text/40">
              © 2026 <span className="text-text/60">Cue-Arena</span>. Designed for Champions.
            </p>
            <div className="flex gap-8">
              <a href="#" className="text-text/40 hover:text-primary transition-colors text-sm font-black uppercase tracking-widest">Twitter</a>
              <a href="#" className="text-text/40 hover:text-primary transition-colors text-sm font-black uppercase tracking-widest">Discord</a>
              <a href="#" className="text-text/40 hover:text-primary transition-colors text-sm font-black uppercase tracking-widest">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

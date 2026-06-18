import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, ArrowRight, Target, Shield, Zap,
  Send, Loader2, LayoutGrid
} from 'lucide-react';
import { animate } from 'framer-motion';
import api from '../api/axios';
import PublicLayout from '../components/public/PublicLayout';
import { TournamentCard, LeaderboardPanel } from '../components/public/PublicCards';
import toast from 'react-hot-toast';

const IMG = {
  hero: '/images/medium-shot-guy-with-pool-cue-playing-billiard.jpg',
  balls: '/images/closeup-billiard-balls-sticks-table.jpg',
  player: '/images/young-woman-playing-billiard.jpg',
  hall: '/images/hall_digital.png',
  winner: '/images/players_win.png',
  app: '/images/trophy_app.png',
  logo: '/images/logo.png',
};

const AnimatedCounter = ({ value, duration = 1.8 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = parseInt(value, 10) || 0;
    const controls = animate(0, target, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => setCount(Math.floor(latest)),
    });
    return () => controls.stop();
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
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
      return toast.error('Please fill in name, email and phone');
    }

    setFooterSubmitting(true);
    try {
      await api.post('/moderator-requests', {
        ...footerForm,
        experience: 'Applied via landing page.',
      });
      toast.success('Application sent. We will contact you soon.');
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
          api.get('/users/leaderboard?limit=10'),
        ]);

        const active = tResponse.data
          .filter((t) => ['open_for_players', 'full', 'ongoing'].includes(t.status) && t.entryType === 'open_request')
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

  const features = [
    {
      icon: LayoutGrid,
      title: 'Automated brackets',
      text: 'Single and double elimination, round robin, and live bracket updates.',
    },
    {
      icon: Zap,
      title: 'Real-time scoring',
      text: 'Match results sync instantly across hall displays and player devices.',
    },
    {
      icon: Shield,
      title: 'Secure payouts',
      text: 'Entry fees, platform fees, and prize distribution handled in one flow.',
    },
  ];

  const steps = [
    { num: '01', title: 'Register', text: 'Create your profile and join open tournaments.' },
    { num: '02', title: 'Compete', text: 'Play your matches with live fixture tracking.' },
    { num: '03', title: 'Rank up', text: 'Earn points, climb the leaderboard, collect prizes.' },
  ];

  return (
    <PublicLayout showFooter={false}>
      <div className="landing-pool selection:bg-emerald-500/20">

        {/* Hero */}
        <section className="relative min-h-[88vh] flex items-center overflow-hidden">
          <img
            src={IMG.hero}
            alt="Player lining up a shot on a pool table"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#061510]/95 via-[#0a1f18]/88 to-[#061510]/75" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(16,185,129,0.12),transparent_55%)]" />

          <div className="container relative z-10 mx-auto px-6 py-20">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                className="max-w-xl"
              >
                <motion.div variants={fadeUp} className="mb-6 flex items-center gap-3">
                  <img src={IMG.logo} alt="CueArena" className="h-11 w-11 rounded-xl ring-2 ring-emerald-500/30" />
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400/90">
                    Cue sports platform
                  </span>
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
                >
                  Run pool tournaments with precision.
                </motion.h1>

                <motion.p variants={fadeUp} className="mt-5 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
                  Brackets, fixtures, rankings, and payouts — built for halls, moderators, and competitive players.
                </motion.p>

                <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-400"
                  >
                    Get started <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/tournaments"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
                  >
                    View tournaments
                  </Link>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  className="mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-8"
                >
                  {[
                    { label: 'Tournaments', value: stats.totalTournaments },
                    { label: 'Matches', value: stats.totalMatches },
                    { label: 'Players', value: stats.totalPlayers },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-2xl font-black text-white">
                        <AnimatedCounter value={item.value} />
                      </p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/45">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="hidden lg:block"
              >
                <div className="relative">
                  <div className="absolute -inset-4 rounded-3xl bg-emerald-500/10 blur-2xl" />
                  <img
                    src={IMG.balls}
                    alt="Billiard balls and cues on green felt"
                    className="relative rounded-2xl border border-white/10 object-cover shadow-2xl"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-b border-base2 bg-surface py-20">
          <div className="container mx-auto px-6">
            <div className="mb-12 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Platform</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-text-emphasis sm:text-4xl">
                Everything a modern billiards event needs.
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-base2 bg-background p-7 transition hover:border-emerald-500/30 hover:shadow-md"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <f.icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-text-emphasis">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Image showcase */}
        <section className="bg-[#0b1612] py-20 text-white">
          <div className="container mx-auto px-6">
            <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400/80">The experience</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  From the table to the leaderboard.
                </h2>
              </div>
              <Link to="/rankings" className="text-sm font-bold text-emerald-400 hover:text-emerald-300">
                View rankings &rarr;
              </Link>
            </div>

            <div className="grid gap-5 lg:grid-cols-12 lg:grid-rows-2">
              <div className="group relative overflow-hidden rounded-2xl lg:col-span-7 lg:row-span-2 min-h-[280px]">
                <img src={IMG.hall} alt="Digital tournament hall display" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 p-6">
                  <h3 className="text-xl font-bold">Smart venue displays</h3>
                  <p className="mt-1 max-w-sm text-sm text-white/65">Live brackets and table assignments for your hall.</p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl lg:col-span-5 min-h-[200px]">
                <img src={IMG.player} alt="Player taking a shot" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                <div className="absolute bottom-0 p-5">
                  <h3 className="text-lg font-bold">Player-first design</h3>
                  <p className="mt-1 text-sm text-white/65">Fixtures, results, and profiles on any device.</p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl lg:col-span-5 min-h-[200px]">
                <img src={IMG.winner} alt="Tournament winner celebration" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                <div className="absolute bottom-0 p-5">
                  <h3 className="text-lg font-bold">Championship moments</h3>
                  <p className="mt-1 text-sm text-white/65">Automated prize flows when the final ball drops.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-base2 bg-background py-20">
          <div className="container mx-auto px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">How it works</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-text-emphasis sm:text-4xl">
                  Three steps to compete.
                </h2>
                <div className="mt-8 space-y-5">
                  {steps.map((step) => (
                    <div key={step.num} className="flex gap-4">
                      <span className="text-2xl font-black text-emerald-500/30">{step.num}</span>
                      <div>
                        <h3 className="font-bold text-text-emphasis">{step.title}</h3>
                        <p className="mt-0.5 text-sm text-text-muted">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-base2 shadow-xl">
                <img src={IMG.app} alt="CueArena mobile app" className="w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/40 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* Tournaments + Leaderboard */}
        <section id="tournaments-section" className="bg-surface py-20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col gap-10 xl:flex-row">
              <div className="flex-1 min-w-0">
                <div className="mb-8 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Live now</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-text-emphasis">Active tournaments</h2>
                  </div>
                  <Link to="/tournaments" className="hidden text-sm font-bold text-emerald-600 hover:text-emerald-500 sm:inline">
                    See all
                  </Link>
                </div>

                <AnimatePresence mode="wait">
                  {loading ? (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-64 animate-pulse rounded-2xl bg-base2/40" />
                      ))}
                    </div>
                  ) : tournaments.length > 0 ? (
                    <motion.div
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                      className="grid grid-cols-1 gap-5 md:grid-cols-2"
                    >
                      {tournaments.map((t) => (
                        <motion.div key={t.id} variants={fadeUp}>
                          <TournamentCard tournament={t} />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-base2 bg-background py-16 text-center">
                      <Trophy size={36} className="mx-auto mb-3 text-text-muted/40" />
                      <h3 className="font-bold text-text-emphasis">No active tournaments</h3>
                      <p className="mt-1 text-sm text-text-muted">Check back soon or browse all events.</p>
                      <Link to="/tournaments" className="mt-4 inline-block text-sm font-bold text-emerald-600">
                        Browse tournaments
                      </Link>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-full shrink-0 xl:w-[360px]">
                <LeaderboardPanel
                  players={leaderboard}
                  title="Top players"
                  subtitle="Current season rankings"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden py-20">
          <img src={IMG.balls} alt="" className="absolute inset-0 h-full w-full object-cover" aria-hidden />
          <div className="absolute inset-0 bg-[#061510]/90" />
          <div className="container relative z-10 mx-auto px-6 text-center">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Ready to run your next event?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/60">
              Join as a player or apply to moderate tournaments at your venue.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-400"
              >
                Create account <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-base2 bg-surface py-16">
          <div className="container mx-auto px-6">
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <div className="flex items-center gap-3">
                  <img src={IMG.logo} alt="" className="h-9 w-9 rounded-lg" />
                  <span className="text-lg font-black text-text-emphasis">CueArena</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-text-muted">
                  Professional tournament management for billiards and cue sports.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-text-emphasis">Explore</h4>
                <ul className="mt-4 space-y-2 text-sm text-text-muted">
                  <li><Link to="/tournaments" className="hover:text-emerald-600">Tournaments</Link></li>
                  <li><Link to="/fixtures" className="hover:text-emerald-600">Fixtures</Link></li>
                  <li><Link to="/results" className="hover:text-emerald-600">Results</Link></li>
                  <li><Link to="/rankings" className="hover:text-emerald-600">Rankings</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-text-emphasis">Account</h4>
                <ul className="mt-4 space-y-2 text-sm text-text-muted">
                  <li><Link to="/register" className="hover:text-emerald-600">Register</Link></li>
                  <li><Link to="/login" className="hover:text-emerald-600">Login</Link></li>
                  <li><Link to="/moderator-apply" className="hover:text-emerald-600">Become a moderator</Link></li>
                </ul>
              </div>

              <div className="rounded-2xl border border-base2 bg-background p-6">
                <h4 className="flex items-center gap-2 text-sm font-bold text-text-emphasis">
                  <Target size={15} className="text-emerald-600" />
                  Moderator application
                </h4>
                <p className="mt-2 text-xs text-text-muted">Organize tournaments at your hall.</p>
                <form onSubmit={handleFooterSubmit} className="mt-4 space-y-2">
                  <input
                    type="text"
                    placeholder="Full name"
                    value={footerForm.fullName}
                    onChange={(e) => setFooterForm({ ...footerForm, fullName: e.target.value })}
                    className="w-full rounded-lg border border-base2 bg-surface px-3 py-2 text-xs outline-none focus:border-emerald-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={footerForm.email}
                    onChange={(e) => setFooterForm({ ...footerForm, email: e.target.value })}
                    className="w-full rounded-lg border border-base2 bg-surface px-3 py-2 text-xs outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={footerForm.phone}
                    onChange={(e) => setFooterForm({ ...footerForm, phone: e.target.value })}
                    className="w-full rounded-lg border border-base2 bg-surface px-3 py-2 text-xs outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={footerSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {footerSubmitting ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> Submit</>}
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-12 flex flex-col gap-2 border-t border-base2 pt-8 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
              <p>&copy; 2026 CueArena. All rights reserved.</p>
              <div className="flex gap-4">
                <Link to="/contact" className="hover:text-emerald-600">Contact</Link>
                <Link to="/moderator-apply" className="hover:text-emerald-600">Moderator apply</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </PublicLayout>
  );
};

export default Landing;

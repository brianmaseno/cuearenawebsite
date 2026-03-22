import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Calendar, ArrowRight, Target, MapPin } from 'lucide-react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const Landing = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const { data } = await api.get('/tournaments');
        // Only show open or ongoing, capped at 6
        const active = data
          .filter(t => t.status !== 'draft' && t.status !== 'cancelled')
          .slice(0, 6);
        setTournaments(active);
      } catch (err) {
        console.error('Error fetching tournaments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const scrollToTournaments = () => {
    document.getElementById('tournaments-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-base2 bg-base3/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-base3 group-hover:scale-105 transition-transform">
              <Target size={24} />
            </div>
            <span className="text-xl brand-premium">Cue-Arena</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-text hover:text-primary font-medium transition-colors">Login</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-20 lg:py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue/10 text-blue border border-blue/20 text-sm font-semibold mb-6">
            <Trophy size={14} />
            <span>The Professional Pool Arena</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-text-emphasis mb-6 tracking-tight">
            Organize. Compete. <br /><span className="text-primary italic">Master the Cues.</span>
          </h1>
          <p className="text-xl text-text max-w-2xl mx-auto mb-10 leading-relaxed">
            The premium match management platform for pool enthusiasts. Professional tournaments, direct matches, and real-time results tracking in one sleek arena.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-lg px-8 py-3 flex items-center gap-2">
              Start Organizing <ArrowRight size={20} />
            </Link>
            <button
              onClick={scrollToTournaments}
              className="px-8 py-3 rounded-lg border border-base2 hover:bg-base2 transition-colors font-semibold text-text-emphasis"
            >
              Browse Matches
            </button>
          </div>
        </div>

        {/* Background Accents */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-yellow/10 rounded-full blur-3xl"></div>
      </header>

      {/* Tournaments Section */}
      <section id="tournaments-section" className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-extrabold text-text-emphasis mb-4">Active Tournaments</h2>
              <p className="text-lg text-text">Join the latest competitions in the arena.</p>
            </div>
            <Link to="/tournaments" className="text-primary hover:text-primary-dark font-bold flex items-center gap-2 group">
              View All <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-base2 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : tournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tournaments.map(t => (
                <div key={t._id} className="card-premium rounded-2xl overflow-hidden flex flex-col h-full group">
                  <div className="relative h-4 w-full bg-primary/10 border-b border-base2">
                    <div className={`h-full transition-all duration-1000 ${t.status === 'ongoing' ? 'bg-blue pulse' : 'bg-green'}`} style={{ width: `${(t.confirmedPlayers.length / t.maxPlayers) * 100}%` }}></div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <StatusBadge status={t.status} registrationDeadline={t.registrationDeadline} />
                      <span className="text-xs font-bold text-text bg-base2 px-2 py-0.5 rounded uppercase tracking-tighter">
                        {t.format.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-text-emphasis mb-4 group-hover:text-primary transition-colors">{t.name}</h3>

                    <div className="space-y-2 mb-6 flex-1 text-sm text-text">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date(t.startDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        {t.venue}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        {t.confirmedPlayers.length} / {t.maxPlayers} Players
                      </div>
                    </div>

                    <Link to="/login" className="w-full btn-primary py-2.5 rounded-xl flex items-center justify-center gap-2 opacity-90 hover:opacity-100 group">
                      View Details <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-base3/30 border-2 border-dashed border-base2 rounded-3xl">
              <Trophy size={64} className="mx-auto text-base2 mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-text-emphasis">No active tournaments</h3>
              <p className="text-text">Check back later or start organizing yourself!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-base3/50 border-y border-base2">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-premium p-8 rounded-2xl">
              <div className="w-12 h-12 bg-blue/10 text-blue rounded-xl flex items-center justify-center mb-6">
                <Trophy size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Tournaments</h3>
              <p className="text-text leading-relaxed">
                Moderated bracket tournaments with custom formats. Open requests or invite-only registrations supported for professionals.
              </p>
            </div>
            <div className="card-premium p-8 rounded-2xl">
              <div className="w-12 h-12 bg-green/10 text-green rounded-xl flex items-center justify-center mb-6">
                <Users size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Direct Matches</h3>
              <p className="text-text leading-relaxed">
                Quick 1-on-1 matches arranged by moderators. Instant invitations and verified result tracking for every game.
              </p>
            </div>
            <div className="card-premium p-8 rounded-2xl">
              <div className="w-12 h-12 bg-violet/10 text-violet rounded-xl flex items-center justify-center mb-6">
                <Calendar size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Pro Scheduling</h3>
              <p className="text-text leading-relaxed">
                Venue management (MVP: text-based) and scheduled dates for every match. Never miss a game with real-time notifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-base2 bg-base2/20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-base3">
              <Target size={18} />
            </div>
            <span className="text-xl brand-premium">Cue-Arena</span>
          </div>
          <p className="text-text mb-8">© 2026 <span className="brand-premium align-middle transform scale-90">Cue-Arena</span> — Premium Pool Platform.</p>
          <div className="flex justify-center gap-6">
            <a href="#" className="text-text hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="text-text hover:text-primary transition-colors">Terms</a>
            <a href="#" className="text-text hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

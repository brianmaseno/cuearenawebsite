import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Calendar, ArrowRight, Target } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-base2 bg-base3/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-base3 group-hover:scale-105 transition-transform">
              <Target size={24} />
            </div>
            <span className="text-xl font-bold text-text-emphasis tracking-tight">Cue-Arena</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/tournaments" className="text-text hover:text-primary font-medium transition-colors">Tournaments</Link>
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
            <Link to="/tournaments" className="px-8 py-3 rounded-lg border border-base2 hover:bg-base2 transition-colors font-semibold text-text-emphasis">
              Browse Matches
            </Link>
          </div>
        </div>
        
        {/* Background Accents */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-yellow/10 rounded-full blur-3xl"></div>
      </header>

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
            <span className="text-xl font-bold text-text-emphasis tracking-tight">Cue-Arena</span>
          </div>
          <p className="text-text mb-8">© 2026 Cue-Arena — Premium Pool Platform.</p>
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

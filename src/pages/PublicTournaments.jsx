import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Trophy, Search, MapPin, Users, Calendar, ArrowRight, Target, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { TournamentCard } from '../components/public/PublicCards';

const PublicTournaments = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const { data } = await api.get('/tournaments');
        // Filter to only show tournaments open for registration
        setTournaments(data.filter(t => t.status === 'open_for_players'));
      } catch (err) {
        console.error('Error fetching tournaments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const filtered = tournaments.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.location?.toLowerCase().includes(search.toLowerCase()) ||
    t.venue?.toLowerCase().includes(search.toLowerCase())
  );

  const TournamentContent = () => (
    <div className={user ? "space-y-8" : "container mx-auto px-4 py-12"}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-text-emphasis flex items-center gap-3">
            <Trophy className="text-yellow" size={36} />
            Open Tournaments
          </h1>
          <p className="text-text mt-2">Browse tournaments and join the next competition.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base1">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-base3 border border-base2 rounded-xl pl-10 pr-4 py-3 text-text-emphasis focus:ring-2 focus:ring-primary shadow-sm outline-none"
            placeholder="Search by name or region..."
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center py-20">
          <Loader2 className="animate-spin text-primary mx-auto" size={48} />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-base3/30 border-2 border-dashed border-base2 rounded-3xl">
          <Trophy size={64} className="mx-auto text-base2 mb-4" />
          <h3 className="text-xl font-bold text-text-emphasis">No open tournaments found</h3>
          <p className="text-text">Try adjusting your search or check back later.</p>
        </div>
      )}
    </div>
  );

  if (user) {
    return (
      <DashboardLayout title="Open Tournaments">
        <TournamentContent />
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar (Same as Landing) */}
      <nav className="border-b border-base2 bg-base3/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-base3">
              <Target size={20} />
            </div>
            <span className="text-xl font-bold text-text-emphasis tracking-tight font-sans">Cue-Arena</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-text hover:text-primary font-medium">Login</Link>
            <Link to="/register" className="btn-primary py-2 px-4">Join Now</Link>
          </div>
        </div>
      </nav>

      <main>
        <TournamentContent />
      </main>
    </div>
  );
};

export default PublicTournaments;

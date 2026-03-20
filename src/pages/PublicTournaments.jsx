import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Trophy, Search, MapPin, Users, Calendar, ArrowRight, Target } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const PublicTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const { data } = await api.get('/tournaments');
        // Only show open or ongoing for public browsing
        setTournaments(data.filter(t => t.status !== 'draft' && t.status !== 'cancelled'));
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
    t.venue.toLowerCase().includes(search.toLowerCase())
  );

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

      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-text-emphasis flex items-center gap-3">
              <Trophy className="text-yellow" size={36} />
              Active Tournaments
            </h1>
            <p className="text-text mt-2">Discover upcoming competitions and live matches in the arena.</p>
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
              placeholder="Search by name or venue..."
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-base2 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(t => (
              <div key={t._id} className="card-premium rounded-2xl overflow-hidden flex flex-col h-full group">
                <div className="relative h-4 w-full bg-primary/10">
                  <div className={`h-full transition-all duration-1000 ${t.status === 'ongoing' ? 'bg-blue pulse' : 'bg-green'}`} style={{ width: `${(t.confirmedPlayers.length / t.maxPlayers) * 100}%` }}></div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <StatusBadge status={t.status} />
                    <span className="text-xs font-bold text-text bg-base2 px-2 py-0.5 rounded uppercase tracking-tighter">
                      {t.format.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-text-emphasis mb-4 group-hover:text-primary transition-colors">{t.name}</h3>
                  
                  <div className="space-y-2 mb-6 flex-1">
                    <div className="flex items-center gap-2 text-sm text-text">
                      <Calendar size={16} />
                      {new Date(t.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text">
                      <MapPin size={16} />
                      {t.venue}, {t.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text">
                      <Users size={16} />
                      {t.confirmedPlayers.length} / {t.maxPlayers} Players
                    </div>
                  </div>

                  <Link to={`/login`} className="w-full btn-primary mt-auto py-2.5 rounded-xl flex items-center justify-center gap-2 opacity-90 hover:opacity-100">
                    View Details <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-base3/30 border-2 border-dashed border-base2 rounded-3xl">
            <Trophy size={64} className="mx-auto text-base2 mb-4" />
            <h3 className="text-xl font-bold text-text-emphasis">No tournaments found</h3>
            <p className="text-text">Try adjusting your search or check back later.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicTournaments;

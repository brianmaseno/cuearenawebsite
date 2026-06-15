import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import PublicLayout from '../../components/public/PublicLayout';
import { PlayerAvatar } from '../../components/public/PublicCards';

const PublicPlayers = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      api.get('/public/players', { params: search ? { search } : {} })
        .then((res) => setItems(res.data.items || []))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="mb-8 rounded-2xl border border-base2 bg-surface p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-primary">Player Hall</p>
            <h1>Players</h1>
            <p className="mt-3 text-text-muted">Browse active players, points, and public profiles.</p>
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search players" className="input-modern max-w-xs" />
        </div>
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-40 rounded-2xl bg-base2/50 animate-pulse" />)}</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-base2 bg-surface p-12 text-center">
            <h3 className="text-xl font-black text-text-emphasis">No players found</h3>
            <p className="mt-2 text-sm text-text-muted">Try a different search term.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((player) => (
              <Link key={player.id} to={`/players/${player.id}`} className="group rounded-2xl border border-base2 bg-surface p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
                <PlayerAvatar player={player} />
                <p className="mt-4 line-clamp-2 text-sm text-text-muted">{player.bio || 'Cue Arena competitor.'}</p>
                <div className="mt-5 flex items-center justify-between rounded-xl bg-background px-4 py-3">
                  <span className="text-xs font-black uppercase tracking-widest text-text-muted">Points</span>
                  <span className="font-black text-primary">{player.points}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
};

export default PublicPlayers;

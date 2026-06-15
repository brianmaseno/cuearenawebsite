import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import PublicLayout from '../../components/public/PublicLayout';
import { TournamentCard } from '../../components/public/PublicCards';

const PublicTournaments = () => {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/public/tournaments', { params: status ? { status } : {} })
      .then((res) => setItems(res.data.items || []))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="mb-8 rounded-2xl border border-base2 bg-surface p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-primary">Competition Directory</p>
            <h1>Tournaments</h1>
            <p className="mt-3 text-text-muted">Browse competitions, prize pools, venues, and player slots without logging in.</p>
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-modern max-w-xs">
            <option value="">All statuses</option>
            <option value="open_for_players">Open for players</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="full">Full</option>
          </select>
        </div>
        </div>
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((i) => <div key={i} className="h-72 rounded-2xl bg-base2/50 animate-pulse" />)}</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-base2 bg-surface p-12 text-center">
            <h3 className="text-xl font-black text-text-emphasis">No tournaments found</h3>
            <p className="mt-2 text-sm text-text-muted">Try a different status filter or check again later.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((tournament) => <TournamentCard key={tournament.id} tournament={tournament} />)}
          </div>
        )}
      </section>
    </PublicLayout>
  );
};

export default PublicTournaments;

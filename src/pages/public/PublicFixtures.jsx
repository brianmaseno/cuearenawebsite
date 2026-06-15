import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import PublicLayout from '../../components/public/PublicLayout';
import { MatchRow } from '../../components/public/PublicCards';

const PublicFixtures = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/public/fixtures')
      .then((res) => setItems(res.data.items || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="rounded-2xl border border-base2 bg-surface p-6 shadow-sm md:p-8">
          <p className="text-sm font-black uppercase tracking-widest text-primary">Match Center</p>
          <h1>Fixtures</h1>
          <p className="mt-3 text-text-muted">Upcoming and live matches across Cue Arena competitions.</p>
        </div>
        <div className="mt-8 grid gap-3">
          {loading ? <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-36 rounded-2xl bg-base2/50 animate-pulse" />)}</div> : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-base2 bg-surface p-12 text-center">
              <h3 className="text-xl font-black text-text-emphasis">No fixtures scheduled</h3>
              <p className="mt-2 text-sm text-text-muted">Upcoming matches will appear here once organizers publish them.</p>
            </div>
          ) : items.map((match, index) => {
            const live = ['ongoing', 'in_progress', 'live'].includes(String(match.status || '').toLowerCase());
            return (
              <MatchRow
                key={`${match.type}-${match.id}`}
                match={match}
                variant={live ? 'featured' : index === 0 ? 'full' : 'compact'}
              />
            );
          })}
        </div>
      </section>
    </PublicLayout>
  );
};

export default PublicFixtures;

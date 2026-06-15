import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import PublicLayout from '../../components/public/PublicLayout';
import { MatchRow } from '../../components/public/PublicCards';

const PublicResults = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/public/results')
      .then((res) => setItems(res.data.items || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="rounded-2xl border border-base2 bg-surface p-6 shadow-sm md:p-8">
          <p className="text-sm font-black uppercase tracking-widest text-primary">Match Archive</p>
          <h1>Results</h1>
          <p className="mt-3 text-text-muted">Completed matches, winners, scores, and competition history.</p>
        </div>
        <div className="mt-8 grid gap-3">
          {loading ? <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-36 rounded-2xl bg-base2/50 animate-pulse" />)}</div> : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-base2 bg-surface p-12 text-center">
              <h3 className="text-xl font-black text-text-emphasis">No results yet</h3>
              <p className="mt-2 text-sm text-text-muted">Completed matches will appear here with scores and winners.</p>
            </div>
          ) : items.map((match) => (
            <MatchRow key={`${match.type}-${match.id}`} match={match} variant="full" />
          ))}
        </div>
      </section>
    </PublicLayout>
  );
};

export default PublicResults;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import PublicLayout from '../../components/public/PublicLayout';
import { PlayerAvatar } from '../../components/public/PublicCards';

const PublicRankings = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/public/rankings', { params: { limit: 50 } })
      .then((res) => setItems(res.data.items || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="rounded-2xl border border-base2 bg-surface p-6 shadow-sm md:p-8">
          <p className="text-sm font-black uppercase tracking-widest text-primary">Cue Rankings</p>
          <h1>Rankings</h1>
          <p className="mt-3 text-text-muted">Public leaderboard based on player points and match performance.</p>
        </div>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-base2 bg-surface shadow-sm">
          <div className="min-w-[680px] grid grid-cols-[64px_1fr_90px_90px_100px] gap-3 border-b border-base2 bg-background px-5 py-4 text-xs font-black uppercase tracking-widest text-text-muted">
            <span>Rank</span><span>Player</span><span>Played</span><span>Wins</span><span>Points</span>
          </div>
          {loading ? <div className="p-5"><div className="h-48 rounded-xl bg-base2/50 animate-pulse" /></div> : items.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-xl font-black text-text-emphasis">No rankings available</h3>
              <p className="mt-2 text-sm text-text-muted">Player rankings will appear once matches are recorded.</p>
            </div>
          ) : items.map((player) => (
            <Link key={player.id} to={`/players/${player.id}`} className="min-w-[680px] grid grid-cols-[64px_1fr_90px_90px_100px] items-center gap-3 border-b border-base2 px-5 py-4 text-sm transition-colors last:border-b-0 hover:bg-base2/40">
              <span className="font-black text-primary">#{player.rank}</span>
              <PlayerAvatar player={player} size="sm" />
              <span>{player.stats?.played || 0}</span>
              <span>{player.stats?.wins || 0}</span>
              <span className="font-black text-text-emphasis">{player.points}</span>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
};

export default PublicRankings;

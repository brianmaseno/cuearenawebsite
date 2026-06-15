import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Trophy, Users } from 'lucide-react';
import api from '../../api/axios';
import PublicLayout from '../../components/public/PublicLayout';
import { MatchRow, TournamentCard, PlayerAvatar } from '../../components/public/PublicCards';

const PublicHome = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/public/home')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <section className="border-b border-base2 bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[1.3fr_0.7fr] lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-sm font-black uppercase tracking-widest text-primary">Arena Board</p>
            <h1>Cue sports, fixtures, rankings, and results in one place.</h1>
            <p className="mt-5 max-w-2xl text-lg text-text-muted">
              Follow live competitions, see who is playing, track standings, and discover open tournaments before signing in.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/tournaments" className="aura-btn px-5 py-3 text-xs">View Tournaments</Link>
              <Link to="/rankings" className="btn-outline px-5 py-3 text-xs">See Rankings</Link>
            </div>
          </div>
          <div className="rounded-2xl border border-base2 bg-background p-5">
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">Featured Competition</p>
            {data?.featured ? (
              <TournamentCard tournament={data.featured} featured />
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-base2 p-8 text-text-muted">No featured competition yet.</div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Tournaments', value: data?.stats?.tournaments || 0, icon: Trophy },
            { label: 'Matches', value: data?.stats?.matches || 0, icon: CalendarDays },
            { label: 'Players', value: data?.stats?.players || 0, icon: Users }
          ].map((item) => (
            <div key={item.label} className="card-premium p-5">
              <item.icon className="mb-4 text-primary" size={24} />
              <p className="text-3xl font-black text-text-emphasis">{item.value}</p>
              <p className="text-sm font-bold text-text-muted">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl">Open Tournaments</h2>
            <Link to="/tournaments" className="flex items-center gap-1 text-sm font-bold text-primary">All <ArrowRight size={16} /></Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {(data?.tournaments || []).slice(0, 4).map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl">Top Players</h2>
            <Link to="/players" className="flex items-center gap-1 text-sm font-bold text-primary">Players <ArrowRight size={16} /></Link>
          </div>
          <div className="rounded-2xl border border-base2 bg-surface p-4">
            {(data?.rankings || []).slice(0, 8).map((player, index) => (
              <Link key={player.id} to={`/players/${player.id}`} className="flex items-center justify-between border-b border-base2 py-3 last:border-b-0">
                <div className="flex items-center gap-3">
                  <span className="w-7 text-sm font-black text-primary">#{index + 1}</span>
                  <PlayerAvatar player={player} size="sm" />
                </div>
                <span className="font-black text-text-emphasis">{player.points} pts</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl">Upcoming Fixtures</h2>
          <div className="grid gap-3">
            {(data?.fixtures || []).map((match, index) => {
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
        </div>
        <div>
          <h2 className="mb-4 text-2xl">Latest Results</h2>
          <div className="grid gap-3">
            {(data?.results || []).map((match) => (
              <MatchRow key={`${match.type}-${match.id}`} match={match} variant="full" />
            ))}
          </div>
        </div>
      </section>

      {loading && <div className="mx-auto max-w-7xl px-4 pb-10 text-text-muted">Loading arena data...</div>}
    </PublicLayout>
  );
};

export default PublicHome;

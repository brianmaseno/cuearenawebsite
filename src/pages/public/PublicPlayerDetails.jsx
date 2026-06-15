import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Award, Target, Trophy } from 'lucide-react';
import api from '../../api/axios';
import PublicLayout from '../../components/public/PublicLayout';
import { MatchRow, PlayerAvatar } from '../../components/public/PublicCards';

const PublicPlayerDetails = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/public/players/${id}`)
      .then((res) => setPlayer(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PublicLayout><div className="mx-auto max-w-7xl px-4 py-10 text-text-muted">Loading player...</div></PublicLayout>;
  if (!player) return <PublicLayout><div className="mx-auto max-w-7xl px-4 py-10 text-text-muted">Player not found.</div></PublicLayout>;

  return (
    <PublicLayout>
      <section className="border-b border-base2 bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <PlayerAvatar player={player} />
          <h1 className="mt-5">{player.fullName}</h1>
          <p className="mt-3 max-w-2xl text-text-muted">{player.bio || 'Cue Arena competitor.'}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              { label: 'Points', value: player.points, icon: Trophy },
              { label: 'Played', value: player.stats?.played || 0, icon: Target },
              { label: 'Wins', value: player.stats?.wins || 0, icon: Award },
              { label: 'Win Rate', value: `${player.stats?.winRate || 0}%`, icon: Target }
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-base2 bg-background p-4">
                <item.icon className="mb-3 text-primary" size={22} />
                <p className="text-xs font-black uppercase tracking-widest text-text-muted">{item.label}</p>
                <p className="mt-1 text-2xl font-black text-text-emphasis">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <h2 className="mb-4 text-2xl">Achievements</h2>
          <div className="rounded-2xl border border-base2 bg-surface p-4">
            {(player.achievements || []).length === 0 ? (
              <p className="text-text-muted">No public achievements yet.</p>
            ) : player.achievements.map((item) => (
              <div key={item.id} className="border-b border-base2 py-3 last:border-b-0">
                <p className="font-black text-text-emphasis">{item.achievement?.name}</p>
                <p className="text-sm text-text-muted">{item.achievement?.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-2xl">Recent Results</h2>
          <div className="grid gap-3">
            {(player.recentResults || []).length === 0 ? (
              <div className="rounded-xl border border-dashed border-base2 p-8 text-text-muted">No completed public matches yet.</div>
            ) : player.recentResults.map((match) => <MatchRow key={`${match.type}-${match.id}`} match={match} />)}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default PublicPlayerDetails;

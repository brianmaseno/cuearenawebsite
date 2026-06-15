import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, MapPin, Trophy, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import PublicLayout from '../../components/public/PublicLayout';
import { formatDate, formatMoney, MatchRow, PlayerAvatar, StatusPill } from '../../components/public/PublicCards';

const PublicTournamentDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    api.get(`/public/tournaments/${id}`)
      .then((res) => setTournament(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const refreshTournament = () => {
    return api.get(`/public/tournaments/${id}`).then((res) => setTournament(res.data));
  };

  const handleJoin = async () => {
    if (!user) return;
    setJoining(true);
    try {
      await api.post(`/tournaments/${id}/join`);
      toast.success('You joined this tournament.');
      await refreshTournament();
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to join tournament';
      if (message.toLowerCase().includes('insufficient funds')) {
        toast.error('Top up your wallet before joining this tournament.');
      } else {
        toast.error(message);
      }
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <PublicLayout><div className="mx-auto max-w-7xl px-4 py-10 text-text-muted">Loading tournament...</div></PublicLayout>;
  if (!tournament) return <PublicLayout><div className="mx-auto max-w-7xl px-4 py-10 text-text-muted">Tournament not found.</div></PublicLayout>;

  return (
    <PublicLayout>
      <section className="border-b border-base2 bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <StatusPill status={tournament.status} />
              <h1 className="mt-4">{tournament.name}</h1>
              <p className="mt-4 max-w-3xl text-text-muted">{tournament.description || 'Tournament details will be updated by the organizer.'}</p>
            </div>
            {!user ? (
              <Link to="/login" className="aura-btn px-5 py-3 text-center text-xs">Sign in to join</Link>
            ) : user.role === 'player' && ['open', 'open_request'].includes(tournament.entryType) && tournament.status === 'open_for_players' ? (
              <div className="grid gap-2">
                <button type="button" disabled={joining} onClick={handleJoin} className="aura-btn px-5 py-3 text-center text-xs disabled:opacity-60">
                  {joining ? 'Joining...' : `Join Tournament${tournament.stakePerPlayer > 0 ? ` - ${formatMoney(tournament.stakePerPlayer)}` : ''}`}
                </button>
                {tournament.stakePerPlayer > 0 && <Link to="/wallet" className="text-center text-xs font-bold text-primary hover:underline">Top up wallet</Link>}
              </div>
            ) : (
              <Link to={user.role === 'admin' ? '/admin' : user.role === 'moderator' ? '/moderator/ongoing' : '/dashboard'} className="aura-btn px-5 py-3 text-center text-xs">
                Open Dashboard
              </Link>
            )}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              { label: 'Venue', value: `${tournament.venue}, ${tournament.location}`, icon: MapPin },
              { label: 'Start', value: formatDate(tournament.startDate), icon: CalendarDays },
              { label: 'Players', value: `${tournament.playerCount}/${tournament.maxPlayers}`, icon: Users },
              { label: 'Prize Pool', value: formatMoney(tournament.prizePool), icon: Trophy }
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-base2 bg-background p-4">
                <item.icon className="mb-3 text-primary" size={22} />
                <p className="text-xs font-black uppercase tracking-widest text-text-muted">{item.label}</p>
                <p className="mt-1 font-black text-text-emphasis">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="mb-4 text-2xl">Confirmed Players</h2>
          <div className="rounded-2xl border border-base2 bg-surface p-4">
            {(tournament.confirmedPlayers || []).map((player) => (
              <Link key={player.id} to={`/players/${player.id}`} className="flex items-center justify-between border-b border-base2 py-3 last:border-b-0">
                <PlayerAvatar player={player} size="sm" />
                <span className="font-black text-text-emphasis">{player.points} pts</span>
              </Link>
            ))}
          </div>

          <h2 className="mb-4 mt-8 text-2xl">Standings</h2>
          <div className="overflow-hidden rounded-2xl border border-base2 bg-surface">
            {(tournament.standings || []).map((row, index) => (
              <div key={row.player.id} className="grid grid-cols-[40px_1fr_60px_60px] items-center gap-3 border-b border-base2 px-4 py-3 text-sm last:border-b-0">
                <span className="font-black text-primary">#{index + 1}</span>
                <span className="font-bold text-text-emphasis">{row.player.fullName}</span>
                <span>{row.wins}W</span>
                <span>{row.points} pts</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-2xl">Fixtures And Results</h2>
          <div className="grid gap-3">
            {(tournament.matches || []).length === 0 ? (
              <div className="rounded-xl border border-dashed border-base2 p-8 text-text-muted">No bracket fixtures yet.</div>
            ) : (
              tournament.matches.map((match) => (
                <MatchRow
                  key={match.id}
                  match={match}
                  variant={match.status === 'completed' ? 'full' : 'compact'}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default PublicTournamentDetails;

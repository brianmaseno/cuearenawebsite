import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Trophy, Users, ArrowRight, Clock } from 'lucide-react';

export const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
}) : 'TBA';

export const formatTime = (value) => {
  if (!value) return 'TBD';
  return new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

export const formatMoney = (value) => `KES ${Number(value || 0).toLocaleString()}`;

const avatarUrl = (player, fallback = 'Player') => {
  const name = player?.fullName || fallback;
  return player?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e91e8c&color=fff&size=128`;
};

const playerName = (player, fallback = 'TBD') => {
  if (!player) return fallback;
  return player.fullName || player.name || fallback;
};

const shortName = (player, fallback = 'TBD') => {
  const name = playerName(player, fallback);
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return parts.length > 2 ? `${parts[0]} ${parts[parts.length - 1]}` : name;
};

const isLive = (status) => ['ongoing', 'in_progress', 'live'].includes(String(status || '').toLowerCase());

const isCompleted = (status) => String(status || '').toLowerCase() === 'completed';

const statusBadgeText = (match) => {
  if (isLive(match.status)) return 'LIVE';
  if (isCompleted(match.status)) return 'FT';
  if (match.scheduledAt) return formatTime(match.scheduledAt);
  return String(match.status || 'scheduled').replaceAll('_', ' ');
};

export const StatusPill = ({ status }) => (
  <span className="inline-flex items-center rounded-full bg-magenta/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-magenta">
    {String(status || 'scheduled').replaceAll('_', ' ')}
  </span>
);

export const PlayerAvatar = ({ player, size = 'md' }) => {
  const dimension = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-14 w-14' : 'h-11 w-11';
  const name = playerName(player, 'Open Slot');
  return (
    <div className="flex items-center gap-3 min-w-0">
      <img
        src={avatarUrl(player, name)}
        alt=""
        className={`${dimension} shrink-0 rounded-full object-cover ring-2 ring-base2`}
      />
      <span className="truncate font-bold text-text-emphasis">{name}</span>
    </div>
  );
};

const TeamSide = ({ player, label, align = 'left', light = false }) => (
  <div className={`flex flex-1 flex-col items-center gap-2 ${align === 'right' ? 'text-right' : 'text-left'}`}>
    <img
      src={avatarUrl(player, playerName(player))}
      alt=""
      className="h-12 w-12 rounded-full object-cover ring-2 ring-white/20 shadow-md"
    />
    <div className="text-center">
      <p className={`text-sm font-bold leading-tight ${light ? 'text-white' : 'text-text-emphasis'}`}>
        {shortName(player)}
      </p>
      <p className={`text-[10px] font-semibold uppercase tracking-wider ${light ? 'text-white/60' : 'text-text-muted'}`}>
        {label}
      </p>
    </div>
  </div>
);

const ScoreBlock = ({ match, light = false }) => {
  const hasScore = isCompleted(match.status) || match.scorePlayer1 != null;
  const score1 = match.scorePlayer1 ?? match.score1 ?? 0;
  const score2 = match.scorePlayer2 ?? match.score2 ?? 0;

  return (
    <div className="flex shrink-0 flex-col items-center px-3">
      <p className={`text-3xl font-black tracking-tight ${light ? 'text-white' : 'text-text-emphasis'}`}>
        {hasScore ? `${score1} : ${score2}` : 'VS'}
      </p>
      <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${
        isLive(match.status)
          ? 'bg-green/20 text-green'
          : isCompleted(match.status)
            ? 'bg-green/15 text-green'
            : light
              ? 'bg-white/15 text-white/90'
              : 'bg-green/10 text-green'
      }`}>
        {statusBadgeText(match)}
      </span>
    </div>
  );
};

/** Full scoreboard card — featured live or detailed result */
export const MatchScoreCard = ({ match, featured = false }) => {
  const venue = match.venue || match.tournament?.venue || 'Venue TBA';
  const context = match.tournament?.name || match.title || (match.type === 'tournament' ? 'Tournament Match' : 'Direct Match');
  const live = featured || isLive(match.status);

  if (live) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4a1570] via-[#2d0a4a] to-[#1e0021] p-5 shadow-xl shadow-black/30">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white" />
          <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-magenta" />
        </div>
        <div className="relative text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">{venue}</p>
          <p className="mt-0.5 text-[10px] font-medium text-white/50">{context}</p>
        </div>
        <div className="relative mt-5 flex items-center justify-between gap-2">
          <TeamSide player={match.player1} label="Home" light />
          <ScoreBlock match={match} light />
          <TeamSide player={match.player2} label="Away" light />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-base2 bg-surface shadow-lg shadow-black/5">
      <div className="border-b border-base2 bg-background/60 px-5 py-3 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">{venue}</p>
        <p className="mt-0.5 text-[10px] font-medium text-text-muted/80">{context}</p>
      </div>
      <div className="flex items-center justify-between gap-2 px-5 py-6">
        <TeamSide player={match.player1} label="Home" />
        <ScoreBlock match={match} />
        <TeamSide player={match.player2} label="Away" />
      </div>
      {(match.winner || match.scheduledAt) && (
        <div className="flex flex-wrap items-center justify-center gap-4 border-t border-base2 px-5 py-3 text-xs font-semibold text-text-muted">
          {match.scheduledAt && (
            <span className="flex items-center gap-1.5"><Clock size={13} className="text-magenta" />{formatDate(match.scheduledAt)}</span>
          )}
          {match.winner && (
            <span className="flex items-center gap-1.5 text-green">
              <Trophy size={13} /> {playerName(match.winner)} wins
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/** Compact horizontal fixture row */
export const MatchRow = ({ match, variant = 'compact' }) => {
  if (variant === 'featured' || variant === 'full' || isLive(match.status)) {
    return <MatchScoreCard match={match} featured={variant === 'featured' || isLive(match.status)} />;
  }

  const p1 = shortName(match.player1, 'TBD');
  const p2 = shortName(match.player2, 'TBD');
  const hasScore = isCompleted(match.status);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-base2 bg-surface px-4 py-3.5 shadow-sm transition-all hover:border-magenta/30 hover:shadow-md">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate text-sm font-bold text-text-emphasis">{p1}</span>
        <img src={avatarUrl(match.player1, p1)} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
      </div>
      <div className="flex shrink-0 flex-col items-center">
        {hasScore ? (
          <span className="text-base font-black text-text-emphasis">
            {match.scorePlayer1 ?? 0} : {match.scorePlayer2 ?? 0}
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-green/10 px-3 py-1 text-[11px] font-bold text-green">
            {statusBadgeText(match)}
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <img src={avatarUrl(match.player2, p2)} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
        <span className="truncate text-right text-sm font-bold text-text-emphasis">{p2}</span>
      </div>
    </div>
  );
};

export const TournamentCard = ({ tournament, featured = false }) => {
  const fillPct = Math.min(100, ((tournament.playerCount || tournament.confirmedPlayers?.length || 0) / (tournament.maxPlayers || 1)) * 100);
  const playerCount = tournament.playerCount ?? tournament.confirmedPlayers?.length ?? 0;

  const inner = (
    <>
      <div className={`relative overflow-hidden ${featured ? 'bg-gradient-to-br from-[#4a1570] via-[#2d0a4a] to-[#1e0021] p-6' : 'border-b border-base2 bg-gradient-to-r from-magenta/10 via-violet/5 to-transparent p-5'}`}>
        {featured && (
          <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
            <Trophy className="absolute -right-4 -top-4 h-32 w-32 text-white" />
          </div>
        )}
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-[10px] font-bold uppercase tracking-widest ${featured ? 'text-white/60' : 'text-magenta'}`}>
              {String(tournament.format || 'tournament').replaceAll('_', ' ')}
            </p>
            <h3 className={`mt-1 line-clamp-2 text-xl font-black leading-tight ${featured ? 'text-white' : 'text-text-emphasis'}`}>
              {tournament.name}
            </h3>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
            featured ? 'bg-white/15 text-white' : 'bg-magenta/15 text-magenta'
          }`}>
            {String(tournament.status || 'open').replaceAll('_', ' ')}
          </span>
        </div>
      </div>
      <div className="p-5">
        {tournament.description && (
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-text-muted">{tournament.description}</p>
        )}
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-base2">
          <div className="h-full rounded-full bg-gradient-to-r from-magenta to-violet transition-all" style={{ width: `${fillPct}%` }} />
        </div>
        <div className="grid gap-2.5 text-sm text-text-muted">
          <span className="flex items-center gap-2"><MapPin size={15} className="shrink-0 text-magenta" /> {tournament.venue}{tournament.location ? `, ${tournament.location}` : ''}</span>
          <span className="flex items-center gap-2"><CalendarDays size={15} className="shrink-0 text-magenta" /> {formatDate(tournament.startDate)}</span>
          <span className="flex items-center gap-2"><Users size={15} className="shrink-0 text-magenta" /> {playerCount}/{tournament.maxPlayers} players</span>
          <span className="flex items-center gap-2"><Trophy size={15} className="shrink-0 text-magenta" /> Prize pool {formatMoney(tournament.prizePool ?? (tournament.stakePerPlayer * tournament.maxPlayers))}</span>
        </div>
        <div className="mt-5 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-magenta">
          <span>View details</span>
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </>
  );

  return (
    <Link
      to={`/tournaments/${tournament.id}`}
      className={`group block overflow-hidden rounded-3xl border border-base2 bg-surface shadow-lg shadow-black/5 transition-all hover:-translate-y-0.5 hover:border-magenta/30 hover:shadow-xl ${featured ? 'border-transparent' : ''}`}
    >
      {inner}
    </Link>
  );
};

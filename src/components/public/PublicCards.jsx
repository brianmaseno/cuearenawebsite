import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Trophy, Users, ArrowRight, Clock, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import DashStatusPill from '../ui/StatusPill';

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

const tournamentStatusTone = (status) => {
  const s = String(status || 'scheduled').toLowerCase();
  if (s === 'open_for_players') return 'success';
  if (s === 'ongoing' || s === 'in_progress') return 'info';
  if (s === 'full') return 'warning';
  if (s === 'completed' || s === 'cancelled') return 'neutral';
  return 'info';
};

export const StatusPill = ({ status }) => (
  <DashStatusPill tone={tournamentStatusTone(status)} className="text-[11px] capitalize shrink-0">
    {String(status || 'scheduled').replaceAll('_', ' ')}
  </DashStatusPill>
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
  const playerCount = tournament.playerCount ?? tournament.confirmedPlayers?.length ?? 0;
  const maxPlayers = tournament.maxPlayers || 1;
  const fillPct = Math.min(100, (playerCount / maxPlayers) * 100);
  const prize = tournament.prizePool ?? (tournament.stakePerPlayer * tournament.maxPlayers);

  return (
    <Link
      to={`/tournaments/${tournament.id}`}
      className={`public-tournament-card group ${featured ? 'public-tournament-card-featured' : ''}`}
    >
      <div className="public-tournament-card-grid" aria-hidden />
      <div className="public-tournament-card-body">
        <div className="public-tournament-card-head">
          <div className="min-w-0">
            <p className="public-tournament-format">
              {String(tournament.format || 'tournament').replaceAll('_', ' ')}
            </p>
            <h3 className="public-tournament-title">{tournament.name}</h3>
          </div>
          <StatusPill status={tournament.status} />
        </div>

        {tournament.description && (
          <p className="public-tournament-desc">{tournament.description}</p>
        )}

        <div className="public-tournament-progress">
          <div className="public-tournament-progress-label">
            <span>Slots filled</span>
            <span>{playerCount}/{maxPlayers}</span>
          </div>
          <div className="public-tournament-progress-track">
            <div className="public-tournament-progress-fill" style={{ width: `${fillPct}%` }} />
          </div>
        </div>

        <div className="public-stat-grid">
          <div className="public-stat-chip">
            <MapPin size={14} />
            <span>{tournament.venue || 'Venue TBA'}{tournament.location ? `, ${tournament.location}` : ''}</span>
          </div>
          <div className="public-stat-chip">
            <CalendarDays size={14} />
            <span>{formatDate(tournament.startDate)}</span>
          </div>
          <div className="public-stat-chip">
            <Users size={14} />
            <span>{playerCount} players</span>
          </div>
          <div className="public-stat-chip">
            <Trophy size={14} />
            <span>{formatMoney(prize)}</span>
          </div>
        </div>

        <div className="public-tournament-foot">
          <span>View tournament</span>
          <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  );
};

const rankTrendIcon = (trend) => {
  if (trend === 'up') return <ChevronUp size={12} className="text-green" />;
  if (trend === 'down') return <ChevronDown size={12} className="text-red" />;
  return <Minus size={12} className="text-text-muted opacity-40" />;
};

export const LeaderboardPanel = ({
  players = [],
  title = 'Elite rank',
  subtitle = 'Top players by prestige points',
  className = '',
}) => (
  <div className={`public-rank-panel ${className}`}>
    <div className="public-rank-panel-head">
      <div className="public-rank-panel-icon">
        <Trophy size={20} />
      </div>
      <div>
        <h3 className="text-base font-semibold text-text-emphasis">{title}</h3>
        <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
      </div>
    </div>
    <div className="public-rank-list thin-scrollbar">
      {players.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-text-muted">No rankings yet.</p>
      ) : (
        players.map((player, index) => (
          <Link
            key={player.id}
            to={`/players/${player.id}`}
            className={`public-rank-row ${index === 0 ? 'public-rank-row-top' : ''}`}
          >
            <div className="flex flex-col items-center gap-0.5">
              {rankTrendIcon(player.rankTrend)}
              <span className="public-rank-num">{index + 1}</span>
            </div>
            <img
              src={avatarUrl(player, player.fullName)}
              alt=""
              className="public-rank-avatar"
            />
            <span className="public-rank-name">{player.fullName}</span>
            <div className="public-rank-points">
              <p className="public-rank-points-label">Points</p>
              <p className="public-rank-points-value">{player.points || 0}</p>
            </div>
          </Link>
        ))
      )}
    </div>
  </div>
);

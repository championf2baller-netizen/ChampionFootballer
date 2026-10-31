'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Paper, Button, ButtonBase, CircularProgress, Alert, useMediaQuery, useTheme } from '@mui/material';
import PageHeader from '@/Components/PageHeader';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Image, { StaticImageData } from 'next/image';
import { useAuth } from '@/lib/hooks';
import CloseButton from '@/Components/CloseButton';
import RewardsLoadingSkeleton from '@/Components/loading/RewardsLoadingSkeleton';

// Badge images
import HatTrickBadge from '@/Components/images/brown.png';
import AssistMaestroBadge from '@/Components/images/brown.png';
import StarPerformerBadge from '@/Components/images/brown.png';
import GoalMachineBadge from '@/Components/images/brown.png';
import IronWallBadge from '@/Components/images/brown.png';
import UnbeatenBadge from '@/Components/images/brown.png';
import CaptainsTriumphsBadge from '@/Components/images/brown.png';
import TripleImpactBadge from '@/Components/images/brown.png';

// Decorative images
import LeftStar from '@/Components/images/leftstart.png';
import RightStar from '@/Components/images/rightstar.png';
import XPStarMilestoneCard from '@/Components/XPStarMilestoneCard';

// --- Interfaces ---
interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  xp?: number;
}

interface Match {
  id: string;
  homeTeamGoals: number;
  awayTeamGoals: number;
  homeTeamUsers: User[];
  awayTeamUsers: User[];
  manOfTheMatchVotes: Record<string, string | number>;
  playerStats: Record<string, { goals?: number; assists?: number }>;
  status: 'RESULT_PUBLISHED' | 'SCHEDULED' | 'ONGOING';
  date?: string | Date;
  start?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  active?: boolean;
  end?: string | Date;
  homeCaptainId?: string | null;
  awayCaptainId?: string | null;
  homeDefensiveImpactId?: string | null;
  awayDefensiveImpactId?: string | null;
  homeMentalityId?: string | null;
  awayMentalityId?: string | null;
  seasonId?: string | null;
}

interface League {
  id: string;
  name: string;
  members: User[];
  matches: Match[];
  maxGames: number;
  createdAt?: string;
  updatedAt?: string;
}

interface PlayerStats {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals: number;
  assists: number;
  motmVotes: number;
  teamGoalsConceded: number;
}

// Server achievements response types
interface ServerBadge {
  id: string;
  title?: string;
  count?: number;
  xp?: number;
  unlocked?: boolean;
  progressText?: string;
}

interface ServerAchievementsResponse {
  success: boolean;
  userId?: string | number;
  totalXP?: number;
  badges?: ServerBadge[];
}

// --- Badge model ---
type Badge = {
  id: string;
  title: string;
  description: string;
  image: StaticImageData;
  color: string;
  count: number;        // times earned
  xp: number;           // XP per earn (or level bucket for Rising XP)
  unlocked: boolean;
  progressText?: string;
};

// --- User match summary type ---
type UserMatchSummary = {
  goals: number;
  assists: number;
  conceded: number;
  result: 'W' | 'D' | 'L';
  motmVotes: number;
  isCaptainWin: boolean;
  hasXFactorPick: boolean;
  xFactorPicks: number;
  wonMotmAward: boolean;
  cleanSheetTeam: boolean;
};

// --- Constants ---
const CARD_DIMENSIONS = {
  minHeight: { xs: 180, sm: 200, md: 240 },
  maxWidth: { xs: 160, sm: 200, md: 240 },
  image: { xs: 70, sm: 85, md: 115 },
} as const;

const BLUE_HEX = '#3B82F6';
const BLUE_FILTER = 'invert(30%) sepia(98%) saturate(2000%) hue-rotate(201deg) brightness(92%) contrast(101%)';
const medalGold = '#D4AF37';
const medalMuted = '#CBD5E1';

// --- Helper functions ---
const formatNumber = (n: number) => new Intl.NumberFormat().format(n);

const toNum = (v: number | string | undefined): number | undefined => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const normalizeId = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const comparableId = (value: unknown): string => {
  const id = normalizeId(value);
  return id.startsWith('guest-') ? id.slice(6) : id;
};

const sameComparableId = (a: unknown, b: unknown): boolean => {
  const left = comparableId(a);
  const right = comparableId(b);
  return left !== '' && right !== '' && left === right;
};

const isResultPublished = (match: Match): boolean => {
  const s = String(match.status || '').toUpperCase();
  return s === 'RESULT_PUBLISHED' || s === 'RESULT_UPLOADED';
};

const toTimeMs = (value: unknown): number => {
  if (!value) return NaN;
  const ms = new Date(value as string | number | Date).getTime();
  return Number.isFinite(ms) ? ms : NaN;
};

const getMatchTimeMs = (match: Match): number => {
  const candidates = [match.end, match.date, match.start, match.updatedAt, match.createdAt];
  for (const candidate of candidates) {
    const ms = toTimeMs(candidate);
    if (Number.isFinite(ms)) return ms;
  }
  return 0;
};

const sortMatchesChronologically = (matches: Match[]): Match[] =>
  [...matches].sort((a, b) => getMatchTimeMs(a) - getMatchTimeMs(b));

const isUserInMatch = (userId: string, match: Match): { isHome: boolean; isAway: boolean } => {
  const isHomeUser = (match.homeTeamUsers ?? []).some((u) => sameComparableId(u.id, userId));
  const isAwayUser = (match.awayTeamUsers ?? []).some((u) => sameComparableId(u.id, userId));

  const isHomePick = sameComparableId(match.homeDefensiveImpactId, userId) || sameComparableId(match.homeMentalityId, userId);
  const isAwayPick = sameComparableId(match.awayDefensiveImpactId, userId) || sameComparableId(match.awayMentalityId, userId);

  const userStatsEntry = Object.entries(match.playerStats ?? {}).find(([playerId]) => sameComparableId(playerId, userId));
  const hasStatLine = Boolean(userStatsEntry);

  const isHome = isHomeUser || isHomePick || (hasStatLine && !isAwayUser && !isAwayPick);
  const isAway = isAwayUser || isAwayPick;
  return { isHome, isAway };
};

const getUserPlayerStatLine = (userId: string, playerStats: Match['playerStats']): { goals: number; assists: number } => {
  const entry = Object.entries(playerStats ?? {}).find(([playerId]) => sameComparableId(playerId, userId));
  const stat = entry?.[1] ?? {};
  return {
    goals: Number(stat.goals ?? 0) || 0,
    assists: Number(stat.assists ?? 0) || 0,
  };
};

const getMotmVoteCounts = (votes: Match['manOfTheMatchVotes']): Record<string, number> => {
  if (!votes || typeof votes !== 'object') return {};
  const entries = Object.entries(votes);
  if (entries.length === 0) return {};

  const counts: Record<string, number> = {};
  const valuesAreCounts = entries.every(([, value]) => typeof value === 'number');

  if (valuesAreCounts) {
    entries.forEach(([playerId, count]) => {
      const key = comparableId(playerId);
      const value = Number(count) || 0;
      if (!key || value <= 0) return;
      counts[key] = (counts[key] || 0) + value;
    });
    return counts;
  }

  entries.forEach(([, votedFor]) => {
    const key = comparableId(votedFor);
    if (!key) return;
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
};

const getMotmVotesForUser = (votes: Match['manOfTheMatchVotes'], userId: string): number => {
  const counts = getMotmVoteCounts(votes);
  const key = comparableId(userId);
  return key ? counts[key] || 0 : 0;
};

const getTopMotmWinnerId = (votes: Match['manOfTheMatchVotes']): string => {
  const counts = getMotmVoteCounts(votes);
  let topPlayerId = '';
  let maxVotes = 0;
  Object.entries(counts).forEach(([playerId, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      topPlayerId = playerId;
    }
  });
  return maxVotes > 0 ? topPlayerId : '';
};

// --- Player stats calculation ---
const calculatePlayerStats = (league: League): Record<string, PlayerStats> => {
  const stats: Record<string, PlayerStats> = {};
  sortMatchesChronologically(league.matches ?? []).forEach(match => {
    if (!isResultPublished(match)) return;

    const homePlayers = (match.homeTeamUsers ?? []).map(u => u.id);
    const awayPlayers = (match.awayTeamUsers ?? []).map(u => u.id);
    [...homePlayers, ...awayPlayers].forEach(pId => {
      if (!stats[pId]) {
        stats[pId] = { played: 0, wins: 0, draws: 0, losses: 0, goals: 0, assists: 0, motmVotes: 0, teamGoalsConceded: 0 };
      }
      stats[pId].played++;
      const ps = match.playerStats?.[pId];
      if (ps) {
        stats[pId].goals += ps.goals || 0;
        stats[pId].assists += ps.assists || 0;
      }
      const votes = getMotmVotesForUser(match.manOfTheMatchVotes, pId);
      stats[pId].motmVotes += votes;
    });

    const homeWon = match.homeTeamGoals > match.awayTeamGoals;
    const isDraw = match.homeTeamGoals === match.awayTeamGoals;
    homePlayers.forEach(pId => {
      if (!stats[pId]) return;
      if (homeWon) stats[pId].wins++;
      else if (isDraw) stats[pId].draws++;
      else stats[pId].losses++;
      stats[pId].teamGoalsConceded += match.awayTeamGoals;
    });
    awayPlayers.forEach(pId => {
      if (!stats[pId]) return;
      if (!homeWon && !isDraw) stats[pId].wins++;
      else if (isDraw) stats[pId].draws++;
      else stats[pId].losses++;
      stats[pId].teamGoalsConceded += match.homeTeamGoals;
    });
  });
  return stats;
};

const getSeasonScopeKey = (leagueId: string, seasonId?: string | null): string => {
  const normSeason = normalizeId(seasonId);
  const normLeague = normalizeId(leagueId);
  if (normSeason && normLeague) return `${normLeague}:${normSeason}`;
  if (normSeason) return normSeason;
  if (normLeague) return `${normLeague}:default`;
  return 'default';
};

const summarizeUserMatchesBySeason = (userId: string, leagues: League[]): Record<string, UserMatchSummary[]> => {
  const map: Record<string, UserMatchSummary[]> = {};
  leagues.forEach(league => {
    sortMatchesChronologically(league.matches ?? []).forEach(m => {
      if (!isResultPublished(m)) return;
      const { isHome, isAway } = isUserInMatch(userId, m);
      if (!isHome && !isAway) return;
      const ps = getUserPlayerStatLine(userId, m.playerStats);
      const teamGoals = isHome ? m.homeTeamGoals : m.awayTeamGoals;
      const oppGoals = isHome ? m.awayTeamGoals : m.homeTeamGoals;
      const result: 'W' | 'D' | 'L' = teamGoals > oppGoals ? 'W' : teamGoals === oppGoals ? 'D' : 'L';
      const motmVotes = getMotmVotesForUser(m.manOfTheMatchVotes, userId);
      const isHomeCaptain = sameComparableId(m.homeCaptainId, userId);
      const isAwayCaptain = sameComparableId(m.awayCaptainId, userId);
      const isCaptainWin = (isHomeCaptain && result === 'W') || (isAwayCaptain && result === 'W');
      const hasDefensivePick =
        sameComparableId(m.homeDefensiveImpactId, userId) ||
        sameComparableId(m.awayDefensiveImpactId, userId);
      const hasMentalityPick =
        sameComparableId(m.homeMentalityId, userId) ||
        sameComparableId(m.awayMentalityId, userId);
      const hasXFactorPick = hasDefensivePick || hasMentalityPick;
      const xFactorPicks = hasXFactorPick ? 1 : 0;
      const motmWinnerId = getTopMotmWinnerId(m.manOfTheMatchVotes);
      const wonMotmAward = sameComparableId(motmWinnerId, userId);
      const cleanSheetTeam = result === 'W' && oppGoals === 0;

      const seasonKey = getSeasonScopeKey(league.id, m.seasonId);
      if (!map[seasonKey]) map[seasonKey] = [];
      map[seasonKey].push({
        goals: ps.goals || 0,
        assists: ps.assists || 0,
        conceded: oppGoals,
        result,
        motmVotes,
        isCaptainWin,
        hasXFactorPick,
        xFactorPicks,
        wonMotmAward,
        cleanSheetTeam,
      });
    });
  });
  return map;
};

const longestStreak = (arr: UserMatchSummary[], predicate: (m: UserMatchSummary) => boolean): number => {
  let best = 0, cur = 0;
  for (const m of arr) {
    if (predicate(m)) {
      cur += 1;
      best = Math.max(best, cur);
    } else {
      cur = 0;
    }
  }
  return best;
};

const countStreakCompletions = (
  arr: UserMatchSummary[],
  predicate: (m: UserMatchSummary) => boolean,
  target: number
): number => {
  if (target <= 0) return 0;
  let streak = 0;
  let awards = 0;
  for (const m of arr) {
    if (predicate(m)) {
      streak += 1;
      if (streak === target) {
        awards += 1;
        streak = 0;
      }
    } else {
      streak = 0;
    }
  }
  return awards;
};

// --- XP computation ---
const computeXPFromStats = (s?: PlayerStats): number => {
  if (!s) return 0;
  const base = s.played * 10;
  const results = s.wins * 50 + s.draws * 20;
  const contrib = s.goals * 100 + s.assists * 70 + s.motmVotes * 120;
  return base + results + contrib;
};

// --- Badge computation ---
const computeBadges = (user: User, leagues: League[], backendTotalXP?: number): Badge[] => {
  const bySeason = summarizeUserMatchesBySeason(user.id, leagues);
  let goalRushCount = 0;
  let goalRushBest = 0;
  let pureMagicCount = 0;
  let pureMagicBest = 0;
  let tripleTreatCount = 0;
  let tripleTreatBest = 0;
  let leaderOfLegendsCount = 0;
  let leaderOfLegendsBest = 0;
  let xFactorCount = 0;
  let xFactorBest = 0;
  let spotlightStarCount = 0;
  let spotlightStarBest = 0;
  let findersKeepersCount = 0;
  let findersKeepersBest = 0;
  let winStreakXCount = 0;
  let winStreakXBest = 0;

  Object.values(bySeason).forEach((arr) => {
    goalRushBest = Math.max(goalRushBest, longestStreak(arr, (m) => m.goals > 0));
    goalRushCount += countStreakCompletions(arr, (m) => m.goals > 0, 5);

    pureMagicBest = Math.max(pureMagicBest, longestStreak(arr, (m) => m.assists > 0));
    pureMagicCount += countStreakCompletions(arr, (m) => m.assists > 0, 5);

    tripleTreatBest = Math.max(tripleTreatBest, longestStreak(arr, (m) => m.goals >= 3));
    tripleTreatCount += countStreakCompletions(arr, (m) => m.goals >= 3, 3);

    const captainWinsInSeason = arr.filter((m) => m.isCaptainWin).length;
    leaderOfLegendsBest = Math.max(leaderOfLegendsBest, captainWinsInSeason);
    leaderOfLegendsCount += Math.floor(captainWinsInSeason / 3);

    const xFactorMatchesInSeason = arr.filter((m) => m.hasXFactorPick).length;
    xFactorBest = Math.max(xFactorBest, xFactorMatchesInSeason);
    xFactorCount += Math.floor(xFactorMatchesInSeason / 5);

    const motmAwardsInSeason = arr.filter((m) => m.wonMotmAward).length;
    spotlightStarBest = Math.max(spotlightStarBest, motmAwardsInSeason);
    spotlightStarCount += Math.floor(motmAwardsInSeason / 3);

    const cleanSheetsInSeason = arr.filter((m) => m.cleanSheetTeam).length;
    findersKeepersBest = Math.max(findersKeepersBest, cleanSheetsInSeason);
    findersKeepersCount += Math.floor(cleanSheetsInSeason / 3);

    winStreakXBest = Math.max(winStreakXBest, longestStreak(arr, (m) => m.result === 'W'));
    winStreakXCount += countStreakCompletions(arr, (m) => m.result === 'W', 10);
  });

  let ironWillCount = 0;
  let ironWillBestPlayed = 0;
  let ironWillBestTotal = 0;
  let ironWillBestPercent = 0;

  const seasonCompletedTotals: Record<string, { total: number; played: number }> = {};
  leagues.forEach((league) => {
    const completedMatches = sortMatchesChronologically((league.matches ?? []).filter(isResultPublished));
    completedMatches.forEach((m) => {
      const sKey = getSeasonScopeKey(league.id, m.seasonId);
      if (!seasonCompletedTotals[sKey]) {
        seasonCompletedTotals[sKey] = { total: 0, played: 0 };
      }
      seasonCompletedTotals[sKey].total += 1;
      const { isHome, isAway } = isUserInMatch(user.id, m);
      if (isHome || isAway) {
        seasonCompletedTotals[sKey].played += 1;
      }
    });
  });

  Object.values(seasonCompletedTotals).forEach(({ total, played }) => {
    if (total < 10) return;
    const playedPercent = played / total;
    if (playedPercent >= 0.9) {
      ironWillCount += 1;
    }
    if (
      playedPercent > ironWillBestPercent ||
      (playedPercent === ironWillBestPercent && total > ironWillBestTotal)
    ) {
      ironWillBestPercent = playedPercent;
      ironWillBestPlayed = played;
      ironWillBestTotal = total;
    }
  });

  const badges: Badge[] = [
    {
      id: 'scoring_10_consecutive',
      title: 'Goal Rush',
      description: 'Scoring in 5 consecutive matches in a single season',
      image: GoalMachineBadge,
      color: medalGold,
      count: goalRushCount,
      xp: 100,
      unlocked: goalRushCount > 0,
      progressText: `Best scoring streak in a season: ${goalRushBest}/5`,
    },
    {
      id: 'assist_10_consecutive',
      title: 'Pure Magic',
      description: 'Assist in 5 consecutive matches in a single season',
      image: AssistMaestroBadge,
      color: medalGold,
      count: pureMagicCount,
      xp: 100,
      unlocked: pureMagicCount > 0,
      progressText: `Best assist streak in a season: ${pureMagicBest}/5`,
    },
    {
      id: 'hat_trick_3_matches',
      title: 'Triple Treat',
      description: 'Score a hat-trick in 3 consecutive matches in a single season',
      image: HatTrickBadge,
      color: medalGold,
      count: tripleTreatCount,
      xp: 150,
      unlocked: tripleTreatCount > 0,
      progressText: `Best hat-trick streak in a season: ${tripleTreatBest}/3`,
    },
    {
      id: 'captain_5_wins',
      title: 'Leader of Legends',
      description: 'Winning as a captain in 3 matches in a single season',
      image: CaptainsTriumphsBadge,
      color: medalGold,
      count: leaderOfLegendsCount,
      xp: 200,
      unlocked: leaderOfLegendsCount > 0,
      progressText: `Most captain wins in one season: ${leaderOfLegendsBest}/3`,
    },
    {
      id: 'captain_performance_3',
      title: 'The X-Factor',
      description: 'Being voted +Mentality player or Defensive Impact 5 matches in a single season',
      image: TripleImpactBadge,
      color: medalGold,
      count: xFactorCount,
      xp: 200,
      unlocked: xFactorCount > 0,
      progressText: `Most qualifying matches in one season: ${xFactorBest}/5`,
    },
    {
      id: 'motm_4_consecutive',
      title: 'Spotlight Star',
      description: 'Winning Man of the Match award 3 times (not votes) in a single season',
      image: StarPerformerBadge,
      color: medalGold,
      count: spotlightStarCount,
      xp: 250,
      unlocked: spotlightStarCount > 0,
      progressText: `Most MOTM awards in one season: ${spotlightStarBest}/3`,
    },
    {
      id: 'clean_sheet_5_wins',
      title: 'Finders Keepers',
      description: 'Keeping 3 clean sheets as a team in a single season',
      image: IronWallBadge,
      color: medalGold,
      count: findersKeepersCount,
      xp: 300,
      unlocked: findersKeepersCount > 0,
      progressText: `Most clean sheets in one season: ${findersKeepersBest}/3`,
    },
    {
      id: 'top_spot_10_matches',
      title: 'Iron Will',
      description: 'Playing 90% of matches in a single season',
      image: IronWallBadge,
      color: medalGold,
      count: ironWillCount,
      xp: 400,
      unlocked: ironWillCount > 0,
      progressText: ironWillBestTotal > 0
        ? `Best participation in a season: ${ironWillBestPlayed}/${ironWillBestTotal} (${Math.round(ironWillBestPercent * 100)}%)`
        : 'No completed season with 10+ matches yet',
    },
    {
      id: 'consecutive_10_victories',
      title: 'Win Streak X',
      description: 'Winning in 10 consecutive matches in a single season',
      image: UnbeatenBadge,
      color: medalGold,
      count: winStreakXCount,
      xp: 500,
      unlocked: winStreakXCount > 0,
      progressText: `Best win streak in a season: ${winStreakXBest}/10`,
    },
  ];

  return badges;
};

// Badge metadata mapping
const BADGE_META: Record<string, { title: string; description: string; image: StaticImageData; color: string }> = {
  hat_trick_3_matches: {
    title: 'Triple Treat',
    description: 'Score a hat-trick in 3 consecutive matches in a single season',
    image: HatTrickBadge,
    color: medalGold,
  },
  captain_5_wins: {
    title: 'Leader of Legends',
    description: 'Winning as a captain in 3 matches in a single season',
    image: CaptainsTriumphsBadge,
    color: medalGold,
  },
  assist_10_consecutive: {
    title: 'Pure Magic',
    description: 'Assist in 5 consecutive matches in a single season',
    image: AssistMaestroBadge,
    color: medalGold,
  },
  scoring_10_consecutive: {
    title: 'Goal Rush',
    description: 'Scoring in 5 consecutive matches in a single season',
    image: GoalMachineBadge,
    color: medalGold,
  },
  captain_performance_3: {
    title: 'The X-Factor',
    description: 'Being voted +Mentality player or Defensive Impact 5 matches in a single season',
    image: TripleImpactBadge,
    color: medalGold,
  },
  motm_4_consecutive: {
    title: 'Spotlight Star',
    description: 'Winning Man of the Match award 3 times (not votes) in a single season',
    image: StarPerformerBadge,
    color: medalGold,
  },
  clean_sheet_5_wins: {
    title: 'Finders Keepers',
    description: 'Keeping 3 clean sheets as a team in a single season',
    image: IronWallBadge,
    color: medalGold,
  },
  top_spot_10_matches: {
    title: 'Iron Will',
    description: 'Playing 90% of matches in a single season',
    image: IronWallBadge,
    color: medalGold,
  },
  consecutive_10_victories: {
    title: 'Win Streak X',
    description: 'Winning in 10 consecutive matches in a single season',
    image: UnbeatenBadge,
    color: medalGold,
  },
};

const mapServerBadgeToUI = (b: ServerBadge): Badge => {
  const meta = BADGE_META[b.id] ?? {
    title: b.title ?? b.id,
    description: b.title ?? b.id,
    image: HatTrickBadge,
    color: medalGold,
  };
  return {
    id: b.id,
    title: b.title ?? meta.title,
    description: meta.description,
    image: meta.image,
    color: meta.color,
    count: Number(b.count ?? 0),
    xp: Number(b.xp ?? 0),
    unlocked: Boolean(b.unlocked),
    progressText: b.progressText,
  };
};

const mergeBadges = (client: Badge[], server: Badge[] | null | undefined): Badge[] => {
  if (!Array.isArray(server) || server.length === 0) return client;
  const serverById = new Map(server.map((b) => [b.id, b] as const));
  return client.map(cb => {
    const sb = serverById.get(cb.id);
    if (!sb) return cb;
    return {
      ...cb,
      count: Number.isFinite(Number(sb.count)) ? Number(sb.count) : cb.count,
      xp: Number.isFinite(Number(sb.xp)) && Number(sb.xp) > 0 ? Number(sb.xp) : cb.xp,
      unlocked: typeof sb.unlocked === 'boolean' ? sb.unlocked : cb.unlocked,
      progressText: sb.progressText ?? cb.progressText,
    };
  });
};

// --- Badge Card Component ---
const BadgeCard = ({ id, title, description, image, color, count, unlocked, progressText, xp, onOpen }: Badge & { onOpen?: () => void }) => {
  const totalXPEarned = count * xp;

  return (
    <Box
      onClick={onOpen}
      role="button"
      sx={{
        width: '100%',
        height: '100%',
        minHeight: { xs: 135, sm: 185, md: 245 },
        bgcolor: '#121316',
        border: '1px solid #22242a',
        borderRadius: { xs: '10px', sm: '14px', md: '16px' },
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onOpen ? 'pointer' : 'default',
        transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor: unlocked ? 'rgba(34, 197, 94, 0.45)' : '#32353e',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      {/* Title at top */}
      <Box sx={{ pt: { xs: 1, sm: 1.6, md: 2.2 }, px: { xs: 0.5, sm: 1.2, md: 2 }, textAlign: 'center' }}>
        <Typography
          sx={{
            color: '#ffffff',
            fontWeight: 700,
            fontSize: { xs: '8.5px', sm: '12px', md: '15.5px' },
            fontFamily: 'var(--font-woodford-bourne-pro), sans-serif',
            letterSpacing: '0.2px',
            textAlign: 'center',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Middle: Medal + Stars */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 0.5, sm: 1, md: 1.5 },
          position: 'relative',
        }}
      >
        {/* Left 3 Stars */}
        <Box
          sx={{
            width: { xs: 14, sm: 20, md: 28 },
            height: { xs: 14, sm: 20, md: 28 },
            mr: { xs: -0.6, sm: -0.9, md: -1.2 },
            mt: { xs: -1.2, sm: -1.8, md: -2.5 },
            opacity: unlocked ? 1 : 0.35,
            filter: unlocked ? 'none' : 'grayscale(1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            zIndex: 1,
          }}
        >
          <Image
            src={LeftStar}
            alt="Left Stars"
            width={28}
            height={28}
            style={{ objectFit: 'contain', width: '100%', height: '100%' }}
          />
        </Box>

        {/* Medal with XP circle */}
        <Box
          sx={{
            position: 'relative',
            width: { xs: 54, sm: 78, md: 115 },
            height: { xs: 54, sm: 78, md: 115 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Image
            src={image}
            alt={title}
            width={115}
            height={115}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: unlocked ? 'none' : 'grayscale(0.85) opacity(0.55)',
            }}
          />

          {/* XP Value in center of medal */}
          <Box
            sx={{
              position: 'absolute',
              top: '72%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: 15, sm: 21, md: 28 },
              height: { xs: 15, sm: 21, md: 28 },
              borderRadius: '50%',
              bgcolor: unlocked ? '#a7281d' : '#4a4a4a',
              border: { xs: '1px solid #d4af37', sm: '1.2px solid #d4af37', md: '1.5px solid #d4af37' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: unlocked ? '#ffc000' : '#aaa',
              fontSize: { xs: '6.5px', sm: '8.5px', md: '11px' },
              fontWeight: 800,
              fontFamily: 'var(--font-woodford-bourne-pro), sans-serif',
              lineHeight: 1,
              userSelect: 'none',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
            }}
          >
            {xp}
          </Box>
        </Box>

        {/* Right 3 Stars */}
        <Box
          sx={{
            width: { xs: 14, sm: 20, md: 28 },
            height: { xs: 14, sm: 20, md: 28 },
            ml: { xs: -0.6, sm: -0.9, md: -1.2 },
            mt: { xs: -1.2, sm: -1.8, md: -2.5 },
            opacity: unlocked ? 1 : 0.35,
            filter: unlocked ? 'none' : 'grayscale(1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            zIndex: 1,
          }}
        >
          <Image
            src={RightStar}
            alt="Right Stars"
            width={28}
            height={28}
            style={{ objectFit: 'contain', width: '100%', height: '100%' }}
          />
        </Box>
      </Box>

      {/* Bottom Bar: XP Earned or LOCKED */}
      <Box
        sx={{
          width: '100%',
          py: { xs: 0.5, sm: 0.8, md: 1.2 },
          px: 0.5,
          bgcolor: unlocked ? '#0f1f1a' : '#14161a',
          borderTop: unlocked ? '1px solid rgba(34, 197, 94, 0.14)' : '1px solid #1c1d22',
          textAlign: 'center',
        }}
      >
        <Typography
          sx={{
            fontFamily: 'var(--font-woodford-bourne-pro), sans-serif',
            fontWeight: 800,
            fontSize: { xs: '7.5px', sm: '10px', md: '12.5px' },
            letterSpacing: { xs: '0.2px', sm: '0.4px', md: '0.6px' },
            textTransform: 'uppercase',
            color: unlocked ? '#22c55e' : '#717d8f',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {unlocked
            ? `${formatNumber(totalXPEarned > 0 ? totalXPEarned : xp)} XP EARNED`
            : '0 XP EARNED'}
        </Typography>
      </Box>
    </Box>
  );
};

// --- Main Page Component ---
export default function RewardsPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [backendTotalXP, setBackendTotalXP] = useState<number | undefined>(undefined);
  const [xp, setXp] = useState<number>(0);
  const [leaguesLoading, setLeaguesLoading] = useState(true);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();
  const [serverBadges, setServerBadges] = useState<Badge[] | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [cmsStaticContent, setCmsStaticContent] = useState<Record<string, { title: string; content: string }>>({});

  const loading = leaguesLoading || achievementsLoading;

  // Filter tab state ('all' | 'unlocked' | 'locked')
  const [filterTab, setFilterTab] = useState<'all' | 'unlocked' | 'locked'>('all');

  // Badge detail modal state
  const [openBadgeDlg, setOpenBadgeDlg] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const openBadgeDetail = (b: Badge) => { setSelectedBadge(b); setOpenBadgeDlg(true); };
  const closeBadgeDetail = () => { setOpenBadgeDlg(false); setSelectedBadge(null); };

  // Fetch dynamic CMS static content for reward badge titles and descriptions
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/static-content?_=${Date.now()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data?.contentMap) {
          setCmsStaticContent(data.contentMap);
        }
      })
      .catch((err) => console.error('[Rewards] CMS fetch error', err));
  }, []);

  // Fetch leagues data
  useEffect(() => {
    if (!token) {
      setLeaguesLoading(false);
      return;
    }
    const fetchLeagues = async () => {
      setLeaguesLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leagues?_=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data?.success && Array.isArray(data.leagues)) {
          setLeagues(data.leagues);
          setError(null);
        } else {
          console.error('[Rewards] Failed to load leagues', { status: res.status, data });
          setLeagues([]);
          setError(data?.message || 'Failed to load leagues.');
        }
      } catch (e) {
        console.error('[Rewards] fetchLeagues error', e);
        setLeagues([]);
        setError('An error occurred while fetching leagues.');
      } finally {
        setLeaguesLoading(false);
      }
    };
    fetchLeagues();
  }, [token]);

  // Persist and fetch achievements
  useEffect(() => {
    if (!token) {
      setAchievementsLoading(false);
      return;
    }
    setAchievementsLoading(true);
    (async () => {
      try {
        // Persist achievements
        try {
          const awardRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/achievements/award?_=${Date.now()}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
          const awardJson = await awardRes.json().catch(() => ({}));
          if (awardRes.ok && awardJson?.success && Number.isFinite(Number(awardJson.totalXP))) {
            setBackendTotalXP(Number(awardJson.totalXP));
          }
        } catch { }

        // Fetch achievements
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/achievements?_=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: ServerAchievementsResponse = await res.json();
        if (res.ok && data?.success) {
          if (typeof data.totalXP === 'number' && Number.isFinite(data.totalXP)) {
            setBackendTotalXP(data.totalXP);
          }
          const mapped = Array.isArray(data.badges) ? data.badges.map(mapServerBadgeToUI) : [];
          setServerBadges(mapped);
        }
      } catch (e) {
        console.error('[Rewards] achievements fetch error', e);
      } finally {
        setAchievementsLoading(false);
      }
    })();
  }, [token]);

  // Compute badges & apply dynamic CMS content overrides
  const clientBadges: Badge[] = user ? computeBadges(user, leagues, backendTotalXP) : [];
  const rawBadges: Badge[] = user ? mergeBadges(clientBadges, serverBadges) : [];
  const myBadges: Badge[] = useMemo(() => {
    return rawBadges.map((badge) => {
      const cmsItem = cmsStaticContent[badge.id] || cmsStaticContent[`reward_${badge.id}`];
      if (cmsItem) {
        return {
          ...badge,
          title: cmsItem.title || badge.title,
          description: cmsItem.content || badge.description,
        };
      }
      return badge;
    });
  }, [rawBadges, cmsStaticContent]);
  const myProfileXP = useMemo(() => {
    const risingXP = myBadges.find((b) => b.id === 'rising_xp')?.xp;
    const resolved =
      (typeof risingXP === 'number' ? risingXP : undefined) ??
      (typeof user?.xp === 'number' ? user.xp : undefined) ??
      (typeof backendTotalXP === 'number' ? backendTotalXP : undefined) ??
      0;
    return Number.isFinite(Number(resolved)) ? Number(resolved) : 0;
  }, [myBadges, user?.xp, backendTotalXP]);

  // Direct player XP from player profile endpoint (fallback to computed/profile XP)
  useEffect(() => {
    const fallbackXP = Number.isFinite(Number(myProfileXP)) ? Number(myProfileXP) : 0;

    if (!user?.id) {
      setXp(fallbackXP);
      return;
    }

    let cancelled = false;
    setXp(fallbackXP);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/players/${encodeURIComponent(String(user.id))}`, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch player profile XP');
        const json = (await res.json()) as Record<string, unknown>;
        const playerObj = (json.player || json.data || {}) as Record<string, unknown>;
        const raw =
          playerObj.xp ??
          playerObj.totalXP ??
          playerObj.totalXp ??
          json.xp ??
          json.totalXP ??
          fallbackXP;
        const parsed = Number(raw);
        if (!cancelled) setXp(Number.isFinite(parsed) ? parsed : fallbackXP);
      })
      .catch(() => {
        if (!cancelled) setXp(fallbackXP);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, token, myProfileXP]);

  // Filter badges by active tab
  const filteredBadges = useMemo(() => {
    if (filterTab === 'unlocked') {
      return myBadges.filter((b) => b.unlocked);
    }
    if (filterTab === 'locked') {
      return myBadges.filter((b) => !b.unlocked);
    }
    return myBadges;
  }, [myBadges, filterTab]);

  // Calculate total XP from all rewards
  const totalRewardsXP = myBadges.reduce((sum, badge) => sum + (badge.count * badge.xp), 0);

  return (
    <Box sx={{ minHeight: 'auto', backgroundColor: 'transparent', overflowX: 'hidden' }}>
      {/* Header */}
      <PageHeader
        title="Rewards"
        titleLeft={(
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <XPStarMilestoneCard height={isMobile ? 28 : 35} width={isMobile ? 28 : 35} xp={xp} colorOverride="#ffc000" />
          </Box>
        )}
        titleRight={(
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <XPStarMilestoneCard height={isMobile ? 28 : 35} width={isMobile ? 28 : 35} xp={xp} colorOverride="#ffc000" />
          </Box>
        )}
      >
        {/* View Toggle: ALL | UNLOCKED | LOCKED */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', px: { xs: 1, sm: 2 } }}>
          <Box
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', sm: 440, md: 480 },
              mx: 'auto',
              bgcolor: '#121316',
              border: '1px solid #22242a',
              borderRadius: { xs: '12px', sm: '14px', md: '16px' },
              p: '4px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '4px',
              boxSizing: 'border-box',
            }}
          >
            {[
              { id: 'all', label: 'ALL' },
              { id: 'unlocked', label: 'UNLOCKED' },
              { id: 'locked', label: 'LOCKED' },
            ].map((tab) => {
              const isActive = filterTab === tab.id;
              return (
                <ButtonBase
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id as 'all' | 'unlocked' | 'locked')}
                  sx={{
                    py: { xs: 0.9, sm: 1.1 },
                    px: { xs: 0.6, sm: 1.5 },
                    borderRadius: '12px',
                    border: isActive ? '1.5px solid #22c55e' : '1.5px solid transparent',
                    bgcolor: isActive ? 'rgba(34, 197, 94, 0.04)' : 'transparent',
                    color: isActive ? '#ffffff' : '#717d8f',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: { xs: 12, sm: 13, md: 14 },
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-woodford-bourne-pro), sans-serif',
                    transition: 'all 0.18s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(34, 197, 94, 0.08)' : '#18191e',
                      color: '#ffffff',
                    },
                  }}
                >
                  <Typography
                    noWrap
                    sx={{
                      fontSize: 'inherit',
                      fontWeight: 'inherit',
                      color: 'inherit',
                      textAlign: 'center',
                      fontFamily: 'inherit',
                      letterSpacing: 'inherit',
                      textTransform: 'uppercase',
                    }}
                  >
                    {tab.label}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Box>
        </Box>
      </PageHeader>

      <Box sx={{ maxWidth: 980, mx: 'auto', px: { xs: 0.75, sm: 2, md: 3 }, }}>

        {loading ? (
          <RewardsLoadingSkeleton />
        ) : error ? (
          <Box sx={{ p: 4, maxWidth: '1200px', mx: 'auto' }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: { xs: 0.75, sm: 1.5, md: 2.5 },
            }}
          >
            {filteredBadges.length > 0 ? (
              filteredBadges.map((b) => (
                <BadgeCard key={b.id} {...b} onOpen={() => openBadgeDetail(b)} />
              ))
            ) : (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 8 }}>
                <Typography sx={{ color: '#8a94a6', fontSize: 16, fontFamily: 'var(--font-woodford-bourne-pro), sans-serif' }}>
                  {filterTab === 'unlocked'
                    ? 'No unlocked rewards yet. Play matches to earn rewards!'
                    : filterTab === 'locked'
                    ? 'All rewards have been unlocked!'
                    : 'No rewards available.'}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Badge detail modal */}
        <Dialog
          open={openBadgeDlg}
          onClose={closeBadgeDetail}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: '16px',
              bgcolor: '#121316',
              border: '1px solid #22242a',
              color: '#fff',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75)',
            }
          }}
        >
          <DialogTitle sx={{
            bgcolor: '#16181d',
            color: '#fff',
            fontFamily: 'var(--font-woodford-bourne-pro), sans-serif',
            fontWeight: 800,
            fontSize: { xs: '18px', sm: '20px', md: '22px' },
            textTransform: 'uppercase',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: { xs: 2.5, md: 3 },
            py: 2,
            position: 'relative',
            borderBottom: '1px solid #22242a',
            flexShrink: 0
          }}>
            {selectedBadge?.title}
            <IconButton onClick={closeBadgeDetail} aria-label="close" sx={{
              bgcolor: '#1e2026',
              color: '#fff',
              width: 36,
              height: 36,
              borderRadius: '10px',
              border: '1px solid #2c2f38',
              transition: 'background-color 0.2s ease',
              '&:hover': {
                bgcolor: '#282b33',
                color: '#fff',
              }
            }}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ py: 3, px: { xs: 2.5, md: 3.5 } }}>
            {selectedBadge && (
              <Box sx={{pt:1.5, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr' }, gap: 3, alignItems: 'center' }}>
                <Box sx={{
                  position: 'relative',
                  width: 120,
                  height: 120,
                  justifySelf: 'center',
                  p: 1.5,
                  borderRadius: '16px',
                  bgcolor: '#18191e',
                  border: '1px solid #22242a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Image src={selectedBadge.image} alt={selectedBadge.title} width={96} height={96} style={{ objectFit: 'contain' }} />
                  <Box sx={{
                    position: 'absolute',
                    top: '72%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: selectedBadge.unlocked ? '#a7281d' : '#4a4a4a',
                    border: selectedBadge.unlocked ? '1.5px solid #d4af37' : '1.5px solid #777',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: selectedBadge.unlocked ? '#ffc000' : '#aaa',
                    fontSize: 10,
                    fontWeight: 800,
                    fontFamily: 'var(--font-woodford-bourne-pro), sans-serif',
                  }}>
                    {selectedBadge.xp}
                  </Box>
                </Box>
                <Box>
                  <Typography sx={{
                    fontWeight: 700,
                    mb: 1,
                    color: '#fff',
                    fontFamily: 'var(--font-woodford-bourne-pro), sans-serif',
                    fontSize: '1rem',
                  }}>
                    How to earn this reward:
                  </Typography>
                  <Typography sx={{
                    mb: 2,
                    color: '#8a94a6',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    fontFamily: 'var(--font-woodford-bourne-pro), sans-serif',
                  }}>
                    {selectedBadge.description}
                  </Typography>
                  <Box sx={{ height: '1px', bgcolor: '#22242a', my: 2 }} />
                  <Typography sx={{
                    color: selectedBadge.unlocked ? '#22c55e' : '#8a94a6',
                    mb: 1,
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    fontFamily: 'var(--font-woodford-bourne-pro), sans-serif',
                  }}>
                    {selectedBadge.unlocked
                      ? `Earned x${selectedBadge.count} | Total XP: ${formatNumber(selectedBadge.count * selectedBadge.xp)}`
                      : `Progress: ${selectedBadge.progressText || 'Progress unavailable'}`}
                  </Typography>
                  <Typography sx={{
                    color: '#656f7d',
                    display: 'block',
                    mt: 1.5,
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-woodford-bourne-pro), sans-serif',
                  }}>
                    Each reward earns you <span style={{ color: '#22c55e', fontWeight: 700 }}>{selectedBadge.xp} XP</span> and can be achieved multiple times.
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
}

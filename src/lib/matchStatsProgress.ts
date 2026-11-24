type StatRecord = Record<string, unknown>;

const asRecord = (value: unknown): StatRecord | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as StatRecord) : null;

const normalizeId = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const addParticipantVariants = (set: Set<string>, idVal: unknown): void => {
  const s = normalizeId(idVal);
  if (!s) return;
  set.add(s);
  if (s.startsWith('guest-') && s.length > 6) {
    set.add(s.slice(6));
  }
};

/**
 * Check whether a player's stat record represents submitted match stats.
 */
export const hasPlayerAddedStats = (stat: unknown): boolean => {
  if (!stat) return false;
  if (typeof stat === 'boolean') return stat;

  const rec = asRecord(stat);
  if (!rec) return false;

  if (typeof rec.hasSubmittedStats === 'boolean') return rec.hasSubmittedStats;

  const goals = Number(rec.goals) || 0;
  const assists = Number(rec.assists) || 0;
  const cleanSheets = Number(rec.cleanSheets ?? rec.clean_sheets) || 0;
  const defence = Number(rec.defence) || 0;
  const penalties = Number(rec.penalties) || 0;
  const freeKicks = Number(rec.freeKicks ?? rec.free_kicks) || 0;
  const yellowCards = Number(rec.yellowCards ?? rec.yellow_cards) || 0;
  const redCards = Number(rec.redCards ?? rec.red_cards) || 0;

  if (
    goals > 0 ||
    assists > 0 ||
    cleanSheets > 0 ||
    defence > 0 ||
    penalties > 0 ||
    freeKicks > 0 ||
    yellowCards > 0 ||
    redCards > 0
  ) {
    return true;
  }

  const impact = Number(rec.impact) || 0;
  const minutes = Number(rec.minutesPlayed ?? rec.minutes_played) || 0;
  const rating = Number(rec.rating) || 0;

  if (impact > 0 && minutes === 0 && rating === 0) {
    return true;
  }

  return false;
};

/**
 * Extract unique user IDs for stat records that count as submitted.
 */
export const extractSubmittedStatUserIds = (stats: unknown): string[] => {
  if (!Array.isArray(stats)) return [];
  const ids = new Set<string>();
  for (const item of stats) {
    if (!hasPlayerAddedStats(item)) continue;
    const rec = asRecord(item);
    const nestedUser = asRecord(rec?.user);
    const uid = normalizeId(rec?.userId ?? rec?.user_id ?? nestedUser?.id ?? rec?.id);
    if (uid) ids.add(uid);
  }
  return Array.from(ids);
};

/**
 * Extract unique MOTM voter IDs from match.votes, match.manOfTheMatchVotes, or match.voterIds.
 */
export const extractMatchVoterIds = (match: unknown): string[] => {
  const rec = asRecord(match);
  if (!rec) return [];

  const voterIds = new Set<string>();

  if (Array.isArray(rec.votes)) {
    for (const v of rec.votes) {
      const voteRec = asRecord(v);
      if (!voteRec) continue;
      const cat = String(voteRec.category || '').toLowerCase().trim();
      if (cat && cat !== 'motm' && cat !== 'man_of_the_match') continue;

      const voterId = normalizeId(voteRec.voterId ?? voteRec.voter_id ?? voteRec.userId ?? voteRec.user_id);
      const votedFor = normalizeId(voteRec.votedForId ?? voteRec.voted_for_id ?? voteRec.targetId ?? voteRec.playerId);
      if (voterId && votedFor) {
        voterIds.add(voterId);
      }
    }
  }

  const rawVotes = asRecord(rec.manOfTheMatchVotes ?? rec.manOfMatchVotes);
  if (rawVotes) {
    const entries = Object.entries(rawVotes);
    const valuesAreCounts = entries.length > 0 && entries.every(([, val]) => typeof val === 'number');
    if (!valuesAreCounts) {
      for (const [voterKey, votedForVal] of entries) {
        const voterId = normalizeId(voterKey);
        const votedFor = normalizeId(votedForVal);
        if (voterId && votedFor) {
          voterIds.add(voterId);
        }
      }
    }
  }

  const explicitVoterIds = rec.voterIds ?? rec.motmVoterIds;
  if (Array.isArray(explicitVoterIds)) {
    for (const idVal of explicitVoterIds) {
      const voterId = normalizeId(idVal);
      if (voterId) voterIds.add(voterId);
    }
  }

  return Array.from(voterIds);
};

/**
 * Calculate match stats completion progress, counting players who added stats OR cast a MOTM vote.
 */
export const getMatchStatsProgress = (
  match: unknown,
  statsFallback?: number | string[]
): { count: number; total: number; percent: number } => {
  const m = asRecord(match) || {};
  const rawGuests =
    (Array.isArray(m.guests) && m.guests.length > 0 ? m.guests : m.guestPlayers) || [];
  const homeUsers = Array.isArray(m.homeTeamUsers) ? m.homeTeamUsers : [];
  const awayUsers = Array.isArray(m.awayTeamUsers) ? m.awayTeamUsers : [];
  const guestsList = Array.isArray(rawGuests) ? rawGuests : [];

  const participantIds = new Set<string>();
  const collectUsers = (list: unknown) => {
    if (!Array.isArray(list)) return;
    for (const u of list) {
      const uRec = asRecord(u);
      addParticipantVariants(participantIds, uRec?.id ?? uRec?._id ?? u);
    }
  };
  collectUsers(homeUsers);
  collectUsers(awayUsers);
  collectUsers(guestsList);
  collectUsers(m.players);
  collectUsers(m.confirmedPlayers);

  let totalPlayers = homeUsers.length + awayUsers.length + guestsList.length;
  if (totalPlayers === 0) {
    totalPlayers = Array.isArray(m.availableUsers) ? m.availableUsers.length : 14;
  }

  const submittedUserIds = new Set<string>();
  let objectStatsCount = 0;

  const ps = m.playerStats ?? m.statistics ?? m.stats;
  if (Array.isArray(ps) && ps.length > 0) {
    for (const uid of extractSubmittedStatUserIds(ps)) {
      submittedUserIds.add(uid);
    }
  } else if (ps && typeof ps === 'object' && !Array.isArray(ps) && Object.keys(ps).length > 0) {
    const entries = Object.entries(ps as Record<string, unknown>);
    for (const [key, statVal] of entries) {
      if (!hasPlayerAddedStats(statVal)) continue;
      objectStatsCount += 1;
      const statRec = asRecord(statVal);
      const uid = normalizeId(statRec?.userId ?? statRec?.user_id ?? key);
      if (uid) submittedUserIds.add(uid);
    }
  }

  if (Array.isArray(statsFallback)) {
    for (const uid of statsFallback) {
      const normalized = normalizeId(uid);
      if (normalized) submittedUserIds.add(normalized);
    }
  }

  for (const voterId of extractMatchVoterIds(m)) {
    if (participantIds.size === 0 || participantIds.has(voterId)) {
      submittedUserIds.add(voterId);
    }
  }

  const fallbackNumeric = typeof statsFallback === 'number' && statsFallback >= 0 ? statsFallback : 0;
  const statsCount = Math.max(submittedUserIds.size, objectStatsCount, fallbackNumeric);

  const effectiveTotal = Math.max(totalPlayers, statsCount, 1);
  const displayTotal = totalPlayers > 0 ? totalPlayers : effectiveTotal;
  const displayCount = Math.min(statsCount, displayTotal);
  const percent = Math.min(100, Math.round((displayCount / displayTotal) * 100));

  return {
    count: displayCount,
    total: displayTotal,
    percent,
  };
};


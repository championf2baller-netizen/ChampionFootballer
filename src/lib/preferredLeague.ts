'use client';

export const PREFERRED_LEAGUE_KEY = 'preferredLeagueId';
export const LEGACY_PREFERRED_LEAGUE_KEY = 'prefferdLeagueId';
export const PREFERRED_LEAGUE_CHANGED_EVENT = 'preferred-league-changed';

/**
 * Normalize a raw league ID value, returning null for empty or 'all' placeholders.
 */
export function normalizePreferredLeagueId(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (lower === 'all' || lower === 'null' || lower === 'undefined') {
    return null;
  }
  return trimmed;
}

/**
 * Read the persisted preferred league ID from localStorage, migrating any legacy typo key.
 */
export function getPreferredLeagueId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const primary = normalizePreferredLeagueId(localStorage.getItem(PREFERRED_LEAGUE_KEY));
    if (primary) {
      if (localStorage.getItem(LEGACY_PREFERRED_LEAGUE_KEY) !== null) {
        localStorage.removeItem(LEGACY_PREFERRED_LEAGUE_KEY);
      }
      return primary;
    }

    const legacy = normalizePreferredLeagueId(localStorage.getItem(LEGACY_PREFERRED_LEAGUE_KEY));
    if (legacy) {
      localStorage.setItem(PREFERRED_LEAGUE_KEY, legacy);
      localStorage.removeItem(LEGACY_PREFERRED_LEAGUE_KEY);
      return legacy;
    }
  } catch {
    // Ignore storage access errors
  }

  return null;
}

/**
 * Persist a concrete preferred league ID and broadcast the change to listeners (e.g. Navbar).
 * Ignores 'all' / empty values so multi-league pages don't overwrite a user's selected league.
 */
export function setPreferredLeagueId(leagueId: unknown): string | null {
  const normalized = normalizePreferredLeagueId(leagueId);
  if (!normalized || typeof window === 'undefined') {
    return null;
  }

  try {
    const prev = localStorage.getItem(PREFERRED_LEAGUE_KEY);
    localStorage.setItem(PREFERRED_LEAGUE_KEY, normalized);
    localStorage.removeItem(LEGACY_PREFERRED_LEAGUE_KEY);

    if (prev !== normalized) {
      window.dispatchEvent(
        new CustomEvent(PREFERRED_LEAGUE_CHANGED_EVENT, {
          detail: { leagueId: normalized, timestamp: Date.now() },
        })
      );
    }
  } catch {
    // Ignore storage / event errors
  }

  return normalized;
}

/**
 * Find the preferred league in a list using string-normalized ID comparison.
 */
export function findPreferredLeague<T extends { id?: string | number }>(
  leagues: T[],
  preferredId?: string | null
): T | null {
  const target = normalizePreferredLeagueId(preferredId ?? getPreferredLeagueId());
  if (!target || !Array.isArray(leagues) || leagues.length === 0) {
    return null;
  }
  return leagues.find((l) => l && l.id != null && String(l.id).trim() === target) ?? null;
}

/**
 * Subscribe to cross-component and cross-tab preferred league changes.
 */
export function subscribePreferredLeagueChange(
  callback: (leagueId: string | null) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const onCustom = (event: Event) => {
    const detail = (event as CustomEvent<{ leagueId?: string }>).detail;
    callback(normalizePreferredLeagueId(detail?.leagueId ?? getPreferredLeagueId()));
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key === PREFERRED_LEAGUE_KEY || event.key === LEGACY_PREFERRED_LEAGUE_KEY) {
      callback(getPreferredLeagueId());
    }
  };

  window.addEventListener(PREFERRED_LEAGUE_CHANGED_EVENT, onCustom as EventListener);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(PREFERRED_LEAGUE_CHANGED_EVENT, onCustom as EventListener);
    window.removeEventListener('storage', onStorage);
  };
}


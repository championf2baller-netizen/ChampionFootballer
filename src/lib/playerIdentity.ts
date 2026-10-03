type PlayerIdentityLike = {
  id?: unknown;
  userId?: unknown;
  _id?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  name?: unknown;
  email?: unknown;
  provider?: unknown;
  isGuest?: unknown;
  guestId?: unknown;
  type?: unknown;
  role?: unknown;
};

const text = (value: unknown): string => String(value ?? '').trim();
const lower = (value: unknown): string => text(value).toLowerCase();

export const isGuestPlayerRecord = (player: unknown): boolean => {
  if (!player || typeof player !== 'object') return false;
  const record = player as PlayerIdentityLike;
  const id = lower(record.id ?? record.userId ?? record._id);
  const firstName = lower(record.firstName);
  const lastName = lower(record.lastName);
  const fullName = lower(record.name);
  const email = lower(record.email);
  const provider = lower(record.provider);
  const type = lower(record.type);
  const role = lower(record.role);
  const isMigratedGuestEmail =
    email.endsWith('@local.invalid') ||
    (email.startsWith('migrated+') && email.includes('@local.invalid'));

  return (
    record.isGuest === true ||
    text(record.guestId) !== '' ||
    id.startsWith('guest-') ||
    id.startsWith('guest_') ||
    provider === 'guest' ||
    type === 'guest' ||
    role === 'guest' ||
    lastName === 'guest' ||
    firstName === 'guest' ||
    fullName === 'guest' ||
    email.includes('guest') ||
    isMigratedGuestEmail
  );
};

export const isRegisteredPlayerRecord = (player: unknown): boolean => {
  if (!player || typeof player !== 'object') return false;
  const record = player as PlayerIdentityLike;
  if (isGuestPlayerRecord(record)) return false;

  if ('email' in record) {
    const email = text(record.email);
    if (!email) return false;
  }

  return true;
};

export const getPositionShortForm = (position: unknown): string => {
  if (!position) return '-';
  const pos = String(position).trim();
  if (!pos) return '-';

  // First try to extract from parentheses, e.g. "Right-Back (RB)" -> "RB"
  const match = pos.match(/\(([^)]+)\)/);
  if (match && match[1]) {
    return match[1].trim();
  }

  // Common position mappings
  const positionMap: Record<string, string> = {
    'center-back': 'CB',
    'right-back': 'RB',
    'left-back': 'LB',
    'right wing-back': 'RWB',
    'left wing-back': 'LWB',
    'central midfielder': 'CM',
    'defensive midfielder': 'CDM',
    'attacking midfielder': 'CAM',
    'right midfielder': 'RM',
    'left midfielder': 'LM',
    'defensive mid': 'CDM',
    'central mid': 'CM',
    'attacking mid': 'CAM',
    'right mid': 'RM',
    'left mid': 'LM',
    'midfielder': 'MF',
    'defender': 'DF',
    'forward': 'FW',
    'striker': 'ST',
    'center forward': 'CF',
    'central forward': 'CF',
    'right forward': 'RF',
    'left forward': 'LF',
    'right winger': 'RW',
    'left winger': 'LW',
    'goalkeeper': 'GK',
    'cb': 'CB',
    'rb': 'RB',
    'lb': 'LB',
    'rwb': 'RWB',
    'lwb': 'LWB',
    'cm': 'CM',
    'cdm': 'CDM',
    'cam': 'CAM',
    'rm': 'RM',
    'lm': 'LM',
    'st': 'ST',
    'cf': 'CF',
    'rf': 'RF',
    'lf': 'LF',
    'rw': 'RW',
    'lw': 'LW',
    'gk': 'GK',
  };

  const lower = pos.toLowerCase();
  if (positionMap[lower]) {
    return positionMap[lower];
  }

  // Handle substring matches
  if (lower.includes('goalkeeper') || lower === 'gk') return 'GK';
  if (lower.includes('center-back') || lower.includes('centre-back')) return 'CB';
  if (lower.includes('right-back')) return 'RB';
  if (lower.includes('left-back')) return 'LB';
  if (lower.includes('wing-back')) {
    if (lower.includes('right')) return 'RWB';
    if (lower.includes('left')) return 'LWB';
    return 'WB';
  }
  if (lower.includes('midfielder') || lower.includes('mid')) {
    if (lower.includes('defensive') || lower.includes('cdm')) return 'CDM';
    if (lower.includes('attacking') || lower.includes('cam')) return 'CAM';
    if (lower.includes('central') || lower.includes('cm')) return 'CM';
    if (lower.includes('right') || lower.includes('rm')) return 'RM';
    if (lower.includes('left') || lower.includes('lm')) return 'LM';
    return 'MF';
  }
  if (lower.includes('defender') || lower.includes('back')) {
    if (lower.includes('center') || lower.includes('centre')) return 'CB';
    if (lower.includes('right')) return 'RB';
    if (lower.includes('left')) return 'LB';
    return 'DF';
  }
  if (lower.includes('winger')) {
    if (lower.includes('right')) return 'RW';
    if (lower.includes('left')) return 'LW';
    return 'WG';
  }
  if (lower.includes('striker')) return 'ST';
  if (lower.includes('forward')) {
    if (lower.includes('center') || lower.includes('centre')) return 'CF';
    if (lower.includes('right')) return 'RF';
    if (lower.includes('left')) return 'LF';
    return 'FW';
  }

  return pos.toUpperCase().substring(0, 3);
};

/**
 * Formats a player's name consistently across all pages:
 * Full First Name + First letter of Last Name followed by a dot (e.g., "John D." or "Ruhel U.")
 */
export const formatPlayerDisplayName = (
  firstName?: string | null,
  lastName?: string | null,
  fullNameInput?: string | null
): string => {
  let first = String(firstName || '').trim();
  let last = String(lastName || '').trim();

  // Filter out dummy 'user' or null/undefined strings
  if (last.toLowerCase() === 'user' || last.toLowerCase() === 'null' || last.toLowerCase() === 'undefined') {
    last = '';
  }

  // If first name is missing but fullNameInput exists
  if (!first && fullNameInput) {
    const parts = String(fullNameInput).trim().split(/\s+/).filter(Boolean);
    if (parts.length > 0) {
      first = parts[0];
      if (parts.length > 1 && !last) {
        last = parts.slice(1).join(' ');
      }
    }
  }

  // If first name has spaces (e.g. "John Doe"), split into first & last
  if (first.includes(' ') && !last) {
    const parts = first.split(/\s+/).filter(Boolean);
    first = parts[0] || '';
    last = parts.slice(1).join(' ');
  }

  if (!first && !last) return 'Player';
  if (!last) return first;

  const lastInitial = last.trim().charAt(0).toUpperCase();
  return lastInitial ? `${first} ${lastInitial}.` : first;
};



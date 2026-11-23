const LOCAL_API_BASE = 'http://localhost:5000';
const PROD_API_BASE = 'https://cfbackend.championfootballer.co.uk';

const normalizeApiBase = (value?: string | null): string | null => {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }

    const normalizedPath = parsed.pathname.replace(/\/+$/, '');
    return `${parsed.origin}${normalizedPath}`;
  } catch {
    return null;
  }
};

export const getClientApiBaseUrl = (): string => {
  const fromEnv = normalizeApiBase(process.env.NEXT_PUBLIC_API_URL);

  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') {
      return fromEnv || LOCAL_API_BASE;
    }
    // When running on a remote/production domain (e.g. championfootballer.com),
    // if fromEnv is missing, points to localhost, or points to the old onrender host,
    // automatically use the live production backend.
    if (!fromEnv || fromEnv.includes('localhost') || fromEnv.includes('127.0.0.1') || fromEnv.includes('onrender.com')) {
      return PROD_API_BASE;
    }
    return fromEnv;
  }

  return fromEnv || LOCAL_API_BASE;
};

export const buildSocialAuthUrl = (provider: string, nextPath = '/home'): string => {
  const safeProvider = provider?.trim() ? provider.trim().toLowerCase() : 'google';
  const safeNextPath = nextPath.startsWith('/') ? nextPath : '/home';

  const params = new URLSearchParams({ next: safeNextPath });
  if (typeof window !== 'undefined') {
    params.set('client', window.location.origin);
  }

  return `${getClientApiBaseUrl()}/auth/${encodeURIComponent(safeProvider)}?${params.toString()}`;
};

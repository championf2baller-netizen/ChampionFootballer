'use client';

import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { getApiBaseUrl } from '@/lib/getApiBaseUrl';
import {
    Container,
    Typography,
    Paper,
    Box,
    Avatar,
    Button,
    CircularProgress,
    TextField,
    Grid,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { Trophy, ChevronDown } from 'lucide-react';
import CloseIcon from '@mui/icons-material/Close';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/store';
import { fetchPlayerStats, setLeagueFilter, setYearFilter, clearPlayerStats } from '@/lib/features/playerStatsSlice';
import TrophyImg from '@/Components/images/awardtrophy.png';
import RunnerUpImg from '@/Components/images/runnerup.png';
import BaloonDImg from '@/Components/images/baloond.png';
import GoldenBootImg from '@/Components/images/goldenboot.png';
import KingPlayMakerImg from '@/Components/images/kingplaymaker.png';
import ShieldImg from '@/Components/images/shield.png';
import DarkHorseImg from '@/Components/images/darkhourse.png';
import TrofiiImg from '@/Components/images/trofii.png';
import Image, { StaticImageData } from 'next/image';
import dayjs, { Dayjs } from 'dayjs';
import { useAuth } from '@/lib/hooks';
import { playerAPI } from '@/lib/api';
import GoatImg from '@/Components/images/goat.png';
import { BarChart, SpaceDashboard } from '@mui/icons-material';
import StarKeeperImg from '@/Components/images/startkeeper.png';
import SearchIcon from '@/Components/images/searchicon.png';
import XPStarMilestoneCard, { XP_TIERS, getXPTier } from '@/Components/XPStarMilestoneCard';
import PlayerProfileLoadingSkeleton from '@/Components/loading/PlayerProfileLoadingSkeleton';
import { getAvatarBackgroundColor, getAvatarInitials } from '@/lib/avatarInitials';
import { getPositionShortForm } from '@/lib/playerIdentity';

import PlayerOverviewContainer from './PlayerOverviewContainer';

// Lazy load heavy components
const CloseButton = dynamic(() => import('@/Components/CloseButton'), {
    loading: () => <></>,
    ssr: false
});

// Colors & Gradients
const DARK_BG = '#383838';
const CARD_BG = '#272727';
const TEAL_PRIMARY = '#00a77f';
const ORANGE_ACCENT = '#ff6b35';
const XP_STATUS_MAX_POINTS = 50000;

// Add the blue filter constant
const BLUE_FILTER = 'invert(30%) sepia(98%) saturate(2000%) hue-rotate(201deg) brightness(92%) contrast(101%)';

type TrophyAward = {
    leagueName: string;
    winnerId?: string | null;
    winnerName?: string;
    winner?: string;
    winner_id?: string | null;
};

type AllTrophyAward = {
    key: string;
    leagueName: string;
    winnerId: string;
    winnerName: string;
};

type League = {
    id: string;
    name: string;
    active?: boolean;
    archived?: boolean;
    status?: string;
    maxGames?: number;
    computedStatus?: any;
    isLocked?: boolean;
    createdAt?: string;
    updatedAt?: string;
    userRole?: 'ADMIN' | 'MEMBER';
    seasons?: Array<{
        isActive?: boolean;
        archived?: boolean;
        status?: unknown;
    }>;
}
type LeagueMatch = {
    id: string;
    homeTeamName: string;
    awayTeamName: string;
    date: string;
    status?: string;
    end?: string;
    location?: string;
    homeTeamGoals?: number;
    awayTeamGoals?: number;
    result?: 'W' | 'D' | 'L' | string;
    playerStats?: {
        freeKicks: number;
        defence: number;
        impact: number;
        penalties: number;
        goals?: number;
        assists?: number;
        cleanSheets?: number;
        motmVotes?: number;
        xpAwarded?: number;
        result?: 'W' | 'D' | 'L' | string;
    };
    homeTeamUsers?: Array<{ id: string }>;
    awayTeamUsers?: Array<{ id: string }>;
    homeTeam?: { players?: Array<{ id?: string; _id?: string }> };
    awayTeam?: { players?: Array<{ id?: string; _id?: string }> };
};

type LeagueWithMatchesTyped = {
    updatedAt: string | number | Date | Dayjs | null | undefined;
    createdAt: any;
    id: string;
    name: string;
    matches?: LeagueMatch[];
    active?: boolean;
    archived?: boolean;
    status?: string;
    maxGames?: number;
    computedStatus?: {
        isComplete?: boolean;
        isCompleted?: boolean;
    };
};

// Type guard to safely detect leagues that include matches
function hasMatches(l: unknown): l is LeagueWithMatchesTyped {
    return typeof l === 'object' && l !== null && Array.isArray((l as { matches?: unknown }).matches);
}

function isLeagueActiveForFilter(l: LeagueWithMatchesTyped): boolean {
    if (!l) return false;
    const isArchived = Boolean(l.archived) || String((l as any).archived) === 'true' || String((l as any).status || '').toLowerCase() === 'archived';
    const isDeleted = Boolean((l as any).deleted) || Boolean((l as any).isDeleted) || String((l as any).status || '').toLowerCase() === 'deleted';
    if (isArchived || isDeleted) return false;
    return true;
}

// AbortError type guard (replaces (err as any) usage)
function isAbortError(error: unknown): error is DOMException & { name: 'AbortError' } {
    return (
        (typeof DOMException !== 'undefined' && error instanceof DOMException && error.name === 'AbortError') ||
        (typeof error === 'object' &&
            error !== null &&
            'name' in error &&
            (error as { name: unknown }).name === 'AbortError')
    );
}

const trophyDetails: Record<string, { image: StaticImageData; label: string }> = {
    // Champion (legacy + new)
    'Champion Footballer': { image: TrophyImg, label: 'League Champion' },
    'League Champion': { image: TrophyImg, label: 'League Champion' },

    // Runner-up (both spellings)
    'Runner Up': { image: RunnerUpImg, label: 'Runner-Up' },
    'Runner-Up': { image: RunnerUpImg, label: 'Runner-Up' },

    // Ballon d'Or (both apostrophe casings)
    "Ballon d'Or": { image: BaloonDImg, label: "Ballon d'Or" },
    "Ballon D'or": { image: BaloonDImg, label: "Ballon d'Or" },

    // Other Trophy Room titles
    'Golden Boot': { image: GoldenBootImg, label: 'Golden Boot' },
    'King Playmaker': { image: KingPlayMakerImg, label: 'King Playmaker' },
    'Legendary Shield': { image: ShieldImg, label: 'Legendary Shield' },
    'The Dark Horse': { image: DarkHorseImg, label: 'The Dark Horse' },
    // ADD: Star Keeper trophy
    'Star Keeper': { image: StarKeeperImg, label: 'Star Keeper' },
};

// Fixed display order for trophies (one key per trophy type)
const orderedTrophyKeys = [
    'League Champion',
    'Runner-Up',
    "Ballon d'Or",
    'Golden Boot',
    'King Playmaker',
    'Legendary Shield',
    'The Dark Horse',
    'Star Keeper',
];

const TROPHY_ICON_FRAME_SIZE = 60;
const TROPHY_ICON_SIZE_BY_LABEL: Record<string, number> = {
    'League Champion': 50,
    'Runner-Up': 50,
    "Ballon d'Or": 50,
    'Golden Boot': 50,
    'King Playmaker': 50,
    'Legendary Shield': 50,
    'The Dark Horse': 50,
    'Star Keeper': 35,
};

const getTrophyIconSize = (label?: string): number => {
    if (!label) return 54;
    return TROPHY_ICON_SIZE_BY_LABEL[label] ?? 54;
};

type StatTotals = {
    goals: number;
    assists: number;
    cleanSheets: number;
    motmVotes: number;
    impact: number;
};

const emptyTotals: StatTotals = {
    goals: 0,
    assists: 0,
    cleanSheets: 0,
    motmVotes: 0,
    impact: 0,
};

function sumStatsFromMatches(matches: LeagueMatch[] = []): StatTotals {
    return matches.reduce((acc, m) => {
        const s = m.playerStats || ({} as LeagueMatch['playerStats']);
        acc.goals += s?.goals ?? 0;
        acc.assists += s?.assists ?? 0;
        acc.cleanSheets += s?.cleanSheets ?? 0;
        acc.motmVotes += s?.motmVotes ?? 0;
        acc.impact += s?.impact ?? 0;
        return acc;
    }, { ...emptyTotals });
}

// Canonical fallback XP: sum backend-provided per-match xpAwarded values.
function sumXPAwardedFromMatches(matches: LeagueMatch[] = []): number {
    return matches.reduce((acc, m) => {
        const v = Number(m?.playerStats?.xpAwarded ?? 0);
        return acc + (Number.isFinite(v) ? v : 0);
    }, 0);
}

const getLeagueRoleTag = (league: any, targetPlayerId?: string): 'Admin' | 'Member' => {
    if (!league) return 'Member';
    const leagueId = String(league.id || league._id || '').trim();

    // 1. Check explicit userRole property on league (if set to ADMIN / SUPER_ADMIN)
    const uRole = String(league.userRole || '').toUpperCase();
    if (uRole === 'ADMIN' || uRole === 'SUPER_ADMIN') return 'Admin';

    // 2. Check logged-in user in localStorage & auth storage
    if (typeof window !== 'undefined') {
        try {
            const keys = ['user', 'currentUser', 'userData'];
            for (const k of keys) {
                const str = localStorage.getItem(k);
                if (!str) continue;
                const u = JSON.parse(str);
                if (!u) continue;
                const currentUserId = String(u.id || u._id || u.userId || u.user_id || '').trim();
                const adminArr = u.adminLeagues || u.administeredLeagues || u.admin_leagues || [];
                if (Array.isArray(adminArr) && adminArr.some((al: any) => {
                    const alId = String(al?.id || al?._id || al || '').trim();
                    return alId && alId === leagueId;
                })) {
                    return 'Admin';
                }
                const creatorId = String(league.adminId || league.createdById || league.creatorId || league.userId || league.admin || '').trim();
                if (currentUserId && creatorId && creatorId === currentUserId) {
                    return 'Admin';
                }
            }
        } catch { }
    }

    // 3. Check target player ID or league object administrator arrays / creator fields
    const pId = String(targetPlayerId || '').trim();
    if (pId) {
        const adminArr = league.administrators || league.administeredBy || league.adminUsers || league.administeredLeagues || [];
        if (Array.isArray(adminArr) && adminArr.some((a: any) => {
            const aId = String(a?.id || a?._id || a || '').trim();
            return aId && aId === pId;
        })) {
            return 'Admin';
        }
        const adminIds = league.adminIds || league.administratorIds || [];
        if (Array.isArray(adminIds) && adminIds.some((id: any) => String(id || '').trim() === pId)) {
            return 'Admin';
        }
        const creatorId = String(league.adminId || league.createdById || league.creatorId || league.userId || league.admin || '').trim();
        if (creatorId && creatorId === pId) {
            return 'Admin';
        }
    }

    // 4. Also check logged-in user ID against league administrators array / adminIds
    if (typeof window !== 'undefined') {
        try {
            const userStr = localStorage.getItem('user') || localStorage.getItem('currentUser');
            if (userStr) {
                const u = JSON.parse(userStr);
                const currentUserId = String(u?.id || u?._id || u?.userId || u?.user_id || '').trim();
                if (currentUserId) {
                    const adminArr = league.administrators || league.administeredBy || league.adminUsers || league.administeredLeagues || [];
                    if (Array.isArray(adminArr) && adminArr.some((a: any) => String(a?.id || a?._id || a || '').trim() === currentUserId)) {
                        return 'Admin';
                    }
                    const adminIds = league.adminIds || league.administratorIds || [];
                    if (Array.isArray(adminIds) && adminIds.some((id: any) => String(id || '').trim() === currentUserId)) {
                        return 'Admin';
                    }
                }
            }
        } catch { }
    }

    return 'Member';
};

function getReadableTextColor(hexColor: string): string {
    const hex = String(hexColor || '').replace('#', '');
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return '#111111';
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.58 ? '#111111' : '#FFFFFF';
}

function resolveProfileImageUrl(value: string | null | undefined): string | null {
    const raw = String(value ?? '').trim();
    if (!raw || raw === 'null' || raw === 'undefined') return null;

    if (
        raw.startsWith('http://') ||
        raw.startsWith('https://') ||
        raw.startsWith('//') ||
        raw.startsWith('data:') ||
        raw.startsWith('blob:')
    ) {
        return raw;
    }

    const apiBase = String(process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');
    if (!apiBase) return raw.startsWith('/') ? raw : `/${raw}`;

    return `${apiBase}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

function sameId(a: unknown, b: unknown): boolean {
    return String(a ?? '').trim() === String(b ?? '').trim();
}

export default function PlayerStatsPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const playerId = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const { token } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

    const { data, filters, loading: reduxLoading, error: reduxError } = useSelector((state: RootState) => state.playerStats);
    const { leagueId, year } = filters;

    const { data: fullPlayerData } = useSelector((state: RootState) => state.playerStats);
    const [careerData, setCareerData] = useState<RootState['playerStats']['data']>(null);

    // Debug logging
    useEffect(() => {
        console.log('🔍 Player Stats State:', {
            data,
            loading: reduxLoading,
            error: reduxError,
            playerId,
            leagueId,
            year
        });
    }, [data, reduxLoading, reduxError, playerId, leagueId, year]);

    const [search, setSearch] = useState('');
    const [leagues, setLeagues] = useState<League[]>([]);
    const [cmsMap, setCmsMap] = useState<Record<string, string>>({});

    useEffect(() => {
        fetch(`${getApiBaseUrl()}/api/static-content?_=${Date.now()}`, {
            cache: 'no-store'
        })
            .then(r => r.json())
            .then(d => {
                if (d?.success) {
                    const map: Record<string, string> = {};
                    if (Array.isArray(d?.data)) {
                        d.data.forEach((it: any) => {
                            if (it?.key && it?.content !== undefined) map[it.key] = it.content;
                        });
                    }
                    if (d?.contentMap) {
                        Object.entries(d.contentMap).forEach(([k, v]: [string, any]) => {
                            if (v && v.content !== undefined) map[k] = v.content;
                        });
                    }
                    setCmsMap(map);
                }
            })
            .catch(() => {});
    }, []);

    const getCms = useCallback((key: string, fallback: string) => cmsMap[key] || fallback, [cmsMap]);
    type PlayerSeasonOption = {
        id: string;
        name: string;
        seasonNumber?: number;
        startDate?: string;
        endDate?: string;
        isMember?: boolean;
        isActive?: boolean;
        active?: boolean;
        membershipStatus?: string;
        memberStatus?: string;
        inviteStatus?: string;
    };

    const isSeasonExplicitlyDeclined = useCallback((season: PlayerSeasonOption): boolean => {
        const statusTokens = [
            season.membershipStatus,
            season.memberStatus,
            season.inviteStatus,
        ]
            .map((token) => String(token || '').trim().toLowerCase())
            .filter(Boolean);
        return statusTokens.some((token) => token.includes('declin') || token.includes('reject'));
    }, []);

    const isSeasonActiveLike = useCallback((season: PlayerSeasonOption): boolean => {
        if (season.isActive === true || season.active === true) return true;
        const endDate = String(season.endDate || '').trim();
        return !endDate;
    }, []);

    const [selectedSeason, setSelectedSeason] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const storedLeague = localStorage.getItem('preferredLeagueId');
            if (storedLeague && storedLeague !== 'all') {
                const storedForLeague = localStorage.getItem('preferredSeasonId_' + storedLeague);
                if (storedForLeague && storedForLeague !== 'all') return storedForLeague;
            }
            const stored = localStorage.getItem('preferredSeasonId');
            if (stored && stored !== 'all') return stored;
        }
        return 'all';
    });
    const [seasons, setSeasons] = useState<PlayerSeasonOption[]>([]);
    const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
    const [leagueDropdownOpen, setLeagueDropdownOpen] = useState(false);
    const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);
    const yearFilterButtonRef = useRef<HTMLButtonElement | null>(null);
    const leagueFilterButtonRef = useRef<HTMLButtonElement | null>(null);
    const seasonFilterButtonRef = useRef<HTMLButtonElement | null>(null);
    const [preferredLeagueId, setPreferredLeagueId] = useState<string | null>(null);
    const [preferredLeagueLoaded, setPreferredLeagueLoaded] = useState(false);
    const filtersInitialized = useRef(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && selectedSeason && selectedSeason !== 'all') {
            try {
                localStorage.setItem('preferredSeasonId', selectedSeason);
                if (leagueId && leagueId !== 'all') {
                    localStorage.setItem('preferredSeasonId_' + leagueId, selectedSeason);
                }
            } catch {}
        }
    }, [selectedSeason, leagueId]);

    const getSeasonSortScore = useCallback((season: { seasonNumber?: number; startDate?: string; endDate?: string; name?: string }): number => {
        if (typeof season.seasonNumber === 'number' && Number.isFinite(season.seasonNumber)) {
            return season.seasonNumber;
        }

        const endTs = season.endDate ? Date.parse(season.endDate) : NaN;
        if (Number.isFinite(endTs)) return endTs;

        const startTs = season.startDate ? Date.parse(season.startDate) : NaN;
        if (Number.isFinite(startTs)) return startTs;

        const name = String(season.name || '');
        const yearHits = name.match(/\b(19|20)\d{2}\b/g);
        if (yearHits && yearHits.length > 0) return Number(yearHits[yearHits.length - 1]);

        return -1;
    }, []);

    const sortSeasonsLatestFirst = useCallback(
        (seasonList: PlayerSeasonOption[]) => {
            return [...seasonList].sort((a, b) => {
                const aScore = getSeasonSortScore(a);
                const bScore = getSeasonSortScore(b);
                if (aScore !== bScore) return bScore - aScore;

                const aStart = a.startDate ? Date.parse(a.startDate) : NaN;
                const bStart = b.startDate ? Date.parse(b.startDate) : NaN;
                if (Number.isFinite(aStart) && Number.isFinite(bStart) && aStart !== bStart) {
                    return bStart - aStart;
                }

                return String(b.name || '').localeCompare(String(a.name || ''), undefined, { numeric: true, sensitivity: 'base' });
            });
        },
        [getSeasonSortScore]
    );

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPreferredLeagueId(localStorage.getItem('preferredLeagueId'));
        }
        setPreferredLeagueLoaded(true);
    }, []);

    // Tab navigation state
    const [activeTab, setActiveTab] = useState('career');
    const [refreshNonce, setRefreshNonce] = useState(0);
    const trophiesCardRef = useRef<HTMLDivElement | null>(null);
    const rewardsCardRef = useRef<HTMLDivElement | null>(null);
    const historyCardRef = useRef<HTMLDivElement | null>(null);

    const handleTabClick = useCallback((tab: string) => {
        setActiveTab(tab);

        if (isDesktop) return;

        const scrollTargets: Partial<Record<string, HTMLDivElement | null>> = {
            trophies: trophiesCardRef.current,
            rewards: rewardsCardRef.current,
            history: historyCardRef.current,
        };

        const targetElement = scrollTargets[tab];
        if (!targetElement) return;

        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }, [isDesktop]);

    // Stats Over Season Modal state
    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [statsModalTab, setStatsModalTab] = useState<'goals' | 'assists' | 'motm' | 'defensive' | 'totalXP'>('goals');

    // Trophies, rewards, and history cards always show overall career-wide data ('all')
    const effectiveTrophiesLeagueId = 'all';
    const effectiveTrophiesYear = 'all';
    const effectiveTrophiesSeasonId = 'all';

    const effectiveRewardsLeagueId = 'all';
    const effectiveRewardsYear = 'all';
    const effectiveRewardsSeasonId = 'all';

    const effectiveHistoryLeagueId = 'all';
    const effectiveHistoryYear = 'all';
    const effectiveHistorySeasonId = 'all';

    // Latest year present in data (fallback: current year)
    const latestYearInData = useMemo(() => {
        const years = ((data?.leagues as LeagueWithMatchesTyped[] | undefined) ?? [])
            .flatMap((l: LeagueWithMatchesTyped) => (hasMatches(l) ? (l.matches || []) : []))
            .map((m: LeagueMatch) => dayjs(m.date).year());
        return years.length ? Math.max(...years) : dayjs().year();
    }, [data]);

    // Filter leagues by selected year (uses matches' date)
    const leaguesForYear = useMemo<LeagueWithMatchesTyped[]>(() => {
        const list = (data?.leagues || []) as LeagueWithMatchesTyped[];
        if (!list.length) return [];

        // If year is 'all', return all leagues
        if (!year || year === 'all') {
            return list.filter(l => hasMatches(l) && isLeagueActiveForFilter(l));
        }

        // Otherwise filter by specific year
        return list.filter(l =>
            hasMatches(l) &&
            isLeagueActiveForFilter(l) &&
            (l.matches || []).some(m => dayjs(m.date).year().toString() === year)
        );
    }, [data, year]);

    // Populate seasons when league changes - fetch from dedicated seasons API
    useEffect(() => {
        if (!leagueId || leagueId === 'all' || !token) {
            setSeasons([]);
            setSelectedSeason('all');
            return;
        }

        const fetchSeasons = async () => {
            try {
                // Use seasons endpoint with fallback path to handle mixed deployments
                const endpoints = [
                    `${process.env.NEXT_PUBLIC_API_URL}/leagues/${leagueId}/seasons`,
                    `${process.env.NEXT_PUBLIC_API_URL}/api/leagues/${leagueId}/seasons`,
                ];
                let response: Response | null = null;
                for (const endpoint of endpoints) {
                    try {
                        const res = await fetch(endpoint, {
                            credentials: 'include',
                            headers: { Authorization: `Bearer ${token}` },
                            cache: 'no-store'
                        });
                        if (res.ok) {
                            response = res;
                            break;
                        }
                    } catch {
                        // try next endpoint
                    }
                }

                if (response && response.ok) {
                    const result = await response.json();
                    // API returns { success: true, seasons: [...] }
                    const seasonsData = result?.seasons || result?.data || [];

                    if (Array.isArray(seasonsData) && seasonsData.length > 0) {
                        const formattedSeasons = seasonsData.map((s: any) => ({
                            id: s.id || s._id,
                            name: s.name || `Season ${s.seasonNumber !== undefined ? s.seasonNumber : ''}`,
                            seasonNumber: s.seasonNumber !== undefined ? s.seasonNumber : undefined,
                            startDate: typeof s.startDate === 'string' ? s.startDate : undefined,
                            endDate: typeof s.endDate === 'string' ? s.endDate : undefined,
                            isMember: s.isMember !== undefined ? s.isMember : true,
                            isActive: s.isActive === true,
                            active: s.active === true,
                            membershipStatus: typeof s.membershipStatus === 'string' ? s.membershipStatus : undefined,
                            memberStatus: typeof s.memberStatus === 'string' ? s.memberStatus : undefined,
                            inviteStatus: typeof s.inviteStatus === 'string' ? s.inviteStatus : undefined,
                        }));
                        const sortedSeasons = sortSeasonsLatestFirst(formattedSeasons);
                        const visibleSeasons = sortedSeasons.filter((season) => !isSeasonExplicitlyDeclined(season));
                        const activeVisibleSeason = visibleSeasons.find((season) => isSeasonActiveLike(season));
                        const storedSeasonId = typeof window !== 'undefined' ? (localStorage.getItem('preferredSeasonId_' + leagueId) || localStorage.getItem('preferredSeasonId')) : null;
                        const preferredSeasonObj = storedSeasonId && storedSeasonId !== 'all' ? visibleSeasons.find((s: any) => String(s.id).trim() === String(storedSeasonId).trim() || (s.seasonNumber !== undefined && String(s.seasonNumber) === String(storedSeasonId).trim())) : null;
                        const defaultSeason = preferredSeasonObj
                            || (selectedSeason && selectedSeason !== 'all' && visibleSeasons.find((s: any) => String(s.id) === String(selectedSeason)))
                            || activeVisibleSeason
                            || visibleSeasons[0]
                            || sortedSeasons[0];

                        setSeasons(sortedSeasons);
                        console.log('📋 Fetched seasons from /leagues/:id/seasons API:', sortedSeasons);
                        const chosenSeasonId = defaultSeason?.id || 'all';
                        setSelectedSeason(chosenSeasonId);
                        if (chosenSeasonId && chosenSeasonId !== 'all') {
                            try {
                                localStorage.setItem('preferredSeasonId', chosenSeasonId);
                                if (leagueId && leagueId !== 'all') {
                                    localStorage.setItem('preferredSeasonId_' + leagueId, chosenSeasonId);
                                }
                            } catch {}
                        }
                    } else {
                        setSeasons([]);
                        setSelectedSeason('all');
                    }
                } else {
                    console.warn('Seasons API returned non-OK status');
                    setSeasons([]);
                    setSelectedSeason('all');
                }
            } catch (error) {
                console.error('Failed to fetch seasons:', error);
                setSeasons([]);
                setSelectedSeason('all');
            }
        };

        fetchSeasons();
    }, [leagueId, token, sortSeasonsLatestFirst, isSeasonExplicitlyDeclined, isSeasonActiveLike]);

    // --- Teammate (co-players) search state ---
    type LeaguePlayer = {
        id: string;
        firstName?: string;
        lastName?: string;
        name?: string;
        avatar?: string;
        position?: string;
    };

    // Raw player shape from API (no any)
    type RawPlayer = {
        id?: string;
        _id?: string;
        userId?: string;
        firstName?: string;
        fname?: string;
        lastName?: string;
        lname?: string;
        name?: string;
        avatar?: string;
        profilePicture?: string;
        avatarUrl?: string;
        image?: string;
        position?: string;
        positionType?: string;
    };

    const [teammates, setTeammates] = useState<LeaguePlayer[]>([]);
    const [teammatesLoading, setTeammatesLoading] = useState(false);
    const [searchTriggered, setSearchTriggered] = useState(false);
    const [showTeammatePanel, setShowTeammatePanel] = useState(false);

    const searchWrapperRef = useRef<HTMLDivElement | null>(null);
    const fetchAbortRef = useRef<AbortController | null>(null);
    const lastFetchKeyRef = useRef<string>('');

    const normalizePlayer = useCallback((p: RawPlayer): LeaguePlayer => ({
        id: p.id || p._id || p.userId || '',
        firstName: p.firstName ?? p.fname,
        lastName: p.lastName ?? p.lname,
        name: p.name ?? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim(),
        avatar: resolveProfileImageUrl(p.avatar ?? p.profilePicture ?? p.avatarUrl ?? p.image) ?? undefined,
        position: p.position ?? p.positionType,
    }), []);

    type TeammateAPIResponse = {
        success?: boolean;
        data?: RawPlayer[];
        players?: RawPlayer[];
    } | RawPlayer[];

    const fetchTeammates = useCallback(async () => {
        if (!token) return;
        if (!playerId) return;
        const effectiveLeagueId = leagueId || 'all';
        const effectiveYear = year || 'all';
        const effectiveSeason = selectedSeason || 'all';
        const leaguesFingerprint =
            effectiveLeagueId === 'all'
                ? (leaguesForYear || [])
                    .map((l) => String(l.id))
                    .sort()
                    .join(',')
                : effectiveLeagueId;

        // Include active filters in key so teammate cache doesn't go stale when filters change.
        const fetchKey = `${playerId}_${effectiveLeagueId}_${effectiveYear}_${effectiveSeason}_${leaguesFingerprint}`;
        if (fetchKey === lastFetchKeyRef.current && teammates.length && searchTriggered) {
            // Already have data for this combination
            setShowTeammatePanel(true);
            return;
        }

        if (fetchAbortRef.current) fetchAbortRef.current.abort();
        const controller = new AbortController();
        fetchAbortRef.current = controller;

        setTeammatesLoading(true);
        setSearchTriggered(true);

        try {
            const fetchLeaguePlayers = async (targetLeagueId: string): Promise<RawPlayer[]> => {
                const params = new URLSearchParams();
                params.set('leagueId', String(targetLeagueId));
                if (effectiveSeason && effectiveSeason !== 'all') {
                    params.set('seasonId', String(effectiveSeason));
                }
                params.set('_t', String(Date.now()));
                const url = `${process.env.NEXT_PUBLIC_API_URL}/players/by-league?${params.toString()}`;
                const res = await fetch(url, {
                    credentials: 'include',
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal,
                    cache: 'no-store'
                });
                if (!res.ok) return [];
                const contentType = res.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) return [];
                const json: TeammateAPIResponse = await res.json();
                if (Array.isArray(json)) return json;
                if (json?.data && Array.isArray(json.data)) return json.data;
                if (json?.players && Array.isArray(json.players)) return json.players;
                return [];
            };

            const allPlayers = new Map<string, RawPlayer>();
            if (effectiveLeagueId === 'all') {
                for (const league of leaguesForYear || []) {
                    try {
                        const leaguePlayers = await fetchLeaguePlayers(String(league.id));
                        leaguePlayers.forEach((player) => {
                            const id = String(player.id || player._id || player.userId || '').trim();
                            if (id && !allPlayers.has(id)) allPlayers.set(id, player);
                        });
                    } catch (err) {
                        console.log(`Failed to fetch players for league ${league.id}`, err);
                    }
                }
            } else {
                const leaguePlayers = await fetchLeaguePlayers(String(effectiveLeagueId));
                leaguePlayers.forEach((player) => {
                    const id = String(player.id || player._id || player.userId || '').trim();
                    if (id && !allPlayers.has(id)) allPlayers.set(id, player);
                });
            }

            const mapped = Array.from(allPlayers.values())
                .map(normalizePlayer)
                .filter(p => p.id && !sameId(p.id, playerId));

            setTeammates(mapped);
            lastFetchKeyRef.current = fetchKey;
        } catch (error: unknown) {
            if (!isAbortError(error)) {
                setTeammates([]);
            }
        } finally {
            setTeammatesLoading(false);
        }
    }, [token, playerId, leagueId, year, selectedSeason, teammates.length, searchTriggered, leaguesForYear, normalizePlayer]);

    // Close panel on outside click / ESC
    useEffect(() => {
        if (!showTeammatePanel) return;
        const handleClick = (e: MouseEvent) => {
            if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
                setShowTeammatePanel(false);
            }
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowTeammatePanel(false);
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [showTeammatePanel]);

    // Cleanup abort controller on unmount
    useEffect(() => {
        return () => {
            if (fetchAbortRef.current) fetchAbortRef.current.abort();
        };
    }, []);

    // Reset teammate search cache whenever scope filters change.
    useEffect(() => {
        setTeammates([]);
        setSearch('');
        setSearchTriggered(false);
        lastFetchKeyRef.current = '';
        setShowTeammatePanel(false);
    }, [leagueId, year, selectedSeason]);

    const filteredTeammates = useMemo(() => {
        const q = search.trim().toLowerCase();
        const list = q
            ? teammates.filter(p => {
                const full = (p.name || `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim()).toLowerCase();
                return full.includes(q);
            })
            : teammates;
        return [...list].sort((a, b) => {
            const nameA = (a.name || `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim()).toLowerCase();
            const nameB = (b.name || `${b.firstName ?? ''} ${b.lastName ?? ''}`.trim()).toLowerCase();
            return nameA.localeCompare(nameB);
        });
    }, [search, teammates]);

    const completedStatusTokens = useMemo(
        () => new Set([
            'completed',
            'complete',
            'finished',
            'ended',
            'result_published',
            'result_uploaded',
            'result_complete',
            'result_finished',
            'result_ended',
            'result_done',
            'closed',
        ]),
        []
    );

    const leagueIsCompleted = useCallback((l: League): boolean => {
        const withFlags = l as League & {
            isComplete?: boolean;
            isCompleted?: boolean;
            archived?: boolean;
            seasons?: Array<{
                isActive?: boolean;
                archived?: boolean;
                status?: unknown;
            }>;
        };

        const status = String(l?.status || '').toLowerCase().trim();
        if (completedStatusTokens.has(status)) return true;

        if (
            l?.computedStatus?.isComplete === true ||
            l?.computedStatus?.isCompleted === true ||
            l?.computedStatus?.locked === true ||
            withFlags.isComplete === true ||
            withFlags.isCompleted === true ||
            l?.isLocked === true
        ) {
            return true;
        }

        // If league is explicitly active, it is NOT completed
        if (l?.active === true || status === 'active' || status === 'live') {
            return false;
        }

        const nonArchivedSeasons = Array.isArray(withFlags.seasons) ? withFlags.seasons.filter((s) => !Boolean(s?.archived)) : [];
        if (nonArchivedSeasons.length > 0) {
            const seasonDoneTokens = new Set([
                'completed',
                'complete',
                'finished',
                'ended',
                'locked',
                'result_published',
                'result_uploaded',
                'result_complete',
                'result_finished',
                'result_ended',
                'result_done',
            ]);
            const hasActiveSeason = nonArchivedSeasons.some((s) => s?.isActive === true);
            const hasCompletedSeason = nonArchivedSeasons.some((s) => {
                if (!s) return false;
                const st = typeof s.status === 'string' ? s.status.toLowerCase().trim() : '';
                return seasonDoneTokens.has(st);
            });
            if (!hasActiveSeason && hasCompletedSeason) return true;
        }

        return false;
    }, [completedStatusTokens]);

    // fetch league list for top League select
    useEffect(() => {
        if (!token) return;
        let isMounted = true;

        const loadLeagues = async () => {
            try {
                let leaguesData: any[] = [];
                let adminLeagueIds = new Set<string>();
                let memberLeagueIds = new Set<string>();

                // 1. Fetch /auth/status to get exact user admin/member league sets
                const authRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/status?refresh=1&_t=${Date.now()}`, {
                    credentials: 'include',
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store',
                }).catch(() => null);

                if (authRes && authRes.ok) {
                    const d = await authRes.json().catch(() => null);
                    if (d?.success && d?.user) {
                        const adminArr = (d.user.adminLeagues || d.user.administeredLeagues || []) as any[];
                        const memberArr = (d.user.leagues || []) as any[];
                        adminLeagueIds = new Set<string>(
                            adminArr
                                .map((l) => String(l?.id || l?._id || l))
                                .filter((id) => id && id !== 'undefined')
                        );
                        memberLeagueIds = new Set<string>(
                            memberArr
                                .map((l) => String(l?.id || l?._id || l))
                                .filter((id) => id && id !== 'undefined')
                        );
                        if (leaguesData.length === 0) {
                            leaguesData = [...memberArr, ...adminArr];
                        }
                    }
                }

                // 2. Fetch /leagues/user-leagues for full league objects
                const userLeaguesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leagues/user-leagues?refresh=1&_t=${Date.now()}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store',
                }).catch(() => null);

                if (userLeaguesRes && userLeaguesRes.ok) {
                    const d = await userLeaguesRes.json().catch(() => null);
                    if (d?.success && Array.isArray(d?.leagues) && d.leagues.length > 0) {
                        leaguesData = d.leagues;
                    }
                }

                if (!isMounted || leaguesData.length === 0) return;

                // Remove duplicates by id
                const uniqueMap = new Map<string, any>();
                leaguesData.forEach((l) => {
                    const id = String(l?.id || '');
                    if (id && !uniqueMap.has(id)) {
                        uniqueMap.set(id, l);
                    }
                });

                const unique = Array.from(uniqueMap.values()).map((l) => {
                    const leagueId = String(l.id);
                    const role: 'ADMIN' | 'MEMBER' | undefined = adminLeagueIds.has(leagueId)
                        ? 'ADMIN'
                        : (memberLeagueIds.has(leagueId) ? 'MEMBER' : (l.userRole || undefined));
                    return {
                        ...l,
                        userRole: role,
                    };
                });

                // Filter to ONLY Live or Completed leagues, and exclude all Archived and Deleted leagues
                const visibleLeagues = unique.filter((l) => {
                    if (!l || !l.id) return false;

                    // Exclude deleted leagues
                    const isDeleted = Boolean((l as any).deleted) || Boolean((l as any).isDeleted) || String((l as any).status || '').toLowerCase() === 'deleted';
                    if (isDeleted) return false;

                    // Exclude archived leagues
                    const isArchived = Boolean(l.archived) || String(l.archived) === 'true' || String(l.status || '').toLowerCase() === 'archived';
                    if (isArchived) return false;

                    return true;
                });

                visibleLeagues.sort((a: any, b: any) => {
                    const getCreatedTs = (l: any): number => {
                        if (!l || !l.createdAt) return 0;
                        const t = new Date(l.createdAt).getTime();
                        return Number.isFinite(t) ? t : 0;
                    };
                    const tsA = getCreatedTs(a);
                    const tsB = getCreatedTs(b);
                    if (tsA !== tsB) return tsB - tsA;
                    const an = (a?.name ?? '').toString().trim().toLowerCase();
                    const bn = (b?.name ?? '').toString().trim().toLowerCase();
                    if (an < bn) return -1;
                    if (an > bn) return 1;
                    return String(a.id).localeCompare(String(b.id));
                });

                if (isMounted) {
                    setLeagues(visibleLeagues as League[]);
                }
            } catch (err) {
                console.error('Failed to load career page leagues:', err);
            }
        };

        loadLeagues();

        return () => {
            isMounted = false;
        };
    }, [token, leagueIsCompleted]);

    const dropdownLeagues = useMemo(() => {
        const cleanLeagues = leagues.filter((l) => {
            if (!l || !l.id) return false;
            const isArchived = Boolean(l.archived) || String(l.archived) === 'true' || String(l.status || '').toLowerCase() === 'archived';
            const isDeleted = Boolean((l as any).deleted) || Boolean((l as any).isDeleted) || String((l as any).status || '').toLowerCase() === 'deleted';
            return !isArchived && !isDeleted;
        });
        if (year === 'all') return cleanLeagues;
        return cleanLeagues.filter((l) => {
            const dateStr = (l.createdAt || l.updatedAt || '').trim();
            if (!dateStr) return false;
            const t = Date.parse(dateStr);
            if (!Number.isFinite(t)) return false;
            return String(new Date(t).getFullYear()) === year;
        });
    }, [leagues, year]);

    // fetch player data
    useEffect(() => {
        if (playerId) {
            dispatch(fetchPlayerStats({ playerId, leagueId, year }));
        }
        return () => {
            dispatch(clearPlayerStats());
        };
    }, [dispatch, playerId]);

    useEffect(() => {
        if (playerId) {
            dispatch(fetchPlayerStats({ playerId, leagueId, year }));
        }
    }, [dispatch, playerId, leagueId, year]);

    const triggerPlayerStatsRefresh = useCallback(() => {
        if (!playerId) return;
        dispatch(fetchPlayerStats({ playerId, leagueId, year }));
        setRefreshNonce((prev) => prev + 1);
    }, [dispatch, playerId, leagueId, year]);

    useEffect(() => {
        if (!playerId) return;

        const handleStatsMutation = () => {
            triggerPlayerStatsRefresh();
        };
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                triggerPlayerStatsRefresh();
            }
        };

        window.addEventListener('match-created', handleStatsMutation as EventListener);
        window.addEventListener('match-updated', handleStatsMutation as EventListener);
        window.addEventListener('match-stats-updated', handleStatsMutation as EventListener);
        window.addEventListener('cache-cleared', handleStatsMutation as EventListener);
        window.addEventListener('data-mutated', handleStatsMutation as EventListener);
        window.addEventListener('focus', handleStatsMutation as EventListener);
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            window.removeEventListener('match-created', handleStatsMutation as EventListener);
            window.removeEventListener('match-updated', handleStatsMutation as EventListener);
            window.removeEventListener('match-stats-updated', handleStatsMutation as EventListener);
            window.removeEventListener('cache-cleared', handleStatsMutation as EventListener);
            window.removeEventListener('data-mutated', handleStatsMutation as EventListener);
            window.removeEventListener('focus', handleStatsMutation as EventListener);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [playerId, triggerPlayerStatsRefresh]);

    // Reset careerData when refreshNonce or playerId changes to force a fresh fetch
    useEffect(() => {
        setCareerData(null);
    }, [playerId, refreshNonce]);

    // Sync careerData with redux stats data when no filter is active
    useEffect(() => {
        if (leagueId === 'all' && year === 'all' && data) {
            setCareerData(data as unknown as RootState['playerStats']['data']);
        }
    }, [data, leagueId, year]);

    // Always keep an unfiltered snapshot for Career Stats (all leagues, all years).
    useEffect(() => {
        if (!playerId) {
            setCareerData(null);
            return;
        }

        // Skip separate API request if no filter is active, as data already has all stats
        if (leagueId === 'all' && year === 'all') {
            return;
        }

        // Skip separate API request if careerData is already populated
        if (careerData) {
            return;
        }

        let cancelled = false;
        playerAPI
            .getPlayerStats(String(playerId), 'all', 'all')
            .then((res) => {
                if (cancelled) return;
                if (res.success && res.data) {
                    setCareerData(res.data as unknown as RootState['playerStats']['data']);
                }
            })
            .catch(() => {
                if (!cancelled) setCareerData(null);
            });

        return () => {
            cancelled = true;
        };
    }, [playerId, token, refreshNonce, leagueId, year, careerData]);

    // Awards flattening
    const allTrophyAwards: AllTrophyAward[] = useMemo(() => {
        if (!data || !data.trophies) return [];
        const awards: AllTrophyAward[] = [];
        Object.entries(data.trophies).forEach(([trophyKey, winners]) => {
            if (Array.isArray(winners)) {
                (winners as TrophyAward[]).forEach((award: TrophyAward) => {
                    const winnerIdRaw = award.winnerId ?? award.winner_id ?? null;
                    if (!winnerIdRaw) return;
                    awards.push({
                        key: trophyKey,
                        leagueName: award.leagueName,
                        winnerId: String(winnerIdRaw),
                        winnerName: award.winnerName || award.winner || award.winner_id || '',
                    });
                });
            }
        });
        return awards;
    }, [data]);

    const allMatches = useMemo<LeagueMatch[]>(() => {
        const matches = (data?.leagues || []).flatMap((l) => (hasMatches(l) ? l.matches ?? [] : []));
        console.log('📊 All matches data:', {
            totalMatches: matches.length,
            sampleMatch: matches[0],
            leaguesCount: data?.leagues?.length || 0
        });
        return matches;
    }, [data]);

    const careerMatches = useMemo<LeagueMatch[]>(() => {
        const canUseVisibleDataAsCareer =
            (!leagueId || leagueId === 'all') &&
            (!year || year === 'all');
        const source = careerData || (canUseVisibleDataAsCareer ? data : null);
        return (source?.leagues || []).flatMap((l) => (hasMatches(l) ? l.matches ?? [] : []));
    }, [careerData, data, leagueId, year]);

    const currentLeagueMatches = useMemo<LeagueMatch[]>(() => {
        const leaguesList: LeagueWithMatchesTyped[] = (data?.leagues as LeagueWithMatchesTyped[] | undefined) ?? [];
        if (!leaguesList.length) return [];

        if (leagueId && leagueId !== 'all') {
            const l = leaguesList.find((x: LeagueWithMatchesTyped) => sameId(x.id, leagueId));
            let matches = hasMatches(l) ? l.matches ?? [] : [];

            // Apply season filter if selected - use date range from seasons API
            if (selectedSeason && selectedSeason !== 'all') {
                const selectedSeasonData = seasons.find(s => sameId(s.id, selectedSeason));
                if (selectedSeasonData && selectedSeasonData.startDate) {
                    const seasonStart = dayjs(selectedSeasonData.startDate);
                    const seasonEnd = selectedSeasonData.endDate ? dayjs(selectedSeasonData.endDate) : null;

                    matches = matches.filter(m => {
                        // First check if match has seasonId directly
                        if ((m as any).seasonId) {
                            return sameId((m as any).seasonId, selectedSeason);
                        }
                        // Otherwise filter by date range
                        const matchDate = dayjs(m.date);
                        if (seasonEnd) {
                            return matchDate.valueOf() >= seasonStart.valueOf() && matchDate.valueOf() <= seasonEnd.valueOf();
                        }
                        // Active season (no end date) - match is after start
                        return matchDate.valueOf() >= seasonStart.valueOf();
                    });
                } else {
                    // Fallback to direct seasonId check
                    matches = matches.filter(m => sameId((m as any).seasonId, selectedSeason));
                }
                console.log('⚽ [Stats] Filtered by season:', selectedSeason, '| Matches:', matches.length);
            }

            return matches;
        }

        const first = leaguesList[0];
        return hasMatches(first) ? first.matches ?? [] : [];
    }, [data, leagueId, selectedSeason, seasons]);

    const accumulativeTotals = useMemo(() => sumStatsFromMatches(allMatches), [allMatches]);
    const careerTotals = useMemo(() => sumStatsFromMatches(careerMatches), [careerMatches]);
    const currentLeagueTotals = useMemo(() => sumStatsFromMatches(currentLeagueMatches), [currentLeagueMatches]);

    // Count MOTM votes from votes array - Current League
    const motmVotesCount = useMemo(() => {
        const count = currentLeagueMatches.reduce((acc, match) => {
            const votes = (match as any).votes || [];
            console.log('🗳️ Match votes:', {
                matchId: match.id,
                votes,
                playerId,
                votesForPlayer: votes.filter((vote: any) =>
                    String(vote.votedForId) === String(playerId)
                ).length
            });
            // Count how many votes this player received (votedForId is the player who received the vote)
            const votesForPlayer = votes.filter((vote: any) =>
                String(vote.votedForId) === String(playerId)
            ).length;
            return acc + votesForPlayer;
        }, 0);
        console.log('✅ Total MOTM votes for player:', count);
        return count;
    }, [currentLeagueMatches, playerId]);

    // Count MOTM votes from votes array - Career (All Matches)
    const careerMotmVotesCount = useMemo(() => {
        const count = careerMatches.reduce((acc, match) => {
            const votes = (match as any).votes || [];
            const votesForPlayer = votes.filter((vote: any) =>
                String(vote.votedForId) === String(playerId)
            ).length;
            return acc + votesForPlayer;
        }, 0);
        console.log('✅ Total Career MOTM votes for player:', count);
        return count;
    }, [careerMatches, playerId]);

    // Count defensive impact votes from captain picks - Current League
    const defensiveImpactCount = useMemo(() => {
        const count = currentLeagueMatches.filter(match => {
            const m = match as any;
            const isDefensive = sameId(m.homeDefensiveImpactId, playerId) ||
                sameId(m.awayDefensiveImpactId, playerId);
            console.log('🛡️ Match defensive impact:', {
                matchId: match.id,
                homeDefensiveImpactId: m.homeDefensiveImpactId,
                awayDefensiveImpactId: m.awayDefensiveImpactId,
                playerId,
                isDefensive
            });
            return isDefensive;
        }).length;
        console.log('✅ Total defensive impact count:', count);
        return count;
    }, [currentLeagueMatches, playerId]);

    // Count defensive impact votes from captain picks - Career (All Matches)
    const careerDefensiveImpactCount = useMemo(() => {
        const count = careerMatches.filter(match => {
            const m = match as any;
            return sameId(m.homeDefensiveImpactId, playerId) || sameId(m.awayDefensiveImpactId, playerId);
        }).length;
        console.log('✅ Total Career defensive impact count:', count);
        return count;
    }, [careerMatches, playerId]);

    // Fallback XP from already-loaded profile payload
    const profileXPFallback = useMemo(() => {
        const playerObj = (fullPlayerData?.player || {}) as Record<string, unknown>;
        const rootObj = (fullPlayerData || {}) as Record<string, unknown>;
        const raw =
            playerObj.totalXP ??
            playerObj.totalXp ??
            playerObj.xp ??
            rootObj.totalXP ??
            rootObj.totalXp ??
            rootObj.xp ??
            0;
        const parsed = Number(raw);
        return Number.isFinite(parsed) ? parsed : 0;
    }, [fullPlayerData]);

    // Direct XP from player table by player id (/players/:id -> player.xp)
    const [xp, setXp] = useState<number>(0);
    const [xpLoading, setXpLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!playerId) {
            setXp(profileXPFallback);
            return;
        }

        let cancelled = false;
        setXpLoading(true);

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/players/${encodeURIComponent(String(playerId))}`, {
            credentials: 'include',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            cache: 'no-store',
        })
            .then(async (res) => {
                if (!res.ok) throw new Error('Failed to fetch player profile');
                const json = (await res.json()) as Record<string, unknown>;
                const playerObj = (json.player || json.data || {}) as Record<string, unknown>;
                const raw =
                    playerObj.xp ??
                    playerObj.totalXP ??
                    playerObj.totalXp ??
                    json.xp ??
                    json.totalXP ??
                    profileXPFallback;
                const parsed = Number(raw);
                if (!cancelled) setXp(Number.isFinite(parsed) ? parsed : profileXPFallback);
            })
            .catch(() => {
                if (!cancelled) setXp(profileXPFallback);
            })
            .finally(() => {
                if (!cancelled) setXpLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [playerId, token, profileXPFallback]);

    const currentScopedXP = useMemo(() => {
        const matchesForScope = leagueId === 'all' ? allMatches : currentLeagueMatches;
        return sumXPAwardedFromMatches(matchesForScope);
    }, [leagueId, allMatches, currentLeagueMatches]);

    const careerScopedXP = useMemo(() => sumXPAwardedFromMatches(careerMatches), [careerMatches]);

    const isCurrentStatsTab = activeTab === 'current';

    const displayXp = useMemo(() => {
        return isCurrentStatsTab ? currentScopedXP : xp;
    }, [isCurrentStatsTab, currentScopedXP, xp]);

    const displayedStatsMatches = isCurrentStatsTab
        ? (leagueId === 'all' ? allMatches.length : currentLeagueMatches.length)
        : careerMatches.length;
    const displayedStatsTotals = isCurrentStatsTab
        ? (leagueId === 'all' ? accumulativeTotals : currentLeagueTotals)
        : careerTotals;
    const displayedMotmVotes = isCurrentStatsTab
        ? (leagueId === 'all' ? careerMotmVotesCount : motmVotesCount)
        : careerMotmVotesCount;
    const displayedDefensiveImpact = isCurrentStatsTab
        ? (leagueId === 'all' ? careerDefensiveImpactCount : defensiveImpactCount)
        : careerDefensiveImpactCount;

    const statsRowXpStatusTier = useMemo(() => getXPTier(displayXp), [displayXp]);

    const statsRowXpProgressToMax = useMemo(() => {
        const safeXp = Number.isFinite(displayXp) ? Math.max(0, displayXp) : 0;
        const cappedXp = Math.min(XP_STATUS_MAX_POINTS, safeXp);
        const rawPercent = (cappedXp / XP_STATUS_MAX_POINTS) * 100;
        if (rawPercent <= 0) return 0;
        if (rawPercent >= 100) return 100;
        return Math.max(1, Math.round(rawPercent));
    }, [displayXp]);

    // XP status from revised 7-level table
    const xpStatusTier = useMemo(() => getXPTier(xp), [xp]);

    const nextXpStatusTier = useMemo(() => {
        const safeXp = Number.isFinite(xp) ? Math.max(0, xp) : 0;
        return XP_TIERS.find((tier) => tier.minXP > safeXp) ?? null;
    }, [xp]);

    const xpProgressToMax = useMemo(() => {
        const safeXp = Number.isFinite(xp) ? Math.max(0, xp) : 0;
        const cappedXp = Math.min(XP_STATUS_MAX_POINTS, safeXp);
        const rawPercent = (cappedXp / XP_STATUS_MAX_POINTS) * 100;
        if (rawPercent <= 0) return 0;
        if (rawPercent >= 100) return 100;
        return Math.max(1, Math.round(rawPercent));
    }, [xp]);

    const xpRemainingToMax = useMemo(() => {
        const safeXp = Number.isFinite(xp) ? Math.max(0, xp) : 0;
        return Math.max(0, XP_STATUS_MAX_POINTS - safeXp);
    }, [xp]);

    const xpStatusTextColor = useMemo(
        () => getReadableTextColor(xpStatusTier.cardColor),
        [xpStatusTier.cardColor]
    );

    // Header XP Overrides where max XP is 25,000 and GOAT status is reached at 25,000 XP
    const PAGE_XP_MAX_POINTS = 25000;

    const PAGE_XP_TIERS = useMemo(() => [
        ...XP_TIERS.filter((t) => t.minXP < PAGE_XP_MAX_POINTS),
        {
            level: 6,
            title: 'GOAT',
            minXP: PAGE_XP_MAX_POINTS,
            maxXP: Infinity,
            cardColor: '#F1C40F',
            starColor: '#A67C00',
            description: 'Feared by opponents and cemented in history as one of the greatest of all time.',
            isGoat: true,
        }
    ], []);

    const pageXpStatusTier = useMemo(() => {
        const safeXP = Number.isFinite(xp) ? xp : 0;
        return PAGE_XP_TIERS.find((tier) => safeXP >= tier.minXP && safeXP < tier.maxXP) || PAGE_XP_TIERS[0];
    }, [xp, PAGE_XP_TIERS]);

    const pageXpProgressToMax = useMemo(() => {
        const safeXp = Number.isFinite(xp) ? Math.max(0, xp) : 0;
        const cappedXp = Math.min(PAGE_XP_MAX_POINTS, safeXp);
        const rawPercent = (cappedXp / PAGE_XP_MAX_POINTS) * 100;
        if (rawPercent <= 0) return 0;
        if (rawPercent >= 100) return 100;
        return Math.max(1, Math.round(rawPercent));
    }, [xp]);

    const pageXpStatusTextColor = useMemo(() => {
        return getReadableTextColor(pageXpStatusTier.cardColor);
    }, [pageXpStatusTier.cardColor]);

    // Compute season-wise stats for modal
    type SeasonStats = {
        seasonId: string;
        seasonName: string;
        seasonNumber: number;
        goals: number;
        assists: number;
        motmVotes: number;
        defensiveImpact: number;
        cleanSheets: number;
        totalXP: number;
        matches: number;
        isFinished: boolean;
        endDateFormatted: string;
    };

    const seasonWiseStats = useMemo<SeasonStats[]>(() => {
        const careerLeagues = (careerData?.leagues as LeagueWithMatchesTyped[] | undefined) ?? [];
        const currentLeagues = (data?.leagues as LeagueWithMatchesTyped[] | undefined) ?? [];
        const leaguesList: LeagueWithMatchesTyped[] = careerLeagues.length ? careerLeagues : currentLeagues;
        if (!leaguesList.length || !leagueId || leagueId === 'all') return [];

        const selectedLeague = careerLeagues.find(l => sameId(l.id, leagueId)) || currentLeagues.find(l => sameId(l.id, leagueId));
        // Allow league even with no matches - user may be a member in seasons with 0 matches
        if (!selectedLeague) return [];
        // If no matches AND no seasons fetched, nothing to show
        if (!hasMatches(selectedLeague) && seasons.length === 0) return [];

        console.log('🔍 Selected League Data (Stats Over Season):', {
            leagueId,
            leagueName: selectedLeague.name,
            totalMatches: (selectedLeague.matches || []).length,
            seasonsFromAPI: seasons,
        });

        const allLeagueMatches = selectedLeague.matches || [];
        // Backend profile payload is already scoped to this player. Keep unique matches only.
        const seenMatchIds = new Set<string>();
        const playerMatches = allLeagueMatches.filter((match) => {
            const matchId = String((match as { id?: string }).id || '').trim();
            if (!matchId || seenMatchIds.has(matchId)) return false;
            seenMatchIds.add(matchId);
            return true;
        });

        console.log('🎯 Player participated in matches (Stats Over Season - All Seasons):', {
            totalLeagueMatches: allLeagueMatches.length,
            playerMatches: playerMatches.length,
            playerId,
        });

        // Use seasons from state (fetched from /leagues/:id/seasons API)
        // These have proper seasonNumber, startDate, endDate from database
        const apiSeasons = seasons;

        // Create season ID to season number mapping
        const seasonIdToNumberMap: Record<string, number> = {};
        apiSeasons.forEach((season) => {
            if (season.id && season.seasonNumber !== undefined && season.seasonNumber !== null) {
                seasonIdToNumberMap[season.id] = season.seasonNumber;
            }
        });

        console.log('📋 Seasons from API (with dates):', apiSeasons);
        console.log('🗺️ Season ID → Number mapping:', seasonIdToNumberMap);

        // Group player's matches by season using date ranges
        const seasonMap = new Map<string, LeagueMatch[]>();

        if (apiSeasons.length > 0) {
            // Sort seasons by startDate ascending for proper date matching
            const sortedSeasons = [...apiSeasons].sort((a, b) => {
                const dateA = a.startDate ? dayjs(a.startDate).valueOf() : 0;
                const dateB = b.startDate ? dayjs(b.startDate).valueOf() : 0;
                return dateA - dateB;
            });

            playerMatches.forEach(match => {
                const matchDate = dayjs(match.date);
                let matchSeasonId: string | null = (match as any).seasonId || null;

                // If match doesn't have seasonId, find season by date range
                if (!matchSeasonId) {
                    for (const season of sortedSeasons) {
                        const seasonStart = season.startDate ? dayjs(season.startDate) : null;
                        const seasonEnd = season.endDate ? dayjs(season.endDate) : null;

                        if (seasonStart && seasonEnd) {
                            if (matchDate.valueOf() >= seasonStart.valueOf() && matchDate.valueOf() <= seasonEnd.valueOf()) {
                                matchSeasonId = season.id;
                                break;
                            }
                        } else if (seasonStart && !seasonEnd) {
                            // Active season (no end date) - match is after start
                            if (matchDate.valueOf() >= seasonStart.valueOf()) {
                                matchSeasonId = season.id;
                                break;
                            }
                        }
                    }

                    // If still no match, assign to nearest season before match date
                    if (!matchSeasonId) {
                        const reverseSorted = [...sortedSeasons].reverse();
                        for (const season of reverseSorted) {
                            const seasonStart = season.startDate ? dayjs(season.startDate) : null;
                            if (seasonStart && matchDate.valueOf() >= seasonStart.valueOf()) {
                                matchSeasonId = season.id;
                                break;
                            }
                        }
                    }

                    // Last resort - assign to first season
                    if (!matchSeasonId && sortedSeasons.length > 0) {
                        matchSeasonId = sortedSeasons[0].id;
                    }
                }

                const finalSeasonId = matchSeasonId || 'unknown';

                // Always include all seasons without filtering by selectedSeason
                if (!seasonMap.has(finalSeasonId)) {
                    seasonMap.set(finalSeasonId, []);
                }
                seasonMap.get(finalSeasonId)!.push(match);
            });
        } else {
            // No seasons available - put all matches under a single group
            console.log('⚠️ No seasons found, showing all matches as one group');
            if (playerMatches.length > 0) {
                seasonMap.set('all-matches', playerMatches);
                seasonIdToNumberMap['all-matches'] = 1;
            }
        }

        // Ensure ALL seasons where user is a member appear, even with 0 matches
        if (apiSeasons.length > 0) {
            apiSeasons.forEach(season => {
                // Include season unless explicitly declined.
                if (!isSeasonExplicitlyDeclined(season) && !seasonMap.has(season.id)) {
                    seasonMap.set(season.id, []);
                    console.log(`📌 Added member season with 0 matches: Season ${season.seasonNumber} (${season.name})`);
                }
            });
        }

        console.log('📊 Seasons to display in popup (All Seasons):', {
            seasonsFound: Array.from(seasonMap.keys()),
            seasonCount: seasonMap.size,
            matchesPerSeason: Array.from(seasonMap.entries()).map(([id, matches]) => ({
                seasonId: id,
                seasonNumber: seasonIdToNumberMap[id] !== undefined ? seasonIdToNumberMap[id] : 'N/A',
                matchCount: matches.length,
                firstMatchDate: matches[0] ? dayjs(matches[0].date).format('MMM YYYY') : 'N/A'
            }))
        });

        // Calculate stats for each season where player participated
        const stats: SeasonStats[] = [];

        seasonMap.forEach((matches, seasonId) => {
            const totals = sumStatsFromMatches(matches);

            // Count MOTM votes
            const motmVotes = matches.reduce((acc, match) => {
                const votes = (match as any).votes || [];
                const votesForPlayer = votes.filter((vote: any) =>
                    String(vote.votedForId) === String(playerId)
                ).length;
                return acc + votesForPlayer;
            }, 0);

            // Count defensive impact
            const defensiveImpact = matches.filter(match => {
                const m = match as any;
                return sameId(m.homeDefensiveImpactId, playerId) || sameId(m.awayDefensiveImpactId, playerId);
            }).length;

            // Canonical total XP from backend per-match xpAwarded
            const totalXP = sumXPAwardedFromMatches(matches);

            // Get season info from state (fetched from API)
            const seasonInfo = seasons.find(s => sameId(s.id, seasonId));

            // Determine season number from mapping (built from API data)
            let seasonNumber: number;
            if (seasonIdToNumberMap[seasonId] !== undefined) {
                seasonNumber = seasonIdToNumberMap[seasonId];
            } else if (seasonInfo?.seasonNumber !== undefined && seasonInfo.seasonNumber !== null) {
                seasonNumber = seasonInfo.seasonNumber;
            } else {
                // Fallback
                seasonNumber = stats.length + 1;
            }

            const seasonName = seasonInfo?.name || `Season ${seasonNumber}`;

            // Determine if season is finished: isActive/active is false, or has endDate and endDate is in the past
            const seasonEndDate = seasonInfo?.endDate ? dayjs(seasonInfo.endDate) : null;
            const isFinished = seasonInfo
                ? (seasonInfo.isActive === false || seasonInfo.active === false || (seasonEndDate ? seasonEndDate.valueOf() < dayjs().valueOf() : false))
                : false;
            const endDateFormatted = seasonEndDate && seasonEndDate.isValid() ? seasonEndDate.format('MMM YYYY') : '';

            stats.push({
                seasonId,
                seasonName,
                seasonNumber,
                goals: totals.goals,
                assists: totals.assists,
                motmVotes,
                defensiveImpact,
                cleanSheets: totals.cleanSheets,
                totalXP,
                matches: matches.length,
                isFinished,
                endDateFormatted
            });
        });

        // Sort by season number descending (latest first)
        const sortedStats = stats.sort((a, b) => b.seasonNumber - a.seasonNumber);

        console.log('✅ Final season stats for popup:', sortedStats);

        return sortedStats;
    }, [careerData, data, leagueId, playerId, seasons, isSeasonExplicitlyDeclined]);

    const yearsOptions = useMemo(() => {
        const years = new Set<number>([dayjs().year()]);
        const addYear = (value: unknown) => {
            const numeric = Number(value);
            if (Number.isFinite(numeric) && numeric >= 1900 && numeric <= 3000) {
                years.add(Math.trunc(numeric));
            }
        };
        const addYearsFromPayload = (payload: unknown) => {
            const source = (payload || {}) as {
                allYears?: unknown[];
                years?: unknown[];
                leagues?: LeagueWithMatchesTyped[];
            };

            (source.allYears || []).forEach(addYear);
            (source.years || []).forEach(addYear);
            (source.leagues || []).forEach((league) => {
                if (!hasMatches(league)) return;
                (league.matches || []).forEach((m) => addYear(dayjs(m.date).year()));
            });
        };

        // Prefer the unfiltered career payload so the Year dropdown never collapses
        // to only the currently selected league's years.
        addYearsFromPayload(careerData);
        addYearsFromPayload(data);

        const fallbackLeaguesList = ((data?.leagues as LeagueWithMatchesTyped[] | undefined) ?? []);
        fallbackLeaguesList.forEach((league) => {
            if (!hasMatches(league)) return;
            (league.matches || []).forEach((m) => {
                addYear(dayjs(m.date).year());
            });
        });

        return ['all', ...Array.from(years).sort((a, b) => b - a).map(String)];
    }, [careerData, data]);

    // Helper: get latest league (by latest match date within the selected year)
    const getLatestLeagueIdForYear = (list: LeagueWithMatchesTyped[], y: string) => {
        let bestId: string | undefined;
        let bestTs = -Infinity;
        for (const l of list) {
            const ts = Math.max(
                ...((l.matches || [])
                    .filter(m => dayjs(m.date).year().toString() === y)
                    .map(m => dayjs(m.date).valueOf())),
            );
            if (Number.isFinite(ts) && ts > bestTs) {
                bestTs = ts;
                bestId = l.id;
            }
        }
        return bestId || list[0]?.id;
    };

    // On initial load, prefer preferredLeagueId; fallback to 'all'
    useEffect(() => {
        if (!data || !preferredLeagueLoaded || filtersInitialized.current) return;

        // Only set defaults once on first load
        if (!year) {
            dispatch(setYearFilter('all'));
        }
        const leaguesList = (data?.leagues || []) as LeagueWithMatchesTyped[];
        const preferredIsValid = Boolean(
            preferredLeagueId &&
            leaguesList.some((l) => sameId(l.id, preferredLeagueId) && isLeagueActiveForFilter(l))
        );
        const nextLeague = preferredIsValid ? String(preferredLeagueId) : (leagueId || 'all');
        if (nextLeague !== leagueId) {
            dispatch(setLeagueFilter(nextLeague));
        }

        filtersInitialized.current = true;
    }, [data, year, leagueId, preferredLeagueId, preferredLeagueLoaded, dispatch]);

    // Keep current league if still valid after year change; else reset to 'all'
    useEffect(() => {
        const list = leaguesForYear;
        if (!list.length) {
            if (leagueId !== 'all') dispatch(setLeagueFilter('all'));
            return;
        }
        if (leagueId === 'all') return;
        const stillValid = list.some(l => sameId(l.id, leagueId));
        if (!stillValid) {
            // If current league not valid for selected year, reset to 'all'
            dispatch(setLeagueFilter('all'));
        }
    }, [leaguesForYear, leagueId, dispatch]);

    useEffect(() => {
        if (!year || year === 'all') return;
        if (!yearsOptions.includes(year)) {
            dispatch(setYearFilter('all'));
        }
    }, [year, yearsOptions, dispatch]);

    const applyYearSelection = (val: string) => {
        setYearDropdownOpen(false);

        // compute valid leagues for the selected year
        const list = ((data?.leagues || []) as LeagueWithMatchesTyped[]).filter((l) =>
            isLeagueActiveForFilter(l) &&
            (val === 'all'
                ? hasMatches(l)
                : (l.matches || []).some(m => dayjs(m.date).year().toString() === val) ||
                (l.createdAt ? dayjs(l.createdAt).year().toString() === val : false) ||
                (l.updatedAt ? dayjs(l.updatedAt).year().toString() === val : false))
        );

        // preserve league if possible, else select latest league for that year (or 'all')
        let nextLeague = leagueId;
        if (val !== 'all') {
            if (nextLeague === 'all' || !list.some(l => sameId(l.id, nextLeague))) {
                nextLeague = list.length ? getLatestLeagueIdForYear(list, val) || 'all' : 'all';
            }
        } else if (!list.some(l => sameId(l.id, nextLeague))) {
            nextLeague = 'all';
        }

        dispatch(setYearFilter(val));
        if (nextLeague !== leagueId) dispatch(setLeagueFilter(nextLeague));
    };

    const handleYearSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        applyYearSelection(e.target.value);
    };

    const applyLeagueSelection = (value: string) => {
        setLeagueDropdownOpen(false);
        dispatch(setLeagueFilter(value));
        if (typeof window !== 'undefined' && value) {
            try {
                localStorage.setItem('preferredLeagueId', value);
                if (value !== 'all') {
                    const storedSeasonId = localStorage.getItem('preferredSeasonId_' + value);
                    if (storedSeasonId && storedSeasonId !== 'all') {
                        setSelectedSeason(storedSeasonId);
                    }
                }
            } catch {}
        }
    };

    const handleLeagueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        applyLeagueSelection(e.target.value);
    };

    const currentLeagueName =
        leagueId && leagueId !== 'all'
            ? leaguesForYear.find((l: LeagueWithMatchesTyped) => sameId(l.id, leagueId))?.name || 'Current League'
            : leaguesForYear[0]?.name || 'Current League';
    const historyXpLabel = 'Highest XP Points Received In A League';

    const playerName = fullPlayerData?.player?.name || 'Player';
    // const playerShirt = fullPlayerData?.player?.shirtNo || '';
    const playerPositionType = fullPlayerData?.player?.positionType || fullPlayerData?.player?.position || 'Player';
    const profileAvatarSrc = resolveProfileImageUrl(fullPlayerData?.player?.avatar || fullPlayerData?.player?.profilePicture || null);

    // Accumulative trophies via backend API with fallback to local computation
    const [trophyCounts, setTrophyCounts] = useState<Record<string, number>>({});
    const [trophiesLoading, setTrophiesLoading] = useState(false);

    // Player Badges/Rewards State
    type PlayerBadge = {
        id: string;
        title: string;
        count: number;
        xp: number;
        unlocked: boolean;
    };
    const [playerBadges, setPlayerBadges] = useState<PlayerBadge[]>([]);
    const [badgesLoading, setBadgesLoading] = useState(false);

    // History & Records State (fetched from backend)
    const [historyRecords, setHistoryRecords] = useState({
        longestWinStreak: 0,
        mostGoalsInLeague: 0,
        mostMotmInLeague: 0,
        longestWinMargin: '0-0',
        highestXpInLeague: 0
    });
    const [historyRecordsLoading, setHistoryRecordsLoading] = useState(false);

    // Local fallback counting
    const localCounts = useMemo(() => {
        const map: Record<string, number> = {};
        for (const a of allTrophyAwards) {
            map[a.key] = (map[a.key] || 0) + 1;
        }
        return map;
    }, [allTrophyAwards]);

    useEffect(() => {
        // Fetch trophies whenever selected filters change
        if (!playerId) return;
        let cancelled = false;
        setTrophiesLoading(true);

        console.log('🏆 [Trophies] Fetching with filters:', {
            playerId,
            leagueId: effectiveTrophiesLeagueId,
            year: effectiveTrophiesYear,
            selectedSeason: effectiveTrophiesSeasonId,
        });

        // Fetch trophies with filters
        playerAPI.getPlayerTrophies(String(playerId), effectiveTrophiesLeagueId, effectiveTrophiesYear, effectiveTrophiesSeasonId)
            .then(res => {
                if (cancelled) return;
                console.log('✅ [Trophies] Response:', res);
                if (res.success && res.data?.counts) setTrophyCounts(res.data.counts);
                else setTrophyCounts(localCounts);
            })
            .catch((err) => {
                console.error('❌ [Trophies] Error:', err);
                if (!cancelled) setTrophyCounts(localCounts);
            })
            .finally(() => { if (!cancelled) setTrophiesLoading(false); });
        return () => { cancelled = true; };
    }, [playerId, effectiveTrophiesLeagueId, effectiveTrophiesYear, effectiveTrophiesSeasonId, localCounts, refreshNonce]);

    // Fetch player badges/achievements
    useEffect(() => {
        console.log('🔥 [BADGES] useEffect triggered!', { playerId, hasToken: !!token, leagueId, year, selectedSeason });

        // Fetch badges whenever selected filters change
        if (!playerId) {
            console.warn('⚠️ [BADGES] No playerId - skipping');
            return;
        }

        if (!token) {
            console.warn('⚠️ [BADGES] No token - skipping');
            return;
        }

        let cancelled = false;
        setBadgesLoading(true);
        console.log('🔄 [BADGES] Starting badge fetch with filters:', { leagueId: effectiveRewardsLeagueId, year: effectiveRewardsYear, selectedSeason: effectiveRewardsSeasonId });

        // Build query params for effective filters
        const params = new URLSearchParams();
        if (effectiveRewardsLeagueId && effectiveRewardsLeagueId !== 'all') params.append('leagueId', effectiveRewardsLeagueId);
        if (effectiveRewardsYear && effectiveRewardsYear !== 'all') params.append('year', effectiveRewardsYear);
        if (effectiveRewardsSeasonId && effectiveRewardsSeasonId !== 'all') params.append('seasonId', effectiveRewardsSeasonId);
        const queryString = params.toString() ? `?${params.toString()}` : '';

        // Try player-specific endpoint first (supports leagueId/year/seasonId filters)
        // Fall back to /users/me/achievements only if that fails
        const endpoints = [
            `${process.env.NEXT_PUBLIC_API_URL}/players/${playerId}/achievements${queryString}`,
            `${process.env.NEXT_PUBLIC_API_URL}/users/me/achievements${queryString}`,
        ];

        console.log('📋 [BADGES] Will try endpoints:', endpoints);

        const tryFetch = async () => {
            for (let i = 0; i < endpoints.length; i++) {
                const endpoint = endpoints[i];
                try {
                    console.log(`🌐 [BADGES ${i + 1}/${endpoints.length}] Fetching from:`, endpoint);

                    // Use & if queryString exists, otherwise use ?
                    const cacheBuster = queryString ? `&_=${Date.now()}` : `?_=${Date.now()}`;
                    const res = await fetch(`${endpoint}${cacheBuster}`, {
                        credentials: 'include',
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    console.log(`📡 [BADGES ${i + 1}] Response status:`, res.status, res.statusText);

                    // Check if response is JSON before parsing
                    if (!res.ok) {
                        console.warn(`⚠️ [BADGES ${i + 1}] API returned error:`, res.status, res.statusText);
                        continue; // Try next endpoint
                    }

                    const contentType = res.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                        console.warn(`⚠️ [BADGES ${i + 1}] Response is not JSON:`, contentType);
                        continue; // Try next endpoint
                    }

                    const data = await res.json();
                    console.log(`📦 [BADGES ${i + 1}] Response data:`, data);

                    if (cancelled) {
                        console.log('🚫 [BADGES] Cancelled - exiting');
                        return;
                    }

                    if (res.ok && data?.success && Array.isArray(data.badges)) {
                        console.log(`✅ [BADGES ${i + 1}] Success! Raw badges:`, data.badges);

                        // Filter only unlocked badges with count > 0
                        const earnedBadges = data.badges
                            .filter((b: PlayerBadge) => {
                                const pass = b.unlocked && b.count > 0 && b.id !== 'rising_xp';
                                console.log(`  🔍 Badge ${b.id}: unlocked=${b.unlocked}, count=${b.count}, pass=${pass}`);
                                return pass;
                            })
                            .map((b: PlayerBadge) => ({
                                id: b.id,
                                title: b.title || b.id,
                                count: Number(b.count || 0),
                                xp: Number(b.xp || 0),
                                unlocked: Boolean(b.unlocked)
                            }));

                        console.log('🎖️ [BADGES] Final earned badges:', earnedBadges);
                        setPlayerBadges(earnedBadges);
                        setBadgesLoading(false);
                        return; // Success, exit
                    } else {
                        console.warn(`⚠️ [BADGES ${i + 1}] Invalid response:`, {
                            ok: res.ok,
                            success: data?.success,
                            hasBadges: Array.isArray(data?.badges),
                            badgesLength: data?.badges?.length
                        });
                    }
                } catch (err) {
                    console.error(`❌ [BADGES ${i + 1}] Error:`, err);
                    continue; // Try next endpoint
                }
            }

            // All endpoints failed
            if (!cancelled) {
                console.error('💥 [BADGES] All endpoints failed!');
                setPlayerBadges([]);
                setBadgesLoading(false);
            }
        };

        tryFetch();

        return () => {
            console.log('🧹 [BADGES] Cleanup');
            cancelled = true;
        };
    }, [playerId, token, effectiveRewardsLeagueId, effectiveRewardsYear, effectiveRewardsSeasonId, refreshNonce]);

    // Fetch history records from backend with filters
    useEffect(() => {
        // Fetch history whenever selected filters change
        if (!playerId) return;
        let cancelled = false;
        setHistoryRecordsLoading(true);

        console.log('🔍 [History Records] Fetching with filters:', {
            playerId,
            leagueId: effectiveHistoryLeagueId,
            year: effectiveHistoryYear,
            selectedSeason: effectiveHistorySeasonId,
        });

        playerAPI.getPlayerHistoryRecords(String(playerId), effectiveHistoryLeagueId, effectiveHistoryYear, effectiveHistorySeasonId)
            .then(res => {
                if (cancelled) return;
                console.log('✅ [History Records] Response:', res);
                if (res.success && res.data) {
                    setHistoryRecords(res.data);
                }
            })
            .catch((err) => {
                console.error('❌ [History Records] Error:', err);
            })
            .finally(() => {
                if (!cancelled) setHistoryRecordsLoading(false);
            });

        return () => { cancelled = true; };
    }, [playerId, effectiveHistoryLeagueId, effectiveHistoryYear, effectiveHistorySeasonId, refreshNonce]);

    const earnedTrophies = useMemo(() => {
        // Aggregate counts for duplicate keys (e.g., 'Champion Footballer' + 'League Champion')
        const aggregatedCounts: Record<string, number> = {};

        // Map legacy keys to their canonical key
        const keyMapping: Record<string, string> = {
            'Champion Footballer': 'League Champion',
            'League Champion': 'League Champion',
            'Runner Up': 'Runner-Up',
            'Runner-Up': 'Runner-Up',
            "Ballon d'Or": "Ballon d'Or",
            "Ballon D'or": "Ballon d'Or",
            'Golden Boot': 'Golden Boot',
            'King Playmaker': 'King Playmaker',
            'Legendary Shield': 'Legendary Shield',
            'The Dark Horse': 'The Dark Horse',
            'Dark Horse': 'The Dark Horse',
            'Star Keeper': 'Star Keeper',
        };

        // Sum up counts for each canonical key
        Object.entries(trophyCounts).forEach(([key, count]) => {
            const canonicalKey = keyMapping[key] || key;
            aggregatedCounts[canonicalKey] = (aggregatedCounts[canonicalKey] || 0) + count;
        });

        // Return trophies in fixed order, only those with count > 0
        return orderedTrophyKeys
            .filter(key => aggregatedCounts[key] > 0)
            .map(key => ({
                key,
                image: trophyDetails[key]?.image,
                label: trophyDetails[key]?.label || key,
                count: aggregatedCounts[key]
            }));
    }, [trophyCounts]);

    const loading = reduxLoading && !data;

    return (
        <Box sx={{ minHeight: '100vh', color: '#fff', overflowX: 'hidden' }}>
            <style jsx global>{`
                .filter-select-wrapper {
                    position: relative;
                    display: inline-block;
                }
                .filter-select-wrapper::after {
                    content: '';
                    position: absolute;
                    right: 14px;
                    top: 50%;
                    width: 0;
                    height: 0;
                    border-left: 6px solid transparent;
                    border-right: 6px solid transparent;
                    border-top: 8px solid #fff;
                    transform: translateY(-50%);
                    pointer-events: none;
                    transition: transform 0.3s ease;
                }
                .filter-select-wrapper.open::after {
                    transform: translateY(-50%) rotate(180deg);
                }
                .filter-select {
                    transition: all 0.2s ease;
                }
            `}</style>
            {/* Header Section */}
            <Box sx={{
                mt: 0,
                mb: { sm: 0, xs: 0, md: 4 },
                width: '100vw',
                position: 'relative',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#0e0e0e',
                zIndex: 20,
            }}>
                <Paper sx={{
                    px: 0,
                    py: { xs: 2, md: 3.5 },
                    background: '#0E0E0E',
                    color: 'white',
                    boxShadow: 'none',
                    minHeight: { xs: 'var(--header-mobile-min-height)', md: 'auto' },
                    position: 'relative',
                    zIndex: 10,
                }}>
                    {/* Centered Title */}
                    <Box sx={{
                        display: { xs: 'none', md: 'flex' },
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pt: { xs: 1, md: 2 },
                        pb: 2,
                    }}>
                        <Typography
                            variant="h2"
                            component="h1"
                            sx={{
                                fontWeight: 700,
                                color: '#fff',
                                fontSize: { xs: '32px', sm: '42px', md: '55px' },
                                textTransform: 'uppercase',
                                letterSpacing: 0,
                                textAlign: 'center',
                                fontFamily: 'var(--font-oswald), "Oswald", sans-serif !important',
                                lineHeight: '100%',
                            }}
                        >
                            {getCms('page_player_stats_heading', 'PLAYER STATS')}
                        </Typography>
                    </Box>

                    {/* Orange divider under header */}
                    <Box
                        sx={{
                            display: { xs: 'none', md: 'block' },
                            height: 'var(--header-divider-height)',
                            bgcolor: 'var(--header-divider-color)',
                            mt: { xs: 2, md: 4.5 },
                            width: '100vw',
                            position: 'relative',
                            left: '50%',
                            transform: 'translateX(-50%)',
                        }}
                    />

                    {/* Search and Filters Section */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: { xs: 2, md: 3 },
                        px: { xs: 2, md: 4 },
                        py: { xs: 1.5, md: 1.3 },
                        maxWidth: '1230px',
                        mx: 'auto',
                        position: 'relative',
                        zIndex: 10,
                    }}>
                        {/* Search Input */}
                        <Box
                            ref={searchWrapperRef}
                            sx={{
                                width: { xs: '100%', md: 460 },
                                minWidth: { md: 300 },
                                maxWidth: { md: 480 },
                                ml: { xs: 0, md: 0.8 },
                                position: 'relative',
                                zIndex: 20,
                                mt: { xs: -2, md: 0 }
                            }}
                        >
                            <TextField
                                variant="outlined"
                                placeholder={getCms('page_player_stats_search_placeholder', 'Search player name and hit enter...')}
                                value={search}
                                onFocus={() => {
                                    setShowTeammatePanel(true);
                                    if (!searchTriggered && !teammatesLoading) {
                                        void fetchTeammates();
                                    }
                                }}
                                onClick={() => {
                                    setShowTeammatePanel(true);
                                    if (!searchTriggered && !teammatesLoading) {
                                        void fetchTeammates();
                                    }
                                }}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    if (!showTeammatePanel) setShowTeammatePanel(true);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (!searchTriggered) void fetchTeammates();
                                        setShowTeammatePanel(true);
                                        return;
                                    }
                                    if (e.key === 'Escape') {
                                        setShowTeammatePanel(false);
                                    }
                                }}
                                sx={{
                                    width: { xs: '100%', md: '100%' },
                                    '& .MuiOutlinedInput-root': {
                                        height: { xs: 38, sm: 42 },
                                        color: 'white',
                                        backgroundColor: 'transparent',
                                        borderRadius: '3px',
                                        '& fieldset': { borderColor: '#e56a16', borderWidth: 1.5 },
                                        '&:hover fieldset': { borderColor: '#e56a16' },
                                        '&.Mui-focused fieldset': { borderColor: '#e56a16' }
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'white',
                                        fontSize: { xs: 14, sm: 16.5 },
                                        py: 0.5,
                                        '&::placeholder': { color: '#fff', opacity: 1 }
                                    }
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <Box sx={{ mr: 3, ml: 0.5, display: 'flex', alignItems: 'center' }}>
                                            <Image src={SearchIcon} alt="Search" width={25} height={25} />
                                        </Box>
                                    ),
                                }}
                            />

                            {showTeammatePanel && (
                                <Paper
                                    elevation={6}
                                    sx={{
                                        position: 'absolute',
                                        top: 'calc(100% + 4px)',
                                        left: 0,
                                        right: 0,
                                        zIndex: 100000,
                                        mt: 0,
                                        maxHeight: 320,
                                        overflowY: 'auto',
                                        borderRadius: 2,
                                        background: '#1f1f1f',
                                        backgroundColor: '#1f1f1f',
                                        boxShadow: '0 12px 40px rgba(0,0,0,0.85)',
                                        border: '1px solid rgba(255,255,255,0.25)',
                                        p: 1.25,
                                        '&::-webkit-scrollbar': { width: 6 },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: 'rgba(255,255,255,0.25)',
                                            borderRadius: 3
                                        },
                                    }}
                                >
                                    <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 13, mb: 0.75 }}>
                                        {leagueId === 'all' ? 'Players across selected leagues' : 'Players in selected league'}
                                    </Typography>

                                    {teammatesLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                            <CircularProgress size={22} />
                                        </Box>
                                    ) : !searchTriggered ? (
                                        <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                                            Press Enter to search players you have played with.
                                        </Typography>
                                    ) : teammates.length === 0 ? (
                                        <Typography className="empty-state-message" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                                            No player data found for this filter.
                                        </Typography>
                                    ) : filteredTeammates.length === 0 ? (
                                        <Typography className="empty-state-message" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                                            This player name is not found in selected league filters.
                                        </Typography>
                                    ) : (
                                        <Grid container spacing={0.75}>
                                            {filteredTeammates.map((p) => {
                                                const displayName =
                                                    p.name ||
                                                    `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() ||
                                                    'Player';
                                                const teammateAvatarSrc = resolveProfileImageUrl(p.avatar);

                                                return (
                                                    <Grid item xs={12} key={p.id}>
                                                        <Box
                                                            onClick={() => {
                                                                setShowTeammatePanel(false);
                                                                router.push(`/player/${p.id}`);
                                                            }}
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1,
                                                                p: 0.75,
                                                                borderRadius: 1.5,
                                                                cursor: 'pointer',
                                                                bgcolor: 'rgba(255,255,255,0.07)',
                                                                transition: 'background .2s',
                                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                                                            }}
                                                        >
                                                            <Avatar
                                                                src={teammateAvatarSrc ?? undefined}
                                                                alt={displayName}
                                                                sx={{
                                                                    width: 34,
                                                                    height: 34,
                                                                    border: '1px solid rgba(255,255,255,0.25)',
                                                                    overflow: 'hidden',
                                                                    flexShrink: 0,
                                                                    bgcolor: teammateAvatarSrc ? 'transparent' : getAvatarBackgroundColor(displayName),
                                                                    color: '#fff',
                                                                    fontSize: 12,
                                                                    fontWeight: 800,
                                                                    textTransform: 'uppercase',
                                                                    '& .MuiAvatar-img': {
                                                                        width: '100% !important',
                                                                        height: '100% !important',
                                                                        objectFit: 'cover',
                                                                        display: 'block',
                                                                    },
                                                                }}
                                                            >
                                                                {!teammateAvatarSrc && getAvatarInitials({
                                                                    name: displayName,
                                                                    firstName: p.firstName,
                                                                    lastName: p.lastName,
                                                                })}
                                                            </Avatar>

                                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                                <Typography
                                                                    noWrap
                                                                    sx={{
                                                                        color: '#E5E7EB',
                                                                        fontWeight: 700,
                                                                        fontSize: 13,
                                                                        lineHeight: 1.15,
                                                                    }}
                                                                >
                                                                    {displayName}
                                                                </Typography>
                                                                {p.position && (
                                                                    <Typography
                                                                        sx={{
                                                                            color: '#9CA3AF',
                                                                            fontSize: 11,
                                                                            lineHeight: 1.1,
                                                                        }}
                                                                    >
                                                                        {getPositionShortForm(p.position)}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                );
                                            })}
                                        </Grid>
                                    )}
                                </Paper>
                            )}
                        </Box>

                        {/* Filter Buttons */}
                        <Box
                            sx={{
                                display: { xs: 'grid', md: 'flex' },
                                gridTemplateColumns: { xs: 'repeat(4, minmax(0, 1fr))', md: 'none' },
                                gap: 0.5,
                                flexWrap: 'nowrap',
                                justifyContent: { xs: 'center', md: 'flex-end' },
                                width: { xs: '100%', md: 'auto' },
                                overflowX: { xs: 'visible', md: 'visible' },
                                '&::-webkit-scrollbar': { display: 'none' },
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                            }}
                        >
                            {/* Year Filter */}
                            <div className={`filter-select-wrapper${yearDropdownOpen ? ' open' : ''}`} style={{ width: isDesktop ? 150 : '100%' }}>
                                {isDesktop ? (
                                    <select
                                        className="filter-select"
                                        value={year || 'all'}
                                        onChange={handleYearSelect}
                                        onMouseDown={() => setYearDropdownOpen(true)}
                                        onBlur={() => setTimeout(() => setYearDropdownOpen(false), 100)}
                                        style={{
                                            height: '39px',
                                            padding: '0 28px 0 12px',
                                            marginLeft: 0,
                                            backgroundColor: 'transparent',
                                            color: '#fff',
                                            border: '1.5px solid #e56a16',
                                            borderRadius: '24px',
                                            fontSize: '17px',
                                            cursor: 'pointer',
                                            outline: 'none',
                                            width: '100%',
                                            display: 'block',
                                            boxSizing: 'border-box',
                                            appearance: 'none',
                                            WebkitAppearance: 'none',
                                            MozAppearance: 'none',
                                            fontWeight: 400,
                                            // overflow: 'hidden',
                                            // textOverflow: 'ellipsis',
                                            // whiteSpace: 'nowrap',
                                        }}
                                    >
                                        <option value="all" style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>{getCms('page_player_stats_year_placeholder', 'All Years')}</option>
                                        {yearsOptions.filter(y => y !== 'all').map(y => (
                                            <option key={y} value={y} style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>{y}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <>
                                        <button
                                            ref={yearFilterButtonRef}
                                            type="button"
                                            onClick={() => setYearDropdownOpen((prev) => !prev)}
                                            style={{
                                                height: '34px',
                                                padding: '0 20px 0 7px',
                                                marginLeft: 0,
                                                backgroundColor: 'transparent',
                                                color: '#fff',
                                                border: '1.5px solid #e56a16',
                                                borderRadius: '24px',
                                                fontSize: '11px',
                                                cursor: 'pointer',
                                                outline: 'none',
                                                width: '100%',
                                                fontWeight: 600,
                                                textAlign: 'left',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {year && year !== 'all' ? year : getCms('page_player_stats_year_placeholder', 'All Years')}
                                        </button>
                                        <Menu
                                            anchorEl={yearFilterButtonRef.current}
                                            open={yearDropdownOpen}
                                            onClose={() => setYearDropdownOpen(false)}
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                            PaperProps={{
                                                sx: {
                                                    mt: 0.5,
                                                    borderRadius: 1,
                                                    border: '1px solid rgba(255,255,255,0.25)',
                                                    backgroundColor: '#1a1a1a',
                                                    minWidth: yearFilterButtonRef.current?.offsetWidth || 148,
                                                    width: 'max-content',
                                                    maxWidth: '90vw',
                                                }
                                            }}
                                            MenuListProps={{ sx: { py: 0 } }}
                                        >
                                            {['all', ...yearsOptions.filter(y => y !== 'all')].map((value) => (
                                                <MenuItem
                                                    key={value}
                                                    selected={(year || 'all') === value}
                                                    onClick={() => applyYearSelection(value)}
                                                    sx={{
                                                        color: '#fff',
                                                        fontSize: 13,
                                                        minHeight: 34,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        '&.Mui-selected': { backgroundColor: '#2b66bd' },
                                                        '&.Mui-selected:hover': { backgroundColor: '#2b66bd' },
                                                    }}
                                                >
                                                     {value === 'all' ? getCms('page_player_stats_year_placeholder', 'All Years') : value}
                                                </MenuItem>
                                            ))}
                                        </Menu>
                                    </>
                                )}
                            </div>

                            {/* League Filter */}
                            <div className={`filter-select-wrapper${leagueDropdownOpen ? ' open' : ''}`} style={{ width: isDesktop ? 150 : '100%' }}>
                                <button
                                    ref={leagueFilterButtonRef}
                                    type="button"
                                    onClick={() => setLeagueDropdownOpen((prev) => !prev)}
                                    style={{
                                        height: isDesktop ? '39px' : '34px',
                                        padding: isDesktop ? '0 29px 0 12px' : '0 20px 0 7px',
                                        marginLeft: 0,
                                        backgroundColor: 'transparent',
                                        color: '#fff',
                                        border: '1.5px solid #e56a16',
                                        borderRadius: '24px',
                                        fontSize: isDesktop ? '17px' : '11px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        width: '100%',
                                        fontWeight: isDesktop ? 400 : 600,
                                        textAlign: 'left',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mr: 1 }}>
                                        {leagueId && leagueId !== 'all'
                                            ? (() => {
                                                const sel = leagues.find((l) => sameId(l.id, leagueId));
                                                if (!sel) return getCms('page_player_stats_league_placeholder', 'Select League');
                                                const tag = getLeagueRoleTag(sel, playerId);
                                                return `${sel.name || 'League'} (${tag})`;
                                              })()
                                            : getCms('page_all_leagues_select_placeholder', 'All Leagues')}
                                    </Box>
                                    {/* <ChevronDown size={isDesktop ? 16 : 12} style={{ flexShrink: 0, color: '#9CA3AF' }} /> */}
                                </button>
                                <Menu
                                    anchorEl={leagueFilterButtonRef.current}
                                    open={leagueDropdownOpen}
                                    onClose={() => setLeagueDropdownOpen(false)}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                    marginThreshold={0}
                                    MenuListProps={{
                                        sx: {
                                            maxHeight: { xs: 260, sm: 320 },
                                            overflowY: 'auto',
                                            overflowX: 'hidden',
                                            scrollbarWidth: 'thin',
                                            '&::-webkit-scrollbar': {
                                                width: '8px',
                                            },
                                            '&::-webkit-scrollbar-track': {
                                                background: 'rgba(255,255,255,0.08)',
                                            },
                                            '&::-webkit-scrollbar-thumb': {
                                                background: 'rgba(255,255,255,0.35)',
                                                borderRadius: '999px',
                                            },
                                        },
                                    }}
                                    PaperProps={{
                                        sx: {
                                            p: 0.5,
                                            mt: 1,
                                            minWidth: leagueFilterButtonRef.current?.offsetWidth || 150,
                                            width: 'max-content',
                                            maxWidth: { xs: '92vw', sm: 'none' },
                                            bgcolor: 'rgba(15,15,15,0.92)',
                                            color: '#E5E7EB',
                                            borderRadius: 2.5,
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            backdropFilter: 'blur(10px)',
                                            boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.03)',
                                            overflow: 'hidden',
                                        }
                                    }}
                                >
                                    <MenuItem
                                        onClick={() => applyLeagueSelection('all')}
                                        sx={{
                                            borderRadius: 1.5,
                                            mx: 0.5,
                                            my: 0.25,
                                            py: 1.25,
                                            px: 1.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            color: '#E5E7EB',
                                            transition: 'all 0.2s ease',
                                            background: (leagueId || 'all') === 'all' ? 'linear-gradient(90deg, rgba(3,136,227,0.25) 0%, rgba(3,136,227,0.10) 100%)' : 'transparent',
                                            border: (leagueId || 'all') === 'all' ? '1px solid rgba(3,136,227,0.35)' : 'none',
                                            '&:hover': {
                                                transform: 'translateY(-1px)',
                                                background: 'linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                                            },
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <Trophy size={16} color={(leagueId || 'all') === 'all' ? '#FFFFFF' : '#9CA3AF'} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="All Leagues"
                                            sx={{
                                                '& .MuiListItemText-primary': {
                                                    fontSize: '0.95rem',
                                                    fontWeight: (leagueId || 'all') === 'all' ? 700 : 500,
                                                    letterSpacing: 0.2,
                                                    color: (leagueId || 'all') === 'all' ? '#FFFFFF' : '#E5E7EB'
                                                }
                                            }}
                                        />
                                    </MenuItem>
                                    {[...dropdownLeagues].sort((a, b) => {
                                        const an = (a?.name ?? '').toString().trim().toLowerCase();
                                        const bn = (b?.name ?? '').toString().trim().toLowerCase();
                                        if (an < bn) return -1;
                                        if (an > bn) return 1;
                                        return String(a.id).localeCompare(String(b.id));
                                    }).map((leagueItem) => {
                                        const isActive = sameId((leagueId || 'all'), leagueItem.id);
                                        return (
                                            <MenuItem
                                                key={leagueItem.id}
                                                onClick={() => applyLeagueSelection(leagueItem.id)}
                                                sx={{
                                                    borderRadius: 1.5,
                                                    mx: 0.5,
                                                    my: 0.25,
                                                    py: 1.25,
                                                    px: 1.5,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    color: '#E5E7EB',
                                                    transition: 'all 0.2s ease',
                                                    background: isActive ? 'linear-gradient(90deg, rgba(3,136,227,0.25) 0%, rgba(3,136,227,0.10) 100%)' : 'transparent',
                                                    border: isActive ? '1px solid rgba(3,136,227,0.35)' : 'none',
                                                    '&:hover': {
                                                        transform: 'translateY(-1px)',
                                                        background: 'linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                                                    },
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    <Trophy size={16} color={isActive ? '#FFFFFF' : '#9CA3AF'} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={leagueItem.name}
                                                    sx={{
                                                        '& .MuiListItemText-primary': {
                                                            fontSize: '0.95rem',
                                                            fontWeight: isActive ? 700 : 500,
                                                            letterSpacing: 0.2,
                                                            color: isActive ? '#FFFFFF' : '#E5E7EB'
                                                        }
                                                    }}
                                                />
                                                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    {(() => {
                                                        const roleTag = getLeagueRoleTag(leagueItem, playerId);
                                                        return (
                                                            <Box
                                                                sx={{
                                                                    px: 1,
                                                                    py: 0.25,
                                                                    bgcolor: roleTag === 'Admin' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.15)',
                                                                    color: roleTag === 'Admin' ? '#1F2937' : '#FFFFFF',
                                                                    borderRadius: '9999px',
                                                                    fontSize: 10,
                                                                    fontWeight: 700,
                                                                    letterSpacing: 0.3,
                                                                    textTransform: 'uppercase',
                                                                }}
                                                            >
                                                                {roleTag}
                                                            </Box>
                                                        );
                                                    })()}
                                                </Box>
                                            </MenuItem>
                                        );
                                    })}
                                </Menu>
                            </div>

                            {/* Season Filter */}
                            <div className={`filter-select-wrapper${seasonDropdownOpen ? ' open' : ''}`} style={{ width: isDesktop ? 150 : '100%' }}>
                                {isDesktop ? (
                                    <select
                                        className="filter-select"
                                        value={selectedSeason}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setSelectedSeason(val);
                                            setSeasonDropdownOpen(false);
                                            if (val !== 'all') {
                                                try {
                                                    localStorage.setItem('preferredSeasonId', val);
                                                    if (leagueId && leagueId !== 'all') {
                                                        localStorage.setItem('preferredSeasonId_' + leagueId, val);
                                                    }
                                                } catch {}
                                            }
                                        }}
                                        onMouseDown={() => {
                                            if (leagueId !== 'all') {
                                                setSeasonDropdownOpen(true);
                                            }
                                        }}
                                        onBlur={() => setTimeout(() => setSeasonDropdownOpen(false), 100)}
                                        disabled={leagueId === 'all'}
                                        style={{
                                            height: '39px',
                                            padding: '0 29px 0 12px',
                                            marginLeft: 0,
                                            backgroundColor: 'transparent',
                                            color: '#fff',
                                            border: '1.5px solid #e56a16',
                                            borderRadius: '24px',
                                            fontSize: '17px',
                                            cursor: leagueId === 'all' ? 'not-allowed' : 'pointer',
                                            outline: 'none',
                                            width: '100%',
                                            display: 'block',
                                            boxSizing: 'border-box',
                                            opacity: leagueId === 'all' ? 0.6 : 1,
                                            appearance: 'none',
                                            WebkitAppearance: 'none',
                                            MozAppearance: 'none',
                                            fontWeight: 400,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        <option value="all" style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>{getCms('page_player_stats_season_placeholder', 'All Seasons')}</option>
                                        {seasons.map((season) => (
                                            <option key={season.id} value={season.id} style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
                                                {season.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <>
                                        <button
                                            ref={seasonFilterButtonRef}
                                            type="button"
                                            onClick={() => {
                                                if (leagueId !== 'all') {
                                                    setSeasonDropdownOpen((prev) => !prev);
                                                }
                                            }}
                                            disabled={leagueId === 'all'}
                                            style={{
                                                height: '34px',
                                                padding: '0 20px 0 7px',
                                                marginLeft: 0,
                                                backgroundColor: 'transparent',
                                                color: '#fff',
                                                border: '1.5px solid #e56a16',
                                                borderRadius: '24px',
                                                fontSize: '11px',
                                                cursor: leagueId === 'all' ? 'not-allowed' : 'pointer',
                                                outline: 'none',
                                                width: '100%',
                                                opacity: leagueId === 'all' ? 0.6 : 1,
                                                fontWeight: 600,
                                                textAlign: 'left',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {selectedSeason === 'all'
                                                ? getCms('page_player_stats_season_placeholder', 'All Seasons')
                                                : (seasons.find((season) => sameId(season.id, selectedSeason))?.name || getCms('page_player_stats_season_placeholder', 'All Seasons'))}
                                        </button>
                                        <Menu
                                            anchorEl={seasonFilterButtonRef.current}
                                            open={seasonDropdownOpen && leagueId !== 'all'}
                                            onClose={() => setSeasonDropdownOpen(false)}
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                            PaperProps={{
                                                sx: {
                                                    mt: 0.5,
                                                    borderRadius: 1,
                                                    border: '1px solid rgba(255,255,255,0.25)',
                                                    backgroundColor: '#1a1a1a',
                                                    minWidth: seasonFilterButtonRef.current?.offsetWidth || 148,
                                                    width: 'max-content',
                                                    maxWidth: '90vw',
                                                }
                                            }}
                                            MenuListProps={{ sx: { py: 0 } }}
                                        >
                                            <MenuItem
                                                selected={selectedSeason === 'all'}
                                                onClick={() => {
                                                    setSelectedSeason('all');
                                                    setSeasonDropdownOpen(false);
                                                }}
                                                sx={{
                                                    color: '#fff',
                                                    fontSize: 13,
                                                    minHeight: 34,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    '&.Mui-selected': { backgroundColor: '#2b66bd' },
                                                    '&.Mui-selected:hover': { backgroundColor: '#2b66bd' },
                                                }}
                                            >
                                                 {getCms('page_player_stats_season_placeholder', 'All Seasons')}
                                            </MenuItem>
                                            {seasons.map((season) => (
                                                <MenuItem
                                                    key={season.id}
                                                    selected={sameId(selectedSeason, season.id)}
                                                    onClick={() => {
                                                        setSelectedSeason(season.id);
                                                        setSeasonDropdownOpen(false);
                                                        if (season.id !== 'all') {
                                                            try {
                                                                localStorage.setItem('preferredSeasonId', season.id);
                                                                if (leagueId && leagueId !== 'all') {
                                                                    localStorage.setItem('preferredSeasonId_' + leagueId, season.id);
                                                                }
                                                            } catch {}
                                                        }
                                                    }}
                                                    sx={{
                                                        color: '#fff',
                                                        fontSize: 13,
                                                        minHeight: 34,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        '&.Mui-selected': { backgroundColor: '#2b66bd' },
                                                        '&.Mui-selected:hover': { backgroundColor: '#2b66bd' },
                                                    }}
                                                >
                                                    {season.name}
                                                </MenuItem>
                                            ))}
                                        </Menu>
                                    </>
                                )}
                            </div>

                            {/* Clear Button */}
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    dispatch(setYearFilter('all'));
                                    dispatch(setLeagueFilter('all'));
                                    setSearch('');
                                    setSelectedSeason('all');
                                    setSeasons([]);
                                    setTeammates([]);
                                    setSearchTriggered(false);
                                    setShowTeammatePanel(false);
                                    lastFetchKeyRef.current = '';
                                }}
                                sx={{
                                    color: 'white',
                                    height: { xs: 34, md: 39 },
                                    borderRadius: 6,
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    borderWidth: '3px',
                                    px: 2.5,
                                    py: 1,
                                    width: { xs: '100%', sm: 'auto' },
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                    '&:hover': {
                                        borderColor: 'rgba(255,255,255,0.5)',
                                        borderWidth: '3px',
                                        bgcolor: 'rgba(255,255,255,0.05)'
                                    }
                                }}
                            >
                                {getCms('page_player_stats_clear_btn', 'Clear')}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>

            <PlayerOverviewContainer
                loading={loading}
                reduxError={reduxError}
                playerId={playerId ? String(playerId) : null}
                leagueId={leagueId}
                year={year}
                onRetry={() => playerId && dispatch(fetchPlayerStats({ playerId: String(playerId), leagueId, year }))}
                playerName={playerName}
                playerPositionType={playerPositionType}
                profileAvatarSrc={profileAvatarSrc}
                xp={xp}
                xpLoading={xpLoading}
                pageXpStatusTier={pageXpStatusTier}
                pageXpStatusTextColor={pageXpStatusTextColor}
                pageXpProgressToMax={pageXpProgressToMax}
                PAGE_XP_MAX_POINTS={PAGE_XP_MAX_POINTS}
                isMobile={isMobile}
                onOpenStatsModal={() => setStatsModalOpen(true)}
                onNavigateCareer={() => playerId && router.push(`/player/${playerId}/career`)}
                activeTab={activeTab}
                onTabClick={handleTabClick}
                displayedStatsMatches={displayedStatsMatches}
                displayedStatsTotals={displayedStatsTotals}
                displayedMotmVotes={displayedMotmVotes}
                displayedDefensiveImpact={displayedDefensiveImpact}
                displayXp={displayXp}
                CARD_BG={CARD_BG}
                TEAL_PRIMARY={TEAL_PRIMARY}
                trophiesCardRef={trophiesCardRef}
                trophiesLoading={trophiesLoading}
                earnedTrophies={earnedTrophies}
                TROPHY_ICON_FRAME_SIZE={TROPHY_ICON_FRAME_SIZE}
                getTrophyIconSize={getTrophyIconSize}
                rewardsCardRef={rewardsCardRef}
                badgesLoading={badgesLoading}
                playerBadges={playerBadges}
                historyCardRef={historyCardRef}
                historyRecordsLoading={historyRecordsLoading}
                historyRecords={historyRecords}
                historyXpLabel={historyXpLabel}
                getCms={getCms}
            />

            {/* Stats Over Season Modal */}
            <Dialog
                open={statsModalOpen}
                onClose={() => setStatsModalOpen(false)}
                fullWidth
                scroll="paper"
                maxWidth={false}
                sx={{
                    '& .MuiDialog-container': {
                        alignItems: 'center',
                    },
                }}
                PaperProps={{
                    sx: {
                        bgcolor: '#e8e4e0',
                        borderRadius: { xs: '10px', sm: '8px' },
                        border: '2px solid #3a3a3a',
                        overflow: 'hidden',
                        width: { xs: 'calc(100% - 16px)', sm: '100%' },
                        maxWidth: '1020px',
                        m: { xs: 1, sm: 2 },
                        maxHeight: { xs: 'calc(100dvh - 16px)', sm: 'calc(100dvh - 32px)' },
                        display: 'flex',
                        flexDirection: 'column',
                        height: 'auto',
                    }
                }}
            >
                {/* Header bar */}
                <DialogTitle sx={{
                    bgcolor: '#d9d9d9',
                    color: '#000',
                    py: { xs: 1.2, md: 1.45 },
                    px: { xs: 1.25, md: 2 },
                    pr: { xs: 5.5, md: 7 },
                    minHeight: 'auto',
                    position: 'relative',
                    borderBottom: '1px solid #bdb8b3',
                }}>
                    {isMobile ? (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.95, minWidth: 0, pr: 4.4 }}>
                            <Image
                                src={TrofiiImg}
                                alt="Trophy"
                                width={18}
                                height={18}
                                style={{ objectFit: 'contain', marginTop: 2, filter: 'brightness(0) saturate(100%) invert(17%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(90%)' }}
                            />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.15, minWidth: 0 }}>
                                <Typography sx={{ fontFamily: 'var(--font-woodford-bourne-pro), sans-serif', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.62px', color: '#222', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {currentLeagueName}
                                </Typography>
                                <Typography sx={{ fontFamily: 'var(--font-woodford-bourne-pro), sans-serif', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.58px', color: '#3d3d3d', lineHeight: 1.2 }}>
                                    STATS OVER SEASONS
                                </Typography>
                                <Typography sx={{ fontFamily: 'var(--font-woodford-bourne-pro), sans-serif', fontWeight: 800, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.55px', color: '#1f1f1f', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {playerName.toUpperCase()}
                                </Typography>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, minWidth: 0, pr: 6 }}>
                            <Image
                                src={TrofiiImg}
                                alt="Trophy"
                                width={28}
                                height={28}
                                style={{ objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(17%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(90%)' }}
                            />
                            <Typography sx={{ fontFamily: 'var(--font-woodford-bourne-pro), sans-serif', fontWeight: 800, fontSize: 19, textTransform: 'uppercase', letterSpacing: '0.9px', color: '#222', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '34%' }}>
                                {currentLeagueName}
                            </Typography>
                            <Typography sx={{ color: '#777', fontSize: 18, lineHeight: 1 }}>|</Typography>
                            <Typography sx={{ fontFamily: 'var(--font-woodford-bourne-pro), sans-serif', fontWeight: 700, fontSize: 17, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#3d3d3d', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                                STATS OVER SEASONS
                            </Typography>
                            <Typography sx={{ color: '#777', fontSize: 18, lineHeight: 1 }}>|</Typography>
                            <Typography sx={{ fontFamily: 'var(--font-woodford-bourne-pro), sans-serif', fontWeight: 800, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.85px', color: '#1f1f1f', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '34%' }}>
                                {playerName.toUpperCase()}
                            </Typography>
                        </Box>
                    )}
                    <IconButton
                        onClick={() => setStatsModalOpen(false)}
                        sx={{ color: '#555', bgcolor: '#e6e6e6', borderRadius: '3px', '&:hover': { color: '#000', bgcolor: '#e6e6e6' }, position: 'absolute', right: { xs: 6, md: 10 }, top: { xs: 6, md: 7 } }}
                    >
                        <CloseIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{
                    bgcolor: '#f2f2f2',
                    px: { xs: 1.25, sm: 2.5, md: 5 },
                    py: { xs: 2, md: 4 },
                    flex: '0 1 auto',
                    minHeight: 0,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                        width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                        bgcolor: '#d5d0cb',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        bgcolor: '#999',
                        borderRadius: '3px',
                        '&:hover': {
                            bgcolor: '#777',
                        }
                    }
                }}>
                    {leagueId === 'all' ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Typography sx={{ color: '#777', fontSize: 14, mb: 1 }}>
                                Please select a specific league to view season-wise stats.
                            </Typography>
                        </Box>
                    ) : seasonWiseStats.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Typography className="empty-state-message" sx={{ color: '#555', fontSize: 16, mb: 1 }}>
                                No season to compare.
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {/* Tabs */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: { xs: 'flex-start', md: 'space-between' },
                                mb: 1,
                                pt: { xs: 2.5, md: 6 },
                                overflowX: 'auto',
                                gap: { xs: 1.2, md: 0 },
                                pb: 0.6,
                                '&::-webkit-scrollbar': { height: 4 },
                                '&::-webkit-scrollbar-thumb': { background: 'rgba(45,45,45,0.35)', borderRadius: 3 },
                            }}>
                                {[
                                    { key: 'goals', label: 'Goals' },
                                    { key: 'assists', label: 'Assists' },
                                    { key: 'motm', label: 'MOTM Votes' },
                                    { key: 'defensive', label: 'Cln Sht / Def' },
                                    { key: 'totalXP', label: 'Total XP' }
                                ].map(tab => (
                                    <Box
                                        key={tab.key}
                                        onClick={() => setStatsModalTab(tab.key as any)}
                                        sx={{
                                            flex: { xs: '0 0 auto', md: 1 },
                                            display: 'flex',
                                            justifyContent: 'start',
                                            cursor: 'pointer',
                                            pb: { xs: 1.2, md: 1.8 },
                                        }}
                                    >
                                        <Box sx={{
                                            borderBottom: statsModalTab === tab.key ? `4px solid #E56B16` : '4px solid #c0bbb5',
                                            transition: 'all 0.2s ease',
                                            minWidth: { xs: '120px', md: '150px' },
                                            textAlign: 'start',
                                        }}>
                                            <Typography sx={{
                                                color: statsModalTab === tab.key ? '#2d2d2d' : '#888',
                                                fontWeight: statsModalTab === tab.key ? 800 : 600,
                                                fontSize: { xs: 14, sm: 17, md: 21 },
                                                whiteSpace: 'nowrap',
                                                transition: 'color 0.2s ease'
                                            }}>
                                                {tab.label}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>

                            {/* Stats Bars - auto-scaled with left border */}
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: { xs: 1.2, md: 2 },
                                borderLeft: '3px solid #999',
                                borderBottom: '3px solid #999',
                                pl: 0,
                                pb: 2,
                            }}>
                                {(() => {
                                    const getStatValue = (s: typeof seasonWiseStats[0]) => {
                                        switch (statsModalTab) {
                                            case 'goals': return s.goals;
                                            case 'assists': return s.assists;
                                            case 'motm': return s.motmVotes;
                                            case 'defensive': return s.defensiveImpact + s.cleanSheets;
                                            case 'totalXP': return s.totalXP;
                                            default: return 0;
                                        }
                                    };
                                    const maxValue = Math.max(...seasonWiseStats.map(getStatValue), 1);

                                    return seasonWiseStats.map((season) => {
                                        const value = getStatValue(season);
                                        const percentage = (value / maxValue) * 100;

                                        return (
                                            <Box key={season.seasonId} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.1, md: 3 }, mx: { xs: 1, md: 3 } }}>
                                                {/* Bar */}
                                                <Box sx={{ flex: 1 }}>
                                                    <Box sx={{
                                                        bgcolor: 'transparent',
                                                        height: { xs: 34, md: 42 },
                                                        position: 'relative',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <Box sx={{
                                                            bgcolor: value > 0 ? '#07BFA5' : 'transparent',
                                                            height: '100%',
                                                            width: value > 0 ? `${Math.max(percentage, 10)}%` : '0%',
                                                            transition: 'width 0.5s ease',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'flex-end',
                                                            pr: { xs: 1.2, md: 2.5 }
                                                        }}>
                                                            {value > 0 && (
                                                                <Typography sx={{
                                                                    color: '#fff',
                                                                    fontWeight: 700,
                                                                    fontSize: { xs: 12, md: 16 }
                                                                }}>
                                                                    {statsModalTab === 'totalXP' ? value.toLocaleString() : value}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                        {value === 0 && (
                                                            <Typography sx={{
                                                                color: '#999',
                                                                fontWeight: 600,
                                                                fontSize: { xs: 12, md: 14 },
                                                                position: 'absolute',
                                                                left: 14,
                                                                top: '50%',
                                                                transform: 'translateY(-50%)'
                                                            }}>
                                                                0
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>

                                                {/* Season Label */}
                                                <Box sx={{ minWidth: { xs: 98, sm: 110, md: 145 }, textAlign: 'right' }}>
                                                    <Typography sx={{
                                                        color: '#2d2d2d',
                                                        fontWeight: 700,
                                                        fontSize: { xs: 11, md: 14 },
                                                        textTransform: 'uppercase',
                                                        lineHeight: 1.3,
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        SEASON {season.seasonNumber}
                                                    </Typography>
                                                    <Typography sx={{
                                                        color: '#666',
                                                        fontSize: { xs: 10, md: 12 },
                                                        lineHeight: 1.3
                                                    }}>
                                                        {season.isFinished
                                                            ? '(Finished)'
                                                            : <span style={{ fontSize: 10 }}>(Not Finished)</span>
                                                        }
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        );
                                    });
                                })()}
                            </Box>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}

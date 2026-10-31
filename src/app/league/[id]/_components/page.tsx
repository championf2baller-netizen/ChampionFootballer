'use client';
import React, { useState, useEffect, useCallback, useMemo, forwardRef } from 'react';
import dynamic from 'next/dynamic';
import {
    Box,
    Typography,
    Paper,
    Button,
    ButtonGroup,
    ButtonBase,
    Card,
    CardContent,
    Grid,
    Chip,
    Divider,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Snackbar,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    Switch,
    TextField,
    Alert,
    Menu,
    ListItemIcon,
    ListItemText,
    Container,
    List,
    ListItem,
    ListItemAvatar,
    LinearProgress,
    Slider,
    Stack,
    Avatar,
    useTheme,
    useMediaQuery,
    Fade,
} from '@mui/material';
import { useAuth } from '@/lib/hooks';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Trophy, Calendar, Copy, Edit, Settings, Shield, ChevronDown, Trash2, Undo2, Users, Flame, Search, Table, Plus, Share2, MapPin, Crown, Lock, RefreshCw, Info } from 'lucide-react';
import { Tooltip, Slide } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { shareContent, captureElementAsFile, shareToWhatsApp, buildLeagueSeasonInviteText, copyTextToClipboard } from '@/lib/utils/shareUtils';
import LeagueDetailLoadingSkeleton from '@/Components/loading/LeagueDetailLoadingSkeleton';
import EditMatchPopupLoadingSkeleton from '@/Components/loading/EditMatchPopupLoadingSkeleton';
import ViewTeamPopupLoadingSkeleton from '@/Components/loading/ViewTeamPopupLoadingSkeleton';
import MatchResultLoadingSkeleton from '@/Components/loading/MatchResultLoadingSkeleton';
import PlayerCardLoadingSkeleton from '@/Components/loading/PlayerCardLoadingSkeleton';
import PageHeader from '@/Components/PageHeader';
import { isRegisteredPlayerRecord, getPositionShortForm, formatPlayerDisplayName } from '@/lib/playerIdentity';
import { getXPTier } from '@/Components/XPStarMilestoneCard';
import { TokenManager } from '@/lib/tokenManager';
import PLAYERIMAGE from '@/Components/images/players.png'
import HomeTeamImage from '@/Components/images/hometeamshirt.png'
import AwayTeamImage from '@/Components/images/awayteamshirt.png'
import FootBallIcon from '@/Components/images/cardfootball.png'
import CardStar from '@/Components/images/cardstar.png'
import DREATEAM from '@/Components/images/dreamteamicon.png'
import DefenciveImpact from '@/Components/images/defenciveimpactvotes.png'

// Lazy load heavy components
const PlayMatchPagee = dynamic(() => import('@/Components/matchstatsdialog/MatchStatsDialog'), {
    loading: () => <CircularProgress />,
    ssr: false
});
const TrophyRoom = dynamic(() => import('@/Components/TrophyRoom'), {
    loading: () => <CircularProgress />,
    ssr: false
});
const PlayerStatsDialog = dynamic(() => import('@/Components/PlayerStatsDialog'), {
    loading: () => <CircularProgress />,
    ssr: false
});
const TeamPreviewScreen = dynamic(() => import('@/Components/viewteam/viewteam'), {
    loading: () => <ViewTeamPopupLoadingSkeleton />,
    ssr: false
});
import PlayerCard from '@/Components/playercard/playercard';
const EditMatchPage = dynamic(() => import('@/app/league/[id]/match/[matchId]/edit/_components/EditMatchPage'), {
    loading: () => <EditMatchPopupLoadingSkeleton />,
    ssr: false,
});
const MatchDetailsPage = dynamic(() => import('@/app/match/[matchId]/_components/index'), {
    loading: () => <MatchResultLoadingSkeleton mode="dialog" />,
    ssr: false
});
import CloseIcon from '@mui/icons-material/Close';
import MatchDetailModal from '@/Components/MatchDetailModal';
import LeagueViewToggle from './LeagueViewToggle';
import { useCombinedMatchRefresh } from '@/lib/useMatchAutoRefresh';
// import { LeaderboardResponse } from '@/types/api';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import ShirtImg from '@/Components/images/orage.png'
import homeImg from '@/Components/images/matches.png'
import awayImg from '@/Components/images/2nd champion icon football.png'
import Goals from "@/Components/images/goal.png"
import Assist from "@/Components/images/Assist.png"
import Cleansheet from "@/Components/images/cleansheet.png"
import CleanSheet from "@/Components/images/cleansheet.png"
import Momt from "@/Components/images/MOTM.png"
import MOTM from "@/Components/images/MOTM.png"
import Imapct from "@/Components/images/imapct.png"
import DefensiveImpact from "@/Components/images/defimp.png"
import Mentality from "@/Components/images/metality.png"
import InfoIcon from "@/Components/images/info.png"
import Star from '@mui/icons-material/Star';
import TrophyRank1 from '@/Components/images/trophy_rank1.png';
import TrophyRank2 from '@/Components/images/trophy_rank2.png';
import TrophyRank3 from '@/Components/images/trophy_rank3.png';
import LeagueTable from '@/Components/images/leagutable.png'
import LeagueIcon from '@/Components/images/league icon.png'
import CalendarImg from '@/Components/images/cardcalendar.png'
import ClockImg from '@/Components/images/cardclock.png'
import LocationImg from '@/Components/images/cardlocation.png'
import ViewTeamImg from '@/Components/images/cardviewteam.png'
import RESULTS from '@/Components/images/cardresult.png'
import MATCHRESULT from '@/Components/images/matchresults.png'
import ADDSTATS from '@/Components/images/cardstats.png'
import FIXTURES from '@/Components/images/fixtures.png'
import LEADERBOARD from '@/Components/images/leaderboard.png'
import TableGraphIcon from '@/Components/images/tablegrapicon.png'
import FirstBadge from '@/Components/images/1st.png';
import SecondBadge from '@/Components/images/2nd.png';
import ThirdBadge from '@/Components/images/3rd.png';
import fieldImg from '@/Components/images/dreamteambgimg.png';
import cflogo from '@/Components/images/champion football logo 3 (1).png';
import { getAvatarBackgroundColor, getAvatarInitials } from '@/lib/avatarInitials';

type Foot = 'L' | 'R';
type ShortPosition = 'GK' | 'DF' | 'MF' | 'WG' | 'ST';
type FIFAStats = { DRI: string; SHO: string; PAS: string; PAC: string; DEF: string; PHY: string };
const WORLD_RANKING_POSITION_OPTIONS = ['Defender', 'Midfielder', 'Forward', 'Goalkeeper'] as const;

type PlayerCardProps = {
    name: string;
    number: string;
    points: number;
    stats: FIFAStats;
    foot: string;
    profileImage?: string;
    shirtIcon?: string;
    width?: number | string;
    height?: number | string;
    hideShareIcon?: boolean;
    position: string;
};

const resolveImageUrl = (value: any): any => {
    if (value == null) return null;
    if (typeof value === 'object' && value.src) {
        return value;
    }
    const raw = String(value).trim();
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
    if (!apiBase) {
        return raw.startsWith('/') ? raw : `/${raw}`;
    }

    return `${apiBase}${raw.startsWith('/') ? '' : '/'}${raw}`;
};

// type PlayerStatsMetric = keyof LeaderboardResponse['players'][number];

type LeagueComputedStatus = {
    isComplete?: boolean;
    locked?: boolean;
    matchesPlayed?: number;
    gamesPlayed?: number;
    maxGames?: number;
    totalMatches?: number;
    missing?: Array<unknown>;
    [key: string]: unknown;
};

interface League {
    id: string;
    name: string;
    inviteCode: string;
    createdAt: string;
    members: User[];
    administrators: User[];
    matches: Match[];
    active: boolean;
    maxGames: number;
    showPoints: boolean;
    adminId?: string;
    userRole?: 'ADMIN' | 'MEMBER';
    computedStatus?: LeagueComputedStatus;
    isLocked?: boolean;
    isComplete?: boolean;
    isCompleted?: boolean;
    updatedAt?: string;
    status?: string;
    archived?: boolean;
}

interface User {
    xp: number;
    shirtNumber: undefined;
    positionType: undefined;
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string | null;
    position?: string;
    style?: string;
}

interface MatchGuest {
    id: string;
    firstName?: string;
    lastName?: string;
    team?: 'home' | 'away' | string;
}

interface Match {
    unavailableUsers: any;
    manOfTheMatchVotes?: Record<string, string | number>;
    homeTeamImage: string;
    awayTeamImage: string;
    id: string;
    date: string;
    location: string;
    status: string;
    homeTeamName: string;
    awayTeamName: string;
    homeTeam?: string;
    awayTeam?: string;
    homeTeamGoals?: number;
    awayTeamGoals?: number;
    availableUsers: User[];
    homeTeamUsers: User[];
    awayTeamUsers: User[];
    end: string;
    start?: string | Date;
    updatedAt?: string | Date;
    createdAt?: string | Date;
    active: boolean;
    archived?: boolean; // <-- NEW
    matchNumber?: number; // <-- Match index from backend
    guests?: MatchGuest[];
    guestPlayers?: MatchGuest[];
}


type LeagueStatistics = {
    playedMatches: number;
    remaining: number;
    players: number;
    created: string;
    bestPairing: null | {
        ids: [string, string];
        names: [string, string];
        togetherMatches: number;
        togetherWins: number;
        combinedGoals: number;
        combinedAssists: number;
    };
    hottestPlayer: null | {
        playerId: string;
        name: string;
        xpInLast5: number;
        matchesConsidered: number;
    };
};

// Slide Transition for mobile dialogs
const Transition = forwardRef<HTMLDivElement, { children: React.ReactElement }>(
    function Transition(props, ref) {
        return <Slide direction="up" ref={ref} {...props} />;
    }
);

// Local helper to format names safely
const formatLeagueName = (name?: string): string => (name ?? '').trim();
const LOCATION_PREVIEW_LIMIT = 45;
const formatLocationForCard = (location?: string): string => {
    if (!location) return '';
    const normalized = location.trim();
    return normalized.length > LOCATION_PREVIEW_LIMIT
        ? `${normalized.slice(0, LOCATION_PREVIEW_LIMIT)}..`
        : normalized;
};

const formatFixtureDateTime = (dateString?: string | Date): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' });
    const day = date.getDate();
    const month = date.toLocaleDateString('en-GB', { month: 'short' });
    const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).toLowerCase();
    return `${weekday} ${day} ${month} · ${timeStr}`;
};

const getKickoffCountdown = (dateInput?: string | Date): string | null => {
    if (!dateInput) return null;
    const matchTime = new Date(dateInput).getTime();
    if (isNaN(matchTime)) return null;
    const now = Date.now();
    const diffMs = matchTime - now;

    if (diffMs <= 0) {
        return 'Kick-off started';
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    const matchDate = new Date(matchTime);
    const nowDate = new Date(now);
    const isSameDay = matchDate.getFullYear() === nowDate.getFullYear() &&
                      matchDate.getMonth() === nowDate.getMonth() &&
                      matchDate.getDate() === nowDate.getDate();

    if (isSameDay || diffHours < 24) {
        const remMinutes = diffMinutes % 60;
        if (diffHours === 0) {
            return `Kick-off in ${diffMinutes}m`;
        }
        return `Kick-off in ${diffHours}h${remMinutes > 0 ? ` ${remMinutes}m` : ''}`;
    } else {
        const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return `Kick-off in ${days} ${days === 1 ? 'day' : 'days'}`;
    }
};

const formatDisplayTeamName = (name?: string | null, fallback: string = 'Team'): string => {
    if (!name || !name.trim()) return fallback;
    return name.trim();
};

const normalizeId = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    return String(value).trim();
};

const comparableId = (value: unknown): string => {
    const normalized = normalizeId(value);
    return normalized.startsWith('guest-') ? normalized.slice(6) : normalized;
};

const formatPlayerName = (firstName?: string, lastName?: string): string => {
    return formatPlayerDisplayName(firstName, lastName);
};

// Match player-card naming format: FirstName + last initial in UPPERCASE (e.g., "RUHEL U.", "MUHIB")
const formatPlayerCardStyleName = (firstName?: string, lastName?: string): string => {
    const cleanFirst = String(firstName || '').trim();
    const cleanLast = String(lastName || '').trim();
    const isUser = cleanLast.toLowerCase() === 'user';
    const effectiveLast = isUser ? '' : cleanLast;

    if (!cleanFirst && !effectiveLast) return 'PLAYER NAME';

    const parts = cleanFirst.split(/\s+/).filter(Boolean);
    const actualFirst = parts[0] || '';
    const extraLast = parts.slice(1).join(' ');

    const finalLast = (extraLast + ' ' + effectiveLast).trim();
    const finalLastIsUser = finalLast.toLowerCase() === 'user';
    const realLast = finalLastIsUser ? '' : finalLast;

    const firstUpper = actualFirst.toUpperCase();
    if (!realLast) return firstUpper || 'PLAYER NAME';

    const lastInitial = realLast.charAt(0).toUpperCase();
    return lastInitial ? `${firstUpper} ${lastInitial}.` : firstUpper;
};

interface MotmPlayerInfo {
    name: string;
    initial: string;
    picture?: string | null;
}

const getTopMotmPlayer = (match: Match, fallbackPlayers: User[] = []): MotmPlayerInfo | null => {
    const votes = match.manOfTheMatchVotes;
    if (!votes || typeof votes !== 'object') return null;

    const voteEntries = Object.entries(votes as Record<string, unknown>);
    if (voteEntries.length === 0) return null;

    const voteCounts: Record<string, number> = {};
    const valuesAreCounts = voteEntries.every(([, value]) => typeof value === 'number');

    if (valuesAreCounts) {
        voteEntries.forEach(([playerId, count]) => {
            const normalizedId = normalizeId(playerId);
            if (!normalizedId) return;
            voteCounts[normalizedId] = (voteCounts[normalizedId] || 0) + Number(count || 0);
        });
    } else {
        voteEntries.forEach(([, votedForId]) => {
            const normalizedId = normalizeId(votedForId);
            if (!normalizedId) return;
            voteCounts[normalizedId] = (voteCounts[normalizedId] || 0) + 1;
        });
    }

    let topPlayerId = '';
    let maxVotes = 0;
    Object.entries(voteCounts).forEach(([playerId, count]) => {
        if (count > maxVotes) {
            maxVotes = count;
            topPlayerId = playerId;
        }
    });

    if (!topPlayerId || maxVotes <= 0) return null;

    const rawGuests = (match.guests && match.guests.length > 0 ? match.guests : match.guestPlayers) || [];
    const guestUsers: User[] = rawGuests
        .filter((guest) => normalizeId(guest.id) !== '')
        .map((guest) => ({
            id: `guest-${normalizeId(guest.id)}`,
            firstName: guest.firstName || 'Guest',
            lastName: guest.lastName || 'Player',
            email: '',
            positionType: undefined,
            shirtNumber: undefined,
            xp: 0,
        }));

    const allPlayers: User[] = [
        ...(match.homeTeamUsers || []),
        ...(match.awayTeamUsers || []),
        ...fallbackPlayers,
        ...guestUsers
    ];
    const winningPlayer = allPlayers.find((player) => {
        const playerId = normalizeId(player.id);
        if (!playerId) return false;
        return playerId === topPlayerId || comparableId(playerId) === comparableId(topPlayerId);
    });

    if (!winningPlayer) return null;
    const winnerName = formatPlayerName(winningPlayer.firstName, winningPlayer.lastName) || winningPlayer.firstName || 'Player';
    const initial = (winningPlayer.firstName?.[0] || winnerName[0] || 'M').toUpperCase();
    return {
        name: winnerName,
        initial,
        picture: winningPlayer.profilePicture || null,
    };
};

const getTopMotmPlayerName = (match: Match, fallbackPlayers: User[] = []): string | null => {
    return getTopMotmPlayer(match, fallbackPlayers)?.name || null;
};

const isUserInMatch = (match: Match, uid?: string | null): boolean => {
    if (!uid) return false;
    const target = String(uid).trim();
    if (!target) return false;
    const isSame = (idVal: unknown) => {
        if (!idVal) return false;
        const s = String(idVal).trim();
        return s === target || (s.startsWith('guest-') && s.slice(6) === target);
    };
    if (match.homeTeamUsers?.some(u => isSame(u?.id || (u as any)?._id))) return true;
    if (match.awayTeamUsers?.some(u => isSame(u?.id || (u as any)?._id))) return true;
    if ((match as any).players?.some((u: any) => isSame(u?.id || u?._id))) return true;
    if ((match as any).confirmedPlayers?.some((u: any) => isSame(u?.id || u?._id))) return true;
    const ps = (match as any).playerStats || (match as any).statistics || (match as any).stats;
    if (ps && typeof ps === 'object' && !Array.isArray(ps)) {
        if (Object.keys(ps).some(k => isSame(k))) return true;
    } else if (Array.isArray(ps)) {
        if (ps.some((s: any) => isSame(s?.userId || s?.user_id || s?.user?.id))) return true;
    }
    return false;
};

const hasPlayerAddedStats = (stat: any): boolean => {
    if (!stat) return false;
    if (typeof stat === 'boolean') return stat;
    if (typeof stat.hasSubmittedStats === 'boolean') return stat.hasSubmittedStats;

    const goals = Number(stat.goals) || 0;
    const assists = Number(stat.assists) || 0;
    const cleanSheets = Number(stat.cleanSheets ?? stat.clean_sheets) || 0;
    const defence = Number(stat.defence) || 0;
    const penalties = Number(stat.penalties) || 0;
    const freeKicks = Number(stat.freeKicks ?? stat.free_kicks) || 0;
    const yellowCards = Number(stat.yellowCards ?? stat.yellow_cards) || 0;
    const redCards = Number(stat.redCards ?? stat.red_cards) || 0;

    if (goals > 0 || assists > 0 || cleanSheets > 0 || defence > 0 || penalties > 0 || freeKicks > 0 || yellowCards > 0 || redCards > 0) {
        return true;
    }

    const impact = Number(stat.impact) || 0;
    const minutes = Number(stat.minutesPlayed ?? stat.minutes_played) || 0;
    const rating = Number(stat.rating) || 0;

    if (impact > 0 && minutes === 0 && rating === 0) {
        return true;
    }

    return false;
};

const getMatchStatsProgress = (match: Match, statsCountFallback?: number) => {
    const rawGuests = (match.guests && match.guests.length > 0 ? match.guests : match.guestPlayers) || [];
    const homeCount = match.homeTeamUsers?.length || 0;
    const awayCount = match.awayTeamUsers?.length || 0;
    const guestCount = rawGuests.length;
    let totalPlayers = homeCount + awayCount + guestCount;
    if (totalPlayers === 0) {
        totalPlayers = match.availableUsers?.length || 14;
    }

    let statsCount = 0;
    const ps = (match as any).playerStats || (match as any).statistics || (match as any).stats;
    if (Array.isArray(ps) && ps.length > 0) {
        const validStats = ps.filter(hasPlayerAddedStats);
        const uniqueUserIds = new Set(
            validStats.map((s: any) => String(s?.userId || s?.user_id || s?.user?.id || s?.id || '')).filter(Boolean)
        );
        statsCount = uniqueUserIds.size > 0 ? uniqueUserIds.size : validStats.length;
    } else if (ps && typeof ps === 'object' && !Array.isArray(ps) && Object.keys(ps).length > 0) {
        const validStats = Object.values(ps).filter(hasPlayerAddedStats);
        statsCount = validStats.length;
    } else if (typeof statsCountFallback === 'number' && statsCountFallback >= 0) {
        statsCount = statsCountFallback;
    }

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

const LEADERBOARD_METRIC_CONFIG = [
    {
        key: 'goals',
        label: 'GOALS',
        icon: Goals,
        infoSummary: 'Ranks players by total goals in completed matches.',
        infoFormula: 'Adds every goal recorded in match stats for the selected league and season.',
    },
    {
        key: 'assists',
        label: 'ASSISTS',
        icon: Assist,
        infoSummary: 'Ranks players by total assists in completed matches.',
        infoFormula: 'Adds every assist recorded in match stats for the selected league and season.',
    },
    {
        key: 'motm',
        label: 'MOTM VOTES',
        icon: MOTM,
        infoSummary: 'Ranks players by Man of the Match votes received.',
        infoFormula: 'Counts all votes where the player was selected as MOTM in the selected league and season.',
    },
    {
        key: 'impact',
        label: 'DEFENSIVE IMPACT VOTES',
        icon: DefenciveImpact,
        infoSummary: 'Ranks players by defensive Impact Votes selections.',
        infoFormula: 'Counts the number of votes a player recieved for their Defensive Impact in the selected league and season.',
    },
    {
        key: 'cleanSheet',
        label: 'CLEAN SHEETS',
        icon: CleanSheet,
        infoSummary: 'Ranks players by clean sheets in completed matches.',
        infoFormula: 'Adds clean-sheet entries saved in match stats for the selected league and season.',
    },
    {
        key: 'contribution',
        label: 'CONTRIBUTION INDEX %',
        icon: Imapct,
        infoSummary: 'Shows overall contribution as a percentage.',
        infoFormula: "Measures a player's contribution towards winning matches, expressed as a percentage, based on goals, assists, clean sheets, MOTM votes, and other key match actions for the selected league and season.",
    },
] as const;

type LeaderboardMetricKey = (typeof LEADERBOARD_METRIC_CONFIG)[number]['key'];

const getMetricValueHeader = (key: string): string => {
    switch (key) {
        case 'goals':
            return 'G';
        case 'assists':
            return 'A';
        case 'cleanSheet':
            return 'CS';
        case 'contribution':
            return 'INDEX';
        case 'motm':
        case 'impact':
        default:
            return 'VOTES';
    }
};




// Add TableData type
interface TableData {
    xp: number;
    id: string;
    name: string;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    winPercentage: string;
    isAdmin?: boolean;
    profilePicture?: string | null;
    motmCount?: number;
    rankChange?: number;
}

const TrophyCup = ({ rank }: { rank: 1 | 2 | 3 }) => {
    const src = rank === 1 ? TrophyRank1 : rank === 2 ? TrophyRank2 : TrophyRank3;
    return (
        <Image
            src={src}
            alt={`Rank ${rank}`}
            width={18}
            height={18}
            className="inline-block flex-shrink-0 object-contain"
            style={{ width: '18px', height: '18px', verticalAlign: 'middle' }}
        />
    );
};

const leagueMemoryCache = new Map<string, League>();    

export default function LeagueDetailPage() {
    const params = useParams();
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    const leagueId = params?.id ? String(params.id) : '';
    const [matchStatsOpen, setMatchStatsOpen] = React.useState(false);
    const [selectedMatchIdForDialog, setSelectedMatchIdForDialog] = React.useState<string | null>(null);
    const [shouldShowAdminGoals, setShouldShowAdminGoals] = React.useState(false);
    const [league, setLeague] = useState<League | null>(() => {
        if (typeof window !== 'undefined' && leagueId) {
            const inMem = leagueMemoryCache.get(leagueId);
            if (inMem) return inMem;
            try {
                const stored = sessionStorage.getItem(`cf_league_${leagueId}`);
                if (stored) return JSON.parse(stored);
            } catch {}
        }
        return null;
    });
    console.log('leagues matches', league?.matches)
    console.log('league archived status:', league?.archived, '| league active:', league?.active, '| league name:', league?.name)
    const [error, setError] = useState<string | null>(null);
    const [leagueDetailsLoading, setLeagueDetailsLoading] = useState(false);
    const [leagueDetailsAttempted, setLeagueDetailsAttempted] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [hasLoadedAllLeagues, setHasLoadedAllLeagues] = useState(false);
    const [allLeaguesFetchFailed, setAllLeaguesFetchFailed] = useState(false);
    const { user, token, loading: authLoading, isAuthenticated } = useAuth();
    const [teamModalOpen, setTeamModalOpen] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [availabilityLoading, setAvailabilityLoading] = useState<{ [matchId: string]: boolean }>({});
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [section, setSection] = useState<'members' | 'matches' | 'dream-team' | 'results' | 'table' | 'leaderboard'>('table');
    const [selectedMemberPosition, setSelectedMemberPosition] = useState<string>('all');
    const [memberPositionMenuAnchor, setMemberPositionMenuAnchor] = useState<null | HTMLElement>(null);
    const tableScrollRef = React.useRef<HTMLDivElement | null>(null);
    const quickViewCardRef = React.useRef<HTMLDivElement | null>(null);
    const [tableScrollPercent, setTableScrollPercent] = useState(0);
    const [tableHasHorizontalOverflow, setTableHasHorizontalOverflow] = useState(false);
    const searchParams = useSearchParams();
    const profilePlayerId = typeof searchParams?.get === 'function' ? searchParams.get('profilePlayerId') : '';
    const initialSeasonIdFromQuery = typeof searchParams?.get === 'function'
        ? (searchParams.get('seasonId') || '').trim()
        : '';
    const [hasCommonLeague, setHasCommonLeague] = useState(false);
    const [checkedCommonLeague, setCheckedCommonLeague] = useState(false);
    const [userLeagueXP, setUserLeagueXP] = useState<Record<string, number>>({});
    const [matchStatsMap, setMatchStatsMap] = useState<Record<string, number>>({});

    // Fetch stats for completed matches if not already provided in match.playerStats
    useEffect(() => {
        if (!token || !league?.matches || league.matches.length === 0) return;
        const completedMatches = league.matches.filter(m => isResultLikeStatus(m.status));
        completedMatches.forEach(async (m) => {
            const hasStatsArray = Array.isArray((m as any).playerStats) && (m as any).playerStats.length > 0;
            if (hasStatsArray) return;
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/${m.id}/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) return;
                const data = await res.json();
                if (data.success && Array.isArray(data.stats)) {
                    const validStats = data.stats.filter(hasPlayerAddedStats);
                    const uniqueCount = new Set(
                        validStats.map((s: any) => String(s?.userId || s?.user_id || s?.user?.id || s?.id || '')).filter(Boolean)
                    ).size;
                    setMatchStatsMap(prev => (prev[m.id] === uniqueCount ? prev : { ...prev, [m.id]: uniqueCount }));
                }
            } catch {}
        });
    }, [league?.matches, token]);
    const syncTableHorizontalScroll = useCallback(() => {
        const scrollEl = tableScrollRef.current;
        if (!scrollEl) {
            setTableHasHorizontalOverflow(false);
            setTableScrollPercent(0);
            return;
        }
        const maxScrollLeft = Math.max(scrollEl.scrollWidth - scrollEl.clientWidth, 0);
        setTableHasHorizontalOverflow(maxScrollLeft > 0);
        setTableScrollPercent(maxScrollLeft > 0 ? (scrollEl.scrollLeft / maxScrollLeft) * 100 : 0);
        scrollEl.classList.toggle('is-scrolled', scrollEl.scrollLeft > 2);
    }, []);
    const handleTableSliderChange = useCallback((_event: Event, value: number | number[]) => {
        const sliderValue = Array.isArray(value) ? value[0] : value;
        const scrollEl = tableScrollRef.current;
        if (!scrollEl) return;
        const maxScrollLeft = Math.max(scrollEl.scrollWidth - scrollEl.clientWidth, 0);
        scrollEl.scrollLeft = (sliderValue / 100) * maxScrollLeft;
        setTableScrollPercent(sliderValue);
        scrollEl.classList.toggle('is-scrolled', scrollEl.scrollLeft > 2);
    }, []);
    const isRecord = (value: unknown): value is Record<string, unknown> =>
        typeof value === 'object' && value !== null;
    const normalizeEntityId = (value: unknown): string => String(value ?? '').trim();
    const toNumericValue = (value: unknown): number | null => {
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        if (typeof value === 'string') {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : null;
        }
        return null;
    };
    const isSeasonLikeActive = useCallback((seasonLike: unknown): boolean => {
        if (!isRecord(seasonLike)) return true;

        if (typeof seasonLike.isActive === 'boolean') return seasonLike.isActive;
        if (typeof seasonLike.active === 'boolean') return seasonLike.active;

        const status = String(seasonLike.status || '').trim().toLowerCase();
        if (status === 'active' || status === 'current' || status === 'ongoing') return true;
        if (
            seasonLike.locked === true ||
            seasonLike.archived === true ||
            status === 'inactive' ||
            status === 'completed' ||
            status === 'archived' ||
            status === 'locked' ||
            status === 'finished' ||
            status === 'ended'
        ) {
            return false;
        }

        const endDate = typeof seasonLike.endDate === 'string' ? seasonLike.endDate : '';
        if (endDate) {
            const endMs = new Date(endDate).getTime();
            if (Number.isFinite(endMs) && endMs < Date.now()) return false;
        }

        return true;
    }, []);
    const normalizeXPMapPayload = useCallback((payload: unknown): Record<string, number> => {
        const normalized: Record<string, number> = {};

        const addEntry = (id: unknown, xpValue: unknown) => {
            const key = normalizeEntityId(id);
            if (!key) return;
            const xpNum = toNumericValue(xpValue);
            if (xpNum === null) return;
            normalized[key] = xpNum;
        };

        const parseEntry = (entry: unknown) => {
            if (!isRecord(entry)) return;
            const idCandidate =
                entry.userId ??
                entry.user_id ??
                entry.playerId ??
                entry.player_id ??
                entry.memberId ??
                entry.member_id ??
                entry.id;
            const xpCandidate =
                entry.xp ??
                entry.totalXP ??
                entry.total_xp ??
                entry.points ??
                entry.value;
            addEntry(idCandidate, xpCandidate);
        };

        const parseCollection = (collection: unknown) => {
            if (Array.isArray(collection)) {
                collection.forEach(parseEntry);
                return;
            }
            if (!isRecord(collection)) return;

            // Shape: { "<userId>": 123 } OR { "<userId>": { xp: 123 } }
            Object.entries(collection).forEach(([key, value]) => {
                if (isRecord(value)) {
                    const nestedXp =
                        value.xp ??
                        value.totalXP ??
                        value.total_xp ??
                        value.points ??
                        value.value;
                    addEntry(key, nestedXp);
                } else {
                    addEntry(key, value);
                }
            });
        };

        if (isRecord(payload)) {
            const primary =
                payload.xp ??
                (isRecord(payload.data) ? payload.data.xp : undefined) ??
                payload.data ??
                payload.players ??
                payload.rows ??
                payload.items;

            if (primary !== undefined) {
                parseCollection(primary);
            } else {
                parseCollection(payload);
            }
        } else {
            parseCollection(payload);
        }

        return normalized;
    }, []);
    const getLeagueXpForMember = useCallback((memberId: unknown, fallbackXp?: unknown): number => {
        const key = normalizeEntityId(memberId);
        const mapValue = key ? toNumericValue(userLeagueXP[key]) : null;
        return mapValue ?? toNumericValue(fallbackXp) ?? 0;
    }, [userLeagueXP]);
    const getMemberPositionLabel = useCallback((member: User): string => {
        if (!member) return '-';
        const rec = member as unknown as Record<string, unknown>;
        const fromPosition = String(member.position ?? rec?.position ?? '').trim();
        if (fromPosition && fromPosition !== '-') return getPositionShortForm(fromPosition);
        const fromType = String(rec?.positionType ?? rec?.position_type ?? rec?.role ?? '').trim();
        if (fromType && fromType !== '-') return getPositionShortForm(fromType);
        const fromStyle = String(rec?.playingStyle ?? rec?.style ?? '').trim();
        if (fromStyle && fromStyle !== '-') return getPositionShortForm(fromStyle);
        return '-';
    }, []);
    const normalizeToWorldRankingPosition = useCallback((positionLabel: string): string => {
        const value = (positionLabel || '').toLowerCase().trim();
        if (!value || value === '-') return '-';

        if (value.includes('goalkeeper') || value.includes('(gk)') || value === 'gk') return 'Goalkeeper';

        if (
            value.includes('midfielder') ||
            value.includes('mid') ||
            value === 'cm' || value.includes('(cm)') ||
            value === 'cdm' || value.includes('(cdm)') ||
            value === 'cam' || value.includes('(cam)') ||
            value === 'rm' || value.includes('(rm)') ||
            value === 'lm' || value.includes('(lm)') ||
            value === 'mf'
        ) {
            return 'Midfielder';
        }

        if (
            value.includes('defender') ||
            value.includes('back') ||
            value.includes('wing-back') ||
            value === 'cb' || value.includes('(cb)') ||
            value === 'rb' || value.includes('(rb)') ||
            value === 'lb' || value.includes('(lb)') ||
            value === 'rwb' || value.includes('(rwb)') ||
            value === 'lwb' || value.includes('(lwb)') ||
            value === 'df'
        ) {
            return 'Defender';
        }

        if (
            value.includes('forward') ||
            value.includes('striker') ||
            value.includes('winger') ||
            value === 'st' || value.includes('(st)') ||
            value === 'cf' || value.includes('(cf)') ||
            value === 'rf' || value.includes('(rf)') ||
            value === 'lf' || value.includes('(lf)') ||
            value === 'rw' || value.includes('(rw)') ||
            value === 'lw' || value.includes('(lw)') ||
            value === 'fw' || value === 'wg'
        ) {
            return 'Forward';
        }

        return positionLabel;
    }, []);
    const getEffectiveMemberXP = useCallback((member: User): number => {
        if (!member) return 0;
        const m = member as unknown as Record<string, unknown>;
        const num = (v: unknown): number | null => {
            if (typeof v === 'number' && Number.isFinite(v)) return v;
            if (typeof v === 'string') {
                const p = Number(v);
                return Number.isFinite(p) ? p : null;
            }
            return null;
        };
        const directXP = num(member.xp) ?? num(m.totalXP) ?? num(m.total_xp) ?? num(m.xpPoints) ?? num(m.points);
        if (directXP !== null && directXP > 0) return directXP;
        const key = String(member.id || '').trim();
        const mapVal = key ? num(userLeagueXP[key]) : null;
        if (mapVal !== null && mapVal > 0) return mapVal;
        return directXP ?? mapVal ?? 0;
    }, [userLeagueXP]);
    const memberPositionOptions = WORLD_RANKING_POSITION_OPTIONS;
    const sortedMembersForTable = React.useMemo(() => {
        const members = league?.members ? [...league.members] : [];

        members.sort((a: User, b: User) => {
            const xpA = getEffectiveMemberXP(a);
            const xpB = getEffectiveMemberXP(b);

            if (xpB !== xpA) return xpB - xpA;

            const nameA = `${a?.firstName ?? ''} ${a?.lastName ?? ''}`.trim();
            const nameB = `${b?.firstName ?? ''} ${b?.lastName ?? ''}`.trim();
            return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
        });

        return members;
    }, [league?.members, getEffectiveMemberXP]);
    const filteredMembersForTable = useMemo(() => {
        if (selectedMemberPosition === 'all') return sortedMembersForTable;
        return sortedMembersForTable.filter((member: User) =>
            normalizeToWorldRankingPosition(getMemberPositionLabel(member)).toLowerCase() === selectedMemberPosition.toLowerCase()
        );
    }, [sortedMembersForTable, selectedMemberPosition, getMemberPositionLabel, normalizeToWorldRankingPosition]);
    useEffect(() => {
        if (selectedMemberPosition === 'all') return;
        const hasSelectedPosition = memberPositionOptions.some(
            (position) => position.toLowerCase() === selectedMemberPosition.toLowerCase()
        );
        if (!hasSelectedPosition) {
            setSelectedMemberPosition('all');
        }
    }, [memberPositionOptions, selectedMemberPosition]);
    const memberPositionMenuOpen = Boolean(memberPositionMenuAnchor);
    const handleMemberPositionMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setMemberPositionMenuAnchor(event.currentTarget);
    }, []);
    const handleMemberPositionMenuClose = useCallback(() => {
        setMemberPositionMenuAnchor(null);
    }, []);
    const handleMemberPositionChange = useCallback((position: string) => {
        setSelectedMemberPosition(position);
        setMemberPositionMenuAnchor(null);
    }, []);
    const [showPointsAlert, setShowPointsAlert] = useState(false);
    const [statsDialogOpen, setStatsDialogOpen] = React.useState(false);
    const [activeMatchId,] = React.useState<string | null>(null);
    // 
    const [stats, setStats] = React.useState({
        goals: 0,
        assists: 0,
        cleanSheets: 0,
        penalties: 0,
        freeKicks: 0,
        defence: 0,
        impact: 0,
    });
    const [isSubmittingStats, setIsSubmittingStats] = React.useState(false);


    const [viewTeamOpen, setViewTeamOpen] = React.useState(false);
    const [viewTeamMatch, setViewTeamMatch] = React.useState<{ leagueId: string; matchId: string; matchNumber?: number } | null>(null);
    // Leagues dropdown state
    const [allLeagues, setAllLeagues] = useState<League[]>([]);
    const [leaguesDropdownOpen, setLeaguesDropdownOpen] = useState(false);
    const [leaguesDropdownAnchor, setLeaguesDropdownAnchor] = useState<null | HTMLElement>(null);

    // Season dropdown state
    const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);
    const [seasonDropdownAnchor, setSeasonDropdownAnchor] = useState<null | HTMLElement>(null);
    const lastSyncedQuerySeasonIdRef = React.useRef<string | null>(initialSeasonIdFromQuery || null);
    const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(() => {
        if (initialSeasonIdFromQuery) return initialSeasonIdFromQuery;
        if (typeof window !== 'undefined' && leagueId) {
            return localStorage.getItem('preferredSeasonId_' + leagueId) || null;
        }
        return null;
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && leagueId) {
            try { localStorage.setItem('preferredLeagueId', String(leagueId)); } catch { }
        }
    }, [leagueId]);

    useEffect(() => {
        if (typeof window !== 'undefined' && selectedSeasonId) {
            try {
                localStorage.setItem('preferredSeasonId', String(selectedSeasonId));
                if (leagueId) {
                    localStorage.setItem('preferredSeasonId_' + leagueId, String(selectedSeasonId));
                }
            } catch { }
        }
    }, [selectedSeasonId, leagueId]);
    const [seasonOptions, setSeasonOptions] = useState<Array<{
        id: string;
        seasonNumber: number;
        isActive?: boolean;
        active?: boolean;
        locked?: boolean;
        archived?: boolean;
        endDate?: string | null;
        status?: string | null;
        inviteCode?: string;
        seasonInviteCode?: string;
        inviteLink?: string;
    }>>([]);
    const seasonCreatedToastShownRef = React.useRef(false);

    useEffect(() => {
        if (selectedSeasonId && leagueId) {
            localStorage.setItem('preferredSeasonId_' + leagueId, selectedSeasonId);
            localStorage.setItem('preferredSeasonId', selectedSeasonId);
        }
    }, [selectedSeasonId, leagueId]);

    // Match detail modal state
    const [matchDetailModalOpen, setMatchDetailModalOpen] = useState(false);
    const [selectedMatchDetail, setSelectedMatchDetail] = useState<Match | null>(null);

    // Results popup dialog state
    const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
    const [resultsDialogMatchId, setResultsDialogMatchId] = useState<string | null>(null);
    const [matchClockMs, setMatchClockMs] = useState<number>(() => Date.now());

    // Confirmation dialog state
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [matchPendingDelete, setMatchPendingDelete] = useState<Match | null>(null);
    const [matchHasData, setMatchHasData] = useState<boolean | null>(null);
    const [matchDeleteChecking, setMatchDeleteChecking] = useState(false);
    // const [undoInfo, setUndoInfo] = useState<{ match: Match; action: 'archive' | 'delete' } | null>(null);
    const [undoInfo, setUndoInfo] = useState<{ match: Match; action: 'archive' | 'delete' } | null>(null);

    const [archivedActionOpen, setArchivedActionOpen] = useState(false);
    const [archivedActionMatch, setArchivedActionMatch] = useState<Match | null>(null);

    // Edit Match Dialog state
    const [editMatchDialogOpen, setEditMatchDialogOpen] = useState(false);
    const [editMatchId, setEditMatchId] = useState<string | null>(null);

    // Leaderboard state
    const [selectedMetric, setSelectedMetric] = useState<LeaderboardMetricKey>('goals');
    const [leaderboardPlayers, setLeaderboardPlayers] = useState<Array<{ id: string; name: string; positionType: string; value: number }>>([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(false);
    const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState(0);
    const [allLeaderboardData, setAllLeaderboardData] = useState<Record<string, Array<{ id: string; name: string; positionType: string; value: number }>>>({});
    const [leaderboardInfoMetric, setLeaderboardInfoMetric] = useState<LeaderboardMetricKey | null>(null);
    const [expandedLeaderboards, setExpandedLeaderboards] = useState<Record<string, boolean>>({});
    const [desktopLeaderboardPopupMetric, setDesktopLeaderboardPopupMetric] = useState<LeaderboardMetricKey | null>(null);
    const selectedDesktopLeaderboardMetric = useMemo(
        () => LEADERBOARD_METRIC_CONFIG.find((metric) => metric.key === desktopLeaderboardPopupMetric) || null,
        [desktopLeaderboardPopupMetric]
    );
    const selectedLeaderboardInfo = useMemo(
        () => LEADERBOARD_METRIC_CONFIG.find((metric) => metric.key === leaderboardInfoMetric) || null,
        [leaderboardInfoMetric]
    );

    const [leagueWinners, setLeagueWinners] = useState<{ champion?: string; runnerUp?: string }>({});
    const [motmCounts, setMotmCounts] = useState<Record<string, number>>({});

    // Quick View: move hooks above any conditional returns to satisfy rules-of-hooks
    type PlayerProfileLike = {
        position?: string | null;
        preferredFoot?: string | null;
        shirtNumber?: string | number | null;
        profilePicture?: string | null;
        avatarUrl?: string | null;
    };
    const [openQuickView, setOpenQuickView] = useState(false);
    const [quickView, setQuickView] = useState<{
        player?: (User & PlayerProfileLike) | null;
        league?: League | null;
        stats?: { goals?: number; assists?: number };
        skills?: { dribbling?: number; shooting?: number; passing?: number; pace?: number; defending?: number; physical?: number };
        xp?: number;
        cleanSheets?: number;
        motmCount?: number;
        defensiveImpact?: number;
        mentality?: number;
        lastFive?: Array<{ result: 'W' | 'D' | 'L' }>;
        trophyTitle?: string;
        xpLatest?: number;
        xpRecentTotal?: number;
        profileXP?: number;
    }>({});
    const [playerShareAnchorEl, setPlayerShareAnchorEl] = useState<null | HTMLElement>(null);


    // Dream Team state
    const [dreamTeam, setDreamTeam] = useState<{
        goalkeeper: Array<{ id: string; firstName: string; lastName: string; position: string; profilePicture?: string; xp: number }>;
        defenders: Array<{ id: string; firstName: string; lastName: string; position: string; profilePicture?: string; xp: number }>;
        midfielders: Array<{ id: string; firstName: string; lastName: string; position: string; profilePicture?: string; xp: number }>;
        forwards: Array<{ id: string; firstName: string; lastName: string; position: string; profilePicture?: string; xp: number }>;
    }>({
        goalkeeper: [],
        defenders: [],
        midfielders: [],
        forwards: []
    });
    const [dreamTeamLoading, setDreamTeamLoading] = useState(false);

    useEffect(() => {
        if (!token || !leagueId) return;
        const seasonsUnknown = (league as unknown as { seasons?: unknown })?.seasons;
        const hasSeasons = Array.isArray(seasonsUnknown) && seasonsUnknown.length > 0;
        if (hasSeasons && !selectedSeasonId) return;

        let cancelled = false;
        (async () => {
            try {
                const params = new URLSearchParams({ leagueId });
                if (selectedSeasonId) {
                    params.append('seasonId', selectedSeasonId);
                }
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leagues/trophy-room?${params.toString()}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (cancelled) return;
                if (!res.ok || !data?.success || !Array.isArray(data?.trophyWinners)) {
                    setLeagueWinners({});
                    return;
                }
                const winners = data.trophyWinners as Array<{ title: string; winnerId: string | number | null }>;
                const byTitle = (t: string) => winners.find(w => (w.title || '').toLowerCase() === t.toLowerCase());
                const champion = byTitle('League Champion')?.winnerId;
                const runnerUp = byTitle('Runner-Up')?.winnerId;
                setLeagueWinners({
                    champion: champion != null ? String(champion) : undefined,
                    runnerUp: runnerUp != null ? String(runnerUp) : undefined,
                });
            } catch {
                if (cancelled) return;
                setLeagueWinners({});
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [token, leagueId, selectedSeasonId, league]);

    const handlePermanentDelete = useCallback(async (match: Match) => {
        // if (!window.confirm('Are you sure you want to PERMANENTLY delete this match? This action cannot be undone and all match data will be lost forever.')) {
        //     return;
        // }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/${match.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                throw new Error('Failed to permanently delete match');
            }

            setLeague(prev => prev ? {
                ...prev,
                matches: (prev.matches ?? []).filter(mm => mm.id !== match.id)
            } : prev);

            toast.success('Match permanently deleted');
            fetchLeagueDetails();

        } catch (error) {
            console.error('Permanent delete failed:', error);
            toast.error('Failed to permanently delete match');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const tryHardDeleteFromDialog = useCallback(async () => {
        if (!archivedActionMatch) return;
        const ok = window.confirm('Permanently delete this archived match? It cannot be restored later, but player stats/history will stay preserved.');
        if (!ok) return;
        await handlePermanentDelete(archivedActionMatch);
        setArchivedActionOpen(false);
    }, [archivedActionMatch, handlePermanentDelete]);

    const handlePermanentDeleteFromArchivedCard = useCallback(async (match: Match) => {
        const ok = window.confirm('Permanently delete this archived match? It cannot be restored later, but player stats/history will stay preserved.');
        if (!ok) return;
        await handlePermanentDelete(match);
    }, [handlePermanentDelete]);

    // Example stat change handler
    const handleStatChange = (stat: keyof typeof stats, increment: number, max: number) => {
        setStats(prev => {
            const newValue = Math.max(0, (prev[stat] || 0) + increment);
            return { ...prev, [stat]: Math.min(newValue, max) };
        });
    };

    // Save stats to backend
    const handleSaveStats = async () => {
        if (!activeMatchId || !token) return;

        setIsSubmittingStats(true);
        try {
            console.log('💾 Saving stats for match:', activeMatchId);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/${activeMatchId}/stats`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    goals: stats.goals,
                    assists: stats.assists,
                    cleanSheets: stats.cleanSheets,
                    penalties: stats.penalties,
                    freeKicks: stats.freeKicks,
                    defence: stats.defence,
                    impact: stats.impact,
                }),
            });

            // Check if endpoint exists (not 404 or 405)
            if (response.status === 404 || response.status === 405) {
                // Endpoint doesn't exist, show error message
                console.error('Stats saving is not available yet. Please contact the administrator.');
                toast.error('Stats saving is not available yet. Please contact the administrator.');
                setStatsDialogOpen(false);
                return;
            }

            const data = await response.json();
            if (data.success) {
                console.log('✅ Stats saved successfully!');

                // Close dialog
                setStatsDialogOpen(false);

                // 🔄 Fetch fresh data from backend
                console.log('🔄 Forcing immediate data refresh...');
                await fetchLeagueDetails();

                // 📢 Dispatch event for other components
                window.dispatchEvent(new CustomEvent('match-updated', {
                    detail: { matchId: activeMatchId }
                }));

                // 📢 Dispatch stats-updated event so leaderboards refresh immediately
                window.dispatchEvent(new CustomEvent('match-stats-updated', {
                    detail: {
                        matchId: activeMatchId,
                        leagueId: league?.id || leagueId || '',
                        playerId: data.playerId || (user?.id ? String(user.id) : '')
                    }
                }));

                // ✅ Show success message
                toast.success('stats update');

                console.log('✨ Match updated and refreshed!');
            } else {
                toast.error(data.message || 'Failed to save stats.');
            }
        } catch (err: unknown) {
            console.error('❌ Error saving stats:', err instanceof Error ? err.message : String(err));
            toast.error('Failed to save stats. Please try again.');
        } finally {
            setIsSubmittingStats(false);
        }
    };

    // Get match goals for the active match
    const getMatchGoals = () => {
        if (!activeMatchId || !league) return 10; // Default fallback
        const match = league.matches.find(m => m.id === activeMatchId);
        if (!match) return 10;
        return (match.homeTeamGoals || 0) + (match.awayTeamGoals || 0);
    };

    // Add this useEffect to sync tab param with section
    useEffect(() => {
        const tab = searchParams?.get('tab');
        if (
            tab === 'table' ||
            tab === 'leaderboard' ||
            tab === 'members' ||
            tab === 'matches' ||
            tab === 'results' ||
            tab === 'dream-team'
        ) {
            setSection(tab);
        }
    }, [searchParams]);

    // Sync season from query param (used after creating a new season and redirecting)
    useEffect(() => {
        const querySeasonId = typeof searchParams?.get === 'function'
            ? (searchParams.get('seasonId') || '').trim()
            : '';
        if (querySeasonId && querySeasonId !== lastSyncedQuerySeasonIdRef.current) {
            lastSyncedQuerySeasonIdRef.current = querySeasonId;
            setSelectedSeasonId(querySeasonId);
        }
    }, [searchParams]);

    // Show creation message after redirect from season creation flows
    useEffect(() => {
        if (seasonCreatedToastShownRef.current) return;
        const createdFlag = searchParams?.get('seasonCreated');
        if (createdFlag !== '1') return;
        const queryMessage = (searchParams?.get('seasonCreatedMsg') || '').trim();
        toast.success(queryMessage || 'New season created successfully!');
        seasonCreatedToastShownRef.current = true;
    }, [searchParams]);

    useEffect(() => {
        const handleSignOutStart = () => setIsSigningOut(true);
        window.addEventListener('app-signout-start', handleSignOutStart as EventListener);
        return () => {
            window.removeEventListener('app-signout-start', handleSignOutStart as EventListener);
        };
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            setIsSigningOut(false);
        } else {
            setError(null);
        }
    }, [isAuthenticated]);

    // Declare isMember and isAdmin here so they are available for useEffect and logic below
    const isMember = league && league.members && user && league.members.some((m: User) => m.id === user.id);
    const isAdmin = !!(
        league &&
        user &&
        (
            (league.adminId && league.adminId === user.id) ||
            (league.administrators && league.administrators.some((a: User) => a.id === user.id))
        )
    );


    const handleCloseTeamModal = () => {
        setTeamModalOpen(false);
        setSelectedMatch(null);
    };

    console.log('league', league)

    const fetchLeagueDetails = useCallback(async (seasonIdOverride?: string | null, options?: { silent?: boolean }) => {
        const effectiveToken = token || (typeof window !== 'undefined' ? TokenManager.getInstance().getToken() : null);
        if (!effectiveToken || !leagueId || isSigningOut) return;
        setLeagueDetailsAttempted(true);
        if (!league && !options?.silent) {
            setLeagueDetailsLoading(true);
        }
        try {
            setError((prev) => (prev === 'No leagues found' ? prev : null));
            console.log("Fetching league details - Token:", effectiveToken ? 'Present' : 'Missing');

            // Add cache busting to force fresh data from backend
            const params = new URLSearchParams();
            params.set('_t', String(Date.now()));
            const seasonIdForRequest = seasonIdOverride ?? selectedSeasonId;
            if (seasonIdForRequest) {
                params.set('seasonId', seasonIdForRequest);
            }
            const queryString = params.toString();
            const encodedLeagueId = encodeURIComponent(leagueId);
            const detailUrls = [
                `${process.env.NEXT_PUBLIC_API_URL}/leagues/${encodedLeagueId}?${queryString}`,
                `${process.env.NEXT_PUBLIC_API_URL}/api/leagues/${encodedLeagueId}?${queryString}`,
            ];

            let data: Record<string, unknown> | null = null;
            let lastStatus = 0;
            let lastMessage = '';

            for (let attempt = 0; attempt < 2; attempt++) {
                const currentAuthToken = token || (typeof window !== 'undefined' ? TokenManager.getInstance().getToken() : null) || effectiveToken;
                if (!currentAuthToken) break;

                for (const url of detailUrls) {
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${currentAuthToken}`
                        },
                        cache: 'no-store',
                    });

                    const payloadUnknown: unknown = await response.json().catch(() => ({}));
                    const payloadRecord = isRecord(payloadUnknown) ? payloadUnknown : {};

                    if (response.ok && (payloadRecord.success !== false || payloadRecord.league)) {
                        data = payloadRecord;
                        break;
                    }

                    lastStatus = response.status;
                    const apiMessage = String(
                        payloadRecord.message ??
                        payloadRecord.error ??
                        payloadRecord.detail ??
                        ''
                    ).trim();
                    if (apiMessage) lastMessage = apiMessage;
                }

                if (data) break;

                // On first failure if 401/403 or network issue, attempt storage token recovery and retry once after 250ms delay
                if (attempt === 0) {
                    const recovered = typeof window !== 'undefined' ? TokenManager.getInstance().getToken() : null;
                    if (recovered) {
                        console.log('🔄 Token recovered via TokenManager, retrying league details fetch...');
                        await new Promise((resolve) => setTimeout(resolve, 250));
                        continue;
                    }
                }
            }

            if (!data) {
                const messageNormalized = lastMessage.toLowerCase();
                if (messageNormalized.includes('invalid seasonid')) {
                    setSelectedSeasonId(null);
                    void fetchLeagueDetails(null);
                    return;
                }
                const looksLikeAccessIssue =
                    lastStatus === 401 ||
                    lastStatus === 403 ||
                    lastStatus === 404 ||
                    messageNormalized.includes('access') ||
                    messageNormalized.includes('not found');

                if (looksLikeAccessIssue) {
                    // Avoid flashing fetch/access errors during signout/auth transition.
                    if (isSigningOut || !isAuthenticated) return;

                    // If user has no leagues, show friendly empty-state message.
                    if (hasLoadedAllLeagues && !allLeaguesFetchFailed && allLeagues.length === 0) {
                        setLeague(null);
                        setError('No leagues found');
                        return;
                    }

                    // If user has other leagues, fallback redirect effect will switch to a valid league.
                    setError(null);
                    return;
                }

                throw new Error(lastMessage || `HTTP error! status: ${lastStatus}`);
            }

            console.log('League details fetched successfully from API', data);
            const leaguePayload = data.league;
            if (data.success !== false && leaguePayload && typeof leaguePayload === 'object') {
                const fetchedLeague = leaguePayload as League & { seasons?: unknown[] };
                setError(null);
                console.log('Fresh League Data Received:', fetchedLeague);
                console.log('Total Matches:', fetchedLeague.matches?.length || 0);
                console.log('Total Members:', fetchedLeague.members?.length || 0);
                console.log('Members:', fetchedLeague.members?.map((m: User) => `${m.firstName} ${m.lastName}`));
                console.log('Seasons:', fetchedLeague.seasons);
                if (Array.isArray(fetchedLeague.seasons)) {
                    fetchedLeague.seasons.forEach((seasonUnknown: unknown, i: number) => {
                        const seasonRecord = (seasonUnknown && typeof seasonUnknown === 'object')
                            ? (seasonUnknown as Record<string, unknown>)
                            : {};
                        const members = Array.isArray(seasonRecord.members)
                            ? seasonRecord.members.map((memberUnknown: unknown) => {
                                const memberRecord = (memberUnknown && typeof memberUnknown === 'object')
                                    ? (memberUnknown as Record<string, unknown>)
                                    : {};
                                return `${String(memberRecord.firstName || '')} ${String(memberRecord.lastName || '')}`.trim();
                            })
                            : 'no members array';
                        console.log(`  Season ${i + 1}:`, {
                            id: seasonRecord.id,
                            seasonNumber: seasonRecord.seasonNumber,
                            members
                        });
                    });
                }
                if (fetchedLeague.matches) {
                    fetchedLeague.matches.forEach((match: Match, index: number) => {
                        console.log(`  Match ${index + 1}: ${match.homeTeamName} vs ${match.awayTeamName} | Status: ${match.status}`);
                    });
                }
                setLeague(fetchedLeague);
                if (leagueId) {
                    leagueMemoryCache.set(leagueId, fetchedLeague);
                    try {
                        sessionStorage.setItem(`cf_league_${leagueId}`, JSON.stringify(fetchedLeague));
                    } catch {}
                }

                // 🔄 Fetch fresh league XP map for all members
                try {
                    const seasonParam = seasonIdForRequest ? `&seasonId=${encodeURIComponent(seasonIdForRequest)}` : '';
                    const xpUrl = `${process.env.NEXT_PUBLIC_API_URL}/leagues/${encodedLeagueId}/xp?refresh=1&_t=${Date.now()}${seasonParam}`;
                    const xpResponse = await fetch(xpUrl, {
                        headers: { 'Authorization': `Bearer ${effectiveToken}` },
                        cache: 'no-store',
                    });
                    if (xpResponse.ok) {
                        const xpData = await xpResponse.json();
                        const parsedXpMap = normalizeXPMapPayload(xpData);
                        setUserLeagueXP(parsedXpMap);
                    }
                } catch (xpErr) {
                    console.warn('⚠️ Could not fetch league XP map:', xpErr);
                }

                try {
                    const preferredId = String((fetchedLeague as unknown as Record<string, unknown>)?.id || leagueId || '').trim();
                    if (preferredId) {
                        localStorage.setItem('preferredLeagueId', preferredId);
                    }
                } catch {
                    // ignore localStorage errors
                }
                console.log('League state updated successfully');
            } else {
                const apiMessage = String(data.message || data.error || '').trim();
                const normalizedMessage = apiMessage.toLowerCase();
                const looksLikeAccessIssue =
                    normalizedMessage.includes('access') ||
                    normalizedMessage.includes('not found');
                if (looksLikeAccessIssue && hasLoadedAllLeagues && !allLeaguesFetchFailed && allLeagues.length === 0) {
                    setLeague(null);
                    setError('No leagues found');
                } else if (looksLikeAccessIssue) {
                    setError(null);
                } else {
                    setError(apiMessage || 'Failed to fetch league details');
                }
                console.error('API Error:', data.message);
            }
        } catch (error) {
            console.error('Error fetching league details:', error);
            if (isSigningOut || !isAuthenticated) return;
            setError('Unable to connect to server. Please check if the server is running or try again.');
        } finally {
            if (!isSigningOut) setLeagueDetailsLoading(false);
        }
    }, [
        leagueId,
        token,
        selectedSeasonId,
        isSigningOut,
        isAuthenticated,
        hasLoadedAllLeagues,
        allLeaguesFetchFailed,
        allLeagues.length,
        normalizeXPMapPayload
    ]);

    useEffect(() => {
        const cached = leagueId ? leagueMemoryCache.get(leagueId) : null;
        if (cached) {
            setLeague(cached);
            setLeagueDetailsLoading(false);
        } else {
            setLeague(null);
            setLeagueDetailsLoading(true);
        }
        setError(null);
        setLeagueDetailsAttempted(false);
    }, [leagueId]);

    // Fetch dream team data based on selected league and season
    const fetchDreamTeam = useCallback(async () => {
        if (!leagueId || !token) return;

        setDreamTeamLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('leagueId', leagueId);
            if (selectedSeasonId) {
                params.append('seasonId', selectedSeasonId);
            }
            params.append('_t', Date.now().toString());

            const url = `${process.env.NEXT_PUBLIC_API_URL}/dream-team?${params.toString()}`;
            console.log('🔍 Fetching Dream Team from URL:', url);

            const response = await fetch(
                url,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            console.log('📡 Dream Team HTTP Status:', response.status, response.statusText);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Dream Team API Response:', data);
                if (data?.dreamTeam) {
                    setDreamTeam(data.dreamTeam);
                } else {
                    console.warn('⚠️ Dream Team API Response did not contain dreamTeam field:', data);
                }
            } else {
                console.error('❌ Dream Team API returned error status:', response.status);
                const errorText = await response.text().catch(() => '');
                console.error('❌ Error response body:', errorText);
            }
        } catch (error) {
            console.error('❌ Error fetching dream team:', error);
        } finally {
            setDreamTeamLoading(false);
        }
    }, [leagueId, token, selectedSeasonId]);

    // Fetch dream team when section changes to 'dream-team' or when season changes
    useEffect(() => {
        if (section === 'dream-team') {
            fetchDreamTeam();
        }
    }, [section, fetchDreamTeam]);

    useEffect(() => {
        // Wait for auth to finish loading, user to be authenticated, and token to be available
        if (authLoading || isSigningOut) return;
        const currentToken = token || (typeof window !== 'undefined' ? TokenManager.getInstance().getToken() : null);
        if (!currentToken || !leagueId) return;
        fetchLeagueDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, authLoading, isAuthenticated, leagueId]);

    // 🎯 Auto-select active season when league data loads
    useEffect(() => {
        if (!league || selectedSeasonId) return; // Skip if already selected

        if (Array.isArray(seasonOptions) && seasonOptions.length > 0) {
            const activeFromSeasonsApi = seasonOptions.find((season) => {
                const status = String(season.status || '').trim().toLowerCase();
                return season.isActive === true || season.active === true || status === 'active' || status === 'current' || status === 'ongoing';
            });
            const seasonToPick = activeFromSeasonsApi || seasonOptions[0];
            if (seasonToPick?.id) {
                console.log('🎯 Auto-selecting season from seasons API:', seasonToPick.id, seasonToPick.seasonNumber);
                setSelectedSeasonId(seasonToPick.id);
                void fetchLeagueDetails(seasonToPick.id);
                return;
            }
        }

        const currentSeasonUnknown = (league as unknown as Record<string, unknown>)?.currentSeason;
        if (currentSeasonUnknown && typeof currentSeasonUnknown === 'object') {
            const currentSeasonObj = currentSeasonUnknown as Record<string, unknown>;
            const currentSeasonId = String(currentSeasonObj?.id || '').trim();
            if (currentSeasonId) {
                console.log('🎯 Auto-selecting current season from backend:', currentSeasonId);
                setSelectedSeasonId(currentSeasonId);
                void fetchLeagueDetails(currentSeasonId);
                return;
            }
        }

        const seasonsUnknown = (league as unknown as Record<string, unknown>)?.seasons;
        if (!Array.isArray(seasonsUnknown) || seasonsUnknown.length === 0) return;

        // Find active season
        const activeSeason = seasonsUnknown.find((s: unknown) => {
            const seasonObj = s as Record<string, unknown>;
            return seasonObj?.isActive === true;
        });

        if (activeSeason) {
            const seasonObj = activeSeason as Record<string, unknown>;
            const activeSeasonId = String(seasonObj.id || '');
            console.log('🎯 Auto-selecting active season:', activeSeasonId);
            setSelectedSeasonId(activeSeasonId);
            void fetchLeagueDetails(activeSeasonId);
        } else {
            // If no active season found, select the latest season (highest season number)
            const sortedSeasons = [...seasonsUnknown].sort((a: unknown, b: unknown) => {
                const aNum = (a as Record<string, unknown>)?.seasonNumber as number || 0;
                const bNum = (b as Record<string, unknown>)?.seasonNumber as number || 0;
                return bNum - aNum; // Descending order
            });

            if (sortedSeasons.length > 0) {
                const latestSeason = sortedSeasons[0] as Record<string, unknown>;
                const latestSeasonId = String(latestSeason.id || '');
                console.log('🎯 Auto-selecting latest season:', latestSeasonId);
                setSelectedSeasonId(latestSeasonId);
                void fetchLeagueDetails(latestSeasonId);
            }
        }
    }, [league, selectedSeasonId, seasonOptions, fetchLeagueDetails]);

    // 🔄 Refresh league data silently when page becomes visible (e.g., user comes back from settings)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && token && leagueId) {
                console.log('🔄 Page became visible, refreshing league data silently...');
                void fetchLeagueDetails(undefined, { silent: true });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchLeagueDetails, token, leagueId]);

    // 🔄 Auto-refresh: Event-driven (immediate) + Periodic check every 1 minute
    // This handles both manual operations AND automatic match completion detection
    useCombinedMatchRefresh(fetchLeagueDetails, 60000); // Check every 60 seconds

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleOptimisticMatchUpdate = (evt: Event) => {
            const detail = (evt as CustomEvent<{
                matchId?: string;
                homeTeamGoals?: number;
                awayTeamGoals?: number;
                status?: string;
                match?: Partial<Match>;
            }>).detail;

            if (!detail?.matchId || detail.homeTeamGoals === undefined || detail.awayTeamGoals === undefined) return;

            setLeague(prev => {
                if (!prev?.matches?.length) return prev;
                const updatedMatches = prev.matches.map(match => {
                    if (String(match.id) !== String(detail.matchId)) return match;
                    return {
                        ...match,
                        ...detail.match,
                        homeTeamGoals: Number(detail.homeTeamGoals),
                        awayTeamGoals: Number(detail.awayTeamGoals),
                        status: detail.status || detail.match?.status || match.status,
                        updatedAt: detail.match?.updatedAt || new Date().toISOString(),
                    };
                });
                return { ...prev, matches: updatedMatches };
            });
        };

        window.addEventListener('match-updated', handleOptimisticMatchUpdate);
        return () => window.removeEventListener('match-updated', handleOptimisticMatchUpdate);
    }, []);

    // Keep a lightweight local clock so fixtures/results can transition automatically.
    useEffect(() => {
        const timer = window.setInterval(() => {
            setMatchClockMs(Date.now());
        }, 30000);
        return () => window.clearInterval(timer);
    }, []);

    // Professional access logic: allow if user and profile player have ever shared ANY league
    useEffect(() => {
        if (!user || !profilePlayerId) {
            setCheckedCommonLeague(true);
            setHasCommonLeague(false);
            return;
        }
        Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => res.json()),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/players/${profilePlayerId}/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => res.json())
        ]).then(([userData, playerData]) => {
            const userLeagues = [
                ...(userData.user.leagues || []),
                ...(userData.user.administeredLeagues || [])
            ].map(l => l.id);
            const profilePlayerLeagues = (playerData.data?.leagues || []).map((l: User) => l.id);
            const hasOverlap = userLeagues.some((id: string) => profilePlayerLeagues.includes(id));
            setHasCommonLeague(hasOverlap);
            setCheckedCommonLeague(true);
        }).catch(() => {
            setHasCommonLeague(false);
            setCheckedCommonLeague(true);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, profilePlayerId, token]);

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

    // Helper: determine if a league is completed (kept in sync with All Leagues card logic)
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

        // Season-level fallback kept in sync with All Leagues (exclude archived seasons).
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

    // Fetch all user leagues for dropdown
    const fetchAllLeagues = useCallback(async () => {
        if (!token) return;

        try {
            setHasLoadedAllLeagues(false);
            setAllLeaguesFetchFailed(false);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/status?refresh=1&_t=${Date.now()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                cache: 'no-store',
            });

            if (!response.ok) {
                setAllLeagues([]);
                setAllLeaguesFetchFailed(true);
                return;
            }

            interface LeagueData {
                id: string | number;
                name: string;
                maxGames?: number;
                matches?: Match[];
                isComplete?: boolean;
                isCompleted?: boolean;
                isLocked?: boolean;
                status?: string;
                active?: boolean;
                [key: string]: unknown;
            }

            interface AuthStatusResponse {
                success: boolean;
                user?: {
                    adminLeagues?: LeagueData[];
                    administeredLeagues?: LeagueData[];
                    leagues?: LeagueData[];
                };
            }

            const data: AuthStatusResponse = await response.json();

            if (data.success && data.user) {
                // Get admin league IDs
                const adminLeaguesArr: LeagueData[] = data.user.adminLeagues || data.user.administeredLeagues || [];
                const adminLeagueIds = new Set<string>(
                    adminLeaguesArr
                        .map((l: LeagueData) => String(l?.id))
                        .filter((id: string) => id !== 'undefined')
                );

                // Get member league IDs
                const memberLeagueIds = new Set<string>(
                    (data.user.leagues || [])
                        .map((l: LeagueData) => String(l?.id))
                        .filter((id: string) => id !== 'undefined')
                );

                // Combine and remove duplicates
                const userLeagues: LeagueData[] = [
                    ...(data.user.leagues || []),
                    ...adminLeaguesArr
                ];

                const uniqueLeaguesMap = new Map<string, LeagueData>();
                userLeagues.forEach(league => {
                    const id = String(league.id);
                    if (!uniqueLeaguesMap.has(id)) {
                        uniqueLeaguesMap.set(id, league);
                    }
                });

                // Convert to League type with role assignment (no extra API calls)
                const simpleLeagues: League[] = Array.from(uniqueLeaguesMap.values()).map((l: LeagueData) => {
                    const leagueId = String(l.id);
                    const role: 'ADMIN' | 'MEMBER' | undefined = adminLeagueIds.has(leagueId)
                        ? 'ADMIN'
                        : (memberLeagueIds.has(leagueId) ? 'MEMBER' : undefined);

                    return {
                        ...l,
                        id: leagueId,
                        name: l.name || '',
                        inviteCode: '',
                        createdAt: typeof l.createdAt === 'string' ? l.createdAt : (l.createdAt ? String(l.createdAt) : ''),
                        members: [],
                        administrators: [],
                        matches: l.matches || [],
                        active: l.active ?? true,
                        maxGames: l.maxGames || 20,
                        showPoints: true,
                        userRole: role,
                        isComplete: l.isComplete,
                        isCompleted: l.isCompleted,
                        isLocked: l.isLocked,
                        status: l.status,
                    } as League;
                });

                // Keep leagues visible for switching, including completed ones.
                const visibleLeagues = simpleLeagues.filter(
                    (l) => l.archived !== true
                );

                // Sort newest to oldest by createdAt timestamp or Mongo ObjectId
                visibleLeagues.sort((a, b) => {
                    const getCreatedTs = (l: any): number => {
                        if (!l) return 0;
                        const rawDate = l.createdAt || l.created_at || l.createdDate || l.date || l.updatedAt;
                        if (rawDate) {
                            const t = new Date(rawDate).getTime();
                            if (Number.isFinite(t) && t > 0) return t;
                        }
                        const idStr = String(l.id || l._id || '').trim();
                        if (/^[0-9a-fA-F]{24}$/.test(idStr)) {
                            const timestamp = parseInt(idStr.substring(0, 8), 16) * 1000;
                            if (Number.isFinite(timestamp) && timestamp > 0) return timestamp;
                        }
                        if (Array.isArray(l.matches) && l.matches.length > 0) {
                            const matchDates = l.matches
                                .map((m: any) => new Date(m?.date || m?.createdAt || 0).getTime())
                                .filter((t: number) => Number.isFinite(t) && t > 0);
                            if (matchDates.length > 0) {
                                return Math.max(...matchDates);
                            }
                        }
                        return 0;
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

                setAllLeagues(visibleLeagues);
                if (visibleLeagues.length === 0) {
                    try {
                        localStorage.removeItem('preferredLeagueId');
                        localStorage.removeItem('prefferdLeagueId');
                    } catch {
                        // ignore localStorage errors
                    }
                }

                // Debug log
                console.log('[League Detail] Fetched leagues:', {
                    total: simpleLeagues.length,
                    visible: visibleLeagues.length,
                    hidden: simpleLeagues.length - visibleLeagues.length
                });
            } else {
                setAllLeagues([]);
            }
        } catch (error) {
            console.error('Error fetching leagues:', error);
            setAllLeagues([]);
            setAllLeaguesFetchFailed(true);
        } finally {
            setHasLoadedAllLeagues(true);
        }
    }, [token, leagueIsCompleted]);

    useEffect(() => {
        if (!token) return;
        const refreshAllLeagues = () => {
            void fetchAllLeagues();
        };
        const handleLeagueMutation = (evt: Event) => {
            const customEvt = evt as CustomEvent<{ leagueId?: string | number }>;
            const changedLeagueId = String(customEvt?.detail?.leagueId ?? '').trim();
            if (!changedLeagueId || String(leagueId) === changedLeagueId) {
                void fetchLeagueDetails();
            }
            refreshAllLeagues();
        };

        window.addEventListener('league-created', handleLeagueMutation as EventListener);
        window.addEventListener('league-updated', handleLeagueMutation as EventListener);
        window.addEventListener('league-deleted', handleLeagueMutation as EventListener);
        window.addEventListener('league-joined', handleLeagueMutation as EventListener);

        return () => {
            window.removeEventListener('league-created', handleLeagueMutation as EventListener);
            window.removeEventListener('league-updated', handleLeagueMutation as EventListener);
            window.removeEventListener('league-deleted', handleLeagueMutation as EventListener);
            window.removeEventListener('league-joined', handleLeagueMutation as EventListener);
        };
    }, [token, leagueId, fetchLeagueDetails, fetchAllLeagues]);

    // Fetch XP for all users in this league (from API)
    // Also refetch when league details refresh so table XP does not stay stale.
    useEffect(() => {
        async function fetchXP() {
            if (!league?.id) return;
            try {
                const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
                const params = new URLSearchParams();
                if (selectedSeasonId) params.append('seasonId', selectedSeasonId);
                params.append('_t', String(Date.now())); // Cache-bust XP endpoint for immediate latest value.
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/leagues/${league.id}/xp?${params.toString()}`,
                    { headers, cache: 'no-store' }
                );
                if (!res.ok) {
                    // Silently handle 404 - endpoint may not exist yet
                    console.warn(`XP endpoint returned ${res.status}, using empty map`);
                    setUserLeagueXP({});
                    return;
                }
                const json = await res.json().catch(() => ({}));
                console.log('📊 XP API response:', JSON.stringify(json));
                if (json?.success === undefined || json?.success) {
                    const xpMap = normalizeXPMapPayload(json);
                    console.log('📊 XP map set to (normalized):', JSON.stringify(xpMap));
                    setUserLeagueXP(xpMap);
                } else {
                    console.log('📊 XP API returned success=false, using empty map');
                    setUserLeagueXP({});
                }
            } catch {
                setUserLeagueXP({});
            }
        }
        fetchXP();
    }, [league?.id, league?.updatedAt, league?.matches, league?.members, token, selectedSeasonId, normalizeXPMapPayload]);

    // Fetch all leagues for dropdown
    useEffect(() => {
        if (!token) {
            setAllLeagues([]);
            setHasLoadedAllLeagues(false);
            setAllLeaguesFetchFailed(false);
            return;
        }
        fetchAllLeagues();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    useEffect(() => {
        if (!token || !leagueId || isSigningOut || allLeagues.length === 0) return;
        if (!hasLoadedAllLeagues || leagueDetailsLoading || !leagueDetailsAttempted) return;

        // If current route league already loaded, do not auto-switch to another league.
        if (league && String(league.id) === String(leagueId)) return;

        const currentLeagueExists = allLeagues.some((leagueItem) => String(leagueItem.id) === String(leagueId));
        if (currentLeagueExists) return;

        let fallbackLeagueId = '';
        try {
            const preferredLeagueId = localStorage.getItem('preferredLeagueId');
            if (preferredLeagueId && allLeagues.some((leagueItem) => String(leagueItem.id) === String(preferredLeagueId))) {
                fallbackLeagueId = preferredLeagueId;
            }
        } catch {
            // ignore localStorage errors
        }

        if (!fallbackLeagueId) {
            fallbackLeagueId = String(allLeagues[0]?.id || '');
        }
        if (!fallbackLeagueId) return;

        try {
            localStorage.setItem('preferredLeagueId', fallbackLeagueId);
        } catch {
            // ignore localStorage errors
        }

        setError(null);
        router.replace(`/league/${encodeURIComponent(fallbackLeagueId)}?tab=table`, { scroll: false });
    }, [token, leagueId, allLeagues, router, league, isSigningOut, hasLoadedAllLeagues, leagueDetailsLoading, leagueDetailsAttempted]);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || !token || !leagueId || isSigningOut) return;
        if (!hasLoadedAllLeagues || allLeaguesFetchFailed) return;
        if (allLeagues.length > 0 || league) return;
        setError('No leagues found');
    }, [
        authLoading,
        isAuthenticated,
        token,
        leagueId,
        isSigningOut,
        hasLoadedAllLeagues,
        allLeaguesFetchFailed,
        allLeagues.length,
        league
    ]);

    // Fetch seasons from dedicated endpoint to avoid stale/incomplete seasons lists on league payload
    useEffect(() => {
        if (!token || !leagueId) {
            setSeasonOptions([]);
            return;
        }

        let cancelled = false;

        const parseSeasonNumber = (seasonLike: Record<string, unknown>): number => {
            const rawNum = seasonLike.seasonNumber;
            const direct = typeof rawNum === 'number'
                ? rawNum
                : (typeof rawNum === 'string' ? Number(rawNum) : NaN);
            if (Number.isFinite(direct) && direct > 0) return direct;

            const label = String(seasonLike.name || '');
            const hits = label.match(/\d+/g);
            if (hits && hits.length > 0) {
                const parsed = Number(hits[hits.length - 1]);
                if (Number.isFinite(parsed) && parsed > 0) return parsed;
            }
            return 0;
        };

        const fetchSeasonsOptions = async () => {
            try {
                const endpoints = [
                    `${process.env.NEXT_PUBLIC_API_URL}/leagues/${leagueId}/seasons?_t=${Date.now()}`,
                    `${process.env.NEXT_PUBLIC_API_URL}/api/leagues/${leagueId}/seasons?_t=${Date.now()}`,
                ];

                const extractRawSeasons = (payloadUnknown: unknown): unknown[] => {
                    const payloadRecord = (payloadUnknown && typeof payloadUnknown === 'object')
                        ? (payloadUnknown as Record<string, unknown>)
                        : {};
                    const nestedData = (payloadRecord.data && typeof payloadRecord.data === 'object')
                        ? (payloadRecord.data as Record<string, unknown>)
                        : {};

                    return Array.isArray(payloadUnknown)
                        ? payloadUnknown
                        : (
                            Array.isArray(payloadRecord.seasons)
                                ? payloadRecord.seasons
                                : (
                                    Array.isArray(payloadRecord.data)
                                        ? payloadRecord.data
                                        : (Array.isArray(nestedData.seasons) ? nestedData.seasons : [])
                                )
                        );
                };

                const allRawSeasons: unknown[] = [];
                for (const url of endpoints) {
                    try {
                        const response = await fetch(url, {
                            headers: { 'Authorization': `Bearer ${token}` },
                            cache: 'no-store',
                        });
                        if (!response.ok) continue;
                        const payloadUnknown: unknown = await response.json().catch(() => ({}));
                        allRawSeasons.push(...extractRawSeasons(payloadUnknown));
                    } catch {
                        // try next endpoint
                    }
                }

                if (allRawSeasons.length === 0) {
                    if (!cancelled) setSeasonOptions([]);
                    return;
                }

                const parsed = allRawSeasons
                    .map((seasonRaw) => (typeof seasonRaw === 'object' && seasonRaw !== null ? (seasonRaw as Record<string, unknown>) : null))
                    .filter((seasonRaw): seasonRaw is Record<string, unknown> => Boolean(seasonRaw))
                    .map((seasonRaw) => ({
                        id: String(seasonRaw.id ?? seasonRaw._id ?? '').trim(),
                        seasonNumber: parseSeasonNumber(seasonRaw),
                        isActive: typeof seasonRaw.isActive === 'boolean' ? seasonRaw.isActive : undefined,
                        active: typeof seasonRaw.active === 'boolean' ? seasonRaw.active : undefined,
                        locked: typeof seasonRaw.locked === 'boolean' ? seasonRaw.locked : undefined,
                        archived: typeof seasonRaw.archived === 'boolean' ? seasonRaw.archived : undefined,
                        endDate: typeof seasonRaw.endDate === 'string' ? seasonRaw.endDate : null,
                        status: typeof seasonRaw.status === 'string' ? seasonRaw.status : null,
                        inviteCode: typeof seasonRaw.inviteCode === 'string'
                            ? seasonRaw.inviteCode.trim()
                            : (typeof seasonRaw.invite_code === 'string' ? seasonRaw.invite_code.trim() : ''),
                        seasonInviteCode: typeof seasonRaw.seasonInviteCode === 'string'
                            ? seasonRaw.seasonInviteCode.trim()
                            : (typeof seasonRaw.season_invite_code === 'string' ? seasonRaw.season_invite_code.trim() : ''),
                        inviteLink: typeof seasonRaw.inviteLink === 'string'
                            ? seasonRaw.inviteLink.trim()
                            : (typeof seasonRaw.invite_link === 'string' ? seasonRaw.invite_link.trim() : ''),
                    }))
                    .filter((season) => season.id && season.seasonNumber > 0)
                    .filter((season, index, arr) => arr.findIndex((s) => s.id === season.id) === index)
                    .sort((a, b) => {
                        if ((a.isActive === true) !== (b.isActive === true)) return a.isActive ? -1 : 1;
                        if ((a.active === true) !== (b.active === true)) return a.active ? -1 : 1;
                        return b.seasonNumber - a.seasonNumber;
                    });

                if (!cancelled) {
                    setSeasonOptions(parsed);
                }
            } catch (error) {
                if (!cancelled) setSeasonOptions([]);
                console.error('Error fetching seasons options:', error);
            }
        };

        void fetchSeasonsOptions();
        return () => {
            cancelled = true;
        };
    }, [token, leagueId]);


    const handleBackToAllLeagues = () => {
        router.push('/all-leagues');
    };

    // Handle league dropdown open/close
    const handleLeaguesDropdownOpen = (event: React.MouseEvent<HTMLElement>) => {
        setLeaguesDropdownAnchor(event.currentTarget);
        setLeaguesDropdownOpen(true);
    };

    const handleLeaguesDropdownClose = () => {
        setLeaguesDropdownOpen(false);
        setLeaguesDropdownAnchor(null);
    };

    // Handle season dropdown open/close
    const handleSeasonDropdownOpen = (event: React.MouseEvent<HTMLElement>) => {
        setSeasonDropdownAnchor(event.currentTarget);
        setSeasonDropdownOpen(true);
    };

    const handleSeasonDropdownClose = () => {
        setSeasonDropdownOpen(false);
        setSeasonDropdownAnchor(null);
    };

    // Handle season selection
    const handleSeasonSelect = async (seasonId: string) => {
        console.log('🎯 Season selected:', seasonId);
        const normalizedSeasonId = String(seasonId).trim();
        setSelectedSeasonId(normalizedSeasonId);
        lastSyncedQuerySeasonIdRef.current = normalizedSeasonId;
        handleSeasonDropdownClose();

        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem('preferredSeasonId', normalizedSeasonId);
                if (leagueId) {
                    localStorage.setItem('preferredSeasonId_' + leagueId, normalizedSeasonId);
                }
            }
        } catch { }

        // Keep URL in sync so tab switching and refreshes retain the selected season
        try {
            const currentTab = encodeURIComponent(section || 'table');
            router.replace(`/league/${encodeURIComponent(leagueId)}?tab=${currentTab}&seasonId=${encodeURIComponent(normalizedSeasonId)}`, { scroll: false });
        } catch { }

        // 🔄 Refresh league data to get latest season settings
        if (token && leagueId) {
            console.log('🔄 Refreshing league data after season selection...');
            await fetchLeagueDetails(normalizedSeasonId);
        }
    };

    // Handle league selection
    const handleLeagueSelect = async (selectedLeagueId: string) => {
        if (selectedLeagueId !== leagueId) {
            // Reset season selection so the new league shows all its matches
            setSelectedSeasonId(null);
            setLeague(null);
            setError(null);
            setLeagueDetailsAttempted(false);
            setLeagueDetailsLoading(true);
            try {
                localStorage.setItem('preferredLeagueId', String(selectedLeagueId));
                localStorage.removeItem(`preferredSeasonId_${selectedLeagueId}`);
                localStorage.removeItem('preferredSeasonId');
            } catch {
                // ignore localStorage errors
            }

            // Keep user on the same tab when switching leagues.
            const tabToKeep = encodeURIComponent(section);
            router.replace(`/league/${encodeURIComponent(selectedLeagueId)}?tab=${tabToKeep}`, { scroll: false });
        }
        handleLeaguesDropdownClose();
    };

    const handleToggleAvailability = async (matchId: string, markAvailable: boolean) => {
        if (!user) {
            const loginErr = 'Please login to mark availability';
            setError(loginErr);
            toast.error(loginErr, { position: 'top-center' });
            return;
        }

        const action = markAvailable ? 'available' : 'unavailable';
        const currentUserId = user?.id || (user as any)?._id;

        // 🛡️ GUARD: If user is ALREADY in the target status, do NOT send request to backend
        const targetMatch = (league?.matches || []).find((m: Match) => m.id === matchId) || (filteredLeague?.matches || []).find((m: Match) => m.id === matchId);
        if (targetMatch && currentUserId) {
            const isAlreadyAvailable = (targetMatch.availableUsers || []).some((u: any) => (u?.id || u?._id) && String(u?.id || u?._id) === String(currentUserId));
            const isAlreadyUnavailable = (targetMatch.unavailableUsers || []).some((u: User) => (u?.id || (u as any)?._id) && String(u?.id || (u as any)?._id) === String(currentUserId));

            if ((markAvailable && isAlreadyAvailable) || (!markAvailable && isAlreadyUnavailable)) {
                const alreadyMsg = markAvailable
                    ? 'You are already available for this match.'
                    : 'You are already unavailable for this match.';
                toast.success(alreadyMsg, { position: 'top-center' });
                return;
            }
        }

        setAvailabilityLoading(prev => ({ ...prev, [matchId]: true }));

        try {
            console.log('🔄 Toggling availability with action:', action);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/matches/${matchId}/availability?action=${action}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${await response.text()}`);
            }

            const data = await response.json();
            console.log('✅ Response from server:', data);

            if (data.success) {
                // 🔄 Dispatch event for auto-refresh
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('match-updated', {
                        detail: { matchId, available: action === 'available' }
                    }));
                    console.log('📢 match-updated event dispatched');
                }

                // 🔄 Fetch fresh data from backend
                console.log('🔄 Fetching fresh league data...');
                await fetchLeagueDetails();

                const successMsg = action === 'available'
                    ? '✅ You are now available for this match.'
                    : '❌ You are now unavailable for this match.';
                toast.success(successMsg, { position: 'top-center' });
                setToastMessage(successMsg);

                console.log('✅ Availability updated successfully!');
            } else {
                throw new Error(data.message || 'Failed to update availability');
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('❌ Error updating availability:', err);
            setError(errorMessage || 'Failed to connect to server');
            toast.error(errorMessage || 'Failed to update availability', { position: 'top-center' });
        } finally {
            setAvailabilityLoading(prev => ({ ...prev, [matchId]: false }));
        }
    };

    const handleUpdateLeague = async (updatedData: Partial<League & { admins: string[] }>) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leagues/${leagueId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });
            const data = await response.json();
            if (data.success) {
                toast.success('League updated successfully!');
                await fetchLeagueDetails();
                setIsSettingsOpen(false);
            } else {
                toast.error(data.message || 'Failed to update league');
            }
        } catch (error) {
            console.error('Error updating league:', error);
            toast.error('An error occurred while updating the league.');
        }
    };

    const handleDeleteLeague = async () => {
        if (window.confirm('Are you sure you want to delete this league? This action cannot be undone.')) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leagues/${leagueId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    toast.success('League deleted successfully.');
                    router.push('/all-leagues');
                } else {
                    const data = await response.json();
                    toast.error(data.message || 'Failed to delete league.');
                }
            } catch (error) {
                console.error('Error deleting league:', error);
                toast.error('An error occurred while deleting the league.');
            }
        }
    };

    const isMatchCreationAllowed = React.useMemo(() => {
        if (!league) return false;
        if (league.active === false) return false;
        if (leagueIsCompleted(league)) return false;

        const seasonsArr = (league as any)?.seasons || (Array.isArray(seasonOptions) ? seasonOptions : []);
        if (Array.isArray(seasonsArr) && seasonsArr.length > 0) {
            if (selectedSeasonId) {
                const sel = seasonsArr.find((s: any) => String(s?.id) === String(selectedSeasonId));
                if (sel && (sel.isActive === false || sel.archived === true)) return false;
            } else {
                const activeSeasonExists = seasonsArr.some((s: any) => s?.isActive !== false && !s?.archived);
                if (!activeSeasonExists) return false;
            }
        }
        return true;
    }, [league, selectedSeasonId, seasonOptions, leagueIsCompleted]);

    const inactiveLeagueMatchMessage = React.useMemo(() => {
        if (league && leagueIsCompleted(league)) {
            return 'This league is completed. New matches are disabled for completed leagues.';
        }
        if (league && selectedSeasonId) {
            const seasonsArr = (league as any)?.seasons || (Array.isArray(seasonOptions) ? seasonOptions : []);
            if (Array.isArray(seasonsArr)) {
                const sel = seasonsArr.find((s: any) => String(s?.id) === String(selectedSeasonId));
                if (sel && sel.isActive === false) {
                    return 'Cannot create a new match because this season is inactive. Please make the season active before creating new matches.';
                }
            }
        }
        return 'This season or league is currently inactive. To create new matches, please reactivate it in League Settings.';
    }, [league, selectedSeasonId, seasonOptions, leagueIsCompleted]);

    // Current season number resolver (no `any`; checks currentSeason, active `seasons`, computedStatus, and top-level fields)
    const resolveSeasonNumber = (l?: League | null): number | undefined => {
        const toNum = (v: unknown): number | undefined => {
            const n = typeof v === 'number' ? v : (typeof v === 'string' ? Number(v) : NaN);
            return Number.isFinite(n) ? n : undefined;
        };

        if (!l) return undefined;

        // Helper to safely read number-like field from an object by keys
        const getNumberLike = (obj: unknown, keys: string[]): number | undefined => {
            if (!obj || typeof obj !== 'object') return undefined;
            const rec = obj as Record<string, unknown>;
            for (const k of keys) {
                const n = toNum(rec[k]);
                if (typeof n === 'number') {
                    if (n > 0) return n;
                    if (n === 0) return 1; // zero-based index -> Season 1
                }
            }
            return undefined;
        };

        // 0) First check currentSeason from backend (user's actual season they are member of)
        const currentSeasonFromBackend = (l as unknown as Record<string, unknown>)?.currentSeason;
        if (currentSeasonFromBackend && typeof currentSeasonFromBackend === 'object') {
            const fromCurrent = getNumberLike(currentSeasonFromBackend, ['seasonNumber']);
            if (typeof fromCurrent === 'number') return fromCurrent;
        }

        // 1) Check `l.seasons` - now only contains seasons user is member of
        const seasonsUnknown = (l as unknown as Record<string, unknown>)?.seasons;
        if (Array.isArray(seasonsUnknown) && seasonsUnknown.length > 0) {
            const seasonRecords = seasonsUnknown
                .map((season) => (season && typeof season === 'object' ? (season as Record<string, unknown>) : null))
                .filter((season): season is Record<string, unknown> => Boolean(season));

            const activeSeason = seasonRecords.find((season) => {
                const status = String(season.status || '').trim().toLowerCase();
                return (
                    season.isActive === true ||
                    season.active === true ||
                    status === 'active' ||
                    status === 'current' ||
                    status === 'ongoing'
                );
            });
            const latestSeason = [...seasonRecords].sort((a, b) => {
                const aNum = toNum(a.seasonNumber) ?? 0;
                const bNum = toNum(b.seasonNumber) ?? 0;
                return bNum - aNum;
            })[0];
            const fromUserSeason = getNumberLike(activeSeason || latestSeason, ['seasonNumber']);
            if (typeof fromUserSeason === 'number') return fromUserSeason;
        }

        // 2) Check `computedStatus`
        const comp = (l as unknown as Record<string, unknown>)?.computedStatus;
        const fromComputed = getNumberLike(comp, ['currentSeasonNumber', 'seasonNumber', 'seasonIndex', 'season']);
        if (typeof fromComputed === 'number') return fromComputed;

        // 3) Check top-level fields
        const fromTop = getNumberLike(l as unknown as Record<string, unknown>, ['currentSeasonNumber', 'seasonNumber', 'seasonIndex', 'season']);
        if (typeof fromTop === 'number') return fromTop;

        return undefined;
    };

    const currentSeasonNumber = React.useMemo(() => resolveSeasonNumber(league) ?? 1, [league]);

    // Get selected season number from selectedSeasonId
    const selectedSeasonNumber = React.useMemo(() => {
        if (!selectedSeasonId || !league) return currentSeasonNumber;
        const normalizedSelectedId = String(selectedSeasonId).trim();

        // 1) First check dedicated seasonOptions (fresh/authoritative)
        const seasonFromOptions = seasonOptions.find((season) =>
            String(season.id).trim() === normalizedSelectedId
        );
        if (seasonFromOptions && seasonFromOptions.seasonNumber > 0) {
            return seasonFromOptions.seasonNumber;
        }

        // 2) Check league.seasons
        const seasonsUnknown = (league as unknown as Record<string, unknown>)?.seasons;
        if (Array.isArray(seasonsUnknown)) {
            const season = seasonsUnknown.find((s: unknown) => {
                const seasonObj = s as Record<string, unknown>;
                const sid = String(seasonObj?.id ?? seasonObj?._id ?? '').trim();
                return sid === normalizedSelectedId;
            });
            if (season) {
                const seasonObj = season as Record<string, unknown>;
                const num = Number(seasonObj?.seasonNumber);
                if (Number.isFinite(num) && num > 0) return num;
            }
        }

        // 3) Check league.currentSeason
        const currentSeasonObj = (league as unknown as Record<string, unknown>)?.currentSeason as Record<string, unknown> | undefined;
        if (currentSeasonObj && String(currentSeasonObj.id ?? currentSeasonObj._id ?? '').trim() === normalizedSelectedId) {
            const num = Number(currentSeasonObj.seasonNumber);
            if (Number.isFinite(num) && num > 0) return num;
        }

        // 4) Check if selectedSeasonId directly matches a seasonNumber
        if (/^\d+$/.test(normalizedSelectedId)) {
            const parsedNum = Number(normalizedSelectedId);
            if (parsedNum > 0 && seasonOptions.some(s => s.seasonNumber === parsedNum)) {
                return parsedNum;
            }
        }

        return currentSeasonNumber;
    }, [selectedSeasonId, league, currentSeasonNumber, seasonOptions]);

    const seasonLabel = React.useMemo(() => (selectedSeasonNumber ? `(#Season ${selectedSeasonNumber})` : ''), [selectedSeasonNumber]);

    const readSeasonInviteCode = useCallback((seasonLike: unknown): string => {
        if (!seasonLike || typeof seasonLike !== 'object') return '';
        const seasonRecord = seasonLike as Record<string, unknown>;
        const codeCandidate = seasonRecord.inviteCode
            ?? seasonRecord.seasonInviteCode
            ?? seasonRecord.invite_code
            ?? seasonRecord.season_invite_code
            ?? seasonRecord.code;
        return typeof codeCandidate === 'string' ? codeCandidate.trim() : '';
    }, []);

    const inviteCodeForSelectedSeason = React.useMemo(() => {
        if (selectedSeasonId) {
            const seasonFromOptions = seasonOptions.find((season) => season.id === selectedSeasonId);
            const codeFromOptions = readSeasonInviteCode(seasonFromOptions);
            if (codeFromOptions) return codeFromOptions;
        }

        const seasonsUnknown = (league as unknown as Record<string, unknown>)?.seasons;
        if (Array.isArray(seasonsUnknown)) {
            const selectedSeasonFromLeague = selectedSeasonId
                ? seasonsUnknown.find((seasonUnknown) => {
                    const seasonRecord = (seasonUnknown && typeof seasonUnknown === 'object')
                        ? (seasonUnknown as Record<string, unknown>)
                        : {};
                    return String(seasonRecord.id || '').trim() === selectedSeasonId;
                })
                : seasonsUnknown[0];

            const selectedSeasonCode = readSeasonInviteCode(selectedSeasonFromLeague);
            if (selectedSeasonCode) return selectedSeasonCode;
        }

        const currentSeasonUnknown = (league as unknown as Record<string, unknown>)?.currentSeason;
        const currentSeasonCode = readSeasonInviteCode(currentSeasonUnknown);
        if (currentSeasonCode) return currentSeasonCode;

        return String(league?.inviteCode || '').trim();
    }, [league, selectedSeasonId, seasonOptions, readSeasonInviteCode]);

    const inviteCodeDisplay = inviteCodeForSelectedSeason || '-';
    const inviteSeasonLabel = `${league?.name || 'League'} / season ${selectedSeasonNumber || 1}`;
    const invitePlayersMessage = inviteCodeForSelectedSeason
        ? `Invites players to ${inviteSeasonLabel} using the code`
        : `Invite code unavailable for ${inviteSeasonLabel}`;

    const handleCopySeasonInviteCode = useCallback(async () => {
        const code = inviteCodeForSelectedSeason.trim();
        if (!code) {
            toast.error('Invite code is not available for this season yet.');
            return;
        }
        const leagueName = league?.name?.trim() || 'League';
        const seasonNum = selectedSeasonNumber || 1;
        const inviteUrl = `https://championfootballer.co.uk/home?nvitecode=${encodeURIComponent(code)}`;
        const shareText = buildLeagueSeasonInviteText(leagueName, seasonNum, code, inviteUrl);
        try {
            const copied = await copyTextToClipboard(shareText);
            if (copied) {
                toast.success('Invite copied successfully.');
            } else {
                toast.error('Unable to copy invite right now.');
            }
        } catch {
            toast.error('Unable to copy invite right now.');
        }
    }, [inviteCodeForSelectedSeason, league?.name, selectedSeasonNumber]);

    const handleShareSeasonInvite = useCallback(async () => {
        const code = inviteCodeForSelectedSeason.trim();
        if (!code) {
            toast.error('Invite code is not available for this season yet.');
            return;
        }
        const leagueName = league?.name?.trim() || 'League';
        const seasonNum = selectedSeasonNumber || 1;
        const inviteUrl = `https://championfootballer.co.uk/home?nvitecode=${encodeURIComponent(code)}`;
        const shareText = buildLeagueSeasonInviteText(leagueName, seasonNum, code, inviteUrl);
        shareContent({
            title: `Join ${leagueName} / season ${seasonNum} | Champion Footballer`,
            customFullText: shareText,
            text: shareText,
            url: inviteUrl,
        });
    }, [inviteCodeForSelectedSeason, league?.name, selectedSeasonNumber]);

    // Check if selected season is active
    const isSelectedSeasonActive = React.useMemo(() => {
        if (!selectedSeasonId || !league) return true; // Default to active if no season selected
        const seasonsUnknown = (league as unknown as Record<string, unknown>)?.seasons;
        if (Array.isArray(seasonsUnknown)) {
            const season = seasonsUnknown.find((s: unknown) => {
                const seasonObj = s as Record<string, unknown>;
                return String(seasonObj?.id || '') === selectedSeasonId;
            });
            if (season) {
                return isSeasonLikeActive(season);
            }
        }
        const seasonFromOptions = seasonOptions.find((season) => season.id === selectedSeasonId);
        if (seasonFromOptions) {
            return isSeasonLikeActive(seasonFromOptions);
        }
        return true; // Default to active
    }, [selectedSeasonId, league, seasonOptions, isSeasonLikeActive]);

    const isMatchSeasonActiveForStats = useCallback((match: Match): boolean => {
        const matchSeasonId = normalizeEntityId((match as unknown as Record<string, unknown>)?.seasonId);
        if (!matchSeasonId) return selectedSeasonId ? isSelectedSeasonActive : true;

        const seasonFromOptions = seasonOptions.find((season) => season.id === matchSeasonId);
        if (seasonFromOptions) return isSeasonLikeActive(seasonFromOptions);

        const seasonsUnknown = (league as unknown as Record<string, unknown>)?.seasons;
        if (Array.isArray(seasonsUnknown)) {
            const seasonFromLeague = seasonsUnknown.find((seasonUnknown) => {
                const seasonRecord = (seasonUnknown && typeof seasonUnknown === 'object')
                    ? (seasonUnknown as Record<string, unknown>)
                    : {};
                return normalizeEntityId(seasonRecord.id ?? seasonRecord._id) === matchSeasonId;
            });
            if (seasonFromLeague) return isSeasonLikeActive(seasonFromLeague);
        }

        return true;
    }, [league, seasonOptions, selectedSeasonId, isSelectedSeasonActive, isSeasonLikeActive]);

    const hasLegacyUnseasonedMatches = React.useMemo(() => {
        return (league?.matches || []).some((match) => {
            const seasonId = normalizeEntityId((match as unknown as Record<string, unknown>)?.seasonId);
            return !seasonId;
        });
    }, [league?.matches]);

    // Filter matches and members based on selected season
    const filteredLeague = React.useMemo(() => {
        console.log('🔄 filteredLeague useMemo triggered');
        console.log('   - league exists:', !!league);
        console.log('   - selectedSeasonId:', selectedSeasonId);

        if (!league) {
            console.log('❌ No league, returning null');
            return null;
        }

        if (!selectedSeasonId) {
            console.log('ℹ️ No season selected, returning league without archived matches');
            return {
                ...league,
                matches: (league.matches || []).filter(m => !m.archived || Boolean(league.archived)),
            };
        }

        console.log('🔍 Filtering league for season:', selectedSeasonId);

        // Filter matches by seasonId
        console.log('🔍 All matches in league:', (league.matches || []).length);
        (league.matches || []).forEach((match, index) => {
            const matchSeasonId = (match as unknown as Record<string, unknown>)?.seasonId;
            console.log(`   Match ${index + 1}: ${match.homeTeamName} vs ${match.awayTeamName} | seasonId: ${matchSeasonId} | status: ${match.status}`);
        });

        const isSeasonOrLeagueArchived = Boolean(league.archived) || (Array.isArray((league as any)?.seasons) && (league as any).seasons.some((s: any) => String(s?.id || '') === selectedSeasonId && Boolean(s?.archived)));

        const filteredMatches = (league.matches || []).filter(match => {
            const matchSeasonId = (match as unknown as Record<string, unknown>)?.seasonId;
            const matches = String(matchSeasonId || '') === selectedSeasonId;
            const notArchived = !match.archived || isSeasonOrLeagueArchived;
            if (!matches) {
                console.log(`   ❌ Match ${match.homeTeamName} vs ${match.awayTeamName} excluded (seasonId: ${matchSeasonId} vs ${selectedSeasonId})`);
            }
            return matches && notArchived;
        });

        console.log('✅ Filtered matches:', filteredMatches.length);
        if (filteredMatches.length > 0) {
            filteredMatches.forEach(m => console.log(`   ✅ ${m.homeTeamName} vs ${m.awayTeamName}`));
        }

        // Get season object and its members
        const seasonsUnknown = (league as unknown as Record<string, unknown>)?.seasons;
        let filteredMembers: User[] = [];
        let seasonMembersPayloadProvided = false;
        let declinedIdsFromSeason = new Set<string>();

        console.log('🔍 All seasons:', seasonsUnknown);

        if (Array.isArray(seasonsUnknown)) {
            const selectedSeason = seasonsUnknown.find((s: unknown) => {
                const seasonObj = s as Record<string, unknown>;
                return String(seasonObj?.id || '') === selectedSeasonId;
            });

            console.log('🔍 Selected season object:', selectedSeason);

            if (selectedSeason) {
                const seasonObj = selectedSeason as Record<string, unknown>;
                const membersUnknown = seasonObj?.members;
                const extractDeclinedIds = (seasonRecord: Record<string, unknown>): Set<string> => {
                    const keys = ['declinedMembers', 'declinedUserIds', 'declinedUsers', 'rejectedMembers', 'removedMembers'];
                    const ids = new Set<string>();
                    keys.forEach((key) => {
                        const raw = seasonRecord[key];
                        if (!Array.isArray(raw)) return;
                        raw.forEach((entry) => {
                            if (entry == null) return;
                            if (typeof entry === 'string' || typeof entry === 'number') {
                                const id = String(entry).trim();
                                if (id) ids.add(id);
                                return;
                            }
                            if (typeof entry === 'object') {
                                const rec = entry as Record<string, unknown>;
                                const candidate = rec.id ?? rec.userId ?? rec.memberId ?? rec.playerId;
                                const id = candidate == null ? '' : String(candidate).trim();
                                if (id) ids.add(id);
                            }
                        });
                    });
                    return ids;
                };
                const declinedIds = extractDeclinedIds(seasonObj);
                declinedIdsFromSeason = declinedIds;

                console.log('🔍 Selected season ID:', seasonObj?.id);
                console.log('🔍 Selected season number:', seasonObj?.seasonNumber);
                console.log('🔍 Season members from backend (raw):', membersUnknown);
                console.log('🔍 Is array?', Array.isArray(membersUnknown));
                console.log('🔍 Length:', Array.isArray(membersUnknown) ? membersUnknown.length : 0);

                if (Array.isArray(membersUnknown)) {
                    seasonMembersPayloadProvided = true;
                    // Use season members from backend (including empty arrays)
                    console.log('🔍 Member IDs from season:', membersUnknown.map((m: unknown) => {
                        const memberObj = m as Record<string, unknown>;
                        return `${String(memberObj?.id ?? '')}: ${String(memberObj?.firstName ?? '')} ${String(memberObj?.lastName ?? '')}`;
                    }));
                    const seasonMemberIds = new Set(
                        membersUnknown
                            .map((m: unknown) => normalizeEntityId((m as Record<string, unknown>)?.id))
                            .filter((id) => id !== '')
                    );
                    console.log('🔍 All league members:', league.members.map(m => `${m.id}: ${m.firstName} ${m.lastName}`));
                    const membersFromSeason = league.members.filter((member: User) => seasonMemberIds.has(normalizeEntityId(member.id)));
                    filteredMembers = membersFromSeason;
                    console.log('✅ Using season members from backend:', filteredMembers.length);
                    console.log('✅ Filtered member names:', filteredMembers.map(m => `${m.firstName} ${m.lastName}`));
                }
            }
        }

        // If no season members found from backend or array was empty, get players who played in matches
        if (filteredMembers.length === 0) {
            console.log('⚠️ No season members from backend, using match players');
            const playersInSeasonSet = new Set<string>();
            filteredMatches.forEach(match => {
                match.homeTeamUsers?.forEach(user => playersInSeasonSet.add(user.id));
                match.awayTeamUsers?.forEach(user => playersInSeasonSet.add(user.id));
            });

            // If no one played in matches yet, show all league members for this season
            if (playersInSeasonSet.size === 0) {
                console.log('⚠️ No matches played yet, showing all league members');
                filteredMembers = league.members.filter((member: User) => !declinedIdsFromSeason.has(normalizeEntityId(member.id)));
            } else {
                filteredMembers = league.members.filter((member: User) => playersInSeasonSet.has(member.id));
                console.log('✅ Players from matches:', filteredMembers.length);
            }
        }

        filteredMembers = filteredMembers.filter(isRegisteredPlayerRecord);

        console.log('✅ Final filtered members:', filteredMembers.length, filteredMembers.map(m => `${m.firstName} ${m.lastName}`));

        // Extract season settings (maxGames, showPoints)
        let seasonMaxGames = league.maxGames;
        let seasonShowPoints = league.showPoints;

        if (Array.isArray(seasonsUnknown)) {
            const selectedSeason = seasonsUnknown.find((s: unknown) => {
                const seasonObj = s as Record<string, unknown>;
                return String(seasonObj?.id || '') === selectedSeasonId;
            });

            if (selectedSeason) {
                const seasonObj = selectedSeason as Record<string, unknown>;

                // Handle maxGames
                seasonMaxGames = typeof seasonObj.maxGames === 'number' ? seasonObj.maxGames : league.maxGames;

                // Handle showPoints - be more flexible with types (boolean, number, string)
                if (seasonObj.showPoints !== undefined && seasonObj.showPoints !== null) {
                    if (typeof seasonObj.showPoints === 'boolean') {
                        seasonShowPoints = seasonObj.showPoints;
                    } else if (typeof seasonObj.showPoints === 'number') {
                        seasonShowPoints = seasonObj.showPoints === 1;
                    } else if (typeof seasonObj.showPoints === 'string') {
                        seasonShowPoints = seasonObj.showPoints.toLowerCase() === 'true';
                    } else {
                        // If it's some other type, convert to boolean
                        seasonShowPoints = Boolean(seasonObj.showPoints);
                    }
                } else {
                    seasonShowPoints = league.showPoints;
                }

                console.log('✅ Season settings applied:', {
                    seasonId: selectedSeasonId,
                    maxGames: seasonMaxGames,
                    showPoints: seasonShowPoints,
                    rawShowPoints: seasonObj.showPoints,
                    showPointsType: typeof seasonObj.showPoints,
                    leagueShowPoints: league.showPoints
                });
            }
        }

        return {
            ...league,
            matches: filteredMatches,
            members: filteredMembers,
            maxGames: seasonMaxGames,
            showPoints: seasonShowPoints
        };
    }, [league, selectedSeasonId]);

    const tableData: TableData[] = React.useMemo(() => {
        console.log('🎯 TABLE DATA COMPUTATION START');
        console.log('   filteredLeague exists:', !!filteredLeague);
        console.log('   filteredLeague members:', filteredLeague?.members?.length);
        console.log('   filteredLeague members names:', filteredLeague?.members?.map(m => `${m.firstName} ${m.lastName}`));
        console.log('   filteredLeague matches:', filteredLeague?.matches?.length);

        if (!filteredLeague) {
            console.log('❌ No filteredLeague, returning empty array');
            return [];
        }

        const playerStats = new Map<string, TableData>();
        const adminId = filteredLeague.administrators?.[0]?.id;

        console.log('   Admin ID:', adminId);

        // Initialize ALL filtered members first (whether they played or not)
        filteredLeague.members.forEach((member: User & { xp?: number; rankChange?: number }) => {
            const memberRankChange = typeof (member as any)?.rankChange === 'number'
                ? (member as any).rankChange
                : selectedSeasonId && typeof (league as any)?.seasonRankChanges?.[member.id] === 'number'
                ? (league as any).seasonRankChanges[member.id]
                : selectedSeasonId && typeof (league as any)?.seasonRankChanges?.[`${selectedSeasonId}_${member.id}`] === 'number'
                ? (league as any).seasonRankChanges[`${selectedSeasonId}_${member.id}`]
                : typeof (league as any)?.rankChanges?.[member.id] === 'number'
                ? (league as any).rankChanges[member.id]
                : undefined;

            playerStats.set(member.id, {
                id: member.id,
                name: `${member.firstName} ${member.lastName}`,
                played: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                goalDifference: 0,
                winPercentage: '0%',
                isAdmin: member.id === adminId,
                profilePicture: member.profilePicture || null,
                xp: getLeagueXpForMember(member.id, member.xp),
                motmCount: typeof motmCounts[member.id] === 'number' ? motmCounts[member.id] : 0,
                rankChange: memberRankChange,
            });
        });

        console.log('   Initialized players:', playerStats.size);

        // Process matches to build stats for players who played in this season
        filteredLeague.matches
            .filter(m => !m.archived || Boolean(league?.archived))
            .filter(m => isResultMatch(m) && m.homeTeamGoals != null && m.awayTeamGoals != null)
            .forEach(match => {
                const homeWon = match.homeTeamGoals! > match.awayTeamGoals!;
                const awayWon = match.awayTeamGoals! > match.homeTeamGoals!;
                const isDraw = match.homeTeamGoals === match.awayTeamGoals;
                const processPlayer = (p: User, isHome: boolean) => {
                    // Player should already be in stats map, just update their stats
                    const stats = playerStats.get(p.id);
                    if (!stats) {
                        console.warn(`⚠️ Player ${p.firstName} ${p.lastName} played but not in filtered members!`);
                        return;
                    }
                    const goalsFor = isHome ? Number(match.homeTeamGoals ?? 0) : Number(match.awayTeamGoals ?? 0);
                    const goalsAgainst = isHome ? Number(match.awayTeamGoals ?? 0) : Number(match.homeTeamGoals ?? 0);
                    stats.played++;
                    stats.goalsFor += goalsFor;
                    stats.goalsAgainst += goalsAgainst;
                    stats.goalDifference = stats.goalsFor - stats.goalsAgainst;
                    if ((isHome && homeWon) || (!isHome && awayWon)) stats.wins++;
                    else if (isDraw) stats.draws++;
                    else stats.losses++;
                };
                match.homeTeamUsers.forEach(p => processPlayer(p, true));
                match.awayTeamUsers.forEach(p => processPlayer(p, false));
            });

        console.log('   Total players in stats map:', playerStats.size);
        console.log('   Players:', Array.from(playerStats.keys()).map(id => {
            const p = playerStats.get(id);
            return `${p?.name} (played: ${p?.played})`;
        }));

        const list = Array.from(playerStats.values()).map(s => ({
            ...s,
            winPercentage: s.played ? `${Math.round((s.wins / s.played) * 100)}%` : '0%'
        }));

        // Rank exactly like league standings:
        // 1) players who actually played come first
        // 2) Score (XP if showPoints else PTS)
        // 3) Wins DESC
        // 4) Games Played ASC
        // 5) Goal Difference DESC
        // 6) Goals For DESC
        // 7) Name ASC
        const useXpScoring = filteredLeague?.showPoints === true;
        list.sort((a, b) => {
            const aPlayed = a.played > 0 ? 1 : 0;
            const bPlayed = b.played > 0 ? 1 : 0;
            if (bPlayed !== aPlayed) return bPlayed - aPlayed;
            const aPts = (a.wins ?? 0) * 3 + (a.draws ?? 0);
            const bPts = (b.wins ?? 0) * 3 + (b.draws ?? 0);
            const aScore = useXpScoring ? (a.xp ?? 0) : aPts;
            const bScore = useXpScoring ? (b.xp ?? 0) : bPts;
            if (bScore !== aScore) return bScore - aScore;
            if ((b.wins ?? 0) !== (a.wins ?? 0)) return (b.wins ?? 0) - (a.wins ?? 0);
            if ((a.played ?? 0) !== (b.played ?? 0)) return (a.played ?? 0) - (b.played ?? 0);
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
            return (a.name || '').localeCompare(b.name || '');
        });

        // Compute fallback prior ranks if rankChange is not provided by server
        const resultMatches = (filteredLeague.matches || [])
            .filter(m => !m.archived || Boolean(league?.archived))
            .filter(m => isResultMatch(m) && m.homeTeamGoals != null && m.awayTeamGoals != null);

        let fallbackPriorRanks: Map<string, number> | null = null;
        if (resultMatches.length > 0) {
            const sortedMatches = [...resultMatches].sort((a, b) => {
                const dateA = new Date((a as any).date || (a as any).createdAt || 0).getTime();
                const dateB = new Date((b as any).date || (b as any).createdAt || 0).getTime();
                return dateA - dateB;
            });
            const priorMatches = sortedMatches.slice(0, sortedMatches.length - 1);
            const priorStats = new Map<string, { id: string; name: string; played: number; wins: number; draws: number; xp: number }>();
            filteredLeague.members.forEach((m: User) => {
                priorStats.set(m.id, {
                    id: m.id,
                    name: `${m.firstName} ${m.lastName}`,
                    played: 0,
                    wins: 0,
                    draws: 0,
                    xp: 0,
                });
            });
            priorMatches.forEach(match => {
                const homeWon = match.homeTeamGoals! > match.awayTeamGoals!;
                const awayWon = match.awayTeamGoals! > match.homeTeamGoals!;
                const isDraw = match.homeTeamGoals === match.awayTeamGoals;
                const proc = (p: User, isHome: boolean) => {
                    const st = priorStats.get(p.id);
                    if (!st) return;
                    st.played++;
                    if ((isHome && homeWon) || (!isHome && awayWon)) st.wins++;
                    else if (isDraw) st.draws++;
                };
                (match.homeTeamUsers || []).forEach(p => proc(p, true));
                (match.awayTeamUsers || []).forEach(p => proc(p, false));

                // Accumulate prior XP from match statistics
                const pStats = (match as any).playerStats || (match as any).matchStatistics || [];
                if (Array.isArray(pStats)) {
                    pStats.forEach((stat: any) => {
                        const uid = String(stat.user_id || stat.userId || '');
                        const st = priorStats.get(uid);
                        if (st) {
                            st.xp += Number(stat.xpAwarded ?? stat.xp_awarded ?? stat.xp ?? 0) || 0;
                        }
                    });
                }
            });
            const priorList = Array.from(priorStats.values());
            const useXp = filteredLeague?.showPoints === true;
            priorList.sort((a, b) => {
                const aPlayed = a.played > 0 ? 1 : 0;
                const bPlayed = b.played > 0 ? 1 : 0;
                if (bPlayed !== aPlayed) return bPlayed - aPlayed;
                const aScore = useXp ? (a.xp ?? 0) : ((a.wins ?? 0) * 3 + (a.draws ?? 0));
                const bScore = useXp ? (b.xp ?? 0) : ((b.wins ?? 0) * 3 + (b.draws ?? 0));
                if (bScore !== aScore) return bScore - aScore;
                if ((b.wins ?? 0) !== (a.wins ?? 0)) return (b.wins ?? 0) - (a.wins ?? 0);
                if ((a.played ?? 0) !== (b.played ?? 0)) return (a.played ?? 0) - (b.played ?? 0);
                return (a.name || '').localeCompare(b.name || '');
            });
            fallbackPriorRanks = new Map<string, number>();
            priorList.forEach((p, idx) => fallbackPriorRanks!.set(p.id, idx + 1));
        }

        const finalList = list.map((p, idx) => {
            const currRank = idx + 1;
            let rankChange = p.rankChange;
            if (typeof rankChange !== 'number') {
                if (fallbackPriorRanks && fallbackPriorRanks.has(p.id)) {
                    const prevRank = fallbackPriorRanks.get(p.id)!;
                    rankChange = prevRank - currRank;
                } else {
                    rankChange = 0;
                }
            }
            // Sanity check: Player in 1st place can never have a negative rank change (drop)
            if (currRank === 1 && typeof rankChange === 'number' && rankChange < 0) {
                if (fallbackPriorRanks && fallbackPriorRanks.has(p.id)) {
                    rankChange = Math.max(0, fallbackPriorRanks.get(p.id)! - currRank);
                } else {
                    rankChange = 0;
                }
            }
            return {
                ...p,
                rankChange,
            };
        });

        console.log('   Final tableData length:', finalList.length);
        console.log('   Final tableData:', finalList.map(p => `${p.name} (xp: ${p.xp}, played: ${p.played}, rankChange: ${p.rankChange})`));
        console.log('🎯 TABLE DATA COMPUTATION END');

        return finalList;
        // Recompute when filtered league or stats change
    }, [filteredLeague, filteredLeague?.id, filteredLeague?.members, filteredLeague?.matches, filteredLeague?.administrators, (league as any)?.rankChanges, (league as any)?.seasonRankChanges, leagueWinners, userLeagueXP, motmCounts, matchClockMs, getLeagueXpForMember, isResultMatch, selectedSeasonId]);

    useEffect(() => {
        if (section !== 'table') return;
        const scrollEl = tableScrollRef.current;
        if (!scrollEl) return;

        const handleScrollSync = () => {
            syncTableHorizontalScroll();
        };

        syncTableHorizontalScroll();
        scrollEl.addEventListener('scroll', handleScrollSync, { passive: true });
        window.addEventListener('resize', handleScrollSync);

        return () => {
            scrollEl.removeEventListener('scroll', handleScrollSync);
            window.removeEventListener('resize', handleScrollSync);
        };
    }, [section, tableData.length, filteredLeague?.showPoints, syncTableHorizontalScroll]);

    // Robustly compute MOTM counts locally from match data
    const computeMotmCountsFromMatches = useCallback((members: User[], matches: Match[]): Record<string, number> => {
        const counts: Record<string, number> = {};
        if (!members?.length) return counts;

        const memberIdSet = new Set(members.map(m => normalizeEntityId(m.id)));
        members.forEach(m => { counts[normalizeEntityId(m.id)] = 0; });

        (matches || []).forEach((match) => {
            if (match.archived) return;
            const matchRecord = match as unknown as Record<string, unknown>;

            const voteCounts: Record<string, number> = {};

            // 1) Handle match.votes array
            if (Array.isArray(matchRecord.votes) && matchRecord.votes.length > 0) {
                matchRecord.votes.forEach((v: unknown) => {
                    if (v && typeof v === 'object') {
                        const rec = v as Record<string, unknown>;
                        const cat = String(rec.category || '').toLowerCase().trim();
                        // Only count MOTM category votes (ignore 'defence', 'influence', etc.)
                        if (cat && cat !== 'motm' && cat !== 'man_of_the_match') return;

                        const votedFor = normalizeEntityId(rec.votedForId ?? rec.voted_for_id ?? rec.targetId ?? rec.playerId);
                        if (votedFor) {
                            voteCounts[votedFor] = (voteCounts[votedFor] || 0) + 1;
                        }
                    }
                });
            } else {
                // 2) Handle match.manOfTheMatchVotes map
                const rawVotes = matchRecord.manOfTheMatchVotes ?? matchRecord.manOfMatchVotes;
                if (rawVotes && typeof rawVotes === 'object') {
                    const entries = Object.entries(rawVotes as Record<string, unknown>);
                    if (entries.length > 0) {
                        const valuesAreCounts = entries.every(([, val]) => typeof val === 'number');
                        if (valuesAreCounts) {
                            // { [playerId]: voteCount }
                            entries.forEach(([pid, count]) => {
                                const normPid = normalizeEntityId(pid);
                                const cnt = Number(count) || 0;
                                if (normPid && cnt > 0) {
                                    voteCounts[normPid] = (voteCounts[normPid] || 0) + cnt;
                                }
                            });
                        } else {
                            // { [voterId]: votedForId }
                            entries.forEach(([, votedFor]) => {
                                const normPid = normalizeEntityId(votedFor);
                                if (normPid) {
                                    voteCounts[normPid] = (voteCounts[normPid] || 0) + 1;
                                }
                            });
                        }
                    }
                }
            }

            // Find MOTM winner(s) for this match (strictly max votes > 0)
            let maxVotes = 0;
            const winners = new Set<string>();
            Object.entries(voteCounts).forEach(([pid, count]) => {
                if (count > maxVotes) {
                    maxVotes = count;
                    winners.clear();
                    winners.add(pid);
                } else if (count === maxVotes && maxVotes > 0) {
                    winners.add(pid);
                }
            });

            winners.forEach((pid) => {
                const compPid = pid.startsWith('guest-') ? pid.slice(6) : pid;
                if (memberIdSet.has(pid)) {
                    counts[pid] = (counts[pid] || 0) + 1;
                } else if (memberIdSet.has(compPid)) {
                    counts[compPid] = (counts[compPid] || 0) + 1;
                }
            });
        });

        return counts;
    }, []);

    // Aggregate MOTM votes locally from league.matches synchronously so values render instantly with 0ms delay
    useEffect(() => {
        if (!league?.members?.length || !league?.id) return;
        const matchesToCount = selectedSeasonId && filteredLeague ? filteredLeague.matches : (league.matches || []);
        const localCounts = computeMotmCountsFromMatches(league.members, matchesToCount);
        setMotmCounts(localCounts);
    }, [league?.id, league?.members, selectedSeasonId, filteredLeague?.matches, league?.matches, computeMotmCountsFromMatches]);

    // Fetch MOTM votes per player via quick-view endpoint as an asynchronous background sync
    useEffect(() => {
        if (!league?.id || !token || !league?.members?.length) return;
        let ignore = false;
        const controller = new AbortController();
        (async () => {
            try {
                const seasonParam = selectedSeasonId ? `?seasonId=${encodeURIComponent(selectedSeasonId)}` : '';
                const entries = await Promise.all(
                    league.members.map(async (m) => {
                        try {
                            const res = await fetch(
                                `${process.env.NEXT_PUBLIC_API_URL}/leagues/${encodeURIComponent(league.id)}/player/${encodeURIComponent(m.id)}/quick-view${seasonParam}`,
                                { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal }
                            );
                            if (!res.ok) return [m.id, 0] as const;
                            const data = await res.json();
                            const cnt = Number((data?.motmCount ?? data?.data?.motmCount ?? 0));
                            return [m.id, Number.isFinite(cnt) ? cnt : 0] as const;
                        } catch {
                            return [m.id, 0] as const;
                        }
                    })
                );
                if (!ignore) {
                    const serverCounts = Object.fromEntries(entries);
                    setMotmCounts(prev => {
                        // Only fallback to serverCounts if local calculation is empty
                        const hasLocalData = Object.values(prev).some(v => v > 0);
                        return hasLocalData ? prev : serverCounts;
                    });
                }
            } catch {
                // ignore errors
            }
        })();
        return () => {
            ignore = true;
            controller.abort();
        };
    }, [league?.id, token, selectedSeasonId, league?.members]);

    const [leagueStats, setLeagueStats] = useState<LeagueStatistics | null>(null);
    // ...existing code...

    // REMOVE the old useMemo leagueStats block
    // ...existing code...
    // { deleted useMemo computing leagueStats }
    // ...existing code...

    useEffect(() => {
        if (!league?.id || !token) {
            setLeagueStats(null);
            return;
        }

        let ignore = false;
        const controller = new AbortController();
        setLeagueStats(null);

        (async () => {
            try {
                const params = new URLSearchParams();
                params.set('_t', String(Date.now()));
                if (selectedSeasonId) params.set('seasonId', selectedSeasonId);

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leagues/${league.id}/statistics?${params.toString()}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store',
                    signal: controller.signal,
                });
                if (!res.ok) {
                    // Endpoint may not exist yet - fail silently
                    console.warn('League statistics endpoint returned', res.status);
                    if (!ignore) setLeagueStats(null);
                    return;
                }
                const json = await res.json();
                if (!ignore) {
                    setLeagueStats(json?.success && json.data ? json.data : null);
                }
            } catch (e) {
                if (controller.signal.aborted) return;
                console.warn('Failed to load league statistics', e);
                if (!ignore) setLeagueStats(null);
            }
        })();
        return () => {
            ignore = true;
            controller.abort();
        };
    }, [league?.id, token, selectedSeasonId]);

    // Listen for live match, stats, and league updates to trigger real-time refetch
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleLiveUpdate = (evt: Event) => {
            const detail = (evt as CustomEvent<{ leagueId?: string | number }>).detail;
            const eventLeagueId = String(detail?.leagueId || '').trim();
            if (eventLeagueId && leagueId && eventLeagueId !== String(leagueId)) return;

            setLeaderboardRefreshKey(prev => prev + 1);
            if (typeof fetchLeagueDetails === 'function') {
                fetchLeagueDetails();
            }
        };

        window.addEventListener('match-stats-updated', handleLiveUpdate);
        window.addEventListener('match-updated', handleLiveUpdate);
        window.addEventListener('league-updated', handleLiveUpdate);

        return () => {
            window.removeEventListener('match-stats-updated', handleLiveUpdate);
            window.removeEventListener('match-updated', handleLiveUpdate);
            window.removeEventListener('league-updated', handleLiveUpdate);
        };
    }, [leagueId, fetchLeagueDetails]);

    // Fetch leaderboard for ALL metrics when league, season, or refreshKey changes
    useEffect(() => {
        if (!leagueId || !token) return;
        setLeaderboardLoading(true);

        const metrics = LEADERBOARD_METRIC_CONFIG.map((metric) => metric.key);
        const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/leaderboard`;

        const normalizeLeaderboardPlayers = (
            raw: unknown,
            metricKey: string
        ): Array<{ id: string; name: string; positionType: string; value: number }> => {
            const rawPlayers = Array.isArray((raw as { players?: unknown[] })?.players)
                ? (raw as { players: unknown[] }).players
                : [];
            const seen = new Set<string>();
            return rawPlayers
                .filter((p) => {
                    const rec = (typeof p === 'object' && p !== null) ? p as { id?: string | number } : {};
                    const pid = String(rec?.id ?? '').trim();
                    if (!pid) return false;
                    const lower = pid.toLowerCase();
                    if (lower.startsWith('guest-') || lower.includes('guest_') || lower.includes('guest-')) return false;
                    if (seen.has(pid)) return false;
                    seen.add(pid);
                    return true;
                })
                .map((p) => {
                    const rec = (typeof p === 'object' && p !== null)
                        ? p as { id?: string | number; name?: string; positionType?: string; value?: number | string }
                        : {};
                    const valueNum = Number(rec.value ?? 0);
                    return {
                        id: String(rec.id ?? ''),
                        name: String(rec.name ?? 'Unknown Player'),
                        positionType: String(rec.positionType ?? 'Player'),
                        value: Number.isFinite(valueNum) ? valueNum : 0,
                    };
                })
                .filter((player) => player.value > 0)
                .slice(0, 5);
        };

        Promise.all(
            metrics.map(async (metric) => {
                const urlAll = `${baseUrl}?metric=${metric}&leagueId=${leagueId}&limit=5&refresh=1&_t=${Date.now()}`;
                const urlSeason = selectedSeasonId ? `${urlAll}&seasonId=${selectedSeasonId}` : urlAll;
                const requestInit: RequestInit = {
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };

                try {
                    const primaryRes = await fetch(urlSeason, requestInit);
                    const primaryJson = await primaryRes.json().catch(() => ({}));
                    const players = normalizeLeaderboardPlayers(primaryJson, metric);

                    return { metric, players };
                } catch {
                    return { metric, players: [] as Array<{ id: string; name: string; positionType: string; value: number }> };
                }
            })
        )
            .then(results => {
                const dataByMetric: Record<string, Array<{ id: string; name: string; positionType: string; value: number }>> = {};
                results.forEach(({ metric, players }) => {
                    dataByMetric[metric] = players;
                });
                setAllLeaderboardData(dataByMetric);
                setLeaderboardLoading(false);
            })
            .catch(error => {
                console.error('Error fetching leaderboard:', error);
                setLeaderboardLoading(false);
            });
    }, [leagueId, token, selectedSeasonId, leaderboardRefreshKey]);

    const getAvailabilityCounts = (match: Match) => {
        const homeUsers = match.homeTeamUsers || (match as any).homeTeam || [];
        const awayUsers = match.awayTeamUsers || (match as any).awayTeam || [];
        const squadPlayersCount = homeUsers.length + awayUsers.length;

        const availableCount = match.availableUsers?.length || 0;

        if (squadPlayersCount > 0) {
            const pendingCount = Math.max(0, squadPlayersCount - availableCount);
            return { availableCount, pendingCount };
        }

        const leagueForMatch = league;
        const leagueMembers = leagueForMatch?.members || [];
        const pendingCount = Math.max(0, leagueMembers.length - availableCount);
        return { availableCount, pendingCount };
    };


    const formatMatchDate = (dateString: string) => {
        const matchDate = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Reset time to compare only dates
        const matchDateOnly = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

        if (matchDateOnly.getTime() === todayOnly.getTime()) {
            return 'Today';
        } else if (matchDateOnly.getTime() === yesterdayOnly.getTime()) {
            return 'Yesterday';
        } else {
            return matchDate.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
    };

    // Format match time
    const formatMatchTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatLeagueName = (name: string): string => {
        if (!name) return '';
        return name
            .trim()
            .split(/\s+/)
            .map((word) => (word ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : ''))
            .join(' ');
    };

    const getLeagueTitleFontSize = (name?: string): string => {
        const len = (name ?? '').trim().length;
        if (len >= 30) return '12px';
        if (len >= 26) return '13px';
        if (len >= 22) return '14px';
        if (len >= 18) return '15px';
        return '17px';
    };

    const formatMatchName = (name: string): string => {
        if (!name) return '';
        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        return `${capitalizedName}`;
    };

    // --- Sorting helpers: numeric index desc with date fallback ---
    const getNumericIndex = (m: Match): number | undefined => {
        const keys = ['matchNumber', 'match_no', 'matchIndex', 'index', 'matchNo', 'no'] as const;
        const rec = m as unknown as Record<string, unknown>;
        for (const k of keys) {
            const v = rec[k];
            if (typeof v === 'number' && !Number.isNaN(v)) return v;
            if (typeof v === 'string') {
                const n = parseInt(v, 10);
                if (!Number.isNaN(n)) return n;
            }
        }
        return undefined;
    };

    const getBestDateMs = (m: Match): number => {
        // Prioritize scheduled kickoff time first so same-day later-time matches appear above earlier ones.
        const candidates: Array<string | Date | undefined | null> = [m.start, m.date, m.end, m.updatedAt, m.createdAt];
        for (const c of candidates) {
            if (!c) continue;
            const t = new Date(c).getTime();
            if (!Number.isNaN(t)) return t;
        }
        return 0;
    };

    const compareMatchesDesc = (a: Match, b: Match): number => {
        const ad = getBestDateMs(a);
        const bd = getBestDateMs(b);
        if (ad !== bd) return bd - ad; // most recent first

        const ai = getNumericIndex(a);
        const bi = getNumericIndex(b);
        if (ai !== undefined && bi !== undefined) return bi - ai; // larger index first
        if (ai !== undefined) return -1; // known index before unknown
        if (bi !== undefined) return 1;
        return 0;
    };

    function normalizeMatchStatus(s: unknown): string {
        return typeof s === 'string' ? s.trim().toUpperCase() : '';
    }

    function isResultLikeStatus(s: unknown): boolean {
        const st = normalizeMatchStatus(s);
        const direct = new Set([
            'RESULT_PUBLISHED',
            'RESULT_UPLOADED',
            'REVISION_REQUESTED',
            'RESULT_CONFIRMED',
            'RESULT_APPROVED',
            'RESULT_FINAL',
            'RESULT_COMPLETED',
            'COMPLETED',
            'FINISHED',
            'ENDED'
        ]);
        if (direct.has(st)) return true;
        return st.includes('RESULT') || st.includes('CONFIRM') || st.includes('COMPLETE') || st.includes('FINISH');
    }

    function isAwaitingConfirmationStatus(s: unknown): boolean {
        const st = normalizeMatchStatus(s);
        const awaiting = new Set([
            'RESULT_UPLOADED',
            'REVISION_REQUESTED',
            'RESULT_CONFIRMATION_REQUEST',
            'RESULT_PENDING_CONFIRMATION',
            'AWAITING_CONFIRMATION'
        ]);
        if (awaiting.has(st)) return true;
        return st.includes('UPLOAD') || st.includes('REVISION') || (st.includes('CONFIRM') && !st.includes('CONFIRMED'));
    }

    function parseDateMs(value: unknown): number | null {
        if (value === null || value === undefined) return null;
        const dt = new Date(value as string | number | Date).getTime();
        return Number.isNaN(dt) ? null : dt;
    }

    function getMatchEndTimeMs(match: Match): number | null {
        const explicitEnd = parseDateMs(match.end);
        if (explicitEnd !== null) return explicitEnd;

        const startMs = parseDateMs(match.start) ?? parseDateMs(match.date);
        if (startMs === null) return null;

        const startRecord = match as unknown as Record<string, unknown>;
        const durationCandidates = [
            startRecord.durationMinutes,
            startRecord.duration,
            startRecord.matchDuration,
            startRecord.duration_minutes,
            startRecord.lengthMinutes,
            startRecord.length,
        ];

        for (const candidate of durationCandidates) {
            const n = typeof candidate === 'number' ? candidate : (typeof candidate === 'string' ? Number(candidate) : NaN);
            if (Number.isFinite(n) && n > 0) {
                return startMs + (Math.round(n) * 60 * 1000);
            }
        }

        return startMs + (90 * 60 * 1000);
    }

    function isResultMatch(match: Match): boolean {
        if (isResultLikeStatus(match.status)) return true;
        const endMs = getMatchEndTimeMs(match);
        if (endMs === null) return false;
        return endMs <= matchClockMs;
    }

    function isFixtureMatch(match: Match): boolean {
        return !isResultMatch(match);
    }



    // Add these handlers before the return statement

    const handleRequestDeleteMatch = async (match: Match) => {
        setMatchPendingDelete(match);
        setMatchHasData(null);
        setMatchDeleteChecking(true);
        setConfirmDeleteOpen(true);

        // Check if match has players or stats/scores
        const hasPlayers = (match.homeTeamUsers?.length ?? 0) > 0 || (match.awayTeamUsers?.length ?? 0) > 0;
        const hasScores = (match.homeTeamGoals ?? 0) > 0 || (match.awayTeamGoals ?? 0) > 0 || isResultMatch(match);

        if (hasPlayers || hasScores) {
            setMatchHasData(true);
            setMatchDeleteChecking(false);
            return;
        }

        // Also check server for stats
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/${match.id}/has-stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMatchHasData(!!data.hasStats);
            } else {
                setMatchHasData(false);
            }
        } catch {
            setMatchHasData(false);
        } finally {
            setMatchDeleteChecking(false);
        }
    };

    const handleConfirmDeleteMatch = async () => {
        if (!matchPendingDelete || !token || !league) return;
        const m = matchPendingDelete;
        setConfirmDeleteOpen(false);

        try {
            const fixtureMode = isFixtureMatch(m);
            if (fixtureMode) {
                // Upcoming/fixture matches should be hard-deleted directly.
                await handlePermanentDelete(m);
                return;
            }

            // Always archive from main delete action.
            // Permanent delete is available only in Archived Match actions.
            console.log('🗑️ Archiving match:', m.id);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/${m.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ archived: true })
            });

            if (!res.ok) {
                const errorData = await res.text();
                console.error('❌ Archive failed:', errorData);
                throw new Error('Failed to archive match');
            }

            const data = await res.json();
            console.log('✅ Archive response:', data);

            // Update local state
            setLeague(prev => prev ? {
                ...prev,
                matches: (prev.matches ?? []).map(mm =>
                    mm.id === m.id ? { ...mm, archived: true } : mm
                )
            } : prev);

            setUndoInfo({ match: { ...m, archived: true }, action: 'archive' });
            setToastMessage('Match archived successfully');

            // Refresh league data to ensure sync
            console.log('🔄 Refreshing league data...');
            await fetchLeagueDetails();
            console.log('✅ League data refreshed');

        } catch (e) {
            console.error('Delete/Archive operation failed:', e);
            toast.error('Failed to archive match');
        } finally {
            setMatchPendingDelete(null);
            setMatchHasData(null);
        }
    };

    const pendingDeleteIsFixture = Boolean(matchPendingDelete && isFixtureMatch(matchPendingDelete));

    const handleUndo = async () => {
        if (!undoInfo || !token) return;
        const { match, action } = undoInfo;

        try {
            if (action === 'archive') {
                // Restore archived match
                console.log('♻️ Restoring archived match:', match.id);
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/${match.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ archived: false })
                });

                if (!res.ok) {
                    console.error('❌ Restore failed');
                    let message = 'Failed to restore match';
                    try {
                        const err = await res.json();
                        if (err?.message) message = err.message;
                    } catch { }
                    throw new Error(message);
                }

                const data = await res.json();
                console.log('✅ Restore response:', data);
                console.log('📦 Archived status in response:', data?.match?.archived);

                // Update local state
                setLeague(prev => prev ? {
                    ...prev,
                    matches: (prev.matches ?? []).map(mm =>
                        mm.id === match.id ? { ...mm, archived: false } : mm
                    )
                } : prev);

                console.log('💾 Local state updated with archived: false');

                setToastMessage('Match restored successfully.');
                toast.success('Match restored successfully!');

            } else if (action === 'delete') {
                // For permanent deletes, we can't undo - but we can recreate if we have the data
                toast.error('Cannot undo permanent deletion. Match data is permanently lost.');
            }

            // Refresh data to ensure sync
            console.log('🔄 Refreshing league data after restore...');
            fetchLeagueDetails();
            console.log('✅ League data refreshed after restore');

            // Log the updated match status after refresh
            setTimeout(() => {
                const updatedMatch = league?.matches?.find(m => m.id === match.id);
                console.log('🔍 Match status after restore refresh:', {
                    matchId: match.id,
                    archived: updatedMatch?.archived,
                    fullMatch: updatedMatch
                });
            }, 1000);

        } catch (error) {
            console.error('Undo operation failed:', error);
            toast.error('Failed to undo the action');
        } finally {
            setUndoInfo(null);
        }
    };

    // Add this handler before the return statement

    const handleMatchCardClick = (match: Match, event: React.MouseEvent) => {
        // Prevent opening modal if clicking on buttons
        const target = event.target as HTMLElement;
        const isButton = target.closest('button') || target.closest('a');

        if (!isButton) {
            setSelectedMatchDetail(match);
            setMatchDetailModalOpen(true);
        }
    };

    const handleRestoreMatch = async (match: Match) => {
        const ok = window.confirm('Restore this archived match?');
        if (!ok) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/${match.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ archived: false })
            });

            if (!res.ok) {
                let message = 'Failed to restore match';
                try {
                    const err = await res.json();
                    if (err?.message) message = err.message;
                } catch { }
                throw new Error(message);
            }

            // Update local state
            setLeague(prev => prev ? {
                ...prev,
                matches: prev.matches.map(mm =>
                    mm.id === match.id ? { ...mm, archived: false } : mm
                )
            } : prev);

            toast.success('Match restored successfully');
            fetchLeagueDetails();

        } catch (error) {
            console.error('Restore failed:', error);
            toast.error('Failed to restore match');
        }
    };

    const resultColor = (r?: string) => (r === 'W' ? '#16a34a' : r === 'L' ? '#dc2626' : '#64748b');

    const getShirtNumber = (p: User & PlayerProfileLike) => {
        const member = league?.members.find((m: User) => m.id === p.id);
        const sn = p.shirtNumber ?? member?.shirtNumber;
        if (sn === null || sn === undefined) return '';
        const s = typeof sn === 'string' ? sn : String(sn);
        return s.length > 0 ? s : '';
    };
    const getPreferredFoot = (u?: PlayerProfileLike): Foot => {
        const v = (u?.preferredFoot ?? '').toString().toLowerCase();
        if (v === 'left' || v === 'l') return 'L';
        if (v === 'right' || v === 'r') return 'R';
        return 'R';
    };
    const getProfileImage = (p: User & PlayerProfileLike) => p.profilePicture ?? '';
    const posToShort = (pos?: string): ShortPosition => {
        const p = (pos ?? '').toLowerCase();
        if (p.includes('keeper') || p === 'gk') return 'GK';
        if (p.includes('def')) return 'DF';
        if (p.includes('mid')) return 'MF';
        if (p.includes('wing')) return 'WG';
        if (p.includes('striker') || p.includes('forward') || p === 'st' || p === 'cf') return 'ST';
        return 'ST';
    };
    // Helpers for PlayerCard (backend-only data
    const openQuickViewFromTable = async (leagueId: string, playerId: string) => {
        if (!leagueId || !playerId || !token) return;
        try {
            // Find member from local league data as fallback
            const localMember = league?.members?.find((m: User) => m.id === playerId);

            // Fetch quick-view (motmCount) AND full player profile (skills, xp, etc.) in parallel
            const shouldUseWholeLeaguePopup = hasLegacyUnseasonedMatches || seasonOptions.length <= 1;
            const popupSeasonId = shouldUseWholeLeaguePopup ? null : selectedSeasonId;
            const quickViewParams = new URLSearchParams({
                seasonId: popupSeasonId || 'all',
            });
            const statsParams = new URLSearchParams({ leagueId });
            if (popupSeasonId) {
                statsParams.set('seasonId', popupSeasonId);
            }
            const [quickViewRes, playerRes, statsRes] = await Promise.all([
                fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/leagues/${encodeURIComponent(leagueId)}/player/${encodeURIComponent(playerId)}/quick-view?${quickViewParams.toString()}`,
                    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
                ),
                fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/players/${encodeURIComponent(playerId)}`,
                    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
                ),
                fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/players/${encodeURIComponent(playerId)}/stats?${statsParams.toString()}`,
                    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
                ),
            ]);

            const [data, playerData, statsData] = await Promise.all([
                quickViewRes.json(),
                playerRes.json().catch(() => ({ success: false })),
                statsRes.json().catch(() => ({ success: false })),
            ]);
            console.log('quick-view:', data, 'player:', playerData, 'stats:', statsData);

            if (!quickViewRes.ok || !data?.success) return;

            const fullPlayer = playerData?.success ? playerData.player : null;
            const matchStats = statsData?.success ? statsData.stats : null;
            const statsScopedXP = Number(matchStats?.xp ?? matchStats?.totalXP);
            const scopedXP = Number.isFinite(statsScopedXP)
                ? statsScopedXP
                : getLeagueXpForMember(playerId, localMember?.xp);

            const player: User & PlayerProfileLike = {
                id: String(fullPlayer?.id ?? data.player?.id ?? playerId),
                firstName: fullPlayer?.firstName ?? data.player?.firstName ?? localMember?.firstName ?? '',
                lastName: fullPlayer?.lastName ?? data.player?.lastName ?? localMember?.lastName ?? '',
                email: '',
                xp: scopedXP,
                position: fullPlayer?.position ?? data.player?.position ?? localMember?.position ?? undefined,
                profilePicture: fullPlayer?.profilePicture ?? data.player?.profilePicture ?? localMember?.profilePicture ?? null,
                preferredFoot: fullPlayer?.preferredFoot ?? data.player?.preferredFoot ?? null,
                shirtNumber: fullPlayer?.shirtNumber ?? data.player?.shirtNumber ?? localMember?.shirtNumber ?? null,
                positionType: undefined,
            };

            const skills = fullPlayer?.skills
                ? {
                    dribbling: Number(fullPlayer.skills.dribbling ?? 0),
                    shooting: Number(fullPlayer.skills.shooting ?? 0),
                    passing: Number(fullPlayer.skills.passing ?? 0),
                    pace: Number(fullPlayer.skills.pace ?? 0),
                    defending: Number(fullPlayer.skills.defending ?? 0),
                    physical: Number(fullPlayer.skills.physical ?? 0),
                }
                : data.skills
                    ? {
                        dribbling: Number(data.skills.dribbling ?? 0),
                        shooting: Number(data.skills.shooting ?? 0),
                        passing: Number(data.skills.passing ?? 0),
                        pace: Number(data.skills.pace ?? 0),
                        defending: Number(data.skills.defending ?? 0),
                        physical: Number(data.skills.physical ?? 0),
                    }
                    : undefined;

            setQuickView({
                player,
                league,
                stats: {
                    goals: Number(matchStats?.goals ?? data.stats?.goals ?? 0),
                    assists: Number(matchStats?.assists ?? data.stats?.assists ?? 0),
                },
                skills,
                xp: scopedXP,
                profileXP: Number(fullPlayer?.xp ?? fullPlayer?.totalXP ?? fullPlayer?.totalXp ?? data.profileXP ?? data.player?.xp ?? 0),
                cleanSheets: Number(matchStats?.cleanSheets ?? data.cleanSheets ?? 0),
                motmCount: Number(data.motmCount ?? 0),
                defensiveImpact: Number(matchStats?.defensiveImpact ?? data.defensiveImpact ?? 0),
                mentality: Number(matchStats?.mentality ?? data.mentality ?? 0),
                lastFive: Array.isArray(data.lastFive) ? data.lastFive : [],
            });
            setOpenQuickView(true);
        } catch {
            // silent
        }
    };



    const userRole = String((user as unknown as Record<string, unknown>)?.role || '').toUpperCase();
    const userIsSuperAdmin = userRole === 'SUPER_ADMIN';
    const userIsAdmin =
        userIsSuperAdmin ||
        userRole === 'ADMIN' ||
        league?.userRole === 'ADMIN' ||
        (league?.administrators ? league.administrators.some((a: User) => String(a.id) === String(user?.id)) : false);
    const userIsMember =
        userIsAdmin ||
        (league?.members ? league.members.some((m: User) => String(m.id) === String(user?.id)) : false) ||
        league?.userRole === 'MEMBER';

    const routeLeagueLoaded = !!league && String(league.id) === String(leagueId);
    const leagueAccessCheckReady =
        routeLeagueLoaded &&
        isAuthenticated &&
        !!user &&
        !authLoading &&
        !leagueDetailsLoading &&
        leagueDetailsAttempted &&
        (!profilePlayerId || checkedCommonLeague);
    const shouldShowAccessDenied =
        leagueAccessCheckReady &&
        !userIsMember &&
        !userIsAdmin &&
        !hasCommonLeague &&
        !!profilePlayerId;

    return (
        <Box
            sx={{
                minHeight: 'auto',
                fontFamily: 'var(--font-woodford-bourne-pro), sans-serif',
                fontWeight: 700,
                background: 'transparent',
                backgroundAttachment: 'fixed',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                overflowX: 'hidden',
                px: { xs: 1, sm: 2, md: 3 },
                py: 0,
            }}
        >
            {/* <Box sx={{ ml:5}}> */}
            {/* </Box> */}
            <Container>
                {/* Access control for non-members - only show after league/access checks finish */}
                {shouldShowAccessDenied ? (
                    <Box sx={{ p: 4, minHeight: '100vh' }}>
                        <Typography className="empty-state-message" color="error" variant="h6">
                            You don&apos;t have access to this league.
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {/* League inactive warning - only show when league data is available
                        {league && !league.active && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                This league is currently inactive. All actions are disabled until an admin reactivates it.
                            </Alert>
                        )} */}

                        <Box sx={{
                            mt: 0,
                            mb: { xs: 2, md: 4 },
                            width: '100vw',
                            position: 'relative',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            // height: '30vh',
                            background: '#0e0e0e',
                        }}>
                            {/* League state warning (inactive/completed) */}
                            {league && !league.active && (
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                    {leagueIsCompleted(league)
                                        ? 'This league is completed. New matches are disabled for completed leagues.'
                                        : 'This league is currently inactive. All actions are disabled until an admin reactivates it.'}
                                </Alert>
                            )}
                            <Paper sx={{
                                px: 0,
                                pt: { xs: 0, md: 3 },
                                pb: { xs: 2, md: 3 },
                                background: '#0e0e0e',
                                color: 'white',
                                minHeight: 'auto',
                            }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        width: '100%',
                                        position: 'relative',
                                        mt: 0,
                                    }}
                                >
                                    {/* Centered League Name */}
                                    <Box sx={{
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '100%',
                                        px: { xs: 1.5, sm: 2, md: 0 },
                                        gap: 0.5,
                                        mt: 0,
                                        minHeight: { xs: 0, md: '87px' },
                                        height: { xs: 'auto', md: '87px' },
                                        py: { xs: 1, md: 0 },
                                    }}>
                                        {(() => {
                                            const displayedLeagueName = league?.name || allLeagues.find(l => String(l.id) === String(leagueId))?.name || 'LEAGUE';
                                            return (
                                                <Button
                                                    onClick={handleLeaguesDropdownOpen}
                                                    disableRipple
                                                    sx={{
                                                        textTransform: 'uppercase',
                                                        fontFamily: 'var(--font-oswald), "Oswald", sans-serif !important',
                                                        fontSize: { xs: '32px', sm: '42px', md: '55px' },
                                                        fontWeight: 700,
                                                        letterSpacing: '0px',
                                                        lineHeight: 1,
                                                        color: '#ffffff',
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        borderRadius: 0,
                                                        boxShadow: 'none',
                                                        p: 0,
                                                        minWidth: 0,
                                                        minHeight: 'auto',
                                                        height: 'auto',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: { xs: 1, sm: 1.25, md: 1.5 },
                                                        transition: 'opacity 0.18s ease',
                                                        '&:hover': {
                                                            backgroundColor: 'transparent',
                                                            opacity: 0.88,
                                                        },
                                                    }}
                                                >
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            display: 'inline-block',
                                                            maxWidth: { xs: 'calc(100vw - 100px)', sm: '65vw', md: '55vw' },
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            verticalAlign: 'middle',
                                                        }}
                                                    >
                                                        {formatLeagueName(displayedLeagueName)}
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            width: { xs: 18, sm: 20, md: 22 },
                                                            height: { xs: 18, sm: 20, md: 22 },
                                                            borderRadius: '50%',
                                                            border: '1.2px solid #e56a16',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0,
                                                            transition: 'transform 0.2s ease',
                                                            transform: leaguesDropdownOpen ? 'rotate(180deg)' : 'none',
                                                        }}
                                                    >
                                                        <ChevronDown size={isMobile ? 10 : 12} color="#e56a16" strokeWidth={2.5} />
                                                    </Box>
                                                </Button>
                                            );
                                        })()}

                                        <Button
                                            onClick={handleSeasonDropdownOpen}
                                            disableRipple
                                            sx={{
                                                mt: 0.5,
                                                color: '#8a92a6',
                                                fontSize: { xs: '12px', sm: '13px', md: '14px' },
                                                fontWeight: 600,
                                                letterSpacing: 0.25,
                                                textTransform: 'none',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                borderRadius: 0,
                                                boxShadow: 'none',
                                                p: 0,
                                                minHeight: 'auto',
                                                minWidth: 0,
                                                maxWidth: { xs: '88vw', sm: '60vw', md: '50vw' },
                                                lineHeight: 1.2,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 0.75,
                                                transition: 'color 0.18s ease',
                                                '&:hover': {
                                                    backgroundColor: 'transparent',
                                                    color: '#ffffff',
                                                },
                                            }}
                                        >
                                            {!isSelectedSeasonActive ? (
                                                <Lock size={13} color="#8a92a6" style={{ flexShrink: 0 }} />
                                            ) : null}
                                            <Box
                                                component="span"
                                                sx={{
                                                    display: 'inline-block',
                                                    maxWidth: { xs: '70vw', sm: '46vw', md: '40vw' },
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {seasonLabel || '(#Season 1)'}
                                            </Box>
                                            <Box
                                                sx={{
                                                    width: 16,
                                                    height: 16,
                                                    borderRadius: '50%',
                                                    border: '1.2px solid #e56a16',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    transition: 'transform 0.2s ease',
                                                    transform: seasonDropdownOpen ? 'rotate(180deg)' : 'none',
                                                }}
                                            >
                                                <ChevronDown size={10} color="#e56a16" strokeWidth={2.5} />
                                            </Box>
                                        </Button>
                                    </Box>

                                    {/* Season Dropdown Menu */}
                                    <Menu
                                        anchorEl={seasonDropdownAnchor}
                                        open={seasonDropdownOpen}
                                        onClose={handleSeasonDropdownClose}
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
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
                                                minWidth: 200,
                                                ml: { xs: -1.5, sm: -1.5 },
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
                                        {(() => {
                                            const seasonsUnknown = (league as unknown as Record<string, unknown>)?.seasons;
                                            const availableSeasons: Array<{ id: string, seasonNumber: number }> = [];
                                            const addUniqueSeason = (id: string, seasonNumber: number) => {
                                                if (!id || seasonNumber <= 0) return;
                                                const existingIndex = availableSeasons.findIndex(s => s.seasonNumber === seasonNumber || String(s.id).trim() === String(id).trim());
                                                if (existingIndex === -1) {
                                                    availableSeasons.push({ id: String(id).trim(), seasonNumber });
                                                }
                                            };

                                            // Prefer dedicated seasons endpoint data first (fresh/latest)
                                            if (Array.isArray(seasonOptions) && seasonOptions.length > 0) {
                                                seasonOptions.forEach((season) => {
                                                    addUniqueSeason(
                                                        String(season.id || ''),
                                                        Number(season.seasonNumber || 0)
                                                    );
                                                });
                                            }

                                            // If user is admin, show all seasons
                                            if (isAdmin && Array.isArray(seasonsUnknown)) {
                                                seasonsUnknown.forEach((s: unknown) => {
                                                    const season = s as Record<string, unknown>;
                                                    addUniqueSeason(
                                                        String(season?.id || ''),
                                                        Number(season?.seasonNumber || 0)
                                                    );
                                                });
                                            }
                                            // If user is member, show only seasons they joined
                                            else if (Array.isArray(seasonsUnknown)) {
                                                seasonsUnknown.forEach((s: unknown) => {
                                                    const season = s as Record<string, unknown>;
                                                    addUniqueSeason(
                                                        String(season?.id || ''),
                                                        Number(season?.seasonNumber || 0)
                                                    );
                                                });
                                            }

                                            // Ensure current season is visible even if seasons list is temporarily stale.
                                            const currentSeasonUnknown = (league as unknown as Record<string, unknown>)?.currentSeason;
                                            if (currentSeasonUnknown && typeof currentSeasonUnknown === 'object') {
                                                const currentSeason = currentSeasonUnknown as Record<string, unknown>;
                                                addUniqueSeason(
                                                    String(currentSeason?.id || ''),
                                                    Number(currentSeason?.seasonNumber || 0)
                                                );
                                            }

                                            // Sort by season number descending (newest first)
                                            availableSeasons.sort((a, b) => b.seasonNumber - a.seasonNumber);

                                            if (availableSeasons.length === 0) {
                                                return (
                                                    <MenuItem disabled sx={{ color: '#9CA3AF', fontSize: '0.9rem', py: 1 }}>
                                                        <Typography className="empty-state-message" variant="body2">
                                                            No seasons available
                                                        </Typography>
                                                    </MenuItem>
                                                );
                                            }

                                            return availableSeasons.map((season) => {
                                                const isSelected = String(season.id).trim() === String(selectedSeasonId || '').trim() || season.seasonNumber === selectedSeasonNumber;
                                                return (
                                                    <MenuItem
                                                        key={season.id}
                                                        onClick={() => handleSeasonSelect(season.id)}
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
                                                            background: isSelected
                                                                ? 'linear-gradient(90deg, rgba(3,136,227,0.25) 0%, rgba(3,136,227,0.10) 100%)'
                                                                : 'transparent',
                                                            border: isSelected
                                                                ? '1px solid rgba(3,136,227,0.35)'
                                                                : 'none',
                                                            '&:hover': {
                                                                transform: 'translateY(-1px)',
                                                                background: 'linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                                                            },
                                                        }}
                                                    >
                                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                                            <Calendar size={16} color={isSelected ? '#FFFFFF' : '#9CA3AF'} />
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={`Season ${season.seasonNumber}`}
                                                            sx={{
                                                                '& .MuiListItemText-primary': {
                                                                    fontSize: '0.95rem',
                                                                    fontWeight: isSelected ? 700 : 500,
                                                                    letterSpacing: 0.2,
                                                                    color: isSelected ? '#FFFFFF' : '#E5E7EB'
                                                                }
                                                            }}
                                                        />
                                                    </MenuItem>
                                                );
                                            });
                                        })()}
                                    </Menu>

                                    {/* Leagues Dropdown Menu */}
                                    <Menu
                                        anchorEl={leaguesDropdownAnchor}
                                        open={leaguesDropdownOpen}
                                        onClose={handleLeaguesDropdownClose}
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                                        marginThreshold={null}
                                        PaperProps={{
                                            sx: {
                                                mt: 0.5,
                                                maxHeight: { xs: 240, sm: 280, md: 320 },
                                                overflowY: 'auto',
                                                overflowX: 'hidden',
                                                scrollbarWidth: 'thin',
                                                scrollbarColor: 'rgba(255,255,255,0.35) rgba(255,255,255,0.08)',
                                                '&::-webkit-scrollbar': { width: '8px' },
                                                '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.08)' },
                                                '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.35)', borderRadius: '999px' },
                                                borderRadius: '12px',
                                                border: '1px solid #22242a',
                                                backgroundColor: '#16181d',
                                                color: '#E5E7EB',
                                                minWidth: 240,
                                                ml: { xs: -1.5, sm: -1.5 },
                                                maxWidth: { xs: '92vw', sm: 'none' },
                                                boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                                            },
                                            style: {
                                                maxHeight: 'min(300px, calc(100vh - 160px))',
                                            }
                                        }}
                                        MenuListProps={{ sx: { py: 0.5 } }}
                                    >
                                        {allLeagues.map((leagueItem) => (
                                            <MenuItem
                                                key={leagueItem.id}
                                                onClick={() => handleLeagueSelect(leagueItem.id)}
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

                                                    background: leagueItem.id === leagueId ? 'linear-gradient(90deg, rgba(3,136,227,0.25) 0%, rgba(3,136,227,0.10) 100%)' : 'transparent',
                                                    border: leagueItem.id === leagueId ? '1px solid rgba(3,136,227,0.35)' : 'none',
                                                    '&:hover': {
                                                        transform: 'translateY(-1px)',
                                                        background: 'linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                                                    },

                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    <Trophy size={16} color={leagueItem.id === leagueId ? '#FFFFFF' : '#9CA3AF'} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={leagueItem.name}
                                                    sx={{
                                                        '& .MuiListItemText-primary': {
                                                            fontSize: '0.95rem',
                                                            fontWeight: leagueItem.id === leagueId ? 700 : 500,
                                                            letterSpacing: 0.2,
                                                            color: leagueItem.id === leagueId ? '#FFFFFF' : '#E5E7EB'
                                                        }
                                                    }}
                                                />
                                                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    {leagueItem.userRole && (
                                                        <Box
                                                            sx={{
                                                                px: 1,
                                                                py: 0.25,
                                                                bgcolor: leagueItem.userRole === 'ADMIN' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.15)',
                                                                color: leagueItem.userRole === 'ADMIN' ? '#1F2937' : '#FFFFFF',
                                                                borderRadius: '9999px',
                                                                fontSize: 10,
                                                                fontWeight: 700,
                                                                letterSpacing: 0.3,
                                                                textTransform: 'uppercase',
                                                            }}
                                                        >
                                                            {leagueItem.userRole === 'ADMIN' ? 'Admin' : 'Member'}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </Box>

                                {/* Orange divider under header */}
                                <Box
                                    sx={{
                                        height: 'var(--header-divider-height, 3px)',
                                        minHeight: '3px',
                                        bgcolor: 'var(--header-divider-color, #e16419)',
                                        mt: { xs: 0, md: 3 },
                                        mb: { xs: 0, md: 2 },
                                        width: '100vw',
                                        position: 'relative',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                    }}
                                />

                                {/* Navigation Tabs - Mobile View (3 tabs: Table, Leaderboard, Dream Team) */}
                                <Box sx={{ display: { xs: 'block', sm: 'none' }, width: '100%', px: { xs: 1, sm: 0 }, mt: 1.5, mb: { xs: 1.5, md: 0 } }}>
                                    <LeagueViewToggle
                                        activeView={section}
                                        onSelectView={(view) => {
                                            setSection(view);
                                            const seasonParam = selectedSeasonId ? `&seasonId=${encodeURIComponent(selectedSeasonId)}` : '';
                                            router.replace(`/league/${encodeURIComponent(leagueId)}?tab=${view}${seasonParam}`);
                                        }}
                                        sx={{ mt: 0 }}
                                    />
                                </Box>

                                {/* Navigation Tabs - Desktop View (6 tabs with newer UI look) */}
                                <Box
                                    sx={{
                                        display: { xs: 'none', sm: 'flex' },
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '100%',
                                        overflowX: { xs: 'visible', sm: 'auto' },
                                        overflowY: 'hidden',
                                        px: 1,
                                        mt: 0,
                                        mb: { xs: 1.5, md: 0 },
                                        scrollbarWidth: 'none',
                                        '&::-webkit-scrollbar': { display: 'none' },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            bgcolor: '#121316',
                                            border: '1px solid #22242a',
                                            borderRadius: '16px',
                                            p: '4px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            maxWidth: '100%',
                                        }}
                                    >
                                        {[
                                            { id: 'table', label: 'LEAGUE TABLE', icon: LeagueTable },
                                            { id: 'results', label: 'MATCH RESULTS', icon: MATCHRESULT },
                                            { id: 'matches', label: 'FIXTURES', icon: FIXTURES },
                                            { id: 'leaderboard', label: 'LEADERBOARD', icon: LEADERBOARD },
                                            { id: 'members', label: 'PLAYERS', icon: PLAYERIMAGE },
                                            { id: 'dream-team', label: 'DREAM TEAM', icon: DREATEAM },
                                        ].map((tab) => {
                                            const isActive = section === tab.id;
                                            return (
                                                <ButtonBase
                                                    key={tab.id}
                                                    onClick={() => {
                                                        setSection(tab.id as any);
                                                        const seasonParam = selectedSeasonId ? `&seasonId=${encodeURIComponent(selectedSeasonId)}` : '';
                                                        router.replace(`/league/${encodeURIComponent(leagueId)}?tab=${tab.id}${seasonParam}`);
                                                    }}
                                                    sx={{
                                                        py: 1,
                                                        px: { sm: 1.8, md: 2.4, lg: 3 },
                                                        borderRadius: '12px',
                                                        border: isActive ? '1.5px solid #22c55e' : '1.5px solid transparent',
                                                        bgcolor: isActive ? 'rgba(34, 197, 94, 0.04)' : 'transparent',
                                                        color: isActive ? '#ffffff' : '#717d8f',
                                                        fontWeight: isActive ? 700 : 600,
                                                        fontSize: { sm: 12, md: 13, lg: 13.5 },
                                                        letterSpacing: '0.6px',
                                                        textTransform: 'uppercase',
                                                        transition: 'all 0.18s ease',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 1.2,
                                                        whiteSpace: 'nowrap',
                                                        flexShrink: 0,
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            bgcolor: isActive ? 'rgba(34, 197, 94, 0.08)' : '#18191e',
                                                            color: '#ffffff',
                                                            '& img': {
                                                                filter: 'brightness(0) invert(1)',
                                                                opacity: 1,
                                                            },
                                                        },
                                                    }}
                                                >
                                                    <Image
                                                        src={tab.icon}
                                                        alt={tab.label}
                                                        width={20}
                                                        height={20}
                                                        style={{
                                                            objectFit: 'contain',
                                                            filter: isActive ? 'brightness(0) invert(1)' : 'brightness(0) invert(0.6)',
                                                            opacity: isActive ? 1 : 0.75,
                                                            transition: 'all 0.18s ease',
                                                        }}
                                                    />
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
                            </Paper>
                        </Box>
                        {/* Section Content */}
                        <Paper sx={{
                            background: 'none',
                            color: 'white',
                            minHeight: 400,
                            borderRadius: 3,
                            boxShadow: 'none',
                            mt: 0,
                            // backdropFilter: 'blur(10px)'
                        }}>
                            {(!league && error && !isSigningOut) ? (
                                <Box sx={{ py: 6, textAlign: 'center' }}>
                                    <Typography className="empty-state-message" variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
                                        {error}
                                    </Typography>
                                    <Button
                                        startIcon={<RefreshCw size={16} />}
                                        onClick={() => {
                                            setError(null);
                                            setLeagueDetailsAttempted(false);
                                            void fetchLeagueDetails();
                                        }}
                                        sx={{
                                            color: 'white',
                                            backgroundColor: '#e56a16',
                                            '&:hover': { backgroundColor: '#d1590d' },
                                        }}
                                    >
                                        Retry Loading
                                    </Button>
                                </Box>
                            ) : (!league && leagueDetailsLoading) ? (
                                <LeagueDetailLoadingSkeleton mode={section} />
                            ) : (
                                <>
                                    {section === 'members' && (
                                        <div className="w-full mx-auto">
                                            <Card sx={{
                                                background: '#121316',
                                                border: '1px solid #22242a',
                                                borderRadius: '16px',
                                                boxShadow: 'none',
                                                mt: 1.2,
                                                // mb: 4,
                                                overflow: 'hidden',
                                                '&::-webkit-scrollbar': {
                                                    height: '6px',
                                                },
                                                '&::-webkit-scrollbar-track': {
                                                    background: '#121316',
                                                },
                                                '&::-webkit-scrollbar-thumb': {
                                                    background: '#22242a',
                                                    borderRadius: '3px',
                                                },
                                            }} className="text-white">
                                                <Box
                                                    onScroll={(e) => e.currentTarget.classList.toggle('is-scrolled', e.currentTarget.scrollLeft > 2)}
                                                    sx={{
                                                        width: '100%',
                                                        overflowX: 'auto',
                                                        overflowY: 'auto',
                                                        maxHeight: { xs: '68vh', sm: '70vh', md: '72vh' },
                                                        WebkitOverflowScrolling: 'touch',
                                                        scrollbarWidth: 'thin',
                                                        '&::-webkit-scrollbar': {
                                                            height: '8px',
                                                            width: '8px',
                                                        },
                                                        '&::-webkit-scrollbar-track': {
                                                            background: '#121316',
                                                            borderRadius: '9999px',
                                                        },
                                                        '&::-webkit-scrollbar-thumb': {
                                                            background: '#22242a',
                                                            borderRadius: '9999px',
                                                        },
                                                    }}
                                                >
                                        <Box sx={{ width: 'max-content', minWidth: '100%', borderRadius: '16px', overflow: 'visible' }}>
                                            {/* Table Header */}
                                            <Box className="league-header-row font-bold" sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                position: 'sticky',
                                                top: 0,
                                                zIndex: 12,
                                                py: 1.5,
                                                pl: 0,
                                                pr: { xs: 2, sm: 3 },
                                                backgroundColor: '#121316',
                                                borderBottom: '1px solid #22242a',
                                            }}>
                                                <Box
                                                                    sx={{
                                                                      width: { xs: 32, sm: 40 },
                                                                      minWidth: { xs: 32, sm: 40 },
                                                                      flexShrink: 0,
                                                                      display: 'flex',
                                                                      alignItems: 'center',
                                                                      justifyContent: 'center',
                                                                      position: 'sticky',
                                                                      left: 0,
                                                                      zIndex: 4,
                                                                      backgroundColor: '#121316',
                                                                      alignSelf: 'stretch',
                                                                    }}
                                                                  >
                                                                    <Typography className="league-table-heading" sx={{ color: '#717d8f !important', textAlign: 'center', fontWeight: 'bold' }}>
                                                                      #
                                                                    </Typography>
                                                                  </Box>
                                                
                                                {/* All Positions Dropdown */}
                                                <Box
                                                    onClick={handleMemberPositionMenuOpen}
                                                    aria-haspopup="menu"
                                                    aria-expanded={memberPositionMenuOpen ? 'true' : undefined}
                                                    sx={{
                                                        width: { xs: 170, sm: 230, md: 260 },
                                                        minWidth: { xs: 170, sm: 230, md: 260 },
                                                        flexShrink: 0,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        pl: { xs: 2, sm: 3 },
                                                        pr: { xs: 1, sm: 1.5 },
                                                        cursor: 'pointer',
                                                        userSelect: 'none',
                                                        position: 'sticky',
                                                        left: { xs: 32, sm: 40 },
                                                        zIndex: 3,
                                                        backgroundColor: '#121316',
                                                    }}>
                                                    <Typography className="league-table-heading league-table-heading-left" sx={{ color: '#717d8f !important', textAlign: 'left !important', fontWeight: 'bold' }}>
                                                        {selectedMemberPosition === 'all' ? 'ALL POSITIONS' : selectedMemberPosition.toUpperCase()}
                                                    </Typography>
                                                    <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid rgba(229,106,22,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', ml: 1, flexShrink: 0 }}>
                                                        <ChevronDown size={11} color="#e56a16" />
                                                    </Box>
                                                </Box>
                                                <Menu
                                                    anchorEl={memberPositionMenuAnchor}
                                                    open={memberPositionMenuOpen}
                                                    onClose={handleMemberPositionMenuClose}
                                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                                    slotProps={{
                                                        paper: {
                                                            sx: {
                                                                mt: 0.5,
                                                                minWidth: { xs: 180, sm: 140 },
                                                                backgroundColor: '#1f1f1f',
                                                                border: '1px solid #e56a16',
                                                                borderRadius: '8px',
                                                                color: '#fff',
                                                            },
                                                        },
                                                    }}
                                                >
                                                    <MenuItem
                                                        selected={selectedMemberPosition === 'all'}
                                                        onClick={() => handleMemberPositionChange('all')}
                                                        sx={{ color: '#fff !important', fontWeight: 600, fontSize: 14, textTransform: 'uppercase', fontFamily: 'var(--font-woodford-bourne-pro), sans-serif' }}
                                                    >
                                                        All Positions
                                                    </MenuItem>
                                                    {memberPositionOptions.map((position) => (
                                                        <MenuItem
                                                            key={position}
                                                            selected={selectedMemberPosition.toLowerCase() === position.toLowerCase()}
                                                            onClick={() => handleMemberPositionChange(position)}
                                                            sx={{ color: '#fff', fontFamily: 'var(--font-woodford-bourne-pro), sans-serif', fontSize: { xs: 13, sm: 15 } }}
                                                        >
                                                            {/* <Typography  sx={{ fontSize: { xs: 14, sm: 14 }, color: 'rgba(255,255,255,0.6)', mt: 0.25, fontFamily: 'var(--font-woodford-bourne-pro), sans-serif' }}></Typography> */}
                                                            {position}
                                                        </MenuItem>
                                                    ))}
                                                </Menu>

                                                {/* Flexible Spacer pushing the 4 columns to the right side */}
                                                <Box sx={{ flex: 1, minWidth: 10 }} />

                                                {/* Right columns container with clean gap between headings */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2.5, md: 3.5 } }}>
                                                    {/* XP Status Header */}
                                                    <Box sx={{
                                                        width: { xs: 90, sm: 120, md: 135 },
                                                        minWidth: { xs: 90, sm: 120, md: 135 },
                                                        flexShrink: 0,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}>
                                                        <Typography className="league-table-heading league-table-heading-left" sx={{ color: '#717d8f !important', textAlign: 'left !important', fontWeight: 'bold' }}>
                                                            XP STATUS
                                                        </Typography>
                                                    </Box>

                                                    {/* Playing Style Header */}
                                                    <Box sx={{
                                                        width: { xs: 100, sm: 130, md: 150 },
                                                        minWidth: { xs: 100, sm: 130, md: 150 },
                                                        flexShrink: 0,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}>
                                                        <Typography className="league-table-heading league-table-heading-left" sx={{ color: '#717d8f !important', textAlign: 'left !important', fontWeight: 'bold' }}>
                                                            STYLE
                                                        </Typography>
                                                    </Box>

                                                    {/* View Stats Header */}
                                                    <Box sx={{
                                                        width: { xs: 75, sm: 100, md: 115 },
                                                        minWidth: { xs: 75, sm: 100, md: 115 },
                                                        flexShrink: 0,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}>
                                                        <Typography className="league-table-heading" sx={{ color: '#717d8f !important', fontWeight: 'bold' }}>
                                                            {isMobile ? 'STATS' : 'VIEW STATS'}
                                                        </Typography>
                                                    </Box>

                                                    {/* Career XP Header */}
                                                    <Box sx={{
                                                        width: { xs: 85, sm: 110, md: 125 },
                                                        minWidth: { xs: 85, sm: 110, md: 125 },
                                                        flexShrink: 0,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'flex-end',
                                                        justifyContent: 'center',
                                                    }}>
                                                        <Typography className="league-table-heading1" sx={{ color: '#717d8f !important', fontWeight: 'bold', fontSize: { xs: 11, sm: 12 } }}>
                                                            CAREER XP
                                                        </Typography>
                                                        <Typography sx={{ color: '#4b5563', fontSize: { xs: 9, sm: 10 }, fontWeight: 700, letterSpacing: 0.5, lineHeight: 1, display: { xs: 'none', sm: 'block' } }}>
                                                            OF 25,000
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>

                                            {/* Table Rows Content */}
                                            <Box sx={{
                                                backgroundColor: '#121316',
                                                '&::-webkit-scrollbar': { display: 'none' },
                                                scrollbarWidth: 'none',
                                                msOverflowStyle: 'none',
                                                borderBottomLeftRadius: '16px',
                                                borderBottomRightRadius: '16px',
                                                px: 0,
                                            }}>
                                                <List sx={{ p: 0 }}>
                                                    {filteredMembersForTable.map((member, idx) => {
                                                        const firstName = member.firstName || '';
                                                        const lastName = member.lastName || '';
                                                        const memberDisplayName = `${firstName} ${lastName}`.trim();
                                                        const isCurrentUser = String(member.id) === String(user?.id || '');
                                                        const isLast = idx === filteredMembersForTable.length - 1;
                                                        const memberXp = getEffectiveMemberXP(member);
                                                        const xpStatusTitle = getXPTier(memberXp).title;
                                                        const progressPercent = Math.min(100, Math.max(3, (memberXp / 25000) * 100));

                                                        return (
                                                            <ListItem
                                                                key={member.id}
                                                                className={`league-table-row-text league-row ${isCurrentUser ? 'league-row-current-user' : ''}`}
                                                                onClick={() => router.push(`/player/${member.id}`)}
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    pl: 0,
                                                                    pr: { xs: 2, sm: 3 },
                                                                    background: isCurrentUser
                                                                        ? 'linear-gradient(90deg, #183328 0%, #152d24 35%, #12211b 70%, #0f1616 100%) !important'
                                                                        : '#121316 !important',
                                                                    boxShadow: isCurrentUser ? 'inset 3px 0 0 #54ce91 !important' : 'none',
                                                                    borderBottom: '1px solid #1c1d22 !important',
                                                                    color: '#fff',
                                                                    cursor: 'pointer',
                                                                    transition: 'background-color 0.2s',
                                                                    '&:hover': {
                                                                        background: isCurrentUser
                                                                            ? 'linear-gradient(90deg, #1c3c2f 0%, #183329 35%, #14251e 70%, #101817 100%) !important'
                                                                            : '#18191e !important',
                                                                    },
                                                                    borderBottomLeftRadius: isLast ? '16px' : 0,
                                                                    borderBottomRightRadius: isLast ? '16px' : 0,
                                                                    minHeight: { xs: '58px', sm: '72px' },
                                                                }}
                                                            >

                                                                {/* Rank Column */}
                                                                    <Box
                                                                        className="league-table-sticky-rank"
                                                                        sx={{
                                                                            width: { xs: 32, sm: 40 },
                                                                            minWidth: { xs: 32, sm: 40 },
                                                                            flexShrink: 0,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            position: 'sticky',
                                                                            left: 0,
                                                                            zIndex: 3,
                                                                            backgroundColor: isCurrentUser ? 'transparent !important' : '#121316',
                                                                            transition: 'background-color 0.2s',
                                                                            alignSelf: 'stretch',
                                                                            '.MuiListItem-root:hover &': {
                                                                                backgroundColor: isCurrentUser ? 'transparent !important' : '#18191e',
                                                                            },
                                                                            '.is-scrolled .MuiListItem-root &': {
                                                                                backgroundColor: isCurrentUser ? '#183328 !important' : '#121316 !important',
                                                                            },
                                                                            borderBottomLeftRadius: isLast ? '16px' : 0,
                                                                        }}
                                                                    >
                                                                        <Typography
                                                                            className="league-table-heading league-table-rank"
                                                                            sx={{
                                                                                color: '#8a94a6',
                                                                                textAlign: 'center',
                                                                                fontWeight: 600,
                                                                                fontSize: { xs: 12, sm: 14 },
                                                                            }}
                                                                        >
                                                                            {idx + 1}
                                                                        </Typography>
                                                                    </Box>
                                                                {/* Avatar + Name column */}
                                                                <Box
                                                                    className="league-table-sticky-name"
                                                                    sx={{
                                                                        width: { xs: 170, sm: 230, md: 260 },
                                                                        minWidth: { xs: 170, sm: 230, md: 260 },
                                                                        flexShrink: 0,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        pl: { xs: 2, sm: 3 },
                                                                        pr: { xs: 1, sm: 1.5 },
                                                                        position: 'sticky',
                                                                        left: { xs: 32, sm: 40 },
                                                                        zIndex: 2,
                                                                        backgroundColor: isCurrentUser ? 'transparent !important' : '#121316',
                                                                        boxShadow: 'none',
                                                                        transition: 'background-color 0.2s',
                                                                        alignSelf: 'stretch',
                                                                        '.MuiListItem-root:hover &': {
                                                                            backgroundColor: isCurrentUser ? 'transparent !important' : '#18191e',
                                                                        },
                                                                        '.is-scrolled .MuiListItem-root &': {
                                                                            backgroundColor: isCurrentUser ? '#183328 !important' : '#121316 !important',
                                                                            boxShadow: '8px 0 12px -12px rgba(0, 0, 0, 0.6) !important',
                                                                        },
                                                                    }}>
                                                                    <ListItemAvatar sx={{ minWidth: { xs: 52, sm: 60 } }}>
                                                                        <Box sx={{
                                                                            position: 'relative',
                                                                            width: { xs: 38, sm: 42 },
                                                                            height: { xs: 38, sm: 42 },
                                                                            borderRadius: '50%',
                                                                            overflow: 'hidden',
                                                                            backgroundColor: 'rgba(255,255,255,0.1)'
                                                                        }}>
                                                                            {member.profilePicture ? (
                                                                                <Box
                                                                                    component="img"
                                                                                    src={member.profilePicture}
                                                                                    alt={memberDisplayName}
                                                                                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                                                />
                                                                            ) : (
                                                                                <Box
                                                                                    sx={{
                                                                                        width: '100%',
                                                                                        height: '100%',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                        backgroundColor: getAvatarBackgroundColor(memberDisplayName || String(member.id || 'player')),
                                                                                        color: '#fff',
                                                                                        fontWeight: 800,
                                                                                        fontSize: { xs: 12, sm: 13 },
                                                                                        textTransform: 'uppercase',
                                                                                        letterSpacing: 0.4,
                                                                                    }}
                                                                                >
                                                                                    {getAvatarInitials({ name: memberDisplayName, firstName, lastName })}
                                                                                </Box>
                                                                            )}
                                                                        </Box>
                                                                    </ListItemAvatar>
                                                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                                                            <Typography className="league-table-row-text" noWrap sx={{ fontWeight: 700, fontSize: { xs: 12, sm: 15 }, color: '#fff', fontFamily: 'var(--font-woodford-bourne-pro), sans-serif', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                                {formatPlayerCardStyleName(firstName, lastName)}
                                                                            </Typography>
                                                                            {(member as any).isAdmin && (
                                                                                <Shield className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                                                            )}
                                                                        </Box>
                                                                        <Typography className="league-player-pos" sx={{ fontSize: { xs: 13, sm: 14 }, color: 'rgba(255,255,255,0.6)', mt: 0.25, fontFamily: 'var(--font-woodford-bourne-pro), sans-serif' }}>
                                                                            {getMemberPositionLabel(member)}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>

                                                                {/* Flexible Spacer pushing the 4 columns to the right side */}
                                                                <Box sx={{ flex: 1, minWidth: 10 }} />

                                                                {/* Right columns container with matching clean gap */}
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2.5, md: 3.5 } }}>
                                                                    {/* XP Status column */}
                                                                    <Box sx={{
                                                                        width: { xs: 90, sm: 120, md: 135 },
                                                                        minWidth: { xs: 90, sm: 120, md: 135 },
                                                                        flexShrink: 0,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'flex-start',
                                                                    }}>
                                                                        {(() => {
                                                                            const t = xpStatusTitle.toLowerCase();
                                                                            let bg = 'rgba(255, 255, 255, 0.08)';
                                                                            let color = '#fff';
                                                                            let border = '1px solid rgba(255, 255, 255, 0.12)';
                                                                            if (t === 'pro') {
                                                                                bg = 'rgba(110, 86, 207, 0.22)';
                                                                                color = '#c4b5fd';
                                                                                border = '1px solid rgba(139, 92, 246, 0.3)';
                                                                            } else if (t === 'baller') {
                                                                                bg = 'rgba(217, 119, 6, 0.2)';
                                                                                color = '#fcd34d';
                                                                                border = '1px solid rgba(245, 158, 11, 0.3)';
                                                                            } else if (t === 'rookie') {
                                                                                bg = 'rgba(148, 163, 184, 0.15)';
                                                                                color = '#cbd5e1';
                                                                                border = '1px solid rgba(148, 163, 184, 0.25)';
                                                                            } else if (t === 'rising star') {
                                                                                bg = 'rgba(56, 189, 248, 0.2)';
                                                                                color = '#7dd3fc';
                                                                                border = '1px solid rgba(56, 189, 248, 0.3)';
                                                                            } else if (t === 'elite') {
                                                                                bg = 'rgba(59, 130, 246, 0.22)';
                                                                                color = '#93c5fd';
                                                                                border = '1px solid rgba(59, 130, 246, 0.3)';
                                                                            } else if (t.includes('champion')) {
                                                                                bg = 'rgba(239, 68, 68, 0.22)';
                                                                                color = '#fca5a5';
                                                                                border = '1px solid rgba(239, 68, 68, 0.3)';
                                                                            } else if (t === 'goat') {
                                                                                bg = 'rgba(234, 179, 8, 0.22)';
                                                                                color = '#fde047';
                                                                                border = '1px solid rgba(234, 179, 8, 0.3)';
                                                                            }

                                                                            return (
                                                                                <Box
                                                                                    sx={{
                                                                                        px: { xs: 1.25, sm: 2 },
                                                                                        py: 0.35,
                                                                                        borderRadius: '9999px',
                                                                                        fontSize: { xs: 11, sm: 12 },
                                                                                        fontWeight: 700,
                                                                                        backgroundColor: bg,
                                                                                        color: color,
                                                                                        border: border,
                                                                                        display: 'inline-flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                        letterSpacing: 0.2,
                                                                                        fontFamily: 'var(--font-woodford-bourne-pro), sans-serif',
                                                                                    }}
                                                                                >
                                                                                    {xpStatusTitle}
                                                                                </Box>
                                                                            );
                                                                        })()}
                                                                    </Box>

                                                                    {/* Playing Style column */}
                                                                    <Box sx={{
                                                                        width: { xs: 100, sm: 130, md: 150 },
                                                                        minWidth: { xs: 100, sm: 130, md: 150 },
                                                                        flexShrink: 0,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'flex-start',
                                                                    }}>
                                                                        <Typography className="league-table-row-text" sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 14, md: 15 }, color: '#fff', fontFamily: 'var(--font-woodford-bourne-pro), sans-serif', whiteSpace: 'nowrap' }}>
                                                                            {member.style || (member as any).playingStyle || '-'}
                                                                        </Typography>
                                                                    </Box>

                                                                    {/* View Stats column */}
                                                                    <Box sx={{
                                                                        width: { xs: 75, sm: 100, md: 115 },
                                                                        minWidth: { xs: 75, sm: 100, md: 115 },
                                                                        flexShrink: 0,
                                                                        display: 'flex',
                                                                        justifyContent: 'center',
                                                                        alignItems: 'center',
                                                                    }}>
                                                                        <Image src={TableGraphIcon} alt="View Stats" width={isMobile ? 23 : 30} height={isMobile ? 23 : 30} style={{ objectFit: 'contain' }} />
                                                                    </Box>

                                                                    {/* Career XP column with Progress Bar */}
                                                                    <Box sx={{
                                                                        width: { xs: 85, sm: 110, md: 125 },
                                                                        minWidth: { xs: 85, sm: 110, md: 125 },
                                                                        flexShrink: 0,
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'flex-end',
                                                                        justifyContent: 'center',
                                                                    }}>
                                                                        <Typography sx={{ fontWeight: 800, fontSize: { xs: 13, sm: 15, md: 16 }, color: '#22c55e', fontFamily: 'var(--font-woodford-bourne-pro), sans-serif', textAlign: 'right', lineHeight: 1.2 }}>
                                                                            {memberXp.toLocaleString()}
                                                                        </Typography>
                                                                        <Box sx={{ width: '100%', mt: 0.6, display: { xs: 'none', sm: 'flex' }, justifyContent: 'flex-end' }}>
                                                                            <Box sx={{
                                                                                width: { xs: 55, sm: 75, md: 85 },
                                                                                height: 3.5,
                                                                                backgroundColor: '#262930',
                                                                                borderRadius: '9999px',
                                                                                overflow: 'hidden',
                                                                            }}>
                                                                                <Box sx={{
                                                                                    width: `${progressPercent}%`,
                                                                                    height: '100%',
                                                                                    backgroundColor: '#22c55e',
                                                                                    borderRadius: '9999px',
                                                                                }} />
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>
                                                                </Box>
                                                            </ListItem>
                                                        );
                                                    })}
                                                </List>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Card>
                            </div>

                        )}
                            {section === 'matches' && (
                                // Fixtures Section - Upcoming Matches
                                <Box sx={{
                                    height: 'auto',
                                    overflowY: 'visible',
                                    scrollbarWidth: 'none',
                                    '&::-webkit-scrollbar': { display: 'none' },
                                    pb: { xs: 2, md: 3 },
                                    // p: 2
                                }}>
                                    {isAdmin && (
                                        isMatchCreationAllowed ? (
                                            <Link href={`/league/${leagueId}/match`} passHref>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    sx={{
                                                        background: '#0388E3',
                                                        color: '#ffffff',
                                                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.5rem' },
                                                        fontWeight: 600,
                                                        py: 0.5,
                                                        mb: 3,
                                                        borderRadius: 1,
                                                        textTransform: 'none',
                                                        '&:hover': {
                                                            background: '#0277C8',
                                                        },
                                                    }}
                                                >
                                                    <span className="mr-2 text-[#ffffff]">+ </span>   New Match
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={() => toast.error(inactiveLeagueMatchMessage)}
                                                sx={{
                                                    background: '#121316',
                                                    color: 'rgba(255,255,255,0.45)',
                                                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.5rem' },
                                                    fontWeight: 600,
                                                    py: 0.5,
                                                    mb: 3,
                                                    borderRadius: 1,
                                                    textTransform: 'none',
                                                    '&:hover': { background: 'rgba(255,255,255,0.18)' },
                                                }}
                                            >
                                                <span className="mr-2 text-[#656565]">+ </span>   New Match
                                            </Button>
                                        )
                                    )}
                                    <Paper sx={{
                                        background: '#1a1a1a',
                                        border: '2px solid rgba(255,255,255,0.2)',
                                        borderRadius: 2,
                                        // py: { xs: 5, sm: 7 },
                                        // px: { xs: 2, sm: 4 },
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1.5,
                                        // mt: 1,
                                        mb: 2,
                                    }}>
                                        <Typography
                                            sx={{
                                                color: 'rgba(255,255,255,0.78)',
                                                fontSize: { xs: '0.78rem', sm: '0.86rem' },
                                                textAlign: 'center',
                                                px: { xs: 1.5, sm: 2.5 },
                                                mb: 2,
                                                lineHeight: 1.5,
                                                mt: 2,
                                                // mb: 2
                                            }}
                                        >
                                            Match fixtures will move to Match Results once the match has finished. Please check the fixture duration time to know when to view completed matches.
                                        </Typography>
                                    </Paper>

                                    {filteredLeague?.matches && filteredLeague.matches.length > 0 ? (
                                        <Box sx={{
                                            display: 'grid',
                                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: 'repeat(3, 1fr)' },
                                            gap: 2
                                        }}>
                                            {filteredLeague.matches
                                                .filter((match) => isFixtureMatch(match))
                                                .sort(compareMatchesDesc)
                                                .map((match, idx) => {
                                                    const isUserAvailable = !!match.availableUsers?.some(u => u?.id === user?.id);
                                                    const isUserUnavailable = !!match.unavailableUsers?.some((u: { id: string | undefined; }) => u?.id === user?.id);
                                                    const seasonMatchNumberRaw = (match as unknown as { seasonMatchNumber?: unknown })?.seasonMatchNumber;
                                                    const seasonMatchNumber =
                                                        typeof seasonMatchNumberRaw === 'number'
                                                            ? seasonMatchNumberRaw
                                                            : (typeof seasonMatchNumberRaw === 'string' ? Number(seasonMatchNumberRaw) : NaN);
                                                    const matchNumber =
                                                        (Number.isFinite(seasonMatchNumber) && seasonMatchNumber > 0 ? seasonMatchNumber : null)
                                                        ?? getNumericIndex(match)
                                                        ?? (idx + 1);
                                                    // Calculate match duration in minutes
                                                    const startTime = match.start ? new Date(match.start) : new Date(match.date);
                                                    const endTime = match.end ? new Date(match.end) : new Date(startTime.getTime() + 90 * 60000);
                                                    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

                                                    return (
                                                        <Card
                                                            key={match.id}
                                                            onClick={(event) => handleMatchCardClick(match, event)}
                                                            sx={{
                                                                position: 'relative',
                                                                borderRadius: 1,
                                                                overflow: 'hidden',
                                                                background: '#222',
                                                                cursor: 'pointer',
                                                                border: '1px solid #fff',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                height: '100%',
                                                                '& .MuiCardContent-root': {
                                                                    pb: 0
                                                                },
                                                                '& .MuiCardContent-root:last-child': {
                                                                    pb: 0
                                                                },
                                                                '&:hover': {
                                                                    transform: 'translateY(-2px)',
                                                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)'
                                                                },
                                                            }}
                                                        >
                                                            {/* Match Title Header - White Background */}
                                                            <Box sx={{
                                                                background: 'white',
                                                                py: 0.7,
                                                                px: 2,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '6px',
                                                                borderBottom: '1px solid #e0e0e0'
                                                            }}>
                                                                <Image src={FootBallIcon} alt="Football" width={24} height={24} />
                                                                <Typography sx={{
                                                                    color: 'black',
                                                                    fontFamily: 'var(--font-woodford-bourne-pro)',
                                                                    fontWeight: 700,
                                                                    fontSize: '18px',
                                                                    lineHeight: 1,
                                                                    letterSpacing: 0,
                                                                    verticalAlign: 'middle',
                                                                    textTransform: 'capitalize',
                                                                    textDecoration: 'underline',
                                                                    textDecorationStyle: 'solid',
                                                                    textAlign: 'center'
                                                                }}>
                                                                    Match {matchNumber}
                                                                </Typography>
                                                            </Box>

                                                            <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', flex: 1, '&:last-child': { pb: 0 } }}>
                                                                {/* Top Section - Teams & VS */}
                                                                <Box sx={{
                                                                    px: 2,
                                                                    pt: { xs: 2.5, sm: 3 },
                                                                    pb: 1.5,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                                                                    boxSizing: 'border-box'
                                                                }}>
                                                                    {/* Home Team */}
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        width: '32%',
                                                                        minWidth: 0,
                                                                        px: 0.5
                                                                    }}>
                                                                        <Image
                                                                            src={resolveImageUrl(match.homeTeamImage || HomeTeamImage)}
                                                                            alt={match.homeTeamName || 'Home'}
                                                                            width={50}
                                                                            height={50}
                                                                            style={{ objectFit: 'contain' }}
                                                                        />
                                                                        <Typography sx={{
                                                                            color: 'white',
                                                                            fontWeight: 700,
                                                                            fontSize: { xs: '0.85rem', sm: '0.92rem' },
                                                                            lineHeight: 1.2,
                                                                            textAlign: 'center',
                                                                            mt: 0.25,
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            display: '-webkit-box',
                                                                            WebkitLineClamp: 2,
                                                                            WebkitBoxOrient: 'vertical',
                                                                            wordBreak: 'break-word',
                                                                            width: '100%',
                                                                        }}>
                                                                            {formatDisplayTeamName(match.homeTeamName || match.homeTeam, 'Home')}
                                                                        </Typography>
                                                                    </Box>

                                                                    {/* VS Center */}
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        flex: 1,
                                                                        minWidth: 0,
                                                                        px: 0.5
                                                                    }}>
                                                                        <Typography sx={{
                                                                            fontFamily: 'var(--font-oswald), "Oswald", sans-serif !important',
                                                                            fontWeight: 700,
                                                                            fontSize: { xs: '1.6rem', sm: '2rem' },
                                                                            lineHeight: 1,
                                                                            letterSpacing: '1px',
                                                                            textTransform: 'uppercase',
                                                                            color: 'white',
                                                                        }}>
                                                                            V/S
                                                                        </Typography>
                                                                        <Typography sx={{
                                                                            color: '#b0b3b8',
                                                                            fontSize: { xs: '0.72rem', sm: '0.78rem' },
                                                                            textAlign: 'center',
                                                                            mt: 0.75,
                                                                            whiteSpace: 'nowrap'
                                                                        }}>
                                                                            {durationMinutes} Minutes Match
                                                                        </Typography>
                                                                    </Box>

                                                                    {/* Away Team */}
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        width: '32%',
                                                                        minWidth: 0,
                                                                        px: 0.5
                                                                    }}>
                                                                        <Image
                                                                            src={resolveImageUrl(match.awayTeamImage || AwayTeamImage)}
                                                                            alt={match.awayTeamName || 'Away'}
                                                                            width={50}
                                                                            height={50}
                                                                            style={{ objectFit: 'contain' }}
                                                                        />
                                                                        <Typography sx={{
                                                                            color: 'white',
                                                                            fontWeight: 700,
                                                                            fontSize: { xs: '0.85rem', sm: '0.92rem' },
                                                                            lineHeight: 1.2,
                                                                            textAlign: 'center',
                                                                            mt: 0.25,
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            display: '-webkit-box',
                                                                            WebkitLineClamp: 2,
                                                                            WebkitBoxOrient: 'vertical',
                                                                            wordBreak: 'break-word',
                                                                            width: '100%',
                                                                        }}>
                                                                            {formatDisplayTeamName(match.awayTeamName || match.awayTeam, 'Away')}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>

                                                                {/* Match Details Row: Date/Time, Location (Centered), Kick-off Countdown */}
                                                                <Box sx={{
                                                                    display: 'grid',
                                                                    gridTemplateColumns: '1fr auto 1fr',
                                                                    alignItems: 'center',
                                                                    gap: 1,
                                                                    px: 1.5,
                                                                    pt: 1.25,
                                                                    pb: 0.5,
                                                                    width: '100%'
                                                                }}>
                                                                    {/* Left: Date & Time */}
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minWidth: 0 }}>
                                                                        <Typography sx={{
                                                                            color: '#d1d5db',
                                                                            fontSize: { xs: '0.72rem', sm: '0.8rem' },
                                                                            fontWeight: 600,
                                                                            whiteSpace: 'nowrap',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis'
                                                                        }}>
                                                                            {formatFixtureDateTime(match.date || match.start)}
                                                                        </Typography>
                                                                    </Box>

                                                                    {/* Center: Location */}
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        gap: 0.5,
                                                                        minWidth: 0,
                                                                        textAlign: 'center'
                                                                    }}>
                                                                        {match.location ? (
                                                                            <>
                                                                                <MapPin size={15} color="#d1d5db" style={{ flexShrink: 0 }} />
                                                                                <Typography sx={{
                                                                                    color: '#d1d5db',
                                                                                    fontSize: { xs: '0.72rem', sm: '0.8rem' },
                                                                                    fontWeight: 500,
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis',
                                                                                    whiteSpace: 'nowrap'
                                                                                }}>
                                                                                    {formatLocationForCard(match.location)}
                                                                                </Typography>
                                                                            </>
                                                                        ) : null}
                                                                    </Box>

                                                                    {/* Right: Kick-off Countdown Badge */}
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minWidth: 0 }}>
                                                                        {getKickoffCountdown(match.date || match.start) ? (
                                                                            <Box sx={{
                                                                                bgcolor: 'rgba(255, 255, 255, 0.06)',
                                                                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                                                                borderRadius: '6px',
                                                                                px: { xs: 0.75, sm: 1 },
                                                                                py: 0.4,
                                                                                fontSize: { xs: '0.68rem', sm: '0.75rem' },
                                                                                color: '#adb5bd',
                                                                                fontWeight: 500,
                                                                                whiteSpace: 'nowrap',
                                                                                display: 'inline-flex',
                                                                                alignItems: 'center'
                                                                            }}>
                                                                                {getKickoffCountdown(match.date || match.start)}
                                                                            </Box>
                                                                        ) : null}
                                                                    </Box>
                                                                </Box>

                                                                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                                                                {/* Confirmed Count & See Who Is Playing */}
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1.5,
                                                                    px: 1.5,
                                                                    py: 0.75,
                                                                    mx: 1.5,
                                                                    my: 0.5,
                                                                    bgcolor: 'rgba(255, 255, 255, 0.04)',
                                                                    borderRadius: '6px'
                                                                }}>
                                                                    <Typography sx={{
                                                                        color: '#9ca3af',
                                                                        fontSize: '0.82rem',
                                                                        fontWeight: 700
                                                                    }}>
                                                                        {match.availableUsers?.length || 0} Confirmed
                                                                    </Typography>
                                                                    <Button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedMatchDetail(match);
                                                                            setMatchDetailModalOpen(true);
                                                                        }}
                                                                        sx={{
                                                                            color: '#00D09E',
                                                                            fontSize: '0.82rem',
                                                                            fontWeight: 600,
                                                                            textTransform: 'none',
                                                                            textDecoration: 'underline',
                                                                            p: 0,
                                                                            minWidth: 0,
                                                                            background: 'none',
                                                                            border: 'none',
                                                                            cursor: 'pointer',
                                                                            '&:hover': {
                                                                                color: '#00af80',
                                                                                textDecoration: 'underline',
                                                                                bgcolor: 'transparent'
                                                                            }
                                                                        }}
                                                                    >
                                                                        See who is playing
                                                                    </Button>
                                                                </Box>

                                                                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                                                                {/* Action Buttons: I'm in, Can't make it, Teams */}
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    gap: 1,
                                                                    px: 1.5,
                                                                    pt: 0.75,
                                                                    pb: 1.5,
                                                                    width: '100%',
                                                                    boxSizing: 'border-box'
                                                                }}>
                                                                    {isMember && (
                                                                        <>
                                                                            <Button
                                                                                variant="contained"
                                                                                size="small"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleToggleAvailability(match.id, true);
                                                                                }}
                                                                                disabled={availabilityLoading[match.id] || !league?.active || !isSelectedSeasonActive}
                                                                                sx={{
                                                                                    background: '#00af80',
                                                                                    color: 'white',
                                                                                    textTransform: 'none',
                                                                                    fontWeight: 700,
                                                                                    fontSize: { xs: '0.78rem', sm: '0.85rem' },
                                                                                    py: 0.9,
                                                                                    px: 1,
                                                                                    borderRadius: '10px',
                                                                                    whiteSpace: 'nowrap',
                                                                                    flex: 1,
                                                                                    minWidth: 0,
                                                                                    position: 'relative',
                                                                                    zIndex: isUserAvailable ? 2 : 1,
                                                                                    boxShadow: isUserAvailable ? '0 0 14px 4px rgba(0, 255, 170, 0.8), 0 0 22px rgba(0, 255, 170, 0.5)' : 'none',
                                                                                    border: isUserAvailable ? '2px solid #00ffaa' : 'none',
                                                                                    '&:hover': { background: '#008f6a' },
                                                                                    '&.Mui-disabled': { opacity: 0.5 }
                                                                                }}
                                                                            >
                                                                                {availabilityLoading[match.id] ? <CircularProgress size={16} color="inherit" /> : "I'm in"}
                                                                            </Button>
                                                                            <Button
                                                                                variant="contained"
                                                                                size="small"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleToggleAvailability(match.id, false);
                                                                                }}
                                                                                disabled={availabilityLoading[match.id] || !league?.active || !isSelectedSeasonActive}
                                                                                sx={{
                                                                                    background: isUserUnavailable ? '#c62828' : '#23272f',
                                                                                    color: 'white',
                                                                                    textTransform: 'none',
                                                                                    fontWeight: 700,
                                                                                    fontSize: { xs: '0.78rem', sm: '0.85rem' },
                                                                                    py: 0.9,
                                                                                    px: 1,
                                                                                    borderRadius: '10px',
                                                                                    whiteSpace: 'nowrap',
                                                                                    flex: 1,
                                                                                    minWidth: 0,
                                                                                    position: 'relative',
                                                                                    zIndex: isUserUnavailable ? 2 : 1,
                                                                                    boxShadow: isUserUnavailable ? '0 0 14px 4px rgba(255, 75, 75, 0.8), 0 0 22px rgba(255, 100, 100, 0.5)' : 'none',
                                                                                    border: isUserUnavailable ? '2px solid #ff6b6b' : '1px solid rgba(255, 255, 255, 0.15)',
                                                                                    '&:hover': { background: isUserUnavailable ? '#b71c1c' : '#2e333d' },
                                                                                    '&.Mui-disabled': { opacity: 0.5 }
                                                                                }}
                                                                            >
                                                                                {availabilityLoading[match.id] ? <CircularProgress size={16} color="inherit" /> : "Can't make it"}
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                    <Button
                                                                        variant="contained"
                                                                        size="small"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setViewTeamMatch({ leagueId, matchId: match.id, matchNumber });
                                                                            setViewTeamOpen(true);
                                                                        }}
                                                                        sx={{
                                                                            background: '#7c3aed',
                                                                            color: 'white',
                                                                            textTransform: 'none',
                                                                            fontWeight: 700,
                                                                            fontSize: { xs: '0.78rem', sm: '0.85rem' },
                                                                            py: 0.9,
                                                                            px: 1,
                                                                            borderRadius: '10px',
                                                                            whiteSpace: 'nowrap',
                                                                            flex: 1,
                                                                            minWidth: 0,
                                                                            '&:hover': { background: '#6d28d9' }
                                                                        }}
                                                                    >
                                                                        Teams
                                                                    </Button>
                                                                </Box>

                                                                {/* Admin Section at Bottom */}
                                                                {isAdmin && (
                                                                    <Box sx={{
                                                                        mt: 'auto',
                                                                        pt: 1,
                                                                        pb: 1,
                                                                        px: { xs: 0.75, sm: 1.5 },
                                                                        borderTop: '1px dashed #e56a16',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'space-between',
                                                                        gap: { xs: 0.5, sm: 1 },
                                                                        bgcolor: 'rgba(255,255,255,0.05)',
                                                                        width: '100%',
                                                                        boxSizing: 'border-box'
                                                                    }}>
                                                                        <Typography sx={{
                                                                            color: '#888',
                                                                            fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                                                            fontWeight: 600,
                                                                            flexShrink: 0
                                                                        }}>
                                                                            Admin
                                                                        </Typography>
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: { xs: 0.4, sm: 0.75 },
                                                                            flexWrap: 'nowrap',
                                                                            minWidth: 0
                                                                        }}>
                                                                            <Button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setEditMatchId(match.id);
                                                                                    setEditMatchDialogOpen(true);
                                                                                }}
                                                                                disabled={!league?.active}
                                                                                startIcon={<Edit size={12} color="#00D09E" />}
                                                                                sx={{
                                                                                    color: 'white',
                                                                                    bgcolor: 'transparent',
                                                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                                                    borderRadius: '8px',
                                                                                    px: { xs: 0.6, sm: 1.2 },
                                                                                    py: 0.4,
                                                                                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                                                                    fontWeight: 600,
                                                                                    textTransform: 'none',
                                                                                    minWidth: 0,
                                                                                    whiteSpace: 'nowrap',
                                                                                    '& .MuiButton-startIcon': { mr: { xs: 0.3, sm: 0.5 }, ml: 0 },
                                                                                    '&:hover': {
                                                                                        bgcolor: 'rgba(0, 208, 158, 0.15)',
                                                                                        borderColor: '#00D09E'
                                                                                    },
                                                                                    '&.Mui-disabled': { opacity: 0.4 }
                                                                                }}
                                                                            >
                                                                                Edit Match
                                                                            </Button>
                                                                            <Button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleRequestDeleteMatch(match);
                                                                                }}
                                                                                startIcon={<Trash2 size={12} color="#ff4d4f" />}
                                                                                sx={{
                                                                                    color: '#ff4d4f',
                                                                                    bgcolor: 'transparent',
                                                                                    border: '1px solid rgba(255, 77, 79, 0.4)',
                                                                                    borderRadius: '8px',
                                                                                    px: { xs: 0.6, sm: 1.2 },
                                                                                    py: 0.4,
                                                                                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                                                                    fontWeight: 600,
                                                                                    textTransform: 'none',
                                                                                    minWidth: 0,
                                                                                    whiteSpace: 'nowrap',
                                                                                    '& .MuiButton-startIcon': { mr: { xs: 0.3, sm: 0.5 }, ml: 0 },
                                                                                    '&:hover': {
                                                                                        bgcolor: 'rgba(255, 77, 79, 0.15)',
                                                                                        borderColor: '#ff4d4f'
                                                                                    }
                                                                                }}
                                                                            >
                                                                                Delete
                                                                            </Button>
                                                                        </Box>
                                                                    </Box>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })}
                                        </Box>
                                    ) : (
                                        <Paper sx={{
                                            background: '#1a1a1a',
                                            border: '2px solid rgba(255,255,255,0.2)',
                                            borderRadius: 2,
                                            py: { xs: 5, sm: 7 },
                                            px: { xs: 2, sm: 4 },
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 1.5,
                                            mt: 1,
                                        }}>
                                            <Box sx={{ opacity: 0.3 }}>
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                            </Box>
                                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', fontWeight: 600, textAlign: 'center', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                                No upcoming matches scheduled yet
                                            </Typography>
                                        </Paper>
                                    )}
                                </Box>
                            )}

                            {section === 'results' && (
                                // Results Section - Completed Matches
                                <Box sx={{
                                    height: 'auto',
                                    overflowY: 'visible',
                                    scrollbarWidth: 'none',
                                    '&::-webkit-scrollbar': { display: 'none' },
                                    // pb: { xs: 2, md: 3 },
                                    // p: 2
                                }}>
                                    {filteredLeague?.matches && filteredLeague.matches.length > 0 ? (
                                        <Box sx={{
                                            display: 'grid',
                                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: 'repeat(3, 1fr)' },
                                            gap: 2
                                        }}>
                                            {filteredLeague.matches
                                                .filter((match) => isResultMatch(match))
                                                .sort(compareMatchesDesc)
                                                .map((match, idx) => {
                                                    const seasonMatchNumberRaw = (match as unknown as { seasonMatchNumber?: unknown })?.seasonMatchNumber;
                                                    const seasonMatchNumber =
                                                        typeof seasonMatchNumberRaw === 'number'
                                                            ? seasonMatchNumberRaw
                                                            : (typeof seasonMatchNumberRaw === 'string' ? Number(seasonMatchNumberRaw) : NaN);
                                                    const matchNumber =
                                                        (Number.isFinite(seasonMatchNumber) && seasonMatchNumber > 0 ? seasonMatchNumber : null)
                                                        ?? getNumericIndex(match)
                                                        ?? (idx + 1);
                                                    const startTime = match.start ? new Date(match.start) : new Date(match.date);
                                                    const endTime = match.end ? new Date(match.end) : new Date(startTime.getTime() + 90 * 60000);
                                                    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
                                                    const matchSeasonActiveForStats = isMatchSeasonActiveForStats(match);
                                                    const cardActionButtonSx = {
                                                        color: 'white',
                                                        fontSize: { xs: '0.52rem', sm: '0.6rem' },
                                                        fontWeight: 600,
                                                        textTransform: 'none',
                                                        py: 0,
                                                        px: { xs: 0.4, sm: 0.75 },
                                                        height: { xs: '32px', sm: '35px' },
                                                        minHeight: { xs: '32px', sm: '35px' },
                                                        borderRadius: '8px',
                                                        whiteSpace: 'nowrap',
                                                        width: '100%',
                                                        minWidth: 0,
                                                        justifyContent: 'center',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        // '&:hover': { backgroundColor: '#444' },
                                                        '&:hover': { backgroundColor: '#8E4B1C' },
                                                        '& .MuiButton-startIcon': {
                                                            mr: { xs: 0.2, sm: 0.35 },
                                                            ml: 0,
                                                            display: 'inline-flex',
                                                            flexShrink: 0,
                                                        },
                                                        '& .MuiButton-startIcon img': {
                                                            display: 'block',
                                                        },
                                                    } as const;

                                                    // Calculate win result
                                                    const homeGoals = match.homeTeamGoals ?? 0;
                                                    const awayGoals = match.awayTeamGoals ?? 0;
                                                    const goalDiff = Math.abs(homeGoals - awayGoals);
                                                    let resultText = 'Draw';
                                                    if (homeGoals > awayGoals) resultText = `Home Team Won By ${goalDiff} Goal${goalDiff > 1 ? 's' : ''}`;
                                                    else if (awayGoals > homeGoals) resultText = `Away Team Won By ${goalDiff} Goal${goalDiff > 1 ? 's' : ''}`;

                                                    return (
                                                        <Card
                                                            key={match.id}
                                                            sx={{
                                                                position: 'relative',
                                                                borderRadius: 1,
                                                                overflow: 'hidden',
                                                                background: '#222',
                                                                border: '1px solid #fff',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                height: '100%',
                                                                '& .MuiCardContent-root:last-child': {
                                                                    paddingBottom: 0
                                                                },
                                                                '&:hover': {
                                                                    transform: 'translateY(-2px)',
                                                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)'
                                                                },
                                                            }}
                                                        >
                                                            {/* Archived label */}
                                                            {match.archived && (
                                                                <Chip
                                                                    label="Cancelled by Admin"
                                                                    size="small"
                                                                    sx={{
                                                                        position: 'absolute',
                                                                        top: 40,
                                                                        left: '50%',
                                                                        transform: 'translateX(-50%)',
                                                                        zIndex: 10,
                                                                        backgroundColor: '#b91c1c',
                                                                        color: 'white',
                                                                        fontWeight: 'bold',
                                                                    }}
                                                                />
                                                            )}

                                                            {/* Match Title Header - White Background */}
                                                            <Box sx={{
                                                                background: 'white',
                                                                py: 0.7,
                                                                px: 2,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '6px',
                                                                borderBottom: '1px solid #e0e0e0'
                                                            }}>
                                                                <Image src={FootBallIcon} alt="Football" width={24} height={24} />
                                                                <Typography sx={{
                                                                    color: 'black',
                                                                    fontFamily: 'var(--font-woodford-bourne-pro)',
                                                                    fontWeight: 700,
                                                                    fontSize: '18px',
                                                                    lineHeight: 1,
                                                                    letterSpacing: 0,
                                                                    verticalAlign: 'middle',
                                                                    textTransform: 'capitalize',
                                                                    textDecoration: 'underline',
                                                                    textDecorationStyle: 'solid',
                                                                    textAlign: 'center'
                                                                }}>
                                                                    Match {matchNumber}
                                                                </Typography>
                                                            </Box>

                                                            <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', flex: 1, '&:last-child': { pb: 0 } }}>
                                                                {/* Result Text Banner */}
                                                                <Box sx={{
                                                                    py: 0.5,
                                                                    minHeight: '26px',
                                                                    maxHeight: '26px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    textAlign: 'center',
                                                                    px: 1
                                                                }}>
                                                                    <Typography sx={{
                                                                        color: 'white',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 400,
                                                                        whiteSpace: 'nowrap',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis'
                                                                    }}>
                                                                        {isAwaitingConfirmationStatus(match.status) ? 'Awaiting Confirmation' : resultText}
                                                                    </Typography>
                                                                </Box>

                                                                {/* Top Section - Teams & Score */}
                                                                <Box sx={{
                                                                    pl: 1,
                                                                    pr: 1,
                                                                    py: 0.25,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    borderBottom: '1px solid #fff',
                                                                    mt: -1.75,
                                                                    gap: 0,
                                                                    minHeight: { xs: '100px', sm: '104px' },
                                                                    boxSizing: 'border-box'
                                                                }}>
                                                                    {/* Home Team */}
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        width: '30%',
                                                                        maxWidth: '30%',
                                                                        minWidth: 0,
                                                                        px: 0.5,
                                                                        pt: 0.75
                                                                    }}>
                                                                        <Image
                                                                            src={resolveImageUrl(match.homeTeamImage || HomeTeamImage)}
                                                                            alt={match.homeTeamName}
                                                                            width={50}
                                                                            height={50}
                                                                            style={{ objectFit: 'contain' }}
                                                                        />
                                                                        <Typography sx={{
                                                                            color: 'white',
                                                                            fontWeight: 600,
                                                                            fontSize: { xs: '0.78rem', sm: '0.84rem' },
                                                                            lineHeight: 1.15,
                                                                            textAlign: 'center',
                                                                            mt: 0.25,
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            display: '-webkit-box',
                                                                            WebkitLineClamp: 2,
                                                                            WebkitBoxOrient: 'vertical',
                                                                            wordBreak: 'break-word',
                                                                            maxWidth: '100%',
                                                                            width: '100%',
                                                                        }}>
                                                                            {formatDisplayTeamName(match.homeTeamName || match.homeTeam, 'Home Team')}
                                                                        </Typography>
                                                                    </Box>

                                                                    {/* Score Center */}
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        width: '40%',
                                                                        maxWidth: '40%',
                                                                        flexShrink: 0,
                                                                        minWidth: 0
                                                                    }}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1.25 }, justifyContent: 'center', width: '100%' }}>
                                                                            {/* Home Goals with label below */}
                                                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                                                                                <Typography sx={{
                                                                                    fontWeight: 700,
                                                                                    fontSize: { xs: '1.75rem', sm: '2.1rem' },
                                                                                    lineHeight: 1,
                                                                                    color: 'white',
                                                                                }}>
                                                                                    {homeGoals}
                                                                                </Typography>
                                                                                <Typography sx={{
                                                                                    fontSize: '0.55rem',
                                                                                    color: '#aaa',
                                                                                    whiteSpace: 'nowrap'
                                                                                }}>
                                                                                    Goal Score
                                                                                </Typography>
                                                                            </Box>

                                                                            {/* V/S */}
                                                                            <Typography sx={{
                                                                                fontFamily: 'var(--font-oswald), "Oswald", sans-serif !important',
                                                                                fontWeight: 600,
                                                                                fontSize: { xs: '1.2rem', sm: '1.4rem' },
                                                                                lineHeight: 0.5,
                                                                                letterSpacing: '-1.5px',
                                                                                textTransform: 'uppercase',
                                                                                color: 'white',
                                                                                px: 0.5
                                                                            }}>
                                                                                V/S
                                                                            </Typography>

                                                                            {/* Away Goals with label below */}
                                                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                                                                                <Typography sx={{
                                                                                    fontWeight: 700,
                                                                                    fontSize: { xs: '1.75rem', sm: '2.1rem' },
                                                                                    lineHeight: 1,
                                                                                    color: 'white',
                                                                                }}>
                                                                                    {awayGoals}
                                                                                </Typography>
                                                                                <Typography sx={{
                                                                                    fontSize: '0.55rem',
                                                                                    color: '#aaa',
                                                                                    whiteSpace: 'nowrap'
                                                                                }}>
                                                                                    Goal Score
                                                                                </Typography>
                                                                            </Box>
                                                                        </Box>
                                                                        <Typography sx={{
                                                                            color: '#ddd',
                                                                            fontSize: { xs: '0.72rem', sm: '0.78rem' },
                                                                            textAlign: 'center',
                                                                            mt: 0.5,
                                                                            whiteSpace: 'nowrap'
                                                                        }}>
                                                                            {durationMinutes} Minutes Match
                                                                        </Typography>
                                                                    </Box>

                                                                    {/* Away Team */}
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        width: '30%',
                                                                        maxWidth: '30%',
                                                                        minWidth: 0,
                                                                        px: 0.5,
                                                                        pt: 0.75
                                                                    }}>
                                                                        <Image
                                                                            src={resolveImageUrl(match.awayTeamImage || AwayTeamImage)}
                                                                            alt={match.awayTeamName}
                                                                            width={50}
                                                                            height={50}
                                                                            style={{ objectFit: 'contain' }}
                                                                        />
                                                                        <Typography sx={{
                                                                            color: 'white',
                                                                            fontWeight: 600,
                                                                            fontSize: { xs: '0.78rem', sm: '0.84rem' },
                                                                            lineHeight: 1.15,
                                                                            textAlign: 'center',
                                                                            mt: 0.25,
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            display: '-webkit-box',
                                                                            WebkitLineClamp: 2,
                                                                            WebkitBoxOrient: 'vertical',
                                                                            wordBreak: 'break-word',
                                                                            maxWidth: '100%',
                                                                            width: '100%',
                                                                        }}>
                                                                            {formatDisplayTeamName(match.awayTeamName || match.awayTeam, 'Away Team')}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>

                                                                {/* Match Details Row: Date/Time, Location (Centered), Played Indicator */}
                                                                {(() => {
                                                                    const currentUserId = user?.id || (user as any)?._id;
                                                                    const hasPlayed = isUserInMatch(match, currentUserId);
                                                                    const isCompleted = !league?.active || !matchSeasonActiveForStats;
                                                                    const { count, total, percent } = getMatchStatsProgress(match, matchStatsMap[match.id]);
                                                                    const motm = getTopMotmPlayer(match, league?.members || []);

                                                                    return (
                                                                        <>
                                                                            <Box sx={{
                                                                                display: 'grid',
                                                                                gridTemplateColumns: '1fr auto 1fr',
                                                                                alignItems: 'center',
                                                                                gap: 1,
                                                                                px: 1.5,
                                                                                pt: 1.25,
                                                                                pb: 0.5,
                                                                                width: '100%'
                                                                            }}>
                                                                                {/* Left: Date & Time */}
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minWidth: 0 }}>
                                                                                    <Typography sx={{
                                                                                        color: '#d1d5db',
                                                                                        fontSize: { xs: '0.72rem', sm: '0.8rem' },
                                                                                        fontWeight: 600,
                                                                                        whiteSpace: 'nowrap',
                                                                                        overflow: 'hidden',
                                                                                        textOverflow: 'ellipsis'
                                                                                    }}>
                                                                                        {formatFixtureDateTime(match.date || match.start)}
                                                                                    </Typography>
                                                                                </Box>

                                                                                {/* Center: Location */}
                                                                                <Box sx={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    gap: 0.5,
                                                                                    minWidth: 0,
                                                                                    textAlign: 'center'
                                                                                }}>
                                                                                    {match.location ? (
                                                                                        <>
                                                                                            <MapPin size={15} color="#d1d5db" style={{ flexShrink: 0 }} />
                                                                                            <Typography sx={{
                                                                                                color: '#d1d5db',
                                                                                                fontSize: { xs: '0.72rem', sm: '0.8rem' },
                                                                                                fontWeight: 500,
                                                                                                overflow: 'hidden',
                                                                                                textOverflow: 'ellipsis',
                                                                                                whiteSpace: 'nowrap'
                                                                                            }}>
                                                                                                {formatLocationForCard(match.location)}
                                                                                            </Typography>
                                                                                        </>
                                                                                    ) : null}
                                                                                </Box>

                                                                                {/* Right: Played Indicator */}
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minWidth: 0 }}>
                                                                                    {hasPlayed ? (
                                                                                        <Box sx={{
                                                                                            // bgcolor: 'rgba(255, 255, 255, 0.05)',
                                                                                            // borderRadius: '4px',
                                                                                            px: { xs: 1.25, sm: 1.75 },
                                                                                            py: 0.4,
                                                                                            fontSize: { xs: '0.72rem', sm: '0.78rem' },
                                                                                            color: '#22c55e',
                                                                                            fontWeight: 700,
                                                                                            whiteSpace: 'nowrap',
                                                                                            display: 'inline-flex',
                                                                                            alignItems: 'center',
                                                                                            justifyContent: 'center',
                                                                                        }}>
                                                                                            Played
                                                                                        </Box>
                                                                                    ) : null}
                                                                                </Box>
                                                                            </Box>

                                                                            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                                                                            {/* MOTM Row */}
                                                                            <Box sx={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'space-between',
                                                                                px: 1.5,
                                                                                py: 0.75,
                                                                                // mx: 1.5,
                                                                                // my: 0.5,
                                                                                // bgcolor: 'rgba(255, 255, 255, 0.04)',
                                                                                // borderRadius: '8px',
                                                                            }}>
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                                                                                    <Avatar
                                                                                        src={motm?.picture || undefined}
                                                                                        sx={{
                                                                                            width: 32,
                                                                                            height: 32,
                                                                                            bgcolor: '#eab308',
                                                                                            color: '#000',
                                                                                            fontWeight: 700,
                                                                                            fontSize: '0.85rem'
                                                                                        }}
                                                                                    >
                                                                                        {motm ? motm.initial : <Crown size={16} />}
                                                                                    </Avatar>
                                                                                    <Box sx={{ minWidth: 0 }}>
                                                                                        <Typography sx={{
                                                                                            color: motm ? '#fff' : '#9ca3af',
                                                                                            fontSize: '0.82rem',
                                                                                            fontWeight: 700,
                                                                                            lineHeight: 1.2,
                                                                                            overflow: 'hidden',
                                                                                            textOverflow: 'ellipsis',
                                                                                            whiteSpace: 'nowrap'
                                                                                        }}>
                                                                                            {motm ? motm.name : 'Select the MOTM'}
                                                                                        </Typography>
                                                                                        <Typography sx={{
                                                                                            color: '#9ca3af',
                                                                                            fontSize: '0.68rem',
                                                                                            fontWeight: 500,
                                                                                            lineHeight: 1.1
                                                                                        }}>
                                                                                            Man of the match
                                                                                        </Typography>
                                                                                    </Box>
                                                                                </Box>
                                                                                <Star sx={{ fontSize: 20, color: motm ? '#f59e0b' : '#6b7280' }} />
                                                                            </Box>

                                                                            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                                                                            {/* Player Statistics Progress Indicator */}
                                                                            <Box sx={{ px: 1, py: 0.5, mx: 1, my: 0.25 }}>
                                                                                <Typography sx={{ color: '#9ca3af', fontSize: '0.72rem', fontWeight: 500, mb: 0.6 }}>
                                                                                    Stats added for {count} of {total} players
                                                                                </Typography>
                                                                                <Box sx={{
                                                                                    width: '100%',
                                                                                    height: 5,
                                                                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                                                                    borderRadius: 3,
                                                                                    overflow: 'hidden'
                                                                                }}>
                                                                                    <Box sx={{
                                                                                        width: `${percent}%`,
                                                                                        height: '100%',
                                                                                        bgcolor: '#2563eb',
                                                                                        borderRadius: 3,
                                                                                        transition: 'width 0.3s ease'
                                                                                    }} />
                                                                                </Box>
                                                                            </Box>

                                                                            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                                                                            {/* Action Buttons: + My Stats, Teams, Report */}
                                                                            <Box sx={{
                                                                                display: 'flex',
                                                                                gap: 1,
                                                                                px: 1.5,
                                                                                pt: 0.75,
                                                                                pb: 1.5,
                                                                                width: '100%',
                                                                                boxSizing: 'border-box'
                                                                            }}>
                                                                                <Button
                                                                                    variant="contained"
                                                                                    size="small"
                                                                                    onClick={() => {
                                                                                        if (match.archived) return;
                                                                                        if (isCompleted) {
                                                                                            const toastMsg = !league?.active
                                                                                                ? 'League is complete you are not able to add new stats. Please contact admin to update stats.'
                                                                                                : 'Season is complete you are not able to add new stats. Please contact admin to update stats.';
                                                                                            toast(toastMsg, {
                                                                                                icon: '🏆',
                                                                                                duration: 5000,
                                                                                                style: {
                                                                                                    color: '#fff',
                                                                                                    fontWeight: 600,
                                                                                                    fontSize: '0.95rem',
                                                                                                    padding: '14px 20px',
                                                                                                    borderRadius: '12px',
                                                                                                    background: '#EF4444',
                                                                                                    boxShadow: '0 4px 20px rgba(239, 68, 68, 0.5)',
                                                                                                },
                                                                                            });
                                                                                            return;
                                                                                        }
                                                                                        if (idx >= 2) {
                                                                                            toast('unable to enter stats as this match has been locked, please request admin to make any changes etc', {
                                                                                                icon: '🔒',
                                                                                                duration: 5000,
                                                                                                style: {
                                                                                                    background: '#F59E0B',
                                                                                                    color: '#fff',
                                                                                                    fontWeight: 600,
                                                                                                    fontSize: '0.95rem',
                                                                                                    padding: '14px 20px',
                                                                                                    borderRadius: '12px',
                                                                                                    boxShadow: '0 4px 20px rgba(245, 158, 11, 0.5)',
                                                                                                },
                                                                                            });
                                                                                            return;
                                                                                        }
                                                                                        if (!hasPlayed && !isAdmin) {
                                                                                            toast('You are not added in this match.', {
                                                                                                icon: '⚠️',
                                                                                                duration: 4000,
                                                                                                style: {
                                                                                                    background: '#22242a',
                                                                                                    color: '#fff',
                                                                                                    fontWeight: 600,
                                                                                                    fontSize: '0.95rem',
                                                                                                    padding: '14px 20px',
                                                                                                    borderRadius: '2px',
                                                                                                    boxShadow: '0 4px 20px rgba(249, 115, 22, 0.5)',
                                                                                                },
                                                                                            });
                                                                                            return;
                                                                                        }
                                                                                        setSelectedMatchIdForDialog(match.id);
                                                                                        setShouldShowAdminGoals(false);
                                                                                        setMatchStatsOpen(true);
                                                                                    }}
                                                                                    disabled={match.archived}
                                                                                    sx={{
                                                                                        color: 'white',
                                                                                        textTransform: 'none',
                                                                                        fontWeight: 700,
                                                                                        fontSize: { xs: '0.78rem', sm: '0.85rem' },
                                                                                        py: 0.9,
                                                                                        px: 1,
                                                                                        borderRadius: '10px',
                                                                                        whiteSpace: 'nowrap',
                                                                                        flex: 1,
                                                                                        minWidth: 0,
                                                                                        lineHeight: 1.2,
                                                                                        background: '#2563EB',
                                                                                        '&:hover': { background: '#1D4ED8' },
                                                                                        '&.Mui-disabled': { opacity: 0.5 }
                                                                                    }}
                                                                                >
                                                                                    + My Stats
                                                                                </Button>
                                                                                <Button
                                                                                    variant="contained"
                                                                                    size="small"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setViewTeamMatch({ leagueId, matchId: match.id, matchNumber });
                                                                                        setViewTeamOpen(true);
                                                                                    }}
                                                                                    disabled={match.archived}
                                                                                    sx={{
                                                                                        color: 'white',
                                                                                        textTransform: 'none',
                                                                                        fontWeight: 700,
                                                                                        fontSize: { xs: '0.78rem', sm: '0.85rem' },
                                                                                        py: 0.9,
                                                                                        px: 1,
                                                                                        borderRadius: '10px',
                                                                                        whiteSpace: 'nowrap',
                                                                                        flex: 1,
                                                                                        minWidth: 0,
                                                                                        lineHeight: 1.2,
                                                                                        background: '#7C3AED',
                                                                                        '&:hover': { background: '#6D28D9' },
                                                                                        '&.Mui-disabled': { opacity: 0.5 }
                                                                                    }}
                                                                                >
                                                                                    Teams
                                                                                </Button>
                                                                                <Button
                                                                                    variant="contained"
                                                                                    size="small"
                                                                                    onClick={() => {
                                                                                        setResultsDialogMatchId(match.id);
                                                                                        setResultsDialogOpen(true);
                                                                                    }}
                                                                                    disabled={match.archived}
                                                                                    sx={{
                                                                                        color: 'white',
                                                                                        textTransform: 'none',
                                                                                        fontWeight: 700,
                                                                                        fontSize: { xs: '0.78rem', sm: '0.85rem' },
                                                                                        py: 0.9,
                                                                                        px: 1,
                                                                                        borderRadius: '10px',
                                                                                        whiteSpace: 'nowrap',
                                                                                        flex: 1,
                                                                                        minWidth: 0,
                                                                                        lineHeight: 1.2,
                                                                                        background: '#FF007F',
                                                                                        '&:hover': { background: '#DB2777' },
                                                                                        '&.Mui-disabled': { opacity: 0.5 }
                                                                                    }}
                                                                                >
                                                                                    Report
                                                                                </Button>
                                                                            </Box>

                                                                            {/* Admin Section at Bottom */}
                                                                            {isAdmin && (
                                                                                <Box sx={{
                                                                                    mt: 'auto',
                                                                                    pt: 1,
                                                                                    pb: 1,
                                                                                    px: { xs: 0.75, sm: 1.5 },
                                                                                    borderTop: '1px dashed #e56a16',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'space-between',
                                                                                    gap: { xs: 0.5, sm: 1 },
                                                                                    bgcolor: 'rgba(255,255,255,0.05)',
                                                                                    width: '100%',
                                                                                    boxSizing: 'border-box'
                                                                                }}>
                                                                                    <Typography sx={{
                                                                                        color: '#888',
                                                                                        fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                                                                        fontWeight: 600,
                                                                                        flexShrink: 0
                                                                                    }}>
                                                                                        Admin
                                                                                    </Typography>
                                                                                    <Box sx={{
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        gap: { xs: 0.4, sm: 0.75 },
                                                                                        flexWrap: 'nowrap',
                                                                                        minWidth: 0
                                                                                    }}>
                                                                                        <Button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                setSelectedMatchIdForDialog(match.id);
                                                                                                setShouldShowAdminGoals(true);
                                                                                                setMatchStatsOpen(true);
                                                                                            }}
                                                                                            disabled={match.archived || !league?.active || !matchSeasonActiveForStats}
                                                                                            startIcon={<Plus size={12} color="#3B82F6" />}
                                                                                            sx={{
                                                                                                color: 'white',
                                                                                                bgcolor: 'transparent',
                                                                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                                                                borderRadius: '8px',
                                                                                                px: { xs: 0.6, sm: 1.2 },
                                                                                                py: 0.4,
                                                                                                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                                                                                fontWeight: 600,
                                                                                                textTransform: 'none',
                                                                                                minWidth: 0,
                                                                                                whiteSpace: 'nowrap',
                                                                                                '& .MuiButton-startIcon': { mr: { xs: 0.3, sm: 0.5 }, ml: 0 },
                                                                                                '&:hover': {
                                                                                                    bgcolor: 'rgba(59, 130, 246, 0.15)',
                                                                                                    borderColor: '#3B82F6'
                                                                                                },
                                                                                                '&.Mui-disabled': { opacity: 0.4 }
                                                                                            }}
                                                                                        >
                                                                                            Add Score
                                                                                        </Button>
                                                                                        <Button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                setEditMatchId(match.id);
                                                                                                setEditMatchDialogOpen(true);
                                                                                            }}
                                                                                            disabled={!league?.active || match.archived}
                                                                                            startIcon={<Edit size={12} color="#00D09E" />}
                                                                                            sx={{
                                                                                                color: 'white',
                                                                                                bgcolor: 'transparent',
                                                                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                                                                borderRadius: '8px',
                                                                                                px: { xs: 0.6, sm: 1.2 },
                                                                                                py: 0.4,
                                                                                                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                                                                                fontWeight: 600,
                                                                                                textTransform: 'none',
                                                                                                minWidth: 0,
                                                                                                whiteSpace: 'nowrap',
                                                                                                '& .MuiButton-startIcon': { mr: { xs: 0.3, sm: 0.5 }, ml: 0 },
                                                                                                '&:hover': {
                                                                                                    bgcolor: 'rgba(0, 208, 158, 0.15)',
                                                                                                    borderColor: '#00D09E'
                                                                                                },
                                                                                                '&.Mui-disabled': { opacity: 0.4 }
                                                                                            }}
                                                                                        >
                                                                                            Edit Match
                                                                                        </Button>
                                                                                        <Button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                if (match.archived) {
                                                                                                    setArchivedActionMatch(match);
                                                                                                    setArchivedActionOpen(true);
                                                                                                } else {
                                                                                                    handleRequestDeleteMatch(match);
                                                                                                }
                                                                                            }}
                                                                                            startIcon={match.archived ? <Undo2 size={12} color="#f97316" /> : <Trash2 size={12} color="#ff4d4f" />}
                                                                                            sx={{
                                                                                                color: match.archived ? '#f97316' : '#ff4d4f',
                                                                                                bgcolor: 'transparent',
                                                                                                border: match.archived ? '1px solid rgba(249, 115, 22, 0.4)' : '1px solid rgba(255, 77, 79, 0.4)',
                                                                                                borderRadius: '8px',
                                                                                                px: { xs: 0.6, sm: 1.2 },
                                                                                                py: 0.4,
                                                                                                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                                                                                fontWeight: 600,
                                                                                                textTransform: 'none',
                                                                                                minWidth: 0,
                                                                                                whiteSpace: 'nowrap',
                                                                                                '& .MuiButton-startIcon': { mr: { xs: 0.3, sm: 0.5 }, ml: 0 },
                                                                                                '&:hover': {
                                                                                                    bgcolor: match.archived ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255, 77, 79, 0.15)',
                                                                                                    borderColor: match.archived ? '#f97316' : '#ff4d4f'
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            {match.archived ? 'Restore' : 'Delete'}
                                                                                        </Button>
                                                                                    </Box>
                                                                                </Box>
                                                                            )}
                                                                        </>
                                                                    );
                                                                })()}
                                                            </CardContent>
                                                            {isAdmin && match.archived && (
                                                                <Box
                                                                    sx={{
                                                                        display: 'grid',
                                                                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                                                        borderTop: '1px solid #fff',
                                                                        backgroundColor: '#F97316',
                                                                    }}
                                                                >
                                                                    <Button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            void handleRestoreMatch(match);
                                                                        }}
                                                                        startIcon={<Undo2 size={16} />}
                                                                        sx={{
                                                                            borderRadius: 0,
                                                                            color: '#fff',
                                                                            backgroundColor: '#F97316',
                                                                            textTransform: 'none',
                                                                            fontWeight: 700,
                                                                            fontSize: { xs: '0.86rem', sm: '0.95rem' },
                                                                            py: 1.1,
                                                                            borderRight: '1px solid rgba(255,255,255,0.45)',
                                                                            '&:hover': { backgroundColor: '#EA580C' },
                                                                        }}
                                                                    >
                                                                        Restore
                                                                    </Button>
                                                                    <Button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            void handlePermanentDeleteFromArchivedCard(match);
                                                                        }}
                                                                        startIcon={<Trash2 size={16} />}
                                                                        sx={{
                                                                            borderRadius: 0,
                                                                            color: '#fff',
                                                                            backgroundColor: '#F97316',
                                                                            textTransform: 'none',
                                                                            fontWeight: 700,
                                                                            fontSize: { xs: '0.82rem', sm: '0.92rem' },
                                                                            py: 1.1,
                                                                            borderLeft: '1px solid rgba(255,255,255,0.45)',
                                                                            '&:hover': { backgroundColor: '#EA580C' },
                                                                        }}
                                                                    >
                                                                        Permanent Delete
                                                                    </Button>
                                                                </Box>
                                                            )}
                                                        </Card>
                                                    );
                                                })}
                                        </Box>
                                    ) : (
                                        <Paper sx={{
                                            background: '#1a1a1a',
                                            border: '2px solid rgba(255,255,255,0.2)',
                                            borderRadius: 2,
                                            py: { xs: 5, sm: 7 },
                                            px: { xs: 2, sm: 4 },
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 1.5,
                                            mt: 1,
                                        }}>
                                            <Box sx={{ opacity: 0.3 }}>
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
                                            </Box>
                                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', fontWeight: 600, textAlign: 'center', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                                No completed matches yet
                                            </Typography>
                                        </Paper>
                                    )}
                                </Box>
                            )}

                            {section === 'dream-team' && (
                                <Box sx={{
                                    height: 'auto',
                                    overflowY: 'visible',
                                    overflowX: 'hidden',
                                    scrollbarWidth: 'none',
                                    '&::-webkit-scrollbar': { display: 'none' },
                                    width: '99.4vw',
                                    position: 'relative',
                                    left: '50%',
                                    right: '50%',
                                    marginLeft: '-50vw',
                                    marginRight: '-50vw',
                                    mt: -4
                                }}>
                                    {dreamTeamLoading ? (
                                        <LeagueDetailLoadingSkeleton mode="dream" />
                                    ) : (
                                        <>
                                            {/* Field (image) - Full width without side spaces */}
                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                    width: '100vw',
                                                    maxWidth: '100vw',
                                                    marginLeft: 'calc(50% - 50vw)',
                                                    height: { xs: '500px', sm: '550px', md: '600px', lg: 'auto' },
                                                    aspectRatio: { lg: '2251 / 1146' },
                                                    overflow: 'hidden',
                                                    mt: 0,
                                                }}
                                            >
                                                <Image
                                                    fill
                                                    src={fieldImg}
                                                    alt="Football Field"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        objectPosition: 'center center'
                                                    }}
                                                />

                                                {/* Dream Team Title Text Overlay */}
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: { xs: '27%', sm: '24%', md: '24%', lg: '24%', xl: '25%' },
                                                        left: { xs: '2%', sm: '10%', md: '18%', lg: '19%', xl: '20%' },
                                                        zIndex: 1,
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            color: '#ffffff',
                                                            fontWeight: 600,
                                                            fontSize: { xs: '8px', sm: '18px', md: '22px', lg: '24px', xl: '28px' },
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '2px',
                                                            // textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                                                            lineHeight: 1.2,
                                                            transform: 'rotate(7deg)',
                                                            transformOrigin: 'left center',
                                                        }}
                                                    >
                                                        5 ASIDE DREAM TEAM
                                                    </Typography>
                                                </Box>

                                                {/* Overlay players */}
                                                {(() => {
                                                    const isValidPositionPlayer = (p: any) => {
                                                        if (!p) return false;
                                                        const pos = String(p.position || p.positionType || '').trim().toLowerCase();
                                                        return pos !== '' && pos !== 'null' && pos !== 'undefined' && pos !== 'n/a' && pos !== 'none' && pos !== '-' && pos !== 'unassigned';
                                                    };

                                                    const sortByXP = (a: any, b: any) => {
                                                        const xpA = Number(a.xp ?? a.stats?.xp ?? 0);
                                                        const xpB = Number(b.xp ?? b.stats?.xp ?? 0);
                                                        if (xpB !== xpA) return xpB - xpA;
                                                        return Number(b.score || 0) - Number(a.score || 0);
                                                    };

                                                    const isRightSide = (p: any) => {
                                                        if (!p) return false;
                                                        const str = `${p.position || ''} ${p.positionType || ''}`.toLowerCase();
                                                        return (
                                                            str.includes('right') ||
                                                            str.includes(' rm') || str.startsWith('rm') ||
                                                            str.includes(' rw') || str.startsWith('rw') ||
                                                            str.includes(' rb') || str.startsWith('rb') ||
                                                            str.includes(' rwb') || str.startsWith('rwb')
                                                        );
                                                    };

                                                    const isLeftSide = (p: any) => {
                                                        if (!p) return false;
                                                        const str = `${p.position || ''} ${p.positionType || ''}`.toLowerCase();
                                                        return (
                                                            str.includes('left') ||
                                                            str.includes(' lm') || str.startsWith('lm') ||
                                                            str.includes(' lw') || str.startsWith('lw') ||
                                                            str.includes(' lb') || str.startsWith('lb') ||
                                                            str.includes(' lwb') || str.startsWith('lwb')
                                                        );
                                                    };

                                                    const mappedPlayers: Array<{ player: any; slot: { left: any; top: any }; key: string }> = [];
                                                    const usedPlayerIds = new Set<string>();

                                                    const addPlayerToPitch = (player: any, slot: { left: any; top: any }, key: string) => {
                                                        if (!player || !player.id) return;
                                                        const pId = String(player.id);
                                                        if (usedPlayerIds.has(pId)) return;
                                                        usedPlayerIds.add(pId);
                                                        mappedPlayers.push({ player, slot, key });
                                                    };

                                                    // 1. Goalkeeper (1 player)
                                                    const gks = (dreamTeam?.goalkeeper || []).filter(isValidPositionPlayer).sort(sortByXP);
                                                    if (gks[0]) {
                                                        addPlayerToPitch(
                                                            gks[0],
                                                            { left: { xs: '23%', sm: '30%', md: '40%' }, top: { xs: '72%', sm: '65%', md: '72%' } },
                                                            `gk-${gks[0].id}`
                                                        );
                                                    }

                                                    // 2. Defenders (up to 2 players - Strict Left / Right XP Slotting)
                                                    const defs = (dreamTeam?.defenders || []).filter(isValidPositionPlayer).sort(sortByXP);
                                                    let leftDef: any = null;
                                                    let rightDef: any = null;

                                                    // Pass 1: Assign explicit side players to their matching slot (highest XP wins)
                                                    defs.forEach((p) => {
                                                        if (usedPlayerIds.has(String(p.id))) return;
                                                        if (isLeftSide(p)) {
                                                            if (!leftDef) leftDef = p;
                                                        } else if (isRightSide(p)) {
                                                            if (!rightDef) rightDef = p;
                                                        }
                                                    });
                                                    // Pass 2: Neutral players fill open slots
                                                    defs.forEach((p) => {
                                                        if (usedPlayerIds.has(String(p.id))) return;
                                                        if (p === leftDef || p === rightDef) return;
                                                        if (!leftDef) leftDef = p;
                                                        else if (!rightDef) rightDef = p;
                                                    });

                                                    if (leftDef) {
                                                        addPlayerToPitch(
                                                            leftDef,
                                                            { left: { xs: '8%', sm: '17%', md: '30%' }, top: { xs: '70%', sm: '70%', md: '67%' } },
                                                            `def-left-${leftDef.id}`
                                                        );
                                                    }
                                                    if (rightDef) {
                                                        addPlayerToPitch(
                                                            rightDef,
                                                            { left: { xs: '52%', sm: '52%', md: '52%' }, top: { xs: '79.5%', sm: '79.5%', md: '80%' } },
                                                            `def-right-${rightDef.id}`
                                                        );
                                                    }

                                                    // 3. Midfielders (up to 2 players - Strict Left / Right XP Slotting)
                                                    const mids = (dreamTeam?.midfielders || []).filter(isValidPositionPlayer).sort(sortByXP);
                                                    let leftMid: any = null;
                                                    let rightMid: any = null;

                                                    // Pass 1: Assign explicit side players to their matching slot (highest XP wins)
                                                    mids.forEach((p) => {
                                                        if (usedPlayerIds.has(String(p.id))) return;
                                                        if (isLeftSide(p)) {
                                                            if (!leftMid) leftMid = p;
                                                        } else if (isRightSide(p)) {
                                                            if (!rightMid) rightMid = p;
                                                        }
                                                    });
                                                    // Pass 2: Neutral players fill open slots
                                                    mids.forEach((p) => {
                                                        if (usedPlayerIds.has(String(p.id))) return;
                                                        if (p === leftMid || p === rightMid) return;
                                                        if (!leftMid) leftMid = p;
                                                        else if (!rightMid) rightMid = p;
                                                    });

                                                    if (leftMid) {
                                                        addPlayerToPitch(
                                                            leftMid,
                                                            { left: { xs: '34%', sm: '34%', md: '44%' }, top: { xs: '65%', sm: '65%', md: '62%' } },
                                                            `mid-left-${leftMid.id}`
                                                        );
                                                    }
                                                    if (rightMid) {
                                                        addPlayerToPitch(
                                                            rightMid,
                                                            { left: { xs: '69%', sm: '69%', md: '63%' }, top: { xs: '73%', sm: '73%', md: '70%' } },
                                                            `mid-right-${rightMid.id}`
                                                        );
                                                    }

                                                    // 4. Forwards (1 player)
                                                    const fwds = (dreamTeam?.forwards || []).filter(isValidPositionPlayer).sort(sortByXP);
                                                    const unusedFwd = fwds.find(p => !usedPlayerIds.has(String(p.id)));
                                                    if (unusedFwd) {
                                                        addPlayerToPitch(
                                                            unusedFwd,
                                                            { left: { xs: '60%', sm: '60%', md: '55%' }, top: { xs: '63%', sm: '63%', md: '61%' } },
                                                            `fwd-${unusedFwd.id}`
                                                        );
                                                    }

                                                    if (mappedPlayers.length === 0) {
                                                        return (
                                                            <Box sx={{
                                                                position: 'absolute',
                                                                top: '50%',
                                                                left: '50%',
                                                                transform: 'translate(-50%, -50%)',
                                                                textAlign: 'center',
                                                                zIndex: 2,
                                                            }}>
                                                                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                                                                    No players in this Dream Team yet.
                                                                </Typography>
                                                            </Box>
                                                        );
                                                    }

                                                    return mappedPlayers.map(({ player, slot, key }) => {
                                                        if (!player || !slot) return null;
                                                        return (
                                                            <Box
                                                                key={key}
                                                                sx={{
                                                                    position: 'absolute',
                                                                    left: slot.left,
                                                                    top: slot.top,
                                                                    transform: 'translate(-50%, -50%)',
                                                                    textAlign: 'center',
                                                                    zIndex: 2,
                                                                }}
                                                            >
                                                                {/* Shirt */}
                                                                <Box
                                                                    sx={{
                                                                        position: 'relative',
                                                                        width: { xs: 40, sm: 50, md: 60, lg: 70, xl: 82 },
                                                                        height: { xs: 40, sm: 50, md: 60, lg: 70, xl: 82 },
                                                                        mb: -0.5,
                                                                    }}
                                                                >
                                                                    <Link href={`/player/${player.id}`} prefetch={false}>
                                                                        <Image
                                                                            src={ShirtImg.src}
                                                                            alt="Player Shirt"
                                                                            width={70}
                                                                            height={70}
                                                                            style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
                                                                        />
                                                                    </Link>
                                                                </Box>

                                                                {/* Player Name - Below Shirt */}
                                                                <Box
                                                                    sx={{
                                                                        position: 'relative',
                                                                        width: 'max-content',
                                                                        mx: 'auto',
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        component="div"
                                                                        sx={{
                                                                            color: '#ffffff',
                                                                            fontWeight: 700,
                                                                            fontSize: { xs: '9px', sm: '10px', md: '11px', lg: '12px', xl: '14px' },
                                                                            lineHeight: 1.2,
                                                                            textAlign: 'center',
                                                                            whiteSpace: 'nowrap',
                                                                            padding: { xs: '2px 6px', sm: '2px 8px', md: '3px 10px', xl: '4px 12px' },
                                                                        }}
                                                                    >
                                                                        {formatPlayerCardStyleName(player?.firstName, player?.lastName)}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        );
                                                    });
                                                })()}
                                            </Box>
                                        </>
                                    )}
                                </Box>
                            )}

                            {section === 'table' && (
                                <div className="w-full mx-auto">
                                    <Card sx={{
                                        background: '#121316',
                                        border: '1px solid #22242a',
                                        borderRadius: '16px',
                                        boxShadow: 'none',
                                        mt: 1.2,
                                        mb: 4,
                                        overflow: 'hidden',
                                        '&::-webkit-scrollbar': {
                                            height: '6px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: '#121316',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: '#22242a',
                                            borderRadius: '3px',
                                        },
                                    }} className="text-white">
                                        {/* <div className="p-3">
                                            <h2 className="text-lg font-bold text-white">League Table</h2>
                                        </div> */}

                                        <Box
                                            ref={tableScrollRef}
                                            onScroll={syncTableHorizontalScroll}
                                            sx={{
                                                width: '100%',
                                                overflowX: 'auto',
                                                overflowY: 'auto',
                                                maxHeight: { xs: '68vh', sm: '70vh', md: '72vh' },
                                                WebkitOverflowScrolling: 'touch',
                                                scrollbarWidth: 'thin',
                                                '&::-webkit-scrollbar': {
                                                    height: '8px',
                                                    width: '8px',
                                                },
                                                '&::-webkit-scrollbar-track': {
                                                    background: '#121316',
                                                    borderRadius: '9999px',
                                                },
                                                '&::-webkit-scrollbar-thumb': {
                                                    background: '#22242a',
                                                    borderRadius: '9999px',
                                                },
                                            }}
                                        >
                                            <div className="w-full min-w-[640px] sm:min-w-[820px] rounded-lg league-table league-mobile-result-font">
                                                {/* Table Header */}
                                                {/* <div className="grid mt-0 grid-cols-[50px_1fr_80px_60px_60px_60px_60px_70px_70px_80px] items-center px-4 py-3 bg-table-header border-b border-border text-muted-foreground league-header-row league-header-inset league-table-heading">
                                                <div className="text-center">#</div>
                                                <div className="pl-[52px] text-left">NAME</div>
                                                <div className="text-center">MOTM</div>
                                                <div className="text-center">P</div>
                                                <div className="text-center">W</div>
                                                <div className="text-center">D</div>
                                                <div className="text-center">L</div>
                                                <div className="text-center">GD</div>
                                                <div className="text-center">W%</div>
                                                <div className="text-center">{filteredLeague?.showPoints === true ? 'XP' : 'PTS'}</div>
                                            </div> */}

                                                <>
                                                    <div className="grid mt-0 grid-cols-[28px_minmax(140px,1fr)_70px_45px_45px_45px_45px_50px_55px_60px] sm:grid-cols-[32px_minmax(190px,1fr)_80px_60px_60px_60px_60px_70px_70px_80px] items-center px-0 py-3 bg-table-header league-header-row league-header-inset font-bold sticky top-0 z-20">
                                                        <div className="text-center league-table-heading league-table-sticky-rank" style={{ color: '#717d8f' }}>#</div>
                                                        <div className="pl-2 sm:pl-3 league-table-heading league-table-heading-left league-table-sticky-name" style={{ color: '#717d8f' }}>PLAYER</div>
                                                        <div className="text-center league-table-heading" style={{ color: '#717d8f' }}>MOTM</div>
                                                        <div className="text-center league-table-heading" style={{ color: '#717d8f' }}>P</div>
                                                        <div className="text-center league-table-heading" style={{ color: '#717d8f' }}>W</div>
                                                        <div className="text-center league-table-heading" style={{ color: '#717d8f' }}>D</div>
                                                        <div className="text-center league-table-heading" style={{ color: '#717d8f' }}>L</div>
                                                        <div className="text-center league-table-heading" style={{ color: '#717d8f'}}>W%</div>
                                                        <div className="text-center league-table-heading" style={{ color: '#717d8f' }}>GD</div>
                                                        <div className="text-center league-table-heading league-table-heading-no-transform" style={{ color: '#717d8f' }}>{filteredLeague?.showPoints === true ? 'xpPTS' : 'PTS'}</div>
                                                    </div>
                                                    {/* Full width border alag */}
                                                    <div className="w-full border-b border-[#22242a]" />
                                                </>
                                                {/* Table Rows */}
                                                <div>
                                                    {(() => {
                                                        console.log('📊 Table rendering with:', {
                                                            filteredLeagueShowPoints: filteredLeague?.showPoints,
                                                            leagueShowPoints: league?.showPoints,
                                                            selectedSeasonId: selectedSeasonId,
                                                            willUseXp: filteredLeague?.showPoints === true
                                                        });
                                                        return null;
                                                    })()}
                                                    {[...tableData]
                                                        .sort((a, b) => {
                                                            const aPts = (a.wins ?? 0) * 3 + (a.draws ?? 0);
                                                            const bPts = (b.wins ?? 0) * 3 + (b.draws ?? 0);
                                                            const aXP = a.xp ?? 0;
                                                            const bXP = b.xp ?? 0;
                                                            // showPoints=true means Advanced Scoring, so the final column uses XP.
                                                            const useXpScoring = filteredLeague?.showPoints === true;
                                                            const aScore = useXpScoring ? aXP : aPts;
                                                            const bScore = useXpScoring ? bXP : bPts;
                                                            if (bScore !== aScore) return bScore - aScore;
                                                            if ((b.wins ?? 0) !== (a.wins ?? 0)) return (b.wins ?? 0) - (a.wins ?? 0);
                                                            if ((a.played ?? 0) !== (b.played ?? 0)) return (a.played ?? 0) - (b.played ?? 0);
                                                            return (a.name || '').localeCompare(b.name || '');
                                                        })
                                                        .map((player, index) => {
                                                            const points = (player.wins ?? 0) * 3 + (player.draws ?? 0);
                                                            const firstName = player.name.split(' ')[0] || player.name;
                                                            const lastName = player.name.split(' ').slice(1).join(' ') || '';
                                                            // showPoints=true means Advanced Scoring, so the final column uses XP.
                                                            const useXpScoring = filteredLeague?.showPoints === true;
                                                            const xpPts = useXpScoring ? (player.xp ?? 0) : points;

                                                            const member = (league?.members || []).find(m => String(m.id) === String(player.id));
                                                            const posLabel = member ? getMemberPositionLabel(member) : '-';
                                                            const playerWithOptionalImage = player as TableData & {
                                                                imageUrl?: string;
                                                                profileImage?: string;
                                                                image?: string;
                                                            };
                                                            const playerImageSrcRaw =
                                                                member?.profilePicture ||
                                                                playerWithOptionalImage.imageUrl ||
                                                                playerWithOptionalImage.profileImage ||
                                                                playerWithOptionalImage.image ||
                                                                '';
                                                            const playerImageSrc =
                                                                typeof playerImageSrcRaw === 'string' && playerImageSrcRaw.trim().length > 0
                                                                    ? playerImageSrcRaw.trim()
                                                                    : '';
                                                            const tablePlayerName = `${firstName} ${lastName}`.trim() || player.name;
                                                            const tablePlayerInitials = getAvatarInitials({
                                                                name: tablePlayerName,
                                                                firstName,
                                                                lastName,
                                                            });
                                                            const isEven = index % 2 === 0;
                                                            const isCurrentUser = String(player.id) === String(user?.id || '');
                                                            return (
                                                                <div
                                                                    key={player.id}
                                                                    onClick={(e) => { e.preventDefault(); if (league?.id) openQuickViewFromTable(String(league.id), String(player.id)); }}
                                                                    className={`league-table-row-text group grid grid-cols-[28px_minmax(140px,1fr)_70px_45px_45px_45px_45px_50px_55px_60px] sm:grid-cols-[32px_minmax(190px,1fr)_80px_60px_60px_60px_60px_70px_70px_80px] items-center px-0 py-0 cursor-pointer transition-colors ${isCurrentUser ? 'league-row-current-user' : ''} league-row league-row-inset mb-0 font-bold text-white border-b border-[#1c1d22]`}
                                                                >
                                                                    {/* Rank */}
                                                                    <div className="text-center text-white font-bold league-table-sticky-rank h-full flex items-center justify-center">
                                                                        {index === 0 ? (
                                                                            <TrophyCup rank={1} />
                                                                        ) : index === 1 ? (
                                                                            <TrophyCup rank={2} />
                                                                        ) : index === 2 ? (
                                                                            <TrophyCup rank={3} />
                                                                        ) : (
                                                                            <span className="text-[#8a94a6] font-semibold text-sm sm:text-base">{index + 1}</span>
                                                                        )}
                                                                    </div>

                                                                    {/* Player Info */}
                                                                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 league-table-sticky-name transition-colors duration-150 h-full pl-1.5 sm:pl-2.5">
                                                                        {/* Rank Movement Indicator alongside profile icon */}
                                                                        <div className="flex items-center justify-center min-w-[20px] sm:min-w-[24px] flex-shrink-0 text-[11px] sm:text-xs font-bold select-none">
                                                                            {(() => {
                                                                                const movement = typeof (player as any)?.rankChange === 'number'
                                                                                    ? (player as any).rankChange
                                                                                    : typeof (player as any)?.movement === 'number'
                                                                                    ? (player as any).movement
                                                                                    : 0;
                                                                                if (movement > 0) {
                                                                                    return (
                                                                                        <span className="text-[#22c55e] flex items-center gap-0.5 font-bold text-[11px] sm:text-xs">
                                                                                            <svg className="w-2 h-2 flex-shrink-0" viewBox="0 0 8 8" fill="currentColor">
                                                                                                <path d="M4 1L7.5 7H0.5L4 1Z" />
                                                                                            </svg>
                                                                                            <span>{movement}</span>
                                                                                        </span>
                                                                                    );
                                                                                }
                                                                                if (movement < 0) {
                                                                                    return (
                                                                                        <span className="text-[#ef4444] flex items-center gap-0.5 font-bold text-[11px] sm:text-xs">
                                                                                            <svg className="w-2 h-2 flex-shrink-0" viewBox="0 0 8 8" fill="currentColor">
                                                                                                <path d="M4 7L0.5 1H7.5L4 7Z" />
                                                                                            </svg>
                                                                                            <span>{Math.abs(movement)}</span>
                                                                                        </span>
                                                                                    );
                                                                                }
                                                                                return <span className="text-[#717d8f] font-semibold text-xs">-</span>;
                                                                            })()}
                                                                        </div>

                                                                        {/* Profile Avatar */}
                                                                        <div
                                                                            className="w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 text-white font-bold text-xs"
                                                                            style={{
                                                                                backgroundColor: playerImageSrc
                                                                                    ? 'transparent'
                                                                                    : getAvatarBackgroundColor(tablePlayerName || String(player.id || 'player')),
                                                                            }}
                                                                        >
                                                                            {playerImageSrc ? (
                                                                                <div className="relative w-full h-full">
                                                                                    <Image src={resolveImageUrl(playerImageSrc)} alt={player?.name || 'Player'} fill style={{ objectFit: 'cover' }} />
                                                                                </div>
                                                                            ) : (
                                                                                tablePlayerInitials
                                                                            )}
                                                                        </div>
                                                                        <div className="flex flex-col min-w-0 justify-center">
                                                                            <div className="flex items-center gap-1.5 min-w-0">
                                                                                <span className="text-white font-bold truncate uppercase block">{formatPlayerCardStyleName(firstName, lastName)}</span>
                                                                                {player.isAdmin && <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                                                                            </div>
                                                                            <Typography className="league-player-pos" sx={{ fontSize: { xs: 14, sm: 14 }, color: 'rgba(255,255,255,0.6)', mt: 0.25, fontFamily: 'var(--font-woodford-bourne-pro), sans-serif' }}>
                                                                                {posLabel}
                                                                            </Typography>
                                                                        </div>
                                                                    </div>

                                                                    {/* MOTM */}
                                                                    <div className="text-center">
                                                                        {typeof player.motmCount === 'number' && player.motmCount > 0 ? (
                                                                            <span className="inline-flex items-center justify-center gap-1">
                                                                                <Star sx={{ fontSize: 16, color: '#F59E0B' }} />
                                                                                <span className="text-white font-bold text-sm sm:text-base">{player.motmCount}</span>
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-[#717d8f] font-medium">-</span>
                                                                        )}
                                                                    </div>

                                                                    {/* Stats */}
                                                                    <div className="text-center text-white font-bold">{player.played}</div>
                                                                    <div className="text-center text-white font-bold">{player.wins}</div>
                                                                    <div className="text-center text-white font-bold">{player.draws}</div>
                                                                    <div className="text-center text-white font-bold">{player.losses}</div>
                                                                    <div className="text-center font-bold">
                                                                        {(() => {
                                                                            const gd = player.goalDifference ?? 0;
                                                                            if (gd > 0) return <span className="text-[#22c55e]">+{gd}</span>;
                                                                            if (gd < 0) return <span className="text-[#ef4444]">{gd}</span>;
                                                                            return <span className="text-white/70">0</span>;
                                                                        })()}
                                                                    </div>
                                                                    <div className="text-center text-white font-bold">{player.winPercentage}</div>
                                                                    <div className="text-center font-extrabold uppercase">
                                                                        <span className={xpPts > 0 ? 'text-[#22c55e]' : xpPts < 0 ? 'text-[#ef4444]' : 'text-white/70'}>
                                                                            {xpPts.toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    {tableData.length === 0 && (
                                                        <div className="league-table-row-text grid grid-cols-[28px_minmax(125px,1fr)_70px_45px_45px_45px_45px_50px_55px_60px] sm:grid-cols-[32px_minmax(180px,1fr)_80px_60px_60px_60px_60px_70px_70px_80px] items-center h-[58px] min-h-[58px] sm:h-[72px] sm:min-h-[72px] px-0 py-0 bg-table-row-even font-bold text-white">
                                                            <div className="text-center text-white/80" style={{ gridColumn: '1 / -1' }}>
                                                                No players found for this season.
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Box>
                                        {tableHasHorizontalOverflow && (
                                            <Box sx={{ px: { xs: 1.5, sm: 2 }, pt: 1, pb: 1.5 }}>
                                                <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)', mb: 0.5 }}>
                                                    Slide table left/right
                                                </Typography>
                                                <Slider
                                                    value={tableScrollPercent}
                                                    onChange={handleTableSliderChange}
                                                    min={0}
                                                    max={100}
                                                    step={1}
                                                    size="small"
                                                    aria-label="Table horizontal scroll"
                                                    sx={{
                                                        color: '#F97316',
                                                        px: 0.5,
                                                        '& .MuiSlider-thumb': {
                                                            width: 14,
                                                            height: 14,
                                                        },
                                                        '& .MuiSlider-rail': {
                                                            opacity: 0.35,
                                                        },
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </Card>
                                    <Paper
                                        sx={{
                                            mt: 2,
                                            background: '#f2f2f2',
                                            borderRadius: 2,
                                            border: '1px solid rgba(0,0,0,0.15)',
                                            overflow: 'hidden',
                                            px: { xs: 1.25, sm: 2 },
                                            py: { xs: 1, sm: 1.25 },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: { xs: 'column', sm: 'row' },
                                                alignItems: { xs: 'stretch', sm: 'center' },
                                                justifyContent: 'space-between',
                                                gap: { xs: 1, sm: 1.5 },
                                            }}
                                        >
                                            {/* Mobile top text + Mobile row container / Desktop left side */}
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: { xs: 'column', sm: 'row' },
                                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                                    gap: { xs: 0.8, sm: 0.8 },
                                                    flexWrap: 'wrap',
                                                    flex: 1,
                                                }}
                                            >
                                                <Typography sx={{ color: '#232323', fontSize: { xs: '0.74rem', sm: '0.82rem' }, fontWeight: 500, width: { xs: '100%', sm: 'auto' } }}>
                                                    {invitePlayersMessage}
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'space-between', sm: 'flex-start' }, width: { xs: '100%', sm: 'auto' }, gap: 0.8 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                        <Typography sx={{ color: '#111', fontSize: { xs: '0.82rem', sm: '0.82rem' }, fontWeight: 700 }}>
                                                            {inviteCodeDisplay}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={handleCopySeasonInviteCode}
                                                            aria-label="Copy invite code"
                                                            title="Copy invite code"
                                                            sx={{ color: '#1f2937', p: 0.5 }}
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={handleShareSeasonInvite}
                                                            aria-label="Share invite code"
                                                            sx={{ color: '#1f2937', p: 0.5 }}
                                                        >
                                                            <Share2 className="w-4 h-4" />
                                                        </IconButton>
                                                    </Box>

                                                    {/* Mobile-only position for button if screen is mobile */}
                                                    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                                                        {isAdmin && (
                                                            isMatchCreationAllowed ? (
                                                                <Link href={`/league/${leagueId}/match`} passHref>
                                                                    <button className="bg-[#e16419] hover:bg-[#c95310] transition-colors text-white font-semibold px-3.5 py-1.5 rounded inline-flex items-center whitespace-nowrap justify-center text-xs shadow-sm">
                                                                        + New Match
                                                                    </button>
                                                                </Link>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toast.error(inactiveLeagueMatchMessage)}
                                                                    className="bg-black/10 text-black/40 font-semibold px-3.5 py-1.5 rounded inline-flex items-center whitespace-nowrap justify-center text-xs"
                                                                >
                                                                    + New Match
                                                                </button>
                                                            )
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Box>

                                            {/* Desktop-only position for button */}
                                            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                                {isAdmin && (
                                                    isMatchCreationAllowed ? (
                                                        <Link href={`/league/${leagueId}/match`} passHref>
                                                            <button className="bg-[#e16419] hover:bg-[#c95310] transition-colors text-white font-semibold px-5 py-2 rounded inline-flex items-center whitespace-nowrap justify-center text-sm shadow-sm">
                                                                + New Match
                                                            </button>
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => toast.error(inactiveLeagueMatchMessage)}
                                                            className="bg-white/60 text-black/40 font-semibold px-5 py-2 rounded inline-flex items-center whitespace-nowrap justify-center text-sm"
                                                        >
                                                            + New Match
                                                        </button>
                                                    )
                                                )}
                                            </Box>
                                        </Box>
                                    </Paper>
                                    {/* // ...existing code... */}
                                    {/* {league && (
                                        <Box sx={{ mt: 2 }}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: { xs: 1.5, sm: 2 },
                                                    borderRadius: 2,
                                                    background: 'linear-gradient(177deg,rgba(229, 106, 22, 0.92) 26%, rgba(207, 35, 38, 0.92) 100%)',
                                                    border: '1px solid rgba(255,255,255,0.15)',
                                                    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                                                }}
                                            >
                                                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold', mb: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                                    Statistics {selectedSeasonId ? seasonLabel : ''}
                                                </Typography>

                                                <Box
                                                    sx={{
                                                        p: { xs: 1, sm: 2 },
                                                        borderRadius: 2,
                                                    }}
                                                >
                                                    {!leagueStats ? (
                                                        <Typography variant="body2" sx={{ color: 'white' }}>
                                                            Loading statistics…
                                                        </Typography>
                                                    ) : (
                                                        (() => {
                                                            // Compute season progress with correct Remaining logic
                                                            const maxGames = Number(league?.maxGames ?? 0);

                                                            // Use filteredLeague matches when season is selected, otherwise use all league matches
                                                            const matchesToUse = selectedSeasonId && filteredLeague ? filteredLeague.matches : league?.matches;

                                                            // Prefer backend-provided playedMatches; otherwise derive from matches
                                                            const derivedPlayed = (() => {
                                                                if (!selectedSeasonId && typeof leagueStats?.playedMatches === 'number') return Number(leagueStats.playedMatches);
                                                                const matches = Array.isArray(matchesToUse) ? matchesToUse : [];
                                                                return matches.filter((m) => isResultMatch(m as Match)).length;
                                                            })();

                                                            const played = derivedPlayed;

                                                            // If maxGames is set (>0), Remaining = maxGames - played; else fallback to server remaining
                                                            const remaining = maxGames > 0
                                                                ? Math.max(maxGames - played, 0)
                                                                : Number(leagueStats?.remaining ?? 0);

                                                            // Total games is maxGames when provided; otherwise played + remaining
                                                            const total = maxGames > 0 ? maxGames : played + remaining;
                                                            const pct = total > 0 ? Math.round((played / total) * 100) : 0;

                                                            const createdD = leagueStats.created ? new Date(leagueStats.created) : null;
                                                            const createdStr = createdD
                                                                ? `Created On ${createdD.toLocaleDateString('en-GB', {
                                                                    weekday: 'long',
                                                                    day: '2-digit',
                                                                    month: 'long',
                                                                    year: 'numeric',
                                                                })} At ${createdD.toLocaleTimeString('en-GB', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    hour12: false,
                                                                })}`
                                                                : 'Created On -';

                                                            return (
                                                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: 1, sm: 1.5 } }}>
                                                                    {/* Season progress *\/}
                                                                    <Box
                                                                        sx={{
                                                                            p: { xs: 1, sm: 1.5 },
                                                                            borderRadius: 1.5,
                                                                            border: '1px solid rgba(52,211,153,0.35)',
                                                                            background: 'linear-gradient(180deg, rgba(52,211,153,0.18) 0%, rgba(52,211,153,0.07) 100%)',
                                                                        }}
                                                                    >
                                                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                                                            Season Progress
                                                                        </Typography>
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mt: 0.75, mb: 1, gap: 1 }}>
                                                                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                                                {played} Played
                                                                            </Typography>
                                                                            <Typography variant="body2" sx={{ color: '#34d399', fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                                                {remaining} Remaining
                                                                            </Typography>
                                                                        </Box>
                                                                        <LinearProgress
                                                                            variant="determinate"
                                                                            value={pct}
                                                                            sx={{
                                                                                height: { xs: 6, sm: 8 },
                                                                                borderRadius: 999,
                                                                                backgroundColor: 'rgba(255,255,255,0.15)',
                                                                                '& .MuiLinearProgress-bar': { backgroundColor: '#34d399' },
                                                                            }}
                                                                        />
                                                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', mt: 0.75, display: 'block', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                                                            {pct}% complete
                                                                        </Typography>
                                                                    </Box>

                                                                    {/* Players + Created *\/}
                                                                    <Box
                                                                        sx={{
                                                                            p: { xs: 1, sm: 1.5 },
                                                                            borderRadius: 1.5,
                                                                            border: '1px solid rgba(245,158,11,0.35)',
                                                                            background: 'linear-gradient(180deg, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.07) 100%)',
                                                                        }}
                                                                    >
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                            <Users size={16} color="#F59E0B" />
                                                                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                                                {selectedSeasonId && filteredLeague ? filteredLeague.members.length : (leagueStats.players ?? league?.members?.length ?? 0)} Players
                                                                            </Typography>
                                                                        </Box>

                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                                            <Calendar size={16} color="#F59E0B" />
                                                                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', fontSize: { xs: '0.7rem', sm: '0.875rem' }, lineHeight: 1.3 }}>
                                                                                {createdStr}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Box>

                                                                    {/* Best pairing + Hottest *\/}
                                                                    <Box
                                                                        sx={{
                                                                            gridColumn: { xs: '1 / -1', sm: '1 / -1' },
                                                                            display: 'flex',
                                                                            flexDirection: { xs: 'column', sm: 'row' },
                                                                            flexWrap: 'wrap',
                                                                            gap: { xs: 0.75, sm: 1 },
                                                                            mt: 0.5,
                                                                        }}
                                                                    >
                                                                        <Chip
                                                                            label={
                                                                                leagueStats.bestPairing
                                                                                    ? `Best pairing: ${leagueStats.bestPairing.names[0]} and ${leagueStats.bestPairing.names[1]}`
                                                                                    : 'Best pairing will appear when enough matches are completed.'
                                                                            }
                                                                            sx={{
                                                                                color: 'white',
                                                                                border: '1px solid rgba(59,130,246,0.4)',
                                                                                background: leagueStats.bestPairing
                                                                                    ? 'linear-gradient(180deg, rgba(59,130,246,0.25) 0%, rgba(59,130,246,0.10) 100%)'
                                                                                    : 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.05) 100%)',
                                                                                fontWeight: 600,
                                                                                fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                                                                                height: { xs: 'auto', sm: 32 },
                                                                                py: { xs: 0.5, sm: 0 },
                                                                                '& .MuiChip-label': {
                                                                                    px: { xs: 1, sm: 1.5 },
                                                                                    whiteSpace: 'normal',
                                                                                    lineHeight: 1.3,
                                                                                }
                                                                            }}
                                                                        />
                                                                        <Chip
                                                                            icon={<Flame size={14} color="#F97316" />}
                                                                            label={
                                                                                leagueStats.hottestPlayer
                                                                                    ? `${leagueStats.hottestPlayer.name} is the hottest player right now!`
                                                                                    : 'Hottest player will appear after recent matches with stats.'
                                                                            }
                                                                            sx={{
                                                                                color: 'white',
                                                                                border: '1px solid rgba(249,115,22,0.4)',
                                                                                background: leagueStats.hottestPlayer
                                                                                    ? 'linear-gradient(180deg, rgba(249,115,22,0.25) 0%, rgba(249,115,22,0.10) 100%)'
                                                                                    : 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.05) 100%)',
                                                                                fontWeight: 600,
                                                                                fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                                                                                height: { xs: 'auto', sm: 32 },
                                                                                py: { xs: 0.5, sm: 0 },
                                                                                '& .MuiChip-label': {
                                                                                    px: { xs: 1, sm: 1.5 },
                                                                                    whiteSpace: 'normal',
                                                                                    lineHeight: 1.3,
                                                                                },
                                                                                '& .MuiChip-icon': {
                                                                                    ml: { xs: 0.5, sm: 1 },
                                                                                }
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                </Box>
                                                            );
                                                        })()
                                                    )}
                                                </Box>
                                            </Paper>
                                        </Box>
                                    )} */}
                                    {/* // ...existing code... */}
                                </div>
                            )}

                            {section === 'leaderboard' && (
                                // Leaderboard Section - Grid Layout
                                <Box
                                    sx={{
                                        px: { xs: 0.5, sm: 0 },
                                        // pb: { xs: 2, sm: 2 },
                                        pt: { xs: 0, sm: 0 },
                                        mt: { xs: 1, sm: 1.5 },
                                    }}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-4">
                                        {LEADERBOARD_METRIC_CONFIG.map((metric) => {
                                            const allPlayers = allLeaderboardData[metric.key] || [];
                                            const isExpanded = Boolean(expandedLeaderboards[metric.key]);
                                            const displayedPlayers = (isExpanded && !isDesktop) ? allPlayers : allPlayers.slice(0, 5);
                                            const hasMorePlayers = allPlayers.length > 5;
                                            const valueHeader = getMetricValueHeader(metric.key);

                                            return (
                                                <div
                                                    key={metric.key}
                                                    className="bg-[#121316] rounded-2xl border border-[#22242a] overflow-hidden flex flex-col"
                                                >
                                                    {/* Card Header */}
                                                    <div className="flex items-center justify-between px-3.5 sm:px-4 pt-3.5 pb-2.5">
                                                        <div className="flex items-center gap-3">
                                                            {/* Metric Icon Container */}
                                                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#18191e] border border-[#22242a] flex items-center justify-center flex-shrink-0">
                                                                <Image
                                                                    src={metric.icon}
                                                                    alt={metric.label}
                                                                    width={22}
                                                                    height={22}
                                                                    className="object-contain"
                                                                />
                                                            </div>
                                                            <span className="text-white font-bold tracking-wider text-xs sm:text-sm uppercase">
                                                                {metric.label}
                                                            </span>
                                                        </div>

                                                        {/* Info Button */}
                                                        <Tooltip title="How this metric is calculated" arrow>
                                                            <button
                                                                type="button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    setLeaderboardInfoMetric(metric.key);
                                                                }}
                                                                className="w-6 h-6 rounded-full border border-[#22242a] flex items-center justify-center text-[#717d8f] hover:text-white hover:border-[#383a42] transition-colors"
                                                            >
                                                                <Info className="w-3.5 h-3.5" />
                                                            </button>
                                                        </Tooltip>
                                                    </div>

                                                    {/* Table Column Headers */}
                                                    <div className="grid grid-cols-[28px_1fr_auto] items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-1.5 text-[#717d8f] text-[11px] font-semibold uppercase tracking-wider">
                                                        <div className="text-center">#</div>
                                                        <div>PLAYER</div>
                                                        <div className="text-right min-w-[36px] sm:min-w-[44px] pr-1">{valueHeader}</div>
                                                    </div>

                                                    {/* Players List */}
                                                    <div className="flex-1 flex flex-col">
                                                        {leaderboardLoading ? (
                                                            <div className="p-3">
                                                                <LeagueDetailLoadingSkeleton mode="list" />
                                                            </div>
                                                        ) : (
                                                            displayedPlayers.map((player, idx) => {
                                                                const leaderboardMember = (league?.members || []).find((m) => String(m.id) === String(player.id));
                                                                const leaderboardPlayerName =
                                                                    (player.name || `${leaderboardMember?.firstName || ''} ${leaderboardMember?.lastName || ''}`.trim()).trim();
                                                                const leaderboardAvatarSrc =
                                                                    typeof leaderboardMember?.profilePicture === 'string' && leaderboardMember.profilePicture.trim().length > 0
                                                                        ? leaderboardMember.profilePicture.trim()
                                                                        : '';
                                                                const leaderboardInitials = getAvatarInitials({
                                                                    name: leaderboardPlayerName,
                                                                    firstName: leaderboardMember?.firstName,
                                                                    lastName: leaderboardMember?.lastName,
                                                                });

                                                                const firstName = leaderboardMember?.firstName || (player.name ? player.name.split(' ')[0] : '');
                                                                const lastName = leaderboardMember?.lastName || (player.name ? player.name.split(' ').slice(1).join(' ') : '');
                                                                const isPlayerAdmin = (league?.administrators || []).some((a: any) => String(a.id) === String(player.id)) || Boolean((leaderboardMember as any)?.isAdmin);
                                                                const rawPos = leaderboardMember ? getMemberPositionLabel(leaderboardMember) : getPositionShortForm(player.positionType);
                                                                const displayPos = !rawPos || rawPos.toLowerCase() === 'player' ? '-' : rawPos;
                                                                const isCurrentUser = String(player.id) === String(user?.id || '');

                                                                return (
                                                                    <Link
                                                                        key={`${metric.key}-${player.id}`}
                                                                        href={`/player/${player.id}`}
                                                                        className={`grid grid-cols-[28px_1fr_auto] items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 transition-colors border-b border-[#1c1d22] cursor-pointer ${
                                                                            isCurrentUser
                                                                                ? 'league-row-current-user'
                                                                                : 'hover:bg-[#18191e]'
                                                                        }`}
                                                                    >
                                                                        {/* Rank Number */}
                                                                        <div className="text-center text-[#8a94a6] font-semibold text-xs sm:text-sm">
                                                                            {idx + 1}
                                                                        </div>

                                                                        {/* Player Info */}
                                                                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                                                            {/* Avatar */}
                                                                            <div
                                                                                className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 text-white font-bold text-[11px]"
                                                                                style={{
                                                                                    backgroundColor: leaderboardAvatarSrc
                                                                                        ? 'transparent'
                                                                                        : getAvatarBackgroundColor(leaderboardPlayerName || String(player.id || 'player')),
                                                                                }}
                                                                            >
                                                                                {leaderboardAvatarSrc ? (
                                                                                    <Image
                                                                                        src={resolveImageUrl(leaderboardAvatarSrc)}
                                                                                        alt={leaderboardPlayerName || 'Player'}
                                                                                        width={32}
                                                                                        height={32}
                                                                                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                                                                    />
                                                                                ) : (
                                                                                    leaderboardInitials
                                                                                )}
                                                                            </div>

                                                                            {/* Name & Position */}
                                                                            <div className="flex flex-col min-w-0 justify-center leading-tight">
                                                                                <div className="flex items-center gap-1.5 min-w-0">
                                                                                    <span className="text-white font-bold text-xs sm:text-sm truncate uppercase">
                                                                                        {formatPlayerCardStyleName(firstName, lastName)}
                                                                                    </span>
                                                                                    {isPlayerAdmin && <Shield className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                                                                                </div>
                                                                                <span className="text-[#717d8f] text-[10px] sm:text-[11px] uppercase font-medium">
                                                                                    {displayPos}
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        {/* Value */}
                                                                        <div className="text-right font-bold text-[#22c55e] text-sm sm:text-base min-w-[36px] sm:min-w-[44px] pr-1">
                                                                            {metric.key === 'contribution' ? `${player.value}%` : player.value}
                                                                        </div>
                                                                    </Link>
                                                                );
                                                            })
                                                        )}

                                                        {!leaderboardLoading && allPlayers.length === 0 && (
                                                            <div className="py-6 text-center text-[#717d8f] text-xs sm:text-sm">
                                                                No data available
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Show More / Show Less Button */}
                                                    {hasMorePlayers && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (isDesktop) {
                                                                    setDesktopLeaderboardPopupMetric(metric.key);
                                                                } else {
                                                                    setExpandedLeaderboards((prev) => ({ ...prev, [metric.key]: !prev[metric.key] }));
                                                                }
                                                            }}
                                                            className="w-full py-2.5 sm:py-3 flex items-center justify-center gap-1.5 text-[#e56a16] hover:text-[#f97316] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border-t border-[#1c1d22]/50"
                                                        >
                                                            <span>{(!isDesktop && isExpanded) ? 'SHOW LESS' : 'SHOW MORE'}</span>
                                                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${(!isDesktop && isExpanded) ? 'rotate-180' : ''}`} />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Box>
                            )}
                                </>
                            )}
                        </Paper>

                        {/* Desktop Leaderboard Full Rankings Popup */}
                        <Dialog
                            open={Boolean(selectedDesktopLeaderboardMetric)}
                            onClose={() => setDesktopLeaderboardPopupMetric(null)}
                            fullWidth
                            maxWidth="sm"
                            PaperProps={{
                                sx: {
                                    bgcolor: '#121316',
                                    color: '#fff',
                                    border: '1px solid #22242a',
                                    borderRadius: '16px',
                                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75)',
                                    overflow: 'hidden',
                                    maxHeight: '85vh',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }
                            }}
                        >
                            {/* Popup Header */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                px: { xs: 2, sm: 3 },
                                py: 2,
                                borderBottom: '1px solid #1c1d22',
                                bgcolor: '#16181d',
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    {selectedDesktopLeaderboardMetric?.icon && (
                                        <Box sx={{
                                            width: 38,
                                            height: 38,
                                            borderRadius: '12px',
                                            bgcolor: '#18191e',
                                            border: '1px solid #22242a',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <Image
                                                src={selectedDesktopLeaderboardMetric.icon}
                                                alt={selectedDesktopLeaderboardMetric.label}
                                                width={22}
                                                height={22}
                                                className="object-contain"
                                            />
                                        </Box>
                                    )}
                                    <Box>
                                        <Typography sx={{
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                            color: '#ffffff',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.8px',
                                            fontFamily: 'var(--font-woodford-bourne-pro), sans-serif',
                                            lineHeight: 1.2,
                                        }}>
                                            {selectedDesktopLeaderboardMetric?.label || 'Leaderboard'}
                                        </Typography>
                                        <Typography sx={{ fontSize: '11px', color: '#717d8f', fontWeight: 500, mt: 0.25 }}>
                                            Full Rankings
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {selectedDesktopLeaderboardMetric && (
                                        <Tooltip title="How this metric is calculated" arrow>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setLeaderboardInfoMetric(selectedDesktopLeaderboardMetric.key);
                                                }}
                                                className="w-7 h-7 rounded-full border border-[#22242a] flex items-center justify-center text-[#717d8f] hover:text-white hover:border-[#383a42] transition-colors"
                                            >
                                                <Info className="w-4 h-4" />
                                            </button>
                                        </Tooltip>
                                    )}
                                    <IconButton
                                        onClick={() => setDesktopLeaderboardPopupMetric(null)}
                                        sx={{
                                            color: '#717d8f',
                                            p: 0.75,
                                            '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.06)' },
                                        }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>

                            {/* Column Headers */}
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: '36px 1fr auto',
                                alignItems: 'center',
                                gap: 2,
                                px: { xs: 2.5, sm: 3.5 },
                                py: 1.5,
                                bgcolor: '#121316',
                                borderBottom: '1px solid #1c1d22',
                                color: '#717d8f',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.8px',
                                textTransform: 'uppercase',
                            }}>
                                <Box sx={{ textAlign: 'center' }}>#</Box>
                                <Box>PLAYER</Box>
                                <Box sx={{ textAlign: 'right', minWidth: 44, pr: 1 }}>
                                    {selectedDesktopLeaderboardMetric ? getMetricValueHeader(selectedDesktopLeaderboardMetric.key) : ''}
                                </Box>
                            </Box>

                            {/* Scrollable Players List */}
                            <DialogContent sx={{
                                p: 0,
                                bgcolor: '#121316',
                                overflowY: 'auto',
                                maxHeight: '62vh',
                                scrollbarWidth: 'thin',
                                '&::-webkit-scrollbar': { width: '8px' },
                                '&::-webkit-scrollbar-track': { background: '#121316' },
                                '&::-webkit-scrollbar-thumb': { background: '#22242a', borderRadius: '9999px' },
                            }}>
                                {(() => {
                                    if (!selectedDesktopLeaderboardMetric) return null;
                                    const players = allLeaderboardData[selectedDesktopLeaderboardMetric.key] || [];
                                    if (players.length === 0) {
                                        return (
                                            <Box sx={{ py: 6, textAlign: 'center', color: '#717d8f', fontSize: 13 }}>
                                                No data available
                                            </Box>
                                        );
                                    }
                                    return players.map((player, idx) => {
                                        const leaderboardMember = (league?.members || []).find((m) => String(m.id) === String(player.id));
                                        const leaderboardPlayerName =
                                            (player.name || `${leaderboardMember?.firstName || ''} ${leaderboardMember?.lastName || ''}`.trim()).trim();
                                        const leaderboardAvatarSrc =
                                            typeof leaderboardMember?.profilePicture === 'string' && leaderboardMember.profilePicture.trim().length > 0
                                                ? leaderboardMember.profilePicture.trim()
                                                : '';
                                        const leaderboardInitials = getAvatarInitials({
                                            name: leaderboardPlayerName,
                                            firstName: leaderboardMember?.firstName,
                                            lastName: leaderboardMember?.lastName,
                                        });

                                        const firstName = leaderboardMember?.firstName || (player.name ? player.name.split(' ')[0] : '');
                                        const lastName = leaderboardMember?.lastName || (player.name ? player.name.split(' ').slice(1).join(' ') : '');
                                        const isPlayerAdmin = (league?.administrators || []).some((a: any) => String(a.id) === String(player.id)) || Boolean((leaderboardMember as any)?.isAdmin);
                                        const rawPos = leaderboardMember ? getMemberPositionLabel(leaderboardMember) : getPositionShortForm(player.positionType);
                                        const displayPos = !rawPos || rawPos.toLowerCase() === 'player' ? '-' : rawPos;
                                        const isCurrentUser = String(player.id) === String(user?.id || '');

                                        return (
                                            <Link
                                                key={`popup-${selectedDesktopLeaderboardMetric.key}-${player.id}`}
                                                href={`/player/${player.id}`}
                                                onClick={() => setDesktopLeaderboardPopupMetric(null)}
                                                className={`grid grid-cols-[36px_1fr_auto] items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 transition-colors border-b border-[#1c1d22] cursor-pointer ${
                                                    isCurrentUser
                                                        ? 'league-row-current-user'
                                                        : 'hover:bg-[#18191e]'
                                                }`}
                                            >
                                                {/* Rank Number */}
                                                <div className="text-center text-[#8a94a6] font-semibold text-xs sm:text-sm">
                                                    {idx + 1}
                                                </div>

                                                {/* Player Info */}
                                                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                                    {/* Avatar */}
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 text-white font-bold text-[11px]"
                                                        style={{
                                                            backgroundColor: leaderboardAvatarSrc
                                                                ? 'transparent'
                                                                : getAvatarBackgroundColor(leaderboardPlayerName || String(player.id || 'player')),
                                                        }}
                                                    >
                                                        {leaderboardAvatarSrc ? (
                                                            <Image
                                                                src={resolveImageUrl(leaderboardAvatarSrc)}
                                                                alt={leaderboardPlayerName || 'Player'}
                                                                width={32}
                                                                height={32}
                                                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                                            />
                                                        ) : (
                                                            leaderboardInitials
                                                        )}
                                                    </div>

                                                    {/* Name & Position */}
                                                    <div className="flex flex-col min-w-0 justify-center leading-tight">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <span className="text-white font-bold text-xs sm:text-sm truncate uppercase">
                                                                {formatPlayerCardStyleName(firstName, lastName)}
                                                            </span>
                                                            {isPlayerAdmin && <Shield className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                                                        </div>
                                                        <span className="text-[#717d8f] text-[10px] sm:text-[11px] uppercase font-medium">
                                                            {displayPos}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Value */}
                                                <div className="text-right font-bold text-[#22c55e] text-sm sm:text-base min-w-[36px] sm:min-w-[44px] pr-1">
                                                    {selectedDesktopLeaderboardMetric.key === 'contribution' ? `${player.value}%` : player.value}
                                                </div>
                                            </Link>
                                        );
                                    });
                                })()}
                            </DialogContent>
                        </Dialog>

                        <Dialog
                            open={Boolean(selectedLeaderboardInfo)}
                            onClose={() => setLeaderboardInfoMetric(null)}
                            fullWidth
                            maxWidth="xs"
                            PaperProps={{
                                sx: {
                                    bgcolor: '#1f1f1f',
                                    color: '#fff',
                                    border: '1px solid rgba(255,255,255,0.16)',
                                    borderRadius: 2,
                                }
                            }}
                        >
                            <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                                {selectedLeaderboardInfo?.label || 'Metric Info'}
                            </DialogTitle>
                            <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                                <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', mb: 1.5 }}>
                                    {selectedLeaderboardInfo?.infoSummary}
                                </Typography>
                                <Typography sx={{ color: '#10B981', fontWeight: 700, fontSize: '0.85rem', mb: 0.7 }}>
                                    How it is calculated
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                    {selectedLeaderboardInfo?.infoFormula}
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', mt: 2 }}>
                                    Selected league and season filters are applied to this leaderboard.
                                </Typography>
                            </DialogContent>
                            <DialogActions sx={{ px: 2, pb: 2 }}>
                                <Button
                                    onClick={() => setLeaderboardInfoMetric(null)}
                                    variant="outlined"
                                    sx={{
                                        color: '#fff',
                                        borderColor: 'rgba(255,255,255,0.35)',
                                        '&:hover': {
                                            borderColor: '#fff',
                                            backgroundColor: 'rgba(255,255,255,0.08)',
                                        }
                                    }}
                                >
                                    Close
                                </Button>
                            </DialogActions>
                        </Dialog>

                        <Dialog open={teamModalOpen} onClose={handleCloseTeamModal} fullWidth maxWidth="sm">
                            <DialogTitle>Teams for {selectedMatch?.homeTeamName} vs {selectedMatch?.awayTeamName}</DialogTitle>
                            <DialogContent>
                                {selectedMatch && (
                                    <Box>
                                        <Typography variant="h6" gutterBottom>{selectedMatch.homeTeamName}</Typography>
                                        <Divider sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                                        <Grid container spacing={1}>
                                            {selectedMatch.homeTeamUsers.map(player => (
                                                <Grid xs={6} key={player.id}>
                                                    <Chip label={`${player.firstName} ${player.lastName}`} sx={{ m: 0.5, color: 'black' }} />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}
                                {selectedMatch && (
                                    <Box>
                                        <Typography variant="h6" gutterBottom>{selectedMatch.awayTeamName}</Typography>
                                        <Divider sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                                        <Grid container spacing={1}>
                                            {selectedMatch.awayTeamUsers.map(player => (
                                                <Grid xs={6} key={player.id}>
                                                    <Chip label={`${player.firstName} ${player.lastName}`} sx={{ m: 0.5, color: 'black' }} />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseTeamModal}>Close</Button>
                            </DialogActions>
                        </Dialog>
                        {/* Members dialog (full-featured) */}
                        <Snackbar
                            open={!!toastMessage}
                            autoHideDuration={3000}
                            onClose={() => setToastMessage(null)}
                            message={toastMessage}
                            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        />

                        {/* Points Disabled Alert */}
                        <Snackbar
                            open={showPointsAlert}
                            autoHideDuration={4000}
                            onClose={() => setShowPointsAlert(false)}
                            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        >
                            <Alert
                                onClose={() => setShowPointsAlert(false)}
                                severity="info"
                                sx={{
                                    width: '100%',
                                    backgroundColor: 'rgba(30, 58, 138, 0.9)',
                                    color: 'white',
                                    '& .MuiAlert-icon': { color: 'white' },
                                    '& .MuiAlert-message': { color: 'white' }
                                }}
                            >
                                Admin have disabled the points option. You will not see the points in the table.
                            </Alert>
                        </Snackbar>
                        {/* // Add this after your Snackbar components, before the closing Container tag */}
                        {/* Undo Snackbar */}
                        {undoInfo && (
                            <Snackbar
                                open={!!undoInfo}
                                autoHideDuration={10000} // 10 seconds to undo
                                onClose={() => setUndoInfo(null)}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                                action={
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            color="inherit"
                                            size="small"
                                            onClick={handleUndo}
                                            sx={{
                                                color: '#fff',
                                                backgroundColor: 'rgba(255,255,255,0.2)',
                                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                                            }}
                                            startIcon={<Undo2 size={16} />}
                                        >
                                            Undo
                                        </Button>
                                        <IconButton
                                            size="small"
                                            aria-label="close"
                                            color="inherit"
                                            onClick={() => setUndoInfo(null)}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                }
                                message={
                                    undoInfo.action === 'archive'
                                        ? `Match archived. ${toastMessage}`
                                        : 'Match deleted permanently'
                                }
                            />
                        )}

                        {/* Match Stats Dialog (embedded) */}
                        <PlayMatchPagee
                            open={matchStatsOpen}
                            onClose={async () => {
                                console.log('🔄 PlayMatchPagee closing - refreshing data');

                                // � Fetch fresh league data from backend
                                await fetchLeagueDetails();

                                // 📢 Dispatch event for other components
                                window.dispatchEvent(new CustomEvent('match-updated'));

                                // Close dialog
                                setMatchStatsOpen(false);

                                console.log('✅ Match dialog closed and data refreshed');
                            }}
                            initialLeagueId={league?.id}
                            initialMatchId={selectedMatchIdForDialog || undefined}
                            showAdminGoalsSection={shouldShowAdminGoals}
                        />

                        {/* Line 4844 omitted */}
                        <PlayerStatsDialog
                            open={statsDialogOpen}
                            onClose={() => setStatsDialogOpen(false)}
                            onSave={handleSaveStats}
                            isSubmitting={isSubmittingStats}
                            stats={stats}
                            handleStatChange={handleStatChange}
                            teamGoals={getMatchGoals()}
                        />

                        <MatchDetailModal
                            open={matchDetailModalOpen}
                            onClose={() => setMatchDetailModalOpen(false)}
                            match={selectedMatchDetail}
                            leagueMembersCount={league?.members?.length || 0}
                        />

                        {/* Results Popup Dialog - renders full MatchDetailsPage */}
                        <Dialog
                            open={resultsDialogOpen}
                            onClose={() => { setResultsDialogOpen(false); setResultsDialogMatchId(null); }}
                            fullWidth
                            maxWidth="lg"
                            fullScreen={isMobile}
                            PaperProps={{
                                sx: {
                                    bgcolor: '#2b2b2b',
                                    backgroundImage: 'none',
                                    borderRadius: { xs: 0, sm: 3 },
                                    width: { xs: '100vw', sm: 'min(1150px, calc(100vw - 40px))' },
                                    maxWidth: { xs: '100vw', sm: '1150px' },
                                    height: { xs: '100dvh', sm: 'auto' },
                                    maxHeight: { xs: '100dvh', sm: '95vh' },
                                    overflow: 'hidden',
                                    position: 'relative',
                                    m: { xs: 0, sm: 2 },
                                    border: { xs: 'none', sm: '1px solid #fff' },
                                }
                            }}
                        >
                            <IconButton
                                onClick={() => { setResultsDialogOpen(false); setResultsDialogMatchId(null); }}
                                sx={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 0,
                                    color: '#000',
                                    zIndex: 10,
                                    bgcolor: '#e6e6e6',
                                    borderRadius: { xs: 0, sm: '0 8px 0 0' },
                                    width: { xs: 48, sm: 60 },
                                    height: { xs: 44, sm: 50 },
                                    '&:hover': { bgcolor: '#cfcfcf' }
                                }}
                            >
                                <CloseIcon fontSize={isMobile ? 'small' : 'medium'} />
                            </IconButton>
                            <DialogContent
                                sx={{
                                    p: 0,
                                    pt: { xs: 5.5, sm: 0 },
                                    height: { xs: '100%', sm: 'auto' },
                                    overflowX: 'hidden',
                                    overflowY: { xs: 'hidden', sm: 'auto' },
                                    scrollbarWidth: 'none',
                                    '&::-webkit-scrollbar': { display: 'none' }
                                }}
                            >
                                <Box
                                    sx={{
                                        height: { xs: '100%', sm: 'auto' },
                                        overflowY: { xs: 'auto', sm: 'visible' },
                                        scrollbarWidth: 'none',
                                        '&::-webkit-scrollbar': { display: 'none' }
                                    }}
                                >
                                    {resultsDialogOpen && resultsDialogMatchId && (
                                        <MatchDetailsPage matchIdProp={resultsDialogMatchId} />
                                    )}
                                </Box>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </Container>


            <Dialog
                open={confirmDeleteOpen}
                onClose={() => { setConfirmDeleteOpen(false); setMatchPendingDelete(null); setMatchHasData(null); }}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                    sx: {
                        width: { xs: 'calc(100vw - 16px)', sm: '100%' },
                        m: { xs: 1, sm: 2 },
                        borderRadius: { xs: 1.5, sm: 2 },
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.2rem' }, px: { xs: 2, sm: 3 }, pt: { xs: 1.5, sm: 2 }, pb: { xs: 0.8, sm: 1.2 } }}>
                    {matchDeleteChecking
                        ? 'Checking match...'
                        : pendingDeleteIsFixture
                            ? 'Delete Match Permanently'
                            : 'Archive Match'}
                </DialogTitle>
                <DialogContent sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 1, sm: 2 } }}>
                    {matchDeleteChecking ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                            <CircularProgress size={20} />
                            <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>Checking match data...</Typography>
                        </Box>
                    ) : (
                        <Typography variant="body2" sx={{ mt: 1, fontSize: { xs: '0.85rem', sm: '0.95rem' }, lineHeight: 1.45 }}>
                            {pendingDeleteIsFixture
                                ? 'This upcoming fixture will be permanently deleted and will not appear in Match Results.'
                                : 'This match will be moved to Archived Matches. You can restore it or permanently delete it later from Archived Match actions.'}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 1, p: { xs: 2, sm: 1.5 } }}>
                    <Button onClick={() => { setConfirmDeleteOpen(false); setMatchPendingDelete(null); setMatchHasData(null); }} sx={{ width: { xs: '100%', sm: 'auto' }, minHeight: 40 }}>
                        Cancel
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={handleConfirmDeleteMatch}
                        disabled={matchDeleteChecking}
                        sx={{ width: { xs: '100%', sm: 'auto' }, minHeight: 40 }}
                    >
                        {pendingDeleteIsFixture ? 'Delete Permanently' : 'Archive Match'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* // ...existing code... */}
            <Dialog
                open={archivedActionOpen}
                onClose={() => {
                    setArchivedActionOpen(false);
                    setArchivedActionMatch(null);
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        width: { xs: 'calc(100vw - 16px)', sm: '100%' },
                        m: { xs: 1, sm: 2 },
                        borderRadius: { xs: 1.5, sm: 2 },
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.2rem' }, px: { xs: 2, sm: 3 }, pt: { xs: 1.5, sm: 2 }, pb: { xs: 0.8, sm: 1.2 } }}>Archived Match Actions</DialogTitle>
                <DialogContent sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 1, sm: 2 } }}>
                    <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.85rem', sm: '0.95rem' }, lineHeight: 1.4 }}>
                        Choose an action for this archived match.
                    </Typography>
                    <Alert severity="info" sx={{ mt: 1 }}>
                        Permanent delete will hide this match forever. Player stats and historical records stay preserved in the database.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 1, p: { xs: 2, sm: 1.5 } }}>
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (!archivedActionMatch) return;
                            handleRestoreMatch(archivedActionMatch);
                            setArchivedActionOpen(false);
                        }}
                        startIcon={<Undo2 size={16} />}
                        sx={{ width: { xs: '100%', sm: 'auto' }, minHeight: 40 }}
                    >
                        Restore
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                            tryHardDeleteFromDialog();
                        }}
                        startIcon={<Trash2 size={16} />}
                        sx={{ width: { xs: '100%', sm: 'auto' }, minHeight: 40 }}
                    >
                        Permanently Delete
                    </Button>
                    {/* // ...existing code... */}
                </DialogActions>
            </Dialog>
            {/* // ...existing code... */}
            <Dialog
                open={viewTeamOpen}
                onClose={() => setViewTeamOpen(false)}
                maxWidth={false}
                fullScreen={isMobile}
                PaperProps={{ sx: { bgcolor: '#2b2b2b', width: { xs: '100%', sm: '90%', md: '65%' }, maxWidth: { xs: '100%', sm: '90%', md: '65%' }, borderRadius: { xs: 0, sm: 2 } } }}
            >
                <DialogTitle sx={{
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#d1d1d1',
                    position: 'relative',
                    py: 0.5,
                    minHeight: 0,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 6 }}>
                        <span style={{ fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: isMobile ? '1.1rem' : '1.8rem' }}>TEAMS</span>
                        {/* <span style={{ fontSize: isMobile ? '1.1rem' : '1.9rem' }}>&#9917;</span> */}
                        <Image src={FootBallIcon} alt="Football" width={24} height={24} />
                        <span style={{ fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: isMobile ? '1.1rem' : '1.8rem' }}>MATCH {viewTeamMatch?.matchNumber ?? '-'}</span>
                    </Box>
                    <IconButton
                        onClick={() => setViewTeamOpen(false)}
                        size="small"
                        sx={{ color: '#000', position: 'absolute', right: 0, top: 0, bottom: 0, width: 56, borderRadius: 0, bgcolor: '#e6e6e6', transition: 'background-color 0.2s ease', '&:hover': { bgcolor: '#d0d0d0', color: '#000' } }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0, '&::-webkit-scrollbar': { display: 'none' }, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                    <TeamPreviewScreen leagueId={viewTeamMatch?.leagueId} matchId={viewTeamMatch?.matchId} />
                </DialogContent>
            </Dialog>












            <Dialog
                open={openQuickView}
                onClose={() => setOpenQuickView(false)}
                fullWidth={false}
                maxWidth={false}
                PaperProps={{
                    sx: {
                        borderRadius: { xs: 1.5, sm: 2 },
                        overflow: 'visible',
                        width: { xs: 'min(335px, calc(100vw - 12px))', sm: 'min(490px, calc(100vw - 40px))' },
                        maxWidth: { xs: '335px', sm: '490px' },
                        m: { xs: 'auto', sm: 2 },
                    }
                }}
            >
                <DialogTitle sx={{
                    background: '#0e0e0e',
                    color: '#fff',
                    fontFamily: 'var(--font-oswald), "Oswald", sans-serif !important',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: { xs: 2.5, md: 3.5 },
                    py: 0,
                    height: { xs: 52, sm: 58 },
                    position: 'relative',
                    borderBottom: '3px solid #E56A16',
                    flexShrink: 0
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', pr: 4 }}>
                        <Image src={cflogo} alt="CF Logo" width={isMobile ? 180 : 240} height={isMobile ? 180 : 240} style={{ objectFit: 'contain', maxHeight: 40 }} />
                    </Box>
                    <IconButton onClick={() => setOpenQuickView(false)} aria-label="close" sx={{
                        bgcolor: '#e6e6e6',
                        color: '#000',
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: { xs: 48, sm: 56 },
                        borderRadius: 0,
                        borderTopRightRadius: 'inherit',
                        transition: 'background-color 0.2s ease',
                        '&:hover': {
                            bgcolor: '#d0d0d0',
                            color: '#000',
                        }
                    }}>
                        <CloseIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
                    </IconButton>
                </DialogTitle>

                <Divider />
                <DialogContent
                    sx={{
                        py: { xs: 0.65, sm: 2.5 },
                        px: { xs: 0.3, sm: 1.5 },
                        pb: { xs: 2.8, sm: 5 },
                        position: 'relative',
                        overflowX: 'visible',
                        overflowY: 'auto',
                        maxHeight: { xs: '78vh', sm: '70vh' },
                        '@media (min-width:600px)': {
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            '&::-webkit-scrollbar': {
                                display: 'none',
                                width: 0,
                                height: 0,
                            },
                        },
                    }}
                >
                    {quickView.player && (
                        <Box
                            id="player-quick-view-card"
                            ref={quickViewCardRef}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '64px 160px 64px', sm: '100px 260px 100px' },
                                gap: { xs: 0.2, sm: 1 },
                                alignItems: 'start',
                                justifyContent: 'center',
                                minHeight: { xs: '308px', sm: '438px' },
                                bgcolor: '#ffffff',
                                p: { xs: 0.4, sm: 1 },
                                borderRadius: 2,
                                overflow: 'hidden',
                            }}
                        >
                            {/* Left: Stats Icons */}
                            <Paper elevation={0} sx={{
                                p: { xs: 0.2, sm: 0.6 },
                                pb: { xs: 0.4, sm: 0.6 },
                                border: '1px solid rgba(15, 23, 42, 0.2)',
                                backgroundColor: '#fff',
                                minWidth: 0,
                                width: '100%',
                                minHeight: { xs: 0, sm: '280px' },
                                height: 'auto',
                                borderRadius: 2,
                                position: 'relative',
                                zIndex: 4,
                                order: { xs: 1, sm: 1 },
                                mt: { xs: 3.4, sm: 6 }
                            }}>
                                <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.48rem', sm: '0.75rem' }, letterSpacing: 0, mb: 0.15, lineHeight: 1.05, textAlign: 'center' }}>Current Stats</Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: { xs: 0.06, sm: 0 },
                                    }}
                                >
                                    {[
                                        { img: Goals, label: 'Goals', shortLabel: 'Goals', value: quickView.stats?.goals ?? 0 },
                                        { img: Assist, label: 'Assists', shortLabel: 'Assist', value: quickView.stats?.assists ?? 0 },
                                        { img: Cleansheet, label: 'Clean Sheets', shortLabel: 'Clean', value: quickView.cleanSheets ?? 0 },
                                        { img: Momt, label: 'MOTM Votes', shortLabel: 'MOTM Votes', value: quickView.motmCount ?? 0 },
                                        { img: DefensiveImpact, label: 'Def Impact', shortLabel: 'Def Impact', value: quickView.defensiveImpact ?? 0 },
                                        { img: Mentality, label: 'Mental Impact', shortLabel: 'Mental Impact', value: quickView.mentality ?? 0 },
                                    ].map((it, i) => (
                                        <Box
                                            key={i}
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-start',
                                                gap: 0.5,
                                                p: { xs: 0.02, sm: 0.3 },
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                                                <Image src={it.img} alt={it.label} width={isMobile ? 10 : 18} height={isMobile ? 10 : 18} style={{ objectFit: 'contain' }} />
                                                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: { xs: '0.58rem', sm: '0.85rem' }, lineHeight: 1 }}>
                                                    {it.value}
                                                </Typography>
                                            </Box>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: '#64748b',
                                                    fontSize: { xs: '0.42rem', sm: '0.6rem' },
                                                    textAlign: 'left',
                                                    lineHeight: 1.05,
                                                    whiteSpace: 'normal',
                                                    wordBreak: 'break-word',
                                                    letterSpacing: 0,
                                                    width: '100%',
                                                }}
                                            >
                                                {it.label}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                                <Button
                                    variant="text"
                                    disableRipple
                                    disableFocusRipple
                                    onClick={() => {
                                        const playerId = quickView.player?.id;
                                        if (!playerId) return;
                                        setOpenQuickView(false);
                                        router.push(`/player/${playerId}`);
                                    }}
                                    sx={{

                                        color: '#1976d2',
                                        fontSize: { xs: '0.45rem', sm: '0.7rem' },
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        textDecoration: 'underline',
                                        textUnderlineOffset: '3px',
                                        WebkitTapHighlightColor: 'transparent',
                                        padding: { xs: '1px 2px', sm: '2px 4px' },
                                        minWidth: 'auto',
                                        width: '100%',
                                        textAlign: 'center',
                                        '&:hover': {
                                            backgroundColor: 'transparent',
                                        },
                                        '&:active': {
                                            boxShadow: 'none',
                                            backgroundColor: 'transparent',
                                        },
                                        '&:focus': {
                                            boxShadow: 'none',
                                            outline: 'none',
                                            backgroundColor: 'transparent',
                                        },
                                        '&.Mui-focusVisible': {
                                            boxShadow: 'none',
                                            outline: 'none',
                                            backgroundColor: 'transparent',
                                        },
                                    }}
                                >
                                    More Stats
                                </Button>
                            </Paper>

                            {/* Center: Player Card */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'flex-start',
                                position: 'relative',
                                zIndex: 2,
                                order: { xs: 2, sm: 2 }
                            }}>
                                {(() => {
                                    const p = quickView.player as User & PlayerProfileLike;
                                    const fullName = [p.firstName, p.lastName]
                                        .map((part) => (typeof part === 'string' ? part.trim() : ''))
                                        .filter(Boolean)
                                        .join(' ')
                                        .trim();
                                    const playerCardProps = {
                                        name: fullName,
                                        number: getShirtNumber(p),
                                        points: Number(quickView.profileXP ?? quickView.xp ?? 0),
                                        stats: {
                                            DRI: String(quickView.skills?.dribbling ?? 0),
                                            SHO: String(quickView.skills?.shooting ?? 0),
                                            PAS: String(quickView.skills?.passing ?? 0),
                                            PAC: String(quickView.skills?.pace ?? 0),
                                            DEF: String(quickView.skills?.defending ?? 0),
                                            PHY: String(quickView.skills?.physical ?? 0),
                                        },
                                        foot: getPreferredFoot(p),
                                        profileImage: getProfileImage(p),
                                        shirtIcon: '',
                                        width: 260,
                                        height: isMobile ? 410 : 410,
                                        hideShareIcon: true,
                                        position: p.position ?? '',
                                    } satisfies PlayerCardProps;
                                    return (
                                        <Box
                                            sx={{
                                                width: { xs: 160, sm: 260 },
                                                height: { xs: 278, sm: 430 },
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'flex-start',
                                                position: 'relative',
                                                overflow: 'visible',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 260,
                                                    height: { xs: 410, sm: 410 },
                                                    position: { xs: 'absolute', sm: 'relative' },
                                                    top: 0,
                                                    left: { xs: '50%', sm: 'auto' },
                                                    transform: { xs: 'translateX(-50%) scale(0.62)', sm: 'none' },
                                                    transformOrigin: 'top center',
                                                }}
                                            >
                                                <PlayerCard {...playerCardProps} disableImagePopup />
                                            </Box>
                                        </Box>
                                    );
                                })()}
                            </Box>

                            {/* Right: Last 10 Matches */}
                            <Paper elevation={0} sx={{
                                p: { xs: 0.2, sm: 0.6 },
                                pb: { xs: 0.4, sm: 0.6 },
                                border: '1px solid rgba(15, 23, 42, 0.2)',
                                backgroundColor: '#fff',
                                borderRadius: 2,
                                overflow: 'hidden',
                                overflowX: 'hidden',
                                overflowY: 'hidden',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                '&::-webkit-scrollbar': { display: 'none', width: 0, height: 0 },
                                minWidth: 0,
                                width: '100%',
                                position: 'relative',
                                zIndex: 4,
                                order: { xs: 3, sm: 3 },
                                mt: { xs: 3.4, sm: 6 },
                                minHeight: { xs: 0, sm: 290 },
                                height: 'auto',
                            }}>
                                <Typography sx={{ fontWeight: 800, mb: 0.2, fontSize: { xs: '0.48rem', sm: '0.75rem' }, letterSpacing: 0, lineHeight: 1.05, textAlign: 'left' }}>Last 10 games</Typography>
                                <Stack direction="column" spacing={0.2} alignItems="flex-start" sx={{ pl: { xs: 0.2, sm: 0.4 } }}>
                                    {(quickView.lastFive ?? []).slice(0, 10).map((m, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Box
                                                sx={{
                                                    width: { xs: 14, sm: 28 },
                                                    height: { xs: 14, sm: 24 },
                                                    borderRadius: 0.5,
                                                    backgroundColor: resultColor(m.result),
                                                    color: '#fff',
                                                    fontWeight: 800,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: { xs: '0.46rem', sm: '0.6rem' },
                                                    lineHeight: 1,
                                                }}
                                            >
                                                {m.result}
                                            </Box>
                                            {idx === 0 && (
                                                <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: { xs: '0.42rem', sm: '0.55rem' }, display: { xs: 'none', sm: 'block' } }}>
                                                    Latest
                                                </Typography>
                                            )}
                                        </Box>
                                    ))}
                                    {(quickView.lastFive ?? []).length === 0 && (
                                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                            No recent matches.
                                        </Typography>
                                    )}
                                </Stack>
                            </Paper>
                        </Box>
                    )}
                    {quickView.player && (() => {
                        const playerName = [quickView.player?.firstName, quickView.player?.lastName]
                            .map((part) => (typeof part === 'string' ? part.trim() : ''))
                            .filter(Boolean)
                            .join(' ')
                            .trim() || 'Player';
                        const shareMessage = `*Champion Footballer*\nWhere Champions Are Made!\n\n*Create Matches. Track Performance. Claim Bragging Rights*\nJoin Champion Footballer today:\nhttps://www.championfootballer.co.uk`;

                        const shareWhatsApp = async () => {
                            let fileToShare: File | null = null;
                            if (quickViewCardRef.current) {
                                fileToShare = await captureElementAsFile(quickViewCardRef.current, `${playerName.replace(/\s+/g, '_')}_card.png`);
                            }

                            await shareToWhatsApp({
                                title: `${playerName} | Champion Footballer`,
                                message: shareMessage,
                                file: fileToShare,
                                fileName: `${playerName.replace(/\s+/g, '_')}_card.png`,
                            });
                        };

                        const shareNative = async () => {
                            let fileToShare: File | null = null;
                            if (quickViewCardRef.current) {
                                fileToShare = await captureElementAsFile(quickViewCardRef.current, `${playerName.replace(/\s+/g, '_')}_card.png`);
                            }
                            shareContent({
                                title: `${playerName} | Champion Footballer`,
                                customFullText: shareMessage,
                                url: 'https://www.championfootballer.co.uk',
                                files: fileToShare ? [fileToShare] : undefined,
                            });
                        };

                        return (
                            <Box data-share-exclude="true" sx={{ position: 'absolute', right: { xs: 8, sm: 12 }, bottom: { xs: 8, sm: 10 }, zIndex: 10 }}>
                                <IconButton
                                    sx={{
                                        bgcolor: '#10b981',
                                        color: '#fff',
                                        width: { xs: 34, sm: 36 },
                                        height: { xs: 34, sm: 36 },
                                        borderRadius: 1.2,
                                        '&:hover': { bgcolor: '#059669' },
                                    }}
                                    onClick={(e) => setPlayerShareAnchorEl(e.currentTarget)}
                                    title="Share player card"
                                >
                                    <Share2 size={18} />
                                </IconButton>

                                <Menu
                                    anchorEl={playerShareAnchorEl}
                                    open={Boolean(playerShareAnchorEl)}
                                    onClose={() => setPlayerShareAnchorEl(null)}
                                    PaperProps={{
                                        sx: {
                                            bgcolor: '#2b2b2b',
                                            color: '#fff',
                                            border: '1px solid #444',
                                            borderRadius: '6px',
                                            boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
                                            minWidth: 210,
                                            zIndex: 1400,
                                        }
                                    }}
                                >
                                    <MenuItem
                                        onClick={() => {
                                            setPlayerShareAnchorEl(null);
                                            shareWhatsApp();
                                        }}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.2,
                                            py: 1,
                                            '&:hover': { bgcolor: 'rgba(0, 167, 127, 0.25)' }
                                        }}
                                    >
                                        <WhatsAppIcon sx={{ fontSize: 18, color: '#25D366' }} />
                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Share to WhatsApp</Typography>
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => {
                                            setPlayerShareAnchorEl(null);
                                            shareNative();
                                        }}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.2,
                                            py: 1,
                                            '&:hover': { bgcolor: 'rgba(0, 167, 127, 0.25)' }
                                        }}
                                    >
                                        <Share2 size={18} color="#00a77f" />
                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>More Sharing Options</Typography>
                                    </MenuItem>
                                </Menu>
                            </Box>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* Edit Match Dialog */}
            <Dialog
                open={editMatchDialogOpen}
                onClose={() => {
                    setEditMatchDialogOpen(false);
                    setEditMatchId(null);
                }}
                maxWidth="lg"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        bgcolor: '#0a0a0a',
                        backgroundImage: 'none',
                        width: { xs: '100%', md: '85%' },
                        height: { xs: '100dvh', md: 'auto' },
                        maxHeight: { xs: '100dvh', md: '90vh' },
                        borderRadius: { xs: 0, sm: 2 },
                    }
                }}
            >
                {editMatchDialogOpen && editMatchId && (
                    <EditMatchPage
                        leagueIdProp={leagueId}
                        matchIdProp={editMatchId}
                        isDialog={true}
                        onClose={() => {
                            setEditMatchDialogOpen(false);
                            setEditMatchId(null);
                            // Refresh league data after edit
                            fetchLeagueDetails();
                        }}
                    />
                )}
            </Dialog>
        </Box>
    );
}





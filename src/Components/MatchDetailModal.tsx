'use client';

import React, { useEffect } from 'react';
import {
    Dialog,
    Box,
    Typography,
    IconButton,
    Chip,
    Button,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';
import HomeTeamImage from '@/Components/images/hometeamshirt.png';
import AwayTeamImage from '@/Components/images/awayteamshirt.png';

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

    if (raw.startsWith('/')) {
        return `${apiBase}${raw}`;
    }
    return `${apiBase}/${raw}`;
};

const formatMatchName = (name?: string): string => {
    if (!name) return '';
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    return `${capitalizedName}`;
};

const formatMatchDateTime = (dateString?: string, timeString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const datePart = `${day}/${month}/${year}`;

    let timePart = '';
    if (timeString && typeof timeString === 'string' && timeString.trim()) {
        timePart = timeString.trim();
    } else {
        timePart = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    }

    return timePart ? `${datePart} at ${timePart}` : datePart;
};

const getHomeTeamImageSrc = (match: any) => {
    if (!match) return HomeTeamImage;
    const img = match.homeTeamImage;
    if (!img) return HomeTeamImage;
    if (typeof img === 'object' && img.src) return img;
    if (typeof img === 'string') {
        const trimmed = img.trim();
        if (
            !trimmed ||
            trimmed === 'null' ||
            trimmed === 'undefined' ||
            trimmed.includes('matches.png') ||
            trimmed.includes('2nd champion icon') ||
            trimmed.includes('hometeamshirt.png')
        ) {
            return HomeTeamImage;
        }
        return resolveImageUrl(trimmed) || HomeTeamImage;
    }
    return HomeTeamImage;
};

const getAwayTeamImageSrc = (match: any) => {
    if (!match) return AwayTeamImage;
    const img = match.awayTeamImage;
    if (!img) return AwayTeamImage;
    if (typeof img === 'object' && img.src) return img;
    if (typeof img === 'string') {
        const trimmed = img.trim();
        if (
            !trimmed ||
            trimmed === 'null' ||
            trimmed === 'undefined' ||
            trimmed.includes('2nd champion icon') ||
            trimmed.includes('matches.png') ||
            trimmed.includes('awayteamshirt.png')
        ) {
            return AwayTeamImage;
        }
        return resolveImageUrl(trimmed) || AwayTeamImage;
    }
    return AwayTeamImage;
};

const isResultLikeStatus = (s: unknown): boolean => {
    if (!s) return false;
    const st = typeof s === 'string' ? s.trim().toUpperCase() : '';
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
};

const getPlayerDisplayName = (player: any): string => {
    if (!player) return 'PLAYER';
    if (typeof player === 'string') return player.toUpperCase();

    const first = (player.firstName || player.first_name || '').trim();
    const last = (player.lastName || player.last_name || '').trim();
    if (first || last) {
        return `${first} ${last}`.trim().toUpperCase();
    }

    const name = (player.name || player.fullName || player.userName || player.username || '').trim();
    if (name) {
        return name.toUpperCase();
    }

    if (player.email) {
        return String(player.email).split('@')[0].toUpperCase();
    }

    return 'PLAYER';
};

export interface MatchDetailModalProps {
    open: boolean;
    onClose: () => void;
    match: any | null;
    leagueMembersCount?: number;
    showViewFullDetailsLink?: boolean;
    onViewFullDetails?: (matchId: string) => void;
}

export default function MatchDetailModal({
    open,
    onClose,
    match,
    leagueMembersCount = 0,
}: MatchDetailModalProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if (open) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalOverflow || '';
            };
        }
    }, [open]);

    if (!match) return null;

    const availablePlayers: any[] = Array.isArray(match.availableUsers)
        ? match.availableUsers
        : Array.isArray(match.availablePlayersList)
        ? match.availablePlayersList
        : [];

    const homeUsers = match.homeTeamUsers || match.homeTeam || [];
    const awayUsers = match.awayTeamUsers || match.awayTeam || [];
    const squadPlayersCount = (Array.isArray(homeUsers) ? homeUsers.length : 0) + (Array.isArray(awayUsers) ? awayUsers.length : 0);

    const availableCount = availablePlayers.length || (typeof match.availablePlayers === 'number' ? match.availablePlayers : 0);
    const totalTargetCount = squadPlayersCount > 0 ? squadPlayersCount : (leagueMembersCount || 0);
    const pendingCount = totalTargetCount > 0
        ? Math.max(0, totalTargetCount - availableCount)
        : (typeof match.pendingPlayers === 'number' ? match.pendingPlayers : 0);

    const isResult = isResultLikeStatus(match.status);
    const homeLogoSrc = getHomeTeamImageSrc(match);
    const awayLogoSrc = getAwayTeamImageSrc(match);

    // ==========================================
    // 1. MOBILE VIEW (Teams & Scores Hidden, Matching Reference Pic)
    // ==========================================
    if (isMobile) {
        return (
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                    sx: {
                        bgcolor: '#12141a',
                        color: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)',
                        overflow: 'hidden',
                        width: '100%',
                        maxWidth: '380px',
                        m: 2,
                        minHeight: 460,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                    },
                }}
            >
                {/* Top Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    {/* Header */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 2.5,
                            py: 2,
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                    >
                        <Typography
                            sx={{
                                fontWeight: 800,
                                fontSize: '15px',
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                                color: '#ffffff',
                                fontFamily: 'var(--font-woodford-bourne-pro), var(--font-oswald), sans-serif',
                            }}
                        >
                            MATCH DETAILS
                        </Typography>
                        <IconButton
                            aria-label="close"
                            onClick={onClose}
                            size="small"
                            sx={{
                                color: '#9ca3af',
                                p: 0.5,
                                transition: 'color 0.15s ease',
                                '&:hover': {
                                    color: '#ffffff',
                                    bgcolor: 'transparent',
                                },
                            }}
                        >
                            <CloseIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Box>

                    {/* Top Info Grid: Date & Time + Location */}
                    <Box
                        sx={{
                            px: 2.5,
                            pt: 2.5,
                            pb: 2,
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 2,
                        }}
                    >
                        {/* Date & Time */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                            <Calendar size={18} strokeWidth={1.75} color="#d1d5db" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <Box sx={{ minWidth: 0 }}>
                                <Typography
                                    sx={{
                                        fontSize: '10.5px',
                                        fontWeight: 700,
                                        letterSpacing: '0.06em',
                                        color: '#7e8395',
                                        textTransform: 'uppercase',
                                        lineHeight: 1.2,
                                    }}
                                >
                                    DATE & TIME
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: '13.5px',
                                        fontWeight: 700,
                                        color: '#ffffff',
                                        mt: 0.5,
                                        lineHeight: 1.3,
                                    }}
                                >
                                    {formatMatchDateTime(match.date, match.matchTime)}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Location */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                            <MapPin size={18} strokeWidth={1.75} color="#d1d5db" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <Box sx={{ minWidth: 0 }}>
                                <Typography
                                    sx={{
                                        fontSize: '10.5px',
                                        fontWeight: 700,
                                        letterSpacing: '0.06em',
                                        color: '#7e8395',
                                        textTransform: 'uppercase',
                                        lineHeight: 1.2,
                                    }}
                                >
                                    LOCATION
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: '13.5px',
                                        fontWeight: 700,
                                        color: '#ffffff',
                                        mt: 0.5,
                                        lineHeight: 1.3,
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {match.location?.trim() || '-'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Player Availability Card */}
                    <Box
                        sx={{
                            mx: 2.5,
                            p: 2,
                            bgcolor: '#171922',
                            borderRadius: '14px',
                            border: '1px solid rgba(255, 255, 255, 0.07)',
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: '10.5px',
                                fontWeight: 700,
                                letterSpacing: '0.06em',
                                color: '#7e8395',
                                textTransform: 'uppercase',
                                mb: 1.5,
                            }}
                        >
                            PLAYER AVAILABILITY
                        </Typography>

                        {/* Status Badges */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.75 }}>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    px: 1.75,
                                    py: 0.5,
                                    borderRadius: '24px',
                                    bgcolor: 'rgba(16, 185, 129, 0.12)',
                                    border: '1px solid rgba(16, 185, 129, 0.45)',
                                    color: '#10b981',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                }}
                            >
                                Available: {availableCount}
                            </Box>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    px: 1.75,
                                    py: 0.5,
                                    borderRadius: '24px',
                                    bgcolor: 'rgba(239, 68, 68, 0.12)',
                                    border: '1px solid rgba(239, 68, 68, 0.35)',
                                    color: '#f87171',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                }}
                            >
                                Pending: {pendingCount}
                            </Box>
                        </Box>

                        {/* Divider */}
                        <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', mb: 1.5 }} />

                        {/* Subtitle */}
                        <Typography
                            sx={{
                                fontSize: '12px',
                                color: '#7e8395',
                                mb: 1.75,
                                fontWeight: 500,
                            }}
                        >
                            Players appear order of match acceptance
                        </Typography>

                        {/* Player list */}
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                                maxHeight: '220px',
                                overflowY: 'auto',
                                pr: 0.5,
                                '&::-webkit-scrollbar': { width: '4px' },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: 'rgba(255,255,255,0.15)',
                                    borderRadius: '2px',
                                },
                            }}
                        >
                            {availablePlayers.length > 0 ? (
                                availablePlayers.map((player: any, index: number) => {
                                    const playerName = getPlayerDisplayName(player);
                                    return (
                                        <Box
                                            key={player.id || player._id || index}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1.25,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    color: '#7e8395',
                                                    width: 16,
                                                    flexShrink: 0,
                                                    textAlign: 'left',
                                                }}
                                            >
                                                {index + 1}
                                            </Typography>
                                            <Image
                                                src={HomeTeamImage}
                                                alt="Player shirt"
                                                width={28}
                                                height={28}
                                                style={{ objectFit: 'contain', flexShrink: 0 }}
                                            />
                                            <Typography
                                                sx={{
                                                    fontSize: '13.5px',
                                                    fontWeight: 700,
                                                    color: '#ffffff',
                                                    letterSpacing: '0.03em',
                                                    textTransform: 'uppercase',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {playerName}
                                            </Typography>
                                        </Box>
                                    );
                                })
                            ) : (
                                <Typography sx={{ color: '#7e8395', fontSize: '12.5px', fontStyle: 'italic', py: 0.5 }}>
                                    No players have accepted yet
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Bottom Actions */}
                <Box sx={{ px: 2.5, pb: 2.5, pt: 2, width: '100%', boxSizing: 'border-box' }}>
                    <Button
                        onClick={onClose}
                        fullWidth
                        sx={{
                            height: '46px',
                            borderRadius: '12px',
                            bgcolor: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.14)',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                borderColor: 'rgba(255, 255, 255, 0.25)',
                            },
                        }}
                    >
                        CLOSE
                    </Button>
                </Box>
            </Dialog>
        );
    }

    // ==========================================
    // 2. DESKTOP VIEW (Full Info, Harmonized Sleek Dark Theme)
    // ==========================================
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            disableScrollLock={false}
            PaperProps={{
                sx: {
                    bgcolor: '#12141a',
                    color: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    width: '100%',
                    maxWidth: '560px',
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 3,
                    py: 2,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
            >
                <Typography
                    sx={{
                        fontWeight: 800,
                        fontSize: '16px',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: '#ffffff',
                        fontFamily: 'var(--font-woodford-bourne-pro), var(--font-oswald), sans-serif',
                    }}
                >
                    MATCH DETAILS
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    size="small"
                    sx={{
                        color: '#9ca3af',
                        p: 0.5,
                        transition: 'color 0.15s ease',
                        '&:hover': {
                            color: '#ffffff',
                            bgcolor: 'transparent',
                        },
                    }}
                >
                    <CloseIcon sx={{ fontSize: 20 }} />
                </IconButton>
            </Box>

            <Box
                sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2.25,
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    '&::-webkit-scrollbar': { width: '5px' },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '3px',
                    },
                }}
            >
                {/* Teams Side by Side Card (Desktop) */}
                <Box
                    sx={{
                        p: 2,
                        bgcolor: '#171922',
                        borderRadius: '14px',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                    }}
                >
                    {/* Home Team */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                        <Image
                            src={homeLogoSrc}
                            alt={match.homeTeamName || match.homeTeam || 'Home Team'}
                            width={40}
                            height={40}
                            style={{ borderRadius: '6px', flexShrink: 0, objectFit: 'contain' }}
                        />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize: '14px',
                                    color: '#ffffff',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {formatMatchName(match.homeTeamName || match.homeTeam)}
                            </Typography>
                            <Typography sx={{ color: '#7e8395', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Home
                            </Typography>
                        </Box>
                    </Box>

                    {/* Score / VS Section */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isResult ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    px: 2,
                                    py: 0.6,
                                    borderRadius: '10px',
                                }}
                            >
                                <Typography sx={{ fontWeight: 800, fontSize: '18px', color: '#ffffff' }}>
                                    {match.homeTeamGoals || 0}
                                </Typography>
                                <Typography sx={{ color: '#7e8395', fontSize: '14px', fontWeight: 600 }}>
                                    -
                                </Typography>
                                <Typography sx={{ fontWeight: 800, fontSize: '18px', color: '#ffffff' }}>
                                    {match.awayTeamGoals || 0}
                                </Typography>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    px: 1.75,
                                    py: 0.5,
                                    borderRadius: '8px',
                                }}
                            >
                                <Typography sx={{ fontWeight: 800, fontSize: '12px', color: '#7e8395', letterSpacing: '0.05em' }}>
                                    VS
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Away Team */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, flexDirection: 'row-reverse', minWidth: 0 }}>
                        <Image
                            src={awayLogoSrc}
                            alt={match.awayTeamName || match.awayTeam || 'Away Team'}
                            width={40}
                            height={40}
                            style={{ borderRadius: '6px', flexShrink: 0, objectFit: 'contain' }}
                        />
                        <Box sx={{ minWidth: 0, flex: 1, textAlign: 'right' }}>
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize: '14px',
                                    color: '#ffffff',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {formatMatchName(match.awayTeamName || match.awayTeam)}
                            </Typography>
                            <Typography sx={{ color: '#7e8395', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Away
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Match Info Grid: Date & Time, Location, Status (Desktop) */}
                <Box
                    sx={{
                        p: 2,
                        bgcolor: '#171922',
                        borderRadius: '14px',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 1.2fr auto',
                        gap: 2,
                        alignItems: 'center',
                    }}
                >
                    {/* Date & Time */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                        <Calendar size={18} strokeWidth={1.75} color="#d1d5db" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.06em', color: '#7e8395', textTransform: 'uppercase' }}>
                                DATE & TIME
                            </Typography>
                            <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff', mt: 0.25 }}>
                                {formatMatchDateTime(match.date, match.matchTime)}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Location */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                        <MapPin size={18} strokeWidth={1.75} color="#d1d5db" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.06em', color: '#7e8395', textTransform: 'uppercase' }}>
                                LOCATION
                            </Typography>
                            <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff', mt: 0.25, wordBreak: 'break-word' }}>
                                {match.location?.trim() || '-'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Status Chip */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                        <Chip
                            label={isResult ? 'RESULT PUBLISHED' : match.status === 'ongoing' ? 'LIVE' : 'SCHEDULED'}
                            size="small"
                            sx={{
                                bgcolor: isResult ? 'rgba(16, 185, 129, 0.15)' : match.status === 'ongoing' ? 'rgba(234, 88, 12, 0.15)' : 'rgba(3, 136, 227, 0.15)',
                                border: isResult ? '1px solid rgba(16, 185, 129, 0.45)' : match.status === 'ongoing' ? '1px solid rgba(234, 88, 12, 0.45)' : '1px solid rgba(3, 136, 227, 0.45)',
                                color: isResult ? '#10b981' : match.status === 'ongoing' ? '#ea580c' : '#38bdf8',
                                fontWeight: 700,
                                fontSize: '11px',
                                letterSpacing: '0.04em',
                            }}
                        />
                    </Box>
                </Box>

                {/* Player Availability Card (Desktop) */}
                <Box
                    sx={{
                        p: 2,
                        bgcolor: '#171922',
                        borderRadius: '14px',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            color: '#7e8395',
                            textTransform: 'uppercase',
                            mb: 1.5,
                        }}
                    >
                        PLAYER AVAILABILITY
                    </Typography>

                    {/* Status Badges */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.75 }}>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                px: 1.75,
                                py: 0.5,
                                borderRadius: '24px',
                                bgcolor: 'rgba(16, 185, 129, 0.12)',
                                border: '1px solid rgba(16, 185, 129, 0.45)',
                                color: '#10b981',
                                fontSize: '12px',
                                fontWeight: 700,
                            }}
                        >
                            Available: {availableCount}
                        </Box>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                px: 1.75,
                                py: 0.5,
                                borderRadius: '24px',
                                bgcolor: 'rgba(239, 68, 68, 0.12)',
                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                color: '#f87171',
                                fontSize: '12px',
                                fontWeight: 700,
                            }}
                        >
                            Pending: {pendingCount}
                        </Box>
                    </Box>

                    {/* Divider */}
                    <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', mb: 1.5 }} />

                    {/* Subtitle */}
                    <Typography
                        sx={{
                            fontSize: '12px',
                            color: '#7e8395',
                            mb: 1.75,
                            fontWeight: 500,
                        }}
                    >
                        Players appear order of match acceptance
                    </Typography>

                    {/* Player list */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                            maxHeight: '220px',
                            overflowY: 'auto',
                            pr: 0.5,
                            '&::-webkit-scrollbar': { width: '4px' },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                borderRadius: '2px',
                            },
                        }}
                    >
                        {availablePlayers.length > 0 ? (
                            availablePlayers.map((player: any, index: number) => {
                                const playerName = getPlayerDisplayName(player);
                                return (
                                    <Box
                                        key={player.id || player._id || index}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.25,
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: '#7e8395',
                                                width: 16,
                                                flexShrink: 0,
                                                textAlign: 'left',
                                            }}
                                        >
                                            {index + 1}
                                        </Typography>
                                        <Image
                                            src={HomeTeamImage}
                                            alt="Player shirt"
                                            width={28}
                                            height={28}
                                            style={{ objectFit: 'contain', flexShrink: 0 }}
                                        />
                                        <Typography
                                            sx={{
                                                fontSize: '13.5px',
                                                fontWeight: 700,
                                                color: '#ffffff',
                                                letterSpacing: '0.03em',
                                                textTransform: 'uppercase',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {playerName}
                                        </Typography>
                                    </Box>
                                );
                            })
                        ) : (
                            <Typography sx={{ color: '#7e8395', fontSize: '12.5px', fontStyle: 'italic', py: 0.5 }}>
                                No players have accepted yet
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Bottom Actions */}
            <Box sx={{ px: 3, pb: 2.5, pt: 1, width: '100%', boxSizing: 'border-box' }}>
                <Button
                    onClick={onClose}
                    fullWidth
                    sx={{
                        height: '46px',
                        borderRadius: '12px',
                        bgcolor: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            borderColor: 'rgba(255, 255, 255, 0.25)',
                        },
                    }}
                >
                    CLOSE
                </Button>
            </Box>
        </Dialog>
    );
}

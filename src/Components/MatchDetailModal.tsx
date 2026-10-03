'use client';

import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    IconButton,
    Chip,
    Button,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
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

const formatMatchDate = (dateString?: string) => {
    if (!dateString) return '';
    const matchDate = new Date(dateString);
    if (isNaN(matchDate.getTime())) return dateString;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

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

const formatMatchTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

const getHomeTeamImageSrc = (match: any) => {
    if (!match) return HomeTeamImage;
    const img = match.homeTeamImage;
    if (!img) return HomeTeamImage;
    if (typeof img === 'object' && img.src) return img;
    if (typeof img === 'string') {
        const trimmed = img.trim();
        if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed.includes('matches.png') || trimmed.includes('hometeamshirt.png')) {
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
        if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed.includes('2nd champion icon') || trimmed.includes('awayteamshirt.png')) {
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

interface MatchDetailModalProps {
    open: boolean;
    onClose: () => void;
    match: any | null;
    leagueMembersCount?: number;
    showViewFullDetailsLink?: boolean;
}

export default function MatchDetailModal({
    open,
    onClose,
    match,
    leagueMembersCount = 0,
    showViewFullDetailsLink = false,
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

    const isResult = isResultLikeStatus(match.status);
    const homeLogoSrc = getHomeTeamImageSrc(match);
    const awayLogoSrc = getAwayTeamImageSrc(match);

    const homeUsers = match.homeTeamUsers || match.homeTeam || [];
    const awayUsers = match.awayTeamUsers || match.awayTeam || [];
    const squadPlayersCount = homeUsers.length + awayUsers.length;

    const availableCount = match.availableUsers?.length || 0;
    const totalTargetCount = squadPlayersCount > 0 ? squadPlayersCount : (leagueMembersCount || 0);
    const pendingCount = Math.max(0, totalTargetCount - availableCount);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            fullScreen={isMobile}
            disableScrollLock={false}
            PaperProps={{
                sx: {
                    bgcolor: 'rgba(15,15,15,0.95)',
                    color: '#E5E7EB',
                    borderRadius: isMobile ? 0 : 3,
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
                    maxHeight: isMobile ? '100vh' : '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                },
            }}
        >
            <DialogTitle
                sx={{
                    background: '#0e0e0e',
                    color: '#fff',
                    fontFamily: 'var(--font-oswald), "Oswald", sans-serif !important',
                    fontWeight: 700,
                    fontSize: { xs: '20px', sm: '24px', md: '28px' },
                    textTransform: 'uppercase',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: { xs: 2.5, md: 3.5 },
                    py: 0,
                    height: { xs: 52, sm: 58 },
                    position: 'relative',
                    borderBottom: '3px solid #E56A16',
                    flexShrink: 0
                }}
            >
                Match Details
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
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
                    }}
                >
                    <CloseIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
                </IconButton>
            </DialogTitle>

            <DialogContent
                sx={{
                    p: 0,
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '3px' }
                }}
            >
                {/* Match Header - Teams Side by Side */}
                <Box sx={{
                    p: { xs: 2, sm: 3 },
                    // background: 'linear-gradient(177deg,rgba(229, 106, 22, 1) 26%, rgba(207, 35, 38, 1) 100%)',
                    color: 'white'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', sm: 'row' } }}>
                        {/* Home Team */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            flex: 1,
                            width: { xs: '100%', sm: 'auto' },
                            minWidth: 0
                        }}>
                            <Image
                                src={homeLogoSrc}
                                alt={match.homeTeamName || match.homeTeam || 'Home Team'}
                                width={40}
                                height={40}
                                style={{ borderRadius: '6px', flexShrink: 0, objectFit: 'contain' }}
                            />
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 'bold',
                                        fontSize: { xs: '1rem', sm: '1.25rem' },
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {formatMatchName(match.homeTeamName || match.homeTeam)}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        opacity: 0.8,
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Home
                                </Typography>
                            </Box>
                        </Box>

                        {/* Score / VS Section */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            {isResult ? (
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    backgroundColor: 'rgba(255,255,255,0.15)',
                                    px: 2,
                                    py: 1,
                                    borderRadius: 2
                                }}>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                        {match.homeTeamGoals || 0}
                                    </Typography>
                                    <Typography variant="h6" sx={{ opacity: 0.7 }}>
                                        -
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                        {match.awayTeamGoals || 0}
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    px: 2,
                                    py: 1,
                                    borderRadius: 2
                                }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        VS
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Away Team */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            flex: 1,
                            width: { xs: '100%', sm: 'auto' },
                            flexDirection: 'row-reverse',
                            minWidth: 0
                        }}>
                            <Image
                                src={awayLogoSrc}
                                alt={match.awayTeamName || match.awayTeam || 'Away Team'}
                                width={40}
                                height={40}
                                style={{ borderRadius: '6px', flexShrink: 0, objectFit: 'contain' }}
                            />
                            <Box sx={{ minWidth: 0, flex: 1, textAlign: 'right' }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 'bold',
                                        fontSize: { xs: '1rem', sm: '1.25rem' },
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {formatMatchName(match.awayTeamName || match.awayTeam)}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        opacity: 0.8,
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Away
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Match Info */}
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {/* Date & Time */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Calendar size={20} color="#E5E7EB" />
                        <Box>
                            <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                                Date & Time
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#E5E7EB', fontWeight: 'bold' }}>
                                {formatMatchDate(match.date)} {formatMatchTime(match.date) ? `at ${formatMatchTime(match.date)}` : ''}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Location */}
                    {match.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                width: 20,
                                height: 20,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                📍
                            </Box>
                            <Box>
                                <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                                    Location
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#E5E7EB', fontWeight: 'bold' }}>
                                    {match.location}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* Status */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            width: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {isResult ? '✅' : match.status === 'ongoing' ? '⚡' : '⏰'}
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                                Status
                            </Typography>
                            <Chip
                                label={isResult ? 'RESULT_PUBLISHED' : match.status === 'ongoing' ? 'Live' : 'SCHEDULED'}
                                size="small"
                                sx={{
                                    backgroundColor: isResult ? '#16a34a' : match.status === 'ongoing' ? '#ea580c' : '#0388E3',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '0.75rem'
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Availability Info for Scheduled / Fixture Matches */}
                    {!isResult && (
                        <Box sx={{
                            mt: 2,
                            p: 2,
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            borderRadius: 2,
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.8rem', mb: 1 }}>
                                Player Availability
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: (match.availableUsers && match.availableUsers.length > 0) ? 2 : 0 }}>
                                <Chip
                                    label={`Available: ${availableCount}`}
                                    size="small"
                                    sx={{ backgroundColor: '#16a34a', color: 'white', fontWeight: 'bold' }}
                                />
                                {leagueMembersCount > 0 && (
                                    <Chip
                                        label={`Pending: ${pendingCount}`}
                                        size="small"
                                        sx={{ backgroundColor: '#dc2626', color: 'white', fontWeight: 'bold' }}
                                    />
                                )}
                            </Box>

                            {match.availableUsers && match.availableUsers.length > 0 && (
                                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.8rem', mb: 1.5, fontWeight: 'bold' }}>
                                        Order of acceptance:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {match.availableUsers.map((player: any, index: number) => (
                                            <Box key={player.id || index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Image
                                                    src={HomeTeamImage}
                                                    alt="Green Shirt"
                                                    width={22}
                                                    height={22}
                                                    style={{ objectFit: 'contain' }}
                                                />
                                                <Typography variant="body2" sx={{ color: '#E5E7EB', fontWeight: 500, fontSize: '0.9rem' }}>
                                                    {index + 1}. {player.firstName || player.name || ''} {player.lastName || ''}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: { xs: 2, sm: 3 }, gap: 1, borderTop: '1px solid rgba(255,255,255,0.1)', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' } }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        color: '#E5E7EB',
                        borderColor: 'rgba(255,255,255,0.2)',
                        width: { xs: '100%', sm: 'auto' },
                        '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            borderColor: 'rgba(255,255,255,0.3)'
                        }
                    }}
                >
                    Close
                </Button>
                {showViewFullDetailsLink && match.id && (
                    <Link href={`/match/${match.id}`} passHref style={{ textDecoration: 'none', width: isMobile ? '100%' : 'auto' }}>
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: '#0388E3',
                                width: { xs: '100%', sm: 'auto' },
                                '&:hover': { backgroundColor: '#0369a1' }
                            }}
                        >
                            View Full Details
                        </Button>
                    </Link>
                )}
            </DialogActions>
        </Dialog>
    );
}

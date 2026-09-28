'use client';

import React from 'react';
import { Box, Avatar, Typography, Paper } from '@mui/material';
import Image from 'next/image';
import { BarChart, SpaceDashboard } from '@mui/icons-material';
import GoatImg from '@/Components/images/goat.png';
import XPStarMilestoneCard from '@/Components/XPStarMilestoneCard';
import { getAvatarBackgroundColor, getAvatarInitials } from '@/lib/avatarInitials';

export interface PageXpTier {
    level: number;
    title: string;
    minXP: number;
    maxXP: number;
    cardColor: string;
    starColor: string;
    description: string;
    isGoat?: boolean;
}

export interface PlayerProfileHeaderProps {
    playerName: string;
    playerPositionType: string;
    profileAvatarSrc: string | null;
    xp: number;
    xpLoading: boolean;
    pageXpStatusTier: PageXpTier;
    pageXpStatusTextColor: string;
    pageXpProgressToMax: number;
    PAGE_XP_MAX_POINTS: number;
    isMobile: boolean;
    playerId: string | null;
    onOpenStatsModal: () => void;
    onNavigateCareer: () => void;
}

export const PlayerProfileHeader: React.FC<PlayerProfileHeaderProps> = ({
    playerName,
    playerPositionType,
    profileAvatarSrc,
    xp,
    xpLoading,
    pageXpStatusTier,
    pageXpStatusTextColor,
    pageXpProgressToMax,
    PAGE_XP_MAX_POINTS,
    isMobile,
    playerId,
    onOpenStatsModal,
    onNavigateCareer,
}) => {
    return (
        <Box sx={{
            display: 'flex',
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            mb: 3,
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2.2, md: 2 }
        }}>
            {/* Left: Avatar + Name + Position */}
            <Box sx={{ display: 'flex', alignItems: { xs: 'center', sm: 'flex-start' }, gap: { xs: 1.3, sm: 2 }, width: { xs: '100%', md: 'auto' } }}>
                <Avatar
                    src={profileAvatarSrc ?? undefined}
                    alt={playerName}
                    sx={{
                        width: { xs: 84, sm: 102, md: 125 },
                        height: { xs: 84, sm: 102, md: 125 },
                        bgcolor: profileAvatarSrc ? 'transparent' : getAvatarBackgroundColor(playerName),
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: { xs: 30, sm: 34, md: 40 },
                        textTransform: 'uppercase',
                    }}
                >
                    {!profileAvatarSrc && getAvatarInitials({ name: playerName })}
                </Avatar>
                <Box sx={{ pt: 0, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography sx={{
                            color: '#fff',
                            fontSize: { xs: 20, sm: 24, md: 27 },
                            fontFamily: 'var(--font-woodford-bourne-pro)',
                            fontWeight: 700,
                            fontStyle: 'normal',
                            lineHeight: '100%',
                            letterSpacing: '0%',
                            verticalAlign: 'middle',
                            textTransform: 'uppercase',
                            mt: { xs: 0.2, sm: 1.5, md: 2 },
                            wordBreak: 'break-word'
                        }}>
                            {playerName.toUpperCase()}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'fit-content' }}>
                        <Typography sx={{ color: '#fff', fontSize: { xs: 13, sm: 14, md: 16 }, fontWeight: 700, textTransform: 'uppercase' }}>
                            {playerPositionType}
                        </Typography>
                        <Box sx={{ fontSize: isMobile ? 28 : 35 }}>
                            <XPStarMilestoneCard height={isMobile ? 28 : 35} width={isMobile ? 28 : 35} xp={xp} colorOverride={pageXpStatusTier.starColor} />
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Right: XP + Badges */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'stretch', md: 'flex-end' }, gap: 0, width: { xs: '100%', md: 'auto' } }}>
                <Box sx={{ width: { xs: '100%', md: 'fit-content' }, maxWidth: '100%' }}>
                    {/* Top row: XP + Status Title */}
                    <Box sx={{ display: 'flex', alignItems: 'stretch', gap: { xs: 1, md: 2 }, width: '100%' }}>
                        <Paper sx={{
                            bgcolor: '#383838',
                            color: '#fff',
                            px: { xs: 2.2, sm: 3.2, md: 4.3 },
                            py: 0.1,
                            borderRadius: 0,
                            fontWeight: 400,
                            fontSize: { xs: 14, sm: 16, md: 18 },
                            border: '2px solid #fff',
                            display: 'flex',
                            alignItems: 'center',
                            minWidth: { xs: 84, sm: 95, md: 100 },
                            justifyContent: 'center'
                        }}>
                            {xpLoading ? '...' : xp.toLocaleString()}
                        </Paper>
                        <Paper sx={{
                            bgcolor: pageXpStatusTier.cardColor,
                            color: pageXpStatusTextColor,
                            pl: { xs: 1, md: 1.5 },
                            pr: { xs: 2, sm: 4, md: 10 },
                            py: { xs: 0.6, md: 0.9 },
                            borderRadius: 0,
                            fontWeight: 700,
                            fontSize: { xs: 12, sm: 14, md: 16 },
                            minWidth: { xs: 120, sm: 140, md: 170 },
                            flex: { xs: 1, md: '0 0 auto' },
                            transition: 'all 0.3s ease'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                <Typography sx={{ fontSize: { xs: 12, sm: 14, md: 16 }, fontWeight: 700, lineHeight: 1 }}>
                                    {pageXpStatusTier.title}
                                </Typography>
                                {pageXpStatusTier.isGoat && (
                                    <Box sx={{ position: 'relative', width: { xs: 18, sm: 20 }, height: { xs: 18, sm: 20 }, flexShrink: 0 }}>
                                        <Image src={GoatImg} alt="GOAT tier" fill sizes="20px" style={{ objectFit: 'contain' }} />
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Box>
                    {/* Progress bar */}
                    <Box sx={{ width: '100%', display: 'flex', height: 6, borderRadius: 0, overflow: 'hidden', mt: 1 }}>
                        <Box sx={{
                            bgcolor: pageXpStatusTier.cardColor,
                            width: `${pageXpProgressToMax}%`,
                            height: '100%',
                            transition: 'width 0.3s ease'
                        }} />
                        <Box sx={{ bgcolor: '#555', width: `${100 - pageXpProgressToMax}%`, height: '100%' }} />
                    </Box>
                    <Typography sx={{ color: '#a8a8a8', fontSize: 11, mt: 0.5, fontWeight: 500 }}>
                        {xpLoading
                            ? `0 / ${PAGE_XP_MAX_POINTS.toLocaleString()} XP`
                            : `${Math.max(0, xp).toLocaleString()} / ${PAGE_XP_MAX_POINTS.toLocaleString()} XP (${pageXpProgressToMax}%)`}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        mt: 1.8,
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr', md: 'repeat(2, minmax(0, 1fr))' },
                        width: '100%',
                        maxWidth: { xs: 520, md: 500 },
                        mx: 'auto',
                        gap: { xs: 0.7, md: 1.5 },
                    }}
                >
                    {/* Stats Over Season button */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'stretch',
                            borderRadius: 1,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.4)',
                            boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
                            transition: 'transform .15s ease, box-shadow .15s ease, border-color .15s ease',
                            '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 10px 22px rgba(0,0,0,0.45)',
                                borderColor: 'rgba(255,255,255,0.65)',
                            },
                            '&:hover .icon-box': { bgcolor: '#008c6b' },
                            '&:hover .text-box': { bgcolor: '#2f2f2f' },
                            width: '100%',
                            minWidth: 0,
                            justifyContent: 'center',
                        }}
                        onClick={onOpenStatsModal}
                    >
                        <Box className="icon-box" sx={{
                            bgcolor: '#00a77f',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: { xs: 38, sm: 40, md: 44 },
                            borderRight: '1px solid rgba(255,255,255,0.25)',
                            py: { xs: 0.55, md: 0.7 }
                        }}>
                            <BarChart sx={{ color: '#fff', fontSize: { xs: 20, md: 26 } }} />
                        </Box>
                        <Box className="text-box" sx={{
                            bgcolor: '#00a77f',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: { xs: 'center', md: 'flex-start' },
                            px: { xs: 0.6, md: 0.9 },
                            py: { xs: 0.55, md: 0.7 },
                            width: '100%',
                        }}>
                            <Typography sx={{
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: { xs: 9, sm: 10, md: 11.5 },
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                whiteSpace: { xs: 'normal', sm: 'nowrap' },
                                lineHeight: 1.1,
                                textAlign: 'center',
                            }}>
                                Stats Over Season
                            </Typography>
                        </Box>
                    </Box>

                    {/* Performance Dashboard button */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'stretch',
                            borderRadius: 1,
                            overflow: 'hidden',
                            cursor: playerId ? 'pointer' : 'not-allowed',
                            border: '1px solid rgba(255,255,255,0.4)',
                            boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
                            opacity: playerId ? 1 : 0.6,
                            transition: 'transform .15s ease, box-shadow .15s ease, border-color .15s ease',
                            '&:hover': {
                                transform: playerId ? 'translateY(-1px)' : 'none',
                                boxShadow: playerId ? '0 10px 22px rgba(0,0,0,0.45)' : '0 6px 16px rgba(0,0,0,0.35)',
                                borderColor: playerId ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.4)',
                            },
                            '&:hover .perf-icon-box': { bgcolor: '#b71c1c' },
                            '&:hover .perf-text-box': { bgcolor: playerId ? '#2f2f2f' : '#2b2b2b' },
                            width: '100%',
                            minWidth: 0,
                            justifyContent: 'center',
                            justifySelf: { xs: 'stretch', md: 'start' },
                        }}
                        onClick={() => {
                            if (!playerId) return;
                            onNavigateCareer();
                        }}
                    >
                        <Box className="perf-icon-box" sx={{
                            bgcolor: '#d32f2f',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: { xs: 38, sm: 40, md: 44 },
                            borderRight: '1px solid rgba(255,255,255,0.25)',
                            py: { xs: 0.55, md: 0.7 },
                        }}>
                            <SpaceDashboard sx={{ color: '#fff', fontSize: { xs: 24, md: 26 } }} />
                        </Box>
                        <Box className="perf-text-box" sx={{
                            bgcolor: '#d32f2f',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: { xs: 'center', md: 'flex-start' },
                            px: { xs: 0.6, md: 0.9 },
                            py: { xs: 0.55, md: 0.7 },
                            width: '100%',
                        }}>
                            <Typography sx={{
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: { xs: 9.5, sm: 10.5, md: 11.5 },
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                whiteSpace: { xs: 'normal', sm: 'nowrap' },
                                lineHeight: 1.1,
                                textAlign: 'center',
                            }}>
                                Performance Dashboard
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default PlayerProfileHeader;

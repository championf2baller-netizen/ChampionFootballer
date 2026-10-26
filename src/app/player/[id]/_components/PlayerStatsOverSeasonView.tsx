'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Image from 'next/image';
import TrofiiImg from '@/Components/images/trofii.png';

export interface SeasonStatsItem {
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
}

export interface PlayerStatsOverSeasonViewProps {
    leagueId?: string;
    currentLeagueName: string;
    playerName: string;
    seasonWiseStats: SeasonStatsItem[];
    isMobile?: boolean;
}

export const PlayerStatsOverSeasonView: React.FC<PlayerStatsOverSeasonViewProps> = ({
    leagueId,
    currentLeagueName,
    playerName,
    seasonWiseStats,
    isMobile,
}) => {
    const [statsTab, setStatsTab] = useState<'goals' | 'assists' | 'motm' | 'defensive' | 'totalXP'>('goals');

    const tabs: Array<{ key: 'goals' | 'assists' | 'motm' | 'defensive' | 'totalXP'; label: string }> = [
        { key: 'goals', label: 'Goals' },
        { key: 'assists', label: 'Assists' },
        { key: 'motm', label: 'MOTM Votes' },
        { key: 'defensive', label: 'Cln Sht / Def' },
        { key: 'totalXP', label: 'Total XP' },
    ];

    const getStatValue = (s: SeasonStatsItem) => {
        switch (statsTab) {
            case 'goals': return s.goals;
            case 'assists': return s.assists;
            case 'motm': return s.motmVotes;
            case 'defensive': return s.defensiveImpact + s.cleanSheets;
            case 'totalXP': return s.totalXP;
            default: return 0;
        }
    };

    const maxValue = Math.max(...seasonWiseStats.map(getStatValue), 1);

    return (
        <Paper
            elevation={3}
            sx={{
                bgcolor: '#e8e4e0',
                borderRadius: { xs: '10px', sm: '8px' },
                border: '2px solid #3a3a3a',
                overflow: 'hidden',
                color: '#222',
            }}
        >
            {/* Header bar */}
            <Box
                sx={{
                    bgcolor: '#d9d9d9',
                    borderBottom: '1px solid #bdb8b3',
                    px: { xs: 1.5, sm: 2.5 },
                    py: { xs: 1.2, sm: 1.45 },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.1,
                }}
            >
                <Image
                    src={TrofiiImg}
                    alt="Trophy"
                    width={22}
                    height={22}
                    style={{
                        objectFit: 'contain',
                        filter: 'brightness(0) saturate(100%) invert(17%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(90%)'
                    }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', minWidth: 0 }}>
                    <Typography sx={{ fontFamily: 'var(--font-woodford-bourne-pro), sans-serif', fontWeight: 800, fontSize: { xs: 12.5, sm: 15, md: 17 }, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#222', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentLeagueName}
                    </Typography>
                    <Typography sx={{ color: '#777', fontSize: { xs: 13, sm: 16 }, lineHeight: 1 }}>|</Typography>
                    <Typography sx={{ fontFamily: 'var(--font-woodford-bourne-pro), sans-serif', fontWeight: 700, fontSize: { xs: 12, sm: 14.5, md: 16 }, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#3d3d3d', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                        STATS OVER SEASONS
                    </Typography>
                    {playerName && (
                        <>
                            <Typography sx={{ color: '#777', fontSize: { xs: 13, sm: 16 }, lineHeight: 1 }}>|</Typography>
                            <Typography sx={{ fontFamily: 'var(--font-woodford-bourne-pro), sans-serif', fontWeight: 800, fontSize: { xs: 12.5, sm: 14.5, md: 16 }, textTransform: 'uppercase', letterSpacing: '0.75px', color: '#1f1f1f', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {playerName.toUpperCase()}
                            </Typography>
                        </>
                    )}
                </Box>
            </Box>

            {/* Content Body */}
            <Box sx={{ bgcolor: '#f2f2f2', px: { xs: 1.25, sm: 2.5, md: 4 }, py: { xs: 2, md: 3 } }}>
                {leagueId === 'all' ? (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                        <Typography sx={{ color: '#777', fontSize: 14 }}>
                            Please select a specific league to view season-wise stats.
                        </Typography>
                    </Box>
                ) : seasonWiseStats.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                        <Typography className="empty-state-message" sx={{ color: '#555', fontSize: 16 }}>
                            No season to compare.
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {/* Tabs */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: { xs: 'flex-start', sm: 'space-between' },
                                mb: 1,
                                pt: { xs: 1, sm: 2 },
                                overflowX: 'auto',
                                gap: { xs: 1.2, sm: 2 },
                                pb: 0.6,
                                '&::-webkit-scrollbar': { height: 4 },
                                '&::-webkit-scrollbar-thumb': { background: 'rgba(45,45,45,0.35)', borderRadius: 3 },
                            }}
                        >
                            {tabs.map((tab) => {
                                const isSelected = statsTab === tab.key;
                                return (
                                    <Box
                                        key={tab.key}
                                        onClick={() => setStatsTab(tab.key)}
                                        sx={{
                                            flex: { xs: '0 0 auto', sm: 1 },
                                            display: 'flex',
                                            justifyContent: 'start',
                                            cursor: 'pointer',
                                            pb: { xs: 1.2, md: 1.8 },
                                        }}
                                    >
                                        <Box sx={{
                                            borderBottom: isSelected ? '4px solid #E56B16' : '4px solid #c0bbb5',
                                            transition: 'all 0.2s ease',
                                            minWidth: { xs: '90px', sm: '120px' },
                                            textAlign: 'start',
                                        }}>
                                            <Typography sx={{
                                                color: isSelected ? '#2d2d2d' : '#888',
                                                fontWeight: isSelected ? 800 : 600,
                                                fontSize: { xs: 13, sm: 16, md: 18 },
                                                whiteSpace: 'nowrap',
                                                transition: 'color 0.2s ease',
                                            }}>
                                                {tab.label}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Season Bars */}
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: { xs: 1.2, sm: 1.8 },
                                borderLeft: '3px solid #999',
                                borderBottom: '3px solid #999',
                                pl: 0,
                                pb: 2,
                            }}
                        >
                            {seasonWiseStats.map((season) => {
                                const value = getStatValue(season);
                                const percentage = (value / maxValue) * 100;

                                return (
                                    <Box
                                        key={season.seasonId}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: { xs: 1.1, sm: 2.5 },
                                            mx: { xs: 0.8, sm: 2 },
                                        }}
                                    >
                                        {/* Bar */}
                                        <Box sx={{ flex: 1 }}>
                                            <Box
                                                sx={{
                                                    bgcolor: 'transparent',
                                                    height: { xs: 32, sm: 38 },
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        bgcolor: value > 0 ? '#07BFA5' : 'transparent',
                                                        height: '100%',
                                                        width: value > 0 ? `${Math.max(percentage, 10)}%` : '0%',
                                                        transition: 'width 0.4s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-end',
                                                        pr: { xs: 1.2, sm: 2 },
                                                    }}
                                                >
                                                    {value > 0 && (
                                                        <Typography
                                                            sx={{
                                                                color: '#fff',
                                                                fontWeight: 700,
                                                                fontSize: { xs: 12, sm: 14 },
                                                            }}
                                                        >
                                                            {statsTab === 'totalXP' ? value.toLocaleString() : value}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                {value === 0 && (
                                                    <Typography
                                                        sx={{
                                                            color: '#999',
                                                            fontWeight: 600,
                                                            fontSize: { xs: 12, sm: 14 },
                                                            position: 'absolute',
                                                            left: 12,
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                        }}
                                                    >
                                                        0
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Season Label */}
                                        <Box sx={{ minWidth: { xs: 90, sm: 130 }, textAlign: 'right' }}>
                                            <Typography
                                                sx={{
                                                    color: '#2d2d2d',
                                                    fontWeight: 700,
                                                    fontSize: { xs: 11, sm: 13 },
                                                    textTransform: 'uppercase',
                                                    lineHeight: 1.3,
                                                    letterSpacing: '0.5px',
                                                }}
                                            >
                                                SEASON {season.seasonNumber}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    color: '#666',
                                                    fontSize: { xs: 10, sm: 11.5 },
                                                    lineHeight: 1.3,
                                                }}
                                            >
                                                {season.isFinished ? '(Finished)' : '(Not Finished)'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </>
                )}
            </Box>
        </Paper>
    );
};

export default PlayerStatsOverSeasonView;

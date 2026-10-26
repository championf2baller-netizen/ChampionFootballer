'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import StatItem from './StatItem';

export interface PlayerStatsRowProps {
    displayedStatsMatches: number;
    displayedStatsTotals: {
        goals: number;
        assists: number;
        cleanSheets: number;
    };
    displayedMotmVotes: number;
    displayedDefensiveImpact: number;
    displayedMentality: number;
    xpLoading: boolean;
    displayXp: number;
    getCms?: (key: string, fallback: string) => string;
}

export const PlayerStatsRow: React.FC<PlayerStatsRowProps> = ({
    displayedStatsMatches,
    displayedStatsTotals,
    displayedMotmVotes,
    displayedDefensiveImpact,
    displayedMentality,
    xpLoading,
    displayXp,
    getCms,
}) => {
    const statItems = [
        {
            label: getCms ? getCms('page_player_stats_label_total_apps', 'Total Appearances') : 'Total Appearances',
            value: displayedStatsMatches,
            isXp: false,
        },
        {
            label: getCms ? getCms('page_player_stats_label_goals_scored', 'Goals Scored') : 'Goals Scored',
            value: displayedStatsTotals.goals,
            isXp: false,
        },
        {
            label: getCms ? getCms('page_player_stats_label_assists_given', 'Assists Given') : 'Assists Given',
            value: displayedStatsTotals.assists,
            isXp: false,
        },
        {
            label: getCms ? getCms('page_player_stats_label_clean_sheets', 'Clean Sheets') : 'Clean Sheets',
            value: displayedStatsTotals.cleanSheets,
            isXp: false,
        },
        {
            label: getCms ? getCms('page_player_stats_label_motm_votes', 'Man of the Match Votes') : 'Man of the Match Votes',
            value: displayedMotmVotes,
            isXp: false,
        },
        {
            label: getCms ? getCms('page_player_stats_label_defensive_votes', 'Defensive Impact Votes') : 'Defensive Impact Votes',
            value: displayedDefensiveImpact,
            isXp: false,
        },
        {
            label: getCms ? getCms('page_player_stats_label_mentality_votes', 'Positive Mentality Votes') : 'Positive Mentality Votes',
            value: displayedMentality,
            isXp: false,
        },
        {
            label: getCms ? getCms('page_player_stats_label_total_xp', 'Total XP Points') : 'Total XP Points',
            value: xpLoading ? '...' : `${Math.max(0, displayXp).toLocaleString()} xp`,
            isXp: true,
        },
    ];

    return (
        <>
            {/* Desktop View: Original horizontal StatItem grid (md and up) */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'grid' },
                    gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
                    columnGap: 0,
                    rowGap: 2,
                    mt: { md: 2.5 },
                    mb: { md: 3 },
                    width: '100%',
                }}
            >
                <StatItem label={getCms ? getCms('page_player_stats_label_apps', 'APPS') : 'APPS'} value={displayedStatsMatches} />
                <StatItem label={getCms ? getCms('page_player_stats_label_goals', 'GOALS') : 'GOALS'} value={displayedStatsTotals.goals} />
                <StatItem label={getCms ? getCms('page_player_stats_label_assists', 'ASSISTS') : 'ASSISTS'} value={displayedStatsTotals.assists} />
                <StatItem label={getCms ? getCms('page_player_stats_label_cleansheet', 'CLEAN SHEET') : 'CLEAN SHEET'} value={displayedStatsTotals.cleanSheets} />
                <StatItem label={getCms ? getCms('page_player_stats_label_motm', 'MOTM VOTES') : 'MOTM VOTES'} value={displayedMotmVotes} />
                <StatItem label={getCms ? getCms('page_player_stats_label_defensive', 'DEFENSIVE IMP.') : 'DEFENSIVE IMP.'} value={displayedDefensiveImpact} />
                <StatItem label={getCms ? getCms('page_player_stats_label_mentality', '+ MENTALITY') : '+ MENTALITY'} value={displayedMentality} />
                <StatItem label={getCms ? getCms('page_player_stats_label_totalxp', 'TOTAL XP') : 'TOTAL XP'} value={xpLoading ? '...' : `${Math.max(0, displayXp).toLocaleString()} xp`} />
            </Box>

            {/* Mobile View: Two-Column Table Layout from screenshot (xs to md) */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, width: '100%', mt: 2, mb: 2.2 }}>
                <Typography
                    sx={{
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: 22,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        mb: 1.5,
                        fontFamily: 'var(--font-woodford-bourne-pro), sans-serif',
                    }}
                >
                    {getCms ? getCms('page_player_stats_section_title', 'STATS') : 'STATS'}
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.8,
                        width: '100%',
                    }}
                >
                    {statItems.map((item, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                px: 1.8,
                                py: 1.15,
                                borderRadius: '6px',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                transition: 'background-color 0.15s ease',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                                },
                            }}
                        >
                            {/* Left column: Stat label */}
                            <Typography
                                sx={{
                                    color: '#ffffff',
                                    fontSize: 13.5,
                                    fontWeight: 600,
                                    letterSpacing: '0.2px',
                                }}
                            >
                                {item.label}
                            </Typography>

                            {/* Right column: Stat value */}
                            {item.isXp ? (
                                <Typography
                                    sx={{
                                        color: '#00e676',
                                        fontSize: 13.5,
                                        fontWeight: 700,
                                        letterSpacing: '0.2px',
                                    }}
                                >
                                    {item.value}
                                </Typography>
                            ) : (
                                <Box
                                    sx={{
                                        bgcolor: 'rgba(0, 0, 0, 0.45)',
                                        color: '#00e676',
                                        fontSize: 13,
                                        fontWeight: 800,
                                        minWidth: 28,
                                        px: 0.9,
                                        py: 0.25,
                                        borderRadius: '4px',
                                        textAlign: 'center',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid rgba(0, 230, 118, 0.2)',
                                    }}
                                >
                                    {item.value}
                                </Box>
                            )}
                        </Box>
                    ))}
                </Box>
            </Box>
        </>
    );
};

export default PlayerStatsRow;

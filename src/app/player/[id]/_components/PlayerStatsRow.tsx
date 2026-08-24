'use client';

import React from 'react';
import { Box } from '@mui/material';
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
    xpLoading: boolean;
    displayXp: number;
    getCms?: (key: string, fallback: string) => string;
}

export const PlayerStatsRow: React.FC<PlayerStatsRowProps> = ({
    displayedStatsMatches,
    displayedStatsTotals,
    displayedMotmVotes,
    displayedDefensiveImpact,
    xpLoading,
    displayXp,
    getCms,
}) => {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: 'repeat(3, minmax(0, 1fr))',
                    sm: 'repeat(7, minmax(0, 1fr))',
                },
                columnGap: 0,
                rowGap: { xs: 1.2, sm: 2 },
                mt: { xs: 1.5, sm: 2, md: 2.5 },
                mb: { xs: 2, sm: 3 },
                width: '100%',
            }}
        >
            <StatItem label={getCms ? getCms('page_player_stats_label_apps', 'APPS') : 'APPS'} value={displayedStatsMatches} />
            <StatItem label={getCms ? getCms('page_player_stats_label_goals', 'GOALS') : 'GOALS'} value={displayedStatsTotals.goals} />
            <StatItem label={getCms ? getCms('page_player_stats_label_assists', 'ASSISTS') : 'ASSISTS'} value={displayedStatsTotals.assists} />
            <StatItem label={getCms ? getCms('page_player_stats_label_motm', 'MOTM VOTES') : 'MOTM VOTES'} value={displayedMotmVotes} />
            <StatItem label={getCms ? getCms('page_player_stats_label_defensive', 'DEFENSIVE IMP.') : 'DEFENSIVE IMP.'} value={displayedDefensiveImpact} />
            <StatItem label={getCms ? getCms('page_player_stats_label_cleansheet', 'CLEAN SHEET') : 'CLEAN SHEET'} value={displayedStatsTotals.cleanSheets} />
            <StatItem label={getCms ? getCms('page_player_stats_label_totalxp', 'TOTAL XP') : 'TOTAL XP'} value={xpLoading ? '...' : `${Math.max(0, displayXp).toLocaleString()} xp`} />
        </Box>
    );
};

export default PlayerStatsRow;

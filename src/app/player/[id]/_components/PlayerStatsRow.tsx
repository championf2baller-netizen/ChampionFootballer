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
}

export const PlayerStatsRow: React.FC<PlayerStatsRowProps> = ({
    displayedStatsMatches,
    displayedStatsTotals,
    displayedMotmVotes,
    displayedDefensiveImpact,
    xpLoading,
    displayXp,
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
            <StatItem label="APPS" value={displayedStatsMatches} />
            <StatItem label="GOALS" value={displayedStatsTotals.goals} />
            <StatItem label="ASSISTS" value={displayedStatsTotals.assists} />
            <StatItem label="MOTM VOTES" value={displayedMotmVotes} />
            <StatItem label="DEFENSIVE IMP." value={displayedDefensiveImpact} />
            <StatItem label="CLEAN SHEET" value={displayedStatsTotals.cleanSheets} />
            <StatItem label="TOTAL XP" value={xpLoading ? '...' : `${Math.max(0, displayXp).toLocaleString()} xp`} />
        </Box>
    );
};

export default PlayerStatsRow;

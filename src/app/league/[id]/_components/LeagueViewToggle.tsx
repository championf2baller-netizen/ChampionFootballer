'use client';

import React from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';

export type LeagueViewType = 'table' | 'leaderboard' | 'dream-team';

export interface LeagueViewToggleProps {
    activeView: LeagueViewType | string;
    onSelectView: (view: LeagueViewType) => void;
    sx?: any;
}

export const LeagueViewToggle: React.FC<LeagueViewToggleProps> = ({
    activeView,
    onSelectView,
    sx,
}) => {
    const views: Array<{ id: LeagueViewType; label: string }> = [
        { id: 'table', label: 'Table' },
        { id: 'leaderboard', label: 'Leaderboard' },
        { id: 'dream-team', label: 'Dream Team' },
    ];

    // Normalize activeView so that if section is not leaderboard or dream-team, 'table' is active
    const normalizedActive: LeagueViewType =
        activeView === 'leaderboard' ? 'leaderboard' :
        activeView === 'dream-team' ? 'dream-team' : 'table';

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: { xs: '100%', sm: 480, md: 520 },
                mx: 'auto',
                mb: 2.2,
                mt: { xs: 1.5, sm: 2 },
                bgcolor: '#2f333a',
                borderRadius: '8px',
                p: '4px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '4px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                boxSizing: 'border-box',
                ...sx,
            }}
        >
            {views.map((v) => {
                const isActive = normalizedActive === v.id;
                return (
                    <ButtonBase
                        key={v.id}
                        onClick={() => onSelectView(v.id)}
                        sx={{
                            py: { xs: 0.9, sm: 1.1 },
                            px: { xs: 0.6, sm: 1.5 },
                            borderRadius: '6px',
                            bgcolor: isActive ? '#00a77f' : 'transparent',
                            color: isActive ? '#ffffff' : '#c3c6cb',
                            fontWeight: isActive ? 700 : 500,
                            fontSize: { xs: 12.5, sm: 13, md: 13.5 },
                            letterSpacing: '0.2px',
                            transition: 'all 0.18s ease',
                            '&:hover': {
                                bgcolor: isActive ? '#00b58a' : 'rgba(255, 255, 255, 0.08)',
                                color: '#ffffff',
                            },
                        }}
                    >
                        <Typography
                            noWrap
                            sx={{
                                fontSize: 'inherit',
                                fontWeight: 'inherit',
                                color: 'inherit',
                                textAlign: 'center',
                                fontFamily: 'inherit',
                            }}
                        >
                            {v.label}
                        </Typography>
                    </ButtonBase>
                );
            })}
        </Box>
    );
};

export default LeagueViewToggle;

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
        { id: 'table', label: 'TABLE' },
        { id: 'leaderboard', label: 'LEADERBOARD' },
        { id: 'dream-team', label: 'DREAM TEAM' },
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
                bgcolor: '#121316',
                border: '1px solid #22242a',
                borderRadius: '16px',
                p: '4px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '4px',
                boxShadow: 'none',
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
                            borderRadius: '12px',
                            border: isActive ? '1.5px solid #22c55e' : '1.5px solid transparent',
                            bgcolor: isActive ? 'rgba(34, 197, 94, 0.04)' : 'transparent',
                            color: isActive ? '#ffffff' : '#717d8f',
                            fontWeight: isActive ? 700 : 600,
                            fontSize: { xs: 12, sm: 13, md: 13.5 },
                            letterSpacing: '0.8px',
                            textTransform: 'uppercase',
                            transition: 'all 0.18s ease',
                            '&:hover': {
                                bgcolor: isActive ? 'rgba(34, 197, 94, 0.08)' : '#18191e',
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
                                letterSpacing: 'inherit',
                                textTransform: 'uppercase',
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

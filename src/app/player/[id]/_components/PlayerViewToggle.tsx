'use client';

import React from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';

export type PlayerViewType = 'overview' | 'performance' | 'stats';

export interface PlayerViewToggleProps {
    activeView: PlayerViewType;
    onSelectView: (view: PlayerViewType) => void;
    sx?: any;
}

export const PlayerViewToggle: React.FC<PlayerViewToggleProps> = ({
    activeView,
    onSelectView,
    sx,
}) => {
    const views: Array<{ id: PlayerViewType; label: string }> = [
        { id: 'overview', label: 'Overview' },
        { id: 'performance', label: 'Performance' },
        { id: 'stats', label: 'Stats / Season' },
    ];

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: { xs: '100%', sm: 480, md: 520 },
                mx: 'auto',
                mb: 2.2,
                mt: { xs: 0.5, md: 0 },
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
                const isActive = activeView === v.id;
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
                            fontSize: { xs: 12, sm: 13, md: 13.5 },
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

export default PlayerViewToggle;

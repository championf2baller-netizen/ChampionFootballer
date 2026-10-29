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
                bgcolor: '#121316',
                border: '1px solid #22242a',
                borderRadius: '16px',
                p: '4px',
                display: { xs: 'grid', md: 'none' },
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '4px',
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
                            borderRadius: '12px',
                            border: isActive ? '1.5px solid #22c55e' : '1.5px solid transparent',
                            bgcolor: isActive ? 'rgba(34, 197, 94, 0.04)' : 'transparent',
                            color: isActive ? '#ffffff' : '#717d8f',
                            fontWeight: isActive ? 700 : 600,
                            fontSize: { xs: 12, sm: 13, md: 14 },
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-woodford-bourne-pro), sans-serif',
                            transition: 'all 0.18s ease',
                            cursor: 'pointer',
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

export default PlayerViewToggle;

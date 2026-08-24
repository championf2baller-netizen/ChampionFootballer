'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

export interface PlayerTabsNavProps {
    activeTab: string;
    onTabClick: (tab: string) => void;
    isMobile: boolean;
    getCms?: (key: string, fallback: string) => string;
}

export const PlayerTabsNav: React.FC<PlayerTabsNavProps> = ({
    activeTab,
    onTabClick,
    isMobile,
    getCms,
}) => {
    const tabs = ['current', 'career', 'trophies', 'rewards', 'history'];

    const getTabLabel = (tab: string) => {
        const fallback = tab === 'current' ? 'Current' : tab === 'career' ? (isMobile ? 'Career' : 'Career Stats') : tab === 'trophies' ? 'Trophies' : tab === 'rewards' ? 'Rewards' : tab === 'history' ? 'History' : tab.charAt(0).toUpperCase() + tab.slice(1);
        if (!getCms) return fallback;
        const key = `page_player_stats_tab_${tab}`;
        return getCms(key, fallback);
    };

    return (
        <Box sx={{
            mb: 3,
            display: 'flex',
            flexWrap: 'nowrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%',
            gap: { xs: 0.6, md: 3 },
            mt: { xs: 1.5, sm: 2.5, md: 7.5 },
        }}>
            {tabs.map(tab => (
                <Box
                    key={tab}
                    onClick={() => onTabClick(tab)}
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        textAlign: 'center',
                        cursor: 'pointer',
                        pb: 1,
                    }}
                >
                    <Typography
                        variant="inherit"
                        sx={{
                            color: '#fff',
                            fontWeight: 500,
                            fontSize: { xs: '11px !important', sm: '16px !important', md: '26px !important' },
                            textTransform: 'capitalize',
                            lineHeight: 1.15,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {getTabLabel(tab)}
                    </Typography>
                    {/* Underline Box */}
                    <Box sx={{
                        width: { xs: '58%', md: '70%' },
                        height: { xs: '3px', md: '6px' },
                        bgcolor: activeTab === tab ? '#00a780' : '#555',
                        mt: 1,
                        mx: 'auto',
                    }} />
                </Box>
            ))}
        </Box>
    );
};

export default PlayerTabsNav;

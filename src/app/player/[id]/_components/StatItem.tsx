'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

export interface StatItemProps {
    label: string;
    value: string | number;
}

export const StatItem: React.FC<StatItemProps> = ({ label, value }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', minWidth: 0 }}>
            <Box sx={{ width: '100%', borderBottom: '1px solid rgba(255, 255, 255, 0.25)', pb: 0.2, mb: 0.3 }}>
                <Typography sx={{
                    color: '#ffffff',
                    fontSize: { xs: 10, sm: 11, md: 13, lg: 15 },
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    pr: { xs: 0.8, sm: 1, md: 1.5 },
                }}>
                    {label.toUpperCase()}
                </Typography>
            </Box>
            <Typography sx={{ color: '#00a780', fontSize: { xs: 14, sm: 15, md: 17, lg: 18 }, fontWeight: 700, whiteSpace: 'nowrap', pr: { xs: 0.8, sm: 1, md: 1.5 } }}>
                {value ?? 0}
            </Typography>
        </Box>
    );
};

export default StatItem;

'use client';

import React from 'react';
import { Paper, Box, Typography, CircularProgress, Grid } from '@mui/material';

export interface PlayerBadgeItem {
    id: string;
    title: string;
    count: number;
    xp: number;
    unlocked: boolean;
}

export interface RewardsCardProps {
    activeTab: string;
    rewardsCardRef: React.RefObject<HTMLDivElement | null>;
    badgesLoading: boolean;
    playerBadges: PlayerBadgeItem[];
    CARD_BG: string;
    TEAL_PRIMARY: string;
    getCms?: (key: string, fallback: string) => string;
}

export const RewardsCard: React.FC<RewardsCardProps> = ({
    activeTab,
    rewardsCardRef,
    badgesLoading,
    playerBadges,
    CARD_BG,
    TEAL_PRIMARY,
    getCms,
}) => {
    return (
        <Grid
            item
            xs={12}
            md={4}
            ref={rewardsCardRef}
            sx={{ display: 'flex', scrollMarginTop: { xs: '84px', md: 0 } }}
        >
            <Paper sx={{
                bgcolor: CARD_BG,
                p: 2.5,
                border: activeTab === 'rewards' ? `3px solid ${TEAL_PRIMARY}` : '1px solid #fff',
                transition: 'border 0.3s ease',
                boxSizing: 'border-box',
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Typography sx={{
                    color: '#fff',
                    fontSize: 18,
                    fontWeight: 600,
                    mb: 2,
                    textAlign: 'center',
                    mt: -1,
                    fontFamily: 'var(--font-woodford-bourne-pro)',
                }}>
                    {getCms ? getCms('page_player_stats_rewards_title', 'Rewards XP') : 'Rewards XP'}
                </Typography>
                {badgesLoading ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <CircularProgress size={24} sx={{ color: TEAL_PRIMARY }} />
                    </Box>
                ) : playerBadges.length === 0 ? (
                    <Typography sx={{ color: '#999', textAlign: 'center', py: 3, fontSize: 13 }}>
                        {getCms ? getCms('page_player_stats_rewards_empty', 'No rewards earned yet') : 'No rewards earned yet'}
                    </Typography>
                ) : (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        maxHeight: 156,
                        overflowY: 'auto',
                        pr: 1,
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            background: 'rgba(255,255,255,0.3)',
                        }
                    }}>
                        {playerBadges.map((badge) => (
                            <Box key={badge.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ color: '#ccc', fontSize: 13 }}>
                                    {badge.count}x {badge.title}
                                </Typography>
                                <Typography sx={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>
                                    {(badge.count * badge.xp).toLocaleString()}xp
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                )}
            </Paper>
        </Grid>
    );
};

export default RewardsCard;

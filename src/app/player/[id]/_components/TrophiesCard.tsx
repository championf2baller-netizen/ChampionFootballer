'use client';

import React from 'react';
import { Paper, Box, Typography, CircularProgress, Grid } from '@mui/material';
import Image, { StaticImageData } from 'next/image';

export interface EarnedTrophy {
    key: string;
    image: StaticImageData;
    label: string;
    count: number;
}

export interface TrophiesCardProps {
    activeTab: string;
    trophiesCardRef: React.RefObject<HTMLDivElement | null>;
    trophiesLoading: boolean;
    earnedTrophies: EarnedTrophy[];
    CARD_BG: string;
    TEAL_PRIMARY: string;
    TROPHY_ICON_FRAME_SIZE: number;
    getTrophyIconSize: (label: string) => number;
    getCms?: (key: string, fallback: string) => string;
}

export const TrophiesCard: React.FC<TrophiesCardProps> = ({
    activeTab,
    trophiesCardRef,
    trophiesLoading,
    earnedTrophies,
    CARD_BG,
    TEAL_PRIMARY,
    TROPHY_ICON_FRAME_SIZE,
    getTrophyIconSize,
    getCms,
}) => {
    return (
        <Grid
            item
            xs={12}
            md={4}
            ref={trophiesCardRef}
            sx={{ display: 'flex', scrollMarginTop: { xs: '84px', md: 0 } }}
        >
            <Paper sx={{
                bgcolor: CARD_BG,
                p: 2.5,
                border: activeTab === 'trophies' ? `3px solid ${TEAL_PRIMARY}` : '1px solid #fff',
                transition: 'border 0.3s ease',
                boxSizing: 'border-box',
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography sx={{
                        color: '#fff',
                        fontSize: 18,
                        fontWeight: 600,
                        mb: 2,
                        textAlign: 'center',
                        mt: -1,
                        fontFamily: 'var(--font-woodford-bourne-pro)',
                    }}>
                        {getCms ? getCms('page_player_stats_trophies_title', 'Trophies & Awards') : 'Trophies & Awards'}
                    </Typography>
                </Box>
                {trophiesLoading ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <CircularProgress size={24} sx={{ color: TEAL_PRIMARY }} />
                    </Box>
                ) : earnedTrophies.length === 0 ? (
                    <Typography sx={{ color: '#999', textAlign: 'center', py: 3, fontSize: 13 }}>
                        {getCms ? getCms('page_player_stats_trophies_empty', 'No trophies yet') : 'No trophies yet'}
                    </Typography>
                ) : (
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-start',
                        gap: 2
                    }}>
                        {earnedTrophies.map((t) => (
                            <Box key={t.key} sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 0.5
                            }}>
                                <Box
                                    sx={{
                                        width: TROPHY_ICON_FRAME_SIZE,
                                        height: TROPHY_ICON_FRAME_SIZE,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Image
                                        src={t.image}
                                        alt={t.label}
                                        width={getTrophyIconSize(t.label)}
                                        height={getTrophyIconSize(t.label)}
                                        style={{
                                            objectFit: 'contain',
                                            filter: 'none'
                                        }}
                                    />
                                </Box>
                                <Typography sx={{
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: 16,
                                    lineHeight: 1,
                                    mb: -0.5,
                                    ml: -0.2
                                }}>
                                    {t.count}
                                </Typography>
                                <Box sx={{
                                    width: 10,
                                    height: 1.5,
                                    bgcolor: '#fff'
                                }} />
                            </Box>
                        ))}
                    </Box>
                )}
            </Paper>
        </Grid>
    );
};

export default TrophiesCard;

'use client';

import React from 'react';
import { Paper, Box, Typography, CircularProgress, Grid } from '@mui/material';

export interface HistoryRecordsData {
    longestWinStreak: number;
    mostGoalsInLeague: number;
    mostMotmInLeague: number;
    longestWinMargin: string;
    highestXpInLeague: number;
}

export interface HistoryCardProps {
    activeTab: string;
    historyCardRef: React.RefObject<HTMLDivElement | null>;
    historyRecordsLoading: boolean;
    historyRecords: HistoryRecordsData;
    historyXpLabel: string;
    CARD_BG: string;
    TEAL_PRIMARY: string;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({
    activeTab,
    historyCardRef,
    historyRecordsLoading,
    historyRecords,
    historyXpLabel,
    CARD_BG,
    TEAL_PRIMARY,
}) => {
    return (
        <Grid
            item
            xs={12}
            md={4}
            ref={historyCardRef}
            sx={{ display: 'flex', scrollMarginTop: { xs: '84px', md: 0 } }}
        >
            <Paper sx={{
                bgcolor: CARD_BG,
                p: 2.5,
                border: activeTab === 'history' ? `3px solid ${TEAL_PRIMARY}` : '1px solid #fff',
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
                    History & Records
                </Typography>
                {historyRecordsLoading ? (
                    <Box sx={{ display: 'flex', flex: 1, minHeight: 156, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1.25 }}>
                        <CircularProgress size={26} sx={{ color: TEAL_PRIMARY }} />
                        <Typography sx={{ color: '#aaa', fontSize: 13 }}>
                            Loading history...
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, position: 'relative', pl: 2.5 }}>
                        {/* Vertical line */}
                        <Box sx={{
                            position: 'absolute',
                            left: 4,
                            top: 8,
                            bottom: 8,
                            width: 2,
                            bgcolor: '#00a77f',
                            borderRadius: 1,
                        }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                            <Box sx={{ position: 'absolute', left: -19, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', bgcolor: '#00a77f' }} />
                            <Typography sx={{ color: '#ccc', fontSize: 13 }}>Longest Win Streak</Typography>
                            <Typography sx={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>
                                {historyRecords.longestWinStreak}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                            <Box sx={{ position: 'absolute', left: -19, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', bgcolor: '#00a77f' }} />
                            <Typography sx={{ color: '#ccc', fontSize: 13 }}>Most Goals Scored In A League</Typography>
                            <Typography sx={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>
                                {historyRecords.mostGoalsInLeague}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                            <Box sx={{ position: 'absolute', left: -19, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', bgcolor: '#00a77f' }} />
                            <Typography sx={{ color: '#ccc', fontSize: 13 }}>Most MOTM Votes Received In A League</Typography>
                            <Typography sx={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>
                                {historyRecords.mostMotmInLeague}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                            <Box sx={{ position: 'absolute', left: -19, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', bgcolor: '#00a77f' }} />
                            <Typography sx={{ color: '#ccc', fontSize: 13 }}>Largest Win Margin</Typography>
                            <Typography sx={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>
                                {historyRecords.longestWinMargin}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                            <Box sx={{ position: 'absolute', left: -19, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', bgcolor: '#00a77f' }} />
                            <Typography sx={{ color: '#ccc', fontSize: 13 }}>{historyXpLabel}</Typography>
                            <Typography sx={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>
                                {historyRecords.highestXpInLeague.toLocaleString()}
                            </Typography>
                        </Box>
                    </Box>
                )}
            </Paper>
        </Grid>
    );
};

export default HistoryCard;

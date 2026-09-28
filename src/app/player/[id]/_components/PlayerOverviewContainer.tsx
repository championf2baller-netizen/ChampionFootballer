'use client';

import React from 'react';
import { Container, Box, CircularProgress, Typography, Button } from '@mui/material';
import PlayerProfileHeader, { PageXpTier } from './PlayerProfileHeader';
import PlayerTabsNav from './PlayerTabsNav';
import PlayerStatsRow from './PlayerStatsRow';
import PlayerCardsSection from './PlayerCardsSection';
import { EarnedTrophy } from './TrophiesCard';
import { PlayerBadgeItem } from './RewardsCard';
import { HistoryRecordsData } from './HistoryCard';

export interface PlayerOverviewContainerProps {
    loading: boolean;
    reduxError: string | null;
    playerId: string | null;
    leagueId?: string;
    year?: string;
    onRetry: () => void;

    // Header props
    playerName: string;
    playerPositionType: string;
    profileAvatarSrc: string | null;
    xp: number;
    xpLoading: boolean;
    pageXpStatusTier: PageXpTier;
    pageXpStatusTextColor: string;
    pageXpProgressToMax: number;
    PAGE_XP_MAX_POINTS: number;
    isMobile: boolean;
    onOpenStatsModal: () => void;
    onNavigateCareer: () => void;

    // Tabs props
    activeTab: string;
    onTabClick: (tab: string) => void;

    // Stats row props
    displayedStatsMatches: number;
    displayedStatsTotals: {
        goals: number;
        assists: number;
        cleanSheets: number;
    };
    displayedMotmVotes: number;
    displayedDefensiveImpact: number;
    displayXp: number;

    // Cards section props
    CARD_BG: string;
    TEAL_PRIMARY: string;
    trophiesCardRef: React.RefObject<HTMLDivElement | null>;
    trophiesLoading: boolean;
    earnedTrophies: EarnedTrophy[];
    TROPHY_ICON_FRAME_SIZE: number;
    getTrophyIconSize: (label: string) => number;
    rewardsCardRef: React.RefObject<HTMLDivElement | null>;
    badgesLoading: boolean;
    playerBadges: PlayerBadgeItem[];
    historyCardRef: React.RefObject<HTMLDivElement | null>;
    historyRecordsLoading: boolean;
    historyRecords: HistoryRecordsData;
    historyXpLabel: string;
    getCms?: (key: string, fallback: string) => string;
}

export const PlayerOverviewContainer: React.FC<PlayerOverviewContainerProps> = ({
    loading,
    reduxError,
    playerId,
    onRetry,
    playerName,
    playerPositionType,
    profileAvatarSrc,
    xp,
    xpLoading,
    pageXpStatusTier,
    pageXpStatusTextColor,
    pageXpProgressToMax,
    PAGE_XP_MAX_POINTS,
    isMobile,
    onOpenStatsModal,
    onNavigateCareer,
    activeTab,
    onTabClick,
    displayedStatsMatches,
    displayedStatsTotals,
    displayedMotmVotes,
    displayedDefensiveImpact,
    displayXp,
    CARD_BG,
    TEAL_PRIMARY,
    trophiesCardRef,
    trophiesLoading,
    earnedTrophies,
    TROPHY_ICON_FRAME_SIZE,
    getTrophyIconSize,
    rewardsCardRef,
    badgesLoading,
    playerBadges,
    historyCardRef,
    historyRecordsLoading,
    historyRecords,
    historyXpLabel,
    getCms,
}) => {
    return (
        <Container maxWidth={false} sx={{ bgcolor: { xs: 'transparent', md: '#383838' }, py: { xs: 2.2, md: 3 }, px: { xs: 1.3, sm: 2, md: 3.5 }, maxWidth: 1165, mx: 'auto', borderRadius: 2, mb: 5, position: 'relative', zIndex: 1 }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                    <CircularProgress size={40} sx={{ color: '#00ff88' }} />
                </Box>
            ) : reduxError ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 2 }}>
                    <Typography sx={{ color: '#ff6b6b', fontSize: 16, fontWeight: 700 }}>Error Loading Data</Typography>
                    <Typography sx={{ color: '#fff', fontSize: 14 }}>{reduxError}</Typography>
                    <Button
                        variant="contained"
                        onClick={onRetry}
                        sx={{ background: TEAL_PRIMARY, '&:hover': { background: '#099968' } }}
                    >
                        Retry
                    </Button>
                </Box>
            ) : (
                <>
                    {/* Header: Player Profile */}
                    <PlayerProfileHeader
                        playerName={playerName}
                        playerPositionType={playerPositionType}
                        profileAvatarSrc={profileAvatarSrc}
                        xp={xp}
                        xpLoading={xpLoading}
                        pageXpStatusTier={pageXpStatusTier}
                        pageXpStatusTextColor={pageXpStatusTextColor}
                        pageXpProgressToMax={pageXpProgressToMax}
                        PAGE_XP_MAX_POINTS={PAGE_XP_MAX_POINTS}
                        isMobile={isMobile}
                        playerId={playerId}
                        onOpenStatsModal={onOpenStatsModal}
                        onNavigateCareer={onNavigateCareer}
                    />

                    {/* Tabs Navigation */}
                    <PlayerTabsNav
                        activeTab={activeTab}
                        onTabClick={onTabClick}
                        isMobile={isMobile}
                        getCms={getCms}
                    />

                    {/* Stats Row */}
                    <PlayerStatsRow
                        displayedStatsMatches={displayedStatsMatches}
                        displayedStatsTotals={displayedStatsTotals}
                        displayedMotmVotes={displayedMotmVotes}
                        displayedDefensiveImpact={displayedDefensiveImpact}
                        xpLoading={xpLoading}
                        displayXp={displayXp}
                        getCms={getCms}
                    />

                    {/* Three Cards Section */}
                    <PlayerCardsSection
                        activeTab={activeTab}
                        CARD_BG={CARD_BG}
                        TEAL_PRIMARY={TEAL_PRIMARY}
                        trophiesCardRef={trophiesCardRef}
                        trophiesLoading={trophiesLoading}
                        earnedTrophies={earnedTrophies}
                        TROPHY_ICON_FRAME_SIZE={TROPHY_ICON_FRAME_SIZE}
                        getTrophyIconSize={getTrophyIconSize}
                        rewardsCardRef={rewardsCardRef}
                        badgesLoading={badgesLoading}
                        playerBadges={playerBadges}
                        historyCardRef={historyCardRef}
                        historyRecordsLoading={historyRecordsLoading}
                        historyRecords={historyRecords}
                        historyXpLabel={historyXpLabel}
                        getCms={getCms}
                    />
                </>
            )}
        </Container>
    );
};

export default PlayerOverviewContainer;

'use client';

import React from 'react';
import { Grid } from '@mui/material';
import TrophiesCard, { EarnedTrophy } from './TrophiesCard';
import RewardsCard, { PlayerBadgeItem } from './RewardsCard';
import HistoryCard, { HistoryRecordsData } from './HistoryCard';

export interface PlayerCardsSectionProps {
    activeTab: string;
    CARD_BG: string;
    TEAL_PRIMARY: string;
    // Trophies props
    trophiesCardRef: React.RefObject<HTMLDivElement | null>;
    trophiesLoading: boolean;
    earnedTrophies: EarnedTrophy[];
    TROPHY_ICON_FRAME_SIZE: number;
    getTrophyIconSize: (label: string) => number;
    // Rewards props
    rewardsCardRef: React.RefObject<HTMLDivElement | null>;
    badgesLoading: boolean;
    playerBadges: PlayerBadgeItem[];
    // History props
    historyCardRef: React.RefObject<HTMLDivElement | null>;
    historyRecordsLoading: boolean;
    historyRecords: HistoryRecordsData;
    historyXpLabel: string;
    getCms?: (key: string, fallback: string) => string;
}

export const PlayerCardsSection: React.FC<PlayerCardsSectionProps> = ({
    activeTab,
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
        <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
            <TrophiesCard
                activeTab={activeTab}
                trophiesCardRef={trophiesCardRef}
                trophiesLoading={trophiesLoading}
                earnedTrophies={earnedTrophies}
                CARD_BG={CARD_BG}
                TEAL_PRIMARY={TEAL_PRIMARY}
                TROPHY_ICON_FRAME_SIZE={TROPHY_ICON_FRAME_SIZE}
                getTrophyIconSize={getTrophyIconSize}
                getCms={getCms}
            />
            <RewardsCard
                activeTab={activeTab}
                rewardsCardRef={rewardsCardRef}
                badgesLoading={badgesLoading}
                playerBadges={playerBadges}
                CARD_BG={CARD_BG}
                TEAL_PRIMARY={TEAL_PRIMARY}
                getCms={getCms}
            />
            <HistoryCard
                activeTab={activeTab}
                historyCardRef={historyCardRef}
                historyRecordsLoading={historyRecordsLoading}
                historyRecords={historyRecords}
                historyXpLabel={historyXpLabel}
                CARD_BG={CARD_BG}
                TEAL_PRIMARY={TEAL_PRIMARY}
                getCms={getCms}
            />
        </Grid>
    );
};

export default PlayerCardsSection;

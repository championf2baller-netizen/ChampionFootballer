import React from 'react';
import { Box, Skeleton } from '@mui/material';

type AllPlayersLoadingSkeletonProps = {
  compact?: boolean;
};

export default function AllPlayersLoadingSkeleton({ compact = false }: AllPlayersLoadingSkeletonProps) {
  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      {Array.from({ length: compact ? 6 : 8 }).map((_, idx) => {
        const isEven = idx % 2 === 0;
        return (
          <Box
            key={idx}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: { xs: 2, sm: 3 },
              py: { xs: 1.2, sm: 1.6 },
              backgroundColor: isEven ? '#383838' : '#2b2b2b',
              minHeight: { xs: '58px', sm: '72px' },
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {/* Avatar + Name */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Skeleton
                variant="circular"
                width={40}
                height={40}
                sx={{ bgcolor: 'rgba(255,255,255,0.12)', flexShrink: 0 }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Skeleton variant="text" width={110} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
                <Skeleton variant="text" width={60} height={14} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
              </Box>
            </Box>

            {/* Stats Placeholders */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 4 } }}>
              <Skeleton variant="text" width={30} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
              <Skeleton variant="text" width={30} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
              <Skeleton variant="text" width={40} height={22} sx={{ bgcolor: 'rgba(249,115,22,0.3)' }} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

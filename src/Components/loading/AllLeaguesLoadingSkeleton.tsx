import React from 'react';
import { Box, Card, Skeleton } from '@mui/material';

type AllLeaguesLoadingSkeletonProps = {
  compact?: boolean;
};

export default function AllLeaguesLoadingSkeleton({ compact = false }: AllLeaguesLoadingSkeletonProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
      {Array.from({ length: compact ? 3 : 5 }).map((_, i) => (
        <Card
          key={i}
          sx={{
            background: '#1e1e1e',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 2,
            p: { xs: 2, sm: 2.5 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            boxShadow: 'none',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Skeleton variant="circular" width={52} height={52} sx={{ bgcolor: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, width: '100%', maxWidth: 280 }}>
              <Skeleton variant="text" width="80%" height={26} sx={{ bgcolor: 'rgba(255,255,255,0.18)' }} />
              <Skeleton variant="text" width="45%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Skeleton variant="rectangular" width={70} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={85} height={36} sx={{ bgcolor: 'rgba(225,100,25,0.3)', borderRadius: 1 }} />
          </Box>
        </Card>
      ))}
    </Box>
  );
}

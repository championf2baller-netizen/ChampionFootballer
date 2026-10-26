import React from 'react';
import { Box, Card, CardContent, Skeleton } from '@mui/material';

type AllMatchesLoadingSkeletonProps = {
  compact?: boolean;
};

export default function AllMatchesLoadingSkeleton({ compact = false }: AllMatchesLoadingSkeletonProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        },
        gap: { xs: 2, sm: 2.5, md: 3 },
        width: '100%',
      }}
    >
      {Array.from({ length: compact ? 3 : 6 }).map((_, i) => (
        <Card
          key={i}
          sx={{
            width: '100%',
            maxWidth: { xs: 420, sm: 'none' },
            mx: { xs: 'auto', sm: 0 },
            borderRadius: 1,
            overflow: 'hidden',
            background: '#222',
            border: '1px solid rgba(255,255,255,0.4)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'none',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: '#2a2a2a',
              py: 0.9,
              px: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <Skeleton
              variant="text"
              width={100}
              height={22}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
            />
          </Box>

          <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Result text placeholder */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Skeleton
                variant="text"
                width={140}
                height={16}
                sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
              />
            </Box>

            {/* Teams & Score */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 1,
              }}
            >
              {/* Home */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, flex: 1 }}>
                <Skeleton variant="circular" width={42} height={42} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
                <Skeleton variant="text" width={65} height={16} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
              </Box>

              {/* Score pill */}
              <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#333', borderRadius: 1 }}>
                <Skeleton variant="text" width={32} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
              </Box>

              {/* Away */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, flex: 1 }}>
                <Skeleton variant="circular" width={42} height={42} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
                <Skeleton variant="text" width={65} height={16} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

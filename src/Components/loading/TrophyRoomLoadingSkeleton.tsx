import React from 'react';
import { Box, Paper, Skeleton } from '@mui/material';

export default function TrophyRoomLoadingSkeleton() {
  return (
    <Box sx={{ maxWidth: '783px', mx: 'auto', px: { xs: 2, sm: 3 } }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.22)',
          bgcolor: '#1a1a1f',
          mb: 4,
        }}
      >
        {/* Banner */}
        <Box sx={{ bgcolor: '#E1641A', py: { xs: 1, sm: 1.2 }, px: 2, display: 'flex', justifyContent: 'center' }}>
          <Skeleton variant="text" width={180} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
        </Box>

        {/* Trophies Grid Shell */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: { xs: 2, sm: 3 },
              pb: 2,
              borderBottom: '1px solid rgba(255,255,255,0.2)',
              mb: 3,
            }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Skeleton variant="circular" width={48} height={48} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
                <Skeleton variant="text" width="70%" height={18} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
                <Skeleton variant="text" width="40%" height={14} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: { xs: 2, sm: 3 },
            }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Skeleton variant="circular" width={48} height={48} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
                <Skeleton variant="text" width="70%" height={18} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
                <Skeleton variant="text" width="40%" height={14} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

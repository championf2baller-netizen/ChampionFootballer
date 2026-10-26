import React from 'react';
import { Box, Paper, Skeleton } from '@mui/material';

export default function RewardsLoadingSkeleton({ count = 10 }: { count?: number }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        columnGap: { xs: 1, sm: 1.5, md: 1.2 },
        rowGap: { xs: 2, sm: 3, md: 3 },
        justifyContent: 'center',
        alignItems: 'stretch',
        width: '100%',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          sx={{
            height: '100%',
            width: {
              xs: 'calc(50% - 8px)',
              sm: 'calc(33.33% - 12px)',
              md: 'calc(20% - 8px)',
              lg: 'calc(20% - 8px)',
            },
          }}
        >
          <Paper
            elevation={4}
            sx={{
              width: '100%',
              height: '100%',
              minHeight: { xs: 260, sm: 280, md: 300 },
              maxWidth: { xs: 165, sm: 195, md: 220 },
              margin: '0 auto',
              borderRadius: '6px',
              border: '3px solid #333',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
              px: { xs: 1, sm: 1.5, md: 2 },
              py: { xs: 1.5, sm: 2, md: 2 },
              background: 'linear-gradient(360deg, #182621 0%, #101915 98.75%)',
              boxSizing: 'border-box',
            }}
          >
            {/* Title field */}
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}>
              <Skeleton
                variant="text"
                width="75%"
                height={26}
                sx={{ bgcolor: 'rgba(255,255,255,0.12)' }}
              />
            </Box>

            {/* Medal / Image center field */}
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                my: 2,
              }}
            >
              <Skeleton
                variant="circular"
                width={70}
                height={70}
                sx={{ bgcolor: 'rgba(255,255,255,0.08)' }}
              />
            </Box>

            {/* Bottom XP Footer field */}
            <Box sx={{ width: '100%', mt: 'auto' }}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={32}
                sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}
              />
            </Box>
          </Paper>
        </Box>
      ))}
    </Box>
  );
}

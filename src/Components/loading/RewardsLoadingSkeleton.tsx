import React from 'react';
import { Box, Skeleton } from '@mui/material';

export default function RewardsLoadingSkeleton({ count = 9 }: { count?: number }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: { xs: 0.75, sm: 1.5, md: 2.5 },
        width: '100%',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          sx={{
            height: '100%',
            minHeight: { xs: 135, sm: 185, md: 245 },
            bgcolor: '#121316',
            border: '1px solid #22242a',
            borderRadius: { xs: '10px', sm: '14px', md: '16px' },
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Title */}
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: { xs: 1, sm: 1.6, md: 2.2 }, px: { xs: 0.5, sm: 1.2, md: 2 } }}>
            <Skeleton
              variant="text"
              width="70%"
              height={18}
              sx={{ bgcolor: 'rgba(255,255,255,0.08)' }}
            />
          </Box>

          {/* Medal */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              my: { xs: 0.5, sm: 1, md: 1.5 },
            }}
          >
            <Skeleton
              variant="circular"
              width={48}
              height={48}
              sx={{ bgcolor: 'rgba(255,255,255,0.06)' }}
            />
          </Box>

          {/* Bottom Bar */}
          <Box sx={{ width: '100%', py: { xs: 0.5, sm: 0.8, md: 1.2 }, px: 0.5, bgcolor: '#14161a', borderTop: '1px solid #1c1d22' }}>
            <Skeleton
              variant="rectangular"
              width="65%"
              height={12}
              sx={{ mx: 'auto', bgcolor: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

import { Box, CircularProgress } from '@mui/material';

export default function TrophyRoomLoadingSkeleton() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, minHeight: 300 }}>
      <CircularProgress size={36} sx={{ color: '#00ff88' }} />
    </Box>
  );
}

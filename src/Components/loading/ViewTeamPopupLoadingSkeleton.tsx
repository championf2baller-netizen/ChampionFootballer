import { Box, CircularProgress } from '@mui/material';

export default function ViewTeamPopupLoadingSkeleton() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6, minHeight: 250 }}>
      <CircularProgress size={36} sx={{ color: '#00ff88' }} />
    </Box>
  );
}

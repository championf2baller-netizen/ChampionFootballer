import { Box, CircularProgress } from '@mui/material';

export default function PageLoadingSkeleton() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, minHeight: 400 }}>
      <CircularProgress size={40} sx={{ color: '#00ff88' }} />
    </Box>
  );
}

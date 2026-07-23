import { Box, CircularProgress } from '@mui/material';

interface PlayerCardLoadingSkeletonProps {
  width?: number;
  height?: number;
}

export default function PlayerCardLoadingSkeleton({ width = 260, height = 410 }: PlayerCardLoadingSkeletonProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width, height }}>
      <CircularProgress size={32} sx={{ color: '#00ff88' }} />
    </Box>
  );
}

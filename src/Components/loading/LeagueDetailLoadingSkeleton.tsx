import { Box, CircularProgress } from '@mui/material';

type LeagueDetailLoadingSkeletonProps = {
  mode?: string;
};

export default function LeagueDetailLoadingSkeleton({ mode = 'page' }: LeagueDetailLoadingSkeletonProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, minHeight: 300 }}>
      <CircularProgress size={36} sx={{ color: '#00ff88' }} />
    </Box>
  );
}

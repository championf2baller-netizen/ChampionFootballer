import { Box, CircularProgress } from '@mui/material';

type MatchStatsPopupLoadingSkeletonProps = {
  mode?: string;
};

export default function MatchStatsPopupLoadingSkeleton({ mode = 'stats' }: MatchStatsPopupLoadingSkeletonProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4, minHeight: 180 }}>
      <CircularProgress size={36} sx={{ color: '#00ff88' }} />
    </Box>
  );
}

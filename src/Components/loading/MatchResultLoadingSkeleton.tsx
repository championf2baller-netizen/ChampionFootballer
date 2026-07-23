import { Box, CircularProgress } from '@mui/material';

type MatchResultLoadingSkeletonProps = {
  mode?: string;
};

export default function MatchResultLoadingSkeleton({ mode = 'page' }: MatchResultLoadingSkeletonProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6, minHeight: 250 }}>
      <CircularProgress size={36} sx={{ color: '#00ff88' }} />
    </Box>
  );
}

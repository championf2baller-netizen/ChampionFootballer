import { Box, CircularProgress } from '@mui/material';

type AllMatchesLoadingSkeletonProps = {
  compact?: boolean;
};

export default function AllMatchesLoadingSkeleton({ compact = false }: AllMatchesLoadingSkeletonProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: compact ? 4 : 8, minHeight: compact ? 150 : 300 }}>
      <CircularProgress size={36} sx={{ color: '#00ff88' }} />
    </Box>
  );
}

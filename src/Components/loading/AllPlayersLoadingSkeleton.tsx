import { Box, CircularProgress } from '@mui/material';

type AllPlayersLoadingSkeletonProps = {
  compact?: boolean;
};

export default function AllPlayersLoadingSkeleton({ compact = false }: AllPlayersLoadingSkeletonProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: compact ? 4 : 8, minHeight: compact ? 150 : 300 }}>
      <CircularProgress size={36} sx={{ color: '#00ff88' }} />
    </Box>
  );
}

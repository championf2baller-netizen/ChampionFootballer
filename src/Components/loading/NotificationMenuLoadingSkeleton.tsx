import { Box, CircularProgress } from '@mui/material';

type NotificationMenuLoadingSkeletonProps = {
  itemCount?: number;
};

export default function NotificationMenuLoadingSkeleton({
  itemCount = 4,
}: NotificationMenuLoadingSkeletonProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
      <CircularProgress size={28} sx={{ color: '#00ff88' }} />
    </Box>
  );
}

import { Box, CircularProgress } from '@mui/material';

type EditMatchPopupLoadingSkeletonProps = {
  mode?: string;
};

export default function EditMatchPopupLoadingSkeleton({ mode = 'dialog' }: EditMatchPopupLoadingSkeletonProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4, minHeight: 200 }}>
      <CircularProgress size={36} sx={{ color: '#00ff88' }} />
    </Box>
  );
}

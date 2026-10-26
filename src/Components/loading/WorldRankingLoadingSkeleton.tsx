import React from 'react';
import { Box, TableRow, TableCell, Skeleton } from '@mui/material';

export default function WorldRankingLoadingSkeleton({ rowCount = 8 }: { rowCount?: number }) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, i) => (
        <TableRow key={i} sx={{ '& .MuiTableCell-root': { border: 'none', py: 1.5 } }}>
          <TableCell align="center">
            <Skeleton variant="text" width={20} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.12)', mx: 'auto' }} />
          </TableCell>
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
              <Skeleton variant="text" width={110} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
            </Box>
          </TableCell>
          <TableCell align="center">
            <Skeleton variant="text" width={35} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.1)', mx: 'auto' }} />
          </TableCell>
          <TableCell align="center">
            <Skeleton variant="text" width={25} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.1)', mx: 'auto' }} />
          </TableCell>
          <TableCell align="center">
            <Skeleton variant="text" width={45} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.1)', mx: 'auto' }} />
          </TableCell>
          <TableCell align="center">
            <Skeleton variant="text" width={45} height={20} sx={{ bgcolor: 'rgba(225,100,25,0.3)', mx: 'auto' }} />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

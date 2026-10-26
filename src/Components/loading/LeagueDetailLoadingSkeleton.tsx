import React from 'react';
import { Box, Card, Skeleton } from '@mui/material';

type LeagueDetailLoadingSkeletonProps = {
  mode?: string;
};

export default function LeagueDetailLoadingSkeleton({ mode = 'table' }: LeagueDetailLoadingSkeletonProps) {
  if (mode === 'results' || mode === 'matches') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 860, mx: 'auto', mt: 2 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            sx={{
              background: '#1c1c1c',
              border: '1px solid #333',
              borderRadius: 2,
              p: 2,
              boxShadow: 'none',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                <Skeleton variant="circular" width={44} height={44} sx={{ bgcolor: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
                <Skeleton variant="text" width={120} height={22} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
              </Box>
              <Box sx={{ px: 2, py: 0.8, bgcolor: '#2a2a2a', borderRadius: 1 }}>
                <Skeleton variant="text" width={44} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, justifyContent: 'flex-end' }}>
                <Skeleton variant="text" width={120} height={22} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
                <Skeleton variant="circular" width={44} height={44} sx={{ bgcolor: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
              </Box>
            </Box>
          </Card>
        ))}
      </Box>
    );
  }

  if (mode === 'leaderboard') {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2, mt: 2 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} sx={{ background: '#1c1c1c', border: '1px solid #333', borderRadius: 2, p: 2, boxShadow: 'none' }}>
            <Skeleton variant="text" width="60%" height={24} sx={{ bgcolor: 'rgba(255,255,255,0.15)', mb: 1.5 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 1 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
              <Skeleton variant="text" width="50%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
              <Skeleton variant="text" width={28} height={24} sx={{ bgcolor: 'rgba(249,115,22,0.4)', ml: 'auto' }} />
            </Box>
          </Card>
        ))}
      </Box>
    );
  }

  if (mode === 'members') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 900, mx: 'auto', mt: 2 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} sx={{ background: '#1c1c1c', border: '1px solid #333', borderRadius: 2, p: 1.5, display: 'flex', alignItems: 'center', gap: 2, boxShadow: 'none' }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
            <Skeleton variant="text" width={140} height={22} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
            <Skeleton variant="text" width={60} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.08)', ml: 'auto' }} />
          </Card>
        ))}
      </Box>
    );
  }

  if (mode === 'dream' || mode === 'dream-team') {
    return (
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 700, mx: 'auto', height: 460, bgcolor: '#0d381e', borderRadius: 3, border: '2px solid rgba(255,255,255,0.15)', p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 'none' }}>
        {[3, 4, 3, 1].map((rowSize, rowIdx) => (
          <Box key={rowIdx} sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            {Array.from({ length: rowSize }).map((_, colIdx) => (
              <Box key={colIdx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Skeleton variant="circular" width={46} height={46} sx={{ bgcolor: 'rgba(255,255,255,0.18)' }} />
                <Skeleton variant="text" width={52} height={14} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    );
  }

  // Default: League Table shell & skeleton rows
  return (
    <div className="w-full mx-auto">
      <Card
        sx={{
          background: '#383838',
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: 'none',
          mt: 1.2,
          mb: 4,
          overflow: 'hidden',
        }}
        className="text-white"
      >
        <Box
          sx={{
            width: '100%',
            overflowX: 'auto',
            overflowY: 'auto',
            maxHeight: { xs: '68vh', sm: '70vh', md: '72vh' },
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className="w-full min-w-[640px] sm:min-w-[820px] rounded-lg league-table league-mobile-result-font">
            {/* Table Header Shell */}
            <div className="grid mt-0 grid-cols-[28px_minmax(125px,1fr)_70px_45px_45px_45px_45px_50px_55px_60px] sm:grid-cols-[32px_minmax(180px,1fr)_80px_60px_60px_60px_60px_70px_70px_80px] items-center px-0 py-3 bg-table-header text-black league-header-row league-header-inset font-bold sticky top-0 z-20">
              <div className="text-center league-table-heading" style={{ color: '#000000' }}>#</div>
              <div className="pl-2 sm:pl-3 league-table-heading league-table-heading-left" style={{ color: '#000000' }}>NAME</div>
              <div className="text-center league-table-heading" style={{ color: '#000000' }}>MOTM</div>
              <div className="text-center league-table-heading" style={{ color: '#000000' }}>P</div>
              <div className="text-center league-table-heading" style={{ color: '#000000' }}>W</div>
              <div className="text-center league-table-heading" style={{ color: '#000000' }}>D</div>
              <div className="text-center league-table-heading" style={{ color: '#000000' }}>L</div>
              <div className="text-center league-table-heading" style={{ color: '#000000' }}>GD</div>
              <div className="text-center league-table-heading" style={{ color: '#000000' }}>W%</div>
              <div className="text-center league-table-heading" style={{ color: '#000000' }}>PTS</div>
            </div>
            <div className="w-full border-b border-border" />

            {/* Skeleton Rows */}
            {Array.from({ length: 8 }).map((_, i) => {
              const isEven = i % 2 === 0;
              return (
                <div
                  key={i}
                  className={`grid grid-cols-[28px_minmax(125px,1fr)_70px_45px_45px_45px_45px_50px_55px_60px] sm:grid-cols-[32px_minmax(180px,1fr)_80px_60px_60px_60px_60px_70px_70px_80px] items-center px-0 py-2.5 ${isEven ? 'bg-table-row-even' : 'bg-table-row-odd'} league-row font-bold text-white`}
                >
                  <div className="text-center flex items-center justify-center">
                    <Skeleton variant="text" width={14} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
                  </div>
                  <div className="flex items-center gap-3 pl-2 sm:pl-3">
                    <Skeleton variant="circular" width={38} height={38} sx={{ bgcolor: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
                    <div className="flex flex-col gap-1 w-full max-w-[140px]">
                      <Skeleton variant="text" width="85%" height={18} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
                      <Skeleton variant="text" width="45%" height={14} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
                    </div>
                  </div>
                  <div className="text-center flex justify-center"><Skeleton variant="text" width={18} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} /></div>
                  <div className="text-center flex justify-center"><Skeleton variant="text" width={18} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} /></div>
                  <div className="text-center flex justify-center"><Skeleton variant="text" width={18} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} /></div>
                  <div className="text-center flex justify-center"><Skeleton variant="text" width={18} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} /></div>
                  <div className="text-center flex justify-center"><Skeleton variant="text" width={18} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} /></div>
                  <div className="text-center flex justify-center"><Skeleton variant="text" width={18} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} /></div>
                  <div className="text-center flex justify-center"><Skeleton variant="text" width={24} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} /></div>
                  <div className="text-center flex justify-center"><Skeleton variant="text" width={24} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.18)' }} /></div>
                </div>
              );
            })}
          </div>
        </Box>
      </Card>
    </div>
  );
}

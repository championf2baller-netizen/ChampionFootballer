'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

function JoinLeagueRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = (searchParams?.get('code') || searchParams?.get('inviteCode') || '').trim().toUpperCase();

  useEffect(() => {
    if (code) {
      localStorage.setItem('pendingInviteCode', code);
      sessionStorage.setItem('pendingInviteCode', code);
      router.replace(`/home?inviteCode=${encodeURIComponent(code)}`);
    } else {
      router.replace('/home');
    }
  }, [code, router]);

  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress color="success" />
    </Box>
  );
}

export default function JoinLeaguePage() {
  return (
    <Suspense fallback={
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress color="success" />
      </Box>
    }>
      <JoinLeagueRedirect />
    </Suspense>
  );
}

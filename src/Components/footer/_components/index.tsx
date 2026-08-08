'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography, IconButton, Stack, Divider, Button } from '@mui/material';
import { useAuth } from '@/lib/hooks';
import { logout } from '@/lib/features/authSlice';

const XTwitterIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.891h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

const YouTubeIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TikTokIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.33 22a6.34 6.34 0 0 0 6.33-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52V7.12a4.85 4.85 0 0 1-.84-.43z" />
  </svg>
);

export default function Footer() {
  const router = useRouter();
  const { isAuthenticated, dispatch } = useAuth();

  // Optional: configure your store URLs via env
  const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL || '#';
  const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL || '#';
  // const APP_LANDING_URL = process.env.NEXT_PUBLIC_APP_LANDING_URL || 'https://championfootballer.com/app';
  // const QR_IMAGE_SRC = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(APP_LANDING_URL)}`;

  const handleSignOut = async () => {
    try {
      await dispatch(logout());
      if (typeof window !== 'undefined') {
        window.location.replace('/');
        return;
      }
      router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Box component="footer" sx={{
      py: { xs: 3, md: 5 },
      background: 'linear-gradient(90deg, #727272 0%, #3b3b3b 50%, #020202 100%)',
      color: 'white',
      boxShadow: '0 -2px 24px 0 rgba(30, 58, 138, 0.12)',

    }}>
      {/* Deleted App Download Section */}
      <Container maxWidth="md">
        <Stack spacing={3} alignItems="center" justifyContent="center">
          {/* App download section */}


          {/* Social Icons */}
          <Stack direction="row" spacing={{ xs: 2, sm: 3 }} flexWrap="wrap" justifyContent="center">
            <IconButton
              component="a"
              href="https://x.com/ChampionF2tball"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              aria-label="X (formerly Twitter)"
              sx={{
                color: 'white',
                bgcolor: '#00A77F',
                width: 36,
                height: 36,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#008f6d', color: '#fff', transform: 'scale(1.1)' },
              }}
            >
              <XTwitterIcon size={18} />
            </IconButton>
            <IconButton
              component="a"
              href="https://www.instagram.com/championfooballer?igsh=d3F1OGplZ2IxaWdz"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              aria-label="Instagram"
              sx={{
                color: '#fff',
                bgcolor: '#00A77F',
                width: 36,
                height: 36,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#008f6d', color: '#fff', transform: 'scale(1.1)' },
              }}
            >
              <InstagramIcon size={20} />
            </IconButton>
            <IconButton
              component="a"
              href="https://www.facebook.com/share/19R7iFrmfe/"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              aria-label="Facebook"
              sx={{
                color: '#fff',
                bgcolor: '#00A77F',
                width: 36,
                height: 36,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#008f6d', color: '#fff', transform: 'scale(1.1)' },
              }}
            >
              <FacebookIcon size={20} />
            </IconButton>
            <IconButton
              component="a"
              href="https://www.youtube.com/@championf2tballer"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              aria-label="YouTube"
              sx={{
                color: '#fff',
                bgcolor: '#00A77F',
                width: 36,
                height: 36,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#008f6d', color: '#fff', transform: 'scale(1.1)' },
              }}
            >
              <YouTubeIcon size={20} />
            </IconButton>
            <IconButton
              component="a"
              href="https://www.tiktok.com/@championf2tballer?_r=1&_t=ZS-98gdWDxrdZI"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              aria-label="TikTok"
              sx={{
                color: '#fff',
                bgcolor: '#00A77F',
                width: 36,
                height: 36,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#008f6d', color: '#fff', transform: 'scale(1.1)' },
              }}
            >
              <TikTokIcon size={18} />
            </IconButton>
          </Stack>

          <Divider sx={{ width: '60%', borderColor: '#00A77F', borderBottomWidth: 2 }} />

          {/* Footer Links */}
          <Stack direction="row" spacing={0.5} flexWrap="wrap" justifyContent="center" useFlexGap>
            <Button
              component={Link}
              href="/terms"
              disableRipple
              sx={{
                textTransform: 'none',
                color: 'white',
                fontWeight: 500,
                fontSize: { xs: 12, sm: 15, md: 18 },
                px: { xs: 1, md: 2 },
                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
              }}
            >
              Terms & Conditions
            </Button>
            <Button
              component={Link}
              href="/privacy"
              disableRipple
              sx={{
                textTransform: 'none',
                color: 'white',
                fontWeight: 500,
                fontSize: { xs: 12, sm: 15, md: 18 },
                px: { xs: 1, md: 2 },
                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
              }}
            >
              Privacy Policy
            </Button>
            <Button
              component={Link}
              href="/contact"
              disableRipple
              sx={{
                textTransform: 'none',
                color: 'white',
                fontWeight: 500,
                fontSize: { xs: 12, sm: 15, md: 18 },
                px: { xs: 1, md: 2 },
                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
              }}
            >
              Contact Us
            </Button>
            <Button
              component={Link}
              href="/about"
              disableRipple
              sx={{
                textTransform: 'none',
                color: 'white',
                fontWeight: 500,
                fontSize: { xs: 12, sm: 15, md: 18 },
                px: { xs: 1, md: 2 },
                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
              }}
            >
              About Us
            </Button>
            {isAuthenticated ? (
              <Button
                onClick={handleSignOut}
                sx={{
                  textTransform: 'none',
                  color: '#fff',
                  fontWeight: 500,
                  fontSize: { xs: 13, sm: 16 },
                  p: 0,
                  width: { xs: '80px', sm: '100px' },
                  height: { xs: '30px', sm: '35px' },
                  bgcolor: '#00A77F',
                  borderRadius: 1.5,
                  ml: { xs: 1, sm: 2 },
                  '&:hover': { bgcolor: '#008f6d', color: '#fff' },
                }}
              >
                Sign Out
              </Button>
            ) : (
              <Button
                component={Link}
                href="/"
                sx={{
                  textTransform: 'none',
                  color: '#fff',
                  fontWeight: 500,
                  fontSize: { xs: 13, sm: 16 },
                  p: 0,
                  width: { xs: '80px', sm: '100px' },
                  height: { xs: '30px', sm: '35px' },
                  bgcolor: '#00A77F',
                  borderRadius: 1.5,
                  ml: { xs: 1, sm: 2 },
                  '&:hover': { background: "#00cc9c", color: '#fff' },
                }}
              >
                Sign In
              </Button>
            )}
          </Stack>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                color: 'white',
                fontSize: { xs: 'clamp(10px, 2.8vw, 12px)', sm: '13px', md: '15px' },
                fontWeight: 450,
                letterSpacing: { xs: 0.3, sm: 0.8 },
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              &copy; {new Date().getFullYear()} Champion Footballer. All rights reserved.
            </Typography>
            {/* <Typography
              variant="body2"
              sx={{
                mt: 0.8,
                color: '#00A77F',
                fontSize: { xs: '11px', sm: '12px', md: '13px' },
                fontWeight: 700,
                letterSpacing: 0.5,
                lineHeight: 1.2,
              }}
            >
              Developed by TechSolutionor
            </Typography> */}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

'use client';

import { Box, Paper, Typography, Button, Card, Modal, IconButton, Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Layer from '@/Components/images/championfootballnewlogo.webp';
import NewImg from '@/Components/images/Done1.webp';
import Newimg from '@/Components/images/Done2.webp';
import mobile from '@/Components/images/mobile.webp';
import heroTopBg from '@/Components/images/hero_top_bg.webp';
import heroGridOrange from '@/Components/images/hero_grid_orange.webp';
import heroGridTeam1 from '@/Components/images/hero_grid_team1.webp';
import heroGridTeam2 from '@/Components/images/hero_grid_team2.webp';
import image9 from '@/Components/images/1stpicc.webp';
import image10 from '@/Components/images/2ndpicc.webp';
import image11 from '@/Components/images/3rdpicc.webp';
import image12 from '@/Components/images/4thpicc.webp';
import LogoNavbar from './logonavbar';


import { useState } from 'react';

// Lazy load heavy components with exact reserved height fallback to prevent CLS (Cumulative Layout Shift)
const AuthTabs = dynamic(() => import('@/Components/authtabs/authtabs'), {
  loading: () => (
    <Box
      sx={{
        width: '100%',
        height: { xs: '180px', md: '170px' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  ),
  ssr: true,
});

const AuthSocialButtons = dynamic(() => import('@/Components/AuthSocialButtons'), {
  loading: () => <Box sx={{ width: '100%', height: '140px' }} />,
  ssr: false,
});

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(true);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // Feature cards (id, title, image)
  const features = [
    { id: '1', title: 'CREATE YOUR PLAYER CARD', img: image9 },
    { id: '2', title: 'CREATE LEAGUES & MATCHES', img: image10 },
    { id: '3', title: 'TRACK YOUR PERFORMANCE', img: image11 },
    { id: '4', title: 'WIN TROPHIES & REWARDS', img: image12 },
  ];

  return (
    <>
      <LogoNavbar />

      {/* Black Hero Section with Grid Layout */}
      <Box
        sx={{
          width: '100%',
          backgroundColor: '#101010',
          overflowX: 'hidden',
          px: { xs: 2, md: 7 },
          py: { xs: 4, md: 2 },
        }}
      >
        <Box sx={{ maxWidth: '1280px', mx: 'auto', width: '100%' }}>
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {/* Left Side - 8 columns */}
            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: { xs: 1.5, md: 2 },
                  mb: { xs: 2, md: 0 },
                }}
              >
                {/* Top Hero Banner */}
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    aspectRatio: { xs: '16/9.5', md: '16/9' },
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  }}
                >
                  <Image
                    src={heroTopBg}
                    alt="Create your matches, track your stats, and rise through the rankings"
                    fill
                    priority
                    sizes="(max-width: 900px) 100vw, 65vw"
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                  />
                </Box>

                {/* Bottom 2x2 Grid Collage */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: { xs: 1.5, md: 2 },
                    width: '100%',
                  }}
                >
                  {/* Top Left Grid Image: Orange Players Celebrating */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '1.45/1',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    }}
                  >
                    <Image
                      src={heroGridOrange}
                      alt="Players Celebrating"
                      fill
                      sizes="(max-width: 900px) 50vw, 32vw"
                      style={{ objectFit: 'cover', objectPosition: 'center' }}
                    />
                  </Box>

                  {/* Top Right Grid Image: Team Squad Posing */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '1.45/1',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    }}
                  >
                    <Image
                      src={heroGridTeam1}
                      alt="Football Team Squad"
                      fill
                      sizes="(max-width: 900px) 50vw, 32vw"
                      style={{ objectFit: 'cover', objectPosition: 'center' }}
                    />
                  </Box>

                  {/* Bottom Left Grid Container: Black Box with White Text */}
                  <Box
                    sx={{
                      width: '100%',
                      aspectRatio: '1.45/1',
                      backgroundColor: '#000000',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: { xs: 1.5, sm: 2, md: 3 },
                      textAlign: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: 'var(--font-geist-anton), Anton, var(--font-woodford-bourne-pro), var(--font-inter), sans-serif !important',
                        fontWeight: '900 !important',
                        fontSize: { xs: '0.85rem', sm: '1.15rem', md: '1.45rem' },
                        lineHeight: { xs: 1.15, md: 1.2 },
                        color: '#FFFFFF',
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                      }}
                    >
                      I GOT 99 PROBLEMS BUT WINNING AIN'T ONE!
                    </Typography>
                  </Box>

                  {/* Bottom Right Grid Image: Team Victory */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '1.45/1',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    }}
                  >
                    <Image
                      src={heroGridTeam2}
                      alt="Team Celebrating Victory"
                      fill
                      sizes="(max-width: 900px) 50vw, 32vw"
                      style={{ objectFit: 'cover', objectPosition: 'center' }}
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Right Side - 4 columns (Auth Form) */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  height: '100%',
                  mt: { xs: 1, md: 0 },

                }}
              >
                {/* Top Text */}
                <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, mb: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-inter), Inter, sans-serif !important',
                      fontWeight: '600 !important',
                      fontSize: { xs: '1rem', md: '23px' },
                      lineHeight: { xs: '1.3', md: '35px' },
                      letterSpacing: '0% !important',
                      color: 'white',
                      textAlign: { xs: 'center', md: 'right' },
                      maxWidth: { xs: '100%', md: '355px' },
                      width: '100%',
                      mt: { xs: 0, md: 1 },
                      whiteSpace: { xs: 'nowrap', md: 'normal' },
                    }}
                  >
                    The best football app
                    <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                      <br />
                    </Box>
                    <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
                      {' '}
                    </Box>
                    on the planet!
                  </Typography>
                </Box>

                {/* Join Button */}
                <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, mb: { xs: 1.5, md: 1 } }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (showLogin) {
                        setIsJoinModalOpen(true);
                      } else {
                        setShowLogin(true);
                      }
                    }}
                    sx={{
                      color: 'white',
                      textTransform: 'none',
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      width: { xs: '100%', md: 'auto' },
                      height: { xs: '40px', md: 'auto' },

                      border: '1px solid #FFFFFF',

                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: '1px solid #FFFFFF',
                      },
                      borderRadius: '7px',
                      px: { xs: 3, md: 4 },

                    }}
                  >
                    {showLogin ? 'Join' : 'Login'}
                  </Button>
                </Box>

                {/* Auth Form */}
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    minHeight: { xs: '330px', md: '350px' },
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ width: '100%', overflow: 'visible', mb: 2 }}>
                    <AuthTabs showLogin={showLogin} onToggleForm={() => setShowLogin(!showLogin)} />
                  </Box>
                  {showLogin ? (
                    <Box>
                      <AuthSocialButtons />
                    </Box>
                  ) : null}
                </Paper>
              </Box>
              {/* Join Modal - Popup for registration */}
              <Modal
                open={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    width: { xs: '92vw', sm: '600px', md: '730px' },
                    maxWidth: '92vw',
                    height: { xs: '90vh', md: '1129px' },
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    borderRadius: '15px',
                    bgcolor: '#f5f6f6',
                    p: { xs: 3, md: 4 },
                    position: 'relative',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar for Chrome/Safari/Opera
                    scrollbarWidth: 'none', // Hide scrollbar for Firefox
                    msOverflowStyle: 'none', // Hide scrollbar for IE/Edge
                  }}
                >
                  {/* Close button */}
                  <IconButton
                    onClick={() => setIsJoinModalOpen(false)}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: 8,
                      color: 'grey.500',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' }
                    }}
                  >
                    <CloseIcon />
                  </IconButton>

                  {/* Auth Tabs - Register form */}
                  <Box sx={{ width: '100%', overflow: 'visible' }}>
                    <AuthTabs showLogin={false} onToggleForm={() => { }} />
                  </Box>
                </Paper>
              </Modal>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Rest of the page with background */}
      <Box
        sx={{
          width: '100%',
          overflowX: 'hidden',

          position: 'relative',
          background: '#101010',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          px: { xs: 2, md: 7 },

        }}
      >
        {/* BOTTOM GROUP: move images into a separate, centered box anchored to bottom on md+ */}
        {/* Separate images box — anchored bottom-center on md+, centered and stacked on small screens */}
        <Box
          sx={{
            width: '100%',
            maxWidth: '1280px',
            mx: 'auto',
            display: 'flex',
            justifyContent: 'center',
            px: { xs: 2, md: 0 },
            pointerEvents: 'none',
            mt: { xs: 2, sm: 2, md: 10 },
            mb: 4,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)', md: 'repeat(4, 1fr)' },
              gap: { xs: 2, md: 2 },
              pointerEvents: 'auto',
              alignItems: 'stretch',
              width: '100%',
            }}
          >
            {features.map((f) => (
              <Card
                key={f.id}
                elevation={0}
                sx={{
                  width: '100%',
                  height: { xs: 230, sm: 238, md: 238 },
                  minHeight: { xs: 230, sm: 238, md: 238 },
                  borderRadius: 0.5,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                  border: '2px solid #6a6f75',
                  // background: 'linear-gradient(180deg, #51565b 0%, #24292f 34%, #020407 100%)',
                  background: 'linear-gradient(180deg, #3c4146 0%, #010305 100%)',

                  p: 0,
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    px: { xs: 1.1, md: 1.25 },
                    py: { xs: 0.75, md: 0.85 },
                    minHeight: { xs: 36, md: 40 },
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    // background: 'linear-gradient(180deg, #575b60 0%, #474b50 100%)',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-inter), Inter, sans-serif',
                      fontSize: { xs: '0.98rem', md: '0.97rem' },
                      lineHeight: 1.1,
                      letterSpacing: '0.01em',
                      color: '#ffff',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'center',
                      width: '100%',
                      textShadow: '0 1px 0 rgba(0,0,0,0.55)',
                    }}
                  >
                    {f.title}
                  </Typography>
                </Box>
                {/* <Box
                sx={{
                  width: '100%',
                  height: 2.5,
                  bgcolor: '#0a0d10',
                }}
              /> */}
                <Box
                  sx={{
                    flex: 1,
                    width: '100%',
                    p: { xs: 1.15, md: 1.3 },
                    bgcolor: 'transparent',
                    display: 'grid',
                    placeItems: 'center',
                    minHeight: 0,
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      maxWidth: '100%',
                      mx: 'auto',
                      display: 'grid',
                      placeItems: 'center',
                      overflow: 'hidden',
                      // background: 'linear-gradient(180deg, #0b0f13 0%, #010305 100%)',
                    }}
                  >
                    <Image
                      src={f.img}
                      alt={f.title}
                      fill
                      sizes="(max-width: 600px) 90vw, 25vw"
                      style={{
                        objectFit: 'contain',
                        objectPosition: 'center center',
                        padding: '8px 14px',
                      }}
                      loading="lazy"
                      placeholder="blur"
                    />
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
}

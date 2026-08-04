'use client';

import { Box, Paper, Typography, Button, Card, Modal, IconButton, Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Layer from '@/Components/images/championfootballnewlogo.webp';
import NewImg from '@/Components/images/Done1.webp';
import Newimg from '@/Components/images/Done2.webp';
import mobile from '@/Components/images/mobile.webp';
import heroTopBg from '@/Components/images/hero_top_bg.png';
import heroGridOrange from '@/Components/images/hero_grid_orange.png';
import heroGridTeam1 from '@/Components/images/hero_grid_team1.png';
import heroGridTeam2 from '@/Components/images/hero_grid_team2.png';
import image9 from '@/Components/images/1stpicc.jpeg';
import image10 from '@/Components/images/2ndpicc.png';
import image11 from '@/Components/images/3rdpicc.png';
import image12 from '@/Components/images/4thpicc.png';
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
          backgroundColor: '#0a0a0c',
          overflowX: 'hidden',
          px: { xs: 2, sm: 3, md: 5 },
          py: { xs: 3, md: 3 },
        }}
      >
        <Box sx={{ maxWidth: '1280px', mx: 'auto', width: '100%' }}>
          <Grid container spacing={{ xs: 2, md: 2 }}>
            {/* Left Side - 7.5 columns (Hero Image & Collage) */}
            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {/* Top Hero Banner (Taller aspect ratio matching screenshot) */}
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    aspectRatio: { xs: '16/10', md: '1.55/1' },
                    boxShadow: '0 4px 24px rgba(0,0,0,0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Image
                    src={heroTopBg}
                    alt="Create your matches, track your stats, and rise through the rankings"
                    fill
                    priority
                    loading="eager"
                    fetchPriority="high"
                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 70vw, 1200px"
                    style={{ objectFit: 'cover', objectPosition: 'left center' }}
                    quality={100}
                  />
                </Box>

                {/* Bottom 2 Cards Grid */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: { xs: 2, md: 2 },
                    width: '100%',
                  }}
                >
                  {/* Left Card: Team Squad + Text */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '1.5/1',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                      }}
                    >
                      <Image
                        src={heroGridTeam1}
                        alt="Football Team Squad"
                        fill
                        loading="lazy"
                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 40vw, 600px"
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                        quality={100}
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif !important',
                        fontWeight: '900 !important',
                        fontStyle: 'italic !important',
                        fontSize: { xs: '0.85rem', sm: '1.02rem', md: '1.15rem' },
                        lineHeight: 1.2,
                        color: '#FFFFFF',
                        textTransform: 'uppercase',
                        textAlign: 'center',
                        mt: 1.5,
                        px: 1,
                        letterSpacing: '0.01em',
                      }}
                    >
                      &quot;I GOT 99 PROBLEMS BUT WINNING AIN&apos;T ONE&quot;
                    </Typography>
                  </Box>

                  {/* Right Card: Orange Players + Text */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '1.5/1',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                      }}
                    >
                      <Image
                        src={heroGridOrange}
                        alt="Champion Footballer Players"
                        fill
                        loading="lazy"
                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 40vw, 600px"
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                        quality={100}
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif !important',
                        fontWeight: '900 !important',
                        fontStyle: 'italic !important',
                        fontSize: { xs: '0.8rem', sm: '0.92rem', md: '1.05rem' },
                        lineHeight: 1.2,
                        color: '#FFFFFF',
                        textTransform: 'uppercase',
                        textAlign: 'center',
                        mt: 1.5,
                        px: 1,
                        letterSpacing: '0.01em',
                      }}
                    >
                      CHAMPION FOOTBALLER IS YOUR ULTIMATE HUB FOR FOOTBALL, PERFORMANCE, AND BRAGGING RIGHTS!
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Right Side - 3.8 columns (Auth Sidebar Cards) */}
            <Grid item xs={12} md={3.8}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  height: '100%',
                }}
              >
                {/* Main Auth Card Container (Matching Example Screen) */}
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: '#0A0A0C',
                    p: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    width: '95%',
                    ml: 2,
                  }}
                >
                  {/* Header Container: Text on Top, Join Button Below It */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-end' }, width: '100%', mb: 1.5 }}>
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
                        mt: 0,
                        mb: 1,
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
                        fontSize: { xs: '0.9rem', md: '0.95rem' },
                        fontWeight: '500',
                        border: '1px solid #FFFFFF',
                        backgroundColor: 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          border: '1px solid #FFFFFF',
                        },
                        borderRadius: '7px',
                        px: 3,
                        py: 0.5,
                        minWidth: '85px',
                      }}
                    >
                      {showLogin ? 'Join' : 'Login'}
                    </Button>
                  </Box>

                  {/* Auth Tabs Form */}
                  <Box sx={{ width: '100%', overflow: 'visible', mb: 1.5 }}>
                    <AuthTabs showLogin={showLogin} onToggleForm={() => setShowLogin(!showLogin)} />
                  </Box>
                  {showLogin ? (
                    <Box sx={{ width: '100%' }}>
                      <AuthSocialButtons />
                    </Box>
                  ) : null}
                </Paper>
              </Box>
              {/* Join Modal - Popup for registration */}
              {isJoinModalOpen && (
                <Modal
                  open={isJoinModalOpen}
                  onClose={() => setIsJoinModalOpen(false)}
                  keepMounted={false}
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
                      aria-label="Close modal"
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
              )}
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
                      sizes="(max-width: 600px) 90vw, 400px"
                      style={{
                        objectFit: 'contain',
                        objectPosition: 'center center',
                        padding: '8px 14px',
                      }}
                      loading="lazy"
                      quality={100}
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

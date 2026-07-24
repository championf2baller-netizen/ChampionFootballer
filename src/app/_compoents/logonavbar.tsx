"use client";
import React from 'react';
import { Box } from '@mui/material';
import Image from 'next/image';
import Layer from '@/Components/images/logonavbar.webp';

function LogoNavbar() {
  return (
    <>
      {/* Main Navbar */}
      <Box
        sx={{
          width: '100%',
          backgroundColor: '#101010',
          display: 'flex',
          py: 1,
          px: { xs: 2, md: 7 }
        }}
      >
        <Box
          sx={{
            maxWidth: '1280px',
            width: '100%',
            mx: 'auto',
            display: 'flex',
            justifyContent: { xs: 'center', md: 'flex-start' },
          }}
        >
          <Box sx={{ width: { xs: 250, sm: 340, md: 700 } }}>
            <Image
              src={Layer}
              alt="Champion Footballer Logo"
              width={700}
              height={130}
              sizes="(max-width: 600px) 340px, 700px"
              style={{ width: '100%', height: 'auto', display: 'block' }}
              priority
              fetchPriority="high"
              quality={95}
            />
          </Box>
        </Box>
      </Box>

      {/* Orange Bottom Bar */}
      <Box sx={{ px: { xs: 2, md: 7 }, py: 1, width: '100%', backgroundColor: '#101010' }}>
        <Box
          sx={{
            maxWidth: '1280px',
            width: '100%',
            mx: 'auto',
            height: 'var(--header-divider-height)',
            backgroundColor: 'var(--header-divider-color)',
          }}
        />
      </Box>

      {/* Dark Blue Bar */}

    </>
  );
}

export default LogoNavbar;

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';

type SxArrayItem =
  | SystemStyleObject<Theme>
  | ((theme: Theme) => SystemStyleObject<Theme>)
  | boolean;

const toSxArray = (value?: SxProps<Theme>): SxArrayItem[] => {
  if (!value) return [];
  return Array.isArray(value) ? (value as SxArrayItem[]) : [value as SxArrayItem];
};

export type PageHeaderProps = {
  title: React.ReactNode;
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
  titleSx?: SxProps<Theme>;
  titleRowSx?: SxProps<Theme>;
  titleLeft?: React.ReactNode;
  titleRight?: React.ReactNode;
  subtitle?: React.ReactNode;
  dividerSx?: SxProps<Theme>;
  fullBleed?: boolean;
};

const baseOuterSx: SystemStyleObject<Theme> = {
  mt: 0,
  mb: { xs: 2, md: 4 },
  width: '100vw',
  position: 'relative',
  left: '50%',
  transform: 'translateX(-50%)',
  bgcolor: '#0E0E0E',
};

const basePaperSx: SystemStyleObject<Theme> = {
  px: 0,
  pt: { xs: 0, md: 3 },
  pb: 0,
  bgcolor: '#0E0E0E',
  color: 'white',
  minHeight: 'auto',
  borderRadius: 0,
  boxShadow: 'none',
};

const baseContainerSx: SystemStyleObject<Theme> = {
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'center',
  width: '100%',
  position: 'relative',
  mt: 0,
};

const baseTitleBoxSx: SystemStyleObject<Theme> = {
  position: 'relative',
  display: { xs: 'none', md: 'flex' },
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  px: { xs: 1.5, sm: 2, md: 0 },
  gap: 0.5,
  mt: 0,
  minHeight: { xs: 0, md: '87px' },
  height: { xs: 'auto', md: '87px' },
};

const baseTitleRowSx: SystemStyleObject<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: { xs: 0.8, sm: 1, md: 1.25 },
  textAlign: 'center',
};

const baseTitleSx: SystemStyleObject<Theme> = {
  color: 'white',
  fontFamily: 'var(--font-oswald), "Oswald", sans-serif !important',
  fontWeight: 700,
  fontSize: { xs: '32px', sm: '42px', md: '55px' },
  lineHeight: { xs: 1, sm: 1.1 },
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: '0px',
  m: 0,
};

const baseDividerSx: SystemStyleObject<Theme> = {
  height: 'var(--header-divider-height, 3px)',
  minHeight: '3px',
  bgcolor: 'var(--header-divider-color, #e16419)',
  mt: { xs: 0, md: 3 },
  mb: { xs: 0, md: 2 },
  width: '100vw',
  position: 'relative',
  left: '50%',
  transform: 'translateX(-50%)',
  display: { xs: 'none', md: 'block' },
};

export default function PageHeader({
  title,
  children,
  sx,
  titleSx,
  titleRowSx,
  titleLeft,
  titleRight,
  subtitle,
  dividerSx,
  fullBleed = true,
}: PageHeaderProps) {
  const outerSx: SystemStyleObject<Theme> = fullBleed
    ? baseOuterSx
    : {
      mt: 0,
      mb: { xs: 2, md: 4 },
      width: '100%',
      bgcolor: '#0E0E0E',
    };

  const dividerStyle: SystemStyleObject<Theme> = fullBleed
    ? baseDividerSx
    : {
      ...baseDividerSx,
      width: '100%',
      left: 'auto',
      transform: 'none',
    };

  return (
    <Box sx={[outerSx, ...toSxArray(sx)]}>
      <Paper sx={basePaperSx}>
        <Box sx={baseContainerSx}>
          <Box sx={baseTitleBoxSx}>
            <Box sx={[baseTitleRowSx, ...toSxArray(titleRowSx)]}>
              {titleLeft}
              {typeof title === 'string' ? (
                <Typography variant="h3" sx={[baseTitleSx, ...toSxArray(titleSx)]}>
                  {title}
                </Typography>
              ) : (
                title
              )}
              {titleRight}
            </Box>
            {subtitle && (
              <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {subtitle}
              </Box>
            )}
          </Box>

          {/* Orange divider under header - symmetrical mt and mb */}
          <Box sx={[dividerStyle, ...toSxArray(dividerSx)]} />

          {/* Controls / filters / subheader children */}
          {children && (
            <Box sx={{ width: '100%', mt: 0, pb: { xs: 2, md: 3 } }}>
              {children}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

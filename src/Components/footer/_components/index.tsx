'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
const LinkedInIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const DiscordIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const PinterestIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.618 0 12.017 0z" />
  </svg>
);

const SnapchatIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.003 2c-3.75 0-6.14 2.87-6.14 5.92 0 1.25.39 2.59 1.12 3.66.17.25.13.56-.08.77l-1.04 1.03c-.41.41-.32 1.13.2 1.41 1.05.57 2.18.96 3.37 1.14-.52 1.07-1.74 1.83-3.07 1.83-.59 0-1.15-.15-1.64-.42-.36-.2-.82-.09-1.04.26l-.42.66c-.28.44-.1 1.03.37 1.22 1.34.55 2.8.84 4.3.84 4.7 0 8.7-3.02 9.5-7.44.2-.01.4-.04.6-.07.41-.07.82.16.96.55.22.6.76 1.02 1.39 1.02.83 0 1.5-.67 1.5-1.5 0-.49-.24-.92-.61-1.19-.24-.18-.36-.48-.31-.78.07-.44.11-.89.11-1.35 0-4.14-3.36-7.5-7.5-7.5zm.06 13.5c-2.3 0-4.3-1.1-5.5-2.8.3-.3.6-.5.9-.7.8.6 1.9 1 3.1 1s2.3-.4 3.1-1c.3.2.6.4.9.7-1.2 1.7-3.2 2.8-5.5 2.8z" />
  </svg>
);

const ThreadsIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.186 24.004c-3.13 0-5.753-.94-7.578-2.72-1.77-1.724-2.617-4.2-2.518-7.362.1-3.218 1.154-5.766 3.05-7.37 1.848-1.564 4.38-2.378 7.32-2.355 2.97.023 5.485.877 7.275 2.47 1.745 1.554 2.7 3.96 2.766 6.964.062 2.83-.722 5.176-2.269 6.786-1.503 1.564-3.627 2.374-6.142 2.342-1.927-.024-3.568-.567-4.747-1.57-1.127-.958-1.74-2.327-1.722-3.856.02-1.637.747-3.02 2.046-3.896 1.258-.847 2.946-1.282 4.881-1.225.795.023 1.563.1 2.285.23-.095-1.428-.684-2.47-1.752-3.104-.947-.562-2.222-.818-3.793-.762-1.395.05-2.573.364-3.498.934a.75.75 0 0 1-.806-1.263c1.173-.727 2.628-1.12 4.336-1.168 2.052-.06 3.738.293 5.01 1.05 1.517.901 2.362 2.428 2.51 4.545l.006.126v3.29c0 1.22.19 2.09.567 2.585.342.449.883.693 1.61.725.992.043 1.83-.284 2.493-.974.723-.752 1.12-1.892 1.148-3.297.04-2.032-.596-3.72-1.843-4.882-1.328-1.238-3.27-1.91-5.613-1.948-2.404-.038-4.464.609-5.955 1.87-1.442 1.22-2.26 3.177-2.34 5.656-.076 2.41.56 4.33 1.893 5.7 1.365 1.403 3.398 2.14 5.88 2.138 2.08-.002 3.842-.516 5.236-1.528a.75.75 0 0 1 .874 1.218c-1.674 1.215-3.743 1.81-6.11 1.81z" />
  </svg>
);

const TwitchIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.571 4.714h1.715v5.143h-1.715V4.714zm4.715 0H18v5.143h-1.714V4.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0H6zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714v9.429z" />
  </svg>
);

const TelegramIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const RedditIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.611a1.24 1.24 0 0 1 .111-.703zM9.25 13c-.552 0-1 .448-1 1s.448 1 1 1 1-.448 1-1-.448-1-1-1zm5.5 0c-.552 0-1 .448-1 1s.448 1 1 1 1-.448 1-1-.448-1-1-1zm-4.75 3.5c-.3 0-.5.2-.5.5 0 .828.9 1.5 2 1.5s2-.672 2-1.5c0-.3-.2-.5-.5-.5h-3z" />
  </svg>
);

const WebsiteIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.285-.143-1.686-.833-1.947-.928-.261-.095-.451-.143-.642.143-.19.285-.736.928-.903 1.118-.166.19-.333.214-.618.071-.285-.143-1.203-.443-2.292-1.414-.847-.756-1.419-1.689-1.585-1.974-.166-.285-.018-.439.125-.581.129-.129.285-.333.428-.5.143-.166.19-.285.285-.476.095-.19.048-.357-.024-.5-.071-.143-.642-1.546-.88-2.118-.232-.557-.468-.481-.642-.49-.166-.008-.357-.01-.547-.01s-.5.071-.761.357c-.261.285-.999.976-.999 2.38 0 1.404 1.023 2.76 1.166 2.951.143.19 2.013 3.073 4.877 4.31.682.294 1.214.47 1.63.604.685.218 1.308.187 1.8.114.549-.081 1.686-.689 1.924-1.355.238-.666.238-1.237.166-1.355-.071-.118-.261-.19-.546-.333z" />
  </svg>
);

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  const { isAuthenticated, dispatch } = useAuth();
  const [socialLinks, setSocialLinks] = React.useState<Record<string, string>>({
    x: 'https://x.com/ChampionF2tball',
    instagram: 'https://www.instagram.com/championfooballer?igsh=d3F1OGplZ2IxaWdz',
    facebook: 'https://www.facebook.com/share/19R7iFrmfe/',
    youtube: 'https://www.youtube.com/@championf2tballer',
    tiktok: 'https://www.tiktok.com/@championf2tballer?_r=1&_t=ZS-98gdWDxrdZI',
    linkedin: 'https://www.linkedin.com',
    pinterest: '',
    snapchat: '',
    threads: '',
    twitch: '',
    telegram: '',
    reddit: '',
    discord: '',
    whatsapp: '',
    website: ''
  });

  React.useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    fetch(`${apiBase}/api/static-content/social_media_links?_=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d?.success && d?.data?.metadata?.socialLinks) {
          setSocialLinks(d.data.metadata.socialLinks);
        }
      })
      .catch(() => {});
  }, []);

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

  const activePlatforms = [
    { key: 'instagram', name: 'Instagram', icon: <InstagramIcon size={20} />, href: socialLinks.instagram },
    { key: 'tiktok', name: 'TikTok', icon: <TikTokIcon size={18} />, href: socialLinks.tiktok },
    { key: 'youtube', name: 'YouTube', icon: <YouTubeIcon size={20} />, href: socialLinks.youtube },
    { key: 'facebook', name: 'Facebook', icon: <FacebookIcon size={20} />, href: socialLinks.facebook },
    { key: 'x', name: 'X (formerly Twitter)', icon: <XTwitterIcon size={18} />, href: socialLinks.x },
    { key: 'linkedin', name: 'LinkedIn', icon: <LinkedInIcon size={18} />, href: socialLinks.linkedin },
    { key: 'pinterest', name: 'Pinterest', icon: <PinterestIcon size={18} />, href: socialLinks.pinterest },
    { key: 'snapchat', name: 'Snapchat', icon: <SnapchatIcon size={18} />, href: socialLinks.snapchat },
    { key: 'threads', name: 'Threads', icon: <ThreadsIcon size={18} />, href: socialLinks.threads },
    { key: 'twitch', name: 'Twitch', icon: <TwitchIcon size={18} />, href: socialLinks.twitch },
    { key: 'telegram', name: 'Telegram', icon: <TelegramIcon size={18} />, href: socialLinks.telegram },
    { key: 'reddit', name: 'Reddit', icon: <RedditIcon size={18} />, href: socialLinks.reddit },
    { key: 'discord', name: 'Discord', icon: <DiscordIcon size={18} />, href: socialLinks.discord },
    { key: 'whatsapp', name: 'WhatsApp', icon: <WhatsAppIcon size={18} />, href: socialLinks.whatsapp },
    { key: 'website', name: 'Website', icon: <WebsiteIcon size={18} />, href: socialLinks.website },
  ].filter(p => p.href && p.href.trim().length > 0);

  return (
    <Box component="footer" sx={{
      py: { xs: 3, md: 5 },
      background: 'linear-gradient(90deg, #727272 0%, #3b3b3b 50%, #020202 100%)',
      color: 'white',
      boxShadow: '0 -2px 24px 0 rgba(30, 58, 138, 0.12)',

    }}>
      <Container maxWidth="md">
        <Stack spacing={3} alignItems="center" justifyContent="center">
          {/* Dynamic Social Icons */}
          {activePlatforms.length > 0 && (
            <Stack
              direction="row"
              spacing={{ xs: 1.5, sm: 2.5, md: 3 }}
              flexWrap="wrap"
              justifyContent="center"
              alignItems="center"
              sx={{
                overflow: 'visible',
                maxWidth: '100%',
                px: 1,
                py: 1,
              }}
            >
              {activePlatforms.map((item) => (
                <IconButton
                  key={item.key}
                  component="a"
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  aria-label={item.name}
                  sx={{
                    color: 'white',
                    bgcolor: '#00A77F',
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    outline: 'none',
                    '&:focus': { outline: 'none' },
                    '&:focus-visible': { outline: 'none' },
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: '#008f6d', color: '#fff', transform: 'scale(1.1)' },
                  }}
                >
                  {item.icon}
                </IconButton>
              ))}
            </Stack>
          )}

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

'use client';
import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Paper, Container, Grid, Button, TextField,
  Switch, FormControlLabel, CircularProgress, Alert, Chip,
  Divider, Card, CardContent, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Snackbar, Drawer, useTheme, useMediaQuery,
  InputAdornment, Tooltip, Avatar, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import cflogo from '@/Components/images/champion football logo 3 (1).png';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';
import ShieldIcon from '@mui/icons-material/Security';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HomeIcon from '@mui/icons-material/Home';
import GavelIcon from '@mui/icons-material/Gavel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import PolicyIcon from '@mui/icons-material/Policy';
import AppsIcon from '@mui/icons-material/Apps';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import StorageIcon from '@mui/icons-material/Storage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FilterListIcon from '@mui/icons-material/FilterList';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface StaticContentItem {
  id?: string;
  key: string;
  category: string;
  title: string;
  content: string;
  metadata?: any;
  isActive: boolean;
  updatedAt?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  isFeatured?: boolean;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

import { getApiBaseUrl } from '@/lib/getApiBaseUrl';

const API_BASE = getApiBaseUrl();

// Navigation Tabs Structure (Sidebar Navigation)
const NAVIGATION_ITEMS: NavSection[] = [
  {
    section: 'DATABASE MANAGEMENT',
    items: [
      {
        id: 'db_explorer',
        label: 'Leagues, Seasons & Matches',
        icon: <SportsSoccerIcon sx={{ color: '#00ff88' }} />,
        description: 'Explore all database leagues, view season details, and browse matches',
        isFeatured: true
      }
    ]
  },
  {
    section: 'STATIC CONTENT & CMS PAGES',
    items: [
      { id: 'rewards', label: 'Rewards & Badges Page', icon: <EmojiEventsIcon />, description: 'Manage all 9 reward rules, XP multipliers, and badge descriptions' },
      { id: 'landing', label: 'Main Landing Page', icon: <AppsIcon />, description: 'Manage main landing page hero banners, cards, images, and headlines' },
      { id: 'home', label: 'Home Page & Banners', icon: <HomeIcon />, description: 'Manage welcome texts, subtitles, and home highlights' },
      { id: 'footer', label: 'Footer & Social Media', icon: <AppsIcon />, description: 'Manage footer social media icons, URLs, and platform links' },
      { id: 'leagues', label: 'All Leagues Banner', icon: <AppsIcon />, description: 'Manage All Leagues and League Details info banners' },
      { id: 'matches', label: 'All Matches Banner', icon: <AppsIcon />, description: 'Manage All Matches info banner' },
      { id: 'players', label: 'All Players Page', icon: <AppsIcon />, description: 'Manage All Players main heading, search input, filters, and info banner' },
      { id: 'player_stats', label: 'Player Stats Page', icon: <AppsIcon />, description: 'Manage Player Stats page (/player/[id]) main heading and filters' },
      { id: 'career', label: 'Player Career Page', icon: <AppsIcon />, description: 'Manage Player Career History page (/player/[id]/career) heading' },
      { id: 'trophy', label: 'Trophy Room Page', icon: <EmojiEventsIcon />, description: 'Manage Trophy Room page main heading, section titles, and info banner' },
      { id: 'profile', label: 'Profile Page Icons', icon: <AppsIcon />, description: 'Manage My Profile info banner and skill icons' },
      { id: 'rules', label: 'App Info & Legal Pages', icon: <GavelIcon />, description: 'Manage About CF, How to Play, Contact Us, Terms & Conditions, and Privacy Policy' },
      { id: 'all', label: 'All CMS Pages Overview', icon: <AppsIcon />, description: 'View all static content items across the entire platform' },
    ]
  }
];

export default function AdminDashboardPage() {
  const [items, setItems] = useState<StaticContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('db_explorer');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Edit modal state
  const [editItem, setEditItem] = useState<StaticContentItem | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [isNew, setIsNew] = useState(false);

  // DB Explorer State
  const [dbLeagues, setDbLeagues] = useState<any[]>([]);
  const [loadingDbLeagues, setLoadingDbLeagues] = useState(false);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [dbSeasons, setDbSeasons] = useState<any[]>([]);
  const [loadingDbSeasons, setLoadingDbSeasons] = useState(false);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('all');
  const [dbMatches, setDbMatches] = useState<any[]>([]);
  const [loadingDbMatches, setLoadingDbMatches] = useState(false);
  const [leagueSearch, setLeagueSearch] = useState('');
  const [matchSearch, setMatchSearch] = useState('');
  const [matchStatusFilter, setMatchStatusFilter] = useState('ALL');

  // Match Action Modals State
  const [viewMatchModal, setViewMatchModal] = useState<any | null>(null);
  const [editMatchModal, setEditMatchModal] = useState<any | null>(null);
  const [pitchMatchModal, setPitchMatchModal] = useState<any | null>(null);
  const [savingMatch, setSavingMatch] = useState(false);

  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const seasonsRef = useRef<HTMLDivElement>(null);

  const handleLeagueSelect = (leagueId: string) => {
    setSelectedLeagueId(leagueId);
    setTimeout(() => {
      seasonsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const getHeaders = () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/static-content?_=${Date.now()}`, {
        headers: getHeaders()
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin/login');
        return;
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch static content items');
      }

      setItems((data.items || []).filter((it: StaticContentItem) => it.key !== 'announcement_banner'));
    } catch (err: any) {
      setError(err.message || 'Failed to load static content');
    } finally {
      setLoading(false);
    }
  };

  // DB Explorer Fetching Functions
  const fetchDbLeagues = async () => {
    setLoadingDbLeagues(true);
    try {
      let res = await fetch(`${API_BASE}/leagues?_=${Date.now()}`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        res = await fetch(`${API_BASE}/api/leagues?_=${Date.now()}`, {
          headers: getHeaders()
        });
      }
      const data = await res.json();
      let list: any[] = [];
      if (data.success && Array.isArray(data.leagues)) {
        list = data.leagues;
      } else if (Array.isArray(data.data)) {
        list = data.data;
      } else if (Array.isArray(data)) {
        list = data;
      }
      setDbLeagues(list);

      // Select first league if none selected yet
      if (list.length > 0 && !selectedLeagueId) {
        setSelectedLeagueId(list[0].id);
      }
    } catch (err: any) {
      console.error('Failed to fetch DB leagues:', err);
    } finally {
      setLoadingDbLeagues(false);
    }
  };

  const fetchDbSeasons = async (leagueId: string) => {
    setLoadingDbSeasons(true);
    try {
      let res = await fetch(`${API_BASE}/leagues/${leagueId}/seasons?_=${Date.now()}`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        res = await fetch(`${API_BASE}/api/leagues/${leagueId}/seasons?_=${Date.now()}`, {
          headers: getHeaders()
        });
      }
      const data = await res.json();
      let seasonsList: any[] = [];
      if (data.success && Array.isArray(data.seasons)) {
        seasonsList = data.seasons;
      } else if (Array.isArray(data.data)) {
        seasonsList = data.data;
      } else if (Array.isArray(data)) {
        seasonsList = data;
      }
      setDbSeasons(seasonsList);
    } catch (err: any) {
      console.error('Failed to fetch DB seasons:', err);
      setDbSeasons([]);
    } finally {
      setLoadingDbSeasons(false);
    }
  };

  const fetchDbMatches = async (leagueId: string, seasonId?: string) => {
    setLoadingDbMatches(true);
    try {
      const seasonQuery = (seasonId && seasonId !== 'all') ? `&seasonId=${seasonId}` : '';
      let res = await fetch(`${API_BASE}/leagues/${leagueId}/matches?all=1${seasonQuery}&_=${Date.now()}`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        res = await fetch(`${API_BASE}/api/leagues/${leagueId}/matches?all=1${seasonQuery}&_=${Date.now()}`, {
          headers: getHeaders()
        });
      }
      const data = await res.json();
      let matchesList: any[] = [];
      if (data.success && Array.isArray(data.matches)) {
        matchesList = data.matches;
      } else if (Array.isArray(data.data)) {
        matchesList = data.data;
      } else if (Array.isArray(data)) {
        matchesList = data;
      }
      setDbMatches(matchesList);
    } catch (err: any) {
      console.error('Failed to fetch DB matches:', err);
      setDbMatches([]);
    } finally {
      setLoadingDbMatches(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchItems();
    fetchDbLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeagueId) {
      fetchDbSeasons(selectedLeagueId);
      fetchDbMatches(selectedLeagueId, selectedSeasonId);
    }
  }, [selectedLeagueId]);

  useEffect(() => {
    if (selectedLeagueId) {
      fetchDbMatches(selectedLeagueId, selectedSeasonId);
    }
  }, [selectedSeasonId]);

  const handleToggleActive = async (item: StaticContentItem) => {
    setSavingKey(item.key);
    try {
      const updatedItem = { ...item, isActive: !item.isActive };
      const res = await fetch(`${API_BASE}/api/admin/static-content/${item.key}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ isActive: updatedItem.isActive })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to toggle status');
      }

      setItems(prev => prev.map(it => it.key === item.key ? { ...it, isActive: updatedItem.isActive } : it));
      setSnackbar(`'${item.title}' status updated!`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingKey(null);
    }
  };

  const handleSaveItem = async () => {
    if (!editItem || !editItem.key || !editItem.title) {
      setError('Key and Title are required.');
      return;
    }

    setSavingKey(editItem.key);
    try {
      const method = isNew ? 'POST' : 'PATCH';
      const endpoint = isNew 
        ? `${API_BASE}/api/admin/static-content` 
        : `${API_BASE}/api/admin/static-content/${editItem.key}`;

      const res = await fetch(endpoint, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(editItem)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save item');
      }

      setSnackbar(`'${editItem.title}' saved successfully!`);
      setOpenModal(false);
      setEditItem(null);
      fetchItems();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingKey(null);
    }
  };

  const handleSaveMatchDetails = async () => {
    if (!editMatchModal || !selectedLeagueId) return;
    setSavingMatch(true);
    try {
      const matchId = editMatchModal.id;
      const res = await fetch(`${API_BASE}/leagues/${selectedLeagueId}/matches/${matchId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          homeTeamName: editMatchModal.homeTeamName,
          awayTeamName: editMatchModal.awayTeamName,
          homeScore: Number(editMatchModal.homeScore || 0),
          awayScore: Number(editMatchModal.awayScore || 0),
          status: editMatchModal.status,
          venue: editMatchModal.venue,
          matchDate: editMatchModal.matchDate
        })
      });
      const data = await res.json();

      // Update local dbMatches array
      setDbMatches(prev => prev.map(m => m.id === matchId ? {
        ...m,
        homeTeamName: editMatchModal.homeTeamName,
        awayTeamName: editMatchModal.awayTeamName,
        homeScore: Number(editMatchModal.homeScore || 0),
        awayScore: Number(editMatchModal.awayScore || 0),
        status: editMatchModal.status,
        venue: editMatchModal.venue,
        matchDate: editMatchModal.matchDate
      } : m));

      setSnackbar('Match details updated successfully!');
      setEditMatchModal(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save match');
    } finally {
      setSavingMatch(false);
    }
  };

  const handleDeleteItem = async (key: string) => {
    if (!confirm(`Are you sure you want to delete content entry '${key}'?`)) return;

    setSavingKey(key);
    try {
      const res = await fetch(`${API_BASE}/api/admin/static-content/${key}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete item');
      }

      setSnackbar(`Item '${key}' deleted.`);
      fetchItems();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingKey(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  const openEditDialog = (item: StaticContentItem) => {
    setEditItem({ ...item });
    setIsNew(false);
    setOpenModal(true);
  };

  const openNewDialog = () => {
    setEditItem({
      key: '',
      category: activeTab === 'all' ? 'general' : activeTab,
      title: '',
      content: '',
      metadata: {},
      isActive: true
    });
    setIsNew(true);
    setOpenModal(true);
  };

  // Filter items by selected Page Tab
  const filteredItems = items.filter(item => {
    if (item.key === 'announcement_banner' || item.key === 'app_rules' || item.key === 'faq' || item.category === 'faq') return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'rewards') return item.category === 'rewards';
    if (activeTab === 'home') return item.category === 'home';
    if (activeTab === 'rules') return item.category === 'general' || item.category === 'contact' || item.category === 'legal';
    return item.category === activeTab;
  });

  const allTabItems = NAVIGATION_ITEMS.flatMap(n => n.items);
  const currentTabInfo = allTabItems.find(t => t.id === activeTab);

  // Filter DB Explorer Data
  const filteredLeagues = dbLeagues.filter(l => 
    (l.name || '').toLowerCase().includes(leagueSearch.toLowerCase()) ||
    (l.adminName || '').toLowerCase().includes(leagueSearch.toLowerCase())
  );

  const selectedLeague = dbLeagues.find(l => l.id === selectedLeagueId);

  const matchCounts = {
    all: dbMatches.length,
    scheduled: dbMatches.filter(m => !m.deleted && !m.archived && (m.status || '').toUpperCase() === 'SCHEDULED').length,
    live: dbMatches.filter(m => !m.deleted && !m.archived && ['ONGOING', 'LIVE', 'IN_PROGRESS'].includes((m.status || '').toUpperCase())).length,
    published: dbMatches.filter(m => !m.deleted && !m.archived && ['RESULT_PUBLISHED', 'RESULT_UPLOADED', 'UPLOADED', 'COMPLETE', 'FINISHED'].includes((m.status || '').toUpperCase())).length,
    archived: dbMatches.filter(m => Boolean(m.archived)).length,
    deleted: dbMatches.filter(m => Boolean(m.deleted)).length,
  };

  const filteredMatches = dbMatches.filter(m => {
    const homeName = m.homeTeamName || m.homeTeam?.name || m.home_team_name || '';
    const awayName = m.awayTeamName || m.awayTeam?.name || m.away_team_name || '';
    const venue = m.venue || '';
    const matchesQuery = 
      homeName.toLowerCase().includes(matchSearch.toLowerCase()) ||
      awayName.toLowerCase().includes(matchSearch.toLowerCase()) ||
      venue.toLowerCase().includes(matchSearch.toLowerCase());

    if (!matchesQuery) return false;

    if (matchStatusFilter === 'ALL') return true;
    if (matchStatusFilter === 'ARCHIVED') return Boolean(m.archived);
    if (matchStatusFilter === 'DELETED') return Boolean(m.deleted);
    if (matchStatusFilter === 'SCHEDULED') return !m.deleted && !m.archived && (m.status || '').toUpperCase() === 'SCHEDULED';
    if (matchStatusFilter === 'ONGOING') return !m.deleted && !m.archived && ['ONGOING', 'LIVE', 'IN_PROGRESS'].includes((m.status || '').toUpperCase());
    if (matchStatusFilter === 'RESULT_PUBLISHED') return !m.deleted && !m.archived && ['RESULT_PUBLISHED', 'RESULT_UPLOADED', 'UPLOADED', 'COMPLETE', 'FINISHED'].includes((m.status || '').toUpperCase());

    return (m.status || '').toUpperCase() === matchStatusFilter;
  });


  // Sidebar Component Logic
  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#131b2e', color: '#fff' }}>
      {/* Sidebar Header */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Image src={cflogo} alt="Champion Footballer" width={180} height={55} style={{ objectFit: 'contain' }} />
        <Chip
          icon={<ShieldIcon style={{ color: '#00ff88' }} />}
          label="SUPER ADMIN CMS"
          sx={{ bgcolor: 'rgba(0,255,136,0.1)', color: '#00ff88', fontWeight: 800, border: '1px solid rgba(0,255,136,0.3)', width: 'fit-content' }}
        />
      </Box>

      {/* Sidebar Navigation Items */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {NAVIGATION_ITEMS.map((group, idx) => (
          <Box key={idx} sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ color: '#00ff88', fontWeight: 800, letterSpacing: 1.2, display: 'block', px: 1.5, mb: 1 }}>
              {group.section}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                const count = item.id === 'db_explorer' ? dbLeagues.length : items.filter(i => {
                  if (i.key === 'faq' || i.category === 'faq') return false;
                  if (item.id === 'all') return true;
                  if (item.id === 'rewards') return i.category === 'rewards';
                  if (item.id === 'home') return i.category === 'home';
                  if (item.id === 'rules') return i.category === 'general' || i.category === 'contact' || i.category === 'legal';
                  return i.category === item.id;
                }).length;

                return (
                  <Button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (isMobile) setMobileOpen(false);
                    }}
                    startIcon={item.icon}
                    fullWidth
                    sx={{
                      justify: 'space-between',
                      textAlign: 'left',
                      py: 1.2,
                      px: 2,
                      borderRadius: 2,
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '0.88rem',
                      color: isActive ? '#00ff88' : '#94a3b8',
                      bgcolor: isActive ? 'rgba(0,255,136,0.12)' : 'transparent',
                      borderLeft: isActive ? '3px solid #00ff88' : '3px solid transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: isActive ? 'rgba(0,255,136,0.18)' : 'rgba(255,255,255,0.04)',
                        color: isActive ? '#00ff88' : '#fff'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'inherit', color: 'inherit' }}>
                          {item.label}
                        </Typography>
                        {item.isFeatured && (
                          <Chip label="EXPLORER" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, bgcolor: '#00ff88', color: '#0a0e17' }} />
                        )}
                      </Box>
                      <Chip
                        label={count}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          bgcolor: isActive ? 'rgba(0,255,136,0.25)' : 'rgba(255,255,255,0.1)',
                          color: isActive ? '#00ff88' : '#cbd5e1'
                        }}
                      />
                    </Box>
                  </Button>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Sidebar Footer Controls */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            fetchItems();
            fetchDbLeagues();
            if (selectedLeagueId) {
              fetchDbSeasons(selectedLeagueId);
              fetchDbMatches(selectedLeagueId, selectedSeasonId);
            }
          }}
          startIcon={<RefreshIcon />}
          fullWidth
          sx={{ color: '#94a3b8', borderColor: '#334155', borderRadius: 2 }}
        >
          Refresh All Data
        </Button>
        <Button
          variant="outlined"
          size="small"
          color="error"
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
          fullWidth
          sx={{ borderRadius: 2 }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0e17', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Top Mobile Bar */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', justifyContent: 'space-between', bgcolor: '#131b2e', p: 2, borderBottom: '1px solid rgba(0,255,136,0.2)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => setMobileOpen(!mobileOpen)} sx={{ color: '#00ff88' }}>
            <MenuIcon />
          </IconButton>
          <Image src={cflogo} alt="Champion Footballer" width={140} height={40} style={{ objectFit: 'contain' }} />
        </Box>
        <Chip label="ADMIN" size="small" sx={{ bgcolor: '#00ff88', color: '#0a0e17', fontWeight: 800 }} />
      </Box>

      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Desktop Permanent Sidebar */}
        <Box sx={{ display: { xs: 'none', md: 'block' }, width: 280, flexShrink: 0, borderRight: '1px solid rgba(0,255,136,0.15)', sticky: 'top', height: '100vh' }}>
          {sidebarContent}
        </Box>

        {/* Mobile Temporary Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, bgcolor: '#131b2e' },
          }}
        >
          {sidebarContent}
        </Drawer>

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 4 }, maxWidth: '100%', overflowX: 'hidden' }}>
          {/* Header Banner */}
          <Box sx={{ mb: 4, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: 1.5, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {currentTabInfo?.icon}
                {currentTabInfo?.label}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
                {currentTabInfo?.description}
              </Typography>
            </Box>

            {activeTab !== 'db_explorer' && (
              <Button
                variant="contained"
                onClick={openNewDialog}
                startIcon={<AddIcon />}
                sx={{ bgcolor: '#00ff88', color: '#0a0e17', fontWeight: 800, '&:hover': { bgcolor: '#00cc6c' } }}
              >
                Add Content Item
              </Button>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              {error}
            </Alert>
          )}

          {/* SECTION 1: DATABASE LEAGUES, SEASONS & MATCHES EXPLORER */}
          {activeTab === 'db_explorer' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* STEP 1: LEAGUES SELECTOR SECTION */}
              <Paper sx={{ p: 3, bgcolor: '#131b2e', borderRadius: 3, border: '1px solid rgba(0,255,136,0.2)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#00ff88', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StorageIcon /> Database Leagues ({filteredLeagues.length})
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                      Select a league from the database to view its seasons and match fixtures
                    </Typography>
                  </Box>

                  <TextField
                    size="small"
                    placeholder="Search leagues or admins..."
                    value={leagueSearch}
                    onChange={(e) => setLeagueSearch(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#00ff88' }} /></InputAdornment>,
                      style: { color: '#fff', backgroundColor: 'rgba(15,23,42,0.6)', borderRadius: 8 }
                    }}
                    sx={{ minWidth: 260 }}
                  />
                </Box>

                {loadingDbLeagues ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={32} sx={{ color: '#00ff88' }} />
                  </Box>
                ) : filteredLeagues.length === 0 ? (
                  <Alert severity="info" sx={{ bgcolor: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
                    No leagues found in the database.
                  </Alert>
                ) : (
                  <Box sx={{ maxHeight: 450, overflowY: 'auto', pr: 0.5, '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,255,136,0.3)', borderRadius: 3 } }}>
                    <Grid container spacing={2}>
                      {filteredLeagues.map((league) => {
                        const isSelected = selectedLeagueId === league.id;
                        return (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={league.id}>
                            <Card
                              onClick={() => handleLeagueSelect(league.id)}
                              sx={{
                                bgcolor: isSelected ? 'rgba(0,255,136,0.1)' : '#0a0e17',
                                border: isSelected ? '2px solid #00ff88' : '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 3,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: isSelected ? '0 0 15px rgba(0,255,136,0.2)' : 'none',
                                '&:hover': {
                                  borderColor: '#00ff88',
                                  transform: 'translateY(-2px)'
                                }
                              }}
                            >
                              <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                  <Avatar
                                    src={league.image || undefined}
                                    sx={{ width: 44, height: 44, bgcolor: '#00ff88', color: '#0a0e17', fontWeight: 800 }}
                                  >
                                    {league.name ? league.name.charAt(0).toUpperCase() : 'L'}
                                  </Avatar>
                                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {league.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                                      Admin: {league.adminName || 'Super Admin'}
                                    </Typography>
                                  </Box>
                                </Box>

                                <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                  <Chip
                                    icon={<PeopleIcon style={{ fontSize: 14, color: '#60a5fa' }} />}
                                    label={`${league.memberCount || 0} Members`}
                                    size="small"
                                    sx={{ height: 22, fontSize: '0.7rem', bgcolor: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}
                                  />
                                  <Chip
                                    icon={<SportsSoccerIcon style={{ fontSize: 14, color: '#00ff88' }} />}
                                    label={`${league.totalMatchCount || 0} Matches`}
                                    size="small"
                                    sx={{ height: 22, fontSize: '0.7rem', bgcolor: 'rgba(0,255,136,0.15)', color: '#00ff88' }}
                                  />
                                </Box>

                                <Button
                                  fullWidth
                                  size="small"
                                  variant={isSelected ? 'contained' : 'outlined'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLeagueSelect(league.id);
                                  }}
                                  sx={{
                                    mt: 1.5,
                                    bgcolor: isSelected ? '#00ff88' : 'transparent',
                                    color: isSelected ? '#0a0e17' : '#00ff88',
                                    borderColor: 'rgba(0,255,136,0.3)',
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                    '&:hover': { bgcolor: isSelected ? '#00cc6c' : 'rgba(0,255,136,0.1)' }
                                  }}
                                >
                                  {isSelected ? '✓ Viewing Seasons ↓' : 'View Seasons & Matches ↓'}
                                </Button>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                )}
              </Paper>

              {/* STEP 2: SEASONS SELECTOR SECTION */}
              {selectedLeague && (
                <Paper ref={seasonsRef} sx={{ p: 3, bgcolor: '#131b2e', borderRadius: 3, border: '1px solid rgba(0,255,136,0.2)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#00ff88', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarMonthIcon /> Seasons in "{selectedLeague.name}" ({dbSeasons.length})
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        Click a season card to filter matches or inspect season details
                      </Typography>
                    </Box>

                    {/* Season Filter Chips */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`All Seasons (${dbMatches.length} matches)`}
                        onClick={() => setSelectedSeasonId('all')}
                        sx={{
                          bgcolor: selectedSeasonId === 'all' ? '#00ff88' : 'rgba(255,255,255,0.08)',
                          color: selectedSeasonId === 'all' ? '#0a0e17' : '#fff',
                          fontWeight: 800,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: selectedSeasonId === 'all' ? '#00cc6c' : 'rgba(255,255,255,0.15)' }
                        }}
                      />
                    </Box>
                  </Box>

                  {loadingDbSeasons ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress size={32} sx={{ color: '#00ff88' }} />
                    </Box>
                  ) : dbSeasons.length === 0 ? (
                    <Alert severity="info" sx={{ bgcolor: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
                      No seasons created yet for this league.
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {dbSeasons.map((season) => {
                        const isSeasonSelected = selectedSeasonId === season.id;
                        const playersCount = season.players?.length || season.playerCount || selectedLeague?.memberCount || 0;
                        const maxGamesVal = season.maxGames || selectedLeague?.maxGames || 'Unlimited';

                        return (
                          <Grid item xs={12} sm={6} md={4} key={season.id}>
                            <Card
                              onClick={() => setSelectedSeasonId(season.id)}
                              sx={{
                                bgcolor: isSeasonSelected ? 'rgba(0,255,136,0.12)' : '#0a0e17',
                                border: isSeasonSelected ? '2px solid #00ff88' : '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 3,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: isSeasonSelected ? '0 0 15px rgba(0,255,136,0.2)' : 'none',
                                '&:hover': {
                                  borderColor: '#00ff88',
                                  transform: 'translateY(-2px)'
                                }
                              }}
                            >
                              <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                  <Chip
                                    label={`SEASON ${season.seasonNumber || 1}`}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(59,130,246,0.2)', color: '#60a5fa', fontWeight: 800, fontSize: '0.75rem' }}
                                  />
                                  <Chip
                                    label={season.deleted ? 'DELETED' : season.archived ? 'ARCHIVED' : season.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    size="small"
                                    sx={{
                                      bgcolor: season.deleted ? 'rgba(239,68,68,0.2)' : season.archived ? 'rgba(249,115,22,0.2)' : season.isActive ? 'rgba(0,255,136,0.2)' : 'rgba(148,163,184,0.15)',
                                      color: season.deleted ? '#ef4444' : season.archived ? '#f97316' : season.isActive ? '#00ff88' : '#94a3b8',
                                      fontWeight: 800,
                                      fontSize: '0.65rem'
                                    }}
                                  />
                                </Box>

                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', mb: 1 }}>
                                  {season.name || `Season ${season.seasonNumber || 1}`}
                                </Typography>

                                <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>Max Games:</Typography>
                                    <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700 }}>{maxGamesVal}</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>Invite Code:</Typography>
                                    <Typography variant="caption" sx={{ color: '#00ff88', fontFamily: 'monospace', fontWeight: 700 }}>{season.inviteCode || 'N/A'}</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>Registered Players:</Typography>
                                    <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700 }}>{playersCount} Players</Typography>
                                  </Box>
                                </Box>

                                <Button
                                  fullWidth
                                  size="small"
                                  variant={isSeasonSelected ? 'contained' : 'outlined'}
                                  sx={{
                                    mt: 2,
                                    bgcolor: isSeasonSelected ? '#00ff88' : 'transparent',
                                    color: isSeasonSelected ? '#0a0e17' : '#00ff88',
                                    borderColor: 'rgba(0,255,136,0.3)',
                                    fontWeight: 800,
                                    '&:hover': { bgcolor: isSeasonSelected ? '#00cc6c' : 'rgba(0,255,136,0.1)' }
                                  }}
                                >
                                  {isSeasonSelected ? 'Season Selected' : 'View Season Matches'}
                                </Button>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                </Paper>
              )}

              {/* STEP 3: MATCHES FIXTURES EXPLORER SECTION */}
              {selectedLeague && (

                <Paper sx={{ p: 3, bgcolor: '#131b2e', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SportsSoccerIcon sx={{ color: '#00ff88' }} /> Matches & Fixtures ({filteredMatches.length})
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        All recorded matches (Click filter tabs below to view archived or deleted records)
                      </Typography>
                    </Box>

                    <TextField
                      size="small"
                      placeholder="Search teams or venue..."
                      value={matchSearch}
                      onChange={(e) => setMatchSearch(e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#00ff88' }} /></InputAdornment>,
                        style: { color: '#fff', backgroundColor: 'rgba(15,23,42,0.6)', borderRadius: 8 }
                      }}
                      sx={{ minWidth: 260 }}
                    />
                  </Box>

                  {/* Horizontal Filter Tabs for Matches */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3, pb: 1.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {[
                      { id: 'ALL', label: 'All Matches', count: matchCounts.all },
                      { id: 'SCHEDULED', label: 'Scheduled', count: matchCounts.scheduled },
                      { id: 'ONGOING', label: 'Live / Ongoing', count: matchCounts.live },
                      { id: 'RESULT_PUBLISHED', label: 'Published Results', count: matchCounts.published },
                      { id: 'ARCHIVED', label: '📦 Archived Matches', count: matchCounts.archived },
                      { id: 'DELETED', label: '🗑️ Deleted Matches', count: matchCounts.deleted },
                    ].map((tab) => {
                      const isTabActive = matchStatusFilter === tab.id;
                      const isDeleteTab = tab.id === 'DELETED';
                      const isArchiveTab = tab.id === 'ARCHIVED';

                      return (
                        <Chip
                          key={tab.id}
                          label={`${tab.label} (${tab.count})`}
                          onClick={() => setMatchStatusFilter(tab.id)}
                          sx={{
                            py: 2.2,
                            px: 1,
                            borderRadius: 2.5,
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            bgcolor: isTabActive
                              ? (isDeleteTab ? 'rgba(239,68,68,0.25)' : isArchiveTab ? 'rgba(249,115,22,0.25)' : 'rgba(0,255,136,0.25)')
                              : 'rgba(15,23,42,0.6)',
                            color: isTabActive
                              ? (isDeleteTab ? '#ef4444' : isArchiveTab ? '#f97316' : '#00ff88')
                              : '#94a3b8',
                            border: isTabActive
                              ? `2px solid ${isDeleteTab ? '#ef4444' : isArchiveTab ? '#f97316' : '#00ff88'}`
                              : '1px solid rgba(255,255,255,0.08)',
                            boxShadow: isTabActive
                              ? `0 0 12px ${isDeleteTab ? 'rgba(239,68,68,0.3)' : isArchiveTab ? 'rgba(249,115,22,0.3)' : 'rgba(0,255,136,0.3)'}`
                              : 'none',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: isTabActive ? undefined : 'rgba(255,255,255,0.08)',
                              color: isTabActive ? undefined : '#fff'
                            }
                          }}
                        />
                      );
                    })}
                  </Box>


                  {loadingDbMatches ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                      <CircularProgress size={40} sx={{ color: '#00ff88' }} />
                    </Box>
                  ) : filteredMatches.length === 0 ? (
                    <Paper sx={{ p: 5, textAlign: 'center', bgcolor: '#0a0e17', borderRadius: 3, border: '1px dashed rgba(255,255,255,0.1)' }}>
                      <Typography variant="h6" sx={{ color: '#94a3b8' }}>
                        No matches found for this selection.
                      </Typography>
                    </Paper>
                  ) : (
                    <Grid container spacing={2.5}>
                      {filteredMatches.map((match) => {
                        const isDeleted = Boolean(match.deleted);
                        const isArchived = Boolean(match.archived);
                        const isPublished = ['RESULT_PUBLISHED', 'RESULT_UPLOADED', 'UPLOADED', 'COMPLETE', 'FINISHED'].includes((match.status || '').toUpperCase());
                        const isOngoing = ['ONGOING', 'LIVE', 'IN_PROGRESS'].includes((match.status || '').toUpperCase());

                        const statusLabel = isDeleted ? '🗑️ DELETED MATCH' : isArchived ? '📦 ARCHIVED MATCH' : isPublished ? 'RESULT PUBLISHED' : isOngoing ? 'LIVE MATCH' : 'SCHEDULED';
                        const statusColor = isDeleted ? '#ef4444' : isArchived ? '#f97316' : isPublished ? '#eab308' : isOngoing ? '#00ff88' : '#60a5fa';
                        const statusBg = isDeleted ? 'rgba(239,68,68,0.2)' : isArchived ? 'rgba(249,115,22,0.2)' : isPublished ? 'rgba(234,179,8,0.15)' : isOngoing ? 'rgba(0,255,136,0.2)' : 'rgba(59,130,246,0.15)';

                        const homeName = match.homeTeamName || match.homeTeam?.name || match.home_team_name || 'Home Team';
                        const awayName = match.awayTeamName || match.awayTeam?.name || match.away_team_name || 'Away Team';
                        const homeScore = match.homeTeamGoals ?? match.homeScore ?? match.homeTeamScore ?? match.goalsHome ?? match.suggestedHomeGoals ?? 0;
                        const awayScore = match.awayTeamGoals ?? match.awayScore ?? match.awayTeamScore ?? match.goalsAway ?? match.suggestedAwayGoals ?? 0;

                        return (
                          <Grid item xs={12} md={6} key={match.id}>
                            <Card
                              sx={{
                                bgcolor: '#0a0e17',
                                border: isDeleted ? '1px solid rgba(239,68,68,0.4)' : isArchived ? '1px solid rgba(249,115,22,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 3,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: 'rgba(0,255,136,0.4)',
                                  transform: 'translateY(-2px)'
                                }
                              }}
                            >
                              <CardContent sx={{ p: 2.5 }}>
                                {/* Match Header Bar */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                  <Chip
                                    label={statusLabel}
                                    size="small"
                                    sx={{
                                      bgcolor: statusBg,
                                      color: statusColor,
                                      fontWeight: 800,
                                      fontSize: '0.7rem'
                                    }}
                                  />
                                  <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CalendarMonthIcon style={{ fontSize: 14 }} />
                                    {match.matchDate || match.date ? new Date(match.matchDate || match.date).toLocaleDateString() : 'Date TBD'}
                                  </Typography>
                                </Box>

                                {/* Teams & Scores Main Banner */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'rgba(19,27,46,0.8)', p: 2, borderRadius: 2.5, border: '1px solid rgba(255,255,255,0.05)' }}>
                                  {/* Home Team */}
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flex: 1, textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                    <Avatar src={match.homeTeamImage || undefined} sx={{ width: 42, height: 42, bgcolor: 'rgba(59,130,246,0.2)', color: '#60a5fa', fontWeight: 800 }}>
                                      {homeName.charAt(0)}
                                    </Avatar>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff', textAlign: 'center' }}>
                                      {homeName}
                                    </Typography>
                                  </Box>

                                  {/* Score or VS Badge */}
                                  <Box sx={{ px: 2, textAlign: 'center' }}>
                                    {isPublished || isOngoing || homeScore > 0 || awayScore > 0 ? (
                                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#00ff88', letterSpacing: 2 }}>
                                        {homeScore} - {awayScore}
                                      </Typography>
                                    ) : (
                                      <Chip label="VS" size="small" sx={{ bgcolor: 'rgba(0,255,136,0.1)', color: '#00ff88', fontWeight: 900 }} />
                                    )}
                                  </Box>

                                  {/* Away Team */}
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flex: 1, textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                    <Avatar src={match.awayTeamImage || undefined} sx={{ width: 42, height: 42, bgcolor: 'rgba(239,68,68,0.2)', color: '#f87171', fontWeight: 800 }}>
                                      {awayName.charAt(0)}
                                    </Avatar>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff', textAlign: 'center' }}>
                                      {awayName}
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* Venue & Quick Details */}

                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                    Venue: {match.venue || 'Main Pitch'}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
                                    ID: {match.id?.slice(0, 8)}...
                                  </Typography>
                                </Box>

                                <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />

                                {/* Action Buttons - Interactive Modals */}
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => setViewMatchModal(match)}
                                    startIcon={<VisibilityIcon fontSize="small" />}
                                    sx={{ color: '#00ff88', borderColor: 'rgba(0,255,136,0.3)', '&:hover': { borderColor: '#00ff88', bgcolor: 'rgba(0,255,136,0.08)' } }}
                                  >
                                    View Details
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => setEditMatchModal({ ...match })}
                                    startIcon={<EditIcon fontSize="small" />}
                                    sx={{ color: '#60a5fa', borderColor: 'rgba(96,165,250,0.3)', '&:hover': { borderColor: '#60a5fa', bgcolor: 'rgba(96,165,250,0.08)' } }}
                                  >
                                    Edit Match
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => setPitchMatchModal(match)}
                                    startIcon={<SportsSoccerIcon fontSize="small" />}
                                    sx={{ color: '#eab308', borderColor: 'rgba(234,179,8,0.3)', '&:hover': { borderColor: '#eab308', bgcolor: 'rgba(234,179,8,0.08)' } }}
                                  >
                                    Pitch / Play
                                  </Button>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                </Paper>
              )}
            </Box>
          ) : (
            /* SECTION 2: STATIC CONTENT CMS CARDS (EXISTING FUNCTIONALITY) */
            <>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress size={40} sx={{ color: '#00ff88' }} />
                </Box>
              ) : filteredItems.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#131b2e', borderRadius: 3, border: '1px border rgba(255,255,255,0.08)' }}>
                  <Typography variant="h6" sx={{ color: '#94a3b8' }}>
                    No static content items found for {currentTabInfo?.label}.
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {filteredItems.map((item) => (
                    <Grid item xs={12} md={6} lg={4} key={item.key}>
                      <Card
                        sx={{
                          bgcolor: '#131b2e',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 3,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'transform 0.2s ease, border-color 0.2s ease',
                          '&:hover': {
                            borderColor: 'rgba(0,255,136,0.4)',
                            transform: 'translateY(-3px)',
                          }
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                            <Box sx={{ pr: 1 }}>
                              <Chip
                                label={item.category.toUpperCase()}
                                size="small"
                                sx={{ bgcolor: 'rgba(59,130,246,0.15)', color: '#60a5fa', fontWeight: 700, fontSize: '0.65rem', mb: 0.8 }}
                              />
                              <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.25, fontSize: '1.05rem' }}>
                                {item.title}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace', display: 'block', mt: 0.5 }}>
                                API Key: {item.key}
                              </Typography>
                            </Box>
                          </Box>

                          {item.metadata?.xp && (
                            <Box sx={{ mb: 1.5 }}>
                              <Chip
                                label={`XP REWARD: +${item.metadata.xp} XP`}
                                size="small"
                                sx={{ bgcolor: 'rgba(234,179,8,0.15)', color: '#eab308', fontWeight: 800, fontSize: '0.7rem' }}
                              />
                            </Box>
                          )}

                          <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />

                          <Typography
                            variant="body2"
                            sx={{
                              color: '#cbd5e1',
                              whiteSpace: 'pre-wrap',
                              bgcolor: 'rgba(15, 23, 42, 0.6)',
                              p: 1.5,
                              borderRadius: 2,
                              fontSize: '0.85rem',
                              minHeight: '80px',
                              maxHeight: '160px',
                              overflowY: 'auto',
                              border: '1px solid rgba(255,255,255,0.04)'
                            }}
                          >
                            {item.content || '(No text content set)'}
                          </Typography>
                        </CardContent>

                        <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ color: '#475569' }}>
                            Last updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}
                          </Typography>

                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<EditIcon fontSize="small" />}
                              onClick={() => openEditDialog(item)}
                              sx={{ bgcolor: '#00ff88', color: '#0a0e17', fontWeight: 800, '&:hover': { bgcolor: '#00cc6c' } }}
                            >
                              Edit Content
                            </Button>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* MODAL 1: VIEW MATCH DETAILS */}
      <Dialog open={Boolean(viewMatchModal)} onClose={() => setViewMatchModal(null)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#131b2e', color: '#fff', borderRadius: 3, border: '1px solid rgba(0,255,136,0.3)' } }}>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SportsSoccerIcon sx={{ color: '#00ff88' }} />
            <span>Match Details: {viewMatchModal?.homeTeamName || 'Home'} vs {viewMatchModal?.awayTeamName || 'Away'}</span>
          </Box>
          <Chip
            label={(viewMatchModal?.status || 'SCHEDULED').toUpperCase()}
            size="small"
            sx={{ bgcolor: 'rgba(0,255,136,0.2)', color: '#00ff88', fontWeight: 800 }}
          />
        </DialogTitle>
        <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Match Scoreboard */}
          <Paper sx={{ p: 3, bgcolor: '#0a0e17', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Avatar src={viewMatchModal?.homeTeamImage || undefined} sx={{ width: 56, height: 56, bgcolor: 'rgba(59,130,246,0.2)', color: '#60a5fa', fontSize: '1.4rem', fontWeight: 800 }}>
                {(viewMatchModal?.homeTeamName || 'H').charAt(0)}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }}>{viewMatchModal?.homeTeamName || 'Home Team'}</Typography>
            </Box>
            <Box sx={{ px: 3, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#00ff88' }}>
                {viewMatchModal?.homeScore ?? 0} - {viewMatchModal?.awayScore ?? 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
                {viewMatchModal?.venue || 'Main Pitch'} • {viewMatchModal?.matchDate ? new Date(viewMatchModal.matchDate).toLocaleDateString() : 'Date TBD'}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Avatar src={viewMatchModal?.awayTeamImage || undefined} sx={{ width: 56, height: 56, bgcolor: 'rgba(239,68,68,0.2)', color: '#f87171', fontSize: '1.4rem', fontWeight: 800 }}>
                {(viewMatchModal?.awayTeamName || 'A').charAt(0)}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }}>{viewMatchModal?.awayTeamName || 'Away Team'}</Typography>
            </Box>
          </Paper>

          {/* Squad Lists */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper sx={{ p: 2, bgcolor: '#0a0e17', borderRadius: 2, border: '1px solid rgba(59,130,246,0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#60a5fa', mb: 1 }}>
                  🔵 Home Squad ({(viewMatchModal?.homeTeamUsers || []).length} Players)
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 180, overflowY: 'auto' }}>
                  {(viewMatchModal?.homeTeamUsers || []).length === 0 ? (
                    <Typography variant="caption" sx={{ color: '#64748b' }}>No players assigned to Home team</Typography>
                  ) : (
                    (viewMatchModal?.homeTeamUsers || []).map((u: any, idx: number) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={u.profilePicture} sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>{(u.firstName || 'P').charAt(0)}</Avatar>
                        <Typography variant="body2" sx={{ color: '#fff' }}>{u.firstName} {u.lastName}</Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 2, bgcolor: '#0a0e17', borderRadius: 2, border: '1px solid rgba(239,68,68,0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f87171', mb: 1 }}>
                  🔴 Away Squad ({(viewMatchModal?.awayTeamUsers || []).length} Players)
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 180, overflowY: 'auto' }}>
                  {(viewMatchModal?.awayTeamUsers || []).length === 0 ? (
                    <Typography variant="caption" sx={{ color: '#64748b' }}>No players assigned to Away team</Typography>
                  ) : (
                    (viewMatchModal?.awayTeamUsers || []).map((u: any, idx: number) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={u.profilePicture} sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>{(u.firstName || 'P').charAt(0)}</Avatar>
                        <Typography variant="body2" sx={{ color: '#fff' }}>{u.firstName} {u.lastName}</Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Button onClick={() => setViewMatchModal(null)} variant="contained" sx={{ bgcolor: '#00ff88', color: '#0a0e17', fontWeight: 800 }}>
            Close Match Details
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL 2: EDIT MATCH DETAILS */}
      <Dialog open={Boolean(editMatchModal)} onClose={() => setEditMatchModal(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#131b2e', color: '#fff', borderRadius: 3, border: '1px solid rgba(0,255,136,0.3)' } }}>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          ✏️ Edit Match Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Home Team Name"
                fullWidth
                value={editMatchModal?.homeTeamName || ''}
                onChange={(e) => setEditMatchModal((prev: any) => prev ? { ...prev, homeTeamName: e.target.value } : null)}
                InputLabelProps={{ style: { color: '#94a3b8' } }}
                InputProps={{ style: { color: '#fff', backgroundColor: 'rgba(15,23,42,0.6)' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Away Team Name"
                fullWidth
                value={editMatchModal?.awayTeamName || ''}
                onChange={(e) => setEditMatchModal((prev: any) => prev ? { ...prev, awayTeamName: e.target.value } : null)}
                InputLabelProps={{ style: { color: '#94a3b8' } }}
                InputProps={{ style: { color: '#fff', backgroundColor: 'rgba(15,23,42,0.6)' } }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Home Team Score"
                type="number"
                fullWidth
                value={editMatchModal?.homeScore ?? 0}
                onChange={(e) => setEditMatchModal((prev: any) => prev ? { ...prev, homeScore: Number(e.target.value) } : null)}
                InputLabelProps={{ style: { color: '#94a3b8' } }}
                InputProps={{ style: { color: '#fff', backgroundColor: 'rgba(15,23,42,0.6)' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Away Team Score"
                type="number"
                fullWidth
                value={editMatchModal?.awayScore ?? 0}
                onChange={(e) => setEditMatchModal((prev: any) => prev ? { ...prev, awayScore: Number(e.target.value) } : null)}
                InputLabelProps={{ style: { color: '#94a3b8' } }}
                InputProps={{ style: { color: '#fff', backgroundColor: 'rgba(15,23,42,0.6)' } }}
              />
            </Grid>
          </Grid>

          <TextField
            label="Match Venue / Location"
            fullWidth
            value={editMatchModal?.venue || ''}
            onChange={(e) => setEditMatchModal((prev: any) => prev ? { ...prev, venue: e.target.value } : null)}
            InputLabelProps={{ style: { color: '#94a3b8' } }}
            InputProps={{ style: { color: '#fff', backgroundColor: 'rgba(15,23,42,0.6)' } }}
          />

          <FormControl fullWidth>
            <InputLabel style={{ color: '#94a3b8' }}>Match Status</InputLabel>
            <Select
              value={editMatchModal?.status || 'SCHEDULED'}
              onChange={(e) => setEditMatchModal((prev: any) => prev ? { ...prev, status: e.target.value } : null)}
              sx={{ color: '#fff', bgcolor: 'rgba(15,23,42,0.6)' }}
            >
              <MenuItem value="SCHEDULED">Scheduled</MenuItem>
              <MenuItem value="ONGOING">Ongoing / Live</MenuItem>
              <MenuItem value="RESULT_PUBLISHED">Result Published</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Button onClick={() => setEditMatchModal(null)} sx={{ color: '#94a3b8' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveMatchDetails}
            disabled={savingMatch}
            startIcon={<SaveIcon />}
            sx={{ bgcolor: '#00ff88', color: '#0a0e17', fontWeight: 800, '&:hover': { bgcolor: '#00cc6c' } }}
          >
            {savingMatch ? 'Saving...' : 'Save Match Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL 3: PITCH / PLAY FORMATION */}
      <Dialog open={Boolean(pitchMatchModal)} onClose={() => setPitchMatchModal(null)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#131b2e', color: '#fff', borderRadius: 3, border: '1px solid rgba(0,255,136,0.3)' } }}>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SportsSoccerIcon sx={{ color: '#00ff88' }} />
            <span>Pitch & Tactical Formation: {pitchMatchModal?.homeTeamName || 'Home'} vs {pitchMatchModal?.awayTeamName || 'Away'}</span>
          </Box>
          <Chip label="TACTICAL PITCH VIEW" size="small" sx={{ bgcolor: 'rgba(0,255,136,0.2)', color: '#00ff88', fontWeight: 800 }} />
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {/* Pitch Diagram */}
          <Paper sx={{ p: 3, bgcolor: '#143823', borderRadius: 3, border: '2px solid #00ff88', minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'space-around', position: 'relative' }}>
            {/* Center Line */}
            <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, bgcolor: 'rgba(255,255,255,0.3)' }} />
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', width: 80, height: 80, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', transform: 'translate(-50%, -50%)' }} />

            {/* Home Side Pitch */}
            <Box sx={{ flex: 1, textAlign: 'center', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Chip label={`${pitchMatchModal?.homeTeamName || 'Home'} (BLUE)`} sx={{ bgcolor: 'rgba(59,130,246,0.9)', color: '#fff', fontWeight: 800, mb: 2 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', maxWidth: 260 }}>
                {(pitchMatchModal?.homeTeamUsers || []).length === 0 ? (
                  <Chip label="No players on pitch" sx={{ bgcolor: 'rgba(0,0,0,0.5)', color: '#94a3b8' }} />
                ) : (
                  (pitchMatchModal?.homeTeamUsers || []).map((u: any, idx: number) => (
                    <Chip key={idx} avatar={<Avatar src={u.profilePicture}>{(u.firstName || 'P').charAt(0)}</Avatar>} label={`${u.firstName} #${u.shirtNumber || (idx + 1)}`} sx={{ bgcolor: '#3b82f6', color: '#fff', fontWeight: 700 }} />
                  ))
                )}
              </Box>
            </Box>

            {/* Away Side Pitch */}
            <Box sx={{ flex: 1, textAlign: 'center', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Chip label={`${pitchMatchModal?.awayTeamName || 'Away'} (RED)`} sx={{ bgcolor: 'rgba(239,68,68,0.9)', color: '#fff', fontWeight: 800, mb: 2 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', maxWidth: 260 }}>
                {(pitchMatchModal?.awayTeamUsers || []).length === 0 ? (
                  <Chip label="No players on pitch" sx={{ bgcolor: 'rgba(0,0,0,0.5)', color: '#94a3b8' }} />
                ) : (
                  (pitchMatchModal?.awayTeamUsers || []).map((u: any, idx: number) => (
                    <Chip key={idx} avatar={<Avatar src={u.profilePicture}>{(u.firstName || 'P').charAt(0)}</Avatar>} label={`${u.firstName} #${u.shirtNumber || (idx + 1)}`} sx={{ bgcolor: '#ef4444', color: '#fff', fontWeight: 700 }} />
                  ))
                )}
              </Box>
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Button onClick={() => setPitchMatchModal(null)} variant="contained" sx={{ bgcolor: '#00ff88', color: '#0a0e17', fontWeight: 800 }}>
            Close Pitch View
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit / New Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#131b2e', color: '#fff', borderRadius: 3, border: '1px solid rgba(0,255,136,0.2)' } }}>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {isNew ? `Create New Content for ${currentTabInfo?.label}` : `Edit Content: ${editItem?.title}`}
        </DialogTitle>

        <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {editItem?.key === 'how_to_play' && (
            <Alert severity="info" sx={{ bgcolor: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', fontWeight: 600 }}>
              💡 <b>How to Play Editor Guide:</b><br />
              • <b>Text Content box:</b> Edit the title & description text for all 10 steps.<br />
              • <b>Step Images section below:</b> Upload custom images or paste image URLs for Step 1 through Step 10.
            </Alert>
          )}
          {editItem?.key === 'game_rules' && (
            <Alert severity="info" sx={{ bgcolor: 'rgba(0,255,136,0.15)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)', fontWeight: 600 }}>
              ⚽ <b>Game Rules Editor Guide:</b><br />
              Edit the JSON array in the <b>Text Content</b> box to update point scoring descriptions, XP awards, and classic scoring points for each action.
            </Alert>
          )}
          {editItem?.key === 'xp_status' && (
            <Alert severity="info" sx={{ bgcolor: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)', fontWeight: 600 }}>
              ⭐ <b>XP Status Editor Guide:</b><br />
              Edit the JSON array in the <b>Text Content</b> box to update levels, milestone titles, XP ranges, descriptions, and star colors.
            </Alert>
          )}

          <TextField
            label="API Key (Unique identifier)"
            fullWidth
            value={editItem?.key || ''}
            onChange={(e) => setEditItem(prev => prev ? { ...prev, key: e.target.value } : null)}
            disabled={!isNew}
            helperText="E.g. reward_hat_trick_hero, app_rules, announcement_banner, faq"
            InputLabelProps={{ style: { color: '#94a3b8' } }}
            InputProps={{ style: { color: '#fff', backgroundColor: 'rgba(15,23,42,0.6)' } }}
          />

          <TextField
            label="Category / Page Tag"
            fullWidth
            value={editItem?.category || activeTab}
            onChange={(e) => setEditItem(prev => prev ? { ...prev, category: e.target.value } : null)}
            helperText="E.g. rewards, home, general, faq, contact, legal"
            InputLabelProps={{ style: { color: '#94a3b8' } }}
            InputProps={{ style: { color: '#fff', backgroundColor: 'rgba(15,23,42,0.6)' } }}
          />

          <TextField
            label="Display Title"
            fullWidth
            value={editItem?.title || ''}
            onChange={(e) => setEditItem(prev => prev ? { ...prev, title: e.target.value } : null)}
            InputLabelProps={{ style: { color: '#94a3b8' } }}
            InputProps={{ style: { color: '#fff', backgroundColor: 'rgba(15,23,42,0.6)' } }}
          />

          {(() => {
            const isImageItem = Boolean(
              editItem?.key === 'how_to_play' ||
              editItem?.key === 'page_profile_images' ||
              editItem?.key?.includes('image') ||
              editItem?.key?.includes('icon') ||
              editItem?.key?.includes('avatar') ||
              editItem?.key?.includes('banner')
            );

            return (
              <>
                {!isImageItem && (
                  <TextField
                    label="Text Content (Markdown / Plain Text)"
                    fullWidth
                    multiline
                    rows={6}
                    value={editItem?.content || ''}
                    onChange={(e) => setEditItem(prev => prev ? { ...prev, content: e.target.value } : null)}
                    InputLabelProps={{ style: { color: '#94a3b8' } }}
                    InputProps={{ style: { color: '#fff', backgroundColor: 'rgba(15,23,42,0.6)' } }}
                  />
                )}

                {editItem?.key === 'how_to_play' && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(15,23,42,0.8)', borderRadius: 2, border: '1px solid rgba(0,255,136,0.3)' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#00ff88', mb: 1, fontSize: '1.1rem' }}>
                      📸 How to Play Step Images (Upload or Set Image URL for Each Step)
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                      You can upload a custom image or paste an image URL for any of the 10 steps. These images will display under each step in the website modal.
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      {[
                        { key: 'step1', title: 'Step 1: Complete Your Player Card' },
                        { key: 'step2', title: 'Step 2: Join or Create a League' },
                        { key: 'step3', title: 'Step 3: Create a New Match' },
                        { key: 'step4', title: 'Step 4: Confirm Your Availability' },
                        { key: 'step5', title: 'Step 5: Team Selection' },
                        { key: 'step6', title: 'Step 6: Play the Match' },
                        { key: 'step7', title: 'Step 7: Submit the Match Result' },
                        { key: 'step8', title: 'Step 8: Add Your Individual Stats' },
                        { key: 'step9', title: 'Step 9: Track Your Performance' },
                        { key: 'step10', title: 'Step 10: Trophy Room and Awards' }
                      ].map((step) => {
                        const currentImg = editItem.metadata?.stepImages?.[step.key] || '';
                        return (
                          <Box key={step.key} sx={{ p: 2, bgcolor: 'rgba(30,41,59,0.7)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fff', mb: 1 }}>
                              {step.title}
                            </Typography>
                            {currentImg && (
                              <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <img
                                  src={currentImg}
                                  alt={step.title}
                                  style={{ width: 140, height: 75, objectFit: 'contain', borderRadius: 6, border: '1px solid rgba(0,255,136,0.3)', backgroundColor: '#0a0e17' }}
                                />
                                <Typography variant="caption" sx={{ color: '#00ff88', wordBreak: 'break-all' }}>
                                  Custom Image Active
                                </Typography>
                              </Box>
                            )}
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                              <Button
                                variant="contained"
                                component="label"
                                size="small"
                                sx={{ bgcolor: 'rgba(0,255,136,0.2)', color: '#00ff88', border: '1px solid #00ff88', '&:hover': { bgcolor: 'rgba(0,255,136,0.3)' } }}
                              >
                                Upload Image File
                                <input
                                  type="file"
                                  accept="image/*"
                                  hidden
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      setSavingKey(`upload_${step.key}`);
                                      const formData = new FormData();
                                      formData.append('image', file);
                                      const token = localStorage.getItem('token');
                                      const res = await fetch(`${API_BASE}/api/admin/static-content/upload-image`, {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${token}` },
                                        body: formData
                                      });
                                      const data = await res.json();
                                      if (!res.ok || !data.success) throw new Error(data.message || 'Upload failed');
                                      setEditItem(prev => {
                                        if (!prev) return null;
                                        const meta = prev.metadata || {};
                                        const stepImgs = meta.stepImages || {};
                                        return {
                                          ...prev,
                                          metadata: {
                                            ...meta,
                                            stepImages: { ...stepImgs, [step.key]: data.imageUrl }
                                          }
                                        };
                                      });
                                      setSnackbar(`${step.title} image uploaded successfully!`);
                                    } catch (err: any) {
                                      setError(err.message || 'Image upload failed');
                                    } finally {
                                      setSavingKey(null);
                                    }
                                  }}
                                />
                              </Button>
                              <TextField
                                size="small"
                                placeholder="Or paste image URL (e.g. https://...)"
                                value={currentImg}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditItem(prev => {
                                    if (!prev) return null;
                                    const meta = prev.metadata || {};
                                    const stepImgs = meta.stepImages || {};
                                    return {
                                      ...prev,
                                      metadata: {
                                        ...meta,
                                        stepImages: { ...stepImgs, [step.key]: val }
                                      }
                                    };
                                  });
                                }}
                                sx={{ flex: 1, minWidth: 200, '& input': { color: '#fff', fontSize: '0.85rem' } }}
                              />
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {editItem?.key === 'page_landing_images' && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(15,23,42,0.8)', borderRadius: 2, border: '1px solid rgba(0,255,136,0.3)' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#00ff88', mb: 1, fontSize: '1.1rem' }}>
                      📸 Main Landing Page All Banners & Images (Upload or Set Image URL)
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                      Upload custom image files or paste image URLs for all 7 main landing page hero banners, squad grid cards, and feature card images.
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      {[
                        { key: 'hero_top_bg', title: '1. Main Hero Top Banner Image' },
                        { key: 'hero_grid_team1', title: '2. Team Squad Grid Card 1 Image' },
                        { key: 'hero_grid_orange', title: '3. Orange Players Grid Card 2 Image' },
                        { key: 'feature1_img', title: '4. Feature Card 1 Image (Create Player Card)' },
                        { key: 'feature2_img', title: '5. Feature Card 2 Image (Leagues & Matches)' },
                        { key: 'feature3_img', title: '6. Feature Card 3 Image (Track Performance)' },
                        { key: 'feature4_img', title: '7. Feature Card 4 Image (Trophies & Rewards)' },
                      ].map((item) => {
                        const currentImg = editItem.metadata?.stepImages?.[item.key] || '';
                        return (
                          <Box key={item.key} sx={{ p: 2, bgcolor: 'rgba(30,41,59,0.7)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fff', mb: 1 }}>
                              {item.title}
                            </Typography>
                            {currentImg && (
                              <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <img
                                  src={currentImg}
                                  alt={item.title}
                                  style={{ width: 140, height: 75, objectFit: 'contain', borderRadius: 6, border: '1px solid rgba(0,255,136,0.3)', backgroundColor: '#0a0e17' }}
                                />
                                <Typography variant="caption" sx={{ color: '#00ff88', wordBreak: 'break-all' }}>
                                  Custom Image Active
                                </Typography>
                              </Box>
                            )}
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                              <Button
                                variant="contained"
                                component="label"
                                size="small"
                                sx={{ bgcolor: 'rgba(0,255,136,0.2)', color: '#00ff88', border: '1px solid #00ff88', '&:hover': { bgcolor: 'rgba(0,255,136,0.3)' } }}
                              >
                                Upload Image File
                                <input
                                  type="file"
                                  accept="image/*"
                                  hidden
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      setSavingKey(`upload_${item.key}`);
                                      const formData = new FormData();
                                      formData.append('image', file);
                                      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
                                      const res = await fetch(`${API_BASE}/api/admin/static-content/upload-image`, {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${token}` },
                                        body: formData
                                      });
                                      const data = await res.json();
                                      if (data.success && data.imageUrl) {
                                        const imgUrl = data.imageUrl;
                                        setEditItem((prev) => {
                                          if (!prev) return null;
                                          const meta = prev.metadata || {};
                                          const stepImgs = meta.stepImages || {};
                                          return {
                                            ...prev,
                                            metadata: {
                                              ...meta,
                                              stepImages: { ...stepImgs, [item.key]: imgUrl }
                                            }
                                          };
                                        });
                                        setSnackbar(`Uploaded image for ${item.title}`);
                                      } else {
                                        setError(data.message || 'Image upload failed');
                                      }
                                    } catch (err: any) {
                                      setError(err.message || 'Image upload failed');
                                    } finally {
                                      setSavingKey(null);
                                    }
                                  }}
                                />
                              </Button>
                              <TextField
                                size="small"
                                placeholder="Or paste image URL (e.g. https://...)"
                                value={currentImg}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditItem((prev) => {
                                    if (!prev) return null;
                                    const meta = prev.metadata || {};
                                    const stepImgs = meta.stepImages || {};
                                    return {
                                      ...prev,
                                      metadata: {
                                        ...meta,
                                        stepImages: { ...stepImgs, [item.key]: val }
                                      }
                                    };
                                  });
                                }}
                                sx={{ flex: 1, minWidth: 200, '& input': { color: '#fff', fontSize: '0.85rem' } }}
                              />
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {editItem?.key === 'social_media_links' && (
                  <Box sx={{ mt: 2, p: 2.5, bgcolor: 'rgba(15,23,42,0.8)', borderRadius: 3, border: '1px solid rgba(0,255,136,0.3)' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#00ff88', mb: 0.5, fontSize: '1.1rem' }}>
                      🌐 Social Media Profile Links & Footer Icons
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                      Add or edit profile links for social media icons. If a link is entered, its icon will automatically appear in the footer. Empty links stay hidden.
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
                      {[
                        { key: 'facebook', title: 'Facebook URL', placeholder: 'https://facebook.com/yourpage' },
                        { key: 'x', title: 'Twitter URL', placeholder: 'https://x.com/yourpage' },
                        { key: 'instagram', title: 'Instagram URL', placeholder: 'https://instagram.com/yourpage' },
                        { key: 'linkedin', title: 'LinkedIn URL', placeholder: 'https://linkedin.com/yourpage' },
                        { key: 'youtube', title: 'YouTube URL', placeholder: 'https://youtube.com/yourpage' },
                        { key: 'tiktok', title: 'TikTok URL', placeholder: 'https://tiktok.com/yourpage' },
                        { key: 'pinterest', title: 'Pinterest URL', placeholder: 'https://pinterest.com/yourpage' },
                        { key: 'whatsapp', title: 'WhatsApp URL', placeholder: 'https://whatsapp.com/yourpage' },
                        { key: 'telegram', title: 'Telegram URL', placeholder: 'https://telegram.com/yourpage' },
                        { key: 'reddit', title: 'Reddit URL', placeholder: 'https://reddit.com/yourpage' },
                        { key: 'threads', title: 'Threads URL', placeholder: 'https://threads.com/yourpage' },
                        { key: 'snapchat', title: 'Snapchat URL', placeholder: 'https://snapchat.com/yourpage' },
                        { key: 'twitch', title: 'Twitch URL', placeholder: 'https://twitch.com/yourpage' },
                        { key: 'discord', title: 'Discord URL', placeholder: 'https://discord.com/yourpage' },
                      ].map((platform) => {
                        const currentVal = editItem.metadata?.socialLinks?.[platform.key] || '';
                        return (
                          <Box key={platform.key} sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.85rem' }}>
                              {platform.title}
                            </Typography>
                            <TextField
                              size="small"
                              fullWidth
                              placeholder={platform.placeholder}
                              value={currentVal}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditItem((prev) => {
                                  if (!prev) return null;
                                  const meta = prev.metadata || {};
                                  const links = meta.socialLinks || {};
                                  return {
                                    ...prev,
                                    metadata: {
                                      ...meta,
                                      socialLinks: { ...links, [platform.key]: val }
                                    }
                                  };
                                });
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: 'rgba(30,41,59,0.7)',
                                  borderRadius: '8px',
                                  '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                                  '&:hover fieldset': { borderColor: '#00ff88' },
                                  '&.Mui-focused fieldset': { borderColor: '#00ff88' },
                                  '& input': { color: '#ffffff', fontSize: '0.88rem', py: 1 }
                                },
                                '& input::placeholder': { color: '#64748b', opacity: 1 }
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {editItem?.key === 'page_profile_images' && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(15,23,42,0.8)', borderRadius: 2, border: '1px solid rgba(0,255,136,0.3)' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#00ff88', mb: 1, fontSize: '1.1rem' }}>
                      📸 Profile Page Skill Icons (Upload or Set Image URL)
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                      Upload custom image files or paste image URLs for the 6 Profile Page skill icons (Dribbling, Shooting, Passing, Pace, Defending, Physical).
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      {[
                        { key: 'dribbling', title: '1. Dribbling Skill Icon' },
                        { key: 'shooting', title: '2. Shooting Skill Icon' },
                        { key: 'passing', title: '3. Passing Skill Icon' },
                        { key: 'pace', title: '4. Pace Skill Icon' },
                        { key: 'defending', title: '5. Defending Skill Icon' },
                        { key: 'physical', title: '6. Physical Skill Icon' },
                      ].map((item) => {
                        const currentImg = editItem.metadata?.stepImages?.[item.key] || '';
                        return (
                          <Box key={item.key} sx={{ p: 2, bgcolor: 'rgba(30,41,59,0.7)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fff', mb: 1 }}>
                              {item.title}
                            </Typography>
                            {currentImg && (
                              <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <img
                                  src={currentImg}
                                  alt={item.title}
                                  style={{ width: 140, height: 75, objectFit: 'contain', borderRadius: 6, border: '1px solid rgba(0,255,136,0.3)', backgroundColor: '#0a0e17' }}
                                />
                                <Typography variant="caption" sx={{ color: '#00ff88', wordBreak: 'break-all' }}>
                                  Custom Image Active
                                </Typography>
                              </Box>
                            )}
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                              <Button
                                variant="contained"
                                component="label"
                                size="small"
                                sx={{ bgcolor: 'rgba(0,255,136,0.2)', color: '#00ff88', border: '1px solid #00ff88', '&:hover': { bgcolor: 'rgba(0,255,136,0.3)' } }}
                              >
                                Upload Image File
                                <input
                                  type="file"
                                  accept="image/*"
                                  hidden
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      setSavingKey(`upload_${item.key}`);
                                      const formData = new FormData();
                                      formData.append('image', file);
                                      const token = localStorage.getItem('token');
                                      const res = await fetch(`${API_BASE}/api/admin/static-content/upload-image`, {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${token}` },
                                        body: formData
                                      });
                                      const data = await res.json();
                                      if (!res.ok || !data.success) throw new Error(data.message || 'Upload failed');
                                      setEditItem(prev => {
                                        if (!prev) return null;
                                        const meta = prev.metadata || {};
                                        const stepImgs = meta.stepImages || {};
                                        return {
                                          ...prev,
                                          metadata: {
                                            ...meta,
                                            stepImages: { ...stepImgs, [item.key]: data.imageUrl }
                                          }
                                        };
                                      });
                                      setSnackbar(`${item.title} uploaded successfully!`);
                                    } catch (err: any) {
                                      setError(err.message || 'Image upload failed');
                                    } finally {
                                      setSavingKey(null);
                                    }
                                  }}
                                />
                              </Button>
                              <TextField
                                size="small"
                                placeholder="Or paste image URL (e.g. https://...)"
                                value={currentImg}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditItem(prev => {
                                    if (!prev) return null;
                                    const meta = prev.metadata || {};
                                    const stepImgs = meta.stepImages || {};
                                    return {
                                      ...prev,
                                      metadata: {
                                        ...meta,
                                        stepImages: { ...stepImgs, [item.key]: val }
                                      }
                                    };
                                  });
                                }}
                                sx={{ flex: 1, minWidth: 200, '& input': { color: '#fff', fontSize: '0.85rem' } }}
                              />
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {isImageItem && editItem?.key !== 'how_to_play' && editItem?.key !== 'page_profile_images' && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(15,23,42,0.8)', borderRadius: 2, border: '1px solid rgba(0,255,136,0.3)' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#00ff88', mb: 1, fontSize: '1.05rem' }}>
                      📸 {editItem?.title} (Image File / URL)
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2, fontSize: '0.85rem' }}>
                      Upload a custom image file or paste an image URL for {editItem?.title}.
                    </Typography>

                    {(editItem?.metadata?.imageUrl || (editItem?.content && (editItem.content.startsWith('http') || editItem.content.startsWith('data:image')))) && (
                      <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <img
                          src={editItem.metadata?.imageUrl || editItem.content}
                          alt={editItem?.title || 'Preview'}
                          style={{ width: 140, height: 75, objectFit: 'contain', borderRadius: 6, border: '1px solid rgba(0,255,136,0.3)', backgroundColor: '#0a0e17' }}
                        />
                        <Typography variant="caption" sx={{ color: '#00ff88', fontWeight: 700 }}>
                          Custom Image Active
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        component="label"
                        size="small"
                        sx={{ bgcolor: 'rgba(0,255,136,0.2)', color: '#00ff88', border: '1px solid #00ff88', '&:hover': { bgcolor: 'rgba(0,255,136,0.3)' } }}
                      >
                        Upload Image File
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              setSavingKey(`upload_${editItem?.key}`);
                              const formData = new FormData();
                              formData.append('image', file);
                              const token = localStorage.getItem('token');
                              const res = await fetch(`${API_BASE}/api/admin/static-content/upload-image`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}` },
                                body: formData
                              });
                              const data = await res.json();
                              if (!res.ok || !data.success) throw new Error(data.message || 'Upload failed');
                              setEditItem(prev => {
                                if (!prev) return null;
                                const meta = prev.metadata || {};
                                return {
                                  ...prev,
                                  content: data.imageUrl,
                                  metadata: {
                                    ...meta,
                                    imageUrl: data.imageUrl
                                  }
                                };
                              });
                              setSnackbar(`Image uploaded successfully!`);
                            } catch (err: any) {
                              setError(err.message || 'Image upload failed');
                            } finally {
                              setSavingKey(null);
                            }
                          }}
                        />
                      </Button>
                      <TextField
                        size="small"
                        placeholder="Or paste image URL (e.g. https://...)"
                        value={editItem?.metadata?.imageUrl || (editItem?.content?.startsWith('http') || editItem?.content?.startsWith('data:image') ? editItem.content : '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditItem(prev => {
                            if (!prev) return null;
                            const meta = prev.metadata || {};
                            return {
                              ...prev,
                              content: val || prev.content,
                              metadata: {
                                ...meta,
                                imageUrl: val
                              }
                            };
                          });
                        }}
                        sx={{ flex: 1, minWidth: 200, '& input': { color: '#fff', fontSize: '0.85rem' } }}
                      />
                    </Box>
                  </Box>
                )}
              </>
            );
          })()}

          <FormControlLabel
            control={
              <Switch
                checked={editItem?.isActive ?? true}
                onChange={(e) => setEditItem(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#00ff88' } }}
              />
            }
            label="Active & Accessible in Mobile REST API"
          />
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Button onClick={() => setOpenModal(false)} sx={{ color: '#94a3b8' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveItem}
            startIcon={<SaveIcon />}
            sx={{ bgcolor: '#00ff88', color: '#0a0e17', fontWeight: 800, '&:hover': { bgcolor: '#00cc6c' } }}
          >
            Save Content Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
      />
    </Box>
  );
}

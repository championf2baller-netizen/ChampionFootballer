'use client';
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Container, Grid, Button, TextField,
  Switch, FormControlLabel, CircularProgress, Alert, Chip,
  Divider, Card, CardContent, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Snackbar, Tabs, Tab
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

import { getApiBaseUrl } from '@/lib/getApiBaseUrl';

const API_BASE = getApiBaseUrl();

// App Pages Categories
const PAGE_TABS = [
  { id: 'landing', label: 'Main Landing Page (First Page)', icon: <AppsIcon />, description: 'Manage main landing page hero banners, cards, images, and headlines' },
  { id: 'footer', label: 'Footer & Social Media Links', icon: <AppsIcon />, description: 'Manage footer social media icons, URLs, and platform links' },
  { id: 'rewards', label: 'Rewards & Badges Page', icon: <EmojiEventsIcon />, description: 'Manage all 9 reward rules, XP multipliers, and badge descriptions' },
  { id: 'home', label: 'Home Page & Banners (Post-Login)', icon: <HomeIcon />, description: 'Manage welcome texts, subtitles, and home highlights' },
  { id: 'leagues', label: 'All Leagues & Details', icon: <AppsIcon />, description: 'Manage All Leagues and League Details info banners' },
  { id: 'matches', label: 'All Matches Page', icon: <AppsIcon />, description: 'Manage All Matches info banner' },
  { id: 'players', label: 'All Players Page', icon: <AppsIcon />, description: 'Manage All Players main heading, search input, filters, and info banner' },
  { id: 'player_stats', label: 'Player Stats Page', icon: <AppsIcon />, description: 'Manage Player Stats page (/player/[id]) main heading, search input, filters, and clear button' },
  { id: 'career', label: 'Player Career Page', icon: <AppsIcon />, description: 'Manage Player Career History page (/player/[id]/career) heading, search input, filters, and clear button' },
  { id: 'trophy', label: 'Trophy Room Page', icon: <EmojiEventsIcon />, description: 'Manage Trophy Room page (/trophy-room) main heading, filters, tabs, section titles, and info banner' },
  { id: 'profile', label: 'Profile Page', icon: <AppsIcon />, description: 'Manage My Profile info banner' },
  { id: 'rules', label: 'App Info & Legal Pages', icon: <GavelIcon />, description: 'Manage About CF, How to Play, Contact Us, Terms & Conditions, and Privacy Policy' },
  { id: 'all', label: 'All Pages (Full Overview)', icon: <AppsIcon />, description: 'View all static content items across the entire platform' },
];

export default function AdminDashboardPage() {
  const [items, setItems] = useState<StaticContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('rewards');

  // Edit modal state
  const [editItem, setEditItem] = useState<StaticContentItem | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const router = useRouter();

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

  useEffect(() => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchItems();
  }, []);

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
    localStorage.removeItem('user');
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

  const currentTabInfo = PAGE_TABS.find(t => t.id === activeTab);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0e17', color: '#fff', pb: 6 }}>
      {/* Header Bar */}
      <Box sx={{ bgcolor: '#131b2e', borderBottom: '1px solid rgba(0,255,136,0.2)', py: 2, px: { xs: 2, sm: 4 } }}>
        <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Image src={cflogo} alt="Champion Footballer" width={180} height={55} style={{ objectFit: 'contain' }} />
            <Chip
              icon={<ShieldIcon style={{ color: '#00ff88' }} />}
              label="SUPER ADMIN CMS"
              sx={{ bgcolor: 'rgba(0,255,136,0.1)', color: '#00ff88', fontWeight: 800, border: '1px solid rgba(0,255,136,0.3)' }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={fetchItems}
              startIcon={<RefreshIcon />}
              sx={{ color: '#94a3b8', borderColor: '#334155' }}
            >
              Refresh Data
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        {/* Page Switcher Navigation Bar */}
        <Paper
          elevation={4}
          sx={{
            bgcolor: '#131b2e',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.08)',
            p: 1.5,
            mb: 4,
          }}
        >
          <Typography variant="overline" sx={{ px: 2, pt: 1, color: '#00ff88', fontWeight: 800, letterSpacing: 1.5, display: 'block' }}>
            SELECT APP PAGE TO EDIT STATIC CONTENT:
          </Typography>

          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': { backgroundColor: '#00ff88', height: 3, borderRadius: '3px 3px 0 0' },
              '& .MuiTab-root': {
                color: '#94a3b8',
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'none',
                minHeight: 52,
                px: 2.5,
                borderRadius: 2,
                mr: 1,
                transition: 'all 0.2s ease',
                '&.Mui-selected': { color: '#00ff88', bgcolor: 'rgba(0,255,136,0.08)' },
                '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.04)' }
              }
            }}
          >
            {PAGE_TABS.map((tab) => (
              <Tab
                key={tab.id}
                value={tab.id}
                icon={tab.icon}
                iconPosition="start"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{tab.label}</span>
                    <Chip
                      label={items.filter(i => {
                        if (i.key === 'faq' || i.category === 'faq') return false;
                        if (tab.id === 'all') return true;
                        if (tab.id === 'rewards') return i.category === 'rewards';
                        if (tab.id === 'home') return i.category === 'home';
                        if (tab.id === 'rules') return i.category === 'general' || i.category === 'contact' || i.category === 'legal';
                        return i.category === tab.id;
                      }).length}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem', fontWeight: 800, bgcolor: activeTab === tab.id ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.1)', color: activeTab === tab.id ? '#00ff88' : '#cbd5e1' }}
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Paper>

        {/* Selected Page Banner */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {currentTabInfo?.icon}
            {currentTabInfo?.label}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
            {currentTabInfo?.description}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
            {error}
          </Alert>
        )}

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
                          const currentLink = editItem.metadata?.socialLinks?.[platform.key] || '';
                          return (
                            <Box key={platform.key}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ffffff', mb: 0.8, fontSize: '0.9rem' }}>
                                {platform.title}
                              </Typography>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder={platform.placeholder}
                                value={currentLink}
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
      </Container>
    </Box>
  );
}

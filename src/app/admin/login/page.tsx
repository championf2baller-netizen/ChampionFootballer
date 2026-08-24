'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Alert, CircularProgress, Container } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import cflogo from '@/Components/images/champion football logo 3 (1).png';
import ShieldIcon from '@mui/icons-material/Security';

import { getApiBaseUrl } from '@/lib/getApiBaseUrl';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminUserStr = localStorage.getItem('adminUser');
    if (adminToken && adminUserStr) {
      try {
        const u = JSON.parse(adminUserStr);
        if (u.isAdmin === true || u.role === 'ADMIN' || u.role === 'SUPER_ADMIN') {
          router.replace('/admin/dashboard');
        }
      } catch { }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      // Check if user is admin
      const user = data.user || {};
      const isAdmin = user.isAdmin === true || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

      if (!isAdmin) {
        throw new Error('Access Denied: This account does not have Super Admin privileges.');
      }

      // Store auth tokens
      if (data.token) {
        document.cookie = `adminToken=${data.token}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(user));
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(user));
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0a0e17',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,136,0.15) 0%, rgba(10,14,23,0) 75%)',
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={12}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            bgcolor: '#131b2e',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            textAlign: 'center',
          }}
        >
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <Image
              src={cflogo}
              alt="Champion Footballer"
              width={220}
              height={70}
              style={{ objectFit: 'contain' }}
            />
          </Box>

          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.5, borderRadius: 2, bgcolor: 'rgba(0,255,136,0.1)', color: '#00ff88', mb: 3 }}>
            <ShieldIcon fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: 1 }}>
              SUPER ADMIN PORTAL
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Admin Email"
              type="email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              InputProps={{
                style: { color: '#fff', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px' },
              }}
            />

            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              InputProps={{
                style: { color: '#fff', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px' },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.5,
                bgcolor: '#00ff88',
                color: '#0a0e17',
                fontWeight: 800,
                fontSize: '1rem',
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 0 20px rgba(0,255,136,0.4)',
                '&:hover': {
                  bgcolor: '#00cc6c',
                  boxShadow: '0 0 30px rgba(0,255,136,0.6)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#0a0e17' }} /> : 'Login to Admin Dashboard'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

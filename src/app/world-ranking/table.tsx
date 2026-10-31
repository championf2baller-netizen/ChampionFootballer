"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchWorldRanking, WorldRankingPlayer, WorldRankingResponse } from '@/lib/api';
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Menu,
  MenuItem,
  Button,
  ButtonBase,
  TextField,
  Avatar,
  Card,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import Link from 'next/link';
import { Country } from 'country-state-city';
import { useAuth } from '@/lib/hooks';
import WorldRankingLoadingSkeleton from '@/Components/loading/WorldRankingLoadingSkeleton';
import PageHeader from '@/Components/PageHeader';
import { getXPTier } from '@/Components/XPStarMilestoneCard';
import { isRegisteredPlayerRecord, getPositionShortForm } from '@/lib/playerIdentity';
import { getAvatarBackgroundColor, getAvatarInitials } from '@/lib/avatarInitials';
import { ChevronDown, Search, Shield } from 'lucide-react';

interface Filters {
  mode: 'total' | 'avg';
  year?: string;
  positionType?: string;
  country?: string;
}

type SortKey = 'rank' | 'name' | 'matches' | 'avgXP' | 'totalXP';
interface SortState {
  key: SortKey;
  direction: 'asc' | 'desc';
}

type ColumnKey = SortKey | 'position' | 'country' | 'xpStatus';
interface Column {
  label: string;
  key: ColumnKey;
}

const SORTABLE_KEYS: readonly SortKey[] = ['rank', 'name', 'matches', 'avgXP', 'totalXP'] as const;
const isSortableKey = (k: ColumnKey): k is SortKey => (SORTABLE_KEYS as readonly string[]).includes(k);

function getSortValue(player: WorldRankingPlayer, key: SortKey): string | number {
  switch (key) {
    case 'name':
      return player.name.toLowerCase();
    case 'rank':
      return player.rank;
    case 'matches':
      return player.matches ?? 0;
    case 'avgXP':
      return player.avgXP ?? 0;
    case 'totalXP':
      return player.totalXP ?? 0;
    default:
      return 0;
  }
}

const getLevelTitle = (points: number): string => {
  return getXPTier(points).title;
};

export default function WorldRankingTable() {
  const { user, token } = useAuth();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [filters, setFilters] = useState<Filters>({ mode: 'total' });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WorldRankingResponse | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [, setLastUpdated] = useState<Date | null>(null);
  const [sort, setSort] = useState<SortState>({ key: 'rank', direction: 'asc' });
  const [visibleLimit, setVisibleLimit] = useState(10);

  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const userRowRef = useRef<HTMLTableRowElement | null>(null);

  // Dropdown states & refs
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const yearFilterButtonRef = useRef<HTMLButtonElement | null>(null);

  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryFilterButtonRef = useRef<HTMLButtonElement | null>(null);

  const [positionDropdownOpen, setPositionDropdownOpen] = useState(false);
  const positionFilterButtonRef = useRef<HTMLButtonElement | null>(null);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const responseYears = Array.isArray(data?.years)
      ? data.years
        .filter((y): y is number => Number.isFinite(y))
        .filter((y) => y >= 2000 && y <= current + 1)
      : [];

    const yearSet = new Set<number>([current, ...responseYears]);
    return Array.from(yearSet).sort((a, b) => b - a).map(String);
  }, [data?.years]);

  useEffect(() => {
    if (!filters.year) return;
    if (!years.includes(filters.year)) {
      setFilters((f) => ({ ...f, year: undefined }));
    }
  }, [filters.year, years]);

  const countries = useMemo(() => {
    try {
      return Country.getAllCountries().map(c => c.name).sort((a, b) => a.localeCompare(b));
    } catch {
      const set = new Set<string>();
      (data?.players || []).forEach(p => { if (p.country) set.add(p.country); });
      return Array.from(set).sort((a, b) => a.localeCompare(b));
    }
  }, [data]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const resPrimary = await fetchWorldRanking({
        mode: filters.mode,
        positionType: filters.positionType,
        year: filters.year ? Number(filters.year) : undefined,
        country: filters.country,
        playerId: user?.id,
        limit: 100000,
        token: token || undefined,
      });
      setData(resPrimary);
      setLastUpdated(new Date());
    } catch {
      try {
        const resFallback = await fetchWorldRanking({
          mode: filters.mode,
          positionType: filters.positionType,
          year: filters.year ? Number(filters.year) : undefined,
          country: filters.country,
          playerId: user?.id,
          limit: 5000,
          token: token || undefined,
        });
        setData(resFallback);
        setLastUpdated(new Date());
        setError(null);
      } catch {
        try {
          const resMin = await fetchWorldRanking({
            mode: filters.mode,
            positionType: filters.positionType,
            year: filters.year ? Number(filters.year) : undefined,
            country: filters.country,
            playerId: user?.id,
            limit: 1000,
            token: token || undefined,
          });
          setData(resMin);
          setLastUpdated(new Date());
          setError('Showing top 1,000 players due to server limits');
        } catch (e3: unknown) {
          const message = e3 instanceof Error ? (e3.message || 'Failed to load world ranking') : 'Failed to load world ranking';
          setError(message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.mode, filters.positionType, filters.year, filters.country, token]);

  useEffect(() => {
    setSort({ key: filters.mode === 'avg' ? 'avgXP' : 'totalXP', direction: 'desc' });
  }, [filters.mode]);

  const filtered = useMemo(() => {
    if (!data || !Array.isArray(data.players)) return [] as WorldRankingPlayer[];
    const term = search.trim().toLowerCase();
    const registeredPlayers = data.players.filter(isRegisteredPlayerRecord);
    let base = !term ? registeredPlayers : registeredPlayers.filter(p => p.name.toLowerCase().includes(term));
    if (filters.country) {
      base = base.filter(p => (p.country || '').toLowerCase() === filters.country!.toLowerCase());
    }
    if (filters.positionType) {
      const targetType = filters.positionType.toLowerCase();
      base = base.filter(p => {
        const pt = (p.positionType || '').toLowerCase();
        const pos = (p.position || '').toLowerCase();

        if (targetType === 'goalkeeper' || targetType === 'gk') {
          return pt === 'goalkeeper' || pt === 'gk' || pos === 'gk' || pos.includes('gk') || pos.includes('goalkeeper');
        }
        if (targetType === 'defender' || targetType === 'df') {
          return pt === 'defender' || pt === 'df' || ['cb', 'rb', 'lb', 'rwb', 'lwb'].includes(pos) || pos.includes('back') || pos.includes('defender');
        }
        if (targetType === 'midfielder' || targetType === 'md' || targetType === 'mf') {
          return pt === 'midfielder' || pt === 'md' || pt === 'mf' || ['cm', 'cdm', 'cam', 'rm', 'lm', 'midfielder'].includes(pos) || pos.includes('midfielder');
        }
        if (targetType === 'forward' || targetType === 'fw') {
          return pt === 'forward' || pt === 'fw' || ['st', 'cf', 'rf', 'lf', 'rw', 'lw'].includes(pos) || pos.includes('striker') || pos.includes('forward') || pos.includes('winger');
        }
        return false;
      });
    }

    const metricKey: 'avgXP' | 'totalXP' = filters.mode === 'avg' ? 'avgXP' : 'totalXP';
    const metricVal = (p: WorldRankingPlayer) => (metricKey === 'avgXP' ? (p.avgXP ?? 0) : (p.totalXP ?? 0));
    const byMetricDesc = [...base].sort((a, b) => metricVal(b) - metricVal(a));
    const rankMap = new Map<string, number>();
    let lastVal: number | null = null;
    let denseRank = 0;
    for (const p of byMetricDesc) {
      const v = metricVal(p);
      if (lastVal === null || v !== lastVal) {
        denseRank += 1;
        lastVal = v;
      }
      rankMap.set(p.id, denseRank);
    }

    const { key, direction } = sort;
    const dirMul = direction === 'asc' ? 1 : -1;
    base = [...base].sort((a, b) => {
      const va = key === 'rank' ? (rankMap.get(a.id) ?? a.rank) : getSortValue(a, key);
      const vb = key === 'rank' ? (rankMap.get(b.id) ?? b.rank) : getSortValue(b, key);
      if (va < vb) return -1 * dirMul;
      if (va > vb) return 1 * dirMul;
      return 0;
    });

    return base.map(p => ({ ...p, rank: rankMap.get(p.id) ?? p.rank } as WorldRankingPlayer));
  }, [data, search, sort, filters.mode, filters.country, filters.positionType]);

  const toggleSort = (key: SortKey) => {
    setSort(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: key === 'rank' ? 'asc' : 'desc' };
    });
  };

  const clearFilters = () => {
    setFilters({ mode: filters.mode });
    setSearch('');
    setSort({ key: 'rank', direction: 'asc' });
    setVisibleLimit(10);
  };

  useEffect(() => {
    setVisibleLimit(10);
  }, [search, filters, sort]);

  useEffect(() => {
    if (!loading && userRowRef.current && tableContainerRef.current) {
      const container = tableContainerRef.current;
      const rowTop = userRowRef.current.offsetTop;
      container.scrollTo({ top: Math.max(0, rowTop - container.clientHeight / 3), behavior: 'smooth' });
    }
  }, [loading, filtered.length]);

  const formatNum = (n: number | undefined | null, opts: { decimals?: number } = {}) => {
    if (n === undefined || n === null) return '-';
    const d = opts.decimals ?? 0;
    return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
  };

  const visiblePlayers = useMemo(() => {
    return filtered.slice(0, visibleLimit);
  }, [filtered, visibleLimit]);

  return (
    <Box sx={{ bgcolor: 'transparent', color: '#fff', overflowX: 'hidden' }}>
      {/* ────────── HEADER ────────── */}
      <PageHeader title="WORLD RANKING">
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '1230px',
          mx: 'auto',
          px: { xs: 1, sm: 2, md: 3 },
          pt: { xs: 1.5, md: 0 },
          width: '100%',
        }}>
          {/* Top row: Search & Filters */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 1.5, md: 2 },
            width: '100%',
          }}>
            {/* Search Input */}
            <TextField
              variant="outlined"
              placeholder="Search player name and hit enter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                width: { xs: '100%', md: 440 },
                ml: 0,
                color: 'white',
                '& .MuiOutlinedInput-root': {
                  height: { xs: 40, sm: 44 },
                  color: 'white',
                  backgroundColor: '#121316',
                  borderRadius: '14px',
                  '& fieldset': { borderColor: '#22242a', borderWidth: 1 },
                  '&:hover fieldset': { borderColor: '#32353e' },
                  '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.25)', borderWidth: 1 }
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                  fontSize: { xs: 13, sm: 14.5 },
                  py: 0.5,
                  fontFamily: 'var(--font-woodford-bourne-pro)',
                  '&::placeholder': { color: '#717d8f', opacity: 1 }
                }
              }}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1.5, ml: 0.5, display: 'flex', alignItems: 'center' }}>
                    <Search size={20} color="#717d8f" />
                  </Box>
                ),
              }}
            />

            {/* Right side - Filters group */}
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 0.75, sm: 1, md: 1.5 },
                flexWrap: 'nowrap',
                justifyContent: { xs: 'space-between', md: 'flex-end' },
                width: { xs: '100%', md: 'auto' },
                alignItems: 'center',
              }}
            >
              {/* Year Filter */}
              <div style={{
                flex: isDesktop ? 'none' : '1 1 0px',
                minWidth: isDesktop ? '140px' : 0,
                width: isDesktop ? 'auto' : '100%',
              }}>
                <button
                  ref={yearFilterButtonRef}
                  type="button"
                  onClick={() => setYearDropdownOpen((prev) => !prev)}
                  style={{
                    height: isDesktop ? '42px' : '38px',
                    padding: isDesktop ? '0 10px 0 14px' : '0 6px 0 8px',
                    backgroundColor: '#16181d',
                    color: '#fff',
                    border: '1px solid #22242a',
                    borderRadius: '14px',
                    fontSize: isDesktop ? '14.5px' : '11.5px',
                    cursor: 'pointer',
                    outline: 'none',
                    width: '100%',
                    minWidth: 0,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                    fontFamily: 'var(--font-woodford-bourne-pro), sans-serif',
                    transition: 'border-color 0.15s, background-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#32353e';
                    e.currentTarget.style.backgroundColor = '#1e2026';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#22242a';
                    e.currentTarget.style.backgroundColor = '#16181d';
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1, textAlign: 'left' }}>
                    {filters.year ? filters.year : 'All Years'}
                  </span>
                  <Box sx={{ width: { xs: 17, sm: 19 }, height: { xs: 17, sm: 19 }, borderRadius: '50%', border: '1px solid rgba(229,106,22,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ChevronDown size={isDesktop ? 12 : 10.5} color="#e56a16" />
                  </Box>
                </button>
                <Menu
                  anchorEl={yearFilterButtonRef.current}
                  open={yearDropdownOpen}
                  onClose={() => setYearDropdownOpen(false)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  PaperProps={{
                    sx: {
                      mt: 0.5,
                      borderRadius: '12px',
                      border: '1px solid #22242a',
                      backgroundColor: '#16181d',
                      minWidth: yearFilterButtonRef.current?.offsetWidth || 148,
                      width: 'max-content',
                      maxWidth: '90vw',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                    }
                  }}
                  MenuListProps={{ sx: { py: 0.5 } }}
                >
                  <MenuItem
                    selected={!filters.year}
                    onClick={() => {
                      setFilters(f => ({ ...f, year: undefined }));
                      setYearDropdownOpen(false);
                    }}
                    sx={{
                      color: '#fff',
                      fontSize: 13,
                      minHeight: 34,
                      borderRadius: '6px',
                      mx: 0.5,
                      '&.Mui-selected': { backgroundColor: 'rgba(229,106,22,0.2)', color: '#fff' },
                      '&.Mui-selected:hover': { backgroundColor: 'rgba(229,106,22,0.28)' },
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
                    }}
                  >
                    All Years
                  </MenuItem>
                  {years.map((y) => (
                    <MenuItem
                      key={y}
                      selected={filters.year === y}
                      onClick={() => {
                        setFilters(f => ({ ...f, year: y }));
                        setYearDropdownOpen(false);
                      }}
                      sx={{
                        color: '#fff',
                        fontSize: 13,
                        minHeight: 34,
                        borderRadius: '6px',
                        mx: 0.5,
                        '&.Mui-selected': { backgroundColor: 'rgba(229,106,22,0.2)', color: '#fff' },
                        '&.Mui-selected:hover': { backgroundColor: 'rgba(229,106,22,0.28)' },
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
                      }}
                    >
                      {y}
                    </MenuItem>
                  ))}
                </Menu>
              </div>

              {/* Country Filter */}
              <div style={{
                flex: isDesktop ? 'none' : '1 1 0px',
                minWidth: isDesktop ? '146px' : 0,
                width: isDesktop ? 'auto' : '100%',
              }}>
                <button
                  ref={countryFilterButtonRef}
                  type="button"
                  onClick={() => setCountryDropdownOpen((prev) => !prev)}
                  style={{
                    height: isDesktop ? '42px' : '38px',
                    padding: isDesktop ? '0 10px 0 14px' : '0 6px 0 8px',
                    backgroundColor: '#16181d',
                    color: '#fff',
                    border: '1px solid #22242a',
                    borderRadius: '14px',
                    fontSize: isDesktop ? '14.5px' : '11.5px',
                    cursor: 'pointer',
                    outline: 'none',
                    width: '100%',
                    minWidth: 0,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                    fontFamily: 'var(--font-woodford-bourne-pro), sans-serif',
                    transition: 'border-color 0.15s, background-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#32353e';
                    e.currentTarget.style.backgroundColor = '#1e2026';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#22242a';
                    e.currentTarget.style.backgroundColor = '#16181d';
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1, textAlign: 'left' }}>
                    {filters.country ? filters.country : 'All Country'}
                  </span>
                  <Box sx={{ width: { xs: 17, sm: 19 }, height: { xs: 17, sm: 19 }, borderRadius: '50%', border: '1px solid rgba(229,106,22,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ChevronDown size={isDesktop ? 12 : 10.5} color="#e56a16" />
                  </Box>
                </button>
                <Menu
                  anchorEl={countryFilterButtonRef.current}
                  open={countryDropdownOpen}
                  onClose={() => setCountryDropdownOpen(false)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  PaperProps={{
                    sx: {
                      mt: 0.5,
                      borderRadius: '12px',
                      border: '1px solid #22242a',
                      backgroundColor: '#16181d',
                      minWidth: countryFilterButtonRef.current?.offsetWidth || 160,
                      maxWidth: '90vw',
                      maxHeight: 320,
                      overflowY: 'auto',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                    }
                  }}
                  MenuListProps={{ sx: { py: 0.5 } }}
                >
                  <MenuItem
                    selected={!filters.country}
                    onClick={() => {
                      setFilters(f => ({ ...f, country: undefined }));
                      setCountryDropdownOpen(false);
                    }}
                    sx={{
                      color: '#fff',
                      fontSize: 13,
                      minHeight: 34,
                      borderRadius: '6px',
                      mx: 0.5,
                      '&.Mui-selected': { backgroundColor: 'rgba(229,106,22,0.2)', color: '#fff' },
                      '&.Mui-selected:hover': { backgroundColor: 'rgba(229,106,22,0.28)' },
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
                    }}
                  >
                    All Country
                  </MenuItem>
                  {countries.map((c) => (
                    <MenuItem
                      key={c}
                      selected={filters.country === c}
                      onClick={() => {
                        setFilters(f => ({ ...f, country: c }));
                        setCountryDropdownOpen(false);
                      }}
                      sx={{
                        color: '#fff',
                        fontSize: 13,
                        minHeight: 34,
                        borderRadius: '6px',
                        mx: 0.5,
                        '&.Mui-selected': { backgroundColor: 'rgba(229,106,22,0.2)', color: '#fff' },
                        '&.Mui-selected:hover': { backgroundColor: 'rgba(229,106,22,0.28)' },
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
                      }}
                    >
                      {c}
                    </MenuItem>
                  ))}
                </Menu>
              </div>

              {/* Position Filter */}
              <div style={{
                flex: isDesktop ? 'none' : '1 1 0px',
                minWidth: isDesktop ? '140px' : 0,
                width: isDesktop ? 'auto' : '100%',
              }}>
                <button
                  ref={positionFilterButtonRef}
                  type="button"
                  onClick={() => setPositionDropdownOpen((prev) => !prev)}
                  style={{
                    height: isDesktop ? '42px' : '38px',
                    padding: isDesktop ? '0 10px 0 14px' : '0 6px 0 8px',
                    backgroundColor: '#16181d',
                    color: '#fff',
                    border: '1px solid #22242a',
                    borderRadius: '14px',
                    fontSize: isDesktop ? '14.5px' : '11.5px',
                    cursor: 'pointer',
                    outline: 'none',
                    width: '100%',
                    minWidth: 0,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                    fontFamily: 'var(--font-woodford-bourne-pro), sans-serif',
                    transition: 'border-color 0.15s, background-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#32353e';
                    e.currentTarget.style.backgroundColor = '#1e2026';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#22242a';
                    e.currentTarget.style.backgroundColor = '#16181d';
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1, textAlign: 'left' }}>
                    {filters.positionType ? filters.positionType : 'All Position'}
                  </span>
                  <Box sx={{ width: { xs: 17, sm: 19 }, height: { xs: 17, sm: 19 }, borderRadius: '50%', border: '1px solid rgba(229,106,22,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ChevronDown size={isDesktop ? 12 : 10.5} color="#e56a16" />
                  </Box>
                </button>
                <Menu
                  anchorEl={positionFilterButtonRef.current}
                  open={positionDropdownOpen}
                  onClose={() => setPositionDropdownOpen(false)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  PaperProps={{
                    sx: {
                      mt: 0.5,
                      borderRadius: '12px',
                      border: '1px solid #22242a',
                      backgroundColor: '#16181d',
                      minWidth: positionFilterButtonRef.current?.offsetWidth || 148,
                      width: 'max-content',
                      maxWidth: '90vw',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                    }
                  }}
                  MenuListProps={{ sx: { py: 0.5 } }}
                >
                  {[
                    { label: 'All Position', value: undefined },
                    { label: 'Defender', value: 'Defender' },
                    { label: 'Midfielder', value: 'Midfielder' },
                    { label: 'Forward', value: 'Forward' },
                    { label: 'Goalkeeper', value: 'Goalkeeper' },
                  ].map((pos) => (
                    <MenuItem
                      key={pos.label}
                      selected={filters.positionType === pos.value}
                      onClick={() => {
                        setFilters(f => ({ ...f, positionType: pos.value }));
                        setPositionDropdownOpen(false);
                      }}
                      sx={{
                        color: '#fff',
                        fontSize: 13,
                        minHeight: 34,
                        borderRadius: '6px',
                        mx: 0.5,
                        '&.Mui-selected': { backgroundColor: 'rgba(229,106,22,0.2)', color: '#fff' },
                        '&.Mui-selected:hover': { backgroundColor: 'rgba(229,106,22,0.28)' },
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
                      }}
                    >
                      {pos.label}
                    </MenuItem>
                  ))}
                </Menu>
              </div>

              {/* Clear Button */}
              <Button
                variant="outlined"
                onClick={clearFilters}
                sx={{
                  color: '#fff',
                  height: isDesktop ? '42px' : '38px',
                  borderRadius: '14px',
                  borderColor: '#22242a',
                  borderWidth: '1px',
                  backgroundColor: '#16181d',
                  px: { xs: 1.25, sm: 2, md: 2.5 },
                  py: 0.5,
                  minWidth: 'auto',
                  flex: isDesktop ? 'none' : '0 0 auto',
                  flexShrink: 0,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: { xs: '11.5px', sm: '12.5px', md: '14.5px' },
                  fontFamily: 'var(--font-woodford-bourne-pro), sans-serif',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    borderColor: '#32353e',
                    borderWidth: '1px',
                    backgroundColor: '#1e2026',
                  },
                }}
              >
                Clear
              </Button>
            </Box>
          </Box>

          {/* Mode Toggle: TOTAL XP | AVG / MATCH */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            mt: { xs: 2, md: 3 },
          }}>
            <Box sx={{
              bgcolor: '#121316',
              border: '1px solid #22242a',
              borderRadius: '16px',
              p: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              width: { xs: '95%', sm: 400, md: 500 },
              boxSizing: 'border-box',
            }}>
              <ButtonBase
                onClick={() => setFilters(f => ({ ...f, mode: 'total' }))}
                sx={{
                  flex: 1,
                  py: { xs: 0.9, sm: 1.1 },
                  px: { xs: 0.6, sm: 1.5 },
                  borderRadius: '12px',
                  border: filters.mode === 'total' ? '1.5px solid #22c55e' : '1.5px solid transparent',
                  bgcolor: filters.mode === 'total' ? 'rgba(34, 197, 94, 0.04)' : 'transparent',
                  color: filters.mode === 'total' ? '#ffffff' : '#717d8f',
                  fontWeight: filters.mode === 'total' ? 700 : 600,
                  fontSize: { xs: 12, sm: 13, md: 14 },
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-woodford-bourne-pro), sans-serif',
                  transition: 'all 0.18s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: filters.mode === 'total' ? 'rgba(34, 197, 94, 0.08)' : '#18191e',
                    color: '#ffffff',
                  },
                }}
              >
                <Typography
                  noWrap
                  sx={{
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    color: 'inherit',
                    textAlign: 'center',
                    fontFamily: 'inherit',
                    letterSpacing: 'inherit',
                    textTransform: 'uppercase',
                  }}
                >
                  TOTAL XP
                </Typography>
              </ButtonBase>
              <ButtonBase
                onClick={() => setFilters(f => ({ ...f, mode: 'avg' }))}
                sx={{
                  flex: 1,
                  py: { xs: 0.9, sm: 1.1 },
                  px: { xs: 0.6, sm: 1.5 },
                  borderRadius: '12px',
                  border: filters.mode === 'avg' ? '1.5px solid #22c55e' : '1.5px solid transparent',
                  bgcolor: filters.mode === 'avg' ? 'rgba(34, 197, 94, 0.04)' : 'transparent',
                  color: filters.mode === 'avg' ? '#ffffff' : '#717d8f',
                  fontWeight: filters.mode === 'avg' ? 700 : 600,
                  fontSize: { xs: 12, sm: 13, md: 14 },
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-woodford-bourne-pro), sans-serif',
                  transition: 'all 0.18s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: filters.mode === 'avg' ? 'rgba(34, 197, 94, 0.08)' : '#18191e',
                    color: '#ffffff',
                  },
                }}
              >
                <Typography
                  noWrap
                  sx={{
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    color: 'inherit',
                    textAlign: 'center',
                    fontFamily: 'inherit',
                    letterSpacing: 'inherit',
                    textTransform: 'uppercase',
                  }}
                >
                  AVG / MATCH
                </Typography>
              </ButtonBase>
            </Box>
          </Box>
        </Box>
      </PageHeader>

      {/* ────────── STATS CARD ────────── */}
      <Box sx={{ maxWidth: 1220, mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{
          bgcolor: '#121316',
          border: '1px solid #22242a',
          borderRadius: '16px',
          p: { xs: 1.5, sm: 2 },
          width: { xs: '100%', sm: 440, md: 520 },
          mx: 'auto',
          mt: 0,
          mb: 2.5,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}>
          <Box>
            <Typography sx={{ fontSize: 10, color: '#717d8f', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', mb: 0.5 }}>
              MODE
            </Typography>
            <Typography sx={{ fontSize: { xs: 14, sm: 16 }, fontWeight: 700, color: '#ffffff' }}>
              {filters.mode === 'total' ? 'Total XP' : 'Avg / Match'}
            </Typography>
          </Box>
          <Box sx={{ borderLeft: '1px solid #22242a', borderRight: '1px solid #22242a' }}>
            <Typography sx={{ fontSize: 10, color: '#717d8f', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', mb: 0.5 }}>
              PLAYERS SHOWN
            </Typography>
            <Typography sx={{ fontSize: { xs: 14, sm: 16 }, fontWeight: 700, color: '#ffffff' }}>
              {filtered.length}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 10, color: '#717d8f', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', mb: 0.5 }}>
              YOUR RANK
            </Typography>
            <Typography sx={{ fontSize: { xs: 14, sm: 16 }, fontWeight: 700, color: '#22c55e' }}>
              {data?.playerRank ? `#${data.playerRank}` : '-'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ────────── TABLE ────────── */}
      <Box sx={{ px: { xs: 1.5, sm: 2.5, md: 4 }, pb: 0, maxWidth: 1220, mx: 'auto' }}>
        <Card sx={{
          background: '#121316',
          border: '1px solid #22242a',
          borderRadius: '16px',
          boxShadow: 'none',
          overflow: 'hidden',
        }}>
          <TableContainer
            ref={tableContainerRef}
            onScroll={(e) => {
              e.currentTarget.classList.toggle('is-scrolled', e.currentTarget.scrollLeft > 2);
            }}
            sx={{
              maxHeight: { xs: '68vh', sm: '70vh', md: '72vh' },
              overflowX: 'auto',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': { height: '8px', width: '8px' },
              '&::-webkit-scrollbar-track': { background: '#121316' },
              '&::-webkit-scrollbar-thumb': { background: '#22242a', borderRadius: '9999px' },
            }}
          >
            <Table stickyHeader size="small" sx={{ minWidth: 680, borderCollapse: 'separate' }}>
              <TableHead>
                <TableRow className="league-header-row font-bold" sx={{ bgcolor: '#121316 !important' }}>
                  {/* Rank Header */}
                  <TableCell
                    onClick={() => toggleSort('rank')}
                    className="league-table-heading"
                    sx={{
                      cursor: 'pointer',
                      bgcolor: '#121316 !important',
                      color: '#717d8f !important',
                      fontWeight: 700,
                      fontSize: 12,
                      py: 1.8,
                      px: 0,
                      textAlign: 'center',
                      width: { xs: 32, sm: 40 },
                      minWidth: { xs: 32, sm: 40 },
                      maxWidth: { xs: 32, sm: 40 },
                      position: 'sticky',
                      top: 0,
                      left: 0,
                      zIndex: 40,
                      borderBottom: '1px solid #22242a',
                    }}
                  >
                    #
                  </TableCell>

                  {/* Player Header */}
                  <TableCell
                    onClick={() => toggleSort('name')}
                    className="league-table-heading league-table-heading-left"
                    sx={{
                      cursor: 'pointer',
                      bgcolor: '#121316 !important',
                      color: '#717d8f !important',
                      fontWeight: 700,
                      fontSize: 12,
                      py: 1.8,
                      pl: { xs: 2, sm: 3 },
                      pr: { xs: 1, sm: 1.5 },
                      textAlign: 'left',
                      width: { xs: 170, sm: 230, md: 260 },
                      minWidth: { xs: 170, sm: 230, md: 260 },
                      maxWidth: { xs: 170, sm: 230, md: 260 },
                      position: 'sticky',
                      top: 0,
                      left: { xs: 32, sm: 40 },
                      zIndex: 35,
                      borderBottom: '1px solid #22242a',
                      boxShadow: 'none',
                      transition: 'box-shadow 0.2s',
                      '.is-scrolled &': {
                        boxShadow: '8px 0 12px -12px rgba(0, 0, 0, 0.6) !important',
                      },
                    }}
                  >
                    PLAYER
                  </TableCell>

                  {/* Position Header */}
                  <TableCell sx={{
                    position: 'sticky',
                    top: 0,
                    bgcolor: '#121316 !important',
                    color: '#717d8f !important',
                    fontWeight: 700,
                    fontSize: 12,
                    py: 1.8,
                    textAlign: 'center',
                    minWidth: { xs: 75, sm: 100 },
                    borderBottom: '1px solid #22242a',
                    zIndex: 20,
                  }}>
                    POSITION
                  </TableCell>

                  {/* Country Header */}
                  <TableCell sx={{
                    position: 'sticky',
                    top: 0,
                    bgcolor: '#121316 !important',
                    color: '#717d8f !important',
                    fontWeight: 700,
                    fontSize: 12,
                    py: 1.8,
                    textAlign: 'center',
                    minWidth: { xs: 90, sm: 120 },
                    borderBottom: '1px solid #22242a',
                    zIndex: 20,
                  }}>
                    COUNTRY
                  </TableCell>

                  {/* XP Status Header */}
                  <TableCell sx={{
                    position: 'sticky',
                    top: 0,
                    bgcolor: '#121316 !important',
                    color: '#717d8f !important',
                    fontWeight: 700,
                    fontSize: 12,
                    py: 1.8,
                    textAlign: 'center',
                    minWidth: { xs: 85, sm: 110 },
                    borderBottom: '1px solid #22242a',
                    zIndex: 20,
                  }}>
                    XP STATUS
                  </TableCell>

                  {/* Total / Avg XP Header */}
                  <TableCell
                    onClick={() => toggleSort(filters.mode === 'avg' ? 'avgXP' : 'totalXP')}
                    sx={{
                      cursor: 'pointer',
                      position: 'sticky',
                      top: 0,
                      bgcolor: '#121316 !important',
                      color: '#717d8f !important',
                      fontWeight: 700,
                      fontSize: 12,
                      py: 1.8,
                      pr: { xs: 2, sm: 3 },
                      textAlign: 'right',
                      minWidth: { xs: 90, sm: 120 },
                      borderBottom: '1px solid #22242a',
                      zIndex: 20,
                    }}
                  >
                    {filters.mode === 'avg' ? (
                      'AVG / MATCH'
                    ) : (
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                      }}>
                        <Typography sx={{
                          color: '#717d8f !important',
                          fontWeight: 700,
                          fontSize: 12,
                          lineHeight: 1.2,
                        }}>
                          TOTAL XP
                        </Typography>
                        <Typography sx={{
                          color: '#4b5563',
                          fontSize: { xs: 9, sm: 10 },
                          fontWeight: 700,
                          letterSpacing: 0.5,
                          lineHeight: 1,
                          mt: 0.3,
                          display: { xs: 'none', sm: 'block' },
                        }}>
                          OF 25,000
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <WorldRankingLoadingSkeleton />
                ) : (
                  visiblePlayers.map((p) => {
                    const isMe = user?.id === p.id;
                    const isRank1 = p.rank === 1;
                    const isHighlighted = isRank1 || isMe;

                    return (
                      <TableRow
                        key={p.id}
                        ref={isMe ? userRowRef : undefined}
                        className={`league-table-row-text league-row ${isHighlighted ? 'league-row-current-user' : ''}`}
                        sx={{
                          background: isHighlighted
                            ? 'linear-gradient(90deg, #183328 0%, #152d24 35%, #12211b 70%, #0f1616 100%) !important'
                            : '#121316 !important',
                          boxShadow: isHighlighted ? 'inset 3px 0 0 #54ce91 !important' : 'none',
                          borderBottom: '1px solid #1c1d22 !important',
                          transition: 'background-color 0.2s',
                          '&:hover': {
                            background: isHighlighted
                              ? 'linear-gradient(90deg, #1c3c2f 0%, #183329 35%, #14251e 70%, #101817 100%) !important'
                              : '#18191e !important',
                          },
                        }}
                      >
                        {/* Rank */}
                        <TableCell
                          sx={{
                            color: isRank1 ? '#54ce91' : '#8a94a6',
                            fontWeight: 700,
                            fontSize: { xs: 12, sm: 13.5 },
                            textAlign: 'center',
                            py: 1.5,
                            px: 0,
                            width: { xs: 32, sm: 40 },
                            minWidth: { xs: 32, sm: 40 },
                            maxWidth: { xs: 32, sm: 40 },
                            position: 'sticky',
                            left: 0,
                            zIndex: 10,
                            backgroundColor: isHighlighted ? '#183328 !important' : '#121316 !important',
                            transition: 'background-color 0.2s',
                            borderBottom: '1px solid #1c1d22',
                            boxShadow: isHighlighted ? 'inset 3px 0 0 #54ce91 !important' : 'none',
                            '.MuiTableRow-root:hover &': {
                              backgroundColor: isHighlighted ? '#1c3c2f !important' : '#18191e !important',
                            },
                          }}
                        >
                          {p.rank}
                        </TableCell>

                        {/* Player */}
                        <TableCell
                          sx={{
                            py: 1.5,
                            pl: { xs: 2, sm: 3 },
                            pr: { xs: 1, sm: 1.5 },
                            width: { xs: 170, sm: 230, md: 260 },
                            minWidth: { xs: 170, sm: 230, md: 260 },
                            maxWidth: { xs: 170, sm: 230, md: 260 },
                            position: 'sticky',
                            left: { xs: 32, sm: 40 },
                            zIndex: 9,
                            backgroundColor: isHighlighted ? '#183328 !important' : '#121316 !important',
                            boxShadow: 'none',
                            transition: 'background-color 0.2s, box-shadow 0.2s',
                            borderBottom: '1px solid #1c1d22',
                            overflow: 'hidden',
                            '.MuiTableRow-root:hover &': {
                              backgroundColor: isHighlighted ? '#1c3c2f !important' : '#18191e !important',
                            },
                            '.is-scrolled &': {
                              boxShadow: '8px 0 12px -12px rgba(0, 0, 0, 0.6) !important',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, sm: 1.75 }, overflow: 'hidden' }}>
                            <Avatar
                              src={p.profilePicture}
                              sx={{
                                width: { xs: 34, sm: 38 },
                                height: { xs: 34, sm: 38 },
                                bgcolor: p.profilePicture ? 'transparent' : getAvatarBackgroundColor(p.name),
                                color: '#fff',
                                fontSize: 13,
                                fontWeight: 700,
                                flexShrink: 0,
                                border: isRank1 ? '1.5px solid #22c55e' : '1px solid #22242a',
                              }}
                            >
                              {!p.profilePicture && getAvatarInitials({ name: p.name })}
                            </Avatar>
                            <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 0.6, overflow: 'hidden' }}>
                              <Link
                                href={`/player/${p.id}`}
                                style={{
                                  textDecoration: 'none',
                                  color: '#ffffff',
                                  fontWeight: 700,
                                  fontSize: 14,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  fontFamily: 'var(--font-woodford-bourne-pro)',
                                }}
                              >
                                {p.name}
                              </Link>
                              {isRegisteredPlayerRecord(p) && (
                                <Shield size={13} color="#60a5fa" style={{ flexShrink: 0 }} />
                              )}
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Position */}
                        <TableCell sx={{
                          color: '#9ca3af',
                          fontWeight: 600,
                          fontSize: 13,
                          py: 1.5,
                          textAlign: 'center',
                          minWidth: { xs: 75, sm: 100 },
                          borderBottom: '1px solid #1c1d22',
                          backgroundColor: 'transparent !important',
                        }}>
                          {getPositionShortForm(p.position || p.positionType || '') || '-'}
                        </TableCell>

                        {/* Country */}
                        <TableCell sx={{
                          color: p.country ? '#d1d5db' : '#6b7280',
                          fontSize: 13,
                          fontWeight: 500,
                          py: 1.5,
                          textAlign: 'center',
                          minWidth: { xs: 90, sm: 120 },
                          borderBottom: '1px solid #1c1d22',
                          backgroundColor: 'transparent !important',
                        }}>
                          {p.country || '-'}
                        </TableCell>

                        {/* XP Status Pill */}
                        <TableCell sx={{
                          py: 1.5,
                          textAlign: 'center',
                          minWidth: { xs: 85, sm: 110 },
                          borderBottom: '1px solid #1c1d22',
                          backgroundColor: 'transparent !important',
                        }}>
                          {(() => {
                            const statusTitle = getLevelTitle(p.totalXP ?? 0);
                            const t = statusTitle.toLowerCase();
                            let bg = 'rgba(255, 255, 255, 0.08)';
                            let color = '#fff';
                            let border = '1px solid rgba(255, 255, 255, 0.12)';
                            if (t === 'pro') {
                              bg = 'rgba(110, 86, 207, 0.22)';
                              color = '#c4b5fd';
                              border = '1px solid rgba(139, 92, 246, 0.3)';
                            } else if (t === 'baller') {
                              bg = 'rgba(217, 119, 6, 0.2)';
                              color = '#fcd34d';
                              border = '1px solid rgba(245, 158, 11, 0.3)';
                            } else if (t === 'rookie') {
                              bg = 'rgba(148, 163, 184, 0.15)';
                              color = '#cbd5e1';
                              border = '1px solid rgba(148, 163, 184, 0.25)';
                            } else if (t === 'rising star') {
                              bg = 'rgba(56, 189, 248, 0.2)';
                              color = '#7dd3fc';
                              border = '1px solid rgba(56, 189, 248, 0.3)';
                            } else if (t === 'elite') {
                              bg = 'rgba(59, 130, 246, 0.22)';
                              color = '#93c5fd';
                              border = '1px solid rgba(59, 130, 246, 0.3)';
                            } else if (t.includes('champion')) {
                              bg = 'rgba(239, 68, 68, 0.22)';
                              color = '#fca5a5';
                              border = '1px solid rgba(239, 68, 68, 0.3)';
                            } else if (t === 'goat') {
                              bg = 'rgba(234, 179, 8, 0.22)';
                              color = '#fde047';
                              border = '1px solid rgba(234, 179, 8, 0.3)';
                            }
                            return (
                              <Box
                                component="span"
                                sx={{
                                  display: 'inline-block',
                                  px: 1.5,
                                  py: 0.3,
                                  borderRadius: '9999px',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  bgcolor: bg,
                                  color: color,
                                  border: border,
                                  lineHeight: 1.2,
                                  textTransform: 'capitalize',
                                }}
                              >
                                {statusTitle}
                              </Box>
                            );
                          })()}
                        </TableCell>

                        {/* Total XP / Avg XP */}
                        <TableCell sx={{
                          color: '#22c55e',
                          fontWeight: 800,
                          fontSize: 15,
                          fontFamily: 'var(--font-woodford-bourne-pro)',
                          py: 1.5,
                          pr: { xs: 2, sm: 3 },
                          textAlign: 'right',
                          minWidth: { xs: 90, sm: 120 },
                          borderBottom: '1px solid #1c1d22',
                          backgroundColor: 'transparent !important',
                        }}>
                          <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                          }}>
                            <Typography sx={{
                              fontWeight: 800,
                              fontSize: { xs: 13, sm: 15 },
                              color: '#22c55e',
                              fontFamily: 'var(--font-woodford-bourne-pro)',
                              textAlign: 'right',
                              lineHeight: 1.2,
                            }}>
                              {filters.mode === 'avg'
                                ? formatNum(p.avgXP, { decimals: 2 })
                                : formatNum(p.totalXP)}
                            </Typography>
                            {filters.mode !== 'avg' && (
                              <Box sx={{ width: '100%', mt: 0.6, display: { xs: 'none', sm: 'flex' }, justifyContent: 'flex-end' }}>
                                <Box sx={{
                                  width: { xs: 55, sm: 75, md: 85 },
                                  height: 3.5,
                                  backgroundColor: '#262930',
                                  borderRadius: '9999px',
                                  overflow: 'hidden',
                                }}>
                                  <Box sx={{
                                    width: `${Math.min(100, Math.max(3, ((Number(p.totalXP) || 0) / 25000) * 100))}%`,
                                    height: '100%',
                                    backgroundColor: '#22c55e',
                                    borderRadius: '9999px',
                                  }} />
                                </Box>
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}

                {!loading && error && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ border: 'none' }}>
                      <Typography sx={{ textAlign: 'center', py: 5, fontSize: 14, color: '#e56a16' }}>
                        {error}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {!loading && !error && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ border: 'none' }}>
                      <Typography sx={{ textAlign: 'center', py: 5, fontSize: 14, color: '#717d8f' }}>
                        No players found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {/* Show More Row */}
                {!loading && visibleLimit < filtered.length && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      sx={{
                        p: 0,
                        borderBottom: 'none',
                        bgcolor: '#121316 !important',
                      }}
                    >
                      <Box
                        onClick={() => setVisibleLimit((prev) => prev + 10)}
                        sx={{
                          position: 'sticky',
                          left: 0,
                          width: { xs: 'calc(100vw - 32px)', sm: '100%' },
                          maxWidth: 1220,
                          py: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          color: '#e56a16',
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer',
                          userSelect: 'none',
                          letterSpacing: '0.8px',
                          textTransform: 'uppercase',
                          fontFamily: 'var(--font-woodford-bourne-pro)',
                          borderTop: '1px solid #1c1d22',
                          transition: 'all 0.15s ease',
                          '&:hover': { color: '#f97316' },
                        }}
                      >
                        <span>SHOW MORE</span>
                        <ChevronDown size={14} color="currentColor" />
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>
    </Box>
  );
}

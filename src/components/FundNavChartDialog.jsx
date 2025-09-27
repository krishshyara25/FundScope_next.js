'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Tooltip,
  Stack,
  Chip,
  TextField,
  Button,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TimelineIcon from '@mui/icons-material/Timeline';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import InsightsIcon from '@mui/icons-material/Insights';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { LineChart, Line, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

async function fetchScheme(code) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const res = await fetch(`${baseUrl}/api/scheme/${code}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch scheme');
  return res.json();
}

export default function FundNavChartDialog({ open, onClose, schemeCode, schemeName }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [range, setRange] = useState('1y');
  // Custom date range state
  const [customRange, setCustomRange] = useState({ start: '', end: '', active: false });

  useEffect(() => {
    if (!open || !schemeCode) return;
    setLoading(true);
    setError(null);
    fetchScheme(schemeCode)
      .then(data => { setRawData(data); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [open, schemeCode]);

  const navHistory = useMemo(() => {
    if (!rawData?.data) return [];
    const parseApiDate = (str) => {
      // mfapi.in format is usually DD-MM-YYYY; fall back if already ISO
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const d = new Date(str);
        return { dateObj: d, iso: str };
      }
      const parts = str.split('-');
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        const iso = `${yyyy}-${mm}-${dd}`; // safe ISO ordering
        const d = new Date(iso);
        return { dateObj: d, iso };
      }
      const d = new Date(str);
      return { dateObj: d, iso: isNaN(d) ? '' : d.toISOString().slice(0,10) };
    };
    return rawData.data
      .map(d => {
        const { dateObj, iso } = parseApiDate(d.date);
        return {
          originalDate: d.date,
            // original API date string (DD-MM-YYYY)
          date: d.date, // keep for legacy display (will still show original)
          iso,          // standardized YYYY-MM-DD for inputs
          dateObj,
          nav: parseFloat(d.nav)
        };
      })
      .filter(p => p.iso && !isNaN(p.dateObj))
      .sort((a,b) => a.dateObj - b.dateObj);
  }, [rawData]);

  const filteredHistory = useMemo(() => {
    if (!navHistory.length) return [];
    if (range === 'max') return navHistory;
    const end = navHistory[navHistory.length - 1];
    const endDate = new Date(end.dateObj);
    const startDate = new Date(endDate);
    switch(range){
      case '3m': startDate.setMonth(startDate.getMonth() - 3); break;
      case '6m': startDate.setMonth(startDate.getMonth() - 6); break;
      case '1y': startDate.setFullYear(startDate.getFullYear() - 1); break;
      case '3y': startDate.setFullYear(startDate.getFullYear() - 3); break;
      case '5y': startDate.setFullYear(startDate.getFullYear() - 5); break;
      default: startDate.setFullYear(startDate.getFullYear() - 1);
    }
    return navHistory.filter(p => p.dateObj >= startDate);
  }, [navHistory, range]);

  // Apply custom range if active
  const displayHistory = useMemo(() => {
    if (!navHistory.length) return [];
    if (customRange.active && customRange.start && customRange.end) {
      const startDate = new Date(customRange.start);
      const endDate = new Date(customRange.end);
      if (startDate > endDate) return [];
      return navHistory.filter(p => p.dateObj >= startDate && p.dateObj <= endDate);
    }
    return filteredHistory;
  }, [navHistory, filteredHistory, customRange]);

  const stats = useMemo(() => {
    if (!displayHistory.length) return null;
    const first = displayHistory[0];
    const last = displayHistory[displayHistory.length - 1];
    const change = last.nav - first.nav;
    const changePct = (change / first.nav) * 100;
    let maxPoint = first;
    let minPoint = first;
    for (const p of displayHistory) {
      if (p.nav > maxPoint.nav) maxPoint = p;
      if (p.nav < minPoint.nav) minPoint = p;
    }
    return {
      first,
      last,
      change,
      changePct,
      max: maxPoint.nav,
      maxDate: maxPoint.date,
      min: minPoint.nav,
      minDate: minPoint.date,
      periodLabel: customRange.active && customRange.start && customRange.end
        ? `${customRange.start} → ${customRange.end}`
        : `${first.date} → ${last.date}`
    };
  }, [displayHistory, customRange]);

  const handleRangeChange = (_, v) => { if (v) setRange(v); };

  const earliestISO = useMemo(() => navHistory.length ? navHistory[0].iso : '', [navHistory]);

  const latestISO = useMemo(() => navHistory.length ? navHistory[navHistory.length - 1].iso : '', [navHistory]);

  const applyCustomRange = () => {
    if (customRange.start && customRange.end) {
      setCustomRange(r => ({ ...r, active: true }));
    }
  };

  const clearCustomRange = () => {
    setCustomRange({ start: '', end: '', active: false });
  };

  const invalidCustom = useMemo(() => {
    if (!customRange.start || !customRange.end) return false;
    return new Date(customRange.start) > new Date(customRange.end);
  }, [customRange.start, customRange.end]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle component="div" sx={{ pr: 6, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShowChartIcon color="primary" />
        <Typography component="h2" variant="h6" sx={{ flex: 1, fontWeight: 600 }} noWrap>
          {schemeName || 'Fund Performance'}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: 'background.default' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Box sx={{ color: 'error.main', py: 4 }}>{error}</Box>
        )}
        {!loading && !error && (
          <Box>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={2} alignItems="stretch" flexWrap="wrap" sx={{ rowGap: 1 }}>
                <ToggleButtonGroup value={range} exclusive size="small" onChange={handleRangeChange} color="primary" disabled={customRange.active} sx={{ alignSelf: 'center' }}>
                  <ToggleButton value="3m">3M</ToggleButton>
                  <ToggleButton value="6m">6M</ToggleButton>
                  <ToggleButton value="1y">1Y</ToggleButton>
                  <ToggleButton value="3y">3Y</ToggleButton>
                  <ToggleButton value="5y">5Y</ToggleButton>
                  <ToggleButton value="max">MAX</ToggleButton>
                </ToggleButtonGroup>
                <Paper elevation={customRange.active ? 6 : 2} sx={{ p: 1.5, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', border: theme => customRange.active ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent', transition: 'border-color .2s' }}>
                  <CalendarMonthIcon fontSize="small" color={customRange.active ? 'primary':'action'} />
                  <TextField
                    label="Start"
                    type="date"
                    size="small"
                    value={customRange.start}
                    inputProps={{ min: earliestISO, max: customRange.end || latestISO }}
                    onChange={e => setCustomRange(r => ({ ...r, start: e.target.value }))}
                    disabled={!navHistory.length}
                    sx={{ minWidth: 150 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="End"
                    type="date"
                    size="small"
                    value={customRange.end}
                    inputProps={{ min: customRange.start || earliestISO, max: latestISO }}
                    onChange={e => setCustomRange(r => ({ ...r, end: e.target.value }))}
                    disabled={!navHistory.length}
                    sx={{ minWidth: 150 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  {!customRange.active ? (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<CheckCircleOutlineIcon />}
                      disabled={!customRange.start || !customRange.end || invalidCustom}
                      onClick={applyCustomRange}
                      sx={{ textTransform: 'none', fontWeight: 500 }}
                    >Apply</Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      startIcon={<RestartAltIcon />}
                      onClick={clearCustomRange}
                      sx={{ textTransform: 'none' }}
                    >Clear</Button>
                  )}
                  {invalidCustom && (
                    <Typography variant="caption" color="error.main" sx={{ ml: 0.5 }}>Start must be before End</Typography>
                  )}
                  {customRange.active && (
                    <Chip size="small" color="primary" variant="outlined" label="Custom Active" />
                  )}
                </Paper>
              </Stack>
              {stats && (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip size="small" color={stats.change >=0 ? 'success':'error'} label={`Change: ${stats.change>=0?'+':''}${stats.change.toFixed(2)} (${stats.changePct.toFixed(2)}%)`} />
                  <Chip size="small" label={`High: ${stats.max.toFixed(2)} on ${stats.maxDate}`} />
                  <Chip size="small" label={`Low: ${stats.min.toFixed(2)} on ${stats.minDate}`} />
                  <Chip size="small" variant={customRange.active ? 'filled':'outlined'} label={stats.periodLabel} />
                </Stack>
              )}
            </Stack>
            <Box sx={{ width: '100%', height: 420 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayHistory} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="date" minTickGap={30} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                  <ReTooltip formatter={(v) => v.toFixed(4)} labelFormatter={(l) => `Date: ${l}`} />
                  <Line type="monotone" dataKey="nav" stroke="#667eea" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            {customRange.active && !displayHistory.length && (
              <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>No data in selected custom range.</Typography>
            )}
            {stats && displayHistory.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Start</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats.first.date}: {stats.first.nav.toFixed(4)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">End</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats.last.date}: {stats.last.nav.toFixed(4)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Peak</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats.maxDate}: {stats.max.toFixed(4)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Trough</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats.minDate}: {stats.min.toFixed(4)}</Typography>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

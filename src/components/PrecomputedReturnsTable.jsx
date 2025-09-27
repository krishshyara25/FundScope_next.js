'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, Typography, Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, CircularProgress, Alert, Tooltip } from '@mui/material';
import { calculateReturns } from '@/utils/calculator';

/**
 * PrecomputedReturnsTable
 * Fetches scheme NAV history and calculates returns across standard periods.
 * Props: schemeCode (string)
 */
const PERIODS = ['1m','3m','6m','1y','3y','5y'];

export default function PrecomputedReturnsTable({ schemeCode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [navHistory, setNavHistory] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!schemeCode) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true); setError(null);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
        const res = await fetch(`${baseUrl}/api/scheme/${schemeCode}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load scheme NAV data');
        const json = await res.json();
        if (cancelled) return;
        const hist = (json?.data || []).map(r => ({ date: r.date, nav: r.nav })).filter(r => r.nav && !isNaN(parseFloat(r.nav)));
        setNavHistory(hist);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [schemeCode]);

  useEffect(() => {
    if (!navHistory.length) { setResults([]); return; }
    const computed = [];
    for (const p of PERIODS) {
      try {
        const r = calculateReturns({ navHistory: navHistory.map(n => ({ date: n.date, nav: n.nav })), period: p });
        computed.push(r);
      } catch (e) {
        // Not enough data for that period – ignore silently
      }
    }
    setResults(computed);
  }, [navHistory]);

  const formatPct = (v) => v === null || v === undefined ? '—' : `${v.toFixed(2)}%`;

  return (
    <Card sx={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(255,255,255,1) 100%)' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Period Returns</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Absolute & annualized performance based on actual NAV points.
        </Typography>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={32} /></Box>
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {!loading && !error && results.length === 0 && (
          <Typography variant="body2" color="text.secondary">Not enough historical data to compute standard periods.</Typography>
        )}
        {!loading && !error && results.length > 0 && (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 560 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Period</TableCell>
                  <TableCell align="right">Start NAV</TableCell>
                  <TableCell align="right">End NAV</TableCell>
                  <TableCell align="right">Abs Return</TableCell>
                  <TableCell align="right">% Return</TableCell>
                  <TableCell align="right">Annualized</TableCell>
                  <TableCell align="right">Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map(r => {
                  const positive = r.percentageReturn >= 0;
                  return (
                    <TableRow key={r.period} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{r.period.toUpperCase()}</TableCell>
                      <TableCell align="right">{r.startNav.toFixed(4)}</TableCell>
                      <TableCell align="right">{r.endNav.toFixed(4)}</TableCell>
                      <TableCell align="right" style={{ color: positive ? '#059669' : '#dc2626' }}>{r.absoluteReturn.toFixed(4)}</TableCell>
                      <TableCell align="right" style={{ color: positive ? '#059669' : '#dc2626' }}>{formatPct(r.percentageReturn)}</TableCell>
                      <TableCell align="right">{r.annualizedReturn ? formatPct(r.annualizedReturn) : '—'}</TableCell>
                      <TableCell align="right">{r.duration.years >= 1 ? `${r.duration.years} yrs` : `${r.duration.days}d`}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

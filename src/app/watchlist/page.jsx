// src/app/watchlist/page.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link as MuiLink,
  Button,
  Fade,
  Chip
} from '@mui/material';
import Link from 'next/link';
import {
  Bookmark,
  TrendingUp,
  NavigateNext,
  Home
} from '@mui/icons-material';
import { ReturnChip } from '@/components/ReturnComponents'; // Assuming this component exists

// Define the periods required for the watchlist display
const WATCHLIST_PERIODS = ['1d', '1m', '3m', '6m', '1y'];

// Fetch the user's watchlist from the API
async function fetchWatchlist() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const res = await fetch(`${baseUrl}/api/watchlist`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch watchlist');
  }
  const data = await res.json();
  return data.watchlist || [];
}

// Fetch scheme data and calculate returns for all watchlist items
async function fetchWatchlistData(watchlist) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  
  const promises = watchlist.map(async (item) => {
    try {
      const res = await fetch(`${baseUrl}/api/scheme/${item.scheme_code}`, { cache: 'no-store' });
      const schemeData = await res.json();
      
      const navHistory = schemeData.data?.map(d => ({ date: d.date, nav: parseFloat(d.nav) })).filter(n => !isNaN(n.nav)) || [];

      // Fetch precomputed returns for required periods
      const returnPromises = WATCHLIST_PERIODS.map(period => 
        fetch(`${baseUrl}/api/scheme/${item.scheme_code}/returns?period=${period}`)
          .then(res => res.json())
          .catch(() => ({ period, percentageReturn: null })) // Handle failure gracefully
      );

      const returns = await Promise.all(returnPromises);

      const returnsMap = returns.reduce((acc, r) => {
        if (r.period) {
          acc[r.period] = r.percentageReturn;
        }
        return acc;
      }, {});

      return {
        scheme_code: item.scheme_code,
        scheme_name: item.scheme_name,
        fund_house: schemeData.meta?.fund_house || 'N/A',
        latestNav: navHistory.length ? navHistory[navHistory.length - 1].nav : null,
        returns: returnsMap,
        error: null,
      };
    } catch (error) {
      return {
        scheme_code: item.scheme_code,
        scheme_name: item.scheme_name,
        error: error.message,
        returns: {},
      };
    }
  });

  return Promise.all(promises);
}

export default function WatchlistPage() {
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const watchlist = await fetchWatchlist();
      if (watchlist.length === 0) {
        setWatchlistItems([]);
        return;
      }
      
      const data = await fetchWatchlistData(watchlist);
      setWatchlistItems(data);

    } catch (err) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const handleRemove = async (schemeCode) => {
    try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
        const res = await fetch(`${baseUrl}/api/watchlist`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scheme_code: schemeCode })
        });

        if (!res.ok) {
            throw new Error('Failed to remove fund from watchlist.');
        }
        
        // Reload data after successful deletion
        await loadData();
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 4,
    }).format(value);
  };
  
  const totalItems = watchlistItems.length;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header and Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Bookmark sx={{ fontSize: 36, mr: 2, color: 'secondary.main' }} />
          My Watchlist
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Monitor performance of {totalItems} selected funds.
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
          <Typography variant="h6" color="text.secondary" sx={{ ml: 2 }}>
            Loading watchlist data...
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && totalItems === 0 && (
        <Fade in={true}>
          <Alert severity="info" icon={<Bookmark />}>
            Your watchlist is empty. Go to the <MuiLink component={Link} href="/funds" sx={{ fontWeight: 600 }}>All Funds</MuiLink> page or any scheme details page to add funds.
          </Alert>
        </Fade>
      )}

      {!loading && totalItems > 0 && (
        <TableContainer component={Paper} elevation={3}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Fund Name</TableCell>
                <TableCell align="right">Latest NAV</TableCell>
                <TableCell align="center">1 Day</TableCell>
                <TableCell align="center">1 Month</TableCell>
                <TableCell align="center">3 Months</TableCell>
                <TableCell align="center">6 Months</TableCell>
                <TableCell align="center">1 Year</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {watchlistItems.map((item) => (
                <TableRow key={item.scheme_code} hover>
                  <TableCell component="th" scope="row">
                    <MuiLink component={Link} href={`/scheme/${item.scheme_code}`} sx={{ fontWeight: 600 }}>
                        {item.scheme_name}
                    </MuiLink>
                    <Typography variant="caption" color="text.secondary" display="block">
                        {item.fund_house}
                    </Typography>
                    {item.error && <Chip label="Data Error" color="error" size="small" sx={{ mt: 0.5 }} />}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(item.latestNav)}
                  </TableCell>
                  {WATCHLIST_PERIODS.map(period => (
                    <TableCell key={period} align="center">
                      <ReturnChip value={item.returns[period]} showIcon={true} variant="filled" />
                    </TableCell>
                  ))}
                  <TableCell align="center">
                    <Button 
                        size="small" 
                        color="error" 
                        onClick={() => handleRemove(item.scheme_code)}
                        sx={{ textTransform: 'none' }}
                    >
                        Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
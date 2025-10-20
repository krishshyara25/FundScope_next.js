// src/app/scheme/[code]/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  CircularProgress,
  Box,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Chip,
  Container,
  Paper,
  Button,
  // ButtonGroup, // Not used
  Skeleton,
  Fade
} from '@mui/material';
import Link from 'next/link';
import {
  Home,
  NavigateNext,
  TrendingUp,
  // Assessment, // Not used
  // Calculate, // Not used
  Share,
  Bookmark,
  BookmarkBorder
} from '@mui/icons-material';

// --- Essential Component ---
import SchemeDetails from '@/components/SchemeDetails';

// 🚀 PERFORMANCE IMPROVEMENT: Dynamic Imports (Lazy Loading) for heavy components
import dynamic from 'next/dynamic';

const NavChart = dynamic(() => import('@/components/NavChart'), {
    loading: () => <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />,
});
const PrecomputedReturnsTable = dynamic(() => import('@/components/PrecomputedReturnsTable'), {
    loading: () => <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />,
});
const SipCalculator = dynamic(() => import('@/components/SipCalculator'), {
    loading: () => <Skeleton variant="rectangular" height={450} sx={{ borderRadius: 2 }} />,
});
// -----------------------------


async function fetchSchemeDetails(code) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  // NOTE: Server-side cache should be optimized here for performance if data is static (e.g., revalidate: 3600)
  const res = await fetch(`${baseUrl}/api/scheme/${code}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch scheme details');
  }
  const data = await res.json();
  return data;
}

// Check if scheme is in watchlist
async function checkWatchlist(code) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const res = await fetch(`${baseUrl}/api/watchlist`);
  if (!res.ok) return false;
  const data = await res.json();
  // Check if scheme code exists in the list of watchlist items (which includes scheme_code and scheme_name)
  return data.watchlist?.some(item => item.scheme_code === code) || false;
}

// Toggle scheme in watchlist (ADD or DELETE)
async function toggleWatchlist(code, name, isWatched) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const method = isWatched ? 'DELETE' : 'POST';
    
    const res = await fetch(`${baseUrl}/api/watchlist`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheme_code: code, scheme_name: name })
    });
    
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || `Failed to ${isWatched ? 'remove' : 'add'} fund.`);
    }
    return !isWatched; // Return new state (if it was added, return true; if removed, return false)
}


export default function SchemePage(props) {
  // Avoid destructuring `params` in the signature (synchronous access).
  // Unwrap the possibly Promise-like params using React.use(props.params).
  const resolvedParams = React.use(props.params);
  const { code } = resolvedParams || {};
  const [schemeData, setSchemeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWatched, setIsWatched] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  useEffect(() => {
    const loadSchemeData = async () => {
      try {
        setLoading(true);
        
        // 🚀 OPTIMIZATION: Fetch details and watchlist status in parallel
        const [data, watched] = await Promise.all([
          fetchSchemeDetails(code),
          checkWatchlist(code)
        ]);
        
        setSchemeData(data);
        setIsWatched(watched);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSchemeData();
  }, [code]);

  const handleToggleWatchlist = async () => {
    if (!schemeData || watchlistLoading) return;
    setWatchlistLoading(true);
    setError(null);
    try {
        const newWatchedState = await toggleWatchlist(
            code, 
            schemeData.meta.scheme_name, 
            isWatched
        );
        setIsWatched(newWatchedState);
    } catch (err) {
        setError(err.message);
    } finally {
        setWatchlistLoading(false);
    }
  };


  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={32} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="80%" height={48} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" height={24} sx={{ mb: 3 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading scheme details: {error}
      </Alert>
    );
  }

  if (!schemeData) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        No scheme data available
      </Alert>
    );
  }

  const { meta, data } = schemeData;

  const navHistory = data?.map(item => ({
    date: item.date,
    value: parseFloat(item.nav)
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  const latestNav = navHistory.length > 0 ? navHistory[navHistory.length - 1] : null;
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs 
        separator={<NavigateNext fontSize="small" />} 
        sx={{ mb: 3 }}
      >
        <MuiLink
          component={Link}
          href="/funds"
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          <Home sx={{ mr: 0.5, fontSize: 20 }} />
          All Funds
        </MuiLink>
        <Typography color="text.primary">
          {meta?.scheme_name || 'Fund Details'}
        </Typography>
      </Breadcrumbs>

      <Fade in={true} timeout={600}>
        <Paper 
          sx={{ 
            p: 4, 
            mb: 4,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {meta?.scheme_name || 'Unknown Scheme'}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip
                  icon={<TrendingUp />}
                  label={meta?.fund_house || 'N/A'}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={meta?.scheme_category || 'N/A'}
                  color="secondary"
                  variant="outlined"
                />
                {meta?.scheme_type && (
                  <Chip
                    label={meta.scheme_type}
                    variant="outlined"
                  />
                )}
              </Box>
              
              <Typography variant="body1" color="text.secondary" paragraph>
                Scheme Code: {code} • ISIN: {meta?.isin || 'N/A'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              {latestNav && (
                <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Typography variant="body2" color="text.secondary">
                    Latest NAV
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    ₹{latestNav.value.toFixed(4)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(latestNav.date).toLocaleDateString('en-IN')}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Button
                    variant={isWatched ? 'contained' : 'outlined'}
                    color={isWatched ? 'secondary' : 'primary'}
                    startIcon={isWatched ? <Bookmark /> : <BookmarkBorder />} // Icon based on state
                    size="small"
                    onClick={handleToggleWatchlist}
                    disabled={watchlistLoading}
                >
                    {watchlistLoading ? 'Updating...' : isWatched ? 'On Watchlist' : 'Add to Watchlist'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  size="small"
                >
                  Share
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      <Fade in={true} timeout={800}>
        <Grid container spacing={4} alignItems="stretch">
          
          {/* 1. NAV Performance & Chart (Full Width) - NOW LAZY LOADED */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, minHeight: 320 }}>
              <NavChart navHistory={navHistory} />
            </Paper>
          </Grid>
          
          {/* 2. Fund Details (Half Width) */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: 'background.paper' }}>
              <SchemeDetails meta={meta} />
            </Paper>
          </Grid>
          
          {/* 3. Period Returns (Half Width) - NOW LAZY LOADED */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: 'background.paper' }}>
              <PrecomputedReturnsTable schemeCode={code} />
            </Paper>
          </Grid>
          
          {/* 4. SIP Calculator (Full Width) - NOW LAZY LOADED */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <SipCalculator schemeCode={code} />
            </Paper>
          </Grid>

        </Grid>
      </Fade>
    </Container>
  );
}
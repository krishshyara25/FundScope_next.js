'use client';

import { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  CircularProgress, 
  Box, 
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Chip,
  Paper,
  Button,
  ButtonGroup,
  Skeleton,
  Fade
} from '@mui/material';
import Link from 'next/link';
import { 
  Home, 
  NavigateNext,
  TrendingUp,
  Assessment,
  Calculate,
  Share,
  BookmarkBorder
} from '@mui/icons-material';
import SchemeDetails from '@/components/SchemeDetails';
import NavChart from '@/components/NavChart';
import SipCalculator from '@/components/SipCalculator';

// Client-side function to fetch scheme details
async function fetchSchemeDetails(code) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');
  const res = await fetch(`${baseUrl}/api/scheme/${code}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch scheme details');
  }
  const data = await res.json();
  return data;
}

export default function SchemePage({ params }) {
  const { code } = params;
  const [schemeData, setSchemeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSchemeData = async () => {
      try {
        setLoading(true);
        const data = await fetchSchemeDetails(code);
        setSchemeData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSchemeData();
  }, [code]);

  if (loading) {
    return (
      <Box>
        {/* Breadcrumb Skeleton */}
        <Skeleton variant="text" width={300} height={32} sx={{ mb: 2 }} />
        
        {/* Header Skeleton */}
        <Skeleton variant="text" width="80%" height={48} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" height={24} sx={{ mb: 3 }} />
        
        {/* Content Skeleton */}
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

  // Get latest NAV for display
  const latestNav = navHistory.length > 0 ? navHistory[navHistory.length - 1] : null;

  return (
    <Box>
      {/* Breadcrumb Navigation */}
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

      {/* Header Section */}
      <Fade in={true} timeout={600}>
        <Paper 
          sx={{ 
            p: 4, 
            mb: 4,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(255, 255, 255, 1) 100%)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
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
            
            <Grid size={{ xs: 12, md: 4 }}>
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
                  variant="outlined"
                  startIcon={<BookmarkBorder />}
                  size="small"
                >
                  Watchlist
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

      {/* Main Content */}
      <Fade in={true} timeout={800}>
        <Grid container spacing={4}>
          {/* Fund Details */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <SchemeDetails meta={meta} />
          </Grid>
          
          {/* NAV Chart */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <NavChart navHistory={navHistory} />
          </Grid>
          
          {/* SIP Calculator */}
          <Grid size={{ xs: 12 }}>
            <SipCalculator schemeCode={code} />
          </Grid>
        </Grid>
      </Fade>
    </Box>
  );
}
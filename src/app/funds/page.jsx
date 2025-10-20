// src/app/funds/page.jsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Typography, 
  Container, 
  TextField, 
  Grid, 
  Card, 
  CardContent,
  Box,
  Chip,
  InputAdornment,
  Paper,
  Button,
  ButtonGroup,
  Skeleton,
  Alert,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Pagination,
  Divider,
  Stack,
  Avatar // Added for styling
} from '@mui/material';
import { 
  Search, 
  FilterList, 
  TrendingUp, 
  TrendingDown,
  AccountBalance,
  ViewList,
  ViewModule,
  Info
} from '@mui/icons-material';
import Link from 'next/link';
import { LoadingBar } from '@/components/LoadingComponents';
import { PerformanceIndicator, OptimizationBanner, LoadingOptimization } from '@/components/PerformanceComponents';


// --- Data Fetching Functions (Unchanged for Redesign) ---

// Client-side function to fetch schemes with pagination (UPDATED to include status)
async function fetchSchemes(page = 1, limit = 15, search = '', category = 'all', fundHouse = 'all', status = 'active') {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    status: status, 
  });
  
  if (search) params.append('search', search);
  if (category !== 'all') params.append('category', category);
  if (fundHouse !== 'all') params.append('fundHouse', fundHouse);
  
  const res = await fetch(`${baseUrl}/api/mf?${params}`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch schemes: ${res.status} ${res.statusText}`);
  }
  
  return await res.json();
}

// Fetch a reasonable subset of schemes for filters (Optimization from previous step)
async function fetchAllSchemes() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  
  // Reduced limit for faster initial load of filter options
  const res = await fetch(`${baseUrl}/api/mf?limit=500&status=all`, { 
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch schemes: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : data.data || [];
}

// --- Component Logic (Mostly Unchanged) ---

export default function FundsPage() {
  const router = useRouter(); 
  const [schemes, setSchemes] = useState([]);
  const [allSchemes, setAllSchemes] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFundHouse, setSelectedFundHouse] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [fundStatus, setFundStatus] = useState('active'); 
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 15; 

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch initial data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const allData = await fetchAllSchemes();
        setAllSchemes(allData);
        
        const response = await fetchSchemes(1, itemsPerPage, '', 'all', 'all', fundStatus);
        if (response.data) {
          setSchemes(response.data);
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.total);
        } else {
          // Fallback logic for non-paginated API (kept for robustness)
          setSchemes(response.slice(0, itemsPerPage));
          setTotalPages(Math.ceil(response.length / itemsPerPage));
          setTotalItems(response.length);
        }
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Fetch data when filters or page changes
  useEffect(() => {
    const loadFilteredData = async () => {
      try {
        setLoading(true);
        
        const response = await fetchSchemes(
          currentPage, 
          itemsPerPage, 
          debouncedSearchTerm, 
          selectedCategory, 
          selectedFundHouse,
          fundStatus
        );
        
        if (response.data) {
          setSchemes(response.data);
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.total);
        } else {
          // Fallback filtering logic - simplified as API should handle this
          // Reverting to the old logic here is complex and slow, relying on paginated API is better.
          // For simplicity and performance, we rely on the API for filtering.
          setSchemes([]); 
          setTotalPages(0);
          setTotalItems(0);
        }
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Only load filtered data if we are in the main results loop
    if (loading === false || currentPage !== 1 || debouncedSearchTerm || selectedCategory !== 'all' || selectedFundHouse !== 'all' || fundStatus !== 'active') {
        loadFilteredData();
    }
  }, [currentPage, debouncedSearchTerm, selectedCategory, selectedFundHouse, fundStatus, allSchemes.length]); 

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory, selectedFundHouse, fundStatus]); 

  // Get unique categories and fund houses from *subset* schemes for filter options
  const categories = useMemo(() => {
    const cats = new Set(allSchemes.map(scheme => scheme.meta?.scheme_category).filter(Boolean));
    return Array.from(cats).sort();
  }, [allSchemes]);

  const fundHouses = useMemo(() => {
    const houses = new Set(allSchemes.map(scheme => scheme.meta?.fund_house).filter(Boolean));
    return Array.from(houses).sort();
  }, [allSchemes]);

  // Sort current page schemes (Client-side sorting is fast on 15 items)
  const sortedSchemes = useMemo(() => {
    const sorted = [...schemes];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.scheme_name || '').localeCompare(b.scheme_name || '');
        case 'fundHouse':
          return (a.meta?.fund_house || '').localeCompare(b.meta?.fund_house || '');
        case 'category':
          return (a.meta?.scheme_category || '').localeCompare(b.meta?.scheme_category || '');
        default:
          return 0;
      }
    });
    return sorted;
  }, [schemes, sortBy]);
  
  // Logic to determine if a fund is active
  const isFundActive = (fund) => {
    return !!fund.isin_growth || !!fund.isin_div_reinvestment;
  }


  if (loading && schemes.length === 0) {
    return (
      <LoadingOptimization 
        message="Initializing Fund Database"
        details="Fetching core metadata for filtering and display."
      />
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading funds: {error}
          <Button 
            onClick={() => window.location.reload()} 
            sx={{ ml: 2 }}
            variant="outlined"
            size="small"
          >
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  // --- Helper component for rendering fund card content (Redesigned) ---
  const FundCardContent = ({ fund }) => {
    const isActiveFund = isFundActive(fund);
    const showInactiveMarker = fundStatus !== 'active' && !isActiveFund;
    
    // Determine gradient color based on activity status
    const gradient = showInactiveMarker 
        ? 'linear-gradient(135deg, #fecaca 0%, #ef4444 100%)' // Red for inactive
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; // Primary for active

    if (viewMode === 'list') {
      return (
        <Grid container spacing={2} alignItems="center">
          {/* Fund Name and House */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.main', 
                  width: 32, 
                  height: 32,
                  background: gradient
                }}
              >
                 <TrendingUp sx={{ fontSize: 16, color: 'white' }} />
              </Avatar>
              <Box>
                <Typography 
                  variant="subtitle1" 
                  component="h3" 
                  sx={{ fontWeight: 600, textDecoration: showInactiveMarker ? 'line-through' : 'none' }}
                >
                  {fund.scheme_name || 'Inactive Scheme'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {fund.meta?.fund_house || 'Unknown Fund House'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          {/* Categories and Info */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'flex-end' }}>
              <Chip
                size="small"
                label={fund.meta?.scheme_category || 'Unknown Category'}
                color="default"
                variant="outlined"
              />
              {showInactiveMarker && <Chip label="INACTIVE" color="error" size="small" />}
              <Chip
                size="small"
                label={`Code: ${fund.scheme_code}`}
                variant="outlined"
                color="default"
              />
            </Box>
          </Grid>
        </Grid>
      );
    }
    
    // Grid View (Redesigned Card)
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main', 
              width: 40, 
              height: 40,
              background: gradient
            }}
          >
             <TrendingUp sx={{ fontSize: 20, color: 'white' }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h6" 
              component="h3" 
              sx={{ 
                fontWeight: 700, // Slightly bolder font
                mb: 0.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.3,
                textDecoration: showInactiveMarker ? 'line-through' : 'none'
              }}
            >
              {fund.scheme_name || 'Inactive Scheme'}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              {fund.meta?.fund_house || 'Unknown Fund House'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1, opacity: 0.5 }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          <Chip
            size="small"
            label={fund.meta?.scheme_category || 'Unknown Category'}
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
          {showInactiveMarker && <Chip label="INACTIVE" color="error" size="small" />}
          {fund.meta?.scheme_type && (
            <Chip
              size="small"
              label={fund.meta.scheme_type}
              color="secondary"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          )}
        </Box>
      </Box>
    );
  };

  // --- Main Render ---

  return (
    <Box>
      {/* Loading bar for subsequent loads */}
      {loading && schemes.length > 0 && (
        <LoadingBar message="Updating results..." />
      )}

      {/* Header and Title */}
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 }, mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{
            fontWeight: 800,
            color: 'text.primary',
            mb: 1
          }}
        >
          Mutual Fund Explorer
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Discover and analyze thousands of mutual funds
        </Typography>
      </Container>
      
      {/* Key Stats Bar (New Element) */}
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 }, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 3, bgcolor: (t) => t.palette.mode === 'light' ? t.palette.grey[100] : t.palette.grey[800] }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <AccountBalance color="primary" />
                    <Box>
                        <Typography variant="body2" color="text.secondary">Total Funds Displayed</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {totalItems.toLocaleString()}
                        </Typography>
                    </Box>
                </Stack>
            </Grid>
            <Grid item xs={12} sm={4}>
                 <Stack direction="row" alignItems="center" spacing={1}>
                    <Info color="secondary" />
                    <Box>
                        <Typography variant="body2" color="text.secondary">Fund Houses Tracked</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {fundHouses.length}
                        </Typography>
                    </Box>
                </Stack>
            </Grid>
            <Grid item xs={12} sm={4}>
                 <Stack direction="row" alignItems="center" spacing={1}>
                    <TrendingUp color="error" />
                    <Box>
                        <Typography variant="body2" color="text.secondary">Fund Status</Typography>
                        <Chip 
                            label={fundStatus === 'active' ? 'Active Only' : fundStatus === 'inactive' ? 'Inactive Only' : 'All Funds'}
                            color={fundStatus === 'active' ? 'secondary' : 'warning'}
                            variant="filled"
                            size="small"
                        />
                    </Box>
                </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Optimization Banner and Performance Indicator */}
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        <OptimizationBanner />
        <PerformanceIndicator
          isLoading={loading}
          totalItems={totalItems}
          currentItems={sortedSchemes.length}
          page={currentPage}
          totalPages={totalPages}
        />
      </Container>

      {/* Search, Filters, and Controls (Redesigned Paper Layout) */}
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        <Paper elevation={3} sx={{ p: 4, mb: 4, bgcolor: 'background.paper', borderRadius: 3 }}>
        <Grid container spacing={3}>
          {/* Search Bar (Full width until MD) */}
          <Grid item xs={12} md={6} lg={4} key="search-bar">
            {/* 💡 FIX 1: Enforce background color on Search TextField */}
            <TextField
              fullWidth
              label="Search funds or fund houses"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="primary" />
                  </InputAdornment>
                ),
                sx: { 
                  // Use theme's Paper color for input background
                  bgcolor: 'background.paper',
                  // Ensure InputBase elements are not transparent, especially in dark mode
                  opacity: 1
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>

          {/* Fund Status and Category Filters */}
          <Grid item xs={12} md={6} lg={4}> 
            <Stack direction="row" spacing={2}>
              {/* 💡 FIX 2: Enforce background color on Select 1 (Fund Status) */}
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}>
                <InputLabel>Fund Status</InputLabel>
                <Select
                  value={fundStatus}
                  label="Fund Status"
                  onChange={(e) => setFundStatus(e.target.value)}
                >
                  <MenuItem value="active">Active Funds</MenuItem>
                  <MenuItem value="inactive">Inactive/Delisted</MenuItem>
                  <MenuItem value="all">All Funds</MenuItem>
                </Select>
              </FormControl>
              {/* 💡 FIX 3: Enforce background color on Select 2 (Category) */}
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Grid>
          
          {/* Fund House Filter and View/Sort Controls */}
          <Grid item xs={12} lg={4}> 
             <Stack direction="row" spacing={2} alignItems="center" height="100%">
                {/* 💡 FIX 4: Enforce background color on Autocomplete (Fund House) */}
                <Autocomplete
                    autoHighlight
                    value={selectedFundHouse === 'all' ? null : selectedFundHouse}
                    onChange={(event, newValue) => {
                      setSelectedFundHouse(newValue || 'all');
                    }}
                    options={fundHouses}
                    sx={{ flexGrow: 1 }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Fund House" 
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          ...params.InputProps,
                          sx: { bgcolor: 'background.paper' } // Enforce background on Autocomplete InputBase
                        }}
                      />
                    )}
                />
                
                {/* 💡 FIX 5: Enforce background color on Select 3 (Sort) */}
                <FormControl size="small" sx={{ minWidth: 100, '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}>
                  <InputLabel>Sort</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="fundHouse">House</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                  </Select>
                </FormControl>

                <ButtonGroup variant="outlined" size="medium">
                    <Button 
                      onClick={() => setViewMode('grid')}
                      variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                      color={viewMode === 'grid' ? 'primary' : 'default'}
                    >
                      <ViewModule />
                    </Button>
                    <Button 
                      onClick={() => setViewMode('list')}
                      variant={viewMode === 'list' ? 'contained' : 'outlined'}
                      color={viewMode === 'list' ? 'primary' : 'default'}
                    >
                      <ViewList />
                    </Button>
                </ButtonGroup>
             </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Summary */}
      {!loading && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems.toLocaleString()} funds
          </Typography>
          <Typography variant="body2" color="text.secondary">
             Page {currentPage} of {totalPages}
          </Typography>
        </Box>
      )}

      {/* Loading State Skeleton */}
      {loading && (
        <Grid container spacing={3}>
          {Array.from({ length: 12 }).map((_, index) => (
            <Grid 
              item 
              xs={12} 
              sm={viewMode === 'grid' ? 6 : 12} 
              md={viewMode === 'grid' ? 4 : 12} 
              lg={viewMode === 'grid' ? 4 : 12} // enforce 3 per row on desktop
              sx={{ display: 'flex' }}
              key={`loading-skeleton-${index}`}
            >
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ flexGrow: 1 }}>
                       <Skeleton variant="text" width="90%" height={28} />
                       <Skeleton variant="text" width="60%" height={16} />
                    </Box>
                  </Stack>
                  <Box sx={{ display: 'flex', gap: 1, mt: 3, justifyContent: 'flex-end' }}>
                    <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Results */}
      {!loading && (
        <Fade in={true} timeout={500}>
          <Grid container spacing={3} alignItems="stretch">
            {sortedSchemes.map((fund, index) => (
              <Grid 
                item 
                xs={12} 
                sm={viewMode === 'grid' ? 6 : 12} 
                md={viewMode === 'grid' ? 4 : 12} // 3 funds per row on desktop
                lg={viewMode === 'grid' ? 4 : 12}
                key={fund.scheme_code || `fund-${index}`}
                sx={{ display: 'flex' }}
              >
                <Fade in={true} timeout={300 + index * 50}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      cursor: 'pointer',
                      borderRadius: 3, // Increased border radius for modern look
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(102, 126, 234, 0.15), 0 0 0 1px rgba(102, 126, 234, 0.2)', // Border on hover
                      },
                    }}
                    onClick={() => router.push(`/scheme/${fund.scheme_code}`)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <FundCardContent fund={fund} />
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Fade>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top after page change
            }}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                fontSize: '1rem',
              },
            }}
          />
        </Box>
      )}

      {/* No Results */}
      {!loading && sortedSchemes.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Info sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No funds found matching your criteria.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try resetting your search filters or selecting 'All Funds'.
          </Typography>
        </Box>
      )}
      </Container>
    </Box>
  );
}

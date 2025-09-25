'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Divider
} from '@mui/material';
import { 
  Search, 
  FilterList, 
  TrendingUp, 
  TrendingDown,
  AccountBalance,
  ViewList,
  ViewModule
} from '@mui/icons-material';
import Link from 'next/link';
import { LoadingSpinner, PageLoadingSpinner, LoadingBar } from '@/components/LoadingComponents';
import { PerformanceIndicator, OptimizationBanner, LoadingOptimization } from '@/components/PerformanceComponents';

// Client-side function to fetch schemes with pagination
async function fetchSchemes(page = 1, limit = 50, search = '', category = 'all', fundHouse = 'all') {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
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

// Fetch all schemes (for filters only)
async function fetchAllSchemes() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const res = await fetch(`${baseUrl}/api/mf`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch schemes: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : data.data || [];
}

export default function FundsPage() {
  const [schemes, setSchemes] = useState([]);
  const [allSchemes, setAllSchemes] = useState([]); // For filter options
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFundHouse, setSelectedFundHouse] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 50; // Items per page

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
        // Load all schemes for filter options (categories and fund houses)
        const allData = await fetchAllSchemes();
        setAllSchemes(allData);
        
        // Load first page of data
        const response = await fetchSchemes(1, itemsPerPage);
        if (response.data) {
          // Paginated response
          setSchemes(response.data);
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.total);
        } else {
          // Non-paginated response (all data)
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
          selectedFundHouse
        );
        
        if (response.data) {
          // Paginated response
          setSchemes(response.data);
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.total);
        } else {
          // Non-paginated response - need to filter client-side
          let filteredData = response;
          
          // Apply client-side filtering if server-side didn't work
          if (debouncedSearchTerm) {
            const searchLower = debouncedSearchTerm.toLowerCase();
            filteredData = filteredData.filter(scheme => 
              (scheme.scheme_name || '').toLowerCase().includes(searchLower) ||
              (scheme.meta?.fund_house || '').toLowerCase().includes(searchLower)
            );
          }

          if (selectedCategory && selectedCategory !== 'all') {
            filteredData = filteredData.filter(scheme => 
              scheme.meta?.scheme_category === selectedCategory
            );
          }

          if (selectedFundHouse && selectedFundHouse !== 'all') {
            filteredData = filteredData.filter(scheme => 
              scheme.meta?.fund_house === selectedFundHouse
            );
          }

          // Apply client-side pagination
          const startIndex = (currentPage - 1) * itemsPerPage;
          setSchemes(filteredData.slice(startIndex, startIndex + itemsPerPage));
          setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
          setTotalItems(filteredData.length);
        }
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Don't reload on initial mount - only when filters change
    if (allSchemes.length > 0) {
      loadFilteredData();
    }
  }, [currentPage, debouncedSearchTerm, selectedCategory, selectedFundHouse]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory, selectedFundHouse, sortBy]);

  // Get unique categories and fund houses from all schemes
  const categories = useMemo(() => {
    const cats = new Set(allSchemes.map(scheme => scheme.meta?.scheme_category).filter(Boolean));
    return Array.from(cats).sort();
  }, [allSchemes]);

  const fundHouses = useMemo(() => {
    const houses = new Set(allSchemes.map(scheme => scheme.meta?.fund_house).filter(Boolean));
    return Array.from(houses).sort();
  }, [allSchemes]);

  // Sort current page schemes
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

  // Group schemes by fund house for accordion view
  const groupedSchemes = useMemo(() => {
    return sortedSchemes.reduce((acc, scheme) => {
      const fundHouse = scheme.meta?.fund_house || 'Unknown';
      if (!acc[fundHouse]) {
        acc[fundHouse] = [];
      }
      acc[fundHouse].push(scheme);
      return acc;
    }, {});
  }, [sortedSchemes]);

  if (loading && schemes.length === 0) {
    return (
      <LoadingOptimization 
        message="Loading Mutual Funds Database"
        details="Optimizing 40,000+ funds for best performance"
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

  return (
    <Box>
      {/* Loading bar for subsequent loads */}
      {loading && schemes.length > 0 && (
        <LoadingBar message="Updating results..." />
      )}

      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
          }}
        >
          Mutual Fund Explorer
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Discover and analyze thousands of mutual funds
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <Chip 
            icon={<TrendingUp />} 
            label={`${totalItems.toLocaleString()} Total Funds`}
            color="primary"
            variant="outlined"
          />
          <Chip 
            icon={<AccountBalance />} 
            label={`${fundHouses.length} Fund Houses`}
            color="secondary"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Container for all content */}
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Optimization Banner */}
        <OptimizationBanner />

        {/* Performance Indicator */}
        <PerformanceIndicator
          isLoading={loading}
          totalItems={totalItems}
          currentItems={sortedSchemes.length}
          page={currentPage}
          totalPages={totalPages}
        />
      </Container>

      {/* Search and Filters */}
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        <Paper sx={{ p: 3, mb: 4, background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)' }}>
        <Grid container spacing={3}>
          {/* Search Bar */}
          <Grid size={{ xs: 12, md: 6 }} key="search-bar">
            <TextField
              fullWidth
              label="Search funds or fund houses"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>

          {/* Category Filter */}
          <Grid size={{ xs: 12, md: 3 }} key="category-filter">
            <FormControl fullWidth>
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
          </Grid>

          {/* Fund House Filter */}
          <Grid size={{ xs: 12, md: 3 }} key="fundhouse-filter">
            <Autocomplete
              value={selectedFundHouse === 'all' ? null : selectedFundHouse}
              onChange={(event, newValue) => {
                setSelectedFundHouse(newValue || 'all');
              }}
              options={fundHouses}
              renderInput={(params) => (
                <TextField {...params} label="Fund House" />
              )}
            />
          </Grid>
        </Grid>

        {/* Controls Row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                label="Sort by"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="fundHouse">Fund House</MenuItem>
                <MenuItem value="category">Category</MenuItem>
              </Select>
            </FormControl>
            
            <Typography variant="body2" color="text.secondary">
              {totalItems.toLocaleString()} funds found
            </Typography>
          </Box>

          <ButtonGroup variant="outlined" size="small">
            <Button 
              onClick={() => setViewMode('grid')}
              variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            >
              <ViewModule />
            </Button>
            <Button 
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'contained' : 'outlined'}
            >
              <ViewList />
            </Button>
          </ButtonGroup>
        </Box>
      </Paper>

      {/* Loading State */}
      {loading && (
        <Grid container spacing={3}>
          {Array.from({ length: 12 }).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`loading-skeleton-${index}`}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="80%" height={32} />
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Skeleton variant="rectangular" width={80} height={24} />
                    <Skeleton variant="rectangular" width={60} height={24} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Results Summary */}
      {!loading && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems.toLocaleString()} funds
          </Typography>
          <Divider />
        </Box>
      )}

      {/* Results */}
      {!loading && (
        <Fade in={true} timeout={500}>
          <Grid container spacing={3}>
            {sortedSchemes.map((fund, index) => (
              <Grid 
                size={{ 
                  xs: 12, 
                  sm: viewMode === 'grid' ? 6 : 12, 
                  md: viewMode === 'grid' ? 4 : 12 
                }}
                key={fund.scheme_code || `fund-${index}`}
              >
                <Fade in={true} timeout={300 + index * 50}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      transition: 'all 0.3s ease-in-out',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(102, 126, 234, 0.15)',
                      },
                    }}
                    component={Link}
                    href={`/scheme/${fund.scheme_code}`}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                        <TrendingUp sx={{ color: 'primary.main', mt: 0.5 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="h6" 
                            component="h3" 
                            sx={{ 
                              fontWeight: 600,
                              mb: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.3,
                            }}
                          >
                            {fund.scheme_name || 'Unknown Scheme'}
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

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                        <Chip
                          size="small"
                          label={fund.meta?.scheme_category || 'Unknown Category'}
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, page) => setCurrentPage(page)}
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
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No funds found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or filters
          </Typography>
        </Box>
      )}
      </Container>
    </Box>
  );
}
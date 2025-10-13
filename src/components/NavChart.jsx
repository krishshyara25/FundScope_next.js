// src/components/NavChart.jsx
'use client';

import { useState, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Grid, 
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Button,
  CircularProgress,
  Paper,
  ButtonGroup // <-- Re-added ButtonGroup for period selection
} from '@mui/material';
import { 
  ShowChart, 
  TrendingUp, 
  TrendingDown, 
  CalendarToday,
  Search
} from '@mui/icons-material';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts'; // <-- Recharts Imports Added
import { findClosestNav } from '@/utils/calculator'; 

// Time periods in months
const PERIODS = [
    { label: '3M', value: 3 },
    { label: '6M', value: 6 },
    { label: '1Y', value: 12 },
    { label: '2Y', value: 24 },
    { label: 'ALL', value: 'ALL' },
];

export default function NavChart({ navHistory }) {
  const [searchDate, setSearchDate] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // State for chart filtering
  const [selectedPeriod, setSelectedPeriod] = useState('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');


  if (!navHistory || navHistory.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">NAV History</Typography>
          <Typography color="text.secondary">
            No NAV data available
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  // --- Utility Functions ---
  const formatDate = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(d);
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 4,
    }).format(value);
  };

  const toChartData = (navs) => navs.map(item => ({
    ...item,
    // Format date for better display in the chart tooltip
    formattedDate: new Date(item.date).toLocaleDateString('en-IN')
  }));

  // --- Filtering Logic for Chart ---
  const filteredChartData = useMemo(() => {
    let filteredNavs = navHistory;
    
    // 1. Handle Custom Date Range
    if (customStartDate && customEndDate) {
        const start = new Date(customStartDate).getTime();
        const end = new Date(customEndDate).getTime();
        
        filteredNavs = filteredNavs.filter(item => {
            const itemDate = new Date(item.date).getTime();
            return itemDate >= start && itemDate <= end;
        });
    } 
    // 2. Handle Predefined Periods
    else if (selectedPeriod !== 'ALL') {
        const months = PERIODS.find(p => p.label === selectedPeriod)?.value;
        if (months) {
            const endDate = new Date(filteredNavs[filteredNavs.length - 1].date);
            const startDate = new Date(endDate);
            startDate.setMonth(endDate.getMonth() - months);

            filteredNavs = filteredNavs.filter(item => new Date(item.date).getTime() >= startDate.getTime());
        }
    }
    
    return toChartData(filteredNavs);

  }, [navHistory, selectedPeriod, customStartDate, customEndDate]);


  // --- Statistics Calculation ---
  const sortedNavHistory = [...navHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestNav = sortedNavHistory[0];
  const firstNav = sortedNavHistory[sortedNavHistory.length - 1];
  const navChange = latestNav.value - firstNav.value;
  const navChangePercent = ((navChange / firstNav.value) * 100);

  const allValues = sortedNavHistory.map(item => item.value);
  const maxNav = Math.max(...allValues);
  const minNav = Math.min(...allValues);
  const avgNav = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;

  // --- Handlers ---
  const handleNavSearch = () => {
    if (!searchDate) {
      setSearchResult(null);
      return;
    }
    
    setSearchLoading(true);
    const targetDate = new Date(searchDate);
    
    const result = findClosestNav(navHistory.map(n => ({ ...n, date: new Date(n.date) })), targetDate);
    
    setSearchResult(result);
    setSearchLoading(false);
  };
  
  const handlePeriodSelect = (period) => {
      setSelectedPeriod(period);
      // Clear custom range when a predefined period is selected
      setCustomStartDate('');
      setCustomEndDate('');
  };

  const handleCustomDateRange = () => {
      // Set ALL to false when custom range is applied
      setSelectedPeriod(null); 
  };
  
  // --- Custom Tooltip for Recharts ---
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper elevation={3} sx={{ p: 1, border: '1px solid #ccc', background: 'white' }}>
          <Typography variant="body2" color="text.secondary">{data.formattedDate}</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>NAV: {formatCurrency(data.value)}</Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(255, 255, 255, 1) 100%)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main', 
              mr: 2,
              width: 48,
              height: 48,
            }}
          >
            <ShowChart fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              NAV Performance & Chart
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Net Asset Value history and statistics
            </Typography>
          </Box>
        </Box>

        {/* Current NAV and Change */}
        <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {formatCurrency(latestNav.value)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                    size="small"
                    label={`${navChange >= 0 ? '+' : ''}${navChangePercent.toFixed(2)}%`}
                    color={navChange >= 0 ? 'secondary' : 'error'}
                    variant="filled"
                    icon={navChange >= 0 ? <TrendingUp /> : <TrendingDown />}
                />
                <Typography variant="body2" color="text.secondary">
                    since inception ({formatDate(firstNav.date)})
                </Typography>
            </Box>
        </Box>

        {/* --- CHART SECTION --- */}
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <ButtonGroup variant="outlined" size="small" aria-label="NAV chart period selection">
                    {PERIODS.map((period) => (
                        <Button
                            key={period.label}
                            onClick={() => handlePeriodSelect(period.label)}
                            variant={selectedPeriod === period.label ? 'contained' : 'outlined'}
                            color={selectedPeriod === period.label ? 'primary' : 'inherit'}
                        >
                            {period.label}
                        </Button>
                    ))}
                </ButtonGroup>
            </Box>

            {/* Custom Date Range Input */}
            <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={5}>
                    <TextField
                        type="date"
                        size="small"
                        fullWidth
                        label="Start Date"
                        InputLabelProps={{ shrink: true }}
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                </Grid>
                <Grid item xs={5}>
                    <TextField
                        type="date"
                        size="small"
                        fullWidth
                        label="End Date"
                        InputLabelProps={{ shrink: true }}
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                </Grid>
                <Grid item xs={2}>
                    <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        disabled={!customStartDate || !customEndDate}
                        onClick={handleCustomDateRange}
                        sx={{ height: '100%' }}
                    >
                        Go
                    </Button>
                </Grid>
            </Grid>

            <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                {filteredChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={filteredChartData}
                            margin={{ top: 5, right: 0, left: -20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                tickFormatter={(tick) => formatDate(tick)}
                                angle={-15}
                                textAnchor="end"
                                height={60}
                                interval="preserveStartEnd"
                                tickLine={false}
                                style={{ fontSize: 10 }}
                            />
                            <YAxis 
                                domain={['auto', 'auto']}
                                tickFormatter={(value) => formatCurrency(value).replace('₹', '')}
                                tickLine={false}
                                style={{ fontSize: 10 }}
                                width={70}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#3f51b5" 
                                strokeWidth={2} 
                                dot={false} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <Box sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: '#f5f5f5',
                        borderRadius: 1
                    }}>
                        <Typography color="text.secondary">
                            No NAV data available for the selected period.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Paper>
        {/* --- END CHART SECTION --- */}


        {/* NAV Lookup Section (moved below chart) */}
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Find Specific NAV by Date
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                    type="date"
                    size="small"
                    fullWidth
                    label="Select Date"
                    InputLabelProps={{ shrink: true }}
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                />
                <Button
                    variant="contained"
                    onClick={handleNavSearch}
                    disabled={!searchDate || searchLoading}
                    startIcon={searchLoading ? <CircularProgress size={18} color="inherit" /> : <Search />}
                >
                    Find
                </Button>
            </Box>

            {searchResult && (
                <Box sx={{ mt: 2, p: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        NAV on/nearest to {formatDate(searchDate)}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {formatCurrency(searchResult.value)}
                    </Typography>
                    {searchDate !== searchResult.date.toISOString().split('T')[0] && (
                        <Typography variant="caption" color="text.secondary">
                            (Found NAV from {formatDate(searchResult.date)})
                        </Typography>
                    )}
                </Box>
            )}
            {!searchResult && searchDate && !searchLoading && (
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                    No NAV data found for that period.
                </Typography>
            )}
        </Paper>


        {/* Statistics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Highest
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formatCurrency(maxNav)}
                    </Typography>
                </Box>
            </Grid>
            <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Average
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formatCurrency(avgNav)}
                    </Typography>
                </Box>
            </Grid>
            <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Lowest
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formatCurrency(minNav)}
                    </Typography>
                </Box>
            </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Recent NAV History */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Recent NAV History
        </Typography>
        <List sx={{ p: 0, maxHeight: 300, overflow: 'auto' }}>
            {sortedNavHistory.slice(0, 10).map((navItem, index) => {
                const prevNav = sortedNavHistory[index + 1];
                const dayChange = prevNav ? navItem.value - prevNav.value : 0;
                const dayChangePercent = prevNav ? ((dayChange / prevNav.value) * 100) : 0;

                return (
                    <Box key={`${navItem.date}-${index}`}>
                        <ListItem sx={{ px: 0, py: 1 }}>
                            <CalendarToday 
                                sx={{ 
                                    color: 'text.secondary', 
                                    fontSize: 20, 
                                    mr: 2 
                                }} 
                            />
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            {formatCurrency(navItem.value)}
                                        </Typography>
                                        {prevNav && (
                                            <Chip
                                                size="small"
                                                label={`${dayChange >= 0 ? '+' : ''}${dayChangePercent.toFixed(2)}%`}
                                                color={dayChange >= 0 ? 'secondary' : 'error'}
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>
                                }
                                secondary={formatDate(navItem.date)}
                            />
                        </ListItem>
                        {index < sortedNavHistory.slice(0, 10).length - 1 && <Divider sx={{ opacity: 0.3 }} />}
                    </Box>
                );
            })}
        </List>

        {/* Data Source */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" align="center">
                {sortedNavHistory.length} NAV records • Last updated: {formatDate(latestNav.date)}
            </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
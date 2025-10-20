// src/app/analytics/page.jsx (Updated Content)
'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip,
  LinearProgress,
  Fade,
  Alert,
  Tabs,
  Tab,
  styled
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  AccountBalance,
  PieChart,
  ShowChart,
  Equalizer,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Styled components for enhanced aesthetics
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  padding: '12px 24px',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.grey[100],
    borderRadius: '8px',
  },
}));

// Client-side function to fetch analytics data
async function fetchAnalyticsData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  try {
    const res = await fetch(`${baseUrl}/api/mf?page=1&limit=500`, { 
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error('Failed to fetch analytics data');
    }
    const data = await res.json();
    return Array.isArray(data) ? data : data.data || [];
  } catch (error) {
    console.error('Analytics data fetch error:', error);
    return [];
  }
}

export default function AnalyticsPage() {
  const [fundsData, setFundsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsView, setAnalyticsView] = useState('overview');

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true);
        const data = await fetchAnalyticsData();
        setFundsData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, []);

  // Analytics calculations
  const totalFunds = fundsData.length;
  
  const categoryStats = fundsData.reduce((acc, fund) => {
    const category = fund.meta?.scheme_category || 'Unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const fundHouseStats = fundsData.reduce((acc, fund) => {
    const fundHouse = fund.meta?.fund_house || 'Unknown';
    acc[fundHouse] = (acc[fundHouse] || 0) + 1;
    return acc;
  }, {});

  const allSortedCategories = Object.entries(categoryStats)
    .sort(([,a], [,b]) => b - a);

  const topCategories = allSortedCategories.slice(0, 5);
  const topCategoriesCount = topCategories.reduce((sum, [, count]) => sum + count, 0);
  const otherCount = totalFunds - topCategoriesCount;
  
  const fullChartCategories = [...topCategories];
  if (otherCount > 0) {
    fullChartCategories.push(['Other Categories', otherCount]);
  }

  const topFundHouses = Object.entries(fundHouseStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  // Prepare data for pie chart
  const COLORS = ['#4B40EE', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#D97706', '#10B981', '#DC2626', '#667EEA', '#7C3AED'];

  const categoryChartData = fullChartCategories.map(([category, count], index) => ({
    name: category,
    value: count,
    percentage: ((count / totalFunds) * 100).toFixed(1),
    color: COLORS[index % COLORS.length]
  }));
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.04) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" style={{ fontSize: '10px', fontWeight: 600 }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6, bgcolor: 'grey.50' }}>
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <LinearProgress sx={{ mb: 2, borderRadius: 4, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' } }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
            Loading market analytics...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 6, bgcolor: 'grey.50' }}>
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          Failed to load analytics data: {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6, bgcolor: 'grey.50' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 800,
            color: 'primary.main',
            fontFamily: 'Inter, sans-serif',
            mb: 2,
          }}
        >
          Market Analytics
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
          Comprehensive analysis of mutual fund market data
        </Typography>
      </Box>

      {/* Analytics View Selection */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
        <Paper sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 2 }}>
          <Tabs
            value={analyticsView}
            onChange={(e, newValue) => setAnalyticsView(newValue)}
            centered
            sx={{ '& .MuiTabs-indicator': { bgcolor: 'primary.main', height: 3 } }}
          >
            <StyledTab label="Overview" value="overview" icon={<AnalyticsIcon />} iconPosition="start" />
            <StyledTab label="Categories" value="categories" icon={<PieChart />} iconPosition="start" />
            <StyledTab label="Fund Houses" value="fundhouses" icon={<AccountBalance />} iconPosition="start" />
          </Tabs>
        </Paper>
      </Box>

      {/* Market Overview */}
      {analyticsView === 'overview' && (
        <Fade in={true} timeout={600}>
          <Box>
            {/* Key Statistics */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
              {[
                { icon: Assessment, value: totalFunds.toLocaleString(), label: 'Total Mutual Funds', color: 'primary.main' },
                { icon: PieChart, value: Object.keys(categoryStats).length, label: 'Fund Categories', color: 'success.main' },
                { icon: AccountBalance, value: Object.keys(fundHouseStats).length, label: 'Fund Houses', color: 'warning.main' },
                { icon: ShowChart, value: 'Live', label: 'Real-time Data', color: 'error.main' },
              ].map((item, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <StyledCard sx={{ bgcolor: 'white' }}>
                    <CardContent sx={{ textAlign: 'center', p: 4 }}>
                      <item.icon sx={{ fontSize: 40, mb: 2, color: item.color }} />
                      <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'Inter, sans-serif', mb: 1 }}>
                        {item.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
                        {item.label}
                      </Typography>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>

            {/* Market Insights */}
            <Grid container spacing={4}>
              <Grid item xs={12} lg={8}>
                <StyledCard sx={{ bgcolor: 'white' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', fontFamily: 'Inter, sans-serif', mb: 3 }}>
                      <TrendingUp sx={{ mr: 2, color: 'primary.main' }} />
                      Market Insights
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Alert severity="info" sx={{ borderRadius: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, mb: 0.5 }}>
                          Market Diversity Analysis
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif' }}>
                          The Indian mutual fund market offers extensive diversity with {totalFunds.toLocaleString()} active schemes across {Object.keys(categoryStats).length} categories.
                        </Typography>
                      </Alert>
                      <Alert severity="success" sx={{ borderRadius: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, mb: 0.5 }}>
                          Fund House Competition
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif' }}>
                          Strong competition among {Object.keys(fundHouseStats).length} fund houses ensures competitive offerings and innovation.
                        </Typography>
                      </Alert>
                      <Alert severity="warning" sx={{ borderRadius: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, mb: 0.5 }}>
                          Category Distribution
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif' }}>
                          Top category "{topCategories[0]?.[0]}" represents {topCategories[0] ? ((topCategories[0][1] / totalFunds) * 100).toFixed(1) : 0}% of all funds.
                        </Typography>
                      </Alert>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
              <Grid item xs={12} lg={4}>
                <StyledCard sx={{ bgcolor: 'white' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', fontFamily: 'Inter, sans-serif', mb: 3 }}>
                      <Equalizer sx={{ mr: 2, color: 'primary.main' }} />
                      Quick Stats
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
                          Largest Category
                        </Typography>
                        <Typography variant="h6" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                          {topCategories[0]?.[0] || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
                          {topCategories[0]?.[1] || 0} funds
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
                          Leading Fund House
                        </Typography>
                        <Typography variant="h6" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                          {topFundHouses[0]?.[0] || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
                          {topFundHouses[0]?.[1] || 0} schemes
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
                          Market Coverage
                        </Typography>
                        <Typography variant="h6" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                          100%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
                          All active funds tracked
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      )}

      {/* Category Analysis */}
      {analyticsView === 'categories' && (
        <Fade in={true} timeout={600}>
          <Box>
            <Typography variant="h4" sx={{ mb: 6, textAlign: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
              Fund Category Distribution
            </Typography>
            
            {/* Pie Chart Section (MODIFIED: Chart is now full width) */}
            <Grid container spacing={4} sx={{ mb: 6 }}> {/* Removed justifyContent: 'center' */}
              <Grid item xs={12} lg={12}> {/* Chart now takes full width */}
                <StyledCard sx={{ bgcolor: 'white' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', fontFamily: 'Inter, sans-serif', mb: 3 }}>
                      <PieChart sx={{ mr: 2, color: 'primary.main' }} />
                      Category Distribution Chart
                    </Typography>
                    <Box sx={{ height: { xs: 300, sm: 380, md: 420 }, mt: 2, display: 'flex', justifyContent: 'center' }}>
                      <Box sx={{ width: '100%' }}> {/* Removed maxWidth: 1000 to allow full width usage */}
                        <ResponsiveContainer width="100%" height={420}>
                        <RechartsPieChart>
                          <Pie
                            data={categoryChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={140}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name, props) => [
                              `${value} funds (${props.payload.percentage}%)`, 
                              name
                            ]}
                          />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
              <Grid item xs={12} lg={12}> {/* Summary Card moved to a new full-width row */}
                <StyledCard sx={{ bgcolor: 'white' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Inter, sans-serif', mb: 3 }}>
                      Top Categories Summary
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, overflowX: 'auto', pb: 1 }}> {/* Added overflowX for responsiveness */}
                      {categoryChartData.slice(0, 6).map((item, index) => (
                        <Box key={item.name} sx={{ p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 2, minWidth: 200 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box 
                              sx={{ 
                                width: 16, 
                                height: 16, 
                                backgroundColor: COLORS[index % COLORS.length], 
                                borderRadius: '50%', 
                                mr: 1 
                              }} 
                            />
                            <Typography variant="subtitle2" sx={{ flex: 1, fontFamily: 'Inter, sans-serif' }}>
                              {item.name}
                            </Typography>
                            {item.name !== 'Other Categories' && <Chip label={`#${index + 1}`} size="small" color="primary" />}
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                            {item.value} funds
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
                            {item.percentage}% of market
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={(item.value / categoryChartData[0].value) * 100}
                            sx={{ mt: 2, height: 8, borderRadius: 4, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' } }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            </Grid>

            {/* Category Cards */}
            <Typography variant="h5" sx={{ mb: 4, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Detailed Category Breakdown
            </Typography>
            <Grid container spacing={4}>
              {topCategories.map(([category, count], index) => (
                <Grid item xs={12} md={6} lg={4} key={category}>
                  <StyledCard sx={{ bgcolor: 'white' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            backgroundColor: COLORS[index % COLORS.length], 
                            borderRadius: '50%', 
                            mr: 2 
                          }} 
                        />
                        <Typography variant="h6" sx={{ flex: 1, fontFamily: 'Inter, sans-serif' }}>
                          {category}
                        </Typography>
                        <Chip 
                          label={`#${index + 1}`} 
                          color="primary" 
                          size="small" 
                        />
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'Inter, sans-serif', mb: 1 }}>
                        {count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif', mb: 2 }}>
                        {((count / totalFunds) * 100).toFixed(1)}% of total funds
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(count / topCategories[0][1]) * 100}
                        sx={{ mt: 2, height: 8, borderRadius: 4, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' } }}
                      />
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      )}

      {/* Fund House Analysis */}
      {analyticsView === 'fundhouses' && (
        <Fade in={true} timeout={600}>
          <Box>
            <Typography variant="h4" sx={{ mb: 6, textAlign: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
              Top Fund Houses by Schemes
            </Typography>
            <Grid container spacing={4}>
              {topFundHouses.map(([fundHouse, count], index) => (
                <Grid item xs={12} md={6} lg={4} key={fundHouse}>
                  <StyledCard sx={{ bgcolor: 'white' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccountBalance sx={{ mr: 2, color: 'secondary.main' }} />
                        <Typography variant="h6" sx={{ flex: 1, fontFamily: 'Inter, sans-serif' }} noWrap>
                          {fundHouse}
                        </Typography>
                        <Chip 
                          label={`#${index + 1}`} 
                          color="secondary" 
                          size="small" 
                        />
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'Inter, sans-serif', mb: 1 }}>
                        {count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif', mb: 2 }}>
                        {((count / totalFunds) * 100).toFixed(1)}% market share
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(count / topFundHouses[0][1]) * 100}
                        sx={{ mt: 2, height: 8, borderRadius: 4, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: 'secondary.main' } }}
                      />
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      )}
    </Container>
  );
}
// src/app/analytics/page.jsx
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
  Button,
  ButtonGroup
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  PieChart,
  ShowChart,
  AttachMoney,
  Equalizer,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Client-side function to fetch analytics data
async function fetchAnalyticsData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  try {
    // Relying on the API's internal filter to return only active funds
    const res = await fetch(`${baseUrl}/api/mf?page=1&limit=40000`, {
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

  // --- Logic for Pie Chart Data (ensuring 100% total) ---
  const allSortedCategories = Object.entries(categoryStats)
    .sort(([,a], [,b]) => b - a);

  const topCategories = allSortedCategories.slice(0, 5);
  const topCategoriesCount = topCategories.reduce((sum, [, count]) => sum + count, 0);
  const otherCount = totalFunds - topCategoriesCount;
  
  const fullChartCategories = [...topCategories];
  if (otherCount > 0) {
    fullChartCategories.push(['Other Categories', otherCount]);
  }
  // --- END Logic for Pie Chart Data ---

  const topFundHouses = Object.entries(fundHouseStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  // Prepare data for pie chart
  const COLORS = ['#667eea', '#764ba2', '#10b981', '#059669', '#f59e0b', '#d97706', '#ef4444', '#dc2626', '#8b5cf6', '#7c3aed'];

  const categoryChartData = fullChartCategories.map(([category, count], index) => ({
    name: category,
    value: count,
    percentage: ((count / totalFunds) * 100).toFixed(1),
    color: COLORS[index % COLORS.length]
  }));
  
  // Custom Label for Pie Chart slices
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.04) return null; // Hide labels for very small slices
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />
          <Typography variant="h6" color="text.secondary">
            Loading market analytics...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          Failed to load analytics data: {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
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
          Market Analytics
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Comprehensive analysis of mutual fund market data
        </Typography>
      </Box>

      {/* Analytics View Selection */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Paper sx={{ p: 1, display: 'inline-flex' }}>
          <Button
            variant={analyticsView === 'overview' ? 'contained' : 'outlined'}
            onClick={() => setAnalyticsView('overview')}
            startIcon={<AnalyticsIcon />}
            sx={{ mr: 1 }}
          >
            Overview
          </Button>
          <Button
            variant={analyticsView === 'categories' ? 'contained' : 'outlined'}
            onClick={() => setAnalyticsView('categories')}
            startIcon={<PieChart />}
            sx={{ mr: 1 }}
          >
            Categories
          </Button>
          <Button
            variant={analyticsView === 'fundhouses' ? 'contained' : 'outlined'}
            onClick={() => setAnalyticsView('fundhouses')}
            startIcon={<AccountBalance />}
          >
            Fund Houses
          </Button>
        </Paper>
      </Box>

      {/* Market Overview */}
      {analyticsView === 'overview' && (
        <Fade in={true} timeout={500}>
          <Box>
            {/* Key Statistics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Assessment sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                      {totalFunds.toLocaleString()}
                    </Typography>
                    <Typography variant="subtitle1">
                      Total Mutual Funds
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <PieChart sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                      {Object.keys(categoryStats).length}
                    </Typography>
                    <Typography variant="subtitle1">
                      Fund Categories
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <AccountBalance sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                      {Object.keys(fundHouseStats).length}
                    </Typography>
                    <Typography variant="subtitle1">
                      Fund Houses
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <ShowChart sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                      Live
                    </Typography>
                    <Typography variant="subtitle1">
                      Real-time Data
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Market Insights */}
            <Grid container spacing={4}>
              <Grid item xs={12} lg={8}>
                <Card>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUp sx={{ mr: 2 }} />
                      Market Insights
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Market Diversity Analysis
                        </Typography>
                        <Typography variant="body2">
                          The Indian mutual fund market offers extensive diversity with {totalFunds.toLocaleString()} active schemes across {Object.keys(categoryStats).length} categories.
                        </Typography>
                      </Alert>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Fund House Competition
                        </Typography>
                        <Typography variant="body2">
                          Strong competition among {Object.keys(fundHouseStats).length} fund houses ensures competitive offerings and innovation.
                        </Typography>
                      </Alert>
                      <Alert severity="warning">
                        <Typography variant="subtitle2" gutterBottom>
                          Category Distribution
                        </Typography>
                        <Typography variant="body2">
                          Top category "{topCategories[0]?.[0]}" represents {topCategories[0] ? ((topCategories[0][1] / totalFunds) * 100).toFixed(1) : 0}% of all funds.
                        </Typography>
                      </Alert>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Card>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <Equalizer sx={{ mr: 2 }} />
                      Quick Stats
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Largest Category
                        </Typography>
                        <Typography variant="h6">
                          {topCategories[0]?.[0] || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {topCategories[0]?.[1] || 0} funds
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Leading Fund House
                        </Typography>
                        <Typography variant="h6">
                          {topFundHouses[0]?.[0] || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {topFundHouses[0]?.[1] || 0} schemes
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Market Coverage
                        </Typography>
                        <Typography variant="h6">
                          100%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          All active funds tracked
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      )}

      {/* Category Analysis */}
      {analyticsView === 'categories' && (
        <Fade in={true} timeout={500}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
              Fund Category Distribution
            </Typography>
            
            {/* Pie Chart Section */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} lg={8}>
                <Card>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <PieChart sx={{ mr: 2 }} />
                      Category Distribution Chart
                    </Typography>
                    <Box sx={{ height: 400, mt: 2 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={categoryChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            // Using the custom label function
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
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Card>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Top Categories Summary
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {/* Using the fullChartCategories data which includes "Other" */}
                      {categoryChartData.slice(0, 6).map((item, index) => (
                        <Box key={item.name} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
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
                            <Typography variant="subtitle2" sx={{ flex: 1 }}>
                              {item.name}
                            </Typography>
                            {/* Only show rank for Top 5 (not 'Other') */}
                            {item.name !== 'Other Categories' && <Chip label={`#${index + 1}`} size="small" />}
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {item.value} funds
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.percentage}% of market
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={(item.value / categoryChartData[0].value) * 100}
                            sx={{ mt: 2, height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Category Cards */}
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Detailed Category Breakdown
            </Typography>
            <Grid container spacing={3}>
              {/* Only iterating through Top 5 for the detailed breakdown cards */}
              {topCategories.map(([category, count], index) => (
                <Grid item xs={12} md={6} lg={4} key={category}>
                  <Card sx={{ height: '100%' }}>
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
                        <Typography variant="h6" sx={{ flex: 1 }}>
                          {category}
                        </Typography>
                        <Chip 
                          label={`#${index + 1}`} 
                          color="primary" 
                          size="small" 
                        />
                      </Box>
                      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                        {count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {((count / totalFunds) * 100).toFixed(1)}% of total funds
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(count / topCategories[0][1]) * 100}
                        sx={{ mt: 2, height: 8, borderRadius: 4 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      )}

      {/* Fund House Analysis */}
      {analyticsView === 'fundhouses' && (
        <Fade in={true} timeout={500}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
              Top Fund Houses by Schemes
            </Typography>
            <Grid container spacing={3}>
              {topFundHouses.map(([fundHouse, count], index) => (
                <Grid item xs={12} md={6} lg={4} key={fundHouse}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccountBalance sx={{ mr: 2, color: 'secondary.main' }} />
                        <Typography variant="h6" sx={{ flex: 1 }} noWrap>
                          {fundHouse}
                        </Typography>
                        <Chip 
                          label={`#${index + 1}`} 
                          color="secondary" 
                          size="small" 
                        />
                      </Box>
                      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                        {count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {((count / totalFunds) * 100).toFixed(1)}% market share
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(count / topFundHouses[0][1]) * 100}
                        color="secondary"
                        sx={{ mt: 2, height: 8, borderRadius: 4 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      )}
    </Container>
  );
}
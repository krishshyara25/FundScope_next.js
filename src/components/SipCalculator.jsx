// src/components/SipCalculator.jsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Grid, 
  CircularProgress, 
  Alert,
  Paper,
  Avatar,
  Chip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  ButtonGroup 
} from '@mui/material';
import { 
  Calculate,
  TrendingUp,
  AttachMoney,
  DateRange,
  Assessment,
  ShowChart
} from '@mui/icons-material';
import SipGrowthChart from './SipGrowthChart';

// Define Quick Select Periods
const QUICK_PERIODS = [
    { label: '6M', months: 6 },
    { label: '1Y', months: 12 },
    { label: '3Y', months: 36 },
    { label: '5Y', months: 60 },
];

// Helper function to calculate start date (remains the same)
const getStartDate = (endDate, months) => {
    const d = new Date(endDate);
    if (isNaN(d.getTime())) return null;
    
    // Set the date back by the number of months
    d.setMonth(d.getMonth() - months);
    
    // Format to YYYY-MM-DD string
    return d.toISOString().split('T')[0];
};

// Helper to fetch scheme details for the latest NAV date (remains the same)
async function fetchLatestNavDate(schemeCode) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const response = await fetch(`${baseUrl}/api/scheme/${schemeCode}`); 
    if (!response.ok) throw new Error('Failed to fetch scheme details for date initialization.');
    const data = await response.json();
    
    const latestDate = data.data?.[0]?.date; 
    if (!latestDate) throw new Error('No recent NAV date found.');

    const parts = latestDate.split('-');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`; 
    }
    return new Date(latestDate).toISOString().split('T')[0];
}


export default function SipCalculator({ schemeCode }) {
  const [amount, setAmount] = useState(10000); 
  const [from, setFrom] = useState(''); 
  const [to, setTo] = useState(''); 
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quickPeriod, setQuickPeriod] = useState(null); 

  const presetAmounts = [1000, 2500, 5000, 10000, 25000, 50000];

  // Effect to set the initial 'to' date (latest NAV date)
  useEffect(() => {
      let isMounted = true;
      const setInitialDates = async () => {
          if (!schemeCode) return;
          try {
              const latestDate = await fetchLatestNavDate(schemeCode);
              if (isMounted) {
                  setTo(latestDate);
                  const defaultStartDate = getStartDate(latestDate, 12);
                  setFrom(defaultStartDate);
                  setQuickPeriod('1Y');
              }
          } catch (e) {
              if (isMounted) {
                  setError('Failed to initialize dates: ' + e.message);
                  setTo(new Date().toISOString().split('T')[0]);
              }
          }
      };
      setInitialDates();
      return () => { isMounted = false; };
  }, [schemeCode]);
  
  // Handler for Quick Period Selection
  const handleQuickPeriodSelect = (months, label) => {
      setQuickPeriod(label);
      if (to) {
          const newStartDate = getStartDate(to, months);
          setFrom(newStartDate);
      }
      if (from && to) handleCalculate(); 
  };


  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
      const response = await fetch(`${baseUrl}/api/scheme/${schemeCode}/sip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, from, to }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate SIP');
      }
      setResult(data);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
    const num = Number(value);
    if (!isFinite(num)) return 'N/A';
    const sign = num > 0 ? '+' : (num < 0 ? '' : '');
    return `${sign}${num.toFixed(2)}%`;
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.05) 0%, rgba(255, 255, 255, 1) 100%)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'secondary.main', 
              mr: 2,
              width: 48,
              height: 48,
            }}
          >
            <Calculate fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              SIP Calculator
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Calculate systematic investment plan returns using real historical NAV
            </Typography>
          </Box>
        </Box>

        {/* Input Section */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}> {/* FIX: bgcolor to theme color */}
          <Grid container spacing={3}>
            {/* Amount Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                Monthly Investment Amount
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Slider
                  value={amount}
                  onChange={(e, newValue) => setAmount(newValue)}
                  min={500}
                  max={100000}
                  step={500}
                  valueLabelDisplay="auto"
                  valueLabelFormat={formatCurrency}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {presetAmounts.map((preset) => (
                    <Chip
                      key={preset}
                      label={formatCurrency(preset)}
                      onClick={() => setAmount(preset)}
                      variant={amount === preset ? 'filled' : 'outlined'}
                      color={amount === preset ? 'primary' : 'default'}
                      size="small"
                    />
                  ))}
                </Box>
                <TextField
                  label="Custom Amount"
                  type="number"
                  fullWidth
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <AttachMoney color="action" />,
                  }}
                />
              </Box>
            </Grid>
            
            {/* Quick Period Selection */}
            <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                    Quick Select Duration
                </Typography>
                <ButtonGroup fullWidth>
                    {QUICK_PERIODS.map(period => (
                        <Button
                            key={period.label}
                            onClick={() => handleQuickPeriodSelect(period.months, period.label)}
                            variant={quickPeriod === period.label ? 'contained' : 'outlined'}
                            color="secondary"
                        >
                            {period.label}
                        </Button>
                    ))}
                </ButtonGroup>
            </Grid>


            {/* Date Range */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date (From)"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={from}
                onChange={(e) => {
                    setFrom(e.target.value);
                    setQuickPeriod(null); // Clear quick period if user manually changes date
                }}
                InputProps={{
                  startAdornment: <DateRange color="action" />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End Date (To - Latest NAV)"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={to}
                onChange={(e) => setTo(e.target.value)}
                InputProps={{
                  startAdornment: <DateRange color="action" />,
                }}
              />
            </Grid>

            {/* Calculate Button */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                size="large"
                onClick={handleCalculate}
                disabled={loading || !amount || !from || !to}
                fullWidth
                startIcon={loading ? <CircularProgress size={20} /> : <Calculate />}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                  },
                }}
              >
                {loading ? 'Calculating...' : 'Calculate SIP Returns'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <strong>Calculation Error:</strong> {error}
          </Alert>
        )}

        {/* Results Section */}
        {result && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              SIP Investment Results
            </Typography>
            
            {/* Key Metrics Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={6} md={3}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(37, 99, 235, 0.1)' : theme.palette.grey[800],
                  }}
                >
                  <AttachMoney sx={{ color: 'primary.main', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Total Invested
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {formatCurrency(result.totalInvested)}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(5, 150, 105, 0.1)' : theme.palette.grey[800],
                  }}
                >
                  <TrendingUp sx={{ color: 'secondary.main', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Current Value
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {formatCurrency(result.currentValue)}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} md={3}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: (theme) => Number.isFinite(result.absoluteProfit) && result.absoluteProfit >= 0 
                      ? theme.palette.mode === 'light' ? 'rgba(5, 150, 105, 0.1)' : theme.palette.grey[800]
                      : theme.palette.mode === 'light' ? 'rgba(220, 38, 38, 0.1)' : theme.palette.grey[800],
                  }}
                >
                  <Assessment sx={{ 
                    color: result.absoluteProfit >= 0 ? 'secondary.main' : 'error.main', 
                    mb: 1 
                  }} />
                  <Typography variant="body2" color="text.secondary">
                    Profit / Loss
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: Number.isFinite(result.absoluteProfit) && result.absoluteProfit >= 0 ? 'secondary.main' : 'error.main'
                    }}
                  >
                    {Number.isFinite(result.absoluteProfit) ? formatCurrency(result.absoluteProfit) : '—'}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} md={3}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: (theme) => Number.isFinite(result.annualizedReturn) && result.annualizedReturn >= 0
                      ? theme.palette.mode === 'light' ? 'rgba(5, 150, 105, 0.1)' : theme.palette.grey[800]
                      : theme.palette.mode === 'light' ? 'rgba(220, 38, 38, 0.1)' : theme.palette.grey[800],
                  }}
                >
                  <ShowChart sx={{ 
                    color: result.annualizedReturn >= 0 ? 'secondary.main' : 'error.main', 
                    mb: 1 
                  }} />
                  <Typography variant="body2" color="text.secondary">
                    Annualized Return
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: Number.isFinite(result.annualizedReturn) && result.annualizedReturn >= 0 ? 'secondary.main' : 'error.main'
                    }}
                  >
                    {Number.isFinite(result.annualizedReturn) ? formatPercentage(result.annualizedReturn) : 'N/A'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Growth Chart (NEWLY ADDED) */}
            {result.growthChartData && result.growthChartData.length > 0 && (
                <Box sx={{ mt: 3, mb: 3 }}>
                    <SipGrowthChart 
                      sipData={result.growthChartData}
                      totalInvested={result.totalInvested}
                      futureValue={result.currentValue}
                      sipAmount={amount}
                    />
                </Box>
            )}

            {/* Summary */}
            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Investment Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Investment Period
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {result.duration?.years} years ({result.duration?.days} days)
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Total Units
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {result.totalUnits?.toFixed(4)} units
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Absolute Return %
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 500,
                      color: result.absoluteReturnPercent >= 0 ? 'secondary.main' : 'error.main'
                    }}
                  >
                    {formatPercentage(result.absoluteReturnPercent)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
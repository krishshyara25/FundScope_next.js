'use client';

import { useState } from 'react';
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
  Divider
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

export default function SipCalculator({ schemeCode }) {
  const [amount, setAmount] = useState(20000);
  const [from, setFrom] = useState('2020-01-01');
  const [to, setTo] = useState('2023-12-31');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const presetAmounts = [1000, 2500, 5000, 10000, 25000, 50000];

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
    if (value === null) return 'N/A';
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <Card 
      sx={{ 
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
              Calculate systematic investment plan returns
            </Typography>
          </Box>
        </Box>

        {/* Input Section */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(255, 255, 255, 0.7)' }}>
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

            {/* Date Range */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                InputProps={{
                  startAdornment: <DateRange color="action" />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End Date"
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
                    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(255, 255, 255, 1) 100%)',
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
                    background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(255, 255, 255, 1) 100%)',
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
                    background: result.absoluteProfit >= 0 
                      ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(255, 255, 255, 1) 100%)'
                      : 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(255, 255, 255, 1) 100%)',
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
                      color: result.absoluteProfit >= 0 ? 'secondary.main' : 'error.main'
                    }}
                  >
                    {formatCurrency(result.absoluteProfit)}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} md={3}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    background: result.annualizedReturnPercent >= 0 
                      ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(255, 255, 255, 1) 100%)'
                      : 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(255, 255, 255, 1) 100%)',
                  }}
                >
                  <ShowChart sx={{ 
                    color: result.annualizedReturnPercent >= 0 ? 'secondary.main' : 'error.main', 
                    mb: 1 
                  }} />
                  <Typography variant="body2" color="text.secondary">
                    Annualized Return
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: result.annualizedReturnPercent >= 0 ? 'secondary.main' : 'error.main'
                    }}
                  >
                    {result.annualizedReturnPercent ? formatPercentage(result.annualizedReturnPercent) : 'N/A'}
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
            <Paper sx={{ p: 3, bgcolor: 'rgba(248, 250, 252, 0.8)' }}>
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
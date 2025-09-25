'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  Chip,
  Alert,
  Fade
} from '@mui/material';
import {
  Calculate,
  TrendingUp,
  AccountBalance,
  Timeline,
  AttachMoney,
  Percent
} from '@mui/icons-material';

export default function CalculatorPage() {
  // SIP Calculator State
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipPeriod, setSipPeriod] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);

  // Lump Sum Calculator State
  const [lumpSumAmount, setLumpSumAmount] = useState(100000);
  const [lumpSumPeriod, setLumpSumPeriod] = useState(5);
  const [lumpSumReturn, setLumpSumReturn] = useState(10);

  const [activeCalculator, setActiveCalculator] = useState('sip');

  // SIP Calculation
  const calculateSIP = () => {
    const monthlyRate = expectedReturn / 100 / 12;
    const months = sipPeriod * 12;
    const futureValue = sipAmount * (((1 + monthlyRate) ** months - 1) / monthlyRate) * (1 + monthlyRate);
    const totalInvested = sipAmount * months;
    const returns = futureValue - totalInvested;
    return { futureValue, totalInvested, returns };
  };

  // Lump Sum Calculation
  const calculateLumpSum = () => {
    const annualRate = lumpSumReturn / 100;
    const futureValue = lumpSumAmount * ((1 + annualRate) ** lumpSumPeriod);
    const returns = futureValue - lumpSumAmount;
    return { futureValue, totalInvested: lumpSumAmount, returns };
  };

  const sipResults = calculateSIP();
  const lumpSumResults = calculateLumpSum();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
          Investment Calculator
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Plan your mutual fund investments with our advanced calculators
        </Typography>
      </Box>

      {/* Calculator Type Selection */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Paper sx={{ p: 1, display: 'inline-flex' }}>
          <Button
            variant={activeCalculator === 'sip' ? 'contained' : 'outlined'}
            onClick={() => setActiveCalculator('sip')}
            startIcon={<Timeline />}
            sx={{ mr: 1 }}
          >
            SIP Calculator
          </Button>
          <Button
            variant={activeCalculator === 'lumpsum' ? 'contained' : 'outlined'}
            onClick={() => setActiveCalculator('lumpsum')}
            startIcon={<AttachMoney />}
          >
            Lump Sum Calculator
          </Button>
        </Paper>
      </Box>

      {/* SIP Calculator */}
      {activeCalculator === 'sip' && (
        <Fade in={true} timeout={500}>
          <Grid container spacing={4}>
            {/* SIP Input Section */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Calculate sx={{ mr: 2 }} />
                    SIP Calculator
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  {/* Monthly Investment */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Monthly Investment Amount
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={sipAmount}
                      onChange={(e) => setSipAmount(Number(e.target.value))}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                      }}
                      sx={{ mb: 2 }}
                    />
                    <Slider
                      value={sipAmount}
                      onChange={(e, value) => setSipAmount(value)}
                      min={500}
                      max={100000}
                      step={500}
                      valueLabelDisplay="auto"
                      color="primary"
                    />
                  </Box>

                  {/* Investment Period */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Investment Period (Years)
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={sipPeriod}
                      onChange={(e) => setSipPeriod(Number(e.target.value))}
                      sx={{ mb: 2 }}
                    />
                    <Slider
                      value={sipPeriod}
                      onChange={(e, value) => setSipPeriod(value)}
                      min={1}
                      max={30}
                      step={1}
                      valueLabelDisplay="auto"
                      color="primary"
                    />
                  </Box>

                  {/* Expected Return */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Expected Annual Return (%)
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={expectedReturn}
                      onChange={(e) => setExpectedReturn(Number(e.target.value))}
                      InputProps={{
                        endAdornment: <Typography sx={{ ml: 1 }}>%</Typography>,
                      }}
                      sx={{ mb: 2 }}
                    />
                    <Slider
                      value={expectedReturn}
                      onChange={(e, value) => setExpectedReturn(value)}
                      min={1}
                      max={25}
                      step={0.5}
                      valueLabelDisplay="auto"
                      color="primary"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* SIP Results Section */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <CardContent sx={{ p: 4, color: 'white' }}>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUp sx={{ mr: 2 }} />
                    Investment Results
                  </Typography>
                  <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.2)' }} />

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                      {formatCurrency(sipResults.futureValue)}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
                      Maturity Amount
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)' }}>
                        <Typography variant="h6" sx={{ color: 'white' }}>
                          {formatCurrency(sipResults.totalInvested)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Total Invested
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)' }}>
                        <Typography variant="h6" sx={{ color: 'white' }}>
                          {formatCurrency(sipResults.returns)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Total Returns
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <Alert severity="info" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                      <Typography variant="body2">
                        <strong>Monthly SIP:</strong> ₹{sipAmount.toLocaleString()} × {sipPeriod * 12} months
                      </Typography>
                    </Alert>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>
      )}

      {/* Lump Sum Calculator */}
      {activeCalculator === 'lumpsum' && (
        <Fade in={true} timeout={500}>
          <Grid container spacing={4}>
            {/* Lump Sum Input Section */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoney sx={{ mr: 2 }} />
                    Lump Sum Calculator
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  {/* Investment Amount */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Investment Amount
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={lumpSumAmount}
                      onChange={(e) => setLumpSumAmount(Number(e.target.value))}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                      }}
                      sx={{ mb: 2 }}
                    />
                    <Slider
                      value={lumpSumAmount}
                      onChange={(e, value) => setLumpSumAmount(value)}
                      min={10000}
                      max={10000000}
                      step={10000}
                      valueLabelDisplay="auto"
                      color="primary"
                    />
                  </Box>

                  {/* Investment Period */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Investment Period (Years)
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={lumpSumPeriod}
                      onChange={(e) => setLumpSumPeriod(Number(e.target.value))}
                      sx={{ mb: 2 }}
                    />
                    <Slider
                      value={lumpSumPeriod}
                      onChange={(e, value) => setLumpSumPeriod(value)}
                      min={1}
                      max={30}
                      step={1}
                      valueLabelDisplay="auto"
                      color="primary"
                    />
                  </Box>

                  {/* Expected Return */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Expected Annual Return (%)
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={lumpSumReturn}
                      onChange={(e) => setLumpSumReturn(Number(e.target.value))}
                      InputProps={{
                        endAdornment: <Typography sx={{ ml: 1 }}>%</Typography>,
                      }}
                      sx={{ mb: 2 }}
                    />
                    <Slider
                      value={lumpSumReturn}
                      onChange={(e, value) => setLumpSumReturn(value)}
                      min={1}
                      max={25}
                      step={0.5}
                      valueLabelDisplay="auto"
                      color="primary"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Lump Sum Results Section */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <CardContent sx={{ p: 4, color: 'white' }}>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccountBalance sx={{ mr: 2 }} />
                    Investment Results
                  </Typography>
                  <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.2)' }} />

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                      {formatCurrency(lumpSumResults.futureValue)}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
                      Maturity Amount
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)' }}>
                        <Typography variant="h6" sx={{ color: 'white' }}>
                          {formatCurrency(lumpSumResults.totalInvested)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Principal Amount
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)' }}>
                        <Typography variant="h6" sx={{ color: 'white' }}>
                          {formatCurrency(lumpSumResults.returns)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Total Gains
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <Alert severity="success" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                      <Typography variant="body2">
                        <strong>Growth:</strong> {(((lumpSumResults.futureValue / lumpSumResults.totalInvested - 1) * 100).toFixed(1))}% over {lumpSumPeriod} years
                      </Typography>
                    </Alert>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>
      )}
    </Container>
  );
}
'use client';

import { useState, useEffect } from 'react';
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
  Fade,
  Autocomplete,
  CircularProgress
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
  const [sipAmount, setSipAmount] = useState(20000);
  const [sipPeriod, setSipPeriod] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);

  // Lump Sum Calculator State
  const [lumpSumAmount, setLumpSumAmount] = useState(100000);
  const [lumpSumPeriod, setLumpSumPeriod] = useState(5);
  const [lumpSumReturn, setLumpSumReturn] = useState(10);

  const [activeCalculator, setActiveCalculator] = useState('sip');

  // Real-time Calculator State
  const [schemes, setSchemes] = useState([]);
  const [schemeLoading, setSchemeLoading] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [navData, setNavData] = useState(null);
  const [historicalSipYears, setHistoricalSipYears] = useState(5);
  const [realSipAmount, setRealSipAmount] = useState(20000);
  const [realSipResult, setRealSipResult] = useState(null);
  const [realSipLoading, setRealSipLoading] = useState(false);
  const [historicalLumpSumAmount, setHistoricalLumpSumAmount] = useState(100000);
  const [historicalLumpSumResult, setHistoricalLumpSumResult] = useState(null);
  const [goalTargetAmount, setGoalTargetAmount] = useState(1000000);
  const [goalYears, setGoalYears] = useState(10);
  const [requiredSip, setRequiredSip] = useState(null);
  const [calcError, setCalcError] = useState(null);

  // Fetch schemes list once
  useEffect(() => {
    const loadSchemes = async () => {
      try {
        setSchemeLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
        const res = await fetch(`${baseUrl}/api/mf?limit=500`);
        if (!res.ok) throw new Error('Failed to load schemes');
        const json = await res.json();
        const list = json.data || json;
        setSchemes(list);
      } catch (e) {
        setCalcError(e.message);
      } finally {
        setSchemeLoading(false);
      }
    };
    loadSchemes();
  }, []);

  // Fetch NAV history when scheme changes
  useEffect(() => {
    if (!selectedScheme) return;
    const fetchNav = async () => {
      try {
        setNavData(null);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
        const res = await fetch(`${baseUrl}/api/scheme/${selectedScheme.scheme_code}`);
        if (!res.ok) throw new Error('Failed to load scheme NAV history');
        const data = await res.json();
        setNavData(data);
      } catch (e) {
        setCalcError(e.message);
      }
    };
    fetchNav();
  }, [selectedScheme]);

  // Helper to compute from date given years
  const computeFromDate = (years, navHistory) => {
    if (!navHistory || navHistory.length === 0) return null;
    const latest = navHistory[0].date ? navHistory[0].date : navHistory[0].date; // placeholder
    const latestDate = new Date(navHistory[0].date || navHistory[0].date);
    const start = new Date(latestDate);
    start.setFullYear(start.getFullYear() - years);
    return start;
  };

  // Trigger real-time SIP calculation when dependencies change
  useEffect(() => {
    const runSip = async () => {
      if (!selectedScheme || !navData) return;
      try {
        setRealSipLoading(true);
        setCalcError(null);
        const history = (navData.data || []).sort((a,b) => new Date(a.date) - new Date(b.date));
        if (history.length === 0) return;
        const latestDate = history[history.length - 1].date;
        const fromDateObj = new Date(latestDate);
        fromDateObj.setFullYear(fromDateObj.getFullYear() - historicalSipYears);
        const fromStr = fromDateObj.toISOString().slice(0,10);
        const toStr = latestDate;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
        const res = await fetch(`${baseUrl}/api/scheme/${selectedScheme.scheme_code}/sip`, {
          method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: realSipAmount, frequency: 'monthly', from: fromStr, to: toStr })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'SIP calculation failed');
        setRealSipResult(json);
      } catch (e) {
        setCalcError(e.message);
      } finally {
        setRealSipLoading(false);
      }
    };
    runSip();
  }, [selectedScheme, navData, realSipAmount, historicalSipYears]);

  // Historical lump sum calculation using navData
  useEffect(() => {
    if (!selectedScheme || !navData) return;
    try {
      const history = (navData.data || []).sort((a,b) => new Date(a.date) - new Date(b.date));
      if (history.length === 0) return;
      const latest = history[history.length - 1];
      const fromDateObj = new Date(latest.date);
      fromDateObj.setFullYear(fromDateObj.getFullYear() - historicalSipYears);
      const startNav = history.find(h => new Date(h.date) >= fromDateObj) || history[0];
      const units = historicalLumpSumAmount / parseFloat(startNav.nav);
      const currentValue = units * parseFloat(latest.nav);
      const profit = currentValue - historicalLumpSumAmount;
      const years = historicalSipYears;
      const cagr = ((currentValue / historicalLumpSumAmount) ** (1/years) - 1) * 100;
      setHistoricalLumpSumResult({
        startDate: startNav.date,
        endDate: latest.date,
        invested: historicalLumpSumAmount,
        units: units,
        currentValue,
        profit,
        cagr
      });
    } catch (e) {
      setCalcError(e.message);
    }
  }, [selectedScheme, navData, historicalSipYears, historicalLumpSumAmount]);

  // Goal calculator (required SIP) based on historical CAGR if available
  useEffect(() => {
    if (!goalTargetAmount || !goalYears) return;
    let annualRate = 0.12; // default 12%
    if (historicalLumpSumResult?.cagr && !isNaN(historicalLumpSumResult.cagr)) {
      annualRate = historicalLumpSumResult.cagr / 100;
    }
    const months = goalYears * 12;
    const monthlyRate = Math.pow(1 + annualRate, 1/12) - 1;
    if (monthlyRate <= 0) {
      setRequiredSip(null);
      return;
    }
    const required = goalTargetAmount * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
    setRequiredSip(required);
  }, [goalTargetAmount, goalYears, historicalLumpSumResult]);

  // Format helpers additions
  const formatNumber = (v, digits=2) => typeof v === 'number' && !isNaN(v) ? v.toFixed(digits) : '—';

  const sipResults = calculateSIP();
  const lumpSumResults = calculateLumpSum();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // SIP Calculation
  function calculateSIP() {
    const monthlyRate = expectedReturn / 100 / 12;
    const months = sipPeriod * 12;
    const futureValue = sipAmount * (((1 + monthlyRate) ** months - 1) / monthlyRate) * (1 + monthlyRate);
    const totalInvested = sipAmount * months;
    const returns = futureValue - totalInvested;
    return { futureValue, totalInvested, returns };
  }

  // Lump Sum Calculation
  function calculateLumpSum() {
    const annualRate = lumpSumReturn / 100;
    const futureValue = lumpSumAmount * ((1 + annualRate) ** lumpSumPeriod);
    const returns = futureValue - lumpSumAmount;
    return { futureValue, totalInvested: lumpSumAmount, returns };
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

      {/* Scheme Selection (Real-time) */}
      <Paper sx={{ p: 3, mb: 5 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <Autocomplete
              loading={schemeLoading}
              options={schemes}
              getOptionLabel={(o) => o.scheme_name || ''}
              value={selectedScheme}
              onChange={(e, val) => setSelectedScheme(val)}
              renderInput={(params) => (
                <TextField {...params} label="Select Scheme (Real NAV)" placeholder="Type to search" InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {schemeLoading ? <CircularProgress size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="SIP Amount"
                  type="number"
                  fullWidth
                  value={realSipAmount}
                  onChange={(e) => setRealSipAmount(Number(e.target.value))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Historical Years"
                  type="number"
                  fullWidth
                  value={historicalSipYears}
                  onChange={(e) => setHistoricalSipYears(Number(e.target.value))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Lump Sum Amount"
                  type="number"
                  fullWidth
                  value={historicalLumpSumAmount}
                  onChange={(e) => setHistoricalLumpSumAmount(Number(e.target.value))}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {calcError && <Alert severity="error" sx={{ mt: 2 }}>{calcError}</Alert>}
      </Paper>

      {/* Real-time Results Summary */}
      {selectedScheme && (
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Real SIP (Historical)</Typography>
                {realSipLoading && <CircularProgress size={24} />}
                {realSipResult && !realSipLoading && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Invested</Typography>
                    <Typography variant="h6" sx={{ mb: 1 }}>{formatCurrency(realSipResult.totalInvested)}</Typography>
                    <Typography variant="body2" color="text.secondary">Current Value</Typography>
                    <Typography variant="h6" sx={{ mb: 1 }}>{formatCurrency(realSipResult.currentValue)}</Typography>
                    <Typography variant="body2" color="text.secondary">Profit</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: realSipResult.absoluteProfit >=0 ? 'success.main':'error.main' }}>{formatCurrency(realSipResult.absoluteProfit)}</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary">Abs Return %: {formatNumber(realSipResult.absoluteReturnPercent)}%</Typography><br />
                    <Typography variant="caption" color="text.secondary">Annualized %: {realSipResult.annualizedReturnPercent !== null ? formatNumber(realSipResult.annualizedReturnPercent) : '—'}%</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Historical Lump Sum</Typography>
                {historicalLumpSumResult ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Invested</Typography>
                    <Typography variant="h6" sx={{ mb: 1 }}>{formatCurrency(historicalLumpSumResult.invested)}</Typography>
                    <Typography variant="body2" color="text.secondary">Current Value</Typography>
                    <Typography variant="h6" sx={{ mb: 1 }}>{formatCurrency(historicalLumpSumResult.currentValue)}</Typography>
                    <Typography variant="body2" color="text.secondary">Profit</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: historicalLumpSumResult.profit >=0 ? 'success.main':'error.main' }}>{formatCurrency(historicalLumpSumResult.profit)}</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary">CAGR: {formatNumber(historicalLumpSumResult.cagr)}%</Typography>
                  </Box>
                ) : <Typography variant="body2">—</Typography>}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Goal (Required SIP)</Typography>
                <Grid container spacing={1} sx={{ mb: 1 }}>
                  <Grid size={{ xs: 6 }}>
                    <TextField label="Target Corpus" type="number" fullWidth value={goalTargetAmount} onChange={(e)=>setGoalTargetAmount(Number(e.target.value))} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField label="Years" type="number" fullWidth value={goalYears} onChange={(e)=>setGoalYears(Number(e.target.value))} />
                  </Grid>
                </Grid>
                {requiredSip && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Required Monthly SIP</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatCurrency(requiredSip)}</Typography>
                    <Typography variant="caption" color="text.secondary">Assuming CAGR {historicalLumpSumResult?.cagr ? formatNumber(historicalLumpSumResult.cagr) : '12.00'}%</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Existing calculators retained below */}
      {/* REMOVE duplicated legacy calculators to prevent double rendering */}
      {/* BEGIN: Removed old SIP & Lump Sum duplicate sections */}
      {/* (Old sections were here) */}
      {/* END: Removed */}
    </Container>
  );
}
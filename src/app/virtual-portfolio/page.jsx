// // src/app/virtual-portfolio/page.jsx
// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { 
//     Container, Typography, Box, Grid, Card, CardContent,
//     Button, CircularProgress, Alert, Paper, Table, TableBody, 
//     TableCell, TableContainer, TableHead, TableRow, Link as MuiLink,
//     Divider, TextField, Autocomplete, Snackbar, useTheme, Stack, IconButton, Tooltip, Chip // Added Chip
// } from '@mui/material';
// import Link from 'next/link';
// import { 
//     AccountBalanceWallet, TrendingUp, Timeline, Delete, Refresh, Money 
// } from '@mui/icons-material';
// import { CurrencyText } from '@/components/ReturnComponents'; // Assuming this exists
// // --- NEW IMPORTS ---
// import { NotFoundResults } from '@/components/NotFoundComponents';
// import { getMockUser, CURRENT_MOCK_USER_ID } from '@/lib/authMock'; 
// // --------------------

// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
// const REQUIRED_ROLE = 'customer_premium'; // Define required role

// // Fetches the user's virtual SIPs and Credit
// async function fetchVirtualPortfolio() {
//     const res = await fetch(`${BASE_URL}/api/virtual-portfolio`);
//     // NOTE: Frontend ab 403 Forbidden error ko bhi gracefully handle karega.
//     if (!res.ok) throw new Error('Failed to fetch virtual portfolio');
//     // API now returns { sips: [], credit: {} }
//     const data = await res.json(); 
//     return { 
//         sips: data.sips || [],
//         credit: data.credit || { currentBalance: 0, initialCredit: 0 }
//     };
// }

// // Function to simulate current performance (This is an MVP implementation)
// async function simulateCurrentPerformance(schemeCode, units) {
//     // Fetches the latest NAV for the given scheme
//     const navRes = await fetch(`${BASE_URL}/api/scheme/${schemeCode}`);
//     if (!navRes.ok) throw new Error('Failed to fetch latest NAV');
//     const navData = await navRes.json();
    
//     // Find the latest NAV (assuming data[0] is the latest)
//     const latestNav = parseFloat(navData.data[0]?.nav);
//     if (isNaN(latestNav) || latestNav <= 0) throw new Error('Invalid latest NAV');

//     const currentValue = units * latestNav;
//     return currentValue;
// }


// export default function VirtualPortfolioPage() {
//     const theme = useTheme(); // For color access
//     const [portfolio, setPortfolio] = useState([]);
//     const [credit, setCredit] = useState({ currentBalance: 0, initialCredit: 0 }); // NEW CREDIT STATE
//     const [schemes, setSchemes] = useState([]);
//     const [schemeOptionsLoading, setSchemeOptionsLoading] = useState(false);

//     // Form state for creating virtual SIP
//     const [selectedScheme, setSelectedScheme] = useState(null);
//     const [formAmount, setFormAmount] = useState(5000);
//     const [formFrom, setFormFrom] = useState(() => {
//         const d = new Date(); d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0,10);
//     });
//     const [formTo, setFormTo] = useState(() => new Date().toISOString().slice(0,10));
//     const [creating, setCreating] = useState(false);
//     const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
    
//     // --- MOCK AUTH STATE (NEW) ---
//     const [user, setUser] = useState(() => getMockUser(CURRENT_MOCK_USER_ID));
//     const isAccessAllowed = user && user.role === REQUIRED_ROLE;
//     // ----------------------

//     const loadData = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         if (!isAccessAllowed) { // Guard added
//             setLoading(false);
//             return;
//         }
//         try {
//             const { sips: watchlistSips, credit: userCredit } = await fetchVirtualPortfolio();
//             setCredit(userCredit); // Update Credit State
            
//             // Step 1: Calculate current value for each SIP (for display purposes)
//             const performancePromises = watchlistSips.map(async (sip) => {
//                 try {
//                     const currentValue = await simulateCurrentPerformance(sip.schemeCode, sip.initialTotalUnits);
//                     const profit = currentValue - sip.initialTotalInvested;
                    
//                     return {
//                         ...sip,
//                         currentValue: currentValue,
//                         profit: profit,
//                         returnPct: (profit / sip.initialTotalInvested) * 100,
//                     };
//                 } catch (e) {
//                     return { ...sip, error: "Error simulating value." };
//                 }
//             });

//             const updatedPortfolio = await Promise.all(performancePromises);
//             setPortfolio(updatedPortfolio);

//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     }, [isAccessAllowed]); // Dependency added

//     // Load a small list of schemes for the autocomplete
//     useEffect(() => {
//         if (!isAccessAllowed) return; // Guard added
//         const loadSchemes = async () => {
//             try {
//                 setSchemeOptionsLoading(true);
//                 const res = await fetch(`${BASE_URL}/api/mf?limit=250`);
//                 if (!res.ok) throw new Error('Failed to fetch schemes for selector');
//                 const json = await res.json();
//                 const list = json.data || json;
//                 setSchemes(list || []);
//             } catch (e) {
//                 // non-fatal
//                 console.error('Scheme load error', e);
//             } finally {
//                 setSchemeOptionsLoading(false);
//             }
//         };
//         loadSchemes();
//     }, [isAccessAllowed]); // Dependency added

//     const handleCreateVirtualSIP = async () => {
//         if (!isAccessAllowed) return; // Guard added
//         if (!selectedScheme || !formAmount || !formFrom || !formTo) {
//             setSnackbar({ open: true, message: 'Please complete all fields.', severity: 'error' });
//             return;
//         }
//         setCreating(true);
//         setSnackbar({ open: false, message: '', severity: 'success' }); // Clear old snackbar
//         try {
//             const res = await fetch(`${BASE_URL}/api/virtual-portfolio`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ schemeCode: selectedScheme.scheme_code, schemeName: selectedScheme.scheme_name, amount: Number(formAmount), from: formFrom, to: formTo })
//             });
            
//             const json = await res.json();

//             if (!res.ok) {
//                 // FIX: API errors (like Insufficient Credit or 403)
//                 setSnackbar({ 
//                     open: true, 
//                     message: json.error || 'Transaction denied by server.', 
//                     severity: 'error' 
//                 });
//                 await loadData(); // Always refresh data to show current balance accurately
//                 return; // Gracefully exit
//             }
            
//             setSnackbar({ open: true, message: json.message || 'Virtual SIP created', severity: 'success' });
//             // reload data (including new credit balance)
//             await loadData();
//             // reset some fields
//             setSelectedScheme(null);
//             setFormAmount(5000);
//         } catch (e) {
//             // Yeh block sirf network ya JSON parsing errors ko handle karega
//             console.error("Network/Parsing Error:", e);
//             setSnackbar({ open: true, message: e.message || 'Network error occurred.', severity: 'error' });
//         } finally {
//             setCreating(false);
//         }
//     };

//     const handleDelete = async (sipId) => {
//         if (!isAccessAllowed) return; // Guard added
//         if (!confirm('Are you sure you want to sell this virtual SIP? This action will credit the current value (including profit/loss) back to your balance.')) return;
//         setLoading(true);
//         setSnackbar({ open: false, message: '', severity: 'success' }); // Clear old snackbar
//         try {
//             const res = await fetch(`${BASE_URL}/api/virtual-portfolio`, {
//                 method: 'DELETE',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ sipId }),
//             });
            
//             const json = await res.json();
//             if (!res.ok) throw new Error(json.error || 'Failed to sell SIP.');
            
//             setSnackbar({ open: true, message: json.message || 'Virtual SIP sold!', severity: 'success' });
//             await loadData();
//         } catch (e) {
//             setError(e.message);
//             setSnackbar({ open: true, message: e.message || 'Error selling SIP.', severity: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };


//     useEffect(() => {
//         loadData();
//     }, [loadData]);
    
//     // Summary Calculations
//     const totalCurrentValue = portfolio.reduce((sum, sip) => sum + (sip.currentValue || 0), 0);
//     const totalInvested = portfolio.reduce((sum, sip) => sum + sip.initialTotalInvested, 0);
//     const netProfit = totalCurrentValue - totalInvested;
//     const portfolioMarketValue = totalCurrentValue;
//     const totalCreditBalance = credit.currentBalance + portfolioMarketValue;

//     // --- ACCESS DENIAL RENDER (NEW) ---
//     if (!isAccessAllowed) {
//         return (
//             <Container maxWidth="md" sx={{ py: 8 }}>
//                 <NotFoundResults
//                     title="Premium Access Required"
//                     message="The Virtual Portfolio feature is exclusively available to Premium customers. Please upgrade your account to manage virtual investments."
//                     showHomeButton={true}
//                     showRefreshButton={false}
//                 />
//                 <Box sx={{ textAlign: 'center', mt: 4 }}>
//                      <Chip label={`Current Role: ${user?.role || 'Guest'}`} color="warning" />
//                 </Box>
//             </Container>
//         );
//     }
//     // ----------------------------


//     return (
//         <Container maxWidth="xl" sx={{ py: 4 }}>
//             <Grid container alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 4 }}>
//                 <Grid item xs={12} md={8}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                         <AccountBalanceWallet sx={{ fontSize: 36, color: theme.palette.primary.main }} />
//                         <Box>
//                             <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
//                                 Virtual Portfolio
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">Track simulated SIPs and view current P&L using live NAVs.</Typography>
//                         </Box>
//                     </Box>
//                 </Grid>
//                 <Grid item xs={12} md={4}>
//                     <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
//                         <Tooltip title="Refresh portfolio">
//                             <IconButton aria-label="refresh" onClick={loadData}>
//                                 <Refresh />
//                             </IconButton>
//                         </Tooltip>
//                         <Button variant="contained" component={Link} href="/calculator" startIcon={<Timeline />}>
//                             Simulate New SIP
//                         </Button>
//                     </Stack>
//                 </Grid>
//             </Grid>

//             {/* Credit Balance Card */}
//             <Card sx={{ 
//                 mb: 4, 
//                 p: 3, 
//                 background: theme.palette.mode === 'light' ? 'linear-gradient(135deg, #e0e7ff 0%, #d1c4e9 100%)' : theme.palette.background.paper, 
//                 border: '1px solid',
//                 borderColor: 'divider'
//             }}>
//                 <Grid container spacing={3} alignItems="center">
//                     <Grid item xs={12} sm={6}>
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                             <Money color="primary" sx={{ fontSize: 32 }} />
//                             <Typography variant="h5" sx={{ fontWeight: 600 }}>
//                                 Available Virtual Credit
//                             </Typography>
//                         </Box>
//                         <CurrencyText value={credit.currentBalance} variant="h3" component="span" sx={{ fontWeight: 800, color: theme.palette.primary.dark }} />
                        
//                         <Typography 
//                             variant="body2" 
//                             color="text.secondary"
//                             component="span" // <-- FIX APPLIED
//                         >
//                             Initial Credit: <CurrencyText value={credit.initialCredit} variant="body2" component="span" sx={{ fontWeight: 500 }} />
//                         </Typography>

//                     </Grid>
//                     <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
//                          <Typography variant="body2" color="text.secondary">
//                             Total Virtual Assets (Cash + Portfolio Value)
//                         </Typography>
//                         <CurrencyText value={totalCreditBalance} variant="h4" component="span" sx={{ fontWeight: 700 }} />
//                     </Grid>
//                 </Grid>
//             </Card>


//             {/* Create Virtual SIP Form */}
//             <Paper sx={{ p: 2, mb: 4 }} elevation={2}>
//                 <Grid container spacing={2} alignItems="center">
//                     {/* ... (SIP creation fields) ... */}
//                     <Grid item xs={12} md={5}>
//                         <Autocomplete
//                             options={schemes}
//                             getOptionLabel={(o) => o.scheme_name || ''}
//                             value={selectedScheme}
//                             onChange={(e, val) => setSelectedScheme(val)}
//                             loading={schemeOptionsLoading}
//                             renderInput={(params) => (
//                                 <TextField {...params} label="Select Scheme" placeholder="Search scheme" fullWidth />
//                             )}
//                         />
//                     </Grid>
//                     <Grid item xs={12} md={2}>
//                         <TextField label="Monthly Amount" type="number" fullWidth value={formAmount} onChange={(e)=>setFormAmount(Number(e.target.value))} />
//                     </Grid>
//                     <Grid item xs={6} md={2}>
//                         <TextField label="Start Date" type="date" fullWidth value={formFrom} onChange={(e)=>setFormFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
//                     </Grid>
//                     <Grid item xs={6} md={2}>
//                         <TextField label="End Date" type="date" fullWidth value={formTo} onChange={(e)=>setFormTo(e.target.value)} InputLabelProps={{ shrink: true }} />
//                     </Grid>
//                     <Grid item xs={12} md={1}>
//                         <Button variant="contained" color="primary" onClick={handleCreateVirtualSIP} disabled={creating} fullWidth sx={{ height: '100%' }}>
//                             {creating ? 'Adding...' : 'Add'}
//                         </Button>
//                     </Grid>
//                 </Grid>
//             </Paper>

//             {/* Summary Cards */}
//             <Grid container spacing={3} sx={{ mb: 4 }}>
//                 <Grid item xs={12} sm={4}>
//                     <Card sx={{ height: '100%' }}><CardContent sx={{ textAlign: 'center' }}>
//                         <Typography variant="body2" color="text.secondary">Total Invested</Typography>
//                         <CurrencyText value={totalInvested} variant="h5" component="span" sx={{ fontWeight: 700 }} />
//                     </CardContent></Card>
//                 </Grid>
//                 <Grid item xs={12} sm={4}>
//                     <Card sx={{ height: '100%' }}><CardContent sx={{ textAlign: 'center' }}>
//                         <Typography variant="body2" color="text.secondary">Current Market Value</Typography>
//                         <CurrencyText value={portfolioMarketValue} variant="h5" component="span" sx={{ fontWeight: 700, color: 'secondary.main' }} />
//                     </CardContent></Card>
//                 </Grid>
//                 <Grid item xs={12} sm={4}>
//                     <Card sx={{ height: '100%' }}><CardContent sx={{ textAlign: 'center' }}>
//                         <Typography variant="body2" color="text.secondary">Net Profit/Loss</Typography>
//                         <CurrencyText 
//                             value={netProfit} 
//                             variant="h5" 
//                             component="span"
//                             sx={{ fontWeight: 700, color: netProfit >= 0 ? 'secondary.dark' : 'error.main' }} 
//                         />
//                     </CardContent></Card>
//                 </Grid>
//             </Grid>

//             {/* SIP List Table */}
//             <TableContainer component={Paper} elevation={3} sx={{ mt: 1, mb: 3, maxHeight: 520 }}>
//                 <Table stickyHeader>
//                     {/* ... (Table Head) ... */}
//                     <TableHead>
//                         <TableRow>
//                             <TableCell>Scheme</TableCell>
//                             <TableCell align="right">Monthly Amount</TableCell>
//                             <TableCell align="right">Invested Value</TableCell>
//                             <TableCell align="right">Current Value</TableCell>
//                             <TableCell align="right">P&L (%)</TableCell>
//                             <TableCell align="center">Duration</TableCell>
//                             <TableCell align="center">Actions</TableCell>
//                         </TableRow>
//                     </TableHead>
//                     <TableBody>
//                         {portfolio.map((sip, index) => (
//                             <TableRow key={sip.sipId || index} hover>
//                                 <TableCell>
//                                     <Typography variant="subtitle1" component={Link} href={`/scheme/${sip.schemeCode}`} sx={{ fontWeight: 600 }}>{sip.schemeName}</Typography>
//                                     <Typography variant="caption" color="text.secondary">({sip.schemeCode})</Typography>
//                                 </TableCell>
//                                 <TableCell align="right"><CurrencyText value={sip.amount} variant="body1" component="span" /></TableCell>
//                                 <TableCell align="right"><CurrencyText value={sip.initialTotalInvested} variant="body1" component="span" /></TableCell>
//                                 <TableCell align="right"><CurrencyText value={sip.currentValue} variant="body1" component="span" /></TableCell>
//                                 <TableCell align="right" sx={{ color: sip.profit >= 0 ? 'secondary.main' : 'error.main', fontWeight: 600 }}>{sip.returnPct ? `${sip.returnPct.toFixed(2)}%` : '—'}</TableCell>
//                                 <TableCell align="center">{new Date(sip.startDate).toLocaleDateString()} to {new Date(sip.endDate).toLocaleDateString()}</TableCell>
//                                 <TableCell align="center">
//                                     <Button size="small" color="error" startIcon={<Delete />} onClick={() => handleDelete(sip.sipId)}>Sell & Redeem</Button>
//                                 </TableCell>
//                             </TableRow>
//                         ))}
//                     </TableBody>
//                 </Table>
//             </TableContainer>

//             {portfolio.length === 0 && (
//                 <Box sx={{ mt: 3 }}>
//                     <Paper sx={{ p: 3, textAlign: 'center' }}>
//                         <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No virtual SIPs yet</Typography>
//                         <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                             Use the form above to add an investment. Your initial virtual credit is <CurrencyText value={credit.initialCredit} variant="body2" component="span" />.
//                         </Typography>
//                         <Button variant="contained" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Add your first SIP</Button>
//                     </Paper>
//                 </Box>
//             )}
            
//             <Snackbar
//                 open={snackbar.open}
//                 autoHideDuration={6000}
//                 onClose={() => setSnackbar({ ...snackbar, open: false })}
//                 message={snackbar.message}
//                 severity={snackbar.severity}
//             />
//         </Container>
//     );
// }
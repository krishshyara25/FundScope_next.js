// src/app/virtual-portfolio/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
    Container, Typography, Box, Grid, Card, CardContent,
    Button, CircularProgress, Alert, Paper, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Link as MuiLink,
    Divider, TextField, Autocomplete, Snackbar
} from '@mui/material';
import Link from 'next/link';
import { 
    AccountBalanceWallet, TrendingUp, Timeline, Delete, Refresh 
} from '@mui/icons-material';
import { CurrencyText } from '@/components/ReturnComponents'; // Assuming this exists

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

// Fetches the user's virtual SIPs
async function fetchVirtualPortfolio() {
    const res = await fetch(`${BASE_URL}/api/virtual-portfolio`);
    if (!res.ok) throw new Error('Failed to fetch virtual portfolio');
    return res.json();
}

// Function to simulate current performance (This is an MVP implementation)
async function simulateCurrentPerformance(schemeCode, units) {
    // Fetches the latest NAV for the given scheme
    const navRes = await fetch(`${BASE_URL}/api/scheme/${schemeCode}`);
    if (!navRes.ok) throw new Error('Failed to fetch latest NAV');
    const navData = await navRes.json();
    
    // Find the latest NAV (assuming data[0] is the latest)
    const latestNav = parseFloat(navData.data[0]?.nav);
    if (isNaN(latestNav)) throw new Error('Invalid latest NAV');

    const currentValue = units * latestNav;
    return currentValue;
}


export default function VirtualPortfolioPage() {
    const [portfolio, setPortfolio] = useState([]);
    const [schemes, setSchemes] = useState([]);
    const [schemeOptionsLoading, setSchemeOptionsLoading] = useState(false);

    // Form state for creating virtual SIP
    const [selectedScheme, setSelectedScheme] = useState(null);
    const [formAmount, setFormAmount] = useState(5000);
    const [formFrom, setFormFrom] = useState(() => {
        const d = new Date(); d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0,10);
    });
    const [formTo, setFormTo] = useState(() => new Date().toISOString().slice(0,10));
    const [creating, setCreating] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const sips = await fetchVirtualPortfolio();
            
            // Step 1: Calculate current value for each SIP
            const performancePromises = sips.map(async (sip) => {
                try {
                    const currentValue = await simulateCurrentPerformance(sip.schemeCode, sip.initialTotalUnits);
                    const profit = currentValue - sip.initialTotalInvested;
                    
                    return {
                        ...sip,
                        currentValue: currentValue,
                        profit: profit,
                        returnPct: (profit / sip.initialTotalInvested) * 100,
                    };
                } catch (e) {
                    return { ...sip, error: "Error simulating value." };
                }
            });

            const updatedPortfolio = await Promise.all(performancePromises);
            setPortfolio(updatedPortfolio);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load a small list of schemes for the autocomplete
    useEffect(() => {
        const loadSchemes = async () => {
            try {
                setSchemeOptionsLoading(true);
                const res = await fetch(`${BASE_URL}/api/mf?limit=250`);
                if (!res.ok) throw new Error('Failed to fetch schemes for selector');
                const json = await res.json();
                const list = json.data || json;
                setSchemes(list || []);
            } catch (e) {
                // non-fatal
                console.error('Scheme load error', e);
            } finally {
                setSchemeOptionsLoading(false);
            }
        };
        loadSchemes();
    }, []);

    const handleCreateVirtualSIP = async () => {
        if (!selectedScheme || !formAmount || !formFrom || !formTo) {
            setSnackbar({ open: true, message: 'Please complete all fields.', severity: 'error' });
            return;
        }
        setCreating(true);
        try {
            const res = await fetch(`${BASE_URL}/api/virtual-portfolio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schemeCode: selectedScheme.scheme_code, schemeName: selectedScheme.scheme_name, amount: Number(formAmount), from: formFrom, to: formTo })
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to create virtual SIP');
            setSnackbar({ open: true, message: json.message || 'Virtual SIP created', severity: 'success' });
            // reload portfolio
            await loadData();
            // reset some fields
            setSelectedScheme(null);
            setFormAmount(5000);
        } catch (e) {
            console.error(e);
            setSnackbar({ open: true, message: e.message || 'Error', severity: 'error' });
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteSip = async (sipId) => {
        if (!confirm('Are you sure you want to remove this virtual SIP?')) return;
        try {
            const res = await fetch(`${BASE_URL}/api/virtual-portfolio`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sipId })
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to delete');
            setSnackbar({ open: true, message: json.message || 'Deleted', severity: 'success' });
            await loadData();
        } catch (e) {
            setSnackbar({ open: true, message: e.message || 'Error deleting', severity: 'error' });
        }
    };

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const handleDelete = async (sipId) => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/virtual-portfolio`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sipId }),
            });
            
            if (!res.ok) throw new Error('Failed to delete SIP.');
            
            await loadData();
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography variant="h3" gutterBottom><AccountBalanceWallet /> Virtual Portfolio</Typography>
                <Alert severity="info" icon={<CircularProgress size={20} color="inherit" />} sx={{ mt: 2 }}>
                    Loading virtual portfolio simulations...
                </Alert>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                <Button onClick={loadData} startIcon={<Refresh />} sx={{ mt: 2 }} variant="outlined">
                    Reload Data
                </Button>
            </Container>
        );
    }
    
    const totalCurrentValue = portfolio.reduce((sum, sip) => sum + (sip.currentValue || 0), 0);
    const totalInvested = portfolio.reduce((sum, sip) => sum + sip.initialTotalInvested, 0);
    const netProfit = totalCurrentValue - totalInvested;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
                    <AccountBalanceWallet sx={{ mr: 2 }} color="primary" />
                    Virtual Portfolio
                </Typography>
                <Button variant="contained" component={Link} href="/calculator" startIcon={<Timeline />}>
                    Simulate New SIP
                </Button>
            </Box>

            {/* Create Virtual SIP Form */}
            <Paper sx={{ p: 2, mb: 4 }} elevation={2}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <Autocomplete
                            options={schemes}
                            getOptionLabel={(o) => o.scheme_name || ''}
                            value={selectedScheme}
                            onChange={(e, val) => setSelectedScheme(val)}
                            loading={schemeOptionsLoading}
                            renderInput={(params) => (
                                <TextField {...params} label="Select Scheme" placeholder="Search scheme" />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField label="Monthly Amount" type="number" fullWidth value={formAmount} onChange={(e)=>setFormAmount(Number(e.target.value))} />
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <TextField label="Start Date" type="date" fullWidth value={formFrom} onChange={(e)=>setFormFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <TextField label="End Date" type="date" fullWidth value={formTo} onChange={(e)=>setFormTo(e.target.value)} InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={12} md={1}>
                        <Button variant="contained" color="primary" onClick={handleCreateVirtualSIP} disabled={creating} fullWidth>
                            {creating ? 'Adding...' : 'Add'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Card><CardContent>
                        <Typography variant="body2" color="text.secondary">Total Virtual Investment</Typography>
                        <CurrencyText value={totalInvested} variant="h5" sx={{ fontWeight: 700 }} />
                    </CardContent></Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card><CardContent>
                        <Typography variant="body2" color="text.secondary">Total Current Value</Typography>
                        <CurrencyText value={totalCurrentValue} variant="h5" sx={{ fontWeight: 700, color: 'secondary.main' }} />
                    </CardContent></Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card><CardContent>
                        <Typography variant="body2" color="text.secondary">Net Profit/Loss</Typography>
                        <CurrencyText value={netProfit} variant="h5" sx={{ fontWeight: 700, color: netProfit >= 0 ? 'secondary.dark' : 'error.main' }} />
                    </CardContent></Card>
                </Grid>
            </Grid>

            {/* SIP List Table */}
            <TableContainer component={Paper} elevation={3}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Scheme</TableCell>
                            <TableCell align="right">Monthly Amount</TableCell>
                            <TableCell align="right">Invested Value</TableCell>
                            <TableCell align="right">Current Value</TableCell>
                            <TableCell align="right">P&L (%)</TableCell>
                            <TableCell align="center">Duration</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {portfolio.map((sip, index) => (
                            <TableRow key={sip.sipId || index} hover>
                                <TableCell>
                                    <Typography variant="subtitle1" component={Link} href={`/scheme/${sip.schemeCode}`} sx={{ fontWeight: 600 }}>{sip.schemeName}</Typography>
                                    <Typography variant="caption" color="text.secondary">({sip.schemeCode})</Typography>
                                </TableCell>
                                <TableCell align="right"><CurrencyText value={sip.amount} variant="body1" /></TableCell>
                                <TableCell align="right"><CurrencyText value={sip.initialTotalInvested} variant="body1" /></TableCell>
                                <TableCell align="right"><CurrencyText value={sip.currentValue} variant="body1" /></TableCell>
                                <TableCell align="right" sx={{ color: sip.profit >= 0 ? 'secondary.main' : 'error.main', fontWeight: 600 }}>{sip.returnPct ? `${sip.returnPct.toFixed(2)}%` : '—'}</TableCell>
                                <TableCell align="center">{new Date(sip.startDate).toLocaleDateString()} to {new Date(sip.endDate).toLocaleDateString()}</TableCell>
                                <TableCell align="center">
                                    <Button size="small" color="error" startIcon={<Delete />} onClick={() => handleDelete(sip.sipId)}>Sell</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {portfolio.length === 0 && (
                <Alert severity="info" sx={{ mt: 3 }}>No virtual SIPs added. Use the 'Simulate New SIP' button to begin tracking!</Alert>
            )}
        </Container>
    );
}
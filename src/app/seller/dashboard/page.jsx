// src/app/seller/dashboard/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
    Box, 
    Typography, 
    Container, 
    Alert, 
    Button, 
    CircularProgress, 
    Grid, 
    Card, 
    CardContent, 
    Divider,
    Paper,
    useTheme,
    Chip
} from '@mui/material';
import { 
    Storefront, 
    MonetizationOn, 
    TrendingUp, 
    CalendarToday, 
    Refresh, 
    Info 
} from '@mui/icons-material';
import { getMockUser, CURRENT_MOCK_USER_ID } from '@/lib/authMock';
import { NotFoundResults } from '@/components/NotFoundComponents';
import { CurrencyText } from '@/components/ReturnComponents'; // For formatting

const REQUIRED_ROLES = ['seller', 'admin', 'company_head'];
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');


async function fetchCommissionData() {
    const res = await fetch(`${BASE_URL}/api/v1/seller/commissions`);
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch commission data.');
    }
    return await res.json();
}

export default function SellerDashboardPage() {
    const theme = useTheme();
    const user = getMockUser(CURRENT_MOCK_USER_ID);
    const isAccessAllowed = user && REQUIRED_ROLES.includes(user.role);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    
    const loadData = useCallback(async () => {
        if (!isAccessAllowed) return;

        setLoading(true);
        setError(null);
        try {
            const fetchedData = await fetchCommissionData();
            setData(fetchedData.commissionData);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [isAccessAllowed]);

    useEffect(() => {
        loadData();
    }, [loadData]);


    if (!isAccessAllowed) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <NotFoundResults
                    title="Access Denied"
                    message="You do not have the required Seller/Admin privileges to view this dashboard."
                    showHomeButton={true}
                    showRefreshButton={false}
                />
            </Container>
        );
    }
    
    const commission = data || {};
    const historicalData = commission.historical || [];


    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Storefront sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
                        Seller Dashboard
                    </Typography>
                </Box>
                <Button 
                    variant="outlined" 
                    onClick={loadData} 
                    startIcon={<Refresh />}
                    disabled={loading}
                >
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </Button>
            </Box>
            
            <Alert severity="info" sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Welcome, {user?.name || 'Seller User'}!</Typography>
                <Typography variant="body2">
                    Manage customers and track your personal trail commissions based on AUM.
                </Typography>
            </Alert>
            
            {loading && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>}
            
            {error && <Alert severity="error" sx={{ mb: 3 }}>Error loading data: {error}</Alert>}

            {!loading && data && (
                <Grid container spacing={4}>
                    {/* 1. Monthly Earnings Card */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', background: theme.palette.mode === 'light' ? theme.palette.secondary.light : theme.palette.background.paper }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="body2" color="text.secondary">Current Monthly Earnings (Accrued)</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <MonetizationOn sx={{ color: theme.palette.primary.dark }} />
                                    <CurrencyText value={commission.monthlyEarning} variant="h4" component="span" sx={{ fontWeight: 800, color: theme.palette.primary.dark }} />
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Chip 
                                    label={`Payout Available: ${commission.withdrawalDate}`} 
                                    size="small" 
                                    color="success" 
                                    icon={<CalendarToday />}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 2. Total AUM Card */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="body2" color="text.secondary">Total Customer AUM (Asset Under Management)</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TrendingUp sx={{ color: theme.palette.secondary.main }} />
                                    <CurrencyText value={commission.totalAUM} variant="h4" component="span" sx={{ fontWeight: 700, color: theme.palette.secondary.dark }} />
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="caption" color="text.secondary">
                                    From {commission.customerCount} active customers. Rate: {commission.rates?.sellerShareAnnual}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 3. Annual Projection Card */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', background: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.background.paper }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="body2" color="text.secondary">Annual Commission Projection</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <MonetizationOn sx={{ color: theme.palette.primary.main }} />
                                    <CurrencyText value={commission.annualProjection} variant="h4" component="span" sx={{ fontWeight: 700 }} />
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="caption" color="text.secondary">
                                    Based on current AUM. Total Commission Rate: {commission.rates?.annualRate}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    
                    {/* 4. Monthly Earnings Chart (Placeholder) */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Monthly Earnings Trend</Typography>
                            <Box sx={{ p: 4, bgcolor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.background.default, borderRadius: 2, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography color="text.secondary">
                                    Chart Component (Historical Data: {historicalData.length} records) to be implemented using Recharts in Phase 3.
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                </Grid>
            )}
        </Container>
    );
}
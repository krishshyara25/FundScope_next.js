// src/app/admin/dashboard/page.jsx
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
    useTheme
} from '@mui/material';
import { 
    AdminPanelSettings, 
    Group, 
    MonetizationOn,
    TrendingUp,
    CalendarToday,
    Refresh, 
    Info 
} from '@mui/icons-material';
import { getMockUser, CURRENT_MOCK_USER_ID } from '@/lib/authMock';
import { NotFoundResults } from '@/components/NotFoundComponents';
import { CurrencyText } from '@/components/ReturnComponents'; // For formatting

const REQUIRED_ROLES = ['admin', 'company_head'];
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');


async function fetchAdminCommissionData() {
    const res = await fetch(`${BASE_URL}/api/v1/admin/commissions`);
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch admin commission data.');
    }
    return await res.json();
}

export default function AdminDashboardPage() {
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
            const fetchedData = await fetchAdminCommissionData();
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
                    message="You do not have the required Admin privileges to view this dashboard."
                    showHomeButton={true}
                    showRefreshButton={false}
                />
            </Container>
        );
    }
    
    const commission = data || {};
    const historical = commission.historical || [];


    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AdminPanelSettings sx={{ fontSize: 40, color: theme.palette.secondary.main }} />
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
                        Admin Dashboard
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
            
            <Alert severity="success" sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Welcome, {user?.name || 'Admin User'}!</Typography>
                <Typography variant="body2">
                    Manage sellers, track team performance, and oversee commission payouts.
                </Typography>
            </Alert>
            
            {loading && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>}
            
            {error && <Alert severity="error" sx={{ mb: 3 }}>Error loading data: {error}</Alert>}

            {!loading && data && (
                <Grid container spacing={4}>
                    {/* 1. Monthly Earnings Card (Admin Share) */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', background: theme.palette.mode === 'light' ? theme.palette.primary.light : theme.palette.background.paper }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="body2" color="text.secondary">Admin Monthly Earnings (Your Share)</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <MonetizationOn sx={{ color: theme.palette.secondary.dark }} />
                                    <CurrencyText value={commission.monthlyEarning} variant="h4" component="span" sx={{ fontWeight: 800, color: theme.palette.secondary.dark }} />
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="caption" color="text.secondary">
                                    Payout Available: {commission.withdrawalDate || 'N/A'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 2. Total Team AUM Card */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="body2" color="text.secondary">Total Team AUM (Managed by {commission.sellerCount} Sellers)</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TrendingUp sx={{ color: theme.palette.primary.main }} />
                                    <CurrencyText value={commission.totalTeamAUM} variant="h4" component="span" sx={{ fontWeight: 700, color: theme.palette.primary.dark }} />
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="caption" color="text.secondary">
                                    Annual Projection: <CurrencyText value={commission.annualProjection} variant="caption" component="span" />
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 3. Seller Count Card */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', background: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.background.paper }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="body2" color="text.secondary">Active Sellers Under You</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Group sx={{ color: theme.palette.secondary.main }} />
                                    <Typography variant="h4" component="span" sx={{ fontWeight: 700 }}>
                                        {commission.sellerCount}
                                    </Typography>
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Button size="small" variant="outlined" disabled>Manage Sellers (Phase 3)</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                    
                    {/* 4. Team Commission Trend (Placeholder) */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Team AUM & Commission Trend</Typography>
                            <Box sx={{ p: 4, bgcolor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.background.default, borderRadius: 2, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography color="text.secondary">
                                    Trend Chart Component (Historical Data: {historical.length} records) will visualize team growth.
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Container>
    );
}
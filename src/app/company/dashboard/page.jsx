// src/app/company/dashboard/page.jsx
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
    Business, 
    MonetizationOn,
    TrendingUp,
    Group,
    Refresh, 
    Info 
} from '@mui/icons-material';
import { getMockUser, CURRENT_MOCK_USER_ID } from '@/lib/authMock';
import { NotFoundResults } from '@/components/NotFoundComponents';
import { CurrencyText } from '@/components/ReturnComponents'; // For formatting

const REQUIRED_ROLES = ['company_head'];
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');


async function fetchCompanyData() {
    // Company Head, Admin API se aggregated data lega
    const res = await fetch(`${BASE_URL}/api/v1/admin/commissions`);
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch company/admin data.');
    }
    return await res.json();
}

export default function CompanyDashboardPage() {
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
            const fetchedData = await fetchCompanyData();
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
                    message="Only the Company Head can view this dashboard."
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
                    <Business sx={{ fontSize: 40, color: theme.palette.error.main }} />
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
                        Company Head Dashboard
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
            
            <Alert severity="error" sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Welcome, {user?.name || 'Company Head'}!</Typography>
                <Typography variant="body2">
                    This dashboard provides company-wide analytics and commission configuration tools.
                </Typography>
            </Alert>
            
            {loading && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>}
            
            {error && <Alert severity="error" sx={{ mb: 3 }}>Error loading data: {error}</Alert>}

            {!loading && data && (
                <Grid container spacing={4}>
                    {/* 1. Monthly Earnings Card (Company Share) */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', background: theme.palette.mode === 'light' ? theme.palette.error.light : theme.palette.background.paper }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="body2" color="text.secondary">Company Monthly Earnings (Your Share)</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <MonetizationOn sx={{ color: theme.palette.error.dark }} />
                                    <CurrencyText value={commission.monthlyEarning} variant="h4" component="span" sx={{ fontWeight: 800, color: theme.palette.error.dark }} />
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="caption" color="text.secondary">
                                    Payout Available: {commission.withdrawalDate || 'N/A'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 2. Total Company AUM Card (Aggregated) */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="body2" color="text.secondary">Total Virtual AUM (Managed by {commission.sellerCount} Sellers)</Typography>
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

                    {/* 3. Team Size Card */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', background: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.background.paper }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="body2" color="text.secondary">Admins Reporting to You</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Group sx={{ color: theme.palette.secondary.main }} />
                                    <Typography variant="h4" component="span" sx={{ fontWeight: 700 }}>
                                        {commission.sellerCount} {/* Mock: Using sellerCount as Mock Admin Count */}
                                    </Typography>
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Button size="small" variant="outlined" disabled>Manage Admins (Phase 3)</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                    
                    {/* 4. Company AUM Trend (Placeholder) */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Company-wide AUM Trend</Typography>
                            <Box sx={{ p: 4, bgcolor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.background.default, borderRadius: 2, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography color="text.secondary">
                                    Trend Chart Component (Historical Data: {historical.length} records) will visualize company growth.
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Container>
    );
}
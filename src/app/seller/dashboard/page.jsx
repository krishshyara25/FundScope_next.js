// src/app/seller/dashboard/page.jsx
'use client';

import { Box, Typography, Container, Alert, Button, CircularProgress } from '@mui/material';
import { Storefront, Refresh, Info } from '@mui/icons-material';
import { getMockUser, CURRENT_MOCK_USER_ID } from '@/lib/authMock';
import { NotFoundResults } from '@/components/NotFoundComponents';

const REQUIRED_ROLES = ['seller', 'admin', 'company_head'];

export default function SellerDashboardPage() {
    const user = getMockUser(CURRENT_MOCK_USER_ID);
    const isAccessAllowed = user && REQUIRED_ROLES.includes(user.role);

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

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Storefront sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
                    Seller Dashboard
                </Typography>
            </Box>
            
            <Alert severity="info" icon={<Info />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Welcome, {user?.name || 'Seller User'}!</Typography>
                <Typography variant="body2">
                    This is your centralized dashboard for managing customers and tracking personal commissions.
                </Typography>
            </Alert>
            
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>Commission Overview (Phase 3)</Typography>
                {/* Placeholder for Commission Logic */}
                <Box sx={{ p: 4, bgcolor: 'background.paper', border: '1px dashed grey', borderRadius: 2, textAlign: 'center' }}>
                    <CircularProgress size={30} sx={{ mb: 2 }} />
                    <Typography color="text.secondary">
                        Commission calculation and display logic will be integrated here in Phase 3.
                    </Typography>
                    <Button variant="outlined" size="small" sx={{ mt: 2 }} disabled>View Customer AUM</Button>
                </Box>
            </Box>
        </Container>
    );
}
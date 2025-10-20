// src/app/company/dashboard/page.jsx
'use client';

import { Box, Typography, Container, Alert, Button, CircularProgress } from '@mui/material';
import { AdminPanelSettings, Business, Info } from '@mui/icons-material';
import { getMockUser, CURRENT_MOCK_USER_ID } from '@/lib/authMock';
import { NotFoundResults } from '@/components/NotFoundComponents';

const REQUIRED_ROLES = ['company_head'];

export default function CompanyDashboardPage() {
    const user = getMockUser(CURRENT_MOCK_USER_ID);
    const isAccessAllowed = user && REQUIRED_ROLES.includes(user.role);

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

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Business sx={{ fontSize: 40, color: 'error.main' }} />
                <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
                    Company Head Dashboard
                </Typography>
            </Box>
            
            <Alert severity="error" icon={<Info />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Welcome, {user?.name || 'Company Head'}!</Typography>
                <Typography variant="body2">
                    This dashboard provides company-wide analytics and commission configuration tools.
                </Typography>
            </Alert>
            
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>Configuration (Phase 2)</Typography>
                {/* Placeholder for Configuration Logic */}
                <Box sx={{ p: 4, bgcolor: 'background.paper', border: '1px dashed red', borderRadius: 2, textAlign: 'center' }}>
                    <CircularProgress size={30} sx={{ mb: 2 }} />
                    <Typography color="text.secondary">
                        Commission slab configuration and top-level analytics will be integrated here.
                    </Typography>
                    <Button variant="outlined" size="small" sx={{ mt: 2 }} disabled>Configure Slabs</Button>
                </Box>
            </Box>
        </Container>
    );
}
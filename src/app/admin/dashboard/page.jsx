// src/app/admin/dashboard/page.jsx
'use client';

import { Box, Typography, Container, Alert, Button, CircularProgress } from '@mui/material';
import { AdminPanelSettings, Group, Info } from '@mui/icons-material';
import { getMockUser, CURRENT_MOCK_USER_ID } from '@/lib/authMock';
import { NotFoundResults } from '@/components/NotFoundComponents';

const REQUIRED_ROLES = ['admin', 'company_head'];

export default function AdminDashboardPage() {
    const user = getMockUser(CURRENT_MOCK_USER_ID);
    const isAccessAllowed = user && REQUIRED_ROLES.includes(user.role);

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

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <AdminPanelSettings sx={{ fontSize: 40, color: 'secondary.main' }} />
                <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
                    Admin Dashboard
                </Typography>
            </Box>
            
            <Alert severity="success" icon={<Info />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Welcome, {user?.name || 'Admin User'}!</Typography>
                <Typography variant="body2">
                    Manage sellers, track team performance, and oversee commission payouts.
                </Typography>
            </Alert>
            
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>Team Management (Phase 2)</Typography>
                {/* Placeholder for Management Logic */}
                <Box sx={{ p: 4, bgcolor: 'background.paper', border: '1px dashed lightgreen', borderRadius: 2, textAlign: 'center' }}>
                    <Group size={30} sx={{ mb: 2, color: 'secondary.main' }} />
                    <Typography color="text.secondary">
                        Seller and Admin management tools will be integrated here.
                    </Typography>
                    <Button variant="outlined" size="small" sx={{ mt: 2 }} disabled>View Team Performance</Button>
                </Box>
            </Box>
        </Container>
    );
}
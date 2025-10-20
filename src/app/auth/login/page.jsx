// src/app/auth/login/page.jsx
'use client';

import { Container, Box, Typography, Card, CardContent, TextField, Button, Divider, Link as MuiLink } from '@mui/material';
import { LockOpen, VpnKey } from '@mui/icons-material';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <Container maxWidth="xs" sx={{ py: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <LockOpen sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                    Welcome Back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Sign in to access your portfolio and dashboard.
                </Typography>
            </Box>
            <Card elevation={4} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                    <TextField
                        label="Email or User ID"
                        fullWidth
                        margin="normal"
                        required
                        variant="outlined"
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        required
                        variant="outlined"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 600 }}
                        startIcon={<VpnKey />}
                        onClick={() => alert("Mock Login Attempted (No functionality yet)")}
                    >
                        Sign In (Phase 4)
                    </Button>
                    <Divider sx={{ my: 2 }}>OR</Divider>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Don't have an account? 
                            <MuiLink component={Link} href="/auth/register" sx={{ ml: 0.5, fontWeight: 600 }}>
                                Sign Up
                            </MuiLink>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
}
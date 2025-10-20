// src/app/auth/register/page.jsx
'use client';

import { Container, Box, Typography, Card, CardContent, TextField, Button, Divider, Link as MuiLink } from '@mui/material';
import { PersonAdd, HowToReg } from '@mui/icons-material';
import Link from 'next/link';

export default function RegisterPage() {
    return (
        <Container maxWidth="xs" sx={{ py: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <PersonAdd sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                    Create Account
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Register to start tracking your virtual investments.
                </Typography>
            </Box>
            <Card elevation={4} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                    <TextField
                        label="Full Name"
                        fullWidth
                        margin="normal"
                        required
                        variant="outlined"
                    />
                    <TextField
                        label="Email Address"
                        type="email"
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
                        color="secondary"
                        fullWidth
                        size="large"
                        sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 600 }}
                        startIcon={<HowToReg />}
                        onClick={() => alert("Mock Registration Attempted (No functionality yet)")}
                    >
                        Sign Up (Phase 4)
                    </Button>
                    <Divider sx={{ my: 2 }}>OR</Divider>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Already have an account? 
                            <MuiLink component={Link} href="/auth/login" sx={{ ml: 0.5, fontWeight: 600 }}>
                                Sign In
                            </MuiLink>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
}
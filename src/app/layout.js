// src/app/layout.js
'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import getAppTheme from '@/theme'; // Import the theme creation FUNCTION
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { TrendingUp, Assessment, Calculate, Home, Bookmark, AccountBalanceWallet, DarkMode, LightMode, AdminPanelSettings, Storefront } from '@mui/icons-material';
import { getMockUser, CURRENT_MOCK_USER_ID } from '@/lib/authMock';


export default function RootLayout(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // --- THEME SWITCHER LOGIC ---
  const [mode, setMode] = React.useState('light'); // Default mode is light

  // Create theme dynamically based on state
  const theme = React.useMemo(() => getAppTheme(mode), [mode]);

  // Load theme preference from localStorage on mount (Client-side)
  React.useEffect(() => {
    // Only run on the client side
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('themeMode');
      if (savedMode) {
        setMode(savedMode);
      }
    }
  }, []);

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode); // Persist preference
  };
  // --------------------------

  // --- MOCK AUTH FOR UI CONTROL (deterministic) ---
  // Evaluate synchronously so SSR and CSR render identical nav markup.
  const initialMockUser = getMockUser(CURRENT_MOCK_USER_ID) || null;
  // State for dynamic mock user change (used to simulate logout)
  const [mockUser, setMockUser] = React.useState(initialMockUser);

  // Authentication status derived from mockUser
  const isAuthenticated = !!mockUser;

  const handleMockLogout = () => {
    // NOTE: Simulating session end by redirecting to login and clearing mock state
    setMockUser(null);
    // Use client-side redirect
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  };

  const userRole = mockUser?.role;
  const isPremiumCustomer = userRole === 'customer_premium';
  const isSeller = userRole === 'seller';
  const isAdmin = userRole === 'admin';
  const isCompanyHead = userRole === 'company_head';

  const isPremiumOrHigher = isPremiumCustomer || isSeller || isAdmin || isCompanyHead;
  const isSellerOrHigher = isSeller || isAdmin || isCompanyHead;
  const isAdminOrHigher = isAdmin || isCompanyHead;
  const isCompanyHeadOnly = isCompanyHead;
  // ------------------------------------

  return (
    // Set colorScheme property on HTML element for global styles
    <html lang="en" style={{ colorScheme: mode }}>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppBar
              position="sticky"
              elevation={0}
              sx={{
                top: 0,
                // App bar background remains primary gradient for brand identity
                // 🚀 UPDATED GRADIENT COLOR: Teal Palette
                background: 'linear-gradient(135deg, #016B61 0%, #019488 100%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
                  <TrendingUp sx={{ mr: 2, fontSize: 28 }} />
                  <Typography
                    variant="h5"
                    noWrap
                    component={Link}
                    href="/"
                    sx={{
                      mr: 2,
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      color: 'inherit',
                      textDecoration: 'none',
                      background: 'linear-gradient(45deg, #ffffff, #e0e7ff)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: { xs: '1.05rem', md: '1.25rem' }
                    }}
                  >
                    FundScope
                  </Typography>

                  <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                    <Button component={Link} href="/funds" color="inherit" startIcon={<Home />} sx={{ mx: 0.5 }}>All Funds</Button>
                    <Button component={Link} href="/watchlist" color="inherit" startIcon={<Bookmark />} sx={{ mx: 0.5 }}>Watchlist</Button>

                    {/* Customer Portfolio (Premium/Higher Access) */}
                    {isPremiumOrHigher && (
                      <Button component={Link} href="/customer/portfolio" color="inherit" startIcon={<AccountBalanceWallet />} sx={{ mx: 0.5 }}>Portfolio</Button>
                    )}

                    {/* Seller Dashboard (Seller/Admin/Company Head Access) */}
                    {isSellerOrHigher && (
                      <Button component={Link} href="/seller/dashboard" color="inherit" startIcon={<Storefront />} sx={{ mx: 0.5 }}>Seller</Button>
                    )}

                    {/* Admin Dashboard (Admin/Company Head Access) */}
                    {isAdminOrHigher && (
                      <Button component={Link} href="/admin/dashboard" color="inherit" startIcon={<AdminPanelSettings />} sx={{ mx: 0.5 }}>Admin</Button>
                    )}

                    {/* Company Head Dashboard (Company Head Only Access) */}
                    {isCompanyHeadOnly && (
                      <Button component={Link} href="/company/dashboard" color="inherit" startIcon={<AdminPanelSettings />} sx={{ mx: 0.5 }}>Company</Button>
                    )}

                    <Button component={Link} href="/analytics" color="inherit" startIcon={<Assessment />} sx={{ mx: 0.5 }}>Analytics</Button>
                    <Button component={Link} href="/calculator" color="inherit" startIcon={<Calculate />} sx={{ mx: 0.5 }}>Calculator</Button>
                  </Box>

                  {/* --- AUTH BUTTONS (NEW) --- */}
                  <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', ml: 2 }}>
                    <IconButton color="inherit" onClick={toggleMode} sx={{ ml: 1 }}>
                      {mode === 'light' ? <DarkMode /> : <LightMode />}
                    </IconButton>
                    {isAuthenticated ? (
                      <>
                        <Typography variant="body2" color="inherit" sx={{ mx: 1, opacity: 0.8 }}>
                          Hi, {mockUser?.name || userRole}!
                        </Typography>
                        <Button color="inherit" onClick={handleMockLogout} size="small" variant="outlined">
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button component={Link} href="/auth/login" color="inherit" size="small" sx={{ mr: 1 }} variant="outlined">
                          Sign In
                        </Button>
                        <Button component={Link} href="/auth/register" color="inherit" size="small" variant="contained">
                          Sign Up
                        </Button>
                      </>
                    )}
                  </Box>
                  {/* ---------------------------- */}

                  {/* Mobile menu button */}
                  <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                    <IconButton color="inherit" onClick={handleMenuOpen} aria-label="open menu">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} keepMounted>
                      <MenuItem component={Link} href="/funds" onClick={handleMenuClose}>All Funds</MenuItem>
                      <MenuItem component={Link} href="/watchlist" onClick={handleMenuClose}>Watchlist</MenuItem>

                      {isPremiumOrHigher && (
                        <MenuItem component={Link} href="/customer/portfolio" onClick={handleMenuClose}>Portfolio</MenuItem>
                      )}
                      {isSellerOrHigher && (
                        <MenuItem component={Link} href="/seller/dashboard" onClick={handleMenuClose}>Seller</MenuItem>
                      )}
                      {isAdminOrHigher && (
                        <MenuItem component={Link} href="/admin/dashboard" onClick={handleMenuClose}>Admin</MenuItem>
                      )}
                      {isCompanyHeadOnly && (
                        <MenuItem component={Link} href="/company/dashboard" onClick={handleMenuClose}>Company</MenuItem>
                      )}

                      <MenuItem component={Link} href="/analytics" onClick={handleMenuClose}>Analytics</MenuItem>
                      <MenuItem component={Link} href="/calculator" onClick={handleMenuClose}>Calculator</MenuItem>

                      {/* Mobile Auth Items */}
                      {isAuthenticated ? (
                        <MenuItem onClick={handleMockLogout}>Logout ({mockUser?.name})</MenuItem>
                      ) : (
                        [
                          <MenuItem key="login" component={Link} href="/auth/login" onClick={handleMenuClose}>Sign In</MenuItem>,
                          <MenuItem key="register" component={Link} href="/auth/register" onClick={handleMenuClose}>Sign Up</MenuItem>
                        ]
                      )}
                    </Menu>
                  </Box>
                </Toolbar>
              </Container>
            </AppBar>

            {/* Main Content Area (Uses dynamic background color) */}
            <Box
              sx={{
                minHeight: 'calc(100vh - 72px)',
                bgcolor: 'background.default' // Dynamic background
              }}
            >
              <Container maxWidth="lg" sx={{ pt: 4, pb: 8 }}>
                {props.children}
              </Container>
            </Box>

            {/* Footer */}
            <Box
              component="footer"
              sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                backgroundColor: 'background.paper', // Dynamic footer background
                color: 'text.primary',
                borderTop: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Container maxWidth="lg">
                <Typography variant="body2" align="center">
                  © 2025 FundScope. Built with Next.js and Material-UI
                </Typography>
              </Container>
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
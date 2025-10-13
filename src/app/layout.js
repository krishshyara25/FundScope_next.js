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
import { TrendingUp, Assessment, Calculate, Home, Bookmark, AccountBalanceWallet, DarkMode, LightMode } from '@mui/icons-material'; // Added Dark/Light Mode icons

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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                    <Button component={Link} href="/virtual-portfolio" color="inherit" startIcon={<AccountBalanceWallet />} sx={{ mx: 0.5 }}>Virtual Portfolio</Button>
                    <Button component={Link} href="/analytics" color="inherit" startIcon={<Assessment />} sx={{ mx: 0.5 }}>Analytics</Button>
                    <Button component={Link} href="/calculator" color="inherit" startIcon={<Calculate />} sx={{ mx: 0.5 }}>Calculator</Button>
                  </Box>

                  {/* Theme Toggle Button (NEW) */}
                  <IconButton color="inherit" onClick={toggleMode} sx={{ ml: 1 }}>
                    {mode === 'light' ? <DarkMode /> : <LightMode />}
                  </IconButton>

                  {/* Mobile menu button */}
                  <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                    <IconButton color="inherit" onClick={handleMenuOpen} aria-label="open menu">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} keepMounted>
                      <MenuItem component={Link} href="/funds" onClick={handleMenuClose}>All Funds</MenuItem>
                      <MenuItem component={Link} href="/watchlist" onClick={handleMenuClose}>Watchlist</MenuItem>
                      <MenuItem component={Link} href="/virtual-portfolio" onClick={handleMenuClose}>Virtual Portfolio</MenuItem>
                      <MenuItem component={Link} href="/analytics" onClick={handleMenuClose}>Analytics</MenuItem>
                      <MenuItem component={Link} href="/calculator" onClick={handleMenuClose}>Calculator</MenuItem>
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
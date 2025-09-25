'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from 'next/link';
import { TrendingUp, Assessment, Calculate, Home } from '@mui/icons-material';

export default function RootLayout(props) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppBar 
              position="static" 
              elevation={0}
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ minHeight: '72px' }}>
                  <TrendingUp sx={{ mr: 2, fontSize: 32 }} />
                  <Typography
                    variant="h5"
                    noWrap
                    component={Link}
                    href="/"
                    sx={{
                      mr: 4,
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      color: 'inherit',
                      textDecoration: 'none',
                      background: 'linear-gradient(45deg, #ffffff, #e0e7ff)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    FundScope
                  </Typography>
                  
                  <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                    <Button
                      component={Link}
                      href="/funds"
                      color="inherit"
                      startIcon={<Home />}
                      sx={{ 
                        mx: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      All Funds
                    </Button>
                    <Button
                      component={Link}
                      href="/analytics"
                      color="inherit"
                      startIcon={<Assessment />}
                      sx={{ 
                        mx: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      Analytics
                    </Button>
                    <Button
                      component={Link}
                      href="/calculator"
                      color="inherit"
                      startIcon={<Calculate />}
                      sx={{ 
                        mx: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      Calculator
                    </Button>
                  </Box>
                </Toolbar>
              </Container>
            </AppBar>
            
            {/* Hero gradient background */}
            <Box
              sx={{
                background: 'linear-gradient(180deg, rgba(102, 126, 234, 0.05) 0%, rgba(248, 250, 252, 1) 100%)',
                minHeight: 'calc(100vh - 72px)',
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
                backgroundColor: '#0f172a',
                color: 'white',
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
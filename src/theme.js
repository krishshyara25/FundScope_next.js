// src/theme.js
'use client';

import { createTheme } from '@mui/material/styles';
import { Inter } from 'next/font/google';

const inter = Inter({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
});

// Function to create a theme based on the selected mode
const getAppTheme = (mode) => createTheme({
  palette: {
    mode,
    // Primary/Secondary colors remain consistent for branding
    primary: {
      main: '#2563eb', 
      light: '#3b82f6',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#059669', 
      light: '#10b981',
      dark: '#047857',
    },
    error: {
      main: '#dc2626', 
      light: '#ef4444',
      dark: '#b91c1c',
    },
    // Background and Text colors dynamically adjust based on mode
    background: {
      default: mode === 'light' ? '#f8fafc' : '#111827', // Dark background
      paper: mode === 'light' ? '#ffffff' : '#1f2937',   // Dark card/paper background
    },
    text: {
      primary: mode === 'light' ? '#0f172a' : '#f8fafc',
      secondary: mode === 'light' ? '#64748b' : '#9ca3af',
    },
    // Grey shades setup
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    h1: { fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em' },
    h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          // FIX: Card background follows theme paper color
          backgroundColor: mode === 'light' ? '#ffffff' : '#1f2937', 
          border: `1px solid ${mode === 'light' ? '#e2e8f0' : '#475569'}`,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          '&:hover': {
            boxShadow: '0 0 0 0.5px currentColor, 0 4px 6px -1px rgb(0 0 0 / 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            // FIX: Input field background dark mode ke hisaab se (was hardcoded white)
            backgroundColor: mode === 'light' ? '#ffffff' : '#334155',
            '& fieldset': {
              borderColor: mode === 'light' ? '#e2e8f0' : '#475569',
            },
            '&:hover fieldset': {
              borderColor: mode === 'light' ? '#cbd5e1' : '#64748b',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563eb',
            },
          },
          '& .MuiInputBase-input': {
            color: mode === 'light' ? '#0f172a' : '#f1f5f9', // Input text color
          },
          '& .MuiInputLabel-root': {
            color: mode === 'light' ? '#64748b' : '#94a3b8', // Label color
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                // Ensures plain Paper (like the filter bar or lookup box) also respects theme color
                backgroundColor: 'inherit',
            },
        },
    },
  },
});

export default getAppTheme; // Export the function
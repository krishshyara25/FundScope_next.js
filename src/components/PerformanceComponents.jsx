'use client';

import {
  Box,
  Typography,
  Chip,
  Alert,
  Button,
  Fade,
  LinearProgress
} from '@mui/material';
import { Speed, TrendingUp, Info } from '@mui/icons-material';

export function PerformanceIndicator({ 
  isLoading, 
  totalItems, 
  currentItems, 
  page,
  totalPages 
}) {
  if (isLoading) {
    return (
      <Box sx={{ mb: 2 }}>
        <LinearProgress sx={{ borderRadius: 1, height: 6 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Loading optimized data...
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in={true}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        mb: 3,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1
      }}>
        <Speed color="primary" />
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Performance Optimized
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Showing {currentItems} of {totalItems.toLocaleString()} funds • Page {page} of {totalPages}
          </Typography>
        </Box>
        <Chip 
          label="15/page" 
          color="primary" 
          size="small" 
          icon={<TrendingUp />}
        />
      </Box>
    </Fade>
  );
}

export function OptimizationBanner() {
  return (
    <Alert 
      severity="info" 
      icon={<Info />}
      sx={{ 
        mb: 3,
        '& .MuiAlert-message': {
          width: '100%'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            🚀 Performance Enhanced
          </Typography>
          <Typography variant="body2">
            This page loads 15 funds at a time to ensure smooth performance with our 40,000+ fund database.
          </Typography>
        </Box>
        <Button 
          size="small" 
          variant="outlined"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          Browse Funds
        </Button>
      </Box>
    </Alert>
  );
}

export function LoadingOptimization({ 
  message = "Optimizing for best performance...",
  details = "Loading data in chunks to prevent browser freeze"
}) {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 6,
      px: 3,
      textAlign: 'center'
    }}>
      <Box sx={{ 
        width: '100%', 
        maxWidth: 400,
        mb: 3
      }}>
        <LinearProgress 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            mb: 2,
            background: 'rgba(37, 99, 235, 0.1)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
            }
          }} 
        />
      </Box>
      
      <Speed sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
      
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        {message}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {details}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Chip label="Pagination Enabled" color="primary" variant="outlined" size="small" />
        <Chip label="Search Debounced" color="secondary" variant="outlined" size="small" />
        <Chip label="Lazy Loading" color="success" variant="outlined" size="small" />
      </Box>
    </Box>
  );
}
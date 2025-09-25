'use client';

import { 
  Box, 
  Typography, 
  Button, 
  Paper
} from '@mui/material';
import { 
  SearchOff, 
  TrendingUp,
  Refresh,
  Home
} from '@mui/icons-material';
import Link from 'next/link';

export function NotFoundResults({ 
  title = "No results found", 
  message = "Try adjusting your search criteria or filters",
  showHomeButton = true,
  showRefreshButton = false,
  onRefresh
}) {
  return (
    <Paper 
      sx={{ 
        p: 6, 
        textAlign: 'center',
        bgcolor: 'background.default',
        border: '2px dashed',
        borderColor: 'divider'
      }}
    >
      <SearchOff 
        sx={{ 
          fontSize: 64, 
          color: 'text.secondary', 
          mb: 2,
          opacity: 0.5
        }} 
      />
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {message}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
        {showHomeButton && (
          <Button
            variant="outlined"
            startIcon={<Home />}
            component={Link}
            href="/funds"
          >
            All Funds
          </Button>
        )}
        {showRefreshButton && onRefresh && (
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={onRefresh}
          >
            Try Again
          </Button>
        )}
      </Box>
    </Paper>
  );
}

export function LoadingError({ 
  error, 
  onRetry,
  title = "Something went wrong"
}) {
  return (
    <Paper 
      sx={{ 
        p: 4, 
        textAlign: 'center',
        bgcolor: 'error.50',
        border: '1px solid',
        borderColor: 'error.200'
      }}
    >
      <Typography variant="h6" gutterBottom color="error.main">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {error}
      </Typography>
      {onRetry && (
        <Button
          variant="contained"
          color="error"
          startIcon={<Refresh />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </Paper>
  );
}
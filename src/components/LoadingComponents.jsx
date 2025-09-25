'use client';

import { 
  Box, 
  CircularProgress, 
  Typography, 
  Fade,
  LinearProgress
} from '@mui/material';

export function LoadingSpinner({ message = 'Loading...', size = 40 }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
      }}
    >
      <CircularProgress size={size} sx={{ mb: 2 }} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

export function LoadingCard({ height = 200 }) {
  return (
    <Box
      sx={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export function LoadingBar({ message }) {
  return (
    <Fade in={true}>
      <Box>
        <LinearProgress
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            height: 3,
          }}
        />
        {message && (
          <Box sx={{ 
            position: 'fixed', 
            top: 10, 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 10000,
            bgcolor: 'background.paper',
            px: 2,
            py: 1,
            borderRadius: 2,
            boxShadow: 2
          }}>
            <Typography variant="body2" color="primary">
              {message}
            </Typography>
          </Box>
        )}
      </Box>
    </Fade>
  );
}

export function PageLoadingSpinner({ message = 'Loading funds...', count }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
      }}
    >
      <CircularProgress size={50} sx={{ mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {message}
      </Typography>
      {count && (
        <Typography variant="body2" color="text.secondary">
          Loading {count.toLocaleString()} mutual funds...
        </Typography>
      )}
    </Box>
  );
}
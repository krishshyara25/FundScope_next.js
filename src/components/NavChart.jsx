'use client';

import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Grid, 
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  ShowChart, 
  TrendingUp, 
  TrendingDown, 
  Timeline,
  CalendarToday
} from '@mui/icons-material';

export default function NavChart({ navHistory }) {
  if (!navHistory || navHistory.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">NAV History</Typography>
          <Typography color="text.secondary">
            No NAV data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Sort nav history by date (newest first)
  const sortedNavHistory = [...navHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Get latest and first values for comparison
  const latestNav = sortedNavHistory[0];
  const firstNav = sortedNavHistory[sortedNavHistory.length - 1];
  const navChange = latestNav.value - firstNav.value;
  const navChangePercent = ((navChange / firstNav.value) * 100);

  // Get recent entries for display
  const recentNavData = sortedNavHistory.slice(0, 10);

  // Calculate basic statistics
  const allValues = sortedNavHistory.map(item => item.value);
  const maxNav = Math.max(...allValues);
  const minNav = Math.min(...allValues);
  const avgNav = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 4,
    }).format(value);
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(255, 255, 255, 1) 100%)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main', 
              mr: 2,
              width: 48,
              height: 48,
            }}
          >
            <ShowChart fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              NAV Performance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Net Asset Value history and statistics
            </Typography>
          </Box>
        </Box>

        {/* Current NAV and Change */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {formatCurrency(latestNav.value)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {navChange >= 0 ? (
              <TrendingUp sx={{ color: 'secondary.main' }} />
            ) : (
              <TrendingDown sx={{ color: 'error.main' }} />
            )}
            <Typography 
              variant="body1"
              sx={{ 
                color: navChange >= 0 ? 'secondary.main' : 'error.main',
                fontWeight: 500 
              }}
            >
              {navChange >= 0 ? '+' : ''}{formatCurrency(navChange)} ({navChangePercent.toFixed(2)}%)
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Since {formatDate(firstNav.date)}
          </Typography>
        </Box>

        {/* Statistics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Highest
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {formatCurrency(maxNav)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Average
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {formatCurrency(avgNav)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Lowest
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {formatCurrency(minNav)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Recent NAV History */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Recent NAV History
        </Typography>
        <List sx={{ p: 0, maxHeight: 300, overflow: 'auto' }}>
          {recentNavData.map((navItem, index) => {
            const prevNav = recentNavData[index + 1];
            const dayChange = prevNav ? navItem.value - prevNav.value : 0;
            const dayChangePercent = prevNav ? ((dayChange / prevNav.value) * 100) : 0;

            return (
              <Box key={`${navItem.date}-${index}`}>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <CalendarToday 
                    sx={{ 
                      color: 'text.secondary', 
                      fontSize: 20, 
                      mr: 2 
                    }} 
                  />
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatCurrency(navItem.value)}
                        </Typography>
                        {prevNav && (
                          <Chip
                            size="small"
                            label={`${dayChange >= 0 ? '+' : ''}${dayChangePercent.toFixed(2)}%`}
                            color={dayChange >= 0 ? 'secondary' : 'error'}
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={formatDate(navItem.date)}
                  />
                </ListItem>
                {index < recentNavData.length - 1 && <Divider sx={{ opacity: 0.3 }} />}
              </Box>
            );
          })}
        </List>

        {/* Data Source */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            {sortedNavHistory.length} NAV records • Last updated: {formatDate(latestNav.date)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
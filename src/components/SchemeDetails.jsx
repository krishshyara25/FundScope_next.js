'use client';

import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Chip, 
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import { 
  AccountBalance,
  Category,
  TrendingUp,
  DateRange,
  BusinessCenter,
  Info,
  AccountBox
} from '@mui/icons-material';

export default function SchemeDetails({ meta }) {
  if (!meta) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Scheme Details</Typography>
          <Typography color="text.secondary">
            No scheme information available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const details = [
    {
      icon: <AccountBalance color="primary" />,
      label: 'Fund House',
      value: meta.fund_house,
    },
    {
      icon: <Category color="primary" />,
      label: 'Category',
      value: meta.scheme_category,
    },
    {
      icon: <BusinessCenter color="primary" />,
      label: 'Scheme Type',
      value: meta.scheme_type,
    },
    {
      icon: <AccountBox color="primary" />,
      label: 'ISIN',
      value: meta.isin,
    },
  ];

  return (
    <Card 
      sx={{ 
        height: '100%',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(255, 255, 255, 1) 100%)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main', 
              mr: 2,
              width: 48,
              height: 48,
            }}
          >
            <Info fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              Fund Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fund information and metadata
            </Typography>
          </Box>
        </Box>

        <List sx={{ p: 0 }}>
          {details.map((detail, index) => (
            <Box key={index}>
              <ListItem sx={{ px: 0, py: 2 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {detail.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {detail.label}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      {detail.value || 'N/A'}
                    </Typography>
                  }
                />
              </ListItem>
              {index < details.length - 1 && <Divider sx={{ my: 1, opacity: 0.5 }} />}
            </Box>
          ))}
        </List>

        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Data sourced from official mutual fund registrar
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
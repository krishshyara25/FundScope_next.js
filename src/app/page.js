'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Button, 
  Container,
  Grid,
  Card,
  CardContent,
  Fade,
  CircularProgress
} from '@mui/material';
import { 
  TrendingUp, 
  Assessment, 
  Calculate,
  Security,
  Speed,
  Analytics
} from '@mui/icons-material';

const features = [
  {
    icon: <TrendingUp fontSize="large" />,
    title: 'Real-time Data',
    description: 'Access live mutual fund NAV data and performance metrics',
  },
  {
    icon: <Assessment fontSize="large" />,
    title: 'Advanced Analytics',
    description: 'Detailed analysis with charts and historical performance',
  },
  {
    icon: <Calculate fontSize="large" />,
    title: 'SIP Calculator',
    description: 'Calculate returns for systematic investment plans',
  },
  {
    icon: <Security fontSize="large" />,
    title: 'Trusted Data',
    description: 'Reliable data from official mutual fund APIs',
  },
  {
    icon: <Speed fontSize="large" />,
    title: 'Fast Performance',
    description: 'Optimized for speed with smart caching',
  },
  {
    icon: <Analytics fontSize="large" />,
    title: 'Smart Insights',
    description: 'Get intelligent recommendations and insights',
  },
];

export default function HomePage() {
  const router = useRouter();

  // Remove auto-redirect - let users explore the home page
  // useEffect(() => {
  //   // Auto redirect to funds page after a short delay
  //   const timer = setTimeout(() => {
  //     router.push('/funds');
  //   }, 3000);

  //   return () => clearTimeout(timer);
  // }, [router]);

  const handleGetStarted = () => {
    router.push('/funds');
  };

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Fade in={true} timeout={1000}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h1" 
            component="h1" 
            gutterBottom
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3,
            }}
          >
            Explore Mutual Funds
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary" 
            paragraph
            sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
          >
            Your comprehensive platform for mutual fund research, analysis, and investment planning
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                },
              }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/funds')}
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              Explore Funds
            </Button>
          </Box>
          {/* Remove the auto-redirect message */}
          {/* <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, opacity: 0.7 }}>
            <CircularProgress size={16} />
            <Typography variant="body2">
              Redirecting to funds in a moment...
            </Typography>
          </Box> */}
        </Box>
      </Fade>

      {/* Features Section */}
      <Fade in={true} timeout={1500}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
              <Fade in={true} timeout={1000 + index * 200}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        color: 'primary.main',
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Fade>
    </Box>
  );
}
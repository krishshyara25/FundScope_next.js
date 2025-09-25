'use client';

import { 
  Chip, 
  Typography, 
  Box 
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  Remove 
} from '@mui/icons-material';

export function ReturnChip({ value, showIcon = true, variant = 'outlined', size = 'small' }) {
  const getColor = () => {
    if (value > 0) return 'secondary';
    if (value < 0) return 'error';
    return 'default';
  };

  const getIcon = () => {
    if (!showIcon) return null;
    if (value > 0) return <TrendingUp />;
    if (value < 0) return <TrendingDown />;
    return <Remove />;
  };

  const formatValue = (val) => {
    if (val === null || val === undefined) return 'N/A';
    return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
  };

  return (
    <Chip
      icon={getIcon()}
      label={formatValue(value)}
      color={getColor()}
      variant={variant}
      size={size}
    />
  );
}

export function ReturnText({ value, variant = 'body1', showIcon = true, prefix = '' }) {
  const getColor = () => {
    if (value > 0) return 'secondary.main';
    if (value < 0) return 'error.main';
    return 'text.secondary';
  };

  const getIcon = () => {
    if (!showIcon) return null;
    if (value > 0) return <TrendingUp sx={{ fontSize: 'inherit', mr: 0.5 }} />;
    if (value < 0) return <TrendingDown sx={{ fontSize: 'inherit', mr: 0.5 }} />;
    return null;
  };

  const formatValue = (val) => {
    if (val === null || val === undefined) return 'N/A';
    return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {getIcon()}
      <Typography 
        variant={variant}
        sx={{ color: getColor(), fontWeight: 500 }}
      >
        {prefix}{formatValue(value)}
      </Typography>
    </Box>
  );
}

export function CurrencyText({ value, variant = 'body1', currency = 'INR' }) {
  const formatCurrency = (val) => {
    if (val === null || val === undefined) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <Typography variant={variant} sx={{ fontWeight: 500 }}>
      {formatCurrency(value)}
    </Typography>
  );
}
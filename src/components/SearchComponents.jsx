'use client';

import { 
  TextField, 
  Box, 
  InputAdornment,
  IconButton,
  Chip,
  Typography
} from '@mui/material';
import { 
  Search, 
  Clear,
  FilterList
} from '@mui/icons-material';

export function SearchBar({ 
  value, 
  onChange, 
  onClear, 
  placeholder = "Search...", 
  fullWidth = true 
}) {
  return (
    <TextField
      fullWidth={fullWidth}
      label={placeholder}
      variant="outlined"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search color="action" />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton
              aria-label="clear search"
              onClick={onClear}
              edge="end"
              size="small"
            >
              <Clear />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
        },
      }}
    />
  );
}

export function FilterChips({ 
  filters, 
  onFilterChange, 
  onClearAll,
  title = "Active Filters"
}) {
  const activeFilters = Object.entries(filters).filter(([key, value]) => 
    value && value !== 'all' && value !== ''
  );

  if (activeFilters.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <FilterList color="action" />
        <Typography variant="body2" color="text.secondary">
          {title}:
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {activeFilters.map(([key, value]) => (
          <Chip
            key={key}
            label={`${key}: ${value}`}
            onDelete={() => onFilterChange(key, 'all')}
            size="small"
            variant="outlined"
          />
        ))}
        {activeFilters.length > 1 && (
          <Chip
            label="Clear All"
            onClick={onClearAll}
            size="small"
            variant="outlined"
            color="error"
          />
        )}
      </Box>
    </Box>
  );
}

export function ResultsHeader({ 
  totalResults, 
  filteredResults, 
  searchTerm,
  isLoading = false
}) {
  if (isLoading) {
    return (
      <Typography variant="body2" color="text.secondary">
        Searching...
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {searchTerm ? `Search Results for "${searchTerm}"` : 'All Results'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Showing {filteredResults} of {totalResults} results
        {searchTerm && filteredResults !== totalResults && (
          <> • Filtered by search</>
        )}
      </Typography>
    </Box>
  );
}
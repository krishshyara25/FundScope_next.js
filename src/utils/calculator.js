/**
 * Calculate returns for mutual fund schemes
 * @param {Object} params - Parameters for calculation
 * @param {Array} params.navHistory - Array of NAV data with date and nav values
 * @param {string} params.period - Period for calculation (1y, 3y, 5y, etc.)
 * @param {string} params.from - Start date for custom period
 * @param {string} params.to - End date for custom period
 * @returns {Object} Returns calculation results
 */
export function calculateReturns({ navHistory, period, from, to }) {
  if (!navHistory || navHistory.length === 0) {
    throw new Error('No NAV data available for calculation');
  }

  // Sort NAV history by date (newest first)
  const sortedNavHistory = navHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let startDate, endDate;
  const latestNav = sortedNavHistory[0];
  const currentDate = new Date();

  // Determine the date range
  if (from && to) {
    // Custom date range
    startDate = new Date(from);
    endDate = new Date(to);
  } else if (period) {
    // Predefined periods
    endDate = new Date(latestNav.date);
    startDate = new Date(endDate);
    
    switch (period) {
      case '1w':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '1m':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case '3y':
        startDate.setFullYear(startDate.getFullYear() - 3);
        break;
      case '5y':
        startDate.setFullYear(startDate.getFullYear() - 5);
        break;
      default:
        throw new Error('Invalid period specified');
    }
  } else {
    // Default to 1 year if no period specified
    endDate = new Date(latestNav.date);
    startDate = new Date(endDate);
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  // Find the closest NAV values for start and end dates
  const startNav = findClosestNav(sortedNavHistory, startDate);
  const endNav = findClosestNav(sortedNavHistory, endDate);

  if (!startNav || !endNav) {
    throw new Error('Insufficient data for the specified period');
  }

  // Calculate returns
  const absoluteReturn = parseFloat(endNav.nav) - parseFloat(startNav.nav);
  const percentageReturn = ((parseFloat(endNav.nav) - parseFloat(startNav.nav)) / parseFloat(startNav.nav)) * 100;
  
  // Calculate annualized return
  const daysDifference = Math.abs((new Date(endNav.date) - new Date(startNav.date)) / (1000 * 60 * 60 * 24));
  const yearsFraction = daysDifference / 365.25;
  const annualizedReturn = yearsFraction > 0 ? (Math.pow((parseFloat(endNav.nav) / parseFloat(startNav.nav)), (1 / yearsFraction)) - 1) * 100 : 0;

  return {
    period: period || 'custom',
    startDate: startNav.date,
    endDate: endNav.date,
    startNav: parseFloat(startNav.nav),
    endNav: parseFloat(endNav.nav),
    absoluteReturn: Math.round(absoluteReturn * 10000) / 10000,
    percentageReturn: Math.round(percentageReturn * 100) / 100,
    annualizedReturn: yearsFraction >= 1 ? Math.round(annualizedReturn * 100) / 100 : null,
    duration: {
      days: Math.round(daysDifference),
      years: Math.round(yearsFraction * 100) / 100
    }
  };
}

/**
 * Find the NAV entry closest to the specified date
 * @param {Array} navHistory - Sorted NAV history (newest first)
 * @param {Date} targetDate - Target date to find closest NAV for
 * @returns {Object|null} Closest NAV entry or null if not found
 */
function findClosestNav(navHistory, targetDate) {
  if (!navHistory || navHistory.length === 0) return null;
  
  let closest = null;
  let minDifference = Infinity;
  
  for (const nav of navHistory) {
    const navDate = new Date(nav.date);
    const difference = Math.abs(navDate - targetDate);
    
    if (difference < minDifference) {
      minDifference = difference;
      closest = nav;
    }
    
    // If we find an exact match or we've moved past the target date, break
    if (difference === 0 || navDate < targetDate) {
      break;
    }
  }
  
  return closest;
}

/**
 * Calculate SIP (Systematic Investment Plan) returns
 * @param {Object} params - Parameters for SIP calculation
 * @param {Array} params.navHistory - Array of NAV data
 * @param {number} params.monthlyAmount|params.amount - Monthly investment amount
 * @param {string} params.startDate|params.from - SIP start date
 * @param {string} params.endDate|params.to - SIP end date
 * @returns {Object} SIP calculation results
 */
export function calculateSipReturns({ navHistory, monthlyAmount, amount, startDate, from, endDate, to }) {
  if (!navHistory || navHistory.length === 0) {
    throw new Error('No NAV data available for SIP calculation');
  }

  // Handle parameter aliases
  const investmentAmount = monthlyAmount || amount;
  const start = new Date(startDate || from);
  const end = new Date(endDate || to);

  if (!investmentAmount) {
    throw new Error('Monthly investment amount is required');
  }

  const sortedNavHistory = navHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  let totalInvested = 0;
  let totalUnits = 0;
  const investments = [];
  
  // Calculate monthly investments
  let currentDate = new Date(start);
  while (currentDate <= end) {
    const closestNav = findClosestNav(sortedNavHistory, currentDate);
    if (closestNav) {
      const units = investmentAmount / parseFloat(closestNav.nav);
      totalUnits += units;
      totalInvested += investmentAmount;
      
      investments.push({
        date: new Date(currentDate).toISOString().split('T')[0],
        amount: investmentAmount,
        nav: parseFloat(closestNav.nav),
        units: Math.round(units * 10000) / 10000
      });
    }
    
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  // Calculate current value
  const latestNav = findClosestNav(sortedNavHistory, end);
  const currentValue = totalUnits * parseFloat(latestNav.nav);
  const absoluteReturn = currentValue - totalInvested;
  const percentageReturn = (absoluteReturn / totalInvested) * 100;
  
  // Calculate annualized return
  const daysDifference = Math.abs((end - start) / (1000 * 60 * 60 * 24));
  const yearsFraction = daysDifference / 365.25;
  const annualizedReturn = yearsFraction > 0 ? (Math.pow((currentValue / totalInvested), (1 / yearsFraction)) - 1) * 100 : 0;
  
  return {
    totalInvested: Math.round(totalInvested * 100) / 100,
    currentValue: Math.round(currentValue * 100) / 100,
    totalUnits: Math.round(totalUnits * 10000) / 10000,
    absoluteReturn: Math.round(absoluteReturn * 100) / 100,
    percentageReturn: Math.round(percentageReturn * 100) / 100,
    annualizedReturn: yearsFraction >= 1 ? Math.round(annualizedReturn * 100) / 100 : null,
    duration: {
      days: Math.round(daysDifference),
      years: Math.round(yearsFraction * 100) / 100
    },
    investments: investments
  };
}

// Export alias for backward compatibility
export { calculateSipReturns as calculateSIPReturns };
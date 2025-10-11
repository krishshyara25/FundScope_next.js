/**
 * Find the NAV entry closest to the specified date.
 * Finds the latest NAV date on or before the targetDate.
 * * @param {Array<Object>} navHistory - Array of NAV data with 'date' (string) and 'nav' (string) values.
 * @param {Date} targetDate - Target date to find closest NAV for.
 * @returns {Object|null} Closest NAV entry or null if not found.
 */
function findClosestNav(navHistory, targetDate) {
  if (!navHistory || navHistory.length === 0) return null;
  
  // Ensure the history is sorted to find the latest available NAV ON or BEFORE the target date
  const sortedNavHistory = [...navHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let closest = null;

  for (const nav of sortedNavHistory) {
    const navDate = new Date(nav.date);
    const navValue = parseFloat(nav.nav);
    
    // Skip invalid NAV values
    if (navValue <= 0 || isNaN(navValue)) continue;
    
    // Check if the NAV date is on or before the target date
    if (navDate <= targetDate) {
      closest = nav;
      break; // Found the latest relevant NAV, stop searching
    }
  }
  
  return closest;
}


/**
 * Calculate returns for a specified period (lumpsum equivalent).
 * @param {Object} params - Parameters for calculation
 * @param {Array} params.navHistory - Array of NAV data with date and nav values
 * @param {string} params.period - Period for calculation (1d, 1w, 1m, 1y, etc.)
 * @param {string} params.from - Start date for custom period
 * @param {string} params.to - End date for custom period
 * @returns {Object} Returns calculation results
 */
export function calculateReturns({ navHistory, period, from, to }) {
  if (!navHistory || navHistory.length === 0) {
    throw new Error('No NAV data available for calculation');
  }

  // Sort NAV history by date (newest first for easy latestNav access, but logic uses findClosestNav)
  const sortedNavHistory = [...navHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let startDate, endDate;
  const latestNavData = sortedNavHistory[0];

  // --- Determine the date range ---
  if (from && to) {
    startDate = new Date(from);
    endDate = new Date(to);
  } else if (period) {
    endDate = new Date(latestNavData.date);
    startDate = new Date(endDate);
    
    switch (period) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1);
        break;
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
    endDate = new Date(latestNavData.date);
    startDate = new Date(endDate);
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  // Find the closest NAV values for start and end dates
  const startNav = findClosestNav(navHistory, startDate);
  const endNav = findClosestNav(navHistory, endDate);

  if (!startNav || !endNav) {
    throw new Error('Insufficient data for the specified period');
  }

  // --- Calculate returns ---
  const startNavValue = parseFloat(startNav.nav);
  const endNavValue = parseFloat(endNav.nav);

  const absoluteReturn = endNavValue - startNavValue;
  const percentageReturn = ((endNavValue - startNavValue) / startNavValue) * 100;
  
  // Calculate annualized return
  const daysDifference = Math.abs((new Date(endNav.date) - new Date(startNav.date)) / (1000 * 60 * 60 * 24));
  const yearsFraction = daysDifference / 365.25;
  const annualizedReturn = yearsFraction > 0 ? (Math.pow((endNavValue / startNavValue), (1 / yearsFraction)) - 1) * 100 : 0;

  return {
    period: period || 'custom',
    startDate: startNav.date,
    endDate: endNav.date,
    startNav: startNavValue,
    endNav: endNavValue,
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
 * Calculates the irregular rate of return (XIRR) for a series of cash flows.
 * @param {Array<Object>} cashflows - An array of objects with 'amount' and 'date' properties.
 * @returns {number} The XIRR as a percentage (decimal form: 0.12 for 12%).
 */
function calculateXIRR(cashflows, guess = 0.1) {
  const maxIterations = 100;
  const tolerance = 1e-7;

  for (let i = 0; i < maxIterations; i++) {
    let result = 0;
    let derivative = 0;
    const firstDate = cashflows[0].date;

    for (const { amount, date } of cashflows) {
      const days = (date - firstDate) / (1000 * 60 * 60 * 24);
      // Formula for NPV (Net Present Value)
      result += amount * Math.pow(1 + guess, -days / 365);
      // Derivative of the NPV function
      derivative += (-days / 365) * amount * Math.pow(1 + guess, (-days / 365) - 1);
    }

    const newGuess = guess - result / derivative;

    if (Math.abs(newGuess - guess) < tolerance) {
      return newGuess * 100; // Return as percentage
    }
    guess = newGuess;
  }

  return NaN; // Failed to converge
}

/**
 * Calculate SIP (Systematic Investment Plan) returns.
 * @param {Object} params - Parameters for SIP calculation.
 * @param {Array<Object>} params.navHistory - Array of NAV data with date and nav values.
 * @param {number} params.amount - Monthly investment amount.
 * @param {string} params.frequency - Investment frequency (e.g., 'monthly').
 * @param {string} params.from - Start date of the SIP.
 * @param {string} params.to - End date of the SIP.
 * @returns {Object} SIP calculation results.
 */
export function calculateSIPReturns({ navHistory, amount, frequency = 'monthly', from, to }) {
  if (!navHistory || navHistory.length === 0) {
    throw new Error('No NAV data available for calculation');
  }

  const sortedNavHistory = [...navHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
  const latestNavData = [...navHistory].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const latestNav = parseFloat(latestNavData.nav);

  const startDate = new Date(from);
  const endDate = new Date(to);

  let totalInvested = 0;
  let totalUnits = 0;
  const cashflows = [];
  const investmentEvents = [];

  let currentDate = new Date(startDate);

  // Helper to advance date based on frequency
  const advanceDate = (date) => {
    const d = new Date(date);
    switch (frequency) {
      case 'monthly':
      default:
        d.setMonth(d.getMonth() + 1);
        break;
      // Note: other frequencies are not implemented for now to keep it simple, only monthly is requested
    }
    return d;
  };

  while (currentDate <= endDate) {
    const navOnDate = findClosestNav(navHistory, currentDate);
    
    if (navOnDate) {
      const installment = parseFloat(amount);
      const nav = parseFloat(navOnDate.nav);
      
      if (nav > 0 && !isNaN(nav)) {
        const unitsPurchased = installment / nav;
        totalInvested += installment;
        totalUnits += unitsPurchased;
        
        // Cashflow calculation for XIRR
        cashflows.push({ amount: -installment, date: new Date(navOnDate.date) });
        
        // Growth chart data events
        investmentEvents.push({
          date: navOnDate.date,
          nav,
          cumulativeUnits: totalUnits,
          cumulativeInvested: totalInvested
        });
      }
    }
    currentDate = advanceDate(currentDate);
  }

  if (totalInvested === 0) {
    throw new Error('No successful investments were recorded in the period.');
  }

  const currentValue = totalUnits * latestNav;
  
  // Final cashflow (redemption) for XIRR
  cashflows.push({ amount: currentValue, date: new Date(latestNavData.date) });

  const absoluteProfit = currentValue - totalInvested;
  const absoluteReturnPercent = (absoluteProfit / totalInvested) * 100;
  const annualizedReturnPercent = calculateXIRR(cashflows);

  // Duration
  const days = Math.abs(new Date(latestNavData.date) - new Date(startDate)) / (1000 * 60 * 60 * 24);
  const years = days / 365.25;

  // Build growth chart data
  const growthChartData = investmentEvents.map(ev => {
    // Current value based on the latest available NAV
    const markToMarketValue = ev.cumulativeUnits * latestNav; 
    return {
      date: ev.date,
      invested: ev.cumulativeInvested,
      // We use the mark-to-market value based on the latest NAV for consistency in the chart
      value: markToMarketValue, 
      nav: ev.nav
    };
  });
  
  return {
    totalInvested: Math.round(totalInvested * 100) / 100,
    currentValue: Math.round(currentValue * 100) / 100,
    totalUnits: Math.round(totalUnits * 10000) / 10000,
    absoluteProfit: Math.round(absoluteProfit * 100) / 100,
    absoluteReturnPercent: Math.round(absoluteReturnPercent * 100) / 100,
    annualizedReturn: annualizedReturnPercent ? Math.round(annualizedReturnPercent * 100) / 100 : null,
    growthChartData,
    duration: { days: Math.round(days), years: Math.round(years * 100) / 100 }
  };
}

// Export the utility function used by NavChart.jsx
export { findClosestNav };
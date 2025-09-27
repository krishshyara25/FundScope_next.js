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
 * Calculate SIP returns for a mutual fund scheme.
 * @param {Object} params - Parameters for SIP calculation.
 * @param {Array} params.navHistory - Array of NAV data with date and nav values.
 * @param {number} params.amount - Investment amount per installment.
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
      case 'weekly':
        d.setDate(d.getDate() + 7);
        break;
      case 'daily':
        d.setDate(d.getDate() + 1);
        break;
      case 'quarterly':
        d.setMonth(d.getMonth() + 3);
        break;
      case 'monthly':
      default:
        d.setMonth(d.getMonth() + 1);
        break;
    }
    return d;
  };

  while (currentDate <= endDate) {
    const navOnDate = findClosestNav(sortedNavHistory, currentDate);
    if (navOnDate) {
      const installment = parseFloat(amount);
      const nav = parseFloat(navOnDate.nav);
      if (nav > 0 && !isNaN(nav)) {
        const unitsPurchased = installment / nav;
        totalInvested += installment;
        totalUnits += unitsPurchased;
        cashflows.push({ amount: -installment, date: new Date(navOnDate.date) });
        investmentEvents.push({
          date: navOnDate.date,
          nav,
          installment,
          cumulativeInvested: totalInvested,
          cumulativeUnits: totalUnits
        });
      }
    }
    currentDate = advanceDate(currentDate);
  }

  if (totalInvested === 0) {
    return {
      totalInvested: 0,
      currentValue: 0,
      totalUnits: 0,
      absoluteProfit: 0,
      absoluteReturnPercent: 0,
      annualizedReturnPercent: 0,
      growthChartData: [],
      duration: { days: 0, years: 0 },
      message: 'No investments were made in the selected period.'
    };
  }

  const currentValue = totalUnits * latestNav;
  cashflows.push({ amount: currentValue, date: new Date(latestNavData.date) });

  const absoluteProfit = currentValue - totalInvested;
  const absoluteReturnPercent = (absoluteProfit / totalInvested) * 100;
  const annualizedReturnPercent = calculateXIRR(cashflows); // already returns %

  // Duration
  const firstFlowDate = cashflows[0].date;
  const lastFlowDate = cashflows[cashflows.length - 1].date;
  const days = Math.round((lastFlowDate - firstFlowDate) / (1000 * 60 * 60 * 24));
  const years = days / 365.25;

  // Build growth chart data (value trajectory using actual NAV at each investment date & latest NAV for final point)
  const growthChartData = investmentEvents.map(ev => {
    return {
      date: ev.date,
      invested: ev.cumulativeInvested,
      value: ev.cumulativeUnits * ev.nav,
      nav: ev.nav
    };
  });
  // Append final mark-to-market point if last NAV date differs
  const lastEventDate = investmentEvents[investmentEvents.length - 1]?.date;
  if (lastEventDate && lastEventDate !== latestNavData.date) {
    growthChartData.push({
      date: latestNavData.date,
      invested: totalInvested,
      value: currentValue,
      nav: latestNav
    });
  }

  return {
    totalInvested: Math.round(totalInvested * 100) / 100,
    currentValue: Math.round(currentValue * 100) / 100,
    totalUnits: Math.round(totalUnits * 10000) / 10000,
    absoluteProfit: Math.round(absoluteProfit * 100) / 100,
    absoluteReturnPercent: Math.round(absoluteReturnPercent * 100) / 100,
    annualizedReturnPercent: annualizedReturnPercent ? Math.round(annualizedReturnPercent * 100) / 100 : null,
    growthChartData,
    duration: { days, years: Math.round(years * 100) / 100 }
  };
}

/**
 * Calculates the irregular rate of return (XIRR) for a series of cash flows.
 * @param {Array<Object>} cashflows - An array of objects with 'amount' and 'date' properties.
 * @returns {number} The XIRR as a percentage.
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
      result += amount * Math.pow(1 + guess, -days / 365);
      derivative += (-days / 365) * amount * Math.pow(1 + guess, (-days / 365) - 1);
    }

    const newGuess = guess - result / derivative;

    if (Math.abs(newGuess - guess) < tolerance) {
      return newGuess * 100;
    }
    guess = newGuess;
  }

  return NaN; // Failed to converge
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
  
  // Find the latest NAV on or before the target date (nearest earlier NAV)
  for (const nav of navHistory) {
    const navDate = new Date(nav.date);
    const navValue = parseFloat(nav.nav);
    
    // Skip invalid NAV values
    if (navValue <= 0 || isNaN(navValue)) continue;
    
    if (navDate <= targetDate) {
      closest = nav; // Keep updating to get the latest available
    } else {
      // We've passed the target date, stop searching
      break;
    }
  }
  
  return closest;
}
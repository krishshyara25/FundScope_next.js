// src/utils/commission.js

/**
 * Calculates the monthly commission and breakdown based on the current portfolio value.
 * Commission is 2% ANNUAL (0.1667% Monthly) of the portfolio value, split evenly
 * 4 ways (0.5% Annual / 0.04167% Monthly)
 * @param {number} portfolioValue - The current market value of the customer's portfolio.
 * @returns {Object} Commission calculation results.
 */
export function calculateMonthlyCommission(portfolioValue) {
    if (typeof portfolioValue !== 'number' || portfolioValue <= 0) {
        return {
            portfolioValue: 0,
            annualRate: 0.02,
            monthlyRate: 0.0016666667, // 2% / 12
            totalMonthly: 0,
            breakdown: {
                company: 0,
                admin: 0,
                seller: 0,
                mutualFund: 0
            }
        };
    }

    const ANNUAL_RATE = 0.02;           // 2% yearly
    const MONTHLY_RATE = ANNUAL_RATE / 12; // ~0.001667
    
    // Each stakeholder gets 0.5% annual / 12
    const SHARE_ANNUAL_RATE = 0.005;    
    const SHARE_MONTHLY_RATE = SHARE_ANNUAL_RATE / 12; // ~0.0004166667

    const totalMonthlyCommission = portfolioValue * MONTHLY_RATE;
    const shareAmount = portfolioValue * SHARE_MONTHLY_RATE;
    
    // Rounding to 4 decimal places for precision, although monetary display uses 2.
    const round = (num) => Math.round(num * 10000) / 10000;

    return {
        portfolioValue: round(portfolioValue),
        annualRate: ANNUAL_RATE,
        monthlyRate: MONTHLY_RATE,
        totalMonthly: round(totalMonthlyCommission),
        breakdown: {
            company: round(shareAmount),
            admin: round(shareAmount),
            seller: round(shareAmount),
            mutualFund: round(shareAmount)
        },
        // Annual projection field for dashboard display
        annualProjection: round(totalMonthlyCommission * 12) 
    };
}
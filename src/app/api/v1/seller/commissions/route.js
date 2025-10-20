// src/app/api/v1/seller/commissions/route.js
import { NextResponse } from 'next/server';
import { getMockUser, CURRENT_MOCK_USER_ID } from '@/lib/authMock';
import { calculateMonthlyCommission } from '@/utils/commission';

const REQUIRED_ROLES = ['seller', 'admin', 'company_head'];

/**
 * GET handler to fetch seller's commission data.
 * NOTE: Currently returns mock data calculated on a fixed AUM.
 */
export async function GET(request) {
    // --- RBAC CHECK ---
    const user = getMockUser(CURRENT_MOCK_USER_ID);
    if (!user || !REQUIRED_ROLES.includes(user.role)) {
        return NextResponse.json({ error: 'Access denied. Seller privileges required.' }, { status: 403 });
    }
    // ------------------
    
    // --- MOCK COMMISSION LOGIC ---
    // In a real application, this value would be aggregated from the 'virtual_portfolio' collection
    const MOCK_TOTAL_SELLER_AUM = 5000000; // Example: ₹50,00,000 AUM
    const MOCK_CUSTOMER_COUNT = 10;
    
    // Calculate commission breakdown using the utility function
    const calculation = calculateMonthlyCommission(MOCK_TOTAL_SELLER_AUM);
    
    // Extract the seller's share and round for display
    const sellerShareMonthly = calculation.breakdown.seller;
    const annualProjection = calculation.annualProjection;
    
    // Determine current period
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Simulate previous month's available date (5th of current month)
    const availableDate = new Date(currentYear, currentMonth - 1, 5);
    const withdrawalDate = availableDate.toISOString().split('T')[0];
    
    // Mock Historical Data (For dashboard chart/table)
    const mockHistorical = [
        { month: 8, year: 2025, aum: 4800000, earnings: calculateMonthlyCommission(4800000).breakdown.seller },
        { month: 9, year: 2025, aum: 4950000, earnings: calculateMonthlyCommission(4950000).breakdown.seller },
        { month: 10, year: 2025, aum: 5000000, earnings: sellerShareMonthly },
    ];
    // ----------------------------

    return NextResponse.json({
        success: true,
        user: { userId: user.userId, name: user.name, role: user.role },
        commissionData: {
            period: { month: currentMonth, year: currentYear },
            totalAUM: MOCK_TOTAL_SELLER_AUM,
            monthlyEarning: sellerShareMonthly, // Seller's share per month
            annualProjection: annualProjection,
            customerCount: MOCK_CUSTOMER_COUNT,
            status: "available", // Mocking as available on Day 5+
            withdrawalDate: withdrawalDate,
            historical: mockHistorical,
            rates: {
                annualRate: (calculation.annualRate * 100).toFixed(2) + '%',
                sellerShareAnnual: (calculation.annualRate / 4 * 100).toFixed(2) + '%'
            }
        }
    });
}
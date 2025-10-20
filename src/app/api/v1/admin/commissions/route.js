// src/app/api/v1/admin/commissions/route.js
import { NextResponse } from 'next/server';
import { getMockUser, CURRENT_MOCK_USER_ID } from '@/lib/authMock';
import { calculateMonthlyCommission } from '@/utils/commission';

const REQUIRED_ROLES = ['admin', 'company_head'];

/**
 * GET handler to fetch Admin's aggregated team commission data.
 * Mock data assumes total AUM and extracts the Admin's share.
 */
export async function GET(request) {
    // --- RBAC CHECK ---
    const user = getMockUser(CURRENT_MOCK_USER_ID);
    if (!user || !REQUIRED_ROLES.includes(user.role)) {
        return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }
    // ------------------

    // --- MOCK COMMISSION LOGIC ---
    // Mock scenario: Admin manages 4 sellers with a total AUM of 2.5 Crore.
    const MOCK_TOTAL_TEAM_AUM = 25000000; // ₹2.5 Crore AUM
    const MOCK_SELLER_COUNT = 4;
    
    // Calculate commission breakdown using the utility function
    const calculation = calculateMonthlyCommission(MOCK_TOTAL_TEAM_AUM);
    
    // Extract the Admin's share
    const adminShareMonthly = calculation.breakdown.admin;
    const annualProjection = calculation.annualProjection;
    
    // Determine current period for display
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Mock Historical Data (For dashboard chart/table)
    const mockHistorical = [
        { month: 8, year: 2025, aum: 23000000, earnings: calculateMonthlyCommission(23000000).breakdown.admin },
        { month: 9, year: 2025, aum: 24500000, earnings: calculateMonthlyCommission(24500000).breakdown.admin },
        { month: 10, year: 2025, aum: MOCK_TOTAL_TEAM_AUM, earnings: adminShareMonthly },
    ];
    // ----------------------------

    return NextResponse.json({
        success: true,
        user: { userId: user.userId, name: user.name, role: user.role },
        commissionData: {
            period: { month: currentMonth, year: currentYear },
            totalTeamAUM: MOCK_TOTAL_TEAM_AUM,
            monthlyEarning: adminShareMonthly, // Admin's share per month
            annualProjection: annualProjection,
            sellerCount: MOCK_SELLER_COUNT,
            status: "available",
            rates: {
                annualRate: (calculation.annualRate * 100).toFixed(2) + '%',
                adminShareAnnual: (calculation.annualRate / 4 * 100).toFixed(2) + '%'
            }
        },
        historical: mockHistorical
    });
}
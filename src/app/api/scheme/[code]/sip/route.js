// src/app/api/scheme/[code]/sip/route.js
import { NextResponse } from 'next/server';
import { getOrSetCache } from '@/lib/cache';
import { calculateSIPReturns } from '@/utils/calculator'; // Correctly import the function

const MF_API_URL = 'https://api.mfapi.in/mf';
const CACHE_TTL_SECONDS = 12 * 60 * 60; // 12 hours

export async function POST(request, { params }) {
  const { code } = params;
  const { amount, from, to } = await request.json();

  const url = `${MF_API_URL}/${code}`;
  
  try {
    const data = await getOrSetCache(`scheme-${code}`, async () => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Scheme not found.');
        return await response.json();
    }, CACHE_TTL_SECONDS);

    const navHistory = data.data;
    if (!navHistory || navHistory.length === 0) {
      return NextResponse.json({ error: 'No NAV data available for the scheme.' }, { status: 404 });
    }

    // Call the robust calculation logic
    const results = calculateSIPReturns({ navHistory, amount, from, to });

    // FIX: Passing the monetary profit value (absoluteProfit) and correcting annualized return name
    return NextResponse.json({
      totalInvested: results.totalInvested,
      currentValue: results.currentValue,
      totalUnits: results.totalUnits,
      absoluteProfit: results.absoluteProfit, // FIX: Monetary Profit value
      absoluteReturnPercent: results.absoluteReturnPercent, // Percentage value
      annualizedReturn: results.annualizedReturn, // XIRR-based (now correctly named)
      growthChartData: results.growthChartData, 
      duration: results.duration
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'SIP calculation failed' }, { status: 500 });
  }
}
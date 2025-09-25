import { NextResponse } from 'next/server';
import { getOrSetCache } from '@/lib/cache';
import { calculateReturns } from '@/utils/calculator'; // Using the path alias

const MF_API_URL = 'https://api.mfapi.in/mf';
const CACHE_TTL_SECONDS = 12 * 60 * 60; // 12 hours

export async function GET(request, { params }) {
  const { code } = params;
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const url = `${MF_API_URL}/${code}`;

  try {
    const data = await getOrSetCache(`scheme-${code}`, async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Scheme not found.');
      return await response.json();
    }, CACHE_TTL_SECONDS);

    const navHistory = data.data;

    if (!navHistory || navHistory.length === 0) {
      return NextResponse.json({ error: 'No NAV data available.' }, { status: 404 });
    }

    const returns = calculateReturns({ navHistory, period, from, to });

    return NextResponse.json(returns);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
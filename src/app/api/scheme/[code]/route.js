// src/app/api/scheme/[code]/route.js
import { NextResponse } from 'next/server';
import { getOrSetCache } from '@/lib/cache';
import { guardedApi } from '@/lib/apiGuard';

const MF_API_URL = 'https://api.mfapi.in/mf';
const CACHE_TTL_SECONDS = 12 * 60 * 60; // 12 hours

export async function GET(request, { params }) {
  const { code } = await params;
  const url = `${MF_API_URL}/${code}`;
  return guardedApi({ request, ratePolicy: 'default', handler: async () => {
    const data = await getOrSetCache(`scheme-${code}`, async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Scheme not found.');
      return await response.json();
    }, CACHE_TTL_SECONDS);
    return data;
  }});
}
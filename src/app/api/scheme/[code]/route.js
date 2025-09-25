// src/app/api/scheme/[code]/route.js
import { NextResponse } from 'next/server';
import { getOrSetCache } from '@/lib/cache';

const MF_API_URL = 'https://api.mfapi.in/mf';
const CACHE_TTL_SECONDS = 12 * 60 * 60; // 12 hours

export async function GET(request, { params }) {
  const { code } = await params;
  const url = `${MF_API_URL}/${code}`;

  try {
    const data = await getOrSetCache(`scheme-${code}`, async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Scheme not found.');
      }
      const jsonData = await response.json();
      return jsonData;
    }, CACHE_TTL_SECONDS);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}
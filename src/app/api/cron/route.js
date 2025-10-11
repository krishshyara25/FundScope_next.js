// src/app/api/cron/route.js

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb'; 
import { deleteCache } from '@/lib/cache'; 

// --- MongoDB Write Logic ---
async function updateMasterFundListInDB(data) {
    const db = await getDb();
    
    // Writes the entire array of active funds to a single document in MongoDB
    const result = await db.collection("master_data").updateOne(
        { _id: 'all_active_schemes' },
        { $set: { data: data, lastUpdated: new Date() } },
        { upsert: true }
    );
    return result;
}

// --- Data Fetch and Cleaning Logic ---
const MF_API_URL = 'https://api.mfapi.in/mf';

// CRITICAL: Active Fund Logic (Checks for ISINs)
function isSchemeActive(scheme) {
  // Fund active tab mana jayega jab isin_growth ya isin_div_reinvestment me se koi ek value ho
  return !!scheme.isin_growth || !!scheme.isin_div_reinvestment; 
}

function extractFundHouse(schemeName) {
  if (!schemeName) return 'Unknown Fund House';
  const fundHousePatterns = [
    /^(Aditya Birla|ABSL)/i, /^(Axis|Axis Mutual Fund)/i, /^(HDFC|HDFC Mutual Fund)/i, /^(ICICI|ICICI Prudential)/i,
    /^(SBI|SBI Mutual Fund)/i, /^(Kotak|Kotak Mahindra)/i, /^(Reliance|Reliance Mutual Fund)/i, /^(UTI|UTI Mutual Fund)/i,
    /^(DSP|DSP BlackRock)/i, /^(Franklin|Franklin Templeton)/i, /^(Birla|Birla Sun Life)/i, /^(Tata|Tata Mutual Fund)/i,
    /^(L&T|Larsen & Toubro)/i, /^(Nippon|Nippon India)/i, /^(Mirae|Mirae Asset)/i, /^(Invesco)/i, /^(PGIM)/i,
    /^(Edelweiss)/i, /^(Mahindra)/i, /^(JM|JM Financial)/i, /^(Sundaram)/i, /^(Principal)/i, /^(IDFC)/i,
    /^(Canara)/i, /^(Quantum)/i, /^(Grindlays)/i, /^(Bharti)/i, /^(Bank of India)/i, /^(Union KBC)/i, /^(HSBC)/i
  ];
  for (const pattern of fundHousePatterns) {
    const match = schemeName.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }
  const words = schemeName.split(' ');
  if (words.length >= 2) {
    return words.slice(0, 2).join(' ');
  }
  return words[0] || 'Unknown Fund House';
}

function extractCategory(schemeName) {
  if (!schemeName) return 'Unknown Category';
  const nameUpper = schemeName.toUpperCase();
  if (nameUpper.includes('EQUITY') || nameUpper.includes('GROWTH') || nameUpper.includes('STOCK')) {
    if (nameUpper.includes('LARGE CAP') || nameUpper.includes('BLUE CHIP')) return 'Large Cap Fund';
    if (nameUpper.includes('MID CAP') || nameUpper.includes('MIDCAP')) return 'Mid Cap Fund';
    if (nameUpper.includes('SMALL CAP') || nameUpper.includes('SMALLCAP')) return 'Small Cap Fund';
    if (nameUpper.includes('MULTI CAP') || nameUpper.includes('MULTICAP') || nameUpper.includes('FLEXI CAP')) return 'Multi Cap Fund';
    return 'Equity Fund';
  }
  if (nameUpper.includes('DEBT') || nameUpper.includes('BOND') || nameUpper.includes('INCOME')) return 'Debt Fund';
  if (nameUpper.includes('HYBRID') || nameUpper.includes('BALANCED')) return 'Hybrid Fund';
  if (nameUpper.includes('TAX') || nameUpper.includes('ELSS')) return 'ELSS';
  if (nameUpper.includes('LIQUID') || nameUpper.includes('MONEY MARKET')) return 'Liquid Fund';
  if (nameUpper.includes('INDEX') || nameUpper.includes('ETF')) return 'Index Fund';
  if (nameUpper.includes('INTERNATIONAL') || nameUpper.includes('GLOBAL') || nameUpper.includes('OVERSEAS')) return 'International Fund';
  if (nameUpper.includes('SECTORAL') || nameUpper.includes('BANKING') || nameUpper.includes('PHARMA') || nameUpper.includes('IT') || nameUpper.includes('INFRASTRUCTURE')) return 'Sectoral Fund';
  return 'Other';
}


async function fetchAndCleanData() {
    const response = await fetch(MF_API_URL);
    if (!response.ok) {
        throw new Error('Failed to fetch schemes from MFAPI.in');
    }
    const rawData = await response.json();
    
    // Transform, categorize, and filter inactive schemes
    const transformedData = rawData.map(scheme => {
        const schemeName = scheme.schemeName || '';
        const fundHouse = extractFundHouse(schemeName);
        const category = extractCategory(schemeName);
        
        return {
            scheme_code: scheme.schemeCode,
            scheme_name: schemeName,
            // Storing ISIN values from raw API response (camelCase)
            isin_growth: scheme.isinGrowth || null, 
            isin_div_reinvestment: scheme.isinDivReinvestment || null,
            meta: {
                fund_house: fundHouse,
                scheme_category: category
            }
        };
    });

    // Filtering to keep only Active Funds based on ISIN presence
    return transformedData.filter(isSchemeActive); // <-- Yahan sirf Active funds jayenge
}

const CRON_SECRET = process.env.CRON_SECRET || 'dev-cron-secret'; 

export async function GET(request) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    console.log('CRON JOB: Starting data fetch and MongoDB update.');

    // 1. Fetch fresh data from the external source and clean it
    const freshData = await fetchAndCleanData();

    // 2. Store the full, fresh dataset of *active funds* into MongoDB
    const dbUpdateResult = await updateMasterFundListInDB(freshData);

    console.log(`CRON JOB: MongoDB updated with ${freshData.length} active schemes. (Matched: ${dbUpdateResult.matchedCount}, Upserted: ${dbUpdateResult.upsertedCount})`);

    // 3. Clear the local memory cache (if any exists)
    deleteCache('all-schemes');

    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB updated successfully.',
      storedCount: freshData.length,
    });
  } catch (error) {
    console.error('CRON JOB ERROR:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Database update failed.',
      details: error.message 
    }, { status: 500 });
  }
}
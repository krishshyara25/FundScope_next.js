// src/app/api/mf/route.js
import { NextResponse } from 'next/server';
import { getOrSetCache } from '@/lib/cache';
import { guardedApi } from '@/lib/apiGuard';
import { getDb } from '@/lib/mongodb'; // MongoDB se read karne ke liye

const MF_API_URL = 'https://api.mfapi.in/mf';
const CACHE_TTL_SECONDS = 12 * 60 * 60; // 12 hours

// Function to read the master fund list from MongoDB
async function getMasterFundListFromDB() {
    try {
        const db = await getDb();
        // Reads the single document storing the entire list of *active funds*
        const masterDoc = await db.collection("master_data").findOne({ _id: 'all_active_schemes' }); 
        return masterDoc ? masterDoc.data : [];
    } catch (error) {
        console.error("MongoDB read error in /api/mf:", error);
        return []; 
    }
}


// CRITICAL: isSchemeActive checks for ISINs (used for all filtering logic)
function isSchemeActive(scheme) {
  return !!scheme.isin_growth || !!scheme.isin_div_reinvestment;
}

// Helper function to extract fund house from scheme name
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

// Helper function to extract category from scheme name
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


export async function GET(request) {
  return guardedApi({ request, ratePolicy: 'default', handler: async () => {
    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const fundHouse = searchParams.get('fundHouse') || '';
    const statusFilter = searchParams.get('status') || 'active'; 
    
    
    // Logic to fetch data: Priority 1: MongoDB (for active list), Priority 2: Cache/External API (for raw list)
    let fundsToFilter;

    if (statusFilter === 'active') {
        // Option 1: Agar active funds chahiye, toh MongoDB se uthao (jo CRON se daily update hua hai)
        fundsToFilter = await getMasterFundListFromDB();
    } else {
        // Option 2: Agar inactive ya sab funds chahiye, toh hume poora raw list chahiye.
        // Ise hum cache/API se uthayenge aur filter karenge.
        const fetchAllSchemesRaw = async () => {
             const response = await fetch(MF_API_URL);
             if (!response.ok) {
                throw new Error('Failed to fetch schemes from MFAPI.in');
             }
             const rawData = await response.json();
             
             // Hum yahan ISINs ke saath poora raw data return kar rahe hain (active + inactive)
             return rawData.map(scheme => ({
                scheme_code: scheme.schemeCode,
                scheme_name: scheme.schemeName || '',
                isin_growth: scheme.isinGrowth || null, 
                isin_div_reinvestment: scheme.isinDivReinvestment || null,
                meta: {
                    fund_house: extractFundHouse(scheme.schemeName),
                    scheme_category: extractCategory(scheme.schemeName)
                }
            }));
        };
        // Fetch the complete list (active + inactive) from cache/API
        fundsToFilter = await getOrSetCache('all-schemes-raw', fetchAllSchemesRaw, CACHE_TTL_SECONDS);

        // Filter the raw data based on the status requested
        if (statusFilter === 'inactive') {
            fundsToFilter = fundsToFilter.filter(scheme => !isSchemeActive(scheme));
        }
        // If statusFilter is 'all', fundsToFilter mein sab kuch hai.
    }

    
    // Apply filters (search, category, fundHouse) to the filtered set
    let filteredData = fundsToFilter;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter(scheme => 
        (scheme.scheme_name || '').toLowerCase().includes(searchLower) ||
        (scheme.meta?.fund_house || '').toLowerCase().includes(searchLower)
      );
    }

    if (category && category !== 'all') {
      filteredData = filteredData.filter(scheme => 
        scheme.meta?.scheme_category === category
      );
    }

    if (fundHouse && fundHouse !== 'all') {
      filteredData = filteredData.filter(scheme => 
        scheme.meta?.fund_house === fundHouse
      );
    }

    // Agar limit poore data se bada hai, toh poora data return karo
    if (!search && !category && !fundHouse && limit >= filteredData.length) {
      return NextResponse.json(filteredData);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedData = filteredData.slice(startIndex, startIndex + limit);

    // Return paginated response with metadata
    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / limit),
        hasMore: startIndex + limit < filteredData.length
      }
    };
  }});
}
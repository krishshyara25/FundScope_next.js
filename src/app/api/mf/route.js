// src/app/api/mf/route.js
import { NextResponse } from 'next/server';
import { getOrSetCache } from '@/lib/cache';

const MF_API_URL = 'https://api.mfapi.in/mf';
const CACHE_TTL_SECONDS = 12 * 60 * 60; // 12 hours

export async function GET(request) {
  try {
    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const fundHouse = searchParams.get('fundHouse') || '';
    
    // Get all data from cache or API
    const allData = await getOrSetCache('all-schemes', async () => {
      const response = await fetch(MF_API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch schemes from MFAPI.in');
      }
      const rawData = await response.json();
      
      // Transform and normalize the data
      return rawData.map(scheme => {
        // Extract fund house from scheme name (basic approach)
        const schemeName = scheme.schemeName || '';
        const fundHouse = extractFundHouse(schemeName);
        const category = extractCategory(schemeName);
        
        return {
          scheme_code: scheme.schemeCode,
          scheme_name: schemeName,
          meta: {
            fund_house: fundHouse,
            scheme_category: category
          }
        };
      });
    }, CACHE_TTL_SECONDS);

// Helper function to extract fund house from scheme name
function extractFundHouse(schemeName) {
  if (!schemeName) return 'Unknown Fund House';
  
  // Common fund house patterns
  const fundHousePatterns = [
    /^(Aditya Birla|ABSL)/i,
    /^(Axis|Axis Mutual Fund)/i,
    /^(HDFC|HDFC Mutual Fund)/i,
    /^(ICICI|ICICI Prudential)/i,
    /^(SBI|SBI Mutual Fund)/i,
    /^(Kotak|Kotak Mahindra)/i,
    /^(Reliance|Reliance Mutual Fund)/i,
    /^(UTI|UTI Mutual Fund)/i,
    /^(DSP|DSP BlackRock)/i,
    /^(Franklin|Franklin Templeton)/i,
    /^(Birla|Birla Sun Life)/i,
    /^(Tata|Tata Mutual Fund)/i,
    /^(L&T|Larsen & Toubro)/i,
    /^(Nippon|Nippon India)/i,
    /^(Mirae|Mirae Asset)/i,
    /^(Invesco)/i,
    /^(PGIM)/i,
    /^(Edelweiss)/i,
    /^(Mahindra)/i,
    /^(JM|JM Financial)/i,
    /^(Sundaram)/i,
    /^(Principal)/i,
    /^(IDFC)/i,
    /^(Canara)/i,
    /^(Quantum)/i,
    /^(Grindlays)/i,
    /^(Bharti)/i,
    /^(Bank of India)/i,
    /^(Union KBC)/i,
    /^(HSBC)/i
  ];
  
  for (const pattern of fundHousePatterns) {
    const match = schemeName.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }
  
  // Fallback: take the first few words
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
  
  // Category patterns
  if (nameUpper.includes('EQUITY') || nameUpper.includes('GROWTH') || nameUpper.includes('STOCK')) {
    if (nameUpper.includes('LARGE CAP') || nameUpper.includes('BLUE CHIP')) return 'Large Cap Fund';
    if (nameUpper.includes('MID CAP') || nameUpper.includes('MIDCAP')) return 'Mid Cap Fund';
    if (nameUpper.includes('SMALL CAP') || nameUpper.includes('SMALLCAP')) return 'Small Cap Fund';
    if (nameUpper.includes('MULTI CAP') || nameUpper.includes('MULTICAP') || nameUpper.includes('FLEXI CAP')) return 'Multi Cap Fund';
    return 'Equity Fund';
  }
  
  if (nameUpper.includes('DEBT') || nameUpper.includes('BOND') || nameUpper.includes('INCOME')) {
    return 'Debt Fund';
  }
  
  if (nameUpper.includes('HYBRID') || nameUpper.includes('BALANCED')) {
    return 'Hybrid Fund';
  }
  
  if (nameUpper.includes('TAX') || nameUpper.includes('ELSS')) {
    return 'ELSS';
  }
  
  if (nameUpper.includes('LIQUID') || nameUpper.includes('MONEY MARKET')) {
    return 'Liquid Fund';
  }
  
  if (nameUpper.includes('INDEX') || nameUpper.includes('ETF')) {
    return 'Index Fund';
  }
  
  if (nameUpper.includes('INTERNATIONAL') || nameUpper.includes('GLOBAL') || nameUpper.includes('OVERSEAS')) {
    return 'International Fund';
  }
  
  if (nameUpper.includes('SECTORAL') || nameUpper.includes('BANKING') || nameUpper.includes('PHARMA') || nameUpper.includes('IT') || nameUpper.includes('INFRASTRUCTURE')) {
    return 'Sectoral Fund';
  }
  
  return 'Other';
}

    // If no filters and requesting all data (limit >= all data length), return all data directly
    if (!search && !category && !fundHouse && limit >= allData.length) {
      return NextResponse.json(allData);
    }

    // Apply filters
    let filteredData = allData;
    
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

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedData = filteredData.slice(startIndex, startIndex + limit);

    // Return paginated response with metadata
    return NextResponse.json({
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / limit),
        hasMore: startIndex + limit < filteredData.length
      }
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
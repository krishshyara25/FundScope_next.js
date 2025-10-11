// src/app/api/watchlist/route.js
import { NextResponse } from 'next/server';
import { guardedApi } from '@/lib/apiGuard';

// --- MOCKED DATABASE SIMULATION ---
// IMPORTANT: Yeh data abhi memory mein store ho raha hai. Isko MongoDB se replace karna hoga.
let MOCKED_WATCHLIST = [
    { scheme_code: "100027", scheme_name: "Grindlays Super Saver Income Fund-GSSIF-Half Yearly Dividend" },
    { scheme_code: "100030", scheme_name: "UTI-Mahindra Mutual Fund - UTI-Mahindra Mutual Fund" },
];
// ----------------------------------

// MOCK DB FUNCTIONS
async function getWatchlistFromDB() {
    await new Promise(resolve => setTimeout(resolve, 50));
    return MOCKED_WATCHLIST;
}

async function addToWatchlistDB(schemeCode, schemeName) {
    if (!MOCKED_WATCHLIST.some(item => item.scheme_code === schemeCode)) {
        MOCKED_WATCHLIST.push({ scheme_code: schemeCode, scheme_name: schemeName });
        return true;
    }
    return false;
}

async function removeFromWatchlistDB(schemeCode) {
    const initialLength = MOCKED_WATCHLIST.length;
    MOCKED_WATCHLIST = MOCKED_WATCHLIST.filter(item => item.scheme_code !== schemeCode);
    return MOCKED_WATCHLIST.length < initialLength;
}
// ----------------------------------


// GET: Fetch the current watchlist
export async function GET(request) {
    return guardedApi({ request, ratePolicy: 'burst', handler: async () => {
        const watchlist = await getWatchlistFromDB();
        return { watchlist };
    }});
}

// POST: Add a scheme to the watchlist
export async function POST(request) {
    return guardedApi({ request, ratePolicy: 'burst', handler: async () => {
        const { scheme_code, scheme_name } = await request.json();

        if (!scheme_code || !scheme_name) {
            return NextResponse.json({ error: "Missing scheme_code or scheme_name." }, { status: 400 });
        }

        const added = await addToWatchlistDB(scheme_code, scheme_name);

        return NextResponse.json({ 
            success: added,
            message: added ? "Fund added to watchlist." : "Fund already in watchlist."
        }, { status: added ? 200 : 202 });
    }});
}

// DELETE: Remove a scheme from the watchlist
export async function DELETE(request) {
    return guardedApi({ request, ratePolicy: 'burst', handler: async () => {
        const { scheme_code } = await request.json();

        if (!scheme_code) {
            return NextResponse.json({ error: "Missing scheme_code." }, { status: 400 });
        }

        const removed = await removeFromWatchlistDB(scheme_code);

        return NextResponse.json({ 
            success: removed,
            message: removed ? "Fund removed from watchlist." : "Fund not found in watchlist."
        }, { status: removed ? 200 : 404 });
    }});
}
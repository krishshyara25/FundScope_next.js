// src/app/api/watchlist/route.js
import { NextResponse } from 'next/server';
import { guardedApi } from '@/lib/apiGuard';
import { getDb } from '@/lib/mongodb'; // MongoDB connection utility import kiya gaya

// Fixed User Identifier: Authentication na hone ke kaaran, hum default_user use kar rahe hain
const USER_ID = 'default_user'; 
const WATCHLIST_COLLECTION = 'watchlist';


// MONGODB DB FUNCTIONS (Actual Implementation)

/**
 * MongoDB se current user ka watchlist array fetch karta hai.
 */
async function getWatchlistFromDB() {
    try {
        const db = await getDb();
        const doc = await db.collection(WATCHLIST_COLLECTION).findOne({ user_id: USER_ID });
        // Document mein schemes array ko return karta hai
        return doc?.schemes || []; 
    } catch (e) {
        console.error("MongoDB Watchlist GET Error:", e);
        return [];
    }
}

/**
 * Watchlist mein naya fund add karta hai (using $addToSet to avoid duplicates).
 */
async function addToWatchlistDB(schemeCode, schemeName) {
    try {
        const db = await getDb();
        const result = await db.collection(WATCHLIST_COLLECTION).updateOne(
            { user_id: USER_ID },
            { 
                $addToSet: { 
                    schemes: { scheme_code: schemeCode, scheme_name: schemeName } 
                } 
            },
            { upsert: true } // Agar user ka document exist nahi karta, toh naya bana dega
        );
        // Agar naya document bana ya koi item add hua, toh success
        return result.modifiedCount > 0 || result.upsertedCount > 0;
    } catch (e) {
        console.error("MongoDB Watchlist POST Error:", e);
        return false;
    }
}

/**
 * Watchlist se fund ko hatata hai (using $pull).
 */
async function removeFromWatchlistDB(schemeCode) {
    try {
        const db = await getDb();
        const result = await db.collection(WATCHLIST_COLLECTION).updateOne(
            { user_id: USER_ID },
            { $pull: { schemes: { scheme_code: schemeCode } } } // Schemes array se item ko hatana
        );
        // Agar koi document modify hua hai (item remove hua), toh success
        return result.modifiedCount > 0;
    } catch (e) {
        console.error("MongoDB Watchlist DELETE Error:", e);
        return false;
    }
}


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
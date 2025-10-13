// src/app/api/virtual-portfolio/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb'; // MongoDB connection utility
import { guardedApi } from '@/lib/apiGuard';
// NOTE: calculateSIPReturns is imported in POST to ensure initial data is calculated correctly.

const PORTFOLIO_COLLECTION = 'virtual_portfolio';
const MOCK_USER_ID = 'virtual_user_1'; 

// GET: Retrieve user's virtual SIPs
export async function GET() {
    try {
        const db = await getDb();
        const portfolioDoc = await db.collection(PORTFOLIO_COLLECTION).findOne({ user_id: MOCK_USER_ID });
        
        // Return the array of SIPs
        return NextResponse.json(portfolioDoc?.sips || []);
    } catch (error) {
        console.error("Virtual Portfolio GET error:", error);
        return NextResponse.json({ error: 'Failed to retrieve virtual portfolio.' }, { status: 500 });
    }
}

// POST: Create a new virtual SIP entry
export async function POST(request) {
    try {
        const { schemeCode, schemeName, amount, from, to } = await request.json();
        
        if (!schemeCode || !schemeName || !amount || !from || !to) {
            return NextResponse.json({ error: 'Missing required investment parameters.' }, { status: 400 });
        }
        
        // Step 1: Run full SIP calculation simulation (using scheme details API internally)
        // Hum SIP calculation ke liye internal API ko call kar rahe hain
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const sipApiRes = await fetch(`${baseUrl}/api/scheme/${schemeCode}/sip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, from, to }),
        });
        
        if (!sipApiRes.ok) {
            const errorData = await sipApiRes.json();
            return NextResponse.json({ error: errorData.error || 'SIP simulation failed for this scheme.' }, { status: 400 });
        }
        
        const simulationData = await sipApiRes.json();
        
        // Step 2: Create the persistent entry (only essential data)
        const newVirtualSIP = {
            schemeCode: String(schemeCode),
            schemeName: schemeName,
            amount: amount,
            startDate: from,
            endDate: to,
            dateAdded: new Date(),
            // Store results to track performance against initial investment
            initialTotalInvested: simulationData.totalInvested,
            initialTotalUnits: simulationData.totalUnits,
            // ObjectId is ideal for sipId, but for simple MVP, we use a string hash/timestamp
            sipId: Date.now().toString() + schemeCode 
        };

        // Step 3: Store in MongoDB
        const db = await getDb();
        const result = await db.collection(PORTFOLIO_COLLECTION).updateOne(
            { user_id: MOCK_USER_ID },
            { 
                $addToSet: { sips: newVirtualSIP }, 
                $set: { lastUpdated: new Date() }
            },
            { upsert: true }
        );

        return NextResponse.json({ 
            success: true, 
            message: 'Virtual SIP successfully created and added to portfolio.',
            newSip: newVirtualSIP
        });

    } catch (error) {
        console.error("Virtual Portfolio POST error:", error);
        return NextResponse.json({ error: 'Failed to create virtual SIP.' }, { status: 500 });
    }
}

// DELETE: Remove a virtual SIP entry
export async function DELETE(request) {
    try {
        const { sipId } = await request.json();
        
        if (!sipId) {
            return NextResponse.json({ error: 'SIP ID is required for deletion.' }, { status: 400 });
        }

        const db = await getDb();
        
        const result = await db.collection(PORTFOLIO_COLLECTION).updateOne(
            { user_id: MOCK_USER_ID },
            { 
                $pull: { sips: { sipId: sipId } } // Deleting by sipId
            }
        );

        return NextResponse.json({ 
            success: result.modifiedCount > 0, 
            message: 'Virtual SIP removed successfully.'
        });

    } catch (error) {
        console.error("Virtual Portfolio DELETE error:", error);
        return NextResponse.json({ error: 'Failed to delete virtual SIP.' }, { status: 500 });
    }
}
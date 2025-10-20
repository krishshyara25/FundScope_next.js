// src/app/api/v1/customer/portfolio/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb'; 
import { guardedApi } from '@/lib/apiGuard';
import { getMockUser, CURRENT_MOCK_USER_ID } from '@/lib/authMock'; 

const PORTFOLIO_COLLECTION = 'virtual_portfolio';
const INITIAL_CREDIT = 500000; // Rs 5 Lakh initial credit

// --- HELPER FUNCTION ---
async function simulateCurrentPerformance(schemeCode, units) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const navRes = await fetch(`${baseUrl}/api/scheme/${schemeCode}`);
    if (!navRes.ok) throw new Error('Failed to fetch latest NAV');
    const navData = await navRes.json();
    
    const latestNav = parseFloat(navData.data[0]?.nav);
    if (isNaN(latestNav) || latestNav <= 0) throw new Error('Invalid or zero latest NAV');

    const currentValue = units * latestNav;
    return { currentValue, latestNav };
}
// --- END HELPER FUNCTION ---


// GET: Retrieve user's virtual SIPs and Credit
export async function GET(request) {
    // --- RBAC CHECK (NEW) ---
    const user = getMockUser(CURRENT_MOCK_USER_ID);
    if (!user || (user.role !== 'customer_premium' && user.role !== 'seller' && user.role !== 'admin' && user.role !== 'company_head')) {
        // Allowing access for premium customer and all higher roles
        return NextResponse.json({ error: 'Access denied. Virtual Portfolio requires Premium access.' }, { status: 403 });
    }
    const USER_ID = user.userId;
    // ------------------
    
    try {
        const db = await getDb();
        let portfolioDoc = await db.collection(PORTFOLIO_COLLECTION).findOne({ user_id: USER_ID }); 
        
        // Initialize credit if the document is new or credit field is missing
        if (!portfolioDoc) {
            portfolioDoc = { 
                user_id: USER_ID, 
                credit_balance: INITIAL_CREDIT, 
                initial_credit: INITIAL_CREDIT,
                sips: [] 
            };
            await db.collection(PORTFOLIO_COLLECTION).insertOne(portfolioDoc);
        } else if (portfolioDoc.credit_balance === undefined) {
             await db.collection(PORTFOLIO_COLLECTION).updateOne(
                { user_id: USER_ID },
                { $set: { credit_balance: INITIAL_CREDIT, initial_credit: INITIAL_CREDIT } }
            );
            portfolioDoc.credit_balance = INITIAL_CREDIT;
            portfolioDoc.initial_credit = INITIAL_CREDIT;
        }


        // Return the array of SIPs and the current balance
        return NextResponse.json({
            sips: portfolioDoc?.sips || [],
            credit: {
                currentBalance: portfolioDoc.credit_balance,
                initialCredit: portfolioDoc.initial_credit,
            }
        });
    } catch (error) {
        console.error("Virtual Portfolio GET error:", error);
        return NextResponse.json({ error: 'Failed to retrieve virtual portfolio.' }, { status: 500 });
    }
}

// POST: Create a new virtual SIP entry (Debit Credit)
export async function POST(request) {
    // --- RBAC CHECK (NEW) ---
    const user = getMockUser(CURRENT_MOCK_USER_ID);
    if (!user || (user.role !== 'customer_premium' && user.role !== 'seller' && user.role !== 'admin' && user.role !== 'company_head')) {
        return NextResponse.json({ error: 'Access denied. Virtual Portfolio requires Premium access.' }, { status: 403 });
    }
    const USER_ID = user.userId;
    // ------------------
    
    try {
        const { schemeCode, schemeName, amount, from, to } = await request.json();
        
        if (!schemeCode || !schemeName || !amount || !from || !to || amount <= 0) {
            return NextResponse.json({ error: 'Missing or invalid investment parameters.' }, { status: 400 });
        }
        
        // Step 1: Run full SIP calculation simulation (using scheme details API internally)
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
        const totalInvested = simulationData.totalInvested;
        
        // Step 2: Check Credit Balance and Deduct
        const db = await getDb();
        const portfolioDoc = await db.collection(PORTFOLIO_COLLECTION).findOne({ user_id: USER_ID });
        const currentBalance = portfolioDoc?.credit_balance || INITIAL_CREDIT; 

        if (currentBalance < totalInvested) {
             return NextResponse.json({ 
                error: `Insufficient virtual credit. Required: ₹${totalInvested.toLocaleString('en-IN')}, Available: ₹${Math.round(currentBalance).toLocaleString('en-IN')}` 
            }, { status: 403 });
        }

        // Step 3: Create the persistent entry (only essential data)
        const newVirtualSIP = {
            schemeCode: String(schemeCode),
            schemeName: schemeName,
            amount: amount,
            startDate: from,
            endDate: to,
            dateAdded: new Date(),
            // Store results to track performance against initial investment
            initialTotalInvested: totalInvested,
            initialTotalUnits: simulationData.totalUnits,
            // ObjectId is ideal for sipId, but for simple MVP, we use a string hash/timestamp
            sipId: Date.now().toString() + schemeCode 
        };

        // Step 4: Store SIP and DEBIT credit in MongoDB
        const result = await db.collection(PORTFOLIO_COLLECTION).updateOne(
            { user_id: USER_ID, credit_balance: { $gte: totalInvested } }, // Safety check for concurrent updates
            { 
                $addToSet: { sips: newVirtualSIP }, 
                $inc: { credit_balance: -totalInvested }, // DEBIT credit
                $set: { lastUpdated: new Date() }
            }
        );

        if (result.modifiedCount === 0 && result.upsertedCount === 0) {
             // If update failed (likely due to credit check failure race condition)
             return NextResponse.json({ error: 'Transaction failed (Credit check error). Try again.' }, { status: 500 });
        }


        return NextResponse.json({ 
            success: true, 
            message: 'Virtual SIP successfully created and credit debited.',
            newSip: newVirtualSIP,
            newBalance: currentBalance - totalInvested // approximate
        });

    } catch (error) {
        console.error("Virtual Portfolio POST error:", error);
        return NextResponse.json({ error: error.message || 'Failed to create virtual SIP.' }, { status: 500 });
    }
}

// DELETE: Remove a virtual SIP entry (Credit back with profit/loss)
export async function DELETE(request) {
    // --- RBAC CHECK (NEW) ---
    const user = getMockUser(CURRENT_MOCK_USER_ID);
    if (!user || (user.role !== 'customer_premium' && user.role !== 'seller' && user.role !== 'admin' && user.role !== 'company_head')) {
        return NextResponse.json({ error: 'Access denied. Virtual Portfolio requires Premium access.' }, { status: 403 });
    }
    const USER_ID = user.userId;
    // ------------------
    
    try {
        const { sipId } = await request.json();
        
        if (!sipId) {
            return NextResponse.json({ error: 'SIP ID is required for deletion.' }, { status: 400 });
        }

        const db = await getDb();
        const portfolioDoc = await db.collection(PORTFOLIO_COLLECTION).findOne({ user_id: USER_ID });
        const sipToDelete = portfolioDoc.sips.find(sip => sip.sipId === sipId);

        if (!sipToDelete) {
             return NextResponse.json({ success: false, message: 'SIP not found in portfolio.' }, { status: 404 });
        }

        // Step 1: Simulate the current value (Redemption amount)
        const { currentValue } = await simulateCurrentPerformance(
            sipToDelete.schemeCode, 
            sipToDelete.initialTotalUnits
        );
        const creditToAdd = Math.round(currentValue);
        
        // Step 2: Remove SIP and CREDIT the current value in MongoDB
        const result = await db.collection(PORTFOLIO_COLLECTION).updateOne(
            { user_id: USER_ID },
            { 
                $pull: { sips: { sipId: sipId } }, // Deleting by sipId
                $inc: { credit_balance: creditToAdd }, // CREDIT current value (including profit/loss)
                $set: { lastUpdated: new Date() }
            }
        );

        if (result.modifiedCount === 0) {
             return NextResponse.json({ success: false, message: 'SIP not found or failed to update portfolio.' }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            message: `Virtual SIP sold. ₹${creditToAdd.toLocaleString('en-IN')} credited back to balance.`,
            amountCredited: creditToAdd
        });

    } catch (error) {
        console.error("Virtual Portfolio DELETE error:", error);
        return NextResponse.json({ error: error.message || 'Failed to delete virtual SIP.' }, { status: 500 });
    }
}
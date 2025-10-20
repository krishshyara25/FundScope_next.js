// src/lib/authMock.js (Updated structure with Company Head role)

// Mock User Database for RBAC testing
const MOCK_USER_DB = {
    // Customer Roles
    'user_premium': { userId: 'user_premium_1', role: 'customer_premium', name: 'Priya Sharma' },
    'user_free': { userId: 'user_free_1', role: 'customer_free', name: 'Ravi Verma' },
    
    // Core Roles
    'user_seller': { userId: 'user_seller_1', role: 'seller', name: 'Amit Singh' },
    'user_admin': { userId: 'user_admin_1', role: 'admin', name: 'Deepak Jain' },
    'user_company': { userId: 'user_company_1', role: 'company_head', name: 'Rohan Gupta' }, // NEW ROLE
};

/**
 * Mocks the JWT authentication process to return a user object with a role.
 * @param {string} mockIdentifier - A key to select the mock user/role.
 * @returns {{userId: string, role: string, name: string}|null}
 */
export function getMockUser(mockIdentifier) { 
    // Default to 'user_free' if no identifier is provided
    const key = mockIdentifier || 'user_free'; 
    return MOCK_USER_DB[key] || null;
}

// --- MOCK ROLES FOR TESTING ---
// NOTE: Change this identifier to test different user roles across the app.
// Options: 'user_free', 'user_premium', 'user_seller', 'user_admin', 'user_company'
export const CURRENT_MOCK_USER_ID = 'user_seller'; // <-- Set to 'user_seller' for testing higher role access
// ------------------------------
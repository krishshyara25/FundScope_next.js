// src/lib/mongodb.js
import { MongoClient } from 'mongodb';

// Connection URI jismein database name 'fundscope_db' joda gaya hai.
const uri = "mongodb+srv://krishshyaracg_db_user:vM3FbsD1m11gzgYV@fundscope.4u9x7al.mongodb.net/fundscope_db";
const dbName = "fundscope_db"; 

let client;
let clientPromise;

if (!uri) {
  throw new Error('MONGODB_URI is not defined');
}

// Connection caching logic for performance in Next.js
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

/**
 * MongoDB database instance return karta hai.
 */
export async function getDb() {
    try {
        const connection = await clientPromise;
        return connection.db(dbName);
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        throw new Error("Database se judne mein fail.");
    }
}

export default clientPromise;
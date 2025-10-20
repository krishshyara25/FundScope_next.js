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

// helper to wait
function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Try to connect with retries and exponential backoff.
 * Returns a connected MongoClient instance.
 */
async function connectWithRetry(maxAttempts = 5, initialDelayMs = 500) {
  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt < maxAttempts) {
    try {
      const c = new MongoClient(uri);
      const conn = await c.connect();
      // Save the client so callers can close if needed
      client = c;
      return conn;
    } catch (err) {
      attempt += 1;
      console.error(`MongoDB connect attempt ${attempt} failed:`, err && err.message ? err.message : err);
      if (attempt >= maxAttempts) {
        console.error('MongoDB: max connection attempts reached.');
        throw err;
      }
      // wait before next attempt
      await wait(delay);
      delay = Math.min(delay * 2, 10000); // exponential backoff with cap
    }
  }
}

// Connection caching logic for Next.js to avoid creating multiple clients in dev
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = connectWithRetry();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = connectWithRetry();
}

/**
 * Returns a MongoDB database instance. If the underlying connection failed earlier,
 * this will attempt to reconnect using the same retry logic.
 */
export async function getDb() {
  try {
    const connection = await clientPromise;
    return connection.db(dbName);
  } catch (error) {
    console.error('MongoDB connection failed (getDb):', error && error.message ? error.message : error);
    // Try one more time synchronously before giving up
    try {
      clientPromise = connectWithRetry();
      const connection = await clientPromise;
      return connection.db(dbName);
    } catch (err) {
      console.error('MongoDB reconnection attempt failed:', err && err.message ? err.message : err);
      throw new Error('Database se judne mein fail.');
    }
  }
}

export default clientPromise;
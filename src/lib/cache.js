// src/lib/cache.js
const cache = new Map();

export async function getOrSetCache(key, fetcher, ttlInSeconds) {
  const now = Date.now();
  const cachedItem = cache.get(key);

  if (cachedItem && (now - cachedItem.timestamp) < (ttlInSeconds * 1000)) {
    console.log(`Cache hit for key: ${key}`);
    return cachedItem.data;
  }

  console.log(`Cache miss for key: ${key}. Fetching new data...`);
  const data = await fetcher();
  cache.set(key, { data, timestamp: now });
  return data;
}

// Function to manually clear a cache entry
export function deleteCache(key) {
  if (cache.has(key)) {
    cache.delete(key);
    console.log(`Cache key deleted: ${key}`);
    return true;
  }
  return false;
}
// Simple in-memory rate limiter + CORS guard for Next.js App Router route handlers
// NOTE: In production (serverless multi-instance) replace with Redis / Upstash for distributed counters.

const RATE_LIMITS = {
  // key: identifier, value: { windowMs, max }
  default: { windowMs: 60_000, max: 60 }, // 60 requests / minute per IP
  burst: { windowMs: 10_000, max: 20 }
};

// Memory store (per process)
const buckets = new Map(); // key => { count, reset }

function bucketKey(identifier, windowMs) {
  return `${identifier}:${windowMs}`;
}

export function rateLimit({ identifier, policy = 'default' }) {
  const cfg = RATE_LIMITS[policy] || RATE_LIMITS.default;
  const now = Date.now();
  const key = bucketKey(identifier, cfg.windowMs);
  const entry = buckets.get(key);
  if (!entry || entry.reset < now) {
    buckets.set(key, { count: 1, reset: now + cfg.windowMs });
    return { allowed: true, remaining: cfg.max - 1, reset: now + cfg.windowMs };
  }
  if (entry.count >= cfg.max) {
    return { allowed: false, remaining: 0, reset: entry.reset };
  }
  entry.count += 1;
  return { allowed: true, remaining: cfg.max - entry.count, reset: entry.reset };
}

// CORS: allow only same-origin (your site) + optionally configured additional origins
const ALLOWED_ORIGINS = new Set([
  // Add your production domain(s) here
  'http://localhost:3000'
]);

export function corsGuard(request) {
  const origin = request.headers.get('origin');
  if (!origin) {
    // Non-browser or same-origin fetch w/out origin header; allow
    return { allowed: true };
  }
  if (ALLOWED_ORIGINS.has(origin)) {
    return { allowed: true };
  }
  return { allowed: false, origin };
}

export function buildCorsHeaders(request) {
  const origin = request.headers.get('origin');
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Vary': 'Origin',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };
  }
  return { 'Vary': 'Origin' };
}

export function handlePreflight(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: buildCorsHeaders(request) });
  }
  return null;
}

// Helper to wrap handlers
export async function guardedApi({ request, handler, ratePolicy }) {
  const pre = handlePreflight(request);
  if (pre) return pre;

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const rl = rateLimit({ identifier: ip, policy: ratePolicy });
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try later.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', ...buildCorsHeaders(request), 'Retry-After': Math.ceil((rl.reset - Date.now())/1000) }
    });
  }

  const cors = corsGuard(request);
  if (!cors.allowed) {
    return new Response(JSON.stringify({ error: 'CORS: Origin not allowed' }), { status: 403, headers: { 'Content-Type': 'application/json', ...buildCorsHeaders(request) }});
  }

  try {
    const result = await handler();
    // Ensure headers merged
    if (result instanceof Response) {
      const h = buildCorsHeaders(request);
      Object.entries(h).forEach(([k,v]) => result.headers.set(k,v));
      result.headers.set('X-RateLimit-Remaining', rl.remaining.toString());
      result.headers.set('X-RateLimit-Reset', rl.reset.toString());
      return result;
    }
    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json', ...buildCorsHeaders(request), 'X-RateLimit-Remaining': rl.remaining, 'X-RateLimit-Reset': rl.reset } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || 'Internal error' }), { status: 500, headers: { 'Content-Type': 'application/json', ...buildCorsHeaders(request) } });
  }
}

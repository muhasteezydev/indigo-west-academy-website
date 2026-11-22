import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

const JWT_SECRET =
  process.env.INDIGO_JWT_SECRET ||
  'indigo-academy-west-bishkek-hmac-256-secret-key-2026';

export interface JWTPayload {
  sub: number;
  username: string;
  display_name: string;
  role: 'admin';
  iat: number;
  exp: number;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const keyBuffer = Buffer.from(keyHex, 'hex');
  const derivedBuffer = scryptSync(password, salt, 64);
  if (keyBuffer.length !== derivedBuffer.length) return false;
  return timingSafeEqual(keyBuffer, derivedBuffer);
}

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input: string): string {
  const padLength = (4 - (input.length % 4)) % 4;
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLength);
  return Buffer.from(padded, 'base64').toString('utf8');
}

export function signJwt(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  expiresInSeconds = 60 * 60 * 12
): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };
  const headerEncoded = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = createHmac('sha256', JWT_SECRET)
    .update(`${headerEncoded}.${payloadEncoded}`)
    .digest();
  const sigEncoded = base64UrlEncode(signature);
  return `${headerEncoded}.${payloadEncoded}.${sigEncoded}`;
}

export function verifyJwt(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerEncoded, payloadEncoded, sigEncoded] = parts;
    const expectedSig = base64UrlEncode(
      createHmac('sha256', JWT_SECRET)
        .update(`${headerEncoded}.${payloadEncoded}`)
        .digest()
    );
    const sigBuf = Buffer.from(sigEncoded);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }
    const decoded = JSON.parse(base64UrlDecode(payloadEncoded)) as JWTPayload;
    const now = Math.floor(Date.now() / 1000);
    if (!decoded.exp || decoded.exp < now) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function extractAdminFromRequest(req: IncomingMessage): JWTPayload | null {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  const payload = verifyJwt(token);
  if (!payload || payload.role !== 'admin') {
    return null;
  }
  return payload;
}

// Sliding-window rate limiter per IP + bucket
const rateBuckets = new Map<string, number[]>();

export function checkRateLimit(
  ip: string,
  bucket: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfterSec: number } {
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const timestamps = (rateBuckets.get(key) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    const oldest = timestamps[0];
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    return { allowed: false, retryAfterSec };
  }
  timestamps.push(now);
  rateBuckets.set(key, timestamps);
  return { allowed: true, retryAfterSec: 0 };
}

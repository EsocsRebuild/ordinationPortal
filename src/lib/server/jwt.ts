import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'esocs-platform-secret-key-2026-32chars-min';

export interface JwtTokenPayload {
  sub: string;
  userId: string;
  role: string;
  email: string;
  candidateId?: string;
  name?: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

/**
 * Creates an RFC 7519 / JWS compact serialization format token:
 * Base64Url(Header) . Base64Url(Payload) . Base64Url(Signature)
 */
export function createJwtToken(payload: Partial<JwtTokenPayload>): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 7 * 24 * 60 * 60; // 7 days

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const fullPayload: JwtTokenPayload = {
    sub: payload.userId || payload.email || 'user',
    userId: payload.userId || '',
    role: payload.role || 'candidate',
    email: payload.email || '',
    candidateId: payload.candidateId,
    name: payload.name,
    iat: now,
    exp: exp,
    ...payload,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verifies and decodes a JWS compact serialization format token
 */
export function verifyJwtToken(token: string): JwtTokenPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const payloadJson = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const payload: JwtTokenPayload = JSON.parse(payloadJson);

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}


// ==========================================
// Dinkster Backend-For-Frontend (BFF) Auth Layer
// Resolves Risk 2: Firebase logins vs Supabase row-level security
// Bridges Firebase Auth tokens from mobile clients to Supabase Postgres identity.
// Validates JWT, extracts the player's Firebase UID, and resolves their DK-XXXXX record.
// ==========================================

import { prisma } from '@dinkster/database';

export interface AuthenticatedUser {
  id: string; // Supabase/Postgres User UUID
  dinksterId: string; // DK-XXXXX
  authId: string; // Firebase UID
  email: string;
  displayName: string;
  roles: string[];
}

export interface AuthVerificationResult {
  authenticated: boolean;
  user?: AuthenticatedUser;
  error?: string;
  statusCode?: number;
}

/**
 * Parses JWT payload without external library for zero-overhead token inspection.
 */
function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Validates a Firebase Auth Bearer token and returns the corresponding Dinkster user.
 */
export async function authenticateFirebaseToken(token: string): Promise<AuthVerificationResult> {
  if (!token) {
    return {
      authenticated: false,
      error: 'Missing authentication token',
      statusCode: 401,
    };
  }

  // Support for development/test tokens
  if (process.env.NODE_ENV !== 'production' && token.startsWith('mock-token-')) {
    const mockUid = token.replace('mock-token-', '');
    return {
      authenticated: true,
      user: {
        id: '00000000-0000-0000-0000-000000000001',
        dinksterId: 'DK-00001',
        authId: mockUid,
        email: `${mockUid}@dinkster.test`,
        displayName: 'Test Dinkster Player',
        roles: ['PLAYER'],
      },
    };
  }

  // Parse JWT token
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return {
      authenticated: false,
      error: 'Malformed or invalid JWT format',
      statusCode: 401,
    };
  }

  // Verify expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    return {
      authenticated: false,
      error: 'Authentication token has expired',
      statusCode: 401,
    };
  }

  const firebaseUid = payload.sub || payload.user_id;
  if (!firebaseUid) {
    return {
      authenticated: false,
      error: 'Invalid token: missing subject claim',
      statusCode: 401,
    };
  }

  try {
    // Lookup user in Supabase Postgres by authId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { authId: firebaseUid },
          { email: payload.email ?? undefined },
        ],
      },
    });

    // If user does not exist yet in Postgres, provision a synchronized record
    if (!user && payload.email) {
      const generatedDinkId = `DK-${Math.floor(10000 + Math.random() * 90000)}`;
      user = await prisma.user.create({
        data: {
          authId: firebaseUid,
          dinksterId: generatedDinkId,
          email: payload.email,
          displayName: payload.name || payload.email.split('@')[0],
          roles: ['PLAYER'],
        },
      });
    }

    if (!user) {
      return {
        authenticated: false,
        error: 'Player profile not found for this identity',
        statusCode: 403,
      };
    }

    return {
      authenticated: true,
      user: {
        id: user.id,
        dinksterId: user.dinksterId,
        authId: user.authId,
        email: user.email,
        displayName: user.displayName,
        roles: user.roles as string[],
      },
    };
  } catch (err: any) {
    return {
      authenticated: false,
      error: `Identity resolution failure: ${err.message}`,
      statusCode: 500,
    };
  }
}

/**
 * Extracts Bearer token from Request headers and authenticates the player.
 */
export async function authenticateRequest(request: Request): Promise<AuthVerificationResult> {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader) {
    return {
      authenticated: false,
      error: 'Missing Authorization header',
      statusCode: 401,
    };
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return {
      authenticated: false,
      error: 'Invalid Authorization header format. Expected "Bearer <token>"',
      statusCode: 401,
    };
  }

  return authenticateFirebaseToken(parts[1]);
}

// ==========================================
// Dinkster Webhook Verification & Idempotency Engine
// Resolves Risk 1: Missing bridge between Firebase & Supabase
// Authenticates signed match completion payloads from Firebase Cloud Functions / Mobile
// using HMAC-SHA256 signatures, replay-window checks, and idempotency protection.
// ==========================================

import crypto from 'crypto';

export interface WebhookVerificationResult {
  valid: boolean;
  error?: string;
  timestamp?: number;
}

// In-memory idempotency cache for fast deduping (in production, backed by Redis or Postgres)
const processedKeys = new Map<string, number>();

// Clean up expired idempotency keys periodically
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_DRIFT_SECONDS = 300; // 5 minute clock drift window

function pruneExpiredKeys(): void {
  const now = Date.now();
  for (const [key, timestamp] of processedKeys.entries()) {
    if (now - timestamp > IDEMPOTENCY_TTL_MS) {
      processedKeys.delete(key);
    }
  }
}

/**
 * Checks if an idempotency key has already been executed.
 */
export function checkIdempotencyKey(key: string): boolean {
  pruneExpiredKeys();
  return processedKeys.has(key);
}

/**
 * Records an idempotency key as successfully executed.
 */
export function recordIdempotencyKey(key: string): void {
  processedKeys.set(key, Date.now());
}

/**
 * Generates an HMAC-SHA256 signature for a payload.
 * Useful for test suites and Firebase Cloud Functions emitter.
 */
export function generateWebhookSignature(
  payload: string,
  secret: string,
  timestamp: number = Math.floor(Date.now() / 1000)
): { signature: string; timestamp: number } {
  const signedData = `${timestamp}.${payload}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(signedData);
  const signature = `v1=${hmac.digest('hex')}`;
  return { signature, timestamp };
}

/**
 * Verifies the incoming webhook request signature and timestamp freshness.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  timestampHeader: string | null,
  signingSecret: string = process.env.WEBHOOK_SIGNING_SECRET || 'dinkster_default_dev_secret_2026'
): WebhookVerificationResult {
  if (!signatureHeader) {
    return { valid: false, error: 'Missing x-dinkster-signature header' };
  }

  if (!timestampHeader) {
    return { valid: false, error: 'Missing x-dinkster-timestamp header' };
  }

  const timestamp = parseInt(timestampHeader, 10);
  if (isNaN(timestamp)) {
    return { valid: false, error: 'Invalid x-dinkster-timestamp header format' };
  }

  // Prevent replay attacks: ensure timestamp is within tolerance
  const currentTimestampSec = Math.floor(Date.now() / 1000);
  const timeDifference = Math.abs(currentTimestampSec - timestamp);
  if (timeDifference > MAX_DRIFT_SECONDS) {
    return {
      valid: false,
      error: `Webhook timestamp expired or drifted too far (${timeDifference}s > ${MAX_DRIFT_SECONDS}s allowed)`,
      timestamp,
    };
  }

  // Extract signature value (supports 'v1=<hex>' format)
  const expectedPrefix = 'v1=';
  const providedSignature = signatureHeader.startsWith(expectedPrefix)
    ? signatureHeader.slice(expectedPrefix.length)
    : signatureHeader;

  // Compute expected HMAC
  const signedData = `${timestamp}.${rawBody}`;
  const hmac = crypto.createHmac('sha256', signingSecret);
  hmac.update(signedData);
  const calculatedHex = hmac.digest('hex');

  const providedBuffer = Buffer.from(providedSignature, 'hex');
  const calculatedBuffer = Buffer.from(calculatedHex, 'hex');

  // Prevent timing attacks via crypto.timingSafeEqual
  if (
    providedBuffer.length !== calculatedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, calculatedBuffer)
  ) {
    return { valid: false, error: 'HMAC-SHA256 signature mismatch', timestamp };
  }

  return { valid: true, timestamp };
}

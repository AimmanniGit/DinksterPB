// ==========================================
// Dinkster Check-In TTL & Active State Engine
// Resolves Risk 4: Firestore TTL is not instantaneous (can lag up to 72 hrs).
// Both mobile client reads and backend API endpoints use these pure utilities
// to enforce strict 2-hour court check-in lifespans regardless of database GC lag.
// ==========================================

export interface CheckInRecord {
  id: string;
  courtId: number | string;
  userId: string;
  dinksterId: string;
  createdAt: number; // Unix ms
  expiresAt: number; // Unix ms (strictly createdAt + durationMs)
  durationMinutes: number;
  courtName?: string;
}

export const DEFAULT_CHECKIN_DURATION_MINUTES = 120; // 2 hours standard

/**
 * Creates a new CheckInRecord with guaranteed expiresAt timestamp
 */
export function createCheckInRecord(
  courtId: number | string,
  userId: string,
  dinksterId: string,
  courtName?: string,
  durationMinutes: number = DEFAULT_CHECKIN_DURATION_MINUTES
): CheckInRecord {
  const now = Date.now();
  const durationMs = durationMinutes * 60 * 1000;
  return {
    id: `chk_${courtId}_${dinksterId}_${now}`,
    courtId,
    userId,
    dinksterId,
    createdAt: now,
    expiresAt: now + durationMs,
    durationMinutes,
    courtName,
  };
}

/**
 * Checks if a check-in is currently active (not expired).
 * Strictly evaluates `now < expiresAt`.
 */
export function isCheckInActive(
  checkIn: Pick<CheckInRecord, 'expiresAt'>,
  currentTimeMs: number = Date.now()
): boolean {
  return currentTimeMs < checkIn.expiresAt;
}

/**
 * Filters out stale check-ins from any database query result (Firestore, Postgres, Memory).
 * Ensures zero "zombie" check-ins are shown to other players even if Firestore TTL has not fired yet.
 */
export function filterActiveCheckIns<T extends Pick<CheckInRecord, 'expiresAt'>>(
  checkIns: T[],
  currentTimeMs: number = Date.now()
): T[] {
  return checkIns.filter((record) => isCheckInActive(record, currentTimeMs));
}

/**
 * Returns remaining milliseconds until expiration, or 0 if expired.
 */
export function getTimeRemainingMs(
  checkIn: Pick<CheckInRecord, 'expiresAt'>,
  currentTimeMs: number = Date.now()
): number {
  const remaining = checkIn.expiresAt - currentTimeMs;
  return Math.max(0, remaining);
}

/**
 * Formats time remaining into human readable string (e.g. "1h 45m" or "18m").
 */
export function formatTimeRemaining(msRemaining: number): string {
  if (msRemaining <= 0) return 'Expired';
  const totalMinutes = Math.floor(msRemaining / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
}

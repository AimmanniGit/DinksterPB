// ==========================================
// Dinkster Geofence Utility (Client-Side Only)
// Zero GPS Storage Guarantee:
// GPS coordinates are evaluated strictly on the user's device.
// NO latitude, longitude, or raw coordinates are EVER transmitted
// over network requests or persisted in Firestore / Supabase databases.
// ==========================================

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number; // meters
}

export interface CourtBoundary {
  courtId: number | string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number; // typically 150m - 300m perimeter
}

/**
 * Payload sent over network to check in at a venue.
 * Notice: LATITUDE AND LONGITUDE ARE STRICTLY EXCLUDED.
 */
export interface ClientVerifiedCheckInPayload {
  courtId: number | string;
  dinksterId: string;
  action: 'checkin' | 'checkout';
  verifiedLocally: boolean;
  timestamp: number;
  expiresAt: number; // Explicit expiration timestamp (avoids Firestore TTL lag)
}

const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates distance in meters between two coordinates using the Haversine formula.
 * Executes on client device CPU.
 */
export function calculateDistanceMeters(
  point1: GpsCoordinates,
  point2: GpsCoordinates
): number {
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);

  const lat1 = toRadians(point1.latitude);
  const lat2 = toRadians(point2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Verifies on the client device whether user coordinates fall within the court's boundary radius.
 */
export function isWithinGeofence(
  userLocation: GpsCoordinates,
  courtBoundary: CourtBoundary
): { inRange: boolean; distanceMeters: number } {
  const distanceMeters = Math.round(
    calculateDistanceMeters(userLocation, {
      latitude: courtBoundary.latitude,
      longitude: courtBoundary.longitude,
    })
  );

  return {
    inRange: distanceMeters <= courtBoundary.radiusMeters,
    distanceMeters,
  };
}

/**
 * Factory for creating a privacy-preserving check-in payload.
 * Verifies locally and constructs a payload with ZERO coordinate leakage.
 */
export function createVerifiedCheckInPayload(
  userLocation: GpsCoordinates,
  court: CourtBoundary,
  dinksterId: string,
  durationMinutes: number = 120
): { success: boolean; payload?: ClientVerifiedCheckInPayload; error?: string } {
  const { inRange, distanceMeters } = isWithinGeofence(userLocation, court);

  if (!inRange) {
    return {
      success: false,
      error: `You are approximately ${distanceMeters}m away. Must be within ${court.radiusMeters}m of ${court.name} to check in.`,
    };
  }

  const now = Date.now();
  const expiresAt = now + durationMinutes * 60 * 1000;

  return {
    success: true,
    payload: {
      courtId: court.courtId,
      dinksterId,
      action: 'checkin',
      verifiedLocally: true,
      timestamp: now,
      expiresAt,
    },
  };
}

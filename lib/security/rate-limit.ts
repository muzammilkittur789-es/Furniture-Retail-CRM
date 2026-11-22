/**
 * In-Memory Sliding-Window Rate Limiter & Brute-Force Shield
 * Defends PIN authentication against automated dictionary and brute-force attacks.
 */

interface AttemptRecord {
  failedAttempts: number;
  lastAttemptTime: number;
  lockedUntil: number;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes lockout after 5 consecutive failures
const WINDOW_DURATION_MS = 10 * 60 * 1000; // 10 minutes tracking window

declare global {
  var __ALISHAN_PIN_ATTEMPTS__: Map<string, AttemptRecord> | undefined;
}

if (!global.__ALISHAN_PIN_ATTEMPTS__) {
  global.__ALISHAN_PIN_ATTEMPTS__ = new Map<string, AttemptRecord>();
}

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
} {
  const attempts = global.__ALISHAN_PIN_ATTEMPTS__!;
  const now = Date.now();
  const record = attempts.get(identifier);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }

  // Check if actively locked
  if (record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
    };
  }

  // If window expired, reset attempts
  if (now - record.lastAttemptTime > WINDOW_DURATION_MS) {
    attempts.delete(identifier);
    return { allowed: true, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }

  const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - record.failedAttempts);
  return { allowed: true, remainingAttempts: remaining };
}

export function recordFailedAttempt(identifier: string): {
  isLocked: boolean;
  retryAfterSeconds?: number;
} {
  const attempts = global.__ALISHAN_PIN_ATTEMPTS__!;
  const now = Date.now();
  const record = attempts.get(identifier) || {
    failedAttempts: 0,
    lastAttemptTime: now,
    lockedUntil: 0,
  };

  record.failedAttempts += 1;
  record.lastAttemptTime = now;

  if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    attempts.set(identifier, record);
    return {
      isLocked: true,
      retryAfterSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
    };
  }

  attempts.set(identifier, record);
  return { isLocked: false };
}

export function resetRateLimit(identifier: string): void {
  const attempts = global.__ALISHAN_PIN_ATTEMPTS__!;
  attempts.delete(identifier);
}

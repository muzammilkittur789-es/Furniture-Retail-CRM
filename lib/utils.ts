import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Computes the timestamp for the most recent 6:00 AM morning boundary.
 * If current time is 11:30 AM on Nov 28, the cutoff is Nov 28 at 6:00 AM.
 * If current time is 04:15 AM on Nov 28, the cutoff is Nov 27 at 6:00 AM.
 */
export function getShowroomMorning6amCutoff(referenceDate: Date = new Date()): number {
  const cutoff = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    6,
    0,
    0,
    0
  );
  if (referenceDate.getTime() < cutoff.getTime()) {
    cutoff.setDate(cutoff.getDate() - 1);
  }
  return cutoff.getTime();
}

/**
 * Determines whether a follow-up lead should appear on the morning follow-up screen.
 * Once a deal is closed, it automatically disappears at 6:00 AM the following morning,
 * leaving only fresh action cards for the sales team every new day.
 */
export function isLeadActiveForMorningShift(
  lead: { status: string; lastUpdated?: string },
  referenceDate: Date = new Date()
): boolean {
  if (lead.status === 'deal_closed') {
    const cutoff = getShowroomMorning6amCutoff(referenceDate);
    const closedAt = lead.lastUpdated ? new Date(lead.lastUpdated).getTime() : 0;
    // Closed before today's 6:00 AM cutoff -> Disappears completely
    return closedAt >= cutoff;
  }
  return true;
}


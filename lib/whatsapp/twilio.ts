import {
  getAllQuotes,
  getAllFollowUps,
  getAllStaffMembers,
  getAllProducts,
} from '@/lib/store/showroom-store';
import { formatINR } from '@/lib/utils';

export interface TwilioSendResult {
  success: boolean;
  sid?: string;
  error?: string;
  dispatchedTo?: string;
  simulated?: boolean;
}

/**
 * Formats a phone number into Twilio WhatsApp E.164 format (e.g. whatsapp:+917676482481)
 */
export function formatTwilioWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) {
    return `whatsapp:+${digits}`;
  }
  if (digits.length === 10) {
    return `whatsapp:+91${digits}`;
  }
  return `whatsapp:+${digits}`;
}

/**
 * Sends a WhatsApp message using Twilio's official REST API.
 * Uses native fetch with zero external npm dependencies.
 */
export async function sendTwilioWhatsAppMessage({
  to,
  message,
}: {
  to: string;
  message: string;
}): Promise<TwilioSendResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  // Default to official Twilio WhatsApp Sandbox number (+14155238886)
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

  const recipient = formatTwilioWhatsAppNumber(to);

  // If Twilio credentials are not yet configured in .env.local, simulate dispatch with full logging
  if (!accountSid || !authToken) {
    console.warn(
      '⚠️ Twilio credentials (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN) not detected in environment. Simulating 10 PM WhatsApp dispatch.'
    );
    return {
      success: true,
      simulated: true,
      dispatchedTo: recipient,
      error: 'Twilio credentials not configured in environment. Operating in demo/simulation mode.',
    };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const params = new URLSearchParams();
    params.append('From', fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`);
    params.append('To', recipient);
    params.append('Body', message);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Twilio WhatsApp API Error:', data);
      return {
        success: false,
        error: data.message || `Twilio error code: ${data.code}`,
        dispatchedTo: recipient,
      };
    }

    return {
      success: true,
      sid: data.sid,
      dispatchedTo: recipient,
    };
  } catch (err: any) {
    console.error('❌ Exception during Twilio WhatsApp dispatch:', err);
    return {
      success: false,
      error: err.message || 'Network error connecting to Twilio API',
      dispatchedTo: recipient,
    };
  }
}

/**
 * Compiles dynamic 10:00 PM Daily Closing Report from live showroom store
 */
export function compileDaily10pmClosingReport(): {
  message: string;
  summary: {
    todayRevenue: number;
    pendingAmount: number;
    totalQuotesCount: number;
    priorityCallsCount: number;
  };
} {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;

  const todayStr = today.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const quotes = getAllQuotes();
  const followUps = getAllFollowUps();
  const staff = getAllStaffMembers();
  const products = getAllProducts();

  // 1. Identify today's quotes & closed sales
  const todayQuotes = quotes.filter((q) => {
    const qTime = new Date(q.created_at).getTime();
    return qTime >= todayStart && qTime < todayEnd;
  });

  // Active pool for today (fallback to recent demo items if accessed during night/early hours)
  const activeQuotes = todayQuotes.length > 0 ? todayQuotes : quotes.slice(0, 7);

  const closedQuotes = activeQuotes.filter((q) => q.status === 'closed');
  const pendingQuotes = activeQuotes.filter((q) => q.status === 'pending');

  const todayRevenue = closedQuotes.reduce((acc, q) => acc + (q.final_price || 0), 0);
  const totalPendingPipeline = quotes
    .filter((q) => q.status === 'pending')
    .reduce((acc, q) => acc + (q.final_price || 0), 0);

  const advanceCollected =
    closedQuotes.reduce((acc, q) => acc + (q.advance_deposit || 0), 0) +
    pendingQuotes.reduce((acc, q) => acc + (q.advance_deposit || 0), 0);

  const totalUnitsSold = closedQuotes.reduce(
    (acc, q) => acc + (q.itemsCount || q.quote_items?.length || 1),
    0
  );

  // 2. Which Pieces Were Cleared / Sold Today
  const soldPiecesDetails: string[] = [];
  if (closedQuotes.length > 0) {
    closedQuotes.forEach((q, idx) => {
      const rep = q.staffName || q.staff?.name || 'Sales Staff';
      const customer = q.customer_name || `+91 ${q.customer_whatsapp}`;
      soldPiecesDetails.push(
        `${idx + 1}. *${q.itemsSummary}*\n   └ ${formatINR(q.final_price)} • ${customer} • Sold by ${rep}`
      );
    });
  } else {
    soldPiecesDetails.push(`• No showroom pieces marked sold today`);
  }

  // 3. Sales Team Performance Leaderboard
  const staffPerfMap: Record<
    string,
    { name: string; closedCount: number; closedRevenue: number; pendingCount: number; pendingRevenue: number }
  > = {};

  for (const s of staff) {
    staffPerfMap[s.name] = {
      name: s.name,
      closedCount: 0,
      closedRevenue: 0,
      pendingCount: 0,
      pendingRevenue: 0,
    };
  }

  for (const q of activeQuotes) {
    const sName = q.staffName || q.staff?.name;
    if (sName && staffPerfMap[sName]) {
      if (q.status === 'closed') {
        staffPerfMap[sName].closedCount++;
        staffPerfMap[sName].closedRevenue += q.final_price;
      } else if (q.status === 'pending') {
        staffPerfMap[sName].pendingCount++;
        staffPerfMap[sName].pendingRevenue += q.final_price;
      }
    }
  }

  const staffEntries = Object.values(staffPerfMap).filter(
    (e) => e.closedCount > 0 || e.pendingCount > 0
  );

  staffEntries.sort(
    (a, b) => b.closedRevenue - a.closedRevenue || b.pendingRevenue - a.pendingRevenue
  );

  const staffPerformanceDetails: string[] = [];
  if (staffEntries.length > 0) {
    staffEntries.forEach((entry, idx) => {
      const medal = idx === 0 && entry.closedRevenue > 0 ? '🏆' : '⭐';
      const closedPart =
        entry.closedCount > 0
          ? `${formatINR(entry.closedRevenue)} (${entry.closedCount} deal${entry.closedCount > 1 ? 's' : ''})`
          : '₹0';
      const pendingPart =
        entry.pendingCount > 0
          ? `${entry.pendingCount} quote${entry.pendingCount > 1 ? 's' : ''} (${formatINR(entry.pendingRevenue)})`
          : '0 quotes';

      staffPerformanceDetails.push(
        `${medal} *${entry.name}:* ${closedPart} Closed | ${pendingPart} Pending`
      );
    });
  } else {
    staffPerformanceDetails.push(`• All staff active on showroom floor`);
  }

  // 4. Priority Client Action Targets for Tomorrow Morning
  const activeLeads = followUps
    .filter((f) => f.status === 'pending' || f.status === 'called_interested')
    .sort((a, b) => b.quotedAmount - a.quotedAmount)
    .slice(0, 3);

  const priorityTargetDetails: string[] = [];
  if (activeLeads.length > 0) {
    activeLeads.forEach((lead, idx) => {
      const advStr = lead.advanceDeposit ? ` (Adv: ${formatINR(lead.advanceDeposit)})` : '';
      const rep = lead.assignedStaffName || 'Sales Staff';
      const callTime = lead.scheduledFor || 'Morning 10:30 AM';
      priorityTargetDetails.push(
        `${idx + 1}. *${lead.customerName || 'Customer'}* (+91 ${lead.customerWhatsapp})\n   └ *Deal Size:* ${formatINR(lead.quotedAmount)}${advStr}\n   └ *Interested In:* ${lead.itemsSummary}\n   └ *Assigned Rep:* ${rep} • Call: ${callTime}`
      );
    });
  } else {
    priorityTargetDetails.push(`• No pending client follow-up calls scheduled for tomorrow`);
  }

  // 5. Inventory Restock Alert (Sold out or single piece remaining)
  const lowStockProducts = products.filter(
    (p) => p.stock_quantity !== undefined && p.stock_quantity <= 1
  );

  let lowStockAlertsSection = '';
  if (lowStockProducts.length > 0) {
    const alertLines = lowStockProducts.slice(0, 3).map((p) => {
      const qtyStr =
        p.stock_quantity === 0
          ? '0 units left (SOLD OUT)'
          : `${p.stock_quantity} unit left (Handcrafted floor piece)`;
      return `• *${p.name}* — ${qtyStr}`;
    });
    lowStockAlertsSection = `\n━━━━━━━━━━━━━━━━━━━━━━\n⚠️ *INVENTORY RESTOCK ALERT*\n${alertLines.join('\n')}\n`;
  }

  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const adminUrl = `${appBaseUrl}/admin`;

  const message = `🏛️ *Alishan Furnitures - Daily Closing Report*
🌙 *Nightly Executive Briefing • 10:00 PM*
📅 *${todayStr}*
━━━━━━━━━━━━━━━━━━━━━━

💰 *TODAY'S FINANCIAL SUMMARY*
• 💵 *Revenue Closed Today:* ${formatINR(todayRevenue)} (${closedQuotes.length} Deals)
• 💳 *Advance Tokens Collected:* ${formatINR(advanceCollected)}
• 🛋️ *Showroom Pieces Sold:* ${totalUnitsSold} ${totalUnitsSold === 1 ? 'Unit' : 'Units'}
• 📋 *New Quotes Sent Today:* ${todayQuotes.length || activeQuotes.length} Quotes
• ⏳ *Active Pending Pipeline:* ${formatINR(totalPendingPipeline)}

━━━━━━━━━━━━━━━━━━━━━━
🛋️ *PIECES CLEARED OFF THE FLOOR TODAY*
${soldPiecesDetails.join('\n')}

━━━━━━━━━━━━━━━━━━━━━━
👥 *SALES TEAM PERFORMANCE*
${staffPerformanceDetails.join('\n')}

━━━━━━━━━━━━━━━━━━━━━━
🎯 *TOP CLIENT TARGETS FOR TOMORROW MORNING*
${priorityTargetDetails.join('\n')}
${lowStockAlertsSection}━━━━━━━━━━━━━━━━━━━━━━
📱 *Live Showroom Command Center:*
${adminUrl}`;

  return {
    message,
    summary: {
      todayRevenue,
      pendingAmount: totalPendingPipeline,
      totalQuotesCount: todayQuotes.length || activeQuotes.length,
      priorityCallsCount: activeLeads.length,
    },
  };
}

/**
 * Dispatches the 10:00 PM Daily Closing WhatsApp report to the Showroom Owner
 */
export async function dispatchDaily10pmWhatsAppReport(): Promise<{
  success: boolean;
  result: TwilioSendResult;
  message: string;
}> {
  const { message } = compileDaily10pmClosingReport();
  const ownerNumber = process.env.OWNER_WHATSAPP_NUMBER || '7676482481';

  const result = await sendTwilioWhatsAppMessage({
    to: ownerNumber,
    message,
  });

  return {
    success: result.success,
    result,
    message,
  };
}

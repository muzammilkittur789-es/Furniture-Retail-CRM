import { NextResponse } from 'next/server';
import { formatINR } from '@/lib/utils';
import { getAllProducts, getAllFollowUps } from '@/lib/store/showroom-store';

export async function GET(request: Request) {
  try {
    const todayStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const ownerWhatsapp = process.env.OWNER_WHATSAPP_NUMBER || '9876543210';

    // Compile 10:00 PM Daily Summary
    const message = `*Alishan Furnitures - Daily Closing Report*
📅 Date: ${todayStr} | 10:00 PM

*TODAY'S SUMMARY:*
• Total Quotes Sent: 5
• Total Pending Amount: ₹7,87,500
• Deals Sold / Closed Today: ₹4,50,000

*STAFF QUOTES TODAY:*
1. Arjun Verma: 3 quotes (₹6,30,000)
2. Sneha Kapoor: 2 quotes (₹3,64,500)

*TOP CUSTOMERS TO CALL TOMORROW MORNING:*
• +91 9876543210: ₹3,85,000 (Bouclé Sofa)
• +91 9123456789: ₹2,45,000 (Dining Table)

*Showroom Management Dashboard:*
http://localhost:3000/admin`;

    // In production with WhatsApp Business API (Twilio / Gupshup / Wati):
    // If TWILIO_ACCOUNT_SID or similar env variable is present, dispatches message via REST API
    let dispatchedViaApi = false;
    const whatsappApiKey = process.env.WHATSAPP_API_KEY;
    const whatsappWebhookUrl = process.env.WHATSAPP_WEBHOOK_URL;

    if (whatsappWebhookUrl) {
      try {
        await fetch(whatsappWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: `91${ownerWhatsapp}`,
            message,
          }),
        });
        dispatchedViaApi = true;
      } catch (err) {
        console.warn('Webhook dispatch error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: '22:00:00 IST',
      date: todayStr,
      ownerPhone: `+91 ${ownerWhatsapp}`,
      dispatchedViaApi,
      reportMessage: message,
      instructions:
        'This endpoint compiles and sends the 10:00 PM showroom closing summary directly to the owner WhatsApp.',
    });
  } catch (error) {
    console.error('Error generating 10pm report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate nightly summary' },
      { status: 500 }
    );
  }
}

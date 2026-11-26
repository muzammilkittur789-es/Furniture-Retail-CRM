import { NextResponse } from 'next/server';
import { dispatchDaily10pmWhatsAppReport } from '@/lib/whatsapp/twilio';

export async function GET(request: Request) {
  try {
    const todayStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const ownerWhatsapp = process.env.OWNER_WHATSAPP_NUMBER || '7676482481';

    // Dispatch 10:00 PM Daily Closing Summary via Twilio WhatsApp API
    const dispatchResult = await dispatchDaily10pmWhatsAppReport();

    return NextResponse.json({
      success: dispatchResult.success,
      timestamp: '22:00:00 IST',
      date: todayStr,
      ownerPhone: `+91 ${ownerWhatsapp}`,
      twilio: dispatchResult.result,
      reportMessage: dispatchResult.message,
      instructions:
        'This automated cron compiles and sends the 10:00 PM showroom closing summary directly to the owner WhatsApp via Twilio.',
    });
  } catch (error: any) {
    console.error('Error generating 10pm report:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate nightly summary' },
      { status: 500 }
    );
  }
}

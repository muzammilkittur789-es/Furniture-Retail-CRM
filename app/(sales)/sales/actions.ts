'use server';

import { createServerClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { CreateQuotePayload, StaffSession } from '@/lib/types/database';
import {
  verifyStaffPin,
  getProductHoldStatus,
  lockProductsFor24Hours,
  getAllProducts,
  assignQuoteToStaff,
  markFollowUpContacted,
  getAllStaffMembers,
} from '@/lib/store/showroom-store';
import { revalidatePath } from 'next/cache';

/**
 * Server Action: Instant Verify salesman 4-digit PIN.
 */
export async function verifyPin(
  pin: string
): Promise<{ success: boolean; staff?: StaffSession; error?: string }> {
  try {
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return { success: false, error: 'PIN must be exactly 4 digits.' };
    }

    // Check staff store (includes admin-created / updated salesmen)
    const storeVerification = verifyStaffPin(pin);
    if (storeVerification.success && storeVerification.staff) {
      return storeVerification;
    }

    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const { data: dbStaff } = await supabase
        .from('staff')
        .select('id, name, role, is_active')
        .eq('is_active', true);

      if (dbStaff && dbStaff.length > 0) {
        const found = dbStaff.find((s: any) => s.pin === pin || s.pin_hash === pin);
        if (found) {
          return {
            success: true,
            staff: {
              id: found.id,
              name: found.name,
              role: found.role as 'admin' | 'sales',
            },
          };
        }
      }
    }

    return { success: false, error: 'Incorrect PIN. Please check your credentials or ask the owner.' };
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return { success: false, error: 'Failed to verify PIN.' };
  }
}

/**
 * Server Action: Create Quote with Strict 24-Hour Product Lock.
 */
export async function createQuote(
  payload: CreateQuotePayload
): Promise<{ success: boolean; quoteId?: string; error?: string }> {
  try {
    const {
      staffId,
      customerName,
      customerWhatsapp,
      subtotal,
      discountType,
      discountValue,
      finalPrice,
      items,
    } = payload;

    if (!staffId) {
      return { success: false, error: 'Terminal session expired.' };
    }

    if (!customerName || !customerName.trim()) {
      return { success: false, error: "Please enter the customer's full name." };
    }

    const cleanWhatsapp = customerWhatsapp.replace(/\D/g, '');
    if (cleanWhatsapp.length !== 10) {
      return { success: false, error: '10-digit WhatsApp number required.' };
    }

    if (!items || items.length === 0) {
      return { success: false, error: 'Please select pieces for the quote.' };
    }

    // 1. Sold Out Stock Check
    const allProducts = getAllProducts();
    for (const item of items) {
      const p = allProducts.find((prod) => prod.id === item.productId);
      if (p && !p.is_active) {
        return {
          success: false,
          error: `"${item.name}" has been marked sold out and cannot be added to a new quote.`,
        };
      }
    }

    // 2. 24-Hour Product Hold Check
    for (const item of items) {
      const hold = getProductHoldStatus(item.productId);
      if (hold.isLocked) {
        return {
          success: false,
          error: `"${item.name}" was quoted within the last 24 hours and is currently reserved. Quotes cannot be generated for this product until ${hold.lockedUntilFormatted} (${hold.remainingHours}h ${hold.remainingMinutes}m remaining).`,
        };
      }
    }

    const itemsSummary = items
      .map((it) => (it.quantity && it.quantity > 1 ? `${it.name} (x${it.quantity})` : it.name))
      .join(' + ');

    // Dynamic attribution: resolve the logged-in salesman
    const allStaff = getAllStaffMembers();
    const currentStaff = allStaff.find((s) => s.id === staffId);
    const dynamicStaffName = currentStaff?.name || 'Sales Staff';

    if (!isSupabaseConfigured()) {
      // Instant mock quote ID for rapid offline / demo testing
      const mockQuoteId = 'e0eebc99-9c0b-4ef8-bb6d-' + Date.now().toString().slice(-12);
      
      // Lock all products in this quote for 24 hours
      lockProductsFor24Hours(
        items.map((it) => ({ productId: it.productId, name: it.name })),
        mockQuoteId
      );

      // Automatically assign follow-up lead to the actual logged-in salesperson
      assignQuoteToStaff(
        mockQuoteId,
        staffId,
        dynamicStaffName,
        cleanWhatsapp,
        itemsSummary,
        finalPrice,
        customerName?.trim() || 'Customer',
        payload.orderNotes?.trim()
      );

      revalidatePath('/sales');
      revalidatePath('/admin');

      return {
        success: true,
        quoteId: mockQuoteId,
      };
    }

    const supabase = createServerClient();

    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        staff_id: staffId,
        customer_name: customerName?.trim() || null,
        customer_whatsapp: cleanWhatsapp,
        subtotal: Number(subtotal.toFixed(2)),
        discount_type: discountType,
        discount_value: Number(discountValue.toFixed(2)),
        final_price: Number(finalPrice.toFixed(2)),
        status: 'pending',
      })
      .select('id')
      .single();

    if (quoteError || !quote) {
      return {
        success: false,
        error: quoteError?.message || 'Failed to save quote.',
      };
    }

    const quoteItemsData = items.map((item) => ({
      quote_id: quote.id,
      product_id: item.productId,
      price_at_time: Number(item.priceAtTime.toFixed(2)),
    }));

    await supabase.from('quote_items').insert(quoteItemsData);

    // Lock all products in this quote for 24 hours
    lockProductsFor24Hours(
      items.map((it) => ({ productId: it.productId, name: it.name })),
      quote.id
    );

    // Sync in-memory follow-up store under logged-in salesman
    assignQuoteToStaff(
      quote.id,
      staffId,
      dynamicStaffName,
      cleanWhatsapp,
      itemsSummary,
      finalPrice,
      customerName?.trim() || 'Customer',
      payload.orderNotes?.trim()
    );

    revalidatePath('/sales');
    revalidatePath('/admin');

    return {
      success: true,
      quoteId: quote.id,
    };
  } catch (error) {
    console.error('Unhandled error in createQuote:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while generating quote.',
    };
  }
}

/**
 * Server Action: Mark follow-up as contacted / called by salesperson
 */
export async function markFollowUpContactedAction(
  leadId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ok = markFollowUpContacted(leadId);
    revalidatePath('/sales');
    return { success: ok };
  } catch (err) {
    console.error('Error in markFollowUpContactedAction:', err);
    return { success: false, error: 'Failed to update follow-up.' };
  }
}

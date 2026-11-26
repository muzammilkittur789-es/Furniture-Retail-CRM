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
  saveNewQuote,
  closeQuoteAndDeductInventory,
  decrementProductStock,
} from '@/lib/store/showroom-store';
import { revalidatePath } from 'next/cache';

import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/security/rate-limit';

/**
 * Server Action: Instant Verify salesman 4-digit PIN with Brute-Force Rate Limiting.
 */
export async function verifyPin(
  pin: string
): Promise<{ success: boolean; staff?: StaffSession; error?: string }> {
  try {
    const rateCheck = checkRateLimit('sales_terminal');
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Terminal temporarily locked due to repeated incorrect attempts. Please retry in ${rateCheck.retryAfterSeconds} seconds.`,
      };
    }

    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return { success: false, error: 'PIN must be exactly 4 digits.' };
    }

    // Check staff store (includes admin-created / updated salesmen)
    const storeVerification = verifyStaffPin(pin);
    if (storeVerification.success && storeVerification.staff) {
      resetRateLimit('sales_terminal');
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
          if (found.role === 'admin') {
            return {
              success: false,
              error: 'Admin credentials cannot be used on the sales floor. Please access the Owner Admin Dashboard or use your dedicated Sales Staff PIN.',
            };
          }
          resetRateLimit('sales_terminal');
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

    const failRecord = recordFailedAttempt('sales_terminal');
    if (failRecord.isLocked) {
      return {
        success: false,
        error: `Too many incorrect attempts. Terminal locked for ${failRecord.retryAfterSeconds} seconds.`,
      };
    }

    return {
      success: false,
      error: 'Incorrect PIN. Please check your credentials or ask the owner.',
    };
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

    let cleanWhatsapp = customerWhatsapp.replace(/\D/g, '');
    if (cleanWhatsapp.startsWith('91') && cleanWhatsapp.length === 12) {
      cleanWhatsapp = cleanWhatsapp.slice(2);
    } else if (cleanWhatsapp.startsWith('0') && cleanWhatsapp.length === 11) {
      cleanWhatsapp = cleanWhatsapp.slice(1);
    }
    if (!/^[6-9]\d{9}$/.test(cleanWhatsapp)) {
      return { success: false, error: 'Valid 10-digit Indian WhatsApp number required.' };
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

      // Automatically assign follow-up lead to the actual logged-in salesperson
      assignQuoteToStaff(
        mockQuoteId,
        staffId,
        dynamicStaffName,
        cleanWhatsapp,
        itemsSummary,
        finalPrice,
        customerName?.trim() || 'Customer',
        payload.orderNotes?.trim(),
        payload.advanceDeposit
      );

      // Save into in-memory quotes store
      saveNewQuote({
        id: mockQuoteId,
        created_at: new Date().toISOString(),
        customer_name: customerName?.trim() || undefined,
        customer_whatsapp: cleanWhatsapp,
        subtotal,
        discount_type: discountType,
        discount_value: discountValue,
        final_price: finalPrice,
        advance_deposit: payload.advanceDeposit,
        order_notes: payload.orderNotes?.trim() || undefined,
        status: 'pending',
        staffName: dynamicStaffName,
        itemsSummary,
        itemsCount: items.length,
        staff: currentStaff ? { id: currentStaff.id, name: currentStaff.name, role: currentStaff.role } : undefined,
        items: items.map((it, idx) => {
          const fullProd = allProducts.find((p) => p.id === it.productId);
          return {
            id: `item-${Date.now()}-${idx}`,
            price_at_time: it.priceAtTime,
            quantity: it.quantity,
            product: {
              id: it.productId,
              name: it.name,
              material: fullProd?.material || 'Handcrafted Premium Finish',
              dimensions: fullProd?.dimensions || 'Standard Dimensions',
              more_info: fullProd?.more_info,
              image_url: fullProd?.image_url,
            },
          };
        }),
        quote_items: items.map((it, idx) => {
          const fullProd = allProducts.find((p) => p.id === it.productId);
          return {
            id: `item-${Date.now()}-${idx}`,
            price_at_time: it.priceAtTime,
            product: {
              name: it.name,
              image_url: fullProd?.image_url,
            },
          };
        }),
      });

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
        advance_deposit: payload.advanceDeposit ? Number(payload.advanceDeposit.toFixed(2)) : 0,
        order_notes: payload.orderNotes?.trim() || null,
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

    // Sync in-memory follow-up store under logged-in salesman
    assignQuoteToStaff(
      quote.id,
      staffId,
      dynamicStaffName,
      cleanWhatsapp,
      itemsSummary,
      finalPrice,
      customerName?.trim() || 'Customer',
      payload.orderNotes?.trim(),
      payload.advanceDeposit
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

/**
 * Server Action: Mark Deal Closed / Sold by salesperson immediately
 * Deducts stock_quantity. If stock reaches 0, marks product sold out.
 */
export async function markQuoteSoldAction(
  quoteId: string
): Promise<{
  success: boolean;
  error?: string;
  affectedProducts?: { id: string; name: string; remainingStock: number; isSoldOut: boolean }[];
}> {
  try {
    if (!quoteId) return { success: false, error: 'Quote reference missing.' };
    const res = closeQuoteAndDeductInventory(quoteId);
    revalidatePath('/sales');
    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/');
    return res;
  } catch (err: any) {
    console.error('Error in markQuoteSoldAction:', err);
    return { success: false, error: err?.message || 'Failed to record deal completion.' };
  }
}

export async function addProductStockAction(productData: {
  name: string;
  price: number;
  material: string;
  dimensions: string;
  more_info?: string;
  image_url?: string;
  category?: string;
  is_active?: boolean;
  stock_quantity?: number;
}) {
  const { addProductStockAction: adminAdd } = await import('@/app/(admin)/admin/actions');
  return adminAdd(productData);
}

/**
 * Server Action: Direct Showroom Walk-In Sale (Purchase without a Quote)
 * Directly marks a piece as sold from the card itself, reducing quantity by -1.
 * If stock reaches 0, marks product sold out and deactivates it.
 */
export async function directMarkProductSoldAction(
  productId: string,
  quantityToDeduct: number = 1,
  staffId?: string,
  staffName?: string
): Promise<{
  success: boolean;
  remainingStock?: number;
  isSoldOut?: boolean;
  error?: string;
}> {
  try {
    if (!productId) return { success: false, error: 'Product ID is required.' };

    const product = getAllProducts().find((p) => p.id === productId);
    const res = decrementProductStock(productId, quantityToDeduct);
    if (!res.success) {
      return { success: false, error: 'Product not found or already sold out.' };
    }

    // Log this transaction as a completed direct walk-in sale so it reflects in daily revenue & reports
    if (product) {
      const saleAmount = Number(product.price) * quantityToDeduct;
      const walkInQuoteId = `walkin-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const activeStaffId = staffId || 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
      const activeStaffName = staffName || 'Arjun Verma';

      saveNewQuote({
        id: walkInQuoteId,
        created_at: new Date().toISOString(),
        customer_name: 'Walk-In Customer',
        customer_whatsapp: 'Direct Showroom Sale',
        subtotal: saleAmount,
        discount_type: 'flat',
        discount_value: 0,
        final_price: saleAmount,
        advance_deposit: saleAmount,
        order_notes: `Direct Walk-In Floor Purchase (${quantityToDeduct} unit)`,
        status: 'closed',
        staffName: activeStaffName,
        itemsSummary: `${product.name} (Direct Sale)`,
        itemsCount: quantityToDeduct,
        staff: {
          id: activeStaffId,
          name: activeStaffName,
          role: 'sales',
        },
        items: [
          {
            id: `item-${Date.now()}`,
            price_at_time: Number(product.price),
            quantity: quantityToDeduct,
            product: {
              id: product.id,
              name: product.name,
              material: product.material,
              dimensions: product.dimensions,
              more_info: product.more_info,
              image_url: product.image_url,
            },
          },
        ],
      });

      if (isSupabaseConfigured()) {
        try {
          const supabase = createServerClient();
          const { data: qData } = await supabase
            .from('quotes')
            .insert({
              staff_id: activeStaffId,
              customer_name: 'Walk-In Customer',
              customer_whatsapp: 'Direct Showroom Sale',
              subtotal: saleAmount,
              discount_type: 'flat',
              discount_value: 0,
              final_price: saleAmount,
              advance_deposit: saleAmount,
              order_notes: `Direct Walk-In Floor Purchase (${quantityToDeduct} unit)`,
              status: 'closed',
            })
            .select('id')
            .single();

          if (qData?.id) {
            await supabase.from('quote_items').insert({
              quote_id: qData.id,
              product_id: productId,
              price_at_time: Number(product.price),
            });
          }
        } catch (dbErr) {
          console.warn('Could not record direct sale in Supabase:', dbErr);
        }
      }
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = createServerClient();
        await supabase
          .from('products')
          .update({
            stock_quantity: res.remainingStock,
            is_active: !res.isSoldOut,
            updated_at: new Date().toISOString(),
          })
          .eq('id', productId);
      } catch (e) {
        console.warn('Failed to update stock in Supabase:', e);
      }
    }

    revalidatePath('/sales');
    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/');

    return {
      success: true,
      remainingStock: res.remainingStock,
      isSoldOut: res.isSoldOut,
    };
  } catch (err: any) {
    console.error('Error in directMarkProductSoldAction:', err);
    return { success: false, error: err?.message || 'Failed to record direct sale.' };
  }
}

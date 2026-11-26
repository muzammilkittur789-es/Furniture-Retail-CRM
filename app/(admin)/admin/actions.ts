'use server';

import { createServerClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { StaffSession, QuoteStatus, StaffRole, Product, FollowUpLead, FollowUpStatus } from '@/lib/types/database';
import { revalidatePath } from 'next/cache';
import {
  getAllStaffMembers,
  addStaffMember,
  updateStaffPin,
  updateStaffMember,
  toggleStaffActiveStatus,
  deleteStaffMember,
  StaffMember,
  addNewProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  restockProduct,
  getFollowUpsForStaff,
  getAllFollowUps,
  updateFollowUpStatus,
  assignFollowUpLead,
  assignQuoteToStaff,
  releaseProductHoldByQuoteId,
  updateQuoteStatusInStore,
  getQuoteById,
  closeQuoteAndDeductInventory,
  getAllProducts,
} from '@/lib/store/showroom-store';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/security/rate-limit';

const ADMIN_SEED_PIN = '1234';
const ADMIN_SEED_STAFF: StaffSession = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  name: 'Vikram Mehta (Owner)',
  role: 'admin',
};

export async function verifyAdminPin(
  pin: string
): Promise<{ success: boolean; staff?: StaffSession; error?: string }> {
  try {
    const rateCheck = checkRateLimit('admin_terminal');
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Admin access locked due to repeated unauthorized attempts. Please retry in ${rateCheck.retryAfterSeconds} seconds.`,
      };
    }

    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return { success: false, error: 'Admin PIN must be exactly 4 digits.' };
    }

    if (pin === ADMIN_SEED_PIN) {
      resetRateLimit('admin_terminal');
      return {
        success: true,
        staff: ADMIN_SEED_STAFF,
      };
    }

    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const { data: adminStaff } = await supabase
        .from('staff')
        .select('id, name, role, is_active')
        .eq('role', 'admin')
        .eq('is_active', true);

      if (adminStaff && adminStaff.length > 0) {
        const found = adminStaff.find((s: any) => s.pin === pin || s.pin_hash === pin);
        if (found) {
          resetRateLimit('admin_terminal');
          return {
            success: true,
            staff: {
              id: found.id,
              name: found.name,
              role: 'admin',
            },
          };
        }
      }
    }

    const failRecord = recordFailedAttempt('admin_terminal');
    if (failRecord.isLocked) {
      return {
        success: false,
        error: `Too many incorrect attempts. Admin portal locked for ${failRecord.retryAfterSeconds} seconds.`,
      };
    }

    return {
      success: false,
      error: 'Unauthorized. The entered PIN does not have Admin privileges.',
    };
  } catch (err) {
    console.error('Error verifying admin PIN:', err);
    return { success: false, error: 'Failed to verify admin security credentials.' };
  }
}

export async function updateQuoteStatus(
  quoteId: string,
  newStatus: QuoteStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!quoteId || !newStatus) {
      return { success: false, error: 'Missing quote identifier or status.' };
    }

    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      await supabase
        .from('quotes')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', quoteId);

      if (newStatus === 'closed') {
        try {
          const { data: qItems } = await supabase
            .from('quote_items')
            .select('product_id')
            .eq('quote_id', quoteId);
          if (qItems && qItems.length > 0) {
            const pIds = qItems.map((qi: any) => qi.product_id);
            await supabase.from('products').update({ is_active: false }).in('id', pIds);
          }
        } catch (e) {
          console.warn('Could not mark quote products as sold in Supabase:', e);
        }
      }
    }

    // Sync status in in-memory store
    updateQuoteStatusInStore(quoteId, newStatus);

    // Properly deduct inventory and handle multi-copy stock when deal is closed
    if (newStatus === 'closed') {
      const closeRes = closeQuoteAndDeductInventory(quoteId);

      if (isSupabaseConfigured() && closeRes.affectedProducts) {
        try {
          const supabase = createServerClient();
          for (const aff of closeRes.affectedProducts) {
            await supabase
              .from('products')
              .update({
                stock_quantity: aff.remainingStock,
                is_active: !aff.isSoldOut,
                updated_at: new Date().toISOString(),
              })
              .eq('id', aff.id);
          }
        } catch (e) {
          console.warn('Could not sync stock to Supabase on admin deal closure:', e);
        }
      }
    }

    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/admin/analytics');
    revalidatePath('/sales');

    return { success: true };
  } catch (err) {
    console.error('Error in updateQuoteStatus:', err);
    return { success: false, error: 'Failed to update quote status.' };
  }
}

export async function toggleProductStockStatus(
  productId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!productId) {
      return { success: false, error: 'Missing product identifier.' };
    }

    toggleProductActive(productId, isActive);

    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      await supabase
        .from('products')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);
    }

    revalidatePath('/admin/products');
    revalidatePath('/sales');

    return { success: true };
  } catch (err) {
    console.error('Error in toggleProductStockStatus:', err);
    return { success: false, error: 'Failed to update product stock status.' };
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
}): Promise<{ success: boolean; product?: Product; error?: string }> {
  try {
    if (!productData.name || !productData.price || !productData.material || !productData.dimensions) {
      return { success: false, error: 'Please fill in all furniture details (Name, Price, Material, Dimensions).' };
    }

    const cleanName = productData.name.trim().slice(0, 100);
    const cleanPrice = Math.max(0, Number(productData.price) || 0);
    const cleanStock = Math.max(1, Math.min(999, parseInt(String(productData.stock_quantity || 1)) || 1));

    const newProd = addNewProduct({
      ...productData,
      name: cleanName,
      price: cleanPrice,
      stock_quantity: cleanStock,
    });

    if (isSupabaseConfigured()) {
      try {
        const supabase = createServerClient();
        await supabase.from('products').insert([
          {
            name: productData.name,
            price: Number(productData.price),
            material: productData.material,
            dimensions: productData.dimensions,
            more_info: productData.more_info || null,
            image_url: newProd.image_url,
            is_active: true,
            category: newProd.category,
          },
        ]);
      } catch (e) {
        console.warn('Failed to insert product into Supabase:', e);
      }
    }

    revalidatePath('/admin/products');
    revalidatePath('/sales');

    return { success: true, product: newProd };
  } catch (err) {
    console.error('Error adding product:', err);
    return { success: false, error: 'Failed to add new furniture product.' };
  }
}

export async function updateProductStockAction(
  productId: string,
  productData: {
    name?: string;
    price?: number;
    material?: string;
    dimensions?: string;
    more_info?: string;
    image_url?: string;
    category?: string;
    is_active?: boolean;
    stock_quantity?: number;
  }
): Promise<{ success: boolean; product?: Product; error?: string }> {
  try {
    if (!productId) {
      return { success: false, error: 'Missing product ID.' };
    }

    const updated = updateProduct(productId, productData);
    if (!updated) {
      return { success: false, error: 'Product not found in stock.' };
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = createServerClient();
        await supabase
          .from('products')
          .update({
            ...(productData.name && { name: productData.name }),
            ...(productData.price && { price: Number(productData.price) }),
            ...(productData.material && { material: productData.material }),
            ...(productData.dimensions && { dimensions: productData.dimensions }),
            ...(productData.more_info !== undefined && { more_info: productData.more_info || null }),
            ...(productData.image_url && { image_url: productData.image_url }),
            ...(productData.category && { category: productData.category }),
            ...(productData.is_active !== undefined && { is_active: productData.is_active }),
            updated_at: new Date().toISOString(),
          })
          .eq('id', productId);
      } catch (e) {
        console.warn('Failed to update product in Supabase:', e);
      }
    }

    revalidatePath('/admin/products');
    revalidatePath('/sales');

    return { success: true, product: updated };
  } catch (err) {
    console.error('Error updating product:', err);
    return { success: false, error: 'Failed to update furniture piece.' };
  }
}

export async function deleteProductStockAction(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!productId) {
      return { success: false, error: 'Missing product ID.' };
    }

    const ok = deleteProduct(productId);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createServerClient();
        await supabase.from('products').delete().eq('id', productId);
      } catch (e) {
        console.warn('Failed to delete product from Supabase:', e);
      }
    }

    revalidatePath('/admin/products');
    revalidatePath('/sales');

    return { success: true };
  } catch (err) {
    console.error('Error deleting product:', err);
    return { success: false, error: 'Failed to delete furniture piece.' };
  }
}

export async function restockProductStockAction(
  productId: string,
  quantityToAdd: number
): Promise<{ success: boolean; newStock?: number; error?: string }> {
  try {
    if (!productId || quantityToAdd <= 0) {
      return { success: false, error: 'Invalid product or restock quantity.' };
    }

    const cleanQty = Math.max(1, Math.min(500, Math.floor(quantityToAdd) || 1));
    const res = restockProduct(productId, cleanQty);
    revalidatePath('/admin/products');
    revalidatePath('/sales');
    revalidatePath('/');

    return { success: res.success, newStock: res.newStock };
  } catch (err) {
    console.error('Error restocking product:', err);
    return { success: false, error: 'Failed to restock furniture piece.' };
  }
}

/* =====================================================================
 * PENDING FOLLOW-UPS ACTIONS (LEADS ASSIGNED FOR MORNING CALLS)
 * ===================================================================== */

export async function getStaffFollowUpsAction(staffId: string): Promise<{
  success: boolean;
  leads: FollowUpLead[];
  error?: string;
}> {
  try {
    const list = getFollowUpsForStaff(staffId);
    return { success: true, leads: list };
  } catch (err) {
    console.error('Error getting follow-ups:', err);
    return { success: false, leads: [], error: 'Failed to fetch follow-ups.' };
  }
}

export async function updateFollowUpStatusAction(
  leadId: string,
  newStatus: FollowUpStatus,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ok = updateFollowUpStatus(leadId, newStatus, notes);
    if (!ok) {
      return { success: false, error: 'Follow-up lead not found.' };
    }

    revalidatePath('/sales');
    revalidatePath('/admin');

    return { success: true };
  } catch (err) {
    console.error('Error updating follow up:', err);
    return { success: false, error: 'Failed to update follow-up.' };
  }
}

export async function assignFollowUpLeadAction(
  leadData: Partial<FollowUpLead>
): Promise<{ success: boolean; lead?: FollowUpLead; error?: string }> {
  try {
    const lead = assignFollowUpLead(leadData);
    revalidatePath('/sales');
    revalidatePath('/admin');
    return { success: true, lead };
  } catch (err) {
    console.error('Error assigning lead:', err);
    return { success: false, error: 'Failed to assign lead.' };
  }
}

export async function assignQuoteToStaffAction(
  quoteId: string,
  staffId: string,
  staffName: string,
  customerWhatsapp: string,
  itemsSummary: string,
  quotedAmount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    assignQuoteToStaff(
      quoteId,
      staffId,
      staffName,
      customerWhatsapp,
      itemsSummary,
      quotedAmount
    );

    if (isSupabaseConfigured()) {
      try {
        const supabase = createServerClient();
        await supabase
          .from('quotes')
          .update({
            staff_id: staffId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', quoteId);
      } catch (e) {
        console.warn('Failed to update quote staff in Supabase:', e);
      }
    }

    revalidatePath('/admin');
    revalidatePath('/sales');

    return { success: true };
  } catch (err) {
    console.error('Error assigning quote to staff:', err);
    return { success: false, error: 'Failed to assign quote to salesperson.' };
  }
}

/* =====================================================================
 * SALES STAFF CREDENTIALS MANAGEMENT ACTIONS
 * ===================================================================== */

export async function getStaffListAction(): Promise<{
  success: boolean;
  staff: StaffMember[];
  error?: string;
}> {
  try {
    const list = getAllStaffMembers();
    return { success: true, staff: list };
  } catch (err) {
    console.error('Error fetching staff list:', err);
    return { success: false, staff: [], error: 'Failed to load staff list.' };
  }
}

export async function createStaffAction(
  name: string,
  pin: string,
  role: StaffRole = 'sales'
): Promise<{ success: boolean; staff?: StaffMember; error?: string }> {
  try {
    if (!name || name.trim().length < 2) {
      return { success: false, error: 'Please enter a valid staff name (at least 2 letters).' };
    }

    const cleanPin = pin.trim();
    if (!cleanPin || cleanPin.length !== 4 || !/^\d{4}$/.test(cleanPin)) {
      return { success: false, error: 'PIN must be exactly 4 digits (e.g. 1111).' };
    }

    const existingStaff = getAllStaffMembers().find((s) => s.pin === cleanPin && s.is_active);
    if (existingStaff) {
      return {
        success: false,
        error: `PIN ${cleanPin} is already assigned to "${existingStaff.name}". Every staff member must have a unique PIN.`,
      };
    }

    const newStaff = addStaffMember(name.trim().slice(0, 80), cleanPin, role);

    revalidatePath('/admin/staff');
    revalidatePath('/sales');

    return { success: true, staff: newStaff };
  } catch (err) {
    console.error('Error creating staff member:', err);
    return { success: false, error: 'Failed to create staff member.' };
  }
}

export async function updateStaffPinAction(
  id: string,
  newPin: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanPin = newPin.trim();
    if (!cleanPin || cleanPin.length !== 4 || !/^\d{4}$/.test(cleanPin)) {
      return { success: false, error: 'PIN must be exactly 4 digits.' };
    }

    const existingStaff = getAllStaffMembers().find((s) => s.pin === cleanPin && s.is_active && s.id !== id);
    if (existingStaff) {
      return {
        success: false,
        error: `PIN ${cleanPin} is already in use by "${existingStaff.name}". Every staff member must have a unique PIN.`,
      };
    }

    const ok = updateStaffPin(id, cleanPin);
    if (!ok) {
      return { success: false, error: 'Staff member not found.' };
    }

    revalidatePath('/admin/staff');
    revalidatePath('/sales');

    return { success: true };
  } catch (err) {
    console.error('Error updating staff PIN:', err);
    return { success: false, error: 'Failed to update staff PIN.' };
  }
}

export async function updateStaffDetailsAction(
  id: string,
  name: string,
  pin: string
): Promise<{ success: boolean; staff?: StaffMember; error?: string }> {
  try {
    const res = updateStaffMember(id, name, pin);
    if (!res.success) {
      return res;
    }

    revalidatePath('/admin/staff');
    revalidatePath('/sales');

    return res;
  } catch (err: any) {
    console.error('Error updating staff details:', err);
    return { success: false, error: err.message || 'Failed to update staff details.' };
  }
}

export async function toggleStaffStatusAction(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const target = getAllStaffMembers().find((s) => s.id === id);
    if (target && target.role === 'admin' && !isActive) {
      return { success: false, error: 'The primary Showroom Owner account cannot be deactivated.' };
    }

    const ok = toggleStaffActiveStatus(id, isActive);
    if (!ok) {
      return { success: false, error: 'Staff member not found.' };
    }

    revalidatePath('/admin/staff');
    revalidatePath('/sales');

    return { success: true };
  } catch (err) {
    console.error('Error toggling staff status:', err);
    return { success: false, error: 'Failed to update staff status.' };
  }
}

export async function deleteStaffAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const target = getAllStaffMembers().find((s) => s.id === id);
    if (target && target.role === 'admin') {
      return { success: false, error: 'The primary Showroom Owner account cannot be deleted.' };
    }

    const ok = deleteStaffMember(id);
    if (!ok) {
      return { success: false, error: 'Staff member not found or cannot be deleted.' };
    }

    revalidatePath('/admin/staff');
    revalidatePath('/sales');

    return { success: true };
  } catch (err) {
    console.error('Error deleting staff member:', err);
    return { success: false, error: 'Failed to delete staff member.' };
  }
}

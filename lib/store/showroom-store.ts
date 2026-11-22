import {
  StaffRole,
  StaffSession,
  Product,
  FollowUpLead,
  FollowUpStatus,
  DiscountType,
  QuoteStatus,
} from '@/lib/types/database';

export interface StaffMember {
  id: string;
  name: string;
  pin: string;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
}

export interface ProductHold {
  productId: string;
  productName: string;
  quoteId: string;
  lockedAt: number; // timestamp
  expiresAt: number; // timestamp (lockedAt + 24 hours)
}

export interface StoredQuoteItem {
  id: string;
  price_at_time: number;
  quantity?: number;
  product: {
    id?: string;
    name: string;
    material?: string;
    dimensions?: string;
    more_info?: string;
    image_url?: string;
  };
}

export interface StoredQuote {
  id: string;
  created_at: string;
  customer_name?: string;
  customer_whatsapp: string;
  subtotal: number;
  discount_type?: DiscountType;
  discount_value?: number;
  final_price: number;
  advance_deposit?: number;
  order_notes?: string;
  status: QuoteStatus;
  staffName: string;
  itemsSummary: string;
  itemsCount: number;
  staff?: {
    id: string;
    name: string;
    role: string;
  };
  items: StoredQuoteItem[];
  quote_items?: {
    id: string;
    price_at_time: number;
    product: {
      name: string;
      image_url?: string;
    };
  }[];
}

// In-memory persistent server cache (persists across requests during server runtime)
declare global {
  var __ALISHAN_STAFF_STORE__: StaffMember[] | undefined;
  var __ALISHAN_PRODUCT_HOLDS__: ProductHold[] | undefined;
  var __ALISHAN_PRODUCTS_STORE__: Product[] | undefined;
  var __ALISHAN_FOLLOWUPS_STORE__: FollowUpLead[] | undefined;
  var __ALISHAN_QUOTES_STORE__: StoredQuote[] | undefined;
}

const DEFAULT_STAFF: StaffMember[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Vikram Mehta (Owner)',
    pin: '1234',
    role: 'admin',
    is_active: true,
    created_at: '2026-11-01T10:00:00.000Z',
  },
  {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    name: 'Arjun Verma',
    pin: '1111',
    role: 'sales',
    is_active: true,
    created_at: '2026-11-05T10:00:00.000Z',
  },
  {
    id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    name: 'Sneha Kapoor',
    pin: '2222',
    role: 'sales',
    is_active: true,
    created_at: '2026-11-08T10:00:00.000Z',
  },
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    name: 'The Florence Bouclé Sectional',
    price: 385000.0,
    material: 'Italian Bouclé & Smoked Oak Plinth',
    dimensions: '340cm x 180cm x 78cm',
    more_info: '3-Seater L-Shape with Left Chaise',
    category: 'Living Room',
    image_url:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    is_active: true,
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    name: 'Verona Carrara Marble Dining Table',
    price: 245000.0,
    material: 'Honed Carrara Marble & Brushed Brass Trestle',
    dimensions: '240cm x 110cm x 76cm',
    more_info: '6-Seater Solid Marble Top',
    category: 'Dining Room',
    image_url:
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
    is_active: true,
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    name: 'Aurelia Cognac Leather Lounge Chair',
    price: 115000.0,
    material: 'Full-Grain Tuscan Leather & American Walnut',
    dimensions: '88cm x 92cm x 82cm',
    more_info: 'Single Seater Accent Armchair',
    category: 'Living Room',
    image_url:
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80',
    is_active: true,
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    name: 'Kyoto Low-Profile King Bedstead',
    price: 290000.0,
    material: 'Solid White American Ash & Belgian Linen',
    dimensions: '215cm x 205cm x 95cm',
    more_info: 'King Size (Fits 72" x 78" Mattress)',
    category: 'Bedroom',
    image_url:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    is_active: true,
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
    name: 'Tivoli Roman Travertine Coffee Table',
    price: 98000.0,
    material: 'Honed Natural Travertine Slab',
    dimensions: '130cm x 80cm x 36cm',
    more_info: 'Natural Stone Top',
    category: 'Coffee Tables & Storage',
    image_url:
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80',
    is_active: true,
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99',
    name: 'Monolith Fluted Oak Credenza',
    price: 175000.0,
    material: 'Fumed Oak Veneer & Ribbed Cast Glass',
    dimensions: '200cm x 50cm x 75cm',
    more_info: '4-Door Storage Cabinet',
    category: 'Coffee Tables & Storage',
    image_url:
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80',
    is_active: true,
  },
];

export const DEFAULT_FOLLOWUPS: FollowUpLead[] = [
  {
    id: 'lead-1',
    customerName: 'Rajesh Khanna',
    customerWhatsapp: '9876543210',
    assignedStaffId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', // Arjun Verma
    assignedStaffName: 'Arjun Verma',
    quoteId: 'quote-101',
    itemsSummary: 'The Florence Bouclé Sectional',
    quotedAmount: 385000,
    status: 'pending',
    priority: 'high',
    managerNote:
      'Customer loved the white bouclé fabric. Call at 10:30 AM to confirm delivery date and offer free cushion pairing.',
    scheduledFor: 'Morning 10:30 AM',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'lead-2',
    customerName: 'Priya Sharma',
    customerWhatsapp: '9123456789',
    assignedStaffId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', // Arjun Verma
    assignedStaffName: 'Arjun Verma',
    quoteId: 'quote-102',
    itemsSummary: 'Verona Carrara Marble Dining Table',
    quotedAmount: 245000,
    status: 'pending',
    priority: 'high',
    managerNote:
      'Wife wanted to check with interior designer. Call this morning with special 5% package discount.',
    scheduledFor: 'Morning 11:15 AM',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'lead-3',
    customerName: 'Amit Patel',
    customerWhatsapp: '9845012345',
    assignedStaffId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', // Sneha Kapoor
    assignedStaffName: 'Sneha Kapoor',
    quoteId: 'quote-103',
    itemsSummary: 'Kyoto Low-Profile King Bedstead',
    quotedAmount: 290000,
    status: 'pending',
    priority: 'medium',
    managerNote:
      'Urgent bedroom makeover for new flat. Call to confirm room measurement visit.',
    scheduledFor: 'Morning 10:45 AM',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'lead-4',
    customerName: 'Kavita Singhania',
    customerWhatsapp: '9988776655',
    assignedStaffId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', // Sneha Kapoor
    assignedStaffName: 'Sneha Kapoor',
    quoteId: 'quote-104',
    itemsSummary: 'Aurelia Cognac Lounge Chair + Tivoli Table',
    quotedAmount: 213000,
    status: 'called_interested',
    priority: 'high',
    managerNote:
      'Spoke yesterday. Re-confirm payment token today morning before 12 PM.',
    scheduledFor: 'Morning 11:45 AM',
    lastUpdated: new Date().toISOString(),
  },
];

export const DEFAULT_QUOTES: StoredQuote[] = [
  {
    id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    customer_name: 'Rajesh Khanna',
    customer_whatsapp: '9876543210',
    subtotal: 630000,
    final_price: 567000,
    status: 'pending',
    staffName: 'Arjun Verma',
    itemsSummary: 'The Florence Bouclé Sectional + 1 more',
    itemsCount: 2,
    staff: {
      id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      name: 'Arjun Verma',
      role: 'sales',
    },
    items: [
      {
        id: 'item-1',
        price_at_time: 385000,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
          name: 'The Florence Bouclé Sectional',
          material: 'Italian Bouclé & Smoked Oak Plinth',
          dimensions: '340cm x 180cm x 78cm',
          more_info: '3-Seater L-Shape with Left Chaise',
          image_url:
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
        },
      },
      {
        id: 'item-2',
        price_at_time: 245000,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
          name: 'Verona Carrara Marble Dining Table',
          material: 'Honed Carrara Marble & Brushed Brass Trestle',
          dimensions: '240cm x 110cm x 76cm',
          more_info: '6-Seater Solid Marble Top',
          image_url:
            'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-1',
        price_at_time: 385000,
        product: {
          name: 'The Florence Bouclé Sectional',
          image_url:
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
        },
      },
      {
        id: 'item-2',
        price_at_time: 245000,
        product: {
          name: 'Verona Carrara Marble Dining Table',
          image_url:
            'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
  {
    id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    customer_name: 'Priya Sharma',
    customer_whatsapp: '9123456789',
    subtotal: 245000,
    final_price: 220500,
    status: 'pending',
    staffName: 'Sneha Kapoor',
    itemsSummary: 'Verona Carrara Marble Dining Table',
    itemsCount: 1,
    staff: {
      id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      name: 'Sneha Kapoor',
      role: 'sales',
    },
    items: [
      {
        id: 'item-3',
        price_at_time: 245000,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
          name: 'Verona Carrara Marble Dining Table',
          material: 'Honed Carrara Marble & Brushed Brass Trestle',
          dimensions: '240cm x 110cm x 76cm',
          more_info: '6-Seater Solid Marble Top',
          image_url:
            'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-3',
        price_at_time: 245000,
        product: {
          name: 'Verona Carrara Marble Dining Table',
          image_url:
            'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
  {
    id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    customer_name: 'Amit Patel',
    customer_whatsapp: '9845012345',
    subtotal: 405000,
    final_price: 364500,
    status: 'pending',
    staffName: 'Arjun Verma',
    itemsSummary: 'Aurelia Cognac Leather Lounge Chair + 1 more',
    itemsCount: 2,
    staff: {
      id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      name: 'Arjun Verma',
      role: 'sales',
    },
    items: [
      {
        id: 'item-4',
        price_at_time: 115000,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
          name: 'Aurelia Cognac Leather Lounge Chair',
          material: 'Full-Grain Tuscan Leather & American Walnut',
          dimensions: '88cm x 92cm x 82cm',
          more_info: 'Single Seater Accent Armchair',
          image_url:
            'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80',
        },
      },
      {
        id: 'item-5',
        price_at_time: 290000,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
          name: 'Kyoto Low-Profile King Bedstead',
          material: 'Solid White American Ash & Belgian Linen',
          dimensions: '215cm x 205cm x 95cm',
          more_info: 'King Size (Fits 72" x 78" Mattress)',
          image_url:
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-4',
        price_at_time: 115000,
        product: {
          name: 'Aurelia Cognac Leather Lounge Chair',
          image_url:
            'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80',
        },
      },
      {
        id: 'item-5',
        price_at_time: 290000,
        product: {
          name: 'Kyoto Low-Profile King Bedstead',
          image_url:
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
  {
    id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    created_at: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    customer_name: 'Kavita Singhania',
    customer_whatsapp: '9988776655',
    subtotal: 213000,
    final_price: 205000,
    status: 'closed',
    staffName: 'Sneha Kapoor',
    itemsSummary: 'Aurelia Cognac Leather Lounge Chair',
    itemsCount: 1,
    staff: {
      id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      name: 'Sneha Kapoor',
      role: 'sales',
    },
    items: [
      {
        id: 'item-7',
        price_at_time: 205000,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
          name: 'Aurelia Cognac Leather Lounge Chair',
          material: 'Full-Grain Tuscan Leather & American Walnut',
          dimensions: '88cm x 92cm x 82cm',
          more_info: 'Single Seater Accent Armchair',
          image_url:
            'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-7',
        price_at_time: 205000,
        product: {
          name: 'Aurelia Cognac Leather Lounge Chair',
          image_url:
            'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
];

// Initialize global stores if not already present
if (!global.__ALISHAN_STAFF_STORE__) {
  global.__ALISHAN_STAFF_STORE__ = [...DEFAULT_STAFF];
}

if (!global.__ALISHAN_PRODUCTS_STORE__) {
  global.__ALISHAN_PRODUCTS_STORE__ = [...DEFAULT_PRODUCTS];
}

if (!global.__ALISHAN_FOLLOWUPS_STORE__) {
  global.__ALISHAN_FOLLOWUPS_STORE__ = [...DEFAULT_FOLLOWUPS];
}

if (!global.__ALISHAN_QUOTES_STORE__) {
  global.__ALISHAN_QUOTES_STORE__ = [...DEFAULT_QUOTES];
}

// Pre-seed an active 24-hr hold for demonstration (e.g. Tivoli Roman Travertine Coffee Table quoted 4 hours ago)
if (!global.__ALISHAN_PRODUCT_HOLDS__) {
  const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000;
  global.__ALISHAN_PRODUCT_HOLDS__ = [
    {
      productId: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
      productName: 'Tivoli Roman Travertine Coffee Table',
      quoteId: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      lockedAt: fourHoursAgo,
      expiresAt: fourHoursAgo + 24 * 60 * 60 * 1000,
    },
  ];
}

/* =====================================================================
 * 1. STAFF CREDENTIALS CONTROLS
 * ===================================================================== */

export function getAllStaffMembers(): StaffMember[] {
  return global.__ALISHAN_STAFF_STORE__ || DEFAULT_STAFF;
}

export function addStaffMember(name: string, pin: string, role: StaffRole = 'sales'): StaffMember {
  const cleanPin = pin.trim();
  const newStaff: StaffMember = {
    id: 'staff-' + Date.now(),
    name: name.trim(),
    pin: cleanPin,
    role,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  global.__ALISHAN_STAFF_STORE__ = [...(global.__ALISHAN_STAFF_STORE__ || []), newStaff];
  return newStaff;
}

export function updateStaffPin(id: string, newPin: string): boolean {
  if (!global.__ALISHAN_STAFF_STORE__) return false;
  const index = global.__ALISHAN_STAFF_STORE__.findIndex((s) => s.id === id);
  if (index === -1) return false;

  global.__ALISHAN_STAFF_STORE__[index].pin = newPin.trim();
  return true;
}

export function toggleStaffActiveStatus(id: string, isActive: boolean): boolean {
  if (!global.__ALISHAN_STAFF_STORE__) return false;
  const index = global.__ALISHAN_STAFF_STORE__.findIndex((s) => s.id === id);
  if (index === -1) return false;

  global.__ALISHAN_STAFF_STORE__[index].is_active = isActive;
  return true;
}

export function deleteStaffMember(id: string): boolean {
  if (!global.__ALISHAN_STAFF_STORE__) return false;
  const initialLength = global.__ALISHAN_STAFF_STORE__.length;
  global.__ALISHAN_STAFF_STORE__ = global.__ALISHAN_STAFF_STORE__.filter((s) => s.id !== id);
  return global.__ALISHAN_STAFF_STORE__.length < initialLength;
}

export function verifyStaffPin(pin: string): { success: boolean; staff?: StaffSession; error?: string } {
  const staffList = getAllStaffMembers();
  const found = staffList.find((s) => s.pin === pin && s.is_active);

  if (found) {
    return {
      success: true,
      staff: {
        id: found.id,
        name: found.name,
        role: found.role,
      },
    };
  }

  return {
    success: false,
    error: 'Invalid PIN or account deactivated.',
  };
}

/* =====================================================================
 * 2. 24-HOUR PRODUCT QUOTE LOCK / HOLD LOGIC
 * ===================================================================== */

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function cleanupExpiredHolds(): void {
  const now = Date.now();
  if (global.__ALISHAN_PRODUCT_HOLDS__) {
    global.__ALISHAN_PRODUCT_HOLDS__ = global.__ALISHAN_PRODUCT_HOLDS__.filter(
      (hold) => hold.expiresAt > now
    );
  }
}

export function getProductHoldStatus(productId: string): {
  isLocked: boolean;
  expiresAt?: number;
  remainingHours?: number;
  remainingMinutes?: number;
  lockedUntilFormatted?: string;
  productName?: string;
} {
  cleanupExpiredHolds();
  const holds = global.__ALISHAN_PRODUCT_HOLDS__ || [];
  const hold = holds.find((h) => h.productId === productId && h.expiresAt > Date.now());

  if (!hold) {
    return { isLocked: false };
  }

  const remainingMs = Math.max(0, hold.expiresAt - Date.now());
  const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  const lockedDate = new Date(hold.expiresAt);
  const formatted = lockedDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  });

  return {
    isLocked: true,
    expiresAt: hold.expiresAt,
    remainingHours,
    remainingMinutes,
    lockedUntilFormatted: formatted,
    productName: hold.productName,
  };
}

export function lockProductsFor24Hours(
  items: { productId: string; name: string }[],
  quoteId: string
): void {
  const now = Date.now();
  const expiresAt = now + TWENTY_FOUR_HOURS_MS;

  const newHolds: ProductHold[] = items.map((it) => ({
    productId: it.productId,
    productName: it.name,
    quoteId,
    lockedAt: now,
    expiresAt,
  }));

  if (!global.__ALISHAN_PRODUCT_HOLDS__) {
    global.__ALISHAN_PRODUCT_HOLDS__ = [];
  }

  // Remove existing hold for same products if any, then append
  const incomingIds = new Set(items.map((it) => it.productId));
  global.__ALISHAN_PRODUCT_HOLDS__ = [
    ...global.__ALISHAN_PRODUCT_HOLDS__.filter((h) => !incomingIds.has(h.productId)),
    ...newHolds,
  ];
}

export function releaseProductHoldByQuoteId(quoteId: string): void {
  if (global.__ALISHAN_PRODUCT_HOLDS__) {
    global.__ALISHAN_PRODUCT_HOLDS__ = global.__ALISHAN_PRODUCT_HOLDS__.filter(
      (h) => h.quoteId !== quoteId
    );
  }
}

/* =====================================================================
 * 3. FURNITURE STOCK INVENTORY CONTROLS (ADD & DELETE STOCK)
 * ===================================================================== */

export function getAllProducts(): Product[] {
  return global.__ALISHAN_PRODUCTS_STORE__ || DEFAULT_PRODUCTS;
}

export function addNewProduct(productData: {
  name: string;
  price: number;
  material: string;
  dimensions: string;
  more_info?: string;
  image_url?: string;
  category?: string;
  is_active?: boolean;
}): Product {
  const newProduct: Product = {
    id: 'prod-' + Date.now(),
    name: productData.name.trim(),
    price: Number(productData.price),
    material: productData.material.trim(),
    dimensions: productData.dimensions.trim(),
    more_info: productData.more_info?.trim() || undefined,
    category: productData.category?.trim() || 'Living Room',
    image_url:
      productData.image_url?.trim() ||
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    is_active: productData.is_active !== undefined ? productData.is_active : true,
    created_at: new Date().toISOString(),
  };

  const current = global.__ALISHAN_PRODUCTS_STORE__ || DEFAULT_PRODUCTS;
  global.__ALISHAN_PRODUCTS_STORE__ = [newProduct, ...current];
  return newProduct;
}

export function updateProduct(
  productId: string,
  updates: {
    name?: string;
    price?: number;
    material?: string;
    dimensions?: string;
    more_info?: string;
    image_url?: string;
    category?: string;
    is_active?: boolean;
  }
): Product | null {
  if (!global.__ALISHAN_PRODUCTS_STORE__) {
    global.__ALISHAN_PRODUCTS_STORE__ = [...DEFAULT_PRODUCTS];
  }
  const index = global.__ALISHAN_PRODUCTS_STORE__.findIndex((p) => p.id === productId);
  if (index === -1) return null;

  const existing = global.__ALISHAN_PRODUCTS_STORE__[index];
  const updated: Product = {
    ...existing,
    name: updates.name !== undefined ? updates.name.trim() : existing.name,
    price: updates.price !== undefined ? Number(updates.price) : existing.price,
    material: updates.material !== undefined ? updates.material.trim() : existing.material,
    dimensions: updates.dimensions !== undefined ? updates.dimensions.trim() : existing.dimensions,
    more_info: updates.more_info !== undefined ? (updates.more_info.trim() || undefined) : existing.more_info,
    category: updates.category !== undefined ? updates.category.trim() : existing.category,
    image_url: updates.image_url !== undefined ? updates.image_url.trim() : existing.image_url,
    is_active: updates.is_active !== undefined ? updates.is_active : existing.is_active,
    updated_at: new Date().toISOString(),
  };

  global.__ALISHAN_PRODUCTS_STORE__[index] = updated;
  return updated;
}

export function deleteProduct(productId: string): boolean {
  if (!global.__ALISHAN_PRODUCTS_STORE__) {
    global.__ALISHAN_PRODUCTS_STORE__ = [...DEFAULT_PRODUCTS];
  }
  const initialLength = global.__ALISHAN_PRODUCTS_STORE__.length;
  global.__ALISHAN_PRODUCTS_STORE__ = global.__ALISHAN_PRODUCTS_STORE__.filter(
    (p) => p.id !== productId
  );
  return global.__ALISHAN_PRODUCTS_STORE__.length < initialLength;
}

export function toggleProductActive(productId: string, isActive: boolean): boolean {
  if (!global.__ALISHAN_PRODUCTS_STORE__) {
    global.__ALISHAN_PRODUCTS_STORE__ = [...DEFAULT_PRODUCTS];
  }
  const index = global.__ALISHAN_PRODUCTS_STORE__.findIndex((p) => p.id === productId);
  if (index === -1) return false;

  global.__ALISHAN_PRODUCTS_STORE__[index].is_active = isActive;
  return true;
}

/* =====================================================================
 * 4. PENDING FOLLOW-UPS STORE (LEADS ASSIGNED TO SALESMEN)
 * ===================================================================== */

export function getAllFollowUps(): FollowUpLead[] {
  return global.__ALISHAN_FOLLOWUPS_STORE__ || DEFAULT_FOLLOWUPS;
}

export function getFollowUpsForStaff(staffId: string): FollowUpLead[] {
  const all = getAllFollowUps();
  // If admin/owner, show all follow ups, otherwise show staff's assigned leads
  const isOwner = staffId === 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  if (isOwner) return all;

  return all.filter((lead) => lead.assignedStaffId === staffId);
}

export function updateFollowUpStatus(
  leadId: string,
  newStatus: FollowUpStatus,
  notes?: string
): boolean {
  if (!global.__ALISHAN_FOLLOWUPS_STORE__) {
    global.__ALISHAN_FOLLOWUPS_STORE__ = [...DEFAULT_FOLLOWUPS];
  }
  const index = global.__ALISHAN_FOLLOWUPS_STORE__.findIndex((l) => l.id === leadId);
  if (index === -1) return false;

  global.__ALISHAN_FOLLOWUPS_STORE__[index].status = newStatus;
  global.__ALISHAN_FOLLOWUPS_STORE__[index].lastUpdated = new Date().toISOString();
  if (notes) {
    global.__ALISHAN_FOLLOWUPS_STORE__[index].managerNote += ` | Note: ${notes}`;
  }
  return true;
}

export function assignFollowUpLead(leadData: Partial<FollowUpLead>): FollowUpLead {
  const newLead: FollowUpLead = {
    id: 'lead-' + Date.now(),
    customerName: leadData.customerName || 'Customer',
    customerWhatsapp: leadData.customerWhatsapp || '9876543210',
    assignedStaffId: leadData.assignedStaffId || 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    assignedStaffName: leadData.assignedStaffName || 'Arjun Verma',
    quoteId: leadData.quoteId || 'quote-' + Date.now(),
    itemsSummary: leadData.itemsSummary || 'Furniture Package',
    quotedAmount: leadData.quotedAmount || 150000,
    status: 'pending',
    priority: leadData.priority || 'high',
    managerNote: leadData.managerNote || 'Morning follow-up call assigned by manager.',
    scheduledFor: leadData.scheduledFor || 'Morning 10:30 AM',
    lastUpdated: new Date().toISOString(),
  };

  const current = global.__ALISHAN_FOLLOWUPS_STORE__ || DEFAULT_FOLLOWUPS;
  global.__ALISHAN_FOLLOWUPS_STORE__ = [newLead, ...current];
  return newLead;
}

export function assignQuoteToStaff(
  quoteId: string,
  staffId: string,
  staffName: string,
  customerWhatsapp: string,
  itemsSummary: string,
  quotedAmount: number,
  customerName?: string,
  orderNotes?: string,
  advanceDeposit?: number
): boolean {
  if (!global.__ALISHAN_FOLLOWUPS_STORE__) {
    global.__ALISHAN_FOLLOWUPS_STORE__ = [...DEFAULT_FOLLOWUPS];
  }

  const existingIndex = global.__ALISHAN_FOLLOWUPS_STORE__.findIndex(
    (l) => l.quoteId === quoteId || l.customerWhatsapp === customerWhatsapp
  );

  if (existingIndex !== -1) {
    global.__ALISHAN_FOLLOWUPS_STORE__[existingIndex].quoteId = quoteId;
    global.__ALISHAN_FOLLOWUPS_STORE__[existingIndex].quotedAmount = quotedAmount;
    global.__ALISHAN_FOLLOWUPS_STORE__[existingIndex].itemsSummary = itemsSummary;
    global.__ALISHAN_FOLLOWUPS_STORE__[existingIndex].assignedStaffId = staffId;
    global.__ALISHAN_FOLLOWUPS_STORE__[existingIndex].assignedStaffName = staffName;
    if (customerName) {
      global.__ALISHAN_FOLLOWUPS_STORE__[existingIndex].customerName = customerName;
    }
    if (orderNotes) {
      global.__ALISHAN_FOLLOWUPS_STORE__[existingIndex].orderNotes = orderNotes;
    }
    if (advanceDeposit !== undefined) {
      global.__ALISHAN_FOLLOWUPS_STORE__[existingIndex].advanceDeposit = advanceDeposit;
    }
    global.__ALISHAN_FOLLOWUPS_STORE__[existingIndex].lastUpdated = new Date().toISOString();
  } else {
    const newLead: FollowUpLead = {
      id: 'lead-' + Date.now(),
      customerName: customerName || 'Customer',
      customerWhatsapp,
      assignedStaffId: staffId,
      assignedStaffName: staffName,
      quoteId,
      itemsSummary: itemsSummary || 'Furniture Piece',
      quotedAmount: quotedAmount || 0,
      status: 'pending',
      priority: 'high',
      managerNote: orderNotes ? `Notes: ${orderNotes}` : 'Follow-up assigned by showroom owner.',
      orderNotes,
      advanceDeposit,
      scheduledFor: 'Morning 10:30 AM',
      lastUpdated: new Date().toISOString(),
    };
    global.__ALISHAN_FOLLOWUPS_STORE__ = [newLead, ...global.__ALISHAN_FOLLOWUPS_STORE__];
  }

  return true;
}

export function markFollowUpContacted(leadId: string): boolean {
  if (!global.__ALISHAN_FOLLOWUPS_STORE__) {
    global.__ALISHAN_FOLLOWUPS_STORE__ = [...DEFAULT_FOLLOWUPS];
  }
  const index = global.__ALISHAN_FOLLOWUPS_STORE__.findIndex((l) => l.id === leadId);
  if (index === -1) return false;

  const current = global.__ALISHAN_FOLLOWUPS_STORE__[index];
  current.status = current.status === 'called_interested' ? 'pending' : 'called_interested';
  current.lastUpdated = new Date().toISOString();
  return true;
}

/* =====================================================================
 * 5. SHOWROOM QUOTES STORE (OFFLINE / IN-MEMORY PERSISTENCE)
 * ===================================================================== */

export function getAllQuotes(): StoredQuote[] {
  if (!global.__ALISHAN_QUOTES_STORE__) {
    global.__ALISHAN_QUOTES_STORE__ = [...DEFAULT_QUOTES];
  }
  return global.__ALISHAN_QUOTES_STORE__;
}

export function getQuoteById(id: string): StoredQuote | null {
  const quotes = getAllQuotes();
  return quotes.find((q) => q.id === id) || null;
}

export function saveNewQuote(quote: StoredQuote): StoredQuote {
  if (!global.__ALISHAN_QUOTES_STORE__) {
    global.__ALISHAN_QUOTES_STORE__ = [...DEFAULT_QUOTES];
  }
  global.__ALISHAN_QUOTES_STORE__ = [quote, ...global.__ALISHAN_QUOTES_STORE__];
  return quote;
}

export function updateQuoteStatusInStore(quoteId: string, newStatus: QuoteStatus): boolean {
  if (!global.__ALISHAN_QUOTES_STORE__) {
    global.__ALISHAN_QUOTES_STORE__ = [...DEFAULT_QUOTES];
  }
  const index = global.__ALISHAN_QUOTES_STORE__.findIndex((q) => q.id === quoteId);
  if (index === -1) return false;
  global.__ALISHAN_QUOTES_STORE__[index].status = newStatus;
  return true;
}


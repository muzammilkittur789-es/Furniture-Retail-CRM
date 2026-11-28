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
  {
    id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    name: 'Rahul Sharma',
    pin: '3333',
    role: 'sales',
    is_active: true,
    created_at: '2026-11-10T10:00:00.000Z',
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
    stock_quantity: 1, // Single bespoke display unit
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
    stock_quantity: 2, // 2 units in warehouse
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
    stock_quantity: 4, // 4 armchairs in stock
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
    stock_quantity: 2, // 2 bedframes in warehouse
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
    stock_quantity: 3, // 3 tables in stock
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
    stock_quantity: 1, // 1 floor model
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380baa',
    name: 'Sorrento Velvet Accent Chaise',
    price: 145000.0,
    material: 'Deep Emerald Velvet & Brushed Gold Steel',
    dimensions: '175cm x 85cm x 80cm',
    more_info: 'Luxury Reading Lounge Chaise',
    category: 'Living Room',
    image_url:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
    is_active: true,
    stock_quantity: 2, // 2 units in stock
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380cbb',
    name: 'Royal Teak Master Wardrobe',
    price: 320000.0,
    material: 'Grade-A Burma Teak & Hand-Finished Hardware',
    dimensions: '220cm x 65cm x 210cm',
    more_info: '3-Bay Handcrafted Master Closet',
    category: 'Bedroom',
    image_url:
      'https://images.unsplash.com/photo-1558997519-83ea9252def8?auto=format&fit=crop&w=1200&q=80',
    is_active: true,
    stock_quantity: 1, // 1 handcrafted piece
  },
];

export const DEFAULT_FOLLOWUPS: FollowUpLead[] = [
  {
    id: 'lead-1',
    customerName: 'Rajesh Khanna',
    customerWhatsapp: '9876543210',
    assignedStaffId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', // Arjun Verma
    assignedStaffName: 'Arjun Verma',
    quoteId: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    itemsSummary: 'The Florence Bouclé Sectional + 1 more',
    quotedAmount: 567000,
    advanceDeposit: 100000,
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
    quoteId: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    itemsSummary: 'Verona Carrara Marble Dining Table',
    quotedAmount: 220500,
    advanceDeposit: 35000,
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
    assignedStaffId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', // Arjun Verma
    assignedStaffName: 'Arjun Verma',
    quoteId: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    itemsSummary: 'Aurelia Cognac Leather Lounge Chair + 1 more',
    quotedAmount: 364500,
    advanceDeposit: 50000,
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
    quoteId: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    itemsSummary: 'Aurelia Cognac Leather Lounge Chair',
    quotedAmount: 205000,
    advanceDeposit: 40000,
    status: 'called_interested',
    priority: 'high',
    managerNote:
      'Spoke yesterday. Re-confirm payment token today morning before 12 PM.',
    scheduledFor: 'Morning 11:45 AM',
    lastUpdated: new Date().toISOString(),
  },
];

/**
 * Dynamic Relative Showroom Date Generator
 * Generates ISO strings anchored directly to today's local date so sample showroom
 * data is always populated with rich activity (closed sales, revenue, pieces sold, walk-ins)
 * whenever a showroom owner or salesperson evaluates the system.
 */
export function getRelativeShowroomDate(dayOffset: number, hours: number, minutes: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOffset, hours, minutes, 0, 0);
  return d.toISOString();
}

export const SEED_QUOTE_OFFSETS: Record<string, { daysAgo: number; hours: number; minutes: number }> = {
  // TODAY'S ACTIVITY (Day 0) - Distributed throughout the day
  'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55': { daysAgo: 0, hours: 11, minutes: 30 }, // Rohit Oberoi (Closed ₹2,45,000)
  'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44': { daysAgo: 0, hours: 14, minutes: 15 }, // Kavita Singhania (Closed ₹2,05,000)
  'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66': { daysAgo: 0, hours: 16, minutes: 30 }, // Ananya Deshmukh (Closed ₹1,45,000)
  'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11': { daysAgo: 0, hours: 17, minutes: 15 }, // Rajesh Khanna (Pending ₹5,67,000)
  'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22': { daysAgo: 0, hours: 18, minutes: 0 },  // Priya Sharma (Pending ₹2,20,500)
  'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33': { daysAgo: 0, hours: 19, minutes: 20 }, // Amit Patel (Pending ₹3,64,500)
  'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77': { daysAgo: 0, hours: 20, minutes: 45 }, // Zoya Akhtar (Pending ₹3,20,000)

  // THIS WEEK (1 to 5 days ago)
  'quote-w-1': { daysAgo: 1, hours: 15, minutes: 30 },
  'quote-w-2': { daysAgo: 2, hours: 16, minutes: 15 },
  'quote-w-3': { daysAgo: 3, hours: 14, minutes: 0 },
  'quote-w-4': { daysAgo: 4, hours: 17, minutes: 45 },
  'quote-w-5': { daysAgo: 5, hours: 13, minutes: 20 },

  // THIS MONTH (8 to 23 days ago)
  'quote-m-1': { daysAgo: 8, hours: 12, minutes: 0 },
  'quote-m-2': { daysAgo: 11, hours: 15, minutes: 30 },
  'quote-m-3': { daysAgo: 14, hours: 16, minutes: 45 },
  'quote-m-4': { daysAgo: 17, hours: 11, minutes: 15 },
  'quote-m-5': { daysAgo: 20, hours: 14, minutes: 30 },
  'quote-m-6': { daysAgo: 23, hours: 18, minutes: 0 },

  // THIS YEAR (35 to 160 days ago)
  'quote-y-1': { daysAgo: 35, hours: 15, minutes: 0 },
  'quote-y-2': { daysAgo: 65, hours: 14, minutes: 30 },
  'quote-y-3': { daysAgo: 95, hours: 16, minutes: 0 },
  'quote-y-4': { daysAgo: 125, hours: 11, minutes: 45 },
  'quote-y-5': { daysAgo: 160, hours: 17, minutes: 15 },
};

export const DEFAULT_QUOTES: StoredQuote[] = [
  {
    id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    created_at: getRelativeShowroomDate(0, 17, 15),
    customer_name: 'Rajesh Khanna',
    customer_whatsapp: '9876543210',
    subtotal: 630000,
    final_price: 567000,
    status: 'pending',
    advance_deposit: 100000,
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
    created_at: getRelativeShowroomDate(0, 18, 0),
    customer_name: 'Priya Sharma',
    customer_whatsapp: '9123456789',
    subtotal: 245000,
    final_price: 220500,
    advance_deposit: 35000,
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
    created_at: getRelativeShowroomDate(0, 19, 20),
    customer_name: 'Amit Patel',
    customer_whatsapp: '9845012345',
    subtotal: 405000,
    final_price: 364500,
    advance_deposit: 50000,
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
    created_at: getRelativeShowroomDate(0, 14, 15),
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
  {
    id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    created_at: getRelativeShowroomDate(0, 11, 30),
    customer_name: 'Rohit Oberoi',
    customer_whatsapp: '9820556677',
    subtotal: 245000,
    final_price: 245000,
    status: 'closed',
    staffName: 'Arjun Verma',
    itemsSummary: 'Verona Carrara Marble Dining Table',
    itemsCount: 1,
    staff: {
      id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      name: 'Arjun Verma',
      role: 'sales',
    },
    items: [
      {
        id: 'item-8',
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
        id: 'item-8',
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
    id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    created_at: getRelativeShowroomDate(0, 16, 30),
    customer_name: 'Ananya Deshmukh',
    customer_whatsapp: '9820123456',
    subtotal: 145000,
    final_price: 145000,
    status: 'closed',
    staffName: 'Rahul Sharma',
    itemsSummary: 'Sorrento Velvet Accent Chaise',
    itemsCount: 1,
    staff: {
      id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
      name: 'Rahul Sharma',
      role: 'sales',
    },
    items: [
      {
        id: 'item-9',
        price_at_time: 145000,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380baa',
          name: 'Sorrento Velvet Accent Chaise',
          material: 'Deep Emerald Velvet & Brushed Gold Steel',
          dimensions: '175cm x 85cm x 80cm',
          more_info: 'Luxury Reading Lounge Chaise',
          image_url:
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-9',
        price_at_time: 145000,
        product: {
          name: 'Sorrento Velvet Accent Chaise',
          image_url:
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
  {
    id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    created_at: getRelativeShowroomDate(0, 20, 45),
    customer_name: 'Zoya Akhtar',
    customer_whatsapp: '9811223344',
    subtotal: 320000,
    final_price: 320000,
    advance_deposit: 60000,
    status: 'pending',
    staffName: 'Rahul Sharma',
    itemsSummary: 'Royal Teak Master Wardrobe',
    itemsCount: 1,
    staff: {
      id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
      name: 'Rahul Sharma',
      role: 'sales',
    },
    items: [
      {
        id: 'item-10',
        price_at_time: 320000,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380cbb',
          name: 'Royal Teak Master Wardrobe',
          material: 'Grade-A Burma Teak & Hand-Finished Hardware',
          dimensions: '220cm x 65cm x 210cm',
          more_info: '3-Bay Handcrafted Master Closet',
          image_url:
            'https://images.unsplash.com/photo-1558997519-83ea9252def8?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-10',
        price_at_time: 320000,
        product: {
          name: 'Royal Teak Master Wardrobe',
          image_url:
            'https://images.unsplash.com/photo-1558997519-83ea9252def8?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
  // Earlier This Week Quotes (2 to 6 days ago)
  {
    id: 'quote-w-1',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Vikram Malhotra',
    customer_whatsapp: '9820123456',
    subtotal: 385000,
    final_price: 350000,
    status: 'closed',
    staffName: 'Arjun Verma',
    itemsSummary: 'The Florence Bouclé Sectional',
    itemsCount: 1,
    staff: { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', name: 'Arjun Verma', role: 'sales' },
    items: [
      {
        id: 'item-w1',
        price_at_time: 350000,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
          name: 'The Florence Bouclé Sectional',
          material: 'Italian Bouclé & Smoked Oak Plinth',
          dimensions: '340cm x 180cm x 78cm',
          image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-w1',
        price_at_time: 350000,
        product: {
          name: 'The Florence Bouclé Sectional',
          image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
  {
    id: 'quote-w-2',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Sunita Rao',
    customer_whatsapp: '9811223344',
    subtotal: 245000,
    final_price: 220500,
    status: 'pending',
    staffName: 'Sneha Kapoor',
    itemsSummary: 'Verona Carrara Marble Dining Table',
    itemsCount: 1,
    staff: { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', name: 'Sneha Kapoor', role: 'sales' },
    items: [
      {
        id: 'item-w2',
        price_at_time: 220500,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
          name: 'Verona Carrara Marble Dining Table',
          material: 'Honed Carrara Marble & Brushed Brass Trestle',
          dimensions: '240cm x 110cm x 76cm',
          image_url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-w2',
        price_at_time: 220500,
        product: {
          name: 'Verona Carrara Marble Dining Table',
          image_url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
  {
    id: 'quote-w-3',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Rahul Deshmukh',
    customer_whatsapp: '9766554433',
    subtotal: 580000,
    final_price: 520000,
    status: 'closed',
    staffName: 'Arjun Verma',
    itemsSummary: 'Verona Dining Table + Kyoto Bedstead',
    itemsCount: 2,
    staff: { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', name: 'Arjun Verma', role: 'sales' },
    items: [
      {
        id: 'item-w3-1',
        price_at_time: 245000,
        quantity: 1,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
          name: 'Verona Carrara Marble Dining Table',
          material: 'Honed Carrara Marble',
          dimensions: '240cm x 110cm x 76cm',
          image_url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
        },
      },
      {
        id: 'item-w3-2',
        price_at_time: 275000,
        quantity: 1,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
          name: 'Kyoto Low-Profile King Bedstead',
          material: 'Solid White American Ash',
          dimensions: '215cm x 205cm x 95cm',
          image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-w3-1',
        price_at_time: 245000,
        product: {
          name: 'Verona Carrara Marble Dining Table',
          image_url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=400&q=80',
        },
      },
      {
        id: 'item-w3-2',
        price_at_time: 275000,
        product: {
          name: 'Kyoto Low-Profile King Bedstead',
          image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
  {
    id: 'quote-w-4',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Ananya Roy',
    customer_whatsapp: '9833445566',
    subtotal: 265000,
    final_price: 240000,
    status: 'closed',
    staffName: 'Sneha Kapoor',
    itemsSummary: 'Aurelia Cognac Leather Lounge Chair (x2)',
    itemsCount: 2,
    staff: { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', name: 'Sneha Kapoor', role: 'sales' },
    items: [
      {
        id: 'item-w4',
        price_at_time: 120000,
        quantity: 2,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
          name: 'Aurelia Cognac Leather Lounge Chair',
          material: 'Full-Grain Tuscan Leather',
          dimensions: '88cm x 92cm x 82cm',
          image_url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-w4',
        price_at_time: 120000,
        product: {
          name: 'Aurelia Cognac Leather Lounge Chair',
          image_url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
  {
    id: 'quote-w-5',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Farhan Merchant',
    customer_whatsapp: '9899887766',
    subtotal: 290000,
    final_price: 275000,
    status: 'pending',
    staffName: 'Arjun Verma',
    itemsSummary: 'Kyoto Low-Profile King Bedstead',
    itemsCount: 1,
    staff: { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', name: 'Arjun Verma', role: 'sales' },
    items: [
      {
        id: 'item-w5',
        price_at_time: 275000,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
          name: 'Kyoto Low-Profile King Bedstead',
          material: 'Solid White American Ash',
          dimensions: '215cm x 205cm x 95cm',
          image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-w5',
        price_at_time: 275000,
        product: {
          name: 'Kyoto Low-Profile King Bedstead',
          image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
  // Earlier This Month Quotes (10 to 24 days ago)
  {
    id: 'quote-m-1',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Deepak Mehra',
    customer_whatsapp: '9822334455',
    subtotal: 420000,
    final_price: 385000,
    status: 'closed',
    staffName: 'Sneha Kapoor',
    itemsSummary: 'The Florence Bouclé Sectional',
    itemsCount: 1,
    staff: { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', name: 'Sneha Kapoor', role: 'sales' },
    items: [
      {
        id: 'item-m1',
        price_at_time: 385000,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
          name: 'The Florence Bouclé Sectional',
          material: 'Italian Bouclé & Smoked Oak',
          dimensions: '340cm x 180cm x 78cm',
          image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-m1',
        price_at_time: 385000,
        product: {
          name: 'The Florence Bouclé Sectional',
          image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
  {
    id: 'quote-m-2',
    created_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Shalini Kapoor',
    customer_whatsapp: '9844556677',
    subtotal: 245000,
    final_price: 245000,
    status: 'closed',
    staffName: 'Arjun Verma',
    itemsSummary: 'Verona Carrara Marble Dining Table',
    itemsCount: 1,
    staff: { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', name: 'Arjun Verma', role: 'sales' },
    items: [
      {
        id: 'item-m2',
        price_at_time: 245000,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
          name: 'Verona Carrara Marble Dining Table',
          material: 'Honed Carrara Marble',
          dimensions: '240cm x 110cm x 76cm',
          image_url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-m2',
        price_at_time: 245000,
        product: {
          name: 'Verona Carrara Marble Dining Table',
          image_url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
  {
    id: 'quote-m-3',
    created_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Gaurav Bansal',
    customer_whatsapp: '9819876543',
    subtotal: 580000,
    final_price: 520000,
    status: 'closed',
    staffName: 'Sneha Kapoor',
    itemsSummary: 'Kyoto Bedstead + 2 Aurelia Chairs',
    itemsCount: 3,
    staff: { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', name: 'Sneha Kapoor', role: 'sales' },
    items: [
      {
        id: 'item-m3-1',
        price_at_time: 280000,
        quantity: 1,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
          name: 'Kyoto Low-Profile King Bedstead',
          material: 'Solid White American Ash',
          dimensions: '215cm x 205cm x 95cm',
          image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        },
      },
      {
        id: 'item-m3-2',
        price_at_time: 120000,
        quantity: 2,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
          name: 'Aurelia Cognac Leather Lounge Chair',
          material: 'Full-Grain Tuscan Leather',
          dimensions: '88cm x 92cm x 82cm',
          image_url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-m3-1',
        price_at_time: 280000,
        product: {
          name: 'Kyoto Low-Profile King Bedstead',
          image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
        },
      },
      {
        id: 'item-m3-2',
        price_at_time: 120000,
        product: {
          name: 'Aurelia Cognac Leather Lounge Chair',
          image_url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
  {
    id: 'quote-m-4',
    created_at: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Meera Nair',
    customer_whatsapp: '9871234567',
    subtotal: 385000,
    final_price: 350000,
    status: 'pending',
    staffName: 'Arjun Verma',
    itemsSummary: 'The Florence Bouclé Sectional',
    itemsCount: 1,
    staff: { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', name: 'Arjun Verma', role: 'sales' },
    items: [
      {
        id: 'item-m4',
        price_at_time: 350000,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
          name: 'The Florence Bouclé Sectional',
          material: 'Italian Bouclé & Smoked Oak',
          dimensions: '340cm x 180cm x 78cm',
          image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-m4',
        price_at_time: 350000,
        product: {
          name: 'The Florence Bouclé Sectional',
          image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
  {
    id: 'quote-m-5',
    created_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Sanjay Singhal',
    customer_whatsapp: '9823456789',
    subtotal: 480000,
    final_price: 440000,
    status: 'closed',
    staffName: 'Sneha Kapoor',
    itemsSummary: 'Verona Dining Table + Tivoli Table',
    itemsCount: 2,
    staff: { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', name: 'Sneha Kapoor', role: 'sales' },
    items: [
      {
        id: 'item-m5-1',
        price_at_time: 245000,
        quantity: 1,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
          name: 'Verona Carrara Marble Dining Table',
          material: 'Honed Carrara Marble',
          dimensions: '240cm x 110cm x 76cm',
          image_url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
        },
      },
      {
        id: 'item-m5-2',
        price_at_time: 195000,
        quantity: 1,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
          name: 'Tivoli Roman Travertine Coffee Table',
          material: 'Italian Travertine Stone',
          dimensions: '130cm x 70cm x 38cm',
          image_url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-m5-1',
        price_at_time: 245000,
        product: {
          name: 'Verona Carrara Marble Dining Table',
          image_url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=400&q=80',
        },
      },
      {
        id: 'item-m5-2',
        price_at_time: 195000,
        product: {
          name: 'Tivoli Roman Travertine Coffee Table',
          image_url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
  {
    id: 'quote-m-6',
    created_at: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Aditya Chopra',
    customer_whatsapp: '9833221100',
    subtotal: 290000,
    final_price: 260000,
    status: 'closed',
    staffName: 'Arjun Verma',
    itemsSummary: 'Kyoto Low-Profile King Bedstead',
    itemsCount: 1,
    staff: { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', name: 'Arjun Verma', role: 'sales' },
    items: [
      {
        id: 'item-m6',
        price_at_time: 260000,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
          name: 'Kyoto Low-Profile King Bedstead',
          material: 'Solid White American Ash',
          dimensions: '215cm x 205cm x 95cm',
          image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-m6',
        price_at_time: 260000,
        product: {
          name: 'Kyoto Low-Profile King Bedstead',
          image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
  // Earlier This Year Quotes (35 to 160 days ago)
  {
    id: 'quote-y-1',
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Tarun Batra',
    customer_whatsapp: '9810101010',
    subtotal: 580000,
    final_price: 520000,
    status: 'closed',
    staffName: 'Arjun Verma',
    itemsSummary: 'Kyoto Bedstead + Aurelia Chair',
    itemsCount: 2,
    staff: { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', name: 'Arjun Verma', role: 'sales' },
    items: [
      {
        id: 'item-y1-1',
        price_at_time: 280000,
        quantity: 1,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
          name: 'Kyoto Low-Profile King Bedstead',
          material: 'Solid White American Ash',
          dimensions: '215cm x 205cm x 95cm',
          image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        },
      },
      {
        id: 'item-y1-2',
        price_at_time: 240000,
        quantity: 1,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
          name: 'Aurelia Cognac Leather Lounge Chair',
          material: 'Full-Grain Tuscan Leather',
          dimensions: '88cm x 92cm x 82cm',
          image_url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-y1-1',
        price_at_time: 280000,
        product: {
          name: 'Kyoto Low-Profile King Bedstead',
          image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
        },
      },
      {
        id: 'item-y1-2',
        price_at_time: 240000,
        product: {
          name: 'Aurelia Cognac Leather Lounge Chair',
          image_url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
  {
    id: 'quote-y-2',
    created_at: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Ritu Agarwal',
    customer_whatsapp: '9812312312',
    subtotal: 385000,
    final_price: 365000,
    status: 'closed',
    staffName: 'Sneha Kapoor',
    itemsSummary: 'The Florence Bouclé Sectional',
    itemsCount: 1,
    staff: { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', name: 'Sneha Kapoor', role: 'sales' },
    items: [
      {
        id: 'item-y2',
        price_at_time: 365000,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
          name: 'The Florence Bouclé Sectional',
          material: 'Italian Bouclé & Smoked Oak',
          dimensions: '340cm x 180cm x 78cm',
          image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-y2',
        price_at_time: 365000,
        product: {
          name: 'The Florence Bouclé Sectional',
          image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
  {
    id: 'quote-y-3',
    created_at: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Manish Joshi',
    customer_whatsapp: '9898989898',
    subtotal: 490000,
    final_price: 450000,
    status: 'closed',
    staffName: 'Arjun Verma',
    itemsSummary: 'Verona Dining Table + Tivoli Table',
    itemsCount: 2,
    staff: { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', name: 'Arjun Verma', role: 'sales' },
    items: [
      {
        id: 'item-y3-1',
        price_at_time: 245000,
        quantity: 1,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
          name: 'Verona Carrara Marble Dining Table',
          material: 'Honed Carrara Marble',
          dimensions: '240cm x 110cm x 76cm',
          image_url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
        },
      },
      {
        id: 'item-y3-2',
        price_at_time: 205000,
        quantity: 1,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
          name: 'Tivoli Roman Travertine Coffee Table',
          material: 'Italian Travertine Stone',
          dimensions: '130cm x 70cm x 38cm',
          image_url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-y3-1',
        price_at_time: 245000,
        product: {
          name: 'Verona Carrara Marble Dining Table',
          image_url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=400&q=80',
        },
      },
      {
        id: 'item-y3-2',
        price_at_time: 205000,
        product: {
          name: 'Tivoli Roman Travertine Coffee Table',
          image_url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
  {
    id: 'quote-y-4',
    created_at: new Date(Date.now() - 130 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Neha Chawla',
    customer_whatsapp: '9876501234',
    subtotal: 620000,
    final_price: 580000,
    status: 'closed',
    staffName: 'Sneha Kapoor',
    itemsSummary: 'The Florence Bouclé Sectional + 2 Chairs',
    itemsCount: 3,
    staff: { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', name: 'Sneha Kapoor', role: 'sales' },
    items: [
      {
        id: 'item-y4-1',
        price_at_time: 350000,
        quantity: 1,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
          name: 'The Florence Bouclé Sectional',
          material: 'Italian Bouclé & Smoked Oak',
          dimensions: '340cm x 180cm x 78cm',
          image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
        },
      },
      {
        id: 'item-y4-2',
        price_at_time: 115000,
        quantity: 2,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
          name: 'Aurelia Cognac Leather Lounge Chair',
          material: 'Full-Grain Tuscan Leather',
          dimensions: '88cm x 92cm x 82cm',
          image_url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-y4-1',
        price_at_time: 350000,
        product: {
          name: 'The Florence Bouclé Sectional',
          image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
        },
      },
      {
        id: 'item-y4-2',
        price_at_time: 115000,
        product: {
          name: 'Aurelia Cognac Leather Lounge Chair',
          image_url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
  {
    id: 'quote-y-5',
    created_at: new Date(Date.now() - 160 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Karthik Raman',
    customer_whatsapp: '9845112233',
    subtotal: 385000,
    final_price: 350000,
    status: 'closed',
    staffName: 'Arjun Verma',
    itemsSummary: 'The Florence Bouclé Sectional',
    itemsCount: 1,
    staff: { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', name: 'Arjun Verma', role: 'sales' },
    items: [
      {
        id: 'item-y5',
        price_at_time: 350000,
        product: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
          name: 'The Florence Bouclé Sectional',
          material: 'Italian Bouclé & Smoked Oak',
          dimensions: '340cm x 180cm x 78cm',
          image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
        },
      },
    ],
    quote_items: [
      {
        id: 'item-y5',
        price_at_time: 350000,
        product: {
          name: 'The Florence Bouclé Sectional',
          image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
];

// Initialize global stores if not already present or if store has fewer than full dataset
if (!global.__ALISHAN_STAFF_STORE__ || global.__ALISHAN_STAFF_STORE__.length < DEFAULT_STAFF.length) {
  global.__ALISHAN_STAFF_STORE__ = [...DEFAULT_STAFF];
}

if (!global.__ALISHAN_PRODUCTS_STORE__ || global.__ALISHAN_PRODUCTS_STORE__.length < DEFAULT_PRODUCTS.length) {
  global.__ALISHAN_PRODUCTS_STORE__ = [...DEFAULT_PRODUCTS];
}

if (!global.__ALISHAN_FOLLOWUPS_STORE__ || global.__ALISHAN_FOLLOWUPS_STORE__.length < DEFAULT_FOLLOWUPS.length) {
  global.__ALISHAN_FOLLOWUPS_STORE__ = [...DEFAULT_FOLLOWUPS];
}

if (!global.__ALISHAN_QUOTES_STORE__ || global.__ALISHAN_QUOTES_STORE__.length < DEFAULT_QUOTES.length) {
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

export function updateStaffMember(
  id: string,
  name: string,
  pin: string
): { success: boolean; staff?: StaffMember; error?: string } {
  if (!global.__ALISHAN_STAFF_STORE__) {
    return { success: false, error: 'Staff store not initialized.' };
  }
  const index = global.__ALISHAN_STAFF_STORE__.findIndex((s) => s.id === id);
  if (index === -1) {
    return { success: false, error: 'Staff member not found.' };
  }

  const cleanName = name.trim();
  const cleanPin = pin.trim();

  if (!cleanName) {
    return { success: false, error: 'Staff name cannot be empty.' };
  }
  if (!cleanPin || cleanPin.length !== 4 || !/^\d{4}$/.test(cleanPin)) {
    return { success: false, error: 'PIN must be exactly 4 digits.' };
  }

  // Ensure unique PIN among active staff
  const duplicate = global.__ALISHAN_STAFF_STORE__.find(
    (s) => s.id !== id && s.pin === cleanPin && s.is_active
  );
  if (duplicate) {
    return {
      success: false,
      error: `PIN ${cleanPin} is already assigned to ${duplicate.name}. Each staff member must have a unique PIN.`,
    };
  }

  global.__ALISHAN_STAFF_STORE__[index].name = cleanName;
  global.__ALISHAN_STAFF_STORE__[index].pin = cleanPin;

  return {
    success: true,
    staff: { ...global.__ALISHAN_STAFF_STORE__[index] },
  };
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
  stock_quantity?: number;
}): Product {
  const stockQty = productData.stock_quantity !== undefined ? Math.max(0, Number(productData.stock_quantity)) : 1;
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
    stock_quantity: stockQty,
    is_active: productData.is_active !== undefined ? productData.is_active : (stockQty > 0),
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
    stock_quantity?: number;
  }
): Product | null {
  if (!global.__ALISHAN_PRODUCTS_STORE__) {
    global.__ALISHAN_PRODUCTS_STORE__ = [...DEFAULT_PRODUCTS];
  }
  const index = global.__ALISHAN_PRODUCTS_STORE__.findIndex((p) => p.id === productId);
  if (index === -1) return null;

  const existing = global.__ALISHAN_PRODUCTS_STORE__[index];
  const newStock = updates.stock_quantity !== undefined ? Math.max(0, Number(updates.stock_quantity)) : (existing.stock_quantity ?? 1);
  const updated: Product = {
    ...existing,
    name: updates.name !== undefined ? updates.name.trim() : existing.name,
    price: updates.price !== undefined ? Number(updates.price) : existing.price,
    material: updates.material !== undefined ? updates.material.trim() : existing.material,
    dimensions: updates.dimensions !== undefined ? updates.dimensions.trim() : existing.dimensions,
    more_info: updates.more_info !== undefined ? (updates.more_info.trim() || undefined) : existing.more_info,
    category: updates.category !== undefined ? updates.category.trim() : existing.category,
    image_url: updates.image_url !== undefined ? updates.image_url.trim() : existing.image_url,
    stock_quantity: newStock,
    is_active: updates.is_active !== undefined ? updates.is_active : (newStock > 0),
    updated_at: new Date().toISOString(),
  };

  global.__ALISHAN_PRODUCTS_STORE__[index] = updated;
  return updated;
}

export function decrementProductStock(
  productId: string,
  quantityToDeduct: number = 1
): { success: boolean; remainingStock: number; isSoldOut: boolean; product?: Product } {
  if (!global.__ALISHAN_PRODUCTS_STORE__) {
    global.__ALISHAN_PRODUCTS_STORE__ = [...DEFAULT_PRODUCTS];
  }
  const index = global.__ALISHAN_PRODUCTS_STORE__.findIndex((p) => p.id === productId);
  if (index === -1) return { success: false, remainingStock: 0, isSoldOut: true };

  const current = global.__ALISHAN_PRODUCTS_STORE__[index];
  const currentStock = current.stock_quantity ?? 1;
  const nextStock = Math.max(0, currentStock - quantityToDeduct);
  const isSoldOut = nextStock === 0;

  global.__ALISHAN_PRODUCTS_STORE__[index] = {
    ...current,
    stock_quantity: nextStock,
    is_active: !isSoldOut,
    updated_at: new Date().toISOString(),
  };

  return {
    success: true,
    remainingStock: nextStock,
    isSoldOut,
    product: global.__ALISHAN_PRODUCTS_STORE__[index],
  };
}

export function restockProduct(
  productId: string,
  quantityToAdd: number
): { success: boolean; newStock: number; product?: Product } {
  if (!global.__ALISHAN_PRODUCTS_STORE__) {
    global.__ALISHAN_PRODUCTS_STORE__ = [...DEFAULT_PRODUCTS];
  }
  const index = global.__ALISHAN_PRODUCTS_STORE__.findIndex((p) => p.id === productId);
  if (index === -1) return { success: false, newStock: 0 };

  const current = global.__ALISHAN_PRODUCTS_STORE__[index];
  const currentStock = current.stock_quantity ?? 0;
  const nextStock = Math.max(0, currentStock + quantityToAdd);

  global.__ALISHAN_PRODUCTS_STORE__[index] = {
    ...current,
    stock_quantity: nextStock,
    is_active: nextStock > 0,
    updated_at: new Date().toISOString(),
  };

  return {
    success: true,
    newStock: nextStock,
    product: global.__ALISHAN_PRODUCTS_STORE__[index],
  };
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
 * Determines whether a lead should appear on the morning follow-up screen.
 * Once a deal is closed, it disappears automatically at 6:00 AM the following morning,
 * leaving only fresh action cards for the sales team.
 */
export function isLeadActiveForMorningShift(
  lead: FollowUpLead,
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

export function getAllFollowUps(): FollowUpLead[] {
  if (!global.__ALISHAN_FOLLOWUPS_STORE__) {
    global.__ALISHAN_FOLLOWUPS_STORE__ = [...DEFAULT_FOLLOWUPS];
  }
  // Safeguard: Ensure mock legacy IDs are healed to valid quotes
  const legacyQuoteMap: Record<string, string> = {
    'quote-101': 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'quote-102': 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'quote-103': 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'quote-104': 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  };
  for (const lead of global.__ALISHAN_FOLLOWUPS_STORE__) {
    if (legacyQuoteMap[lead.quoteId]) {
      lead.quoteId = legacyQuoteMap[lead.quoteId];
    }
  }
  return global.__ALISHAN_FOLLOWUPS_STORE__;
}

export function getFollowUpsForStaff(staffId: string): FollowUpLead[] {
  const all = getAllFollowUps();
  const isOwner = staffId === 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const staffLeads = isOwner ? all : all.filter((lead) => lead.assignedStaffId === staffId);

  // Auto-clear deals closed prior to 6:00 AM from morning follow-up view
  return staffLeads.filter((lead) => isLeadActiveForMorningShift(lead));
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
  if (!global.__ALISHAN_QUOTES_STORE__ || global.__ALISHAN_QUOTES_STORE__.length < DEFAULT_QUOTES.length) {
    global.__ALISHAN_QUOTES_STORE__ = [...DEFAULT_QUOTES];
  }

  // Ensure seed demo quotes stay fresh and anchored to current calendar day for presentations
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sampleTodayQuote = global.__ALISHAN_QUOTES_STORE__.find(
    (q) => q.id === 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55'
  );

  if (!sampleTodayQuote || new Date(sampleTodayQuote.created_at).getTime() < startOfToday) {
    for (const q of global.__ALISHAN_QUOTES_STORE__) {
      const cfg = SEED_QUOTE_OFFSETS[q.id];
      if (cfg) {
        q.created_at = getRelativeShowroomDate(cfg.daysAgo, cfg.hours, cfg.minutes);
      }
    }
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

export function closeQuoteAndDeductInventory(
  quoteId: string,
  leadId?: string
): {
  success: boolean;
  affectedProducts: { id: string; name: string; remainingStock: number; isSoldOut: boolean }[];
} {
  const legacyQuoteMap: Record<string, string> = {
    'quote-101': 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'quote-102': 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'quote-103': 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'quote-104': 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  };

  const resolvedQuoteId = legacyQuoteMap[quoteId] || quoteId;
  let quote = getQuoteById(resolvedQuoteId);

  // If quote not found directly, look up target lead in followups store
  let targetLead: FollowUpLead | null = null;
  const followUps = getAllFollowUps();
  targetLead =
    followUps.find(
      (f) =>
        (leadId && f.id === leadId) ||
        f.quoteId === quoteId ||
        f.quoteId === resolvedQuoteId ||
        f.id === quoteId
    ) || null;

  if (!quote && targetLead) {
    quote =
      getQuoteById(targetLead.quoteId) ||
      getAllQuotes().find(
        (q) =>
          q.customer_whatsapp === targetLead?.customerWhatsapp ||
          (q.customer_name && targetLead?.customerName && q.customer_name.toLowerCase() === targetLead.customerName.toLowerCase())
      ) ||
      null;
  }

  // 1. Mark quote status as closed if quote found
  if (quote) {
    updateQuoteStatusInStore(quote.id, 'closed');
  }

  // 2. Mark any related follow up as deal_closed
  if (global.__ALISHAN_FOLLOWUPS_STORE__) {
    const fIdx = global.__ALISHAN_FOLLOWUPS_STORE__.findIndex(
      (f) =>
        (leadId && f.id === leadId) ||
        f.quoteId === quoteId ||
        f.quoteId === resolvedQuoteId ||
        f.id === quoteId ||
        (quote && (f.quoteId === quote.id || f.customerWhatsapp === quote.customer_whatsapp))
    );
    if (fIdx !== -1) {
      global.__ALISHAN_FOLLOWUPS_STORE__[fIdx].status = 'deal_closed';
      global.__ALISHAN_FOLLOWUPS_STORE__[fIdx].lastUpdated = new Date().toISOString();
    }
  }

  // 3. Deduct stock for each item in the quote
  const affected: { id: string; name: string; remainingStock: number; isSoldOut: boolean }[] = [];
  const items = quote?.items || [];
  if (items.length > 0) {
    for (const it of items) {
      const pId = it.product?.id || it.id;
      const qty = it.quantity && it.quantity > 0 ? it.quantity : 1;
      if (pId) {
        const decRes = decrementProductStock(pId, qty);
        if (decRes.success && decRes.product) {
          affected.push({
            id: decRes.product.id,
            name: decRes.product.name,
            remainingStock: decRes.remainingStock,
            isSoldOut: decRes.isSoldOut,
          });
        }
      }
    }
  } else if (targetLead) {
    // Fallback if quote record is missing: Deduct product by matching product name from follow-up lead itemsSummary
    const allProds = getAllProducts();
    const summaryLower = targetLead.itemsSummary.toLowerCase();
    for (const prod of allProds) {
      if (summaryLower.includes(prod.name.toLowerCase()) || prod.name.toLowerCase().includes(summaryLower)) {
        const decRes = decrementProductStock(prod.id, 1);
        if (decRes.success && decRes.product) {
          affected.push({
            id: decRes.product.id,
            name: decRes.product.name,
            remainingStock: decRes.remainingStock,
            isSoldOut: decRes.isSoldOut,
          });
        }
        break;
      }
    }
  }

  return { success: true, affectedProducts: affected };
}


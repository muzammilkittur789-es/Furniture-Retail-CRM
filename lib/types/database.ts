export type StaffRole = 'admin' | 'sales';
export type DiscountType = 'percentage' | 'flat';
export type QuoteStatus = 'pending' | 'contacted' | 'closed' | 'no_deal';

export type FollowUpStatus =
  | 'pending'
  | 'called_interested'
  | 'called_no_answer'
  | 'deal_closed'
  | 'lost';

export interface FollowUpLead {
  id: string;
  customerName: string;
  customerWhatsapp: string;
  assignedStaffId: string;
  assignedStaffName: string;
  quoteId: string;
  itemsSummary: string;
  quotedAmount: number;
  status: FollowUpStatus;
  priority: 'high' | 'medium' | 'normal';
  managerNote: string;
  orderNotes?: string;
  advanceDeposit?: number;
  scheduledFor: string;
  lastUpdated: string;
}

export interface Staff {
  id: string;
  name: string;
  pin_hash: string;
  role: StaffRole;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StaffSession {
  id: string;
  name: string;
  role: StaffRole;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  material: string;
  dimensions: string;
  more_info?: string;
  image_url: string;
  is_active: boolean;
  stock_quantity?: number;
  category?: string;
  created_at?: string;
  updated_at?: string;
  isLocked24h?: boolean;
  lockedUntil?: string;
}

export interface Quote {
  id: string;
  staff_id: string;
  customer_name?: string;
  customer_whatsapp: string;
  order_notes?: string;
  advance_deposit?: number;
  subtotal: number;
  discount_type: DiscountType;
  discount_value: number;
  final_price: number;
  status: QuoteStatus;
  created_at: string;
  updated_at?: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id: string;
  price_at_time: number;
  quantity?: number;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CreateQuotePayload {
  staffId: string;
  customerName?: string;
  customerWhatsapp: string;
  orderNotes?: string;
  advanceDeposit?: number;
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  finalPrice: number;
  items: {
    productId: string;
    priceAtTime: number;
    name: string;
    quantity?: number;
  }[];
}

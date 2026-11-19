import React from 'react';
import { createServerClient, isSupabaseConfigured } from '@/lib/supabase/server';
import {
  AdminDashboardClient,
  FullQuoteRecord,
} from '@/components/admin/admin-dashboard-client';
import { getAllStaffMembers } from '@/lib/store/showroom-store';

export const dynamic = 'force-dynamic';

const FALLBACK_ALL_QUOTES: FullQuoteRecord[] = [
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
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    customer_whatsapp: '9789012345',
    subtotal: 245000,
    final_price: 245000,
    status: 'closed',
    staffName: 'Arjun Verma',
    itemsSummary: 'Verona Carrara Marble Dining Table',
    itemsCount: 1,
    quote_items: [
      {
        id: 'item-6',
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
    id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    created_at: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
    customer_whatsapp: '9845098765',
    subtotal: 205000,
    final_price: 205000,
    status: 'closed',
    staffName: 'Sneha Kapoor',
    itemsSummary: 'Aurelia Cognac Leather Lounge Chair + 1 more',
    itemsCount: 1,
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

export default async function AdminDashboardPage() {
  let quotes: FullQuoteRecord[] = FALLBACK_ALL_QUOTES;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      const { data: rawQuotes, error } = await supabase
        .from('quotes')
        .select(`
          id,
          created_at,
          customer_whatsapp,
          subtotal,
          final_price,
          status,
          staff:staff_id (
            name
          ),
          quote_items (
            id,
            price_at_time,
            product:product_id (
              name,
              image_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && rawQuotes && rawQuotes.length > 0) {
        quotes = rawQuotes.map((q: any) => {
          const staffName = q.staff?.name || 'Showroom Staff';
          const items = q.quote_items || [];
          const firstItemName = items[0]?.product?.name || 'Furniture Item';
          const itemsSummary =
            items.length > 1 ? `${firstItemName} + ${items.length - 1} more` : firstItemName;

          return {
            id: q.id,
            created_at: q.created_at,
            customer_whatsapp: q.customer_whatsapp,
            subtotal: Number(q.subtotal),
            final_price: Number(q.final_price),
            status: q.status,
            staffName,
            itemsSummary,
            itemsCount: items.length,
            quote_items: items.map((it: any) => ({
              id: it.id,
              price_at_time: Number(it.price_at_time),
              product: {
                name: it.product?.name || 'Furniture Item',
                image_url: it.product?.image_url,
              },
            })),
          };
        });
      }
    } catch (err) {
      console.warn('Error fetching quotes from DB:', err);
    }
  }

  const staffList = getAllStaffMembers();
  return <AdminDashboardClient quotes={quotes} staffList={staffList} />;
}

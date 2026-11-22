import React from 'react';
import { createServerClient, isSupabaseConfigured } from '@/lib/supabase/server';
import {
  AdminDashboardClient,
  FullQuoteRecord,
} from '@/components/admin/admin-dashboard-client';
import { getAllStaffMembers, getAllQuotes } from '@/lib/store/showroom-store';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const storeQuotes = getAllQuotes();
  let quotes: FullQuoteRecord[] = storeQuotes.map((q) => ({
    id: q.id,
    created_at: q.created_at,
    customer_whatsapp: q.customer_whatsapp,
    subtotal: q.subtotal,
    final_price: q.final_price,
    status: q.status,
    staffName: q.staffName || q.staff?.name || 'Showroom Staff',
    itemsSummary: q.itemsSummary,
    itemsCount: q.itemsCount,
    quote_items: q.quote_items || q.items.map((it) => ({
      id: it.id,
      price_at_time: it.price_at_time,
      product: {
        name: it.product.name,
        image_url: it.product.image_url,
      },
    })),
  }));

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

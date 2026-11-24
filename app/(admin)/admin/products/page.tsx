import React from 'react';
import { createServerClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { ProductStockTable } from '@/components/admin/product-stock-table';
import { Product } from '@/lib/types/database';
import { getAllProducts } from '@/lib/store/showroom-store';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  let products = getAllProducts();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        products = data as any;
      }
    } catch (e) {
      console.warn('Using showroom products catalog:', e);
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-indigo-600 font-bold block mb-1">
          Alishan Furnitures • Stock
        </span>
        <h1 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight text-slate-900">
          Furniture Stock List
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
          Live showroom inventory. Status updates automatically to <strong className="text-orange-700">Sold</strong> when sales staff close deals and stock reaches zero.
        </p>
      </div>

      <ProductStockTable initialProducts={products} />
    </div>
  );
}

import { createServerClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { Product } from '@/lib/types/database';
import { SalesFloorClient } from '@/components/sales/sales-floor-client';
import { getProductHoldStatus, getAllProducts, getAllFollowUps } from '@/lib/store/showroom-store';

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    name: 'The Florence Bouclé Sectional',
    price: 385000.0,
    material: 'Italian Bouclé & Smoked Oak Plinth',
    dimensions: '340cm x 180cm x 78cm',
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
    image_url:
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80',
    is_active: true,
  },
];

export const dynamic = 'force-dynamic';

export default async function SalesFloorPage() {
  let products: Product[] = getAllProducts().filter((p) => p.is_active);

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        products = data as Product[];
      }
    } catch (err) {
      console.warn('Using showroom store inventory:', err);
    }
  }

  const productsWithHolds: Product[] = products.map((p) => {
    const hold = getProductHoldStatus(p.id);
    return {
      ...p,
      isLocked24h: hold.isLocked,
      lockedUntil: hold.lockedUntilFormatted,
    };
  });

  const followUps = getAllFollowUps();

  return (
    <SalesFloorClient
      initialProducts={productsWithHolds}
      initialFollowUps={followUps}
    />
  );
}

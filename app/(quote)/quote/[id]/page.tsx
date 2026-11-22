import { notFound } from 'next/navigation';
import { createServerClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { QuoteDocument, PopulatedQuote } from '@/components/quote/quote-document';
import { Metadata } from 'next';
import { getQuoteById } from '@/lib/store/showroom-store';

interface QuotePageProps {
  params: {
    id: string;
  };
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DEMO_FALLBACK_QUOTE: PopulatedQuote = {
  id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  customer_whatsapp: '9876543210',
  subtotal: 630000,
  discount_type: 'percentage',
  discount_value: 10,
  final_price: 567000,
  status: 'pending',
  created_at: new Date().toISOString(),
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
};

export async function generateMetadata({
  params,
}: QuotePageProps): Promise<Metadata> {
  const shortId = params.id ? params.id.slice(0, 8).toUpperCase() : '';
  return {
    title: `Official Quote #${shortId} | Alishan Furnitures`,
    description: 'Personalized furniture quotation and specifications.',
  };
}

export default async function CustomerQuotePage({ params }: QuotePageProps) {
  const { id } = params;

  if (!id) {
    notFound();
  }

  let formattedQuote: PopulatedQuote | null = null;

  if (isSupabaseConfigured() && UUID_REGEX.test(id)) {
    try {
      const supabase = createServerClient();
      const { data: rawQuote, error } = await supabase
        .from('quotes')
        .select(`
          id,
          customer_name,
          customer_whatsapp,
          order_notes,
          advance_deposit,
          subtotal,
          discount_type,
          discount_value,
          final_price,
          status,
          created_at,
          staff:staff_id (
            id,
            name,
            role
          ),
          quote_items (
            id,
            price_at_time,
            product:product_id (
              id,
              name,
              material,
              dimensions,
              more_info,
              image_url
            )
          )
        `)
        .eq('id', id)
        .single();

      if (!error && rawQuote) {
        formattedQuote = {
          id: rawQuote.id,
          customer_name: rawQuote.customer_name,
          customer_whatsapp: rawQuote.customer_whatsapp,
          order_notes: rawQuote.order_notes,
          advance_deposit: rawQuote.advance_deposit ? Number(rawQuote.advance_deposit) : undefined,
          subtotal: Number(rawQuote.subtotal),
          discount_type: rawQuote.discount_type,
          discount_value: Number(rawQuote.discount_value),
          final_price: Number(rawQuote.final_price),
          status: rawQuote.status,
          created_at: rawQuote.created_at,
          staff: Array.isArray(rawQuote.staff) ? rawQuote.staff[0] : rawQuote.staff,
          items: (rawQuote.quote_items || []).map((item: any) => ({
            id: item.id,
            price_at_time: Number(item.price_at_time),
            product: Array.isArray(item.product) ? item.product[0] : item.product,
          })),
        };
      }
    } catch (e) {
      console.warn('Error fetching quote from DB:', e);
    }
  }

  if (!formattedQuote) {
    const stored = getQuoteById(id);
    if (stored) {
      formattedQuote = {
        id: stored.id,
        customer_name: stored.customer_name,
        customer_whatsapp: stored.customer_whatsapp,
        order_notes: stored.order_notes,
        advance_deposit: stored.advance_deposit,
        subtotal: stored.subtotal,
        discount_type: stored.discount_type || 'percentage',
        discount_value: stored.discount_value || 0,
        final_price: stored.final_price,
        status: stored.status,
        created_at: stored.created_at,
        staff: stored.staff || null,
        items: stored.items.map((item, idx) => ({
          id: item.id || `item-${idx}`,
          price_at_time: item.price_at_time,
          quantity: item.quantity,
          product: {
            id: item.product?.id || `prod-${idx}`,
            name: item.product?.name || 'Furniture Item',
            material: item.product?.material || 'Premium Material',
            dimensions: item.product?.dimensions || 'Standard Dimensions',
            more_info: item.product?.more_info,
            image_url:
              item.product?.image_url ||
              'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
          },
        })),
      };
    } else {
      formattedQuote = {
        ...DEMO_FALLBACK_QUOTE,
        id: id || DEMO_FALLBACK_QUOTE.id,
      };
    }
  }

  return (
    <div className="min-h-screen bg-slate-100/80 py-4 sm:py-8 px-2.5 sm:px-6 flex flex-col justify-between print:p-0 print:bg-white">
      <main className="flex-1 flex items-center justify-center">
        <QuoteDocument quote={formattedQuote} />
      </main>

      <footer className="text-center py-4 sm:py-6 text-xs text-slate-400 no-print font-normal">
        © {new Date().getFullYear()} Alishan Furnitures • Showroom Quotations
      </footer>
    </div>
  );
}

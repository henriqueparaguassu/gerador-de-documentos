import { createClient } from '@supabase/supabase-js';
import MercadoPagoConfig, { Preference } from 'mercadopago';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN! });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*, templates(*)')
      .eq('id', id)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://www.google.com';

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: document.id,
            title: document.templates.name,
            quantity: 1,
            unit_price: Number(document.templates.price),
            currency_id: 'BRL',
          },
        ],
        back_urls: {
          success: `${origin}/download/${document.id}?status=success`,
          failure: `${origin}/preview/${document.id}?status=failure`,
          pending: `${origin}/preview/${document.id}?status=pending`,
        },
        auto_return: 'approved',
        external_reference: document.id,
      },
    });

    return NextResponse.json({ init_point: result.init_point });

  } catch (error) {
    console.error('Error creating preference:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

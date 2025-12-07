import { createClient } from '@supabase/supabase-js';
import MercadoPagoConfig, { Payment } from 'mercadopago';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN! });

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const id = url.searchParams.get('id') || url.searchParams.get('data.id');

    if (topic === 'payment' && id) {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id });

      if (paymentData.status === 'approved') {
        const externalReference = paymentData.external_reference;
        
        if (externalReference) {
          const { error } = await supabase
            .from('documents')
            .update({ status: 'paid', payment_id: id })
            .eq('id', externalReference);

          if (error) {
            console.error('Error updating document status:', error);
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

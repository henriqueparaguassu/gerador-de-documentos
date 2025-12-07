import { createClient } from '@supabase/supabase-js';
import Docxtemplater from 'docxtemplater';
import { NextRequest, NextResponse } from 'next/server';
import PizZip from 'pizzip';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(
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

    // Check if paid
    if (document.status !== 'paid') {
       return NextResponse.json({ error: 'Payment required' }, { status: 403 });
    }

    const { data: fileData, error: fileError } = await supabase.storage
      .from('templates')
      .download(document.templates.file_url);

    if (fileError || !fileData) {
      return NextResponse.json({ error: 'Template file not found' }, { status: 404 });
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const zip = new PizZip(arrayBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.render(document.data);

    const filledZip = doc.getZip();
    const filledContent = filledZip.generate({ type: 'arraybuffer' });

    return new NextResponse(filledContent, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${document.templates.name}.docx"`,
      },
    });

  } catch (error) {
    console.error('Error generating document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

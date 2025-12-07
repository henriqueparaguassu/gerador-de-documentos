import { createClient } from '@supabase/supabase-js';
import HTMLtoDOCX from 'html-to-docx';
import { NextRequest, NextResponse } from 'next/server';

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

    let html = document.templates.html_content;

    if (!html) {
        return NextResponse.json({ error: 'Template has no HTML content' }, { status: 404 });
    }

    // Variable substitution
    const data = document.data || {};
    html = html.replace(/{(\w+)}/g, (match: string, key: string) => {
      return data[key] !== undefined && data[key] !== null ? data[key] : '';
    });

    // Generate DOCX
    const fileBuffer = await HTMLtoDOCX(html, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });

    return new NextResponse(new Uint8Array(fileBuffer), {
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

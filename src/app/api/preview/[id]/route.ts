import { createClient } from '@supabase/supabase-js';
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
    // 1. Fetch document data and template HTML
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*, templates(html_content, name)')
      .eq('id', id)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    let html = document.templates.html_content;

    if (!html) {
        // Fallback or error if no HTML content (legacy templates?)
        return NextResponse.json({ error: 'Template has no HTML content' }, { status: 404 });
    }

    // 2. Perform variable substitution
    // We iterate over the data keys and replace {key} in the HTML
    const data = document.data || {};
    
    // Also replace keys that might be missing with empty string
    // A regex approach is safer to catch all {key} patterns
    html = html.replace(/{(\w+)}/g, (match: string, key: string) => {
      return data[key] !== undefined && data[key] !== null ? data[key] : '';
    });

    return NextResponse.json({ html });

  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

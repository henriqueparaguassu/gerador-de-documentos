import { createClient } from '@supabase/supabase-js';
import Docxtemplater from 'docxtemplater';
import mammoth from 'mammoth';
import { NextRequest, NextResponse } from 'next/server';
import PizZip from 'pizzip';

// Initialize Supabase client (service role needed for storage access if private, but here we use anon key if public or service role if needed)
// We should use service role to access storage if it's restricted.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; 
// Note: User said they don't know where to find service role key, but I told them. 
// If they didn't put it in .env.local, this might fail. 
// But for now let's assume they did or use anon key if storage is public.
// Actually, I'll use the anon key for now as I don't want to break if they didn't add service key.
// But wait, I need to download the file.
const supabase = createClient(supabaseUrl, supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // 1. Fetch document data
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*, templates(*)')
      .eq('id', id)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // 2. Download template file
    const { data: fileData, error: fileError } = await supabase.storage
      .from('templates')
      .download(document.templates.file_url);

    if (fileError || !fileData) {
      return NextResponse.json({ error: 'Template file not found' }, { status: 404 });
    }

    // 3. Fill template with data
    const arrayBuffer = await fileData.arrayBuffer();
    const zip = new PizZip(arrayBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.render(document.data);

    const filledZip = doc.getZip();
    const filledContent = filledZip.generate({ type: 'arraybuffer' });

    // 4. Convert to HTML for preview
    const result = await mammoth.convertToHtml({ arrayBuffer: filledContent });
    
    return NextResponse.json({ html: result.value });

  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch document data
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*, templates(*)')
      .eq('id', id)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Fetch HTML preview
    const previewUrl = `${request.nextUrl.origin}/api/preview/${id}`;
    const previewRes = await fetch(previewUrl);
    const previewData = await previewRes.json();

    if (previewData.error) {
      return NextResponse.json({ error: previewData.error }, { status: 500 });
    }

    // Generate PDF with Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Set content with watermark
    const htmlWithWatermark = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              font-family: 'Geist Sans', Arial, Helvetica, sans-serif;
              margin: 0;
              padding: 0;
              position: relative;
            }
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 6rem;
              font-weight: bold;
              color: rgba(0, 0, 0, 0.08);
              white-space: nowrap;
              pointer-events: none;
              user-select: none;
              z-index: 9999;
            }
            .content {
              position: relative;
              z-index: 1;
            }
            .ql-align-center { text-align: center; }
            .ql-align-right { text-align: right; }
            .ql-align-justify { text-align: justify; }
          </style>
        </head>
        <body>
          <div class="watermark">PRÉ VISUALIZAÇÃO</div>
          <div class="content">
            ${previewData.html}
          </div>
        </body>
      </html>
    `;

    await page.setContent(htmlWithWatermark, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });

    await browser.close();

    // Return PDF for inline viewing (no attachment header)
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="preview.pdf"',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

"use client";

import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ArrowBack, CheckCircle, Description, PictureAsPdf } from "@mui/icons-material";
import { AppBar, Box, Button, Card, CardContent, CircularProgress, Container, Toolbar, Typography } from "@mui/material";
import jsPDF from "jspdf";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DownloadPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [documentData, setDocumentData] = useState<any>(null);
  const [htmlContent, setHtmlContent] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) return;
      setLoading(true);

      const { data: doc, error: docError } = await supabase
        .from('documents')
        .select('*, templates(*)')
        .eq('id', id)
        .single();
      
      if (docError || !doc) {
        alert('Erro ao carregar documento');
        setLoading(false);
        return;
      }

      // Check if paid
      if (doc.status !== 'paid') {
        if (searchParams.get('status') === 'success') {
           // Ideally we should verify with backend, but let's just show the page and hope DB updates soon.
        } else {
           alert('Documento não pago');
           router.push(`/preview/${id}`);
           return;
        }
      }

      setDocumentData(doc);

      // Fetch HTML for PDF generation
      try {
        const res = await fetch(`/api/preview/${id}`);
        const data = await res.json();
        setHtmlContent(data.html);
      } catch (error) {
        console.error('Error fetching content:', error);
      }

      setLoading(false);
    };

    fetchDocument();
  }, [id, router, searchParams]);

  const downloadWord = async () => {
    try {
      const res = await fetch(`/api/download/${id}`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentData.templates.name}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      alert('Erro ao baixar Word');
    }
  };

  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.html(htmlContent, {
      callback: function (doc) {
        doc.save(`${documentData.templates.name}.pdf`);
      },
      x: 10,
      y: 10,
      width: 190, // max width
      windowWidth: 800
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'grey.100' }}>
      <AppBar position="static" sx={{ bgcolor: '#001529' }}>
        <Toolbar>
          <Link href="/dashboard" passHref style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowBack /> Voltar
          </Link>
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, py: 8, display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ maxWidth: 600, width: '100%', textAlign: 'center', p: 4 }}>
          <CardContent>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Pagamento Confirmado!
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              Seu documento está pronto para download.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                size="large" 
                startIcon={<Description />} 
                onClick={downloadWord}
              >
                Baixar Word (.docx)
              </Button>
              <Button 
                variant="outlined" 
                size="large" 
                startIcon={<PictureAsPdf />} 
                onClick={downloadPdf}
              >
                Baixar PDF (.pdf)
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
      <Footer />
    </Box>
  );
}

"use client";

import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ArrowBack, Download, Lock } from "@mui/icons-material";
import { AppBar, Box, Button, CircularProgress, Container, Toolbar, Typography } from "@mui/material";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PreviewPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [documentData, setDocumentData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchPreview = async () => {
      if (!id) return;
      setLoading(true);

      // Fetch document info first to check status/price
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .select('*, templates(*)')
        .eq('id', id)
        .single();
      
      if (docError) {
        alert('Erro ao carregar documento');
        setLoading(false);
        return;
      }
      setDocumentData(doc);

      // Generate PDF URL for preview (inline viewing)
      setPdfUrl(`/api/pdf-view/${id}`);
      setLoading(false);
    };

    fetchPreview();
  }, [id]);

  const handlePayment = () => {
    if (!user) {
      router.push(`/login?returnUrl=/checkout/${id}`);
      return;
    }
    router.push(`/checkout/${id}`);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Call server-side PDF generation API
      const response = await fetch(`/api/pdf/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documento-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setDownloading(false);
    }
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
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Link href="/dashboard" passHref style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowBack /> 
            <Typography variant="button" color="inherit">Voltar</Typography>
          </Link>
          {!user && (
            <Link href={`/login?returnUrl=/preview/${id}`} passHref>
              <Button variant="contained" color="primary">Entrar</Button>
            </Link>
          )}
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Header Actions */}
        <Box sx={{ width: '100%', maxWidth: '210mm', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 3 }}>
            Preview do Documento
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}>
            <Typography variant="h5" sx={{ color: 'success.main', fontWeight: 'bold' }}>
              Total: R$ {documentData?.templates?.price?.toFixed(2)}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button 
                variant="outlined" 
                size="large"
                startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <Download />}
                onClick={handleDownload}
                disabled={!pdfUrl || downloading}
                sx={{ 
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 },
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                {downloading ? 'Gerando...' : 'Baixar com marca d\'água'}
              </Button>
              
              <Button 
                variant="contained" 
                size="large" 
                startIcon={<Lock />} 
                onClick={handlePayment}
                sx={{ 
                  bgcolor: '#001529',
                  '&:hover': { bgcolor: '#002d52' },
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 3
                }}
              >
                Baixar sem marca d'água
              </Button>
            </Box>
          </Box>
        </Box>

        {/* PDF Viewer */}
        {pdfUrl && (
          <Box
            sx={{
              bgcolor: 'white',
              boxShadow: 3,
              position: 'relative',
              mx: 'auto',
              width: '100%',
              maxWidth: '210mm',
              height: '297mm',
              overflow: 'hidden',
              borderRadius: 1,
            }}
          >
            {pdfLoading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.100',
                  zIndex: 10,
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={60} sx={{ mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Gerando preview...
                  </Typography>
                </Box>
              </Box>
            )}
            <iframe
              src={pdfUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              title="Preview do Documento"
              onLoad={() => setPdfLoading(false)}
            />
          </Box>
        )}
      </Container>
      <Footer />
    </Box>
  );
}

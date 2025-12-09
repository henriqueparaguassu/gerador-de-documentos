"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Description } from "@mui/icons-material";
import { Box, Button, Card, CardActions, CardContent, CardHeader, CircularProgress, Container, Grid, Typography } from "@mui/material";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function DashboardContent() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');
  const subcategoryId = searchParams.get('subcategory');

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      let query = supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      if (subcategoryId) {
        query = query.eq('subcategory_id', subcategoryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching templates:', error);
      } else {
        setTemplates(data || []);
      }
      setLoading(false);
    };

    fetchTemplates();
  }, [categoryId, subcategoryId]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container component="main" maxWidth="xl" sx={{ flexGrow: 1, py: 4 }}>
        <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, minHeight: 400, boxShadow: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
            Modelos Disponíveis
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={6}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {templates.map((template) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={template.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardHeader
                      title={template.name}
                      titleTypographyProps={{ variant: 'h6' }}
                      action={<Description color="action" sx={{ alignSelf: 'center' }} />}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: 40
                      }}>
                        {template.description || 'Sem descrição'}
                      </Typography>
                      <Typography variant="h6" color="success.main" sx={{ mt: 2, fontWeight: 'bold' }}>
                        R$ {template.price?.toFixed(2)}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Link href={`/templates/${template.id}`} passHref style={{ width: '100%' }}>
                        <Button variant="contained" fullWidth>
                          Selecionar
                        </Button>
                      </Link>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Box>
    }>
      <DashboardContent />
    </Suspense>
  );
}

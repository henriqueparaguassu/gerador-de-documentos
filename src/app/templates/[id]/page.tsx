"use client";

import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { supabase } from "@/lib/supabase";
import { ArrowBack } from "@mui/icons-material";
import { AppBar, Box, Button, Card, CardContent, CardHeader, CircularProgress, Container, Grid, TextField, Toolbar, Typography } from "@mui/material";
import dayjs from "dayjs";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TemplateDetails() {
  const { id } = useParams();
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<any>({});
  const { user } = useAuth();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching template:', error);
        showSnackbar('Erro ao carregar template', 'error');
      } else {
        setTemplate(data);
      }
      setLoading(false);
    };

    fetchTemplate();
  }, [id]);

  const formatMonetaryInput = (value: string): string => {
    // Remove everything except digits
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    
    // Convert to cents, then format with comma
    const cents = parseInt(digits, 10);
    const reais = Math.floor(cents / 100);
    const centavos = cents % 100;
    
    return `${reais},${centavos.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (key: string, value: string) => {
    const field = template.fields_config.find((f: any) => f.key === key);
    
    if (field?.type === 'monetary') {
      const formatted = formatMonetaryInput(value);
      setFormValues({ ...formValues, [key]: formatted });
    } else {
      setFormValues({ ...formValues, [key]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Format dates if necessary
      const formattedValues = { ...formValues };
      template.fields_config.forEach((field: any) => {
        if (field.type === 'date' && formValues[field.key]) {
          formattedValues[field.key] = dayjs(formValues[field.key]).format('DD/MM/YYYY');
        } else if (field.type === 'monetary' && formValues[field.key]) {
           // Ensure monetary value is properly formatted string if needed, or keep as is if template expects it
           // Current logic seems to format it as currency string
           const val = parseFloat(formValues[field.key].replace(',', '.'));
           if (!isNaN(val)) {
             formattedValues[field.key] = val; // Store as number for monetary fields
           } else {
             formattedValues[field.key] = null; // Or handle invalid input as needed
           }
        }
      });

      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user?.id || null, // Allow null user_id
          template_id: template.id,
          data: formattedValues,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/preview/${data.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
      showSnackbar('Erro ao criar documento', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!template) {
    return <div>Template não encontrado</div>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'grey.100' }}>
      <AppBar position="static" sx={{ bgcolor: '#001529' }}>
        <Toolbar>
          <Link href="/dashboard" passHref style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowBack /> 
            <Typography variant="button" color="inherit">Voltar</Typography>
          </Link>
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            {template.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {template.description}
          </Typography>
          
          <Card>
            <CardHeader title="Preencha os dados do documento" />
            <CardContent>
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={3}>
                  {template.fields_config.map((field: any) => (
                    <Grid size={12} key={field.key}>
                      <TextField
                        required={field.required ?? true}
                        fullWidth
                        label={field.label}
                        type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                        InputLabelProps={field.type === 'date' ? { shrink: true } : {}}
                        value={formValues[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        InputProps={field.type === 'monetary' ? {
                          startAdornment: <Typography sx={{ mr: 0.5 }}>R$</Typography>,
                        } : {}}
                      />
                    </Grid>
                  ))}
                  <Grid size={12}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      size="large" 
                      fullWidth 
                      disabled={submitting}
                    >
                      {submitting ? 'Gerando...' : 'Gerar Preview'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}

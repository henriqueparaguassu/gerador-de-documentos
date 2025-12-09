"use client";

import { useSnackbar } from "@/contexts/SnackbarContext";
import { supabase } from "@/lib/supabase";
import { Add, Delete } from "@mui/icons-material";
import { Box, Button, Card, CardContent, CardHeader, Checkbox, CircularProgress, Container, FormControl, FormControlLabel, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import dynamic from 'next/dynamic';
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function EditTemplatePage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fields, setFields] = useState<any[]>([]);
  const [htmlContent, setHtmlContent] = useState('');
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('0');
  const [categoryId, setCategoryId] = useState<string>('');
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  
  // Categories
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<any[]>([]);

  // Fetch categories and subcategories
  useEffect(() => {
    const fetchCategoriesData = async () => {
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      const { data: subcategoriesData } = await supabase
        .from('subcategories')
        .select('*')
        .order('name');
      
      setCategories(categoriesData || []);
      setSubcategories(subcategoriesData || []);
    };
    
    fetchCategoriesData();
  }, []);
  
  // Filter subcategories based on selected category
  useEffect(() => {
    if (categoryId) {
      setFilteredSubcategories(subcategories.filter(sub => sub.category_id === categoryId));
    } else {
      setFilteredSubcategories([]);
      setSubcategoryId('');
    }
  }, [categoryId, subcategories]);

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
        router.push('/admin/templates');
      } else {
        setName(data.name);
        setDescription(data.description || '');
        setPrice(data.price.toString());
        setFields(data.fields_config || []);
        setHtmlContent(data.html_content || '');
        setCategoryId(data.category_id || '');
        setSubcategoryId(data.subcategory_id || '');
      }
      setLoading(false);
    };

    fetchTemplate();
  }, [id, router]);

  // Extract keys from HTML content
  useEffect(() => {
    if (!htmlContent) return;
    
    const regex = /{([a-zA-Z0-9_]+)}/g;
    const matches = [...htmlContent.matchAll(regex)].map(m => m[1]);
    const uniqueKeys = Array.from(new Set(matches));

    setFields(prevFields => {
      const existingKeys = new Set(prevFields.map(f => f.key));
      const newFields = [...prevFields];

      // Add new keys found in HTML
      uniqueKeys.forEach(key => {
        if (!existingKeys.has(key)) {
          newFields.push({ key, label: key, type: 'text', required: true });
        }
      });

      return newFields;
    });
  }, [htmlContent]);

  const addField = () => {
    setFields([...fields, { key: '', label: '', type: 'text', required: true }]);
  };

  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  const updateField = (index: number, key: string, value: any) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!htmlContent) {
      showSnackbar('Por favor, crie o conteúdo HTML do template.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const { error: dbError } = await supabase
        .from('templates')
        .update({
          name,
          description,
          price: parseFloat(price.replace(',', '.')),
          fields_config: fields,
          html_content: htmlContent,
          category_id: categoryId || null,
          subcategory_id: subcategoryId || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (dbError) throw dbError;

      showSnackbar('Template atualizado com sucesso!', 'success');
      router.push('/admin/templates');
    } catch (error: any) {
      console.error('Error updating template:', error);
      showSnackbar(`Erro ao atualizar template: ${error.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  }), []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Editar Template
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Card sx={{ mb: 4 }}>
          <CardHeader title="Informações Básicas" />
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={12}>
                <TextField
                  required
                  fullWidth
                  label="Nome do Template"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  multiline
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  required
                  fullWidth
                  label="Preço (R$)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                  }}
                />
              </Grid>
              <Grid size={12}>
                <FormControl fullWidth>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={categoryId}
                    label="Categoria"
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <MenuItem value="">Nenhuma</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <FormControl fullWidth disabled={!categoryId}>
                  <InputLabel>Subcategoria</InputLabel>
                  <Select
                    value={subcategoryId}
                    label="Subcategoria"
                    onChange={(e) => setSubcategoryId(e.target.value)}
                  >
                    <MenuItem value="">Nenhuma</MenuItem>
                    {filteredSubcategories.map((sub) => (
                      <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 4 }}>
          <CardHeader 
            title="Editor Visual (Preview e PDF)" 
            subheader="Crie o visual do documento aqui. Use as chaves entre chaves simples, ex: {nome_cliente}. As chaves serão identificadas automaticamente abaixo."
          />
          <CardContent>
            <Box sx={{ height: 400, mb: 4 }}>
              <ReactQuill
                theme="snow"
                value={htmlContent}
                onChange={setHtmlContent}
                modules={modules}
                style={{ height: '300px' }}
              />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 4 }}>
          <CardHeader 
            title="Configuração de Campos" 
            subheader="Revise os campos identificados. Ajuste os labels e tipos conforme necessário."
          />
          <CardContent>
            {fields.map((field, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <TextField
                  label="Label"
                  value={field.label}
                  onChange={(e) => updateField(index, 'label', e.target.value)}
                  sx={{ flex: 2 }}
                  size="small"
                />
                <TextField
                  label="Chave"
                  value={field.key}
                  disabled
                  sx={{ flex: 1, bgcolor: 'action.hover' }}
                  size="small"
                />
                <FormControl size="small" sx={{ width: 120 }}>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={field.type}
                    label="Tipo"
                    onChange={(e) => updateField(index, 'type', e.target.value)}
                  >
                    <MenuItem value="text">Texto</MenuItem>
                    <MenuItem value="date">Data</MenuItem>
                    <MenuItem value="number">Número</MenuItem>
                    <MenuItem value="monetary">Monetário</MenuItem>
                    <MenuItem value="cpf">CPF</MenuItem>
                    <MenuItem value="cnpj">CNPJ</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.required}
                      onChange={(e) => updateField(index, 'required', e.target.checked)}
                    />
                  }
                  label="Obrigatório"
                />
                <IconButton color="error" onClick={() => removeField(index)}>
                  <Delete />
                </IconButton>
              </Box>
            ))}
            
            <Button 
              variant="outlined" 
              startIcon={<Add />} 
              onClick={addField} 
              fullWidth 
              sx={{ mt: 2 }}
            >
              Adicionar Campo Manualmente
            </Button>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          variant="contained" 
          size="large" 
          fullWidth 
          disabled={submitting}
          sx={{ mb: 8 }}
        >
          {submitting ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </Box>
    </Container>
  );
}

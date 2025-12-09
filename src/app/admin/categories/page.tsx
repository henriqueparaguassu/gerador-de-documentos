"use client";

import AdminLayout from "@/components/AdminLayout";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { supabase } from "@/lib/supabase";
import { Add, Delete, Edit } from "@mui/icons-material";
import { Box, Button, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, List, ListItem, ListItemText, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '' });
  const [subcategoryForm, setSubcategoryForm] = useState({ name: '', slug: '', description: '', category_id: '' });
  const { showSnackbar } = useSnackbar();

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const fetchSubcategories = async () => {
    const { data, error } = await supabase
      .from('subcategories')
      .select('*, categories(name)')
      .order('name');
    
    if (error) {
      console.error('Error fetching subcategories:', error);
    } else {
      setSubcategories(data || []);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchSubcategories()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleCategorySubmit = async () => {
    const slug = categoryForm.slug || generateSlug(categoryForm.name);
    
    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update({ ...categoryForm, slug })
        .eq('id', editingCategory.id);
      
      if (error) {
        showSnackbar(`Erro: ${error.message}`, 'error');
        return;
      }
    } else {
      const { error } = await supabase
        .from('categories')
        .insert({ ...categoryForm, slug });
      
      if (error) {
        showSnackbar(`Erro: ${error.message}`, 'error');
        return;
      }
    }
    
    setCategoryDialogOpen(false);
    setCategoryForm({ name: '', slug: '', description: '' });
    setEditingCategory(null);
    fetchCategories();
  };

  const handleSubcategorySubmit = async () => {
    const slug = subcategoryForm.slug || generateSlug(subcategoryForm.name);
    
    if (editingSubcategory) {
      const { error } = await supabase
        .from('subcategories')
        .update({ ...subcategoryForm, slug })
        .eq('id', editingSubcategory.id);
      
      if (error) {
        showSnackbar(`Erro: ${error.message}`, 'error');
        return;
      }
    } else {
      const { error } = await supabase
        .from('subcategories')
        .insert({ ...subcategoryForm, slug });
      
      if (error) {
        showSnackbar(`Erro: ${error.message}`, 'error');
        return;
      }
    }
    
    setSubcategoryDialogOpen(false);
    setSubcategoryForm({ name: '', slug: '', description: '', category_id: '' });
    setEditingSubcategory(null);
    fetchSubcategories();
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Tem certeza? Isso também removerá todas as subcategorias associadas.')) return;
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      showSnackbar(`Erro: ${error.message}`, 'error');
    } else {
      fetchCategories();
      fetchSubcategories();
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm('Tem certeza?')) return;
    
    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', id);
    
    if (error) {
      showSnackbar(`Erro: ${error.message}`, 'error');
    } else {
      fetchSubcategories();
    }
  };

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Gerenciar Categorias
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader 
              title="Categorias"
              action={
                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({ name: '', slug: '', description: '' });
                    setCategoryDialogOpen(true);
                  }}
                >
                  Nova Categoria
                </Button>
              }
            />
            <CardContent>
              <List>
                {categories.map((category) => (
                  <ListItem 
                    key={category.id}
                    secondaryAction={
                      <Box>
                        <IconButton 
                          edge="end" 
                          sx={{ mr: 1 }}
                          onClick={() => {
                            setEditingCategory(category);
                            setCategoryForm({ name: category.name, slug: category.slug, description: category.description || '' });
                            setCategoryDialogOpen(true);
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          color="error"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText 
                      primary={category.name}
                      secondary={category.slug}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader 
              title="Subcategorias"
              action={
                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  onClick={() => {
                    setEditingSubcategory(null);
                    setSubcategoryForm({ name: '', slug: '', description: '', category_id: '' });
                    setSubcategoryDialogOpen(true);
                  }}
                >
                  Nova Subcategoria
                </Button>
              }
            />
            <CardContent>
              <List>
                {subcategories.map((subcategory) => (
                  <ListItem 
                    key={subcategory.id}
                    secondaryAction={
                      <Box>
                        <IconButton 
                          edge="end" 
                          sx={{ mr: 1 }}
                          onClick={() => {
                            setEditingSubcategory(subcategory);
                            setSubcategoryForm({ 
                              name: subcategory.name, 
                              slug: subcategory.slug, 
                              description: subcategory.description || '',
                              category_id: subcategory.category_id 
                            });
                            setSubcategoryDialogOpen(true);
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          color="error"
                          onClick={() => handleDeleteSubcategory(subcategory.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText 
                      primary={subcategory.name}
                      secondary={`${subcategory.categories?.name} / ${subcategory.slug}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Nome"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Slug (opcional)"
              value={categoryForm.slug}
              onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
              helperText="Deixe em branco para gerar automaticamente"
              fullWidth
            />
            <TextField
              label="Descrição"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleCategorySubmit} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog open={subcategoryDialogOpen} onClose={() => setSubcategoryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSubcategory ? 'Editar Subcategoria' : 'Nova Subcategoria'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              select
              label="Categoria"
              value={subcategoryForm.category_id}
              onChange={(e) => setSubcategoryForm({ ...subcategoryForm, category_id: e.target.value })}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </TextField>
            <TextField
              label="Nome"
              value={subcategoryForm.name}
              onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Slug (opcional)"
              value={subcategoryForm.slug}
              onChange={(e) => setSubcategoryForm({ ...subcategoryForm, slug: e.target.value })}
              helperText="Deixe em branco para gerar automaticamente"
              fullWidth
            />
            <TextField
              label="Descrição"
              value={subcategoryForm.description}
              onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubcategoryDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubcategorySubmit} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

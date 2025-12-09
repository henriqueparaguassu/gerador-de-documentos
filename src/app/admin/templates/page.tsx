"use client";

import AdminLayout from "@/components/AdminLayout";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { supabase } from "@/lib/supabase";
import { Add, Delete, Edit } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
    } else {
      setTemplates(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;

    try {
      const id = templateToDelete;
      // 1. Get template to check for file
      const { data: template, error: fetchError } = await supabase
        .from('templates')
        .select('file_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // 2. Delete file from storage if exists
      if (template?.file_url) {
        const { error: storageError } = await supabase.storage
          .from('templates')
          .remove([template.file_url]);
        
        if (storageError) console.error('Error deleting file:', storageError);
      }

      // 3. Delete associated documents (Foreign Key Constraint)
      const { error: docError } = await supabase
        .from('documents')
        .delete()
        .eq('template_id', id);

      if (docError) throw docError;

      // 4. Delete from database
      const { error } = await supabase.from('templates').delete().eq('id', id);
      if (error) throw error;

      showSnackbar('Template excluído com sucesso', 'success');
      fetchTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      showSnackbar(`Erro ao excluir template: ${error.message || 'Erro desconhecido'}`, 'error');
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  return (
    <AdminLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Gerenciar Templates
        </Typography>
        <Link href="/admin/templates/new" passHref>
          <Button variant="contained" startIcon={<Add />}>
            Novo Template
          </Button>
        </Link>
      </Box>
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Preço</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map((row) => (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell>R$ {row.price?.toFixed(2)}</TableCell>
                <TableCell align="right">
                  <Link href={`/admin/templates/${row.id}/edit`} passHref>
                    <IconButton color="primary" sx={{ mr: 1 }}>
                      <Edit />
                    </IconButton>
                  </Link>
                  <IconButton color="error" onClick={() => handleDeleteClick(row.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirmar exclusão?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

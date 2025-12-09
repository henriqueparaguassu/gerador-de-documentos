"use client";

import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/lib/supabase";
import { AttachMoney, Description, Download, TrendingUp } from "@mui/icons-material";
import { Box, Card, CardContent, CircularProgress, Grid, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalPaid: 0,
    totalRevenue: 0,
    popularTemplates: [] as any[],
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // 1. Total Documents
        const { count: totalDocs, error: docsError } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true });
        
        if (docsError) throw docsError;

        // 2. Total Paid Documents & Revenue
        // Since we don't have a direct revenue column on documents (it's on templates), we need to join.
        // But Supabase JS select with join is tricky for aggregation.
        // Let's fetch paid documents and calculate manually for now (assuming volume isn't huge).
        const { data: paidDocs, error: paidError } = await supabase
          .from('documents')
          .select('*, templates(price, name)')
          .eq('status', 'paid');

        if (paidError) throw paidError;

        const totalRevenue = paidDocs?.reduce((acc, doc) => acc + (doc.templates?.price || 0), 0) || 0;

        // 3. Popular Templates
        // We can count occurrences of template_id in documents
        const { data: allDocs, error: allDocsError } = await supabase
          .from('documents')
          .select('template_id, templates(name)');

        if (allDocsError) throw allDocsError;

        const templateCounts: Record<string, { name: string, count: number }> = {};
        allDocs?.forEach(doc => {
          const tId = doc.template_id;
          // @ts-ignore
          const tName = doc.templates?.name || 'Unknown';
          if (!templateCounts[tId]) {
            templateCounts[tId] = { name: tName, count: 0 };
          }
          templateCounts[tId].count++;
        });

        const popularTemplates = Object.values(templateCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setStats({
          totalDocuments: totalDocs || 0,
          totalPaid: paidDocs?.length || 0,
          totalRevenue,
          popularTemplates,
        });

      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={60} />
        </Box>
      </AdminLayout>
    );
  }

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ p: 1, borderRadius: 1, bgcolor: `${color}.light`, color: `${color}.main`, mr: 2 }}>
            {icon}
          </Box>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Total Documentos" 
            value={stats.totalDocuments} 
            icon={<Description />} 
            color="primary" 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Downloads Pagos" 
            value={stats.totalPaid} 
            icon={<Download />} 
            color="success" 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Receita Total" 
            value={`R$ ${stats.totalRevenue.toFixed(2)}`} 
            icon={<AttachMoney />} 
            color="warning" 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Taxa de Conversão" 
            value={`${stats.totalDocuments > 0 ? ((stats.totalPaid / stats.totalDocuments) * 100).toFixed(1) : 0}%`} 
            icon={<TrendingUp />} 
            color="info" 
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Templates Mais Populares
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.popularTemplates}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Documentos Gerados" fill="#0A2540">
                   {stats.popularTemplates.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0A2540' : '#2BD4A8'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        {/* Add more charts here if needed */}
      </Grid>
    </AdminLayout>
  );
}

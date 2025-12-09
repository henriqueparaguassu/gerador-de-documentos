"use client";

import { Facebook, Instagram, LinkedIn, Mail, Phone, Twitter } from "@mui/icons-material";
import { Box, Container, Grid, IconButton, Link, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: '#001529', color: 'rgba(255, 255, 255, 0.65)', py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* About Section */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" color="white" gutterBottom sx={{ fontWeight: 'bold' }}>
              Gerador de Documentos
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, maxWidth: 400 }}>
              Simplifique sua burocracia. Crie contratos, declarações e recibos profissionais em minutos.
            </Typography>
            <Box>
              <IconButton color="inherit" href="#" aria-label="Instagram">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" href="#" aria-label="Facebook">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" href="#" aria-label="LinkedIn">
                <LinkedIn />
              </IconButton>
              <IconButton color="inherit" href="#" aria-label="Twitter">
                <Twitter />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" color="white" gutterBottom sx={{ fontWeight: 'bold' }}>
              Links Úteis
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Link href="/" color="inherit" underline="hover">Início</Link>
              <Link href="/dashboard" color="inherit" underline="hover">Modelos</Link>
              <Link href="/contrato-de-aluguel" color="inherit" underline="hover">Contrato de Aluguel</Link>
              <Link href="/contrato-de-prestacao-de-servico" color="inherit" underline="hover">Prestação de Serviços</Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" color="white" gutterBottom sx={{ fontWeight: 'bold' }}>
              Contato
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Mail fontSize="small" />
                <Typography variant="body2">henriqueparaguassu@pm.me</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Phone fontSize="small" />
                <Typography variant="body2">(69) 98487-0149</Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Seg - Sab, 10h às 22h
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', mt: 4, pt: 4, textAlign: 'center' }}>
          <Typography variant="body2">
            Gerador de Documentos ©{new Date().getFullYear()} - Todos os direitos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

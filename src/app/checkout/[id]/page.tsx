"use client";

import { Box, CircularProgress, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    const initiateCheckout = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/checkout/${id}`, { method: 'POST' });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        
        if (data.init_point) {
          window.location.href = data.init_point;
        } else {
          throw new Error('No init_point returned');
        }
      } catch (error) {
        console.error('Error initiating checkout:', error);
        alert('Erro ao iniciar pagamento');
        router.push(`/preview/${id}`);
      }
    };

    initiateCheckout();
  }, [id, router]);

  return (
    <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
      <CircularProgress size={60} />
      <Typography variant="h6">Redirecionando para o Mercado Pago...</Typography>
    </Box>
  );
}

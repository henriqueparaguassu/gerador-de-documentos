"use client";

import { Spin, message } from "antd";
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
        message.error('Erro ao iniciar pagamento');
        router.push(`/preview/${id}`);
      }
    };

    initiateCheckout();
  }, [id, router]);

  return (
    <div className="flex h-screen items-center justify-center flex-col gap-4">
      <Spin size="large" />
      <p>Redirecionando para o Mercado Pago...</p>
    </div>
  );
}

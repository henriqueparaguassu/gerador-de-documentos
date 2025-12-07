"use client";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ArrowLeftOutlined, LockOutlined } from "@ant-design/icons";
import { Button, Layout, Spin, message, theme } from "antd";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const { Header, Content, Footer } = Layout;

export default function PreviewPage() {
  const { id } = useParams();
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [documentData, setDocumentData] = useState<any>(null);
  const { user } = useAuth();
  const router = useRouter();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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
        message.error('Erro ao carregar documento');
        setLoading(false);
        return;
      }
      setDocumentData(doc);

      // Fetch HTML preview
      try {
        const res = await fetch(`/api/preview/${id}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setHtmlContent(data.html);
      } catch (error) {
        console.error('Error fetching preview:', error);
        message.error('Erro ao gerar preview');
      } finally {
        setLoading(false);
      }
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout className="min-h-screen">
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/dashboard" className="text-white hover:text-gray-300 flex items-center gap-2">
          <ArrowLeftOutlined /> Voltar
        </Link>
        {!user && (
          <Link href={`/login?returnUrl=/preview/${id}`}>
            <Button type="primary">Entrar</Button>
          </Link>
        )}
      </Header>
      <Content style={{ padding: '0 48px', marginTop: 24 }}>
        <div
          style={{
            background: colorBgContainer,
            padding: 24,
            borderRadius: borderRadiusLG,
            maxWidth: 800,
            margin: '0 auto',
            position: 'relative',
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Preview do Documento</h1>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">
                Total: R$ {documentData?.templates?.price?.toFixed(2)}
              </p>
              <Button type="primary" size="large" icon={<LockOutlined />} onClick={handlePayment}>
                Pagar e Baixar
              </Button>
            </div>
          </div>

          <div className="relative border p-8 min-h-[500px] bg-white shadow-sm">
            {/* Watermark Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
              <div className="transform -rotate-45 text-gray-300 text-9xl font-bold opacity-50 select-none whitespace-nowrap">
                PREVIEW - NÃO PAGO
              </div>
            </div>
            
            {/* Document Content */}
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlContent }} 
            />
          </div>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Gerador de Documentos ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}

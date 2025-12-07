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
      <Content style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Header Actions */}
        {/* Header Actions */}
        <div className="w-full max-w-[210mm] flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Preview do Documento</h1>
          <div className="flex items-center gap-4">
            <p className="text-lg font-bold text-green-600 m-0">
              Total: R$ {documentData?.templates?.price?.toFixed(2)}
            </p>
            <Button onClick={() => window.print()}>
              Baixar (PDF)
            </Button>
            <Button type="primary" size="large" icon={<LockOutlined />} onClick={handlePayment}>
              Baixar sem marca d'água
            </Button>
          </div>
        </div>

        <style jsx global>{`
          .ql-align-center { text-align: center; }
          .ql-align-right { text-align: right; }
          .ql-align-justify { text-align: justify; }
        `}</style>

        {/* A4 Paper Preview */}
        <div
          className="bg-white shadow-lg relative mx-auto"
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '20mm',
            boxSizing: 'border-box',
          }}
        >
          {/* Watermark */}
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-10"
          >
            <div 
              className="text-gray-200 text-9xl font-bold transform -rotate-45 whitespace-nowrap"
              style={{ opacity: 0.5 }}
            >
              PREVIEW - NÃO PAGO
            </div>
          </div>

          {/* HTML Content */}
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
          />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Gerador de Documentos ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}

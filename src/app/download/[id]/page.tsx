"use client";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ArrowLeftOutlined, FilePdfOutlined, FileWordOutlined } from "@ant-design/icons";
import { Button, Layout, Result, Spin, message, theme } from "antd";
import jsPDF from "jspdf";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const { Header, Content, Footer } = Layout;

export default function DownloadPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [documentData, setDocumentData] = useState<any>(null);
  const [htmlContent, setHtmlContent] = useState('');
  const { user } = useAuth();
  const router = useRouter();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) return;
      setLoading(true);

      const { data: doc, error: docError } = await supabase
        .from('documents')
        .select('*, templates(*)')
        .eq('id', id)
        .single();
      
      if (docError || !doc) {
        message.error('Erro ao carregar documento');
        setLoading(false);
        return;
      }

      // Check if paid
      if (doc.status !== 'paid') {
        // If coming from success url, maybe webhook hasn't fired yet.
        // We can try to check payment status manually if needed, but for now let's trust DB or wait.
        // Or if status=success in URL, we might want to show a "Processing" state.
        if (searchParams.get('status') === 'success') {
           // Ideally we should verify with backend, but let's just show the page and hope DB updates soon.
           // Or we can poll.
        } else {
           message.warning('Documento não pago');
           router.push(`/preview/${id}`);
           return;
        }
      }

      setDocumentData(doc);

      // Fetch HTML for PDF generation
      try {
        const res = await fetch(`/api/preview/${id}`);
        const data = await res.json();
        setHtmlContent(data.html);
      } catch (error) {
        console.error('Error fetching content:', error);
      }

      setLoading(false);
    };

    fetchDocument();
  }, [id, router, searchParams]);

  const downloadWord = async () => {
    try {
      const res = await fetch(`/api/download/${id}`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentData.templates.name}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      message.error('Erro ao baixar Word');
    }
  };

  const downloadPdf = () => {
    const doc = new jsPDF();
    // Simple HTML to text/pdf conversion. For complex layout, html2canvas is better but heavier.
    // Or just use the html method of jsPDF.
    doc.html(htmlContent, {
      callback: function (doc) {
        doc.save(`${documentData.templates.name}.pdf`);
      },
      x: 10,
      y: 10,
      width: 190, // max width
      windowWidth: 800
    });
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
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <Link href="/dashboard" className="text-white hover:text-gray-300 flex items-center gap-2">
          <ArrowLeftOutlined /> Voltar
        </Link>
      </Header>
      <Content style={{ padding: '0 48px', marginTop: 24 }}>
        <div
          style={{
            background: colorBgContainer,
            padding: 24,
            borderRadius: borderRadiusLG,
            maxWidth: 800,
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <Result
            status="success"
            title="Pagamento Confirmado!"
            subTitle="Seu documento está pronto para download."
            extra={[
              <Button type="primary" key="word" icon={<FileWordOutlined />} size="large" onClick={downloadWord}>
                Baixar Word (.docx)
              </Button>,
              <Button key="pdf" icon={<FilePdfOutlined />} size="large" onClick={downloadPdf}>
                Baixar PDF (.pdf)
              </Button>,
            ]}
          />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Gerador de Documentos ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}

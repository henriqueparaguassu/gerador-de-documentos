"use client";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { FileTextOutlined } from "@ant-design/icons";
import { Button, Card, Col, Layout, Row, Spin, theme } from "antd";
import Link from "next/link";
import { useEffect, useState } from "react";

const { Content, Footer } = Layout;

export default function Dashboard() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
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

    fetchTemplates();
  }, []);

  return (
    <Layout className="min-h-screen flex flex-col">
      <Navbar />
      <Content style={{ padding: '0 48px', marginTop: 24, flexGrow: 1 }}>
        <div
          style={{
            background: colorBgContainer,
            minHeight: 280,
            padding: 24,
            borderRadius: borderRadiusLG,
          }}
        >
          <h1 className="text-2xl font-bold mb-6">Modelos Disponíveis</h1>
          
          {loading ? (
            <div className="flex justify-center p-12">
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {templates.map((template) => (
                <Col xs={24} sm={12} md={8} lg={6} key={template.id}>
                  <Card
                    title={template.name}
                    extra={<FileTextOutlined />}
                    actions={[
                      <Link href={`/templates/${template.id}`} key="select">
                        <Button type="primary" block>
                          Selecionar
                        </Button>
                      </Link>
                    ]}
                  >
                    <p className="text-gray-500 h-12 overflow-hidden text-ellipsis">
                      {template.description || 'Sem descrição'}
                    </p>
                    <div className="mt-4 font-bold text-lg text-green-600">
                      R$ {template.price?.toFixed(2)}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Gerador de Documentos ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}

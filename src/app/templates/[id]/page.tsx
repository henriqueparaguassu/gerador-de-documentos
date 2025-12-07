"use client";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, DatePicker, Form, Input, InputNumber, Layout, Spin, message, theme } from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const { Header, Content, Footer } = Layout;

export default function TemplateDetails() {
  const { id } = useParams();
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const [form] = Form.useForm();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching template:', error);
        message.error('Erro ao carregar template');
      } else {
        setTemplate(data);
      }
      setLoading(false);
    };

    fetchTemplate();
  }, [id]);

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      // Format dates if necessary
      const formattedValues = { ...values };
      template.fields_config.forEach((field: any) => {
        if (field.type === 'date' && values[field.key]) {
          formattedValues[field.key] = dayjs(values[field.key]).format('DD/MM/YYYY');
        } else if (field.type === 'monetary' && values[field.key]) {
           formattedValues[field.key] = values[field.key].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
      });

      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user?.id || null, // Allow null user_id
          template_id: template.id,
          data: formattedValues,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/preview/${data.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
      message.error('Erro ao criar documento');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!template) {
    return <div>Template não encontrado</div>;
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
          }}
        >
          <h1 className="text-2xl font-bold mb-2">{template.name}</h1>
          <p className="text-gray-500 mb-6">{template.description}</p>
          
          <Card title="Preencha os dados do documento">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              {template.fields_config.map((field: any) => {
                let inputComponent = <Input />;
                if (field.type === 'date') {
                  inputComponent = <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />;
                } else if (field.type === 'number') {
                  inputComponent = <InputNumber style={{ width: '100%' }} />;
                } else if (field.type === 'monetary') {
                  inputComponent = (
                    <InputNumber
                      formatter={(value) => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(displayValue) => displayValue?.replace(/R\$\s?|(,*)/g, '') as unknown as number}
                      style={{ width: '100%' }}
                      precision={2}
                      decimalSeparator=","
                    />
                  );
                }

                return (
                  <Form.Item
                    key={field.key}
                    label={field.label}
                    name={field.key}
                    rules={[{ required: field.required ?? true, message: `Por favor insira ${field.label}` }]}
                  >
                    {inputComponent}
                  </Form.Item>
                );
              })}

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={submitting} block size="large">
                  Gerar Preview
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Gerador de Documentos ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}

"use client";

import { supabase } from "@/lib/supabase";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Form, Input, InputNumber, message, Select, Typography } from "antd";
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const { Title, Text } = Typography;
const { Option } = Select;

export default function NewTemplatePage() {
  const [uploading, setUploading] = useState(false);
  const [fields, setFields] = useState<any[]>([]);
  const [htmlContent, setHtmlContent] = useState('');
  const router = useRouter();
  const [form] = Form.useForm();

  // Extract keys from HTML content
  useEffect(() => {
    const regex = /{([a-zA-Z0-9_]+)}/g;
    const matches = [...htmlContent.matchAll(regex)].map(m => m[1]);
    const uniqueKeys = Array.from(new Set(matches));

    setFields(prevFields => {
      const existingKeys = new Set(prevFields.map(f => f.key));
      const newFields = [...prevFields];

      // Add new keys found in HTML
      uniqueKeys.forEach(key => {
        if (!existingKeys.has(key)) {
          newFields.push({ key, label: key, type: 'text', required: true });
        }
      });

      return newFields;
    });
  }, [htmlContent]);

  const addField = () => {
    setFields([...fields, { key: '', label: '', type: 'text', required: true }]);
  };

  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  const updateField = (index: number, key: string, value: any) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const onFinish = async (values: any) => {
    if (!htmlContent) {
      message.error('Por favor, crie o conteúdo HTML do template.');
      return;
    }

    setUploading(true);
    try {
      const { error: dbError } = await supabase
        .from('templates')
        .insert({
          name: values.name,
          description: values.description,
          price: values.price,
          file_url: null, // No file upload
          fields_config: fields,
          html_content: htmlContent,
        });

      if (dbError) throw dbError;

      message.success('Template criado com sucesso!');
      router.push('/admin/templates');
    } catch (error: any) {
      console.error('Error creating template:', error);
      message.error(`Erro ao criar template: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  }), []);

  return (
    <div className="max-w-4xl mx-auto">
      <Title level={2}>Novo Template</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ price: 0 }}
      >
        <Card title="Informações Básicas" className="mb-6">
          <Form.Item
            name="name"
            label="Nome do Template"
            rules={[{ required: true, message: 'Por favor insira o nome' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Descrição"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="price"
            label="Preço (R$)"
            rules={[{ required: true, message: 'Por favor insira o preço' }]}
          >
            <InputNumber
              formatter={(value) => `R$ ${value}`.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={(displayValue) => displayValue?.replace(/R\$\s?|(\.*)/g, '').replace(',', '.') as unknown as number}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Card>

        <Card title="Editor Visual (Preview e PDF)" className="mb-6">
          <Text type="secondary" className="block mb-4">
            Crie o visual do documento aqui. Use as chaves entre chaves simples, ex: {'{nome_cliente}'}.
            As chaves serão identificadas automaticamente abaixo.
          </Text>
          <div className="h-96 mb-12">
            <ReactQuill
              theme="snow"
              value={htmlContent}
              onChange={setHtmlContent}
              modules={modules}
              style={{ height: '300px' }}
            />
          </div>
        </Card>

        <Card title="Configuração de Campos" className="mb-6">
          <Text type="secondary" className="block mb-4">
            Revise os campos identificados. Ajuste os labels e tipos conforme necessário.
          </Text>
          
          {fields.map((field, index) => (
            <div key={index} className="flex gap-4 mb-4 items-center">
              <Input
                placeholder="Label (ex: Nome Completo)"
                value={field.label}
                onChange={(e) => updateField(index, 'label', e.target.value)}
                style={{ flex: 2 }}
              />
              <Input
                placeholder="Chave"
                value={field.key}
                disabled
                style={{ flex: 1, backgroundColor: '#f5f5f5' }}
              />
              <Select
                value={field.type}
                onChange={(value) => updateField(index, 'type', value)}
                style={{ width: 120 }}
              >
                <Option value="text">Texto</Option>
                <Option value="date">Data</Option>
                <Option value="number">Número</Option>
                <Option value="monetary">Monetário</Option>
                <Option value="cpf">CPF</Option>
                <Option value="cnpj">CNPJ</Option>
              </Select>
              <Checkbox
                checked={field.required}
                onChange={(e: any) => updateField(index, 'required', e.target.checked)}
              >
                Obrigatório
              </Checkbox>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeField(index)}
              />
            </div>
          ))}
          
          <Button type="dashed" onClick={addField} block icon={<PlusOutlined />}>
            Adicionar Campo Manualmente
          </Button>
        </Card>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={uploading} block size="large">
            Criar Template
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

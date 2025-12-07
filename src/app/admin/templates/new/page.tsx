"use client";

import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/lib/supabase";
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, InputNumber, Select, Space, Upload } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewTemplate() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const file = values.file[0].originFileObj;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `templates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('templates')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('templates')
        .insert({
          name: values.name,
          description: values.description,
          price: values.price,
          file_url: filePath,
          fields_config: values.fields,
        });

      if (dbError) throw dbError;

      router.push('/admin/templates');
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Erro ao criar template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Novo Template</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Nome do Template"
          name="name"
          rules={[{ required: true, message: 'Por favor insira o nome!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Descrição"
          name="description"
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item
          label="Preço (R$)"
          name="price"
          rules={[{ required: true, message: 'Por favor insira o preço!' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            formatter={value => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value!.replace(/\R\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          label="Arquivo do Template (.docx)"
          name="file"
          valuePropName="fileList"
          getValueFromEvent={(e: any) => {
            if (Array.isArray(e)) {
              return e;
            }
            return e?.fileList;
          }}
          rules={[{ required: true, message: 'Por favor faça upload do arquivo!' }]}
        >
          <Upload name="file" maxCount={1} accept=".docx">
            <Button icon={<UploadOutlined />}>Clique para Upload</Button>
          </Upload>
        </Form.Item>

        <Card title="Campos do Formulário" className="mb-4">
          <Form.List name="fields">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'label']}
                      rules={[{ required: true, message: 'Label obrigatório' }]}
                    >
                      <Input placeholder="Label (ex: Nome Completo)" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'key']}
                      rules={[{ required: true, message: 'Chave obrigatória' }]}
                    >
                      <Input placeholder="Chave (ex: full_name)" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'type']}
                      initialValue="text"
                    >
                      <Select style={{ width: 120 }}>
                        <Select.Option value="text">Texto</Select.Option>
                        <Select.Option value="date">Data</Select.Option>
                        <Select.Option value="number">Número</Select.Option>
                        <Select.Option value="cpf">CPF</Select.Option>
                        <Select.Option value="cnpj">CNPJ</Select.Option>
                      </Select>
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Adicionar Campo
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Criar Template
          </Button>
        </Form.Item>
      </Form>
    </AdminLayout>
  );
}

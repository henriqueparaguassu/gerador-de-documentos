"use client";

import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/lib/supabase";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, Table, message } from "antd";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      // 1. Get template to check for file
      const { data: template, error: fetchError } = await supabase
        .from('templates')
        .select('file_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // 2. Delete file from storage if exists
      if (template?.file_url) {
        const { error: storageError } = await supabase.storage
          .from('templates')
          .remove([template.file_url]);
        
        if (storageError) console.error('Error deleting file:', storageError);
      }

      // 3. Delete associated documents (Foreign Key Constraint)
      const { error: docError } = await supabase
        .from('documents')
        .delete()
        .eq('template_id', id);

      if (docError) throw docError;

      // 4. Delete from database
      const { error } = await supabase.from('templates').delete().eq('id', id);
      if (error) throw error;

      message.success('Template excluído com sucesso');
      fetchTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      message.error(`Erro ao excluir template: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Preço',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `R$ ${price.toFixed(2)}`,
    },
    {
      title: 'Ações',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Popconfirm title="Tem certeza?" onConfirm={() => handleDelete(record.id)}>
            <a className="text-red-500">Excluir</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gerenciar Templates</h1>
        <Link href="/admin/templates/new">
          <Button type="primary" icon={<PlusOutlined />}>
            Novo Template
          </Button>
        </Link>
      </div>
      <Table columns={columns} dataSource={templates} rowKey="id" loading={loading} />
    </AdminLayout>
  );
}

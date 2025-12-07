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
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error) {
      message.error('Erro ao excluir template');
    } else {
      message.success('Template excluído com sucesso');
      fetchTemplates();
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

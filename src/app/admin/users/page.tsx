"use client";

import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/lib/supabase";
import { Table, Tag } from "antd";
import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      // Fetch profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Data de Cadastro',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
    },
  ];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Gerenciar Usuários</h1>
      <Table columns={columns} dataSource={users} rowKey="id" loading={loading} />
    </AdminLayout>
  );
}

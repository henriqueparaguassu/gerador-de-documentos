"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LogoutOutlined } from "@ant-design/icons";
import { Button, Layout } from "antd";
import Link from "next/link";

const { Header } = Layout;

export default function Navbar() {
  const { signOut, user, isAdmin } = useAuth();

  const getGreeting = () => {
    if (user?.user_metadata?.full_name) {
      const firstName = user.user_metadata.full_name.split(' ')[0];
      return `Olá, ${firstName}`;
    }
    return `Olá, ${user?.email}`;
  };

  return (
    <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Link href="/" className="text-white text-lg font-bold hover:text-gray-300">
        Gerador de Documentos
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {isAdmin && (
              <Link href="/admin/dashboard">
                <Button type="default" ghost className="text-white border-white hover:text-gray-200 hover:border-gray-200">
                  Admin
                </Button>
              </Link>
            )}
            <span className="text-white">{getGreeting()}</span>
            <Button type="primary" danger icon={<LogoutOutlined />} onClick={signOut}>
              Sair
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button type="primary">Entrar</Button>
          </Link>
        )}
      </div>
    </Header>
  );
}

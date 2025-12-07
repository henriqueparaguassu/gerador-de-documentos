"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
    DashboardOutlined,
    FileOutlined,
    LogoutOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Spin, theme } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const { Header, Content, Sider } = Layout;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/");
      } else if (!isAdmin) {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
      label: <Link href="/admin/dashboard">Dashboard</Link>,
    },
    {
      key: "/admin/templates",
      icon: <FileOutlined />,
      label: <Link href="/admin/templates">Templates</Link>,
    },
    {
      key: "/admin/users",
      icon: <UserOutlined />,
      label: <Link href="/admin/users">Usuários</Link>,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sair",
      onClick: signOut,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: "0 16px" }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              marginTop: 16,
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

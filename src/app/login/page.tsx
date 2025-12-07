"use client";

import { supabase } from "@/lib/supabase";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Layout, message, Tabs, theme } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const { Content, Footer } = Layout;

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const onLogin = async (values: any) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      message.error(error.message);
    } else {
      router.push(returnUrl);
    }
    setLoading(false);
  };

  const toTitleCase = (str: string) => {
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const onRegister = async (values: any) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: toTitleCase(values.full_name),
        },
      },
    });

    if (error) {
      message.error(error.message);
    } else {
      message.success("Cadastro realizado! Verifique seu email ou faça login.");
      if (data.session) {
        router.push(returnUrl);
      }
    }
    setLoading(false);
  };

  const items = [
    {
      key: "login",
      label: "Entrar",
      children: (
        <Form
          name="login"
          onFinish={onLogin}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Por favor insira seu email!" }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Por favor insira sua senha!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Senha" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Entrar
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "register",
      label: "Cadastrar",
      children: (
        <Form
          name="register"
          onFinish={onRegister}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="full_name"
            rules={[{ required: true, message: "Por favor insira seu nome!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nome Completo" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Por favor insira seu email!" }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Por favor insira sua senha!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Senha" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Cadastrar
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Gerador de Documentos</h1>
            <p className="text-gray-600">Faça login para continuar</p>
          </div>
          
          <Card
            style={{
              borderRadius: borderRadiusLG,
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          >
            <Tabs defaultActiveKey="login" items={items} centered />
          </Card>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Gerador de Documentos ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginForm />
    </Suspense>
  );
}

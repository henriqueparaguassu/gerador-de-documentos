import { AuthProvider } from "@/contexts/AuthContext";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from 'react';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gerador de Documentos",
  description: "Gerador de documentos baseado em templates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AntdRegistry>
          <AuthProvider>
            {children}
          </AuthProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}

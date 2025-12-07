"use client";

import Navbar from "@/components/Navbar";
import { Button, Collapse, Layout, theme } from "antd";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";

const { Content, Footer } = Layout;
const { Panel } = Collapse;

const seoContent: Record<string, {
  title: string;
  description: string;
  explanation: string;
  faqs: { question: string; answer: string }[];
}> = {
  "contrato-de-prestacao-de-servico": {
    title: "Contrato de Prestação de Serviço",
    description: "Gere seu contrato de prestação de serviços profissional em minutos.",
    explanation: "O contrato de prestação de serviços é um documento fundamental para formalizar a relação entre um prestador de serviços e seu cliente. Ele define as obrigações de ambas as partes, o escopo do trabalho, prazos, valores e condições de pagamento, garantindo segurança jurídica para todos.",
    faqs: [
      {
        question: "Para que serve este contrato?",
        answer: "Serve para garantir que o serviço contratado seja entregue conforme o combinado e que o pagamento seja realizado. Ele protege tanto o prestador quanto o cliente de possíveis desentendimentos."
      },
      {
        question: "Preciso reconhecer firma?",
        answer: "Embora não seja obrigatório para a validade do contrato, o reconhecimento de firma das assinaturas traz maior segurança e autenticidade ao documento."
      },
      {
        question: "O que deve constar no contrato?",
        answer: "Identificação das partes, descrição detalhada do serviço, valor e forma de pagamento, prazo de execução, obrigações das partes e foro para resolução de disputas."
      }
    ]
  },
  "contrato-de-aluguel": {
    title: "Contrato de Aluguel",
    description: "Crie um contrato de aluguel residencial ou comercial completo e seguro.",
    explanation: "O contrato de aluguel (ou locação) é o instrumento que regula o uso de um imóvel pelo locatário mediante pagamento ao locador. Ele estabelece as regras de convivência, manutenção, prazos, reajustes e garantias, sendo essencial para uma locação tranquila.",
    faqs: [
      {
        question: "Qual o prazo mínimo para locação residencial?",
        answer: "A lei do inquilinato sugere 30 meses, mas as partes podem acordar prazos menores. Contratos com menos de 30 meses exigem retomada apenas para uso próprio ou após 5 anos de locação ininterrupta."
      },
      {
        question: "Quais garantias posso exigir?",
        answer: "As mais comuns são caução (depósito), fiador ou seguro-fiança. A lei permite exigir apenas uma modalidade de garantia por contrato."
      }
    ]
  },
  "acordo-de-divida": {
    title: "Acordo de Dívida",
    description: "Formalize a negociação de débitos com um termo de confissão de dívida.",
    explanation: "O acordo de dívida, ou termo de confissão de dívida, é um documento onde o devedor reconhece formalmente sua dívida e se compromete a pagá-la sob determinadas condições. É um título executivo extrajudicial que facilita a cobrança em caso de inadimplência.",
    faqs: [
      {
        question: "Este documento tem validade jurídica?",
        answer: "Sim, quando assinado pelo devedor e duas testemunhas, torna-se um título executivo extrajudicial, permitindo execução direta na justiça em caso de não pagamento."
      },
      {
        question: "Posso parcelar a dívida neste acordo?",
        answer: "Sim, o acordo pode prever o pagamento à vista ou parcelado, definindo datas, valores e multas por atraso."
      }
    ]
  },
  "declaracao-de-residencia": {
    title: "Declaração de Residência",
    description: "Emita uma declaração de residência válida para comprovação de endereço.",
    explanation: "A declaração de residência é utilizada quando uma pessoa precisa comprovar onde mora mas não possui contas de consumo em seu nome. O proprietário do imóvel ou titular das contas declara que a pessoa reside naquele endereço.",
    faqs: [
      {
        question: "Quem pode assinar a declaração?",
        answer: "Geralmente o titular do comprovante de endereço (conta de luz, água, etc.) ou o proprietário do imóvel onde a pessoa reside."
      },
      {
        question: "Preciso anexar comprovantes?",
        answer: "Sim, é recomendável anexar uma cópia do comprovante de endereço em nome do declarante junto com a declaração assinada."
      }
    ]
  }
};

export default function SeoPage() {
  const params = useParams();
  const slug = params.slug as string;
  const content = seoContent[slug];
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  if (!content) {
    notFound();
  }

  return (
    <Layout className="min-h-screen flex flex-col">
      <Navbar />
      <Content style={{ padding: '0 48px', marginTop: 48, flexGrow: 1 }}>
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              {content.title}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {content.description}
            </p>
            <Link href="/dashboard">
              <Button type="primary" size="large" className="h-12 px-8 text-lg">
                Gerar Agora
              </Button>
            </Link>
          </div>

          {/* Explanation Section */}
          <div 
            className="mb-12 p-8"
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <h2 className="text-2xl font-bold mb-4">O que é?</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {content.explanation}
            </p>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Perguntas Frequentes</h2>
            <Collapse size="large" defaultActiveKey={['0']}>
              {content.faqs.map((faq, index) => (
                <Panel header={faq.question} key={index}>
                  <p>{faq.answer}</p>
                </Panel>
              ))}
            </Collapse>
          </div>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Gerador de Documentos ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}

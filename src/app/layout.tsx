import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/variables.css";
import "@/styles/typography.css";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ateliê Filhos de Aruanda — Gestão e Precificação",
  description:
    "Sistema interno de gestão, custos, produção, estoque e precificação.",
};

/**
 * Layout raiz da aplicação.
 * Injeta os tokens visuais globais e as fontes usadas por todas as páginas.
 *
 * @param children conteúdo da rota atual
 * @returns documento HTML base
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter_Tight } from "next/font/google";
import { Estrutura } from "@/components/layout/estrutura";
import { RegistrarServiceWorker } from "@/components/layout/registrar-sw";
import "./globals.css";

const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CITi Legacy",
  description: "Todos os projetos do CITi, acompanhados semana a semana: andamento, prazos, resumo com IA e reunião da diretoria.",
  applicationName: "CITi Legacy",
  // instalado na tela de início do iPhone/iPad: abre em tela cheia, com a barra de status escura
  appleWebApp: { capable: true, title: "CITi Legacy", statusBarStyle: "black" },
  formatDetection: { telephone: false },
};

// cor da barra do navegador/sistema no celular (a mesma do fundo do app)
export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`h-full ${interTight.variable} ${plexMono.variable}`}>
      <body className="flex min-h-full flex-col bg-fundo text-gray-900 antialiased">
        <Estrutura>{children}</Estrutura>
        <RegistrarServiceWorker />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter_Tight } from "next/font/google";
import { Estrutura } from "@/components/layout/estrutura";
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
  description: "Todo projeto deixa um legado. Quem chega não começa do zero.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`h-full ${interTight.variable} ${plexMono.variable}`}>
      <body className="flex min-h-full flex-col bg-fundo text-gray-900 antialiased">
        <Estrutura>{children}</Estrutura>
      </body>
    </html>
  );
}

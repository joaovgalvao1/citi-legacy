import type { Metadata } from "next";
import { Estrutura } from "@/components/layout/estrutura";
import "./globals.css";

export const metadata: Metadata = {
  title: "CITi Legacy",
  description: "Todo projeto deixa um legado. Quem chega não começa do zero.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="flex min-h-full flex-col bg-gray-50 text-gray-900">
        <Estrutura>{children}</Estrutura>
        <footer className="border-t border-gray-300 py-3 text-center text-xs text-gray-500">
          Protótipo · etapa 2 (média fidelidade)
        </footer>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "CITi Legacy",
  description: "Quem sai deixa um legado. Quem chega não começa do zero.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="flex min-h-full flex-col bg-gray-50 text-gray-900">
        <header className="border-b border-gray-400 bg-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-baseline justify-between gap-2 px-4 py-3">
            <Link href="/" className="text-lg font-bold">
              CITi Legacy
            </Link>
            <nav className="text-sm">
              <Link href="/projetos" className="text-gray-700 underline hover:text-gray-900">
                Projetos
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-gray-300 py-3 text-center text-xs text-gray-500">
          Wireframe · etapa 1 (baixa fidelidade)
        </footer>
      </body>
    </html>
  );
}

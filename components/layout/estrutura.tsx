"use client";

// Cabeçalho e proteção das páginas.
// Na tela de login ("/") não há menu; nas demais, quem não está logado volta ao login.

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { sair, useUsuario } from "@/lib/sessao";

export function Estrutura({ children }: { children: ReactNode }) {
  const usuario = useUsuario();
  const caminho = usePathname();
  const router = useRouter();
  const naLogin = caminho === "/";

  useEffect(() => {
    if (usuario === null && !naLogin) router.replace("/");
    if (usuario && naLogin) router.replace("/projetos");
  }, [usuario, naLogin, router]);

  // undefined = ainda no servidor/hidratação: a página é renderizada normalmente
  // (o Next precisa disso para pré-renderizar); no navegador, quem não está logado é redirecionado.
  const liberado = usuario === undefined || (naLogin ? usuario === null : !!usuario);

  return (
    <>
      {!naLogin && (
        <header className="border-b border-gray-400 bg-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href="/projetos" className="text-lg font-bold">
              CITi Legacy
            </Link>
            {usuario && (
              <nav className="flex flex-wrap items-center gap-4 text-sm">
                <Link href="/projetos" className={caminho.startsWith("/projetos") ? "font-semibold" : "text-gray-700 hover:text-gray-900"}>
                  Projetos
                </Link>
                <Link href="/membros" className={caminho.startsWith("/membros") ? "font-semibold" : "text-gray-700 hover:text-gray-900"}>
                  Membros
                </Link>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">{usuario}</span>
                <button
                  type="button"
                  onClick={() => {
                    sair();
                    router.replace("/");
                  }}
                  className="cursor-pointer text-gray-700 underline hover:text-gray-900"
                >
                  Sair
                </button>
              </nav>
            )}
          </div>
        </header>
      )}
      <main className={naLogin ? "flex flex-1 items-center justify-center px-4 py-10" : "mx-auto w-full max-w-5xl flex-1 px-4 py-6"}>
        {liberado ? children : <p className="text-sm text-gray-500">Carregando…</p>}
      </main>
    </>
  );
}

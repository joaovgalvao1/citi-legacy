"use client";

// Cabeçalho e proteção das páginas.
// Páginas públicas: a entrada ("/") e o login ("/login"). As demais exigem login;
// quem não está logado volta ao login.

import { useEffect, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { sair, useUsuario } from "@/lib/sessao";
import { IconeEntrar, IconeSair, IconeUsuario } from "@/components/ui/icones";
import { Marca } from "./marca";

const PUBLICAS = ["/", "/login"];

export function Estrutura({ children }: { children: ReactNode }) {
  const usuario = useUsuario();
  const caminho = usePathname();
  const router = useRouter();
  const publica = PUBLICAS.includes(caminho);
  // versão de impressão (PDF): sem cabeçalho nem rodapé do site
  const impressao = caminho.startsWith("/exportar/");

  useEffect(() => {
    if (usuario === null && !publica) router.replace("/login");
    if (usuario && caminho === "/login") router.replace("/projetos");
  }, [usuario, publica, caminho, router]);

  // undefined = ainda no servidor/hidratação: a página é renderizada normalmente
  // (o Next precisa disso para pré-renderizar); no navegador, quem não está logado é redirecionado.
  const liberado = usuario === undefined || publica || !!usuario;

  if (impressao) return liberado ? <main className="flex-1">{children}</main> : null;

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-gray-300 bg-fundo/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Marca href={usuario ? "/projetos" : "/"} />
          {publica ? (
            caminho === "/" && (
              <Link
                href={usuario ? "/projetos" : "/login"}
                aria-label={usuario ? "Abrir o painel" : "Entrar"}
                className="inline-flex items-center gap-2 rounded-full border border-gray-400 px-4 py-1.5 text-sm text-gray-800 transition-colors hover:border-verde hover:text-verde"
              >
                <IconeEntrar className="h-4 w-4" />
                {usuario ? "Abrir painel" : "Entrar"}
              </Link>
            )
          ) : (
            usuario && (
              <nav className="flex flex-wrap items-center gap-1 text-sm">
                {[
                  ["/projetos", "Projetos"],
                  ["/membros", "Membros"],
                ].map(([href, rotulo]) => {
                  const ativo = caminho.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={ativo ? "page" : undefined}
                      className={`rounded-full px-3 py-1.5 transition-colors ${
                        ativo ? "bg-verde/10 text-verde" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {rotulo}
                    </Link>
                  );
                })}
                <span className="mx-2 h-5 w-px bg-gray-400" aria-hidden="true" />
                <span className="flex items-center gap-1.5 text-gray-600">
                  <IconeUsuario className="h-4 w-4" />
                  {usuario}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sair();
                    router.replace("/");
                  }}
                  aria-label="Sair"
                  title="Sair"
                  className="ml-1 cursor-pointer rounded-full p-1.5 text-gray-600 transition-colors hover:text-verde"
                >
                  <IconeSair className="h-4 w-4" />
                </button>
              </nav>
            )
          )}
        </div>
      </header>
      <main
        className={
          caminho === "/"
            ? "flex-1"
            : caminho === "/login"
              ? "flex flex-1 items-center justify-center px-4 py-10"
              : "mx-auto w-full max-w-5xl flex-1 px-4 py-8"
        }
      >
        {liberado ? children : <p className="text-sm text-gray-500">Carregando…</p>}
      </main>
      <footer className="border-t border-gray-300 py-5 text-xs text-gray-500">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2 px-4">
          <Image src="/marca/citi-logo-verde.png" alt="CITi" width={225} height={115} className="h-4 w-auto" />
          <span className="font-semibold text-gray-700">Legacy</span>
          <span aria-hidden="true">·</span>
          <span>protótipo para o desafio Inovação no PS</span>
        </div>
      </footer>
    </>
  );
}

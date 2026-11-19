"use client";

// Cabeçalho e proteção das páginas.
// Páginas públicas: a entrada ("/") e o login ("/login"). As demais exigem login;
// quem não está logado volta ao login.

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { destinoDepoisDoLogin, sair, useUsuario } from "@/lib/sessao";
import { IconeCasa, IconeEntrar, IconeSair, IconeUsuario } from "@/components/ui/icones";
import { CaixaEsqueleto } from "@/components/ui";
import { Avisos } from "@/components/ui/avisos";
import { Lockup, Marca } from "./marca";

const PUBLICAS = ["/", "/login"];

type JanelaComReact = Window & { $RB?: unknown[]; $RV?: (fila: unknown[]) => void };

/**
 * Mostra o conteúdo que já chegou do servidor mesmo sem o navegador desenhar a página.
 * O React só troca o skeleton pelo conteúdo pronto no próximo quadro de animação
 * (requestAnimationFrame), que não acontece em abas em segundo plano: a página ficava
 * parada no carregamento (ex.: Visão geral do GALT aberta numa aba nova). Aqui, se houver
 * conteúdo esperando, ele é aplicado por um temporizador, que funciona com a aba escondida.
 */
function useMostrarConteudoPendente() {
  useEffect(() => {
    const w = window as JanelaComReact;
    let vezes = 0;
    const id = window.setInterval(() => {
      if (w.$RB?.length && w.$RV) w.$RV(w.$RB);
      if (++vezes >= 20) window.clearInterval(id);
    }, 500);
    return () => window.clearInterval(id);
  }, []);
}

export function Estrutura({ children }: { children: ReactNode }) {
  const usuario = useUsuario();
  const caminho = usePathname();
  const router = useRouter();
  // ao clicar em "Sair", vai para a entrada (e não para o login)
  const saindo = useRef(false);
  useMostrarConteudoPendente();
  const publica = PUBLICAS.includes(caminho);
  // versão de impressão (PDF): sem cabeçalho nem rodapé do site
  const impressao = caminho.startsWith("/exportar/");

  useEffect(() => {
    // sem login: vai ao login guardando o destino (ex.: link do e-mail), para voltar depois de entrar
    if (saindo.current) {
      if (caminho === "/") saindo.current = false;
      return;
    }
    if (usuario === null && !publica) router.replace(`/login?voltar=${encodeURIComponent(caminho + window.location.search)}`);
    if (usuario && caminho === "/login") router.replace(destinoDepoisDoLogin());
  }, [usuario, publica, caminho, router]);

  // undefined = ainda no servidor/hidratação: a página é renderizada normalmente
  // (o Next precisa disso para pré-renderizar); no navegador, quem não está logado é redirecionado.
  const liberado = usuario === undefined || publica || !!usuario;

  if (impressao) return liberado ? <main className="flex-1">{children}</main> : null;

  return (
    <>
      {/* faixa verde no topo: telas internas e login (a entrada tem a foto de fundo própria) */}
      {caminho !== "/" && <div aria-hidden="true" className="faixa-topo" />}
      {/* cabeçalho flutuante em pílula, com vidro fosco, como no site do CITi */}
      <header className="sticky top-0 z-20 px-2 pt-3 sm:px-4">
        <div
          className={`mx-auto flex items-center justify-between gap-3 rounded-full border border-branco/12 bg-fundo/60 py-2 pr-1.5 pl-3.5 backdrop-blur-md backdrop-saturate-150 sm:pr-2 sm:pl-5 ${
            caminho === "/" ? "max-w-5xl" : "max-w-6xl"
          }`}
        >
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
              <nav className="flex items-center gap-0.5 text-sm sm:gap-1">
                <Link
                  href="/"
                  aria-label="Página inicial"
                  title="Página inicial"
                  className="rounded-full p-1.5 text-gray-600 transition-colors hover:text-verde"
                >
                  <IconeCasa className="h-4 w-4" />
                </Link>
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
                      className={`rounded-full px-2 py-1.5 transition-colors sm:px-4 ${
                        ativo ? "bg-verde font-semibold text-fundo" : "text-gray-700 hover:text-branco"
                      }`}
                    >
                      {rotulo}
                    </Link>
                  );
                })}
                <span className="mx-2 hidden h-5 w-px bg-gray-400 sm:block" aria-hidden="true" />
                {/* no celular, só "Sair": o usuário fica escondido para caber numa linha */}
                <span className="hidden items-center gap-1.5 text-gray-600 sm:flex">
                  <IconeUsuario className="h-4 w-4" />
                  {usuario}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    saindo.current = true;
                    sair();
                    router.replace("/");
                  }}
                  aria-label="Sair"
                  title="Sair"
                  className="cursor-pointer rounded-full p-1.5 text-gray-600 transition-colors hover:text-verde sm:ml-1"
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
              : "mx-auto w-full max-w-6xl flex-1 px-4 py-8"
        }
      >
        {liberado ? children : <CaixaEsqueleto linhas={3} />}
      </main>
      <Avisos />
      <footer className="border-t border-linha py-5 text-xs text-gray-500">
        <div className={`mx-auto flex flex-wrap items-center justify-center gap-2 px-4 ${caminho === "/" ? "max-w-5xl" : "max-w-6xl"}`}>
          <Lockup tamanho="pequeno" />
          <span aria-hidden="true">·</span>
          <span>protótipo para o desafio Inovação no PS</span>
        </div>
      </footer>
    </>
  );
}

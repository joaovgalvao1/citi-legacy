"use client";

// Barra da versão de impressão (só aparece na tela): voltar, alternar tema claro/escuro e salvar em PDF.

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { IconeExportar } from "@/components/ui/icones";
import { exportarPdf } from "@/lib/exportar-pdf";

type Tema = "claro" | "escuro";
const CHAVE_TEMA = "citi-legacy:tema-folha";

function lerTema(): Tema {
  try {
    return localStorage.getItem(CHAVE_TEMA) === "claro" ? "claro" : "escuro";
  } catch {
    return "escuro";
  }
}

const EVENTO = "citi-legacy:tema-folha";

function assinar(avisar: () => void) {
  window.addEventListener(EVENTO, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(EVENTO, avisar);
    window.removeEventListener("storage", avisar);
  };
}

/** Tema da folha: lembrado no navegador e marcado em <html data-tema-folha> (as cores estão em app/globals.css). */
export function useTemaDaFolha() {
  // padrão: escuro (no servidor e na hidratação); no navegador, o tema guardado
  const tema = useSyncExternalStore(assinar, lerTema, () => "escuro" as Tema);
  // link com ?tema=claro|escuro (ex.: botão do e-mail): adota esse tema e limpa a URL
  useEffect(() => {
    const url = new URL(window.location.href);
    const pedido = url.searchParams.get("tema");
    if (pedido !== "claro" && pedido !== "escuro") return;
    try {
      localStorage.setItem(CHAVE_TEMA, pedido);
    } catch {
      // sem armazenamento: segue o padrão
    }
    url.searchParams.delete("tema");
    window.history.replaceState(window.history.state, "", url);
    window.dispatchEvent(new Event(EVENTO));
  }, []);
  useEffect(() => {
    document.documentElement.dataset.temaFolha = tema;
    return () => {
      delete document.documentElement.dataset.temaFolha;
    };
  }, [tema]);
  function alternar() {
    try {
      localStorage.setItem(CHAVE_TEMA, tema === "claro" ? "escuro" : "claro");
    } catch {
      // sem armazenamento no navegador: o tema não muda
    }
    window.dispatchEvent(new Event(EVENTO));
  }
  return { tema, alternar };
}

function BotaoTema({ tema, alternar }: { tema: Tema; alternar: () => void }) {
  return (
    <div role="group" aria-label="Tema do PDF" className="inline-flex rounded-full border border-branco/25 bg-branco/5 p-0.5 text-sm">
      {(["claro", "escuro"] as const).map((t) => (
        <button
          key={t}
          type="button"
          aria-pressed={tema === t}
          onClick={() => tema !== t && alternar()}
          className={`cursor-pointer rounded-full px-3.5 py-1.5 transition-colors ${
            tema === t ? "bg-branco font-semibold text-[#0a0a0a]" : "text-gray-700 hover:text-branco"
          }`}
        >
          {t === "claro" ? "Claro" : "Escuro"}
        </button>
      ))}
    </div>
  );
}

export function BarraDeImpressao({ voltar, rotuloVoltar, acoes }: { voltar: string; rotuloVoltar: string; acoes?: ReactNode }) {
  const { tema, alternar } = useTemaDaFolha();
  return (
    <div className="so-tela mx-auto mb-6 flex w-full max-w-[210mm] flex-wrap items-center justify-between gap-3">
      <Link href={voltar} className="text-sm text-gray-600 transition-colors hover:text-verde">
        ← {rotuloVoltar}
      </Link>
      <div className="flex flex-wrap items-start gap-3">
        <span className="hidden self-center text-xs text-gray-500 lg:inline">O PDF é gerado e abre numa aba nova.</span>
        <BotaoTema tema={tema} alternar={alternar} />
        {acoes}
        <button
          type="button"
          onClick={() => {
            const id = window.location.pathname.split("/").filter(Boolean)[1] ?? "";
            exportarPdf(id === "boletim" ? { pagina: "boletim", tema } : { pagina: "projeto", id, tema });
          }}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-verde px-5 py-2 text-sm font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90"
        >
          <IconeExportar className="h-4 w-4" />
          Salvar como PDF
        </button>
      </div>
    </div>
  );
}

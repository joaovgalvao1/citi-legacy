"use client";

// Linha do repositório no cabeçalho do projeto: o repositório no GitHub, quando foi sincronizado
// e o botão "Sincronizar". Sem repositório, um atalho para vincular (na edição do projeto).

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sincronizarRepositorio } from "@/app/acoes";
import { avisar } from "@/lib/avisos";
import { IconeGithub } from "@/components/ui/icones";

function haQuanto(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  if (min < 48 * 60) return `há ${Math.round(min / 60)} h`;
  return `em ${new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Recife" })}`;
}

export function RepositorioDoProjeto({ projetoId, repositorio, sincronizadoEm }: { projetoId: string; repositorio?: string; sincronizadoEm?: string }) {
  const router = useRouter();
  const [sincronizando, iniciar] = useTransition();

  if (!repositorio) {
    return (
      <Link href={`/projetos/editar/${projetoId}`} className="inline-flex items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-verde">
        <IconeGithub className="h-3.5 w-3.5" />
        Vincular repositório do GitHub
      </Link>
    );
  }

  function sincronizar() {
    iniciar(async () => {
      const { mensagem } = await sincronizarRepositorio(projetoId);
      avisar({ texto: "Sincronização com o GitHub", detalhe: mensagem, tom: mensagem.startsWith("Não foi") ? "ambar" : "verde" });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
      <a
        href={`https://github.com/${repositorio}`}
        target="_blank"
        rel="noreferrer"
        className="dado inline-flex items-center gap-1.5 text-gray-700 transition-colors hover:text-verde"
      >
        <IconeGithub className="h-3.5 w-3.5" />
        {repositorio}
      </a>
      <span suppressHydrationWarning>{sincronizadoEm ? `sincronizado ${haQuanto(sincronizadoEm)}` : "ainda não sincronizado"}</span>
      <button
        type="button"
        onClick={sincronizar}
        disabled={sincronizando}
        className="cursor-pointer rounded-full border border-branco/25 bg-branco/5 px-3 py-0.5 text-gray-700 transition-colors hover:border-verde/50 hover:text-verde disabled:cursor-wait disabled:opacity-60"
      >
        {sincronizando ? "Sincronizando…" : "Sincronizar"}
      </button>
    </div>
  );
}

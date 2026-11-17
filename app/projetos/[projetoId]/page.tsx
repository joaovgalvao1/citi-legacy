// Tela 2 — Painel do projeto

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProjeto, projetos } from "@/data";
import { Voltar } from "@/components/ui";
import { AlertasDoProjeto, RiscoDoProjeto } from "@/components/risco";
import { PainelInterativo } from "@/components/painel";

export function generateStaticParams() {
  return projetos.map((p) => ({ projetoId: p.id }));
}

async function PainelDoProjetoConteudo({ params }: { params: PageProps<"/projetos/[projetoId]">["params"] }) {
  const { projetoId } = await params;
  const projeto = getProjeto(projetoId);
  if (!projeto) notFound();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Voltar href="/projetos">Projetos</Voltar>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{projeto.nome}</h1>
          <RiscoDoProjeto projeto={projeto} />
        </div>
        <p className="text-sm text-gray-600">
          Cliente: {projeto.cliente} · Etapa atual: {projeto.etapaAtual} · {projeto.membros.length} membros
        </p>
        <AlertasDoProjeto projeto={projeto} />
      </div>

      <PainelInterativo projeto={projeto} />
    </div>
  );
}

export default function PainelDoProjeto(props: PageProps<"/projetos/[projetoId]">) {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Carregando…</p>}>
      <PainelDoProjetoConteudo params={props.params} />
    </Suspense>
  );
}

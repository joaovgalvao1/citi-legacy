// Painel do projeto

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProjeto, projetos } from "@/data";
import { Caixa, Selo, Voltar } from "@/components/ui";
import { AlertasDoProjeto, SeloStatusProjeto } from "@/components/risco";
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
          <SeloStatusProjeto projeto={projeto} />
          {projeto.caseReal && <Selo>Case real do CITi</Selo>}
        </div>
        <p className="text-sm text-gray-600">
          Cliente: {projeto.cliente} · {projeto.membros.length} membros
        </p>
        <p className="max-w-3xl text-sm text-gray-700">{projeto.descricao}</p>
        <AlertasDoProjeto projeto={projeto} limite={3} />
      </div>

      {(projeto.contexto || projeto.resultados) && (
        <Caixa titulo="Contexto e resultados">
          <div className="space-y-2 text-sm">
            {projeto.contexto && <p className="text-gray-700">{projeto.contexto}</p>}
            {projeto.resultados && (
              <p>
                <span className="font-semibold">Resultados: </span>
                {projeto.resultados}
              </p>
            )}
            {projeto.caseReal && (
              <p className="text-xs text-gray-500">
                Contexto e resultados do case real; pessoas, commits e prazos das etapas são fictícios.
              </p>
            )}
          </div>
        </Caixa>
      )}

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

// Aba "Sobre": o que é o projeto, quem participa e os resultados
// (o escopo de cada etapa aparece na Visão geral)

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { obterProjeto, obterProjetos } from "@/data";
import { formatarData } from "@/data/formatos";
import { Caixa, Selo } from "@/components/ui";

export async function generateStaticParams() {
  return (await obterProjetos()).map((p) => ({ projetoId: p.id }));
}

async function Sobre({ params }: { params: PageProps<"/projetos/[projetoId]/sobre">["params"] }) {
  const { projetoId } = await params;
  const projeto = await obterProjeto(projetoId);
  if (!projeto) notFound();

  return (
    <div className="space-y-6">
      <Caixa titulo="Sobre o projeto">
        <div className="space-y-3 text-sm">
          <p>
            <span className="text-gray-500">Cliente: </span>
            {projeto.cliente}
          </p>
          <p>
            <span className="text-gray-500">Objetivo: </span>
            {projeto.descricao}
          </p>
          {projeto.contexto && <p className="text-gray-700">{projeto.contexto}</p>}
          <p className="text-gray-600">
            {projeto.etapas.length} etapas · início em {formatarData(projeto.inicio)} · entrega prevista para {formatarData(projeto.fimPrevisto)}
            {projeto.entrega && ` · entregue em ${formatarData(projeto.entrega)}`}
          </p>
          {projeto.caseReal && (
            <p className="text-xs text-gray-500">
              Case real do CITi: contexto e resultados do material do case; pessoas, commits e prazos das etapas são
              fictícios.
            </p>
          )}
        </div>
      </Caixa>

      <Caixa titulo="Equipe">
        <ul className="flex flex-wrap gap-2">
          {projeto.membros.map((m) => (
            <li key={m.id}>
              <Link
                href={`/membros/${m.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-gray-400 bg-gray-100 px-3 py-1 text-sm hover:border-verde/60"
              >
                <span className="font-semibold">{m.nome}</span>
                <span className="text-gray-600">{m.papel}</span>
                {m.saiuEm && <Selo>Saiu</Selo>}
              </Link>
            </li>
          ))}
        </ul>
      </Caixa>

      {projeto.resultados && (
        <Caixa titulo="Resultados">
          <p className="text-sm text-gray-700">{projeto.resultados}</p>
        </Caixa>
      )}
    </div>
  );
}

export default function PaginaSobre(props: PageProps<"/projetos/[projetoId]/sobre">) {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Carregando…</p>}>
      <Sobre params={props.params} />
    </Suspense>
  );
}

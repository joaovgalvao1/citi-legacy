// Visão de uma etapa do escopo (ex.: Pagamentos) dentro de um projeto

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjeto, projetos } from "@/data";
import { Voltar } from "@/components/wireframe";
import { EtapaInterativa } from "@/components/painel";

export function generateStaticParams() {
  return projetos.flatMap((p) => p.etapas.map((e) => ({ projetoId: p.id, etapaId: e.id })));
}

async function EtapaConteudo({ params }: { params: PageProps<"/projetos/[projetoId]/etapas/[etapaId]">["params"] }) {
  const { projetoId, etapaId } = await params;
  const projeto = getProjeto(projetoId);
  const etapa = projeto?.etapas.find((e) => e.id === etapaId);
  if (!projeto || !etapa) notFound();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Voltar href={`/projetos/${projeto.id}`}>{projeto.nome}</Voltar>
        <p className="text-sm uppercase tracking-wide text-gray-500">Etapa do projeto</p>
        <h1 className="text-2xl font-bold">{etapa.nome}</h1>
        <nav className="flex flex-wrap gap-2 text-sm" aria-label="Outras etapas">
          {projeto.etapas.map((e) =>
            e.id === etapa.id ? (
              <span key={e.id} className="rounded-full border border-gray-800 bg-gray-800 px-3 py-1 text-white">
                {e.nome}
              </span>
            ) : (
              <Link
                key={e.id}
                href={`/projetos/${projeto.id}/etapas/${e.id}`}
                className="rounded-full border border-gray-400 bg-white px-3 py-1 text-gray-700 hover:border-gray-800"
              >
                {e.nome}
              </Link>
            ),
          )}
        </nav>
      </div>

      <EtapaInterativa projeto={projeto} etapaId={etapa.id} />
    </div>
  );
}

export default function EtapaDoProjeto(props: PageProps<"/projetos/[projetoId]/etapas/[etapaId]">) {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Carregando…</p>}>
      <EtapaConteudo params={props.params} />
    </Suspense>
  );
}

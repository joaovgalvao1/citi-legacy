// Cabeçalho comum às 4 abas do projeto

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProjeto, projetos } from "@/data";
import { formatarData } from "@/data/formatos";
import { progressoProjeto, textoEntrega, textoPrazo } from "@/lib/status";
import { Voltar } from "@/components/ui";
import { BarraProgresso } from "@/components/ui/progresso";
import { SeloStatusProjeto } from "@/components/projeto/status";
import { AbasDoProjeto } from "@/components/projeto/abas";

export function generateStaticParams() {
  return projetos.map((p) => ({ projetoId: p.id }));
}

async function Cabecalho({ params }: { params: LayoutProps<"/projetos/[projetoId]">["params"] }) {
  const { projetoId } = await params;
  const projeto = getProjeto(projetoId);
  if (!projeto) notFound();
  const concluido = projeto.status === "concluido";

  return (
    <div className="space-y-3">
      <Voltar href="/projetos">Projetos</Voltar>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{projeto.nome}</h1>
        <SeloStatusProjeto projeto={projeto} />
      </div>
      <p className="text-sm text-gray-600">{projeto.cliente}</p>
      {concluido ? (
        <p className="text-sm text-gray-700">
          Entregue · {formatarData(projeto.inicio)} a {formatarData(projeto.entrega!)} · {textoEntrega(projeto)}
        </p>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <BarraProgresso valor={progressoProjeto(projeto)} compacta />
          </div>
          <span className="text-sm font-semibold tabular-nums">{Math.round(progressoProjeto(projeto))}%</span>
          <span className="text-sm text-gray-600">{textoPrazo(projeto)}</span>
        </div>
      )}
      <AbasDoProjeto projetoId={projeto.id} />
    </div>
  );
}

export default function LayoutDoProjeto(props: LayoutProps<"/projetos/[projetoId]">) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<p className="text-sm text-gray-500">Carregando…</p>}>
        <Cabecalho params={props.params} />
      </Suspense>
      {props.children}
    </div>
  );
}

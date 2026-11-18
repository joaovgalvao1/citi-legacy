// Aba "Participação": conhecimento (IC) e atividade (commits por semana),
// no projeto todo ou numa etapa

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { obterProjeto, obterProjetos } from "@/data";
import { AbaParticipacao } from "@/components/projeto/abas-graficos";

export async function generateStaticParams() {
  return (await obterProjetos()).map((p) => ({ projetoId: p.id }));
}

async function Conteudo({ params }: { params: PageProps<"/projetos/[projetoId]/participacao">["params"] }) {
  const { projetoId } = await params;
  const projeto = await obterProjeto(projetoId);
  if (!projeto) notFound();
  // a etapa escolhida vem da URL (?etapa=...), lida no navegador
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Carregando…</p>}>
      <AbaParticipacao projeto={projeto} />
    </Suspense>
  );
}

export default function PaginaParticipacao(props: PageProps<"/projetos/[projetoId]/participacao">) {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Carregando…</p>}>
      <Conteudo params={props.params} />
    </Suspense>
  );
}

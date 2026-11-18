// Aba "Visão geral": o que precisa de atenção, resumo e andamento das etapas (com tasks)

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProjeto, projetoEnxuto, projetos } from "@/data";
import { VisaoGeral } from "@/components/projeto/visao-geral";

export function generateStaticParams() {
  return projetos.map((p) => ({ projetoId: p.id }));
}

async function Conteudo({ params }: { params: PageProps<"/projetos/[projetoId]">["params"] }) {
  const { projetoId } = await params;
  const projeto = getProjeto(projetoId);
  if (!projeto) notFound();
  return <VisaoGeral projeto={projetoEnxuto(projeto)} />;
}

export default function PaginaVisaoGeral(props: PageProps<"/projetos/[projetoId]">) {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Carregando…</p>}>
      <Conteudo params={props.params} />
    </Suspense>
  );
}

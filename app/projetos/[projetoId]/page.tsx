// Aba "Visão geral": o que precisa de atenção, resumo e andamento das etapas (com tasks)

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { obterProjeto, obterProjetos, obterResumos, projetoEnxuto } from "@/data";
import { VisaoGeral } from "@/components/projeto/visao-geral";
import { ResumosDoProjeto } from "@/components/projeto/resumos";
import { EsqueletoVisaoGeral } from "@/components/ui/esqueletos";

export async function generateStaticParams() {
  return (await obterProjetos()).map((p) => ({ projetoId: p.id }));
}

async function Conteudo({ params }: { params: PageProps<"/projetos/[projetoId]">["params"] }) {
  const { projetoId } = await params;
  const projeto = await obterProjeto(projetoId);
  if (!projeto) notFound();
  const resumos = await obterResumos(projeto.id);
  return (
    <VisaoGeral
      projeto={projetoEnxuto(projeto)}
      resumo={<ResumosDoProjeto projetoId={projeto.id} resumos={resumos} concluido={projeto.status === "concluido"} />}
    />
  );
}

export default function PaginaVisaoGeral(props: PageProps<"/projetos/[projetoId]">) {
  return (
    <Suspense fallback={<EsqueletoVisaoGeral />}>
      <Conteudo params={props.params} />
    </Suspense>
  );
}

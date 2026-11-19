// Edição de projeto pelo admin: o mesmo formulário do cadastro, já preenchido.

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { obterClientes, obterPessoas, obterProjeto, obterProjetos } from "@/data";
import { TituloPagina, Voltar } from "@/components/ui";
import { EsqueletoSobre } from "@/components/ui/esqueletos";
import { FormularioNovoProjeto, type ProjetoInicial } from "@/components/projetos/novo-projeto";

export async function generateStaticParams() {
  return (await obterProjetos()).map((p) => ({ projetoId: p.id }));
}

async function Conteudo({ params }: { params: PageProps<"/projetos/editar/[projetoId]">["params"] }) {
  const { projetoId } = await params;
  const [projeto, clientes, pessoas] = await Promise.all([obterProjeto(projetoId), obterClientes(), obterPessoas()]);
  if (!projeto) notFound();

  const inicial: ProjetoInicial = {
    projetoId: projeto.id,
    projeto: {
      nome: projeto.nome,
      clienteId: projeto.clienteId,
      clienteNovo: "",
      segmentoNovo: "",
      descricao: projeto.descricao,
      contexto: projeto.contexto ?? "",
      inicio: projeto.inicio,
      fimPrevisto: projeto.fimPrevisto,
    },
    membros: Object.fromEntries(projeto.membros.map((m) => [m.id, m.papel])),
    etapas: projeto.etapas.map((e) => ({
      id: e.id,
      temCommits: !!e.ultimoCommit,
      nome: e.nome,
      descricao: e.descricao,
      inicioPrevisto: e.inicioPrevisto,
      fimPrevisto: e.fimPrevisto,
      caminhos: e.caminhos.join("\n"),
      tasks: e.tasks.map((t) => t.titulo).join("\n"),
    })),
  };
  // quem já saiu da empresa só aparece se ainda faz parte da equipe deste projeto
  const daEquipe = new Set(projeto.membros.map((m) => m.id));
  const disponiveis = pessoas.filter((p) => !p.saiuEm || daEquipe.has(p.id)).map((p) => ({ id: p.id, nome: p.nome }));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Voltar href={`/projetos/${projeto.id}`}>{projeto.nome}</Voltar>
        <TituloPagina fino="Editar" destaque="projeto." />
        <p className="text-sm text-gray-600">
          Tasks com o mesmo nome continuam concluídas. Etapas que já têm commits não podem ser removidas, para não apagar o histórico de quem
          trabalhou nelas.
        </p>
      </div>
      <FormularioNovoProjeto clientes={clientes} pessoas={disponiveis} hoje={projeto.hoje} inicial={inicial} />
    </div>
  );
}

export default function PaginaEditarProjeto(props: PageProps<"/projetos/editar/[projetoId]">) {
  return (
    <Suspense fallback={<EsqueletoSobre />}>
      <Conteudo params={props.params} />
    </Suspense>
  );
}

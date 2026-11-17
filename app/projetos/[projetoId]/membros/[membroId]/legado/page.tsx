// Tela 3 — Registrar legado

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { formatarMesAno, getMembro, getProjeto, nomeEtapa, projetos } from "@/data";
import { commitsDoMembro, commitsEmDestaque, etapaPrincipal, perguntasPara } from "@/data/commits";
import { Caixa, Selo, Voltar } from "@/components/wireframe";
import { FormLegado } from "@/components/wireframe/interativos";
import { emPct, etapasLideradas, nivelUrgencia } from "@/lib/indice";

export function generateStaticParams() {
  return projetos.flatMap((p) => p.membros.map((m) => ({ projetoId: p.id, membroId: m.id })));
}

async function RegistrarLegadoConteudo({ params }: { params: PageProps<"/projetos/[projetoId]/membros/[membroId]/legado">["params"] }) {
  const { projetoId, membroId } = await params;
  const projeto = getProjeto(projetoId);
  const membro = getMembro(projetoId, membroId);
  if (!projeto || !membro) notFound();
  const lideradas = etapasLideradas(projeto, membro);
  const principal = etapaPrincipal(projeto, membro);
  const doMembro = commitsDoMembro(projeto.id, membro.id);
  const destaque = commitsEmDestaque(projeto, membro);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Voltar href={`/projetos/${projeto.id}`}>{projeto.nome}</Voltar>
        <h1 className="text-2xl font-bold">Registrar legado de {membro.nome}</h1>
        <p className="text-sm text-gray-600">
          Responda às perguntas abaixo. Elas viram o documento de passagem de conhecimento para a equipe.
        </p>
      </div>

      <Caixa titulo="Resumo do membro">
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">Papel</dt>
            <dd>{membro.papel}</dd>
          </div>
          <div>
            <dt className="text-gray-500">No projeto desde</dt>
            <dd>{formatarMesAno(membro.entrada)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Saída prevista</dt>
            <dd>
              {membro.saidaPrevista ?? "não informada"} · urgência {nivelUrgencia(membro).toLowerCase()}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Índice de Conhecimento no projeto</dt>
            <dd>{emPct(membro.icProjeto)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-gray-500">Etapas em que tem o maior IC</dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              {lideradas.length
                ? lideradas.map((id) => <Selo key={id}>{nomeEtapa(projeto, id)}</Selo>)
                : "nenhuma etapa"}
            </dd>
          </div>
        </dl>
      </Caixa>

      <Caixa titulo={`Commits de ${membro.nome.split(" ")[0]} em ${nomeEtapa(projeto, principal ?? "")}`}>
        <ul className="space-y-1 text-sm">
          {destaque.map((c) => (
            <li key={c.hash} className="flex flex-wrap items-center gap-x-3">
              <span className="font-mono text-gray-500">{c.hash}</span>
              <span className="text-gray-500">{c.data.slice(8, 10)}/{c.data.slice(5, 7)}</span>
              <span className="font-mono">{c.mensagem}</span>
              {c.citado && <Selo>citado nas perguntas</Selo>}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-gray-500">
          {doMembro.length} commits no projeto · os citados nas perguntas aparecem primeiro, depois os
          que mais contribuíram para o código atual
        </p>
      </Caixa>

      <Caixa titulo="Perguntas geradas pela IA">
        <p className="mb-4 text-xs text-gray-500">
          [na etapa 3 estas perguntas serão geradas pela IA; por enquanto são montadas a partir dos commits acima]
        </p>
        <FormLegado projetoId={projeto.id} membroId={membro.id} perguntas={perguntasPara(projeto, membro)} />
      </Caixa>
    </div>
  );
}

export default function RegistrarLegado(props: PageProps<"/projetos/[projetoId]/membros/[membroId]/legado">) {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Carregando…</p>}>
      <RegistrarLegadoConteudo params={props.params} />
    </Suspense>
  );
}

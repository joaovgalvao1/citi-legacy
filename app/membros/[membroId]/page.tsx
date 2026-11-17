// Página do membro: o histórico da pessoa em todos os projetos da empresa

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatarData, formatarMesAno, getPessoa, nomeEtapa, pessoas, projetosDaPessoa } from "@/data";
import { commitsDaPessoa, commitsPorMes } from "@/data/commits";
import { emPct, etapasLideradas, nivelUrgencia } from "@/lib/indice";
import { statusProjeto } from "@/lib/status";
import { Caixa, Selo, Voltar } from "@/components/ui";
import { SeloUrgencia } from "@/components/risco";
import { corPorIndice } from "@/components/graficos/cores";
import { AtividadeDoMembro } from "@/components/membro/atividade";

export function generateStaticParams() {
  return pessoas.map((p) => ({ membroId: p.id }));
}

async function MembroConteudo({ params }: { params: PageProps<"/membros/[membroId]">["params"] }) {
  const { membroId } = await params;
  const pessoa = getPessoa(membroId);
  if (!pessoa) notFound();

  const participacoes = projetosDaPessoa(pessoa.id);
  const todos = commitsDaPessoa(pessoa.id);
  const series = participacoes.map(({ projeto }, i) => ({ id: projeto.id, nome: projeto.nome, cor: corPorIndice(i) }));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Voltar href="/membros">Membros</Voltar>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{pessoa.nome}</h1>
          {pessoa.saiuEm ? (
            <Selo>Saiu em {formatarMesAno(pessoa.saiuEm.slice(0, 7))}</Selo>
          ) : pessoa.saidaPrevista ? (
            <>
              <Selo>Sai {pessoa.saidaPrevista}</Selo>
              <SeloUrgencia nivel={nivelUrgencia(pessoa)} />
            </>
          ) : (
            <Selo>Na empresa</Selo>
          )}
        </div>
        <p className="text-sm text-gray-600">
          No CITi desde {formatarMesAno(pessoa.entrada)} · {participacoes.length}{" "}
          {participacoes.length === 1 ? "projeto" : "projetos"} · {todos.length} commits
        </p>
      </div>

      <Caixa titulo="Projetos">
        <ul className="divide-y divide-gray-300">
          {participacoes.map(({ projeto, membro }, i) => {
            const meus = commitsDaPessoa(pessoa.id, projeto.id);
            const lideradas = etapasLideradas(projeto, membro);
            const etapasComIc = projeto.etapas
              .map((e) => ({ etapa: e, ic: e.ic[pessoa.id] ?? 0 }))
              .filter((x) => x.ic > 0)
              .sort((a, b) => b.ic - a.ic);
            return (
              <li key={projeto.id} className="space-y-2 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5" style={{ backgroundColor: corPorIndice(i) }} />
                  <Link href={`/projetos/${projeto.id}`} className="font-semibold underline">
                    {projeto.nome}
                  </Link>
                  <Selo forte={statusProjeto(projeto) === "Atrasado"}>{statusProjeto(projeto)}</Selo>
                  {projeto.caseReal && <Selo>Case real</Selo>}
                </div>
                <p className="text-sm text-gray-600">
                  {membro.papel} · IC no projeto {emPct(membro.icProjeto)}
                  {meus.length > 0 &&
                    ` · ${meus.length} commits de ${formatarData(meus.at(-1)!.data)} a ${formatarData(meus[0].data)}`}
                </p>
                {lideradas.length > 0 && (
                  <p className="text-sm">
                    Quem mais sabe de: {lideradas.map((id) => nomeEtapa(projeto, id)).join(", ")}
                  </p>
                )}
                <ul className="flex flex-wrap gap-2 text-xs">
                  {etapasComIc.map(({ etapa, ic }) => (
                    <li key={etapa.id}>
                      <Link
                        href={`/projetos/${projeto.id}/etapas/${etapa.id}`}
                        className="inline-block rounded-full border border-gray-400 px-2 py-0.5 text-gray-700 hover:border-gray-800"
                      >
                        {etapa.nome} · IC {emPct(ic)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </Caixa>

      <Caixa titulo="Atividade · commits por mês">
        <AtividadeDoMembro series={series} meses={commitsPorMes(pessoa.id)} nome={pessoa.nome} />
      </Caixa>

      <Caixa titulo="Últimos commits">
        <ul className="space-y-1.5 text-sm">
          {todos.slice(0, 10).map((c) => (
            <li key={c.hash} className="flex flex-wrap gap-x-3">
              <span className="font-mono text-gray-500">{c.hash}</span>
              <span className="text-gray-500">{formatarData(c.data)}</span>
              <span className="text-gray-600">{participacoes.find((x) => x.projeto.id === c.projetoId)?.projeto.nome}</span>
              <span className="font-mono">{c.mensagem}</span>
            </li>
          ))}
        </ul>
      </Caixa>
    </div>
  );
}

export default function PaginaDoMembro(props: PageProps<"/membros/[membroId]">) {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Carregando…</p>}>
      <MembroConteudo params={props.params} />
    </Suspense>
  );
}

"use client";

// Painel do projeto e página de etapa. Rodam no navegador por causa do destaque de membro
// compartilhado entre barras, matriz e linha do tempo.

import Link from "next/link";
import type { Projeto } from "@/data";
import { formatarData } from "@/data/formatos";
import { avaliarEtapa, emPct, etapasLideradas, lider, ranking } from "@/lib/indice";
import { diasParada, progressoProjeto, statusEtapa, textoPrazo } from "@/lib/status";
import { Caixa, Placeholder } from "@/components/ui";
import { RiscoDaEtapa, SeloRisco, SeloStatusEtapa, SeloUrgencia, SituacaoDaPessoa } from "@/components/risco";
import { BarrasIC } from "@/components/graficos/barras-ic";
import { LinhaDoTempo } from "@/components/graficos/linha-do-tempo";
import { Cronograma } from "@/components/graficos/cronograma";
import { DestaqueProvider } from "@/components/graficos/destaque";
import { seriesDosMembros } from "@/components/graficos/cores";
import { BarraProgresso } from "@/components/ui/progresso";
import { MatrizIC } from "./matriz";
import { CalculoIC, ComoLerIndice } from "./calculo-ic";

const linkEtapa = (projetoId: string, etapaId: string) => `/projetos/${projetoId}/etapas/${etapaId}`;
const linkPessoa = (id: string) => `/membros/${id}`;

/* ---------- Painel do projeto ---------- */

export function PainelInterativo({ projeto }: { projeto: Projeto }) {
  const concluido = projeto.status === "concluido";
  const contagem = projeto.etapas.reduce<Record<string, number>>((acc, e) => {
    const s = statusEtapa(projeto, e);
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});
  const paradas = projeto.etapas.filter((e) => diasParada(projeto, e) !== null).length;

  return (
    <DestaqueProvider>
      <Caixa titulo="Andamento">
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <div className="space-y-2">
            <BarraProgresso valor={progressoProjeto(projeto)} rotulo="Progresso do projeto" />
            <p className="text-sm text-gray-600">
              {formatarData(projeto.inicio)} → previsto {formatarData(projeto.fimPrevisto)} · {textoPrazo(projeto)}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {(["Concluída", "Em andamento", "Atrasada", "Não iniciada"] as const)
              .filter((s) => contagem[s])
              .map((s) => (
                <div key={s} className="contents">
                  <dt className="text-gray-500">{s === "Concluída" ? "Concluídas" : s === "Atrasada" ? "Atrasadas" : s === "Não iniciada" ? "Não iniciadas" : "Em andamento"}</dt>
                  <dd className="text-right tabular-nums">{contagem[s]}</dd>
                </div>
              ))}
            {paradas > 0 && (
              <div className="contents">
                <dt className="text-gray-500">Paradas</dt>
                <dd className="text-right tabular-nums">{paradas}</dd>
              </div>
            )}
          </dl>
        </div>
      </Caixa>

      <Caixa titulo={concluido ? "Retrospectiva gerada por IA" : "Resumo gerado por IA"}>
        <Placeholder
          texto={
            concluido
              ? "etapa 3: a IA lê os commits e indicadores e escreve a retrospectiva do projeto (o que foi feito, quem procurar)"
              : "etapa 3: a IA lê os commits e indicadores e escreve o status report da semana (andamento, riscos, próximos passos)"
          }
          altura="h-24"
        />
      </Caixa>

      <Caixa titulo="Cronograma">
        <Cronograma projeto={projeto} />
      </Caixa>

      <Caixa titulo="Conhecimento e risco por etapa">
        <p className="mb-3 text-xs text-gray-500">Clique num membro para destacá-lo em todos os gráficos.</p>
        <ul className="grid gap-4 sm:grid-cols-2">
          {projeto.etapas.map((e) => {
            const top = lider(projeto, e.id);
            return (
              <li key={e.id} className="space-y-3 border border-gray-300 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={linkEtapa(projeto.id, e.id)} className="font-semibold underline">
                    {e.nome}
                  </Link>
                  <SeloStatusEtapa projeto={projeto} etapaId={e.id} />
                </div>
                <RiscoDaEtapa projeto={projeto} etapaId={e.id} />
                {top && (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-gray-500">Maior conhecimento:</span>
                    <Link href={linkPessoa(top.membro.id)} className="font-semibold underline">
                      {top.membro.nome}
                    </Link>
                    <SituacaoDaPessoa membro={top.membro} comUrgencia={!concluido} />
                  </div>
                )}
                <BarrasIC projeto={projeto} etapaId={e.id} compacto />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {emPct(e.progresso)} concluído · concentração {emPct(e.concentracao * 100)}
                  </span>
                  <Link href={linkEtapa(projeto.id, e.id)} className="text-gray-700 underline">
                    Ver etapa →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </Caixa>

      <Caixa titulo="Matriz membro × etapa · Índice de Conhecimento">
        <MatrizIC projeto={projeto} />
        <div className="mt-3">
          <ComoLerIndice />
        </div>
      </Caixa>

      <Caixa titulo="Atividade · commits por semana">
        <LinhaDoTempo series={seriesDosMembros(projeto)} semanas={projeto.semanas} titulo={`Commits por semana em ${projeto.nome}`} />
      </Caixa>

      <Caixa titulo="Equipe">
        <ul className="divide-y divide-gray-300">
          {[...projeto.membros]
            .sort((a, b) => b.icProjeto - a.icProjeto)
            .map((m) => {
              const lideradas = etapasLideradas(projeto, m);
              return (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{m.nome}</span>
                      <span className="text-sm text-gray-600">{m.papel}</span>
                      <SituacaoDaPessoa membro={m} comUrgencia={!concluido} />
                    </div>
                    <div className="text-sm text-gray-600">
                      IC no projeto {emPct(m.icProjeto)} ·{" "}
                      {lideradas.length
                        ? `Principal em: ${lideradas.map((id) => projeto.etapas.find((e) => e.id === id)?.nome).join(", ")}`
                        : "Sem etapa principal"}
                    </div>
                  </div>
                  <Link href={linkPessoa(m.id)} className="text-sm text-gray-700 underline">
                    Ver membro →
                  </Link>
                </li>
              );
            })}
        </ul>
      </Caixa>
    </DestaqueProvider>
  );
}

/* ---------- Página de uma etapa ---------- */

export function EtapaInterativa({ projeto, etapaId }: { projeto: Projeto; etapaId: string }) {
  return (
    <DestaqueProvider>
      <ConteudoEtapa projeto={projeto} etapaId={etapaId} />
    </DestaqueProvider>
  );
}

function ConteudoEtapa({ projeto, etapaId }: { projeto: Projeto; etapaId: string }) {
  const etapa = projeto.etapas.find((e) => e.id === etapaId)!;
  const concluido = projeto.status === "concluido";
  const linhas = ranking(projeto, etapaId);
  const av = avaliarEtapa(projeto, etapaId);
  const quemMaisSabe = av.lider?.membro;

  return (
    <>
      <Caixa titulo="Andamento da etapa">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <SeloStatusEtapa projeto={projeto} etapaId={etapaId} />
          </div>
          <BarraProgresso valor={etapa.progresso} rotulo="Progresso informado" />
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gray-500">Previsto</dt>
              <dd>
                {formatarData(etapa.inicioPrevisto)} a {formatarData(etapa.fimPrevisto)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Commits (real)</dt>
              <dd>
                {etapa.primeiroCommit
                  ? `${formatarData(etapa.primeiroCommit)} a ${formatarData(etapa.ultimoCommit!)}`
                  : "sem commits"}
              </dd>
            </div>
          </dl>
        </div>
      </Caixa>

      <Caixa titulo={concluido ? "Quem procurar" : "Conhecimento e risco"}>
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-gray-500">Maior conhecimento</dt>
            <dd>
              {av.lider ? (
                <Link href={linkPessoa(av.lider.membro.id)} className="underline">
                  {av.lider.membro.nome} · IC {emPct(av.lider.ic)}
                </Link>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Risco · pela concentração ({emPct(etapa.concentracao * 100)})</dt>
            <dd className="mt-1">
              <SeloRisco nivel={av.risco} />
            </dd>
          </div>
          {concluido ? (
            <div>
              <dt className="text-gray-500">Situação de quem mais sabe</dt>
              <dd className="mt-1">
                {quemMaisSabe?.saiuEm ? (
                  <SituacaoDaPessoa membro={quemMaisSabe} comUrgencia={false} />
                ) : (
                  "ainda está na empresa"
                )}
              </dd>
            </div>
          ) : (
            <div>
              <dt className="text-gray-500">
                Urgência ·{" "}
                {quemMaisSabe?.saidaPrevista
                  ? `${quemMaisSabe.nome.split(" ")[0]} sai ${quemMaisSabe.saidaPrevista}`
                  : "sem data de saída registrada"}
              </dt>
              <dd className="mt-1">
                <SeloUrgencia nivel={av.urgencia} />
              </dd>
            </div>
          )}
        </dl>
        {concluido && quemMaisSabe?.saiuEm && linhas[1] && (
          <p className="mt-3 text-sm text-gray-600">
            {quemMaisSabe.nome} já saiu. Próxima pessoa com mais conhecimento:{" "}
            <Link href={linkPessoa(linhas[1].membro.id)} className="underline">
              {linhas[1].membro.nome}
            </Link>{" "}
            (IC {emPct(linhas[1].ic)}){linhas[1].membro.saiuEm ? ", que também já saiu" : ""}.
          </p>
        )}
      </Caixa>

      <Caixa titulo="Quem detém o conhecimento">
        <p className="mb-3 text-xs text-gray-500">Clique num membro para destacá-lo na linha do tempo e no cálculo.</p>
        <BarrasIC projeto={projeto} etapaId={etapaId} />
        <ol className="mt-5 divide-y divide-gray-300 border-t border-gray-300">
          {linhas.map(({ membro: m, ic }, i) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex items-start gap-3">
                <span className="w-6 text-right text-sm text-gray-500">{i + 1}º</span>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{m.nome}</span>
                    <span className="text-sm text-gray-600">{m.papel}</span>
                    <SituacaoDaPessoa membro={m} comUrgencia={!concluido} />
                  </div>
                  <div className="text-sm text-gray-600">IC {emPct(ic)} nesta etapa</div>
                </div>
              </div>
              <Link href={linkPessoa(m.id)} className="text-sm text-gray-700 underline">
                Ver membro →
              </Link>
            </li>
          ))}
        </ol>
      </Caixa>

      <Caixa titulo="Atividade da etapa · commits por semana">
        <LinhaDoTempo series={seriesDosMembros(projeto)} semanas={etapa.semanas} titulo={`Commits por semana em ${etapa.nome}`} />
      </Caixa>

      <Caixa titulo="Como o IC foi calculado">
        <CalculoIC projeto={projeto} etapaId={etapaId} />
        <div className="mt-3">
          <ComoLerIndice />
        </div>
      </Caixa>
    </>
  );
}

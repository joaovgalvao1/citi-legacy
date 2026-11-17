"use client";

// Painel do projeto e página de etapa. Rodam no navegador porque o risco,
// os selos e o destaque de membro mudam com a interação.

import Link from "next/link";
import type { Projeto } from "@/data";
import { avaliarEtapa, emPct, etapasLideradas, lider, ranking } from "@/lib/indice";
import { useLegados, type Origem } from "@/lib/legados";
import { Alerta, Caixa } from "@/components/ui";
import { AcaoLegado, SeloLegado } from "@/components/legado/acoes";
import { RiscoDaEtapa, SeloRisco, SeloUrgencia, UrgenciaDoMembro } from "@/components/risco";
import { BarrasIC } from "@/components/graficos/barras-ic";
import { LinhaDoTempo } from "@/components/graficos/linha-do-tempo";
import { DestaqueProvider } from "@/components/graficos/destaque";
import { MatrizIC } from "./matriz";
import { CalculoIC, ComoLerIndice } from "./calculo-ic";

const linkEtapa = (projetoId: string, etapaId: string) => `/projetos/${projetoId}/etapas/${etapaId}`;

/* ---------- Painel do projeto ---------- */

export function PainelInterativo({ projeto }: { projeto: Projeto }) {
  const origem: Origem = { href: `/projetos/${projeto.id}`, rotulo: projeto.nome };
  return (
    <DestaqueProvider>
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
                  <RiscoDaEtapa projeto={projeto} etapaId={e.id} />
                </div>
                {top && (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-gray-500">Maior conhecimento:</span>
                    <span className="font-semibold">{top.membro.nome}</span>
                    <UrgenciaDoMembro membro={top.membro} />
                    <SeloLegado projetoId={projeto.id} membroId={top.membro.id} />
                  </div>
                )}
                <BarrasIC projeto={projeto} etapaId={e.id} compacto />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Concentração {emPct(e.concentracao * 100)}</span>
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

      <Caixa titulo="Linha do tempo · commits por semana">
        <LinhaDoTempo projeto={projeto} semanas={projeto.semanas} titulo={`Commits por semana em ${projeto.nome}`} />
      </Caixa>

      <Caixa titulo="Membros · Índice de Conhecimento no projeto">
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
                      <UrgenciaDoMembro membro={m} />
                      <SeloLegado projetoId={projeto.id} membroId={m.id} />
                    </div>
                    <div className="text-sm text-gray-600">
                      IC no projeto {emPct(m.icProjeto)} ·{" "}
                      {lideradas.length
                        ? `Principal em: ${lideradas.map((id) => projeto.etapas.find((e) => e.id === id)?.nome).join(", ")}`
                        : "Sem etapa principal"}
                    </div>
                  </div>
                  <AcaoLegado projetoId={projeto.id} membroId={m.id} origem={origem} />
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
  const legados = useLegados();
  const etapa = projeto.etapas.find((e) => e.id === etapaId)!;
  const linhas = ranking(projeto, etapaId);
  const av = avaliarEtapa(projeto, etapaId, legados);
  const quemMaisSabe = av.lider?.membro;
  const origem: Origem = { href: linkEtapa(projeto.id, etapaId), rotulo: `${etapa.nome} · ${projeto.nome}` };

  return (
    <>
      {!av.mitigado && av.urgencia !== "Baixa" && quemMaisSabe && (
        <Alerta>
          {quemMaisSabe.nome} sai {quemMaisSabe.saidaPrevista} e tem IC {emPct(av.lider!.ic)} em {etapa.nome} · risco{" "}
          {av.risco.toLowerCase()}, urgência {av.urgencia.toLowerCase()}
        </Alerta>
      )}

      <Caixa titulo="Resumo da etapa">
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-gray-500">Maior conhecimento</dt>
            <dd>{av.lider ? `${av.lider.membro.nome} · IC ${emPct(av.lider.ic)}` : "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Risco · pela concentração ({emPct(etapa.concentracao * 100)})</dt>
            <dd className="mt-1">
              <SeloRisco nivel={av.risco} />
            </dd>
          </div>
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
        </dl>
        {av.mitigado && (
          <p className="mt-3 text-sm text-gray-600">
            ✓ Mitigado: o legado de {quemMaisSabe?.nome} já foi registrado, então o conhecimento desta etapa não se
            perde com a saída.
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
                    <UrgenciaDoMembro membro={m} />
                    <SeloLegado projetoId={projeto.id} membroId={m.id} />
                  </div>
                  <div className="text-sm text-gray-600">IC {emPct(ic)} nesta etapa</div>
                </div>
              </div>
              <AcaoLegado projetoId={projeto.id} membroId={m.id} origem={origem} />
            </li>
          ))}
        </ol>
      </Caixa>

      <Caixa titulo="Linha do tempo da etapa · commits por semana">
        <LinhaDoTempo projeto={projeto} semanas={etapa.semanas} titulo={`Commits por semana em ${etapa.nome}`} />
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

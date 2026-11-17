"use client";

// Partes do painel e da página de etapa. Rodam no navegador porque o risco
// e os selos mudam quando um legado é registrado.

import Link from "next/link";
import type { Projeto } from "@/data";
import { avaliarEtapa, emPct, etapasLideradas, lider, ranking } from "@/lib/indice";
import { useLegados } from "@/lib/legados";
import { Alerta, Caixa, Placeholder } from "@/components/wireframe";
import { AcaoLegado, SeloLegado } from "@/components/wireframe/interativos";
import { RiscoDaEtapa, SeloRisco, SeloUrgencia, UrgenciaDoMembro } from "@/components/risco";

const linkEtapa = (projetoId: string, etapaId: string) => `/projetos/${projetoId}/etapas/${etapaId}`;
const ic = emPct;

export function ComoLerIndice() {
  return (
    <p className="text-xs text-gray-500">
      Índice de Conhecimento (IC, em %): quanto do conhecimento da etapa está com cada pessoa. Combina linhas que
      continuam no código, frequência de commits, volume de alterações e quão recente é o trabalho. Em cada etapa, os
      IC somam 100%. Risco = concentração do conhecimento na etapa (alto ≥ 70%, moderado ≥ 45%). Urgência = quando sai
      quem mais sabe (alta: até 21 dias, moderada: até 60 dias; sem data de saída = baixa).
    </p>
  );
}

/* ---------- Painel do projeto ---------- */

export function PainelInterativo({ projeto }: { projeto: Projeto }) {
  return (
    <>
      <Caixa titulo="Conhecimento e risco por etapa">
        <ul className="grid gap-4 sm:grid-cols-2">
          {projeto.etapas.map((e) => {
            const top = lider(projeto, e.id);
            return (
              <li key={e.id} className="space-y-2 border border-gray-300 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={linkEtapa(projeto.id, e.id)} className="font-semibold underline">
                    {e.nome}
                  </Link>
                  <RiscoDaEtapa projeto={projeto} etapaId={e.id} />
                </div>
                {top && (
                  <div className="space-y-1 text-sm">
                    <div className="text-gray-500">Maior conhecimento</div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{top.membro.nome}</span>
                      <span>· IC {ic(top.ic)}</span>
                      <UrgenciaDoMembro membro={top.membro} />
                      <SeloLegado projetoId={projeto.id} membroId={top.membro.id} />
                    </div>
                    <div className="text-gray-600">Concentração {emPct(e.concentracao * 100)}</div>
                  </div>
                )}
                <Placeholder texto={`barras: IC por membro em ${e.nome}`} altura="h-16" />
                <Link href={linkEtapa(projeto.id, e.id)} className="block text-sm text-gray-700 underline">
                  Ver etapa →
                </Link>
              </li>
            );
          })}
        </ul>
      </Caixa>

      <Caixa titulo="Matriz membro × etapa · Índice de Conhecimento">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-100 p-2 text-left">Membro</th>
                {projeto.etapas.map((e) => (
                  <th key={e.id} className="border border-gray-300 bg-gray-100 p-2 text-left">
                    <Link href={linkEtapa(projeto.id, e.id)} className="underline">
                      {e.nome}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projeto.membros.map((m) => (
                <tr key={m.id}>
                  <td className="border border-gray-300 p-2">{m.nome}</td>
                  {projeto.etapas.map((e) => {
                    const valor = e.ic[m.id] ?? 0;
                    const principal = lider(projeto, e.id)?.membro.id === m.id;
                    return (
                      <td
                        key={e.id}
                        className={`border border-gray-300 p-2 text-center ${principal ? "bg-gray-400 font-semibold" : "text-gray-600"}`}
                      >
                        {valor > 0 ? ic(valor) : "—"}
                        {principal && " · principal"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <ComoLerIndice />
        </div>
      </Caixa>

      <Caixa titulo="Linha do tempo">
        <Placeholder texto="linha do tempo de commits por membro e etapa" altura="h-28" />
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
                      IC no projeto {ic(m.icProjeto)} ·{" "}
                      {lideradas.length
                        ? `Principal em: ${lideradas.map((id) => projeto.etapas.find((e) => e.id === id)?.nome).join(", ")}`
                        : "Sem etapa principal"}
                    </div>
                  </div>
                  <AcaoLegado projetoId={projeto.id} membroId={m.id} />
                </li>
              );
            })}
        </ul>
      </Caixa>
    </>
  );
}

/* ---------- Página de uma etapa ---------- */

export function EtapaInterativa({ projeto, etapaId }: { projeto: Projeto; etapaId: string }) {
  const legados = useLegados();
  const etapa = projeto.etapas.find((e) => e.id === etapaId)!;
  const linhas = ranking(projeto, etapaId);
  const top = linhas[0];
  const av = avaliarEtapa(projeto, etapaId, legados);
  const quemMaisSabe = av.lider?.membro;

  return (
    <>
      {!av.mitigado && av.urgencia !== "Baixa" && quemMaisSabe && (
        <Alerta>
          {quemMaisSabe.nome} sai {quemMaisSabe.saidaPrevista} e tem IC {ic(av.lider!.ic)} em {etapa.nome} · risco{" "}
          {av.risco.toLowerCase()}, urgência {av.urgencia.toLowerCase()}
        </Alerta>
      )}

      <Caixa titulo="Resumo da etapa">
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-gray-500">Maior conhecimento</dt>
            <dd>{top ? `${top.membro.nome} · IC ${ic(top.ic)}` : "—"}</dd>
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
        <Placeholder texto={`barras: IC por membro em ${etapa.nome}`} altura="h-24" />
        <ol className="mt-4 divide-y divide-gray-300">
          {linhas.map(({ membro: m, ic: valor }, i) => (
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
                  <div className="text-sm text-gray-600">IC {ic(valor)} nesta etapa</div>
                </div>
              </div>
              <AcaoLegado projetoId={projeto.id} membroId={m.id} />
            </li>
          ))}
        </ol>
        <div className="mt-3">
          <ComoLerIndice />
        </div>
      </Caixa>

      <Caixa titulo="Linha do tempo da etapa">
        <Placeholder texto={`linha do tempo de commits em ${etapa.nome}`} altura="h-24" />
      </Caixa>
    </>
  );
}

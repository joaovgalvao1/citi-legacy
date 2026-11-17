"use client";

// "Como o IC foi calculado": mostra os 4 sinais de um membro numa etapa,
// o peso de cada um e quanto cada sinal contribuiu para o IC final.

import type { Projeto, Sinais } from "@/data";
import { emPct, ranking } from "@/lib/indice";
import { useDestaque } from "@/components/graficos/destaque";

const ROTULOS: Record<keyof Sinais, { nome: string; explica: string }> = {
  efetivas: { nome: "Linhas efetivas", explica: "linhas escritas que continuam no código hoje" },
  commits: { nome: "Commits", explica: "frequência de envolvimento" },
  brutas: { nome: "Linhas brutas", explica: "volume de alterações (adicionadas + removidas)" },
  recentes: { nome: "Trabalho recente", explica: "linhas efetivas com meia-vida de 45 dias" },
};

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

/** Explica o IC do membro em destaque (ou de quem mais sabe, se ninguém estiver destacado). */
export function CalculoIC({ projeto, etapaId }: { projeto: Projeto; etapaId: string }) {
  const { membroId, alternar } = useDestaque();
  const etapa = projeto.etapas.find((e) => e.id === etapaId)!;
  const linhas = ranking(projeto, etapaId);
  const alvo = linhas.find((l) => l.membro.id === membroId) ?? linhas[0];
  if (!alvo) return null;
  const fatias = etapa.fatias[alvo.membro.id];
  const PESOS = projeto.pesos;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-gray-600">Membro:</span>
        {linhas.map((l) => (
          <button
            key={l.membro.id}
            type="button"
            onClick={() => alternar(l.membro.id)}
            aria-pressed={l.membro.id === alvo.membro.id}
            className={`cursor-pointer rounded-full border px-3 py-1 ${
              l.membro.id === alvo.membro.id ? "border-gray-800 bg-gray-800 text-white" : "border-gray-400 bg-white text-gray-700"
            }`}
          >
            {l.membro.nome.split(" ")[0]}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[460px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="border-b border-gray-300 py-1.5 pr-2 font-normal">Sinal</th>
              <th className="border-b border-gray-300 py-1.5 pr-2 text-right font-normal">Fatia de {alvo.membro.nome.split(" ")[0]}</th>
              <th className="border-b border-gray-300 py-1.5 pr-2 text-right font-normal">Peso</th>
              <th className="border-b border-gray-300 py-1.5 text-right font-normal">Contribuição</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(ROTULOS) as (keyof Sinais)[]).map((s) => (
              <tr key={s}>
                <td className="border-b border-gray-200 py-1.5 pr-2">
                  {ROTULOS[s].nome}
                  <span className="block text-xs text-gray-500">{ROTULOS[s].explica}</span>
                </td>
                <td className="border-b border-gray-200 py-1.5 pr-2 text-right tabular-nums">{emPct(fatias[s])}</td>
                <td className="border-b border-gray-200 py-1.5 pr-2 text-right tabular-nums">× {emPct(PESOS[s] * 100)}</td>
                <td className="border-b border-gray-200 py-1.5 text-right tabular-nums">
                  {(fatias[s] * PESOS[s]).toFixed(1).replace(".", ",")} pts
                </td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="py-1.5" colSpan={3}>
                IC de {alvo.membro.nome} em {etapa.nome}
              </td>
              <td className="py-1.5 text-right tabular-nums">{emPct(alvo.ic)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

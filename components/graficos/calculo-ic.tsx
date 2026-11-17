"use client";

// "Como o IC foi calculado": os 4 sinais de um membro, o peso de cada um
// e quanto cada sinal contribuiu para o IC final.

import type { Sinais } from "@/data";
import { emPct, type LinhaRanking } from "@/lib/indice";
import { useDestaque } from "./destaque";

const ROTULOS: Record<keyof Sinais, { nome: string; explica: string }> = {
  efetivas: { nome: "Linhas efetivas", explica: "linhas escritas que continuam no código hoje" },
  commits: { nome: "Commits", explica: "frequência de envolvimento" },
  brutas: { nome: "Linhas brutas", explica: "volume de alterações (adicionadas + removidas)" },
  recentes: { nome: "Trabalho recente", explica: "linhas efetivas com meia-vida de 45 dias" },
};

/** Explica o IC do membro em destaque (ou de quem tem o maior IC, se ninguém estiver destacado). */
export function CalculoIC({ linhas, pesos, onde }: { linhas: LinhaRanking[]; pesos: Sinais; onde: string }) {
  const { membroId } = useDestaque();
  const alvo = linhas.find((l) => l.membro.id === membroId) ?? linhas[0];
  if (!alvo) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        Mostrando {alvo.membro.nome}. Clique em outra barra para ver o cálculo de outro membro.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[440px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="border-b border-gray-300 py-1.5 pr-2 font-normal">Sinal</th>
              <th className="border-b border-gray-300 py-1.5 pr-2 text-right font-normal">Fatia</th>
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
                <td className="border-b border-gray-200 py-1.5 pr-2 text-right tabular-nums">{emPct(alvo.fatias[s])}</td>
                <td className="border-b border-gray-200 py-1.5 pr-2 text-right tabular-nums">× {emPct(pesos[s] * 100)}</td>
                <td className="border-b border-gray-200 py-1.5 text-right tabular-nums">
                  {(alvo.fatias[s] * pesos[s]).toFixed(1).replace(".", ",")} pts
                </td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="py-1.5" colSpan={3}>
                IC de {alvo.membro.nome} em {onde}
              </td>
              <td className="py-1.5 text-right tabular-nums">{emPct(alvo.ic)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

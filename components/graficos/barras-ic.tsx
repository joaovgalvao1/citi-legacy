"use client";

// Barras horizontais com o Índice de Conhecimento de cada membro numa etapa.
// Clicar numa barra destaca o membro nos outros gráficos da página.

import type { Projeto } from "@/data";
import { emPct, ranking } from "@/lib/indice";
import { corDoMembro } from "./cores";
import { useDestaque } from "./destaque";

type Props = {
  projeto: Projeto;
  etapaId: string;
  /** Versão compacta para os cards do painel: só os 3 primeiros, nomes curtos. */
  compacto?: boolean;
};

export function BarrasIC({ projeto, etapaId, compacto = false }: Props) {
  const { membroId, alternar } = useDestaque();
  const linhas = ranking(projeto, etapaId);
  const visiveis = compacto ? linhas.slice(0, 3) : linhas;
  const ocultos = linhas.length - visiveis.length;
  const etapaNome = projeto.etapas.find((e) => e.id === etapaId)?.nome ?? etapaId;

  return (
    <div role="group" aria-label={`Índice de Conhecimento por membro em ${etapaNome}`} className="space-y-1.5">
      {visiveis.map(({ membro, ic }, i) => {
        const apagado = membroId !== null && membroId !== membro.id;
        const nome = compacto ? membro.nome.split(" ")[0] : membro.nome;
        return (
          <button
            key={membro.id}
            type="button"
            onClick={() => alternar(membro.id)}
            title={`${membro.nome}: IC ${emPct(ic)} em ${etapaNome}`}
            aria-pressed={membroId === membro.id}
            className={`grid w-full cursor-pointer items-center gap-2 text-left text-sm transition-opacity ${
              compacto ? "grid-cols-[4.5rem_1fr_2.5rem]" : "grid-cols-[9rem_1fr_3rem]"
            } ${apagado ? "opacity-30" : ""}`}
          >
            <span className={`truncate ${i === 0 ? "font-semibold" : "text-gray-700"}`}>{nome}</span>
            <span className={`relative bg-gray-100 ${compacto ? "h-3" : "h-5"}`}>
              <span
                className="absolute inset-y-0 left-0"
                style={{ width: `${Math.max(ic, 1)}%`, backgroundColor: corDoMembro(projeto, membro.id) }}
              />
            </span>
            <span className={`text-right tabular-nums ${i === 0 ? "font-semibold" : "text-gray-600"}`}>{emPct(ic)}</span>
          </button>
        );
      })}
      {ocultos > 0 && (
        <p className="text-xs text-gray-500">
          + {ocultos} {ocultos === 1 ? "membro" : "membros"} com menos conhecimento
        </p>
      )}
    </div>
  );
}

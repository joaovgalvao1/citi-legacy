"use client";

// Barras horizontais com o Índice de Conhecimento de cada membro
// (no projeto inteiro ou numa etapa). Clicar numa barra destaca o membro.

import type { Projeto } from "@/data";
import { emPct, type LinhaRanking } from "@/lib/indice";
import { corDoMembro } from "./cores";
import { useDestaque } from "./destaque";

export function BarrasIC({ projeto, linhas, rotulo }: { projeto: Projeto; linhas: LinhaRanking[]; rotulo: string }) {
  const { membroId, alternar } = useDestaque();

  return (
    <div role="group" aria-label={`Índice de Conhecimento por membro: ${rotulo}`} className="space-y-2">
      {linhas.map(({ membro, ic }, i) => {
        const apagado = membroId !== null && membroId !== membro.id;
        return (
          <button
            key={membro.id}
            type="button"
            onClick={() => alternar(membro.id)}
            title={`${membro.nome}: IC ${emPct(ic)}`}
            aria-pressed={membroId === membro.id}
            className={`grid w-full cursor-pointer grid-cols-[minmax(6rem,10rem)_1fr_3rem] items-center gap-3 text-left text-sm transition-opacity ${
              apagado ? "opacity-30" : ""
            }`}
          >
            <span className={`truncate ${i === 0 ? "font-semibold" : "text-gray-700"}`}>{membro.nome}</span>
            <span className="relative h-5 overflow-hidden rounded-full bg-gray-100">
              <span
                className="anima-barra absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${Math.max(ic, 1)}%`, backgroundColor: corDoMembro(projeto, membro.id) }}
              />
            </span>
            <span className={`dado text-right ${i === 0 ? "font-semibold" : "text-gray-600"}`}>{emPct(ic)}</span>
          </button>
        );
      })}
    </div>
  );
}

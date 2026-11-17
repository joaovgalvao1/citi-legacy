// Índice de Conhecimento (IC). Funções puras: rodam no servidor e no navegador.
// O cálculo do IC está em scripts/gerar-dados.mjs; aqui só se consulta.

import type { Membro, Projeto, Sinais } from "@/data";

/** Formata um valor de 0 a 100 (IC, progresso) como porcentagem: 73 → "73%". */
export const emPct = (v: number) => `${Math.round(v)}%`;

export type LinhaRanking = { membro: Membro; ic: number; fatias: Sinais };

/** Membros com conhecimento no projeto inteiro (sem etapaId) ou numa etapa, do maior IC para o menor. */
export function ranking(projeto: Projeto, etapaId?: string): LinhaRanking[] {
  const etapa = etapaId ? projeto.etapas.find((e) => e.id === etapaId) : undefined;
  return projeto.membros
    .map((membro) => ({
      membro,
      ic: etapa ? (etapa.ic[membro.id] ?? 0) : membro.icProjeto,
      fatias: etapa ? etapa.fatias[membro.id] : membro.fatiasProjeto,
    }))
    .filter((l) => l.ic > 0)
    .sort((a, b) => b.ic - a.ic);
}

/** Membro com maior IC na etapa. */
export function lider(projeto: Projeto, etapaId: string) {
  return ranking(projeto, etapaId)[0];
}

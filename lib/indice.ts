// Índice de Conhecimento (IC), risco e urgência. Funções puras: rodam no servidor e no navegador.
// O cálculo do IC está em scripts/gerar-dados.mjs; aqui só se consulta e se classifica.

import type { Membro, Projeto } from "@/data";

/** Formata um valor de 0 a 100 (IC, concentração, progresso) como porcentagem: 73 → "73%". */
export const emPct = (v: number) => `${Math.round(v)}%`;

export type LinhaRanking = { membro: Membro; ic: number };

export function icDe(projeto: Projeto, membroId: string, etapaId: string) {
  return projeto.etapas.find((e) => e.id === etapaId)?.ic[membroId] ?? 0;
}

/** Membros com conhecimento na etapa, do maior IC para o menor. */
export function ranking(projeto: Projeto, etapaId: string): LinhaRanking[] {
  return projeto.membros
    .map((membro) => ({ membro, ic: icDe(projeto, membro.id, etapaId) }))
    .filter((l) => l.ic > 0)
    .sort((a, b) => b.ic - a.ic);
}

/** Membro com maior IC na etapa. */
export function lider(projeto: Projeto, etapaId: string) {
  return ranking(projeto, etapaId)[0];
}

/** Ids das etapas em que o membro tem o maior IC. */
export function etapasLideradas(projeto: Projeto, membro: Membro) {
  return projeto.etapas.filter((e) => lider(projeto, e.id)?.membro.id === membro.id).map((e) => e.id);
}

/* ---------- risco e urgência ----------
 *
 * Risco (de perder conhecimento) vem da concentração do IC na etapa:
 *   Alto     ≥ 70%  · quase todo o conhecimento está com uma pessoa
 *   Moderado ≥ 45%
 *   Baixo    < 45%  · conhecimento distribuído
 *
 * Urgência vem da data de saída de quem tem o maior IC na etapa (só em projetos em andamento):
 *   Alta     sai em até 21 dias
 *   Moderada sai em até 60 dias
 *   Baixa    sai depois disso, ou não tem data de saída registrada
 */

export type Nivel = "Alto" | "Moderado" | "Baixo";
export type NivelUrgencia = "Alta" | "Moderada" | "Baixa";

export const LIMITES = {
  risco: { alto: 0.7, moderado: 0.45 },
  urgenciaDias: { alta: 21, moderada: 60 },
};

export function nivelRisco(concentracao: number): Nivel {
  if (concentracao >= LIMITES.risco.alto) return "Alto";
  if (concentracao >= LIMITES.risco.moderado) return "Moderado";
  return "Baixo";
}

export function nivelUrgencia(membro?: { diasParaSaida?: number }): NivelUrgencia {
  const dias = membro?.diasParaSaida;
  if (dias === undefined || dias < 0) return "Baixa";
  if (dias <= LIMITES.urgenciaDias.alta) return "Alta";
  if (dias <= LIMITES.urgenciaDias.moderada) return "Moderada";
  return "Baixa";
}

export type AvaliacaoEtapa = {
  etapaId: string;
  etapaNome: string;
  risco: Nivel;
  urgencia: NivelUrgencia;
  concentracao: number;
  lider?: LinhaRanking; // quem tem o maior IC
};

export function avaliarEtapa(projeto: Projeto, etapaId: string): AvaliacaoEtapa {
  const etapa = projeto.etapas.find((e) => e.id === etapaId)!;
  const top = lider(projeto, etapaId);
  return {
    etapaId,
    etapaNome: etapa.nome,
    risco: nivelRisco(etapa.concentracao),
    urgencia: projeto.status === "concluido" ? "Baixa" : nivelUrgencia(top?.membro),
    concentracao: etapa.concentracao,
    lider: top,
  };
}

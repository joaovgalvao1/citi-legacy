// Leitura do Índice de Conhecimento (IC), do risco e da urgência.
// Funções puras: rodam no servidor e no navegador.
// O cálculo em si está em scripts/gerar-dados.mjs; aqui só se consulta e se aplica o legado.

import type { Membro, Projeto } from "@/data";

/** Formata um valor de 0 a 100 (IC, concentração) como porcentagem: 73 → "73%". */
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
 * Urgência vem da data de saída de quem tem o maior IC na etapa:
 *   Alta     sai em até 21 dias
 *   Moderada sai em até 60 dias
 *   Baixa    sai depois disso, ou não tem data de saída registrada
 *
 * Registrar o legado de quem tem o maior IC mitiga o risco da etapa.
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

export function nivelUrgencia(membro?: Membro): NivelUrgencia {
  const dias = membro?.diasParaSaida;
  if (dias === undefined) return "Baixa";
  if (dias <= LIMITES.urgenciaDias.alta) return "Alta";
  if (dias <= LIMITES.urgenciaDias.moderada) return "Moderada";
  return "Baixa";
}

const pesoUrgencia: Record<NivelUrgencia, number> = { Alta: 3, Moderada: 2, Baixa: 1 };
const pesoRisco: Record<Nivel, number> = { Alto: 3, Moderado: 2, Baixo: 1 };

const registrado = (legados: string[], projetoId: string, membroId: string) =>
  legados.includes(`${projetoId}/${membroId}`);

export type AvaliacaoEtapa = {
  etapaId: string;
  etapaNome: string;
  risco: Nivel;
  urgencia: NivelUrgencia;
  concentracao: number;
  lider?: LinhaRanking; // quem tem o maior IC
  mitigado: boolean; // o legado do líder já foi registrado
};

export function avaliarEtapa(projeto: Projeto, etapaId: string, legados: string[]): AvaliacaoEtapa {
  const etapa = projeto.etapas.find((e) => e.id === etapaId)!;
  const top = lider(projeto, etapaId);
  return {
    etapaId,
    etapaNome: etapa.nome,
    risco: nivelRisco(etapa.concentracao),
    urgencia: nivelUrgencia(top?.membro),
    concentracao: etapa.concentracao,
    lider: top,
    mitigado: !!top && registrado(legados, projeto.id, top.membro.id),
  };
}

/** Ordena da situação mais grave para a menos grave (urgência primeiro, depois risco). */
const gravidade = (a: AvaliacaoEtapa) => pesoUrgencia[a.urgencia] * 10 + pesoRisco[a.risco];

/**
 * Alertas: etapas cujo líder tem saída com urgência alta ou moderada e cujo legado
 * ainda não foi registrado. Etapas sem data de saída não geram alerta.
 */
export function alertasAbertos(projeto: Projeto, legados: string[]) {
  return projeto.etapas
    .map((e) => avaliarEtapa(projeto, e.id, legados))
    .filter((a) => a.urgencia !== "Baixa" && !a.mitigado)
    .sort((a, b) => gravidade(b) - gravidade(a));
}

/** Etapas que teriam alerta, mas cujo legado já foi registrado. */
export function alertasMitigados(projeto: Projeto, legados: string[]) {
  return projeto.etapas
    .map((e) => avaliarEtapa(projeto, e.id, legados))
    .filter((a) => a.urgencia !== "Baixa" && a.mitigado);
}

export function textoAlerta(a: AvaliacaoEtapa) {
  const m = a.lider!.membro;
  return `${m.nome} sai ${m.saidaPrevista} · ${a.etapaNome} depende de ${m.nome.split(" ")[0]} (IC ${emPct(a.lider!.ic)})`;
}

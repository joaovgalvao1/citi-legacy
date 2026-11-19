// Previsão de entrega pelo ritmo recente. Funções puras.
//
// 1. Ritmo da etapa: tasks concluídas nas últimas 4 semanas ÷ 4 (tasks por semana).
// 2. Previsão da etapa: hoje + (tasks restantes ÷ ritmo) semanas.
// 3. Etapa aberta sem nenhuma task concluída nas últimas 4 semanas: sem previsão ("parada há X semanas").
// 4. Previsão do projeto: a maior data prevista entre as etapas abertas; essa etapa é o gargalo.
// 5. Etapa contínua (a janela planejada cobre 80% ou mais do prazo do projeto, como a Infra/Deploy):
//    as tasks dela acontecem em pulsos (CI no começo, deploy no fim), então o ritmo próprio engana.
//    Ela usa o ritmo médio das outras etapas em execução; sem nenhuma com ritmo, usa o próprio.
// É uma extrapolação, não uma certeza: as telas mostram a base do cálculo ("ritmo das últimas 4 semanas").

import type { Etapa, Projeto } from "@/data";
import { somarDias } from "./hoje";

export const SEMANAS_RITMO = 4;
export const BASE_DO_CALCULO = "ritmo das últimas 4 semanas";

const DIA = 86400000;
const tempo = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).getTime();
const dias = (de: string, ate: string) => Math.round((tempo(ate) - tempo(de)) / DIA);

export type PrevisaoEtapa =
  | { tipo: "concluida"; data: string | null }
  | { tipo: "nao-iniciada" }
  | { tipo: "parada"; semanas: number }
  | {
      tipo: "prevista";
      data: string;
      ritmo: number;
      /** "etapa" = ritmo da própria etapa; "media" = ritmo médio das outras etapas (etapa contínua). */
      base: "etapa" | "media";
      restantes: number;
      noPrazo: boolean;
      diasAlemDoPrazo: number;
    };

/** Etapa contínua: a janela planejada cobre 80% ou mais do prazo do projeto (ex.: Infra/Deploy). */
export function etapaContinua(projeto: Projeto, etapa: Etapa) {
  return dias(etapa.inicioPrevisto, etapa.fimPrevisto) >= 0.8 * dias(projeto.inicio, projeto.fimPrevisto);
}

/** Ritmo médio das etapas em execução que não são contínuas e tiveram tasks concluídas nas últimas 4 semanas. */
export function ritmoMedioDasEtapas(projeto: Projeto) {
  const ritmos = projeto.etapas
    .filter((e) => !etapaContinua(projeto, e) && e.tasks.some((t) => !t.feita))
    .map((e) => ritmoEtapa(projeto, e))
    .filter((r) => r > 0);
  return ritmos.length ? ritmos.reduce((a, b) => a + b, 0) / ritmos.length : 0;
}

/** Tasks concluídas por semana nas últimas 4 semanas. */
export function ritmoEtapa(projeto: Projeto, etapa: Etapa) {
  const corte = somarDias(projeto.hoje, -7 * SEMANAS_RITMO);
  const recentes = etapa.tasks.filter((t) => t.feita && t.feitaEm && t.feitaEm > corte && t.feitaEm <= projeto.hoje).length;
  return recentes / SEMANAS_RITMO;
}

/** Dia da última task concluída na etapa (null se nenhuma tem data). */
function ultimaTaskFeita(etapa: Etapa): string | null {
  return etapa.tasks.map((t) => t.feitaEm).filter((d): d is string => !!d).sort().at(-1) ?? null;
}

/** Dia em que a etapa foi concluída: a última task feita ou, sem datas, o último commit. */
export function conclusaoEtapa(etapa: Etapa): string | null {
  return ultimaTaskFeita(etapa) ?? etapa.ultimoCommit;
}

export function previsaoEtapa(projeto: Projeto, etapa: Etapa): PrevisaoEtapa {
  const feitas = etapa.tasks.filter((t) => t.feita).length;
  const restantes = etapa.tasks.length - feitas;
  if (restantes === 0 || projeto.status === "concluido") return { tipo: "concluida", data: conclusaoEtapa(etapa) };
  if (feitas === 0 && !etapa.ultimoCommit) return { tipo: "nao-iniciada" };

  const media = etapaContinua(projeto, etapa) ? ritmoMedioDasEtapas(projeto) : 0;
  const base = media > 0 ? "media" : "etapa";
  const ritmo = media > 0 ? media : ritmoEtapa(projeto, etapa);
  if (ritmo === 0) {
    // parada desde a última task concluída (ou, sem nenhuma, desde o primeiro commit)
    const desde = ultimaTaskFeita(etapa) ?? etapa.primeiroCommit ?? etapa.inicioPrevisto;
    return { tipo: "parada", semanas: Math.max(SEMANAS_RITMO, Math.floor(dias(desde, projeto.hoje) / 7)) };
  }
  const data = somarDias(projeto.hoje, Math.ceil((restantes / ritmo) * 7));
  const alem = dias(etapa.fimPrevisto, data);
  return { tipo: "prevista", data, ritmo, base, restantes, noPrazo: alem <= 0, diasAlemDoPrazo: Math.max(0, alem) };
}

export type PrevisaoProjeto =
  | { tipo: "entregue"; data: string }
  /** Nenhuma etapa aberta tem ritmo recente: não há como projetar. */
  | { tipo: "sem-previsao"; etapasParadas: number }
  | { tipo: "prevista"; data: string; gargalo: Etapa; noPrazo: boolean; diasAlemDoPrazo: number };

export function previsaoProjeto(projeto: Projeto): PrevisaoProjeto {
  if (projeto.status === "concluido") return { tipo: "entregue", data: projeto.entrega ?? projeto.fimPrevisto };
  let maior: { data: string; etapa: Etapa } | null = null;
  let paradas = 0;
  for (const etapa of projeto.etapas) {
    const p = previsaoEtapa(projeto, etapa);
    if (p.tipo === "parada") paradas++;
    if (p.tipo === "prevista" && (!maior || p.data > maior.data)) maior = { data: p.data, etapa };
  }
  if (!maior) return { tipo: "sem-previsao", etapasParadas: paradas };
  const alem = dias(projeto.fimPrevisto, maior.data);
  return { tipo: "prevista", data: maior.data, gargalo: maior.etapa, noPrazo: alem <= 0, diasAlemDoPrazo: Math.max(0, alem) };
}

/** A previsão passa do prazo do projeto (para o semáforo: um projeto no prazo vira "Atenção"). */
export function previsaoForaDoPrazo(projeto: Projeto) {
  const p = previsaoProjeto(projeto);
  return p.tipo === "prevista" && !p.noPrazo;
}

const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/** Texto curto para cards e slides: "prev. 18/12 · +42 dias", "prev. 04/12 · no prazo", "sem previsão". */
export function textoPrevisao(p: PrevisaoProjeto): { texto: string; tom: "verde" | "vermelho" | "ambar" } {
  if (p.tipo === "entregue") return { texto: `entregue em ${ddmm(p.data)}`, tom: "verde" };
  if (p.tipo === "sem-previsao") return { texto: "sem previsão · etapas paradas", tom: "ambar" };
  return p.noPrazo
    ? { texto: `prev. ${ddmm(p.data)} · no prazo`, tom: "verde" }
    : { texto: `prev. ${ddmm(p.data)} · +${p.diasAlemDoPrazo} ${p.diasAlemDoPrazo === 1 ? "dia" : "dias"}`, tom: "vermelho" };
}

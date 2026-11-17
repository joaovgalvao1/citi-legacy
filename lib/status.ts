// Status de projetos e etapas, progresso e alertas. Funções puras.
//
// Etapa:
//   Concluída     progresso 100%
//   Em planejamento  progresso 0% e o início previsto ainda não chegou
//   Atrasada      passou do fim previsto sem chegar a 100%
//   Em andamento  o resto
//   + "parada" (sinal extra): em andamento ou atrasada, sem commits há 14 dias ou mais
//
// Projeto:
//   Concluído     entregue
//   Atrasado      passou do fim previsto sem ser entregue
//   Em andamento  o resto
//
// Alertas (só projetos não concluídos): etapa atrasada e/ou parada, um por etapa.

import type { Etapa, Projeto } from "@/data";
import { dataReferencia } from "@/data/referencia.json";
import { emPct } from "./indice";

export const DIAS_PARADA = 14;

const DIA = 86400000;
const data = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).getTime();
export const diasEntre = (de: string, ate: string) => Math.round((data(ate) - data(de)) / DIA);
const hoje = dataReferencia;

export type StatusEtapa = "Concluída" | "Em andamento" | "Atrasada" | "Em planejamento";
export type StatusProjeto = "Concluído" | "Em andamento" | "Atrasado";

export function statusEtapa(projeto: Projeto, etapa: Etapa): StatusEtapa {
  if (etapa.progresso >= 100 || projeto.status === "concluido") return "Concluída";
  if (hoje > etapa.fimPrevisto) return "Atrasada";
  if (etapa.progresso === 0 && hoje < etapa.inicioPrevisto) return "Em planejamento";
  return "Em andamento";
}

/** Dias sem commits numa etapa que ainda não acabou (null se não está parada). */
export function diasParada(projeto: Projeto, etapa: Etapa): number | null {
  if (statusEtapa(projeto, etapa) === "Concluída" || !etapa.ultimoCommit) return null;
  const dias = diasEntre(etapa.ultimoCommit, hoje);
  return dias >= DIAS_PARADA ? dias : null;
}

export function statusProjeto(projeto: Projeto): StatusProjeto {
  if (projeto.status === "concluido") return "Concluído";
  if (hoje > projeto.fimPrevisto) return "Atrasado";
  return "Em andamento";
}

/** Prazo de uma etapa: "começa em 13 dias", "faltam 10 dias", "atrasada há 11 dias" ("" se concluída). */
export function textoPrazoEtapa(projeto: Projeto, etapa: Etapa) {
  const s = statusEtapa(projeto, etapa);
  if (s === "Concluída") return "";
  if (s === "Em planejamento") {
    const d = diasEntre(hoje, etapa.inicioPrevisto);
    return d <= 0 ? "começa hoje" : `começa em ${d} ${d === 1 ? "dia" : "dias"}`;
  }
  if (s === "Atrasada") return `atrasada há ${diasEntre(etapa.fimPrevisto, hoje)} dias`;
  const d = diasEntre(hoje, etapa.fimPrevisto);
  return d === 0 ? "prazo termina hoje" : `faltam ${d} ${d === 1 ? "dia" : "dias"}`;
}

/** Progresso do projeto: média simples do progresso das etapas. */
export function progressoProjeto(projeto: Projeto) {
  return projeto.etapas.reduce((s, e) => s + e.progresso, 0) / projeto.etapas.length;
}

/** Texto do prazo: "faltam 31 dias", "atrasado há 11 dias", "entregue em 20/03/2026". */
export function textoPrazo(projeto: Projeto) {
  if (projeto.entrega) {
    const d = diasEntre(projeto.fimPrevisto, projeto.entrega);
    const quando = projeto.entrega.split("-").reverse().join("/");
    if (d > 0) return `entregue em ${quando}, ${d} dias depois do previsto`;
    if (d < 0) return `entregue em ${quando}, ${-d} dias antes do previsto`;
    return `entregue em ${quando}, no prazo`;
  }
  const d = diasEntre(hoje, projeto.fimPrevisto);
  if (d < 0) return `atrasado há ${-d} dias`;
  return d === 0 ? "prazo termina hoje" : `faltam ${d} dias`;
}

/** Só a comparação com o previsto, para projetos entregues: "7 dias depois do previsto". */
export function textoEntrega(projeto: Projeto) {
  if (!projeto.entrega) return "";
  const d = diasEntre(projeto.fimPrevisto, projeto.entrega);
  if (d > 0) return `${d} dias depois do previsto`;
  if (d < 0) return `${-d} dias antes do previsto`;
  return "no prazo";
}

/* ---------- alertas ---------- */

export type Alerta = {
  etapaId: string;
  /** Frase completa, para o painel. */
  texto: string;
  /** Frase curta, para os cards da lista de projetos. */
  curto: string;
  gravidade: number; // maior = mais grave
};

/** Um alerta por etapa atrasada e/ou parada, do mais grave para o menos grave. */
export function alertas(projeto: Projeto): Alerta[] {
  if (projeto.status === "concluido") return [];
  const lista: Alerta[] = [];
  for (const etapa of projeto.etapas) {
    const atrasada = statusEtapa(projeto, etapa) === "Atrasada";
    const parada = diasParada(projeto, etapa);
    if (!atrasada && parada === null) continue;
    const diasAtraso = atrasada ? diasEntre(etapa.fimPrevisto, hoje) : 0;
    const partes = [
      atrasada ? `atrasada há ${diasAtraso} dias (${emPct(etapa.progresso)} concluído)` : null,
      parada !== null ? `sem commits há ${parada} dias` : null,
    ].filter(Boolean);
    lista.push({
      etapaId: etapa.id,
      texto: `${etapa.nome}: ${partes.join(" e ")}`,
      curto: `${etapa.nome} ${atrasada ? "atrasada" : "parada"}`,
      gravidade: (atrasada ? 20 + Math.min(diasAtraso, 60) / 10 : 0) + (parada !== null ? 10 + Math.min(parada, 60) / 10 : 0),
    });
  }
  return lista.sort((a, b) => b.gravidade - a.gravidade);
}

/** Resumo curto para o card da lista: o alerta mais grave, ou "N etapas atrasadas" quando há várias. */
export function alertaDoCard(projeto: Projeto): string | null {
  const lista = alertas(projeto);
  if (!lista.length) return null;
  const atrasadas = projeto.etapas.filter((e) => statusEtapa(projeto, e) === "Atrasada").length;
  if (atrasadas > 1) return `${atrasadas} etapas atrasadas`;
  return lista[0].curto;
}

/** Duração de um projeto concluído, em meses arredondados. */
export function duracaoEmMeses(projeto: Projeto) {
  const fim = projeto.entrega ?? projeto.fimPrevisto;
  return Math.max(1, Math.round(diasEntre(projeto.inicio, fim) / 30.4));
}

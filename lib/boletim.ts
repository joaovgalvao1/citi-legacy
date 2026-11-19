// Boletim semanal da empresa: o resumo da semana de todos os projetos em andamento.
// Montado uma vez e usado pelo PDF (/exportar/boletim) e pelo e-mail de sexta-feira.

import type { Commit, Projeto, Resumo } from "@/data";
import { alertas, diasParada, nivelProjeto, progressoProjeto, statusProjeto, textoPrazo, type StatusProjeto } from "./status";
import { previsaoProjeto, textoPrevisao } from "./previsao";
import { inicioDaSemana } from "./analise";
import { somarDias } from "./hoje";

export type ItemBoletim = {
  id: string;
  nome: string;
  cliente: string;
  status: StatusProjeto;
  /** Semáforo: vermelho (atrasado), âmbar (atenção), verde (no prazo). */
  nivel: "verde" | "ambar" | "vermelho";
  /** Previsão de entrega pelo ritmo das últimas 4 semanas ("prev. 16/12 · no prazo"). */
  previsao: { texto: string; tom: "verde" | "vermelho" | "ambar" };
  progresso: number;
  prazo: string;
  alertas: string[];
  resumo: Resumo | null;
};

export type Boletim = {
  /** Segunda-feira da semana resumida ("aaaa-mm-dd"). */
  semana: string;
  fimSemana: string;
  hoje: string;
  numeros: { andamento: number; atrasados: number; etapasParadas: number; commitsSemana: number; tasksSemana: number };
  projetos: ItemBoletim[];
  concluidos: { id: string; nome: string; cliente: string; entrega: string }[];
};

const ORDEM_NIVEL = { vermelho: 0, ambar: 1, verde: 2 } as const;

export function montarBoletim(projetos: Projeto[], resumos: Record<string, Resumo[]>, commits: Commit[]): Boletim {
  const hoje = projetos[0]?.hoje ?? new Date().toISOString().slice(0, 10);
  const andamento = projetos.filter((p) => p.status !== "concluido");

  // a semana do boletim é a do resumo semanal mais recente; sem resumos, a semana passada
  const semanas = andamento.flatMap((p) => (resumos[p.id] ?? []).filter((r) => r.tipo === "semanal").map((r) => r.semana));
  const semana = semanas.sort().at(-1) ?? inicioDaSemana(somarDias(hoje, -7));
  const fimSemana = somarDias(semana, 6);

  const itens: ItemBoletim[] = andamento
    .map((p) => ({
      id: p.id,
      nome: p.nome,
      cliente: p.cliente,
      status: statusProjeto(p),
      nivel: nivelProjeto(p),
      previsao: textoPrevisao(previsaoProjeto(p)),
      progresso: progressoProjeto(p),
      prazo: textoPrazo(p),
      alertas: alertas(p).map((a) => a.texto),
      resumo: (resumos[p.id] ?? []).find((r) => r.tipo === "semanal" && r.semana === semana) ?? null,
    }))
    // atrasados primeiro, depois atenção, depois no prazo
    .sort((a, b) => ORDEM_NIVEL[a.nivel] - ORDEM_NIVEL[b.nivel] || b.alertas.length - a.alertas.length);

  const ids = new Set(andamento.map((p) => p.id));
  return {
    semana,
    fimSemana,
    hoje,
    numeros: {
      andamento: andamento.length,
      atrasados: itens.filter((i) => i.status === "Atrasado").length,
      etapasParadas: andamento.reduce((s, p) => s + p.etapas.filter((e) => diasParada(p, e) !== null).length, 0),
      commitsSemana: commits.filter((c) => ids.has(c.projetoId) && c.data.slice(0, 10) >= semana && c.data.slice(0, 10) <= fimSemana).length,
      tasksSemana: andamento.reduce(
        (s, p) => s + p.etapas.reduce((n, e) => n + e.tasks.filter((t) => t.feitaEm && t.feitaEm >= semana && t.feitaEm <= fimSemana).length, 0),
        0,
      ),
    },
    projetos: itens,
    concluidos: projetos
      .filter((p) => p.status === "concluido")
      .map((p) => ({ id: p.id, nome: p.nome, cliente: p.cliente, entrega: p.entrega ?? p.fimPrevisto })),
  };
}

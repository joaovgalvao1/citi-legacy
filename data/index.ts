// Camada de dados do protótipo: lê os JSONs gerados por `npm run dados`
// (scripts/gerar-dados.mjs) e entrega no formato que as telas usam.
//
// As telas mostram só o Índice de Conhecimento (IC), o risco e a urgência;
// as métricas brutas (linhas efetivas, brutas, commits) ficam no analises.json.

import projetosJson from "./projetos.json";
import analisesJson from "./analises.json";

export type Etapa = {
  id: string;
  nome: string;
  descricao: string;
  /** IC de cada membro na etapa (0 a 100; a soma da etapa é 100). */
  ic: Record<string, number>;
  /** Concentração do conhecimento (HHI, 0 a 1): 1 = uma pessoa sabe tudo. */
  concentracao: number;
  /** Fatia (%) de cada membro em cada sinal do IC, para explicar o cálculo. */
  fatias: Record<string, Sinais>;
  /** Commits por semana nesta etapa. */
  semanas: Semana[];
};

/** Os quatro sinais que compõem o IC, em % (fatia do membro no total da etapa). */
export type Sinais = { efetivas: number; commits: number; brutas: number; recentes: number };

/** Commits de cada membro numa semana (semana = segunda-feira, "aaaa-mm-dd"). */
export type Semana = { semana: string; commits: Record<string, number> };

export type Membro = {
  id: string;
  nome: string;
  papel: string;
  entrada: string; // "aaaa-mm"
  saida?: string; // "aaaa-mm-dd"
  saidaPrevista?: string; // texto relativo, ex.: "em 3 semanas"
  diasParaSaida?: number; // dias entre a data de referência e a saída
  /** IC do membro no projeto inteiro (0 a 100). */
  icProjeto: number;
};

export type Projeto = {
  id: string;
  nome: string;
  cliente: string;
  descricao: string;
  inicio: string;
  fim: string;
  etapaAtual: string; // nome da etapa
  etapas: Etapa[];
  membros: Membro[];
  /** Commits por semana no projeto inteiro. */
  semanas: Semana[];
  /** Pesos de cada sinal no IC (iguais em todos os projetos). */
  pesos: Sinais;
};

type Analise = {
  indice: { pesos: Sinais; meiaVidaDias: number };
  porMembro: Record<string, { icProjeto: number }>;
  porEtapa: Record<string, { ic: Record<string, number>; concentracao: number; fatias: Record<string, Sinais>; semanas: Semana[] }>;
  semanas: Semana[];
};

const analises = analisesJson as unknown as Record<string, Analise>;

export const dataReferencia = projetosJson.dataReferencia;
export const parametrosIndice = Object.values(analises)[0].indice;

export const projetos: Projeto[] = projetosJson.projetos.map((p) => {
  const a = analises[p.id];
  return {
    id: p.id,
    nome: p.nome,
    cliente: p.cliente,
    descricao: p.descricao,
    inicio: p.inicio,
    fim: p.fim,
    etapaAtual: p.etapas.find((e) => e.id === p.etapaAtual)?.nome ?? p.etapaAtual,
    etapas: p.etapas.map((e) => ({ ...e, ...a.porEtapa[e.id] })),
    membros: p.membros.map((m) => ({
      id: m.id,
      nome: m.nome,
      papel: m.papel,
      entrada: m.entrada,
      ...("saida" in m && m.saida
        ? { saida: m.saida, saidaPrevista: m.saidaTexto, diasParaSaida: m.diasParaSaida }
        : {}),
      icProjeto: a.porMembro[m.id].icProjeto,
    })),
    semanas: a.semanas,
    pesos: a.indice.pesos,
  };
});

export function getProjeto(id: string) {
  return projetos.find((p) => p.id === id);
}

export function getMembro(projetoId: string, membroId: string) {
  return getProjeto(projetoId)?.membros.find((m) => m.id === membroId);
}

export function nomeEtapa(projeto: Projeto, etapaId: string) {
  return projeto.etapas.find((e) => e.id === etapaId)?.nome ?? etapaId;
}

/** "2025-03" → "mar/2025" */
export function formatarMesAno(aaaaMm: string) {
  const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const [ano, mes] = aaaaMm.split("-");
  return `${meses[Number(mes) - 1]}/${ano}`;
}

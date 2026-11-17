// Camada de dados do protótipo: lê os JSONs gerados por `npm run dados`
// (scripts/gerar-dados.mjs) e entrega no formato que as telas usam.
//
// As telas mostram o progresso, a atividade e o Índice de Conhecimento (IC);
// as métricas brutas (linhas efetivas, brutas, commits) ficam no analises.json.

import projetosJson from "./projetos.json";
import analisesJson from "./analises.json";

/** Os quatro sinais que compõem o IC, em % (fatia do membro no total da etapa). */
export type Sinais = { efetivas: number; commits: number; brutas: number; recentes: number };

/** Commits de cada membro numa semana (semana = segunda-feira, "aaaa-mm-dd"). */
export type Semana = { semana: string; commits: Record<string, number> };

export type Etapa = {
  id: string;
  nome: string;
  descricao: string;
  inicioPrevisto: string; // "aaaa-mm-dd"
  fimPrevisto: string;
  /** Progresso informado pelo gerente do projeto (0 a 100). */
  progresso: number;
  primeiroCommit: string | null;
  ultimoCommit: string | null;
  /** IC de cada membro na etapa (0 a 100; a soma da etapa é 100). */
  ic: Record<string, number>;
  /** Concentração do conhecimento (HHI, 0 a 1): 1 = uma pessoa sabe tudo. */
  concentracao: number;
  /** Fatia (%) de cada membro em cada sinal do IC, para explicar o cálculo. */
  fatias: Record<string, Sinais>;
  /** Commits por semana nesta etapa. */
  semanas: Semana[];
};

export type Pessoa = {
  id: string;
  nome: string;
  entrada: string; // "aaaa-mm"
  saiuEm?: string; // já saiu da empresa, "aaaa-mm-dd"
};

/** Uma pessoa dentro de um projeto. */
export type Membro = Pessoa & {
  papel: string;
  /** IC do membro no projeto inteiro (0 a 100). */
  icProjeto: number;
  /** Fatias do membro nos 4 sinais do IC, no projeto inteiro. */
  fatiasProjeto: Sinais;
};

export type Projeto = {
  id: string;
  nome: string;
  cliente: string;
  descricao: string;
  contexto?: string;
  resultados?: string;
  /** Uma linha de resultado para os cards (só concluídos). */
  resumoResultado?: string;
  /** Case real do CITi (pessoas e commits continuam fictícios). */
  caseReal: boolean;
  status: "andamento" | "concluido";
  inicio: string;
  fimPrevisto: string;
  entrega?: string;
  etapas: Etapa[];
  membros: Membro[];
  /** Commits por semana no projeto inteiro. */
  semanas: Semana[];
  /** Pesos de cada sinal no IC (iguais em todos os projetos). */
  pesos: Sinais;
};

type Analise = {
  indice: { pesos: Sinais; meiaVidaDias: number };
  porMembro: Record<string, { icProjeto: number; fatiasProjeto: Sinais }>;
  porEtapa: Record<
    string,
    {
      ic: Record<string, number>;
      concentracao: number;
      fatias: Record<string, Sinais>;
      semanas: Semana[];
      primeiroCommit: string | null;
      ultimoCommit: string | null;
    }
  >;
  semanas: Semana[];
};

const analises = analisesJson as unknown as Record<string, Analise>;

export const dataReferencia = projetosJson.dataReferencia;
export const pessoas: Pessoa[] = projetosJson.pessoas;

export const projetos: Projeto[] = projetosJson.projetos.map((p) => {
  const a = analises[p.id];
  return {
    ...p,
    status: p.status as Projeto["status"],
    etapas: p.etapas.map((e) => ({ ...e, ...a.porEtapa[e.id] })),
    membros: p.membros.map((m) => ({
      ...pessoas.find((x) => x.id === m.id)!,
      papel: m.papel,
      icProjeto: a.porMembro[m.id].icProjeto,
      fatiasProjeto: a.porMembro[m.id].fatiasProjeto,
    })),
    semanas: a.semanas,
    pesos: a.indice.pesos,
  };
});

export function getProjeto(id: string) {
  return projetos.find((p) => p.id === id);
}

export function getPessoa(id: string) {
  return pessoas.find((p) => p.id === id);
}

/** Projetos de que a pessoa participou, com o papel e o IC dela em cada um. */
export function projetosDaPessoa(pessoaId: string) {
  return projetos
    .map((projeto) => ({ projeto, membro: projeto.membros.find((m) => m.id === pessoaId) }))
    .filter((x): x is { projeto: Projeto; membro: Membro } => !!x.membro);
}

export function nomeEtapa(projeto: Projeto, etapaId: string) {
  return projeto.etapas.find((e) => e.id === etapaId)?.nome ?? etapaId;
}

export { formatarData, formatarMesAno } from "./formatos";

// Camada de dados: lê o banco (Postgres, via Drizzle) e entrega os projetos no formato que as telas usam.
// IC, concentração, atividade semanal e primeiro/último commit são calculados aqui a partir dos commits.
//
// As leituras usam o cache do Next ('use cache' + cacheTag "dados"): as páginas continuam rápidas,
// e marcar uma task invalida o cache (updateTag) para todos verem a mudança.

import { desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db, esquema } from "@/db/conexao";
import type { Semana, Sinais } from "@/lib/analise";
import { carregarClientes, carregarCommits, carregarTudo } from "./carregar";

export type { Semana, Sinais };

export type Task = { titulo: string; feita: boolean };

export type Etapa = {
  id: string;
  nome: string;
  descricao: string;
  inicioPrevisto: string; // "aaaa-mm-dd"
  fimPrevisto: string;
  /** Caminhos do repositório ligados à etapa (ex.: "src/estoque/**"). */
  caminhos: string[];
  /** Tasks da etapa; o progresso é a fração concluída. */
  tasks: Task[];
  /** Progresso (0 a 100) = tasks concluídas ÷ total. */
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
  /** Concluído ao marcar a última task; desmarcar uma task reabre o projeto. */
  concluidoPelasTasks: boolean;
  etapas: Etapa[];
  membros: Membro[];
  /** Commits por semana no projeto inteiro. */
  semanas: Semana[];
  /** Pesos de cada sinal no IC (iguais em todos os projetos). */
  pesos: Sinais;
  /** Data de hoje ("aaaa-mm-dd") no momento da leitura; base de prazos, atrasos e "parada". */
  hoje: string;
};

export type Commit = {
  hash: string;
  projetoId: string;
  autor: string;
  data: string;
  mensagem: string;
  arquivos: string[];
  etapas: string[];
  adicionadas: number;
  removidas: number;
  efetivas: number;
};

export type Resumo = {
  tipo: "semanal" | "final";
  semana: string;
  secoes: { titulo: string; itens: string[] }[];
  fonte: "gemini" | "groq" | "regras";
  modelo: string | null;
  geradoEm: string;
};

export { formatarData, formatarMesAno } from "./formatos";

/* ---------- leitura do banco (com cache) ---------- */

async function lerTudo() {
  "use cache";
  cacheTag("dados");
  cacheLife("hours");
  return carregarTudo();
}

/* ---------- consultas usadas pelas páginas ---------- */

export async function obterProjetos() {
  return (await lerTudo()).projetos;
}

export async function obterProjeto(id: string) {
  return (await lerTudo()).projetos.find((p) => p.id === id);
}

export async function obterPessoas() {
  return (await lerTudo()).pessoas;
}

export async function obterPessoa(id: string) {
  return (await lerTudo()).pessoas.find((p) => p.id === id);
}

export async function totalDeCommits() {
  return (await lerTudo()).totalCommits;
}

/** Projetos de que a pessoa participou, com o papel e o IC dela em cada um. */
export async function projetosDaPessoa(pessoaId: string) {
  return (await obterProjetos())
    .map((projeto) => ({ projeto, membro: projeto.membros.find((m) => m.id === pessoaId) }))
    .filter((x): x is { projeto: Projeto; membro: Membro } => !!x.membro);
}

/** Clientes cadastrados (para o formulário de novo projeto). */
export async function obterClientes(): Promise<{ id: string; nome: string; segmento: string | null }[]> {
  "use cache";
  cacheTag("dados");
  cacheLife("hours");
  return carregarClientes();
}

/** Commits (de um projeto, de uma pessoa, ou ambos), do mais recente para o mais antigo. */
export async function obterCommits(filtro: { projetoId?: string; autor?: string }): Promise<Commit[]> {
  "use cache";
  cacheTag("dados");
  cacheLife("hours");
  return carregarCommits(filtro);
}

/** Resumos da IA de um projeto, do mais recente para o mais antigo. */
export async function obterResumos(projetoId: string): Promise<Resumo[]> {
  "use cache";
  cacheTag("resumos");
  cacheLife("hours");
  const linhas = await db
    .select()
    .from(esquema.resumos)
    .where(eq(esquema.resumos.projetoId, projetoId))
    .orderBy(desc(esquema.resumos.semana));
  return linhas.map((r) => ({
    tipo: r.tipo as Resumo["tipo"],
    semana: r.semana,
    secoes: r.secoes,
    fonte: r.fonte as Resumo["fonte"],
    modelo: r.modelo,
    geradoEm: r.geradoEm.toISOString(),
  }));
}

/* ---------- utilitários ---------- */

export function nomeEtapa(projeto: Projeto, etapaId: string) {
  return projeto.etapas.find((e) => e.id === etapaId)?.nome ?? etapaId;
}

/**
 * Versão leve do projeto para enviar ao navegador (sem semanas e fatias do IC),
 * usada nos componentes que só precisam de progresso, status e quem mais sabe.
 */
export function projetoEnxuto(projeto: Projeto): Projeto {
  return {
    ...projeto,
    semanas: [],
    etapas: projeto.etapas.map((e) => ({ ...e, semanas: [], fatias: {} })),
  };
}

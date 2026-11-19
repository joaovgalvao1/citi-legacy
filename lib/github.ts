// Leitura de commits do GitHub pela API REST (sem biblioteca).
//
//   GITHUB_TOKEN           token fine-grained (somente leitura). Sem ele, vale o limite público
//                          de 60 consultas por hora e só repositórios públicos.
//   GITHUB_WEBHOOK_SECRET  segredo do webhook do repositório (confere a assinatura de cada aviso).
//
// Cada commit precisa de uma consulta para trazer os arquivos e as linhas; por isso a sincronização
// lê no máximo os últimos 100 commits e, nas vezes seguintes, só os que ainda não estão no banco.

import { createHmac, timingSafeEqual } from "node:crypto";

const API = "https://api.github.com";
export const LIMITE_COMMITS = 100;

export type CommitGithub = {
  sha: string;
  login: string | null; // usuário do GitHub de quem fez o commit (null se o e-mail não está ligado a uma conta)
  nome: string; // nome do autor no commit
  data: string; // ISO (UTC)
  mensagem: string;
  arquivos: { nome: string; adicionadas: number; removidas: number }[];
};

export class ErroGithub extends Error {}

function cabecalhos() {
  const h: Record<string, string> = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "citi-legacy" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function pedir<T>(caminho: string): Promise<T> {
  const r = await fetch(`${API}${caminho}`, { headers: cabecalhos(), cache: "no-store", signal: AbortSignal.timeout(15000) });
  if (r.status === 404) throw new ErroGithub("Repositório não encontrado (ou privado sem acesso pelo token).");
  if (r.status === 401) throw new ErroGithub("O GITHUB_TOKEN foi recusado pelo GitHub (inválido ou vencido).");
  if (r.status === 403 || r.status === 429) {
    const restam = r.headers.get("x-ratelimit-remaining");
    throw new ErroGithub(
      restam === "0"
        ? `Limite de consultas ao GitHub atingido${process.env.GITHUB_TOKEN ? "" : " (sem GITHUB_TOKEN o limite é 60 por hora)"}. Tente mais tarde.`
        : "O GitHub recusou o acesso a este repositório.",
    );
  }
  if (!r.ok) throw new ErroGithub(`O GitHub respondeu ${r.status}.`);
  return (await r.json()) as T;
}

/** "github.com/dono/nome", "https://github.com/dono/nome.git" ou "dono/nome" → "dono/nome" (null se não parece um repositório). */
export function normalizarRepositorio(texto: string): string | null {
  const t = texto
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?github\.com\//i, "")
    .replace(/\.git$/i, "")
    .replace(/\/+$/, "");
  return /^[\w.-]+\/[\w.-]+$/.test(t) ? t : null;
}

/** Confere se o repositório existe e é acessível; devolve o nome oficial ("Dono/Nome"). */
export async function verificarRepositorio(repo: string) {
  const r = await pedir<{ full_name: string; private: boolean; default_branch: string }>(`/repos/${repo}`);
  return { nome: r.full_name, privado: r.private, branch: r.default_branch };
}

type CommitLista = { sha: string; author: { login: string } | null; commit: { author: { name: string; date: string }; message: string } };
type CommitDetalhe = CommitLista & { files?: { filename: string; additions: number; deletions: number }[] };

/** Commits mais recentes do branch principal que ainda não estão em `conhecidos` (com arquivos e linhas). */
export async function buscarCommitsNovos(repo: string, conhecidos: Set<string>): Promise<CommitGithub[]> {
  const lista = await pedir<CommitLista[]>(`/repos/${repo}/commits?per_page=${LIMITE_COMMITS}`);
  const novos = lista.filter((c) => !conhecidos.has(c.sha));
  const detalhes: CommitDetalhe[] = [];
  // em lotes de 10 consultas simultâneas, para ser rápido sem abusar da API
  for (let i = 0; i < novos.length; i += 10) {
    detalhes.push(...(await Promise.all(novos.slice(i, i + 10).map((c) => pedir<CommitDetalhe>(`/repos/${repo}/commits/${c.sha}`)))));
  }
  return detalhes.map((c) => ({
    sha: c.sha,
    login: c.author?.login ?? null,
    nome: c.commit.author.name,
    data: c.commit.author.date,
    mensagem: c.commit.message.split("\n")[0].slice(0, 300),
    arquivos: (c.files ?? []).map((f) => ({ nome: f.filename, adicionadas: f.additions, removidas: f.deletions })),
  }));
}

/** Confere a assinatura do webhook (cabeçalho X-Hub-Signature-256) com o GITHUB_WEBHOOK_SECRET. */
export function assinaturaValida(corpo: string, assinatura: string | null) {
  const segredo = process.env.GITHUB_WEBHOOK_SECRET;
  if (!segredo || !assinatura?.startsWith("sha256=")) return false;
  const esperada = Buffer.from(`sha256=${createHmac("sha256", segredo).update(corpo).digest("hex")}`);
  const recebida = Buffer.from(assinatura);
  return esperada.length === recebida.length && timingSafeEqual(esperada, recebida);
}

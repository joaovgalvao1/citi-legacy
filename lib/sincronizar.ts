// Sincronização de um projeto com o repositório no GitHub: traz os commits novos e grava no banco,
// prontos para o IC, a participação, o calendário, a previsão e o resumo da IA.
// Usada pelo botão "Sincronizar com o GitHub", pelo webhook (a cada push) e pelo cron de sexta.
//
// Regras:
//   · autor   o commit é ligado ao membro pelo usuário do GitHub cadastrado no perfil; commits de
//             quem não está cadastrado ficam de fora (e são informados). Membro cadastrado que ainda
//             não está na equipe do projeto entra nela como "Colaborador (via GitHub)".
//   · etapa   o commit entra nas etapas cujos caminhos casam com algum arquivo alterado.
//   · linhas  efetivas ≈ adicionadas − removidas (o valor exato exigiria ler o histórico linha a linha).

import { and, eq, isNull, sql } from "drizzle-orm";
import { db, esquema } from "@/db/conexao";
import { buscarCommitsNovos } from "./github";

const { commits, etapas, membrosProjeto, pessoas, projetos } = esquema;

/** Glob simples dos caminhos das etapas: "src/estoque/**", "app/*.ts", "README.md". */
export function casaCaminho(arquivo: string, padrao: string) {
  const p = padrao.trim().replace(/^\.\//, "");
  if (!p.includes("*")) return arquivo === p || arquivo.startsWith(p.endsWith("/") ? p : `${p}/`);
  const regex = p
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*\//g, "§DIR§")
    .replace(/\*\*/g, "§TUDO§")
    .replace(/\*/g, "[^/]*")
    .replace(/§DIR§/g, "(?:.*/)?")
    .replace(/§TUDO§/g, ".*");
  return new RegExp(`^${regex}$`).test(arquivo);
}

/** Data ISO (UTC) no horário de Recife, no formato dos commits do app ("2026-11-19T21:04:00-03:00"). */
const horaRecife = (iso: string) => `${new Date(new Date(iso).getTime() - 3 * 3600000).toISOString().slice(0, 19)}-03:00`;

export type ResultadoSincronizacao = {
  repositorio: string;
  novos: number;
  /** Autores sem cadastro (usuário do GitHub ou nome), com quantos commits ficaram de fora. */
  semCadastro: { autor: string; commits: number }[];
  /** Membros que entraram na equipe por terem commits no repositório. */
  adicionadosNaEquipe: string[];
};

export async function sincronizarProjeto(projetoId: string): Promise<ResultadoSincronizacao> {
  const [projeto] = await db.select().from(projetos).where(eq(projetos.id, projetoId));
  if (!projeto?.repositorio) throw new Error("Este projeto não tem repositório vinculado.");

  const [etapasDoProjeto, cadastrados, equipe, existentes] = await Promise.all([
    db.select().from(etapas).where(eq(etapas.projetoId, projetoId)),
    db.select().from(pessoas).where(isNull(pessoas.apagadoEm)),
    db.select().from(membrosProjeto).where(eq(membrosProjeto.projetoId, projetoId)),
    db.select({ hash: commits.hash }).from(commits).where(eq(commits.projetoId, projetoId)),
  ]);

  const novos = await buscarCommitsNovos(projeto.repositorio, new Set(existentes.map((c) => c.hash)));
  const porLogin = new Map(cadastrados.filter((p) => p.github).map((p) => [p.github!.toLowerCase(), p]));
  const naEquipe = new Set(equipe.map((m) => m.pessoaId));
  const semCadastro = new Map<string, number>();
  const entrar: { id: string; nome: string }[] = [];

  const linhas = novos.flatMap((c) => {
    const pessoa = c.login ? porLogin.get(c.login.toLowerCase()) : undefined;
    if (!pessoa) {
      const quem = c.login ?? c.nome;
      semCadastro.set(quem, (semCadastro.get(quem) ?? 0) + 1);
      return [];
    }
    if (!naEquipe.has(pessoa.id)) {
      naEquipe.add(pessoa.id);
      entrar.push({ id: pessoa.id, nome: pessoa.nome });
    }
    const arquivos = c.arquivos.map((f) => f.nome);
    const adicionadas = c.arquivos.reduce((s, f) => s + f.adicionadas, 0);
    const removidas = c.arquivos.reduce((s, f) => s + f.removidas, 0);
    return [
      {
        projetoId,
        hash: c.sha,
        autor: pessoa.id,
        data: horaRecife(c.data),
        mensagem: c.mensagem,
        arquivos,
        etapas: etapasDoProjeto.filter((e) => arquivos.some((a) => e.caminhos.some((g) => casaCaminho(a, g)))).map((e) => e.id),
        adicionadas,
        removidas,
        efetivas: Math.max(0, adicionadas - removidas),
      },
    ];
  });

  await db.transaction(async (tx) => {
    if (entrar.length) {
      const [{ ordem }] = await tx
        .select({ ordem: sql<number>`coalesce(max(${membrosProjeto.ordem}), -1)::int + 1` })
        .from(membrosProjeto)
        .where(eq(membrosProjeto.projetoId, projetoId));
      await tx
        .insert(membrosProjeto)
        .values(entrar.map((p, i) => ({ projetoId, pessoaId: p.id, papel: "Colaborador (via GitHub)", ordem: ordem + i })))
        .onConflictDoNothing();
    }
    for (let i = 0; i < linhas.length; i += 100) await tx.insert(commits).values(linhas.slice(i, i + 100)).onConflictDoNothing();
    await tx.update(projetos).set({ sincronizadoEm: new Date().toISOString() }).where(eq(projetos.id, projetoId));
  });

  return {
    repositorio: projeto.repositorio,
    novos: linhas.length,
    semCadastro: [...semCadastro].map(([autor, n]) => ({ autor, commits: n })),
    adicionadosNaEquipe: entrar.map((p) => p.nome),
  };
}

/** Projetos (fora da lixeira) ligados a um repositório ("dono/nome", sem diferenciar maiúsculas). */
export async function projetosDoRepositorio(repo: string) {
  const linhas = await db
    .select({ id: projetos.id })
    .from(projetos)
    .where(and(isNull(projetos.apagadoEm), sql`lower(${projetos.repositorio}) = lower(${repo})`));
  return linhas.map((l) => l.id);
}

/** Todos os projetos com repositório vinculado (para o cron). */
export async function projetosComRepositorio() {
  const linhas = await db
    .select({ id: projetos.id })
    .from(projetos)
    .where(and(isNull(projetos.apagadoEm), sql`${projetos.repositorio} is not null`));
  return linhas.map((l) => l.id);
}

/**
 * Recalcula a etapa de cada commit do projeto pelos caminhos atuais das etapas
 * (usado quando os caminhos mudam na edição do projeto). Devolve quantos commits mudaram.
 */
export async function reclassificarCommits(projetoId: string) {
  const [etapasDoProjeto, lista] = await Promise.all([
    db.select().from(etapas).where(eq(etapas.projetoId, projetoId)),
    db.select({ hash: commits.hash, arquivos: commits.arquivos, etapas: commits.etapas }).from(commits).where(eq(commits.projetoId, projetoId)),
  ]);
  let mudaram = 0;
  for (const c of lista) {
    const novas = etapasDoProjeto.filter((e) => c.arquivos.some((a) => e.caminhos.some((g) => casaCaminho(a, g)))).map((e) => e.id);
    if (novas.join() === c.etapas.join()) continue;
    await db.update(commits).set({ etapas: novas }).where(and(eq(commits.projetoId, projetoId), eq(commits.hash, c.hash)));
    mudaram++;
  }
  return mudaram;
}

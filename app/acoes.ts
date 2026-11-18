"use server";

// Ações do servidor (chamadas pelos componentes do navegador).

import { and, eq, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { db, esquema } from "@/db/conexao";
import { hoje } from "@/lib/hoje";
import { linhas, slug, validarProjeto, type ProjetoNovo } from "@/lib/novo-projeto";

const { clientes, etapas, membrosProjeto, projetos, resumos, tasks } = esquema;

/**
 * Marca ou desmarca uma task no banco. Vale para todos os usuários.
 * Marcar a última task conclui o projeto (entrega = hoje). Desmarcar uma task de um projeto
 * concluído assim reabre o projeto e descarta o resumo final, que seria gerado de novo.
 * Projetos históricos (concluídos sem ser pelas tasks) não mudam.
 */
export async function alternarTask(projetoId: string, etapaId: string, ordem: number, feita: boolean) {
  const [projeto] = await db.select().from(projetos).where(eq(projetos.id, projetoId));
  if (!projeto || (projeto.status === "concluido" && !projeto.concluidoPelasTasks)) return;

  await db
    .update(tasks)
    .set({ feita })
    .where(and(eq(tasks.projetoId, projetoId), eq(tasks.etapaId, etapaId), eq(tasks.ordem, ordem)));

  const todas = await db.select({ feita: tasks.feita }).from(tasks).where(eq(tasks.projetoId, projetoId));
  const tudoFeito = todas.length > 0 && todas.every((t) => t.feita);

  if (tudoFeito && projeto.status !== "concluido") {
    await db.update(projetos).set({ status: "concluido", entrega: hoje(), concluidoPelasTasks: true }).where(eq(projetos.id, projetoId));
  } else if (!tudoFeito && projeto.concluidoPelasTasks) {
    await db.update(projetos).set({ status: "andamento", entrega: null, concluidoPelasTasks: false }).where(eq(projetos.id, projetoId));
    await db.delete(resumos).where(and(eq(resumos.projetoId, projetoId), eq(resumos.tipo, "final")));
    updateTag("resumos");
  }

  // invalida o cache dos dados: a próxima leitura (inclusive desta página) já vem atualizada
  updateTag("dados");
}

/**
 * Cadastra um projeto novo (em andamento, sem commits ainda) com equipe, etapas e tasks.
 * Devolve o id criado ou a lista de problemas encontrados.
 */
export async function criarProjeto(p: ProjetoNovo): Promise<{ id: string } | { erros: string[] }> {
  const erros = validarProjeto(p);
  if (erros.length) return { erros };

  // id do projeto: slug do nome, com sufixo se já existir
  const base = slug(p.nome) || "projeto";
  const existentes = new Set((await db.select({ id: projetos.id }).from(projetos)).map((r) => r.id));
  let id = base;
  for (let i = 2; existentes.has(id); i++) id = `${base}-${i}`;

  await db.transaction(async (tx) => {
    let clienteId = p.clienteId;
    if (!clienteId) {
      clienteId = slug(p.clienteNovo) || "cliente";
      await tx
        .insert(clientes)
        .values({ id: clienteId, nome: p.clienteNovo.trim(), segmento: p.segmentoNovo.trim() || null })
        .onConflictDoNothing();
    }
    const [{ ordem }] = await tx.select({ ordem: sql<number>`coalesce(max(${projetos.ordem}), -1)::int + 1` }).from(projetos);
    await tx.insert(projetos).values({
      id,
      nome: p.nome.trim(),
      clienteId,
      descricao: p.descricao.trim(),
      contexto: p.contexto.trim() || null,
      status: "andamento",
      inicio: p.inicio,
      fimPrevisto: p.fimPrevisto,
      ordem,
    });
    await tx.insert(membrosProjeto).values(p.membros.map((m, i) => ({ projetoId: id, pessoaId: m.pessoaId, papel: m.papel.trim(), ordem: i })));
    await tx.insert(etapas).values(
      p.etapas.map((e, i) => ({
        projetoId: id,
        id: slug(e.nome),
        ordem: i,
        nome: e.nome.trim(),
        descricao: e.descricao.trim(),
        inicioPrevisto: e.inicioPrevisto,
        fimPrevisto: e.fimPrevisto,
        caminhos: linhas(e.caminhos),
      })),
    );
    await tx.insert(tasks).values(
      p.etapas.flatMap((e) => linhas(e.tasks).map((titulo, i) => ({ projetoId: id, etapaId: slug(e.nome), ordem: i, titulo, feita: false }))),
    );
  });

  updateTag("dados");
  return { id };
}

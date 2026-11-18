"use server";

// Ações do servidor (chamadas pelos componentes do navegador).

import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { db, esquema } from "@/db/conexao";
import { hoje } from "@/lib/hoje";

const { projetos, resumos, tasks } = esquema;

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

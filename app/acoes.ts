"use server";

// Ações do servidor (chamadas pelos componentes do navegador).

import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { db, esquema } from "@/db/conexao";

/** Marca ou desmarca uma task no banco. Vale para todos os usuários. */
export async function alternarTask(projetoId: string, etapaId: string, ordem: number, feita: boolean) {
  await db
    .update(esquema.tasks)
    .set({ feita })
    .where(and(eq(esquema.tasks.projetoId, projetoId), eq(esquema.tasks.etapaId, etapaId), eq(esquema.tasks.ordem, ordem)));
  // invalida o cache dos dados: a próxima leitura (inclusive desta página) já vem atualizada
  updateTag("dados");
}

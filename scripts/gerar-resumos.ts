// Gera o histórico inicial de resumos da IA e grava no banco.
//
//   npm run banco:resumos
//
// • Projetos em andamento: as últimas 4 semanas, da mais antiga para a mais recente, cada uma
//   usando os resumos anteriores como contexto (para não repetir informação).
// • Projetos concluídos: o resumo final (só se ainda não existir; --refazer-finais para refazer).
//
// --so-regras: refaz apenas os resumos que caíram no resumo automático (IA indisponível na hora).
//
// Usa a chave do .env.local. São ~18 pedidos à IA, com uma pausa entre eles para respeitar
// o limite por minuto do plano gratuito.

import { and, eq } from "drizzle-orm";
import { db, esquema } from "../db/conexao";
import { carregarCommits, carregarTudo } from "../data/carregar";
import { hoje } from "../lib/hoje";
import { inicioDaSemana } from "../lib/analise";
import { gerarResumoFinal, gerarResumoSemanal } from "../lib/resumo";

const SEMANAS = 4;
const PAUSA_MS = 5000;
const DIA = 86400000;
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const refazer = process.argv.includes("--refazer-finais");
  // semanas completas antes da data de referência: a última é a semana passada
  const ultima = inicioDaSemana(new Date(new Date(`${hoje()}T12:00:00Z`).getTime() - 7 * DIA).toISOString());
  const semanas = Array.from({ length: SEMANAS }, (_, i) =>
    new Date(new Date(`${ultima}T12:00:00Z`).getTime() - (SEMANAS - 1 - i) * 7 * DIA).toISOString().slice(0, 10),
  );

  if (process.argv.includes("--so-regras")) {
    const pendentes = await db.select().from(esquema.resumos).where(eq(esquema.resumos.fonte, "regras"));
    const { projetos } = await carregarTudo();
    for (const r of pendentes) {
      const projeto = projetos.find((p) => p.id === r.projetoId);
      if (!projeto) continue;
      const commits = await carregarCommits({ projetoId: projeto.id });
      const g = r.tipo === "final" ? await gerarResumoFinal(projeto, commits, true) : await gerarResumoSemanal(projeto, commits, r.semana);
      console.log(`${projeto.nome} · ${r.tipo === "final" ? "final" : `semana ${r.semana}`}: ${g?.fonte}${g?.modelo ? ` (${g.modelo})` : ""}${g?.aviso ? ` — ${g.aviso}` : ""}`);
      await esperar(PAUSA_MS);
    }
    process.exit(0);
  }

  for (const projeto of (await carregarTudo()).projetos) {
    const commits = await carregarCommits({ projetoId: projeto.id });
    if (projeto.status === "concluido") {
      const g = await gerarResumoFinal(projeto, commits, refazer);
      console.log(`${projeto.nome} · final: ${g ? `${g.fonte}${g.modelo ? ` (${g.modelo})` : ""}${g.aviso ? ` — ${g.aviso}` : ""}` : "já existia"}`);
      if (g) await esperar(PAUSA_MS);
      continue;
    }
    for (const semana of semanas) {
      const g = await gerarResumoSemanal(projeto, commits, semana);
      console.log(`${projeto.nome} · semana ${semana}: ${g.fonte}${g.modelo ? ` (${g.modelo})` : ""}${g.aviso ? ` — ${g.aviso}` : ""}`);
      await esperar(PAUSA_MS);
    }
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

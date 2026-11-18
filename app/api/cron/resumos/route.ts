// GET /api/cron/resumos — chamado pela Vercel Cron toda sexta-feira às 23h (horário de Brasília).
// Gera o resumo da semana de cada projeto em andamento (com a memória das semanas anteriores)
// e o resumo final dos projetos concluídos que ainda não têm um.
// Protegido por CRON_SECRET: a Vercel envia "Authorization: Bearer <CRON_SECRET>".

import { revalidateTag } from "next/cache";
import { obterCommits, obterProjetos } from "@/data";
import { inicioDaSemana } from "@/lib/analise";
import { gerarResumoFinal, gerarResumoSemanal } from "@/lib/resumo";

export async function GET(request: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || request.headers.get("authorization") !== `Bearer ${segredo}`) {
    return Response.json({ erro: "não autorizado" }, { status: 401 });
  }

  const semana = inicioDaSemana(new Date().toISOString());
  const relatorio: { projeto: string; tipo: string; fonte: string }[] = [];

  for (const projeto of await obterProjetos()) {
    const commits = await obterCommits({ projetoId: projeto.id });
    if (projeto.status === "concluido") {
      const g = await gerarResumoFinal(projeto, commits);
      if (g) relatorio.push({ projeto: projeto.id, tipo: "final", fonte: g.fonte });
    } else {
      const g = await gerarResumoSemanal(projeto, commits, semana);
      relatorio.push({ projeto: projeto.id, tipo: `semana ${semana}`, fonte: g.fonte });
    }
  }

  revalidateTag("resumos", "max");
  return Response.json({ semana, relatorio });
}

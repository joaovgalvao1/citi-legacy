// GET /api/cron/resumos — chamado pela Vercel Cron toda sexta-feira às 23h (horário de Brasília).
// Gera o resumo da semana de cada projeto em andamento (com a memória das semanas anteriores)
// e o resumo final dos projetos concluídos que ainda não têm um.
// Depois, envia o boletim semanal da empresa por e-mail (se RESEND_API_KEY e BOLETIM_PARA estiverem configurados).
// Protegido por CRON_SECRET: a Vercel envia "Authorization: Bearer <CRON_SECRET>".

import { revalidateTag } from "next/cache";
import { obterCommits, obterProjetos } from "@/data";
import { inicioDaSemana } from "@/lib/analise";
import { gerarResumoFinal, gerarResumoSemanal } from "@/lib/resumo";
import { carregarCommits, carregarResumos, carregarTudo } from "@/data/carregar";
import { montarBoletim } from "@/lib/boletim";
import { enviarBoletim } from "@/lib/email";
import { limparLixeira } from "@/app/acoes";
import { projetosComRepositorio, sincronizarProjeto } from "@/lib/sincronizar";

export async function GET(request: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || request.headers.get("authorization") !== `Bearer ${segredo}`) {
    return Response.json({ erro: "não autorizado" }, { status: 401 });
  }

  // repositórios no GitHub: traz os commits que o webhook possa ter perdido, antes dos resumos
  const github: { projeto: string; novos?: number; erro?: string }[] = [];
  for (const id of await projetosComRepositorio()) {
    try {
      github.push({ projeto: id, novos: (await sincronizarProjeto(id)).novos });
    } catch (e) {
      github.push({ projeto: id, erro: e instanceof Error ? e.message : "erro" });
    }
  }
  if (github.length) revalidateTag("dados", "max");

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

  // lixeira: apaga de vez os projetos apagados há 30 dias ou mais
  const apagadosDeVez = await limparLixeira();
  if (apagadosDeVez) revalidateTag("dados", "max");

  // boletim com os resumos recém-gerados (leitura direta do banco, sem o cache)
  const { projetos } = await carregarTudo();
  const resumos = Object.fromEntries(await Promise.all(projetos.map(async (p) => [p.id, await carregarResumos(p.id)] as const)));
  const email = await enviarBoletim(montarBoletim(projetos, resumos, await carregarCommits({}))).catch((e: Error) => ({
    enviado: false,
    detalhe: e.message,
  }));

  return Response.json({ semana, relatorio, email, apagadosDeVez, github });
}

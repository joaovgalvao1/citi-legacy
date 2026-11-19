// GET /api/cron/resumos — chamado pela Vercel Cron toda sexta-feira, em duas etapas (horário de Brasília):
//
//   23h00  sincroniza os repositórios do GitHub, limpa a lixeira e gera os resumos que couberem no tempo
//   23h30  (?etapa=pendentes) gera os que ficaram pendentes (sem resumo ou com o resumo automático,
//          porque a IA estava sobrecarregada) e envia o boletim semanal por e-mail
//
// Os pedidos à IA respeitam o limite do plano gratuito (um a cada 4,5 s, com novas tentativas se a IA
// estiver sobrecarregada) e o tempo máximo da função; projeto que já tem resumo feito pela IA é pulado.
// Protegido por CRON_SECRET: a Vercel envia "Authorization: Bearer <CRON_SECRET>".

import { revalidateTag } from "next/cache";
import { inicioDaSemana } from "@/lib/analise";
import { definirPrazoIA, gerarResumoFinal, gerarResumoSemanal, resumoPronto } from "@/lib/resumo";
import { carregarCommits, carregarResumos, carregarTudo } from "@/data/carregar";
import { montarBoletim } from "@/lib/boletim";
import { enviarBoletim } from "@/lib/email";
import { limparLixeira } from "@/app/acoes";
import { projetosComRepositorio, sincronizarProjeto } from "@/lib/sincronizar";

// tempo máximo da função na Vercel (plano gratuito); os pedidos à IA param 5 s antes
export const maxDuration = 60;
const ORCAMENTO_MS = 55000;

export async function GET(request: Request) {
  const inicio = Date.now();
  definirPrazoIA(inicio + ORCAMENTO_MS);
  const segredo = process.env.CRON_SECRET;
  if (!segredo || request.headers.get("authorization") !== `Bearer ${segredo}`) {
    return Response.json({ erro: "não autorizado" }, { status: 401 });
  }
  const pendentes = new URL(request.url).searchParams.get("etapa") === "pendentes";

  // 1ª etapa: repositórios do GitHub (commits que o webhook possa ter perdido) e lixeira
  const github: { projeto: string; novos?: number; erro?: string }[] = [];
  let apagadosDeVez = 0;
  if (!pendentes) {
    for (const id of await projetosComRepositorio()) {
      try {
        github.push({ projeto: id, novos: (await sincronizarProjeto(id)).novos });
      } catch (e) {
        github.push({ projeto: id, erro: e instanceof Error ? e.message : "erro" });
      }
    }
    apagadosDeVez = await limparLixeira();
    if (github.length || apagadosDeVez) revalidateTag("dados", "max");
  }

  // resumos: só os que ainda não foram feitos pela IA, enquanto houver tempo
  const semana = inicioDaSemana(new Date().toISOString());
  const relatorio: { projeto: string; tipo: string; fonte: string }[] = [];
  const faltaram: string[] = [];
  const { projetos: atuais } = await carregarTudo();
  for (const projeto of atuais) {
    const final = projeto.status === "concluido";
    if (await resumoPronto(projeto.id, final ? "final" : "semanal", final ? "" : semana)) continue;
    if (Date.now() - inicio > ORCAMENTO_MS - 20000) {
      faltaram.push(projeto.id); // fica para a etapa das 23h30
      continue;
    }
    const commits = await carregarCommits({ projetoId: projeto.id });
    const g = final ? await gerarResumoFinal(projeto, commits, true) : await gerarResumoSemanal(projeto, commits, semana);
    if (g) relatorio.push({ projeto: projeto.id, tipo: final ? "final" : `semana ${semana}`, fonte: g.fonte });
  }
  revalidateTag("resumos", "max");

  // 2ª etapa: boletim por e-mail, com os resumos já completos
  let email: { enviado: boolean; detalhe: string } | null = null;
  if (pendentes) {
    const { projetos } = await carregarTudo();
    const resumos = Object.fromEntries(await Promise.all(projetos.map(async (p) => [p.id, await carregarResumos(p.id)] as const)));
    email = await enviarBoletim(montarBoletim(projetos, resumos, await carregarCommits({}))).catch((e: Error) => ({
      enviado: false,
      detalhe: e.message,
    }));
  }

  return Response.json({ etapa: pendentes ? "pendentes" : "principal", semana, relatorio, faltaram, email, apagadosDeVez, github });
}

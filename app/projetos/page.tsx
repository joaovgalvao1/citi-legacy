// Lista de todos os projetos da empresa: indicadores da semana no topo e os cards dos projetos.

import { obterCommits, obterProjetos, type Etapa, type Projeto } from "@/data";
import { formatarData } from "@/data/formatos";
import { somarDias } from "@/lib/hoje";
import { previsaoProjeto, textoPrevisao } from "@/lib/previsao";
import { alertaDoCard, duracaoEmMeses, nivelEtapa, nivelProjeto, progressoProjeto, rotuloNivelProjeto, statusEtapa, statusProjeto, textoPrazo } from "@/lib/status";
import { corDoMembro } from "@/components/graficos/cores";
import { ListaProjetos, type ResumoProjeto } from "@/components/projetos/lista";
import { BotaoLink } from "@/components/ui";

const iniciais = (nome: string) =>
  nome
    .split(" ")
    .filter((p) => p.length > 2 || p === nome)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

/** Cor do segmento da etapa na barra do card: não iniciada (vazia), atrasada, atenção ou em dia/concluída. */
function tomDoSegmento(p: Projeto, e: Etapa): ResumoProjeto["etapas"][number]["tom"] {
  if (e.progresso === 0 && statusEtapa(p, e) !== "Atrasada") return "vazia";
  const n = nivelEtapa(p, e);
  return n === "neutro" ? "verde" : n;
}

function Indicador({ valor, rotulo, cor = "text-branco" }: { valor: number; rotulo: string; cor?: string }) {
  return (
    <div className="rounded-xl border border-linha bg-white px-4 py-3.5">
      <p className={`dado text-[28px] leading-none font-bold ${cor}`}>{valor}</p>
      <p className="mt-2 text-xs text-gray-600">{rotulo}</p>
    </div>
  );
}

export default async function Projetos() {
  const [projetos, commits] = await Promise.all([obterProjetos(), obterCommits({})]);
  const hoje = projetos[0]?.hoje ?? "";
  const semanaPassada = somarDias(hoje, -7);
  const andamento = projetos.filter((p) => p.status !== "concluido");

  // indicadores: últimos 7 dias
  const atrasados = andamento.filter((p) => statusProjeto(p) === "Atrasado").length;
  const entregasSemana = andamento.reduce(
    (s, p) => s + p.etapas.reduce((n, e) => n + e.tasks.filter((t) => t.feitaEm && t.feitaEm > semanaPassada && t.feitaEm <= hoje).length, 0),
    0,
  );
  const commitsSemana = commits.filter((c) => c.data.slice(0, 10) > semanaPassada && c.data.slice(0, 10) <= hoje).length;

  // resumo calculado no servidor: o navegador recebe só o necessário para os cards
  const resumos: ResumoProjeto[] = projetos.map((p) => {
    const meses = duracaoEmMeses(p);
    return {
      id: p.id,
      nome: p.nome,
      cliente: p.cliente.split(" · ")[0],
      subtitulo: p.cliente.split(" · ").slice(1).join(" · "),
      status: statusProjeto(p),
      nivel: nivelProjeto(p),
      rotulo: rotuloNivelProjeto(p),
      progresso: progressoProjeto(p),
      prazo: textoPrazo(p),
      alerta: alertaDoCard(p),
      etapas: p.etapas.map((e) => ({ nome: e.nome, progresso: e.progresso, tom: tomDoSegmento(p, e) })),
      etapasConcluidas: p.etapas.filter((e) => e.progresso >= 100).length,
      previsao: textoPrevisao(previsaoProjeto(p)),
      membros: p.membros.map((m) => ({ id: m.id, nome: m.nome, iniciais: iniciais(m.nome), cor: corDoMembro(p, m.id) })),
      entrega: p.entrega ? `Entregue em ${formatarData(p.entrega)} · ${meses} ${meses === 1 ? "mês" : "meses"}` : null,
      resultado: p.resumoResultado ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
        <div className="flex flex-wrap gap-2">
          <BotaoLink href="/exportar/boletim" variante="secundario">
            Boletim da semana (PDF)
          </BotaoLink>
          <BotaoLink href="/projetos/novo">+ Novo projeto</BotaoLink>
        </div>
      </div>

      <section aria-label="Indicadores da semana" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Indicador valor={andamento.length} rotulo="projetos em andamento" />
        <Indicador valor={atrasados} rotulo="projetos atrasados" cor={atrasados ? "text-vermelho" : "text-branco"} />
        <Indicador valor={entregasSemana} rotulo="tasks entregues na semana" />
        <Indicador valor={commitsSemana} rotulo="commits na semana" cor="text-verde" />
      </section>

      <ListaProjetos projetos={resumos} />
    </div>
  );
}

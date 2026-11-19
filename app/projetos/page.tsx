// Lista de todos os projetos da empresa: indicadores da semana no topo e os cards dos projetos.

import { obterCommits, obterLixeira, obterProjetos, obterResumos } from "@/data";
import { montarBoletim } from "@/lib/boletim";
import { formatarData } from "@/data/formatos";
import { previsaoProjeto, textoPrevisao } from "@/lib/previsao";
import { alertaDoCard, duracaoEmMeses, nivelProjeto, progressoProjeto, rotuloNivelProjeto, statusProjeto, textoPrazo, tomSegmentoEtapa } from "@/lib/status";
import { corDoMembro } from "@/components/graficos/cores";
import { ListaProjetos, type ResumoProjeto } from "@/components/projetos/lista";
import { BotaoLink, TituloPagina } from "@/components/ui";

const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

const iniciais = (nome: string) =>
  nome
    .split(" ")
    .filter((p) => p.length > 2 || p === nome)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

/** Indicador no estilo do site do CITi ("+30 anos de mercado"): número grande e legenda com a palavra-chave em negrito. */
function Indicador({ valor, destaque, resto, cor = "text-branco" }: { valor: number; destaque: string; resto: string; cor?: string }) {
  return (
    <div className="rounded-xl border border-linha bg-white px-5 py-4">
      <p className={`text-[44px] leading-[0.9] font-bold tracking-[-0.04em] tabular-nums sm:text-[52px] ${cor}`}>{valor}</p>
      <p className="mt-2.5 text-sm">
        <span className="font-semibold text-branco">{destaque}</span> <span className="text-gray-600">{resto}</span>
      </p>
    </div>
  );
}

export default async function Projetos() {
  const [projetos, commits, lixeira] = await Promise.all([obterProjetos(), obterCommits({}), obterLixeira()]);
  // indicadores da mesma semana do resumo da IA e do boletim (a semana fechada mais recente),
  // para o painel, os resumos e o boletim contarem a mesma história
  const listas = await Promise.all(projetos.map((p) => obterResumos(p.id)));
  const { semana, fimSemana, numeros } = montarBoletim(projetos, Object.fromEntries(projetos.map((p, i) => [p.id, listas[i]])), commits);

  // resumo calculado no servidor: o navegador recebe só o necessário para os cards
  const resumos: ResumoProjeto[] = projetos.map((p) => {
    const meses = duracaoEmMeses(p);
    const previsao = previsaoProjeto(p);
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
      etapas: p.etapas.map((e) => ({ nome: e.nome, progresso: e.progresso, tom: tomSegmentoEtapa(p, e) })),
      etapasConcluidas: p.etapas.filter((e) => e.progresso >= 100).length,
      previsao: textoPrevisao(previsao),
      // a etapa que empurra a entrega para depois do prazo
      gargalo: previsao.tipo === "prevista" && !previsao.noPrazo ? previsao.gargalo.nome : null,
      membros: p.membros.map((m) => ({ id: m.id, nome: m.nome, iniciais: iniciais(m.nome), cor: corDoMembro(p, m.id) })),
      entrega: p.entrega ? `Entregue em ${formatarData(p.entrega)} · ${meses} ${meses === 1 ? "mês" : "meses"}` : null,
      resultado: p.resumoResultado ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <TituloPagina rotulo={`Semana de ${ddmm(semana)} a ${ddmm(fimSemana)}`} fino="Projetos" destaque="em andamento." />
        <div className="flex flex-wrap gap-2">
          <BotaoLink href="/reuniao" variante="secundario">
            ▶ Apresentar
          </BotaoLink>
          <BotaoLink href="/exportar/boletim" variante="secundario">
            Boletim da semana (PDF)
          </BotaoLink>
          <BotaoLink href="/projetos/novo">+ Novo projeto</BotaoLink>
        </div>
      </div>

      <section aria-label="Indicadores da semana" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Indicador valor={numeros.andamento} destaque="projetos" resto="em andamento" />
        <Indicador
          valor={numeros.atrasados}
          destaque={numeros.atrasados === 1 ? "atrasado" : "atrasados"}
          resto="no momento"
          cor={numeros.atrasados ? "text-vermelho" : "text-branco"}
        />
        <Indicador valor={numeros.tasksSemana} destaque="tasks" resto="entregues na semana" />
        <Indicador valor={numeros.commitsSemana} destaque="commits" resto="na semana" cor="text-verde" />
      </section>

      <ListaProjetos projetos={resumos} naLixeira={lixeira.length} />
    </div>
  );
}

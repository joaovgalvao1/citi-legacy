// Lista de todos os projetos da empresa: indicadores da semana no topo e os cards dos projetos.

import { obterCommits, obterLixeira, obterProjetos, obterResumos } from "@/data";
import { montarBoletim } from "@/lib/boletim";
import { formatarData } from "@/data/formatos";
import { previsaoProjeto, textoPrevisao } from "@/lib/previsao";
import {
  alertaDoCard,
  duracaoEmMeses,
  nivelProjeto,
  progressoProjeto,
  rotuloNivelProjeto,
  statusProjeto,
  textoPrazo,
  tomSegmentoEtapa,
} from "@/lib/status";
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

/** Indicador compacto da faixa da semana: número e legenda numa linha. */
function Indicador({ valor, rotulo, cor = "text-branco" }: { valor: number; rotulo: string; cor?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className={`text-2xl leading-none font-bold tracking-[-0.03em] tabular-nums ${cor}`}>{valor}</span>
      <span className="text-sm text-gray-600">{rotulo}</span>
    </div>
  );
}

const DIAS_PULSO = 28;
const somarDias = (iso: string, n: number) => new Date(new Date(`${iso}T12:00:00Z`).getTime() + n * 86400000).toISOString().slice(0, 10);

/** Ritmo recente: compara os últimos 7 dias com a média das 3 semanas anteriores. */
function ritmoDoPulso(pulso: number[], diasSemCommit: number): string {
  if (diasSemCommit >= 7) return `parado há ${diasSemCommit} dias`;
  const ultima = pulso.slice(-7).reduce((s, v) => s + v, 0);
  const antes = pulso.slice(0, -7).reduce((s, v) => s + v, 0) / 3;
  if (antes < 1 && ultima >= 3) return "acelerando";
  if (ultima >= antes * 1.6 && ultima >= 4) return "acelerando";
  if (ultima <= antes * 0.5) return "ritmo caindo";
  return "ritmo firme";
}

export default async function Projetos() {
  const [projetos, commits, lixeira] = await Promise.all([obterProjetos(), obterCommits({}), obterLixeira()]);
  // indicadores da mesma semana do resumo da IA e do boletim (a semana fechada mais recente),
  // para o painel, os resumos e o boletim contarem a mesma história
  const listas = await Promise.all(projetos.map((p) => obterResumos(p.id)));
  const { semana, fimSemana, numeros } = montarBoletim(projetos, Object.fromEntries(projetos.map((p, i) => [p.id, listas[i]])), commits);

  // pulso: commits por dia nas últimas 4 semanas (até hoje), por projeto
  const hoje = projetos[0]?.hoje ?? new Date().toISOString().slice(0, 10);
  const dias = Array.from({ length: DIAS_PULSO }, (_, i) => somarDias(hoje, i - DIAS_PULSO + 1));
  const porProjetoDia = new Map<string, number>();
  const ultimoCommit = new Map<string, string>();
  for (const c of commits) {
    const dia = c.data.slice(0, 10);
    if (dia > hoje) continue;
    porProjetoDia.set(`${c.projetoId}|${dia}`, (porProjetoDia.get(`${c.projetoId}|${dia}`) ?? 0) + 1);
    if (dia > (ultimoCommit.get(c.projetoId) ?? "")) ultimoCommit.set(c.projetoId, dia);
  }

  // resumo calculado no servidor: o navegador recebe só o necessário para os cards
  const resumos: ResumoProjeto[] = projetos.map((p) => {
    const meses = duracaoEmMeses(p);
    const previsao = previsaoProjeto(p);
    const pulso = dias.map((d) => porProjetoDia.get(`${p.id}|${d}`) ?? 0);
    const ultimo = ultimoCommit.get(p.id);
    const semCommit = ultimo ? Math.round((Date.parse(`${hoje}T12:00:00Z`) - Date.parse(`${ultimo}T12:00:00Z`)) / 86400000) : DIAS_PULSO;
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
      entregaPrevista: previsao.tipo === "prevista" ? ddmm(previsao.data) : null,
      pulso,
      ritmo: ritmoDoPulso(pulso, semCommit),
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

      <section
        aria-label="Indicadores da semana"
        className="flex flex-wrap items-baseline gap-x-8 gap-y-3 rounded-xl border border-linha bg-white/60 px-5 py-3.5"
      >
        <Indicador valor={numeros.andamento} rotulo="em andamento" />
        <Indicador
          valor={numeros.atrasados}
          rotulo={numeros.atrasados === 1 ? "atrasado" : "atrasados"}
          cor={numeros.atrasados ? "text-vermelho" : "text-branco"}
        />
        <Indicador valor={numeros.tasksSemana} rotulo="tasks na semana" />
        <Indicador valor={numeros.commitsSemana} rotulo="commits na semana" cor="text-verde" />
      </section>

      <ListaProjetos projetos={resumos} naLixeira={lixeira.length} dias={dias} />
    </div>
  );
}

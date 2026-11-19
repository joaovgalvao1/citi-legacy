import type { ReactNode } from "react";
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
import { Orbitas } from "@/components/entrada/fundo";
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

/** Indicador no estilo do site do CITi ("+30 anos de mercado"): número grande, legenda e um mini gráfico. */
function Indicador({
  valor,
  destaque,
  resto,
  cor = "text-branco",
  alerta = false,
  children,
}: {
  valor: number;
  destaque: string;
  resto: string;
  cor?: string;
  alerta?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`flex flex-col rounded-xl border px-5 py-4 ${alerta ? "border-vermelho/35 bg-[#1a1111]" : "border-linha bg-white"}`}>
      <p className={`text-[44px] leading-[0.9] font-bold tracking-[-0.04em] tabular-nums sm:text-[52px] ${cor}`}>{valor}</p>
      <p className="mt-2.5 text-sm">
        <span className="font-semibold text-branco">{destaque}</span> <span className="text-gray-600">{resto}</span>
      </p>
      {children && <div className="mt-auto pt-3">{children}</div>}
    </div>
  );
}

const SEMANA_DIAS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];

/** Barrinhas por dia da semana (tasks entregues). */
function BarrasDaSemana({ valores, dias }: { valores: number[]; dias: string[] }) {
  const max = Math.max(1, ...valores);
  return (
    <div className="flex h-6 items-end gap-1" aria-hidden="true">
      {valores.map((v, i) => (
        <span
          key={dias[i]}
          title={`${SEMANA_DIAS[i]} ${ddmm(dias[i])} · ${v}`}
          className={`flex-1 rounded-sm ${v ? "bg-verde" : "bg-branco/10"}`}
          style={{ height: `${v ? 25 + (75 * v) / max : 12}%` }}
        />
      ))}
    </div>
  );
}

/** Linha do ritmo da semana (commits por dia). */
function LinhaDaSemana({ valores }: { valores: number[] }) {
  const max = Math.max(1, ...valores);
  const pontos = valores.map((v, i) => `${((i / (valores.length - 1)) * 100).toFixed(1)},${(22 - (v / max) * 18).toFixed(1)}`).join(" ");
  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="block h-6 w-full" aria-hidden="true">
      <polyline points={pontos} fill="none" stroke="#00DB58" strokeWidth="1.75" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const iniciaisCliente = (nome: string) =>
  nome
    .replace(/[^\p{L}\p{N} ]/gu, " ")
    .split(" ")
    .filter((p) => p.length > 1)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

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
      monograma: iniciaisCliente(p.cliente.split(" · ")[0]) || iniciaisCliente(p.nome),
      // a etapa que empurra a entrega para depois do prazo
      gargalo: previsao.tipo === "prevista" && !previsao.noPrazo ? previsao.gargalo.nome : null,
      membros: p.membros.map((m) => ({ id: m.id, nome: m.nome, iniciais: iniciais(m.nome), cor: corDoMembro(p, m.id), github: m.github })),
      entrega: p.entrega ? `Entregue em ${formatarData(p.entrega)} · ${meses} ${meses === 1 ? "mês" : "meses"}` : null,
      resultado: p.resumoResultado ?? null,
    };
  });

  // mini gráficos dos indicadores (a mesma semana do boletim)
  const diasSemana = Array.from({ length: 7 }, (_, i) => somarDias(semana, i));
  const tasksPorDia = diasSemana.map(
    (d) => projetos.flatMap((p) => p.etapas.flatMap((e) => e.tasks)).filter((t) => t.feita && t.feitaEm?.slice(0, 10) === d).length,
  );
  const commitsPorDia = diasSemana.map((d) => commits.filter((c) => c.data.slice(0, 10) === d).length);
  const emAndamento = resumos.filter((r) => r.status !== "Concluído");
  const porNivel = (["vermelho", "ambar", "verde"] as const).map((n) => ({ n, qtd: emAndamento.filter((r) => r.nivel === n).length }));
  const atrasado = emAndamento.find((r) => r.status === "Atrasado");

  // destaque: o projeto atrasado mais grave, com o resumo da IA da semana (o que travou e o que fazer primeiro)
  const critico = emAndamento.filter((r) => r.nivel === "vermelho").sort((a, b) => a.progresso - b.progresso)[0];
  const resumoCritico = critico ? listas[projetos.findIndex((p) => p.id === critico.id)].find((r) => r.tipo === "semanal") : undefined;
  const parte = (re: RegExp) => resumoCritico?.secoes.find((s) => re.test(s.titulo))?.itens[0] ?? null;
  const destaque = critico
    ? {
        id: critico.id,
        travou: parte(/travou/i),
        primeiro: parte(/fazer primeiro/i),
        ia: resumoCritico ? resumoCritico.fonte !== "regras" : false,
      }
    : null;

  return (
    <div className="relative space-y-6">
      {/* órbitas da identidade, discretas, atrás do cabeçalho */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 right-0 h-[420px] w-full overflow-hidden"
        style={{ zIndex: -1 }}
      >
        <Orbitas id="projetos" brilho={0.1} className="-top-[260px] -right-[260px] w-[720px] opacity-60" />
      </div>
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
        <Indicador valor={numeros.andamento} destaque="projetos" resto="em andamento">
          <div className="flex h-1.5 gap-1" aria-label={porNivel.map((x) => `${x.qtd} ${x.n}`).join(", ")}>
            {porNivel
              .filter((x) => x.qtd)
              .map((x) => (
                <span
                  key={x.n}
                  className={`rounded-full ${{ vermelho: "bg-vermelho", ambar: "bg-ambar", verde: "bg-verde" }[x.n]}`}
                  style={{ flex: x.qtd }}
                />
              ))}
          </div>
        </Indicador>
        <Indicador
          valor={numeros.atrasados}
          destaque={numeros.atrasados === 1 ? "atrasado" : "atrasados"}
          resto="no momento"
          cor={numeros.atrasados ? "text-vermelho" : "text-branco"}
          alerta={numeros.atrasados > 0}
        >
          {atrasado && (
            <p className="dado truncate text-[11px] text-vermelho">
              {atrasado.nome} · {atrasado.prazo.replace("atrasado há ", "")}
            </p>
          )}
        </Indicador>
        <Indicador valor={numeros.tasksSemana} destaque="tasks" resto="entregues na semana">
          <BarrasDaSemana valores={tasksPorDia} dias={diasSemana} />
        </Indicador>
        <Indicador valor={numeros.commitsSemana} destaque="commits" resto="na semana" cor="text-verde">
          <LinhaDaSemana valores={commitsPorDia} />
        </Indicador>
      </section>

      <ListaProjetos projetos={resumos} naLixeira={lixeira.length} destaque={destaque} />
    </div>
  );
}

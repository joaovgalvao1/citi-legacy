// Modo Reunião: a apresentação da reunião semanal da diretoria, montada com os dados que o app já tem.
// Sem nova chamada à IA: usa os resumos da semana já gerados (a mesma semana do painel e do boletim).
//
// Slides: capa (indicadores) · panorama · um por projeto (atrasados → atenção → no prazo) · prioridades.

import type { Metadata } from "next";
import { obterCommits, obterProjetos, obterResumos, type Projeto } from "@/data";
import { montarBoletim } from "@/lib/boletim";
import { frasePrincipal, prioridadesDaSemana } from "@/lib/reuniao";
import { emPct, ranking } from "@/lib/indice";
import { BASE_DO_CALCULO } from "@/lib/previsao";
import { statusEtapa, tomSegmentoEtapa } from "@/lib/status";
import { corDoMembro } from "@/components/graficos/cores";
import { GanttCompacto } from "@/components/projeto/gantt";
import { Apresentacao } from "@/components/reuniao/apresentacao";

/** Dados da reunião: os projetos e o boletim da semana (a mesma do painel e dos resumos). */
async function carregarReuniao() {
  const [projetos, commits] = await Promise.all([obterProjetos(), obterCommits({})]);
  const listas = await Promise.all(projetos.map((p) => obterResumos(p.id)));
  const b = montarBoletim(projetos, Object.fromEntries(projetos.map((p, i) => [p.id, listas[i]])), commits);
  return { projetos, commits, b };
}

/**
 * O título vira o nome do arquivo ao salvar em PDF: "Reunião da diretoria - semana 09-11 a 15-11".
 * Datas com hífen, porque o navegador troca "/" por "_" no nome do arquivo.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { b } = await carregarReuniao();
  const dm = (iso: string) => `${iso.slice(8, 10)}-${iso.slice(5, 7)}`;
  return { title: { absolute: `Reunião da diretoria - semana ${dm(b.semana)} a ${dm(b.fimSemana)}` } };
}

const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const TOM_TEXTO = { verde: "text-verde", ambar: "text-ambar", vermelho: "text-vermelho" };
const TOM_FUNDO = { verde: "bg-verde", ambar: "bg-ambar", vermelho: "bg-vermelho", vazia: "" };
const TOM_SELO = {
  verde: "border-verde/50 bg-verde/10 text-verde",
  ambar: "border-ambar/50 bg-ambar/10 text-ambar",
  vermelho: "border-vermelho/50 bg-vermelho/10 text-vermelho",
};
const ROTULO = { verde: "No prazo", ambar: "Atenção", vermelho: "Atrasado" };

const iniciais = (nome: string) =>
  nome
    .split(" ")
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

function Selo({ tom }: { tom: keyof typeof ROTULO }) {
  return <span className={`inline-block rounded-full border px-[0.9cqw] py-[0.2cqw] text-[0.95cqw] font-semibold ${TOM_SELO[tom]}`}>{ROTULO[tom]}</span>;
}

function Barra({ projeto }: { projeto: Projeto }) {
  return (
    <div className="flex gap-[0.3cqw]">
      {projeto.etapas.map((e) => {
        const tom = tomSegmentoEtapa(projeto, e);
        return (
          <div key={e.id} className="h-[0.7cqw] flex-1 overflow-hidden rounded-full bg-branco/12">
            {tom !== "vazia" && <div className={`h-full rounded-full ${TOM_FUNDO[tom]}`} style={{ width: `${Math.max(e.progresso, 6)}%` }} />}
          </div>
        );
      })}
    </div>
  );
}

function Numero({ valor, destaque, resto, cor = "text-branco" }: { valor: number; destaque: string; resto: string; cor?: string }) {
  return (
    <div className="rounded-[1cqw] border border-branco/8 bg-[#141414] px-[1.6cqw] py-[1.4cqw]">
      <p className={`text-[5.2cqw] leading-[0.9] font-bold tracking-[-0.04em] tabular-nums ${cor}`}>{valor}</p>
      <p className="mt-[0.8cqw] text-[1.1cqw]">
        <b>{destaque}</b> <span className="text-branco/60">{resto}</span>
      </p>
    </div>
  );
}

export default async function Reuniao() {
  const { projetos, commits, b } = await carregarReuniao();
  const doId = (id: string) => projetos.find((p) => p.id === id)!;
  const semana = `${ddmm(b.semana)} a ${ddmm(b.fimSemana)}`;

  // 1. capa
  const capa = (
    <div className="flex h-full flex-col justify-center">
      <p className="dado text-[1cqw] tracking-[0.2em] text-verde uppercase">Reunião da diretoria</p>
      <h1 className="mt-[1cqw] text-[5.4cqw] leading-[1.02] tracking-[-0.04em]">
        <span className="font-light">Semana de</span> <span className="font-bold">{semana}.</span>
      </h1>
      <div className="mt-[3.5cqw] grid grid-cols-4 gap-[1.2cqw]">
        <Numero valor={b.numeros.andamento} destaque="projetos" resto="em andamento" />
        <Numero valor={b.numeros.atrasados} destaque={b.numeros.atrasados === 1 ? "atrasado" : "atrasados"} resto="no momento" cor="text-vermelho" />
        <Numero valor={b.numeros.tasksSemana} destaque="tasks" resto="entregues" />
        <Numero valor={b.numeros.commitsSemana} destaque="commits" resto="na semana" cor="text-verde" />
      </div>
    </div>
  );

  // 2. panorama
  const panorama = (
    <div className="flex h-full flex-col">
      <h2 className="text-[3cqw] leading-tight tracking-[-0.035em]">
        <span className="font-light">Panorama dos</span> <span className="font-bold">projetos.</span>
      </h2>
      <ul className="mt-[2.4cqw] flex flex-1 flex-col justify-center gap-[1.6cqw]">
        {b.projetos.map((item) => {
          const p = doId(item.id);
          return (
            <li key={item.id} className="grid grid-cols-[26%_1fr_22%] items-center gap-[2cqw] border-b border-branco/8 pb-[1.6cqw] last:border-0">
              <div className="min-w-0">
                <p className="truncate text-[1.6cqw] font-bold tracking-tight">{item.nome}</p>
                <p className="mt-[0.3cqw]">
                  <Selo tom={item.nivel} />
                </p>
              </div>
              <div>
                <Barra projeto={p} />
                <p className="dado mt-[0.6cqw] text-[0.95cqw] text-branco/55">
                  {p.etapas.filter((e) => e.progresso >= 100).length} de {p.etapas.length} etapas · {emPct(item.progresso)}
                </p>
              </div>
              <p className={`dado text-right text-[1.3cqw] font-semibold ${TOM_TEXTO[item.previsao.tom]}`}>{item.previsao.texto}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );

  // 3..N. um slide por projeto
  const porProjeto = b.projetos.map((item) => {
    const p = doId(item.id);
    const atrasadas = p.etapas.filter((e) => statusEtapa(p, e) === "Atrasada").length;
    const commitsSemana = commits.filter((c) => c.projetoId === p.id && c.data.slice(0, 10) >= b.semana && c.data.slice(0, 10) <= b.fimSemana).length;
    const top = ranking(p)[0];
    const { frase, tipo } = frasePrincipal(item);
    return (
      <div key={item.id} className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-[2cqw]">
          <div className="min-w-0">
            <Selo tom={item.nivel} />
            <h2 className="mt-[0.6cqw] truncate text-[3cqw] leading-tight font-bold tracking-[-0.035em]">{item.nome}</h2>
            <p className="text-[1.2cqw] text-branco/60">{item.cliente}</p>
          </div>
          <div className="text-right">
            <p className="text-[4.4cqw] leading-none font-bold tracking-[-0.04em] tabular-nums">{emPct(item.progresso)}</p>
            <p className="text-[1cqw] text-branco/55">concluído</p>
          </div>
        </div>

        <div className="mt-[1.6cqw] grid grid-cols-3 gap-[1cqw]">
          <div className="rounded-[0.8cqw] border border-branco/8 bg-[#141414] px-[1.2cqw] py-[0.9cqw]">
            <p className={`text-[2.4cqw] leading-none font-bold ${atrasadas ? "text-vermelho" : ""}`}>{atrasadas}</p>
            <p className="mt-[0.4cqw] text-[0.95cqw] text-branco/60">{atrasadas === 1 ? "etapa atrasada" : "etapas atrasadas"}</p>
          </div>
          <div className="rounded-[0.8cqw] border border-branco/8 bg-[#141414] px-[1.2cqw] py-[0.9cqw]">
            <p className="text-[2.4cqw] leading-none font-bold text-verde">{commitsSemana}</p>
            <p className="mt-[0.4cqw] text-[0.95cqw] text-branco/60">commits na semana</p>
          </div>
          <div className="rounded-[0.8cqw] border border-branco/8 bg-[#141414] px-[1.2cqw] py-[0.9cqw]">
            <p className="truncate text-[1.6cqw] leading-tight font-bold">{top ? `${top.membro.nome.split(" ")[0]} · ${emPct(top.ic)}` : "—"}</p>
            <p className="mt-[0.4cqw] text-[0.95cqw] text-branco/60">quem mais sabe do projeto</p>
          </div>
        </div>

        <div className="mt-[1.4cqw] min-h-0 flex-1">
          <GanttCompacto projeto={p} />
        </div>

        <div className="mt-[1cqw] grid grid-cols-[30%_1fr] items-stretch gap-[1.4cqw]">
          <div>
            <p className={`dado text-[1.5cqw] font-semibold ${TOM_TEXTO[item.previsao.tom]}`}>{item.previsao.texto}</p>
            <p className="mt-[0.3cqw] text-[0.9cqw] text-branco/50">{BASE_DO_CALCULO}</p>
          </div>
          {frase && (
            <div className="borda-ia rounded-[0.8cqw] px-[1.2cqw] py-[0.8cqw]">
              <p className="dado texto-ia text-[0.85cqw] font-semibold tracking-[0.16em] uppercase">✦ IA · {tipo}</p>
              <p className="mt-[0.3cqw] line-clamp-2 text-[1.15cqw] leading-snug">{frase}</p>
            </div>
          )}
        </div>
      </div>
    );
  });

  // último: prioridades da semana (o "O que fazer primeiro" de todos os projetos, sem nova chamada à IA)
  const prioridades = prioridadesDaSemana(b, projetos);
  const slidePrioridades = (
    <div className="flex h-full flex-col">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[3cqw] leading-tight tracking-[-0.035em]">
          <span className="font-light">Prioridades da</span> <span className="font-bold">semana.</span>
        </h2>
        <p className="dado texto-ia text-[0.95cqw] font-semibold tracking-[0.16em] uppercase">✦ Dos resumos da IA</p>
      </div>
      <ol className="mt-[1.4cqw] flex min-h-0 flex-1 flex-col gap-[0.7cqw]">
        {prioridades.map(({ texto, item, projeto, pessoas }, n) => (
          <li key={n} className="grid grid-cols-[3cqw_1fr_auto] items-center gap-[1.2cqw] border-b border-branco/8 pb-[0.7cqw] last:border-0">
            <span className="dado text-[1.4cqw] font-semibold text-branco/40">{String(n + 1).padStart(2, "0")}</span>
            <div className="min-w-0">
              <p className="line-clamp-2 text-[1.15cqw] leading-snug">{texto}</p>
              <p className={`mt-[0.2cqw] text-[0.85cqw] ${TOM_TEXTO[item.nivel]}`}>{item.nome}</p>
            </div>
            <div className="flex -space-x-[0.6cqw]">
              {pessoas.map((m) => (
                <span
                  key={m.id}
                  title={m.nome}
                  className="dado flex h-[2.4cqw] w-[2.4cqw] items-center justify-center rounded-full border-2 border-[#0a0a0a] text-[0.8cqw] font-semibold text-fundo"
                  style={{ backgroundColor: corDoMembro(projeto, m.id) }}
                >
                  {iniciais(m.nome)}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );

  return <Apresentacao data={ddmm(b.hoje)} slides={[capa, panorama, ...porProjeto, slidePrioridades]} />;
}

"use client";

// Linha do tempo (Gantt) com previsão de entrega, no topo da Visão geral.
//
// Uma linha por etapa, num eixo de tempo comum (meses no topo, linha de "hoje"):
//   concluída      pílula verde do início à conclusão
//   em execução    trilho do início até hoje, com o preenchimento verde proporcional ao %
//   atrasada       + faixa vermelha do prazo até hoje, contorno vermelho e selo "+X dias"
//   previsão       tracejado de hoje até a data prevista (vermelho se passa do prazo da etapa)
//   parada         "sem previsão · parada há X semanas" (sem ritmo nas últimas 4 semanas)
//   não iniciada   só o contorno tracejado da janela planejada
// O prazo de cada etapa é um traço branco. Previsão = ritmo das últimas 4 semanas (lib/previsao.ts).

import { useEffect, useRef } from "react";
import type { Etapa, Projeto } from "@/data";
import { emPct, lider } from "@/lib/indice";
import { BASE_DO_CALCULO, previsaoEtapa, previsaoProjeto, type PrevisaoEtapa } from "@/lib/previsao";
import { somarDias } from "@/lib/hoje";
import { diasEntre, textoEntrega } from "@/lib/status";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const COLUNA = 170; // largura da coluna dos nomes (px)

type Linha = {
  etapa: Etapa;
  inicio: string;
  previsao: PrevisaoEtapa;
  aberta: boolean;
  atrasada: boolean;
  quemSabe: { nome: string; ic: number } | null;
};

function montarLinhas(projeto: Projeto): Linha[] {
  return projeto.etapas.map((etapa) => {
    const previsao = previsaoEtapa(projeto, etapa);
    const aberta = previsao.tipo !== "concluida";
    // início real: o primeiro commit da etapa (sem commits, o início previsto)
    const inicio = etapa.primeiroCommit ?? etapa.inicioPrevisto;
    const top = lider(projeto, etapa.id);
    return {
      etapa,
      inicio,
      previsao,
      aberta,
      atrasada: aberta && previsao.tipo !== "nao-iniciada" && projeto.hoje > etapa.fimPrevisto,
      quemSabe: top ? { nome: top.membro.nome.split(" ")[0], ic: top.ic } : null,
    };
  });
}

/** Janela de tempo do gráfico: do início mais cedo até o mais tarde entre prazos, previsões, conclusões e hoje. */
function janelaDeTempo(projeto: Projeto, linhas: Linha[]) {
  const concluido = projeto.status === "concluido";
  const datas = [
    projeto.inicio,
    projeto.fimPrevisto,
    concluido ? (projeto.entrega ?? projeto.fimPrevisto) : projeto.hoje,
    ...linhas.flatMap((l) => [
      l.inicio,
      l.etapa.fimPrevisto,
      l.previsao.tipo === "prevista"
        ? l.previsao.data
        : l.previsao.tipo === "concluida"
          ? (l.previsao.data ?? l.etapa.fimPrevisto)
          : l.etapa.fimPrevisto,
    ]),
  ].sort();
  const de = somarDias(datas[0], -5);
  // folga no fim para o rótulo "prev. DD/MM" caber depois da última data
  const ate = somarDias(datas.at(-1)!, 30);
  const total = diasEntre(de, ate);
  const x = (iso: string) => `${(Math.max(0, Math.min(total, diasEntre(de, iso))) / total) * 100}%`;
  const largura = (a: string, b: string) => `${(Math.max(0, diasEntre(a, b)) / total) * 100}%`;

  // marcas de mês (dia 1 de cada mês dentro da janela)
  const meses: string[] = [];
  for (let ano = Number(de.slice(0, 4)), mes = Number(de.slice(5, 7)); ; mes === 12 ? ((ano += 1), (mes = 1)) : (mes += 1)) {
    const d = `${ano}-${String(mes).padStart(2, "0")}-01`;
    if (d > ate) break;
    if (d >= de) meses.push(d);
  }
  return { de, ate, total, x, largura, meses };
}

/**
 * Versão compacta para o Modo Reunião: as mesmas regras, sem rótulos de data, dicas nem legenda.
 * Ocupa a largura disponível (sem rolagem).
 */
export function GanttCompacto({ projeto }: { projeto: Projeto }) {
  const linhas = montarLinhas(projeto);
  const { x, largura, meses } = janelaDeTempo(projeto, linhas);
  const concluido = projeto.status === "concluido";
  return (
    <div className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0" style={{ left: "24%" }}>
        {meses.map((m) => (
          <div key={m} className="absolute inset-y-0 w-px bg-branco/5" style={{ left: x(m) }} />
        ))}
        {!concluido && <div className="absolute inset-y-0 z-10 w-px bg-branco/55" style={{ left: x(projeto.hoje) }} />}
      </div>
      <ul>
        {linhas.map((l) => (
          <LinhaEtapa key={l.etapa.id} l={l} hoje={projeto.hoje} concluido={concluido} x={x} largura={largura} compacto />
        ))}
      </ul>
    </div>
  );
}

export function Gantt({ projeto, aoSelecionar }: { projeto: Projeto; aoSelecionar: (etapaId: string) => void }) {
  const hoje = projeto.hoje;
  const concluido = projeto.status === "concluido";
  const previsto = previsaoProjeto(projeto);
  const linhas = montarLinhas(projeto);
  const rolagem = useRef<HTMLDivElement>(null);

  const { de, ate, total, x, largura, meses } = janelaDeTempo(projeto, linhas);

  const atrasoProjeto = previsto.tipo === "prevista" && !previsto.noPrazo;
  const brilho =
    concluido || (previsto.tipo === "prevista" && previsto.noPrazo)
      ? "rgb(0 219 88 / 0.14)"
      : previsto.tipo === "sem-previsao"
        ? "rgb(255 166 48 / 0.14)"
        : "rgb(255 59 59 / 0.16)";

  // em telas estreitas o gráfico rola na horizontal: já abre mostrando "hoje" (e a previsão logo depois)
  const posicaoHoje = diasEntre(de, concluido ? ate : hoje) / total;
  useEffect(() => {
    const el = rolagem.current;
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = COLUNA + (el.scrollWidth - COLUNA) * posicaoHoje - el.clientWidth * 0.6;
  }, [posicaoHoje]);

  return (
    <section className="anima-surgir relative overflow-hidden rounded-xl border border-linha bg-white p-5">
      {/* brilho num canto: vermelho se a entrega passa do prazo, verde se está no prazo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-96"
        style={{ background: `radial-gradient(closest-side, ${brilho}, transparent)` }}
      />

      {/* cabeçalho */}
      <div className="relative mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="rotulo">Linha do tempo</p>
          {concluido ? (
            <>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Entregue em <span className="text-verde">{ddmm(projeto.entrega ?? projeto.fimPrevisto)}</span>
              </h2>
              <p className="text-sm text-gray-600">
                prazo era {ddmm(projeto.fimPrevisto)} · {textoEntrega(projeto)}
              </p>
            </>
          ) : previsto.tipo === "sem-previsao" ? (
            <>
              <h2 className="text-2xl font-bold tracking-tight text-ambar sm:text-3xl">Sem previsão de entrega</h2>
              <p className="text-sm text-gray-600">
                nenhuma etapa aberta concluiu tasks nas últimas 4 semanas · prazo {ddmm(projeto.fimPrevisto)}
              </p>
            </>
          ) : previsto.tipo === "prevista" ? (
            <>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Entrega prevista para <span className={atrasoProjeto ? "text-vermelho" : "text-verde"}>{ddmm(previsto.data)}</span>
              </h2>
              <p className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-bold ${atrasoProjeto ? "bg-vermelho text-branco" : "bg-verde text-fundo"}`}
                >
                  {atrasoProjeto ? `${previsto.diasAlemDoPrazo} ${previsto.diasAlemDoPrazo === 1 ? "dia" : "dias"} de atraso` : "no prazo"}
                </span>
                prazo era {ddmm(projeto.fimPrevisto)} · {BASE_DO_CALCULO}
              </p>
            </>
          ) : null}
        </div>
        {previsto.tipo === "prevista" && atrasoProjeto && (
          <div className="sm:text-right">
            <p className="rotulo">Gargalo principal</p>
            <p className="mt-1 text-base font-semibold">{previsto.gargalo.nome}</p>
          </div>
        )}
      </div>

      {/* gráfico (rola na horizontal em telas estreitas) */}
      <div ref={rolagem} className="relative -mx-1 overflow-x-auto px-1 pb-1">
        <div className="relative min-w-[680px]">
          {/* eixo dos meses */}
          <div className="relative h-7" style={{ marginLeft: COLUNA }}>
            {meses.map((m) => (
              <span key={m} className="dado absolute top-1 -translate-x-1/2 text-[11px] text-gray-500" style={{ left: x(m) }}>
                {MESES[Number(m.slice(5, 7)) - 1]}
              </span>
            ))}
          </div>

          <div className="relative">
            {/* área do tempo: linhas verticais dos meses e de hoje, atravessando todas as etapas */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0" style={{ left: COLUNA }}>
              {meses.map((m) => (
                <div key={m} className="absolute inset-y-0 w-px bg-branco/5" style={{ left: x(m) }} />
              ))}
              {!concluido && (
                <div className="absolute inset-y-0 z-10 w-px bg-branco/55" style={{ left: x(hoje) }}>
                  <span className="dado absolute -top-7 left-1/2 -translate-x-1/2 rounded-full bg-branco px-2 py-0.5 text-[10px] font-semibold text-fundo">
                    hoje
                  </span>
                </div>
              )}
            </div>

            <ul>
              {linhas.map((l, i) => (
                <LinhaEtapa
                  key={l.etapa.id}
                  l={l}
                  hoje={hoje}
                  concluido={concluido}
                  x={x}
                  largura={largura}
                  aoSelecionar={aoSelecionar}
                  dicaAbaixo={i < 2}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* legenda */}
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-600" aria-label="Legenda da linha do tempo">
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-full bg-verde" /> concluído
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 overflow-hidden rounded-full bg-branco/12">
            <span className="block h-full w-1/2 bg-verde" />
          </span>
          em execução
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-sm bg-vermelho/30" /> período em atraso
        </li>
        <li className="flex items-center gap-1.5">
          <span className="w-5 border-t-2 border-dashed border-vermelho" /> previsão fora do prazo
        </li>
        <li className="flex items-center gap-1.5">
          <span className="w-5 border-t-2 border-dashed border-verde" /> previsão no prazo
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-0.5 bg-branco" /> prazo
        </li>
      </ul>
    </section>
  );
}

function LinhaEtapa({
  l,
  hoje,
  concluido,
  x,
  largura,
  aoSelecionar,
  dicaAbaixo = false,
  compacto = false,
}: {
  /** Nas primeiras linhas a dica abre para baixo (para cima, seria cortada pela borda do gráfico). */
  dicaAbaixo?: boolean;
  /** Modo Reunião: linha mais baixa, sem rótulos de data, dica nem clique. */
  compacto?: boolean;
  l: Linha;
  hoje: string;
  concluido: boolean;
  x: (iso: string) => string;
  largura: (a: string, b: string) => string;
  aoSelecionar?: (etapaId: string) => void;
}) {
  const { etapa, previsao: p } = l;
  const feitas = etapa.tasks.filter((t) => t.feita).length;
  const fim = p.tipo === "concluida" ? (p.data ?? etapa.fimPrevisto) : hoje;
  const diasAtraso = l.atrasada ? diasEntre(etapa.fimPrevisto, hoje) : 0;

  const dica = [
    `${etapa.nome}`,
    `início ${ddmm(l.inicio)} · prazo ${ddmm(etapa.fimPrevisto)}`,
    `${emPct(etapa.progresso)} · ${feitas} de ${etapa.tasks.length} tasks`,
    p.tipo === "prevista"
      ? `previsão ${ddmm(p.data)}${p.noPrazo ? " (no prazo)" : ` (+${p.diasAlemDoPrazo} dias)`}${p.base === "media" ? " · etapa contínua: ritmo médio das outras etapas" : ""}`
      : p.tipo === "parada"
        ? `sem previsão · parada há ${p.semanas} semanas`
        : p.tipo === "concluida"
          ? `concluída${p.data ? ` em ${ddmm(p.data)}` : ""}`
          : "não iniciada",
  ];

  const Elemento = compacto ? "div" : "button";
  return (
    <li>
      <Elemento
        {...(compacto
          ? { "aria-label": dica.join(" · ") }
          : {
              type: "button" as const,
              onClick: () => aoSelecionar?.(etapa.id),
              "aria-label": `${dica.join(" · ")}. Abrir tasks da etapa.`,
            })}
        className={`group relative flex w-full items-center text-left ${compacto ? "h-[2.9cqw]" : "h-14 cursor-pointer transition-colors hover:bg-branco/[0.03]"}`}
      >
        {/* nome e quem mais sabe */}
        <div className="shrink-0 pr-3" style={{ width: compacto ? "24%" : COLUNA }}>
          <p className={`truncate font-medium text-branco ${compacto ? "text-[1.05cqw]" : "text-[13px]"}`}>{etapa.nome}</p>
          {!compacto && (
            <p className="truncate text-[10px] text-gray-500">
              {l.quemSabe ? `quem mais sabe: ${l.quemSabe.nome} · ${emPct(l.quemSabe.ic)}` : "ainda sem commits"}
            </p>
          )}
        </div>

        {/* trilho do tempo */}
        <div className="relative h-full flex-1">
          {/* faixa vermelha do período em atraso (prazo → hoje) */}
          {l.atrasada && (
            <div
              className="absolute inset-y-1 bg-vermelho/16"
              style={{ left: x(etapa.fimPrevisto), width: largura(etapa.fimPrevisto, hoje) }}
            />
          )}

          {p.tipo === "nao-iniciada" ? (
            // só a janela planejada, tracejada
            <div
              className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full border border-dashed border-branco/35"
              style={{ left: x(etapa.inicioPrevisto), width: largura(etapa.inicioPrevisto, etapa.fimPrevisto) }}
            />
          ) : p.tipo === "concluida" || concluido ? (
            <div
              className="anima-barra absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-verde"
              style={{ left: x(l.inicio), width: largura(l.inicio, fim) }}
            />
          ) : (
            <>
              {/* trilho do início até hoje, com o % concluído em verde */}
              <div
                className="anima-barra absolute top-1/2 h-2.5 -translate-y-1/2 overflow-hidden rounded-full bg-branco/12"
                style={{ left: x(l.inicio), width: largura(l.inicio, hoje) }}
              >
                <div className="h-full rounded-full bg-verde" style={{ width: `${etapa.progresso}%` }} />
              </div>
              {/* contorno vermelho no trecho em atraso e selo "+X dias" */}
              {l.atrasada && (
                <>
                  <div
                    className="absolute top-1/2 h-[13px] -translate-y-1/2 rounded-r-full border-[1.5px] border-l-0 border-vermelho"
                    style={{ left: x(etapa.fimPrevisto), width: largura(etapa.fimPrevisto, hoje) }}
                  />
                  <span
                    className="dado absolute top-0.5 -translate-x-1/2 rounded-full bg-vermelho px-1.5 text-[10px] leading-4 font-bold text-branco"
                    style={{ left: `calc(${x(etapa.fimPrevisto)} + ${largura(etapa.fimPrevisto, hoje)} / 2)` }}
                  >
                    +{diasAtraso} dias
                  </span>
                </>
              )}
              {!compacto && (
                <span className="dado absolute bottom-0.5 text-[10px] text-gray-500" style={{ left: x(l.inicio) }}>
                  {emPct(etapa.progresso)}
                </span>
              )}
              {/* previsão: tracejado de hoje até a data prevista */}
              {p.tipo === "prevista" && (
                <>
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 border-t-2 border-dashed ${p.noPrazo ? "border-verde" : "border-vermelho"}`}
                    style={{ left: x(hoje), width: largura(hoje, p.data) }}
                  />
                  {!compacto && (
                    <span
                      className={`dado absolute top-0.5 ml-1.5 text-[10px] whitespace-nowrap ${p.noPrazo ? "text-verde" : "text-vermelho"}`}
                      style={{ left: x(p.data) }}
                    >
                      prev. {ddmm(p.data)}
                      {p.base === "media" && <span className="text-gray-500"> · média</span>}
                    </span>
                  )}
                </>
              )}
              {p.tipo === "parada" && (
                <span
                  className="dado absolute top-1/2 ml-2 -translate-y-1/2 text-[10px] whitespace-nowrap text-ambar"
                  style={{ left: x(hoje) }}
                >
                  {compacto ? "parada" : `sem previsão · parada há ${p.semanas} semanas`}
                </span>
              )}
            </>
          )}

          {/* prazo da etapa */}
          <div className="absolute top-1/2 h-5 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-branco" style={{ left: x(etapa.fimPrevisto) }} />

          {/* dica ao passar o mouse */}
          {!compacto && (
            <div
              className={`pointer-events-none absolute right-0 z-20 hidden w-60 ${dicaAbaixo ? "top-full mt-1" : "bottom-full mb-1"} rounded-lg border border-branco/12 bg-[#1f1f1f] px-3 py-2 text-[11px] leading-relaxed text-gray-700 shadow-2xl group-hover:block group-focus-visible:block`}
            >
              <p className="font-semibold text-branco">{dica[0]}</p>
              {dica.slice(1).map((t) => (
                <p key={t} className="dado">
                  {t}
                </p>
              ))}
              <p className="mt-1 text-verde">clique para ver as tasks →</p>
            </div>
          )}
        </div>
      </Elemento>
    </li>
  );
}

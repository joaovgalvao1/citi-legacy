"use client";

// Linha do tempo: commits por período (semana ou mês), empilhados por série (SVG próprio).
// As séries são os membros (painel e etapa) ou os projetos (página do membro).
// Passar o mouse num período mostra o detalhe; clicar na legenda destaca a série.

import { useState } from "react";
import type { Semana } from "@/data";
import { useDestaque } from "./destaque";

export type Serie = { id: string; nome: string; cor: string };

type Props = {
  series: Serie[];
  /** Um item por período; a chave "semana" é a data de início do período. */
  semanas: Semana[];
  titulo: string;
  periodo?: "semana" | "mes";
};

const L = 640; // largura do desenho (o SVG escala para a largura disponível)
const A = 200; // altura
const M = { topo: 10, dir: 8, base: 26, esq: 28 };

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function LinhaDoTempo({ series, semanas, titulo, periodo = "semana" }: Props) {
  const { membroId, alternar } = useDestaque();
  const [hover, setHover] = useState<number | null>(null);
  const ddmm = (iso: string) =>
    periodo === "mes" ? `${MESES[Number(iso.slice(5, 7)) - 1]}/${iso.slice(2, 4)}` : `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
  const cor = (id: string) => series.find((x) => x.id === id)?.cor ?? "#999";

  if (!semanas.length) return <p className="text-sm text-gray-500">Sem commits.</p>;
  const membros = series.filter((m) => semanas.some((s) => (s.commits[m.id] ?? 0) > 0));
  const totais = semanas.map((s) => membros.reduce((soma, m) => soma + (s.commits[m.id] ?? 0), 0));
  const max = Math.max(1, ...totais);
  const passoY = max <= 5 ? 1 : max <= 12 ? 2 : 5;
  const topoY = Math.ceil(max / passoY) * passoY;

  const areaL = L - M.esq - M.dir;
  const areaA = A - M.topo - M.base;
  const col = areaL / semanas.length;
  const larg = Math.min(24, col * 0.7);
  const y = (v: number) => M.topo + areaA - (v / topoY) * areaA;
  const ticks = Array.from({ length: topoY / passoY + 1 }, (_, i) => i * passoY);
  const cadaRotulo = Math.max(1, Math.ceil(semanas.length / 12));

  const total = totais.reduce((a, b) => a + b, 0);
  if (total === 0) return <p className="text-sm text-gray-500">Sem commits neste período.</p>;
  const unidade = periodo === "mes" ? "meses" : "semanas";
  const resumo = `${titulo}: ${total} commits em ${semanas.length} ${unidade}, de ${ddmm(semanas[0].semana)} a ${ddmm(semanas.at(-1)!.semana)}.`;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        {membros.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => alternar(m.id)}
            aria-pressed={membroId === m.id}
            className={`flex cursor-pointer items-center gap-1.5 ${membroId && membroId !== m.id ? "opacity-40" : ""}`}
          >
            <span className="inline-block h-2.5 w-2.5" style={{ backgroundColor: cor(m.id) }} />
            {m.nome}
          </button>
        ))}
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${L} ${A}`} className="h-auto w-full" role="img" aria-label={resumo}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={M.esq} x2={L - M.dir} y1={y(t)} y2={y(t)} stroke="#262626" strokeWidth={1} />
              <text x={M.esq - 6} y={y(t) + 3} textAnchor="end" fontSize={10} fill="#8a8a8a">
                {t}
              </text>
            </g>
          ))}

          {semanas.map((s, i) => {
            const x = M.esq + i * col + (col - larg) / 2;
            let acumulado = 0;
            return (
              <g key={s.semana}>
                {membros.map((m) => {
                  const v = s.commits[m.id] ?? 0;
                  if (!v) return null;
                  const y1 = y(acumulado + v);
                  const h = y(acumulado) - y1;
                  acumulado += v;
                  return (
                    <rect
                      key={m.id}
                      x={x}
                      y={y1}
                      width={larg}
                      height={Math.max(h - 1, 0.5)}
                      fill={cor(m.id)}
                      opacity={membroId && membroId !== m.id ? 0.2 : 1}
                    />
                  );
                })}
                {i % cadaRotulo === 0 && (
                  <text x={x + larg / 2} y={A - 8} textAnchor="middle" fontSize={10} fill="#8a8a8a">
                    {ddmm(s.semana)}
                  </text>
                )}
                {/* área invisível para o hover cobrir a coluna inteira */}
                <rect
                  x={M.esq + i * col}
                  y={M.topo}
                  width={col}
                  height={areaA}
                  fill={hover === i ? "rgba(255,255,255,0.05)" : "transparent"}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                />
              </g>
            );
          })}
          <line x1={M.esq} x2={L - M.dir} y1={y(0)} y2={y(0)} stroke="#444444" strokeWidth={1} />
        </svg>

        {hover !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 min-w-40 rounded-xl border border-gray-400 bg-gray-100 p-2.5 text-xs shadow-xl shadow-black/40"
            style={{
              left: `${((M.esq + (hover + 0.5) * col) / L) * 100}%`,
              transform: hover > semanas.length / 2 ? "translateX(-105%)" : "translateX(5%)",
            }}
          >
            <div className="mb-1 font-semibold">
              {periodo === "mes" ? "Mês" : "Semana"} de {ddmm(semanas[hover].semana)} · {totais[hover]} commits
            </div>
            {membros
              .filter((m) => (semanas[hover].commits[m.id] ?? 0) > 0)
              .map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2" style={{ backgroundColor: cor(m.id) }} />
                    {m.nome.length > 22 ? m.nome.split(" ")[0] : m.nome}
                  </span>
                  <span className="tabular-nums">{semanas[hover].commits[m.id]}</span>
                </div>
              ))}
            {totais[hover] === 0 && <div className="text-gray-500">Sem commits</div>}
          </div>
        )}
      </div>
    </div>
  );
}

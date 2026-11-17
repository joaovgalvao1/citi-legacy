// Cronograma das etapas (Gantt simples, HTML/CSS próprio).
// Para cada etapa: o período previsto (contorno), o progresso dentro dele (preenchido)
// e, abaixo, o período real de commits (do primeiro ao último). A linha vertical marca hoje.

import Link from "next/link";
import type { Projeto } from "@/data";
import { dataReferencia } from "@/data/referencia.json";
import { formatarData } from "@/data/formatos";
import { emPct } from "@/lib/indice";
import { diasParada, statusEtapa } from "@/lib/status";

const DIA = 86400000;
const t = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).getTime();
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function Cronograma({ projeto }: { projeto: Projeto }) {
  const concluido = projeto.status === "concluido";
  const datas = [
    projeto.inicio,
    projeto.fimPrevisto,
    ...(projeto.entrega ? [projeto.entrega] : []),
    ...(concluido ? [] : [dataReferencia]),
    ...projeto.etapas.flatMap((e) => [e.inicioPrevisto, e.fimPrevisto, e.ultimoCommit ?? e.fimPrevisto]),
  ];
  const ini = Math.min(...datas.map(t)) - 3 * DIA;
  const fim = Math.max(...datas.map(t)) + 3 * DIA;
  const pos = (iso: string) => ((t(iso) - ini) / (fim - ini)) * 100;

  // marcas de mês no eixo
  const marcas: { x: number; rotulo: string }[] = [];
  const d = new Date(ini);
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + 1);
  while (d.getTime() < fim) {
    marcas.push({
      x: ((d.getTime() - ini) / (fim - ini)) * 100,
      rotulo: `${MESES[d.getUTCMonth()]}${d.getUTCMonth() === 0 ? `/${String(d.getUTCFullYear()).slice(2)}` : ""}`,
    });
    d.setUTCMonth(d.getUTCMonth() + 1);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-5 border border-gray-500" /> previsto
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-5 bg-gray-600" /> progresso
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1 w-5 bg-gray-400" /> commits (real)
        </span>
        {!concluido && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-px bg-gray-900" /> hoje ({formatarData(dataReferencia)})
          </span>
        )}
      </div>

      <div className="grid grid-cols-[minmax(7rem,11rem)_1fr] gap-x-3 gap-y-3 text-sm">
        {/* eixo */}
        <div />
        <div className="relative h-4 border-b border-gray-300 text-[11px] text-gray-500">
          {marcas.map((m) => (
            <span key={m.x} className="absolute -translate-x-1/2" style={{ left: `${m.x}%` }}>
              {m.rotulo}
            </span>
          ))}
        </div>

        {projeto.etapas.map((e) => {
          const status = statusEtapa(projeto, e);
          const parada = diasParada(projeto, e);
          const esq = pos(e.inicioPrevisto);
          const larg = Math.max(pos(e.fimPrevisto) - esq, 0.8);
          const atrasada = status === "Atrasada";
          return (
            <div key={e.id} className="contents">
              <div className="min-w-0">
                <Link href={`/projetos/${projeto.id}/etapas/${e.id}`} className="block truncate underline" title={e.nome}>
                  {e.nome}
                </Link>
                <span className="text-xs text-gray-500">
                  {status}
                  {parada !== null && ` · parada`} · {emPct(e.progresso)}
                </span>
              </div>
              <div
                className="relative"
                title={`${e.nome}: previsto ${formatarData(e.inicioPrevisto)} a ${formatarData(e.fimPrevisto)} · ${emPct(e.progresso)} concluído${
                  e.primeiroCommit ? ` · commits de ${formatarData(e.primeiroCommit)} a ${formatarData(e.ultimoCommit!)}` : ""
                }`}
              >
                {/* linhas de mês */}
                {marcas.map((m) => (
                  <span key={m.x} className="absolute inset-y-0 w-px bg-gray-100" style={{ left: `${m.x}%` }} />
                ))}
                {/* previsto + progresso */}
                <div
                  className={`absolute top-1 h-4 border ${atrasada ? "border-gray-900 border-dashed" : "border-gray-500"} bg-white`}
                  style={{ left: `${esq}%`, width: `${larg}%` }}
                >
                  <div className="h-full bg-gray-600" style={{ width: `${e.progresso}%` }} />
                </div>
                {/* atraso: do fim previsto até hoje */}
                {atrasada && (
                  <div
                    className="absolute top-[0.6rem] h-1 bg-gray-900/40"
                    style={{ left: `${pos(e.fimPrevisto)}%`, width: `${Math.max(pos(dataReferencia) - pos(e.fimPrevisto), 0)}%` }}
                  />
                )}
                {/* real (commits) */}
                {e.primeiroCommit && e.ultimoCommit && (
                  <div
                    className="absolute top-6 h-1 bg-gray-400"
                    style={{ left: `${pos(e.primeiroCommit)}%`, width: `${Math.max(pos(e.ultimoCommit) - pos(e.primeiroCommit), 0.5)}%` }}
                  />
                )}
                {!concluido && <span className="absolute -inset-y-1 w-px bg-gray-900" style={{ left: `${pos(dataReferencia)}%` }} />}
                <div className="h-8" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

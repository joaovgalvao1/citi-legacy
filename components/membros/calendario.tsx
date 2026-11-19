// Calendário de contribuições (estilo GitHub): um quadrado por dia, uma coluna por semana,
// cobrindo do primeiro ao último commit da pessoa. 4 tons, do cinza ao verde do CITi.
// Rola na horizontal e já abre na parte mais recente (dir="rtl" no contêiner da rolagem).

import type { Commit } from "@/data";
import { somarDias } from "@/lib/hoje";

const TONS = ["#1E1E1E", "#0B4F27", "#048F3F", "#00DB58"];
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const nivel = (n: number) => (n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : 3);
const diaDaSemana = (iso: string) => new Date(`${iso}T12:00:00Z`).getUTCDay();
const dataBr = (iso: string) => iso.split("-").reverse().join("/");

export function CalendarioContribuicoes({ commits }: { commits: Commit[] }) {
  if (!commits.length) return <p className="text-sm text-gray-500">Ainda sem commits.</p>;

  const porDia = new Map<string, number>();
  for (const c of commits) porDia.set(c.data.slice(0, 10), (porDia.get(c.data.slice(0, 10)) ?? 0) + 1);
  const dias = [...porDia.keys()].sort();
  // começa no domingo da semana do primeiro commit e termina no sábado da semana do último
  const inicio = somarDias(dias[0], -diaDaSemana(dias[0]));
  const fim = somarDias(dias.at(-1)!, 6 - diaDaSemana(dias.at(-1)!));

  const semanas: string[][] = [];
  for (let d = inicio; d <= fim; d = somarDias(d, 7)) semanas.push(Array.from({ length: 7 }, (_, i) => somarDias(d, i)));
  const total = commits.length;
  const ativos = porDia.size;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto pb-1 text-left" dir="rtl">
        <div dir="ltr" className="inline-block">
          {/* meses no topo (na primeira semana de cada mês) */}
          <div className="flex h-3 gap-[3px]">
            {semanas.map((s, i) => {
              const primeiroDoMes = s.find((d) => d.endsWith("-01"));
              return (
                <span key={i} className="dado relative w-[11px] text-[10px] text-gray-500">
                  {primeiroDoMes && <span className="absolute left-0 whitespace-nowrap">{MESES[Number(primeiroDoMes.slice(5, 7)) - 1]}</span>}
                </span>
              );
            })}
          </div>
          <div className="mt-1.5 flex gap-[3px]">
            {semanas.map((s, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                {s.map((d) => {
                  const n = porDia.get(d) ?? 0;
                  return (
                    <span
                      key={d}
                      title={`${dataBr(d)} · ${n} ${n === 1 ? "commit" : "commits"}`}
                      className="h-[11px] w-[11px] rounded-[2px]"
                      style={{ backgroundColor: TONS[nivel(n)] }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
        <span className="dado">
          {total} commits em {ativos} dias · {dataBr(dias[0])} a {dataBr(dias.at(-1)!)}
        </span>
        <span className="flex items-center gap-1.5">
          menos
          {TONS.map((t) => (
            <span key={t} className="h-[11px] w-[11px] rounded-[2px]" style={{ backgroundColor: t }} />
          ))}
          mais
        </span>
      </div>
    </div>
  );
}

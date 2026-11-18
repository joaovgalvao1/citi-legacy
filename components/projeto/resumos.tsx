// Resumos da IA guardados no banco (sem chamar a IA na visita).
//   • Em andamento: o resumo da semana mais recente e, abaixo, o histórico das semanas anteriores.
//   • Concluído: o resumo final, fixo.

import type { Resumo } from "@/data";

const ROTULO_FONTE: Record<Resumo["fonte"], string> = {
  gemini: "Gerado por IA · Gemini",
  groq: "Gerado por IA · Groq",
  regras: "Resumo automático (sem IA)",
};

const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const fimDaSemana = (iso: string) => new Date(new Date(`${iso}T12:00:00Z`).getTime() + 6 * 86400000).toISOString().slice(0, 10);

function Secoes({ resumo, compacto = false }: { resumo: Resumo; compacto?: boolean }) {
  return (
    <div className={`grid gap-5 ${compacto ? "sm:grid-cols-3" : "sm:grid-cols-3"}`}>
      {resumo.secoes.map((s) => (
        <div key={s.titulo} className="space-y-2">
          <h3 className={`font-semibold text-gray-900 ${compacto ? "text-xs" : "text-sm"}`}>{s.titulo}</h3>
          <ul className="space-y-1.5">
            {s.itens.map((item, i) => (
              <li key={i} className={`flex gap-2 text-gray-700 ${compacto ? "text-xs" : "text-sm"}`}>
                <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-verde" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Fonte({ resumo }: { resumo: Resumo }) {
  return (
    <p className="dado text-[11px] text-gray-500">
      {ROTULO_FONTE[resumo.fonte]}
      {resumo.modelo && ` (${resumo.modelo})`} · gerado em{" "}
      {new Date(resumo.geradoEm).toLocaleDateString("pt-BR", { timeZone: "America/Recife" })}
    </p>
  );
}

export function ResumosDoProjeto({ resumos, concluido }: { resumos: Resumo[]; concluido: boolean }) {
  const titulo = concluido ? "Resumo final do projeto" : "Resumo da semana";
  const principal = concluido ? resumos.find((r) => r.tipo === "final") : resumos.find((r) => r.tipo === "semanal");
  const anteriores = concluido ? [] : resumos.filter((r) => r.tipo === "semanal" && r !== principal);

  return (
    <section className="anima-surgir rounded-2xl border border-verde/30 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="dado flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-verde">
          <span aria-hidden="true">✦</span>
          {titulo}
          {principal && !concluido && (
            <span className="normal-case tracking-normal text-gray-500">
              · {ddmm(principal.semana)} a {ddmm(fimDaSemana(principal.semana))}
            </span>
          )}
        </h2>
        <span className="text-xs text-gray-500">
          {concluido ? "Gerado uma vez, ao concluir o projeto" : "Gerado toda sexta-feira às 23h"}
        </span>
      </div>

      {principal ? (
        <div className="space-y-4">
          <Secoes resumo={principal} />
          <Fonte resumo={principal} />
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          {concluido ? "O resumo final ainda não foi gerado." : "O primeiro resumo semanal sai na próxima sexta-feira."}
        </p>
      )}

      {anteriores.length > 0 && (
        <details className="mt-5 border-t border-gray-300 pt-4">
          <summary className="cursor-pointer text-sm text-gray-700">Semanas anteriores ({anteriores.length})</summary>
          <ol className="mt-4 space-y-5">
            {anteriores.map((r) => (
              <li key={r.semana} className="space-y-3 border-l-2 border-gray-400 pl-4">
                <p className="dado text-xs text-gray-500">
                  Semana de {ddmm(r.semana)} a {ddmm(fimDaSemana(r.semana))}
                </p>
                <Secoes resumo={r} compacto />
              </li>
            ))}
          </ol>
        </details>
      )}
    </section>
  );
}

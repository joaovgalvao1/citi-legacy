// Resumos da IA guardados no banco (sem chamar a IA na visita).
//   • Em andamento: o resumo da semana mais recente e, abaixo, o histórico das semanas anteriores.
//   • Concluído: o resumo final, fixo.
// Assinatura de IA: borda em gradiente roxo→verde e o rótulo "✦ GERADO POR IA" (só quando veio da IA).

import Link from "next/link";
import type { Resumo } from "@/data";
import { IconeExportar } from "@/components/ui/icones";

export const ROTULO_FONTE: Record<Resumo["fonte"], string> = {
  gemini: "Gerado por IA · Gemini",
  groq: "Gerado por IA · Groq",
  regras: "Resumo automático (sem IA)",
};

export const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
export const fimDaSemana = (iso: string) => new Date(new Date(`${iso}T12:00:00Z`).getTime() + 6 * 86400000).toISOString().slice(0, 10);

/** Cor de cada parte (título e marcadores): o que andou (verde), o que travou (vermelho), o resto em branco. */
function corDaParte(titulo: string) {
  const t = titulo.toLowerCase();
  if (t.includes("andou")) return { texto: "text-verde", marcador: "bg-verde" };
  if (t.includes("travou")) return { texto: "text-vermelho", marcador: "bg-vermelho" };
  return { texto: "text-branco", marcador: "bg-branco" };
}

function Secoes({ resumo, compacto = false }: { resumo: Resumo; compacto?: boolean }) {
  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {resumo.secoes.map((s) => (
        <div key={s.titulo} className="space-y-2">
          <h3 className={`font-semibold ${corDaParte(s.titulo).texto} ${compacto ? "text-xs" : "text-sm"}`}>{s.titulo}</h3>
          <ul className="space-y-1.5">
            {s.itens.map((item, i) => (
              <li key={i} className={`flex gap-2 text-gray-700 ${compacto ? "text-xs" : "text-sm"}`}>
                <span aria-hidden="true" className={`mt-2 h-1 w-1 shrink-0 rounded-full ${corDaParte(s.titulo).marcador}`} />
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

/** Rótulo "✦ GERADO POR IA" com o texto em gradiente (assinatura de conteúdo gerado por IA). */
export function SeloIA({ texto = "Gerado por IA" }: { texto?: string }) {
  return (
    <span className="dado texto-ia text-[11px] font-semibold uppercase tracking-[0.16em]">
      <span aria-hidden="true">✦ </span>
      {texto}
    </span>
  );
}

export function ResumosDoProjeto({ projetoId, resumos, concluido }: { projetoId: string; resumos: Resumo[]; concluido: boolean }) {
  const titulo = concluido ? "Resumo final do projeto" : "Resumo da semana";
  const principal = concluido ? resumos.find((r) => r.tipo === "final") : resumos.find((r) => r.tipo === "semanal");
  const anteriores = concluido ? [] : resumos.filter((r) => r.tipo === "semanal" && r !== principal);
  const daIA = !principal || principal.fonte !== "regras";

  return (
    <section className={`anima-surgir rounded-xl p-5 ${daIA ? "borda-ia" : "border border-linha bg-white"}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          {daIA ? <SeloIA /> : <span className="rotulo">Resumo automático</span>}
          <h2 className="text-base font-bold tracking-tight">
            {titulo}
            {principal && !concluido && (
              <span className="dado ml-2 text-xs font-normal text-gray-500">
                {ddmm(principal.semana)} a {ddmm(fimDaSemana(principal.semana))}
              </span>
            )}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {concluido ? "Gerado uma vez, ao concluir o projeto" : "Gerado todo domingo às 23h"}
          </span>
          <Link
            href={`/exportar/${projetoId}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-branco/25 bg-branco/5 px-3 py-1 text-xs text-branco transition-colors hover:border-branco/50"
          >
            <IconeExportar className="h-3.5 w-3.5" />
            Exportar PDF
          </Link>
        </div>
      </div>

      {principal ? (
        <div className="space-y-4">
          <Secoes resumo={principal} />
          <Fonte resumo={principal} />
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          {concluido ? "O resumo final é gerado no domingo, às 23h." : "O primeiro resumo semanal sai no próximo domingo."}
        </p>
      )}

      {anteriores.length > 0 && (
        <details className="mt-5 border-t border-linha pt-4">
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

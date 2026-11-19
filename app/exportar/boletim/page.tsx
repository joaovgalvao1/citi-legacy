// Boletim semanal da empresa (A4, fundo claro), salvo em PDF pelo navegador:
// números da semana, o resumo da IA de cada projeto em andamento e a lista dos concluídos.

import { Suspense } from "react";
import type { Metadata } from "next";
import { obterCommits, obterProjetos, obterResumos } from "@/data";
import { formatarData } from "@/data/formatos";
import { emPct } from "@/lib/indice";
import { montarBoletim } from "@/lib/boletim";
import { ddmm } from "@/components/projeto/resumos";
import { BarraDeImpressao } from "@/components/exportar/imprimir";
import { BotaoEnviarBoletim } from "@/components/exportar/enviar-email";
import { CabecalhoFolha, SeloIAFolha, Secoes, Titulo } from "@/components/exportar/folha";
import { EsqueletoFolha } from "@/components/ui/esqueletos";

export const metadata: Metadata = { title: "Boletim semanal · CITi Legacy" };

function Numero({ valor, rotulo, alerta }: { valor: number; rotulo: string; alerta?: "ambar" | "vermelho" }) {
  return (
    <div className="rounded-xl border border-(--f-borda) px-4 py-3">
      <p className={`dado text-[24px] leading-none font-semibold ${alerta && valor > 0 ? (alerta === "vermelho" ? "text-(--f-vermelho)" : "text-(--f-ambar)") : "text-(--f-texto)"}`}>{valor}</p>
      <p className="mt-1.5 text-[9.5px] text-(--f-suave)">{rotulo}</p>
    </div>
  );
}

async function Documento() {
  const projetos = await obterProjetos();
  const [listas, commits] = await Promise.all([Promise.all(projetos.map((p) => obterResumos(p.id))), obterCommits({})]);
  const b = montarBoletim(projetos, Object.fromEntries(projetos.map((p, i) => [p.id, listas[i]])), commits);

  return (
    <>
      <BarraDeImpressao voltar="/projetos" rotuloVoltar="Voltar aos projetos" acoes={<BotaoEnviarBoletim />} />

      <article className="folha mx-auto w-full max-w-[210mm] rounded-sm bg-(--f-fundo) px-[16mm] py-[14mm] text-(--f-texto) shadow-2xl">
        <CabecalhoFolha rotulo="Boletim semanal da empresa" data={b.hoje} />

        <section className="mt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-(--f-fraco)">CITi · projetos em andamento</p>
          <h1 className="mt-1 text-[26px] leading-tight font-bold tracking-tight">
            Semana de {ddmm(b.semana)} a {ddmm(b.fimSemana)}
          </h1>
          <p className="mt-2 max-w-[150mm] text-[11.5px] leading-relaxed text-(--f-texto-4)">
            O que andou, o que travou e o que fazer primeiro em cada projeto, resumido pela IA a partir dos commits e das tasks da semana.
          </p>
          <div className="mt-5 grid grid-cols-4 gap-2.5">
            <Numero valor={b.numeros.andamento} rotulo="projetos em andamento" />
            <Numero valor={b.numeros.atrasados} rotulo="projetos atrasados" alerta="vermelho" />
            <Numero valor={b.numeros.etapasParadas} rotulo="etapas paradas (14+ dias)" alerta="ambar" />
            <Numero valor={b.numeros.commitsSemana} rotulo="commits na semana" />
          </div>
        </section>

        <section className="mt-7">
          <Titulo>Projetos · {b.projetos.length}</Titulo>
          <ol className="space-y-5">
            {b.projetos.map((p) => (
              <li key={p.id} className="break-inside-avoid rounded-xl border border-(--f-borda) p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[15px] font-bold tracking-tight">{p.nome}</h2>
                    <p className="text-[10px] text-(--f-fraco)">{p.cliente}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[9.5px] font-medium ${
                      p.nivel === "vermelho"
                        ? "border-(--f-vermelho-borda) bg-(--f-vermelho-fundo) text-(--f-vermelho)"
                        : p.nivel === "ambar"
                          ? "border-(--f-ambar-borda) bg-(--f-ambar-fundo) text-(--f-ambar)"
                          : "border-(--f-verde-borda) bg-(--f-verde-fundo) text-(--f-verde)"
                    }`}
                  >
                    {p.nivel === "vermelho" ? "Atrasado" : p.nivel === "ambar" ? "Atenção" : "No prazo"}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-(--f-trilho)">
                    <div className={`h-full rounded-full ${p.nivel === "vermelho" ? "bg-[#FF3B3B]" : p.nivel === "ambar" ? "bg-[#FFA630]" : "bg-[#00DB58]"}`} style={{ width: `${p.progresso}%` }} />
                  </div>
                  <span className="dado text-[10px] text-(--f-texto-3)">{emPct(p.progresso)}</span>
                  <span className="dado text-[10px] text-(--f-fraco)">{p.prazo}</span>
                </div>
                <p className={`dado mt-1 text-right text-[10px] font-semibold ${p.previsao.tom === "vermelho" ? "text-(--f-vermelho)" : p.previsao.tom === "ambar" ? "text-(--f-ambar)" : "text-(--f-verde)"}`}>
                  {p.previsao.texto} <span className="font-normal text-(--f-fraco)">· ritmo das últimas 4 semanas</span>
                </p>
                {p.alertas.length > 0 && (
                  <ul className="mt-2.5 space-y-0.5">
                    {p.alertas.map((a) => (
                      <li key={a} className={`text-[9.5px] ${/atrasad/.test(a) ? "text-(--f-vermelho)" : "text-(--f-ambar)"}`}>
                        ▲ {a}
                      </li>
                    ))}
                  </ul>
                )}
                <div className={`mt-3 rounded-lg p-3 ${p.resumo && p.resumo.fonte !== "regras" ? "borda-ia-folha" : "bg-(--f-caixa)"}`}>
                  {p.resumo ? (
                    <>
                      {p.resumo.fonte !== "regras" && (
                        <p className="mb-2">
                          <SeloIAFolha />
                        </p>
                      )}
                      <Secoes resumo={p.resumo} compacto />
                    </>
                  ) : (
                    <p className="text-[10px] text-(--f-suave)">Ainda não há resumo da IA para esta semana.</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {b.concluidos.length > 0 && (
          <section className="mt-7 break-inside-avoid">
            <Titulo>Legado · projetos concluídos</Titulo>
            <ul className="divide-y divide-(--f-borda-2) text-[10.5px]">
              {b.concluidos.map((c) => (
                <li key={c.id} className="flex justify-between gap-4 py-1.5">
                  <span>
                    <span className="font-medium">{c.nome}</span> <span className="text-(--f-fraco)">· {c.cliente}</span>
                  </span>
                  <span className="dado shrink-0 text-(--f-suave)">entregue em {formatarData(c.entrega)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="mt-9 flex flex-wrap items-center justify-between gap-2 border-t border-(--f-borda) pt-3 text-[9px] text-(--f-fraco)">
          <span>Resumos gerados por IA toda sexta-feira às 23h, com memória das semanas anteriores</span>
          <span>CITi Legacy · uso interno</span>
        </footer>
      </article>
    </>
  );
}

export default function PaginaBoletim() {
  return (
    <div className="impressao min-h-screen px-4 py-8">
      <Suspense fallback={<EsqueletoFolha />}>
        <Documento />
      </Suspense>
    </div>
  );
}

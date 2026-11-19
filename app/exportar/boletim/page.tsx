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
import { CabecalhoFolha, Secoes, Titulo } from "@/components/exportar/folha";

export const metadata: Metadata = { title: "Boletim semanal · CITi Legacy" };

function Numero({ valor, rotulo, alerta }: { valor: number; rotulo: string; alerta?: boolean }) {
  return (
    <div className="rounded-xl border border-[#e4e4e4] px-4 py-3">
      <p className={`dado text-[24px] leading-none font-semibold ${alerta && valor > 0 ? "text-[#b86e00]" : "text-[#161616]"}`}>{valor}</p>
      <p className="mt-1.5 text-[9.5px] text-[#666]">{rotulo}</p>
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

      <article className="folha mx-auto w-full max-w-[210mm] rounded-sm bg-[#ffffff] px-[16mm] py-[14mm] text-[#161616] shadow-2xl">
        <CabecalhoFolha rotulo="Boletim semanal da empresa" data={b.hoje} />

        <section className="mt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a8a]">CITi · projetos em andamento</p>
          <h1 className="mt-1 text-[26px] leading-tight font-bold tracking-tight">
            Semana de {ddmm(b.semana)} a {ddmm(b.fimSemana)}
          </h1>
          <p className="mt-2 max-w-[150mm] text-[11.5px] leading-relaxed text-[#555]">
            O que andou, o que travou e o que fazer primeiro em cada projeto, resumido pela IA a partir dos commits e das tasks da semana.
          </p>
          <div className="mt-5 grid grid-cols-4 gap-2.5">
            <Numero valor={b.numeros.andamento} rotulo="projetos em andamento" />
            <Numero valor={b.numeros.atrasados} rotulo="projetos atrasados" alerta />
            <Numero valor={b.numeros.etapasParadas} rotulo="etapas paradas (14+ dias)" alerta />
            <Numero valor={b.numeros.commitsSemana} rotulo="commits na semana" />
          </div>
        </section>

        <section className="mt-7">
          <Titulo>Projetos · {b.projetos.length}</Titulo>
          <ol className="space-y-5">
            {b.projetos.map((p) => (
              <li key={p.id} className="break-inside-avoid rounded-xl border border-[#e4e4e4] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[15px] font-bold tracking-tight">{p.nome}</h2>
                    <p className="text-[10px] text-[#8a8a8a]">{p.cliente}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[9.5px] font-medium ${
                      p.status === "Atrasado" ? "border-[#f3c98b] bg-[#fff6e8] text-[#b86e00]" : "border-[#cdeedb] bg-[#f3fbf6] text-[#00873a]"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#ececec]">
                    <div className="h-full rounded-full bg-[#00DB58]" style={{ width: `${p.progresso}%` }} />
                  </div>
                  <span className="dado text-[10px] text-[#444]">{emPct(p.progresso)}</span>
                  <span className="dado text-[10px] text-[#8a8a8a]">{p.prazo}</span>
                </div>
                {p.alertas.length > 0 && (
                  <ul className="mt-2.5 space-y-0.5">
                    {p.alertas.map((a) => (
                      <li key={a} className="text-[9.5px] text-[#b86e00]">
                        ▲ {a}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3 rounded-lg bg-[#f6fbf8] p-3">
                  {p.resumo ? (
                    <Secoes resumo={p.resumo} compacto />
                  ) : (
                    <p className="text-[10px] text-[#666]">Ainda não há resumo da IA para esta semana.</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {b.concluidos.length > 0 && (
          <section className="mt-7 break-inside-avoid">
            <Titulo>Legado · projetos concluídos</Titulo>
            <ul className="divide-y divide-[#efefef] text-[10.5px]">
              {b.concluidos.map((c) => (
                <li key={c.id} className="flex justify-between gap-4 py-1.5">
                  <span>
                    <span className="font-medium">{c.nome}</span> <span className="text-[#8a8a8a]">· {c.cliente}</span>
                  </span>
                  <span className="dado shrink-0 text-[#666]">entregue em {formatarData(c.entrega)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="mt-9 flex flex-wrap items-center justify-between gap-2 border-t border-[#e4e4e4] pt-3 text-[9px] text-[#8a8a8a]">
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
      <Suspense fallback={<p className="text-center text-sm text-gray-500">Carregando…</p>}>
        <Documento />
      </Suspense>
    </div>
  );
}

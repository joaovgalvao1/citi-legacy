// Versão de impressão do resumo de um projeto (A4, fundo claro), salva em PDF pelo navegador.
// Em andamento: o resumo da semana em destaque e o histórico das semanas anteriores.
// Concluído: o resumo final e os resultados.

import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { obterProjeto, obterProjetos, obterResumos, type Projeto, type Resumo } from "@/data";
import { formatarData } from "@/data/formatos";
import { emPct } from "@/lib/indice";
import { progressoProjeto, statusEtapa, statusProjeto, textoEntrega, textoPrazo } from "@/lib/status";
import { ddmm, fimDaSemana, ROTULO_FONTE } from "@/components/projeto/resumos";
import { BarraDeImpressao } from "@/components/exportar/imprimir";
import { CabecalhoFolha, Dado, Secoes, Titulo } from "@/components/exportar/folha";

export async function generateStaticParams() {
  return (await obterProjetos()).map((p) => ({ projetoId: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/exportar/[projetoId]">): Promise<Metadata> {
  const { projetoId } = await params;
  const projeto = await obterProjeto(projetoId);
  // o título vira o nome sugerido do arquivo PDF
  return { title: projeto ? `Resumo · ${projeto.nome} · CITi Legacy` : "CITi Legacy" };
}

const semana = (r: Resumo) => `${ddmm(r.semana)} a ${ddmm(fimDaSemana(r.semana))}`;

function Etapas({ projeto }: { projeto: Projeto }) {
  return (
    <table className="w-full border-collapse text-[10.5px]">
      <tbody>
        {projeto.etapas.map((e) => {
          const s = statusEtapa(projeto, e);
          return (
            <tr key={e.id} className="border-b border-[#efefef] last:border-0">
              <td className="py-1.5 pr-3 font-medium text-[#161616]">{e.nome}</td>
              <td className="w-[45%] py-1.5 pr-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-[#ececec]">
                  <div className="h-full rounded-full bg-[#00DB58]" style={{ width: `${e.progresso}%` }} />
                </div>
              </td>
              <td className="dado w-12 py-1.5 pr-3 text-right text-[#444]">{emPct(e.progresso)}</td>
              <td className={`w-28 py-1.5 text-right ${s === "Atrasada" ? "text-[#b86e00]" : s === "Concluída" ? "text-[#00873a]" : "text-[#666]"}`}>
                {s}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

async function Documento({ params }: { params: PageProps<"/exportar/[projetoId]">["params"] }) {
  const { projetoId } = await params;
  const projeto = await obterProjeto(projetoId);
  if (!projeto) notFound();
  const resumos = await obterResumos(projeto.id);
  const concluido = projeto.status === "concluido";
  const principal = resumos.find((r) => r.tipo === (concluido ? "final" : "semanal"));
  const anteriores = concluido ? [] : resumos.filter((r) => r.tipo === "semanal" && r !== principal);
  const status = statusProjeto(projeto);

  return (
    <>
      <BarraDeImpressao voltar={`/projetos/${projeto.id}`} rotuloVoltar="Voltar ao projeto" />

      <article className="folha mx-auto w-full max-w-[210mm] rounded-sm bg-[#ffffff] px-[16mm] py-[14mm] text-[#161616] shadow-2xl">
        <CabecalhoFolha rotulo={concluido ? "Resumo final do projeto" : "Resumo semanal do projeto"} data={projeto.hoje} />

        {/* projeto */}
        <section className="mt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8a8a]">{projeto.cliente}</p>
          <h1 className="mt-1 text-[26px] leading-tight font-bold tracking-tight">{projeto.nome}</h1>
          <p className="mt-2 max-w-[150mm] text-[11.5px] leading-relaxed text-[#555]">{projeto.descricao}</p>

          <div className="mt-5 grid grid-cols-4 gap-2.5">
            <Dado rotulo="Status" valor={status} destaque={status === "Atrasado" ? "ambar" : status === "Concluído" ? "verde" : undefined} />
            <Dado rotulo="Progresso" valor={emPct(progressoProjeto(projeto))} />
            <Dado rotulo={concluido ? "Entrega" : "Prazo"} valor={concluido ? textoEntrega(projeto) : textoPrazo(projeto)} />
            <Dado
              rotulo="Período"
              valor={`${formatarData(projeto.inicio)} a ${formatarData(projeto.entrega ?? projeto.fimPrevisto)}`}
            />
          </div>
        </section>

        {/* resumo em destaque */}
        <section className="mt-7 break-inside-avoid">
          <Titulo>
            <span className="text-[#00873a]">✦</span> {concluido ? "Resumo final" : `Resumo da semana · ${principal ? semana(principal) : ""}`}
          </Titulo>
          <div className="rounded-xl border border-[#cdeedb] bg-[#f3fbf6] p-5">
            {principal ? (
              <Secoes resumo={principal} />
            ) : (
              <p className="text-[11px] text-[#666]">
                {concluido ? "O resumo final é gerado na sexta-feira, às 23h." : "O primeiro resumo semanal sai na próxima sexta-feira."}
              </p>
            )}
          </div>
          {concluido && projeto.resultados && (
            <div className="mt-4 rounded-xl border border-[#e4e4e4] p-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8a8a8a]">Resultados</p>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#2a2a2a]">{projeto.resultados}</p>
            </div>
          )}
        </section>

        {/* etapas */}
        <section className="mt-7 break-inside-avoid">
          <Titulo>Etapas · {projeto.etapas.length}</Titulo>
          <Etapas projeto={projeto} />
        </section>

        {/* histórico */}
        {anteriores.length > 0 && (
          <section className="mt-7">
            <Titulo>Semanas anteriores · {anteriores.length}</Titulo>
            <ol className="space-y-4">
              {anteriores.map((r) => (
                <li key={r.semana} className="break-inside-avoid border-l-2 border-[#00DB58] pl-4">
                  <p className="dado mb-2 text-[10px] font-medium text-[#555]">Semana de {semana(r)}</p>
                  <Secoes resumo={r} compacto />
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* rodapé */}
        <footer className="mt-9 flex flex-wrap items-center justify-between gap-2 border-t border-[#e4e4e4] pt-3 text-[9px] text-[#8a8a8a]">
          <span>
            {principal ? `${ROTULO_FONTE[principal.fonte]}${principal.modelo ? ` (${principal.modelo})` : ""}` : "Resumos gerados por IA"}
            {" · "}
            {concluido ? "gerado uma vez, ao concluir o projeto" : "gerado toda sexta-feira às 23h, com memória das semanas anteriores"}
          </span>
          <span>CITi Legacy · uso interno</span>
        </footer>
      </article>
    </>
  );
}

export default function PaginaExportar(props: PageProps<"/exportar/[projetoId]">) {
  return (
    <div className="impressao min-h-screen px-4 py-8">
      <Suspense fallback={<p className="text-center text-sm text-gray-500">Carregando…</p>}>
        <Documento params={props.params} />
      </Suspense>
    </div>
  );
}

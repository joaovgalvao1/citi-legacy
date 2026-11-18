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

function Dado({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: "ambar" | "verde" }) {
  const cor = destaque === "ambar" ? "text-[#b86e00]" : destaque === "verde" ? "text-[#00873a]" : "text-[#161616]";
  return (
    <div className="rounded-lg border border-[#e4e4e4] px-3 py-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8a8a8a]">{rotulo}</p>
      <p className={`dado mt-1 text-[12px] font-medium ${cor}`}>{valor}</p>
    </div>
  );
}

function Secoes({ resumo, compacto = false }: { resumo: Resumo; compacto?: boolean }) {
  return (
    <div className={compacto ? "grid grid-cols-3 gap-4" : "space-y-4"}>
      {resumo.secoes.map((s) => (
        <div key={s.titulo} className={compacto ? "" : "grid grid-cols-[38mm_1fr] gap-4"}>
          <h4
            className={`font-semibold uppercase tracking-[0.12em] text-[#00873a] ${compacto ? "mb-1.5 text-[8.5px]" : "pt-0.5 text-[9.5px]"}`}
          >
            {s.titulo}
          </h4>
          <ul className={compacto ? "space-y-1" : "space-y-1.5"}>
            {s.itens.map((item, i) => (
              <li key={i} className={`flex gap-2 leading-snug text-[#2a2a2a] ${compacto ? "text-[9.5px]" : "text-[11.5px]"}`}>
                <span aria-hidden="true" className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-[#00DB58]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

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

function Titulo({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a8a8a]">{children}</h3>;
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
      <BarraDeImpressao projetoId={projeto.id} />

      <article className="folha mx-auto w-full max-w-[210mm] rounded-sm bg-[#ffffff] px-[16mm] py-[14mm] text-[#161616] shadow-2xl">
        {/* cabeçalho */}
        <header className="flex items-start justify-between gap-6 border-b-2 border-[#00DB58] pb-4">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- imagem simples para impressão */}
            <img src="/marca/citi-logo-verde.png" alt="CITi" className="h-7 w-auto" />
            <span className="text-lg font-bold tracking-tight">Legacy</span>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#00873a]">
              {concluido ? "Resumo final do projeto" : "Resumo semanal do projeto"}
            </p>
            <p className="dado mt-1 text-[10px] text-[#8a8a8a]">exportado em {formatarData(projeto.hoje)}</p>
          </div>
        </header>

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

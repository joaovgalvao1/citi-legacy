// Peças comuns das folhas de impressão (A4, fundo claro): cabeçalho, caixas de dados, seções do resumo.

import type { ReactNode } from "react";
import type { Resumo } from "@/data";
import { formatarData } from "@/data/formatos";

export function Dado({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: "ambar" | "verde" | "vermelho" }) {
  const cor = destaque === "vermelho" ? "text-(--f-vermelho)" : destaque === "ambar" ? "text-(--f-ambar)" : destaque === "verde" ? "text-(--f-verde)" : "text-(--f-texto)";
  return (
    <div className="rounded-lg border border-(--f-borda) px-3 py-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-(--f-fraco)">{rotulo}</p>
      <p className={`dado mt-1 text-[12px] font-medium ${cor}`}>{valor}</p>
    </div>
  );
}

/** Cor de cada parte do resumo (título e marcadores): o que andou (verde), o que travou (vermelho), o resto em preto. */
const corDoTitulo = (t: string) => (/andou/i.test(t) ? "text-(--f-verde)" : /travou/i.test(t) ? "text-(--f-vermelho)" : "text-(--f-texto)");
const corDoMarcador = (t: string) => (/andou/i.test(t) ? "bg-[#00DB58]" : /travou/i.test(t) ? "bg-[#FF3B3B]" : "bg-(--f-texto)");

/** Rótulo "✦ GERADO POR IA" em gradiente (assinatura de conteúdo gerado por IA). */
export function SeloIAFolha() {
  return <span className="texto-ia text-[8.5px] font-bold uppercase tracking-[0.18em]">✦ Gerado por IA</span>;
}

export function Secoes({ resumo, compacto = false }: { resumo: Resumo; compacto?: boolean }) {
  return (
    <div className={compacto ? "grid grid-cols-3 gap-4" : "space-y-4"}>
      {resumo.secoes.map((s) => (
        <div key={s.titulo} className={compacto ? "" : "grid grid-cols-[38mm_1fr] gap-4"}>
          <h4
            className={`font-semibold uppercase tracking-[0.12em] ${corDoTitulo(s.titulo)} ${compacto ? "mb-1.5 text-[8.5px]" : "pt-0.5 text-[9.5px]"}`}
          >
            {s.titulo}
          </h4>
          <ul className={compacto ? "space-y-1" : "space-y-1.5"}>
            {s.itens.map((item, i) => (
              <li key={i} className={`flex gap-2 leading-snug text-(--f-texto-2) ${compacto ? "text-[9.5px]" : "text-[11.5px]"}`}>
                <span aria-hidden="true" className={`mt-[0.45em] h-1 w-1 shrink-0 rounded-full ${corDoMarcador(s.titulo)}`} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function Titulo({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-(--f-fraco)">{children}</h3>;
}

/** Logo do CITi Legacy, o tipo de documento e a data. */
export function CabecalhoFolha({ rotulo, data }: { rotulo: string; data: string }) {
  return (
    <header className="flex items-start justify-between gap-6 border-b-2 border-[#00DB58] pb-4">
      {/* lockup "citi | LEGACY" (versão para fundo claro) */}
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- imagem simples para impressão */}
        <img src="/marca/citi-logo-verde.svg" alt="CITi" className="h-7 w-auto" />
        <span aria-hidden="true" className="h-[22px] w-px bg-(--f-texto)/35" />
        <span className="text-[11.5px] font-medium uppercase leading-none tracking-[3.75px] text-(--f-texto)">Legacy</span>
      </div>
      <div className="text-right">
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-(--f-verde)">{rotulo}</p>
        <p className="dado mt-1 text-[10px] text-(--f-fraco)">exportado em {formatarData(data)}</p>
      </div>
    </header>
  );
}

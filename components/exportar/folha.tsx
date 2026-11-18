// Peças comuns das folhas de impressão (A4, fundo claro): cabeçalho, caixas de dados, seções do resumo.

import type { ReactNode } from "react";
import type { Resumo } from "@/data";
import { formatarData } from "@/data/formatos";

export function Dado({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: "ambar" | "verde" }) {
  const cor = destaque === "ambar" ? "text-[#b86e00]" : destaque === "verde" ? "text-[#00873a]" : "text-[#161616]";
  return (
    <div className="rounded-lg border border-[#e4e4e4] px-3 py-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8a8a8a]">{rotulo}</p>
      <p className={`dado mt-1 text-[12px] font-medium ${cor}`}>{valor}</p>
    </div>
  );
}

export function Secoes({ resumo, compacto = false }: { resumo: Resumo; compacto?: boolean }) {
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

export function Titulo({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a8a8a]">{children}</h3>;
}

/** Logo do CITi Legacy, o tipo de documento e a data. */
export function CabecalhoFolha({ rotulo, data }: { rotulo: string; data: string }) {
  return (
    <header className="flex items-start justify-between gap-6 border-b-2 border-[#00DB58] pb-4">
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- imagem simples para impressão */}
        <img src="/marca/citi-logo-verde.png" alt="CITi" className="h-7 w-auto" />
        <span className="text-lg font-bold tracking-tight">Legacy</span>
      </div>
      <div className="text-right">
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#00873a]">{rotulo}</p>
        <p className="dado mt-1 text-[10px] text-[#8a8a8a]">exportado em {formatarData(data)}</p>
      </div>
    </header>
  );
}

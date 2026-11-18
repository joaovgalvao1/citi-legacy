"use client";

// Barra da versão de impressão (só aparece na tela): voltar ao projeto e salvar em PDF.

import Link from "next/link";
import { IconeExportar } from "@/components/ui/icones";

export function BarraDeImpressao({ voltar, rotuloVoltar }: { voltar: string; rotuloVoltar: string }) {
  return (
    <div className="so-tela mx-auto mb-6 flex w-full max-w-[210mm] flex-wrap items-center justify-between gap-3">
      <Link href={voltar} className="text-sm text-gray-600 transition-colors hover:text-verde">
        ← {rotuloVoltar}
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden text-xs text-gray-500 sm:inline">Na janela de impressão, escolha “Salvar como PDF”.</span>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-verde px-5 py-2 text-sm font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90"
        >
          <IconeExportar className="h-4 w-4" />
          Salvar como PDF
        </button>
      </div>
    </div>
  );
}

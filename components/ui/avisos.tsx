"use client";

// Pilha de avisos no canto inferior da tela (ver lib/avisos.ts).

import { fecharAviso, useAvisos } from "@/lib/avisos";

const COR = { verde: "bg-verde", ambar: "bg-ambar", vermelho: "bg-vermelho" };

export function Avisos() {
  const avisos = useAvisos();
  return (
    <div aria-live="polite" className="so-tela pointer-events-none fixed inset-x-3 bottom-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-5">
      {avisos.map((a) => (
        <div
          key={a.id}
          role="status"
          className="anima-surgir pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-branco/12 bg-[#1a1a1a] px-4 py-3 shadow-2xl shadow-black/60"
        >
          <span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${COR[a.tom ?? "verde"]}`} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-branco">{a.texto}</p>
            {a.detalhe && <p className="dado mt-0.5 text-xs text-gray-600">{a.detalhe}</p>}
          </div>
          {a.acao && (
            <button
              type="button"
              onClick={() => {
                a.acao!.executar();
                fecharAviso(a.id);
              }}
              className="shrink-0 cursor-pointer rounded-full border border-verde/50 px-3 py-1 text-xs font-semibold text-verde transition-colors hover:bg-verde/10"
            >
              {a.acao.rotulo}
            </button>
          )}
          <button type="button" onClick={() => fecharAviso(a.id)} aria-label="Fechar aviso" className="cursor-pointer text-gray-500 hover:text-branco">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

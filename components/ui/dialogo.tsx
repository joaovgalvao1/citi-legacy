"use client";

// Janela de confirmação (<dialog> nativo: foco preso, Esc fecha, fundo escurecido).
// Com `exigir`, o botão só libera quando a pessoa digita aquele texto (ex.: o nome do cliente).

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { confereConfirmacao } from "@/lib/novo-projeto";

export function Dialogo({
  aberto,
  titulo,
  children,
  rotuloConfirmar,
  perigo = false,
  exigir,
  ocupado = false,
  bloqueado = false,
  erro,
  aoConfirmar,
  aoFechar,
}: {
  aberto: boolean;
  titulo: string;
  children: ReactNode;
  rotuloConfirmar: string;
  perigo?: boolean;
  /** Texto que precisa ser digitado para liberar o botão. */
  exigir?: string;
  ocupado?: boolean;
  /** Desativa o botão de confirmar (ex.: falta escolher algo no formulário). */
  bloqueado?: boolean;
  erro?: string;
  /** Recebe o texto digitado (quando há `exigir`), para o servidor conferir de novo. */
  aoConfirmar: (digitado: string) => void;
  aoFechar: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [digitado, setDigitado] = useState("");
  const idCampo = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);

  const liberado = !bloqueado && (!exigir || confereConfirmacao(digitado, exigir));
  const fechar = () => {
    setDigitado("");
    aoFechar();
  };

  return (
    <dialog
      ref={ref}
      onClose={fechar}
      onClick={(e) => e.target === ref.current && fechar()}
      className="m-auto w-[min(92vw,30rem)] rounded-2xl border border-branco/12 bg-[#141414] p-0 text-branco shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <form
        method="dialog"
        className="space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (liberado && !ocupado) aoConfirmar(digitado);
        }}
      >
        <h2 className={`text-lg font-bold tracking-tight ${perigo ? "text-vermelho" : ""}`}>{titulo}</h2>
        <div className="space-y-2 text-sm leading-relaxed text-gray-700">{children}</div>
        {exigir && (
          <label htmlFor={idCampo} className="block space-y-1.5">
            <span className="block text-xs text-gray-600">
              Para confirmar, digite o nome do cliente: <b className="text-branco select-all">{exigir}</b>
            </span>
            <input
              id={idCampo}
              value={digitado}
              onChange={(e) => setDigitado(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-xl border border-gray-400 bg-fundo px-3 py-2 text-sm outline-none transition-colors focus:border-vermelho"
            />
          </label>
        )}
        {erro && (
          <p role="alert" className="text-sm text-vermelho">
            {erro}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={fechar}
            className="cursor-pointer rounded-full border border-branco/25 bg-branco/5 px-5 py-2 text-sm font-medium transition-colors hover:border-branco/50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!liberado || ocupado}
            className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40 ${
              perigo ? "bg-vermelho text-branco" : "bg-verde text-fundo"
            }`}
          >
            {ocupado ? "Aguarde…" : rotuloConfirmar}
          </button>
        </div>
      </form>
    </dialog>
  );
}

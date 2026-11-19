"use client";

// Botão "Enviar por e-mail" do boletim: envia agora o mesmo e-mail do cron de sexta,
// no tema (claro ou escuro) escolhido na barra da página.

import { useState, useTransition } from "react";
import { enviarBoletimAgora } from "@/app/acoes";
import { IconeEmail } from "@/components/ui/icones";
import { useTemaDaFolha } from "./imprimir";

export function BotaoEnviarBoletim() {
  const [enviando, iniciar] = useTransition();
  const [resultado, setResultado] = useState<{ enviado: boolean; mensagem: string } | null>(null);
  const { tema } = useTemaDaFolha();

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={enviando}
        onClick={() =>
          iniciar(async () => {
            setResultado(null);
            setResultado(await enviarBoletimAgora(tema));
          })
        }
        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-verde/60 px-5 py-2 text-sm font-semibold text-verde transition-colors hover:bg-verde/10 disabled:cursor-wait disabled:opacity-60"
      >
        <IconeEmail className="h-4 w-4" />
        {enviando ? "Enviando…" : "Enviar por e-mail"}
      </button>
      {resultado && (
        <p role="status" className={`text-xs ${resultado.enviado ? "text-verde" : "text-ambar"}`}>
          {resultado.mensagem}
        </p>
      )}
    </div>
  );
}

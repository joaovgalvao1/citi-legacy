"use client";

// Formulário de respostas do legado. Salva um rascunho a cada tecla:
// sair da página e voltar não perde o que foi escrito.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { lerRascunho, registrarLegado, salvarRascunho, useNoNavegador, type Pergunta } from "@/lib/legados";
import { Botao } from "@/components/ui";

type Props = { projetoId: string; membroId: string; perguntas: Pergunta[] };

export function FormLegado(props: Props) {
  // O rascunho vem do localStorage, que só existe no navegador.
  const noNavegador = useNoNavegador();
  if (!noNavegador) return <p className="text-sm text-gray-500">Carregando perguntas…</p>;
  return <Formulario {...props} />;
}

function Formulario({ projetoId, membroId, perguntas }: Props) {
  const router = useRouter();
  const [respostas, setRespostas] = useState(() => lerRascunho(projetoId, membroId, perguntas.length));
  const [erro, setErro] = useState("");
  const respondidas = respostas.filter((r) => r.trim()).length;

  function alterar(i: number, valor: string) {
    const novas = respostas.map((v, j) => (j === i ? valor : v));
    setRespostas(novas);
    salvarRascunho(projetoId, membroId, novas);
    if (erro) setErro("");
  }

  function gerar(e: React.FormEvent) {
    e.preventDefault();
    if (respondidas === 0) {
      setErro("Responda pelo menos uma pergunta para gerar o legado.");
      return;
    }
    registrarLegado(projetoId, membroId, perguntas, respostas.map((r) => r.trim()));
    router.push(`/projetos/${projetoId}/membros/${membroId}/legado/documento`);
  }

  return (
    <form onSubmit={gerar} className="space-y-5">
      {perguntas.map((p, i) => (
        <label key={i} className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-gray-500">{p.secao}</span>
          <span className="mb-1 block text-sm font-semibold text-gray-800">
            {i + 1}. {p.texto}
          </span>
          <textarea
            value={respostas[i]}
            onChange={(e) => alterar(i, e.target.value)}
            rows={3}
            placeholder="Resposta do membro…"
            className="w-full border border-gray-400 bg-white p-2 text-sm"
          />
        </label>
      ))}
      <div className="space-y-2 border-t border-gray-300 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-sm text-gray-600">
            {respondidas} de {perguntas.length} respondidas · rascunho salvo automaticamente
          </span>
          <Botao type="submit">Gerar legado</Botao>
        </div>
        {erro && (
          <p role="alert" className="text-sm font-semibold text-gray-900">
            {erro}
          </p>
        )}
        {respondidas > 0 && respondidas < perguntas.length && (
          <p className="text-xs text-gray-500">
            Perguntas sem resposta aparecem no documento como &quot;sem resposta registrada&quot;.
          </p>
        )}
      </div>
    </form>
  );
}

"use client";

// Peças do wireframe que precisam rodar no navegador (estado local ou localStorage).

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registrarLegado, temLegado, useLegados } from "@/lib/legados";
import { Botao, Selo } from "./index";

/** Selo "Legado registrado" que só aparece se o legado do membro existir. */
export function SeloLegado({ projetoId, membroId }: { projetoId: string; membroId: string }) {
  const legados = useLegados();
  if (!temLegado(legados, projetoId, membroId)) return null;
  return <Selo forte>✓ Legado registrado</Selo>;
}

/** Botão do membro: "Registrar legado" ou "Ver legado", conforme o estado. */
export function AcaoLegado({ projetoId, membroId }: { projetoId: string; membroId: string }) {
  const legados = useLegados();
  const router = useRouter();
  const base = `/projetos/${projetoId}/membros/${membroId}/legado`;
  const registrado = temLegado(legados, projetoId, membroId);
  return (
    <Botao
      variante={registrado ? "secundario" : "primario"}
      onClick={() => router.push(registrado ? `${base}/documento` : base)}
    >
      {registrado ? "Ver legado" : "Registrar legado"}
    </Botao>
  );
}

export function FormLegado({
  projetoId,
  membroId,
  perguntas,
}: {
  projetoId: string;
  membroId: string;
  perguntas: string[];
}) {
  const router = useRouter();
  const [respostas, setRespostas] = useState<string[]>(perguntas.map(() => ""));
  const respondidas = respostas.filter((r) => r.trim()).length;

  function gerar(e: React.FormEvent) {
    e.preventDefault();
    registrarLegado(projetoId, membroId);
    router.push(`/projetos/${projetoId}/membros/${membroId}/legado/documento`);
  }

  return (
    <form onSubmit={gerar} className="space-y-4">
      {perguntas.map((p, i) => (
        <label key={i} className="block">
          <span className="mb-1 block text-sm font-semibold text-gray-800">
            {i + 1}. {p}
          </span>
          <textarea
            value={respostas[i]}
            onChange={(e) => setRespostas((r) => r.map((v, j) => (j === i ? e.target.value : v)))}
            rows={3}
            placeholder="Resposta do membro…"
            className="w-full border border-gray-400 bg-white p-2 text-sm"
          />
        </label>
      ))}
      <div className="flex items-center justify-between gap-4 border-t border-gray-300 pt-4">
        <span className="text-sm text-gray-600">
          {respondidas} de {perguntas.length} respondidas
        </span>
        <Botao type="submit">Gerar legado</Botao>
      </div>
    </form>
  );
}

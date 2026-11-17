"use client";

// Seletor "Projeto todo / etapa", guardado na URL (?etapa=...) para dar para compartilhar o link
// e para a Visão geral abrir a aba já filtrada.

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Projeto } from "@/data";

/** Etapa escolhida na URL (ou undefined = projeto todo). */
export function useEtapaSelecionada(projeto: Projeto) {
  const id = useSearchParams().get("etapa");
  return projeto.etapas.find((e) => e.id === id);
}

export function SeletorEtapa({ projeto }: { projeto: Projeto }) {
  const etapa = useEtapaSelecionada(projeto);
  const router = useRouter();
  const caminho = usePathname();

  return (
    <label className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-gray-600">Mostrar:</span>
      <select
        value={etapa?.id ?? ""}
        onChange={(e) => router.replace(e.target.value ? `${caminho}?etapa=${e.target.value}` : caminho, { scroll: false })}
        className="border border-gray-400 bg-white px-2 py-1.5"
      >
        <option value="">Projeto todo</option>
        {projeto.etapas.map((e) => (
          <option key={e.id} value={e.id}>
            Etapa: {e.nome}
          </option>
        ))}
      </select>
    </label>
  );
}

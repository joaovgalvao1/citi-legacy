"use client";

// Barra de progresso do projeto no cabeçalho, atualizada pelas tasks marcadas.

import type { Projeto } from "@/data";
import { progressoProjeto, textoPrazo } from "@/lib/status";
import { useProjetoComTasks } from "@/lib/tasks";
import { BarraProgresso } from "@/components/ui/progresso";

export function ProgressoDoProjeto({ projeto: original }: { projeto: Projeto }) {
  const projeto = useProjetoComTasks(original);
  const valor = progressoProjeto(projeto);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <BarraProgresso valor={valor} compacta />
      </div>
      <span className="text-sm font-semibold tabular-nums">{Math.round(valor)}%</span>
      <span className="text-sm text-gray-600">{textoPrazo(projeto)}</span>
    </div>
  );
}

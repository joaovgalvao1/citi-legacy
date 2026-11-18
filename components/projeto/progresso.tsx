// Barra de progresso do projeto no cabeçalho (vem do banco; atualiza quando uma task muda).

import type { Projeto } from "@/data";
import { progressoProjeto, textoPrazo } from "@/lib/status";
import { BarraProgresso } from "@/components/ui/progresso";

export function ProgressoDoProjeto({ projeto }: { projeto: Projeto }) {
  const valor = progressoProjeto(projeto);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <BarraProgresso valor={valor} compacta />
      </div>
      <span className="dado text-sm font-semibold">{Math.round(valor)}%</span>
      <span className="dado text-sm text-gray-600">{textoPrazo(projeto)}</span>
    </div>
  );
}

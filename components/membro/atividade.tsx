"use client";

// Commits por mês de um membro, empilhados por projeto.

import type { Semana } from "@/data";
import { DestaqueProvider } from "@/components/graficos/destaque";
import { LinhaDoTempo, type Serie } from "@/components/graficos/linha-do-tempo";

export function AtividadeDoMembro({ series, meses, nome }: { series: Serie[]; meses: Semana[]; nome: string }) {
  return (
    <DestaqueProvider>
      <LinhaDoTempo series={series} semanas={meses} titulo={`Commits por mês de ${nome}`} periodo="mes" />
    </DestaqueProvider>
  );
}

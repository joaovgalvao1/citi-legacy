// Cor de cada membro nos gráficos: a mesma em todas as telas do projeto.
// Paleta neutra provisória; na etapa 3 ela é trocada pela identidade visual do CITi.

import type { Projeto } from "@/data";

const PALETA = ["#5b7db1", "#c8a26b", "#6fa287", "#b9727f", "#8c7db8", "#7a8a99"];

export function corDoMembro(projeto: Projeto, membroId: string) {
  const i = projeto.membros.findIndex((m) => m.id === membroId);
  return PALETA[(i < 0 ? 0 : i) % PALETA.length];
}

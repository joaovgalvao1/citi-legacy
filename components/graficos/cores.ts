// Cores dos gráficos: cada membro (ou projeto) tem a mesma cor em todas as telas.
// Paleta neutra provisória; na etapa 3 ela é trocada pela identidade visual do CITi.

import type { Projeto } from "@/data";

const PALETA = ["#5b7db1", "#c8a26b", "#6fa287", "#b9727f", "#8c7db8", "#7a8a99"];

export function corPorIndice(i: number) {
  return PALETA[(i < 0 ? 0 : i) % PALETA.length];
}

export function corDoMembro(projeto: Projeto, membroId: string) {
  return corPorIndice(projeto.membros.findIndex((m) => m.id === membroId));
}

/** Séries da linha do tempo de um projeto: uma por membro. */
export function seriesDosMembros(projeto: Projeto) {
  return projeto.membros.map((m) => ({ id: m.id, nome: m.nome, cor: corDoMembro(projeto, m.id) }));
}

// Cores dos gráficos: cada membro (ou projeto) tem a mesma cor em todas as telas.
// Paleta da identidade do CITi Legacy para o fundo escuro.

import type { Projeto } from "@/data";

// legível no fundo escuro; sem verde (progresso) e sem âmbar (alertas)
const PALETA = ["#4f9dff", "#c084fc", "#2dd4bf", "#f472b6", "#e2e8f0", "#818cf8"];

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

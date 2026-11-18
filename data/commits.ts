// Commits fictícios. Só é importado por páginas do servidor
// (o JSON de commits não vai para o navegador).

import commitsJson from "./commits.json";

export type Commit = {
  hash: string;
  projetoId: string;
  autor: string;
  data: string;
  mensagem: string;
  /** Arquivos alterados pelo commit. */
  arquivos: string[];
  /** Etapas cujos caminhos casam com algum arquivo alterado. */
  etapas: string[];
  adicionadas: number;
  removidas: number;
  brutas: number;
  efetivas: number;
};

export const commits = commitsJson as Commit[];

/** Commits de uma pessoa (em todos os projetos ou em um), do mais recente para o mais antigo. */
export function commitsDaPessoa(pessoaId: string, projetoId?: string) {
  return commits
    .filter((c) => c.autor === pessoaId && (!projetoId || c.projetoId === projetoId))
    .sort((a, b) => b.data.localeCompare(a.data));
}

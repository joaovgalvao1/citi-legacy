// Commits fictícios. Só é importado por páginas do servidor
// (o JSON de commits não vai para o navegador).

import commitsJson from "./commits.json";

export type Commit = {
  hash: string;
  projetoId: string;
  autor: string;
  data: string;
  etapa: string;
  mensagem: string;
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

/** Commits mais recentes de um projeto (ou de uma etapa dele). */
export function commitsRecentes(projetoId: string, etapaId?: string, limite = 8) {
  return commits
    .filter((c) => c.projetoId === projetoId && (!etapaId || c.etapa === etapaId))
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, limite);
}

/** Commits por mês de uma pessoa, separados por projeto (para a página do membro). */
export function commitsPorMes(pessoaId: string) {
  const meses = new Map<string, Record<string, number>>();
  for (const c of commitsDaPessoa(pessoaId)) {
    const mes = c.data.slice(0, 7);
    const linha = meses.get(mes) ?? {};
    linha[c.projetoId] = (linha[c.projetoId] ?? 0) + 1;
    meses.set(mes, linha);
  }
  if (!meses.size) return [];
  // preenche os meses sem commits entre o primeiro e o último
  const chaves = [...meses.keys()].sort();
  const lista: { semana: string; commits: Record<string, number> }[] = [];
  let [ano, mes] = chaves[0].split("-").map(Number);
  const [anoFim, mesFim] = chaves.at(-1)!.split("-").map(Number);
  while (ano < anoFim || (ano === anoFim && mes <= mesFim)) {
    const chave = `${ano}-${String(mes).padStart(2, "0")}`;
    lista.push({ semana: `${chave}-01`, commits: meses.get(chave) ?? {} });
    mes++;
    if (mes > 12) {
      mes = 1;
      ano++;
    }
  }
  return lista;
}

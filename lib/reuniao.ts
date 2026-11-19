// Conteúdo da reunião da diretoria, usado pela apresentação (/reuniao) e pelo e-mail da reunião.
// Tudo sai dos resumos que já existem: nenhuma chamada nova à IA.

import type { Membro, Projeto, Resumo } from "@/data";
import type { Boletim, ItemBoletim } from "./boletim";

/** Itens da parte do resumo cujo título contém o termo ("travou", "andou", "fazer primeiro"). */
export const parteDoResumo = (r: Resumo | null, termo: RegExp) => r?.secoes.find((s) => termo.test(s.titulo))?.itens ?? [];

/** Pessoas da equipe citadas no texto (nome completo ou primeiro nome). */
export function citados(projeto: Projeto, texto: string): Membro[] {
  return projeto.membros.filter((m) => texto.includes(m.nome) || new RegExp(`\\b${m.nome.split(" ")[0]}\\b`).test(texto));
}

/** Frase principal do projeto: o que travou (atrasado ou atenção) ou o que andou (no prazo). */
export function frasePrincipal(item: ItemBoletim) {
  const lista = item.nivel === "verde" ? parteDoResumo(item.resumo, /andou/i) : parteDoResumo(item.resumo, /travou/i);
  return { frase: lista[0] ?? item.resumo?.secoes[0]?.itens[0] ?? null, tipo: item.nivel === "verde" ? "O que andou" : "O que travou" };
}

/** Prioridades da semana: até 2 itens "O que fazer primeiro" por projeto, com quem é citado em cada um. */
export function prioridadesDaSemana(b: Boletim, projetos: Projeto[]) {
  return b.projetos.flatMap((item) => {
    const projeto = projetos.find((p) => p.id === item.id)!;
    return parteDoResumo(item.resumo, /fazer primeiro/i)
      .slice(0, 2)
      .map((texto) => ({ texto, item, projeto, pessoas: citados(projeto, texto) }));
  });
}

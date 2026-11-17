// Commits fictícios e as perguntas do legado derivadas deles.
// Só é importado por páginas do servidor (o JSON de commits não vai para o navegador).

import commitsJson from "./commits.json";
import type { Membro, Projeto } from "./index";
import { etapasLideradas, icDe } from "@/lib/indice";

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

export function commitsDoMembro(projetoId: string, membroId: string) {
  return commits.filter((c) => c.projetoId === projetoId && c.autor === membroId);
}

/** Etapa em que o membro é mais importante: a de maior IC (priorizando as que lidera). */
export function etapaPrincipal(projeto: Projeto, membro: Membro) {
  const candidatas = etapasLideradas(projeto, membro);
  const lista = candidatas.length ? candidatas : projeto.etapas.map((e) => e.id);
  return [...lista].sort((a, b) => icDe(projeto, membro.id, b) - icDe(projeto, membro.id, a))[0];
}

/** Commits da etapa principal que as perguntas citam. */
export function commitsCitados(projeto: Projeto, membro: Membro) {
  const etapaId = etapaPrincipal(projeto, membro);
  const doMembro = commitsDoMembro(projeto.id, membro.id).filter((c) => c.etapa === etapaId);
  return {
    maior: [...doMembro].filter((c) => c.mensagem.startsWith("feat")).sort((a, b) => b.efetivas - a.efetivas)[0],
    refatoracao: doMembro.find((c) => c.mensagem.startsWith("refactor")),
    correcao: doMembro.find((c) => c.mensagem.startsWith("fix")),
  };
}

/** Até `limite` commits da etapa principal: primeiro os citados, depois os de maior volume efetivo. */
export function commitsEmDestaque(projeto: Projeto, membro: Membro, limite = 6) {
  const etapaId = etapaPrincipal(projeto, membro);
  const citados = Object.values(commitsCitados(projeto, membro)).filter((c): c is Commit => !!c);
  const resto = commitsDoMembro(projeto.id, membro.id)
    .filter((c) => c.etapa === etapaId && !citados.includes(c))
    .sort((a, b) => b.efetivas - a.efetivas);
  return [...citados.map((c) => ({ ...c, citado: true })), ...resto.map((c) => ({ ...c, citado: false }))].slice(
    0,
    limite,
  );
}

const semPrefixo =(mensagem: string) => mensagem.replace(/^\w+\([^)]*\):\s*/, "");

/**
 * Perguntas de exemplo para registrar o legado (etapa 1 e 2).
 * Na etapa 3 serão geradas pela IA a partir destes mesmos commits.
 */
export function perguntasPara(projeto: Projeto, membro: Membro): string[] {
  const etapaId = etapaPrincipal(projeto, membro);
  const etapa = projeto.etapas.find((e) => e.id === etapaId);
  const nome = etapa?.nome ?? "suas etapas";
  const { maior, refatoracao, correcao } = commitsCitados(projeto, membro);

  const perguntas = [
    `Quais decisões em ${nome} não estão óbvias no código, e por que foram tomadas assim?`,
  ];
  if (maior) {
    perguntas.push(
      `No commit ${maior.hash} ("${semPrefixo(maior.mensagem)}"), o que motivou essa abordagem e que alternativas foram descartadas?`,
    );
  }
  if (refatoracao) {
    perguntas.push(
      `Por que foi preciso ${semPrefixo(refatoracao.mensagem).replace(/^\w/, (l) => l.toLowerCase())} (${refatoracao.hash})? O que estava ruim antes?`,
    );
  }
  if (correcao) {
    perguntas.push(
      `O bug corrigido em ${correcao.hash} ("${semPrefixo(correcao.mensagem)}") pode voltar? O que alguém novo precisa saber para não reintroduzi-lo?`,
    );
  }
  perguntas.push(
    `Que combinados com o cliente (${projeto.cliente.split(" · ")[0]}) explicam regras de ${nome}?`,
    `Quem do time deveria assumir ${nome} e o que essa pessoa precisa estudar primeiro?`,
  );
  return perguntas;
}

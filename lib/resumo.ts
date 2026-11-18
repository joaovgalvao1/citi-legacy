// Resumo do projeto: monta o contexto a partir dos dados, pede à IA (Gemini, com Groq de reserva)
// e, se nenhuma IA responder, gera um resumo automático pelas regras. Só roda no servidor.

import type { Projeto } from "@/data";
import { commits } from "@/data/commits";
import { dataReferencia } from "@/data/referencia.json";
import { emPct, lider, ranking } from "./indice";
import { alertas, diasEntre, progressoProjeto, statusEtapa, statusProjeto, textoPrazo, textoPrazoEtapa } from "./status";

export type Secao = { titulo: string; itens: string[] };
export type Resumo = { secoes: Secao[]; fonte: "gemini" | "groq" | "regras"; modelo?: string; geradoEm: string };

const TITULOS_ANDAMENTO = ["O que andou", "O que travou", "O que fazer primeiro"];
const TITULOS_CONCLUIDO = ["O que foi entregue", "Como foi o projeto", "Quem procurar"];

/* ---------- contexto ---------- */

const nomeDe = (projeto: Projeto, id: string) => projeto.membros.find((m) => m.id === id)?.nome ?? id;

export function montarContexto(projeto: Projeto) {
  const concluido = projeto.status === "concluido";
  const doProjeto = commits.filter((c) => c.projetoId === projeto.id).sort((a, b) => b.data.localeCompare(a.data));
  const janela = concluido ? doProjeto : doProjeto.filter((c) => diasEntre(c.data, dataReferencia) <= 21);

  const linhas: string[] = [];
  linhas.push(`Projeto: ${projeto.nome} (cliente: ${projeto.cliente})`);
  linhas.push(`Objetivo: ${projeto.descricao}`);
  linhas.push(
    `Status: ${statusProjeto(projeto)} · progresso ${emPct(progressoProjeto(projeto))} (média das tasks das etapas) · ${textoPrazo(projeto)}`,
  );
  if (projeto.resultados) linhas.push(`Resultados: ${projeto.resultados}`);
  linhas.push(`Data de hoje: ${dataReferencia}`);

  linhas.push("", "Etapas:");
  for (const e of projeto.etapas) {
    const top = lider(projeto, e.id);
    const pendentes = e.tasks.filter((t) => !t.feita).map((t) => t.titulo);
    const feitas = e.tasks.filter((t) => t.feita).length;
    linhas.push(
      `- ${e.nome}: ${statusEtapa(projeto, e)}, ${feitas}/${e.tasks.length} tasks (${emPct(e.progresso)})` +
        `${textoPrazoEtapa(projeto, e) ? `, ${textoPrazoEtapa(projeto, e)}` : ""}` +
        `${top ? `; quem mais sabe: ${top.membro.nome} (IC ${emPct(top.ic)})` : "; sem commits"}` +
        `${pendentes.length && !concluido ? `; pendentes: ${pendentes.join("; ")}` : ""}`,
    );
  }

  const lista = alertas(projeto);
  if (lista.length) {
    linhas.push("", "Alertas:");
    for (const a of lista) linhas.push(`- ${a.texto}`);
  }

  linhas.push("", "Equipe (IC no projeto):");
  for (const l of ranking(projeto)) {
    linhas.push(`- ${l.membro.nome}, ${l.membro.papel}: IC ${emPct(l.ic)}${l.membro.saiuEm ? " (já saiu da empresa)" : ""}`);
  }

  linhas.push("", concluido ? "Commits do projeto (mais recentes primeiro, amostra):" : "Commits das últimas 3 semanas:");
  for (const c of janela.slice(0, concluido ? 30 : 40)) {
    linhas.push(`- ${c.data.slice(0, 10)} ${nomeDe(projeto, c.autor)}: ${c.mensagem}`);
  }
  if (!janela.length) linhas.push("- nenhum commit no período");

  return linhas.join("\n");
}

/* ---------- prompt ---------- */

function prompt(projeto: Projeto, contexto: string) {
  const concluido = projeto.status === "concluido";
  const titulos = concluido ? TITULOS_CONCLUIDO : TITULOS_ANDAMENTO;
  return `Você é o assistente do diretor de projetos de uma empresa júnior de tecnologia (o CITi).
Escreva ${concluido ? "a retrospectiva" : "o resumo da semana"} do projeto abaixo, em português do Brasil, para o diretor ler em 30 segundos.

Regras:
- Use só as informações do contexto; não invente fatos, números, datas ou pessoas.
- Seja específico: cite etapas, tasks e pessoas pelo nome.
- Cada item tem no máximo 25 palavras, sem jargão desnecessário.
- 2 ou 3 itens por seção.
- Responda APENAS com JSON no formato:
{"secoes":[{"titulo":"${titulos[0]}","itens":["..."]},{"titulo":"${titulos[1]}","itens":["..."]},{"titulo":"${titulos[2]}","itens":["..."]}]}
${
  concluido
    ? `- "${titulos[2]}": quem mais sabe das etapas principais e se ainda está na empresa.`
    : `- "${titulos[1]}": etapas atrasadas ou paradas e tasks pendentes importantes; se não houver, diga que está tudo em dia.
- "${titulos[2]}": ações concretas e priorizadas para esta semana.`
}

Contexto:
${contexto}`;
}

/* ---------- provedores ---------- */

function validar(texto: string): Secao[] | null {
  try {
    const limpo = texto.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    const json = JSON.parse(limpo) as { secoes?: Secao[] };
    const secoes = (json.secoes ?? [])
      .filter((s) => s && typeof s.titulo === "string" && Array.isArray(s.itens))
      .map((s) => ({ titulo: s.titulo, itens: s.itens.filter((i) => typeof i === "string" && i.trim()).slice(0, 4) }))
      .filter((s) => s.itens.length);
    return secoes.length ? secoes.slice(0, 3) : null;
  } catch {
    return null;
  }
}

async function comTempoLimite(url: string, init: RequestInit, ms = 12000) {
  const controle = new AbortController();
  const t = setTimeout(() => controle.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controle.signal });
  } finally {
    clearTimeout(t);
  }
}

/**
 * Modelos do Gemini tentados em ordem. GEMINI_MODEL aceita um ou vários, separados por vírgula.
 * Padrão: o Flash Lite (maior cota gratuita: 500 pedidos/dia) e, se ele falhar, os seguintes.
 */
const MODELOS_GEMINI_PADRAO = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-3.5-flash"];

async function gemini(texto: string): Promise<{ secoes: Secao[]; modelo: string } | null> {
  const chave = process.env.GEMINI_API_KEY;
  if (!chave) return null;
  const modelos = (process.env.GEMINI_MODEL || "").split(",").map((m) => m.trim()).filter(Boolean);
  const falhas: string[] = [];
  for (const modelo of modelos.length ? modelos : MODELOS_GEMINI_PADRAO) {
    const r = await comTempoLimite(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": chave },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: texto }] }],
        generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
      }),
    }).catch((e: unknown) => {
      falhas.push(`${modelo}: ${e instanceof Error ? e.name : "erro"}`);
      return null;
    });
    if (!r) continue;
    if (!r.ok) {
      falhas.push(`${modelo}: ${r.status}`);
      continue; // sobrecarregado, indisponível ou limite: tenta o próximo modelo
    }
    const dados = (await r.json()) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] };
    const saida =
      dados.candidates?.[0]?.content?.parts
        ?.filter((p) => !p.thought)
        .map((p) => p.text ?? "")
        .join("") ?? "";
    const secoes = validar(saida);
    if (secoes) return { secoes, modelo };
    falhas.push(`${modelo}: formato inesperado`);
  }
  throw new Error(`Gemini indisponível (${falhas.join(", ")})`);
}

async function groq(texto: string): Promise<{ secoes: Secao[]; modelo: string } | null> {
  const chave = process.env.GROQ_API_KEY;
  if (!chave) return null;
  const modelo = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const r = await comTempoLimite("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${chave}` },
    body: JSON.stringify({
      model: modelo,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: texto }],
    }),
  });
  if (!r.ok) throw new Error(`Groq respondeu ${r.status}`);
  const dados = (await r.json()) as { choices?: { message?: { content?: string } }[] };
  const secoes = validar(dados.choices?.[0]?.message?.content ?? "");
  if (!secoes) throw new Error("Groq devolveu um formato inesperado");
  return { secoes, modelo };
}

/* ---------- reserva: resumo automático pelas regras ---------- */

export function resumoPorRegras(projeto: Projeto): Secao[] {
  const concluido = projeto.status === "concluido";
  const doProjeto = commits.filter((c) => c.projetoId === projeto.id);

  if (concluido) {
    const principais = [...projeto.etapas]
      .map((e) => ({ e, n: doProjeto.filter((c) => c.etapas.includes(e.id)).length }))
      .sort((a, b) => b.n - a.n);
    return [
      {
        titulo: TITULOS_CONCLUIDO[0],
        itens: [
          `${projeto.etapas.length} etapas concluídas: ${projeto.etapas.map((e) => e.nome).join(", ")}.`,
          ...(projeto.resultados ? [projeto.resultados] : []),
        ],
      },
      {
        titulo: TITULOS_CONCLUIDO[1],
        itens: [
          `${textoPrazo(projeto).replace(/^./, (l) => l.toUpperCase())}.`,
          `${doProjeto.length} commits; as etapas com mais atividade foram ${principais
            .slice(0, 2)
            .map((x) => `${x.e.nome} (${x.n})`)
            .join(" e ")}.`,
        ],
      },
      {
        titulo: TITULOS_CONCLUIDO[2],
        itens: principais.slice(0, 3).flatMap(({ e }) => {
          const top = lider(projeto, e.id);
          return top ? [`${e.nome}: ${top.membro.nome} (IC ${emPct(top.ic)})${top.membro.saiuEm ? ", que já saiu da empresa" : ""}.`] : [];
        }),
      },
    ];
  }

  const recentes = doProjeto.filter((c) => diasEntre(c.data, dataReferencia) <= 14);
  const porEtapa = projeto.etapas
    .map((e) => ({ e, n: recentes.filter((c) => c.etapas.includes(e.id)).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  const lista = alertas(projeto);
  const proximas = projeto.etapas
    .filter((e) => statusEtapa(projeto, e) !== "Concluída" && statusEtapa(projeto, e) !== "Em planejamento")
    .sort((a, b) => a.fimPrevisto.localeCompare(b.fimPrevisto))
    .slice(0, 3);

  return [
    {
      titulo: TITULOS_ANDAMENTO[0],
      itens: porEtapa.length
        ? porEtapa.slice(0, 3).map((x) => `${x.e.nome}: ${x.n} commits nas últimas 2 semanas, ${emPct(x.e.progresso)} das tasks concluídas.`)
        : ["Nenhum commit nas últimas 2 semanas."],
    },
    {
      titulo: TITULOS_ANDAMENTO[1],
      itens: lista.length ? lista.slice(0, 3).map((a) => `${a.texto}.`) : ["Nenhuma etapa atrasada ou parada."],
    },
    {
      titulo: TITULOS_ANDAMENTO[2],
      itens: proximas.map((e) => {
        const pendente = e.tasks.find((t) => !t.feita);
        const top = lider(projeto, e.id);
        return `${e.nome} (${textoPrazoEtapa(projeto, e)}): ${pendente ? `concluir "${pendente.titulo}"` : "revisar a entrega"}${top ? ` com ${top.membro.nome}` : ""}.`;
      }),
    },
  ].filter((s) => s.itens.length);
}

/* ---------- ponto de entrada ---------- */

export async function gerarResumo(projeto: Projeto): Promise<Resumo & { aviso?: string }> {
  const geradoEm = new Date().toISOString();
  const texto = prompt(projeto, montarContexto(projeto));
  const falhas: string[] = [];

  for (const [fonte, provedor] of [
    ["gemini", gemini],
    ["groq", groq],
  ] as const) {
    try {
      const r = await provedor(texto);
      if (r) return { secoes: r.secoes, fonte, modelo: r.modelo, geradoEm };
    } catch (erro) {
      falhas.push(erro instanceof Error ? erro.message : String(erro));
    }
  }

  return {
    secoes: resumoPorRegras(projeto),
    fonte: "regras",
    geradoEm,
    aviso: falhas.length ? `IA indisponível (${falhas.join("; ")})` : "Nenhuma chave de IA configurada",
  };
}

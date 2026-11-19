// Resumos da IA. Só roda no servidor (cron semanal e script de carga), nunca a cada visita.
//
//   • Projeto em andamento → resumo SEMANAL. O contexto é a semana (commits daquela semana) mais os
//     resumos das semanas anteriores, com a instrução de não repetir o que já foi dito.
//   • Projeto concluído → resumo FINAL, gerado uma única vez e guardado.
//
// Provedores em ordem: Gemini (lista de modelos) → resumo automático pelas regras.

import { and, desc, eq } from "drizzle-orm";
import { db, esquema } from "@/db/conexao";
import type { Commit, Projeto, Resumo } from "@/data";
import { inicioDaSemana } from "./analise";
import { emPct, lider, ranking } from "./indice";
import { alertas, diasEntre, progressoProjeto, statusEtapa, statusProjeto, textoPrazo, textoPrazoEtapa } from "./status";

export type Secao = { titulo: string; itens: string[] };
type Gerado = { secoes: Secao[]; fonte: Resumo["fonte"]; modelo: string | null; aviso?: string };

const TITULOS_SEMANA = ["O que andou", "O que travou", "O que fazer primeiro"];
const TITULOS_FINAL = ["O que foi entregue", "Como foi o projeto", "Quem procurar"];
const DIA = 86400000;

const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const somarDias = (iso: string, n: number) => new Date(new Date(`${iso}T12:00:00Z`).getTime() + n * DIA).toISOString().slice(0, 10);
const nomeDe = (projeto: Projeto, id: string) => projeto.membros.find((m) => m.id === id)?.nome ?? id;

/* ---------- contexto ---------- */

function cabecalho(projeto: Projeto) {
  return [
    `Projeto: ${projeto.nome} (cliente: ${projeto.cliente})`,
    `Objetivo: ${projeto.descricao}`,
    ...(projeto.contexto ? [`Contexto: ${projeto.contexto}`] : []),
  ];
}

function linhasEtapas(projeto: Projeto, comPendentes: boolean) {
  return projeto.etapas.map((e) => {
    const top = lider(projeto, e.id);
    const pendentes = e.tasks.filter((t) => !t.feita).map((t) => t.titulo);
    return (
      `- ${e.nome}: ${statusEtapa(projeto, e)}, ${e.tasks.filter((t) => t.feita).length}/${e.tasks.length} tasks (${emPct(e.progresso)})` +
      `${textoPrazoEtapa(projeto, e) ? `, ${textoPrazoEtapa(projeto, e)}` : ""}` +
      `${top ? `; quem mais sabe: ${top.membro.nome} (IC ${emPct(top.ic)})` : "; sem commits"}` +
      `${comPendentes && pendentes.length ? `; pendentes: ${pendentes.join("; ")}` : ""}`
    );
  });
}

function contextoSemanal(projeto: Projeto, commits: Commit[], semana: string, anteriores: Resumo[], atual: boolean) {
  const fim = somarDias(semana, 7);
  const daSemana = commits.filter((c) => c.data.slice(0, 10) >= semana && c.data.slice(0, 10) < fim);
  const linhas = [...cabecalho(projeto), `Semana: ${ddmm(semana)} a ${ddmm(somarDias(semana, 6))}`, ""];

  if (atual) {
    linhas.push(`Situação atual: ${statusProjeto(projeto)} · progresso ${emPct(progressoProjeto(projeto))} · ${textoPrazo(projeto)}`, "Etapas:");
    linhas.push(...linhasEtapas(projeto, true));
    const lista = alertas(projeto);
    if (lista.length) linhas.push("Alertas:", ...lista.map((a) => `- ${a.texto}`));
  } else {
    linhas.push("Etapas (prazos previstos):", ...projeto.etapas.map((e) => `- ${e.nome}: de ${ddmm(e.inicioPrevisto)} a ${ddmm(e.fimPrevisto)}`));
  }

  linhas.push("", `Commits desta semana (${daSemana.length}):`);
  for (const c of daSemana) linhas.push(`- ${c.data.slice(0, 10)} ${nomeDe(projeto, c.autor)} [${c.etapas.join(", ")}]: ${c.mensagem}`);
  if (!daSemana.length) linhas.push("- nenhum commit nesta semana");

  if (anteriores.length) {
    linhas.push("", "Resumos das semanas anteriores (do mais recente ao mais antigo; NÃO repita o que já foi dito):");
    for (const r of anteriores) {
      linhas.push(`Semana de ${ddmm(r.semana)}:`);
      for (const s of r.secoes) linhas.push(`  ${s.titulo}: ${s.itens.join(" | ")}`);
    }
  }
  return linhas.join("\n");
}

function contextoFinal(projeto: Projeto, commits: Commit[]) {
  const linhas = [
    ...cabecalho(projeto),
    `Status: ${statusProjeto(projeto)} · ${textoPrazo(projeto)}`,
    ...(projeto.resultados ? [`Resultados: ${projeto.resultados}`] : []),
    "",
    "Etapas:",
    ...linhasEtapas(projeto, false),
    "",
    "Equipe (IC no projeto):",
    ...ranking(projeto).map((l) => `- ${l.membro.nome}, ${l.membro.papel}: IC ${emPct(l.ic)}${l.membro.saiuEm ? " (já saiu da empresa)" : ""}`),
    "",
    `Commits do projeto (${commits.length}; amostra dos mais recentes):`,
    ...commits.slice(0, 40).map((c) => `- ${c.data.slice(0, 10)} ${nomeDe(projeto, c.autor)}: ${c.mensagem}`),
  ];
  return linhas.join("\n");
}

function formato(titulos: string[]) {
  return `Responda APENAS com JSON no formato:
{"secoes":[{"titulo":"${titulos[0]}","itens":["..."]},{"titulo":"${titulos[1]}","itens":["..."]},{"titulo":"${titulos[2]}","itens":["..."]}]}`;
}

const REGRAS = `Regras:
- Use só as informações do contexto; não invente fatos, números, datas ou pessoas.
- Seja específico: cite etapas, tasks e pessoas pelo nome.
- Cada item tem no máximo 25 palavras. 2 ou 3 itens por seção.`;

function promptSemanal(contexto: string, temAnteriores: boolean) {
  return `Você é o assistente do diretor de projetos de uma empresa júnior de tecnologia (o CITi).
Escreva o resumo DESTA SEMANA do projeto abaixo, em português do Brasil, para o diretor ler em 30 segundos.

${REGRAS}
${
  temAnteriores
    ? `- Os resumos das semanas anteriores estão no contexto. NÃO repita o que já foi dito: foque no que é novo ou mudou nesta semana.
- Se algo já citado continua travado, diga em poucas palavras que "continua", sem repetir os detalhes.`
    : ""
}
- "O que travou": etapas atrasadas, paradas ou sem avanço; se não houver, diga que não há bloqueios novos.
- "O que fazer primeiro": ações concretas e priorizadas para a próxima semana.
${formato(TITULOS_SEMANA)}

Contexto:
${contexto}`;
}

function promptFinal(contexto: string) {
  return `Você é o assistente do diretor de projetos de uma empresa júnior de tecnologia (o CITi).
Escreva a retrospectiva final do projeto concluído abaixo, em português do Brasil. Ela fica guardada como o legado do projeto.

${REGRAS}
- "Quem procurar": quem mais sabe das etapas principais e se ainda está na empresa.
${formato(TITULOS_FINAL)}

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

/* ---------- ritmo dos pedidos à IA (limites do plano gratuito) ---------- */
// Gemini gratuito: ~15 pedidos por minuto. Um pedido a cada 4,5 s (≈13/min) fica abaixo do limite.
// IA_INTERVALO_MS ajusta o intervalo. Cada pedido também respeita um prazo (o tempo máximo da função
// na Vercel): sem tempo para esperar a resposta, desiste e usa o resumo automático (regras).

const INTERVALO_MS = Number(process.env.IA_INTERVALO_MS) || 4500;
const TEMPO_PEDIDO_MS = 15000;
const ESPERAS_NOVA_TENTATIVA_MS = [10000, 25000];
let proximoLivre = 0;
let prazo = Infinity;

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Define até quando (timestamp) os pedidos à IA podem rodar nesta execução (ex.: o limite da função). */
export function definirPrazoIA(ate: number) {
  prazo = ate;
}

/** Ainda dá tempo de esperar `ms` e fazer um pedido completo antes do prazo? */
const cabe = (ms = 0) => Date.now() + ms + TEMPO_PEDIDO_MS <= prazo;

/** Espera a vez do próximo pedido, respeitando o intervalo mínimo entre pedidos. */
async function aguardarVez() {
  const agora = Date.now();
  const espera = Math.max(0, proximoLivre - agora);
  proximoLivre = Math.max(agora, proximoLivre) + INTERVALO_MS;
  if (espera) await dormir(espera);
}

async function comTempoLimite(url: string, init: RequestInit, ms = TEMPO_PEDIDO_MS) {
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
    if (!cabe(Math.max(0, proximoLivre - Date.now()))) {
      falhas.push(`${modelo}: sem tempo`);
      break;
    }
    await aguardarVez();
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
      continue; // sobrecarregado (503), cota (429) ou indisponível (404): tenta o próximo
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

async function pedirIA(texto: string, reserva: () => Secao[]): Promise<Gerado> {
  const falhas: string[] = [];
  let algumaChave = false;
  // primeira tentativa e, se a IA estiver sobrecarregada ou no limite, mais duas (após 10 s e 25 s)
  for (const espera of [0, ...ESPERAS_NOVA_TENTATIVA_MS]) {
    if (espera) {
      if (!cabe(espera)) break;
      await dormir(espera);
    }
    try {
      const r = await gemini(texto);
      if (r) return { secoes: r.secoes, fonte: "gemini", modelo: r.modelo };
    } catch (erro) {
      algumaChave = true;
      falhas.push(erro instanceof Error ? erro.message : String(erro));
    }
    if (!algumaChave) break; // sem nenhuma chave configurada: não adianta tentar de novo
  }
  return {
    secoes: reserva(),
    fonte: "regras",
    modelo: null,
    aviso: falhas.length ? `IA indisponível (${falhas.slice(-2).join("; ")})` : "Nenhuma chave de IA configurada",
  };
}

/* ---------- reserva: resumo automático pelas regras ---------- */

function regrasSemana(projeto: Projeto, commits: Commit[], semana: string): Secao[] {
  const fim = somarDias(semana, 7);
  const daSemana = commits.filter((c) => c.data.slice(0, 10) >= semana && c.data.slice(0, 10) < fim);
  const porEtapa = projeto.etapas
    .map((e) => ({ e, n: daSemana.filter((c) => c.etapas.includes(e.id)).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  const lista = alertas(projeto);
  const proximas = projeto.etapas
    .filter((e) => statusEtapa(projeto, e) !== "Concluída" && statusEtapa(projeto, e) !== "Em planejamento")
    .sort((a, b) => a.fimPrevisto.localeCompare(b.fimPrevisto))
    .slice(0, 3);
  return [
    {
      titulo: TITULOS_SEMANA[0],
      itens: porEtapa.length ? porEtapa.slice(0, 3).map((x) => `${x.e.nome}: ${x.n} commits na semana.`) : ["Nenhum commit nesta semana."],
    },
    { titulo: TITULOS_SEMANA[1], itens: lista.length ? lista.slice(0, 3).map((a) => `${a.texto}.`) : ["Nenhuma etapa atrasada ou parada."] },
    {
      titulo: TITULOS_SEMANA[2],
      itens: proximas.map((e) => {
        const pendente = e.tasks.find((t) => !t.feita);
        const top = lider(projeto, e.id);
        return `${e.nome}: ${pendente ? `concluir "${pendente.titulo}"` : "revisar a entrega"}${top ? ` com ${top.membro.nome}` : ""}.`;
      }),
    },
  ].filter((s) => s.itens.length);
}

function regrasFinal(projeto: Projeto, commits: Commit[]): Secao[] {
  const principais = projeto.etapas
    .map((e) => ({ e, n: commits.filter((c) => c.etapas.includes(e.id)).length }))
    .sort((a, b) => b.n - a.n);
  return [
    { titulo: TITULOS_FINAL[0], itens: [`${projeto.etapas.length} etapas concluídas.`, ...(projeto.resultados ? [projeto.resultados] : [])] },
    { titulo: TITULOS_FINAL[1], itens: [`${textoPrazo(projeto).replace(/^./, (l) => l.toUpperCase())}.`, `${commits.length} commits no total.`] },
    {
      titulo: TITULOS_FINAL[2],
      itens: principais.slice(0, 3).flatMap(({ e }) => {
        const top = lider(projeto, e.id);
        return top ? [`${e.nome}: ${top.membro.nome}${top.membro.saiuEm ? " (já saiu da empresa)" : ""}.`] : [];
      }),
    },
  ];
}

/* ---------- geração e gravação ---------- */

async function anterioresDe(projetoId: string, semana: string, limite = 4): Promise<Resumo[]> {
  const linhas = await db
    .select()
    .from(esquema.resumos)
    .where(and(eq(esquema.resumos.projetoId, projetoId), eq(esquema.resumos.tipo, "semanal")))
    .orderBy(desc(esquema.resumos.semana));
  return linhas
    .filter((r) => r.semana < semana)
    .slice(0, limite)
    .map((r) => ({ tipo: "semanal", semana: r.semana, secoes: r.secoes, fonte: r.fonte as Resumo["fonte"], modelo: r.modelo, geradoEm: r.geradoEm.toISOString() }));
}

async function gravar(projetoId: string, tipo: "semanal" | "final", semana: string, g: Gerado) {
  await db
    .insert(esquema.resumos)
    .values({ projetoId, tipo, semana, secoes: g.secoes, fonte: g.fonte, modelo: g.modelo })
    .onConflictDoUpdate({
      target: [esquema.resumos.projetoId, esquema.resumos.tipo, esquema.resumos.semana],
      set: { secoes: g.secoes, fonte: g.fonte, modelo: g.modelo, geradoEm: new Date() },
    });
}

/** Gera e grava o resumo de uma semana (segunda-feira "aaaa-mm-dd") de um projeto em andamento. */
export async function gerarResumoSemanal(projeto: Projeto, commits: Commit[], semana: string) {
  const anteriores = await anterioresDe(projeto.id, semana);
  const atual = semana >= inicioDaSemana(somarDias(projeto.hoje, -7));
  const texto = promptSemanal(contextoSemanal(projeto, commits, semana, anteriores, atual), anteriores.length > 0);
  const g = await pedirIA(texto, () => regrasSemana(projeto, commits, semana));
  await gravar(projeto.id, "semanal", semana, g);
  return g;
}

/** Gera e grava o resumo final de um projeto concluído (só se ainda não existir, a menos que forcar=true). */
export async function gerarResumoFinal(projeto: Projeto, commits: Commit[], forcar = false) {
  if (!forcar) {
    const existe = await db
      .select({ id: esquema.resumos.id })
      .from(esquema.resumos)
      .where(and(eq(esquema.resumos.projetoId, projeto.id), eq(esquema.resumos.tipo, "final")));
    if (existe.length) return null;
  }
  const g = await pedirIA(promptFinal(contextoFinal(projeto, commits)), () => regrasFinal(projeto, commits));
  await gravar(projeto.id, "final", "", g);
  return g;
}

export { diasEntre };

/** O resumo já existe e foi feito pela IA (não precisa gerar de novo)? */
export async function resumoPronto(projetoId: string, tipo: "semanal" | "final", semana = "") {
  const [r] = await db
    .select({ fonte: esquema.resumos.fonte })
    .from(esquema.resumos)
    .where(and(eq(esquema.resumos.projetoId, projetoId), eq(esquema.resumos.tipo, tipo), eq(esquema.resumos.semana, semana)));
  return !!r && r.fonte !== "regras";
}

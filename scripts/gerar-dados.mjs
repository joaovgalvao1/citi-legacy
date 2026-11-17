// Gera os dados estáticos do protótipo a partir de scripts/cenarios.mjs.
//
//   node scripts/gerar-dados.mjs
//
// Saída em data/:
//   projetos.json  pessoas, projetos (status, prazos, progresso das etapas) e membros
//   commits.json   commits fictícios (autor, data, mensagem, etapa, linhas)
//   analises.json  participação pré-calculada por membro × etapa nas três métricas,
//                  IC, concentração, primeiro/último commit das etapas e atividade semanal
//
// Métricas:
//   linhas brutas   = adicionadas + removidas (todo o volume que a pessoa mexeu)
//   linhas efetivas = linhas adicionadas que ainda existem no código hoje
//   commits         = quantidade de commits
//
// A partir delas, calcula o Índice de Conhecimento (IC) (ver abaixo).
// Projetos em andamento têm commits até a véspera da data de referência; os concluídos, até a entrega.
//
// O gerador é determinístico (semente fixa): rodar de novo produz os mesmos dados.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cenarios, dataReferencia, pessoas } from "./cenarios.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ---------- aleatoriedade determinística ---------- */

function mulberry32(semente) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261119);
const entre = (min, max) => min + rand() * (max - min);
const inteiro = (min, max) => Math.floor(entre(min, max + 1));
const escolher = (lista) => lista[Math.floor(rand() * lista.length)];
const embaralhar = (lista) => {
  const c = [...lista];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
};
const normal = () => Math.sqrt(-2 * Math.log(rand() || 1e-9)) * Math.cos(2 * Math.PI * rand());
const limitar = (v, min, max) => Math.min(max, Math.max(min, v));
const hash = () => Array.from({ length: 7 }, () => "0123456789abcdef"[inteiro(0, 15)]).join("");

/* ---------- mensagens ---------- */

const multiplicadorTipo = { feat: 1.3, fix: 0.4, refactor: 1.0, perf: 0.8, test: 0.8, docs: 0.4, style: 0.5, chore: 0.4 };

const genericas = {
  fix: ["ajustes da revisão do PR #{pr}", "corrige bug reportado pelo cliente", "corrige teste quebrado"],
  refactor: ["remove código morto", "renomeia funções para o padrão do projeto", "simplifica tratamento de erros"],
  feat: ["melhorias pedidas na reunião com o cliente", "ajustes de usabilidade"],
  chore: ["atualiza dependências", "ajusta configuração do lint"],
  test: ["aumenta cobertura de testes"],
};
const sufixos = [" (parte 2)", " — ajustes", " após revisão"];

// Primeira rodada segue a ordem escrita no cenário (do básico ao refinamento);
// depois disso, mensagens repetidas viram ajustes ou mensagens genéricas.
function criarFila(templates) {
  let fila = [...templates].reverse();
  let rodada = 0;
  return () => {
    if (!fila.length) {
      fila = embaralhar(templates);
      rodada++;
    }
    const [tipo, texto] = fila.pop();
    if (rodada === 0) return [tipo, texto];
    if (rand() < 0.5 && genericas[tipo]) {
      return [tipo, escolher(genericas[tipo]).replace("{pr}", String(inteiro(12, 140)))];
    }
    return [tipo, texto + escolher(sufixos)];
  };
}

/* ---------- datas ---------- */

const DIA = 86400000;
const paraData = (iso) => new Date(`${iso}T00:00:00-03:00`);

function dataDoCommit(inicio, fim, [de, ate]) {
  const total = fim - inicio;
  let d = new Date(inicio.getTime() + total * entre(de, ate));
  const dow = d.getUTCDay(); // aproximação suficiente para o fuso -03:00
  if ((dow === 0 || dow === 6) && rand() < 0.6) d = new Date(d.getTime() + (dow === 6 ? -1 : 1) * DIA);
  const noite = rand() < 0.7; // membros de EJ commitam mais à noite
  const hora = noite ? inteiro(18, 23) : inteiro(9, 17);
  const ymd = new Date(d.getTime() - 3 * 3600000).toISOString().slice(0, 10);
  return `${ymd}T${String(hora).padStart(2, "0")}:${String(inteiro(0, 59)).padStart(2, "0")}:00-03:00`;
}

function inicioDaSemana(isoData) {
  const d = new Date(isoData.slice(0, 10) + "T12:00:00Z");
  const dow = (d.getUTCDay() + 6) % 7; // segunda = 0
  return new Date(d.getTime() - dow * DIA).toISOString().slice(0, 10);
}

/* ---------- Índice de Conhecimento e risco ----------
 *
 * IC (0 a 100) de um membro numa etapa = média ponderada das fatias dele em:
 *   linhas efetivas (50%) · commits (20%) · linhas brutas (15%) ·
 *   linhas efetivas recentes (15%, com meia-vida de 45 dias)
 * Em cada etapa, a soma dos IC dos membros é 100.
 *
 * Concentração = soma dos (IC/100)² da etapa (índice HHI): 1 = uma pessoa sabe tudo.
 *
 * O risco (pela concentração) e a urgência (pela data de saída) são classificados
 * no app, em lib/indice.ts. Aqui só se grava quantos dias faltam para cada saída.
 */

export const PESOS_IC = { efetivas: 0.5, commits: 0.2, brutas: 0.15, recentes: 0.15 };
const MEIA_VIDA_DIAS = 45;

// ref = data de referência do projeto (hoje, ou a entrega se já foi concluído)
function indiceConhecimento(lista, membroIds, ref) {
  const sinais = {
    efetivas: (k) => k.efetivas,
    commits: () => 1,
    brutas: (k) => k.brutas,
    recentes: (k) => k.efetivas * Math.pow(0.5, (ref - new Date(k.data)) / DIA / MEIA_VIDA_DIAS),
  };
  const ic = Object.fromEntries(membroIds.map((id) => [id, 0]));
  // fatias: % de cada sinal que pertence ao membro (para explicar o IC na tela)
  const fatias = Object.fromEntries(membroIds.map((id) => [id, { efetivas: 0, commits: 0, brutas: 0, recentes: 0 }]));
  for (const [sinal, f] of Object.entries(sinais)) {
    const total = lista.reduce((s, k) => s + f(k), 0);
    if (!total) continue;
    for (const k of lista) {
      ic[k.autor] += (PESOS_IC[sinal] * f(k)) / total;
      fatias[k.autor][sinal] += (100 * f(k)) / total;
    }
  }
  for (const id of membroIds) {
    ic[id] = Math.round(ic[id] * 1000) / 10;
    for (const sinal of Object.keys(sinais)) fatias[id][sinal] = Math.round(fatias[id][sinal] * 10) / 10;
  }
  return { ic, fatias };
}


/* ---------- geração ---------- */

const projetosSaida = [];
const commitsSaida = [];
const analisesSaida = {};

for (const c of cenarios) {
  const inicio = paraData(c.inicio);
  // último dia com commits: a entrega (concluído) ou a véspera de hoje (em andamento)
  const fim = c.status === "concluido" ? paraData(c.entrega) : new Date(paraData(dataReferencia).getTime() - DIA);
  const filas = Object.fromEntries(Object.entries(c.mensagens).map(([e, t]) => [e, criarFila(t)]));
  // 1) esqueleto: quem commitou, em qual etapa e quando
  const esqueletos = [];
  for (const m of c.membros) {
    for (const [etapaId, [qtd, media, sobrevivencia]] of Object.entries(m.plano)) {
      const etapa = c.etapas.find((e) => e.id === etapaId);
      for (let i = 0; i < qtd; i++) {
        esqueletos.push({ m, etapaId, media, sobrevivencia, data: dataDoCommit(inicio, fim, etapa.janela) });
      }
    }
  }
  esqueletos.sort((a, b) => a.data.localeCompare(b.data));

  // 2) mensagens e linhas atribuídas em ordem cronológica dentro de cada etapa
  const commits = [];
  {
    for (const { m, etapaId, media, sobrevivencia, data } of esqueletos) {
      {
        const [tipo, texto] = filas[etapaId]();
        const adicionadas = Math.max(1, Math.round(media * multiplicadorTipo[tipo] * entre(0.4, 1.8)));
        let sobrev = limitar(sobrevivencia + normal() * 0.08, 0.05, 1);
        if (tipo === "refactor") sobrev = limitar(sobrev - 0.1, 0.05, 1);
        const efetivas = Math.round(adicionadas * sobrev);
        const removidas = Math.round(
          adicionadas * (1 - sobrev) * entre(0.6, 1.4) +
            adicionadas * (tipo === "refactor" ? 0.6 : 0.1 * rand()),
        );
        commits.push({
          hash: hash(),
          projetoId: c.id,
          autor: m.id,
          data,
          etapa: etapaId,
          mensagem: `${tipo}(${etapaId}): ${texto}`,
          adicionadas,
          removidas,
          brutas: adicionadas + removidas,
          efetivas,
        });
      }
    }
  }
  commits.sort((a, b) => a.data.localeCompare(b.data));
  commitsSaida.push(...commits);

  /* ----- análises ----- */
  const zero = () => ({ efetivas: 0, brutas: 0, commits: 0 });
  const porMembro = Object.fromEntries(
    c.membros.map((m) => [m.id, { total: zero(), porEtapa: Object.fromEntries(c.etapas.map((e) => [e.id, zero()])) }]),
  );
  const porEtapa = Object.fromEntries(c.etapas.map((e) => [e.id, { total: zero() }]));
  const totais = zero();
  const semanas = {};

  for (const k of commits) {
    for (const alvo of [porMembro[k.autor].total, porMembro[k.autor].porEtapa[k.etapa], porEtapa[k.etapa].total, totais]) {
      alvo.efetivas += k.efetivas;
      alvo.brutas += k.brutas;
      alvo.commits += 1;
    }
    const s = inicioDaSemana(k.data);
    semanas[s] ??= Object.fromEntries(c.membros.map((m) => [m.id, 0]));
    semanas[s][k.autor] += 1;
  }

  for (const e of c.etapas) {
    const daEtapa = commits.filter((k) => k.etapa === e.id);
    porEtapa[e.id].primeiroCommit = daEtapa[0]?.data.slice(0, 10) ?? null;
    porEtapa[e.id].ultimoCommit = daEtapa.at(-1)?.data.slice(0, 10) ?? null;
  }

  // todas as semanas do projeto (inclusive as sem commits), de segunda a segunda
  const listaSemanas = [];
  for (let d = paraData(inicioDaSemana(c.inicio + "T12:00:00")); d <= fim; d = new Date(d.getTime() + 7 * DIA)) {
    listaSemanas.push(new Date(d.getTime() - 3 * 3600000).toISOString().slice(0, 10));
  }

  /* ----- Índice de Conhecimento (IC) e concentração ----- */
  const icDe = (lista) => indiceConhecimento(lista, c.membros.map((m) => m.id), fim);
  const doProjeto = icDe(commits);
  for (const m of c.membros) {
    porMembro[m.id].icProjeto = doProjeto.ic[m.id];
    porMembro[m.id].fatiasProjeto = doProjeto.fatias[m.id];
  }

  for (const e of c.etapas) {
    const reg = porEtapa[e.id];
    const resultado = icDe(commits.filter((k) => k.etapa === e.id));
    reg.ic = resultado.ic;
    reg.fatias = Object.fromEntries(Object.entries(resultado.fatias).filter(([id]) => resultado.ic[id] > 0));
    reg.semanas = listaSemanas.map((semana) => ({
      semana,
      commits: Object.fromEntries(
        c.membros.map((m) => [
          m.id,
          commits.filter((k) => k.etapa === e.id && k.autor === m.id && inicioDaSemana(k.data) === semana).length,
        ]),
      ),
    }));
    reg.concentracao = Math.round(Object.values(reg.ic).reduce((s, v) => s + (v / 100) ** 2, 0) * 100) / 100;
  }

  analisesSaida[c.id] = {
    indice: { pesos: PESOS_IC, meiaVidaDias: MEIA_VIDA_DIAS },
    totais,
    porMembro,
    porEtapa,
    semanas: listaSemanas.map((semana) => ({
      semana,
      commits: semanas[semana] ?? Object.fromEntries(c.membros.map((m) => [m.id, 0])),
    })),
  };

  projetosSaida.push({
    id: c.id,
    nome: c.nome,
    cliente: c.cliente,
    descricao: c.descricao,
    ...(c.contexto ? { contexto: c.contexto } : {}),
    ...(c.resultados ? { resultados: c.resultados, resumoResultado: c.resumoResultado } : {}),
    caseReal: !!c.caseReal,
    status: c.status,
    inicio: c.inicio,
    fimPrevisto: c.fimPrevisto,
    ...(c.entrega ? { entrega: c.entrega } : {}),
    etapas: c.etapas.map(({ id, nome, descricao, previsto, progresso }) => ({
      id,
      nome,
      descricao,
      inicioPrevisto: previsto[0],
      fimPrevisto: previsto[1],
      progresso,
    })),
    membros: c.membros.map(({ id, papel }) => ({ id, papel })),
  });
}

const pessoasSaida = pessoas;

mkdirSync(join(raiz, "data"), { recursive: true });
const salvar = (nome, dados) => writeFileSync(join(raiz, "data", nome), JSON.stringify(dados, null, 2) + "\n");
salvar("projetos.json", { dataReferencia, pessoas: pessoasSaida, projetos: projetosSaida });
// arquivo mínimo, importável no navegador sem carregar os demais dados
salvar("referencia.json", { dataReferencia });
salvar("commits.json", commitsSaida);
salvar("analises.json", analisesSaida);

console.log(`projetos: ${projetosSaida.length} · commits: ${commitsSaida.length}`);
for (const p of projetosSaida) {
  const a = analisesSaida[p.id];
  console.log(`\n${p.nome} — ${a.totais.commits} commits, ${a.totais.efetivas} efetivas, ${a.totais.brutas} brutas`);
  for (const e of p.etapas) {
    const reg = a.porEtapa[e.id];
    const ic = Object.entries(reg.ic).filter(([, v]) => v > 0).sort(([, x], [, y]) => y - x)
      .map(([id, v]) => `${pessoas.find((m) => m.id === id).nome.split(" ")[0]} ${Math.round(v)}%`).join(" · ");
    console.log(`  ${e.nome.slice(0, 30).padEnd(30)} ${String(e.progresso).padStart(3)}%  ${e.fimPrevisto}  último ${reg.ultimoCommit}  IC: ${ic}`);
  }
  console.log(`  status ${p.status} · ${p.inicio} → previsto ${p.fimPrevisto}${p.entrega ? ` · entregue ${p.entrega}` : ""}`);
}

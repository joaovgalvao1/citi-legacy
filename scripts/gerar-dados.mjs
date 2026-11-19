// Gera os dados fictícios do protótipo a partir de scripts/cenarios.mjs e os exporta (`dados`)
// para a carga no banco (scripts/carregar-banco.ts → npm run banco:carregar). Não grava arquivos.
//
// Saída: pessoas, projetos (status, prazos, etapas com caminhos e tasks, membros) e commits
// (autor, data, mensagem, arquivos alterados, etapas, linhas). IC, concentração e atividade
// semanal são calculados pelo app a partir dos commits (lib/analise.ts).
//
// Métricas:
//   linhas brutas   = adicionadas + removidas (todo o volume que a pessoa mexeu)
//   linhas efetivas = linhas adicionadas que ainda existem no código hoje
//   commits         = quantidade de commits
//
// Projetos em andamento têm commits até a véspera da data dos dados (dataReferencia em cenarios.mjs);
// os concluídos, até a entrega.
//
// Etapas ↔ repositório: cada etapa tem caminhos (ex.: "src/estoque/**"). Um commit pertence às etapas
// cujos caminhos casam com algum arquivo que ele alterou (pode ser mais de uma).
// Progresso: cada etapa tem tasks; progresso = tasks concluídas ÷ total.
// Conclusão de cada task (feitaEm): a data do último commit da etapa cuja mensagem cita a task.
// Com "recentes" na etapa, as últimas tasks feitas são trazidas para as últimas 4 semanas
// (o ritmo usado na previsão de entrega).
//
// O gerador é determinístico (semente fixa): rodar de novo produz os mesmos dados.

import { cenarios, commitsAte, dataReferencia, pessoas } from "./cenarios.mjs";


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


/* ---------- arquivos, caminhos e tasks ---------- */

const PALAVRAS_VAZIAS = new Set(["para", "com", "por", "dos", "das", "nos", "nas", "uma", "que", "sem", "entre", "pela", "pelo", "após", "ajustes", "parte"]);

function slug(texto) {
  const palavras = texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((p) => p.length > 2 && !PALAVRAS_VAZIAS.has(p));
  return palavras.slice(0, 3).join("-") || "geral";
}

/** Caminhos do repositório de uma etapa (padrão: src/<etapa>/**; infra: .github e infra). */
function caminhosDa(etapa) {
  if (etapa.caminhos) return etapa.caminhos;
  if (etapa.id === "infra") return [".github/**", "infra/**"];
  return [`src/${etapa.id}/**`];
}

const pasta = (glob) => glob.replace(/\/\*\*$/, "");
const casa = (arquivo, glob) => arquivo === pasta(glob) || arquivo.startsWith(pasta(glob) + "/");

const ARQUIVOS_INFRA = [".github/workflows/ci.yml", ".github/workflows/deploy.yml", "infra/docker-compose.yml", "infra/migrations.sh", "infra/README.md"];

/** Arquivos alterados por um commit, coerentes com o tipo e o texto da mensagem. */
function arquivosDoCommit(etapa, tipo, texto) {
  const base = pasta(caminhosDa(etapa)[0]);
  if (etapa.id === "infra") return [escolher(ARQUIVOS_INFRA), ...(rand() < 0.3 ? [escolher(ARQUIVOS_INFRA)] : [])].filter((v, i, a) => a.indexOf(v) === i);
  const nome = slug(texto);
  switch (tipo) {
    case "feat":
      return rand() < 0.5 ? [`${base}/${nome}.ts`, `${base}/${nome}.test.ts`] : [`${base}/${nome}.ts`];
    case "test":
      return [`${base}/${nome}.test.ts`];
    case "docs":
      return [`${base}/README.md`];
    case "style":
      return [`${base}/${nome}.css`];
    case "refactor":
      return [`${base}/${nome}.ts`, `${base}/index.ts`, ...(rand() < 0.5 ? [`${base}/tipos.ts`] : [])];
    default:
      return [`${base}/${nome}.ts`];
  }
}

/** Tasks de uma etapa: as definidas no cenário ou, por padrão, as entregas (feat/chore/docs/perf) das mensagens. */
function tasksDa(c, etapa, commitsDaEtapa) {
  let titulos = etapa.tasks;
  if (!titulos) {
    const modelos = c.mensagens[etapa.id] ?? [];
    titulos = modelos.filter(([tipo]) => ["feat", "chore", "docs", "perf"].includes(tipo)).map(([, t]) => t);
    if (titulos.length < 3) titulos = modelos.filter(([tipo]) => tipo !== "test").map(([, t]) => t);
  }
  titulos = [...new Set(titulos)].map((t) => t.charAt(0).toUpperCase() + t.slice(1));
  const total = titulos.length;
  let feitas = Math.round((etapa.progresso / 100) * total);
  if (etapa.progresso > 0 && feitas === 0) feitas = 1;
  if (etapa.progresso < 100 && feitas === total) feitas = total - 1;
  const tasks = titulos.map((titulo, i) => ({ titulo, feita: i < feitas, feitaEm: null }));

  // data de conclusão: o último commit que cita a task (ou o último da etapa, ou o fim previsto)
  const ultimo = commitsDaEtapa.at(-1)?.data.slice(0, 10) ?? etapa.previsto[1];
  for (const t of tasks.filter((t) => t.feita)) {
    const cita = commitsDaEtapa.filter((cm) => cm.mensagem.toLowerCase().includes(t.titulo.toLowerCase()));
    t.feitaEm = cita.at(-1)?.data.slice(0, 10) ?? ultimo;
  }
  if (c.status === "concluido") {
    // nunca depois da entrega
    for (const t of tasks) if (t.feitaEm && t.feitaEm > c.entrega) t.feitaEm = c.entrega;
  }

  // "recentes": garante um mínimo de tasks concluídas nas últimas 4 semanas, espaçadas a cada 6 dias
  if (etapa.recentes) {
    const ref = paraData(dataReferencia).getTime();
    const corte = new Date(ref - 27 * DIA).toISOString().slice(0, 10);
    const feitasOrdem = tasks.filter((t) => t.feita).sort((a, b) => a.feitaEm.localeCompare(b.feitaEm));
    const faltam = etapa.recentes - feitasOrdem.filter((t) => t.feitaEm >= corte).length;
    feitasOrdem
      .filter((t) => t.feitaEm < corte)
      .slice(-Math.max(0, faltam))
      .forEach((t, i, lista) => {
        t.feitaEm = new Date(ref - (2 + 6 * (lista.length - 1 - i)) * DIA).toISOString().slice(0, 10);
      });
  }
  return tasks;
}

/* ---------- geração ---------- */

const projetosSaida = [];
const commitsSaida = [];

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

  // 2) mensagens, arquivos e linhas atribuídos em ordem cronológica dentro de cada etapa
  const etapasComCommits = c.etapas.filter((e) => c.membros.some((m) => m.plano[e.id]));
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
        const etapa = c.etapas.find((e) => e.id === etapaId);
        let arquivos = arquivosDoCommit(etapa, tipo, texto);
        // às vezes o commit também mexe em outra etapa (código compartilhado)
        if (etapaId !== "infra" && rand() < 0.08) {
          // só etapas que estavam ativas na data do commit
          const frac = (new Date(data) - inicio) / (fim - inicio);
          const outras = etapasComCommits.filter(
            (e) => e.id !== etapaId && e.id !== "infra" && e.janela[0] <= frac && frac <= e.janela[1],
          );
          if (outras.length) arquivos = [...arquivos, `${pasta(caminhosDa(escolher(outras))[0])}/index.ts`];
        }
        const etapas = c.etapas.filter((e) => arquivos.some((a) => caminhosDa(e).some((g) => casa(a, g)))).map((e) => e.id);
        commits.push({
          hash: hash(),
          projetoId: c.id,
          autor: m.id,
          data,
          mensagem: `${tipo}(${etapaId}): ${texto}`,
          arquivos,
          etapas,
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
    etapas: c.etapas.map((e) => {
      const tasks = tasksDa(c, e, commits.filter((cm) => cm.etapas.includes(e.id)));
      return {
        id: e.id,
        nome: e.nome,
        descricao: e.descricao,
        inicioPrevisto: e.previsto[0],
        fimPrevisto: e.previsto[1],
        caminhos: caminhosDa(e),
        tasks,
        progresso: Math.round((tasks.filter((t) => t.feita).length / tasks.length) * 100),
      };
    }),
    membros: c.membros.map(({ id, papel }) => ({ id, papel })),
  });
}

/* ---------- dias extras de commits (até commitsAte, em cenarios.mjs) ---------- */
// Os dados acima vão até a véspera de dataReferencia (e foram calibrados assim: ritmo, previsões, resumos).
// Para o app chegar ao dia da entrega com atividade recente, acrescentamos commits nos dias seguintes,
// DEPOIS de tudo gerado, para não mexer em nada do que veio antes (mesma semente, sequência continua).
// Só etapas ainda ativas no fim da janela recebem commits; as mensagens são ajustes, não entregas novas,
// e por isso não mudam a data de conclusão das tasks.
if (commitsAte >= dataReferencia) {
  for (const c of cenarios.filter((c) => c.status === "andamento")) {
    const ativas = c.etapas.filter((e) => e.janela[1] >= 0.98 && c.membros.some((m) => m.plano[e.id]));
    for (let dia = paraData(dataReferencia); dia <= paraData(commitsAte); dia = new Date(dia.getTime() + DIA)) {
      const ymd = new Date(dia.getTime()).toISOString().slice(0, 10);
      for (let i = inteiro(1, 3); i > 0; i--) {
        const etapa = escolher(ativas);
        const membro = escolher(c.membros.filter((m) => m.plano[etapa.id]));
        const [, media, sobrevivencia] = membro.plano[etapa.id];
        const [tipo, texto] = escolher(c.mensagens[etapa.id] ?? [["fix", "ajustes"]]);
        const mensagemTexto = rand() < 0.5 && genericas[tipo] ? escolher(genericas[tipo]).replace("{pr}", String(inteiro(12, 140))) : texto + escolher(sufixos);
        const adicionadas = Math.max(1, Math.round(media * multiplicadorTipo[tipo] * entre(0.3, 1.2)));
        const efetivas = Math.round(adicionadas * limitar(sobrevivencia + normal() * 0.08, 0.05, 1));
        const removidas = Math.round((adicionadas - efetivas) * entre(0.6, 1.4));
        const arquivos = arquivosDoCommit(etapa, tipo, mensagemTexto);
        const noite = rand() < 0.7;
        const hora = String(noite ? inteiro(18, 23) : inteiro(9, 17)).padStart(2, "0");
        const minuto = String(inteiro(0, 59)).padStart(2, "0");
        commitsSaida.push({
          hash: hash(),
          projetoId: c.id,
          autor: membro.id,
          data: `${ymd}T${hora}:${minuto}:00-03:00`,
          mensagem: `${tipo}(${etapa.id}): ${mensagemTexto}`,
          arquivos,
          etapas: c.etapas.filter((e) => arquivos.some((a) => caminhosDa(e).some((g) => casa(a, g)))).map((e) => e.id),
          adicionadas,
          removidas,
          brutas: adicionadas + removidas,
          efetivas,
        });
      }
    }
  }
  commitsSaida.sort((a, b) => a.data.localeCompare(b.data));
}

const pessoasSaida = pessoas;

/** Dados fictícios completos, prontos para a carga no banco (scripts/carregar-banco.ts). */
export const dados = { pessoas: pessoasSaida, projetos: projetosSaida, commits: commitsSaida };

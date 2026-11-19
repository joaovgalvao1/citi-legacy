// Esquema do banco (Drizzle + Postgres).
// Datas são guardadas como texto "aaaa-mm-dd" (ou ISO completo nos commits) para evitar
// surpresas de fuso horário; o app já trabalha com essas strings.

import { boolean, integer, jsonb, pgTable, primaryKey, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const clientes = pgTable("clientes", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  segmento: text("segmento"),
});

export const pessoas = pgTable("pessoas", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  entrada: text("entrada").notNull(), // "aaaa-mm"
  saiuEm: text("saiu_em"), // "aaaa-mm-dd"
  /** Na lixeira desde ("aaaa-mm-dd"). Só quem não tem commits pode ir para a lixeira. */
  apagadoEm: text("apagado_em"),
});

export const projetos = pgTable("projetos", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  clienteId: text("cliente_id")
    .notNull()
    .references(() => clientes.id),
  descricao: text("descricao").notNull(),
  contexto: text("contexto"),
  resultados: text("resultados"),
  resumoResultado: text("resumo_resultado"),
  caseReal: boolean("case_real").notNull().default(false),
  status: text("status").notNull(), // "andamento" | "concluido"
  inicio: text("inicio").notNull(),
  fimPrevisto: text("fim_previsto").notNull(),
  entrega: text("entrega"),
  /** Concluído porque todas as tasks foram marcadas (pode ser reaberto desmarcando uma). */
  concluidoPelasTasks: boolean("concluido_pelas_tasks").notNull().default(false),
  /** Na lixeira desde ("aaaa-mm-dd"); null = ativo. Some de vez depois de 30 dias. */
  apagadoEm: text("apagado_em"),
  ordem: integer("ordem").notNull().default(0),
});

export const membrosProjeto = pgTable(
  "membros_projeto",
  {
    projetoId: text("projeto_id")
      .notNull()
      .references(() => projetos.id, { onDelete: "cascade" }),
    pessoaId: text("pessoa_id")
      .notNull()
      .references(() => pessoas.id),
    papel: text("papel").notNull(),
    ordem: integer("ordem").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.projetoId, t.pessoaId] })],
);

export const etapas = pgTable(
  "etapas",
  {
    projetoId: text("projeto_id")
      .notNull()
      .references(() => projetos.id, { onDelete: "cascade" }),
    id: text("id").notNull(),
    ordem: integer("ordem").notNull(),
    nome: text("nome").notNull(),
    descricao: text("descricao").notNull(),
    inicioPrevisto: text("inicio_previsto").notNull(),
    fimPrevisto: text("fim_previsto").notNull(),
    caminhos: text("caminhos").array().notNull(),
  },
  (t) => [primaryKey({ columns: [t.projetoId, t.id] })],
);

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  projetoId: text("projeto_id")
    .notNull()
    .references(() => projetos.id, { onDelete: "cascade" }),
  etapaId: text("etapa_id").notNull(),
  ordem: integer("ordem").notNull(),
  titulo: text("titulo").notNull(),
  feita: boolean("feita").notNull().default(false),
  /** Quando a task foi concluída ("aaaa-mm-dd"); base do ritmo e da previsão de entrega. */
  feitaEm: text("feita_em"),
});

export const commits = pgTable(
  "commits",
  {
    projetoId: text("projeto_id")
      .notNull()
      .references(() => projetos.id, { onDelete: "cascade" }),
    hash: text("hash").notNull(),
    autor: text("autor")
      .notNull()
      .references(() => pessoas.id),
    data: text("data").notNull(), // ISO com fuso, ex.: 2026-08-03T19:22:00-03:00
    mensagem: text("mensagem").notNull(),
    arquivos: text("arquivos").array().notNull(),
    etapas: text("etapas").array().notNull(),
    adicionadas: integer("adicionadas").notNull(),
    removidas: integer("removidas").notNull(),
    efetivas: integer("efetivas").notNull(),
  },
  (t) => [primaryKey({ columns: [t.projetoId, t.hash] })],
);

/** Resumos da IA: semanais (projetos em andamento) e o final (projetos concluídos). */
export const resumos = pgTable(
  "resumos",
  {
    id: serial("id").primaryKey(),
    // sem chave estrangeira de propósito: recarregar os dados não apaga os resumos (que custam chamadas à IA)
    projetoId: text("projeto_id").notNull(),
    tipo: text("tipo").notNull(), // "semanal" | "final"
    semana: text("semana").notNull().default(""), // segunda-feira "aaaa-mm-dd" (vazio no final)
    secoes: jsonb("secoes").notNull().$type<{ titulo: string; itens: string[] }[]>(),
    fonte: text("fonte").notNull(), // "gemini" | "groq" | "regras"
    modelo: text("modelo"),
    geradoEm: timestamp("gerado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("resumos_projeto_tipo_semana").on(t.projetoId, t.tipo, t.semana)],
);

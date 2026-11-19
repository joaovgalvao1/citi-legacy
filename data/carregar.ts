// Leitura direta do banco, sem cache do Next. Usada pela camada de dados (com cache)
// e pelos scripts (carga de resumos), que rodam fora do Next.

import { asc, desc, eq, isNotNull } from "drizzle-orm";
import { db, esquema } from "@/db/conexao";
import { hoje as hojeAgora, somarDias } from "@/lib/hoje";
import { concentracao, indiceConhecimento, listaSemanas, PESOS_IC, semanasDe } from "@/lib/analise";
import type { Commit, MembroNaLixeira, Pessoa, Projeto, ProjetoNaLixeira, Resumo } from "./index";


export async function carregarTudo() {
  const hoje = hojeAgora();
  const ontem = somarDias(hoje, -1);

  const [clientes, pessoas, projetos, membrosTodos, etapas, tasks, commits] = await Promise.all([
    db.select().from(esquema.clientes),
    db.select().from(esquema.pessoas).orderBy(asc(esquema.pessoas.nome)),
    db.select().from(esquema.projetos).orderBy(asc(esquema.projetos.ordem)),
    db.select().from(esquema.membrosProjeto).orderBy(asc(esquema.membrosProjeto.ordem)),
    db.select().from(esquema.etapas).orderBy(asc(esquema.etapas.ordem)),
    db.select().from(esquema.tasks).orderBy(asc(esquema.tasks.ordem)),
    db.select().from(esquema.commits).orderBy(asc(esquema.commits.data)),
  ]);

  // pessoas na lixeira (só quem não tem commits) saem da lista de membros e das equipes
  const pessoasNaLixeira = new Set(pessoas.filter((p) => p.apagadoEm).map((p) => p.id));
  const lixeiraMembros: MembroNaLixeira[] = pessoas
    .filter((p) => p.apagadoEm)
    .map((p) => ({ id: p.id, nome: p.nome, entrada: p.entrada, apagadoEm: p.apagadoEm! }));
  const listaPessoas: Pessoa[] = pessoas
    .filter((p) => !p.apagadoEm)
    .map((p) => ({
      id: p.id,
      nome: p.nome,
      entrada: p.entrada,
      ...(p.saiuEm ? { saiuEm: p.saiuEm } : {}),
      ...(p.email ? { email: p.email } : {}),
      ...(p.linkedin ? { linkedin: p.linkedin } : {}),
      ...(p.github ? { github: p.github } : {}),
    }));
  const membros = membrosTodos.filter((m) => !pessoasNaLixeira.has(m.pessoaId));

  // projetos na lixeira ficam fora de tudo (listas, indicadores, boletim, membros)
  const naLixeira = projetos.filter((p) => p.apagadoEm);
  const lixeira: ProjetoNaLixeira[] = naLixeira.map((p) => {
    const cliente = clientes.find((c) => c.id === p.clienteId)!;
    return { id: p.id, nome: p.nome, cliente: cliente.nome, apagadoEm: p.apagadoEm!, status: p.status as Projeto["status"] };
  });
  const ativos = new Set(projetos.filter((p) => !p.apagadoEm).map((p) => p.id));

  const listaProjetos: Projeto[] = projetos.filter((p) => ativos.has(p.id)).map((p) => {
    const cliente = clientes.find((c) => c.id === p.clienteId)!;
    const doProjeto = commits.filter((c) => c.projetoId === p.id);
    const ids = membros.filter((m) => m.projetoId === p.id).map((m) => m.pessoaId);
    // último dia com commits: a entrega (concluído) ou a véspera de hoje (em andamento)
    const fim = p.status === "concluido" && p.entrega ? p.entrega : ontem;
    const semanasLista = listaSemanas(p.inicio, fim);
    const doProjetoIc = indiceConhecimento(doProjeto, ids, fim);

    return {
      id: p.id,
      nome: p.nome,
      cliente: cliente.segmento ? `${cliente.nome} · ${cliente.segmento}` : cliente.nome,
      clienteId: p.clienteId,
      clienteNome: cliente.nome,
      descricao: p.descricao,
      ...(p.contexto ? { contexto: p.contexto } : {}),
      ...(p.resultados ? { resultados: p.resultados } : {}),
      ...(p.resumoResultado ? { resumoResultado: p.resumoResultado } : {}),
      caseReal: p.caseReal,
      status: p.status as Projeto["status"],
      inicio: p.inicio,
      fimPrevisto: p.fimPrevisto,
      ...(p.entrega ? { entrega: p.entrega } : {}),
      concluidoPelasTasks: p.concluidoPelasTasks,
      etapas: etapas
        .filter((e) => e.projetoId === p.id)
        .map((e) => {
          const daEtapa = doProjeto.filter((c) => c.etapas.includes(e.id));
          const r = indiceConhecimento(daEtapa, ids, fim);
          const tasksDaEtapa = tasks.filter((t) => t.projetoId === p.id && t.etapaId === e.id).map((t) => ({ titulo: t.titulo, feita: t.feita, feitaEm: t.feitaEm }));
          return {
            id: e.id,
            nome: e.nome,
            descricao: e.descricao,
            inicioPrevisto: e.inicioPrevisto,
            fimPrevisto: e.fimPrevisto,
            caminhos: e.caminhos,
            tasks: tasksDaEtapa,
            progresso: tasksDaEtapa.length ? Math.round((tasksDaEtapa.filter((t) => t.feita).length / tasksDaEtapa.length) * 100) : 0,
            primeiroCommit: daEtapa[0]?.data.slice(0, 10) ?? null,
            ultimoCommit: daEtapa.at(-1)?.data.slice(0, 10) ?? null,
            ic: r.ic,
            concentracao: concentracao(r.ic),
            fatias: Object.fromEntries(Object.entries(r.fatias).filter(([id]) => r.ic[id] > 0)),
            semanas: semanasDe(daEtapa, semanasLista, ids),
          };
        }),
      membros: membros
        .filter((m) => m.projetoId === p.id)
        .map((m) => ({
          ...listaPessoas.find((x) => x.id === m.pessoaId)!,
          papel: m.papel,
          icProjeto: doProjetoIc.ic[m.pessoaId],
          fatiasProjeto: doProjetoIc.fatias[m.pessoaId],
        })),
      semanas: semanasDe(doProjeto, semanasLista, ids),
      pesos: PESOS_IC,
      hoje,
    };
  });

  return {
    pessoas: listaPessoas,
    projetos: listaProjetos,
    lixeira,
    lixeiraMembros,
    totalCommits: commits.filter((c) => ativos.has(c.projetoId)).length,
  };
}

export async function carregarCommits(filtro: { projetoId?: string; autor?: string }): Promise<Commit[]> {
  const [linhas, naLixeira] = await Promise.all([
    db.select().from(esquema.commits).orderBy(desc(esquema.commits.data)),
    db.select({ id: esquema.projetos.id }).from(esquema.projetos).where(isNotNull(esquema.projetos.apagadoEm)),
  ]);
  const fora = new Set(naLixeira.map((p) => p.id));
  return linhas.filter(
    (c) => !fora.has(c.projetoId) && (!filtro.projetoId || c.projetoId === filtro.projetoId) && (!filtro.autor || c.autor === filtro.autor),
  );
}

export async function carregarClientes() {
  return db.select().from(esquema.clientes).orderBy(asc(esquema.clientes.nome));
}

/** Resumos da IA de um projeto, do mais recente para o mais antigo. */
export async function carregarResumos(projetoId: string): Promise<Resumo[]> {
  const linhas = await db
    .select()
    .from(esquema.resumos)
    .where(eq(esquema.resumos.projetoId, projetoId))
    .orderBy(desc(esquema.resumos.semana));
  return linhas.map((r) => ({
    tipo: r.tipo as Resumo["tipo"],
    semana: r.semana,
    secoes: r.secoes,
    fonte: r.fonte as Resumo["fonte"],
    modelo: r.modelo,
    geradoEm: r.geradoEm.toISOString(),
  }));
}

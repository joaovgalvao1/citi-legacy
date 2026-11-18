// Leitura direta do banco, sem cache do Next. Usada pela camada de dados (com cache)
// e pelos scripts (carga de resumos), que rodam fora do Next.

import { asc, desc } from "drizzle-orm";
import { db, esquema } from "@/db/conexao";
import { hoje as hojeAgora, somarDias } from "@/lib/hoje";
import { concentracao, indiceConhecimento, listaSemanas, PESOS_IC, semanasDe } from "@/lib/analise";
import type { Commit, Pessoa, Projeto } from "./index";


export async function carregarTudo() {
  const hoje = hojeAgora();
  const ontem = somarDias(hoje, -1);

  const [clientes, pessoas, projetos, membros, etapas, tasks, commits] = await Promise.all([
    db.select().from(esquema.clientes),
    db.select().from(esquema.pessoas).orderBy(asc(esquema.pessoas.nome)),
    db.select().from(esquema.projetos).orderBy(asc(esquema.projetos.ordem)),
    db.select().from(esquema.membrosProjeto).orderBy(asc(esquema.membrosProjeto.ordem)),
    db.select().from(esquema.etapas).orderBy(asc(esquema.etapas.ordem)),
    db.select().from(esquema.tasks).orderBy(asc(esquema.tasks.ordem)),
    db.select().from(esquema.commits).orderBy(asc(esquema.commits.data)),
  ]);

  const listaPessoas: Pessoa[] = pessoas.map((p) => ({ id: p.id, nome: p.nome, entrada: p.entrada, ...(p.saiuEm ? { saiuEm: p.saiuEm } : {}) }));

  const listaProjetos: Projeto[] = projetos.map((p) => {
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
      descricao: p.descricao,
      ...(p.contexto ? { contexto: p.contexto } : {}),
      ...(p.resultados ? { resultados: p.resultados } : {}),
      ...(p.resumoResultado ? { resumoResultado: p.resumoResultado } : {}),
      caseReal: p.caseReal,
      status: p.status as Projeto["status"],
      inicio: p.inicio,
      fimPrevisto: p.fimPrevisto,
      ...(p.entrega ? { entrega: p.entrega } : {}),
      etapas: etapas
        .filter((e) => e.projetoId === p.id)
        .map((e) => {
          const daEtapa = doProjeto.filter((c) => c.etapas.includes(e.id));
          const r = indiceConhecimento(daEtapa, ids, fim);
          const tasksDaEtapa = tasks.filter((t) => t.projetoId === p.id && t.etapaId === e.id).map((t) => ({ titulo: t.titulo, feita: t.feita }));
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

  return { pessoas: listaPessoas, projetos: listaProjetos, totalCommits: commits.length };
}

export async function carregarCommits(filtro: { projetoId?: string; autor?: string }): Promise<Commit[]> {
  const linhas = await db.select().from(esquema.commits).orderBy(desc(esquema.commits.data));
  return linhas.filter((c) => (!filtro.projetoId || c.projetoId === filtro.projetoId) && (!filtro.autor || c.autor === filtro.autor));
}

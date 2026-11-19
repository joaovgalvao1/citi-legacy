"use server";

// Ações do servidor (chamadas pelos componentes do navegador).

import { and, eq, inArray, isNotNull, lte, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { db, esquema } from "@/db/conexao";
import { hoje, somarDias } from "@/lib/hoje";
import { confereConfirmacao, DIAS_NA_LIXEIRA, linhas, slug, validarProjeto, type ProjetoNovo } from "@/lib/novo-projeto";
import { carregarCommits, carregarResumos, carregarTudo } from "@/data/carregar";
import { montarBoletim } from "@/lib/boletim";
import { destinatariosMascarados, enviarBoletim, enviarReuniao } from "@/lib/email";

const { clientes, commits, etapas, membrosProjeto, projetos, resumos, tasks } = esquema;

/**
 * Marca ou desmarca uma task no banco. Vale para todos os usuários.
 * Marcar a última task conclui o projeto (entrega = hoje). Desmarcar uma task de um projeto
 * concluído assim reabre o projeto e descarta o resumo final, que seria gerado de novo.
 * Projetos históricos (concluídos sem ser pelas tasks) não mudam.
 */
export async function alternarTask(projetoId: string, etapaId: string, ordem: number, feita: boolean) {
  const [projeto] = await db.select().from(projetos).where(eq(projetos.id, projetoId));
  if (!projeto || (projeto.status === "concluido" && !projeto.concluidoPelasTasks)) return;

  await db
    .update(tasks)
    .set({ feita, feitaEm: feita ? hoje() : null })
    .where(and(eq(tasks.projetoId, projetoId), eq(tasks.etapaId, etapaId), eq(tasks.ordem, ordem)));

  const todas = await db.select({ feita: tasks.feita }).from(tasks).where(eq(tasks.projetoId, projetoId));
  const tudoFeito = todas.length > 0 && todas.every((t) => t.feita);

  if (tudoFeito && projeto.status !== "concluido") {
    await db.update(projetos).set({ status: "concluido", entrega: hoje(), concluidoPelasTasks: true }).where(eq(projetos.id, projetoId));
  } else if (!tudoFeito && projeto.concluidoPelasTasks) {
    await db.update(projetos).set({ status: "andamento", entrega: null, concluidoPelasTasks: false }).where(eq(projetos.id, projetoId));
    await db.delete(resumos).where(and(eq(resumos.projetoId, projetoId), eq(resumos.tipo, "final")));
    updateTag("resumos");
  }

  // invalida o cache dos dados: a próxima leitura (inclusive desta página) já vem atualizada
  updateTag("dados");
}

/**
 * Cadastra um projeto novo (em andamento, sem commits ainda) com equipe, etapas e tasks.
 * Devolve o id criado ou a lista de problemas encontrados.
 */
export async function criarProjeto(p: ProjetoNovo): Promise<{ id: string } | { erros: string[] }> {
  const erros = validarProjeto(p);
  if (erros.length) return { erros };

  // id do projeto: slug do nome, com sufixo se já existir
  const base = slug(p.nome) || "projeto";
  const existentes = new Set((await db.select({ id: projetos.id }).from(projetos)).map((r) => r.id));
  let id = base;
  for (let i = 2; existentes.has(id) || IDS_RESERVADOS.has(id); i++) id = `${base}-${i}`;

  await db.transaction(async (tx) => {
    let clienteId = p.clienteId;
    if (!clienteId) {
      clienteId = slug(p.clienteNovo) || "cliente";
      await tx
        .insert(clientes)
        .values({ id: clienteId, nome: p.clienteNovo.trim(), segmento: p.segmentoNovo.trim() || null })
        .onConflictDoNothing();
    }
    const [{ ordem }] = await tx.select({ ordem: sql<number>`coalesce(max(${projetos.ordem}), -1)::int + 1` }).from(projetos);
    await tx.insert(projetos).values({
      id,
      nome: p.nome.trim(),
      clienteId,
      descricao: p.descricao.trim(),
      contexto: p.contexto.trim() || null,
      status: "andamento",
      inicio: p.inicio,
      fimPrevisto: p.fimPrevisto,
      ordem,
    });
    await tx.insert(membrosProjeto).values(p.membros.map((m, i) => ({ projetoId: id, pessoaId: m.pessoaId, papel: m.papel.trim(), ordem: i })));
    await tx.insert(etapas).values(
      p.etapas.map((e, i) => ({
        projetoId: id,
        id: slug(e.nome),
        ordem: i,
        nome: e.nome.trim(),
        descricao: e.descricao.trim(),
        inicioPrevisto: e.inicioPrevisto,
        fimPrevisto: e.fimPrevisto,
        caminhos: linhas(e.caminhos),
      })),
    );
    await tx.insert(tasks).values(
      p.etapas.flatMap((e) => linhas(e.tasks).map((titulo, i) => ({ projetoId: id, etapaId: slug(e.nome), ordem: i, titulo, feita: false }))),
    );
  });

  updateTag("dados");
  return { id };
}

/**
 * Envia agora o boletim semanal por e-mail (o mesmo do cron de sexta), para BOLETIM_PARA.
 * Os destinatários vêm só da configuração do servidor; a tela não escolhe para quem enviar.
 * O e-mail sai no tema escolhido na tela do boletim (claro ou escuro).
 */
export async function enviarBoletimAgora(tema: unknown = "escuro"): Promise<{ enviado: boolean; mensagem: string }> {
  const temaEmail = tema === "claro" ? "claro" : "escuro";
  const { projetos } = await carregarTudo();
  const resumos = Object.fromEntries(await Promise.all(projetos.map(async (p) => [p.id, await carregarResumos(p.id)] as const)));
  const r = await enviarBoletim(montarBoletim(projetos, resumos, await carregarCommits({})), temaEmail).catch((e: Error) => ({
    enviado: false,
    detalhe: e.message,
  }));
  if (!r.enviado) return { enviado: false, mensagem: `Não foi possível enviar: ${r.detalhe}.` };
  return { enviado: true, mensagem: `Boletim enviado (tema ${temaEmail}) para ${destinatariosMascarados()}.` };
}

/** Envia agora o e-mail da reunião da diretoria (pauta da semana e link da apresentação) para BOLETIM_PARA. */
export async function enviarReuniaoAgora(): Promise<{ enviado: boolean; mensagem: string }> {
  const { projetos } = await carregarTudo();
  const resumos = Object.fromEntries(await Promise.all(projetos.map(async (p) => [p.id, await carregarResumos(p.id)] as const)));
  const r = await enviarReuniao(montarBoletim(projetos, resumos, await carregarCommits({})), projetos).catch((e: Error) => ({
    enviado: false,
    detalhe: e.message,
  }));
  if (!r.enviado) return { enviado: false, mensagem: `Não foi possível enviar: ${r.detalhe}.` };
  return { enviado: true, mensagem: `Enviado para ${destinatariosMascarados()}.` };
}

/* ---------- editar projeto ---------- */

/** Ids reservados pelas rotas (/projetos/novo, /projetos/lixeira, /projetos/editar). */
const IDS_RESERVADOS = new Set(["novo", "lixeira", "editar"]);

/**
 * Salva a edição de um projeto: dados, equipe, etapas e tasks.
 * Etapas existentes mantêm o id (os commits continuam ligados a elas); etapas com commits não podem
 * ser removidas. Tasks com o mesmo título mantêm se estavam feitas e quando foram concluídas.
 */
export async function editarProjeto(projetoId: string, p: ProjetoNovo): Promise<{ id: string } | { erros: string[] }> {
  const erros = validarProjeto(p);
  if (erros.length) return { erros };
  const [atual] = await db.select().from(projetos).where(eq(projetos.id, projetoId));
  if (!atual || atual.apagadoEm) return { erros: ["Este projeto não existe mais (ou está na lixeira)."] };

  const existentes = await db.select().from(etapas).where(eq(etapas.projetoId, projetoId));
  const tasksAtuais = await db.select().from(tasks).where(eq(tasks.projetoId, projetoId));
  const commitsDoProjeto = await db.select({ etapas: commits.etapas }).from(commits).where(eq(commits.projetoId, projetoId));
  const comCommits = new Set(commitsDoProjeto.flatMap((c) => c.etapas));

  const mantidas = new Set(p.etapas.map((e) => e.id).filter(Boolean));
  const removidas = existentes.filter((e) => !mantidas.has(e.id));
  const bloqueadas = removidas.filter((e) => comCommits.has(e.id));
  if (bloqueadas.length) {
    return { erros: bloqueadas.map((e) => `A etapa "${e.nome}" tem commits e não pode ser removida (só renomeada).`) };
  }

  // id das etapas novas: slug do nome, sem repetir os ids que ficam
  const usados = new Set([...mantidas].filter((id): id is string => !!id));
  const idDe = p.etapas.map((e) => {
    if (e.id) return e.id;
    const base = slug(e.nome) || "etapa";
    let id = base;
    for (let i = 2; usados.has(id); i++) id = `${base}-${i}`;
    usados.add(id);
    return id;
  });

  await db.transaction(async (tx) => {
    let clienteId = p.clienteId;
    if (!clienteId) {
      clienteId = slug(p.clienteNovo) || "cliente";
      await tx
        .insert(clientes)
        .values({ id: clienteId, nome: p.clienteNovo.trim(), segmento: p.segmentoNovo.trim() || null })
        .onConflictDoNothing();
    }
    await tx
      .update(projetos)
      .set({
        nome: p.nome.trim(),
        clienteId,
        descricao: p.descricao.trim(),
        contexto: p.contexto.trim() || null,
        inicio: p.inicio,
        fimPrevisto: p.fimPrevisto,
      })
      .where(eq(projetos.id, projetoId));

    await tx.delete(membrosProjeto).where(eq(membrosProjeto.projetoId, projetoId));
    await tx
      .insert(membrosProjeto)
      .values(p.membros.map((m, i) => ({ projetoId, pessoaId: m.pessoaId, papel: m.papel.trim(), ordem: i })));

    if (removidas.length) {
      const ids = removidas.map((e) => e.id);
      await tx.delete(tasks).where(and(eq(tasks.projetoId, projetoId), inArray(tasks.etapaId, ids)));
      await tx.delete(etapas).where(and(eq(etapas.projetoId, projetoId), inArray(etapas.id, ids)));
    }

    for (const [i, e] of p.etapas.entries()) {
      const id = idDe[i];
      const valores = {
        ordem: i,
        nome: e.nome.trim(),
        descricao: e.descricao.trim(),
        inicioPrevisto: e.inicioPrevisto,
        fimPrevisto: e.fimPrevisto,
        caminhos: linhas(e.caminhos),
      };
      if (e.id) await tx.update(etapas).set(valores).where(and(eq(etapas.projetoId, projetoId), eq(etapas.id, id)));
      else await tx.insert(etapas).values({ projetoId, id, ...valores });

      // tasks: as de mesmo título mantêm o estado (feita e data de conclusão)
      const antigas = tasksAtuais.filter((t) => t.etapaId === id);
      const novas = linhas(e.tasks).map((titulo, ordem) => {
        const k = antigas.findIndex((t) => t.titulo === titulo);
        const antiga = k >= 0 ? antigas.splice(k, 1)[0] : null;
        return { projetoId, etapaId: id, ordem, titulo, feita: antiga?.feita ?? false, feitaEm: antiga?.feitaEm ?? null };
      });
      await tx.delete(tasks).where(and(eq(tasks.projetoId, projetoId), eq(tasks.etapaId, id)));
      await tx.insert(tasks).values(novas);
    }
  });

  updateTag("dados");
  return { id: projetoId };
}

/* ---------- lixeira (30 dias) ---------- */

async function clienteDoProjeto(projetoId: string) {
  const [linha] = await db
    .select({ id: projetos.id, apagadoEm: projetos.apagadoEm, cliente: clientes.nome })
    .from(projetos)
    .innerJoin(clientes, eq(clientes.id, projetos.clienteId))
    .where(eq(projetos.id, projetoId));
  return linha;
}

/** Apaga de vez os projetos que estão na lixeira há 30 dias ou mais. Devolve quantos foram apagados. */
export async function limparLixeira() {
  const limite = somarDias(hoje(), -DIAS_NA_LIXEIRA);
  const vencidos = await db.select({ id: projetos.id }).from(projetos).where(and(isNotNull(projetos.apagadoEm), lte(projetos.apagadoEm, limite)));
  if (!vencidos.length) return 0;
  const ids = vencidos.map((v) => v.id);
  await db.delete(resumos).where(inArray(resumos.projetoId, ids));
  await db.delete(projetos).where(inArray(projetos.id, ids)); // etapas, tasks, membros e commits vão junto (cascade)
  return ids.length;
}

/**
 * Move um projeto para a lixeira. Ação grave: exige digitar o nome do cliente.
 * Fica 30 dias na lixeira (dá para restaurar) e depois é apagado de vez.
 */
export async function moverParaLixeira(projetoId: string, confirmacao: string): Promise<{ ok: true } | { erro: string }> {
  const p = await clienteDoProjeto(projetoId);
  if (!p || p.apagadoEm) return { erro: "Projeto não encontrado." };
  if (!confereConfirmacao(confirmacao, p.cliente)) return { erro: "O nome do cliente não confere." };
  await db.update(projetos).set({ apagadoEm: hoje() }).where(eq(projetos.id, projetoId));
  await limparLixeira();
  updateTag("dados");
  return { ok: true };
}

/** Tira um projeto da lixeira, exatamente como estava. */
export async function restaurarProjeto(projetoId: string): Promise<{ ok: true } | { erro: string }> {
  const p = await clienteDoProjeto(projetoId);
  if (!p || !p.apagadoEm) return { erro: "Projeto não está na lixeira." };
  await db.update(projetos).set({ apagadoEm: null }).where(eq(projetos.id, projetoId));
  updateTag("dados");
  return { ok: true };
}

/** Apaga de vez um projeto que está na lixeira (com etapas, tasks, commits e resumos). Exige o nome do cliente. */
export async function apagarDeVez(projetoId: string, confirmacao: string): Promise<{ ok: true } | { erro: string }> {
  const p = await clienteDoProjeto(projetoId);
  if (!p || !p.apagadoEm) return { erro: "Só dá para apagar de vez um projeto que está na lixeira." };
  if (!confereConfirmacao(confirmacao, p.cliente)) return { erro: "O nome do cliente não confere." };
  await db.delete(resumos).where(eq(resumos.projetoId, projetoId));
  await db.delete(projetos).where(eq(projetos.id, projetoId));
  updateTag("dados");
  updateTag("resumos");
  return { ok: true };
}

// Gera os dados fictícios (scripts/gerar-dados.mjs) e grava direto no banco.
//
//   npm run banco:carregar
//
// Recria clientes, pessoas, projetos, membros, etapas, tasks e commits.
// Os resumos da IA NÃO são apagados (custam chamadas à IA); use --limpar-resumos para apagá-los.

import { sql } from "drizzle-orm";
import { db, esquema } from "../db/conexao";
import { dados } from "./gerar-dados.mjs";

type PessoaJson = { id: string; nome: string; entrada: string; saiuEm?: string };
type EtapaJson = {
  id: string;
  nome: string;
  descricao: string;
  inicioPrevisto: string;
  fimPrevisto: string;
  caminhos: string[];
  tasks: { titulo: string; feita: boolean; feitaEm: string | null }[];
};
type ProjetoJson = {
  id: string;
  nome: string;
  cliente: string;
  descricao: string;
  contexto?: string;
  resultados?: string;
  resumoResultado?: string;
  caseReal: boolean;
  status: string;
  inicio: string;
  fimPrevisto: string;
  entrega?: string;
  etapas: EtapaJson[];
  membros: { id: string; papel: string }[];
};
type CommitJson = {
  hash: string;
  projetoId: string;
  autor: string;
  data: string;
  mensagem: string;
  arquivos: string[];
  etapas: string[];
  adicionadas: number;
  removidas: number;
  efetivas: number;
};

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function main() {
  const { pessoas, projetos, commits } = dados as { pessoas: PessoaJson[]; projetos: ProjetoJson[]; commits: CommitJson[] };
  const limparResumos = process.argv.includes("--limpar-resumos");

  await db.transaction(async (tx) => {
    await tx.execute(
      sql.raw(
        `TRUNCATE commits, tasks, etapas, membros_projeto, ${limparResumos ? "resumos, " : ""}projetos, clientes, pessoas RESTART IDENTITY CASCADE`,
      ),
    );

    // clientes: "Nome · segmento"
    const clientes = new Map<string, { id: string; nome: string; segmento: string | null }>();
    for (const p of projetos) {
      const [nome, ...resto] = p.cliente.split(" · ");
      const id = slug(nome);
      clientes.set(id, { id, nome, segmento: resto.join(" · ") || null });
    }
    await tx.insert(esquema.clientes).values([...clientes.values()]);
    await tx.insert(esquema.pessoas).values(pessoas.map((p) => ({ id: p.id, nome: p.nome, entrada: p.entrada, saiuEm: p.saiuEm ?? null })));

    for (const [ordem, p] of projetos.entries()) {
      await tx.insert(esquema.projetos).values({
        id: p.id,
        nome: p.nome,
        clienteId: slug(p.cliente.split(" · ")[0]),
        descricao: p.descricao,
        contexto: p.contexto ?? null,
        resultados: p.resultados ?? null,
        resumoResultado: p.resumoResultado ?? null,
        caseReal: p.caseReal,
        status: p.status,
        inicio: p.inicio,
        fimPrevisto: p.fimPrevisto,
        entrega: p.entrega ?? null,
        ordem,
      });
      await tx.insert(esquema.membrosProjeto).values(p.membros.map((m, i) => ({ projetoId: p.id, pessoaId: m.id, papel: m.papel, ordem: i })));
      await tx.insert(esquema.etapas).values(
        p.etapas.map((e, i) => ({
          projetoId: p.id,
          id: e.id,
          ordem: i,
          nome: e.nome,
          descricao: e.descricao,
          inicioPrevisto: e.inicioPrevisto,
          fimPrevisto: e.fimPrevisto,
          caminhos: e.caminhos,
        })),
      );
      await tx.insert(esquema.tasks).values(
        p.etapas.flatMap((e) => e.tasks.map((t, i) => ({ projetoId: p.id, etapaId: e.id, ordem: i, titulo: t.titulo, feita: t.feita, feitaEm: t.feitaEm }))),
      );
    }

    for (let i = 0; i < commits.length; i += 200) {
      await tx.insert(esquema.commits).values(commits.slice(i, i + 200));
    }
  });

  const [{ n }] = await db.execute<{ n: number }>(sql`select count(*)::int as n from commits`);
  console.log(`banco carregado: ${projetos.length} projetos, ${pessoas.length} pessoas, ${n} commits${limparResumos ? " (resumos apagados)" : ""}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

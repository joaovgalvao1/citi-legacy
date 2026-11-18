// Página do membro: os projetos de que a pessoa participou

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatarData, formatarMesAno, obterCommits, obterPessoa, obterPessoas, projetosDaPessoa } from "@/data";
import { emPct } from "@/lib/indice";
import { Selo, Voltar } from "@/components/ui";
import { SeloStatusProjeto } from "@/components/projeto/status";

export async function generateStaticParams() {
  return (await obterPessoas()).map((p) => ({ membroId: p.id }));
}

async function MembroConteudo({ params }: { params: PageProps<"/membros/[membroId]">["params"] }) {
  const { membroId } = await params;
  const pessoa = await obterPessoa(membroId);
  if (!pessoa) notFound();

  const participacoes = await projetosDaPessoa(pessoa.id);
  const todos = await obterCommits({ autor: pessoa.id });
  const total = todos.length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Voltar href="/membros">Membros</Voltar>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{pessoa.nome}</h1>
          {pessoa.saiuEm && <Selo>Saiu em {formatarMesAno(pessoa.saiuEm.slice(0, 7))}</Selo>}
        </div>
        <p className="text-sm text-gray-600">
          No CITi desde {formatarMesAno(pessoa.entrada)} · {participacoes.length}{" "}
          {participacoes.length === 1 ? "projeto" : "projetos"} · {total} commits
        </p>
      </div>

      <ul className="grid gap-4 md:grid-cols-2">
        {participacoes.map(({ projeto, membro }) => {
          const meus = todos.filter((c) => c.projetoId === projeto.id);
          return (
            <li key={projeto.id}>
              <Link href={`/projetos/${projeto.id}`} className="block h-full space-y-3 rounded-2xl border border-gray-300 bg-white p-5 transition-colors hover:border-verde/60">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-lg font-semibold">{projeto.nome}</div>
                    <div className="text-sm text-gray-600">{membro.papel}</div>
                  </div>
                  <SeloStatusProjeto projeto={projeto} />
                </div>
                <div className="flex items-end justify-between gap-3">
                  <div className="text-sm text-gray-600">
                    {meus.length
                      ? `${formatarData(meus.at(-1)!.data)} a ${formatarData(meus[0].data)}`
                      : "sem commits"}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold tabular-nums">{emPct(membro.icProjeto)}</div>
                    <div className="text-xs text-gray-500">IC no projeto</div>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function PaginaDoMembro(props: PageProps<"/membros/[membroId]">) {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Carregando…</p>}>
      <MembroConteudo params={props.params} />
    </Suspense>
  );
}

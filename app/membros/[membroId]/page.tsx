// Perfil do membro: cabeçalho (cargo, contatos, indicadores), calendário de contribuições,
// etapas em que é referência e os projetos de que participou.

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatarData, formatarMesAno, obterCommits, obterPessoa, obterPessoas, projetosDaPessoa } from "@/data";
import { emPct, lider } from "@/lib/indice";
import { statusProjeto } from "@/lib/status";
import { Caixa, Selo, Voltar } from "@/components/ui";
import { AvatarMembro, ContatosMembro } from "@/components/membros/pecas";
import { CalendarioContribuicoes } from "@/components/membros/calendario";
import { MenuMembro } from "@/components/membros/menu-membro";
import { OrbitaColaboracao, type Colega } from "@/components/membros/orbita";
import { SeloStatusProjeto } from "@/components/projeto/status";
import { EsqueletoMembro } from "@/components/ui/esqueletos";

export async function generateStaticParams() {
  return (await obterPessoas()).map((p) => ({ membroId: p.id }));
}

async function MembroConteudo({ params }: { params: PageProps<"/membros/[membroId]">["params"] }) {
  const { membroId } = await params;
  const pessoa = await obterPessoa(membroId);
  if (!pessoa) notFound();

  const participacoes = (await projetosDaPessoa(pessoa.id)).sort((a, b) => b.projeto.inicio.localeCompare(a.projeto.inicio));
  const todos = await obterCommits({ autor: pessoa.id });
  const total = todos.length;
  const cargo = participacoes[0]?.membro.papel ?? "Sem projeto ainda";

  // etapas em que a pessoa é quem mais sabe (maior IC da etapa)
  const referencia = participacoes.flatMap(({ projeto }) =>
    projeto.etapas
      .map((e) => ({ etapa: e, projeto, top: lider(projeto, e.id) }))
      .filter((x) => x.top?.membro.id === pessoa.id)
      .map((x) => ({ etapa: x.etapa.nome, projeto: x.projeto, ic: x.top!.ic })),
  );
  // órbita: colegas dos projetos em comum, com os commits deles nas etapas em que a pessoa trabalhou
  const colegasPorId = new Map<string, Colega>();
  for (const { projeto } of participacoes) {
    const minhasEtapas = new Set(todos.filter((c) => c.projetoId === projeto.id).flatMap((c) => c.etapas));
    const doProjeto = await obterCommits({ projetoId: projeto.id });
    for (const m of projeto.membros) {
      if (m.id === pessoa.id) continue;
      const juntos = doProjeto.filter((c) => c.autor === m.id && c.etapas.some((e) => minhasEtapas.has(e))).length;
      const colega = colegasPorId.get(m.id) ?? { id: m.id, nome: m.nome, github: m.github, saiu: !!m.saiuEm, projetos: [], commitsJuntos: 0 };
      colega.projetos.push(projeto.nome);
      colega.commitsJuntos += juntos;
      colegasPorId.set(m.id, colega);
    }
  }
  const colegas = [...colegasPorId.values()].sort((a, b) => b.commitsJuntos - a.commitsJuntos || a.nome.localeCompare(b.nome));

  const atrasados = participacoes.filter(({ projeto }) => statusProjeto(projeto) === "Atrasado").length;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Voltar href="/membros">Membros</Voltar>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <AvatarMembro nome={pessoa.nome} github={pessoa.github} grande />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-[-0.03em]">{pessoa.nome}</h1>
                {pessoa.saiuEm && <Selo>Ex-membro · saiu em {formatarMesAno(pessoa.saiuEm.slice(0, 7))}</Selo>}
                <MenuMembro membroId={pessoa.id} nome={pessoa.nome} temCommits={total > 0} />
              </div>
              <p className="text-sm text-gray-700">{cargo}</p>
              <p className="text-xs text-gray-500">No CITi desde {formatarMesAno(pessoa.entrada)}</p>
              <ContatosMembro nome={pessoa.nome} email={pessoa.email} linkedin={pessoa.linkedin} github={pessoa.github} />
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-2">
            {[
              { valor: total, rotulo: "commits", cor: "text-verde" },
              { valor: referencia.length, rotulo: "etapas em que é referência", cor: "text-branco" },
              { valor: atrasados, rotulo: "projetos atrasados", cor: atrasados ? "text-ambar" : "text-branco" },
            ].map((d) => (
              <div key={d.rotulo} className="w-32 rounded-xl border border-linha bg-white px-4 py-3">
                <dd className={`text-3xl leading-none font-bold tabular-nums ${d.cor}`}>{d.valor}</dd>
                <dt className="mt-1.5 text-xs text-gray-600">{d.rotulo}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <Caixa titulo="Contribuições">
        <CalendarioContribuicoes commits={todos} />
      </Caixa>

      <div className="grid gap-4 lg:grid-cols-2">
        <Caixa titulo={`Órbita de colaboração · ${colegas.length} ${colegas.length === 1 ? "colega" : "colegas"}`}>
          <OrbitaColaboracao pessoa={{ nome: pessoa.nome, github: pessoa.github }} colegas={colegas} />
        </Caixa>
        <Caixa titulo={`Referência em · ${referencia.length}`}>
          {referencia.length ? (
            <ul className="space-y-3">
              {referencia.map((r) => (
                <li key={`${r.projeto.id}-${r.etapa}`} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_3rem] items-center gap-3 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{r.etapa}</span>
                    <Link href={`/projetos/${r.projeto.id}`} className="block truncate text-xs text-gray-500 hover:text-verde">
                      {r.projeto.nome}
                    </Link>
                  </span>
                  <span className="h-2 overflow-hidden rounded-full bg-branco/10">
                    <span className="anima-barra block h-full rounded-full bg-verde" style={{ width: `${r.ic}%` }} />
                  </span>
                  <span className="dado text-right">{emPct(r.ic)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">Ainda não é quem mais sabe em nenhuma etapa.</p>
          )}
        </Caixa>
      </div>

      <h2 className="rotulo">Projetos · {participacoes.length}</h2>
      <ul className="grid gap-4 md:grid-cols-2">
        {participacoes.map(({ projeto, membro }) => {
          const meus = todos.filter((c) => c.projetoId === projeto.id);
          return (
            <li key={projeto.id}>
              <Link href={`/projetos/${projeto.id}`} className="block h-full space-y-3 rounded-xl border border-linha bg-white p-5 transition-colors hover:border-verde/60">
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
    <Suspense fallback={<EsqueletoMembro />}>
      <MembroConteudo params={props.params} />
    </Suspense>
  );
}

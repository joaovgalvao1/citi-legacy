// Entrada do site: apresenta o CITi Legacy antes do login

import Link from "next/link";
import { obterPessoas, obterProjeto, obterProjetos, totalDeCommits } from "@/data";
import { ranking } from "@/lib/indice";
import { PreviaPainel } from "@/components/entrada/previa";
import { progressoProjeto, statusProjeto, textoPrazo } from "@/lib/status";
import { corDoMembro } from "@/components/graficos/cores";
import { IconeConhecimento, IconeEntrar, IconeLegado, IconeProgresso, IconeRepositorio } from "@/components/ui/icones";

const RECURSOS = [
  {
    icone: IconeProgresso,
    titulo: "Acompanhe cada projeto",
    texto: "Progresso pelas tasks de cada etapa, prazos e avisos de etapa atrasada ou parada.",
  },
  {
    icone: IconeConhecimento,
    titulo: "Saiba quem sabe o quê",
    texto: "O Índice de Conhecimento mostra, a partir dos commits, quanto de cada etapa está com cada pessoa.",
  },
  {
    icone: IconeLegado,
    titulo: "Guarde o legado da empresa",
    texto: "Projetos concluídos continuam consultáveis: o que foi feito, quando e por quem.",
  },
];

const PASSOS = [
  { titulo: "Etapas ligadas ao repositório", texto: "Cada etapa aponta para as pastas do código que ela cobre.", codigo: "src/estoque/**" },
  { titulo: "Commits viram participação", texto: "Cada commit conta na etapa dos arquivos que alterou.", codigo: "feat(estoque): baixa automática" },
  { titulo: "Tasks mostram o progresso", texto: "Marcar uma task atualiza a etapa, o projeto e os avisos.", codigo: "6 de 8 tasks · 75%" },
];

export default async function Entrada() {
  const [projetos, pessoas, commits] = await Promise.all([obterProjetos(), obterPessoas(), totalDeCommits()]);
  const andamento = projetos.filter((p) => statusProjeto(p) !== "Concluído").length;
  const exemplo = (await obterProjeto("clinica-movimento"))!;
  const etapaExemplo = exemplo.etapas.find((e) => e.id === "unidades")!;
  const conhecimento = ranking(exemplo, etapaExemplo.id).slice(0, 3);

  return (
    <div>
      {/* destaque */}
      <section className="relative overflow-hidden border-b border-gray-300">
        {/* fundo da identidade do CITi (padrão do banner do site), esmaecido para a esquerda */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-full bg-cover bg-right opacity-90 md:w-3/5"
          style={{ backgroundImage: "url(/marca/fundo-citi.webp)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-fundo from-35% via-fundo/70 to-transparent"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-fundo to-transparent" />
        <div className="relative mx-auto grid max-w-5xl gap-12 px-4 py-20 md:grid-cols-[1.15fr_1fr] md:items-center">
          <div className="anima-surgir space-y-6">
            <p className="dado flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-verde">
              <span className="h-2 w-2 rounded-full bg-verde" aria-hidden="true" />
              Ferramenta interna do CITi · CIn UFPE
            </p>
            <h1 className="text-4xl leading-tight font-bold sm:text-5xl">
              Todo projeto deixa um legado.
              <span className="block text-verde">Quem chega não começa do zero.</span>
            </h1>
            <p className="max-w-lg text-lg text-gray-600">
              Todos os projetos da empresa, em andamento e concluídos, num só lugar: progresso, atividade da equipe e quem
              sabe o quê, direto dos commits.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-verde px-6 py-2.5 font-semibold text-fundo transition-colors hover:bg-verde-escuro"
              >
                <IconeEntrar className="h-4 w-4" />
                Entrar
              </Link>
              <a
                href="#como-funciona"
                className="rounded-full border border-gray-400 px-6 py-2.5 text-gray-800 transition-colors hover:border-gray-600"
              >
                Como funciona
              </a>
            </div>
          </div>

          {/* prévia do painel: só formato e números; projeto, etapa e nomes ficam ocultos (protegidos pelo login) */}
          <PreviaPainel
            dados={{
              status: statusProjeto(exemplo),
              progresso: progressoProjeto(exemplo),
              prazo: textoPrazo(exemplo),
              pessoas: conhecimento.map((l) => ({ ic: l.ic, cor: corDoMembro(exemplo, l.membro.id) })),
            }}
          />
        </div>
      </section>

      {/* números */}
      <section className="border-b border-gray-300">
        <dl className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4">
          {[
            [andamento, "projetos em andamento"],
            [projetos.length - andamento, "projetos concluídos"],
            [pessoas.length, "pessoas no histórico"],
            [commits, "commits analisados"],
          ].map(([valor, rotulo]) => (
            <div key={rotulo} className="space-y-1">
              <dd className="dado text-3xl font-semibold text-verde">{valor}</dd>
              <dt className="text-sm text-gray-600">{rotulo}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* recursos */}
      <section id="como-funciona" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-16">
        <h2 className="text-3xl font-bold">O que o CITi Legacy faz</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {RECURSOS.map(({ icone: Icone, titulo, texto }) => (
            <li
              key={titulo}
              className="rounded-2xl border border-gray-300 bg-white p-6 transition-colors hover:border-verde/50"
            >
              <span className="inline-flex rounded-xl bg-verde/10 p-2.5 text-verde">
                <Icone className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{titulo}</h3>
              <p className="mt-2 text-sm text-gray-600">{texto}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* do repositório ao painel */}
      <section className="border-y border-gray-300 bg-white/40">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="flex items-center gap-3">
            <span className="inline-flex rounded-xl bg-verde/10 p-2.5 text-verde">
              <IconeRepositorio className="h-6 w-6" />
            </span>
            <h2 className="text-3xl font-bold">Do repositório ao painel</h2>
          </div>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {PASSOS.map((p, i) => (
              <li key={p.titulo} className="rounded-2xl border border-gray-300 bg-fundo p-6">
                <span className="dado text-sm text-verde">0{i + 1}</span>
                <h3 className="mt-2 font-semibold">{p.titulo}</h3>
                <p className="mt-2 text-sm text-gray-600">{p.texto}</p>
                <code className="dado mt-4 inline-block rounded-lg border border-gray-300 bg-gray-100 px-2 py-1 text-xs text-gray-700">
                  {p.codigo}
                </code>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* chamada final */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h2 className="text-3xl font-bold">Pronto para ver os projetos?</h2>
        <p className="mt-3 text-gray-600">Entre com o usuário de demonstração do protótipo.</p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-verde px-6 py-2.5 font-semibold text-fundo transition-colors hover:bg-verde-escuro"
        >
          <IconeEntrar className="h-4 w-4" />
          Entrar no CITi Legacy
        </Link>
      </section>
    </div>
  );
}

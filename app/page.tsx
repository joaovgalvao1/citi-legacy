// Página inicial — apresenta o CITi Legacy antes da lista de projetos

import Link from "next/link";
import { pessoas, projetos } from "@/data";
import { commits } from "@/data/commits";
import { statusProjeto } from "@/lib/status";
import { BotaoLink, Caixa } from "@/components/ui";

const passos = [
  {
    titulo: "Acompanhar o que está em andamento",
    texto: "Progresso e prazo de cada etapa, atividade da equipe e alertas de atraso, etapa parada ou saída próxima.",
  },
  {
    titulo: "Saber quem sabe o quê",
    texto: "O Índice de Conhecimento mostra, a partir dos commits, quanto de cada etapa está com cada pessoa.",
  },
  {
    titulo: "Guardar o legado da empresa",
    texto: "Projetos concluídos continuam consultáveis: o que foi feito, quando, por quem e quem procurar hoje.",
  },
];

export default function Inicio() {
  const andamento = projetos.filter((p) => statusProjeto(p) !== "Concluído").length;
  const concluidos = projetos.length - andamento;

  return (
    <div className="space-y-10 py-4">
      <section className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-wide text-gray-500">CITi Legacy</p>
        <h1 className="mx-auto max-w-2xl text-3xl font-bold sm:text-4xl">
          Todo projeto deixa um legado. Quem chega não começa do zero.
        </h1>
        <p className="mx-auto max-w-xl text-gray-600">
          Todos os projetos do CITi, em andamento e concluídos, num só lugar. Membros mudam todo semestre; o histórico
          de quem construiu cada parte fica.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <BotaoLink href="/projetos">Ver projetos</BotaoLink>
          <BotaoLink href="/membros" variante="secundario">
            Ver membros
          </BotaoLink>
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Projetos em andamento", andamento],
          ["Projetos concluídos", concluidos],
          ["Pessoas", pessoas.length],
          ["Commits analisados", commits.length],
        ].map(([rotulo, valor]) => (
          <div key={rotulo} className="border border-gray-300 bg-white p-3 text-center">
            <dd className="text-2xl font-bold tabular-nums">{valor}</dd>
            <dt className="text-xs text-gray-500">{rotulo}</dt>
          </div>
        ))}
      </dl>

      <Caixa titulo="O que o CITi Legacy faz">
        <ol className="grid gap-4 sm:grid-cols-3">
          {passos.map((passo) => (
            <li key={passo.titulo} className="space-y-1 border border-gray-300 p-3">
              <div className="font-semibold">{passo.titulo}</div>
              <p className="text-sm text-gray-600">{passo.texto}</p>
            </li>
          ))}
        </ol>
      </Caixa>

      <p className="text-center text-xs text-gray-500">
        Dados do protótipo: projetos inspirados no treinamento e cases reais do CITi (
        <Link href="/projetos/neoenergia-galt" className="underline">
          Neoenergia GALT
        </Link>{" "}
        e{" "}
        <Link href="/projetos/riachuelo-omnichannel" className="underline">
          Riachuelo
        </Link>
        ), com pessoas e commits fictícios.
      </p>
    </div>
  );
}

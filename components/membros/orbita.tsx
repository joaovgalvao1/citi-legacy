"use client";

// Órbita de colaboração (perfil do membro): a pessoa no centro e os colegas em volta.
// Quanto mais perto e mais grossa a linha, mais trabalharam juntos (commits do colega nas
// mesmas etapas em que a pessoa trabalhou). Girar traz um colega ao topo; clicar nele de novo
// abre o perfil dele, que vira o novo centro.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AvatarMembro } from "./avatar";
import { Roda } from "./roda";

export type Colega = {
  id: string;
  nome: string;
  github?: string;
  saiu: boolean;
  projetos: string[];
  /** Commits do colega nas mesmas etapas (dos projetos em comum) em que a pessoa trabalhou. */
  commitsJuntos: number;
};

export function OrbitaColaboracao({ pessoa, colegas }: { pessoa: { nome: string; github?: string }; colegas: Colega[] }) {
  const router = useRouter();
  const maximo = Math.max(1, ...colegas.map((c) => c.commitsJuntos));
  const primeiro = pessoa.nome.split(" ")[0];

  if (!colegas.length) return <p className="text-sm text-gray-600">{primeiro} ainda não dividiu projeto com ninguém.</p>;

  return (
    <Roda
      itens={colegas.map((c) => ({ ...c, raio: 1 - c.commitsJuntos / maximo, linha: c.commitsJuntos / maximo, apagado: c.saiu }))}
      rotulo={`Colegas de ${pessoa.nome}`}
      aoAbrir={(c) => router.push(`/membros/${c.id}`)}
      raioMin={33}
      fundo
      dica="Mais perto e com a linha mais grossa = mais trabalho nas mesmas etapas. Clique no colega em foco para ver a órbita dele."
      centro={(c) => (
        <div key={c.id} className="anima-fade flex flex-col items-center">
          <span className="hidden rounded-full shadow-[0_0_0_3px_var(--color-white),0_0_0_5px_var(--color-verde)] sm:inline-block">
            <AvatarMembro nome={pessoa.nome} github={pessoa.github} tamanho="h-9 w-9 text-xs sm:h-11 sm:w-11 sm:text-sm" />
          </span>
          <div className="rotulo mt-2 text-verde">
            {primeiro} + {c.nome.split(" ")[0]}
          </div>
          <div className="mt-1 line-clamp-2 text-xs text-gray-700">{c.projetos.join(" e ")}</div>
          <div className="dado mt-0.5 text-[11px] text-gray-500 sm:text-xs">
            {c.commitsJuntos} {c.commitsJuntos === 1 ? "commit" : "commits"} nas mesmas etapas
            {c.saiu && " · ex-membro"}
          </div>
          <Link href={`/membros/${c.id}`} className="mt-2 text-xs text-verde underline-offset-4 hover:underline">
            Ver perfil de {c.nome.split(" ")[0]} →
          </Link>
        </div>
      )}
    />
  );
}

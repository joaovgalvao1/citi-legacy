"use client";

// Avatar do membro: a foto do GitHub quando o perfil está vinculado; senão (ou se a foto não carregar),
// as iniciais no verde do CITi.

import { useState } from "react";

export const iniciais = (nome: string) =>
  nome
    .split(" ")
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

export function AvatarMembro({
  nome,
  github,
  grande = false,
  tamanho: classeTamanho,
}: {
  nome: string;
  github?: string;
  grande?: boolean;
  /** Classes de tamanho no lugar do padrão (ex.: na roda de membros). */
  tamanho?: string;
}) {
  const [falhou, setFalhou] = useState(false);
  const tamanho = classeTamanho ?? (grande ? "h-16 w-16 text-xl" : "h-10 w-10 text-sm");
  if (github && !falhou) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- foto externa (GitHub), sem otimização do Next
      <img
        src={`https://github.com/${encodeURIComponent(github)}.png?size=${grande ? 128 : 80}`}
        alt={`Foto de ${nome} (GitHub)`}
        onError={() => setFalhou(true)}
        className={`${tamanho} shrink-0 rounded-full border border-verde/40 bg-verde object-cover`}
      />
    );
  }
  return (
    <span aria-hidden="true" className={`dado flex shrink-0 items-center justify-center rounded-full bg-verde font-semibold text-fundo ${tamanho}`}>
      {iniciais(nome)}
    </span>
  );
}

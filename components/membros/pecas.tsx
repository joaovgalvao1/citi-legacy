// Peças dos membros: avatar (verde do CITi para todos) e contatos (e-mail, LinkedIn, GitHub).
// As pessoas são fictícias: os contatos aparecem como seriam no app real, mas não levam a lugar nenhum;
// ao passar o mouse, a dica deixa claro que é um protótipo.

import { IconeEmail, IconeGithub, IconeLinkedin } from "@/components/ui/icones";

export const iniciais = (nome: string) =>
  nome
    .split(" ")
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

export function AvatarMembro({ nome, grande = false }: { nome: string; grande?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`dado flex shrink-0 items-center justify-center rounded-full bg-verde font-semibold text-fundo ${
        grande ? "h-16 w-16 text-xl" : "h-10 w-10 text-sm"
      }`}
    >
      {iniciais(nome)}
    </span>
  );
}

const CONTATOS = [
  { id: "email", Icone: IconeEmail, rotulo: "e-mail" },
  { id: "linkedin", Icone: IconeLinkedin, rotulo: "LinkedIn" },
  { id: "github", Icone: IconeGithub, rotulo: "GitHub" },
] as const;

/** Ícones de contato. Protótipo: não são links de verdade (a dica explica ao passar o mouse). */
export function ContatosMembro({ nome }: { nome: string }) {
  return (
    <ul className="flex items-center gap-1.5" aria-label="Contatos (protótipo)">
      {CONTATOS.map(({ id, Icone, rotulo }) => (
        <li key={id} className="group relative">
          <span
            role="link"
            aria-disabled="true"
            tabIndex={0}
            aria-label={`${rotulo} de ${nome} (protótipo: link desativado)`}
            className="flex h-8 w-8 cursor-help items-center justify-center rounded-full border border-branco/15 bg-branco/5 text-gray-700 transition-colors hover:border-verde/50 hover:text-verde focus-visible:text-verde"
          >
            <Icone className="h-4 w-4" />
          </span>
          <span
            role="tooltip"
            className="pointer-events-none absolute top-full left-1/2 z-30 mt-2 hidden w-56 -translate-x-1/2 rounded-lg border border-branco/12 bg-[#1f1f1f] px-3 py-2 text-[11px] leading-snug text-gray-700 shadow-2xl group-hover:block group-focus-within:block"
          >
            <b className="text-ambar">Protótipo.</b> No app real, abriria o {rotulo} de {nome}.
          </span>
        </li>
      ))}
    </ul>
  );
}

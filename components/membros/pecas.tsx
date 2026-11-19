// Peças dos membros: avatar (foto do GitHub ou iniciais no verde do CITi) e contatos (e-mail, LinkedIn, GitHub).
// Contato cadastrado vira link de verdade. Sem cadastro (como nos membros fictícios), o ícone continua lá,
// e a dica ao passar o mouse deixa claro que é um protótipo e onde cadastrar.

import { IconeEmail, IconeGithub, IconeLinkedin } from "@/components/ui/icones";

export { AvatarMembro, iniciais } from "./avatar";

type Contatos = { email?: string; linkedin?: string; github?: string };

const CONTATOS = [
  { id: "email", Icone: IconeEmail, rotulo: "e-mail", link: (v: string) => `mailto:${v}` },
  { id: "linkedin", Icone: IconeLinkedin, rotulo: "LinkedIn", link: (v: string) => v },
  { id: "github", Icone: IconeGithub, rotulo: "GitHub", link: (v: string) => `https://github.com/${v}` },
] as const;

const icone =
  "flex h-8 w-8 items-center justify-center rounded-full border border-branco/15 bg-branco/5 text-gray-700 transition-colors hover:border-verde/50 hover:text-verde focus-visible:text-verde";
const dica =
  "pointer-events-none absolute top-full left-1/2 z-30 mt-2 hidden w-56 -translate-x-1/2 rounded-lg border border-branco/12 bg-[#1f1f1f] px-3 py-2 text-[11px] leading-snug text-gray-700 shadow-2xl group-hover:block group-focus-within:block";

export function ContatosMembro({ nome, ...contatos }: { nome: string } & Contatos) {
  return (
    <ul className="flex items-center gap-1.5" aria-label="Contatos">
      {CONTATOS.map(({ id, Icone, rotulo, link }) => {
        const valor = contatos[id];
        return (
          <li key={id} className="group relative">
            {valor ? (
              <a href={link(valor)} target="_blank" rel="noreferrer" aria-label={`${rotulo} de ${nome}`} className={icone}>
                <Icone className="h-4 w-4" />
              </a>
            ) : (
              <span
                role="link"
                aria-disabled="true"
                tabIndex={0}
                aria-label={`${rotulo} de ${nome} não cadastrado`}
                className={`${icone} cursor-help`}
              >
                <Icone className="h-4 w-4" />
              </span>
            )}
            <span role="tooltip" className={dica}>
              {valor ? (
                <span className="dado break-all text-branco">
                  {id === "github" ? `github.com/${valor}` : valor.replace(/^https?:\/\//, "")}
                </span>
              ) : (
                <>
                  <b className="text-ambar">Protótipo.</b> Sem {rotulo} cadastrado para {nome}. Cadastre em “Editar membro”.
                </>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

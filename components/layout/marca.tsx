// Marca do produto no padrão de submarca do CITi ("citi | 30 ANOS"):
// logo verde · divisória vertical fina · "LEGACY" em maiúsculas espaçadas.

import Image from "next/image";
import Link from "next/link";

const TAMANHOS = {
  // logo, divisória, texto, espaço de cada lado da divisória
  pequeno: { logo: "h-[18px]", divisoria: "h-[14px]", texto: "text-[9px] tracking-[3px]", espaco: "gap-2" },
  normal: { logo: "h-7", divisoria: "h-[22px]", texto: "text-[11.5px] tracking-[3.75px]", espaco: "gap-3" },
  grande: { logo: "h-12", divisoria: "h-9", texto: "text-[17px] tracking-[5.5px]", espaco: "gap-4" },
} as const;

/** Só o desenho da marca (sem link): cabeçalho, rodapé e Modo Reunião. */
export function Lockup({ tamanho = "normal" }: { tamanho?: keyof typeof TAMANHOS }) {
  const t = TAMANHOS[tamanho];
  return (
    <span className={`inline-flex items-center ${t.espaco}`}>
      <Image src="/marca/citi-logo-verde.png" alt="CITi" width={225} height={115} priority={tamanho !== "pequeno"} className={`${t.logo} w-auto`} />
      <span aria-hidden="true" className={`w-px ${t.divisoria} bg-branco/35`} />
      <span className={`font-medium uppercase leading-none text-branco ${t.texto}`}>Legacy</span>
    </span>
  );
}

export function Marca({ href = "/", grande = false }: { href?: string; grande?: boolean }) {
  return (
    <Link href={href} aria-label="CITi Legacy" className="inline-flex shrink-0 items-center">
      <Lockup tamanho={grande ? "grande" : "normal"} />
    </Link>
  );
}

// Peças básicas de interface (Caixa, Selo, Alerta, botões, skeleton) com a identidade do CITi:
// superfícies escuras, bordas finas (branco a 8%), formas em pílula e semáforo de status
// (verde = concluído/no prazo, âmbar = atenção, vermelho = atraso).

import Link from "next/link";
import type { ReactNode } from "react";

export function Caixa({
  titulo,
  children,
  className = "",
}: {
  titulo?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`anima-surgir rounded-xl border border-linha bg-white p-5 ${className}`}>
      {titulo && <h2 className="rotulo mb-4">{titulo}</h2>}
      {children}
    </section>
  );
}

/**
 * Título de página em dois pesos, como no site do CITi ("Começamos pela **pergunta certa.**"):
 * a primeira parte fina, o destaque em negrito. `rotulo` é a linha pequena em verde acima.
 */
export function TituloPagina({ fino, destaque, rotulo }: { fino: string; destaque: string; rotulo?: ReactNode }) {
  return (
    <div className="space-y-1.5">
      {rotulo && <p className="rotulo text-verde!">{rotulo}</p>}
      <h1 className="text-3xl leading-tight tracking-[-0.035em] sm:text-4xl">
        <span className="font-light">{fino}</span> <span className="font-bold">{destaque}</span>
      </h1>
    </div>
  );
}

export function Placeholder({ texto, altura = "h-40" }: { texto: string; altura?: string }) {
  return (
    <div
      className={`flex ${altura} items-center justify-center rounded-xl border border-dashed border-gray-400 bg-gray-100 p-4 text-center text-sm text-gray-500`}
    >
      [{texto}]
    </div>
  );
}

const tons = {
  neutro: "border-branco/20 text-gray-700",
  verde: "border-verde/40 bg-verde/10 text-verde",
  ambar: "border-ambar/50 bg-ambar/10 text-ambar",
  vermelho: "border-vermelho/50 bg-vermelho/10 text-vermelho",
};

export type Tom = keyof typeof tons;

/** Selo em pílula. `forte` = atenção (âmbar); `tom` escolhe a cor do semáforo explicitamente. */
export function Selo({ children, forte = false, tom }: { children: ReactNode; forte?: boolean; tom?: keyof typeof tons }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${tons[tom ?? (forte ? "ambar" : "neutro")]}`}>
      {children}
    </span>
  );
}

/** Alerta em linha: vermelho para atraso, âmbar para atenção. */
export function Alerta({ children, tom = "ambar" }: { children: ReactNode; tom?: "ambar" | "vermelho" }) {
  const cor = tom === "vermelho" ? "border-vermelho/30 bg-vermelho/10 [&>span:first-child]:text-vermelho" : "border-ambar/30 bg-ambar/10 [&>span:first-child]:text-ambar";
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm text-gray-800 ${cor}`}>
      <span aria-hidden="true">▲</span>
      <span>{children}</span>
    </div>
  );
}

const estiloPilula = {
  primario: "border-verde bg-verde font-semibold text-fundo hover:bg-verde-escuro hover:border-verde-escuro",
  secundario: "border-branco/25 bg-branco/5 text-branco hover:border-branco/50 hover:bg-branco/10",
};

export function BotaoLink({
  href,
  children,
  variante = "primario",
}: {
  href: string;
  children: ReactNode;
  variante?: keyof typeof estiloPilula;
}) {
  return (
    <Link
      href={href}
      className={`inline-block rounded-full border px-5 py-2 text-sm font-medium transition-colors ${estiloPilula[variante]}`}
    >
      {children}
    </Link>
  );
}

export function Botao({
  children,
  variante = "primario",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: keyof typeof estiloPilula }) {
  return (
    <button
      {...props}
      className={`inline-block cursor-pointer rounded-full border px-5 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${estiloPilula[variante]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Voltar({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-sm text-gray-500 transition-colors hover:text-verde">
      ← {children}
    </Link>
  );
}

/* ---------- skeletons (no lugar de "Carregando…") ---------- */

/** Bloco cinza animado. `className` define tamanho e forma (ex.: "h-4 w-40"). */
export function Esqueleto({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`esqueleto ${className}`} />;
}

/** Card de esqueleto: rótulo e algumas linhas. */
export function CaixaEsqueleto({ linhas = 3, altura }: { linhas?: number; altura?: string }) {
  return (
    <div className="space-y-3 rounded-xl border border-linha bg-white p-5">
      <Esqueleto className="h-3 w-32" />
      {altura ? (
        <Esqueleto className={`${altura} w-full`} />
      ) : (
        Array.from({ length: linhas }, (_, i) => <Esqueleto key={i} className={`h-3.5 ${["w-full", "w-11/12", "w-4/5", "w-2/3"][i % 4]}`} />)
      )}
    </div>
  );
}

/** Página carregando: anuncia para leitores de tela e mostra os blocos no formato do conteúdo. */
export function Carregando({ children }: { children: ReactNode }) {
  return (
    <div role="status" aria-label="Carregando" className="space-y-6">
      {children}
    </div>
  );
}

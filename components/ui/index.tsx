// Peças básicas de interface (Caixa, Selo, Alerta, botões) com a identidade do CITi:
// superfícies escuras, verde para ações e conclusão, âmbar para alertas.

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
    <section className={`anima-surgir rounded-2xl border border-gray-300 bg-white p-5 ${className}`}>
      {titulo && <h2 className="dado mb-4 text-xs font-medium uppercase tracking-[0.14em] text-gray-500">{titulo}</h2>}
      {children}
    </section>
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
  neutro: "border-gray-400 text-gray-700",
  verde: "border-verde/40 bg-verde/10 text-verde",
  ambar: "border-ambar/50 bg-ambar/10 text-ambar",
};

/** Selo em pílula. `forte` = alerta (âmbar); `tom` escolhe a cor explicitamente. */
export function Selo({ children, forte = false, tom }: { children: ReactNode; forte?: boolean; tom?: keyof typeof tons }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${tons[tom ?? (forte ? "ambar" : "neutro")]}`}>
      {children}
    </span>
  );
}

export function Alerta({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-ambar/30 bg-ambar/10 px-3 py-2 text-sm text-gray-800">
      <span aria-hidden="true" className="text-ambar">▲</span>
      <span>{children}</span>
    </div>
  );
}

const estiloPilula = {
  primario: "border-verde bg-verde font-semibold text-fundo hover:bg-verde-escuro hover:border-verde-escuro",
  secundario: "border-gray-400 bg-transparent text-gray-800 hover:border-gray-600",
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
      className={`inline-block rounded-full border px-5 py-2 text-sm transition-colors ${estiloPilula[variante]}`}
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
      className={`inline-block cursor-pointer rounded-full border px-5 py-2 text-sm transition-colors disabled:opacity-50 ${estiloPilula[variante]} ${className}`}
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

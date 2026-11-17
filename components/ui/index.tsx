// Peças básicas de interface (Caixa, Selo, Alerta, botões). Ainda em tons de cinza:
// a identidade visual do CITi entra na etapa 3, trocando só este arquivo e as cores dos gráficos.

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
    <section className={`border border-gray-400 bg-white p-4 ${className}`}>
      {titulo && (
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-600">
          {titulo}
        </h2>
      )}
      {children}
    </section>
  );
}

export function Placeholder({ texto, altura = "h-40" }: { texto: string; altura?: string }) {
  return (
    <div
      className={`flex ${altura} items-center justify-center border-2 border-dashed border-gray-400 bg-gray-100 p-4 text-center text-sm text-gray-500`}
    >
      [{texto}]
    </div>
  );
}

export function Selo({ children, forte = false }: { children: ReactNode; forte?: boolean }) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs ${
        forte ? "border-gray-800 bg-gray-800 text-white" : "border-gray-500 text-gray-700"
      }`}
    >
      {children}
    </span>
  );
}

export function Alerta({ children }: { children: ReactNode }) {
  return (
    <div className="border-l-4 border-gray-700 bg-gray-200 px-3 py-2 text-sm text-gray-800">
      ⚠ {children}
    </div>
  );
}

const estiloPilula = {
  primario: "border-gray-800 bg-gray-800 text-white hover:bg-gray-700",
  secundario: "border-gray-500 bg-white text-gray-800 hover:bg-gray-100",
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
      className={`inline-block rounded-full border px-4 py-1.5 text-sm ${estiloPilula[variante]}`}
    >
      {children}
    </Link>
  );
}

export function Botao({
  children,
  variante = "primario",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: keyof typeof estiloPilula }) {
  return (
    <button
      {...props}
      className={`inline-block cursor-pointer rounded-full border px-4 py-1.5 text-sm disabled:opacity-50 ${estiloPilula[variante]}`}
    >
      {children}
    </button>
  );
}

export function Voltar({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-sm text-gray-600 underline hover:text-gray-900">
      ← {children}
    </Link>
  );
}

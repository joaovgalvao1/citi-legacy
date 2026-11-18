"use client";

// Abas do projeto: cada uma é uma rota própria.

import Link from "next/link";
import { usePathname } from "next/navigation";

const ABAS = [
  { caminho: "", rotulo: "Visão geral" },
  { caminho: "/sobre", rotulo: "Sobre" },
  { caminho: "/participacao", rotulo: "Participação" },
];

export function AbasDoProjeto({ projetoId }: { projetoId: string }) {
  const atual = usePathname();
  const base = `/projetos/${projetoId}`;
  return (
    <nav aria-label="Seções do projeto" className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-gray-300 text-sm">
      {ABAS.map((a) => {
        const href = base + a.caminho;
        const ativa = atual === href;
        return (
          <Link
            key={a.rotulo}
            href={href}
            aria-current={ativa ? "page" : undefined}
            className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 ${
              ativa ? "border-verde font-semibold text-verde" : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {a.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

// Cards de membros com abas (na empresa / já saíram) e busca por nome.

import { useState } from "react";
import Link from "next/link";
import { Selo } from "@/components/ui";
import { AvatarMembro } from "./pecas";

export type ResumoMembro = {
  id: string;
  nome: string;
  /** Usuário do GitHub (a foto do avatar vem dele). */
  github?: string;
  /** Papel no projeto mais recente. */
  cargo: string;
  desde: string;
  saiuEm: string | null;
  projetos: number;
  /** Maior Índice de Conhecimento da pessoa num projeto. */
  maiorIc: { valor: number; projeto: string } | null;
};

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function ListaMembros({ membros }: { membros: ResumoMembro[] }) {
  const [aba, setAba] = useState<"empresa" | "sairam">("empresa");
  const [busca, setBusca] = useState("");

  const naEmpresa = membros.filter((m) => !m.saiuEm);
  const sairam = membros.filter((m) => m.saiuEm);
  const termo = normalizar(busca.trim());
  const visiveis = (aba === "empresa" ? naEmpresa : sairam).filter((m) => !termo || normalizar(m.nome).includes(termo));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 text-sm" role="tablist" aria-label="Membros">
          {(
            [
              ["empresa", `Na empresa · ${naEmpresa.length}`],
              ["sairam", `Já saíram · ${sairam.length}`],
            ] as const
          ).map(([id, rotulo]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={aba === id}
              onClick={() => setAba(id)}
              className={`cursor-pointer rounded-full border px-3 py-1 ${
                aba === id ? "border-verde bg-verde/10 text-verde" : "border-branco/25 bg-branco/5 text-gray-700"
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome"
          aria-label="Buscar membro por nome"
          className="w-full rounded-full border border-branco/25 bg-branco/5 px-4 py-1.5 text-sm outline-none transition-colors focus:border-verde sm:w-64"
        />
      </div>

      {visiveis.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-400 p-6 text-center text-sm text-gray-500">Nenhum membro encontrado.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visiveis.map((m) => (
            <li key={m.id}>
              <Link
                href={`/membros/${m.id}`}
                className="flex h-full flex-col gap-3 rounded-xl border border-linha bg-white p-5 transition-colors hover:border-verde/60"
              >
                <div className="flex items-start gap-3">
                  <AvatarMembro nome={m.nome} github={m.github} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="truncate font-semibold">{m.nome}</span>
                      {m.saiuEm && <Selo>Saiu em {m.saiuEm}</Selo>}
                    </div>
                    <p className="truncate text-sm text-gray-600">{m.cargo}</p>
                    <p className="text-xs text-gray-500">No CITi desde {m.desde}</p>
                  </div>
                </div>
                <div className="mt-auto space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>
                      {m.projetos} {m.projetos === 1 ? "projeto" : "projetos"}
                    </span>
                    {m.maiorIc && <span className="dado">maior IC {Math.round(m.maiorIc.valor)}%</span>}
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-branco/10" title={m.maiorIc ? `Maior IC: ${m.maiorIc.projeto}` : "Sem commits ainda"}>
                    {m.maiorIc && <div className="anima-barra h-full rounded-full bg-verde" style={{ width: `${m.maiorIc.valor}%` }} />}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

// Cards de membros com abas (na empresa / já saíram) e busca por nome.

import { useState } from "react";
import Link from "next/link";
import { Selo } from "@/components/ui";

export type ResumoMembro = { id: string; nome: string; desde: string; saiuEm: string | null; projetos: number };

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
                aba === id ? "border-verde bg-verde/10 text-verde" : "border-gray-400 bg-white text-gray-700"
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
          className="w-full rounded-full border border-gray-400 bg-white px-4 py-1.5 text-sm outline-none transition-colors focus:border-verde sm:w-64"
        />
      </div>

      {visiveis.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-400 p-6 text-center text-sm text-gray-500">Nenhum membro encontrado.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visiveis.map((m) => (
            <li key={m.id}>
              <Link href={`/membros/${m.id}`} className="block h-full space-y-1 rounded-2xl border border-gray-300 bg-white p-5 transition-colors hover:border-verde/60">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold">{m.nome}</span>
                  {m.saiuEm && <Selo>Saiu em {m.saiuEm}</Selo>}
                </div>
                <div className="text-sm text-gray-600">
                  No CITi desde {m.desde} · {m.projetos} {m.projetos === 1 ? "projeto" : "projetos"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

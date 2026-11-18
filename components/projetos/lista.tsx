"use client";

// Cards de projetos com abas (em andamento / concluídos) e busca.

import { useState } from "react";
import Link from "next/link";
import { Selo } from "@/components/ui";
import { BarraProgresso } from "@/components/ui/progresso";

export type ResumoProjeto = {
  id: string;
  nome: string;
  cliente: string;
  subtitulo: string;
  status: "Em andamento" | "Atrasado" | "Concluído";
  progresso: number;
  prazo: string;
  alerta: string | null;
  entrega: string | null;
  resultado: string | null;
};

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function ListaProjetos({ projetos }: { projetos: ResumoProjeto[] }) {
  const [aba, setAba] = useState<"andamento" | "concluidos">("andamento");
  const [busca, setBusca] = useState("");

  const andamento = projetos.filter((p) => p.status !== "Concluído");
  const concluidos = projetos.filter((p) => p.status === "Concluído");
  const daAba = aba === "andamento" ? andamento : concluidos;
  const termo = normalizar(busca.trim());
  const visiveis = daAba
    .filter((p) => !termo || normalizar(`${p.nome} ${p.cliente} ${p.subtitulo}`).includes(termo))
    .sort((a, b) => Number(b.status === "Atrasado") - Number(a.status === "Atrasado") || Number(!!b.alerta) - Number(!!a.alerta));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 text-sm" role="tablist" aria-label="Projetos">
          {(
            [
              ["andamento", `Em andamento · ${andamento.length}`],
              ["concluidos", `Concluídos · ${concluidos.length}`],
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
          placeholder="Buscar projeto ou cliente"
          aria-label="Buscar projeto ou cliente"
          className="w-full rounded-full border border-gray-400 bg-white px-4 py-1.5 text-sm outline-none transition-colors focus:border-verde sm:w-64"
        />
      </div>

      {visiveis.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-400 p-6 text-center text-sm text-gray-500">Nenhum projeto encontrado.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {visiveis.map((p) => (
            <li key={p.id}>
              <Link href={`/projetos/${p.id}`} className="block h-full space-y-3 rounded-2xl border border-gray-300 bg-white p-5 transition-colors hover:border-verde/60">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-lg font-semibold">{p.nome}</div>
                    <div className="text-sm text-gray-600">{p.cliente === p.nome ? p.subtitulo : p.cliente}</div>
                  </div>
                  <Selo tom={p.status === "Atrasado" ? "ambar" : p.status === "Concluído" ? "verde" : "neutro"}>{p.status}</Selo>
                </div>
                {p.status === "Concluído" ? (
                  <>
                    <div className="text-sm text-gray-700">{p.entrega}</div>
                    {p.resultado && <div className="text-sm text-gray-600">{p.resultado}</div>}
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <BarraProgresso valor={p.progresso} compacta />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span className="dado">{Math.round(p.progresso)}%</span>
                        <span className="dado">{p.prazo}</span>
                      </div>
                    </div>
                    {p.alerta && <div className="text-sm font-medium text-ambar">▲ {p.alerta}</div>}
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

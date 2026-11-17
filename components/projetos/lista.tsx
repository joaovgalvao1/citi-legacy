"use client";

// Lista de projetos com filtro por status e busca por nome ou cliente.

import { useState } from "react";
import Link from "next/link";
import { Alerta, Selo } from "@/components/ui";
import { BarraProgresso } from "@/components/ui/progresso";

export type ResumoProjeto = {
  id: string;
  nome: string;
  cliente: string;
  descricao: string;
  caseReal: boolean;
  status: "Em andamento" | "Atrasado" | "Concluído";
  progresso: number;
  prazo: string;
  membros: number;
  etapas: number;
  alertaPrincipal: { texto: string; informativo: boolean } | null;
  totalAlertas: number;
};

const FILTROS = ["Todos", "Em andamento", "Atrasado", "Concluído"] as const;
const ROTULO: Record<(typeof FILTROS)[number], string> = {
  Todos: "Todos",
  "Em andamento": "Em andamento",
  Atrasado: "Atrasados",
  Concluído: "Concluídos",
};
const ORDEM: Record<ResumoProjeto["status"], number> = { Atrasado: 0, "Em andamento": 1, Concluído: 2 };

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function ListaProjetos({ projetos }: { projetos: ResumoProjeto[] }) {
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>("Todos");
  const [busca, setBusca] = useState("");

  const visiveis = projetos
    .filter((p) => filtro === "Todos" || p.status === filtro)
    .filter((p) => !busca.trim() || normalizar(`${p.nome} ${p.cliente}`).includes(normalizar(busca.trim())))
    .sort((a, b) => ORDEM[a.status] - ORDEM[b.status] || b.totalAlertas - a.totalAlertas);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-sm" role="group" aria-label="Filtrar por status">
          {FILTROS.map((f) => {
            const qtd = f === "Todos" ? projetos.length : projetos.filter((p) => p.status === f).length;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFiltro(f)}
                aria-pressed={filtro === f}
                className={`cursor-pointer rounded-full border px-3 py-1 ${
                  filtro === f ? "border-gray-800 bg-gray-800 text-white" : "border-gray-400 bg-white text-gray-700"
                }`}
              >
                {ROTULO[f]} · {qtd}
              </button>
            );
          })}
        </div>
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por projeto ou cliente"
          aria-label="Buscar por projeto ou cliente"
          className="w-full border border-gray-400 bg-white px-3 py-1.5 text-sm sm:w-72"
        />
      </div>

      {visiveis.length === 0 ? (
        <p className="border border-dashed border-gray-400 p-6 text-center text-sm text-gray-500">
          Nenhum projeto encontrado.
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {visiveis.map((p) => (
            <li key={p.id}>
              <Link href={`/projetos/${p.id}`} className="block h-full space-y-3 border border-gray-400 bg-white p-4 hover:border-gray-800">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="text-lg font-semibold">{p.nome}</span>
                  <span className="flex flex-wrap gap-1">
                    {p.caseReal && <Selo>Case real</Selo>}
                    <Selo forte={p.status === "Atrasado"}>{p.status}</Selo>
                  </span>
                </div>
                <div className="text-sm text-gray-600">Cliente: {p.cliente}</div>
                <p className="line-clamp-2 text-sm text-gray-700">{p.descricao}</p>
                <BarraProgresso valor={p.progresso} rotulo={`${p.etapas} etapas · ${p.membros} membros`} compacta />
                <div className="text-sm text-gray-600">Prazo: {p.prazo}</div>
                {p.alertaPrincipal &&
                  (p.alertaPrincipal.informativo ? (
                    <div className="text-sm text-gray-600">ℹ {p.alertaPrincipal.texto}</div>
                  ) : (
                    <Alerta>
                      {p.alertaPrincipal.texto}
                      {p.totalAlertas > 1 && ` · +${p.totalAlertas - 1}`}
                    </Alerta>
                  ))}
                <div className="text-sm text-gray-700 underline">Abrir painel →</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Tela 1 — Projetos da diretoria

import Link from "next/link";
import { projetos } from "@/data";
import { AlertasDoProjeto, ContagemEmRisco, RiscoDoProjeto } from "@/components/risco";

export default function ProjetosDaDiretoria() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Projetos da diretoria</h1>
        <p className="text-sm text-gray-600">
          {projetos.length} projetos ativos · <ContagemEmRisco projetos={projetos} />
        </p>
      </div>

      <ul className="grid gap-4 md:grid-cols-2">
        {projetos.map((p) => (
          <li key={p.id}>
            <Link
              href={`/projetos/${p.id}`}
              className="block h-full border border-gray-400 bg-white p-4 hover:border-gray-800"
            >
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <span className="text-lg font-semibold">{p.nome}</span>
                <RiscoDoProjeto projeto={p} />
              </div>
              <div className="mb-1 text-sm text-gray-600">Cliente: {p.cliente}</div>
              <p className="mb-3 text-sm text-gray-700">{p.descricao}</p>
              <dl className="mb-3 grid grid-cols-2 gap-1 text-sm">
                <dt className="text-gray-500">Membros</dt>
                <dd>{p.membros.length}</dd>
                <dt className="text-gray-500">Etapa atual</dt>
                <dd>{p.etapaAtual}</dd>
              </dl>
              <AlertasDoProjeto projeto={p} limite={1} />
              <div className="mt-3 text-sm text-gray-700 underline">Abrir painel →</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

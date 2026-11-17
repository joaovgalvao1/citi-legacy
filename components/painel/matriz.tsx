"use client";

// Matriz membro × etapa com o IC de cada um.
// Passar o mouse destaca a linha e a coluna; clicar numa célula abre a etapa;
// clicar no nome destaca o membro nos gráficos da página.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Projeto } from "@/data";
import { emPct, lider } from "@/lib/indice";
import { useDestaque } from "@/components/graficos/destaque";
import { corDoMembro } from "@/components/graficos/cores";

const linkEtapa = (projetoId: string, etapaId: string) => `/projetos/${projetoId}/etapas/${etapaId}`;

export function MatrizIC({ projeto }: { projeto: Projeto }) {
  const router = useRouter();
  const { membroId: destacado, alternar } = useDestaque();
  const [foco, setFoco] = useState<{ membro: string; etapa: string } | null>(null);

  return (
    <div className="overflow-x-auto" onMouseLeave={() => setFoco(null)}>
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-gray-300 bg-gray-100 p-2 text-left">Membro</th>
            {projeto.etapas.map((e) => (
              <th
                key={e.id}
                className={`border border-gray-300 p-2 text-left ${foco?.etapa === e.id ? "bg-gray-300" : "bg-gray-100"}`}
              >
                <Link href={linkEtapa(projeto.id, e.id)} className="underline">
                  {e.nome}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projeto.membros.map((m) => {
            const linhaAtiva = foco?.membro === m.id || destacado === m.id;
            return (
              <tr key={m.id}>
                <th scope="row" className={`border border-gray-300 p-0 text-left font-normal ${linhaAtiva ? "bg-gray-200" : ""}`}>
                  <button
                    type="button"
                    onClick={() => alternar(m.id)}
                    aria-pressed={destacado === m.id}
                    className="flex w-full cursor-pointer items-center gap-2 p-2 text-left"
                  >
                    <span className="inline-block h-2.5 w-2.5 shrink-0" style={{ backgroundColor: corDoMembro(projeto, m.id) }} />
                    {m.nome}
                  </button>
                </th>
                {projeto.etapas.map((e) => {
                  const valor = e.ic[m.id] ?? 0;
                  const principal = lider(projeto, e.id)?.membro.id === m.id;
                  const cruzamento = foco?.membro === m.id && foco?.etapa === e.id;
                  const realce = linhaAtiva || foco?.etapa === e.id;
                  return (
                    <td
                      key={e.id}
                      onMouseEnter={() => setFoco({ membro: m.id, etapa: e.id })}
                      onClick={() => router.push(linkEtapa(projeto.id, e.id))}
                      title={`${m.nome} · ${e.nome}: IC ${emPct(valor)} — clique para abrir a etapa`}
                      className={`cursor-pointer border border-gray-300 p-2 text-center tabular-nums ${
                        cruzamento
                          ? "bg-gray-500 text-white"
                          : principal
                            ? "bg-gray-400 font-semibold"
                            : realce
                              ? "bg-gray-200 text-gray-700"
                              : "text-gray-600"
                      }`}
                    >
                      {valor > 0 ? emPct(valor) : "—"}
                      {principal && " · principal"}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

"use client";

// Lista da lixeira: restaurar (volta como estava) ou apagar de vez (exige o nome do cliente).

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ProjetoNaLixeira } from "@/data";
import { apagarDeVez, restaurarProjeto } from "@/app/acoes";
import { formatarData } from "@/data/formatos";
import { avisar } from "@/lib/avisos";
import { somarDias } from "@/lib/hoje";
import { DIAS_NA_LIXEIRA } from "@/lib/novo-projeto";
import { Dialogo } from "@/components/ui/dialogo";

const DIA = 86400000;
const diasAte = (de: string, ate: string) => Math.round((new Date(`${ate}T12:00:00Z`).getTime() - new Date(`${de}T12:00:00Z`).getTime()) / DIA);

export function ListaLixeira({ projetos, hoje }: { projetos: ProjetoNaLixeira[]; hoje: string }) {
  const router = useRouter();
  const [apagando, setApagando] = useState<ProjetoNaLixeira | null>(null);
  const [erro, setErro] = useState("");
  const [ocupado, iniciar] = useTransition();

  if (!projetos.length) {
    return (
      <div className="rounded-xl border border-dashed border-branco/25 p-8 text-center">
        <p className="text-sm text-gray-600">A lixeira está vazia.</p>
        <Link href="/projetos" className="mt-2 inline-block text-sm text-verde hover:underline">
          Voltar aos projetos
        </Link>
      </div>
    );
  }

  function restaurar(p: ProjetoNaLixeira) {
    iniciar(async () => {
      const r = await restaurarProjeto(p.id);
      if ("erro" in r) {
        avisar({ texto: r.erro, tom: "vermelho" });
        return;
      }
      avisar({ texto: `${p.nome} foi restaurado`, detalhe: "Voltou para a lista de projetos" });
      router.refresh();
    });
  }

  function confirmarApagar(digitado: string) {
    if (!apagando) return;
    const p = apagando;
    setErro("");
    iniciar(async () => {
      const r = await apagarDeVez(p.id, digitado);
      if ("erro" in r) return setErro(r.erro);
      setApagando(null);
      avisar({ texto: `${p.nome} foi apagado de vez`, tom: "vermelho" });
      router.refresh();
    });
  }

  return (
    <>
      <ul className="space-y-3">
        {projetos.map((p) => {
          const restam = Math.max(0, DIAS_NA_LIXEIRA - diasAte(p.apagadoEm, hoje));
          return (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-linha bg-white p-5">
              <div className="min-w-0">
                <p className="truncate text-lg font-bold tracking-tight">{p.nome}</p>
                <p className="text-sm text-gray-600">{p.cliente}</p>
                <p className="dado mt-1 text-xs text-gray-500">
                  apagado em {formatarData(p.apagadoEm)} · <span className={restam <= 7 ? "text-vermelho" : ""}>some de vez em {restam} {restam === 1 ? "dia" : "dias"}</span>{" "}
                  ({formatarData(somarDias(p.apagadoEm, DIAS_NA_LIXEIRA))})
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => restaurar(p)}
                  className="cursor-pointer rounded-full bg-verde px-5 py-2 text-sm font-semibold text-fundo transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  Restaurar
                </button>
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => setApagando(p)}
                  className="cursor-pointer rounded-full border border-vermelho/50 px-5 py-2 text-sm font-medium text-vermelho transition-colors hover:bg-vermelho/10 disabled:opacity-50"
                >
                  Apagar de vez…
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <Dialogo
        aberto={!!apagando}
        titulo="Apagar de vez?"
        rotuloConfirmar="Apagar de vez"
        perigo
        exigir={apagando?.cliente}
        erro={erro}
        ocupado={ocupado}
        aoConfirmar={confirmarApagar}
        aoFechar={() => {
          setApagando(null);
          setErro("");
        }}
      >
        <p>
          <b className="text-branco">{apagando?.nome}</b> será apagado para sempre, com etapas, tasks, commits e resumos da IA.
        </p>
        <p className="font-semibold text-vermelho">Não dá para desfazer.</p>
      </Dialogo>
    </>
  );
}

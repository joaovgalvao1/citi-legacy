"use client";

// Lixeira de membros: restaurar ou apagar de vez (confirmação leve, com uma caixa).

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MembroNaLixeira } from "@/data";
import { apagarMembroDeVez, restaurarMembro } from "@/app/acoes";
import { formatarData } from "@/data/formatos";
import { avisar } from "@/lib/avisos";
import { DIAS_NA_LIXEIRA } from "@/lib/novo-projeto";
import { Dialogo } from "@/components/ui/dialogo";
import { AvatarMembro } from "./pecas";

const DIA = 86400000;
const diasEntre = (de: string, ate: string) => Math.round((new Date(`${ate}T12:00:00Z`).getTime() - new Date(`${de}T12:00:00Z`).getTime()) / DIA);

export function ListaLixeiraMembros({ membros, hoje }: { membros: MembroNaLixeira[]; hoje: string }) {
  const router = useRouter();
  const [apagando, setApagando] = useState<MembroNaLixeira | null>(null);
  const [erro, setErro] = useState("");
  const [ocupado, iniciar] = useTransition();

  if (!membros.length) {
    return (
      <div className="rounded-xl border border-dashed border-branco/25 p-8 text-center">
        <p className="text-sm text-gray-600">A lixeira está vazia.</p>
        <Link href="/membros" className="mt-2 inline-block text-sm text-verde hover:underline">
          Voltar aos membros
        </Link>
      </div>
    );
  }

  function restaurar(m: MembroNaLixeira) {
    iniciar(async () => {
      await restaurarMembro(m.id);
      avisar({ texto: `${m.nome} foi restaurado`, detalhe: "Voltou para a lista de membros" });
      router.refresh();
    });
  }

  function apagarDeVez() {
    if (!apagando) return;
    const m = apagando;
    setErro("");
    iniciar(async () => {
      const r = await apagarMembroDeVez(m.id);
      if ("erro" in r) {
        setErro(r.erro);
        return;
      }
      setApagando(null);
      avisar({ texto: `${m.nome} foi apagado de vez`, tom: "vermelho" });
      router.refresh();
    });
  }

  return (
    <>
      <ul className="space-y-3">
        {membros.map((m) => {
          const restam = Math.max(0, DIAS_NA_LIXEIRA - diasEntre(m.apagadoEm, hoje));
          return (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-linha bg-white p-5">
              <div className="flex min-w-0 items-center gap-3">
                <AvatarMembro nome={m.nome} />
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold tracking-tight">{m.nome}</p>
                  <p className="dado text-xs text-gray-500">
                    apagado em {formatarData(m.apagadoEm)} ·{" "}
                    <span className={restam <= 7 ? "text-vermelho" : ""}>
                      some de vez em {restam} {restam === 1 ? "dia" : "dias"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => restaurar(m)}
                  className="cursor-pointer rounded-full bg-verde px-5 py-2 text-sm font-semibold text-fundo transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  Restaurar
                </button>
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => setApagando(m)}
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
        caixa={`Entendo que ${apagando?.nome ?? ""} será apagado para sempre.`}
        erro={erro}
        ocupado={ocupado}
        aoConfirmar={apagarDeVez}
        aoFechar={() => {
          setApagando(null);
          setErro("");
        }}
      >
        <p>Não dá para desfazer.</p>
      </Dialogo>
    </>
  );
}

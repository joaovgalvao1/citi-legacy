"use client";

// Menu "⋯" no perfil do membro: editar e mover para a lixeira.
// Quem tem commits não pode ser apagado (os commits são o legado dos projetos): a opção aparece
// desativada, explicando que o caminho é marcar como ex-membro (na edição, com a data de saída).
// A confirmação é leve: uma caixa de confirmação, sem digitar nada.

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { moverMembroParaLixeira, restaurarMembro } from "@/app/acoes";
import { avisar } from "@/lib/avisos";
import { DIAS_NA_LIXEIRA } from "@/lib/novo-projeto";
import { Dialogo } from "@/components/ui/dialogo";

export function MenuMembro({ membroId, nome, temCommits }: { membroId: string; nome: string; temCommits: boolean }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [apagando, setApagando] = useState(false);
  const [erro, setErro] = useState("");
  const [ocupado, iniciar] = useTransition();
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => !menu.current?.contains(e.target as Node) && setAberto(false);
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, [aberto]);

  function confirmar() {
    setErro("");
    iniciar(async () => {
      const r = await moverMembroParaLixeira(membroId);
      if ("erro" in r) {
        setErro(r.erro);
        return;
      }
      setApagando(false);
      router.push("/membros");
      avisar({
        texto: `${nome} foi para a lixeira`,
        detalhe: `Some de vez em ${DIAS_NA_LIXEIRA} dias`,
        tom: "vermelho",
        acao: { rotulo: "Desfazer", executar: () => void restaurarMembro(membroId).then(() => router.push(`/membros/${membroId}`)) },
      });
    });
  }

  return (
    <div ref={menu} className="relative">
      <button
        type="button"
        aria-label="Mais ações do membro"
        aria-haspopup="menu"
        aria-expanded={aberto}
        onClick={() => setAberto((a) => !a)}
        className="cursor-pointer rounded-full border border-branco/25 bg-branco/5 px-3 py-1 text-sm leading-none tracking-widest text-gray-700 transition-colors hover:border-branco/50 hover:text-branco"
      >
        ⋯
      </button>
      {aberto && (
        <div
          role="menu"
          className="absolute left-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-xl border border-branco/12 bg-[#1a1a1a] py-1 shadow-2xl"
        >
          <Link
            role="menuitem"
            href={`/membros/editar/${membroId}`}
            className="block px-4 py-2 text-sm text-gray-800 hover:bg-branco/5 hover:text-branco"
          >
            Editar membro
          </Link>
          {temCommits ? (
            <p role="menuitem" aria-disabled="true" className="px-4 py-2 text-sm text-gray-500">
              Não pode ser apagado: tem commits nos projetos.
              <span className="mt-0.5 block text-xs">Para registrar a saída, edite e marque como ex-membro.</span>
            </p>
          ) : (
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setAberto(false);
                setApagando(true);
              }}
              className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-vermelho hover:bg-vermelho/10"
            >
              Mover para a lixeira…
            </button>
          )}
        </div>
      )}
      <Dialogo
        aberto={apagando}
        titulo="Mover para a lixeira?"
        rotuloConfirmar="Mover para a lixeira"
        perigo
        caixa={`Entendo que ${nome} sai da lista de membros e das equipes dos projetos.`}
        erro={erro}
        ocupado={ocupado}
        aoConfirmar={confirmar}
        aoFechar={() => {
          setApagando(false);
          setErro("");
        }}
      >
        <p>Fica {DIAS_NA_LIXEIRA} dias na lixeira, onde dá para restaurar. Depois disso, é apagado de vez.</p>
      </Dialogo>
    </div>
  );
}

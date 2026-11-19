"use client";

// Menu "⋯" no cabeçalho do projeto: editar e mover para a lixeira.
// Mover para a lixeira é grave: exige digitar o nome do cliente.

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { moverParaLixeira, restaurarProjeto } from "@/app/acoes";
import { avisar } from "@/lib/avisos";
import { DIAS_NA_LIXEIRA } from "@/lib/novo-projeto";
import { Dialogo } from "@/components/ui/dialogo";

export function MenuProjeto({ projetoId, nome, cliente }: { projetoId: string; nome: string; cliente: string }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [apagando, setApagando] = useState(false);
  const [erro, setErro] = useState("");
  const [ocupado, iniciar] = useTransition();
  const menu = useRef<HTMLDivElement>(null);

  // fecha o menu ao clicar fora
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => !menu.current?.contains(e.target as Node) && setAberto(false);
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, [aberto]);

  function confirmar(digitado: string) {
    setErro("");
    iniciar(async () => {
      const r = await moverParaLixeira(projetoId, digitado);
      if ("erro" in r) return setErro(r.erro);
      setApagando(false);
      router.push("/projetos");
      avisar({
        texto: `${nome} foi para a lixeira`,
        detalhe: `Some de vez em ${DIAS_NA_LIXEIRA} dias`,
        tom: "vermelho",
        acao: {
          rotulo: "Desfazer",
          executar: () => {
            void restaurarProjeto(projetoId).then(() => router.push(`/projetos/${projetoId}`));
          },
        },
      });
    });
  }

  return (
    <div ref={menu} className="relative">
      <button
        type="button"
        aria-label="Mais ações do projeto"
        aria-haspopup="menu"
        aria-expanded={aberto}
        onClick={() => setAberto((a) => !a)}
        className="cursor-pointer rounded-full border border-branco/25 bg-branco/5 px-3 py-1 text-sm leading-none tracking-widest text-gray-700 transition-colors hover:border-branco/50 hover:text-branco"
      >
        ⋯
      </button>
      {aberto && (
        <div role="menu" className="absolute left-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl border border-branco/12 bg-[#1a1a1a] py-1 shadow-2xl">
          <Link role="menuitem" href={`/projetos/editar/${projetoId}`} className="block px-4 py-2 text-sm text-gray-800 hover:bg-branco/5 hover:text-branco">
            Editar projeto
          </Link>
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
        </div>
      )}
      <Dialogo
        aberto={apagando}
        titulo="Mover para a lixeira?"
        rotuloConfirmar="Mover para a lixeira"
        perigo
        exigir={cliente}
        erro={erro}
        ocupado={ocupado}
        aoConfirmar={confirmar}
        aoFechar={() => {
          setApagando(false);
          setErro("");
        }}
      >
        <p>
          <b className="text-branco">{nome}</b> sai da lista de projetos, dos indicadores, do boletim e do e-mail da semana.
        </p>
        <p>
          Fica {DIAS_NA_LIXEIRA} dias na lixeira, onde dá para restaurar. Depois disso, é apagado de vez, com etapas, tasks, commits e resumos
          da IA.
        </p>
      </Dialogo>
    </div>
  );
}


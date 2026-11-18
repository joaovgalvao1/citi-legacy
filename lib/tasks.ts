"use client";

// Tasks marcadas pelo admin: gravadas no banco (ação do servidor) e aplicadas na tela na hora
// (atualização otimista), antes mesmo de o servidor responder.

import { useOptimistic, useTransition } from "react";
import type { Projeto } from "@/data";
import { alternarTask } from "@/app/acoes";

type Mudanca = { etapaId: string; ordem: number; feita: boolean };

function aplicar(projeto: Projeto, m: Mudanca): Projeto {
  return {
    ...projeto,
    etapas: projeto.etapas.map((e) => {
      if (e.id !== m.etapaId) return e;
      const tasks = e.tasks.map((t, i) => (i === m.ordem ? { ...t, feita: m.feita } : t));
      return { ...e, tasks, progresso: Math.round((tasks.filter((t) => t.feita).length / tasks.length) * 100) };
    }),
  };
}

/** Projeto com as mudanças ainda não confirmadas aplicadas, e a função para marcar/desmarcar. */
export function useTasks(projeto: Projeto) {
  const [atual, aplicarOtimista] = useOptimistic(projeto, aplicar);
  const [salvando, iniciar] = useTransition();
  function alternar(etapaId: string, ordem: number, feita: boolean) {
    iniciar(async () => {
      aplicarOtimista({ etapaId, ordem, feita });
      await alternarTask(projeto.id, etapaId, ordem, feita);
    });
  }
  return { projeto: atual, alternar, salvando };
}

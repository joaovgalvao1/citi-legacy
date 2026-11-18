"use client";

// Tasks marcadas/desmarcadas pelo admin, guardadas no navegador (localStorage).
// O progresso de cada etapa é recalculado a partir delas.

import { useSyncExternalStore } from "react";
import type { Projeto } from "@/data";

const CHAVE = "citi-legacy:tasks";
const EVENTO = "citi-legacy:tasks-mudou";

/** Alterações feitas pelo admin: "<projeto>/<etapa>/<índice>" → feita? */
type Marcadas = Record<string, boolean>;

function ler(): string | null {
  try {
    return window.localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

function assinar(callback: () => void) {
  window.addEventListener(EVENTO, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENTO, callback);
    window.removeEventListener("storage", callback);
  };
}

let cacheBruto: string | null = null;
let cache: Marcadas = {};
function parse(bruto: string | null): Marcadas {
  if (bruto !== cacheBruto) {
    cacheBruto = bruto;
    try {
      cache = bruto ? (JSON.parse(bruto) as Marcadas) : {};
    } catch {
      cache = {};
    }
  }
  return cache;
}

const vazio: Marcadas = {};

export function useMarcadas(): Marcadas {
  const bruto = useSyncExternalStore(assinar, ler, () => null);
  return bruto === null ? vazio : parse(bruto);
}

export function alternarTask(projetoId: string, etapaId: string, indice: number, feita: boolean) {
  const atual = { ...parse(ler()), [`${projetoId}/${etapaId}/${indice}`]: feita };
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(atual));
  } catch {
    // sem armazenamento: a marcação não persiste
  }
  window.dispatchEvent(new Event(EVENTO));
}

/** Projeto com as tasks e o progresso das etapas atualizados pelas marcações do admin. */
export function aplicarMarcadas(projeto: Projeto, marcadas: Marcadas): Projeto {
  if (marcadas === vazio || !Object.keys(marcadas).some((k) => k.startsWith(`${projeto.id}/`))) return projeto;
  return {
    ...projeto,
    etapas: projeto.etapas.map((e) => {
      const tasks = e.tasks.map((t, i) => {
        const v = marcadas[`${projeto.id}/${e.id}/${i}`];
        return v === undefined ? t : { ...t, feita: v };
      });
      return { ...e, tasks, progresso: Math.round((tasks.filter((t) => t.feita).length / tasks.length) * 100) };
    }),
  };
}

/** Atalho: o projeto já com as marcações do navegador. */
export function useProjetoComTasks(projeto: Projeto) {
  return aplicarMarcadas(projeto, useMarcadas());
}

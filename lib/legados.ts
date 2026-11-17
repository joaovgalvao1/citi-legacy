"use client";

// Guarda no localStorage quais legados foram registrados (sem banco de dados).
// Chave de cada legado: "<projetoId>/<membroId>".

import { useSyncExternalStore } from "react";

const CHAVE = "citi-legacy:legados";
const EVENTO = "citi-legacy:legados-mudou";

function ler(): string[] {
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    return bruto ? (JSON.parse(bruto) as string[]) : [];
  } catch {
    return [];
  }
}

let cacheBruto: string | null = null;
let cacheLista: string[] = [];

function snapshot(): string[] {
  let bruto: string | null = null;
  try {
    bruto = window.localStorage.getItem(CHAVE);
  } catch {
    bruto = null;
  }
  if (bruto !== cacheBruto) {
    cacheBruto = bruto;
    cacheLista = ler();
  }
  return cacheLista;
}

const vazio: string[] = [];

function assinar(callback: () => void) {
  window.addEventListener(EVENTO, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENTO, callback);
    window.removeEventListener("storage", callback);
  };
}

export function registrarLegado(projetoId: string, membroId: string) {
  const chave = `${projetoId}/${membroId}`;
  const atual = ler();
  if (!atual.includes(chave)) {
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify([...atual, chave]));
    } catch {
      // sem armazenamento disponível: o selo só não persiste
    }
  }
  window.dispatchEvent(new Event(EVENTO));
}

export function useLegados(): string[] {
  return useSyncExternalStore(assinar, snapshot, () => vazio);
}

export function temLegado(lista: string[], projetoId: string, membroId: string) {
  return lista.includes(`${projetoId}/${membroId}`);
}

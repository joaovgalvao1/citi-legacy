"use client";

// Legados, rascunhos e "de onde o usuário veio", guardados no navegador (sem banco de dados).
//
//   localStorage   citi-legacy:legados            lista de chaves "<projetoId>/<membroId>" registradas
//                  citi-legacy:legado:<chave>     o legado registrado (perguntas, respostas, data)
//                  citi-legacy:rascunho:<chave>   respostas em andamento
//   sessionStorage citi-legacy:origem             página para onde "Voltar" leva nas telas de legado

import { useSyncExternalStore } from "react";

export type Pergunta = { secao: string; texto: string; commits: string[] };
export type LegadoRegistrado = { perguntas: Pergunta[]; respostas: string[]; registradoEm: string };
export type Origem = { href: string; rotulo: string };

const LISTA = "citi-legacy:legados";
const EVENTO = "citi-legacy:legados-mudou";
const chaveDe = (projetoId: string, membroId: string) => `${projetoId}/${membroId}`;

/* ---------- acesso seguro ao armazenamento ---------- */

function ler(area: "local" | "session", chave: string): string | null {
  try {
    return (area === "local" ? window.localStorage : window.sessionStorage).getItem(chave);
  } catch {
    return null;
  }
}

function gravar(area: "local" | "session", chave: string, valor: string) {
  try {
    (area === "local" ? window.localStorage : window.sessionStorage).setItem(chave, valor);
  } catch {
    // sem armazenamento disponível: o dado só não persiste
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
const avisar = () => window.dispatchEvent(new Event(EVENTO));

/** Lê um JSON do armazenamento como estado do React, recalculando só quando o texto muda. */
function useJson<T>(area: "local" | "session", chave: string, padrao: T): T {
  const bruto = useSyncExternalStore(
    assinar,
    () => ler(area, chave),
    () => null,
  );
  return parseMemo(bruto, padrao);
}

const memo = new Map<string, unknown>();
function parseMemo<T>(bruto: string | null, padrao: T): T {
  if (bruto === null) return padrao;
  if (!memo.has(bruto)) {
    try {
      memo.set(bruto, JSON.parse(bruto));
    } catch {
      memo.set(bruto, padrao);
    }
  }
  return memo.get(bruto) as T;
}

/* ---------- legados registrados ---------- */

const vazio: string[] = [];

/** Chaves "<projetoId>/<membroId>" com legado registrado. */
export function useLegados(): string[] {
  return useJson("local", LISTA, vazio);
}

export function temLegado(lista: string[], projetoId: string, membroId: string) {
  return lista.includes(chaveDe(projetoId, membroId));
}

export function useLegado(projetoId: string, membroId: string): LegadoRegistrado | null {
  return useJson<LegadoRegistrado | null>("local", `citi-legacy:legado:${chaveDe(projetoId, membroId)}`, null);
}

export function registrarLegado(projetoId: string, membroId: string, perguntas: Pergunta[], respostas: string[]) {
  const chave = chaveDe(projetoId, membroId);
  const lista = parseMemo<string[]>(ler("local", LISTA), []);
  if (!lista.includes(chave)) gravar("local", LISTA, JSON.stringify([...lista, chave]));
  const legado: LegadoRegistrado = { perguntas, respostas, registradoEm: new Date().toISOString() };
  gravar("local", `citi-legacy:legado:${chave}`, JSON.stringify(legado));
  avisar();
}

/* ---------- rascunho das respostas ---------- */

export function lerRascunho(projetoId: string, membroId: string, n: number): string[] {
  const salvo = parseMemo<string[]>(ler("local", `citi-legacy:rascunho:${chaveDe(projetoId, membroId)}`), []);
  return Array.from({ length: n }, (_, i) => salvo[i] ?? "");
}

export function salvarRascunho(projetoId: string, membroId: string, respostas: string[]) {
  gravar("local", `citi-legacy:rascunho:${chaveDe(projetoId, membroId)}`, JSON.stringify(respostas));
}

/* ---------- origem (para o "Voltar") ---------- */

export function definirOrigem(origem: Origem) {
  gravar("session", "citi-legacy:origem", JSON.stringify(origem));
}

export function useOrigem(padrao: Origem): Origem {
  const origem = useJson<Origem | null>("session", "citi-legacy:origem", null);
  return origem ?? padrao;
}

/* ---------- utilitário ---------- */

/** true só depois que a página carregou no navegador (evita divergência com o HTML do servidor). */
export function useNoNavegador() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

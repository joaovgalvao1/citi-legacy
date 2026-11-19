"use client";

// Sessão de demonstração, guardada no localStorage (ver config/acesso.ts).

import { useSyncExternalStore } from "react";
import { ACESSO } from "@/config/acesso";

const CHAVE = "citi-legacy:sessao";
const EVENTO = "citi-legacy:sessao-mudou";

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

/**
 * Usuário logado: o nome, null (ninguém logado) ou undefined
 * (ainda não se sabe, durante a renderização no servidor).
 */
export function useUsuario(): string | null | undefined {
  return useSyncExternalStore(assinar, ler, () => undefined);
}

/** Tenta entrar; devolve true se usuário e senha conferem. */
export function entrar(usuario: string, senha: string) {
  if (usuario.trim() !== ACESSO.usuario || senha !== ACESSO.senha) return false;
  try {
    window.localStorage.setItem(CHAVE, ACESSO.usuario);
  } catch {
    // sem armazenamento: a sessão dura só até recarregar
  }
  window.dispatchEvent(new Event(EVENTO));
  return true;
}

export function sair() {
  try {
    window.localStorage.removeItem(CHAVE);
  } catch {
    // nada a fazer
  }
  window.dispatchEvent(new Event(EVENTO));
}

/**
 * Para onde ir depois do login: o "?voltar=" da URL (ex.: um link do e-mail do boletim).
 * Só aceita caminhos do próprio site ("/..."), nunca outro domínio ("//site", "https://...").
 */
export function destinoDepoisDoLogin(): string {
  const voltar = new URLSearchParams(window.location.search).get("voltar");
  return voltar && voltar.startsWith("/") && !voltar.startsWith("//") && !voltar.startsWith("/login") ? voltar : "/projetos";
}

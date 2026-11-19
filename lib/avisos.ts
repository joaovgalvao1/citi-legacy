// Avisos rápidos no canto da tela ("Task concluída · Desfazer"). Uma lista global no navegador,
// lida pelo componente <Avisos /> (components/ui/avisos.tsx). Cada aviso some sozinho depois de alguns segundos.

import { useSyncExternalStore } from "react";

export type Aviso = {
  id: number;
  texto: string;
  /** Linha menor abaixo do texto (ex.: "Inscrições: 80% → 100%"). */
  detalhe?: string;
  tom?: "verde" | "ambar" | "vermelho";
  /** Botão do aviso (ex.: Desfazer). Clicar fecha o aviso. */
  acao?: { rotulo: string; executar: () => void };
};

const DURACAO = 6000;
let lista: Aviso[] = [];
let proximo = 1;
const ouvintes = new Set<() => void>();
const avisar_ = () => ouvintes.forEach((f) => f());

export function fecharAviso(id: number) {
  lista = lista.filter((a) => a.id !== id);
  avisar_();
}

/** Mostra um aviso por 6 segundos (no máximo 4 na tela; os mais antigos saem primeiro). */
export function avisar(aviso: Omit<Aviso, "id">) {
  const id = proximo++;
  lista = [...lista.slice(-3), { ...aviso, id }];
  avisar_();
  window.setTimeout(() => fecharAviso(id), DURACAO);
  return id;
}

const vazia: Aviso[] = [];

export function useAvisos() {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    () => lista,
    () => vazia,
  );
}

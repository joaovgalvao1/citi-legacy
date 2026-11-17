"use client";

// Membro em destaque numa página: clicar num membro (barra, legenda ou linha da matriz)
// destaca a contribuição dele em todos os gráficos da página; clicar de novo desfaz.

import { createContext, useContext, useState, type ReactNode } from "react";

type Destaque = { membroId: string | null; alternar: (id: string) => void };

const Contexto = createContext<Destaque>({ membroId: null, alternar: () => {} });

export function DestaqueProvider({ children }: { children: ReactNode }) {
  const [membroId, setMembroId] = useState<string | null>(null);
  const alternar = (id: string) => setMembroId((atual) => (atual === id ? null : id));
  return <Contexto.Provider value={{ membroId, alternar }}>{children}</Contexto.Provider>;
}

export function useDestaque() {
  return useContext(Contexto);
}

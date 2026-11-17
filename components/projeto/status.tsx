// Selos de status de projeto e de etapa.

import type { Projeto } from "@/data";
import { diasParada, statusEtapa, statusProjeto } from "@/lib/status";
import { Selo } from "@/components/ui";

export function SeloStatusProjeto({ projeto }: { projeto: Projeto }) {
  const s = statusProjeto(projeto);
  return <Selo forte={s === "Atrasado"}>{s}</Selo>;
}

export function SeloStatusEtapa({ projeto, etapaId }: { projeto: Projeto; etapaId: string }) {
  const etapa = projeto.etapas.find((e) => e.id === etapaId)!;
  const s = statusEtapa(projeto, etapa);
  const parada = diasParada(projeto, etapa) !== null;
  return (
    <span className="inline-flex flex-wrap gap-1">
      <Selo forte={s === "Atrasada"}>{s}</Selo>
      {parada && <Selo forte>Parada</Selo>}
    </span>
  );
}

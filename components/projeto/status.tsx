// Selos de status de projeto e de etapa, nas cores do semáforo (lib/status.ts).

import type { Projeto } from "@/data";
import { diasParada, nivelProjeto, rotuloNivelProjeto, statusEtapa } from "@/lib/status";
import { Selo } from "@/components/ui";

export function SeloStatusProjeto({ projeto }: { projeto: Projeto }) {
  return <Selo tom={nivelProjeto(projeto)}>{rotuloNivelProjeto(projeto)}</Selo>;
}

export function SeloStatusEtapa({ projeto, etapaId }: { projeto: Projeto; etapaId: string }) {
  const etapa = projeto.etapas.find((e) => e.id === etapaId)!;
  const s = statusEtapa(projeto, etapa);
  const parada = diasParada(projeto, etapa) !== null;
  return (
    <span className="inline-flex flex-wrap gap-1">
      <Selo tom={s === "Atrasada" ? "vermelho" : s === "Concluída" ? "verde" : "neutro"}>{s}</Selo>
      {parada && <Selo forte>Parada</Selo>}
    </span>
  );
}

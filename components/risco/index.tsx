// Selos de status, risco e urgência, e a lista de alertas de um projeto.

import type { Membro, Projeto } from "@/data";
import { avaliarEtapa, nivelUrgencia, type Nivel, type NivelUrgencia } from "@/lib/indice";
import { alertas, diasParada, statusEtapa, statusProjeto } from "@/lib/status";
import { Alerta, Selo } from "@/components/ui";
import { formatarMesAno } from "@/data/formatos";

export function SeloRisco({ nivel }: { nivel: Nivel }) {
  return <Selo forte={nivel === "Alto"}>Risco {nivel.toLowerCase()}</Selo>;
}

export function SeloUrgencia({ nivel }: { nivel: NivelUrgencia }) {
  return <Selo forte={nivel === "Alta"}>Urgência {nivel.toLowerCase()}</Selo>;
}

export function SeloStatusProjeto({ projeto }: { projeto: Projeto }) {
  const s = statusProjeto(projeto);
  return <Selo forte={s === "Atrasado"}>{s}</Selo>;
}

export function SeloStatusEtapa({ projeto, etapaId }: { projeto: Projeto; etapaId: string }) {
  const etapa = projeto.etapas.find((e) => e.id === etapaId)!;
  const s = statusEtapa(projeto, etapa);
  const parada = diasParada(projeto, etapa);
  return (
    <span className="inline-flex flex-wrap gap-1">
      <Selo forte={s === "Atrasada"}>{s}</Selo>
      {parada !== null && <Selo forte>Parada há {parada} dias</Selo>}
    </span>
  );
}

/** Risco e urgência de uma etapa (em projetos concluídos, só o risco). */
export function RiscoDaEtapa({ projeto, etapaId }: { projeto: Projeto; etapaId: string }) {
  const a = avaliarEtapa(projeto, etapaId);
  return (
    <span className="inline-flex flex-wrap gap-1">
      <SeloRisco nivel={a.risco} />
      {projeto.status !== "concluido" && <SeloUrgencia nivel={a.urgencia} />}
    </span>
  );
}

/** Situação da pessoa na empresa: saída prevista (com urgência) ou já saiu. */
export function SituacaoDaPessoa({ membro, comUrgencia = true }: { membro: Membro; comUrgencia?: boolean }) {
  if (membro.saiuEm) return <Selo>Saiu em {formatarMesAno(membro.saiuEm.slice(0, 7))}</Selo>;
  if (!membro.saidaPrevista) return null;
  return (
    <>
      <Selo>Sai {membro.saidaPrevista}</Selo>
      {comUrgencia && <SeloUrgencia nivel={nivelUrgencia(membro)} />}
    </>
  );
}

/** Alertas do projeto (do mais grave para o menos grave). */
export function AlertasDoProjeto({ projeto, limite }: { projeto: Projeto; limite?: number }) {
  const lista = alertas(projeto);
  const visiveis = lista.slice(0, limite);
  if (!lista.length) {
    return (
      <div className="text-sm text-gray-500">
        {projeto.status === "concluido" ? "Todos que mais sabem de cada etapa ainda estão na empresa" : "Sem alertas"}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {visiveis.map((a) =>
        a.tipo === "conhecimento-saiu" ? (
          <div key={`${a.tipo}-${a.etapaId}`} className="text-sm text-gray-600">
            ℹ {a.texto}
          </div>
        ) : (
          <Alerta key={`${a.tipo}-${a.etapaId}`}>
            {a.texto}
            {a.tipo === "saida" && ` · risco ${a.risco!.toLowerCase()}, urgência ${a.urgencia!.toLowerCase()}`}
          </Alerta>
        ),
      )}
      {limite !== undefined && lista.length > limite && (
        <div className="text-xs text-gray-500">
          + {lista.length - limite} {lista.length - limite === 1 ? "alerta" : "alertas"}
        </div>
      )}
    </div>
  );
}

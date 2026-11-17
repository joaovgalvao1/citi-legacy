"use client";

// Selos e alertas de risco e urgência. Dependem dos legados registrados (localStorage),
// por isso rodam no navegador: registrar o legado mitiga o risco na hora.

import type { Membro, Projeto } from "@/data";
import { useLegados } from "@/lib/legados";
import {
  alertasAbertos,
  alertasMitigados,
  avaliarEtapa,
  nivelUrgencia,
  textoAlerta,
  type Nivel,
  type NivelUrgencia,
} from "@/lib/indice";
import { Alerta, Selo } from "@/components/wireframe";

export function SeloRisco({ nivel }: { nivel: Nivel }) {
  return <Selo forte={nivel === "Alto"}>Risco {nivel.toLowerCase()}</Selo>;
}

export function SeloUrgencia({ nivel }: { nivel: NivelUrgencia }) {
  return <Selo forte={nivel === "Alta"}>Urgência {nivel.toLowerCase()}</Selo>;
}

function SeloMitigado() {
  return <Selo forte>✓ Mitigado pelo legado</Selo>;
}

/** Risco e urgência de uma etapa (ou "mitigado", se o legado de quem mais sabe já foi registrado). */
export function RiscoDaEtapa({ projeto, etapaId }: { projeto: Projeto; etapaId: string }) {
  const legados = useLegados();
  const a = avaliarEtapa(projeto, etapaId, legados);
  if (a.mitigado) return <SeloMitigado />;
  return (
    <span className="inline-flex flex-wrap gap-1">
      <SeloRisco nivel={a.risco} />
      <SeloUrgencia nivel={a.urgencia} />
    </span>
  );
}

/** Situação do projeto: a etapa mais grave entre as que têm alerta aberto. */
export function RiscoDoProjeto({ projeto }: { projeto: Projeto }) {
  const legados = useLegados();
  const [pior] = alertasAbertos(projeto, legados);
  if (pior) {
    return (
      <span className="inline-flex flex-wrap gap-1">
        <SeloRisco nivel={pior.risco} />
        <SeloUrgencia nivel={pior.urgencia} />
      </span>
    );
  }
  if (alertasMitigados(projeto, legados).length) return <SeloMitigado />;
  return <Selo>Sem saídas próximas</Selo>;
}

/** Urgência de um membro, a partir da data de saída (sem data = baixa). */
export function UrgenciaDoMembro({ membro }: { membro: Membro }) {
  if (!membro.saidaPrevista) return null;
  return (
    <>
      <Selo>Sai {membro.saidaPrevista}</Selo>
      <SeloUrgencia nivel={nivelUrgencia(membro)} />
    </>
  );
}

/** Alertas do projeto: abertos em destaque, os já resolvidos pelo legado em seguida. */
export function AlertasDoProjeto({ projeto, limite }: { projeto: Projeto; limite?: number }) {
  const legados = useLegados();
  const abertos = alertasAbertos(projeto, legados).slice(0, limite);
  const mitigados = alertasMitigados(projeto, legados);
  if (!abertos.length && !mitigados.length) return <div className="text-sm text-gray-500">Sem saídas próximas</div>;
  return (
    <div className="space-y-2">
      {abertos.map((a) => (
        <Alerta key={a.etapaId}>
          {textoAlerta(a)} · risco {a.risco.toLowerCase()}, urgência {a.urgencia.toLowerCase()}
        </Alerta>
      ))}
      {mitigados.map((a) => (
        <div key={a.etapaId} className="text-sm text-gray-600">
          ✓ {textoAlerta(a)} · legado registrado
        </div>
      ))}
    </div>
  );
}

/** Quantos projetos ainda têm alerta aberto (para o subtítulo da lista). */
export function ContagemEmRisco({ projetos }: { projetos: Projeto[] }) {
  const legados = useLegados();
  const n = projetos.filter((p) => alertasAbertos(p, legados).length > 0).length;
  return <>{n === 1 ? "1 com saída próxima de quem detém conhecimento" : `${n} com saída próxima de quem detém conhecimento`}</>;
}

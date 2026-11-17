"use client";

// Ações ligadas ao legado de um membro: selo, botão "Registrar/Ver legado" e "Voltar".

import Link from "next/link";
import { useRouter } from "next/navigation";
import { definirOrigem, temLegado, useLegados, useOrigem, type Origem } from "@/lib/legados";
import { Botao, Selo } from "@/components/ui";

/** Selo "Legado registrado" que só aparece se o legado do membro existir. */
export function SeloLegado({ projetoId, membroId }: { projetoId: string; membroId: string }) {
  const legados = useLegados();
  if (!temLegado(legados, projetoId, membroId)) return null;
  return <Selo forte>✓ Legado registrado</Selo>;
}

/**
 * Botão do membro: "Registrar legado" ou "Ver legado", conforme o estado.
 * Guarda de onde o usuário saiu, para o "Voltar" das telas de legado levar de volta para lá.
 */
export function AcaoLegado({ projetoId, membroId, origem }: { projetoId: string; membroId: string; origem: Origem }) {
  const legados = useLegados();
  const router = useRouter();
  const base = `/projetos/${projetoId}/membros/${membroId}/legado`;
  const registrado = temLegado(legados, projetoId, membroId);
  return (
    <Botao
      variante={registrado ? "secundario" : "primario"}
      onClick={() => {
        definirOrigem(origem);
        router.push(registrado ? `${base}/documento` : base);
      }}
    >
      {registrado ? "Ver legado" : "Registrar legado"}
    </Botao>
  );
}

/** "← Voltar" para a página de onde o usuário veio (painel ou etapa); sem origem, vai ao painel. */
export function VoltarOrigem({ padrao }: { padrao: Origem }) {
  const origem = useOrigem(padrao);
  return (
    <Link href={origem.href} className="text-sm text-gray-600 underline hover:text-gray-900">
      ← {origem.rotulo}
    </Link>
  );
}

/** Botão em pílula que leva à origem (usado no fim do documento). */
export function BotaoVoltarOrigem({ padrao, texto }: { padrao: Origem; texto?: string }) {
  const origem = useOrigem(padrao);
  return (
    <Link
      href={origem.href}
      className="inline-block rounded-full border border-gray-800 bg-gray-800 px-4 py-1.5 text-sm text-white hover:bg-gray-700"
    >
      {texto ?? `Voltar para ${origem.rotulo}`}
    </Link>
  );
}

"use client";

// Aba "Participação": atividade (commits por semana) e conhecimento (IC) na mesma página,
// com um único seletor "Projeto todo / Etapa". Clicar num membro destaca-o nos dois gráficos.

import type { Projeto } from "@/data";
import { ranking } from "@/lib/indice";
import { Caixa } from "@/components/ui";
import { DestaqueProvider } from "@/components/graficos/destaque";
import { LinhaDoTempo } from "@/components/graficos/linha-do-tempo";
import { BarrasIC } from "@/components/graficos/barras-ic";
import { CalculoIC } from "@/components/graficos/calculo-ic";
import { seriesDosMembros } from "@/components/graficos/cores";
import { SeletorEtapa, useEtapaSelecionada } from "./seletor-etapa";

export function AbaParticipacao({ projeto }: { projeto: Projeto }) {
  const etapa = useEtapaSelecionada(projeto);
  const linhas = ranking(projeto, etapa?.id);
  const onde = etapa ? etapa.nome : "todo o projeto";

  return (
    <DestaqueProvider>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SeletorEtapa projeto={projeto} />
          <p className="text-xs text-gray-500">Clique num membro para destacá-lo nos dois gráficos.</p>
        </div>
        {etapa && (
          <p className="text-xs text-gray-600">
            Contam nesta etapa os commits que alteram:{" "}
            {etapa.caminhos.map((c, i) => (
              <span key={c}>
                {i > 0 && ", "}
                <code className="bg-gray-100 px-1">{c}</code>
              </span>
            ))}
          </p>
        )}

        <Caixa titulo="Conhecimento · Índice de Conhecimento">
          {linhas.length ? (
            <>
              <BarrasIC projeto={projeto} linhas={linhas} rotulo={onde} />
              <p className="mt-3 text-xs text-gray-500">
                Quanto do conhecimento de {onde} está com cada pessoa, calculado a partir dos commits. Os valores somam
                100%.
              </p>
              <details className="mt-4 border-t border-gray-300 pt-3">
                <summary className="cursor-pointer text-sm font-semibold">Como o IC foi calculado</summary>
                <div className="mt-3">
                  <CalculoIC linhas={linhas} pesos={projeto.pesos} onde={onde} />
                </div>
              </details>
            </>
          ) : (
            <p className="text-sm text-gray-500">{etapa ? "Esta etapa" : "Este projeto"} ainda não tem commits.</p>
          )}
        </Caixa>

        <Caixa titulo="Atividade · commits por semana">
          <LinhaDoTempo
            series={seriesDosMembros(projeto)}
            semanas={etapa ? etapa.semanas : projeto.semanas}
            titulo={`Commits por semana em ${onde}`}
          />
          <p className="mt-3 text-xs text-gray-500">Cada cor é um membro. Passe o mouse numa semana para ver o detalhe.</p>
        </Caixa>
      </div>
    </DestaqueProvider>
  );
}

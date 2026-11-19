"use client";

// Conteúdo da aba "Visão geral". Roda no navegador porque o admin marca/desmarca tasks (gravadas no banco),
// e o progresso, o status das etapas e os alertas mudam na hora.

import { useState } from "react";
import Link from "next/link";
import type { Projeto } from "@/data";
import { formatarData } from "@/data/formatos";
import { emPct, lider } from "@/lib/indice";
import { alertas, nivelEtapa, statusEtapa, textoPrazoEtapa } from "@/lib/status";
import { useTasks } from "@/lib/tasks";
import { Alerta, Caixa } from "@/components/ui";
import type { ReactNode } from "react";
import { BarraProgresso } from "@/components/ui/progresso";
import { SeloStatusEtapa } from "./status";
import { Gantt } from "./gantt";
import { Dialogo } from "@/components/ui/dialogo";
import { avisar } from "@/lib/avisos";

type Pedido = { tipo: "concluir" | "reabrir"; etapaId: string; ordem: number; feita: boolean };

export function VisaoGeral({ projeto: original, resumo }: { projeto: Projeto; resumo: ReactNode }) {
  const { projeto, alternar } = useTasks(original);
  const concluido = projeto.status === "concluido";
  const lista = alertas(projeto);
  const [pedido, setPedido] = useState<Pedido | null>(null);

  /** Marca/desmarca e mostra o aviso com o efeito na etapa e o botão Desfazer. */
  function executar(etapaId: string, ordem: number, feita: boolean, efeitoNoProjeto?: string) {
    const etapa = projeto.etapas.find((e) => e.id === etapaId)!;
    const task = etapa.tasks[ordem];
    const feitasDepois = etapa.tasks.filter((t, i) => (i === ordem ? feita : t.feita)).length;
    const depois = Math.round((feitasDepois / etapa.tasks.length) * 100);
    alternar(etapaId, ordem, feita);
    avisar({
      texto: `${feita ? "Task concluída" : "Task reaberta"}: ${task.titulo}`,
      detalhe: efeitoNoProjeto ?? `${etapa.nome}: ${emPct(etapa.progresso)} → ${emPct(depois)}`,
      tom: feita ? "verde" : "ambar",
      acao: { rotulo: "Desfazer", executar: () => alternar(etapaId, ordem, !feita) },
    });
  }

  /** Marcar a última task conclui o projeto; desmarcar num projeto concluído o reabre: os dois pedem confirmação. */
  function pedirAlternar(etapaId: string, ordem: number, feita: boolean) {
    const todas = projeto.etapas.flatMap((e) => e.tasks);
    const feitas = todas.filter((t) => t.feita).length;
    if (feita && !concluido && feitas + 1 === todas.length) setPedido({ tipo: "concluir", etapaId, ordem, feita });
    else if (!feita && concluido && projeto.concluidoPelasTasks) setPedido({ tipo: "reabrir", etapaId, ordem, feita });
    else executar(etapaId, ordem, feita);
  }

  /** Clique numa etapa do Gantt: abre as tasks dela na lista abaixo e rola até lá. */
  function abrirEtapa(etapaId: string) {
    const item = document.getElementById(`etapa-${etapaId}`);
    if (!item) return;
    item.querySelector("details")?.setAttribute("open", "");
    item.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-6">
      <Gantt projeto={projeto} aoSelecionar={abrirEtapa} />

      {concluido ? (
        projeto.resultados && (
          <Caixa titulo="Resultados">
            <p className="text-sm text-gray-700">{projeto.resultados}</p>
          </Caixa>
        )
      ) : (
        <Caixa titulo="Precisa de atenção">
          {lista.length ? (
            <div className="space-y-2">
              {lista.map((a) => (
                <Alerta key={a.etapaId} tom={a.nivel}>
                  {a.texto}
                </Alerta>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">Tudo em dia: nenhuma etapa atrasada ou parada.</p>
          )}
        </Caixa>
      )}

      {resumo}

      <Caixa titulo={`Etapas · ${projeto.etapas.length}`}>
        <ul className="divide-y divide-gray-300">
          {projeto.etapas.map((e) => {
            const top = lider(projeto, e.id);
            const emPlanejamento = statusEtapa(projeto, e) === "Em planejamento";
            const feitas = e.tasks.filter((t) => t.feita).length;
            const prazo = textoPrazoEtapa(projeto, e);
            return (
              <li key={e.id} id={`etapa-${e.id}`} className="scroll-mt-24 space-y-2 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{e.nome}</span>
                  <SeloStatusEtapa projeto={projeto} etapaId={e.id} />
                </div>
                <p className="text-sm text-gray-700">{e.descricao}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <div className="w-full max-w-xs flex-1">
                    <BarraProgresso valor={e.progresso} compacta tom={nivelEtapa(projeto, e)} />
                  </div>
                  <span className="text-sm tabular-nums">{emPct(e.progresso)}</span>
                  <span className="text-sm text-gray-600">
                    {feitas} de {e.tasks.length} tasks · {prazo && `${prazo} · `}
                    {emPlanejamento
                      ? `previsto de ${formatarData(e.inicioPrevisto)} a ${formatarData(e.fimPrevisto)}`
                      : `prazo ${formatarData(e.fimPrevisto)}`}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                  <span>
                    {top ? (
                      <>
                        Quem mais sabe: <span className="text-gray-800">{top.membro.nome}</span> · {emPct(top.ic)}
                      </>
                    ) : (
                      "Ainda sem commits"
                    )}
                  </span>
                  {top && (
                    <Link href={`/projetos/${projeto.id}/participacao?etapa=${e.id}`} className="text-verde hover:underline">
                      Ver participação →
                    </Link>
                  )}
                </div>
                <details className="text-sm">
                  <summary className="cursor-pointer text-gray-700">
                    Tasks ({feitas}/{e.tasks.length}) e arquivos do repositório
                  </summary>
                  <div className="mt-2 grid gap-4 sm:grid-cols-[2fr_1fr]">
                    <ul className="space-y-1">
                      {e.tasks.map((t, i) => (
                        <li key={i}>
                          <label className="flex cursor-pointer items-start gap-2">
                            <input
                              type="checkbox"
                              checked={t.feita}
                              disabled={concluido && !projeto.concluidoPelasTasks}
                              onChange={(ev) => pedirAlternar(e.id, i, ev.target.checked)}
                              className="mt-0.5 accent-[#00db58]"
                            />
                            <span className={t.feita ? "text-gray-500 line-through" : ""}>{t.titulo}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                    <div>
                      <p className="mb-1 text-xs text-gray-500">Commits que alteram estes caminhos contam nesta etapa:</p>
                      <ul className="space-y-0.5">
                        {e.caminhos.map((c) => (
                          <li key={c} className="font-mono text-xs">
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </Caixa>

      <Dialogo
        aberto={!!pedido}
        titulo={pedido?.tipo === "concluir" ? "Concluir o projeto?" : "Reabrir o projeto?"}
        rotuloConfirmar={pedido?.tipo === "concluir" ? "Concluir projeto" : "Reabrir projeto"}
        perigo={pedido?.tipo === "reabrir"}
        aoFechar={() => setPedido(null)}
        aoConfirmar={() => {
          if (!pedido) return;
          executar(
            pedido.etapaId,
            pedido.ordem,
            pedido.feita,
            pedido.tipo === "concluir" ? `${projeto.nome} foi concluído hoje` : `${projeto.nome} voltou para em andamento`,
          );
          setPedido(null);
        }}
      >
        {pedido?.tipo === "concluir" ? (
          <p>
            Esta é a última task de <b className="text-branco">{projeto.nome}</b>. Marcá-la conclui o projeto com entrega hoje, e o resumo final da
            IA é gerado na próxima sexta-feira.
          </p>
        ) : (
          <p>
            <b className="text-branco">{projeto.nome}</b> foi concluído pelas tasks. Desmarcar esta task reabre o projeto e descarta o resumo
            final, que será gerado de novo quando ele for concluído.
          </p>
        )}
      </Dialogo>
    </div>
  );
}

// Aba "Visão geral": o que precisa de atenção, resumo e andamento das etapas

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjeto, projetos } from "@/data";
import { formatarData } from "@/data/formatos";
import { emPct, lider } from "@/lib/indice";
import { alertas, statusEtapa, textoPrazoEtapa } from "@/lib/status";
import { Alerta, Caixa, Placeholder } from "@/components/ui";
import { BarraProgresso } from "@/components/ui/progresso";
import { SeloStatusEtapa } from "@/components/projeto/status";

export function generateStaticParams() {
  return projetos.map((p) => ({ projetoId: p.id }));
}

async function VisaoGeral({ params }: { params: PageProps<"/projetos/[projetoId]">["params"] }) {
  const { projetoId } = await params;
  const projeto = getProjeto(projetoId);
  if (!projeto) notFound();
  const concluido = projeto.status === "concluido";
  const lista = alertas(projeto);

  return (
    <div className="space-y-6">
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
                <Alerta key={a.etapaId}>{a.texto}</Alerta>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">Tudo em dia: nenhuma etapa atrasada ou parada.</p>
          )}
        </Caixa>
      )}

      <Caixa titulo={concluido ? "Retrospectiva · gerada por IA" : "Resumo da semana · gerado por IA"}>
        <Placeholder
          texto={
            concluido
              ? "etapa 3: a IA lê os commits e escreve a retrospectiva do projeto"
              : "etapa 3: a IA lê os commits e escreve o que andou, o que travou e o que fazer primeiro"
          }
          altura="h-20"
        />
      </Caixa>

      <Caixa titulo={`Etapas · ${projeto.etapas.length}`}>
        <ul className="divide-y divide-gray-300">
          {projeto.etapas.map((e) => {
            const top = lider(projeto, e.id);
            const emPlanejamento = statusEtapa(projeto, e) === "Em planejamento";
            const conteudo = (
              <div className="space-y-2 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{e.nome}</span>
                  <SeloStatusEtapa projeto={projeto} etapaId={e.id} />
                </div>
                <p className="text-sm text-gray-700">{e.descricao}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <div className="w-full max-w-xs flex-1">
                    <BarraProgresso valor={e.progresso} compacta />
                  </div>
                  <span className="text-sm tabular-nums">{emPct(e.progresso)}</span>
                  <span className="text-sm text-gray-600">
                    {textoPrazoEtapa(projeto, e) && `${textoPrazoEtapa(projeto, e)} · `}
                    {emPlanejamento
                      ? `previsto de ${formatarData(e.inicioPrevisto)} a ${formatarData(e.fimPrevisto)}`
                      : `prazo ${formatarData(e.fimPrevisto)}`}
                  </span>
                </div>
                {top && (
                  <p className="text-xs text-gray-500">
                    Quem mais sabe: <span className="text-gray-800">{top.membro.nome}</span> · {emPct(top.ic)}
                  </p>
                )}
              </div>
            );
            return (
              <li key={e.id}>
                {top ? (
                  <Link href={`/projetos/${projeto.id}/participacao?etapa=${e.id}`} className="block hover:bg-gray-50">
                    {conteudo}
                  </Link>
                ) : (
                  conteudo
                )}
              </li>
            );
          })}
        </ul>
      </Caixa>
    </div>
  );
}

export default function PaginaVisaoGeral(props: PageProps<"/projetos/[projetoId]">) {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Carregando…</p>}>
      <VisaoGeral params={props.params} />
    </Suspense>
  );
}

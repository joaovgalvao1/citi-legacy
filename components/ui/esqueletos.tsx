// Skeletons no formato de cada tela (no lugar de "Carregando…").

import { CaixaEsqueleto, Carregando, Esqueleto } from "./index";

/** Cabeçalho do projeto: voltar, nome e selo, cliente, barra de progresso e abas. */
export function EsqueletoCabecalhoProjeto() {
  return (
    <Carregando>
      <div className="space-y-3">
        <Esqueleto className="h-3.5 w-20" />
        <div className="flex items-center gap-3">
          <Esqueleto className="h-7 w-72 max-w-full" />
          <Esqueleto className="h-6 w-24 rounded-full" />
        </div>
        <Esqueleto className="h-3.5 w-52" />
        <Esqueleto className="h-1.5 w-full rounded-full" />
        <div className="flex gap-4 pt-2">
          <Esqueleto className="h-5 w-24" />
          <Esqueleto className="h-5 w-16" />
          <Esqueleto className="h-5 w-24" />
        </div>
      </div>
    </Carregando>
  );
}

/** Visão geral: atenção, resumo da IA e etapas. */
export function EsqueletoVisaoGeral() {
  return (
    <Carregando>
      <CaixaEsqueleto linhas={2} />
      <CaixaEsqueleto altura="h-36" />
      <CaixaEsqueleto linhas={4} />
    </Carregando>
  );
}

/** Participação: seletor e os dois gráficos. */
export function EsqueletoParticipacao() {
  return (
    <Carregando>
      <Esqueleto className="h-9 w-56 rounded-full" />
      <CaixaEsqueleto altura="h-32" />
      <CaixaEsqueleto altura="h-56" />
    </Carregando>
  );
}

/** Aba Sobre: descrição, equipe e resultados. */
export function EsqueletoSobre() {
  return (
    <Carregando>
      <CaixaEsqueleto linhas={3} />
      <CaixaEsqueleto linhas={4} />
    </Carregando>
  );
}

/** Perfil do membro: cabeçalho e cards de projeto. */
export function EsqueletoMembro() {
  return (
    <Carregando>
      <div className="space-y-3">
        <Esqueleto className="h-3.5 w-20" />
        <Esqueleto className="h-7 w-60" />
        <Esqueleto className="h-3.5 w-40" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <CaixaEsqueleto linhas={3} />
        <CaixaEsqueleto linhas={3} />
      </div>
    </Carregando>
  );
}

/** Folha A4 de exportação. */
export function EsqueletoFolha() {
  return (
    <Carregando>
      <div className="mx-auto w-full max-w-[210mm] space-y-4 rounded-sm bg-[#1a1a1a] p-[14mm]">
        <Esqueleto className="h-7 w-48" />
        <Esqueleto className="h-8 w-80 max-w-full" />
        <div className="grid grid-cols-4 gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <Esqueleto key={i} className="h-14" />
          ))}
        </div>
        <Esqueleto className="h-48 w-full" />
        <Esqueleto className="h-32 w-full" />
      </div>
    </Carregando>
  );
}

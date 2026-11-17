"use client";

// Documento do legado, montado a partir das respostas registradas.
// Na etapa 3, a IA reescreve as respostas em texto corrido; aqui elas aparecem como foram escritas.

import { useState } from "react";
import Link from "next/link";
import { useLegado, useNoNavegador, type LegadoRegistrado } from "@/lib/legados";
import { Botao } from "@/components/ui";

export type CabecalhoLegado = {
  membroNome: string;
  projetoNome: string;
  subtitulo: string; // papel · etapas principais
  contexto: string;
};

type Props = { projetoId: string; membroId: string; cabecalho: CabecalhoLegado; acoesExtras?: React.ReactNode };

const SEM_RESPOSTA = "Sem resposta registrada.";

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

/** Agrupa perguntas e respostas por seção, na ordem em que as seções aparecem. */
function secoes(legado: LegadoRegistrado) {
  const grupos: { titulo: string; itens: { pergunta: string; resposta: string; commits: string[] }[] }[] = [];
  legado.perguntas.forEach((p, i) => {
    let grupo = grupos.find((g) => g.titulo === p.secao);
    if (!grupo) {
      grupo = { titulo: p.secao, itens: [] };
      grupos.push(grupo);
    }
    grupo.itens.push({ pergunta: p.texto, resposta: legado.respostas[i] || SEM_RESPOSTA, commits: p.commits });
  });
  return grupos;
}

export function paraMarkdown(cabecalho: CabecalhoLegado, legado: LegadoRegistrado) {
  const linhas = [
    `# Legado de ${cabecalho.membroNome} · ${cabecalho.projetoNome}`,
    "",
    `${cabecalho.subtitulo} · registrado em ${formatarData(legado.registradoEm)}`,
    "",
    "## Contexto",
    "",
    cabecalho.contexto,
  ];
  for (const s of secoes(legado)) {
    linhas.push("", `## ${s.titulo}`);
    for (const item of s.itens) {
      linhas.push("", `**${item.pergunta}**`, "", item.resposta);
    }
  }
  return linhas.join("\n") + "\n";
}

export function DocumentoLegado(props: Props) {
  const noNavegador = useNoNavegador();
  if (!noNavegador) return <p className="text-sm text-gray-500">Carregando legado…</p>;
  return <Documento {...props} />;
}

function Documento({ projetoId, membroId, cabecalho, acoesExtras }: Props) {
  const legado = useLegado(projetoId, membroId);
  const [copiado, setCopiado] = useState(false);

  if (!legado) {
    return (
      <div className="mx-auto max-w-2xl space-y-3 border border-dashed border-gray-400 bg-white p-8 text-center">
        <p className="font-semibold">O legado de {cabecalho.membroNome} ainda não foi registrado.</p>
        <Link
          href={`/projetos/${projetoId}/membros/${membroId}/legado`}
          className="inline-block rounded-full border border-gray-800 bg-gray-800 px-4 py-1.5 text-sm text-white"
        >
          Registrar legado
        </Link>
      </div>
    );
  }

  const markdown = paraMarkdown(cabecalho, legado);
  const nomeArquivo = `legado-${membroId}.md`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  function baixar() {
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = nomeArquivo;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <Botao variante="secundario" onClick={copiar}>
          {copiado ? "Copiado" : "Copiar"}
        </Botao>
        <Botao variante="secundario" onClick={baixar}>
          Baixar .md
        </Botao>
        <Link
          href={`/projetos/${projetoId}/membros/${membroId}/legado`}
          className="inline-block rounded-full border border-gray-500 bg-white px-4 py-1.5 text-sm text-gray-800 hover:bg-gray-100"
        >
          Editar respostas
        </Link>
        {acoesExtras}
      </div>

      <article className="mx-auto max-w-2xl border border-gray-400 bg-white px-6 py-8 shadow-sm sm:px-10">
        <header className="mb-6 border-b border-gray-300 pb-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Legado</p>
          <h1 className="text-2xl font-bold">
            Legado de {cabecalho.membroNome} · {cabecalho.projetoNome}
          </h1>
          <p className="text-sm text-gray-600">
            {cabecalho.subtitulo} · registrado em {formatarData(legado.registradoEm)}
          </p>
        </header>
        <div className="space-y-6">
          <section>
            <h2 className="mb-1 font-semibold">Contexto</h2>
            <p className="text-sm leading-relaxed text-gray-700">{cabecalho.contexto}</p>
          </section>
          {secoes(legado).map((s) => (
            <section key={s.titulo} className="space-y-3">
              <h2 className="font-semibold">{s.titulo}</h2>
              {s.itens.map((item) => (
                <div key={item.pergunta}>
                  <p className="text-xs text-gray-500">
                    {item.pergunta}
                    {item.commits.length > 0 && <span className="font-mono"> · {item.commits.join(", ")}</span>}
                  </p>
                  <p
                    className={`text-sm leading-relaxed ${item.resposta === SEM_RESPOSTA ? "italic text-gray-400" : "text-gray-800"}`}
                  >
                    {item.resposta}
                  </p>
                </div>
              ))}
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}

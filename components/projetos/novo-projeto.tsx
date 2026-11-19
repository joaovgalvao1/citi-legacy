"use client";

// Formulário de projeto: dados, equipe e etapas (com caminhos do repositório e tasks).
// Serve para cadastrar (sem `inicial`) e para editar (com `inicial`, já preenchido).

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { criarProjeto, editarProjeto } from "@/app/acoes";
import { avisar } from "@/lib/avisos";
import { caminhoSugerido, linhas, validarProjeto, type EtapaNova, type ProjetoNovo } from "@/lib/novo-projeto";
import { Botao, Caixa } from "@/components/ui";
import { IconeGithub } from "@/components/ui/icones";

type Cliente = { id: string; nome: string; segmento: string | null };
type Pessoa = { id: string; nome: string };
type EtapaForm = EtapaNova & { caminhoEditado: boolean };

const campo =
  "w-full rounded-xl border border-gray-400 bg-fundo px-3 py-2 [color-scheme:dark] text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-500 focus:border-verde";
const rotulo = "mb-1 block text-xs font-medium text-gray-600";

function Campo({ titulo, dica, children }: { titulo: string; dica?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={rotulo}>{titulo}</span>
      {children}
      {dica && <span className="mt-1 block text-[11px] text-gray-500">{dica}</span>}
    </label>
  );
}

/** Dados de um projeto existente para preencher o formulário de edição. */
export type ProjetoInicial = {
  projetoId: string;
  projeto: Omit<ProjetoNovo, "membros" | "etapas">;
  membros: Record<string, string>;
  etapas: EtapaNova[];
};

export function FormularioNovoProjeto({
  clientes,
  pessoas,
  hoje,
  inicial,
}: {
  clientes: Cliente[];
  pessoas: Pessoa[];
  hoje: string;
  inicial?: ProjetoInicial;
}) {
  const router = useRouter();
  const [salvando, iniciar] = useTransition();
  const [tentou, setTentou] = useState(false);
  const [errosServidor, setErrosServidor] = useState<string[]>([]);

  const [p, setP] = useState<Omit<ProjetoNovo, "membros" | "etapas">>(
    () =>
      inicial?.projeto ?? {
        nome: "",
        clienteId: clientes[0]?.id ?? "",
        clienteNovo: "",
        segmentoNovo: "",
        descricao: "",
        contexto: "",
        inicio: hoje,
        fimPrevisto: "",
      },
  );
  const [membros, setMembros] = useState<Record<string, string>>(() => inicial?.membros ?? {}); // pessoaId → papel
  const etapaVazia = (): EtapaForm => ({
    nome: "",
    descricao: "",
    inicioPrevisto: p.inicio,
    fimPrevisto: p.fimPrevisto,
    caminhos: "",
    tasks: "",
    caminhoEditado: false,
  });
  const [etapas, setEtapas] = useState<EtapaForm[]>(() =>
    inicial ? inicial.etapas.map((e) => ({ ...e, caminhoEditado: true })) : [etapaVazia()],
  );

  const dados: ProjetoNovo = {
    ...p,
    membros: Object.entries(membros).map(([pessoaId, papel]) => ({
      pessoaId,
      papel,
    })),
    etapas: etapas.map((e) => ({
      ...(e.id ? { id: e.id } : {}),
      nome: e.nome,
      descricao: e.descricao,
      inicioPrevisto: e.inicioPrevisto,
      fimPrevisto: e.fimPrevisto,
      caminhos: e.caminhos,
      tasks: e.tasks,
    })),
  };
  const erros = validarProjeto(dados);

  const mudar = (k: keyof typeof p, v: string) => setP((a) => ({ ...a, [k]: v }));
  const mudarEtapa = (i: number, k: keyof EtapaForm, v: string) =>
    setEtapas((lista) =>
      lista.map((e, j) => {
        if (j !== i) return e;
        const nova = { ...e, [k]: v };
        // caminho sugerido acompanha o nome até o admin editar o campo
        if (k === "nome" && !e.caminhoEditado) nova.caminhos = caminhoSugerido(v);
        if (k === "caminhos") nova.caminhoEditado = true;
        return nova;
      }),
    );

  function salvar() {
    setTentou(true);
    setErrosServidor([]);
    if (erros.length) return;
    iniciar(async () => {
      const r = inicial ? await editarProjeto(inicial.projetoId, dados) : await criarProjeto(dados);
      if ("erros" in r) setErrosServidor(r.erros);
      else {
        if (inicial) avisar({ texto: "Alterações salvas", detalhe: dados.nome });
        if (r.github) avisar({ texto: "Repositório sincronizado", detalhe: r.github, tom: r.github.startsWith("Não foi") ? "ambar" : "verde" });
        router.push(`/projetos/${r.id}`);
      }
    });
  }

  const avisos = errosServidor.length ? errosServidor : tentou ? erros : [];

  return (
    <form
      className="space-y-6"
      onSubmit={(ev) => {
        ev.preventDefault();
        salvar();
      }}
    >
      {/* projeto */}
      <Caixa titulo="Projeto">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Campo titulo="Nome do projeto">
              <input className={campo} value={p.nome} onChange={(e) => mudar("nome", e.target.value)} placeholder="Ex.: Portal do Aluno" />
            </Campo>
          </div>
          <Campo titulo="Cliente">
            <select className={campo} value={p.clienteId} onChange={(e) => mudar("clienteId", e.target.value)}>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
              <option value="">+ Novo cliente</option>
            </select>
          </Campo>
          {!p.clienteId ? (
            <div className="grid grid-cols-2 gap-3">
              <Campo titulo="Nome do cliente">
                <input className={campo} value={p.clienteNovo} onChange={(e) => mudar("clienteNovo", e.target.value)} />
              </Campo>
              <Campo titulo="Segmento (opcional)">
                <input
                  className={campo}
                  value={p.segmentoNovo}
                  onChange={(e) => mudar("segmentoNovo", e.target.value)}
                  placeholder="Ex.: escola"
                />
              </Campo>
            </div>
          ) : (
            <div />
          )}
          <Campo titulo="Início">
            <input type="date" className={campo} value={p.inicio} onChange={(e) => mudar("inicio", e.target.value)} />
          </Campo>
          <Campo titulo="Fim previsto">
            <input type="date" className={campo} value={p.fimPrevisto} onChange={(e) => mudar("fimPrevisto", e.target.value)} />
          </Campo>
          <div className="sm:col-span-2">
            <Campo titulo="Descrição" dica="Uma frase sobre o que o projeto entrega.">
              <input className={campo} value={p.descricao} onChange={(e) => mudar("descricao", e.target.value)} />
            </Campo>
          </div>
          <div className="sm:col-span-2">
            <Campo titulo="Contexto (opcional)" dica="O problema do cliente e decisões importantes. Aparece na aba Sobre.">
              <textarea className={`${campo} min-h-20`} value={p.contexto} onChange={(e) => mudar("contexto", e.target.value)} />
            </Campo>
          </div>
        </div>
      </Caixa>

      {/* equipe */}
      <Caixa titulo={`Equipe · ${Object.keys(membros).length}`}>
        <ul className="grid gap-2 sm:grid-cols-2">
          {pessoas.map((pessoa) => {
            const marcado = pessoa.id in membros;
            return (
              <li
                key={pessoa.id}
                className={`rounded-xl border px-3 py-2 transition-colors ${marcado ? "border-verde/50 bg-verde/5" : "border-gray-300"}`}
              >
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={marcado}
                    onChange={(e) =>
                      setMembros((m) => {
                        const n = { ...m };
                        if (e.target.checked) n[pessoa.id] = "";
                        else delete n[pessoa.id];
                        return n;
                      })
                    }
                    className="accent-[#00db58]"
                  />
                  {pessoa.nome}
                </label>
                {marcado && (
                  <input
                    className={`${campo} mt-2 py-1.5`}
                    value={membros[pessoa.id]}
                    onChange={(e) => setMembros((m) => ({ ...m, [pessoa.id]: e.target.value }))}
                    placeholder="Papel (ex.: Dev back-end)"
                    aria-label={`Papel de ${pessoa.nome}`}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </Caixa>

      {/* repositório no GitHub */}
      <Caixa titulo="Repositório (opcional)">
        <Campo
          titulo="Repositório no GitHub"
          dica="Os commits vêm daqui: cada commit entra na etapa cujos caminhos ele altera, e o autor é ligado ao membro pelo GitHub cadastrado no perfil."
        >
          <div className="relative">
            <IconeGithub className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              className={`${campo} pl-9`}
              value={p.repositorio ?? ""}
              onChange={(e) => mudar("repositorio", e.target.value)}
              placeholder="github.com/dono/projeto"
            />
          </div>
        </Campo>
      </Caixa>

      {/* etapas */}
      <Caixa titulo={`Etapas · ${etapas.length}`}>
        <ol className="space-y-4">
          {etapas.map((e, i) => (
            <li key={i} className="rounded-2xl border border-gray-300 bg-fundo p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="dado text-xs text-verde">Etapa {String(i + 1).padStart(2, "0")}</span>
                {e.temCommits ? (
                  <span className="text-xs text-gray-500" title="Remover apagaria o histórico de commits da etapa">
                    tem commits · não pode ser removida
                  </span>
                ) : (
                  etapas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setEtapas((l) => l.filter((_, j) => j !== i))}
                      className="cursor-pointer text-xs text-gray-500 transition-colors hover:text-ambar"
                    >
                      Remover etapa
                    </button>
                  )
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Campo titulo="Nome da etapa">
                  <input
                    className={campo}
                    value={e.nome}
                    onChange={(ev) => mudarEtapa(i, "nome", ev.target.value)}
                    placeholder="Ex.: Agenda"
                  />
                </Campo>
                <Campo titulo="Descrição">
                  <input className={campo} value={e.descricao} onChange={(ev) => mudarEtapa(i, "descricao", ev.target.value)} />
                </Campo>
                <Campo titulo="Início previsto">
                  <input
                    type="date"
                    className={campo}
                    value={e.inicioPrevisto}
                    onChange={(ev) => mudarEtapa(i, "inicioPrevisto", ev.target.value)}
                  />
                </Campo>
                <Campo titulo="Fim previsto">
                  <input
                    type="date"
                    className={campo}
                    value={e.fimPrevisto}
                    onChange={(ev) => mudarEtapa(i, "fimPrevisto", ev.target.value)}
                  />
                </Campo>
                <Campo titulo="Caminhos do repositório" dica="Um por linha. Commits que alteram esses arquivos contam nesta etapa.">
                  <textarea
                    className={`${campo} dado min-h-20 text-xs`}
                    value={e.caminhos}
                    onChange={(ev) => mudarEtapa(i, "caminhos", ev.target.value)}
                    placeholder="src/agenda/**"
                  />
                </Campo>
                <Campo titulo={`Tasks · ${linhas(e.tasks).length}`} dica="Uma por linha. O progresso da etapa vem das tasks concluídas.">
                  <textarea
                    className={`${campo} min-h-20`}
                    value={e.tasks}
                    onChange={(ev) => mudarEtapa(i, "tasks", ev.target.value)}
                    placeholder={"Tela de agendamento\nLembrete por WhatsApp"}
                  />
                </Campo>
              </div>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => setEtapas((l) => [...l, etapaVazia()])}
          className="mt-4 w-full cursor-pointer rounded-2xl border border-dashed border-gray-400 py-3 text-sm text-gray-600 transition-colors hover:border-verde hover:text-verde"
        >
          + Adicionar etapa
        </button>
      </Caixa>

      {avisos.length > 0 && (
        <div role="alert" className="rounded-2xl border border-ambar/40 bg-ambar/5 p-4">
          <p className="mb-2 text-sm font-semibold text-ambar">Antes de salvar, falta:</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
            {avisos.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Botao type="button" variante="secundario" onClick={() => router.push(inicial ? `/projetos/${inicial.projetoId}` : "/projetos")}>
          Cancelar
        </Botao>
        <Botao type="submit" disabled={salvando}>
          {salvando ? "Salvando…" : inicial ? "Salvar alterações" : "Criar projeto"}
        </Botao>
      </div>
    </form>
  );
}

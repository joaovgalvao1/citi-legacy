"use client";

// Formulário de membro: adicionar (sem `inicial`) ou editar (com `inicial`).
// Marcar como ex-membro = preencher a data de saída (é o caminho para quem tem commits).

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { criarMembro, editarMembro } from "@/app/acoes";
import { avisar } from "@/lib/avisos";
import { validarMembro, type MembroForm } from "@/lib/membros";
import { Botao, Caixa } from "@/components/ui";

const campo =
  "w-full rounded-xl border border-gray-400 bg-fundo px-3 py-2 text-sm text-branco outline-none transition-colors [color-scheme:dark] focus:border-verde";
const rotulo = "mb-1 block text-xs font-medium text-gray-600";

export function FormularioMembro({ hoje, inicial }: { hoje: string; inicial?: { id: string } & MembroForm }) {
  const router = useRouter();
  const [m, setM] = useState<MembroForm>(() => inicial ?? { nome: "", entrada: hoje.slice(0, 7), saiuEm: "" });
  const [exMembro, setExMembro] = useState(!!inicial?.saiuEm);
  const [erros, setErros] = useState<string[]>([]);
  const [salvando, iniciar] = useTransition();

  function salvar() {
    const dados = { ...m, saiuEm: exMembro ? m.saiuEm : "" };
    const lista = [...validarMembro(dados), ...(exMembro && !dados.saiuEm ? ["Informe a data de saída."] : [])];
    setErros(lista);
    if (lista.length) return;
    iniciar(async () => {
      const r = inicial ? await editarMembro(inicial.id, dados) : await criarMembro(dados);
      if ("erros" in r) return setErros(r.erros);
      avisar({ texto: inicial ? "Alterações salvas" : "Membro adicionado", detalhe: dados.nome });
      router.push(`/membros/${r.id}`);
    });
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        salvar();
      }}
    >
      <Caixa titulo="Membro">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={rotulo}>Nome completo</span>
            <input className={campo} value={m.nome} onChange={(e) => setM({ ...m, nome: e.target.value })} placeholder="Ex.: Ana Beatriz Souza" />
          </label>
          <label className="block">
            <span className={rotulo}>Entrada no CITi</span>
            <input type="month" className={campo} value={m.entrada} onChange={(e) => setM({ ...m, entrada: e.target.value })} />
          </label>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2 pt-6 text-sm">
              <input type="checkbox" checked={exMembro} onChange={(e) => setExMembro(e.target.checked)} className="accent-[#00db58]" />
              Ex-membro (já saiu do CITi)
            </label>
            {exMembro && (
              <input
                type="date"
                aria-label="Data de saída"
                className={campo}
                value={m.saiuEm}
                onChange={(e) => setM({ ...m, saiuEm: e.target.value })}
              />
            )}
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          O papel da pessoa é definido em cada projeto (na equipe do projeto). Os contatos (e-mail, LinkedIn e GitHub) aparecem no perfil como
          protótipo.
        </p>
      </Caixa>

      {erros.length > 0 && (
        <div role="alert" className="rounded-xl border border-ambar/40 bg-ambar/5 p-4">
          <p className="mb-2 text-sm font-semibold text-ambar">Antes de salvar, falta:</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
            {erros.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Botao type="button" variante="secundario" onClick={() => router.push(inicial ? `/membros/${inicial.id}` : "/membros")}>
          Cancelar
        </Botao>
        <Botao type="submit" disabled={salvando}>
          {salvando ? "Salvando…" : inicial ? "Salvar alterações" : "Adicionar membro"}
        </Botao>
      </div>
    </form>
  );
}

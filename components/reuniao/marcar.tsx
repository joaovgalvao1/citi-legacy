"use client";

// Janela "Marcar reunião": data, horário, duração, local e recado. Envia o convite por e-mail
// (com a pauta da semana) e oferece o link "Adicionar ao Google Agenda" para quem marcou.

import { useState, useTransition } from "react";
import { marcarReuniao } from "@/app/acoes";
import { DURACOES, proximoDiaUtil, validarConvite, type Convite } from "@/lib/convite";
import { Dialogo } from "@/components/ui/dialogo";

const campo =
  "w-full rounded-xl border border-gray-400 bg-fundo px-3 py-2 text-sm text-branco outline-none transition-colors [color-scheme:dark] focus:border-verde";
const rotulo = "mb-1 block text-xs font-medium text-gray-600";

export type Marcada = { mensagem: string; agenda?: string };

export function MarcarReuniao({
  aberto,
  hoje,
  destinatarios,
  aoFechar,
  aoMarcar,
}: {
  aberto: boolean;
  hoje: string;
  /** Endereços configurados (BOLETIM_PARA); a pessoa escolhe entre eles. */
  destinatarios: string[];
  aoFechar: () => void;
  aoMarcar: (r: Marcada) => void;
}) {
  const [c, setC] = useState<Convite>(() => ({ data: proximoDiaUtil(hoje), hora: "14:00", duracao: 60, local: "", recado: "" }));
  const [erro, setErro] = useState("");
  const [para, setPara] = useState<string[]>(() => destinatarios);
  const [enviando, iniciar] = useTransition();
  const mudar = <K extends keyof Convite>(k: K, v: Convite[K]) => setC((a) => ({ ...a, [k]: v }));

  function confirmar() {
    const erros = validarConvite(c, hoje);
    if (!para.length) erros.push("Escolha pelo menos um destinatário.");
    if (erros.length) return setErro(erros.join(" "));
    setErro("");
    iniciar(async () => {
      const r = await marcarReuniao(c, para);
      if (!r.enviado) return setErro(r.mensagem);
      aoMarcar({ mensagem: r.mensagem, agenda: r.agenda });
    });
  }

  return (
    <Dialogo
      aberto={aberto}
      titulo="Marcar reunião da diretoria"
      rotuloConfirmar="Enviar convite"
      ocupado={enviando}
      erro={erro}
      aoConfirmar={confirmar}
      aoFechar={() => {
        setErro("");
        aoFechar();
      }}
    >
      <p>O convite vai por e-mail com a pauta da semana (indicadores, panorama e prioridades) e o botão para adicionar à agenda.</p>
      <div className="grid grid-cols-2 gap-3 pt-1">
        <label className="block">
          <span className={rotulo}>Data</span>
          <input type="date" min={hoje} value={c.data} onChange={(e) => mudar("data", e.target.value)} className={campo} required />
        </label>
        <label className="block">
          <span className={rotulo}>Horário</span>
          <input type="time" value={c.hora} onChange={(e) => mudar("hora", e.target.value)} className={campo} required />
        </label>
        <label className="col-span-2 block">
          <span className={rotulo}>Duração</span>
          <div className="flex gap-2">
            {DURACOES.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={c.duracao === d}
                onClick={() => mudar("duracao", d)}
                className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  c.duracao === d ? "border-verde bg-verde/10 text-verde" : "border-branco/25 bg-branco/5 text-gray-700 hover:border-branco/50"
                }`}
              >
                {d < 60 ? `${d} min` : `${Math.floor(d / 60)}h${d % 60 ? String(d % 60) : ""}`}
              </button>
            ))}
          </div>
        </label>
        <label className="col-span-2 block">
          <span className={rotulo}>Local ou link (opcional)</span>
          <input value={c.local} onChange={(e) => mudar("local", e.target.value)} placeholder="Sala da diretoria ou link do Meet" className={campo} />
        </label>
        <label className="col-span-2 block">
          <span className={rotulo}>Recado (opcional)</span>
          <textarea
            value={c.recado}
            onChange={(e) => mudar("recado", e.target.value)}
            placeholder="Ex.: trazer a atualização do Financeiro da Clínica"
            className={`${campo} min-h-16`}
          />
        </label>
      </div>
      <fieldset>
        <legend className={rotulo}>Para</legend>
        {destinatarios.length ? (
          <ul className="flex flex-wrap gap-2">
            {destinatarios.map((e) => {
              const marcado = para.includes(e);
              return (
                <li key={e}>
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      marcado ? "border-verde/50 bg-verde/10 text-branco" : "border-branco/25 bg-branco/5 text-gray-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={(ev) => setPara((l) => (ev.target.checked ? [...l, e] : l.filter((x) => x !== e)))}
                      className="accent-[#00db58]"
                    />
                    {e}
                  </label>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-ambar">Nenhum destinatário configurado (BOLETIM_PARA).</p>
        )}
        <p className="mt-1.5 text-[11px] text-gray-500">A lista vem da configuração do servidor (BOLETIM_PARA).</p>
      </fieldset>
    </Dialogo>
  );
}

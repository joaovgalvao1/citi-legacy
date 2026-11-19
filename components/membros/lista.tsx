"use client";

// Membros em dois modos de visualização: a "Órbita" (antes "Roda do CITi") (avatares em volta de um círculo que gira,
// com quem está no topo em destaque) e a lista de cards. Abas (na empresa / já saíram), filtro por
// projeto e busca por nome valem para os dois modos.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Selo } from "@/components/ui";
import { AvatarMembro } from "./pecas";
import { Roda } from "./roda";
import { Orbitas } from "@/components/entrada/fundo";

export type ResumoMembro = {
  id: string;
  nome: string;
  /** Usuário do GitHub (a foto do avatar vem dele). */
  github?: string;
  /** Papel no projeto mais recente. */
  cargo: string;
  desde: string;
  saiuEm: string | null;
  projetos: number;
  /** Maior Índice de Conhecimento da pessoa num projeto. */
  maiorIc: { valor: number; projeto: string } | null;
  /** Papel e IC em cada projeto (para o filtro por projeto). */
  participacoes: { projetoId: string; papel: string; ic: number }[];
};

type Modo = "roda" | "lista";

const normalizar = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const pilula = (ativo: boolean) =>
  `cursor-pointer rounded-full border px-3 py-1 transition-colors ${
    ativo ? "border-verde bg-verde/10 text-verde" : "border-branco/25 bg-branco/5 text-gray-700 hover:border-branco/40"
  }`;

/** Cargo e IC que aparecem no card: os do projeto filtrado ou os gerais. */
function contexto(m: ResumoMembro, projetoId: string, nomeProjeto?: string) {
  const p = projetoId ? m.participacoes.find((x) => x.projetoId === projetoId) : undefined;
  if (p) return { cargo: p.papel, ic: { valor: p.ic, rotulo: `IC em ${nomeProjeto}` } };
  return { cargo: m.cargo, ic: m.maiorIc ? { valor: m.maiorIc.valor, rotulo: `maior IC (${m.maiorIc.projeto})` } : null };
}

export function ListaMembros({ membros, projetos }: { membros: ResumoMembro[]; projetos: { id: string; nome: string }[] }) {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>("roda");
  const [aba, setAba] = useState<"empresa" | "sairam">("empresa");
  const [busca, setBusca] = useState("");
  const [projetoId, setProjetoId] = useState("");

  const termo = normalizar(busca.trim());
  const nomeProjeto = projetos.find((p) => p.id === projetoId)?.nome;
  const filtrados = membros.filter(
    (m) => (!projetoId || m.participacoes.some((p) => p.projetoId === projetoId)) && (!termo || normalizar(m.nome).includes(termo)),
  );
  const naEmpresa = filtrados.filter((m) => !m.saiuEm);
  const sairam = filtrados.filter((m) => m.saiuEm);
  const visiveis = aba === "empresa" ? naEmpresa : sairam;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex w-full items-center justify-between gap-2 lg:w-auto lg:justify-start">
          <div className="flex flex-wrap gap-2 text-sm" role="tablist" aria-label="Membros">
            {(
              [
                ["empresa", `Na empresa · ${naEmpresa.length}`],
                ["sairam", `Já saíram · ${sairam.length}`],
              ] as const
            ).map(([id, rotulo]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={aba === id}
                onClick={() => setAba(id)}
                className={pilula(aba === id)}
              >
                {rotulo}
              </button>
            ))}
          </div>
          <div
            className="flex rounded-full border border-branco/25 bg-branco/5 p-0.5 text-sm"
            role="group"
            aria-label="Modo de visualização"
          >
            {(
              [
                ["roda", "Órbita"],
                ["lista", "Cards"],
              ] as const
            ).map(([id, rotulo]) => (
              <button
                key={id}
                type="button"
                aria-pressed={modo === id}
                onClick={() => setModo(id)}
                className={`cursor-pointer rounded-full px-3 py-1 transition-colors ${modo === id ? "bg-verde font-medium text-fundo" : "text-gray-700 hover:text-branco"}`}
              >
                {rotulo}
              </button>
            ))}
          </div>
        </div>
        <div className="flex w-full items-center gap-2 lg:w-auto">
          <select
            value={projetoId}
            onChange={(e) => setProjetoId(e.target.value)}
            aria-label="Filtrar por projeto"
            className="min-w-0 flex-1 cursor-pointer rounded-full border border-branco/25 bg-branco/5 px-4 py-1.5 text-sm outline-none transition-colors focus:border-verde lg:w-52 lg:flex-none [&>option]:bg-[#1f1f1f]"
          >
            <option value="">Todos os projetos</option>
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome"
            aria-label="Buscar membro por nome"
            className="min-w-0 flex-1 rounded-full border border-branco/25 bg-branco/5 px-4 py-1.5 text-sm outline-none transition-colors focus:border-verde lg:w-52 lg:flex-none"
          />
        </div>
      </div>

      {visiveis.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-400 p-6 text-center text-sm text-gray-500">Nenhum membro encontrado.</p>
      ) : modo === "roda" ? (
        <div className="relative pt-10 pb-[120px] sm:pt-[168px] sm:pb-[115px]">
          {/* espaço em cima e embaixo para o anel maior da órbita aparecer inteiro (o rodapé desce junto) */}
          <Roda
            fundo
            key={`${aba}-${projetoId}-${termo}`}
            itens={visiveis.map((m) => ({ ...m, apagado: !!m.saiuEm }))}
            rotulo={aba === "empresa" ? "Órbita dos membros na empresa" : "Órbita de quem já saiu"}
            aoAbrir={(m) => router.push(`/membros/${m.id}`)}
            centro={(m) => <CentroMembro membro={m} {...contexto(m, projetoId, nomeProjeto)} />}
          />
        </div>
      ) : (
        <div className="relative">
          {/* no modo lista, as órbitas ficam atrás do topo da grade, à direita */}
          <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-0 h-[520px] w-[520px]" style={{ zIndex: -1 }}>
            <Orbitas id="lista-membros" brilho={0.12} className="inset-0 w-full opacity-70" />
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visiveis.map((m) => {
              const { cargo, ic } = contexto(m, projetoId, nomeProjeto);
              return (
                <li key={m.id}>
                  <Link
                    href={`/membros/${m.id}`}
                    className="flex h-full flex-col gap-3 rounded-xl border border-linha bg-white p-5 transition-colors hover:border-verde/60"
                  >
                    <div className="flex items-start gap-3">
                      <AvatarMembro nome={m.nome} github={m.github} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="truncate font-semibold">{m.nome}</span>
                          {m.saiuEm && <Selo>Saiu em {m.saiuEm}</Selo>}
                        </div>
                        <p className="truncate text-sm text-gray-600">{cargo}</p>
                        <p className="text-xs text-gray-500">No CITi desde {m.desde}</p>
                      </div>
                    </div>
                    <div className="mt-auto space-y-1.5">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>
                          {m.projetos} {m.projetos === 1 ? "projeto" : "projetos"}
                        </span>
                        {ic && (
                          <span className="dado">
                            {projetoId ? "IC" : "maior IC"} {Math.round(ic.valor)}%
                          </span>
                        )}
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-branco/10" title={ic ? ic.rotulo : "Sem commits ainda"}>
                        {ic && <div className="anima-barra h-full rounded-full bg-verde" style={{ width: `${ic.valor}%` }} />}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Centro da roda: quem está em foco. */
function CentroMembro({ membro: m, cargo, ic }: { membro: ResumoMembro } & ReturnType<typeof contexto>) {
  return (
    <div key={m.id} className="anima-fade flex flex-col items-center">
      <span className={m.saiuEm ? "grayscale" : ""}>
        <AvatarMembro nome={m.nome} github={m.github} tamanho="h-12 w-12 text-base sm:h-16 sm:w-16 sm:text-xl" />
      </span>
      <div className="mt-2 text-base leading-tight font-semibold sm:text-xl">{m.nome}</div>
      <div className="mt-0.5 line-clamp-1 text-xs text-gray-600 sm:text-sm">{cargo}</div>
      <div className="mt-0.5 text-[11px] text-gray-500 sm:text-xs">{m.saiuEm ? `Saiu em ${m.saiuEm}` : `No CITi desde ${m.desde}`}</div>
      <div className="mt-3 w-full max-w-48 space-y-1">
        <div className="flex justify-between text-[11px] text-gray-600">
          <span>
            {m.projetos} {m.projetos === 1 ? "projeto" : "projetos"}
          </span>
          {ic && <span className="dado">IC {Math.round(ic.valor)}%</span>}
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-branco/10" title={ic?.rotulo}>
          {ic && <div className="h-full rounded-full bg-verde transition-[width] duration-500" style={{ width: `${ic.valor}%` }} />}
        </div>
      </div>
      <Link
        href={`/membros/${m.id}`}
        className="mt-3 rounded-full bg-verde px-4 py-1.5 text-xs font-medium text-fundo transition-colors hover:bg-verde-escuro sm:text-sm"
      >
        Abrir perfil
      </Link>
    </div>
  );
}

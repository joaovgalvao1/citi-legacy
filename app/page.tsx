// Entrada do site (pública): a vitrine do CITi Legacy antes do login.
// Os números são reais e agregados; projetos, clientes e pessoas não aparecem (ficam atrás do login).
// As ilustrações dos recursos usam conteúdo genérico (components/entrada/vitrine).

import type { ReactNode } from "react";
import Link from "next/link";
import { obterPessoas, obterProjetos, obterResumos, totalDeCommits } from "@/data";
import { lider } from "@/lib/indice";
import { nivelProjeto } from "@/lib/status";
import { Lockup } from "@/components/layout/marca";
import {
  IconeConhecimento,
  IconeEmail,
  IconeEntrar,
  IconeExportar,
  IconeGithub,
  IconeIA,
  IconeLegado,
  IconeProgresso,
} from "@/components/ui/icones";
import {
  FluxoGithub,
  MiniConhecimento,
  MiniEmail,
  MiniIA,
  MiniReuniao,
  MiniSemaforo,
  Ponto,
  VitrineDestaque,
} from "@/components/entrada/vitrine";

const botaoPrincipal =
  "inline-flex items-center gap-2 rounded-full bg-verde px-6 py-3 font-semibold text-fundo shadow-[0_0_40px_-8px_var(--color-verde)] transition-colors hover:bg-verde-escuro";
const botaoSecundario =
  "inline-flex items-center gap-2 rounded-full border border-branco/25 bg-branco/5 px-6 py-3 text-branco transition-colors hover:border-verde hover:text-verde";

function Titulo({ rotulo, fino, destaque, children }: { rotulo: string; fino: string; destaque: string; children?: ReactNode }) {
  return (
    <div className="max-w-2xl space-y-3">
      <p className="rotulo text-verde!">{rotulo}</p>
      <h2 className="text-3xl leading-tight tracking-[-0.035em] sm:text-4xl">
        <span className="font-light">{fino}</span> <span className="font-bold">{destaque}</span>
      </h2>
      {children && <p className="text-gray-600">{children}</p>}
    </div>
  );
}

function Recurso({
  icone: Icone,
  titulo,
  texto,
  children,
  className = "",
  ia = false,
}: {
  icone: (p: { className?: string }) => ReactNode;
  titulo: string;
  texto: string;
  children: ReactNode;
  className?: string;
  ia?: boolean;
}) {
  return (
    <li
      className={`group flex flex-col gap-5 rounded-2xl p-6 transition-colors ${
        ia ? "borda-ia" : "border border-linha bg-white hover:border-verde/40"
      } ${className}`}
    >
      <div>
        <span className={`inline-flex rounded-xl p-2.5 ${ia ? "bg-roxo/10 text-roxo" : "bg-verde/10 text-verde"}`}>
          <Icone className="h-5 w-5" />
        </span>
        <h3 className="mt-4 text-lg font-semibold">{titulo}</h3>
        <p className="mt-1.5 text-sm text-gray-600">{texto}</p>
      </div>
      <div className="mt-auto">{children}</div>
    </li>
  );
}

export default async function Entrada() {
  const [projetos, pessoas, commits] = await Promise.all([obterProjetos(), obterPessoas(), totalDeCommits()]);
  const resumos = (await Promise.all(projetos.map((p) => obterResumos(p.id)))).flat();
  const resumosIA = resumos.filter((r) => r.fonte !== "regras").length;

  const andamento = projetos.filter((p) => p.status !== "concluido");
  const niveis = { verde: 0, ambar: 0, vermelho: 0 };
  for (const p of andamento) niveis[nivelProjeto(p)]++;
  const exMembros = pessoas.filter((p) => p.saiuEm).length;
  // etapas em que quem mais sabe já saiu da empresa: o conhecimento continua registrado aqui
  const etapasDeQuemSaiu = projetos.flatMap((p) => p.etapas.filter((e) => lider(p, e.id)?.membro.saiuEm)).length;

  return (
    <div className="overflow-x-clip">
      {/* ---------- destaque ---------- */}
      <section className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-full bg-cover bg-right opacity-35 md:w-3/5"
          style={{
            backgroundImage: "url(/marca/fundo-citi.webp)",
            maskImage:
              "linear-gradient(to right, transparent, black 45%, black 70%, transparent), linear-gradient(to bottom, black 60%, transparent)",
            maskComposite: "intersect",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-16 lg:grid-cols-[1.05fr_1fr] lg:pt-20 lg:pb-24">
          <div className="anima-surgir space-y-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-verde/30 bg-verde/10 px-3 py-1 text-xs text-verde">
              <Ponto tom="verde" pulsa />
              Ferramenta interna do CITi · CIn UFPE
            </p>
            <h1 className="text-5xl leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              <span className="font-light">Todo projeto deixa um</span> <span className="font-bold text-verde">legado.</span>
            </h1>
            <p className="text-2xl leading-snug font-light tracking-[-0.02em] text-gray-800 sm:text-3xl">
              Quem chega <span className="font-semibold text-branco">não começa do zero.</span>
            </p>
            <p className="max-w-lg text-gray-600">
              Progresso, previsão de entrega, quem sabe o quê e o resumo da semana feito pela IA. Tudo direto dos commits do GitHub, para a
              diretoria decidir na reunião de segunda e para quem entra amanhã.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className={botaoPrincipal}>
                <IconeEntrar className="h-4 w-4" />
                Entrar
              </Link>
              <a href="#recursos" className={botaoSecundario}>
                Ver o que faz
              </a>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-600">
              <li className="inline-flex items-center gap-1.5">
                <IconeGithub className="h-3.5 w-3.5 text-verde" /> Conectado ao GitHub
              </li>
              <li className="inline-flex items-center gap-1.5">
                <IconeIA className="h-3.5 w-3.5 text-roxo" /> Resumo com IA todo domingo
              </li>
              <li className="inline-flex items-center gap-1.5">
                <IconeExportar className="h-3.5 w-3.5 text-verde" /> Modo reunião em PDF
              </li>
            </ul>
          </div>
          <VitrineDestaque />
        </div>
      </section>

      {/* ---------- números reais (agregados) ---------- */}
      <section className="border-y border-linha bg-white/40 backdrop-blur">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-4 py-10 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { valor: andamento.length, rotulo: "projetos em andamento", extra: niveis },
            { valor: projetos.length - andamento.length, rotulo: "projetos concluídos e consultáveis" },
            { valor: pessoas.length, rotulo: "pessoas no histórico" },
            { valor: commits, rotulo: "commits analisados" },
            { valor: resumosIA, rotulo: "resumos escritos pela IA", ia: true },
          ].map((d) => (
            <div key={d.rotulo} className="space-y-1.5">
              <dd className={`dado text-4xl leading-none font-bold tracking-tight ${d.ia ? "texto-ia" : "text-branco"}`}>{d.valor}</dd>
              <dt className="text-sm text-gray-600">{d.rotulo}</dt>
              {d.extra && (
                <div className="flex gap-3 text-[11px] text-gray-500">
                  {(["verde", "ambar", "vermelho"] as const).map((t) => (
                    <span key={t} className="inline-flex items-center gap-1">
                      <Ponto tom={t} /> {d.extra[t]}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </dl>
      </section>

      {/* ---------- recursos ---------- */}
      <section id="recursos" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20">
        <Titulo rotulo="O que faz" fino="Tudo o que a diretoria precisa" destaque="na segunda.">
          Do “como está cada projeto?” ao “quem sabe mexer nisso?”, sem planilha e sem perguntar no grupo.
        </Titulo>
        <ul className="mt-10 grid gap-4 lg:grid-cols-6">
          <Recurso
            className="lg:col-span-4"
            icone={IconeProgresso}
            titulo="Semáforo e previsão de entrega"
            texto="Cada projeto ganha uma cor pelo andamento real. A previsão usa o ritmo das últimas semanas e aponta o gargalo principal antes de virar atraso."
          >
            <MiniSemaforo />
          </Recurso>
          <Recurso
            className="lg:col-span-2"
            ia
            icone={IconeIA}
            titulo="Resumo semanal com IA"
            texto="Todo domingo, a IA lê a semana de cada projeto e escreve o que andou, o que travou e o que fazer primeiro."
          >
            <MiniIA />
          </Recurso>
          <Recurso
            className="lg:col-span-2"
            icone={IconeConhecimento}
            titulo="Quem sabe o quê"
            texto="O Índice de Conhecimento mostra quanto de cada etapa está com cada pessoa. A órbita mostra quem trabalhou com quem."
          >
            <MiniConhecimento />
          </Recurso>
          <Recurso
            className="lg:col-span-2"
            icone={IconeExportar}
            titulo="Modo reunião"
            texto="Os slides da reunião de diretoria se montam sozinhos: panorama, um slide por projeto e as prioridades. Sai em PDF 16:9."
          >
            <MiniReuniao />
          </Recurso>
          <Recurso
            className="lg:col-span-2"
            icone={IconeEmail}
            titulo="Boletim e convite"
            texto="O boletim da semana chega por e-mail, e a reunião é marcada com link direto para o Google Agenda."
          >
            <MiniEmail />
          </Recurso>
          <Recurso
            className="lg:col-span-6"
            icone={IconeGithub}
            titulo="Conectado ao repositório"
            texto="Vincule o repositório do GitHub ao projeto e pronto: cada push chega pelo webhook, e o cron de domingo garante que nada fique de fora."
          >
            <FluxoGithub />
          </Recurso>
        </ul>
      </section>

      {/* ---------- como funciona ---------- */}
      <section className="border-y border-linha bg-white/40">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <Titulo rotulo="Como funciona" fino="Três passos e o painel" destaque="se mantém sozinho." />
          <ol className="relative mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                titulo: "Cadastre o projeto",
                texto: "Etapas, prazos e tasks, com os caminhos do código que cada etapa cobre.",
                codigo: "estoque/** → Estoque",
              },
              {
                titulo: "Conecte o GitHub",
                texto: "Cada commit vira participação na etapa dos arquivos que alterou.",
                codigo: "github.com/citi/projeto",
              },
              {
                titulo: "Chegue pronto na segunda",
                texto: "Resumo da IA, boletim por e-mail e slides da reunião, todo fim de semana.",
                codigo: "domingo · 23h · resumo + boletim",
              },
            ].map((p, i) => (
              <li key={p.titulo} className="relative rounded-2xl border border-linha bg-fundo p-6">
                <span className="dado relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-verde text-sm font-bold text-fundo">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold">{p.titulo}</h3>
                <p className="mt-1.5 text-sm text-gray-600">{p.texto}</p>
                <code className="dado mt-4 inline-block rounded-lg border border-linha bg-white px-2 py-1 text-xs text-gray-700">
                  {p.codigo}
                </code>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- legado ---------- */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          <span className="inline-flex rounded-xl bg-verde/10 p-2.5 text-verde">
            <IconeLegado className="h-6 w-6" />
          </span>
          <h2 className="text-4xl leading-tight tracking-[-0.04em] sm:text-5xl">
            <span className="font-light">Quando alguém sai,</span> <span className="font-bold text-verde">o conhecimento fica.</span>
          </h2>
          <p className="max-w-lg text-gray-600">
            Em empresa júnior, a equipe muda todo semestre. O CITi Legacy guarda o que foi feito, quando e por quem, e mostra a quem
            perguntar antes que essa pessoa vá embora.
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-linha bg-white p-6">
            <dd className="dado text-5xl leading-none font-bold text-verde">{exMembros}</dd>
            <dt className="mt-2 text-sm text-gray-600">ex-membros com o trabalho registrado</dt>
          </div>
          <div className="rounded-2xl border border-linha bg-white p-6">
            <dd className="dado text-5xl leading-none font-bold text-branco">{etapasDeQuemSaiu}</dd>
            <dt className="mt-2 text-sm text-gray-600">etapas em que quem mais sabia já saiu, e o histórico continua aqui</dt>
          </div>
        </dl>
      </section>

      {/* ---------- chamada final ---------- */}
      <section className="px-4 pb-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-verde/25 bg-[#082414] px-6 py-16 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: "url(/marca/fundo-citi.webp)" }}
          />
          <div className="relative flex flex-col items-center gap-5">
            <Lockup tamanho="grande" />
            <h2 className="text-3xl tracking-[-0.035em] sm:text-4xl">
              <span className="font-light">Pronto para ver</span> <span className="font-bold">os projetos?</span>
            </h2>
            <p className="text-gray-700">Entre com o usuário de demonstração do protótipo.</p>
            <Link href="/login" className={botaoPrincipal}>
              <IconeEntrar className="h-4 w-4" />
              Entrar no CITi Legacy
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

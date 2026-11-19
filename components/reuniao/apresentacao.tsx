"use client";

// Modo Reunião: apresenta os slides (montados no servidor) em 16:9, com navegação pelo teclado
// (← → espaço, Esc sai, F tela cheia, P exporta PDF), botões em pílula, barra de progresso e fade.
// O slide é desenhado numa tela fixa de 1280 × 720 e escalado inteiro para o tamanho disponível,
// como num programa de apresentação: nada se desalinha em telas menores ou maiores.
// Exportar PDF: a impressão mostra todos os slides, um por página de 1280 × 720 (ver globals.css).

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Lockup } from "@/components/layout/marca";
import { IconeExportar } from "@/components/ui/icones";

/** Um slide na tela fixa de 1280 × 720: brilho, topo (data e posição), conteúdo, marca e progresso. */
function Slide({ children, indice, total, data, fade = false }: { children: ReactNode; indice: number; total: number; data: string; fade?: boolean }) {
  return (
    <div className="@container relative h-[720px] w-[1280px] overflow-hidden bg-[#0a0a0a] text-branco">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[30%] -right-[15%] h-[80%] w-[55%]"
        style={{ background: "radial-gradient(closest-side, rgb(0 219 88 / 0.16), transparent)" }}
      />
      {/* topo: data da reunião e posição */}
      <div className="dado absolute inset-x-[4%] top-[4%] flex justify-between text-[0.95cqw] tracking-[0.18em] text-branco/45 uppercase">
        <span>Reunião da diretoria · {data}</span>
        <span>
          slide {indice + 1} / {total}
        </span>
      </div>
      {/* conteúdo do slide */}
      <div key={indice} className={`absolute inset-x-[4%] top-[11%] bottom-[12%] ${fade ? "anima-fade" : ""}`}>
        {children}
      </div>
      {/* rodapé: marca */}
      <div className="absolute bottom-[4.5%] left-[4%] origin-bottom-left scale-[0.9]">
        <Lockup tamanho="pequeno" />
      </div>
      {/* barra de progresso */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-branco/8">
        <div className="h-full bg-verde transition-[width] duration-300" style={{ width: `${((indice + 1) / total) * 100}%` }} />
      </div>
    </div>
  );
}

export function Apresentacao({ slides, data }: { slides: ReactNode[]; data: string }) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const moldura = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(1);
  useEffect(() => {
    const el = moldura.current;
    if (!el) return;
    const medir = () => setEscala(el.clientWidth / 1280);
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const total = slides.length;
  const ir = useCallback((n: number) => setI(Math.max(0, Math.min(total - 1, n))), [total]);

  const telaCheia = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    function tecla(e: KeyboardEvent) {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        ir(i + 1);
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        ir(i - 1);
      } else if (e.key === "Home") ir(0);
      else if (e.key === "End") ir(total - 1);
      else if (e.key === "f" || e.key === "F") telaCheia();
      else if (e.key === "p" || e.key === "P") window.print();
      // em tela cheia, o Esc do navegador só sai da tela cheia; fora dela, sai da apresentação
      else if (e.key === "Escape" && !document.fullscreenElement) router.push("/projetos");
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [i, ir, total, telaCheia, router]);

  const secundario = "cursor-pointer rounded-full px-4 py-2 text-branco/55 transition-colors hover:text-branco";

  return (
    <>
      {/* na tela: um slide por vez, escalado */}
      <div className="so-tela fixed inset-0 flex flex-col items-center justify-center gap-3 bg-[#050505] px-4 py-3 text-branco">
        <div
          ref={moldura}
          className="relative aspect-video w-[min(100%,calc((100vh-5.5rem)*16/9))] overflow-hidden rounded-2xl border border-branco/8 bg-[#0a0a0a]"
        >
          <div className="absolute top-0 left-0 origin-top-left" style={{ transform: `scale(${escala})` }}>
            <Slide indice={i} total={total} data={data} fade>
              {slides[i]}
            </Slide>
          </div>
        </div>

        {/* controles */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          <button type="button" onClick={() => router.push("/projetos")} className={secundario}>
            Sair (Esc)
          </button>
          <button
            type="button"
            onClick={() => ir(i - 1)}
            disabled={i === 0}
            aria-label="Slide anterior"
            className="cursor-pointer rounded-full border border-branco/25 bg-branco/5 px-5 py-2 transition-colors hover:border-branco/50 disabled:cursor-default disabled:opacity-30"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => ir(i + 1)}
            disabled={i === total - 1}
            aria-label="Próximo slide"
            className="cursor-pointer rounded-full bg-verde px-6 py-2 font-semibold text-fundo transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-30"
          >
            →
          </button>
          <button type="button" onClick={telaCheia} className={secundario}>
            Tela cheia (F)
          </button>
          <button type="button" onClick={() => window.print()} className={`${secundario} inline-flex items-center gap-1.5`}>
            <IconeExportar className="h-4 w-4" />
            Exportar PDF (P)
          </button>
        </div>
      </div>

      {/* página 16:9 sem margem e fundo escuro, só enquanto a apresentação está aberta
          (vem depois da regra A4 geral, então vale ela; os PDFs de resumo e boletim continuam em A4) */}
      <style>{`@media print {
  @page { size: 1280px 720px; margin: 0; }
  html, body { background: #0a0a0a !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}`}</style>

      {/* na impressão: todos os slides, um por página (só aparece ao salvar em PDF) */}
      <div className="slides-impressao" aria-hidden="true">
        {slides.map((s, n) => (
          <div key={n} className="pagina-slide">
            <Slide indice={n} total={total} data={data}>
              {s}
            </Slide>
          </div>
        ))}
      </div>
    </>
  );
}

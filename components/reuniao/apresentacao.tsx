"use client";

// Modo Reunião: apresenta os slides (montados no servidor) em 16:9, com navegação pelo teclado
// (← → espaço, Esc sai, F tela cheia), botões em pílula, barra de progresso e fade entre slides.
// O slide é desenhado numa tela fixa de 1280 × 720 e escalado inteiro para o tamanho disponível,
// como num programa de apresentação: nada se desalinha em telas menores ou maiores.

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Lockup } from "@/components/layout/marca";

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
      // em tela cheia, o Esc do navegador só sai da tela cheia; fora dela, sai da apresentação
      else if (e.key === "Escape" && !document.fullscreenElement) router.push("/projetos");
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [i, ir, total, telaCheia, router]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-[#050505] px-4 py-3 text-branco">
      {/* slide 16:9, o maior que couber na tela */}
      <div
        ref={moldura}
        className="relative aspect-video w-[min(100%,calc((100vh-5.5rem)*16/9))] overflow-hidden rounded-2xl border border-branco/8 bg-[#0a0a0a]"
      >
        <div className="@container absolute top-0 left-0 h-[720px] w-[1280px] origin-top-left" style={{ transform: `scale(${escala})` }}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-[30%] -right-[15%] h-[80%] w-[55%]"
            style={{ background: "radial-gradient(closest-side, rgb(0 219 88 / 0.16), transparent)" }}
          />
          {/* topo: data da reunião e posição */}
          <div className="dado absolute inset-x-[4%] top-[4%] flex justify-between text-[0.95cqw] tracking-[0.18em] text-branco/45 uppercase">
            <span>Reunião da diretoria · {data}</span>
            <span>
              slide {i + 1} / {total}
            </span>
          </div>
          {/* conteúdo do slide (fade a cada troca) */}
          <div key={i} className="anima-fade absolute inset-x-[4%] top-[11%] bottom-[12%]">
            {slides[i]}
          </div>
          {/* rodapé: marca */}
          <div className="absolute bottom-[4.5%] left-[4%] origin-bottom-left scale-[0.9]">
            <Lockup tamanho="pequeno" />
          </div>
          {/* barra de progresso */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-branco/8">
            <div className="h-full bg-verde transition-[width] duration-300" style={{ width: `${((i + 1) / total) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* controles */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => router.push("/projetos")}
          className="cursor-pointer rounded-full px-4 py-2 text-branco/55 transition-colors hover:text-branco"
        >
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
        <button
          type="button"
          onClick={telaCheia}
          className="cursor-pointer rounded-full px-4 py-2 text-branco/55 transition-colors hover:text-branco"
        >
          Tela cheia (F)
        </button>
      </div>
    </div>
  );
}

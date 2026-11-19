"use client";

// Roda de membros: avatares em volta de um círculo que gira. Quem está no topo fica em foco
// e o centro mostra os detalhes dele. Gira arrastando, com a roda do mouse, com as setas
// (← →) ou clicando num avatar; Enter ou clicar no avatar em foco abre o perfil.
//
// Usada na lista de membros ("Roda do CITi") e no perfil ("Órbita de colaboração"), onde
// cada colega tem `raio` (mais perto = colaborou mais) e uma linha até o centro.

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { AvatarMembro } from "./avatar";

export type ItemRoda = {
  id: string;
  nome: string;
  github?: string;
  /** Distância do centro, de 0 (mais perto) a 1 (borda). Sem valor, todos na borda. */
  raio?: number;
  /** Força da linha até o centro (0 a 1). Sem valor, sem linha. */
  linha?: number;
  /** Mostra o avatar mais apagado (ex.: ex-membro na órbita). */
  apagado?: boolean;
};

const RAIO_MAX = 42; // % do lado da roda
const mod = (a: number, n: number) => ((a % n) + n) % n;

export function Roda<T extends ItemRoda>({
  itens,
  rotulo,
  centro,
  aoAbrir,
  raioMin = 27,
  dica = "Arraste, use a roda do mouse ou as setas. Clique num avatar para trazê-lo ao topo.",
}: {
  itens: T[];
  /** Nome da roda para leitores de tela. */
  rotulo: string;
  /** Conteúdo do centro para o item em foco. */
  centro: (item: T) => ReactNode;
  aoAbrir: (item: T) => void;
  /** Raio (% do lado) de quem tem `raio` 0, o mais perto do centro. */
  raioMin?: number;
  dica?: string;
}) {
  const n = itens.length;
  const passo = 360 / Math.max(n, 1);
  const [angulo, setAngulo] = useState(0);
  const [arrastando, setArrastando] = useState(false);
  const area = useRef<HTMLDivElement>(null);
  const arrasto = useRef<{ x: number; y: number; a0: number; base: number; moveu: boolean; id: number } | null>(null);
  const moveuAgora = useRef(false);

  const foco = mod(Math.round(-angulo / passo), Math.max(n, 1));
  const emFoco = itens[foco];

  const girar = (k: number) => setAngulo((a) => Math.round(a / passo) * passo - k * passo);
  const irPara = (i: number) => setAngulo((a) => a + (mod(-i * passo - a + 180, 360) - 180));

  // roda do mouse: um passo por vez (o listener precisa ser não-passivo para segurar a rolagem da página)
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    let ultimo = 0;
    const aoRolar = (e: WheelEvent) => {
      e.preventDefault();
      const agora = Date.now();
      if (agora - ultimo < 180) return;
      ultimo = agora;
      setAngulo((a) => Math.round(a / passo) * passo + (e.deltaY > 0 ? -passo : passo));
    };
    el.addEventListener("wheel", aoRolar, { passive: false });
    return () => el.removeEventListener("wheel", aoRolar);
  }, [passo]);

  const anguloDoPonteiro = (x: number, y: number) => {
    const r = area.current!.getBoundingClientRect();
    return (Math.atan2(y - (r.top + r.height / 2), x - (r.left + r.width / 2)) * 180) / Math.PI;
  };

  function aoApertar(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    arrasto.current = {
      x: e.clientX,
      y: e.clientY,
      a0: anguloDoPonteiro(e.clientX, e.clientY),
      base: angulo,
      moveu: false,
      id: e.pointerId,
    };
    moveuAgora.current = false;
  }
  function aoMover(e: PointerEvent<HTMLDivElement>) {
    const d = arrasto.current;
    if (!d || e.pointerId !== d.id) return;
    // o "soltar" se perdeu (ex.: soltou fora da janela): encerra o arraste em vez de seguir o mouse
    if (e.pointerType === "mouse" && e.buttons === 0) return aoSoltar();
    if (!d.moveu) {
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 5) return;
      d.moveu = true;
      moveuAgora.current = true;
      setArrastando(true);
      area.current?.setPointerCapture(d.id); // só captura depois de mover, para o clique no avatar continuar funcionando
    }
    let delta = anguloDoPonteiro(e.clientX, e.clientY) - d.a0;
    delta = mod(delta + 180, 360) - 180;
    d.a0 += delta;
    d.base += delta;
    setAngulo(d.base);
  }
  function aoSoltar() {
    const d = arrasto.current;
    arrasto.current = null;
    if (!d?.moveu) return;
    // o clique que vem logo depois de soltar não conta como clique no avatar
    setTimeout(() => (moveuAgora.current = false), 0);
    setArrastando(false);
    setAngulo((a) => Math.round(a / passo) * passo);
  }

  function aoTeclar(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") girar(1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") girar(-1);
    else if (e.key === "Enter" && emFoco) aoAbrir(emFoco);
    else return;
    e.preventDefault();
  }

  const transicao = arrastando ? "none" : "transform 550ms cubic-bezier(.22,1,.36,1), opacity 400ms";
  const temLinhas = itens.some((it) => it.linha !== undefined);
  const raioDe = (it: ItemRoda) => (it.raio === undefined ? RAIO_MAX : raioMin + (RAIO_MAX - raioMin) * it.raio);
  const posicao = (i: number, it: ItemRoda) => {
    const t = ((i * passo - 90) * Math.PI) / 180;
    return { x: 50 + raioDe(it) * Math.cos(t), y: 50 + raioDe(it) * Math.sin(t) };
  };

  return (
    <div className="space-y-3">
      <div
        ref={area}
        role="listbox"
        aria-label={rotulo}
        aria-activedescendant={emFoco ? `roda-${emFoco.id}` : undefined}
        tabIndex={0}
        onKeyDown={aoTeclar}
        onPointerDown={aoApertar}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onPointerCancel={aoSoltar}
        onLostPointerCapture={aoSoltar}
        onDragStart={(e) => e.preventDefault()}
        className={`relative mx-auto aspect-square w-full max-w-[520px] touch-none rounded-full outline-none select-none focus-visible:ring-2 focus-visible:ring-verde/50 ${
          arrastando ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {/* trilho */}
        <div aria-hidden="true" className="absolute inset-[8%] rounded-full border border-dashed border-branco/10" />

        {/* parte que gira: linhas e avatares */}
        <div className="absolute inset-0" style={{ transform: `rotate(${angulo}deg)`, transition: transicao }}>
          {temLinhas && (
            <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
              {itens.map((it, i) => {
                const p = posicao(i, it);
                const forca = it.linha ?? 0;
                return (
                  <line
                    key={it.id}
                    x1="50"
                    y1="50"
                    x2={p.x}
                    y2={p.y}
                    stroke="var(--color-verde)"
                    strokeOpacity={i === foco ? 0.85 : 0.12 + forca * 0.4}
                    strokeWidth={1 + forca * 3}
                    vectorEffect="non-scaling-stroke"
                    style={{ transition: "stroke-opacity 300ms" }}
                  />
                );
              })}
            </svg>
          )}
          {itens.map((it, i) => {
            const p = posicao(i, it);
            const distancia = Math.abs(mod(i * passo + angulo + 180, 360) - 180); // 0 = topo, 180 = embaixo
            const perto = 1 - distancia / 180;
            const naFrente = i === foco;
            const escala = naFrente ? 1.25 : temLinhas ? 0.9 : 0.72 + 0.23 * perto;
            const opacidade = naFrente ? 1 : (it.apagado ? 0.35 : 0.5) + 0.4 * perto;
            return (
              <button
                key={it.id}
                id={`roda-${it.id}`}
                type="button"
                role="option"
                aria-selected={naFrente}
                aria-label={it.nome}
                title={it.nome}
                tabIndex={-1}
                onClick={() => {
                  if (moveuAgora.current) return;
                  if (naFrente) aoAbrir(it);
                  else irPara(i);
                }}
                className={`absolute cursor-pointer rounded-full [&_img]:pointer-events-none ${naFrente ? "z-10" : ""}`}
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  transform: `translate(-50%, -50%) rotate(${-angulo}deg) scale(${escala})`,
                  opacity: opacidade,
                  transition: transicao,
                }}
              >
                <span
                  className={`block rounded-full ${
                    naFrente ? "shadow-[0_0_0_3px_var(--color-fundo),0_0_0_5px_var(--color-verde)]" : ""
                  } ${it.apagado ? "grayscale" : ""}`}
                >
                  <AvatarMembro nome={it.nome} github={it.github} tamanho="h-9 w-9 text-xs sm:h-11 sm:w-11 sm:text-sm" />
                </span>
              </button>
            );
          })}
        </div>

        {/* disco atrás do centro, para as linhas não passarem por baixo do texto */}
        {temLinhas && (
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-linha bg-white"
            style={{ width: `${2 * (raioMin - 7)}%`, height: `${2 * (raioMin - 7)}%` }}
          />
        )}

        {/* centro: detalhes de quem está em foco (não gira) */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
          style={{ width: `${temLinhas ? 2 * (raioMin - 9) : 54}%` }}
          aria-live="polite"
        >
          {emFoco && centro(emFoco)}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => girar(-1)}
          aria-label="Girar para trás"
          className="cursor-pointer rounded-full border border-branco/25 bg-branco/5 px-4 py-1.5 text-sm text-gray-700 transition-colors hover:border-verde/50 hover:text-verde"
        >
          ←
        </button>
        <span className="dado min-w-14 text-center text-xs text-gray-500">
          {n ? foco + 1 : 0} / {n}
        </span>
        <button
          type="button"
          onClick={() => girar(1)}
          aria-label="Girar para frente"
          className="cursor-pointer rounded-full border border-branco/25 bg-branco/5 px-4 py-1.5 text-sm text-gray-700 transition-colors hover:border-verde/50 hover:text-verde"
        >
          →
        </button>
      </div>
      <p className="text-center text-xs text-gray-500">{dica}</p>
    </div>
  );
}

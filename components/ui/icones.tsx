// Ícones em SVG (traço), no estilo dos ícones de interface comuns.

type Props = { className?: string; titulo?: string };

function Svg({ className = "h-5 w-5", titulo, children }: Props & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={titulo ? "img" : undefined}
      aria-hidden={titulo ? undefined : true}
      aria-label={titulo}
    >
      {children}
    </svg>
  );
}

/** Entrar (porta com seta). */
export function IconeEntrar(p: Props) {
  return (
    <Svg {...p}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </Svg>
  );
}

export function IconeSair(p: Props) {
  return (
    <Svg {...p}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </Svg>
  );
}

export function IconeUsuario(p: Props) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Svg>
  );
}

export function IconeProgresso(p: Props) {
  return (
    <Svg {...p}>
      <path d="M3 3v18h18" />
      <path d="M7 15l4-4 3 3 6-6" />
    </Svg>
  );
}

export function IconeConhecimento(p: Props) {
  return (
    <Svg {...p}>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="12" cy="18" r="2.5" />
      <path d="M7.8 7.8l3 7.6M16.2 7.8l-3 7.6M8.5 6h7" />
    </Svg>
  );
}

export function IconeLegado(p: Props) {
  return (
    <Svg {...p}>
      <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" />
      <path d="M8 3v18" />
      <path d="M12 8h3M12 12h3" />
    </Svg>
  );
}

export function IconeRepositorio(p: Props) {
  return (
    <Svg {...p}>
      <path d="M6 3v12" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="6" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </Svg>
  );
}

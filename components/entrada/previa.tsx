// Prévia do painel na página de entrada (pública). Projeto, etapa e pessoas aparecem ocultos,
// como saldo de banco: esses dados ficam protegidos pelo login. Só formato e números vêm para a página,
// nenhum nome real é enviado ao navegador.

export type DadosPrevia = {
  status: string;
  progresso: number;
  prazo: string;
  pessoas: { ic: number; cor: string }[];
};

function Oculto({ tamanho, className = "" }: { tamanho: number; className?: string }) {
  return (
    <span aria-label="informação protegida" className={`dado tracking-[0.2em] text-gray-500 ${className}`}>
      {"•".repeat(tamanho)}
    </span>
  );
}

export function PreviaPainel({ dados }: { dados: DadosPrevia }) {
  return (
    <div className="anima-surgir rounded-2xl border border-gray-300 bg-white/90 p-5 shadow-2xl shadow-black/50 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Oculto tamanho={12} className="block text-base" />
          <Oculto tamanho={18} className="block text-xs" />
        </div>
        <span className="rounded-full border border-gray-400 px-2.5 py-0.5 text-xs text-gray-700">{dados.status}</span>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
          <div className="anima-barra h-full rounded-full bg-verde" style={{ width: `${dados.progresso}%` }} />
        </div>
        <span className="dado text-sm font-semibold">{Math.round(dados.progresso)}%</span>
      </div>
      <p className="dado mt-1 text-xs text-gray-500">{dados.prazo}</p>
      <div className="mt-5 rounded-xl border border-gray-300 bg-gray-50 p-4">
        <p className="dado text-[11px] uppercase tracking-[0.14em] text-gray-500">Quem fez esta etapa</p>
        <ul className="mt-3 space-y-2">
          {dados.pessoas.map((p, i) => (
            <li key={i} className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-2 text-sm">
              <Oculto tamanho={8} />
              <span className="h-2 overflow-hidden rounded-full bg-gray-200">
                <span className="anima-barra block h-full rounded-full" style={{ width: `${Math.max(p.ic, 2)}%`, backgroundColor: p.cor }} />
              </span>
              <span className="dado text-right text-gray-700">{Math.round(p.ic)}%</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-4 text-center text-xs text-gray-500">Entre para ver os projetos e as pessoas.</p>
    </div>
  );
}

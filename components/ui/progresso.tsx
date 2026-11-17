// Barra de progresso simples (0 a 100).

export function BarraProgresso({ valor, rotulo, compacta = false }: { valor: number; rotulo?: string; compacta?: boolean }) {
  const v = Math.max(0, Math.min(100, Math.round(valor)));
  return (
    <div className="space-y-1">
      {rotulo && (
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-gray-600">{rotulo}</span>
          <span className="font-semibold tabular-nums">{v}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={rotulo ?? "Progresso"}
        className={`w-full bg-gray-200 ${compacta ? "h-1.5" : "h-3"}`}
      >
        <div className="h-full bg-gray-700" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

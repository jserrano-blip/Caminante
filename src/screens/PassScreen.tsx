import { useApp } from "../context/AppContext";
import { ChevronLeft } from "../components/Icons";

const movs = [
  { fecha: "ABR 15", concepto: "Recarga · Mercado Pago", monto: 200 },
  { fecha: "ABR 12", concepto: "Boleto Toluca → Santa Fe", monto: -185 },
  { fecha: "ABR 03", concepto: "Recarga · OXXO", monto: 500 },
  { fecha: "MAR 28", concepto: "Boleto Toluca → AIFA", monto: -285 },
  { fecha: "MAR 21", concepto: "Recarga · Visa •••• 4821", monto: 300 },
];

export function PassScreen() {
  const { passBalance, go } = useApp();

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 px-5 pt-3">
        <button
          onClick={() => go("inicio")}
          className="-ml-1 grid h-8 w-8 place-items-center rounded-full text-ink"
          aria-label="Atrás"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
            Tarjeta digital
          </div>
          <h1 className="font-serif text-[22px] leading-tight text-ink">
            Caminante Pass
          </h1>
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-28 pt-4">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-ink to-wine-800 p-5 text-cream-50 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cream-50/60">
                Saldo disponible
              </div>
              <div className="mt-1 font-serif text-[36px] leading-none">
                ${passBalance.toFixed(2)}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-cream-50/50">
                MXN · sin caducidad
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-50/60">
                Titular
              </div>
              <div className="mt-1 text-[12px] font-semibold">
                Mariana López
              </div>
              <div className="text-[10px] text-cream-50/60">CAM-2381-LP</div>
            </div>
          </div>
          <div className="mt-5 text-[10px] font-mono tracking-[0.18em] text-cream-50/70">
            •••• •••• •••• 2381
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => go("recarga")}
            className="rounded-xl bg-wine py-3 text-[13px] font-semibold text-cream-50 hover:bg-wine-700"
          >
            Recargar saldo
          </button>
          <button
            onClick={() => go("pago")}
            className="rounded-xl border border-ink/15 bg-white py-3 text-[13px] font-semibold text-ink shadow-card"
          >
            Pagar con Pass
          </button>
        </div>

        <div className="mt-3 rounded-xl border border-dashed border-ink/15 bg-cream-50 p-3 text-[11px] text-ink-muted">
          También puedes recargar en efectivo en taquilla de las terminales.
        </div>

        <section className="mt-6">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            Movimientos recientes
          </div>
          <div className="overflow-hidden rounded-2xl bg-white shadow-card">
            {movs.map((m, i) => (
              <div
                key={m.fecha + m.concepto}
                className={`flex items-center justify-between px-4 py-3 ${
                  i > 0 ? "border-t border-ink/5" : ""
                }`}
              >
                <div>
                  <div className="text-[12px] font-semibold text-ink">
                    {m.concepto}
                  </div>
                  <div className="text-[10px] text-ink-muted">{m.fecha}</div>
                </div>
                <div
                  className={`text-[13px] font-semibold ${
                    m.monto >= 0 ? "text-emerald-700" : "text-ink"
                  }`}
                >
                  {m.monto >= 0 ? "+" : ""}
                  ${Math.abs(m.monto).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

import { useApp } from "../context/AppContext";
import { ArrowRight } from "../components/Icons";

export function ViajesScreen() {
  const { bookings, go, resetFlow } = useApp();

  return (
    <div className="flex h-full flex-col">
      <header className="px-6 pt-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
          Mis viajes
        </div>
        <h1 className="font-serif text-[28px] leading-tight text-ink">
          Historial
        </h1>
      </header>

      <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-6 pb-28 pt-4">
        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/20 bg-white/60 p-6 text-center text-[12px] text-ink-muted">
            Aún no tienes viajes reservados.
            <button
              onClick={resetFlow}
              className="mt-2 block w-full rounded-xl bg-wine px-4 py-2.5 text-[13px] font-semibold text-cream-50"
            >
              Buscar corridas
            </button>
          </div>
        ) : (
          bookings.map((b, i) => (
            <article
              key={b.confirmation + i}
              className="rounded-2xl bg-white p-4 shadow-card"
            >
              <div className="flex items-baseline justify-between">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
                  {b.date} · {b.trip.departure}
                </div>
                <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Confirmado
                </span>
              </div>
              <div className="mt-1 font-serif text-[20px] text-ink">
                {b.trip.origin.short}{" "}
                <span className="text-wine">→</span> {b.trip.destination.short}
              </div>
              <div className="mt-1 text-[11px] text-ink-muted">
                Asiento {b.seatId} · #{b.confirmation} · {b.trip.busType}
              </div>
              <button
                onClick={() => go("pase")}
                className="mt-3 flex items-center gap-1 text-[12px] font-semibold text-wine"
              >
                Ver pase <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

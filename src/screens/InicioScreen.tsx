import { useApp } from "../context/AppContext";
import { popularRoutes, cities, dayLabels } from "../data";
import {
  ArrowRight,
  BellIcon,
  DestDiamond,
  OriginDot,
  SwapIcon,
} from "../components/Icons";

export function InicioScreen() {
  const { search, setSearch, swapCities, go, bookings, showToast } = useApp();
  const upcoming = bookings[0];

  const selectedDay = dayLabels.find((d) => d.key === search.dayKey) ?? dayLabels[0];

  return (
    <div className="flex h-full flex-col">
      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-28">
        <div className="flex items-start justify-between pt-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
              Buenos días
            </div>
            <h1 className="font-serif text-[28px] leading-[1.05] text-ink">
              Hola,
              <br />
              Mariana
            </h1>
          </div>
          <button
            onClick={() => showToast("No tienes notificaciones nuevas")}
            className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-white text-ink"
            aria-label="Notificaciones"
          >
            <BellIcon className="h-5 w-5" />
          </button>
        </div>

        <section className="mt-5 rounded-2xl bg-white p-4 shadow-card">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            ¿A dónde vas?
          </div>

          <div className="mt-3 flex items-start gap-3">
            <div className="flex flex-col items-center pt-2">
              <OriginDot className="h-4 w-4 text-ink" />
              <div className="my-1 w-px flex-1 border-l border-dashed border-ink/30" />
              <DestDiamond className="h-3.5 w-3.5 text-wine" />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
                  Origen
                </div>
                <select
                  value={search.origin.id}
                  onChange={(e) => {
                    const c = cities.find((x) => x.id === e.target.value);
                    if (c) setSearch({ origin: c });
                  }}
                  className="w-full bg-transparent pt-0.5 text-[15px] font-semibold text-ink focus:outline-none"
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.terminal}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
                  Destino
                </div>
                <select
                  value={search.destination.id}
                  onChange={(e) => {
                    const c = cities.find((x) => x.id === e.target.value);
                    if (c) setSearch({ destination: c });
                  }}
                  className="w-full bg-transparent pt-0.5 text-[15px] font-semibold text-ink focus:outline-none"
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={swapCities}
              className="mt-6 grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-cream-50 text-ink"
              aria-label="Intercambiar"
            >
              <SwapIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <label className="rounded-xl border border-ink/10 bg-cream-50 px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                Fecha
              </div>
              <select
                value={search.dayKey}
                onChange={(e) => setSearch({ dayKey: e.target.value })}
                className="w-full bg-transparent text-[13px] font-semibold text-ink focus:outline-none"
              >
                {dayLabels.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.label === "HOY" || d.label === "MAÑANA"
                      ? d.label.charAt(0) + d.label.slice(1).toLowerCase()
                      : `${d.label.charAt(0)}${d.label.slice(1).toLowerCase()}`}{" "}
                    · {d.num} {d.month}
                  </option>
                ))}
              </select>
            </label>
            <label className="rounded-xl border border-ink/10 bg-cream-50 px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                Pasajeros
              </div>
              <select
                value={search.passengers}
                onChange={(e) =>
                  setSearch({ passengers: Number(e.target.value) })
                }
                className="w-full bg-transparent text-[13px] font-semibold text-ink focus:outline-none"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} adulto{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            onClick={() => go("horarios")}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-wine py-3 text-[14px] font-semibold text-cream-50 transition hover:bg-wine-700 active:scale-[0.99]"
          >
            Buscar corridas <ArrowRight className="h-4 w-4" />
          </button>
          <div className="mt-2 text-center text-[11px] text-ink-muted">
            {selectedDay.label === "HOY" ? "Hoy" : selectedDay.label.charAt(0) + selectedDay.label.slice(1).toLowerCase()}{" "}
            · {selectedDay.num} {selectedDay.month} · {search.passengers} pasajero
            {search.passengers > 1 ? "s" : ""}
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-baseline justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
              Próximo viaje
            </div>
            <button
              onClick={() => go("viajes")}
              className="text-[11px] font-semibold text-wine"
            >
              Ver todos
            </button>
          </div>

          {upcoming ? (
            <button
              onClick={() => go("pase")}
              className="mt-2 flex w-full items-stretch justify-between gap-3 rounded-2xl bg-ink p-4 text-left text-cream-50"
            >
              <div className="flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-50/60">
                  {upcoming.date} · {upcoming.trip.departure}
                </div>
                <div className="mt-1 font-serif text-xl leading-tight">
                  {upcoming.trip.origin.name}
                  <span className="mx-1.5 text-wine">→</span>
                  {upcoming.trip.destination.short}
                </div>
                <div className="mt-1 text-[11px] text-cream-50/70">
                  Asiento {upcoming.seatId} · Confirmación #{upcoming.confirmation}
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-cream-50/60">
                      Salida
                    </div>
                    <div className="text-[12px] font-semibold">
                      {upcoming.trip.origin.terminal}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-cream-50/60">
                      Llegada est.
                    </div>
                    <div className="text-[12px] font-semibold">
                      {upcoming.trip.arrival}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid h-[72px] w-[72px] shrink-0 place-items-center self-center rounded-lg bg-white p-1.5">
                <MiniQr />
              </div>
            </button>
          ) : (
            <div className="mt-2 rounded-2xl border border-dashed border-ink/20 bg-white/60 p-6 text-center text-[12px] text-ink-muted">
              Aún no tienes viajes reservados. Busca corridas arriba para
              empezar.
            </div>
          )}
        </section>

        <section className="mt-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            Rutas populares
          </div>
          <div className="mt-2 flex gap-3 overflow-x-auto no-scrollbar">
            {popularRoutes.map((r) => (
              <button
                key={r.to}
                onClick={() => {
                  showToast(`Mostrando corridas ${r.from} → ${r.to}`);
                  const dest = cities.find((c) => c.short === r.to.replace(/^.*?(\w+)$/, "$1")) ?? cities[1];
                  setSearch({ destination: dest });
                  go("horarios");
                }}
                className="flex w-[120px] shrink-0 flex-col gap-3 rounded-2xl bg-white p-3 text-left shadow-card"
              >
                <div className="grid h-8 w-8 place-items-center rounded-full bg-wine/10 text-wine">
                  <DestDiamond className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-ink">
                    {r.from}
                  </div>
                  <div className="text-[13px] font-semibold text-ink">
                    → {r.to}
                  </div>
                  <div className="text-[10px] text-ink-muted">{r.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function MiniQr() {
  return (
    <svg viewBox="0 0 21 21" className="h-full w-full text-ink">
      {Array.from({ length: 21 * 21 }).map((_, i) => {
        const x = i % 21;
        const y = Math.floor(i / 21);
        const hash = (x * 31 + y * 17 + x * y) % 7;
        const on = hash < 3 || (x < 3 && y < 3) || (x > 17 && y < 3) || (x < 3 && y > 17);
        if (!on) return null;
        return (
          <rect key={i} x={x} y={y} width="1" height="1" fill="currentColor" />
        );
      })}
    </svg>
  );
}

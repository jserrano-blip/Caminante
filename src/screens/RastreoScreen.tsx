import { useApp } from "../context/AppContext";
import { liveStops } from "../data";

export function RastreoScreen() {
  const { bookings, go } = useApp();
  const active = bookings[0];

  return (
    <div className="flex h-full flex-col">
      <header className="px-6 pt-2">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
            En camino
          </span>
        </div>
        <h1 className="mt-1 font-serif text-[26px] leading-tight text-ink">
          Llegas a las {active?.trip.arrival ?? "07:15"}
        </h1>
        <div className="mt-1 text-[11px] text-ink-muted">
          Unidad 142 · Placas MEX CAM 472
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-28 pt-5">
        <ol className="relative">
          {liveStops.map((stop, idx) => {
            const isLast = idx === liveStops.length - 1;
            return (
              <li key={stop.id} className="relative flex gap-4">
                <div className="flex w-4 shrink-0 flex-col items-center pt-1">
                  <StopDot status={stop.status} />
                  {!isLast && (
                    <div
                      className={`w-px flex-1 ${
                        stop.status === "done" ? "bg-wine/50" : "bg-ink/15"
                      }`}
                      style={{ minHeight: stop.note ? 56 : 40 }}
                    />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div
                        className={`text-[14px] font-semibold ${
                          stop.status === "future"
                            ? "text-ink-muted"
                            : "text-ink"
                        }`}
                      >
                        {stop.name}
                      </div>
                      {stop.status === "current" && stop.note && (
                        <div className="mt-1 inline-block rounded-sm bg-wine px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-cream-50">
                          {stop.note}
                        </div>
                      )}
                      {stop.status === "next" && stop.note && (
                        <div className="mt-0.5 text-[11px] text-ink-muted">
                          {stop.note}
                        </div>
                      )}
                    </div>
                    <div
                      className={`text-[12px] font-semibold ${
                        stop.status === "future"
                          ? "text-ink-muted"
                          : "text-ink"
                      }`}
                    >
                      {stop.time}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-2 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-wine/15 text-[16px]">
            🚌
          </div>
          <div className="flex-1">
            <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
              Unidad asignada
            </div>
            <div className="text-[13px] font-semibold text-ink">
              Mercedes Sprinter · Placas MEX CAM 472
            </div>
            <div className="text-[10px] text-ink-muted">
              Wi-Fi a bordo · A/C · Cinturones de seguridad
            </div>
          </div>
        </div>

        {!active && (
          <button
            onClick={() => go("inicio")}
            className="mt-4 w-full rounded-xl border border-dashed border-ink/20 p-4 text-[12px] text-ink-muted"
          >
            Demo: reserva un viaje para enlazar el rastreo con tus datos reales
          </button>
        )}
      </div>
    </div>
  );
}

function StopDot({
  status,
}: {
  status: "done" | "current" | "next" | "future";
}) {
  if (status === "current")
    return (
      <span className="relative grid h-4 w-4 place-items-center">
        <span className="absolute h-4 w-4 animate-ping rounded-full bg-wine/40" />
        <span className="relative h-3 w-3 rounded-full bg-wine ring-2 ring-cream-100" />
      </span>
    );
  if (status === "done")
    return <span className="h-3 w-3 rounded-full bg-wine" />;
  if (status === "next")
    return (
      <span className="h-3 w-3 rounded-full border-2 border-wine bg-cream-50" />
    );
  return <span className="h-3 w-3 rounded-full border-2 border-ink/25 bg-cream-50" />;
}


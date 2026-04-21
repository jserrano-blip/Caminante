import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { historyTrips } from "../data";
import type { HistoryTrip } from "../types";
import { ArrowRight } from "../components/Icons";

type Filter = "todos" | "facturar" | "cancelados";

const filters: { key: Filter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "facturar", label: "Por facturar" },
  { key: "cancelados", label: "Cancelados" },
];

export function ViajesScreen() {
  const { bookings, go, showToast } = useApp();
  const [filter, setFilter] = useState<Filter>("todos");
  const [invoicedLocal, setInvoicedLocal] = useState<Record<string, boolean>>({});

  const bookingHistory = useMemo<HistoryTrip[]>(
    () =>
      bookings.map((b, i) => ({
        id: `b-${i}`,
        monthShort: "ABR",
        day: "19",
        route: `${b.trip.origin.short} → ${b.trip.destination.short}`,
        confirmation: b.confirmation,
        price: b.trip.price,
        status: "confirmado",
      })),
    [bookings],
  );

  const allTrips = useMemo(
    () => [...bookingHistory, ...historyTrips],
    [bookingHistory],
  );

  const filtered = useMemo(() => {
    if (filter === "cancelados")
      return allTrips.filter((t) => t.status === "cancelado");
    if (filter === "facturar")
      return allTrips.filter(
        (t) =>
          t.status === "completado" &&
          !t.invoiced &&
          !invoicedLocal[t.id],
      );
    return allTrips;
  }, [allTrips, filter, invoicedLocal]);

  return (
    <div className="flex h-full flex-col">
      <header className="px-6 pt-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
          Historial
        </div>
        <h1 className="font-serif text-[28px] leading-tight text-ink">
          Mis viajes
        </h1>

        <div className="mt-4 flex gap-2">
          {filters.map((f) => {
            const active = f.key === filter;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition ${
                  active
                    ? "border-ink bg-ink text-cream-50"
                    : "border-ink/15 bg-transparent text-ink"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto px-6 pb-28 pt-3">
        {filtered.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-ink/20 p-6 text-center text-[12px] text-ink-muted">
            Sin viajes en este filtro.
          </div>
        )}

        {filtered.map((t) => {
          const invoiced = t.invoiced || invoicedLocal[t.id];
          return (
            <article
              key={t.id}
              className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-card"
            >
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-cream-100 text-center">
                <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                  {t.monthShort}
                </div>
                <div className="font-serif text-[18px] leading-none text-ink">
                  {t.day}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-ink">
                  {t.route}
                </div>
                <div className="mt-0.5 truncate text-[11px] text-ink-muted">
                  {t.confirmation} ·{" "}
                  {t.status === "confirmado" ? (
                    <span className="font-semibold text-emerald-700">
                      Confirmado
                    </span>
                  ) : t.status === "cancelado" ? (
                    <span className="font-semibold text-wine">Cancelado</span>
                  ) : (
                    "Completado"
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[13px] font-semibold text-ink">
                  ${t.price}
                </div>
                {t.status === "completado" && !invoiced && (
                  <button
                    onClick={() => {
                      setInvoicedLocal((s) => ({ ...s, [t.id]: true }));
                      showToast(`Factura enviada · ${t.confirmation}`);
                    }}
                    className="text-[10px] font-semibold uppercase tracking-[0.18em] text-wine"
                  >
                    Facturar
                  </button>
                )}
                {t.status === "completado" && invoiced && (
                  <span className="text-[10px] text-ink-muted">Facturado</span>
                )}
                {t.status === "confirmado" && (
                  <button
                    onClick={() => go("rastreo")}
                    className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-wine"
                  >
                    En vivo <ArrowRight className="h-3 w-3" />
                  </button>
                )}
                {t.status === "cancelado" && (
                  <span className="text-[10px] text-ink-muted">—</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

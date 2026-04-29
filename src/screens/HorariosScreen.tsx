import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { busTrips, dayLabels, shuttleTrips } from "../data";
import { ArrowRight, ChevronLeft } from "../components/Icons";

export function HorariosScreen() {
  const { search, setSearch, selectTrip, go, transportMode, showToast } =
    useApp();
  const [order, setOrder] = useState<"salida" | "precio" | "duracion">(
    "salida",
  );

  const sourceTrips = transportMode === "shuttle" ? shuttleTrips : busTrips;

  const filtered = useMemo(() => {
    const list = sourceTrips.filter(
      (t) =>
        t.origin.id === search.origin.id &&
        t.destination.id === search.destination.id,
    );
    if (order === "precio") return [...list].sort((a, b) => a.price - b.price);
    if (order === "duracion")
      return [...list].sort((a, b) => a.durationMin - b.durationMin);
    return list;
  }, [order, search.origin.id, search.destination.id, sourceTrips]);

  // Estado especial: shuttle sin asientos en una corrida específica → aviso
  const shuttleSoldOut =
    transportMode === "shuttle" && filtered.every((t) => t.seatsLeft === 0) && filtered.length > 0;

  const selectedDay = dayLabels.find((d) => d.key === search.dayKey) ?? dayLabels[0];

  return (
    <div className="flex h-full flex-col">
      <header className="px-5 pt-2 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => go("inicio")}
            className="grid h-8 w-8 place-items-center rounded-full text-ink"
            aria-label="Atrás"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center">
            <div className="text-[9px] font-semibold uppercase tracking-[0.28em] text-ink-muted">
              Viaje sencillo
            </div>
            <div className="font-serif text-[17px] text-ink">
              {search.origin.name}{" "}
              <span className="text-wine">→</span> {search.destination.short}
            </div>
          </div>
          <button className="text-[12px] font-semibold text-wine">Editar</button>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2">
          {dayLabels.slice(0, 5).map((d) => {
            const active = d.key === search.dayKey;
            return (
              <button
                key={d.key}
                onClick={() => setSearch({ dayKey: d.key })}
                className={`flex flex-col items-center rounded-xl px-2 py-2 transition ${
                  active
                    ? "bg-ink text-cream-50"
                    : "bg-white text-ink shadow-card"
                }`}
              >
                <span
                  className={`text-[9px] font-semibold uppercase tracking-[0.18em] ${
                    active ? "text-cream-50/70" : "text-ink-muted"
                  }`}
                >
                  {d.label}
                </span>
                <span className="mt-1 text-[17px] font-semibold leading-none">
                  {d.num}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex items-center justify-between px-5 pb-2 text-[11px] text-ink-muted">
        <span>
          {filtered.length} corridas ·{" "}
          {selectedDay.label === "HOY"
            ? "hoy"
            : selectedDay.label === "MAÑANA"
              ? "mañana"
              : selectedDay.label.toLowerCase()}
        </span>
        <select
          value={order}
          onChange={(e) => setOrder(e.target.value as typeof order)}
          className="bg-transparent text-[11px] font-semibold text-ink focus:outline-none"
        >
          <option value="salida">Orden: Salida</option>
          <option value="precio">Orden: Precio</option>
          <option value="duracion">Orden: Duración</option>
        </select>
      </div>

      <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-5 pb-28">
        {transportMode === "shuttle" && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-[11px] text-amber-900">
            <span className="font-semibold">Servicio Shuttle ·</span> Sprinter
            de 19 pasajeros. Solo aplican rutas AIT ↔ Observatorio y AIT ↔
            Cuautitlán Izcalli.
          </div>
        )}
        {shuttleSoldOut && (
          <div className="rounded-xl border border-wine/30 bg-wine/5 p-3 text-[11px] text-wine-700">
            <span className="font-semibold">Sin asientos disponibles</span> en
            esta corrida shuttle. Considera{" "}
            <button
              onClick={() => {
                showToast("Cambiando a Camión");
                setSearch({});
                go("inicio");
              }}
              className="underline font-semibold"
            >
              Viaje en Camión
            </button>{" "}
            como alternativa.
          </div>
        )}
        {filtered.map((t) => (
          <article
            key={t.id}
            className="relative overflow-hidden rounded-2xl bg-white shadow-card"
          >
            {t.recommended && (
              <div className="absolute -right-0 top-0 rounded-bl-lg bg-wine px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-cream-50">
                Recomendado
              </div>
            )}
            <div className="flex items-start gap-4 p-4">
              <div className="min-w-[78px]">
                <div className="font-serif text-[28px] leading-none text-ink">
                  {t.departure}
                </div>
                <div className="mt-1 text-[10px] text-ink-muted">
                  {t.origin.terminal}
                </div>
              </div>
              <div className="flex-1 pt-1 text-[11px] text-ink-muted">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-ink">
                    {t.stops === 0 ? "Directo" : `${t.stops} parada`}
                  </span>
                  <span>·</span>
                  <span>
                    {Math.floor(t.durationMin / 60)}h{" "}
                    {t.durationMin % 60 > 0 ? `${t.durationMin % 60}m` : ""}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <span>{t.busType}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-px flex-1 border-t border-dashed border-ink/25" />
                  <span className="text-wine">→</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-serif text-[20px] text-ink">
                  ${t.price}
                </div>
                <div className="text-[10px] text-ink-muted">
                  MXN · {t.seatsLeft} asientos
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-ink/5 px-4 py-2.5 text-[11px]">
              <span className="text-ink-muted">
                {t.departure} – {t.arrival}
              </span>
              <button
                onClick={() => {
                  if (t.seatsLeft === 0) {
                    showToast("Sin asientos · prueba otra corrida");
                    return;
                  }
                  selectTrip(t);
                  go("asiento");
                }}
                disabled={t.seatsLeft === 0}
                className={`flex items-center gap-1 font-semibold ${
                  t.seatsLeft === 0
                    ? "text-ink-muted"
                    : "text-wine"
                }`}
              >
                {t.seatsLeft === 0 ? "Lleno" : "Seleccionar asiento"}{" "}
                {t.seatsLeft > 0 && <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-ink/20 p-6 text-center text-[12px] text-ink-muted">
            No hay corridas para esta ruta. Prueba otro destino o fecha.
          </div>
        )}
      </div>
    </div>
  );
}

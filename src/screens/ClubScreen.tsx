import { useApp } from "../context/AppContext";

const tiers = [
  { key: "bronce", label: "Bronce", desc: "0 viajes", active: false },
  { key: "plata", label: "Plata", desc: "10+ viajes · 10% de descuento", active: true },
  { key: "oro", label: "Oro", desc: "25+ viajes · 15% + equipaje extra", active: false },
  { key: "platino", label: "Platino", desc: "60+ viajes · lounge y prioridad", active: false },
];

const benefits = [
  "10% de descuento en todas las corridas",
  "Cancelación flexible hasta 2 h antes",
  "Acumula 1.5x puntos por viaje",
  "Acceso anticipado a rutas nuevas",
];

export function ClubScreen() {
  const { showToast } = useApp();

  return (
    <div className="flex h-full flex-col bg-cream-50">
      <header className="px-6 pt-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
          Lealtad
        </div>
        <h1 className="font-serif text-[28px] leading-tight text-ink">
          Club Caminante
        </h1>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-28 pt-4">
        <div className="overflow-hidden rounded-2xl bg-ink p-5 text-cream-50">
          <div className="flex items-baseline justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-50/60">
              Nivel actual
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-50/60">
              2430 pts
            </div>
          </div>
          <div className="mt-1 font-serif text-[28px] text-cream-50">
            Plata
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-cream-50/15">
            <div className="h-full w-[55%] rounded-full bg-wine" />
          </div>
          <div className="mt-2 text-[11px] text-cream-50/70">
            1570 pts para llegar a <span className="font-semibold">Oro</span>
          </div>
        </div>

        <section className="mt-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            Niveles
          </div>
          <div className="mt-2 space-y-2">
            {tiers.map((t) => (
              <div
                key={t.key}
                className={`flex items-center justify-between rounded-xl border p-3 ${
                  t.active
                    ? "border-wine bg-white"
                    : "border-ink/10 bg-white/60"
                }`}
              >
                <div>
                  <div className="text-[13px] font-semibold text-ink">
                    {t.label}
                  </div>
                  <div className="text-[11px] text-ink-muted">{t.desc}</div>
                </div>
                {t.active && (
                  <span className="rounded-full bg-wine/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-wine">
                    Actual
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            Beneficios
          </div>
          <ul className="mt-2 space-y-2 rounded-2xl bg-white p-4 text-[13px] text-ink">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-wine" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>

        <button
          onClick={() => showToast("Redimir próximamente")}
          className="mt-5 w-full rounded-xl border border-wine py-3 text-[13px] font-semibold text-wine"
        >
          Redimir puntos
        </button>
      </div>
    </div>
  );
}

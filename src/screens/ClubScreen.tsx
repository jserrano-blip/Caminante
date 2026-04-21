import { useApp } from "../context/AppContext";
import { clubBenefits, clubRewards } from "../data";
import { CheckIcon } from "../components/Icons";

const MEMBER_POINTS = 1284;
const TRIPS_CURRENT = 34;
const TRIPS_FOR_NEXT_TIER = 58;

export function ClubScreen() {
  const { showToast } = useApp();
  const tripsLeft = TRIPS_FOR_NEXT_TIER - TRIPS_CURRENT;
  const progress = (TRIPS_CURRENT / TRIPS_FOR_NEXT_TIER) * 100;

  return (
    <div className="flex h-full flex-col">
      <header className="px-6 pt-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
          Club Caminante
        </div>
        <h1 className="font-serif text-[28px] leading-tight text-ink">
          Tu membresía
        </h1>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-28 pt-4">
        <div className="relative overflow-hidden rounded-2xl bg-ink p-5 text-cream-50">
          <div className="flex items-start justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cream-50/25 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-cream-50/90">
              <span className="h-1.5 w-1.5 rounded-full bg-cream-50" />
              Plata
            </span>
            <div className="text-right">
              <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-cream-50/60">
                Puntos
              </div>
              <div className="font-serif text-[22px] text-[#D9A441]">
                {MEMBER_POINTS.toLocaleString("es-MX")}
              </div>
            </div>
          </div>

          <div className="mt-3 font-serif text-[34px] leading-none">Plata</div>
          <div className="mt-1 text-[11px] text-cream-50/70">
            Mariana López · Desde 2023
          </div>

          <div className="mt-5">
            <div className="flex items-end justify-between text-[11px]">
              <div className="text-cream-50/80">
                Faltan{" "}
                <span className="font-semibold text-cream-50">
                  {tripsLeft} viajes
                </span>{" "}
                para Oro
              </div>
              <div className="text-cream-50/60">
                {TRIPS_CURRENT} / {TRIPS_FOR_NEXT_TIER}
              </div>
            </div>
            <div className="relative mt-2 h-2 w-full rounded-full bg-cream-50/15">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[#D9A441]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.24em] text-cream-50/50">
              <span>Plata</span>
              <span>Oro</span>
            </div>
          </div>
        </div>

        <section className="mt-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            Tus beneficios activos
          </div>
          <div className="mt-2 divide-y divide-ink/5 overflow-hidden rounded-2xl bg-white shadow-card">
            {clubBenefits.map((b) => (
              <div key={b.title} className="flex items-start gap-3 p-3.5">
                <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-wine/10 text-wine">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <div>
                  <div className="text-[13px] font-semibold text-ink">
                    {b.title}
                  </div>
                  <div className="text-[11px] text-ink-muted">{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-baseline justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
              Canjea puntos
            </div>
            <button
              onClick={() => showToast("Catálogo de recompensas próximamente")}
              className="text-[11px] font-semibold text-wine"
            >
              Ver todo
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            {clubRewards.slice(0, 4).map((r) => {
              const costNum = parseInt(r.cost.replace(/[^\d]/g, ""));
              const canRedeem = MEMBER_POINTS >= costNum;
              return (
                <button
                  key={r.title}
                  onClick={() =>
                    canRedeem
                      ? showToast(`Canjeaste: ${r.title}`)
                      : showToast("Puntos insuficientes")
                  }
                  className={`rounded-xl bg-white p-3 text-left shadow-card transition ${
                    canRedeem ? "" : "opacity-60"
                  }`}
                >
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-wine">
                    {r.cost}
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-ink">
                    {r.title}
                  </div>
                  <div className="text-[11px] text-ink-muted">{r.sub}</div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

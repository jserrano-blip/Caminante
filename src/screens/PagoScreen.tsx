import { useApp } from "../context/AppContext";
import { paymentMethods } from "../data";
import { ArrowRight, ChevronLeft, PlusIcon } from "../components/Icons";

const DISCOUNT_RATE = 0.1;

export function PagoScreen() {
  const {
    selectedTrip,
    selectedSeat,
    selectedPayment,
    setPayment,
    confirmBooking,
    go,
  } = useApp();

  if (!selectedTrip || !selectedSeat) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-ink-muted">
        Elige un viaje y asiento antes de continuar al pago.
      </div>
    );
  }

  const base = selectedTrip.price;
  const service = 0;
  const discount = Math.round(base * DISCOUNT_RATE * 100) / 100;
  const total = base + service - discount;

  return (
    <div className="flex h-full flex-col">
      <header className="px-6 pt-2">
        <button
          onClick={() => go("asiento")}
          className="-ml-1 grid h-8 w-8 place-items-center rounded-full text-ink"
          aria-label="Atrás"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
          Paso 3 de 3
        </div>
        <h1 className="mt-1 font-serif text-[28px] leading-tight text-ink">
          Confirma y paga
        </h1>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-36">
        <div className="mt-4 rounded-xl border border-ink/10 bg-white p-4">
          <div className="flex items-baseline justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            <span>Sáb 19 abr · {selectedTrip.departure}</span>
            <span>Asiento {selectedSeat}</span>
          </div>
          <div className="mt-1 font-serif text-[18px] text-ink">
            {selectedTrip.origin.name}{" "}
            <span className="text-wine">→</span>{" "}
            {selectedTrip.destination.short}
          </div>
          <div className="mt-2 flex items-baseline justify-between text-[11px] text-ink-muted">
            <span>Mariana López C.</span>
            <span>MEX-123-CAM</span>
          </div>
        </div>

        <section className="mt-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            Método de pago
          </div>

          <div className="mt-2 space-y-2">
            {paymentMethods.map((m) => {
              const active = m.id === selectedPayment;
              return (
                <button
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border bg-white p-3 text-left transition ${
                    active ? "border-wine" : "border-ink/10"
                  }`}
                >
                  <BrandBadge brand={m.brand} />
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-ink">
                      {m.label}
                    </div>
                    <div className="text-[11px] text-ink-muted">{m.sub}</div>
                  </div>
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-full border transition ${
                      active ? "border-wine" : "border-ink/25"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full transition ${
                        active ? "bg-wine" : "bg-transparent"
                      }`}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          <button className="mt-3 flex items-center gap-1 text-[12px] font-semibold text-wine">
            <PlusIcon className="h-3.5 w-3.5" /> Agregar método
          </button>
        </section>

        <section className="mt-6 rounded-xl border border-ink/10 bg-white p-4 text-[13px]">
          <Line label={`Boleto ${selectedTrip.origin.name} → ${selectedTrip.destination.short}`} value={`$${base.toFixed(2)}`} />
          <Line label="Cargo por servicio" value={`$${service.toFixed(2)}`} />
          <Line
            label="Descuento Club Plata (-10%)"
            value={`-$${discount.toFixed(2)}`}
            accent
          />
          <div className="my-3 border-t border-dashed border-ink/15" />
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-ink">Total</span>
            <span className="font-serif text-[22px] text-wine">
              ${total.toFixed(2)}
            </span>
          </div>
        </section>
      </div>

      <div className="absolute inset-x-6 bottom-24 z-30">
        <button
          onClick={confirmBooking}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-wine py-3.5 text-[14px] font-semibold text-cream-50 transition hover:bg-wine-700 active:scale-[0.99]"
        >
          Pagar ${total.toFixed(2)} MXN <ArrowRight className="h-4 w-4" />
        </button>
        <p className="mt-2 text-center text-[10px] text-ink-muted">
          Al continuar aceptas los{" "}
          <span className="underline">Términos y Condiciones</span>
        </p>
      </div>
    </div>
  );
}

function Line({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={`text-[12px] ${accent ? "text-emerald-700" : "text-ink-muted"}`}>
        {label}
      </span>
      <span
        className={`text-[13px] ${
          accent ? "font-semibold text-emerald-700" : "text-ink"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function BrandBadge({ brand }: { brand: string }) {
  const common = "grid h-8 w-10 place-items-center rounded-md text-[9px] font-bold";
  if (brand === "Visa")
    return <div className={`${common} bg-[#1434CB] text-white`}>VISA</div>;
  if (brand === "Mercado Pago")
    return <div className={`${common} bg-[#00A5E0] text-white`}>MP</div>;
  if (brand === "Apple Pay")
    return <div className={`${common} bg-black text-white`}></div>;
  return <div className={`${common} bg-ink text-cream-50`}>{brand}</div>;
}

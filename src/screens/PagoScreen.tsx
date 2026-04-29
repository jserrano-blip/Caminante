import { useApp } from "../context/AppContext";
import { ArrowRight, ChevronLeft, PlusIcon } from "../components/Icons";

const DISCOUNT_RATE = 0.1;

type Method = {
  id: string;
  label: string;
  sub: string;
  brand: "Visa" | "Mastercard" | "Mercado Pago" | "Apple Pay" | "Caminante Pass" | "OXXO";
};

const allMethods: Method[] = [
  { id: "visa", brand: "Visa", label: "Visa · •••• 4821", sub: "Expira 11/27" },
  { id: "mc", brand: "Mastercard", label: "Mastercard · •••• 0921", sub: "Expira 04/28" },
  { id: "mp", brand: "Mercado Pago", label: "Mercado Pago", sub: "mariana@correo.com" },
  { id: "pass", brand: "Caminante Pass", label: "Caminante Pass", sub: "Saldo digital" },
  { id: "apple", brand: "Apple Pay", label: "Apple Pay", sub: "Tarjeta predeterminada" },
  { id: "oxxo", brand: "OXXO", label: "OXXO", sub: "Pago en efectivo · referencia" },
];

export function PagoScreen() {
  const {
    selectedTrip,
    selectedSeat,
    selectedPayment,
    setPayment,
    confirmBooking,
    go,
    passBalance,
    user,
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

  const passInsufficient =
    selectedPayment === "pass" && passBalance < total;

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
            <span>{user?.name ?? "Mariana López C."}</span>
            <span>MEX-123-CAM</span>
          </div>
        </div>

        <section className="mt-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            Método de pago
          </div>

          <div className="mt-2 space-y-2">
            {allMethods.map((m) => {
              const active = m.id === selectedPayment;
              const sub =
                m.id === "pass"
                  ? `Saldo $${passBalance.toFixed(2)}${
                      passBalance < total ? " · insuficiente" : ""
                    }`
                  : m.sub;
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
                    <div
                      className={`text-[11px] ${
                        m.id === "pass" && passBalance < total
                          ? "text-wine"
                          : "text-ink-muted"
                      }`}
                    >
                      {sub}
                    </div>
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

          {passInsufficient && (
            <div className="mt-3 rounded-xl border border-wine/30 bg-wine/5 p-3 text-[11px] text-wine-700">
              Saldo insuficiente en tu Caminante Pass.{" "}
              <button
                onClick={() => go("recarga")}
                className="font-semibold underline"
              >
                Recargar
              </button>{" "}
              o elige otro método.
            </div>
          )}

          {selectedPayment === "oxxo" && (
            <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-[11px] text-amber-900">
              Generaremos una <span className="font-semibold">referencia OXXO</span> con
              vigencia de 72 horas. Tu boleto se emitirá en cuanto se confirme el
              pago.
            </div>
          )}
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
          disabled={passInsufficient}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-semibold transition active:scale-[0.99] ${
            passInsufficient
              ? "bg-ink/10 text-ink-muted"
              : "bg-wine text-cream-50 hover:bg-wine-700"
          }`}
        >
          {selectedPayment === "oxxo"
            ? `Generar referencia OXXO · $${total.toFixed(2)}`
            : `Pagar $${total.toFixed(2)} MXN`}{" "}
          <ArrowRight className="h-4 w-4" />
        </button>
        <p className="mt-2 text-center text-[10px] text-ink-muted">
          Al continuar aceptas los{" "}
          <button
            onClick={() => go("terminos")}
            className="underline"
          >
            Términos y Condiciones
          </button>
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

function BrandBadge({ brand }: { brand: Method["brand"] }) {
  const common = "grid h-8 w-12 place-items-center rounded-md text-[9px] font-bold";
  if (brand === "Visa")
    return <div className={`${common} bg-[#1434CB] text-white`}>VISA</div>;
  if (brand === "Mastercard")
    return <div className={`${common} bg-[#EB001B] text-white`}>MC</div>;
  if (brand === "Mercado Pago")
    return <div className={`${common} bg-[#00A5E0] text-white`}>MP</div>;
  if (brand === "Apple Pay")
    return <div className={`${common} bg-black text-white`}></div>;
  if (brand === "OXXO")
    return <div className={`${common} bg-[#E2231A] text-white`}>OXXO</div>;
  if (brand === "Caminante Pass")
    return (
      <div className={`${common} bg-gradient-to-br from-ink to-wine-800 text-cream-50`}>
        PASS
      </div>
    );
  return <div className={`${common} bg-ink text-cream-50`}>{brand}</div>;
}

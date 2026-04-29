import { useState } from "react";
import { useApp } from "../context/AppContext";
import { ChevronLeft } from "../components/Icons";

const amounts = [100, 200, 300, 500, 1000];

const methods = [
  { id: "mp" as const, label: "Mercado Pago", sub: "Wallet vinculada", brand: "MP", color: "bg-[#00A5E0]" },
  { id: "visa" as const, label: "Visa · •••• 4821", sub: "Tarjeta predeterminada", brand: "VISA", color: "bg-[#1434CB]" },
  { id: "oxxo" as const, label: "OXXO", sub: "Genera referencia para pagar en efectivo", brand: "OXXO", color: "bg-[#E2231A]" },
];

export function RecargaScreen() {
  const { go, rechargePass } = useApp();
  const [amount, setAmount] = useState<number>(200);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState<"mp" | "visa" | "oxxo">("mp");

  const finalAmount = custom ? Number(custom) || 0 : amount;
  const valid = finalAmount >= 50 && finalAmount <= 5000;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 px-5 pt-3">
        <button
          onClick={() => go("pass")}
          className="-ml-1 grid h-8 w-8 place-items-center rounded-full text-ink"
          aria-label="Atrás"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
            Recarga · Caminante Pass
          </div>
          <h1 className="font-serif text-[22px] leading-tight text-ink">
            ¿Cuánto recargar?
          </h1>
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-32 pt-4">
        <section>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            Monto sugerido
          </div>
          <div className="grid grid-cols-3 gap-2">
            {amounts.map((a) => {
              const active = !custom && a === amount;
              return (
                <button
                  key={a}
                  onClick={() => {
                    setAmount(a);
                    setCustom("");
                  }}
                  className={`rounded-xl py-3 text-[14px] font-semibold transition ${
                    active
                      ? "bg-wine text-cream-50"
                      : "bg-white text-ink shadow-card"
                  }`}
                >
                  ${a}
                </button>
              );
            })}
          </div>

          <label className="mt-3 block">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
              Otro monto
            </span>
            <div className="mt-1 flex items-center rounded-xl border border-ink/10 bg-white px-3 py-3">
              <span className="mr-1 text-[14px] font-semibold text-ink-muted">
                $
              </span>
              <input
                value={custom}
                onChange={(e) =>
                  setCustom(e.target.value.replace(/[^\d]/g, "").slice(0, 4))
                }
                placeholder="0"
                className="flex-1 bg-transparent text-[14px] text-ink outline-none"
                inputMode="numeric"
              />
              <span className="text-[10px] text-ink-muted">MXN</span>
            </div>
          </label>
        </section>

        <section className="mt-6">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            Método de pago
          </div>
          <div className="space-y-2">
            {methods.map((m) => {
              const active = m.id === method;
              return (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border bg-white p-3 text-left ${
                    active ? "border-wine" : "border-ink/10"
                  }`}
                >
                  <div
                    className={`grid h-8 w-12 place-items-center rounded-md text-[9px] font-bold text-white ${m.color}`}
                  >
                    {m.brand}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-ink">
                      {m.label}
                    </div>
                    <div className="text-[11px] text-ink-muted">{m.sub}</div>
                  </div>
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-full border ${
                      active ? "border-wine" : "border-ink/25"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        active ? "bg-wine" : ""
                      }`}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <p className="mt-4 text-center text-[10px] text-ink-muted">
          Las recargas en efectivo también pueden hacerse en ventanilla de las
          terminales.
        </p>
      </div>

      <div className="absolute inset-x-5 bottom-6 z-30">
        <button
          onClick={() => valid && rechargePass(finalAmount, method)}
          disabled={!valid}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-semibold transition ${
            valid
              ? "bg-wine text-cream-50 hover:bg-wine-700"
              : "bg-ink/10 text-ink-muted"
          }`}
        >
          {method === "oxxo"
            ? `Generar referencia OXXO · $${finalAmount}`
            : `Recargar $${finalAmount} MXN`}
        </button>
      </div>
    </div>
  );
}

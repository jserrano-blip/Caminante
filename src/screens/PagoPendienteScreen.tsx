import { useApp } from "../context/AppContext";
import { ChevronLeft } from "../components/Icons";

export function PagoPendienteScreen() {
  const { pendingPayment, go, showToast, setPendingPayment } = useApp();

  if (!pendingPayment) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-[12px] text-ink-muted">
        No hay pagos pendientes. Vuelve al inicio.
      </div>
    );
  }

  const { reference, amount, expiresAt } = pendingPayment;
  const formatted = reference.replace(/(\d{4})(?=\d)/g, "$1 ").trim();

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 px-5 pt-3">
        <button
          onClick={() => {
            setPendingPayment(undefined);
            go("inicio");
          }}
          className="-ml-1 grid h-8 w-8 place-items-center rounded-full text-ink"
          aria-label="Atrás"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-700">
            Pago pendiente
          </div>
          <h1 className="font-serif text-[22px] leading-tight text-ink">
            Paga en OXXO
          </h1>
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-28 pt-4">
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-200 text-[14px]">
              ⏳
            </span>
            <div>
              <div className="text-[12px] font-semibold text-amber-900">
                Estado: pendiente
              </div>
              <div className="text-[10px] text-amber-800">
                Se confirma en cuanto pagues en tienda
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-5 shadow-card">
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
            Referencia OXXO
          </div>
          <div className="mt-1 break-all font-mono text-[20px] font-semibold tracking-wider text-ink">
            {formatted}
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(reference).catch(() => {});
              showToast("Referencia copiada");
            }}
            className="mt-2 text-[12px] font-semibold text-wine"
          >
            Copiar referencia
          </button>

          <div className="mt-5 grid grid-cols-2 gap-3 text-[12px]">
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
                Monto
              </div>
              <div className="mt-0.5 font-semibold text-ink">
                ${amount.toFixed(2)} MXN
              </div>
            </div>
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
                Vigencia
              </div>
              <div className="mt-0.5 font-semibold text-ink">{expiresAt}</div>
            </div>
          </div>
        </div>

        <section className="mt-5">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            Cómo pagar
          </div>
          <ol className="space-y-2 rounded-2xl bg-white p-4 text-[12px] text-ink shadow-card">
            {[
              "Acude a cualquier tienda OXXO.",
              "Indica al cajero que harás un pago de servicio con referencia.",
              "Dicta o muestra la referencia de 14 dígitos.",
              "Paga el monto exacto en efectivo y conserva tu ticket.",
              "Tu boleto / saldo se acreditará en hasta 1 hora.",
            ].map((p, i) => (
              <li key={p} className="flex gap-3">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-100 text-[11px] font-semibold text-amber-800">
                  {i + 1}
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
        </section>

        <button
          onClick={() => {
            setPendingPayment(undefined);
            showToast("Pago confirmado · ¡gracias!");
            go("inicio");
          }}
          className="mt-5 w-full rounded-xl bg-wine py-3 text-[13px] font-semibold text-cream-50 hover:bg-wine-700"
        >
          Simular pago confirmado (demo)
        </button>
      </div>
    </div>
  );
}

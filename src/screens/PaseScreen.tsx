import { QRCodeSVG } from "qrcode.react";
import { useApp } from "../context/AppContext";
import {
  ClockIcon,
  ShareIcon,
  WalletIcon,
} from "../components/Icons";

export function PaseScreen() {
  const { bookings, showToast, resetFlow } = useApp();
  const active = bookings[0];

  if (!active) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-ink px-8 text-center text-cream-50">
        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cream-50/60">
          Pase de abordar
        </div>
        <div className="font-serif text-[24px] leading-tight">
          No tienes pases activos
        </div>
        <p className="text-[13px] text-cream-50/60">
          Reserva un viaje y tu pase aparecerá aquí automáticamente.
        </p>
        <button
          onClick={resetFlow}
          className="mt-3 rounded-xl bg-wine px-5 py-2.5 text-[13px] font-semibold text-cream-50"
        >
          Buscar corridas
        </button>
      </div>
    );
  }

  const { trip, seatId, confirmation, passenger, date } = active;

  return (
    <div className="flex h-full flex-col bg-ink text-cream-50">
      <header className="flex items-start justify-between px-6 pt-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cream-50/60">
            Pase de abordar
          </div>
          <h1 className="mt-1 font-serif text-[24px] leading-tight text-cream-50">
            {trip.origin.name}{" "}
            <span className="text-wine">→</span>
            <br />
            {trip.destination.short}
          </h1>
        </div>
        <span className="mt-2 flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Activo
        </span>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-28 pt-4">
        <div className="relative overflow-hidden rounded-2xl bg-cream-50 text-ink shadow-phone">
          <div className="pointer-events-none absolute -left-3 top-[72px] h-6 w-6 rounded-full bg-ink" />
          <div className="pointer-events-none absolute -right-3 top-[72px] h-6 w-6 rounded-full bg-ink" />

          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
                  {date} · {trip.departure}
                </div>
                <div className="mt-1 font-serif text-[22px] text-ink">
                  {trip.origin.short}{" "}
                  <span className="text-wine">→</span> {trip.destination.short}
                </div>
                <div className="mt-1 text-[11px] text-ink-muted">
                  {trip.origin.terminal} · Andén 4
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
                  Asiento
                </div>
                <div className="font-serif text-[28px] text-wine">
                  {seatId}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start justify-between border-t border-dashed border-ink/20 pt-4">
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
                  Pasajero
                </div>
                <div className="mt-0.5 text-[13px] font-semibold text-ink">
                  {passenger}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
                  Confirmación
                </div>
                <div className="mt-0.5 text-[13px] font-semibold text-ink">
                  {confirmation}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-ink/20" />

          <div className="flex flex-col items-center gap-3 p-5">
            <div className="rounded-lg bg-white p-3">
              <QRCodeSVG
                value={`CAM|${confirmation}|${trip.id}|${seatId}`}
                size={160}
                level="M"
                bgColor="#ffffff"
                fgColor="#1A1715"
              />
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.28em] text-ink-muted">
              Escanea en el andén · {confirmation}-06
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-cream-50/5 px-3 py-2.5 text-[12px] text-cream-50/80">
          <ClockIcon className="h-4 w-4 text-cream-50/80" />
          <div>
            <span className="font-semibold text-cream-50">
              Aborda en 14 h 22 min
            </span>
            <span className="ml-2 text-cream-50/60">
              Llega 15 min antes al andén
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => showToast("Pase agregado a Wallet")}
            className="flex items-center justify-center gap-2 rounded-xl border border-cream-50/20 py-3 text-[13px] font-semibold text-cream-50"
          >
            <WalletIcon className="h-4 w-4" /> Agregar a Wallet
          </button>
          <button
            onClick={() => showToast("Enlace del pase copiado")}
            className="flex items-center justify-center gap-2 rounded-xl border border-cream-50/20 py-3 text-[13px] font-semibold text-cream-50"
          >
            <ShareIcon className="h-4 w-4" /> Compartir
          </button>
        </div>
      </div>
    </div>
  );
}

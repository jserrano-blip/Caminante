import { useState } from "react";
import { useApp } from "../context/AppContext";

const slides = [
  {
    eyebrow: "01 · Boletos",
    title: "Compra desde la app",
    body: "Reserva camiones y shuttles a CDMX, AIFA, AICM y más en menos de 60 segundos.",
    illu: "🎟",
  },
  {
    eyebrow: "02 · Rastreo",
    title: "Sigue tu viaje en vivo",
    body: "Mira en tiempo real cuándo aborda tu camión y cuánto falta para llegar.",
    illu: "📍",
  },
  {
    eyebrow: "03 · Caminante Pass",
    title: "Tu tarjeta digital",
    body: "Recarga saldo y paga sin sacar la cartera. Compatible con OXXO, Mercado Pago y tarjetas.",
    illu: "💳",
  },
  {
    eyebrow: "04 · Camina+",
    title: "Programa de lealtad",
    body: "Acumula puntos en cada viaje y canjea por upgrades, equipaje extra o boletos.",
    illu: "✦",
  },
];

export function OnboardingScreen() {
  const { setPhase } = useApp();
  const [i, setI] = useState(0);
  const last = i === slides.length - 1;

  return (
    <div className="flex h-full flex-col bg-cream-100">
      <div className="flex items-center justify-between px-6 pt-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-muted">
          Caminante
        </span>
        <button
          onClick={() => setPhase("auth")}
          className="text-[12px] font-semibold text-wine"
        >
          Saltar
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="grid h-32 w-32 place-items-center rounded-full bg-wine/10 text-[56px]">
          {slides[i].illu}
        </div>
        <div className="mt-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-wine">
          {slides[i].eyebrow}
        </div>
        <h2 className="mt-2 font-serif text-[28px] leading-tight text-ink">
          {slides[i].title}
        </h2>
        <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
          {slides[i].body}
        </p>
      </div>

      <div className="px-6 pb-8">
        <div className="mb-5 flex items-center justify-center gap-1.5">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-6 bg-wine" : "w-1.5 bg-ink/20"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => (last ? setPhase("auth") : setI((n) => n + 1))}
          className="w-full rounded-xl bg-wine py-3.5 text-[14px] font-semibold text-cream-50 hover:bg-wine-700"
        >
          {last ? "Comenzar" : "Siguiente"}
        </button>
        {!last && (
          <button
            onClick={() => setI((n) => n + 1)}
            className="mt-3 w-full text-[12px] text-ink-muted"
          >
            Continuar →
          </button>
        )}
      </div>
    </div>
  );
}

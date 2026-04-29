import { useApp } from "../context/AppContext";

export function SplashScreen() {
  const { theme } = useApp();
  return (
    <div
      className={`relative flex h-full flex-col items-center justify-center overflow-hidden ${
        theme === "night" ? "bg-ink" : "bg-cream-100"
      }`}
    >
      <BrandHalo />
      <div className="relative z-10 flex flex-col items-center gap-3 text-center animate-fade-in">
        <div className="font-serif text-[44px] leading-none text-ink animate-rise">
          Caminante
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-wine animate-rise-delay">
          Tu viaje, en buenas manos.
        </div>
      </div>
      <div className="absolute bottom-12 z-10 flex items-center gap-2">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-wine" />
        <span className="text-[10px] uppercase tracking-[0.28em] text-ink-muted">
          Cargando…
        </span>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes rise { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        .animate-fade-in { animation: fadeIn 600ms ease-out both; }
        .animate-rise { animation: rise 700ms ease-out 200ms both; }
        .animate-rise-delay { animation: rise 700ms ease-out 600ms both; }
        @keyframes halo { from { transform: scale(.85); opacity: .35 } to { transform: scale(1.05); opacity: 0 } }
        .halo { animation: halo 2.6s ease-out infinite; }
      `}</style>
    </div>
  );
}

function BrandHalo() {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <div className="halo absolute h-72 w-72 rounded-full border border-wine/30" />
      <div
        className="halo absolute h-72 w-72 rounded-full border border-wine/30"
        style={{ animationDelay: "0.7s" }}
      />
      <div
        className="halo absolute h-72 w-72 rounded-full border border-wine/30"
        style={{ animationDelay: "1.4s" }}
      />
    </div>
  );
}

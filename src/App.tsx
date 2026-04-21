import { AppProvider, useApp } from "./context/AppContext";
import { PhoneFrame } from "./components/PhoneFrame";
import { BottomNav } from "./components/BottomNav";
import { InicioScreen } from "./screens/InicioScreen";
import { HorariosScreen } from "./screens/HorariosScreen";
import { AsientoScreen } from "./screens/AsientoScreen";
import { PagoScreen } from "./screens/PagoScreen";
import { PaseScreen } from "./screens/PaseScreen";
import { RastreoScreen } from "./screens/RastreoScreen";
import { ViajesScreen } from "./screens/ViajesScreen";
import { ClubScreen } from "./screens/ClubScreen";
import { CuentaScreen } from "./screens/CuentaScreen";
import type { ScreenKey } from "./types";

const captions: Record<ScreenKey, { caption: string; title: string; highlight: string }> = {
  inicio: { caption: "01 · Inicio", title: "App móvil ·", highlight: "Inicio" },
  horarios: { caption: "02 · Horarios", title: "App móvil ·", highlight: "Horarios" },
  asiento: { caption: "03 · Selección de asiento", title: "App móvil ·", highlight: "Asiento" },
  pago: { caption: "04 · Pago", title: "App móvil ·", highlight: "Pago" },
  pase: { caption: "05 · Pase de abordar (QR)", title: "App móvil ·", highlight: "Pase de abordar" },
  rastreo: { caption: "06 · Rastreo en vivo", title: "App móvil ·", highlight: "Rastreo en vivo" },
  viajes: { caption: "07 · Mis viajes / Historial", title: "App móvil ·", highlight: "Historial y facturación" },
  club: { caption: "08 · Club Caminante", title: "App móvil ·", highlight: "Club Caminante" },
  cuenta: { caption: "09 · Mi perfil", title: "App móvil ·", highlight: "Cuenta" },
};

function ActiveScreen() {
  const { screen } = useApp();
  switch (screen) {
    case "inicio":
      return <InicioScreen />;
    case "horarios":
      return <HorariosScreen />;
    case "asiento":
      return <AsientoScreen />;
    case "pago":
      return <PagoScreen />;
    case "pase":
      return <PaseScreen />;
    case "rastreo":
      return <RastreoScreen />;
    case "viajes":
      return <ViajesScreen />;
    case "club":
      return <ClubScreen />;
    case "cuenta":
      return <CuentaScreen />;
  }
}

function ShellBottomNav() {
  const { screen } = useApp();
  const hide = screen === "asiento" || screen === "pago";
  if (hide) return null;
  return <BottomNav />;
}

function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className="pointer-events-none absolute inset-x-6 bottom-28 z-50 flex justify-center">
      <div className="rounded-full bg-ink px-4 py-2 text-[12px] font-medium text-cream-50 shadow-lg">
        {toast}
      </div>
    </div>
  );
}

function Stage() {
  const { screen, tab } = useApp();
  const meta = captions[screen];

  return (
    <div className="flex min-h-screen flex-col bg-cream-100 text-ink">
      <header className="flex items-center justify-between px-10 pt-8">
        <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-ink-muted">
          Caminante · prototipo interactivo
        </div>
        <div className="text-right font-serif text-[18px] leading-tight text-ink">
          <div>App móvil ·</div>
          <div className="italic text-wine">{meta.highlight}</div>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center p-6">
        <PhoneFrame caption={meta.caption}>
          <div className="relative flex h-full flex-col">
            <ActiveScreen />
            <Toast />
            <ShellBottomNav />
          </div>
        </PhoneFrame>
      </div>

      <FlowRail current={screen} tab={tab} />
    </div>
  );
}

function FlowRail({ current, tab }: { current: ScreenKey; tab: string }) {
  const { go } = useApp();
  const steps: { key: ScreenKey; label: string }[] = [
    { key: "inicio", label: "Inicio" },
    { key: "horarios", label: "Horarios" },
    { key: "asiento", label: "Asiento" },
    { key: "pago", label: "Pago" },
    { key: "pase", label: "Pase QR" },
    { key: "rastreo", label: "Rastreo" },
    { key: "viajes", label: "Historial" },
    { key: "club", label: "Club" },
    { key: "cuenta", label: "Cuenta" },
  ];

  return (
    <footer className="sticky bottom-0 z-10 border-t border-ink/10 bg-cream-50/90 px-6 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
        <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-muted">
          Flujo de reserva
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {steps.map((s, i) => {
            const active = current === s.key;
            return (
              <button
                key={s.key}
                onClick={() => go(s.key)}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                  active
                    ? "bg-wine text-cream-50"
                    : "bg-white text-ink hover:bg-cream-200"
                }`}
              >
                {i + 1}. {s.label}
              </button>
            );
          })}
        </div>
        <div className="text-[10px] text-ink-muted">
          Tab activa: <span className="font-semibold text-ink">{tab}</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Stage />
    </AppProvider>
  );
}

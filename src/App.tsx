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
import { FaqScreen } from "./screens/FaqScreen";
import { TerminosScreen } from "./screens/TerminosScreen";
import { MenoresScreen } from "./screens/MenoresScreen";
import { WifiScreen } from "./screens/WifiScreen";
import { AhorrandoScreen } from "./screens/AhorrandoScreen";
import { PrivacidadScreen } from "./screens/PrivacidadScreen";
import type { ScreenKey } from "./types";

const captions: Record<ScreenKey, { highlight: string; caption: string }> = {
  inicio: { caption: "01 · Inicio", highlight: "Inicio" },
  horarios: { caption: "02 · Horarios", highlight: "Horarios" },
  asiento: { caption: "03 · Selección de asiento", highlight: "Asiento" },
  pago: { caption: "04 · Pago", highlight: "Pago" },
  pase: { caption: "05 · Pase de abordar (QR)", highlight: "Pase de abordar" },
  rastreo: { caption: "06 · Rastreo en vivo", highlight: "Rastreo en vivo" },
  viajes: { caption: "07 · Mis viajes / Historial", highlight: "Historial y facturación" },
  club: { caption: "08 · Club Caminante", highlight: "Club Caminante" },
  cuenta: { caption: "09 · Mi perfil", highlight: "Cuenta" },
  faq: { caption: "09a · Preguntas frecuentes", highlight: "FAQ" },
  terminos: { caption: "09b · Términos y condiciones", highlight: "Términos" },
  menores: { caption: "09c · Política de menores", highlight: "Menores" },
  wifi: { caption: "09d · WiFi a bordo", highlight: "WiFi" },
  ahorrando: { caption: "09e · Viaja Ahorrando", highlight: "Viaja Ahorrando" },
  privacidad: { caption: "09f · Aviso de privacidad", highlight: "Privacidad" },
};

const SUB_PROFILE_SCREENS: ScreenKey[] = [
  "faq",
  "terminos",
  "menores",
  "wifi",
  "ahorrando",
  "privacidad",
];

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
    case "faq":
      return <FaqScreen />;
    case "terminos":
      return <TerminosScreen />;
    case "menores":
      return <MenoresScreen />;
    case "wifi":
      return <WifiScreen />;
    case "ahorrando":
      return <AhorrandoScreen />;
    case "privacidad":
      return <PrivacidadScreen />;
  }
}

function ShellBottomNav() {
  const { screen } = useApp();
  const hide =
    screen === "asiento" ||
    screen === "pago" ||
    SUB_PROFILE_SCREENS.includes(screen);
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

  const helpScreens: { key: ScreenKey; label: string }[] = [
    { key: "faq", label: "FAQ" },
    { key: "terminos", label: "Términos" },
    { key: "menores", label: "Menores" },
    { key: "wifi", label: "WiFi" },
    { key: "ahorrando", label: "Ahorrando" },
    { key: "privacidad", label: "Privacidad" },
  ];

  return (
    <footer className="sticky bottom-0 z-10 border-t border-ink/10 bg-cream-50/90 px-6 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
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
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-muted">
            Mi Perfil · Información y ayuda
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {helpScreens.map((s) => {
              const active = current === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => go(s.key)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                    active
                      ? "bg-ink text-cream-50"
                      : "bg-white text-ink hover:bg-cream-200"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
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

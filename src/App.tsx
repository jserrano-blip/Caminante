import { AppProvider, useApp } from "./context/AppContext";
import { PhoneFrame } from "./components/PhoneFrame";
import { BottomNav } from "./components/BottomNav";
import { SplashScreen } from "./screens/SplashScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { LoginScreen } from "./screens/LoginScreen";
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
import { PassScreen } from "./screens/PassScreen";
import { RecargaScreen } from "./screens/RecargaScreen";
import { PagoPendienteScreen } from "./screens/PagoPendienteScreen";
import type { AppPhase, ScreenKey } from "./types";

const SUB_PROFILE_SCREENS: ScreenKey[] = [
  "faq",
  "terminos",
  "menores",
  "wifi",
  "ahorrando",
  "privacidad",
];

const HIDDEN_NAV_SCREENS: ScreenKey[] = [
  "asiento",
  "pago",
  "pago_pendiente",
  "recarga",
  ...SUB_PROFILE_SCREENS,
];

function MainScreen() {
  const { screen } = useApp();
  switch (screen) {
    case "splash":
    case "onboarding":
    case "auth":
    case "inicio":
      return <InicioScreen />;
    case "horarios":
      return <HorariosScreen />;
    case "asiento":
      return <AsientoScreen />;
    case "pago":
      return <PagoScreen />;
    case "pago_pendiente":
      return <PagoPendienteScreen />;
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
    case "pass":
      return <PassScreen />;
    case "recarga":
      return <RecargaScreen />;
  }
}

function ActiveContent() {
  const { phase } = useApp();
  if (phase === "splash") return <SplashScreen />;
  if (phase === "onboarding") return <OnboardingScreen />;
  if (phase === "auth") return <LoginScreen />;
  return <MainScreen />;
}

function ShellBottomNav() {
  const { screen, phase } = useApp();
  if (phase !== "main") return null;
  if (HIDDEN_NAV_SCREENS.includes(screen)) return null;
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

function captionFor(phase: AppPhase, screen: ScreenKey): {
  caption: string;
  highlight: string;
} {
  if (phase === "splash") return { caption: "00 · Splash", highlight: "Splash" };
  if (phase === "onboarding")
    return { caption: "00 · Onboarding", highlight: "Onboarding" };
  if (phase === "auth")
    return { caption: "00 · Iniciar sesión", highlight: "Login" };

  const map: Record<ScreenKey, { caption: string; highlight: string }> = {
    splash: { caption: "00 · Splash", highlight: "Splash" },
    onboarding: { caption: "00 · Onboarding", highlight: "Onboarding" },
    auth: { caption: "00 · Login", highlight: "Login" },
    inicio: { caption: "01 · Inicio", highlight: "Inicio" },
    horarios: { caption: "02 · Horarios", highlight: "Horarios" },
    asiento: { caption: "03 · Asiento", highlight: "Asiento" },
    pago: { caption: "04 · Pago", highlight: "Pago" },
    pago_pendiente: { caption: "04b · Pago pendiente", highlight: "Pendiente" },
    pase: { caption: "05 · Pase de abordar", highlight: "Pase" },
    rastreo: { caption: "06 · Rastreo en vivo", highlight: "Rastreo" },
    viajes: { caption: "07 · Mis viajes", highlight: "Historial" },
    club: { caption: "08 · Club Caminante", highlight: "Club" },
    cuenta: { caption: "09 · Mi perfil", highlight: "Cuenta" },
    faq: { caption: "09a · FAQ", highlight: "FAQ" },
    terminos: { caption: "09b · Términos", highlight: "Términos" },
    menores: { caption: "09c · Menores", highlight: "Menores" },
    wifi: { caption: "09d · WiFi", highlight: "WiFi" },
    ahorrando: { caption: "09e · Viaja Ahorrando", highlight: "Ahorrando" },
    privacidad: { caption: "09f · Privacidad", highlight: "Privacidad" },
    pass: { caption: "10 · Caminante Pass", highlight: "Pass" },
    recarga: { caption: "10a · Recarga", highlight: "Recarga" },
  };
  return map[screen];
}

function Stage() {
  const { screen, tab, phase, theme } = useApp();
  const meta = captionFor(phase, screen);

  return (
    <div
      className={`flex min-h-screen flex-col text-ink ${
        theme === "night" ? "bg-ink" : "bg-cream-100"
      }`}
    >
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
            <ActiveContent />
            <Toast />
            <ShellBottomNav />
          </div>
        </PhoneFrame>
      </div>

      <FlowRail current={phase === "main" ? screen : (phase as ScreenKey)} tab={tab} />
    </div>
  );
}

function FlowRail({ current, tab }: { current: ScreenKey; tab: string }) {
  const { go, setPhase, theme, toggleTheme } = useApp();

  const onboard: { key: ScreenKey | AppPhase; label: string }[] = [
    { key: "splash" as AppPhase, label: "Splash" },
    { key: "onboarding" as AppPhase, label: "Onboarding" },
    { key: "auth" as AppPhase, label: "Login" },
  ];

  const steps: { key: ScreenKey; label: string }[] = [
    { key: "inicio", label: "Inicio" },
    { key: "horarios", label: "Horarios" },
    { key: "asiento", label: "Asiento" },
    { key: "pago", label: "Pago" },
    { key: "pago_pendiente", label: "Pendiente" },
    { key: "pase", label: "Pase QR" },
    { key: "rastreo", label: "Rastreo" },
    { key: "viajes", label: "Historial" },
    { key: "club", label: "Club" },
    { key: "pass", label: "Pass" },
    { key: "recarga", label: "Recarga" },
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

  const goPhaseOrScreen = (key: string) => {
    if (key === "splash" || key === "onboarding" || key === "auth") {
      setPhase(key);
      return;
    }
    setPhase("main");
    go(key as ScreenKey);
  };

  return (
    <footer className="sticky bottom-0 z-10 border-t border-ink/10 bg-cream-50/90 px-6 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-muted">
            Onboarding
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {onboard.map((s) => {
              const active = current === s.key;
              return (
                <button
                  key={s.key as string}
                  onClick={() => goPhaseOrScreen(s.key as string)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                    active ? "bg-ink text-cream-50" : "bg-white text-ink"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={toggleTheme}
            className="ml-auto rounded-full border border-ink/10 bg-white px-3 py-1 text-[11px] font-semibold text-ink"
          >
            {theme === "day" ? "🌙 Modo nocturno" : "☀️ Modo diurno"}
          </button>
        </div>

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
                  onClick={() => goPhaseOrScreen(s.key)}
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
            Tab: <span className="font-semibold text-ink">{tab}</span>
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
                  onClick={() => goPhaseOrScreen(s.key)}
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

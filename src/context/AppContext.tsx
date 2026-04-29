import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AppPhase,
  Booking,
  City,
  ScreenKey,
  TabKey,
  ThemeMode,
  TransportMode,
  Trip,
  User,
} from "../types";
import { busCities, shuttleCities } from "../data";

type Search = {
  origin: City;
  destination: City;
  dayKey: string;
  passengers: number;
};

type PendingPayment = {
  reference: string;
  amount: number;
  method: "oxxo" | "mp" | "visa" | "apple" | "pass";
  expiresAt: string;
};

type AppState = {
  screen: ScreenKey;
  tab: TabKey;
  phase: AppPhase;
  theme: ThemeMode;
  user?: User;
  transportMode: TransportMode;
  passBalance: number;
  search: Search;
  selectedTrip?: Trip;
  selectedSeat?: string;
  selectedPayment: string;
  bookings: Booking[];
  pendingPayment?: PendingPayment;
  toast?: string;
};

type AppActions = {
  go: (screen: ScreenKey) => void;
  setTab: (tab: TabKey) => void;
  setPhase: (phase: AppPhase) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setUser: (user?: User) => void;
  loginAsGuest: () => void;
  loginEmail: (email: string) => void;
  signOut: () => void;
  setTransportMode: (mode: TransportMode) => void;
  rechargePass: (amount: number, method: "mp" | "visa" | "oxxo") => void;
  setSearch: (patch: Partial<Search>) => void;
  swapCities: () => void;
  selectTrip: (trip: Trip) => void;
  selectSeat: (seatId: string) => void;
  setPayment: (id: string) => void;
  confirmBooking: () => void;
  setPendingPayment: (p: PendingPayment | undefined) => void;
  resetFlow: () => void;
  showToast: (msg: string) => void;
};

const AppCtx = createContext<(AppState & AppActions) | null>(null);

const initialBusSearch: Search = {
  origin: busCities[0],
  destination: busCities[1],
  dayKey: "hoy",
  passengers: 1,
};

const initialShuttleSearch: Search = {
  origin: shuttleCities[0],
  destination: shuttleCities[1],
  dayKey: "hoy",
  passengers: 1,
};

function randomConfirmation(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `CAM-${n}`;
}

function randomOxxoRef(): string {
  const part = () => Math.floor(1000 + Math.random() * 9000);
  return `93000${part()}${part()}${part()}`.slice(0, 14);
}

function getStoredFlag(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function setStoredFlag(key: string, value: boolean) {
  try {
    window.localStorage.setItem(key, value ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [phase, setPhaseState] = useState<AppPhase>("splash");
  const [theme, setThemeState] = useState<ThemeMode>("day");
  const [screen, setScreen] = useState<ScreenKey>("inicio");
  const [tab, setTabState] = useState<TabKey>("inicio");
  const [user, setUser] = useState<User | undefined>();
  const [transportMode, setTransportModeState] =
    useState<TransportMode>("bus");
  const [passBalance, setPassBalance] = useState<number>(425);
  const [search, setSearchState] = useState<Search>(initialBusSearch);
  const [selectedTrip, setSelectedTrip] = useState<Trip | undefined>();
  const [selectedSeat, setSelectedSeat] = useState<string | undefined>();
  const [selectedPayment, setSelectedPayment] = useState<string>("visa");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pendingPayment, setPendingPayment] = useState<
    PendingPayment | undefined
  >();
  const [toast, setToast] = useState<string | undefined>();

  // Aplica tema al root del documento
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "night") root.classList.add("theme-night");
    else root.classList.remove("theme-night");
  }, [theme]);

  // Auto-advance del splash → onboarding (si no se ha visto) o auth
  useEffect(() => {
    if (phase !== "splash") return;
    const t = window.setTimeout(() => {
      const seen = getStoredFlag("caminante.onboarded");
      setPhaseState(seen ? "auth" : "onboarding");
    }, 2400);
    return () => window.clearTimeout(t);
  }, [phase]);

  const go = useCallback((next: ScreenKey) => {
    setScreen(next);
    if (next === "inicio" || next === "pass" || next === "recarga")
      setTabState("inicio");
    if (
      next === "horarios" ||
      next === "viajes" ||
      next === "rastreo" ||
      next === "asiento" ||
      next === "pago" ||
      next === "pago_pendiente"
    )
      setTabState("viajes");
    if (next === "pase") setTabState("pase");
    if (next === "club") setTabState("club");
    if (
      next === "cuenta" ||
      next === "faq" ||
      next === "terminos" ||
      next === "menores" ||
      next === "wifi" ||
      next === "ahorrando" ||
      next === "privacidad"
    )
      setTabState("cuenta");
  }, []);

  const setTab = useCallback((next: TabKey) => {
    setTabState(next);
    setScreen(next === "inicio" ? "inicio" : next);
  }, []);

  const setPhase = useCallback((next: AppPhase) => {
    if (next === "main" && phase === "onboarding") {
      setStoredFlag("caminante.onboarded", true);
    }
    setPhaseState(next);
  }, [phase]);

  const setTheme = useCallback((next: ThemeMode) => setThemeState(next), []);
  const toggleTheme = useCallback(
    () => setThemeState((t) => (t === "day" ? "night" : "day")),
    [],
  );

  const loginAsGuest = useCallback(() => {
    setUser({ name: "Invitado", email: "", guest: true });
    setPhaseState("main");
    setStoredFlag("caminante.onboarded", true);
  }, []);

  const loginEmail = useCallback((email: string) => {
    const name = email.split("@")[0]?.split(".")[0] ?? "Mariana";
    const display = name.charAt(0).toUpperCase() + name.slice(1);
    setUser({ name: display, email, guest: false });
    setPhaseState("main");
    setStoredFlag("caminante.onboarded", true);
  }, []);

  const signOut = useCallback(() => {
    setUser(undefined);
    setPhaseState("auth");
  }, []);

  const setTransportMode = useCallback((mode: TransportMode) => {
    setTransportModeState(mode);
    setSearchState(mode === "bus" ? initialBusSearch : initialShuttleSearch);
  }, []);

  const rechargePass = useCallback(
    (amount: number, method: "mp" | "visa" | "oxxo") => {
      if (method === "oxxo") {
        const ref = randomOxxoRef();
        setPendingPayment({
          reference: ref,
          amount,
          method: "oxxo",
          expiresAt: "72 horas",
        });
        setScreen("pago_pendiente");
        return;
      }
      setPassBalance((b) => b + amount);
      setToast(`+$${amount} agregados al Caminante Pass`);
      window.setTimeout(() => setToast(undefined), 2200);
      setScreen("pass");
    },
    [],
  );

  const setSearch = useCallback((patch: Partial<Search>) => {
    setSearchState((s) => ({ ...s, ...patch }));
  }, []);

  const swapCities = useCallback(() => {
    setSearchState((s) => ({
      ...s,
      origin: s.destination,
      destination: s.origin,
    }));
  }, []);

  const selectTrip = useCallback((trip: Trip) => {
    setSelectedTrip(trip);
    setSelectedSeat(undefined);
  }, []);

  const selectSeat = useCallback((seatId: string) => {
    setSelectedSeat(seatId);
  }, []);

  const setPayment = useCallback((id: string) => {
    setSelectedPayment(id);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(undefined), 2200);
  }, []);

  const confirmBooking = useCallback(() => {
    if (!selectedTrip || !selectedSeat) return;

    if (selectedPayment === "pass") {
      if (passBalance < selectedTrip.price) {
        setToast("Saldo insuficiente · recarga tu Caminante Pass");
        window.setTimeout(() => setToast(undefined), 2400);
        return;
      }
      setPassBalance((b) => b - selectedTrip.price);
    }

    if (selectedPayment === "oxxo") {
      setPendingPayment({
        reference: randomOxxoRef(),
        amount: selectedTrip.price,
        method: "oxxo",
        expiresAt: "72 horas",
      });
      setScreen("pago_pendiente");
      return;
    }

    const booking: Booking = {
      trip: selectedTrip,
      seatId: selectedSeat,
      confirmation: randomConfirmation(),
      date: "Sáb 19 abr",
      passenger: user?.name ?? "Mariana López",
    };
    setBookings((b) => [booking, ...b]);
    setScreen("pase");
    setTabState("pase");
  }, [selectedTrip, selectedSeat, selectedPayment, passBalance, user]);

  const resetFlow = useCallback(() => {
    setSelectedTrip(undefined);
    setSelectedSeat(undefined);
    setScreen("inicio");
    setTabState("inicio");
  }, []);

  const value = useMemo(
    () => ({
      screen,
      tab,
      phase,
      theme,
      user,
      transportMode,
      passBalance,
      search,
      selectedTrip,
      selectedSeat,
      selectedPayment,
      bookings,
      pendingPayment,
      toast,
      go,
      setTab,
      setPhase,
      setTheme,
      toggleTheme,
      setUser,
      loginAsGuest,
      loginEmail,
      signOut,
      setTransportMode,
      rechargePass,
      setSearch,
      swapCities,
      selectTrip,
      selectSeat,
      setPayment,
      confirmBooking,
      setPendingPayment,
      resetFlow,
      showToast,
    }),
    [
      screen,
      tab,
      phase,
      theme,
      user,
      transportMode,
      passBalance,
      search,
      selectedTrip,
      selectedSeat,
      selectedPayment,
      bookings,
      pendingPayment,
      toast,
      go,
      setTab,
      setPhase,
      setTheme,
      toggleTheme,
      loginAsGuest,
      loginEmail,
      signOut,
      setTransportMode,
      rechargePass,
      setSearch,
      swapCities,
      selectTrip,
      selectSeat,
      setPayment,
      confirmBooking,
      resetFlow,
      showToast,
    ],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

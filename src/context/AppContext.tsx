import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Booking, City, ScreenKey, TabKey, Trip } from "../types";
import { cities } from "../data";

type Search = {
  origin: City;
  destination: City;
  dayKey: string;
  passengers: number;
};

type AppState = {
  screen: ScreenKey;
  tab: TabKey;
  search: Search;
  selectedTrip?: Trip;
  selectedSeat?: string;
  selectedPayment: string;
  bookings: Booking[];
  toast?: string;
};

type AppActions = {
  go: (screen: ScreenKey) => void;
  setTab: (tab: TabKey) => void;
  setSearch: (patch: Partial<Search>) => void;
  swapCities: () => void;
  selectTrip: (trip: Trip) => void;
  selectSeat: (seatId: string) => void;
  setPayment: (id: string) => void;
  confirmBooking: () => void;
  resetFlow: () => void;
  showToast: (msg: string) => void;
};

const AppCtx = createContext<(AppState & AppActions) | null>(null);

const initialSearch: Search = {
  origin: cities[0],
  destination: cities[1],
  dayKey: "hoy",
  passengers: 1,
};

function randomConfirmation(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `CAM-${n}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ScreenKey>("inicio");
  const [tab, setTabState] = useState<TabKey>("inicio");
  const [search, setSearchState] = useState<Search>(initialSearch);
  const [selectedTrip, setSelectedTrip] = useState<Trip | undefined>();
  const [selectedSeat, setSelectedSeat] = useState<string | undefined>();
  const [selectedPayment, setSelectedPayment] = useState<string>("visa");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [toast, setToast] = useState<string | undefined>();

  const go = useCallback((next: ScreenKey) => {
    setScreen(next);
    if (next === "inicio") setTabState("inicio");
    if (next === "horarios" || next === "viajes" || next === "rastreo")
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

  const setSearch = useCallback((patch: Partial<Search>) => {
    setSearchState((s) => ({ ...s, ...patch }));
  }, []);

  const swapCities = useCallback(() => {
    setSearchState((s) => ({ ...s, origin: s.destination, destination: s.origin }));
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
    const booking: Booking = {
      trip: selectedTrip,
      seatId: selectedSeat,
      confirmation: randomConfirmation(),
      date: "Sáb 19 abr",
      passenger: "Mariana López",
    };
    setBookings((b) => [booking, ...b]);
    setScreen("pase");
    setTabState("pase");
  }, [selectedTrip, selectedSeat]);

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
      search,
      selectedTrip,
      selectedSeat,
      selectedPayment,
      bookings,
      toast,
      go,
      setTab,
      setSearch,
      swapCities,
      selectTrip,
      selectSeat,
      setPayment,
      confirmBooking,
      resetFlow,
      showToast,
    }),
    [
      screen,
      tab,
      search,
      selectedTrip,
      selectedSeat,
      selectedPayment,
      bookings,
      toast,
      go,
      setTab,
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

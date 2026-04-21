export type City = {
  id: string;
  name: string;
  terminal: string;
  short: string;
};

export type Trip = {
  id: string;
  origin: City;
  destination: City;
  departure: string; // "05:30"
  arrival: string; // "07:15"
  durationMin: number;
  stops: number;
  busType: "Sprinter" | "Coach";
  price: number;
  seatsLeft: number;
  recommended?: boolean;
};

export type SeatStatus = "available" | "occupied" | "selected";

export type Seat = {
  id: string;
  row: number;
  col: "A" | "B" | "C";
  window: boolean;
  status: SeatStatus;
};

export type PaymentMethod = {
  id: string;
  brand: "Visa" | "Mastercard" | "Mercado Pago" | "Apple Pay";
  label: string;
  sub: string;
};

export type Booking = {
  trip: Trip;
  seatId: string;
  confirmation: string;
  date: string;
  passenger: string;
};

export type TabKey = "inicio" | "viajes" | "pase" | "club" | "cuenta";

export type ScreenKey =
  | "inicio"
  | "horarios"
  | "asiento"
  | "pago"
  | "pase"
  | "viajes"
  | "club"
  | "cuenta";

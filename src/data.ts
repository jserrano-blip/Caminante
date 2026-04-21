import type { City, PaymentMethod, Trip } from "./types";

export const cities: City[] = [
  {
    id: "tlc",
    name: "Toluca",
    terminal: "Terminal Tollocan",
    short: "TLC",
  },
  {
    id: "aifa",
    name: "Aeropuerto AIFA",
    terminal: "Terminal AIFA",
    short: "AIFA",
  },
  {
    id: "aicm",
    name: "Aeropuerto CDMX (AICM) T1",
    terminal: "Terminal AICM T1",
    short: "AICM",
  },
  {
    id: "santafe",
    name: "Santa Fe",
    terminal: "Terminal Santa Fe",
    short: "SFE",
  },
];

export const trips: Trip[] = [
  {
    id: "t1",
    origin: cities[0],
    destination: cities[1],
    departure: "05:30",
    arrival: "07:15",
    durationMin: 105,
    stops: 0,
    busType: "Sprinter",
    price: 285,
    seatsLeft: 16,
    recommended: true,
  },
  {
    id: "t2",
    origin: cities[0],
    destination: cities[1],
    departure: "07:00",
    arrival: "08:50",
    durationMin: 110,
    stops: 0,
    busType: "Sprinter",
    price: 285,
    seatsLeft: 9,
  },
  {
    id: "t3",
    origin: cities[0],
    destination: cities[1],
    departure: "09:15",
    arrival: "11:20",
    durationMin: 125,
    stops: 1,
    busType: "Coach",
    price: 265,
    seatsLeft: 22,
  },
  {
    id: "t4",
    origin: cities[0],
    destination: cities[1],
    departure: "11:45",
    arrival: "13:35",
    durationMin: 110,
    stops: 0,
    busType: "Sprinter",
    price: 285,
    seatsLeft: 14,
  },
  {
    id: "t5",
    origin: cities[0],
    destination: cities[1],
    departure: "14:00",
    arrival: "16:05",
    durationMin: 125,
    stops: 1,
    busType: "Coach",
    price: 265,
    seatsLeft: 27,
  },
  {
    id: "t6",
    origin: cities[0],
    destination: cities[1],
    departure: "16:30",
    arrival: "18:15",
    durationMin: 105,
    stops: 0,
    busType: "Sprinter",
    price: 285,
    seatsLeft: 6,
  },
  {
    id: "t7",
    origin: cities[0],
    destination: cities[1],
    departure: "19:00",
    arrival: "20:55",
    durationMin: 115,
    stops: 0,
    busType: "Sprinter",
    price: 285,
    seatsLeft: 11,
  },
];

export const paymentMethods: PaymentMethod[] = [
  {
    id: "visa",
    brand: "Visa",
    label: "Visa · •••• 4821",
    sub: "Expira 11/27",
  },
  {
    id: "mp",
    brand: "Mercado Pago",
    label: "Mercado Pago",
    sub: "mariana@correo.com",
  },
  {
    id: "apple",
    brand: "Apple Pay",
    label: "Apple Pay",
    sub: "Tarjeta predeterminada",
  },
];

export const popularRoutes = [
  { from: "Toluca", to: "AIFA", sub: "Aeropuerto" },
  { from: "Toluca", to: "AICM", sub: "Aeropuerto CDMX" },
  { from: "Toluca", to: "Santa Fe", sub: "CDMX" },
  { from: "Toluca", to: "Centro", sub: "CDMX" },
];

export const dayLabels = [
  { key: "hoy", label: "HOY", num: "18", month: "abr" },
  { key: "manana", label: "MAÑANA", num: "19", month: "abr" },
  { key: "lun", label: "LUN", num: "20", month: "abr" },
  { key: "mar", label: "MAR", num: "21", month: "abr" },
  { key: "mie", label: "MIÉ", num: "22", month: "abr" },
  { key: "jue", label: "JUE", num: "23", month: "abr" },
  { key: "vie", label: "VIE", num: "24", month: "abr" },
];

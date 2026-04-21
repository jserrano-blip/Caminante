import type { City, HistoryTrip, PaymentMethod, Stop, Trip } from "./types";

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

export const historyTrips: HistoryTrip[] = [
  {
    id: "h1",
    monthShort: "ABR",
    day: "12",
    route: "Toluca → Santa Fe",
    confirmation: "CAM-8712",
    price: 185,
    status: "completado",
    invoiced: false,
  },
  {
    id: "h2",
    monthShort: "ABR",
    day: "05",
    route: "AICM T1 → Toluca",
    confirmation: "CAM-8544",
    price: 285,
    status: "completado",
    invoiced: false,
  },
  {
    id: "h3",
    monthShort: "MAR",
    day: "28",
    route: "Toluca → AIFA",
    confirmation: "CAM-8401",
    price: 285,
    status: "completado",
    invoiced: true,
  },
  {
    id: "h4",
    monthShort: "MAR",
    day: "14",
    route: "Toluca → Reforma",
    confirmation: "CAM-8210",
    price: 195,
    status: "completado",
    invoiced: false,
  },
  {
    id: "h5",
    monthShort: "MAR",
    day: "02",
    route: "Toluca → AIFA",
    confirmation: "CAM-8003",
    price: 285,
    status: "cancelado",
  },
];

export const liveStops: Stop[] = [
  { id: "s1", name: "Terminal Tollocan", time: "05:30", status: "done" },
  { id: "s2", name: "Toluca Centro", time: "05:42", status: "done" },
  {
    id: "s3",
    name: "Lerma",
    time: "05:58",
    status: "current",
    note: "LLEGANDO AHORA · ETA 05:58",
  },
  {
    id: "s4",
    name: "Santa Fe",
    time: "06:28",
    status: "next",
    note: "Próxima parada",
  },
  { id: "s5", name: "Reforma · Ángel", time: "06:45", status: "future" },
  { id: "s6", name: "AIFA T1", time: "07:15", status: "future" },
];

export const clubBenefits = [
  {
    title: "10% de descuento",
    sub: "En todas las rutas, siempre",
  },
  {
    title: "Cambio de fecha gratis",
    sub: "Hasta 2 h antes de la salida",
  },
  {
    title: "Selección de asiento preferente",
    sub: "Primera fila sin costo",
  },
];

export const clubRewards = [
  { title: "Boleto sencillo", sub: "Rutas CDMX", cost: "500 PTS" },
  { title: "Upgrade AIFA", sub: "Asiento VIP", cost: "1,200 PTS" },
  { title: "Acceso lounge", sub: "Terminal Tollocan", cost: "800 PTS" },
  { title: "Equipaje extra", sub: "+10 kg sin costo", cost: "600 PTS" },
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

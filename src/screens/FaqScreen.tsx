import { useState } from "react";
import { SubScreen } from "../components/SubScreen";
import { useApp } from "../context/AppContext";

type Cat = {
  id: string;
  title: string;
  items: { q: string; a: string[] }[];
};

const categorias: Cat[] = [
  {
    id: "seguridad",
    title: "Seguridad y Seguros",
    items: [
      {
        q: "¿Cómo se aplica el slogan 'Seguridad al Viajar'?",
        a: [
          "Frenos ABS, retardador magnético y sensores de proximidad.",
          "Tacógrafos digitales con velocidad máxima de 95 KPH.",
          "Operadores capacitados y mantenimiento preventivo continuo.",
        ],
      },
      {
        q: "¿Qué cubre el Seguro de Viaje?",
        a: [
          "Póliza de responsabilidad civil; conserva tu boleto.",
          "Pase médico sin costo en caso de accidente.",
          "Reembolsos contra factura.",
          "Indemnización por extravío de equipaje hasta 20 días de salario mínimo.",
          "No incluye robo por terceros.",
        ],
      },
    ],
  },
  {
    id: "boletos",
    title: "Boletos y Descuentos",
    items: [
      {
        q: "¿Qué descuentos están disponibles?",
        a: [
          "INAPAM 50%.",
          "Niños 4 a 11 años 50% (solo en taquilla).",
          "Estudiantes 50% en periodo vacacional, 8 lugares por bus.",
          "Maestros 25% en periodo vacacional, 2 lugares por bus.",
        ],
      },
      {
        q: "¿Puedo cancelar mi boleto?",
        a: [
          "Sin reembolso salvo causa imputable a Caminante (máx. 30 min después de la compra).",
          "Boleto extraviado: sin reposición.",
        ],
      },
    ],
  },
  {
    id: "equipaje",
    title: "Equipaje y Mascotas",
    items: [
      {
        q: "¿Puedo viajar con mi mascota?",
        a: [
          "En maletero sin costo, en caja rígida.",
          "A bordo solo perros lazarillos / apoyo emocional con certificado y cartilla vigente.",
          "Si ocupan asiento, pagan boleto completo.",
        ],
      },
      {
        q: "¿Qué equipaje está permitido?",
        a: [
          "Dispositivos tecnológicos que quepan en asiento, aparatos ortopédicos, equipo deportivo y educativo hasta 25 kg sin costo.",
        ],
      },
      {
        q: "¿Qué está prohibido?",
        a: [
          "Gas, pólvora, solventes, ácidos.",
          "Armas de fuego, objetos punzocortantes y narcóticos.",
        ],
      },
    ],
  },
  {
    id: "servicios",
    title: "Servicios y Facturación",
    items: [
      {
        q: "¿Cómo solicito mi factura?",
        a: [
          "En línea en www.caminante.mx.",
          "En taquilla.",
          "Módulo en Central Poniente (Observatorio).",
          "Teléfono 800-509-7545.",
        ],
      },
      {
        q: "¿Hay WiFi a bordo?",
        a: [
          "Disponible en rutas AICM-Tollocan y Servicio Plus Toluca-Observatorio.",
          "Gratuito, sin garantía de disponibilidad al 100%.",
        ],
      },
    ],
  },
  {
    id: "menores",
    title: "Menores y Privacidad",
    items: [
      {
        q: "¿Pueden viajar menores solos?",
        a: [
          "Menores de 16 y 17 años requieren Carta Responsiva firmada por padre o tutor más copia de identificación, en taquilla.",
        ],
      },
      {
        q: "Videograbación AICM",
        a: [
          "Por seguridad se conserva 48 horas y luego se elimina permanentemente.",
        ],
      },
    ],
  },
  {
    id: "promos",
    title: "Promociones y Reservas",
    items: [
      {
        q: "Viaja Ahorrando",
        a: [
          "Presenta copia de tu confirmación de vuelo más INE en taquilla.",
          "Menores: CURP, Acta de Nacimiento o credencial estudiantil.",
        ],
      },
      {
        q: "Reservaciones aeropuerto",
        a: [
          "Tollocan → AICM: 722 270 44 00.",
          "AICM → Tollocan: 55 5786 9341 / 55 5786 9342.",
        ],
      },
    ],
  },
  {
    id: "pagos",
    title: "Métodos de Pago",
    items: [
      {
        q: "¿Qué métodos aceptan?",
        a: [
          "Efectivo.",
          "Débito y Crédito Visa / Mastercard (no American Express).",
          "Tarjeta prepago Caminante.",
          "App CaminanteQR.",
        ],
      },
    ],
  },
  {
    id: "privacidad",
    title: "Privacidad y Seguridad",
    items: [
      {
        q: "¿Cómo manejan el video CCTV?",
        a: [
          "Acceso solo a personal autorizado.",
          "Resguardo 48 horas y eliminación permanente conforme a la Ley de Protección de Datos.",
        ],
      },
    ],
  },
];

export function FaqScreen() {
  const [open, setOpen] = useState<string | null>("seguridad");
  const { go } = useApp();

  return (
    <SubScreen
      title="Preguntas frecuentes"
      eyebrow="Información y ayuda"
      footer="Última actualización · 2026"
    >
      <div className="space-y-2">
        {categorias.map((c) => {
          const isOpen = open === c.id;
          return (
            <div
              key={c.id}
              className="overflow-hidden rounded-2xl bg-white shadow-card"
            >
              <button
                onClick={() => setOpen(isOpen ? null : c.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-[13px] font-semibold text-ink">
                  {c.title}
                </span>
                <span
                  className={`text-ink-muted transition ${
                    isOpen ? "rotate-90" : ""
                  }`}
                >
                  ›
                </span>
              </button>
              {isOpen && (
                <div className="space-y-3 border-t border-ink/5 bg-cream-50/40 px-4 py-3">
                  {c.items.map((it) => (
                    <div key={it.q}>
                      <div className="text-[12px] font-semibold text-ink">
                        {it.q}
                      </div>
                      <ul className="mt-1 space-y-1 text-[12px] text-ink-soft">
                        {it.a.map((line) => (
                          <li key={line} className="flex gap-1.5">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-wine" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <button
          onClick={() => go("privacidad")}
          className="mt-4 w-full rounded-xl border border-wine py-3 text-[12px] font-semibold text-wine"
        >
          Ver Aviso de Privacidad completo
        </button>
      </div>
    </SubScreen>
  );
}

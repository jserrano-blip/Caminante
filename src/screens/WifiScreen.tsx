import { SubScreen } from "../components/SubScreen";

const beneficios = [
  "Sin costo adicional para pasajeros.",
  "Ideal para mensajería, correos y navegación ligera.",
  "Sujeto a cuota de megas por viaje.",
  "Sin garantía de disponibilidad al 100%.",
];

const factores = [
  { icon: "📉", title: "Ancho de banda limitado", sub: "Compartido entre pasajeros" },
  { icon: "🚇", title: "Interrupciones en túneles", sub: "Pérdida temporal de señal" },
  { icon: "🏔️", title: "Baja señal en La Marquesa", sub: "Zona montañosa" },
  { icon: "✈️", title: "Zonas de sombra en AICM", sub: "Cobertura intermitente" },
];

const rutas = [
  "AICM ↔ Tollocan",
  "Servicio Plus · Toluca ↔ Observatorio",
];

export function WifiScreen() {
  return (
    <SubScreen title="WiFi a bordo" eyebrow="Información y ayuda">
      <section>
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          Sobre el servicio
        </div>
        <ul className="space-y-2 rounded-2xl bg-white p-4 text-[12px] text-ink shadow-card">
          {beneficios.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-wine" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          Factores que afectan la conexión
        </div>
        <div className="grid grid-cols-2 gap-2">
          {factores.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl bg-white p-3 shadow-card"
            >
              <div className="text-[20px]">{f.icon}</div>
              <div className="mt-1 text-[12px] font-semibold text-ink">
                {f.title}
              </div>
              <div className="text-[10px] text-ink-muted">{f.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-700">
          ⚠ Aviso importante
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-amber-900">
          Operamos sobre redes celulares comerciales. Recomendamos descargar
          archivos importantes antes de abordar.
        </p>
      </section>

      <section className="mt-6">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          Rutas con este servicio
        </div>
        <div className="flex flex-wrap gap-2">
          {rutas.map((r) => (
            <span
              key={r}
              className="rounded-full bg-emerald-100 px-3 py-1.5 text-[11px] font-semibold text-emerald-800"
            >
              ✓ {r}
            </span>
          ))}
        </div>
      </section>
    </SubScreen>
  );
}

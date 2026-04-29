import { useApp } from "../context/AppContext";
import type { ScreenKey } from "../types";

type Row = { key: string; label: string; sub?: string };

type HelpRow = {
  key: string;
  label: string;
  icon: string;
  target: ScreenKey;
};

const pasajeroRows: Row[] = [
  { key: "facturacion", label: "Datos de facturación", sub: "RFC · Razón social" },
  { key: "frecuentes", label: "Pasajeros frecuentes", sub: "2 agregados" },
  {
    key: "pago",
    label: "Método de pago preferido",
    sub: "Visa •••• 4821",
  },
];

const prefsRows: Row[] = [
  { key: "notif", label: "Notificaciones", sub: "Push, correo, WhatsApp" },
  { key: "idioma", label: "Idioma", sub: "Español (México)" },
  { key: "a11y", label: "Accesibilidad", sub: "Texto estándar" },
];

const helpRows: HelpRow[] = [
  { key: "faq", label: "Preguntas frecuentes", icon: "❓", target: "faq" },
  { key: "terminos", label: "Términos y condiciones", icon: "📄", target: "terminos" },
  { key: "menores", label: "Política de menores", icon: "🧒", target: "menores" },
  { key: "wifi", label: "WiFi a bordo", icon: "📶", target: "wifi" },
  { key: "ahorrando", label: "Viaja Ahorrando", icon: "✈️", target: "ahorrando" },
  { key: "privacidad", label: "Aviso de privacidad", icon: "🛡️", target: "privacidad" },
];

const soporteRows: Row[] = [
  { key: "contacto", label: "Atención al cliente", sub: "55 6829 1934" },
];

export function CuentaScreen() {
  const { showToast, go } = useApp();

  return (
    <div className="flex h-full flex-col">
      <header className="px-6 pt-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
          Cuenta
        </div>
        <h1 className="font-serif text-[28px] leading-tight text-ink">
          Mi perfil
        </h1>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-28 pt-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-wine font-serif text-[22px] text-cream-50">
            M
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-semibold text-ink">
              Mariana López C.
            </div>
            <div className="text-[11px] text-ink-muted">
              mariana.lopez@correo.com
            </div>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-ink/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-ink" />
              Plata
            </span>
          </div>
          <button
            onClick={() => showToast("Editar perfil · próximamente")}
            className="text-[12px] font-semibold text-wine"
          >
            Editar
          </button>
        </div>

        <Section title="Pasajero" rows={pasajeroRows} onTap={showToast} />
        <Section title="Preferencias" rows={prefsRows} onTap={showToast} />

        <section className="mt-5">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            Información y ayuda
          </div>
          <div className="overflow-hidden rounded-2xl bg-white shadow-card">
            {helpRows.map((r, i) => (
              <button
                key={r.key}
                onClick={() => go(r.target)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left ${
                  i > 0 ? "border-t border-ink/5" : ""
                }`}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cream-100 text-[14px]">
                  {r.icon}
                </span>
                <span className="flex-1 text-[13px] font-semibold text-ink">
                  {r.label}
                </span>
                <span className="text-ink-muted">›</span>
              </button>
            ))}
          </div>
        </section>

        <Section title="Soporte" rows={soporteRows} onTap={showToast} />

        <button
          onClick={() => showToast("Sesión cerrada (demo)")}
          className="mt-4 w-full rounded-xl border border-ink/10 bg-white py-3 text-center text-[13px] font-semibold text-wine shadow-card"
        >
          Cerrar sesión
        </button>

        <div className="mt-6 text-center text-[10px] text-ink-muted">
          Caminante · v0.1 demo
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  rows,
  onTap,
}: {
  title: string;
  rows: Row[];
  onTap: (msg: string) => void;
}) {
  return (
    <section className="mt-5">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
        {title}
      </div>
      <div className="overflow-hidden rounded-2xl bg-white shadow-card">
        {rows.map((r, i) => (
          <button
            key={r.key}
            onClick={() => onTap(`${r.label} · próximamente`)}
            className={`flex w-full items-center justify-between px-4 py-3 text-left ${
              i > 0 ? "border-t border-ink/5" : ""
            }`}
          >
            <div>
              <div className="text-[13px] font-semibold text-ink">
                {r.label}
              </div>
              {r.sub && (
                <div className="text-[11px] text-ink-muted">{r.sub}</div>
              )}
            </div>
            <span className="text-ink-muted">›</span>
          </button>
        ))}
      </div>
    </section>
  );
}

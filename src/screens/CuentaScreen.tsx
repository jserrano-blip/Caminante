import { useApp } from "../context/AppContext";

const rows = [
  { key: "profile", label: "Datos personales", sub: "Mariana López · mariana@correo.com" },
  { key: "payment", label: "Métodos de pago", sub: "Visa · •••• 4821" },
  { key: "docs", label: "Identificación", sub: "INE verificada" },
  { key: "notif", label: "Notificaciones", sub: "Push, email y SMS" },
  { key: "help", label: "Ayuda", sub: "Centro de soporte" },
  { key: "signout", label: "Cerrar sesión", sub: undefined },
];

export function CuentaScreen() {
  const { showToast } = useApp();

  return (
    <div className="flex h-full flex-col">
      <header className="px-6 pt-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
          Mi cuenta
        </div>
        <h1 className="font-serif text-[28px] leading-tight text-ink">
          Hola, Mariana
        </h1>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-28 pt-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-wine/15 font-serif text-[22px] text-wine">
            M
          </div>
          <div>
            <div className="text-[14px] font-semibold text-ink">
              Mariana López C.
            </div>
            <div className="text-[11px] text-ink-muted">
              Miembro Plata · 2430 pts
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-card">
          {rows.map((r, i) => (
            <button
              key={r.key}
              onClick={() =>
                showToast(
                  r.key === "signout"
                    ? "Sesión cerrada (demo)"
                    : `${r.label} · próximamente`,
                )
              }
              className={`flex w-full items-center justify-between px-4 py-3 text-left ${
                i > 0 ? "border-t border-ink/5" : ""
              } ${r.key === "signout" ? "text-wine" : "text-ink"}`}
            >
              <div>
                <div className="text-[13px] font-semibold">{r.label}</div>
                {r.sub && (
                  <div className="text-[11px] text-ink-muted">{r.sub}</div>
                )}
              </div>
              <span className="text-ink-muted">›</span>
            </button>
          ))}
        </div>

        <div className="mt-6 text-center text-[10px] text-ink-muted">
          Caminante · v0.1 demo
        </div>
      </div>
    </div>
  );
}

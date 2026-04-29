import { SubScreen } from "../components/SubScreen";
import { useApp } from "../context/AppContext";

const URL = "https://caminante.mx/AvisoPrivacidad.pdf";

const puntos = [
  {
    titulo: "Datos personales recabados",
    desc: "Nombre, correo electrónico, teléfono y, en su caso, datos de facturación o identificación oficial.",
  },
  {
    titulo: "Finalidades del tratamiento",
    desc: "Emitir boletos, facturar, brindar atención al cliente, prevenir fraudes y operar el programa de lealtad Camina+.",
  },
  {
    titulo: "Transferencias",
    desc: "Compartimos datos sólo con proveedores estrictamente necesarios (procesadores de pago, mensajería) bajo cláusulas de confidencialidad.",
  },
  {
    titulo: "Derechos ARCO",
    desc: "Puedes acceder, rectificar, cancelar u oponerte al tratamiento de tus datos escribiendo a privacidad@caminante.mx.",
  },
  {
    titulo: "Videovigilancia",
    desc: "Las cámaras del andén AICM se conservan 48 horas y se eliminan permanentemente conforme a la Ley de Protección de Datos.",
  },
];

export function PrivacidadScreen() {
  const { showToast } = useApp();

  return (
    <SubScreen
      title="Aviso de privacidad"
      eyebrow="Información y ayuda"
      footer="© 2026 TMT Caminante. Todos los derechos reservados."
    >
      <div className="rounded-2xl bg-ink p-5 text-cream-50 shadow-card">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-cream-50/10 text-[20px]">
            🛡️
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-50/60">
              Documento oficial
            </div>
            <div className="font-serif text-[18px] text-cream-50">
              Aviso de Privacidad
            </div>
          </div>
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-cream-50/80">
          Este resumen describe los puntos principales. El documento completo
          se encuentra disponible como PDF descargable.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            href={URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => showToast("Abriendo PDF…")}
            className="rounded-xl bg-cream-50 py-2.5 text-center text-[12px] font-semibold text-ink"
          >
            ⬇ Descargar PDF
          </a>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(URL).catch(() => {});
              showToast("Enlace copiado");
            }}
            className="rounded-xl border border-cream-50/30 py-2.5 text-center text-[12px] font-semibold text-cream-50"
          >
            ↗ Compartir
          </button>
        </div>
      </div>

      <section className="mt-5">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          Puntos clave
        </div>
        <div className="space-y-2">
          {puntos.map((p) => (
            <div key={p.titulo} className="rounded-2xl bg-white p-4 shadow-card">
              <div className="text-[12px] font-semibold text-ink">
                {p.titulo}
              </div>
              <div className="mt-1 text-[12px] text-ink-soft">{p.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </SubScreen>
  );
}

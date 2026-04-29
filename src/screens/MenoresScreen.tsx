import { SubScreen } from "../components/SubScreen";
import { useApp } from "../context/AppContext";

const descuentos = [
  {
    rango: "0 a 3 años 11 meses",
    desc: "Gratuito · comparten asiento con un adulto con boleto pagado.",
  },
  {
    rango: "4 a 11 años 11 meses",
    desc: "50% de descuento · viajando acompañados de un adulto.",
  },
];

const pasos = [
  "Compra del boleto al 100% del costo.",
  "Presentarse en taquilla con padre o tutor.",
  "Entregar Carta Responsiva debidamente llenada y firmada.",
  "Entregar copia de la identificación oficial del padre o tutor.",
];

const documentos = [
  {
    label: "Carta Responsiva",
    desc: "PDF descargable",
    href: "https://tmt-caminante.com.mx/pdf/CartaResponsivaMenores.pdf",
  },
  {
    label: "Aviso de Privacidad para Menores",
    desc: "PDF descargable",
    href: "https://tmt-caminante.com.mx/pdf/AvisoPrivacidadMenores.pdf",
  },
];

export function MenoresScreen() {
  const { showToast } = useApp();

  return (
    <SubScreen title="Política de menores" eyebrow="Información y ayuda">
      <section>
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          Descuentos por edad
        </div>
        <div className="space-y-2">
          {descuentos.map((d) => (
            <div
              key={d.rango}
              className="rounded-2xl bg-white p-4 shadow-card"
            >
              <div className="text-[13px] font-semibold text-ink">
                {d.rango}
              </div>
              <div className="mt-1 text-[12px] text-ink-soft">{d.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          Menores de 16 y 17 años no acompañados
        </div>
        <ol className="space-y-2 rounded-2xl bg-white p-4 text-[12px] text-ink shadow-card">
          {pasos.map((p, i) => (
            <li key={p} className="flex gap-3">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-wine/10 text-[11px] font-semibold text-wine">
                {i + 1}
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          Documentos descargables
        </div>
        <div className="space-y-2">
          {documentos.map((d) => (
            <a
              key={d.href}
              href={d.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => showToast(`Abriendo ${d.label}`)}
              className="flex items-center justify-between rounded-2xl bg-white p-4 text-left shadow-card"
            >
              <div>
                <div className="text-[13px] font-semibold text-ink">
                  {d.label}
                </div>
                <div className="text-[11px] text-ink-muted">{d.desc}</div>
              </div>
              <span className="rounded-full bg-wine/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-wine">
                PDF ↗
              </span>
            </a>
          ))}
        </div>
      </section>
    </SubScreen>
  );
}

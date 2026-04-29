import { SubScreen } from "../components/SubScreen";
import { useApp } from "../context/AppContext";

const URL = "https://www.vivaaerobus.com/es-mx/promociones/viaja-ahorrando";

const pasos = [
  "Presenta copia de tu confirmación de vuelo.",
  "Presenta copia de tu INE (de todos los registrados en el vuelo).",
  "Menores: CURP, Acta de Nacimiento o credencial de estudiante vigente.",
];

export function AhorrandoScreen() {
  const { showToast } = useApp();

  return (
    <SubScreen
      title="Viaja Ahorrando"
      eyebrow="Promoción aliada · Viva Aerobus"
    >
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#26b14c] to-[#1f8e3d] p-5 text-white shadow-card">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/80">
          Promoción
        </div>
        <h2 className="mt-1 font-serif text-[24px] leading-tight">
          Viaja en avión y conecta con Caminante
        </h2>
        <p className="mt-2 text-[12px] text-white/85">
          Viva Aerobus + Caminante: presenta tu confirmación de vuelo y obtén
          beneficios al comprar boletos terrestres en taquilla.
        </p>
      </div>

      <section className="mt-5">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          Cómo hacer válida la promo
        </div>
        <ol className="space-y-2 rounded-2xl bg-white p-4 text-[12px] text-ink shadow-card">
          {pasos.map((p, i) => (
            <li key={p} className="flex gap-3">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700">
                {i + 1}
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-5 rounded-2xl border border-dashed border-ink/15 bg-cream-50/60 p-4 text-[11px] text-ink-muted">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink">
          Sitio oficial
        </div>
        <p className="mt-1">
          Consulta vigencia y reglas en el sitio de Viva Aerobus. En la app
          móvil real, esta página se carga en un WebView interno con opción de
          abrir externamente.
        </p>
        <a
          href={URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => showToast("Abriendo en navegador externo")}
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-ink px-4 py-3 text-center text-[12px] font-semibold text-cream-50"
        >
          Abrir en vivaaerobus.com ↗
        </a>
      </section>
    </SubScreen>
  );
}

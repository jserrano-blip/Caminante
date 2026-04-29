import { SubScreen } from "../components/SubScreen";
import { useApp } from "../context/AppContext";

const condiciones = [
  "Aceptar videograbación CCTV y fotografía al ingresar al andén.",
  "Permitir revisión de equipaje de mano y almacenamiento en cajuela.",
  "Permitir revisión física (cacheo) antes de abordar.",
  "No se permite acceso en estado de ebriedad o bajo influencia de drogas (salvo prescripción médica).",
  "No se aceptan pagos parciales o combinados para un solo boleto.",
  "Conexión eléctrica: sujeta a disponibilidad, exclusiva para celulares/tablets/laptops (máx. 25 W) sin garantía sobre dispositivos.",
];

const protocolo = [
  "No se permite al comprar ni al abordar: gorras, gorros o sombreros.",
  "No se permite usar gafas obscuras durante la identificación.",
];

const prohibidos = [
  "Armas de fuego.",
  "Objetos punzocortantes.",
  "Bebidas alcohólicas.",
  "Líquidos o gases inflamables.",
  "Fuegos artificiales.",
];

export function TerminosScreen() {
  const { go } = useApp();

  return (
    <SubScreen
      title="Términos y condiciones"
      eyebrow="Información y ayuda"
      footer="© 2026 TMT Caminante"
    >
      <div className="rounded-2xl border border-wine/30 bg-wine/5 p-4 text-[12px] text-wine-700">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-wine">
          Aceptación al viajar
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-ink">
          Al viajar en Caminante aceptas los lineamientos de seguridad y
          operación. <span className="font-semibold text-wine">Si no aceptas los Términos, no podrás viajar.</span>
        </p>
      </div>

      <Section title="Condiciones generales" items={condiciones} />
      <Section title="Lineamientos de seguridad (identificación)" items={protocolo} />
      <Section title="Objetos prohibidos" items={prohibidos} />

      <button
        onClick={() => go("privacidad")}
        className="mt-5 w-full rounded-xl bg-wine py-3 text-[13px] font-semibold text-cream-50 hover:bg-wine-700"
      >
        Ver Aviso de Privacidad
      </button>
    </SubScreen>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-5">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
        {title}
      </div>
      <ul className="space-y-2 rounded-2xl bg-white p-4 text-[12px] text-ink shadow-card">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-wine" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

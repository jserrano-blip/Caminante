import { useApp } from "../context/AppContext";
import { ArrowRight, ChevronLeft, PlusIcon } from "../components/Icons";

const OCCUPIED = new Set(["2A", "3B", "4C"]);

const rows = [1, 2, 3, 4, 5];
const leftCols: Array<"A" | "B"> = ["A", "B"];

export function AsientoScreen() {
  const { selectedTrip, selectedSeat, selectSeat, go } = useApp();

  if (!selectedTrip) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-ink-muted">
        Selecciona una corrida para elegir asiento.
      </div>
    );
  }

  const getStatus = (id: string): "occupied" | "selected" | "available" => {
    if (OCCUPIED.has(id)) return "occupied";
    if (selectedSeat === id) return "selected";
    return "available";
  };

  const isWindow = (id: string) => id.endsWith("A") || id.endsWith("C");

  return (
    <div className="flex h-full flex-col">
      <header className="px-6 pt-2">
        <button
          onClick={() => go("horarios")}
          className="-ml-1 grid h-8 w-8 place-items-center rounded-full text-ink"
          aria-label="Atrás"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="mt-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            Salida mañana · {selectedTrip.departure}
          </div>
          <h1 className="mt-1 font-serif text-[26px] leading-tight text-ink">
            Elige tu asiento
          </h1>
        </div>

        <div className="mt-4 flex items-center gap-4 text-[10px] text-ink-muted">
          <Legend swatch="bg-white border border-ink/15" label="Disponible" />
          <Legend swatch="bg-wine" label="Tu selección" textLight />
          <Legend swatch="bg-ink/15" label="Ocupado" />
        </div>
      </header>

      <div className="no-scrollbar relative mt-4 flex-1 overflow-y-auto px-6 pb-36">
        <div className="rounded-3xl bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
              Conductor
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-full border border-dashed border-ink/30 text-ink-muted">
              <PlusIcon className="h-4 w-4" />
            </div>
          </div>

          <div className="grid grid-cols-[20px_1fr_44px_1fr] items-center gap-y-3">
            {rows.map((r) => (
              <RowBlock
                key={r}
                row={r}
                getStatus={getStatus}
                isWindow={isWindow}
                onPick={selectSeat}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-4 bottom-6 z-30 flex items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 text-cream-50 shadow-phone">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-cream-50/60">
            {selectedSeat
              ? `Asiento ${selectedSeat} · ${
                  isWindow(selectedSeat) ? "Ventana" : "Pasillo"
                }`
              : "Elige tu asiento"}
          </div>
          <div className="font-serif text-[20px]">
            ${selectedTrip.price} MXN
          </div>
        </div>
        <button
          onClick={() => selectedSeat && go("pago")}
          disabled={!selectedSeat}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition ${
            selectedSeat
              ? "bg-wine text-cream-50 hover:bg-wine-700"
              : "bg-cream-50/10 text-cream-50/40"
          }`}
        >
          Continuar <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Legend({
  swatch,
  label,
  textLight,
}: {
  swatch: string;
  label: string;
  textLight?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-sm ${swatch}`} />
      <span className={textLight ? "text-ink-muted" : "text-ink-muted"}>
        {label}
      </span>
    </div>
  );
}

function RowBlock({
  row,
  getStatus,
  isWindow,
  onPick,
}: {
  row: number;
  getStatus: (id: string) => "occupied" | "selected" | "available";
  isWindow: (id: string) => boolean;
  onPick: (id: string) => void;
}) {
  const left = leftCols.map((c) => `${row}${c}`);
  const right = `${row}C`;
  return (
    <>
      <div className="text-[10px] text-ink-muted">{row}</div>
      <div className="flex items-center justify-start gap-2">
        {left.map((id) => (
          <SeatBtn
            key={id}
            id={id}
            status={getStatus(id)}
            window={isWindow(id)}
            onClick={() => onPick(id)}
          />
        ))}
      </div>
      <div className="flex items-center justify-center">
        <span className="text-[10px] italic text-ink-muted">pasillo</span>
      </div>
      <div className="flex justify-end">
        <SeatBtn
          id={right}
          status={getStatus(right)}
          window
          onClick={() => onPick(right)}
        />
      </div>
    </>
  );
}

function SeatBtn({
  id,
  status,
  window,
  onClick,
}: {
  id: string;
  status: "occupied" | "selected" | "available";
  window: boolean;
  onClick: () => void;
}) {
  const base =
    "grid h-11 w-11 place-items-center rounded-lg text-[12px] font-semibold transition";
  let cls = "bg-white text-ink border border-ink/15 hover:border-ink/40";
  if (status === "occupied")
    cls = "bg-ink/10 text-ink-muted cursor-not-allowed";
  if (status === "selected") cls = "bg-wine text-cream-50 ring-2 ring-wine/30";
  return (
    <button
      onClick={onClick}
      disabled={status === "occupied"}
      className={`${base} ${cls}`}
      aria-label={`Asiento ${id}${window ? " ventana" : " pasillo"}`}
    >
      {id}
    </button>
  );
}

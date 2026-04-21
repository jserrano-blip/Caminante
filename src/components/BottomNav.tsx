import type { SVGProps } from "react";
import { useApp } from "../context/AppContext";
import type { TabKey } from "../types";
import {
  BusIcon,
  ClubIcon,
  HomeIcon,
  QrIcon,
  UserIcon,
} from "./Icons";

type Item = {
  key: TabKey;
  label: string;
  Icon: (p: SVGProps<SVGSVGElement>) => React.ReactElement;
};

const items: Item[] = [
  { key: "inicio", label: "Inicio", Icon: HomeIcon },
  { key: "viajes", label: "Viajes", Icon: BusIcon },
  { key: "pase", label: "Pase", Icon: QrIcon },
  { key: "club", label: "Club", Icon: ClubIcon },
  { key: "cuenta", label: "Cuenta", Icon: UserIcon },
];

export function BottomNav() {
  const { tab, setTab } = useApp();
  return (
    <nav className="relative border-t border-ink/5 bg-cream-50/95 pt-2 pb-5 backdrop-blur">
      <ul className="grid grid-cols-5 px-2">
        {items.map(({ key, label, Icon }) => {
          const active = tab === key;
          return (
            <li key={key}>
              <button
                onClick={() => setTab(key)}
                className={`flex w-full flex-col items-center gap-1 py-1 transition ${
                  active ? "text-wine" : "text-ink-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span
                  className={`text-[10px] ${
                    active ? "font-semibold" : "font-medium"
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mx-auto mt-1 h-[5px] w-32 rounded-full bg-ink/70" />
    </nav>
  );
}

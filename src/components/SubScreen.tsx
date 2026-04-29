import type { ReactNode } from "react";
import { useApp } from "../context/AppContext";
import { ChevronLeft } from "./Icons";

type Props = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function SubScreen({ title, eyebrow, children, footer }: Props) {
  const { go } = useApp();
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-ink/5 bg-cream-50/80 px-4 py-3 backdrop-blur">
        <button
          onClick={() => go("cuenta")}
          className="-ml-1 grid h-8 w-8 place-items-center rounded-full text-ink"
          aria-label="Volver a Mi Perfil"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          {eyebrow && (
            <div className="text-[9px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
              {eyebrow}
            </div>
          )}
          <h1 className="font-serif text-[18px] leading-tight text-ink">
            {title}
          </h1>
        </div>
      </header>
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-4 pb-10">
        {children}
      </div>
      {footer && (
        <footer className="border-t border-ink/5 bg-cream-50/90 px-5 py-3 text-center text-[10px] text-ink-muted backdrop-blur">
          {footer}
        </footer>
      )}
    </div>
  );
}

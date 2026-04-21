import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  caption?: string;
  title?: string;
  highlight?: string;
};

export function PhoneFrame({ children, caption, title, highlight }: Props) {
  return (
    <div className="relative flex w-full max-w-[420px] flex-col items-center">
      {caption && (
        <div className="mb-3 self-start text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-muted/70">
          {caption}
        </div>
      )}

      <div className="relative rounded-phone bg-ink shadow-phone p-[10px]">
        <div className="relative h-[812px] w-[375px] overflow-hidden rounded-[2.25rem] bg-cream-100">
          <div className="pointer-events-none absolute left-1/2 top-[10px] z-40 h-[26px] w-[118px] -translate-x-1/2 rounded-full bg-ink" />

          <div className="absolute inset-0 z-10 flex flex-col">
            <StatusBar />
            <div className="flex-1 overflow-hidden">{children}</div>
          </div>
        </div>
      </div>

      {(title || highlight) && (
        <div className="mt-4 self-end text-right font-serif text-xl leading-tight text-ink">
          {title && <div>{title}</div>}
          {highlight && (
            <div className="italic text-wine">{highlight}</div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBar() {
  return (
    <div className="relative z-20 flex h-11 items-center justify-between px-7 pt-2 text-[13px] font-semibold text-ink">
      <span>9:41</span>
      <div className="flex items-center gap-1.5 opacity-90">
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  );
}

const SignalIcon = () => (
  <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor">
    <rect x="0" y="7" width="2.5" height="3" rx="0.5" />
    <rect x="3.5" y="5" width="2.5" height="5" rx="0.5" />
    <rect x="7" y="3" width="2.5" height="7" rx="0.5" />
    <rect x="10.5" y="1" width="2.5" height="9" rx="0.5" />
  </svg>
);

const WifiIcon = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.3">
    <path d="M1 3.5c3.5-3 8.5-3 12 0" />
    <path d="M3 5.5c2.3-1.9 5.7-1 8 0" />
    <circle cx="7" cy="8" r="0.9" fill="currentColor" />
  </svg>
);

const BatteryIcon = () => (
  <svg width="24" height="11" viewBox="0 0 24 11" fill="none">
    <rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke="currentColor" />
    <rect x="2" y="2" width="17" height="7" rx="1.5" fill="currentColor" />
    <rect x="21.5" y="3.5" width="1.5" height="4" rx="0.5" fill="currentColor" />
  </svg>
);

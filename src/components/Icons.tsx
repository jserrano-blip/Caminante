import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const HomeIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1v-7.5Z" />
  </svg>
);

export const BusIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="5" y="4" width="14" height="14" rx="2" />
    <path d="M5 12h14M8 18v2M16 18v2" />
    <circle cx="9" cy="15.5" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="15" cy="15.5" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

export const QrIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="4" y="4" width="6" height="6" rx="1" />
    <rect x="14" y="4" width="6" height="6" rx="1" />
    <rect x="4" y="14" width="6" height="6" rx="1" />
    <path d="M14 14h2v2M18 14v2M14 18h2M18 18h2v2" />
  </svg>
);

export const ClubIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 3 8 9h8l-4-6Z" />
    <path d="M6 9h12l-6 11L6 9Z" />
  </svg>
);

export const UserIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" />
  </svg>
);

export const ChevronLeft = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="m14 6-6 6 6 6" />
  </svg>
);

export const ChevronRight = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="m10 6 6 6-6 6" />
  </svg>
);

export const BellIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);

export const SwapIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M7 5v12m0 0-3-3m3 3 3-3M17 19V7m0 0-3 3m3-3 3 3" />
  </svg>
);

export const OriginDot = (p: P) => (
  <svg viewBox="0 0 24 24" {...p}>
    <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" />
  </svg>
);

export const DestDiamond = (p: P) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path d="M12 4 20 12 12 20 4 12Z" fill="currentColor" />
  </svg>
);

export const PlusIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const ArrowRight = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M5 12h14m0 0-5-5m5 5-5 5" />
  </svg>
);

export const ClockIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l2.5 2" />
  </svg>
);

export const CalendarIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="4" y="6" width="16" height="14" rx="2" />
    <path d="M4 10h16M8 4v4M16 4v4" />
  </svg>
);

export const UsersIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="9" cy="9" r="3" />
    <path d="M3 19c.8-3 3.3-4.5 6-4.5s5.2 1.5 6 4.5" />
    <path d="M15 10a3 3 0 1 0 0-6M21 19c-.3-1.4-1-2.5-2-3.3" />
  </svg>
);

export const CheckIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="m5 12 4 4 10-10" />
  </svg>
);

export const ShareIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="m8.2 10.7 7.6-3.4M8.2 13.3l7.6 3.4" />
  </svg>
);

export const WalletIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M3 10h18M17 15h.01" />
  </svg>
);

// Riso-style line icons — bold ink strokes that match the bespoke art far better
// than system emoji (which render inconsistently across OS/browsers). All take a
// size + inherit currentColor. Decorative by default (aria-hidden); pass a title
// for a labelled icon.

type IconProps = { size?: number; className?: string; title?: string; strokeWidth?: number };

function Svg({ size = 20, className, title, children, strokeWidth = 2 }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function MicIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
      <line x1="12" y1="17.5" x2="12" y2="21" />
      <line x1="8.5" y1="21" x2="15.5" y2="21" />
    </Svg>
  );
}

export function SpeakerIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 9v6h3l5 4V5L7 9H4Z" />
      <path d="M16 8.5a4 4 0 0 1 0 7" />
      <path d="M18.5 6a7 7 0 0 1 0 12" />
    </Svg>
  );
}

export function LockIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
      <circle cx="12" cy="15.5" r="1.4" />
    </Svg>
  );
}

export function ChainIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9.5 14.5a3.5 3.5 0 0 1 0-5l2-2a3.5 3.5 0 0 1 5 5l-1 1" />
      <path d="M14.5 9.5a3.5 3.5 0 0 1 0 5l-2 2a3.5 3.5 0 0 1-5-5l1-1" />
    </Svg>
  );
}

export function StorageIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <ellipse cx="12" cy="5.5" rx="7.5" ry="2.8" />
      <path d="M4.5 5.5v6c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-6" />
      <path d="M4.5 11.5v6c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-6" />
    </Svg>
  );
}

export function ShieldCheckIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 2.5 5 5v6c0 4.2 2.9 7.7 7 9 4.1-1.3 7-4.8 7-9V5l-7-2.5Z" />
      <path d="M9 12l2 2 4-4.5" />
    </Svg>
  );
}

export function StarIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3l2.6 5.6 6 .7-4.5 4 1.3 6L12 16.9 6.6 19.3l1.3-6-4.5-4 6-.7L12 3Z" />
    </Svg>
  );
}

export function CpuIcon(p: IconProps) {
  // stands in for "model / compute"
  return (
    <Svg {...p}>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <rect x="10" y="10" width="4" height="4" rx="0.5" />
      <path d="M10 3v2M14 3v2M10 19v2M14 19v2M3 10h2M3 14h2M19 10h2M19 14h2" />
    </Svg>
  );
}

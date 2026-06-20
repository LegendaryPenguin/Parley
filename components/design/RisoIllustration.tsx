"use client";

import { motion } from "framer-motion";

// Procedural two-color risograph scenes + NPC portraits. Placeholder art for
// early rounds (Brief §6.1) — riso-illustrate later. Built with overprint
// misregistration: shapes duplicated in blue + pink, offset, multiply-blended.

const BLUE = "var(--riso-blue)";
const PINK = "var(--riso-pink)";
const INK = "var(--ink)";
const MARIGOLD = "var(--marigold)";

function Overprint({ children }: { children: React.ReactNode }) {
  return (
    <>
      <g style={{ mixBlendMode: "multiply" }} transform="translate(-2,1.5)" opacity={0.85}>
        {children}
      </g>
    </>
  );
}

function MarketScene() {
  return (
    <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="280" fill={BLUE} opacity={0.1} />
      {/* lanterns */}
      {[60, 150, 250, 340].map((x, i) => (
        <g key={x}>
          <line x1={x} y1={0} x2={x} y2={40} stroke={INK} strokeWidth={1.5} />
          <motion.ellipse
            cx={x}
            cy={52}
            rx={16}
            ry={20}
            fill={i % 2 ? PINK : MARIGOLD}
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>
      ))}
      {/* stall awning */}
      <Overprint>
        <path d="M30 120 L370 120 L350 95 L50 95 Z" fill={PINK} />
      </Overprint>
      <path d="M30 120 L370 120 L350 95 L50 95 Z" fill="none" stroke={INK} strokeWidth={2} />
      {[60, 110, 160, 210, 260, 310, 360].map((x) => (
        <line key={x} x1={x} y1={95} x2={x} y2={120} stroke={INK} strokeWidth={1} />
      ))}
      {/* crates of oranges */}
      <rect x="70" y="180" width="110" height="60" fill={MARIGOLD} stroke={INK} strokeWidth={2} />
      {[0, 1, 2, 3, 4].map((i) =>
        [0, 1, 2].map((j) => (
          <circle
            key={`${i}-${j}`}
            cx={88 + i * 22}
            cy={198 + j * 18}
            r={8}
            fill={MARIGOLD}
            stroke={INK}
            strokeWidth={1.5}
          />
        )),
      )}
      <rect x="220" y="190" width="100" height="50" fill={BLUE} opacity={0.5} stroke={INK} strokeWidth={2} />
      <text x="270" y="220" textAnchor="middle" fontFamily="var(--font-bricolage)" fontSize="18" fontWeight="800" fill="var(--paper)">
        2€/kg
      </text>
    </svg>
  );
}

function BorderScene() {
  return (
    <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="280" fill={BLUE} opacity={0.08} />
      <Overprint>
        <rect x="120" y="60" width="160" height="160" fill={PINK} opacity={0.6} />
      </Overprint>
      {/* booth */}
      <rect x="120" y="60" width="160" height="160" fill="none" stroke={INK} strokeWidth={2.5} />
      <rect x="120" y="60" width="160" height="40" fill={BLUE} />
      <text x="200" y="86" textAnchor="middle" fontFamily="var(--font-space-mono)" fontSize="13" fill="var(--paper)" letterSpacing="3">
        CONTROL
      </text>
      {/* barrier */}
      <line x1="0" y1="200" x2="120" y2="200" stroke={INK} strokeWidth={4} />
      {[10, 40, 70, 100].map((x) => (
        <line key={x} x1={x} y1={200} x2={x + 16} y2={180} stroke={PINK} strokeWidth={4} />
      ))}
    </svg>
  );
}

function CafeScene() {
  return (
    <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="280" fill={MARIGOLD} opacity={0.08} />
      <Overprint>
        <rect x="0" y="150" width="400" height="130" fill={PINK} opacity={0.35} />
      </Overprint>
      {/* counter */}
      <rect x="40" y="160" width="320" height="80" fill={BLUE} opacity={0.7} stroke={INK} strokeWidth={2} />
      {/* espresso machine */}
      <rect x="250" y="110" width="90" height="55" fill={INK} />
      <circle cx="270" cy="138" r="7" fill={MARIGOLD} />
      <circle cx="320" cy="138" r="7" fill={PINK} />
      {/* cups */}
      {[80, 130, 180].map((x) => (
        <g key={x}>
          <rect x={x} y={140} width={22} height={18} rx={3} fill="var(--paper)" stroke={INK} strokeWidth={1.5} />
          <motion.path
            d={`M${x + 6} 138 q3 -10 0 -18`}
            fill="none"
            stroke={INK}
            strokeWidth={1.2}
            animate={{ opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        </g>
      ))}
    </svg>
  );
}

function HarborScene() {
  return (
    <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="280" fill={BLUE} opacity={0.14} />
      <Overprint>
        <path d="M0 180 q100 -20 200 0 t200 0 v100 H0 Z" fill={PINK} opacity={0.4} />
      </Overprint>
      {/* waves */}
      {[190, 215, 240].map((y, i) => (
        <motion.path
          key={y}
          d={`M0 ${y} q50 -12 100 0 t100 0 t100 0 t100 0`}
          fill="none"
          stroke={BLUE}
          strokeWidth={2}
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {/* boat */}
      <motion.g animate={{ y: [0, 6, 0], rotate: [0, 1.5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "200px 170px" }}>
        <path d="M150 170 L250 170 L235 195 L165 195 Z" fill={MARIGOLD} stroke={INK} strokeWidth={2} />
        <line x1="200" y1="170" x2="200" y2="110" stroke={INK} strokeWidth={2.5} />
        <path d="M200 115 L235 160 L200 160 Z" fill={PINK} stroke={INK} strokeWidth={1.5} />
      </motion.g>
    </svg>
  );
}

function PlatformScene() {
  return (
    <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="280" fill={INK} opacity={0.06} />
      {/* train */}
      <Overprint>
        <rect x="30" y="100" width="340" height="90" rx="10" fill={PINK} opacity={0.5} />
      </Overprint>
      <rect x="30" y="100" width="340" height="90" rx="10" fill={BLUE} stroke={INK} strokeWidth={2.5} />
      {[60, 130, 200, 270, 340].map((x) => (
        <rect key={x} x={x} y={118} width={40} height={34} rx={3} fill="var(--paper)" opacity={0.85} stroke={INK} strokeWidth={1.5} />
      ))}
      <rect x="20" y="190" width="360" height="14" fill={INK} />
      {/* departure light */}
      <motion.circle cx="360" cy="92" r="7" fill={MARIGOLD} animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
    </svg>
  );
}

const SCENES: Record<string, () => React.ReactNode> = {
  market: MarketScene,
  border: BorderScene,
  cafe: CafeScene,
  harbor: HarborScene,
  platform: PlatformScene,
};

export function SceneBackground({ id, alt }: { id: string; alt: string }) {
  const Comp = SCENES[id] ?? MarketScene;
  return (
    <div className="absolute inset-0 overflow-hidden" role="img" aria-label={alt}>
      <Comp />
    </div>
  );
}

// ---- NPC portrait: simple riso character with idle breath + blink ----
const AVATAR_COLORS: Record<string, string> = {
  "officer-border": BLUE,
  "vendor-market": PINK,
  "barista-cafe": MARIGOLD,
  "sailor-harbor": BLUE,
  "agent-platform": INK,
  default: BLUE,
};

export function NPCPortrait({ npcId, name }: { npcId: string; name: string }) {
  const color = AVATAR_COLORS[npcId] ?? AVATAR_COLORS.default;
  return (
    <motion.div
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="relative"
      aria-label={`${name}, a local`}
    >
      <svg viewBox="0 0 140 160" width={120} height={140}>
        <Overprint>
          <ellipse cx="70" cy="150" rx="48" ry="10" fill={PINK} opacity={0.4} />
        </Overprint>
        {/* body */}
        <path d="M30 160 Q30 105 70 105 Q110 105 110 160 Z" fill={color} stroke={INK} strokeWidth={2.5} />
        {/* head */}
        <circle cx="70" cy="70" r="34" fill="var(--paper)" stroke={INK} strokeWidth={2.5} />
        {/* hair / hat hint */}
        <path d="M36 60 Q70 28 104 60 Q88 44 70 44 Q52 44 36 60 Z" fill={INK} />
        {/* eyes (blink) */}
        <motion.g animate={{ scaleY: [1, 1, 0.1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.85, 0.9, 0.95] }} style={{ transformOrigin: "70px 70px" }}>
          <circle cx="58" cy="70" r="3.5" fill={INK} />
          <circle cx="82" cy="70" r="3.5" fill={INK} />
        </motion.g>
        <path d="M60 86 Q70 92 80 86" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}

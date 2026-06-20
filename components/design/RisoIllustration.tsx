"use client";

import { motion, useReducedMotion, useAnimationControls } from "framer-motion";

// Procedural two-color-ish risograph scenes + NPC portraits. Picture-book art
// for early rounds (Brief §6.1). Built with overprint misregistration: shapes
// duplicated and offset, multiply-blended — like a real riso print where the
// color drums never line up perfectly. Reduced-motion stills everything.

const BLUE = "var(--riso-blue)";
const PINK = "var(--riso-pink)";
const INK = "var(--ink)";
const MARIGOLD = "var(--marigold)";
const PINE = "var(--pine)";
const GRAPE = "var(--grape)";
const CORAL = "var(--coral)";
const MINT = "var(--mint)";
const SKY = "var(--sky)";
const SUNNY = "var(--sunny)";
const BUBBLE = "var(--bubble)";
const PAPER = "var(--paper)";

// Misregistered color drum: duplicates art shifted + multiplied so two inks
// "overprint" into a third. dx/dy/color are tunable per use.
function Overprint({
  children,
  dx = -2.5,
  dy = 1.5,
  color,
  opacity = 0.85,
}: {
  children: React.ReactNode;
  dx?: number;
  dy?: number;
  color?: string;
  opacity?: number;
}) {
  return (
    <g
      style={{ mixBlendMode: "multiply", color }}
      transform={`translate(${dx},${dy})`}
      opacity={opacity}
    >
      {children}
    </g>
  );
}

// Scattered halftone dots — the printed-paper speckle, drawn once per scene.
function Speckle({
  color = INK,
  count = 26,
  seed = 1,
  r = 1.4,
  opacity = 0.18,
}: {
  color?: string;
  count?: number;
  seed?: number;
  r?: number;
  opacity?: number;
}) {
  // deterministic pseudo-random so SSR + client match. Round to 2 decimals:
  // Math.sin is NOT bit-identical across JS engines (Node vs browser), so raw
  // floats hydration-mismatch on the last digit. Rounding makes them stringify
  // identically on both sides.
  const round = (n: number) => Math.round(n * 100) / 100;
  const dots = Array.from({ length: count }, (_, i) => {
    const a = Math.sin((i + 1) * 12.9898 * seed) * 43758.5453;
    const b = Math.sin((i + 1) * 78.233 * seed) * 12543.137;
    return {
      x: round((a - Math.floor(a)) * 400),
      y: round((b - Math.floor(b)) * 280),
      rr: round(r * (0.6 + (Math.abs(Math.sin(i * seed)) % 0.8))),
    };
  });
  return (
    <g style={{ mixBlendMode: "multiply" }} opacity={opacity} aria-hidden>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.rr} fill={color} />
      ))}
    </g>
  );
}

// Distant rolling hills — gives outdoor scenes a soft background layer.
function Hills({ y, color, opacity = 0.4 }: { y: number; color: string; opacity?: number }) {
  return (
    <g aria-hidden>
      <Overprint dx={-2} dy={1.5} opacity={opacity * 0.7}>
        <path d={`M-20 ${y + 10} q90 -34 200 -6 t220 0 V280 H-20 Z`} fill={PINK} />
      </Overprint>
      <path d={`M-20 ${y + 10} q90 -34 200 -6 t220 0 V280 H-20 Z`} fill={color} opacity={opacity} />
    </g>
  );
}

// A warm printed sun that lives in most outdoor scenes.
function Sun({ x, y, reduce }: { x: number; y: number; reduce: boolean }) {
  return (
    <g aria-hidden>
      <Overprint dx={-3} dy={2} opacity={0.6}>
        <circle cx={x} cy={y} r={22} fill={SUNNY} />
      </Overprint>
      <circle cx={x} cy={y} r={20} fill={MARIGOLD} stroke={INK} strokeWidth={2} />
      {/* Sun rays: a large rotation reads as restless background noise, so it's
          static here (brief: large rotations 120s+ or still). `reduce` retained
          for signature/prop parity across scenes. */}
      <g style={{ transformOrigin: `${x}px ${y}px` }} aria-hidden={reduce ? true : undefined}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={x + Math.cos(a) * 25}
              y1={y + Math.sin(a) * 25}
              x2={x + Math.cos(a) * 33}
              y2={y + Math.sin(a) * 33}
              stroke={MARIGOLD}
              strokeWidth={3}
              strokeLinecap="round"
            />
          );
        })}
      </g>
    </g>
  );
}

function MarketScene() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
      {/* warm sky wash → sunbaked plaza */}
      <rect width="400" height="280" fill={SUNNY} opacity={0.32} />
      <rect width="400" height="170" fill={SKY} opacity={0.45} />
      <rect y="150" width="400" height="130" fill={BUBBLE} opacity={0.45} />
      <Sun x={350} y={46} reduce={!!reduce} />

      {/* BACKGROUND: soft hill behind the town, far depth layer */}
      <Hills y={132} color={MINT} opacity={0.35} />

      {/* MIDGROUND: far rooftops, picture-book town (windows + chimneys) */}
      {[
        { x: 0, w: 70, h: 60, c: PINK },
        { x: 70, w: 55, h: 80, c: GRAPE },
        { x: 125, w: 60, h: 55, c: CORAL },
        { x: 245, w: 60, h: 70, c: BLUE },
        { x: 305, w: 55, h: 50, c: PINE },
        { x: 360, w: 50, h: 75, c: MARIGOLD },
      ].map((b, i) => (
        <g key={i} opacity={0.78}>
          <rect x={b.x} y={150 - b.h} width={b.w} height={b.h} fill={b.c} stroke={INK} strokeWidth={1.5} />
          <path d={`M${b.x - 4} ${150 - b.h} L${b.x + b.w / 2} ${150 - b.h - 16} L${b.x + b.w + 4} ${150 - b.h} Z`} fill={INK} opacity={0.85} />
          {/* little lit window */}
          <rect x={b.x + b.w / 2 - 6} y={150 - b.h + 12} width={12} height={14} rx={1} fill={SUNNY} opacity={0.9} stroke={INK} strokeWidth={1} />
          {/* chimney */}
          <rect x={b.x + b.w - 14} y={150 - b.h - 10} width={6} height={12} fill={INK} opacity={0.6} />
        </g>
      ))}

      {/* bunting flags strung across */}
      <path d="M0 70 Q200 100 400 70" fill="none" stroke={INK} strokeWidth={1.2} />
      {Array.from({ length: 13 }).map((_, i) => {
        const t = i / 12;
        const x = t * 400;
        const y = 70 + Math.sin(t * Math.PI) * 30;
        const c = [PINK, MARIGOLD, PINE, GRAPE, SKY][i % 5];
        return (
          // Bunting is static: 13 looping flags fought the butterfly for
          // attention. The butterfly is this scene's single bold beat.
          <path
            key={i}
            d={`M${x - 8} ${y} L${x + 8} ${y} L${x} ${y + 14} Z`}
            fill={c}
            stroke={INK}
            strokeWidth={1}
          />
        );
      })}

      {/* striped stall awning */}
      <Overprint dx={-3} dy={2} opacity={0.6}>
        <path d="M28 122 L372 122 L350 92 L50 92 Z" fill={PINK} />
      </Overprint>
      <path d="M28 122 L372 122 L350 92 L50 92 Z" fill={PAPER} stroke={INK} strokeWidth={2.5} />
      {[50, 90, 130, 170, 210, 250, 290, 330].map((x, i) => (
        <path
          key={x}
          d={`M${x} 92 L${x + 20} 92 L${x + 8} 122 L${x - 12} 122 Z`}
          fill={i % 2 ? CORAL : MARIGOLD}
          opacity={0.9}
        />
      ))}
      {/* scalloped awning fringe */}
      <path
        d={`M28 122 ${Array.from({ length: 17 }).map((_, i) => `q5 9 10 0`).join(" ")}`}
        fill="none"
        stroke={INK}
        strokeWidth={1.5}
      />

      {/* strings of peppers + garlic hanging from the awning rail */}
      {[64, 96, 300, 332].map((x, i) => (
        <g key={x} aria-hidden>
          <line x1={x} y1={122} x2={x} y2={134} stroke={INK} strokeWidth={1.2} />
          {i % 2 === 0
            ? [0, 1, 2, 3].map((k) => (
                <path key={k} d={`M${x - 2} ${134 + k * 9} q-5 5 0 9 q5 -4 0 -9 Z`} fill={CORAL} stroke={INK} strokeWidth={1} />
              ))
            : [0, 1, 2].map((k) => (
                <circle key={k} cx={x} cy={138 + k * 8} r={4.5} fill={PAPER} stroke={INK} strokeWidth={1} />
              ))}
        </g>
      ))}

      {/* FOREGROUND focal subject: crate of oranges */}
      <rect x="62" y="180" width="116" height="62" rx="4" fill={MARIGOLD} stroke={INK} strokeWidth={2.5} />
      <rect x="62" y="180" width="116" height="14" fill={INK} opacity={0.12} />
      {[0, 1, 2, 3, 4].map((i) =>
        [0, 1, 2].map((j) => (
          <g key={`${i}-${j}`}>
            <circle cx={82 + i * 24} cy={200 + j * 16} r={8.5} fill={CORAL} stroke={INK} strokeWidth={1.5} />
            <circle cx={79 + i * 24} cy={197 + j * 16} r={2.2} fill={SUNNY} opacity={0.9} />
          </g>
        )),
      )}

      {/* leafy greens crate */}
      <rect x="196" y="190" width="60" height="52" rx="4" fill={MINT} stroke={INK} strokeWidth={2.5} />
      {[206, 224, 242].map((x, i) => (
        <path key={x} d={`M${x} 196 q6 -18 12 0 q-6 -10 -12 0`} fill={PINE} stroke={INK} strokeWidth={1.2} />
      ))}

      {/* price chalkboard */}
      <rect x="274" y="188" width="92" height="54" rx="4" fill={INK} stroke={INK} strokeWidth={2.5} />
      <rect x="274" y="188" width="92" height="54" rx="4" fill={PINE} opacity={0.5} />
      <text x="320" y="212" textAnchor="middle" fontFamily="var(--font-bricolage)" fontSize="17" fontWeight="800" fill={PAPER}>
        2€/kg
      </text>
      <text x="320" y="230" textAnchor="middle" fontFamily="var(--font-space-mono)" fontSize="8" fill={SUNNY} letterSpacing="2">
        FRESH
      </text>

      {/* a butterfly flits over the stall — a small thing to chase with your eyes */}
      <motion.g
        animate={reduce ? undefined : { x: [0, 220, 90, 260, 0], y: [0, -28, 14, -10, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <g transform="translate(96,150)">
          <motion.g
            style={{ transformOrigin: "0px 0px" }}
            animate={reduce ? undefined : { scaleX: [1, 0.5, 1] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M0 0 q-12 -12 -16 0 q-4 10 16 4 Z" fill={PINK} stroke={INK} strokeWidth={1} />
            <path d="M0 0 q12 -12 16 0 q4 10 -16 4 Z" fill={GRAPE} stroke={INK} strokeWidth={1} />
          </motion.g>
          <line x1="0" y1="-4" x2="0" y2="6" stroke={INK} strokeWidth={1.5} strokeLinecap="round" />
        </g>
      </motion.g>

      <Speckle color={INK} seed={2} count={22} />
    </svg>
  );
}

function BorderScene() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
      <rect width="400" height="280" fill={SKY} opacity={0.4} />
      <rect y="170" width="400" height="110" fill={MINT} opacity={0.5} />
      <Sun x={56} y={48} reduce={!!reduce} />

      {/* BACKGROUND: jagged frontier mountains, far depth */}
      <g aria-hidden>
        <Overprint dx={-2} dy={1.5} opacity={0.35}>
          <path d="M-10 168 L70 96 L130 150 L210 84 L300 152 L370 104 L410 168 Z" fill={PINK} />
        </Overprint>
        <path d="M-10 168 L70 96 L130 150 L210 84 L300 152 L370 104 L410 168 Z" fill={GRAPE} opacity={0.3} stroke={INK} strokeWidth={1.5} />
        {/* snow caps */}
        <path d="M70 96 L84 108 L70 112 L56 108 Z" fill={PAPER} opacity={0.7} />
        <path d="M210 84 L226 98 L210 102 L194 98 Z" fill={PAPER} opacity={0.7} />
      </g>

      {/* MIDGROUND: winding road approaching the checkpoint */}
      <path d="M150 280 L182 176 L218 176 L250 280 Z" fill={INK} opacity={0.12} />
      {[200, 224, 252].map((y, i) => (
        <rect key={y} x={196 - i * 2} y={y} width={8 + i * 2} height={7} rx={1} fill={SUNNY} opacity={0.6} />
      ))}

      {/* distant fence line into the hills */}
      {Array.from({ length: 14 }).map((_, i) => (
        <line key={i} x1={20 + i * 28} y1={160} x2={20 + i * 28} y2={176} stroke={INK} strokeWidth={1.5} opacity={0.5} />
      ))}
      <line x1="20" y1="166" x2="390" y2="166" stroke={INK} strokeWidth={1.5} opacity={0.5} />

      {/* booth */}
      <Overprint dx={-3} dy={2} opacity={0.55}>
        <rect x="118" y="62" width="164" height="158" rx="6" fill={PINK} />
      </Overprint>
      <rect x="118" y="62" width="164" height="158" rx="6" fill={PAPER} stroke={INK} strokeWidth={2.5} />
      {/* roof */}
      <path d="M108 64 L292 64 L270 40 L130 40 Z" fill={CORAL} stroke={INK} strokeWidth={2.5} />
      {/* flagpole + pennant atop the booth */}
      <line x1="200" y1="40" x2="200" y2="14" stroke={INK} strokeWidth={2} />
      <path d="M200 16 L224 22 L200 28 Z" fill={MARIGOLD} stroke={INK} strokeWidth={1.5} />
      {/* sign band */}
      <rect x="118" y="76" width="164" height="34" fill={BLUE} stroke={INK} strokeWidth={2} />
      <text x="200" y="98" textAnchor="middle" fontFamily="var(--font-space-mono)" fontSize="13" fill={PAPER} letterSpacing="4">
        CONTROL
      </text>
      {/* window with little globe lamp (static — barrier is the bold beat) */}
      <rect x="138" y="124" width="124" height="60" rx="4" fill={SKY} opacity={0.7} stroke={INK} strokeWidth={2} />
      <circle cx="160" cy="120" r="6" fill={MARIGOLD} stroke={INK} strokeWidth={1.5} />
      {/* stamp emblem in window */}
      <circle cx="200" cy="154" r="16" fill="none" stroke={INK} strokeWidth={2} strokeDasharray="3 3" />
      <path d="M192 154 l5 6 l11 -12" fill="none" stroke={PINE} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

      {/* candy-stripe barrier, animated lift */}
      <motion.g
        style={{ transformOrigin: "118px 200px" }}
        animate={reduce ? undefined : { rotate: [0, -14, -14, 0, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.2, 0.45, 0.65, 1] }}
      >
        <rect x="118" y="196" width="120" height="9" rx="4" fill={PAPER} stroke={INK} strokeWidth={2} />
        {[124, 144, 164, 184, 204, 224].map((x) => (
          <rect key={x} x={x} y={196} width={10} height={9} fill={CORAL} />
        ))}
      </motion.g>
      {/* barrier post + counterweight */}
      <rect x="112" y="190" width="12" height="48" fill={INK} />
      <circle cx="118" cy="200" r="6" fill={MARIGOLD} stroke={INK} strokeWidth={1.5} />

      <Speckle color={BLUE} seed={5} count={20} opacity={0.14} />
    </svg>
  );
}

function CafeScene() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
      {/* cozy interior wash + warm lamplight pooling on the floor */}
      <rect width="400" height="280" fill={BUBBLE} opacity={0.5} />
      <rect y="150" width="400" height="130" fill={MARIGOLD} opacity={0.18} />

      {/* wainscot stripes on back wall */}
      {[0, 50, 100, 150, 200, 250, 300, 350].map((x) => (
        <rect key={x} x={x} y={0} width={25} height={150} fill={PINK} opacity={0.12} />
      ))}

      {/* BACKGROUND: window onto a rainy-bright street (depth past the room) */}
      <g aria-hidden>
        <rect x="140" y="30" width="120" height="92" rx="4" fill={SKY} opacity={0.55} stroke={INK} strokeWidth={2.5} />
        <line x1="200" y1="30" x2="200" y2="122" stroke={INK} strokeWidth={2} />
        <line x1="140" y1="76" x2="260" y2="76" stroke={INK} strokeWidth={2} />
        {/* silhouetted passers-by + a tree across the street */}
        <circle cx="166" cy="96" r="6" fill={GRAPE} opacity={0.5} />
        <rect x="161" y="100" width="10" height="18" rx="3" fill={GRAPE} opacity={0.5} />
        <circle cx="232" cy="60" r="14" fill={PINE} opacity={0.45} />
        <rect x="229" y="60" width="6" height="20" fill={INK} opacity={0.4} />
      </g>

      {/* hanging OPEN sign by the window */}
      <g aria-hidden>
        <line x1="120" y1="30" x2="120" y2="44" stroke={INK} strokeWidth={1.5} />
        <rect x="100" y="44" width="40" height="18" rx="3" fill={CORAL} stroke={INK} strokeWidth={2} />
        <text x="120" y="57" textAnchor="middle" fontFamily="var(--font-space-mono)" fontSize="9" fill={PAPER} letterSpacing="1">OPEN</text>
      </g>

      {/* hanging pendant lamps (static — curling steam is the bold beat) */}
      {[110, 200, 290].map((x) => (
        <g key={x}>
          <line x1={x} y1={0} x2={x} y2={34} stroke={INK} strokeWidth={1.5} />
          <g>
            <path d={`M${x - 14} 50 Q${x} 30 ${x + 14} 50 Z`} fill={MARIGOLD} stroke={INK} strokeWidth={1.5} />
            <ellipse cx={x} cy={50} rx={14} ry={4} fill={SUNNY} opacity={0.8} />
          </g>
        </g>
      ))}

      {/* framed picture + menu board */}
      <rect x="40" y="50" width="56" height="44" rx="3" fill={SKY} stroke={INK} strokeWidth={2} />
      <path d="M48 86 L62 70 L72 80 L84 64 L88 86 Z" fill={PINE} opacity={0.8} />
      <rect x="304" y="46" width="58" height="56" rx="3" fill={INK} />
      <rect x="304" y="46" width="58" height="56" rx="3" fill={PINE} opacity={0.5} />
      {[58, 68, 78, 88].map((y) => (
        <line key={y} x1="312" y1={y} x2="354" y2={y} stroke={PAPER} strokeWidth={1.4} opacity={0.7} />
      ))}

      {/* counter */}
      <Overprint dx={-3} dy={2} opacity={0.5}>
        <rect x="36" y="158" width="328" height="84" rx="6" fill={PINK} />
      </Overprint>
      <rect x="36" y="158" width="328" height="84" rx="6" fill={GRAPE} stroke={INK} strokeWidth={2.5} />
      <rect x="36" y="158" width="328" height="12" rx="6" fill={PAPER} opacity={0.25} />
      {/* wood-grain lines */}
      {[176, 192, 208, 224].map((y) => (
        <line key={y} x1="50" y1={y} x2="350" y2={y} stroke={INK} strokeWidth={0.8} opacity={0.18} />
      ))}

      {/* espresso machine, chunky + cheerful */}
      <rect x="244" y="104" width="96" height="58" rx="6" fill={CORAL} stroke={INK} strokeWidth={2.5} />
      <rect x="252" y="112" width="80" height="16" rx="3" fill={INK} opacity={0.2} />
      <circle cx="266" cy="142" r="7" fill={MARIGOLD} stroke={INK} strokeWidth={1.5} />
      <circle cx="290" cy="142" r="7" fill={PINE} stroke={INK} strokeWidth={1.5} />
      <circle cx="314" cy="142" r="7" fill={SKY} stroke={INK} strokeWidth={1.5} />
      {/* steam wand drip */}
      <line x1="332" y1="160" x2="332" y2="156" stroke={INK} strokeWidth={2} />

      {/* cups with curling steam */}
      {[70, 120, 170].map((x, i) => (
        <g key={x}>
          <rect x={x} y={138} width={24} height={20} rx={4} fill={PAPER} stroke={INK} strokeWidth={2} />
          <path d={`M${x + 24} 142 q8 4 0 10`} fill="none" stroke={INK} strokeWidth={2} />
          <ellipse cx={x + 12} cy={140} rx={9} ry={3} fill={MARIGOLD} opacity={0.7} />
          <motion.path
            d={`M${x + 8} 136 q4 -8 0 -16 q-4 -8 0 -14`}
            fill="none"
            stroke={INK}
            strokeWidth={1.4}
            strokeLinecap="round"
            animate={reduce ? undefined : { opacity: [0.15, 0.7, 0.15], y: [0, -4, 0] }}
            transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>
      ))}

      {/* glass cake stand on the counter — a sweet foreground treat */}
      <g aria-hidden>
        <ellipse cx="200" cy="200" rx="34" ry="6" fill={PAPER} stroke={INK} strokeWidth={2} />
        <line x1="200" y1="200" x2="200" y2="186" stroke={INK} strokeWidth={2} />
        <ellipse cx="200" cy="186" rx="30" ry="5" fill={PAPER} stroke={INK} strokeWidth={2} />
        {/* a slice of pink layer cake */}
        <path d="M184 186 L216 186 L210 170 L190 170 Z" fill={PINK} stroke={INK} strokeWidth={1.5} />
        <line x1="187" y1="178" x2="213" y2="178" stroke={CORAL} strokeWidth={2} />
        <circle cx="200" cy="167" r="3" fill={CORAL} stroke={INK} strokeWidth={1} />
      </g>

      {/* tiny potted plant on the counter */}
      <rect x="320" y="200" width="22" height="22" rx="3" fill={MARIGOLD} stroke={INK} strokeWidth={2} />
      {[326, 331, 336].map((x, i) => (
        <path key={x} d={`M${x} 200 q${i - 1} -16 0 -22`} fill="none" stroke={PINE} strokeWidth={2} strokeLinecap="round" />
      ))}
      <circle cx="331" cy="178" r="4" fill={PINK} stroke={INK} strokeWidth={1} />

      <Speckle color={GRAPE} seed={3} count={18} opacity={0.14} />
    </svg>
  );
}

function HarborScene() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
      {/* sky → sea */}
      <rect width="400" height="180" fill={SKY} opacity={0.6} />
      <rect y="170" width="400" height="110" fill={BLUE} opacity={0.32} />
      <Sun x={64} y={52} reduce={!!reduce} />

      {/* BACKGROUND: a far headland with tiny houses across the bay */}
      <g aria-hidden opacity={0.55}>
        <Overprint dx={-2} dy={1.5} opacity={0.4}>
          <path d="M300 172 q40 -30 110 -18 V172 Z" fill={PINK} />
        </Overprint>
        <path d="M300 172 q40 -30 110 -18 V172 Z" fill={PINE} opacity={0.5} stroke={INK} strokeWidth={1.2} />
        {[326, 348, 370].map((x, i) => (
          <g key={x}>
            <rect x={x} y={150 + i} width={8} height={9} fill={PAPER} stroke={INK} strokeWidth={1} />
            <path d={`M${x - 1} ${150 + i} L${x + 4} ${146 + i} L${x + 9} ${150 + i} Z`} fill={CORAL} />
          </g>
        ))}
        {/* a faraway boat */}
        <path d="M250 162 L264 162 L260 170 L254 170 Z" fill={GRAPE} opacity={0.6} />
        <line x1="257" y1="162" x2="257" y2="150" stroke={INK} strokeWidth={1} />
      </g>

      {/* drifting clouds (static — sailboat + waves carry this scene) */}
      {[
        { x: 140, y: 56, s: 1 },
        { x: 300, y: 38, s: 0.8 },
      ].map((c, i) => (
        <g key={i} transform={`translate(${c.x},${c.y}) scale(${c.s})`}>
          <ellipse cx="0" cy="0" rx="22" ry="12" fill={PAPER} stroke={INK} strokeWidth={1.5} />
          <ellipse cx="18" cy="2" rx="14" ry="9" fill={PAPER} stroke={INK} strokeWidth={1.5} />
          <ellipse cx="-16" cy="3" rx="12" ry="8" fill={PAPER} stroke={INK} strokeWidth={1.5} />
        </g>
      ))}

      {/* lighthouse on the left */}
      <path d="M30 180 L42 110 L58 110 L70 180 Z" fill={PAPER} stroke={INK} strokeWidth={2.5} />
      {[122, 138, 154, 170].map((y, i) => (
        <path key={y} d={`M${44 - i * 1.5} ${y} L${56 + i * 1.5} ${y} L${57 + i * 1.5} ${y + 8} L${43 - i * 1.5} ${y + 8} Z`} fill={i % 2 ? CORAL : PAPER} />
      ))}
      <rect x="42" y="98" width="16" height="14" fill={INK} />
      {/* beacon static — small blinking light is restless background noise */}
      <circle cx="50" cy="105" r="6" fill={SUNNY} />

      {/* overprint sea body */}
      <Overprint dx={-3} dy={2} opacity={0.4}>
        <path d="M0 180 q100 -16 200 0 t200 0 v100 H0 Z" fill={PINK} />
      </Overprint>

      {/* waves — the calm second beat: one slow, unified tidal drift (not four
          racing lines). Subtle and slow per brief's "rest quiet". */}
      {[196, 220, 244, 266].map((y, i) => (
        <motion.path
          key={y}
          d={`M-20 ${y} q40 -10 80 0 t80 0 t80 0 t80 0 t80 0`}
          fill="none"
          stroke={i % 2 ? BLUE : INK}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.7}
          animate={reduce ? undefined : { x: [0, 16, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* sailboat, bobbing */}
      <motion.g
        animate={reduce ? undefined : { y: [0, 6, 0], rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "230px 178px" }}
      >
        <line x1="230" y1="178" x2="230" y2="104" stroke={INK} strokeWidth={3} />
        <path d="M230 110 L272 168 L230 168 Z" fill={CORAL} stroke={INK} strokeWidth={2} />
        <path d="M228 116 L192 168 L228 168 Z" fill={MARIGOLD} stroke={INK} strokeWidth={2} />
        <path d="M180 168 L282 168 L266 196 L196 196 Z" fill={GRAPE} stroke={INK} strokeWidth={2.5} />
        <path d="M180 168 L282 168 L278 175 L184 175 Z" fill={PAPER} opacity={0.3} />
        {/* pennant */}
        <path d="M230 104 L246 109 L230 114 Z" fill={PINK} stroke={INK} strokeWidth={1} />
      </motion.g>

      {/* gull, perched in the sky — static so the bobbing boat stays the hero */}
      <path
        d="M150 70 q8 -8 16 0 q8 -8 16 0"
        fill="none"
        stroke={INK}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* FOREGROUND: a weathered wooden dock + mooring post with rope coil */}
      <g aria-hidden>
        <rect x="0" y="244" width="400" height="36" fill={MARIGOLD} opacity={0.8} stroke={INK} strokeWidth={2.5} />
        {[20, 70, 120, 170, 220, 270, 320, 370].map((x) => (
          <line key={x} x1={x} y1={244} x2={x} y2={280} stroke={INK} strokeWidth={1.2} opacity={0.4} />
        ))}
        {/* striped mooring bollard */}
        <rect x="40" y="216" width="22" height="30" rx={4} fill={CORAL} stroke={INK} strokeWidth={2.5} />
        <rect x="40" y="224" width="22" height="6" fill={PAPER} opacity={0.7} />
        <ellipse cx="51" cy="216" rx="13" ry="5" fill={INK} />
        {/* looped rope */}
        <path d="M62 232 q24 4 8 18 q-14 10 -2 -2" fill="none" stroke={PAPER} strokeWidth={3} opacity={0.85} />
        <path d="M62 232 q24 4 8 18 q-14 10 -2 -2" fill="none" stroke={INK} strokeWidth={1} />
        {/* a fish crate on the dock */}
        <rect x="300" y="220" width="56" height="26" rx={3} fill={MINT} stroke={INK} strokeWidth={2.5} />
        {[312, 328, 344].map((x) => (
          <path key={x} d={`M${x} 232 q5 -4 10 0 q-5 4 -10 0 Z`} fill={SKY} stroke={INK} strokeWidth={1} />
        ))}
      </g>

      <Speckle color={BLUE} seed={7} count={18} opacity={0.12} />
    </svg>
  );
}

function PlatformScene() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 400 280" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
      {/* station hall */}
      <rect width="400" height="280" fill={GRAPE} opacity={0.12} />
      <rect y="200" width="400" height="80" fill={INK} opacity={0.08} />

      {/* BACKGROUND: vaulted iron roof trusses receding overhead (depth) */}
      <g aria-hidden opacity={0.4}>
        <path d="M0 14 Q200 -28 400 14" fill="none" stroke={INK} strokeWidth={2} />
        <path d="M0 30 Q200 -8 400 30" fill="none" stroke={INK} strokeWidth={1.5} />
        {[40, 120, 200, 280, 360].map((x) => (
          <line key={x} x1={x} y1={2} x2={x} y2={36} stroke={INK} strokeWidth={1.2} />
        ))}
      </g>

      {/* station name sign hung across the hall */}
      <g aria-hidden>
        <rect x="44" y="12" width="104" height="20" rx="3" fill={PINE} stroke={INK} strokeWidth={2} />
        <text x="96" y="26" textAnchor="middle" fontFamily="var(--font-space-mono)" fontSize="10" fill={PAPER} letterSpacing="3">CENTRALE</text>
      </g>

      {/* arched windows along the back */}
      {[40, 130, 220, 310].map((x) => (
        <g key={x}>
          <path d={`M${x} 70 v-30 a22 22 0 0 1 44 0 v30 Z`} fill={SKY} opacity={0.6} stroke={INK} strokeWidth={2} />
          <line x1={x + 22} y1="18" x2={x + 22} y2="70" stroke={INK} strokeWidth={1.2} opacity={0.5} />
          <line x1={x} y1="44" x2={x + 44} y2="44" stroke={INK} strokeWidth={1.2} opacity={0.5} />
        </g>
      ))}

      {/* hanging clock */}
      <line x1="200" y1="20" x2="200" y2="36" stroke={INK} strokeWidth={2} />
      <circle cx="200" cy="50" r="16" fill={PAPER} stroke={INK} strokeWidth={2.5} />
      <line x1="200" y1="50" x2="200" y2="40" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      <line x1="200" y1="50" x2="208" y2="54" stroke={INK} strokeWidth={2} strokeLinecap="round" />

      {/* departure board */}
      <rect x="288" y="78" width="84" height="34" rx="3" fill={INK} stroke={INK} strokeWidth={2} />
      {[86, 96, 106].map((y, i) => (
        <motion.rect
          key={y}
          x="294" y={y - 4} width={i === 0 ? 60 : 44} height={6} rx={1}
          fill={[MARIGOLD, PINE, SKY][i]}
          animate={reduce ? undefined : { opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
        />
      ))}

      {/* train */}
      <Overprint dx={-3} dy={2} opacity={0.5}>
        <rect x="28" y="118" width="344" height="92" rx="14" fill={PINK} />
      </Overprint>
      <rect x="28" y="118" width="344" height="92" rx="14" fill={CORAL} stroke={INK} strokeWidth={2.5} />
      {/* stripe livery */}
      <rect x="28" y="150" width="344" height="14" fill={MARIGOLD} />
      <rect x="28" y="150" width="344" height="14" fill="none" stroke={INK} strokeWidth={1} />
      {/* nose / cab */}
      <path d="M28 132 q-16 6 -16 30 q0 24 16 30 Z" fill={BLUE} stroke={INK} strokeWidth={2.5} />
      {/* windows, warmly lit */}
      {[56, 124, 192, 260, 328].map((x) => (
        <g key={x}>
          <rect x={x} y={128} width={42} height={32} rx={4} fill={SKY} opacity={0.85} stroke={INK} strokeWidth={2} />
          <rect x={x} y={128} width={42} height={12} rx={4} fill={PAPER} opacity={0.4} />
        </g>
      ))}
      {/* doors */}
      {[100, 236].map((x) => (
        <rect key={x} x={x} y={170} width={6} height={40} fill={INK} opacity={0.4} />
      ))}
      {/* wheels */}
      {[70, 150, 250, 330].map((x) => (
        <g key={x}>
          <circle cx={x} cy={214} r={10} fill={INK} />
          <circle cx={x} cy={214} r={4} fill={MARIGOLD} />
        </g>
      ))}

      {/* platform edge */}
      <rect x="0" y="222" width="400" height="10" fill={INK} />
      <rect x="0" y="222" width="400" height="3" fill={SUNNY} opacity={0.7} />

      {/* FOREGROUND: a waiting bench + a stickered traveler's suitcase */}
      <g aria-hidden>
        {/* suitcase */}
        <rect x="40" y="238" width="46" height="34" rx={5} fill={MARIGOLD} stroke={INK} strokeWidth={2.5} />
        <rect x="40" y="250" width="46" height="6" fill={INK} opacity={0.2} />
        <rect x="56" y="232" width="14" height="8" rx={3} fill="none" stroke={INK} strokeWidth={2.5} />
        <rect x="48" y="244" width="9" height="9" rx={2} fill={CORAL} stroke={INK} strokeWidth={1.5} />
        <circle cx="74" cy="262" r="4" fill={SKY} stroke={INK} strokeWidth={1.5} />
        {/* bench */}
        <rect x="300" y="244" width="78" height="8" rx={3} fill={PINE} stroke={INK} strokeWidth={2.5} />
        <rect x="304" y="252" width="8" height="20" fill={INK} />
        <rect x="366" y="252" width="8" height="20" fill={INK} />
        <rect x="300" y="234" width="78" height="8" rx={3} fill={PINE} opacity={0.7} stroke={INK} strokeWidth={2} />
      </g>

      {/* departure signal */}
      <line x1="370" y1="108" x2="370" y2="78" stroke={INK} strokeWidth={3} />
      <rect x="362" y="62" width="16" height="22" rx="4" fill={INK} />
      {/* signal lit but static — board flicker is the scene's single bold beat */}
      <circle cx="370" cy="68" r="4" fill={PINE} />
      <circle cx="370" cy="78" r="4" fill={CORAL} opacity={0.4} />

      <Speckle color={INK} seed={9} count={20} opacity={0.13} />
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

// ---- NPC portrait: characterful riso local with idle breath + blink ----
// Each NPC gets a body color, a paper face, a distinct hat/hair, and a prop
// hint so the cast reads as a little troupe of travel companions.
type Hat = "cap" | "scarf" | "apron" | "beanie" | "tie" | "sunhat" | "sailor" | "curls";
type NpcLook = {
  body: string;
  accent: string;
  hat: Hat;
  cheek: string;
};

const AVATAR_LOOK: Record<string, NpcLook> = {
  // The five scene locals: each a clearly different head + role read.
  "officer-border": { body: BLUE, accent: MARIGOLD, hat: "cap", cheek: SKY },
  "vendor-market": { body: CORAL, accent: MARIGOLD, hat: "sunhat", cheek: BUBBLE },
  "barista-cafe": { body: PINE, accent: PAPER, hat: "apron", cheek: MINT },
  "sailor-harbor": { body: GRAPE, accent: PINK, hat: "sailor", cheek: SKY },
  "agent-platform": { body: INK, accent: SUNNY, hat: "tie", cheek: BUBBLE },
  // pick-your-travel-buddy options — each visually distinct
  "avatar-wren": { body: GRAPE, accent: SUNNY, hat: "beanie", cheek: BUBBLE },
  "avatar-fox": { body: CORAL, accent: SKY, hat: "curls", cheek: MINT },
  "avatar-moth": { body: PINE, accent: BUBBLE, hat: "scarf", cheek: SKY },
  "avatar-crane": { body: BLUE, accent: PINK, hat: "sunhat", cheek: SUNNY },
  default: { body: BLUE, accent: MARIGOLD, hat: "cap", cheek: BUBBLE },
};

function Headwear({ hat, accent }: { hat: Hat; accent: string }) {
  switch (hat) {
    case "sunhat":
      // wide straw brim with a ribbon band — market/seaside character
      return (
        <g>
          <ellipse cx="70" cy="48" rx="50" ry="11" fill={MARIGOLD} stroke={INK} strokeWidth={2} />
          <path d="M48 50 Q70 18 92 50 Q70 40 48 50 Z" fill={SUNNY} stroke={INK} strokeWidth={2} />
          <rect x="50" y="44" width="40" height="6" rx="3" fill={accent} stroke={INK} strokeWidth={1.2} />
          {/* a little tucked flower */}
          <circle cx="86" cy="44" r="4" fill={CORAL} stroke={INK} strokeWidth={1} />
        </g>
      );
    case "sailor":
      // round sailor cap with a pom and a chinstrap band
      return (
        <g>
          <path d="M40 56 Q70 24 100 56 Q70 44 40 56 Z" fill={PAPER} stroke={INK} strokeWidth={2} />
          <rect x="40" y="52" width="60" height="8" rx="4" fill={accent} stroke={INK} strokeWidth={1.5} />
          <circle cx="70" cy="28" r="5" fill={CORAL} stroke={INK} strokeWidth={1.5} />
        </g>
      );
    case "curls":
      // a bouncy head of curls instead of a hat — varies the silhouette
      return (
        <g>
          {[
            [42, 50], [52, 38], [70, 32], [88, 38], [98, 50], [60, 34], [80, 34],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={11} fill={accent} stroke={INK} strokeWidth={1.5} />
          ))}
        </g>
      );
    case "cap":
      return (
        <g>
          <path d="M36 56 Q70 24 104 56 L104 56 Q70 42 36 56 Z" fill={INK} />
          <path d="M34 56 Q24 56 22 62 L40 60 Z" fill={INK} />
          <rect x="60" y="40" width="20" height="8" rx="2" fill={accent} stroke={INK} strokeWidth={1.5} />
        </g>
      );
    case "scarf":
      return (
        <g>
          <path d="M34 60 Q70 26 106 60 Q70 40 34 60 Z" fill={accent} stroke={INK} strokeWidth={1.5} />
          <circle cx="48" cy="50" r="2" fill={INK} />
          <circle cx="70" cy="42" r="2" fill={INK} />
          <circle cx="92" cy="50" r="2" fill={INK} />
        </g>
      );
    case "apron":
      return (
        <g>
          <path d="M36 58 Q70 30 104 58 Q70 46 36 58 Z" fill={INK} />
          <rect x="58" y="36" width="24" height="6" rx="3" fill={accent} stroke={INK} strokeWidth={1} />
        </g>
      );
    case "beanie":
      return (
        <g>
          <path d="M36 58 Q70 22 104 58 Q70 42 36 58 Z" fill={PINK} stroke={INK} strokeWidth={1.5} />
          <rect x="36" y="54" width="68" height="8" rx="4" fill={accent} stroke={INK} strokeWidth={1.5} />
          <circle cx="70" cy="26" r="5" fill={accent} stroke={INK} strokeWidth={1.5} />
        </g>
      );
    case "tie":
    default:
      return (
        <g>
          <path d="M40 58 Q70 30 100 58 Q70 46 40 58 Z" fill={accent} />
          <path d="M40 58 Q70 38 100 58 L100 58 Q70 50 40 58 Z" fill={INK} opacity={0.4} />
        </g>
      );
  }
}

export function NPCPortrait({ npcId, name }: { npcId: string; name: string }) {
  const reduce = useReducedMotion();
  const look = AVATAR_LOOK[npcId] ?? AVATAR_LOOK.default;

  // A kid-pleasing "boop": poke (tap / click / Enter) the local and they do a
  // happy hop + cheek-squish wink. One-shot, layered over the idle bob, and
  // fully skipped under reduced motion (still leaves a tactile focus ring).
  const boop = useAnimationControls();
  const wink = useAnimationControls();
  const greet = () => {
    if (reduce) return;
    boop.start({
      scale: [1, 1.06, 0.97, 1],
      rotate: [0, -3, 3, 0],
      transition: { duration: 0.55, ease: "easeOut" },
    });
    wink.start({
      scaleY: [1, 0.1, 1],
      transition: { duration: 0.32, ease: "easeInOut" },
    });
  };

  return (
    // Non-interactive on purpose: this is an illustration. Interactive parents
    // (the Scene's GreetablePortrait, Arrival's avatar picker) supply the real
    // <button>, so making this a button too would nest buttons (invalid HTML).
    // The "boop" still fires on hover/tap via framer-motion gesture props.
    <motion.div
      onTap={greet}
      onHoverStart={greet}
      animate={reduce ? undefined : { y: [0, -4, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="relative"
      role="img"
      aria-label={`${name}, a local`}
    >
      <motion.div animate={boop}>
      <svg viewBox="0 0 140 168" width={120} height={144}>
        {/* printed drop shadow */}
        <Overprint dx={-3} dy={2} opacity={0.4}>
          <ellipse cx="70" cy="156" rx="50" ry="11" fill={PINK} />
        </Overprint>

        {/* halo badge behind — static. A large continuous rotation reads as
            restless noise behind the face; the bob + blink are the bold beats. */}
        <g aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <circle key={i} cx={70 + Math.cos(a) * 56} cy={78 + Math.sin(a) * 56} r={2} fill={look.accent} opacity={0.6} />
            );
          })}
        </g>

        {/* body */}
        <Overprint dx={-2.5} dy={1.5} opacity={0.5}>
          <path d="M28 168 Q28 104 70 104 Q112 104 112 168 Z" fill={PINK} />
        </Overprint>
        <path d="M28 168 Q28 104 70 104 Q112 104 112 168 Z" fill={look.body} stroke={INK} strokeWidth={2.5} />
        {/* collar / accent */}
        <path d="M52 110 L70 124 L88 110 L88 120 L70 132 L52 120 Z" fill={look.accent} stroke={INK} strokeWidth={1.5} />

        {/* head */}
        <circle cx="70" cy="72" r="34" fill={PAPER} stroke={INK} strokeWidth={2.5} />
        {/* ears */}
        <circle cx="36" cy="74" r="5" fill={PAPER} stroke={INK} strokeWidth={2} />
        <circle cx="104" cy="74" r="5" fill={PAPER} stroke={INK} strokeWidth={2} />

        {/* rosy cheeks */}
        <circle cx="54" cy="82" r="6" fill={look.cheek} opacity={0.8} />
        <circle cx="86" cy="82" r="6" fill={look.cheek} opacity={0.8} />

        <Headwear hat={look.hat} accent={look.accent} />

        {/* brows */}
        <path d="M50 62 q8 -3 14 0" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />
        <path d="M76 62 q6 -3 14 0" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />

        {/* eyes (idle blink + on-demand boop wink) */}
        <motion.g animate={wink} style={{ transformOrigin: "70px 72px" }}>
          <motion.g
            animate={reduce ? undefined : { scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.85, 0.9, 0.95], ease: "easeInOut" }}
            style={{ transformOrigin: "70px 72px" }}
          >
            <circle cx="57" cy="72" r="4" fill={INK} />
            <circle cx="83" cy="72" r="4" fill={INK} />
            <circle cx="58.5" cy="70.5" r="1.3" fill={PAPER} />
            <circle cx="84.5" cy="70.5" r="1.3" fill={PAPER} />
          </motion.g>
        </motion.g>

        {/* warm smile */}
        <path d="M58 88 Q70 98 82 88" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
        <path d="M64 92 Q70 95 76 92" fill={CORAL} opacity={0.5} />

        {/* little speech spark — static so bob + blink stay the two beats */}
        <g aria-hidden>
          <path d="M104 40 q10 -2 14 6 q2 8 -8 8 l-6 4 l1 -6 q-6 -6 -1 -12 Z" fill={MARIGOLD} stroke={INK} strokeWidth={1.5} />
          <circle cx="108" cy="48" r="1.4" fill={INK} />
          <circle cx="113" cy="48" r="1.4" fill={INK} />
        </g>
      </svg>
      </motion.div>
    </motion.div>
  );
}

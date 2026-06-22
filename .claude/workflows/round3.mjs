export const meta = {
  name: 'parley-round3',
  description: 'Round 3: world richness + identified visual nits (map, arrival, scenes, reward, route transitions)',
  phases: [{ title: 'Enrich' }],
};

const RULES = `
PARLEY = a playful risograph language-learning game (talk your way through illustrated
places in your target language, with AI locals who remember you; built on 0G).
AESTHETIC: risograph travelogue fused with playful retro-arcade Zero Cup energy —
bold, printed, colorful, joyful; a kid should find it irresistible. NOT a generic AI app.

Global tokens/classes EXIST (do not invent hex): colors paper/ink/riso-blue/riso-pink/
marigold/pine/indigo/grape/coral/mint/bubble/sky/sunny; utilities .pill .halftone .grain
.overprint .wash-joy .float-bob .label-mono .target-lang .font-pixel .pixel-badge.
Components: @/components/design/ui (PrimaryButton, GhostButton, Panel, overprintSlide),
@/components/design/Playful (FloatingShapes, PixelBadge, Confetti), SplitFlap, Stamp,
Ticket, Postcard, SceneBackground + NPCPortrait (RisoIllustration). framer-motion +
useReducedMotion available. AGENTS.md note: Next.js 16 — params are Promises, check
node_modules/next/dist/docs if you touch framework APIs.

HARD RULES:
- Edit/create ONLY your assigned file. Do not touch globals.css, layout.tsx, lib/*, or others.
- Keep exported names + prop signatures; keep all behavior/logic/store-calls/handlers intact.
- TypeScript-valid; mobile one-thumb; AA contrast (dark text on light); visible focus rings;
  EVERY animation degrades under prefers-reduced-motion (use useReducedMotion for JS animations).
- Reserve infinite looping motion for the signature beats; keep the rest restrained.
`;

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['file', 'changes', 'risk'],
  properties: {
    file: { type: 'string' },
    changes: { type: 'array', items: { type: 'string' } },
    risk: { type: 'string' },
  },
};

const TASKS = [
  {
    path: 'app/atlas/page.tsx', label: 'Atlas',
    focus: `Two things. (1) FIX mobile: on phones the map is short and the place pins + their text labels collide/overlap (e.g. "YOU'RE HERE" overlaps a node and the MERCADO label; "BORDER" clips the edge). Give the map more vertical room on mobile (taller aspect) and prevent label collisions — e.g. labels below pins with small text, nudge label anchoring, or scale the whole map nicely. Keep desktop looking as good or better. (2) ENRICH: make the map feel like a real illustrated travelogue map — a subtle landmass/coastline shape, dotted travel route (already present), tiny decorative riso motifs (a little boat, mountains, a sun) placed so they don't collide with pins. Keep all state logic (visited/current/locked), routing, PassportTab, and the locked-pin "mystery" treatment.`,
  },
  {
    path: 'app/page.tsx', label: 'Arrival',
    focus: `Polish the first impression. (1) The cold-open split-flap headline is pushed right of center because the "NOW BOARDING" label sits inline before it — center the headline block cleanly. (2) Language options: make each a richer chip (bigger flag/emoji or a small riso flag, clear selected state). (3) General delight: the pastel wash + floating shapes are great; tighten spacing, make the "Begin the journey" moment feel inviting. Keep the 3-step flow (cold→setup→stamping), createProfile/connectWallet/setActiveWallet logic, and routing intact.`,
  },
  {
    path: 'components/design/RisoIllustration.tsx', label: 'Scenes',
    focus: `Make the five scene backgrounds (border, market, cafe, harbor, platform) richer, more distinct, and more characterful — like spreads from a children's picture book crossed with riso prints. Each should instantly read as its place with a clear focal subject + depth (foreground/midground/background), warm color, and 1–2 tasteful signature motions (rest static per the "two bold beats" rule). Also ensure the NPC headwear/looks vary believably. Keep SceneBackground + NPCPortrait exports/props and reduced-motion behavior. Do NOT make NPCPortrait a button (it is wrapped by interactive parents).`,
  },
  {
    path: 'components/scene/RewardSequence.tsx', label: 'Reward',
    focus: `Make the success payoff the most euphoric, shareable 3 seconds in the app: words flip in → stamp SLAMS with an ink bloom + page shake → postcard prints in. Lean into Confetti for the stamp/postcard beats, make the celebration feel BIG and earned. The postcard must look gorgeous (it's the share artifact). Keep phase timing reasonable, the props, and router navigation intact; reduced-motion safe.`,
  },
  {
    path: 'app/template.tsx', label: 'Transitions', create: true,
    focus: `CREATE a new Next.js 16 App Router template.tsx at app/template.tsx that wraps {children} in a tasteful "overprint slide" route transition using framer-motion (layers arrive slightly offset in riso-blue/pink then register, per the brief), so navigating between Atlas/Scene/Phrasebook/Passport feels like turning a page. Must be a "use client" component, default-export a function taking { children }, and be FAST + subtle (don't delay interaction). Honor prefers-reduced-motion (no transform/animation, just render children). Do not import anything that doesn't exist; framer-motion is available. Keep it self-contained.`,
  },
];

phase('Enrich');
const results = await parallel(
  TASKS.map((t) => () =>
    agent(
      `${RULES}\n\nYou OWN exactly one file: ${t.path}${t.create ? ' (CREATE this new file)' : ''}\nFOCUS: ${t.focus}\n\n${t.create ? 'Create the file with the Write tool.' : 'Read the file first, then apply edits with Edit/Write.'} Then report what you did.`,
      { label: t.label, phase: 'Enrich', schema: SCHEMA },
    ),
  ),
);
return { round3: results.filter(Boolean) };

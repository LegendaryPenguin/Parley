export const meta = {
  name: 'parley-round4',
  description: 'Round 4: swap system emoji for riso SVG icons + ice the verified-record with field icons',
  phases: [{ title: 'Iconize' }],
};

const RULES = `
PARLEY = playful risograph language game on 0G. A new icon set EXISTS at
@/components/design/Icons (named exports: MicIcon, SpeakerIcon, LockIcon, ChainIcon,
StorageIcon, ShieldCheckIcon, StarIcon, CpuIcon). They take { size?, className?, title? }
and inherit currentColor. Use them to REPLACE system emoji, which clash with the bespoke
art. Tokens/classes exist globally (paper, ink, riso-blue/pink, marigold, pine, grape,
coral, mint, sky, sunny; .pill .label-mono .target-lang .pixel-badge etc.). framer-motion
+ useReducedMotion available.

HARD RULES:
- Edit ONLY your assigned file. Don't touch globals.css, layout.tsx, lib/*, Icons.tsx, or others.
- Keep exported names + props + all behavior/logic/store-calls intact. TS-valid.
- Preserve accessibility: where an emoji had aria-label/aria-hidden, keep equivalent semantics
  (icon-only buttons keep their aria-label; decorative icons stay aria-hidden).
- Keep reduced-motion + focus rings intact.
`;

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['file', 'changes', 'risk'],
  properties: { file: { type: 'string' }, changes: { type: 'array', items: { type: 'string' } }, risk: { type: 'string' } },
};

const TASKS = [
  {
    path: 'components/scene/MicInput.tsx', label: 'MicInput',
    focus: 'Replace the 🎤 emoji on the push-to-talk button with <MicIcon/>. Keep the SpeechRecognition-supported guard, hold-to-speak handlers, aria-label, sizing (>=44px tap target), and listening state styling. Size the icon ~22.',
  },
  {
    path: 'app/phrasebook/page.tsx', label: 'Phrasebook',
    focus: 'Replace both 🔊 emoji (the card speaker glyph and the "Hear it" review button) with <SpeakerIcon/>. Keep the speak()/speechSynthesis logic, the speaking ripple animation, aria-labels, and layout. If the full-collection-mastered celebration uses a text ★, you may use <StarIcon/> for a crisper look.',
  },
  {
    path: 'app/atlas/page.tsx', label: 'Atlas',
    focus: 'Replace the 🔒 emoji on locked place pins with <LockIcon/> (small, ink/grape colored to match the mystery wax-seal). Keep all state logic, the mystery peek, routing, and a11y intact.',
  },
  {
    path: 'app/passport/page.tsx', label: 'Passport',
    focus: 'ICE the verified-record so it reads like a trophy, not a legal doc: give each metadata field a small leading icon — storage→<StorageIcon/>, record hash→<ShieldCheckIcon/>, model→<CpuIcon/>, anchor→<ChainIcon/> — in muted ink/pine. Make the "verified" mark use <ShieldCheckIcon/> in pine. KEEP the real field values and the honest framing copy EXACTLY. Keep the confetti-on-expand, Share flow, and all logic intact.',
  },
];

phase('Iconize');
const results = await parallel(
  TASKS.map((t) => () =>
    agent(`${RULES}\n\nYou OWN one file: ${t.path}\nFOCUS: ${t.focus}\n\nRead it, apply edits, then report.`, {
      label: t.label, phase: 'Iconize', schema: SCHEMA,
    }),
  ),
);
return { round4: results.filter(Boolean) };

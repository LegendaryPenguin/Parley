export const meta = {
  name: 'parley-polish-fixes',
  description: 'Apply the audit punch-list: one agent per file, fixing its specific mobile/a11y/motion/delight findings',
  phases: [{ title: 'Fix' }],
};

const RULES = `
PARLEY = a playful risograph language-learning game (talk your way through illustrated
places in your target language). Tokens/classes already exist globally: colors
(paper, ink, riso-blue, riso-pink, marigold, pine, indigo, grape, coral, mint, bubble,
sky, sunny), utilities (.pill .halftone .grain .overprint .wash-joy .float-bob .label-mono
.target-lang .font-pixel .pixel-badge), components (PrimaryButton/GhostButton/Panel,
FloatingShapes/PixelBadge/Confetti, SplitFlap, Stamp, Ticket, Postcard,
SceneBackground/NPCPortrait). framer-motion + useReducedMotion available.

HARD RULES:
- Edit ONLY your assigned file. Do not touch globals.css, layout.tsx, lib/*, or other files.
- Keep exported names + React prop signatures unchanged; keep all behavior/logic/store-calls intact.
- Keep TypeScript valid. Mobile one-thumb, AA contrast, focus rings, reduced-motion fallbacks.
- This is a targeted fix pass — apply the listed fixes well, plus obvious adjacent wins, nothing more.
`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['file', 'fixed', 'risk'],
  properties: {
    file: { type: 'string' },
    fixed: { type: 'array', items: { type: 'string' } },
    risk: { type: 'string' },
  },
};

const FIXES = [
  {
    path: 'components/scene/SceneClient.tsx',
    label: 'Scene',
    items: [
      'MOBILE: stage area should be h-[50vh] sm:h-[40vh] min-h-[200px] sm:min-h-[260px] so dialogue is not pushed off small screens.',
      'MOBILE: input dock padding py-2 sm:py-3, px-2 sm:px-4; the bottom toolbar (hint + fluency row) should be flex-col sm:flex-row with gap-2 sm:gap-3 so it never overflows < 360px.',
      'MOBILE: dialogue / correction / hint bubbles use max-w-[90%] sm:max-w-[85%]; NPC line text-base sm:text-lg; correction note text-xs sm:text-sm.',
      'A11Y (HIGH): the GreetablePortrait button focus ring is ring-paper which is invisible over the illustration — change to focus-visible:ring-4 focus-visible:ring-ink (or ring-riso-pink) with offset.',
      'DELIGHT: the typing indicator should name the character ("NAME is thinking…") and feel alive (e.g. a small wave/gesture or animated dots with personality), reduced-motion safe.',
      'COPY: warm up the two error strings to active re-engagement (e.g. "The local turned away for a moment — tap to catch their eye again.").',
    ],
  },
  {
    path: 'components/scene/MicInput.tsx',
    label: 'MicInput',
    items: [
      'MOBILE (HIGH-value): mobile-first layout — textarea full width on top, mic + Say-it buttons in a row beneath on small screens; switch to inline row at sm+. Buttons w-11 h-11 sm:w-12 sm:h-12, keep >=44px tap targets.',
      'MOTION: the InkWaveform bar animation must be guarded by reduced-motion (static bars when reduced).',
      'MOTION: remove the infinite "ready to send" wiggle — reserve infinite motion for split-flap/stamp only; a single quick pulse on text-entry is fine.',
      'COPY: listening placeholder shorter/warmer ("Listening — keep going").',
    ],
  },
  {
    path: 'components/scene/RewardSequence.tsx',
    label: 'Reward',
    items: [
      'MOBILE: modal should be w-[90vw] sm:max-w-md with padding p-4 sm:p-6 so it fits < 360px.',
      'MOBILE: word-collect cards flex-col sm:flex-row (term over meaning on mobile) with w-full so long terms (e.g. Japanese) do not overflow; term text-base sm:text-lg.',
    ],
  },
  {
    path: 'app/atlas/page.tsx',
    label: 'Atlas',
    items: [
      'MOBILE: header flex-col sm:flex-row sm:items-end sm:justify-between; PassportTab wrapper w-full sm:w-auto; progress dots flex-wrap so they never cause horizontal scroll.',
      'DELIGHT: locked place pins are too gray/boring — make them enticing (a "mystery" tint using grape/sunny rather than flat fog, a small lock glyph, and a gentle peek of the place name on hover/focus). Keep them non-navigable.',
    ],
  },
  {
    path: 'app/phrasebook/page.tsx',
    label: 'Phrasebook',
    items: [
      'MOBILE: collection meter flex-col sm:flex-row sm:items-center sm:justify-between; responsive label sizes; vocab card term spans get truncation (overflow-hidden text-ellipsis / break-words) so they never overflow a 2-col grid on narrow phones.',
      'DELIGHT: make the empty state a whimsical invitation — a bobbing travel-buddy (NPCPortrait) + floating shapes + playful copy + a colorful CTA, not a generic placeholder.',
      'DELIGHT: when the whole collection is mastered, make it a BIG moment — a Confetti burst + a celebratory star/medal, not just a text change.',
    ],
  },
  {
    path: 'app/passport/page.tsx',
    label: 'Passport',
    items: [
      'MOBILE: header stacks flex-col sm:flex-row; stamp grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 with gap-2 sm:gap-x-4 sm:gap-y-6; RecordRow header flex-col sm:flex-row sm:items-center sm:justify-between with the verified badge wrapping below on mobile (w-full min-w-0 on the title span).',
      'DELIGHT: the verified-record detail still reads like a legal doc — give each metadata field (storage / record hash / model / anchor) a tiny icon or pixel-badge and make the "verified" mark feel like a celebratory stamp, while KEEPING the honest framing copy and the real field values intact.',
    ],
  },
  {
    path: 'components/design/RisoIllustration.tsx',
    label: 'Illustrations',
    items: [
      'MOTION (HIGH): scenes have too many concurrent looping animations (butterfly, clouds, bunting, boat, waves, steam, lamps, barrier…). Reduce to 1–2 signature motions per scene; make the rest static or extremely slow/subtle. Honor the brief\'s "two bold beats, rest quiet".',
      'MOTION: any sun/large rotation should be 120s+ or static.',
      'A11Y: NPCPortrait focus ring should be fully opaque (focus-visible:ring-grape, not ring-grape/60).',
      'Keep SceneBackground + NPCPortrait exports/props and reduced-motion behavior.',
    ],
  },
  {
    path: 'components/design/Postcard.tsx',
    label: 'Postcard',
    items: [
      'A11Y (HIGH): the card has tabIndex={0} but no handler/role — it is decorative/visual. Remove tabIndex (and the now-needless focus ring) so it is not a confusing empty tab stop. Keep the forwardRef + props.',
      'MOTION: add motion-reduce:transition-none to the stamp/postmark hover transforms.',
    ],
  },
  {
    path: 'components/design/Ticket.tsx',
    label: 'Ticket',
    items: [
      'A11Y (HIGH): Ticket has tabIndex={0} + role="group" but is non-interactive — remove the tab stop (tabIndex and focus styling) since it is informational, OR make it a real button only if it has an action (it does not). Keep Ticket export + props.',
      'MOTION: add motion-reduce:transition-none to the perforation opacity + star rotate hover transitions.',
    ],
  },
  {
    path: 'components/design/PassportTab.tsx',
    label: 'PassportTab',
    items: [
      'A11Y: focus ring should be fully opaque — change focus-visible:ring-grape/60 to focus-visible:ring-grape. Keep export + props + the Link to /passport.',
    ],
  },
];

phase('Fix');
const results = await parallel(
  FIXES.map((f) => () =>
    agent(
      `${RULES}\n\nYou OWN exactly one file: ${f.path}\n\nApply these specific fixes (read the file first, then Edit):\n- ${f.items.join('\n- ')}\n\nReport what you fixed.`,
      { label: `fix:${f.label}`, phase: 'Fix', schema: SCHEMA },
    ),
  ),
);

return { fixes: results.filter(Boolean) };

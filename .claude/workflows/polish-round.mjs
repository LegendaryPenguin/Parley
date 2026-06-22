export const meta = {
  name: 'parley-polish-round',
  description: 'Fan out frontend/UX agents (one per file) to push Parley toward playful Zero Cup energy',
  phases: [
    { title: 'Redesign' },
    { title: 'Delight' },
    { title: 'Audit' },
  ],
};

const DESIGN_BRIEF = `
PARLEY is a language-learning game: an illustrated risograph travelogue world where you
talk your way through places (market, café, harbor...) in the language you're learning,
with AI characters who remember you. Built on 0G.

AESTHETIC TARGET — fuse "risograph travelogue" with "playful retro-arcade Zero Cup energy".
Think: a child would find this colorful, joyful, and irresistible. Bold, printed, tactile,
NOT a generic AI app.

DESIGN TOKENS (CSS vars already defined globally — USE THESE, do not invent hex):
  --paper #ece6da (base)  --paper-deep  --ink #211c18 (text)  --ink-soft
  --riso-blue #2a4bd7  --riso-pink #ff5c8a  --marigold #f2a60c  --pine #1f7a6b (success)
  --indigo #2e1a6b (bold headings)  --grape #7c5cff (bright purple)  --coral #f24c5e (buttons)
  --mint #a8e6cf  --bubble #f8c8dc  --sky #bcd8ff  --sunny #f5c518 (pastels/badges)
  Tailwind colors exist for all of these (e.g. text-grape, bg-coral, border-ink).

UTILITY CLASSES available globally:
  .grain (paper grain)  .halftone (printed dots)  .overprint (multiply blend)
  .wash-joy (mint→sky→pink gradient bg)  .pill (rounded pill w/ ink outline + offset shadow)
  .float-bob (slow floating)  .font-display (Bricolage)  .font-read (Newsreader, body/dialogue)
  .font-mono (Space Mono)  .font-pixel / .pixel-badge (retro Press Start 2P)  .target-lang
  .label-mono (uppercase letterspaced mono labels)

REUSABLE COMPONENTS (import from these paths, do not duplicate):
  @/components/design/ui  -> PrimaryButton, GhostButton, Panel, overprintSlide
  @/components/design/Playful -> FloatingShapes, PixelBadge, Confetti
  @/components/design/SplitFlap -> SplitFlap   @/components/design/Stamp -> Stamp
  @/components/design/Ticket -> Ticket   @/components/design/Postcard -> Postcard
  @/components/design/RisoIllustration -> SceneBackground, NPCPortrait
  framer-motion is available.

HARD RULES (breaking these wastes the run):
1. Edit ONLY the single file you are assigned. Do NOT touch globals.css, layout.tsx,
   any file under lib/, package.json, or other components.
2. Do NOT change the file's exported names or React prop signatures — other files import them.
   You may freely change internals, JSX, styling, motion, copy, and add LOCAL subcomponents.
3. Keep it TypeScript-valid and keep all existing behavior/data-flow/store-calls/handlers intact.
   This is a polish pass, not a rewrite of logic.
4. Mobile one-thumb usable, AA contrast (body text stays ink-on-light), visible focus rings,
   and every animation must degrade gracefully under prefers-reduced-motion.
5. Voice/copy = warm, wry travel companion. Name things by what the traveler does.
`;

const SUMMARY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['file', 'changes', 'risk'],
  properties: {
    file: { type: 'string' },
    changes: { type: 'array', items: { type: 'string' }, description: '3-7 concrete changes made' },
    risk: { type: 'string', description: 'any risk to build/behavior, or "none"' },
  },
};

const AUDIT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['lens', 'findings'],
  properties: {
    lens: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['file', 'issue', 'fix', 'severity'],
        properties: {
          file: { type: 'string' },
          issue: { type: 'string' },
          fix: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
      },
    },
  },
};

const FILES = [
  { path: 'app/page.tsx', label: 'Arrival', focus: 'The first impression. Cold-open split-flap + onboarding. Make it feel like checking in for a magical trip — joyful wash, floating shapes, bouncy pills, pixel-badge passport number. Keep the 3-step flow (cold→setup→stamping) and createProfile/connectWallet logic intact.' },
  { path: 'app/atlas/page.tsx', label: 'Atlas', focus: 'The map hub. Make the illustrated map of places delightful and game-like (think a board-game world map). Visited=marigold stamp, current=pulsing, locked=fog. Keep the states/route/PassportTab logic. Add playful flourishes but keep it readable.' },
  { path: 'app/phrasebook/page.tsx', label: 'Phrasebook', focus: 'Word collection + spaced review. Make cards feel like collectible trading cards / stickers a kid wants to complete. Mastery as a fun meter. Keep all store calls, review logic, filters, scheduleReview.' },
  { path: 'app/passport/page.tsx', label: 'Passport', focus: 'Progress + the verifiable 0G record + share postcard. Make the booklet feel like a treasured passport full of colorful stamps. Keep the verified-record fields (storage root, model attestation, anchor tx) and the honest framing copy and Share flow intact.' },
  { path: 'components/scene/SceneClient.tsx', label: 'Scene', focus: 'THE HEART. The conversation experience. PRESERVE ALL LOGIC (chat/judge calls, turns, openScene, handleSend, finishScene, hints, reward). Improve ONLY presentation: the stage, NPC framing, conversation bubbles, translate peel, correction notes, hint UI, input dock, fluency meter. Make talking to a character feel alive and warm.' },
  { path: 'components/design/RisoIllustration.tsx', label: 'Illustrations', focus: 'BIG visual win. The procedural two-color scene backgrounds (market/border/cafe/harbor/platform) and NPC portraits. Make them richer, more colorful, more characterful and charming — like a childrens picture-book crossed with riso prints. Keep exports SceneBackground and NPCPortrait and their props. Keep idle animations + reduced-motion.' },
  { path: 'components/scene/RewardSequence.tsx', label: 'Reward', focus: 'The payoff: words flip in → stamp slams → postcard. Make it euphoric and celebratory (confetti! use the Confetti component). The most shareable, joyful 3 seconds in the app. Keep the phase timing and router navigation and props.' },
  { path: 'components/design/SplitFlap.tsx', label: 'SplitFlap', focus: 'The signature transition. Make the flap clatter feel satisfying and crisp. Keep the SplitFlap export + props (text, className, size) and reduced-motion fallback. Tune timing/spacing/depth so it reads like a real departure board.' },
  { path: 'components/design/Stamp.tsx', label: 'Stamp', focus: 'The reward stamp. Make the slam + ink bloom feel earned and a little loud. Keep Stamp export + props (label, sublabel, color, size, animate). Add tasteful ink-bleed/texture; keep reduced-motion.' },
  { path: 'components/design/Postcard.tsx', label: 'Postcard', focus: 'The shareable artifact — must look gorgeous as a standalone image. Keep the forwardRef Postcard export + props. Make the composition postcard-perfect: illustration, the key line in target-lang, postmark, made-in-parley mark.' },
  { path: 'components/design/Ticket.tsx', label: 'Ticket', focus: 'The goal ticket stub. Keep Ticket export + props (number, place, children, color). Make it look like a real perforated transit ticket — halftone, notches, mono labels. Charming and legible.' },
  { path: 'components/design/PassportTab.tsx', label: 'PassportTab', focus: 'The little corner passport chip (level, streak, words, flag). Keep export + props (profile, wordCount) and the Link to /passport. Make it tactile and fun — maybe a pixel-badge for level. Tiny but delightful.' },
  { path: 'components/scene/MicInput.tsx', label: 'MicInput', focus: 'Push-to-talk + text input. Keep ALL logic (SpeechRecognition, onSend, props). Improve the ink waveform, the hold-to-speak affordance, the Say-it button. Make speaking feel inviting and obvious. Mobile-first.' },
  { path: 'components/design/Playful.tsx', label: 'Playful', focus: 'The decorative kit: FloatingShapes, PixelBadge, Confetti. Keep all three exports + props. Enrich the shape vocabulary (more arcade shapes, nicer confetti), keep them aria-hidden/pointer-events-none and reduced-motion-aware.' },
  { path: 'app/styleguide/page.tsx', label: 'Styleguide', focus: 'The internal showcase route. Make it a joyful gallery of every primitive in the new aesthetic. Low risk — go expressive. Keep it client-side and importing from existing components.' },
];

phase('Redesign');
const results = await pipeline(
  FILES,
  (f) =>
    agent(
      `${DESIGN_BRIEF}\n\nYou OWN exactly one file: ${f.path}\nFOCUS: ${f.focus}\n\nRead the file, then redesign it toward the aesthetic target. Apply your edits with the Edit/Write tools. Then report what you changed.`,
      { label: `redesign:${f.label}`, phase: 'Redesign', schema: SUMMARY_SCHEMA },
    ),
  (r, f) =>
    agent(
      `${DESIGN_BRIEF}\n\nYou OWN exactly one file: ${f.path}\nA prior pass already restyled it (summary: ${r ? JSON.stringify(r.changes) : 'n/a'}).\n` +
        `Now do a DELIGHT + CORRECTNESS pass on the SAME file only:\n` +
        `- add one or two tasteful microinteractions / playful touches a kid would love\n` +
        `- verify mobile one-thumb layout, AA contrast, focus rings, reduced-motion fallbacks\n` +
        `- fix any obvious bug, broken import, overflow, or TypeScript issue you introduced or find\n` +
        `Apply edits with Edit/Write, then report. Do NOT touch any other file.`,
      { label: `delight:${f.label}`, phase: 'Delight', schema: SUMMARY_SCHEMA },
    ),
);

phase('Audit');
const LENSES = [
  { key: 'kid-delight', prompt: 'Pretend you are a delighted, impatient 9-year-old AND a demanding art director. Across the app screens, what feels boring, flat, or grown-up-corporate and should be more colorful/playful/surprising? Read files to ground each finding.' },
  { key: 'mobile', prompt: 'Audit mobile one-thumb usability across the screens (app/*.tsx, components/scene/*). Find layout that breaks < 400px wide, tap targets too small, text overflow, or input docks that get covered.' },
  { key: 'a11y', prompt: 'Audit accessibility: AA contrast (body text must stay dark on light), focus-visible rings, alt/aria on illustrations & icon buttons, reduced-motion fallbacks. Read files to ground findings.' },
  { key: 'motion', prompt: 'Audit motion consistency & taste: is the split-flap + stamp the clear signature, is everything else restrained, any janky/no-fallback animations, anything that fights the brief\'s "two bold beats, rest quiet" rule?' },
  { key: 'copy', prompt: 'Audit microcopy/voice: warm wry travel companion, name things by what the traveler does, invitational empty states, in-world errors. Flag any flat/clinical/apologetic copy with a better line.' },
];
const audits = await parallel(
  LENSES.map((l) => () =>
    agent(`${DESIGN_BRIEF}\n\nREAD-ONLY audit (do not edit files). Lens: ${l.key}.\n${l.prompt}\nReturn concrete, file-specific findings with a suggested fix and severity.`, {
      label: `audit:${l.key}`,
      phase: 'Audit',
      agentType: 'Explore',
      schema: AUDIT_SCHEMA,
    }),
  ),
);

return {
  redesign: results.flat().filter(Boolean),
  audits: audits.filter(Boolean),
};

export const meta = {
  name: 'parley-ai-judge',
  description: 'AI-judge personas score the repo from different angles and return concrete fixes',
  phases: [{ title: 'Judge' }],
};

const CONTEXT = `
The repo is Parley (/Users/nischay.rawal/Desktop/parley): a language-learning game for the
0G Zero Cup hackathon. Built on 0G: Compute (live NPC turns + judging via the OpenAI-compatible
Router, qwen2.5-omni-7b, TEE/x_0g_trace attestation), Storage (@0gfoundation/0g-ts-sdk, encrypted
scene transcripts), Chain (keccak256(recordHash) anchor on Galileo testnet 16602). The ONLY 0G
seam is lib/og/ (mock + live impls toggled per service). Next.js 16 / React 19 / TS / Tailwind v4.
Key files: README.md, docs/diagrams/, lib/og/*, lib/engine/*, lib/content/scripts/*, app/api/*,
app/*/page.tsx, components/*, DEMO.md.

You are scoring this repo AS AN AI JUDGE would when reading it cold. Be rigorous and specific.
Read the actual files (README, lib/og, api routes, a couple screens) before judging — do not
guess. This is READ-ONLY: do not edit anything.
`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['lens', 'score', 'strengths', 'fixes'],
  properties: {
    lens: { type: 'string' },
    score: { type: 'number', description: '0-10 for this lens' },
    strengths: { type: 'array', items: { type: 'string' } },
    fixes: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'file', 'why', 'fix', 'severity', 'effort'],
        properties: {
          title: { type: 'string' },
          file: { type: 'string' },
          why: { type: 'string' },
          fix: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          effort: { type: 'string', enum: ['small', 'medium', 'large'] },
        },
      },
    },
    zerog_ideas: {
      type: 'array',
      description: 'optional: additional 0G capabilities worth showing for the demo',
      items: { type: 'string' },
    },
  },
};

const LENSES = [
  {
    key: 'technical-depth',
    prompt:
      'Judge technical depth & correctness. Is the architecture real and non-trivial? Do the claims in the README match the code (read lib/og, app/api, lib/engine)? Any overclaiming, dead code, or things that would embarrass us if a judge opened the file? What concrete changes would raise the technical credibility?',
  },
  {
    key: '0g-integration',
    prompt:
      'Judge the 0G integration specifically — this is a 0G hackathon, it is the most important axis. Is 0G load-bearing (Compute/Storage/Chain) or bolt-on? Read lib/og/* and app/api/*. Rate how convincingly "0G does real work". Then propose: (a) fixes to make the existing integration more obviously real to a judge, and (b) in zerog_ideas, ADDITIONAL 0G features worth adding/showing for the demo (e.g. 0G STT/TTS, fine-tuning, DA, KV store, INFTs, verifiable attestation display, on-chain leaderboard).',
  },
  {
    key: 'docs-legibility',
    prompt:
      'Judge how legible the repo is to an AI/human reading it cold. README quality, an at-a-glance file map, a short "how to verify the 0G claims" section, code comments at the seams, presence of LICENSE / ARCHITECTURE / clear run steps. What is missing that would help a judge quickly understand and trust the project?',
  },
  {
    key: 'demo-wow',
    prompt:
      'Judge demo-readiness & "wow". Read README + DEMO.md + the screen components. Is it instantly legible and shareable? Is the golden path obvious? What would make a 60-second demo land harder? Any rough edges a judge would hit in the first 30 seconds?',
  },
  {
    key: 'completeness',
    prompt:
      'Judge hackathon completeness against a typical rubric (working demo, public repo, clear 0G usage, originality, polish). What FIRST-SUBMISSION items are missing (LICENSE, a one-line "what/why", contact/links, demo video placeholder, env example accuracy, package.json metadata)? List concrete adds.',
  },
];

phase('Judge');
const results = await parallel(
  LENSES.map((l) => () =>
    agent(`${CONTEXT}\n\nLENS: ${l.key}\n${l.prompt}\n\nReturn your score, strengths, and concrete file-specific fixes.`, {
      label: `judge:${l.key}`,
      phase: 'Judge',
      agentType: 'Explore',
      schema: SCHEMA,
    }),
  ),
);
return { judges: results.filter(Boolean) };

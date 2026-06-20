import type { LangScript, SceneScript } from "./types";
import es from "./es";
import fr from "./fr";
import hi from "./hi";
import de from "./de";
import it from "./it";
import ja from "./ja";
import zh from "./zh";

// Registry of playable languages' content scripts.
const SCRIPTS: Record<string, LangScript> = { es, fr, hi, de, it, ja, zh };

export const SUPPORTED_LANGS = Object.keys(SCRIPTS);

export function getLangScript(lang: string): LangScript {
  return SCRIPTS[lang] ?? SCRIPTS.es;
}

export function getSceneScript(lang: string, sceneId: string): SceneScript {
  const ls = getLangScript(lang);
  return ls[sceneId] ?? getLangScript("es")[sceneId];
}

// ---- shared text matching (accent/case-insensitive) ----
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[¿?¡!.,]/g, " ");
}

function hasAny(haystack: string, group: string[]): boolean {
  const n = normalize(haystack);
  return group.some((w) => n.includes(normalize(w)));
}

// AND-of-OR: every group must have at least one keyword present.
export function matchesAll(haystack: string, groups: string[][]): boolean {
  return groups.every((g) => hasAny(haystack, g));
}

export function matchesAnyWord(haystack: string, word: string): boolean {
  return normalize(haystack).includes(normalize(word));
}

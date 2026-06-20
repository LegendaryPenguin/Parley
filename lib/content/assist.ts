import { getSceneScript } from "./scripts";

// Tap-to-translate + hints, now language-aware (read from the per-language
// scripts). Live mode can additionally translate arbitrary lines via /api/translate.

export function translate(lang: string, sceneId: string, line: string): string | undefined {
  const script = getSceneScript(lang, sceneId);
  return script.translations[line.trim()];
}

export function romanize(lang: string, sceneId: string, line: string): string | undefined {
  const script = getSceneScript(lang, sceneId);
  return script.readings?.[line.trim()];
}

export function getHints(lang: string, sceneId: string): string[] {
  return getSceneScript(lang, sceneId).hints;
}

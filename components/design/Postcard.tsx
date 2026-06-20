"use client";

import { forwardRef } from "react";
import { SceneBackground } from "./RisoIllustration";

// The shareable artifact. A riso postcard summarizing a scene: illustration +
// the key line nailed + the stamp. Exported as an image by Agent 6 / Passport.
export const Postcard = forwardRef<
  HTMLDivElement,
  { sceneId: string; place: string; keyLine: string; lineMeaning?: string; fluency: number }
>(function Postcard({ sceneId, place, keyLine, lineMeaning, fluency }, ref) {
  return (
    <div
      ref={ref}
      className="relative w-full max-w-md mx-auto bg-paper border-2 border-ink overflow-hidden"
      style={{ aspectRatio: "3 / 2" }}
    >
      <div className="absolute inset-0 opacity-90">
        <SceneBackground id={sceneId} alt={`${place} postcard`} />
      </div>
      {/* postmark */}
      <div className="absolute top-3 right-3 label-mono text-ink/70 border-2 border-ink/40 rounded-full px-2 py-1 -rotate-6">
        {place} · fl {fluency}
      </div>
      {/* caption band */}
      <div className="absolute bottom-0 left-0 right-0 bg-paper/90 border-t-2 border-ink px-4 py-3 backdrop-blur-[1px]">
        <p className="target-lang text-riso-blue text-lg leading-tight">&ldquo;{keyLine}&rdquo;</p>
        {lineMeaning && <p className="font-read italic text-ink-soft text-sm">{lineMeaning}</p>}
        <p className="label-mono text-ink/60 mt-1">made in parley</p>
      </div>
    </div>
  );
});

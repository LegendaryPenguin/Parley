"use client";

// Best-effort DOM → PNG via SVG foreignObject (no external deps). Falls back to
// window.print() in the caller if this throws. Good enough for the share beat;
// swap in html-to-image later if pixel-fidelity matters.
export async function toPng(node: HTMLElement): Promise<string> {
  const rect = node.getBoundingClientRect();
  const width = Math.ceil(rect.width) || 480;
  const height = Math.ceil(rect.height) || 320;

  const clone = node.cloneNode(true) as HTMLElement;
  // Inline computed styles so the snapshot isn't naked.
  inlineStyles(node, clone);

  const xml = new XMLSerializer().serializeToString(clone);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml">${xml}</div>
    </foreignObject>
  </svg>`;

  const img = new Image();
  img.crossOrigin = "anonymous";
  const svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);

  return new Promise<string>((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("no 2d context"));
      ctx.scale(2, 2);
      ctx.fillStyle = "#ece6da";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("snapshot render failed"));
    img.src = svgUrl;
  });
}

function inlineStyles(source: HTMLElement, target: HTMLElement) {
  const srcAll = source.querySelectorAll<HTMLElement>("*");
  const tgtAll = target.querySelectorAll<HTMLElement>("*");
  applyComputed(source, target);
  for (let i = 0; i < srcAll.length; i++) {
    if (tgtAll[i]) applyComputed(srcAll[i], tgtAll[i]);
  }
}

function applyComputed(src: HTMLElement, tgt: HTMLElement) {
  const cs = window.getComputedStyle(src);
  const props = [
    "color", "background-color", "background-image", "font-family", "font-size",
    "font-weight", "font-style", "line-height", "padding", "margin", "border",
    "border-radius", "text-align", "letter-spacing", "display", "position",
    "width", "height", "opacity", "box-shadow", "transform",
  ];
  let css = "";
  for (const p of props) css += `${p}:${cs.getPropertyValue(p)};`;
  tgt.setAttribute("style", css);
}

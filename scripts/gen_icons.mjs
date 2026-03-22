/**
 * Generates PWA icons and favicon from logo-source.svg using sharp.
 */
import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dir = dirname(fileURLToPath(import.meta.url));
const svgPath = join(__dir, "logo-source.svg");
const faviconSvgPath = join(__dir, "favicon-source.svg");
const outIcons = join(__dir, "..", "public", "icons");
const outApp = join(__dir, "..", "app");

const BG = { r: 28, g: 24, b: 20, alpha: 1 };

const svgSource = readFileSync(svgPath);
const faviconSvgSource = readFileSync(faviconSvgPath);

/** For the maskable variant, strip the rounded clip-path for full-bleed. */
const maskableSvg = Buffer.from(
  svgSource.toString().replace(/\s*clip-path="url\(#icon-clip\)"/g, "")
);

async function renderPng(svg, size) {
  return sharp(svg)
    .resize(size, size)
    .flatten({ background: BG })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

mkdirSync(outIcons, { recursive: true });

// ── PWA icons ──────────────────────────────────────────────────────────────
const specs = [
  { file: "icon-192.png",          size: 192, maskable: false },
  { file: "icon-512.png",          size: 512, maskable: false },
  { file: "apple-touch-icon.png",  size: 180, maskable: false },
  { file: "icon-512-maskable.png", size: 512, maskable: true  },
];

for (const { file, size, maskable } of specs) {
  const svg = maskable ? maskableSvg : svgSource;
  const buf = await renderPng(svg, size);
  const out = join(outIcons, file);
  await sharp(buf).toFile(out);
  console.log(`  wrote ${out}  (${size}×${size}${maskable ? "  maskable" : ""})`);
}

// ── Favicon (.ico with 256, 64, 32, 16 sizes) ─────────────────────────────
// sharp doesn't write .ico natively; build a multi-size PNG and save as ICO
// using the ico-endec approach via raw buffers, or simply output favicon.png
// and let Next.js serve it. Next.js 13+ auto-serves app/favicon.ico.
// We write a 32×32 PNG as favicon.ico — browsers accept PNG-in-ICO.
const faviconBuf = await renderPng(faviconSvgSource, 32);
const faviconPath = join(outApp, "favicon.ico");
await sharp(faviconBuf).toFile(faviconPath);
console.log(`  wrote ${faviconPath}  (32×32)`);

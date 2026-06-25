#!/usr/bin/env node
// Regenerates every binary asset (extension icons + Chrome Web Store imagery)
// from inline SVG sources, rendered to exact pixel sizes via headless Chrome.
// Run:  node tools/build-assets.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// ---- brand ---------------------------------------------------------------
const GREEN_D = "#1c8a5f";
const GREEN_L = "#34c98a";
const INK = "#11271d";
const MUTE = "#5b7a6c";
const PAPER = "#eef4f1";
const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

// ---- reusable artwork ----------------------------------------------------
// The icon glyph, authored in a 128×128 box. `bg` toggles the rounded tile
// (on for the app icon, off when the glyph is dropped onto a promo surface).
function glyph({ bg = true } = {}) {
  return `
    ${
      bg
        ? `<rect x="4" y="4" width="120" height="120" rx="28" fill="url(#tile)"/>`
        : ""
    }
    <g>
      <rect x="28" y="26" width="62" height="60" rx="9" fill="#ffffff"/>
      <path d="M28 35 a9 9 0 0 1 9 -9 h44 a9 9 0 0 1 9 9 v6 H28 Z" fill="#cdeede"/>
      <circle cx="39" cy="33" r="2.6" fill="${GREEN_D}"/>
      <circle cx="48" cy="33" r="2.6" fill="${GREEN_D}"/>
      <circle cx="57" cy="33" r="2.6" fill="${GREEN_D}"/>
      <rect x="37" y="52" width="44" height="5" rx="2.5" fill="#bfe7d4"/>
      <rect x="37" y="64" width="30" height="5" rx="2.5" fill="#bfe7d4"/>
    </g>
    <g>
      <circle cx="92" cy="92" r="23" fill="#ffffff"/>
      <path d="M92 80 V99" fill="none" stroke="${GREEN_D}" stroke-width="6.5" stroke-linecap="round"/>
      <path d="M83 91 L92 100 L101 91" fill="none" stroke="${GREEN_D}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="79" y="104" width="26" height="6" rx="3" fill="${GREEN_D}"/>
    </g>`;
}

const TILE_GRAD = `
  <linearGradient id="tile" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${GREEN_L}"/>
    <stop offset="1" stop-color="${GREEN_D}"/>
  </linearGradient>`;

function icon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <defs>${TILE_GRAD}</defs>${glyph()}</svg>`;
}

// A small browser-window illustration (tabs strip + page).
function browserWindow(x, y, w, h) {
  const tabW = (w - 24) / 4;
  let tabs = "";
  for (let i = 0; i < 4; i++) {
    const tx = x + 12 + i * tabW;
    tabs += `<rect x="${tx}" y="${y + 10}" width="${tabW - 6}" height="26" rx="6" fill="${
      i === 0 ? "#ffffff" : "#e3efe9"
    }"/>
    <rect x="${tx + 8}" y="${y + 20}" width="${tabW - 26}" height="6" rx="3" fill="${
      i === 0 ? GREEN_L : "#b9d4c8"
    }"/>`;
  }
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#ffffff" stroke="#dbe7e1" stroke-width="2"/>
    <rect x="${x}" y="${y}" width="${w}" height="46" rx="16" fill="#f1f6f3"/>
    <rect x="${x}" y="${y + 30}" width="${w}" height="16" fill="#f1f6f3"/>
    ${tabs}
    <rect x="${x + 24}" y="${y + 78}" width="${w - 48}" height="10" rx="5" fill="#e7efea"/>
    <rect x="${x + 24}" y="${y + 102}" width="${w - 120}" height="10" rx="5" fill="#eef3f0"/>
    <rect x="${x + 24}" y="${y + 126}" width="${w - 80}" height="10" rx="5" fill="#eef3f0"/>`;
}

// A Finder-like file list of saved shortcuts.
function fileList(x, y, w, h, rows) {
  let items = "";
  rows.forEach((r, i) => {
    const ry = y + 60 + i * 40;
    const isFolder = r.folder;
    items += `
      <g transform="translate(${x + 22}, ${ry})">
        ${
          isFolder
            ? `<path d="M0 6 a4 4 0 0 1 4 -4 h7 l4 5 h11 a4 4 0 0 1 4 4 v13 a4 4 0 0 1 -4 4 H4 a4 4 0 0 1 -4 -4 Z" fill="#7cc6a4"/>`
            : `<rect x="2" y="0" width="24" height="26" rx="4" fill="#eaf4ee" stroke="#bfe0cf" stroke-width="1.5"/>
               <path d="M9 9 a4 4 0 1 1 8 0 a4 4 0 0 1 -8 0 M7 19 a6 6 0 0 1 12 0" fill="none" stroke="${GREEN_D}" stroke-width="1.6"/>`
        }
        <text x="40" y="13" font-family="${FONT}" font-size="15" font-weight="${
      isFolder ? 600 : 500
    }" fill="${INK}">${r.name}</text>
        <text x="40" y="30" font-family="${FONT}" font-size="11" fill="${MUTE}">${r.sub}</text>
      </g>`;
  });
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#ffffff" stroke="#dbe7e1" stroke-width="2"/>
    <rect x="${x}" y="${y}" width="${w}" height="44" rx="16" fill="#f1f6f3"/>
    <rect x="${x}" y="${y + 28}" width="${w}" height="16" fill="#f1f6f3"/>
    <circle cx="${x + 20}" cy="${y + 22}" r="5" fill="#ff5f57"/>
    <circle cx="${x + 38}" cy="${y + 22}" r="5" fill="#febc2e"/>
    <circle cx="${x + 56}" cy="${y + 22}" r="5" fill="#28c840"/>
    <text x="${x + w / 2}" y="${y + 27}" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="600" fill="${MUTE}">Web Links</text>
    ${items}`;
}

function arrow(x, y) {
  return `<g transform="translate(${x},${y})">
    <circle cx="0" cy="0" r="34" fill="${GREEN_D}"/>
    <path d="M-13 0 H11 M3 -9 L13 0 L3 9" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
}

// ---- composed store images ----------------------------------------------
function screenshot1() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800">
    <defs>${TILE_GRAD}</defs>
    <rect width="1280" height="800" fill="${PAPER}"/>
    <g transform="translate(80,70) scale(0.55)">${glyph()}</g>
    <text x="160" y="108" font-family="${FONT}" font-size="40" font-weight="800" fill="${INK}">Export Tabs as Shortcuts</text>
    <text x="160" y="150" font-family="${FONT}" font-size="22" fill="${MUTE}">One click saves every open tab as a clickable shortcut file.</text>
    ${browserWindow(95, 250, 470, 360)}
    <text x="330" y="660" text-anchor="middle" font-family="${FONT}" font-size="20" font-weight="600" fill="${INK}">Your open tabs</text>
    ${arrow(640, 430)}
    ${fileList(720, 250, 470, 380, [
      { name: "Anthropic — Claude", sub: "claude.ai.webloc", folder: false },
      { name: "GitHub", sub: "github.com.webloc", folder: false },
      { name: "Hacker News", sub: "news.ycombinator.com.webloc", folder: false },
      { name: "Private", sub: "incognito tabs", folder: true },
    ])}
    <text x="955" y="680" text-anchor="middle" font-family="${FONT}" font-size="20" font-weight="600" fill="${INK}">Saved to your Downloads</text>
  </svg>`;
}

function screenshot2() {
  const cards = [
    ["One click", "No popup, no setup — click the toolbar icon and every tab is saved."],
    ["Incognito aware", "Tabs from private windows are routed into a separate Private/ folder."],
    ["Opens anywhere", "Double-click a file to reopen the page in your default browser."],
  ];
  let c = "";
  cards.forEach(([t, d], i) => {
    const cx = 90 + i * 375;
    c += `
      <rect x="${cx}" y="430" width="345" height="240" rx="20" fill="#ffffff" stroke="#dbe7e1" stroke-width="2"/>
      <circle cx="${cx + 46}" cy="486" r="26" fill="#e3f4ec"/>
      <text x="${cx + 46}" y="494" text-anchor="middle" font-family="${FONT}" font-size="26">${["⚡","🔒","↗"][i]}</text>
      <text x="${cx + 30}" y="552" font-family="${FONT}" font-size="24" font-weight="700" fill="${INK}">${t}</text>
      <foreignObject x="${cx + 30}" y="568" width="290" height="90">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:${FONT};font-size:16px;line-height:1.4;color:${MUTE}">${d}</div>
      </foreignObject>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800">
    <defs>${TILE_GRAD}</defs>
    <rect width="1280" height="800" fill="${PAPER}"/>
    <text x="640" y="120" text-anchor="middle" font-family="${FONT}" font-size="44" font-weight="800" fill="${INK}">Tidy, portable, cross-platform</text>
    <text x="640" y="168" text-anchor="middle" font-family="${FONT}" font-size="22" fill="${MUTE}">.webloc on macOS · .url on Windows &amp; Linux</text>
    ${fileList(440, 230, 400, 170, [
      { name: "Web Links", sub: "3 shortcuts", folder: true },
      { name: "Private", sub: "incognito tabs", folder: true },
    ])}
    ${c}
  </svg>`;
}

function promo(w, h, big) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${GREEN_D}"/>
        <stop offset="1" stop-color="#0f5c40"/>
      </linearGradient>${TILE_GRAD}
    </defs>
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    <g transform="translate(${big ? 70 : 30},${h / 2 - (big ? 110 : 70)}) scale(${big ? 1.7 : 1.05})">${glyph()}</g>
    <text x="${big ? 320 : 175}" y="${h / 2 - (big ? 18 : 8)}" font-family="${FONT}" font-size="${big ? 76 : 34}" font-weight="800" fill="#ffffff">Export Tabs</text>
    <text x="${big ? 320 : 175}" y="${h / 2 + (big ? 60 : 30)}" font-family="${FONT}" font-size="${big ? 40 : 19}" font-weight="500" fill="#cdeede">Save every tab as a shortcut, in one click</text>
  </svg>`;
}

// ---- render --------------------------------------------------------------
function render(svg, out, w, h) {
  const html = `<!doctype html><meta charset="utf8"><style>*{margin:0;padding:0}html,body{width:100%;height:100%}svg{display:block;width:100vw;height:100vh}</style>${svg}`;
  const tmp = join(tmpdir(), `asset-${w}x${h}-${Math.abs(hash(out))}.html`);
  writeFileSync(tmp, html);
  execFileSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--default-background-color=00000000",
      `--window-size=${w},${h}`,
      `--screenshot=${out}`,
      tmp,
    ],
    { stdio: "ignore" }
  );
  console.log("✓", out.replace(ROOT + "/", ""), `${w}×${h}`);
}
function hash(s) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return h;
}

mkdirSync(join(ROOT, "icons"), { recursive: true });
mkdirSync(join(ROOT, "store"), { recursive: true });

// Headless Chrome clamps very small windows, distorting tiny renders — so the
// icon is rendered once at high resolution and downscaled (Lanczos) per size.
const master = join(tmpdir(), "icon-master.png");
render(icon(), master, 1024, 1024);
for (const size of [16, 32, 48, 128]) {
  const out = join(ROOT, "icons", `icon${size}.png`);
  execFileSync("magick", [master, "-filter", "Lanczos", "-resize", `${size}x${size}`, out], { stdio: "ignore" });
  console.log("✓", `icons/icon${size}.png`, `${size}×${size}`);
}

render(screenshot1(), join(ROOT, "store", "screenshot-1.png"), 1280, 800);
render(screenshot2(), join(ROOT, "store", "screenshot-2.png"), 1280, 800);
render(promo(440, 280, false), join(ROOT, "store", "promo-small.png"), 440, 280);
render(promo(1400, 560, true), join(ROOT, "store", "promo-marquee.png"), 1400, 560);

console.log("\nAll assets regenerated.");

#!/usr/bin/env node
// Builds the upload-ready ZIP for the Chrome Web Store, containing ONLY the
// files the extension needs at runtime (no docs, store art, or tooling).
// Run:  node tools/package.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { version } = JSON.parse(
  readFileSync(join(ROOT, "manifest.json"), "utf8")
);

// Runtime payload only — what Chrome actually loads.
const INCLUDE = ["manifest.json", "bg.js", "icons", "LICENSE"];

for (const f of INCLUDE) {
  if (!existsSync(join(ROOT, f)))
    throw new Error(`Missing required file: ${f} (run build-assets first?)`);
}

mkdirSync(join(ROOT, "dist"), { recursive: true });
const out = join(ROOT, "dist", `tab-export-extension-v${version}.zip`);
rmSync(out, { force: true });

// -X strips extra macOS attributes; keeps the archive clean for review.
execFileSync("zip", ["-r", "-X", out, ...INCLUDE], {
  cwd: ROOT,
  stdio: "inherit",
});

console.log(`\nPackaged → dist/tab-export-extension-v${version}.zip`);

chrome.action.onClicked.addListener(async () => {
  const [tabs, platform] = await Promise.all([
    chrome.tabs.query({ currentWindow: true }),
    chrome.runtime.getPlatformInfo()
  ]);

  const isMac = platform.os === "mac";
  const isIncognito = tabs.some(t => t.incognito);
  const folder = isIncognito ? "Web Links/Private" : "Web Links";

  let exported = 0;
  for (const t of tabs) {
    if (!t.url || /^(chrome|chrome-extension|edge|about|devtools):/i.test(t.url)) continue;

    const base = sanitize(t.title || hostnameOf(t.url) || "untitled");
    const { content, ext, mime } = isMac ? webloc(t.url) : urlFile(t.url, t.title);

    try {
      await chrome.downloads.download({
        url: toDataUrl(content, mime),
        filename: `${folder}/${base}.${ext}`,
        conflictAction: "uniquify",
        saveAs: false
      });
      exported++;
    } catch (e) {
      console.warn("Failed to export tab", t.url, e);
    }
  }

  // Tiny visual confirmation via the badge.
  chrome.action.setBadgeText({ text: String(exported) });
  chrome.action.setBadgeBackgroundColor({ color: "#2a7" });
  setTimeout(() => chrome.action.setBadgeText({ text: "" }), 3000);
});

function webloc(url) {
  const content =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n` +
    `<plist version="1.0"><dict><key>URL</key><string>${escapeXml(url)}</string></dict></plist>\n`;
  // Use octet-stream so Chrome's MIME sniffing doesn't override our .webloc
  // extension and re-save the file as plain .xml (which won't open in a browser).
  return { content, ext: "webloc", mime: "application/octet-stream" };
}

function urlFile(url, title) {
  // Windows .url is an INI file with CRLF line endings. Linux desktops generally
  // open these too (or treat as plain text), so it's a safe cross-platform fallback.
  const content = `[InternetShortcut]\r\nURL=${url}\r\n`;
  return { content, ext: "url", mime: "application/octet-stream" };
}

function sanitize(name) {
  return name
    .replace(/[\/\\:*?"<>|\x00-\x1f]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "untitled";
}

function hostnameOf(url) {
  try { return new URL(url).hostname; } catch { return ""; }
}

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toDataUrl(content, mime) {
  const bytes = new TextEncoder().encode(content);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return `data:${mime};base64,${btoa(bin)}`;
}

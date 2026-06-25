# Export Tabs as Shortcuts

A one-click Chrome/Edge extension (Manifest V3) that saves every open tab in the
current window as a clickable shortcut file:

- **macOS** → `.webloc` ("Web internet location")
- **Windows / Linux** → `.url` (`[InternetShortcut]`)

Files land in your **Downloads** folder under `Web Links/`, and tabs from an
incognito window are routed into `Web Links/Private/`. Double-clicking any
saved file opens that URL in your default browser.

## Install (load unpacked)

1. Clone or download this repo:
   ```bash
   git clone https://github.com/bsc2fast/tab-export-extension.git
   ```
2. Open `chrome://extensions` (or `edge://extensions`).
3. Toggle **Developer mode** on (top-right).
4. Click **Load unpacked** and select the `tab-export-extension` folder.
5. The extension icon appears in the toolbar. Pin it if you like.

> To export from **incognito** windows, open the extension's **Details** page
> and enable **Allow in incognito**.

## Usage

Click the toolbar button. Every eligible tab in the current window is saved as a
shortcut file, and a green badge briefly shows how many were exported.
Internal pages (`chrome://`, `about:`, extension pages, etc.) are skipped.

## Updating

After editing the code, return to `chrome://extensions` and click the reload ↻
icon on the extension card — service-worker changes don't hot-reload.

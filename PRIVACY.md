# Privacy Policy — Export Tabs as Shortcuts

_Last updated: 2026-06-25_

**Export Tabs as Shortcuts does not collect, store, transmit, or sell any
personal data.** Everything the extension does happens locally on your own
computer.

## What the extension accesses

When you click the toolbar button, the extension reads the **titles and URLs**
of the tabs in the current window so it can write them into shortcut files. It
uses Chrome's `downloads` permission to save those files into your Downloads
folder. That is the full extent of its data access.

## What it does **not** do

- It does **not** send your tabs, URLs, browsing history, or any other data to
  any server. The extension makes **no network requests** of any kind.
- It does **not** use analytics, tracking, cookies, or third-party services.
- It does **not** read page contents, run scripts on pages, or access tabs in
  other windows.
- It does **not** retain data after the export completes — nothing is stored
  beyond the shortcut files you asked it to create.

## Permissions, and why they are needed

| Permission  | Why it is required                                                        |
|-------------|---------------------------------------------------------------------------|
| `tabs`      | To read the title and URL of each open tab in the current window.         |
| `downloads` | To save the generated `.webloc` / `.url` shortcut files to your computer. |

## Data handling

All processing is performed in-memory in the extension's service worker and the
only output is the shortcut files written to your local Downloads folder. No
data leaves your device.

## Contact

Questions or concerns: open an issue at
<https://github.com/bsc2fast/tab-export-extension/issues>.

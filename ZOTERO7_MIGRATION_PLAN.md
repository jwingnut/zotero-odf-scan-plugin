# Zotero 7 Migration Plan for ODF Scan Plugin

## Overview

This document captures the discovery and planning process for migrating the zotero-odf-scan-plugin from Zotero 6 to Zotero 7.

## Discovery Process

### 1. Reference Materials Analyzed

**Zotero 7 Plugin Template** (`/home/jay/github/zotero-plugin-template`):
- Modern TypeScript-based plugin structure
- Uses `zotero-plugin-scaffold` for build tooling
- Uses `zotero-plugin-toolkit` for helper utilities
- XHTML-based UI (replaces XUL)
- ESM module-based architecture

**Current ODF Scan Plugin Structure**:
- Classic XUL-based Firefox extension
- Python build script (`build.py`)
- Bootstrap extension pattern
- Direct XPCOM component access

### 2. Key Files in Zotero 7 Template

```
zotero-plugin-template/
├── addon/
│   ├── bootstrap.js          # Plugin lifecycle (Z7 pattern)
│   ├── manifest.json         # Plugin metadata (replaces install.rdf)
│   ├── prefs.js              # Default preferences
│   ├── content/
│   │   ├── preferences.xhtml # XHTML UI (replaces XUL)
│   │   └── icons/
│   └── locale/               # FTL localization files
├── src/
│   ├── index.ts              # Entry point
│   ├── hooks.ts              # Lifecycle hooks
│   ├── addon.ts              # Addon class
│   └── modules/              # Feature modules
├── package.json              # npm config with addon metadata
├── zotero-plugin.config.ts   # Build configuration
└── tsconfig.json
```

### 3. Current ODF Scan Plugin Structure

```
zotero-odf-scan-plugin/
├── bootstrap.js              # Plugin lifecycle (old pattern)
├── manifest.json             # Already added for Z7 (partial)
├── install.rdf               # Old metadata format
├── chrome.manifest           # XUL chrome registration
├── chrome/
│   ├── content/
│   │   ├── rtfScan.xul       # Main wizard UI (MUST CONVERT TO XHTML)
│   │   ├── rtfScan.js        # Main logic (~1,271 lines)
│   │   ├── options.xul       # Preferences
│   │   └── about.xul         # About dialog
│   └── locale/en-US/
│       ├── zotero.dtd        # DTD entities
│       └── zotero.properties # String bundle
├── resource/
│   └── translators/
│       └── Scannable Cite.js # Export translator
└── build.py                  # Python build script
```

---

## Critical Changes Required

### 1. XUL → XHTML Conversion (BREAKING)

**rtfScan.xul** must be completely rewritten as HTML/XHTML:

| XUL Element | HTML Equivalent |
|-------------|-----------------|
| `<wizard>` | Custom multi-step div-based UI or dialog |
| `<wizardpage>` | `<div>` with show/hide logic |
| `<groupbox>` | `<fieldset>` or `<div>` |
| `<caption>` | `<legend>` or `<h3>` |
| `<radiogroup>` | `<div>` with `<input type="radio">` |
| `<textbox>` | `<input type="text">` |
| `<tree>` | `<table>` or virtualized-table component |
| `<progressmeter>` | `<progress>` |
| `<listbox>` | `<select>` or custom list |
| `<description>` | `<p>` or `<span>` |

### 2. XPCOM/Components Access (BREAKING)

**Old code (Zotero 6)**:
```javascript
Components.classes["@mozilla.org/libjar/zip-reader;1"]
    .createInstance(Components.interfaces.nsIZipReader);
```

**New approach (Zotero 7)**:
- Use JavaScript libraries (JSZip) for ZIP handling
- Use Zotero's built-in file APIs
- No direct XPCOM access

### 3. Bootstrap.js Pattern Changes

**Old pattern**:
```javascript
function startup(data, reason) {
    watchWindows(addMenuItem);
}
```

**New pattern** (from template):
```javascript
async function startup({ id, version, resourceURI, rootURI }, reason) {
    var aomStartup = Components.classes["@mozilla.org/addons/addon-manager-startup;1"]
        .getService(Components.interfaces.amIAddonManagerStartup);
    var manifestURI = Services.io.newURI(rootURI + "manifest.json");
    chromeHandle = aomStartup.registerChrome(manifestURI, [
        ["content", "odf-scan", rootURI + "content/"],
    ]);
    // Load main script
    Services.scriptloader.loadSubScript(`${rootURI}/content/scripts/odf-scan.js`, ctx);
    await Zotero.ODFScan.hooks.onStartup();
}

async function onMainWindowLoad({ window }, reason) {
    await Zotero.ODFScan?.hooks.onMainWindowLoad(window);
}
```

### 4. Menu Registration Changes

**Old approach** (DOM manipulation):
```javascript
function addMenuItem(window) {
    let menu = window.document.getElementById('menu_ToolsPopup');
    let odfMenuElem = window.document.createElement('menuitem');
    odfMenuElem.setAttribute("oncommand", "window.openDialog(...)");
    menu.insertBefore(odfMenuElem, rtfMenuElem.nextSibling);
}
```

**New approach** (using ztoolkit or direct API):
```javascript
ztoolkit.Menu.register("menuTools", {
    tag: "menuitem",
    label: "ODF Scan",
    commandListener: () => openODFScanDialog(),
});
```

### 5. Dialog Opening Changes

**Old**:
```javascript
window.openDialog('chrome://rtf-odf-scan-for-zotero/content/rtfScan.xul', 'odfScan', 'chrome,centerscreen')
```

**New**:
```javascript
// Option A: Use Zotero's dialog utilities
Zotero.getMainWindow().openDialog(
    'chrome://odf-scan/content/rtfScan.xhtml',
    'odfScan',
    'chrome,centerscreen,resizable'
);

// Option B: Use ztoolkit dialog helper
const dialogHelper = new ztoolkit.Dialog(2, 1)
    .setDialogData(dialogData)
    .addCell(0, 0, { tag: "div", ... })
    .open("ODF Scan");
```

### 6. Localization Changes

**Old** (DTD entities + .properties):
```xml
<!ENTITY zotero.rtfScan.title "RTF/ODF Scan">
```
```javascript
stringBundleService.createBundle("chrome://.../zotero.properties")
```

**New** (Fluent .ftl files):
```ftl
# addon.ftl
odf-scan-title = ODF Scan for Zotero
odf-scan-menu-label = ODF Scan
```
```javascript
// In XHTML
<label data-l10n-id="odf-scan-title"></label>

// In JS
getString("odf-scan-title")
```

---

## Migration Strategy

### Option A: Full Modern Migration (Recommended for long-term)

1. Adopt TypeScript + zotero-plugin-scaffold build system
2. Use zotero-plugin-toolkit for UI helpers
3. Complete rewrite of UI as modern HTML/JS
4. Cleaner architecture, easier maintenance

**Pros**: Modern tooling, type safety, better DX
**Cons**: More initial work, learning curve

### Option B: Minimal Migration (Faster)

1. Keep JavaScript (no TypeScript)
2. Simple build script (or adapt build.py)
3. Convert XUL to XHTML manually
4. Keep existing code structure mostly intact

**Pros**: Faster, less risky
**Cons**: Technical debt, harder to maintain

---

## Detailed Migration Steps

### Phase 1: Build System Setup

1. Update `package.json` with Zotero 7 dependencies:
   ```json
   {
     "dependencies": {
       "zotero-plugin-toolkit": "^5.1.0-beta.13"
     },
     "devDependencies": {
       "zotero-plugin-scaffold": "^0.8.1",
       "zotero-types": "^4.1.0-beta.4"
     }
   }
   ```

2. Create `zotero-plugin.config.ts` (or `.js` for non-TS)

3. Update directory structure to match template

### Phase 2: Manifest & Bootstrap

1. Update `manifest.json`:
   ```json
   {
     "manifest_version": 2,
     "name": "ODF Scan for Zotero",
     "version": "3.0.0",
     "applications": {
       "zotero": {
         "id": "rtf-odf-scan-for-zotero@mystery-lab.com",
         "strict_min_version": "6.999",
         "strict_max_version": "8.*"
       }
     }
   }
   ```

2. Rewrite `bootstrap.js` using Z7 patterns (see template)

### Phase 3: UI Conversion

1. Convert `rtfScan.xul` → `rtfScan.xhtml`
2. Rewrite wizard as multi-step HTML form
3. Replace XUL tree with HTML table or virtualized-table
4. Update all DOM queries in `rtfScan.js`

### Phase 4: API Updates

1. Replace XPCOM ZIP handling with JSZip:
   ```javascript
   import JSZip from 'jszip';

   async function readODF(file) {
       const zip = await JSZip.loadAsync(file);
       const content = await zip.file("content.xml").async("string");
       return content;
   }
   ```

2. Update file picker usage for Z7 API

3. Update translator installation code

### Phase 5: Testing

1. Build XPI with new build system
2. Install in Zotero 7
3. Test all conversion modes (ODF to citations, ODF to markers)
4. Test menu registration and dialog opening
5. Test file operations

---

## Files to Create/Modify

### New Files Needed:
- `addon/content/rtfScan.xhtml` (convert from XUL)
- `addon/content/rtfScan.css` (styles for new UI)
- `addon/locale/en-US/addon.ftl` (Fluent strings)
- `zotero-plugin.config.ts` or build configuration
- `src/index.ts` (if using TypeScript)

### Files to Modify:
- `manifest.json` - update for Z7
- `bootstrap.js` - rewrite for Z7 pattern
- `chrome/content/rtfScan.js` - update APIs, DOM queries
- `package.json` - add dependencies

### Files to Remove (or keep for Z6 compatibility):
- `install.rdf` (Z7 uses manifest.json only)
- `chrome.manifest` (handled by bootstrap.js chrome registration)
- XUL files (replaced by XHTML)

---

## Reference Links

- [Zotero 7 for Developers](https://www.zotero.org/support/dev/zotero_7_for_developers)
- [Zotero Plugin Template](https://github.com/windingwind/zotero-plugin-template)
- [Make It Red Example](https://github.com/zotero/make-it-red)
- [zotero-plugin-toolkit Docs](https://github.com/windingwind/zotero-plugin-toolkit)

---

## Current zotero7 Branch Status

The `zotero7` branch already has:
- ✅ `manifest.json` with Z7 version constraints
- ✅ Some bootstrap.js modifications
- ❌ XUL files not yet converted
- ❌ XPCOM ZIP code not yet updated
- ❌ Build system not yet modernized

Commits on zotero7 branch:
1. `63e513b` - initial window opens
2. `11fbb37` - re-commit existing bootstrap.js
3. `59da4a6` - installs but not running yet
4. `ae578dd` - add initial Z7 files

---

## Next Steps

1. Decide on Option A (full modern) vs Option B (minimal)
2. Set up build system
3. Convert rtfScan.xul to rtfScan.xhtml
4. Update rtfScan.js for Z7 APIs
5. Test and iterate

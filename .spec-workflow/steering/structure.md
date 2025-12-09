# Project Structure

## Directory Organization

```
zotero-odf-scan-plugin/
├── bootstrap.js              # Plugin lifecycle (startup, shutdown, install, uninstall)
├── manifest.json             # Zotero 7 plugin manifest (version, compatibility)
├── install.rdf               # Legacy Zotero 6 metadata (to be removed for Z7)
├── chrome.manifest           # Legacy chrome registration (to be removed for Z7)
├── package.json              # npm config, scripts, dev dependencies
├── build.py                  # Python build script for XPI packaging
│
├── chrome/
│   ├── content/
│   │   ├── rtfScan.js        # Main conversion logic (~1,270 lines)
│   │   ├── rtfScan.xul       # Wizard UI definition (XUL → needs XHTML)
│   │   ├── options.xul       # Preferences dialog
│   │   └── about.xul         # About dialog
│   ├── locale/
│   │   └── en-US/
│   │       ├── zotero.dtd    # DTD localization entities
│   │       ├── zotero.properties  # Property-based strings
│   │       └── about.dtd     # About dialog strings
│   └── skin/                 # (icons and CSS if present)
│
├── resource/
│   └── translators/
│       └── Scannable Cite.js # Export translator for citation markers
│
├── docs/
│   └── update.rdf            # Update manifest for auto-updates
│
└── .spec-workflow/           # Spec workflow configuration
    ├── steering/             # Project steering documents
    └── templates/            # Document templates
```

## Key Files Explained

### Root Level

| File | Purpose |
|------|---------|
| `bootstrap.js` | Plugin lifecycle management. Handles startup/shutdown, menu registration, translator installation. Contains version-conditional code for Z6/Z7 compatibility. |
| `manifest.json` | Zotero 7 plugin descriptor. Defines name, version, compatibility range (7.0-7.999), icons, and background script. |
| `install.rdf` | Legacy Zotero 6 metadata in RDF format. Will be removed for Z7-only builds. |
| `build.py` | Python script that packages the plugin into an XPI (ZIP) file for distribution. |
| `package.json` | npm configuration for ESLint dev dependency and build/release scripts. |

### Chrome Content

| File | Purpose | Migration Status |
|------|---------|-----------------|
| `rtfScan.js` | Core conversion logic. Contains `Zotero_ODFScan` namespace with all UI callbacks, ODF parsing, citation detection, and file I/O. | Needs API updates |
| `rtfScan.xul` | Wizard UI with 6 pages: intro, scan, citations, style, format, complete. Uses XUL wizard element. | **Must convert to XHTML** |
| `options.xul` | Preferences dialog for plugin settings. | Must convert to XHTML |
| `about.xul` | About dialog showing version and credits. | Must convert to XHTML |

### Localization

| File | Purpose | Migration Status |
|------|---------|-----------------|
| `zotero.dtd` | DTD entities for UI strings (e.g., `&zotero.rtfScan.title;`). | **Must convert to Fluent (.ftl)** |
| `zotero.properties` | Property-based strings for JavaScript access. | Must convert to Fluent |

### Translator

| File | Purpose |
|------|---------|
| `Scannable Cite.js` | Zotero export translator. Generates citation markers in the format `{prefix | citation | locator | suffix | key}`. Installed into Zotero's translator directory on plugin install. |

## Naming Conventions

### Files
- **JavaScript files**: camelCase (`rtfScan.js`)
- **XUL/XHTML files**: camelCase (`rtfScan.xul`)
- **Localization**: lowercase with extensions (`zotero.dtd`, `zotero.properties`)
- **Config files**: lowercase with standard names (`manifest.json`, `package.json`)

### Code

**Functions/Methods:**
- **Public API**: camelCase (`introPageShowing`, `chooseInputFile`)
- **Private helpers**: underscore prefix (`_updatePath`, `_scanODF`, `_getString`)
- **Event handlers**: descriptive verbs (`treeClick`, `fileTypeSwitch`)

**Variables:**
- **Module globals**: camelCase (`inputFile`, `outputFile`, `citationItemIDs`)
- **Constants**: UPPER_SNAKE_CASE (`ACCEPT_ICON`, `BIBLIOGRAPHY_PLACEHOLDER`, `PREF_BRANCH`)
- **DOM elements**: camelCase with descriptive names (`unmappedCitationsItem`, `ambiguousCitationsChildren`)

**Classes/Objects:**
- **Namespaces**: PascalCase with underscore (`Zotero_ODFScan`)
- **Internal classes**: PascalCase (`Fragment`, `ODFConv`)

## Code Structure Patterns

### rtfScan.js Organization

```javascript
// 1. Module Initialization
var Zotero_ODFScan = new function() {
    // Constants
    const ACCEPT_ICON = "chrome://zotero/skin/rtfscan-accept.png";

    // Module-level state variables
    let inputFile = null, outputFile = null;

    // Localization setup
    let stringBundleService = Components.classes["@mozilla.org/intl/stringbundle;1"]...

    // 2. UI Page Handlers (public methods)
    this.introPageShowing = function() { ... };
    this.scanPageShowing = function() { ... };
    this.citationsPageShowing = function() { ... };

    // 3. User Action Handlers
    this.chooseInputFile = async function() { ... };
    this.chooseOutputFile = async function() { ... };
    this.treeClick = function(event) { ... };

    // 4. Private Helper Functions
    function _updatePath() { ... }
    function _scanODF(outputMode) { ... }
    function _formatRTF() { ... }

    // 5. Internal Classes (defined inside _scanODF)
    // Fragment - text manipulation helper
    // ODFConv - ODF conversion processor
};
```

### bootstrap.js Organization

```javascript
// 1. Constants and preferences
const PREF_BRANCH = "extensions.zotero.";
const PREFS = { ... };

// 2. Version-conditional setup (Z6 vs Z7)
if (Zotero.version < "7") { ... } else { ... }

// 3. Utility functions
function logMessage(msg) { ... }
function watchWindows(callback) { ... }
function unload(callback, container) { ... }

// 4. Plugin functionality
function addMenuItem(window) { ... }
function installTranslator() { ... }

// 5. Lifecycle hooks (required by Zotero)
function startup(data, reason) { ... }
function shutdown(data, reason) { ... }
function install(data, reason) { ... }
function uninstall(data, reason) { ... }
```

## Module Boundaries

### Core vs UI Separation

Currently **not well separated** - `rtfScan.js` contains both:
- UI logic (wizard page handlers, tree manipulation)
- Business logic (ODF parsing, citation conversion)

**Future consideration**: Extract conversion logic into separate module for testability.

### Plugin vs Zotero Interaction

```
┌─────────────────────────────────────────────────────────────┐
│ Plugin Code                                                 │
├─────────────────────────────────────────────────────────────┤
│ bootstrap.js         → Window management, lifecycle         │
│ rtfScan.js           → Conversion logic, UI control         │
│ Scannable Cite.js    → Export translator                    │
└───────────────┬─────────────────────────────────────────────┘
                │ Uses
                ▼
┌─────────────────────────────────────────────────────────────┐
│ Zotero APIs                                                 │
├─────────────────────────────────────────────────────────────┤
│ Zotero.Prefs         → Preference storage                   │
│ Zotero.File          → File operations                      │
│ Zotero.Items         → Item database access                 │
│ Zotero.Translators   → Translator management                │
│ Zotero.Styles        → Citation style access                │
│ Services.wm          → Window manager                       │
│ Components.*         → XPCOM services (deprecated in Z7)    │
└─────────────────────────────────────────────────────────────┘
```

## Code Size Guidelines

### Current State
- `rtfScan.js`: ~1,270 lines (too large, should be split)
- `bootstrap.js`: ~350 lines (reasonable)
- `Scannable Cite.js`: ~200 lines (appropriate)

### Recommendations
- **Target file size**: 300-500 lines per file
- **Function size**: 50-100 lines max
- **Nesting depth**: 4 levels max
- **Consider splitting** `rtfScan.js` into:
  - `odfConverter.js` - Core ODF parsing/conversion
  - `rtfConverter.js` - RTF-specific logic
  - `wizardController.js` - UI state management

## Zotero 7 Migration Structure

### Target Structure After Migration

```
zotero-odf-scan-plugin/
├── addon/
│   ├── bootstrap.js          # Updated for Z7 lifecycle
│   ├── manifest.json         # Z7 manifest (already exists)
│   ├── prefs.js              # Default preferences
│   └── content/
│       ├── rtfScan.xhtml     # Converted from XUL
│       ├── rtfScan.js        # Updated for Z7 APIs
│       ├── rtfScan.css       # Extracted/new styles
│       └── icons/
├── locale/
│   └── en-US/
│       └── addon.ftl         # Fluent localization
├── resource/
│   └── translators/
│       └── Scannable Cite.js # Unchanged
├── package.json              # Updated with Z7 dependencies
└── build configuration       # zotero-plugin.config.ts or similar
```

## Documentation Standards

- **JSDoc comments**: Required for all public functions
- **Inline comments**: For complex regex patterns and non-obvious logic
- **File headers**: License block at top of each source file
- **Migration notes**: Document Z6 vs Z7 differences inline during migration

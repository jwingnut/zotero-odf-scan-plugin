# Zotero 7 Reference: Overview & Dev Tools

Source: https://www.zotero.org/support/dev/zotero_7_for_developers

## Overview

Zotero 7 includes a major internal upgrade of the Mozilla platform, incorporating changes from Firefox 60 through Firefox 115.

Benefits:
- Performance gains
- New JavaScript features
- Better OS compatibility
- Native Apple Silicon Mac support

Going forward, Zotero will maintain alignment with Firefox Extended Support Release (ESR) versions.

## Dev Builds & Resources

- Dev builds are test versions exclusively for plugin developers
- The `dev` channel has been paused; use Zotero 7 beta builds instead
- Sample plugin "Make It Red" demonstrates plugin concepts

## Firefox Developer Tools Integration

Since Zotero runs on Firefox, developers can use Firefox Developer Tools for:
- DOM interaction
- Setting breakpoints
- Monitoring network requests

### Launching with Browser Toolbox

Launch beta builds with the `-jsdebugger` flag:

**macOS:**
```bash
/Applications/Zotero\ Beta.app/Contents/MacOS/zotero -ZoteroDebugText -jsdebugger
```

**Windows:**
```cmd
"C:\Program Files\Zotero\zotero.exe" -ZoteroDebugText -jsdebugger
```

**Linux:**
```bash
zotero -ZoteroDebugText -jsdebugger
```

When building from source, the `-d` flag on build_and_run script will rebuild with devtools enabled and activate `-jsdebugger` automatically.

# Zotero 7 Developer Reference

Source: https://www.zotero.org/support/dev/zotero_7_for_developers

## Using the Firefox Developer Tools

Zotero 7 enables developers to leverage Firefox Developer Tools for DOM interaction, code breakpoints, network monitoring, and additional debugging capabilities.

### Starting the Browser Toolbox

Zotero 7 beta builds include Firefox 115 devtools. To launch a beta build with the Browser Toolbox already open, use the `-jsdebugger` flag:

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

### Building from Source

When compiling Zotero from source code, the `-d` flag on the build_and_run script will rebuild with devtools enabled and activate the `-jsdebugger` parameter automatically.

## Key Zotero 7 Migration Information

### Bootstrap Plugin Framework

All Zotero plugins must transition from XUL overlays to bootstrapped plugins using a `manifest.json` file and `bootstrap.js` entry point. The bootstrap framework provides lifecycle hooks:

- `startup()` - Called when plugin starts
- `shutdown()` - Called when plugin shuts down
- `install()` - Called on first install
- `uninstall()` - Called when uninstalling

Plus window hooks:
- `onMainWindowLoad()` - Called when main Zotero window loads
- `onMainWindowUnload()` - Called when main Zotero window unloads

### Platform Updates

The upgrade incorporates Firefox 60 through Firefox 115 changes, eliminating:
- XUL overlay support
- Legacy extension formats
- `OS.File` and `OS.Path` APIs (replaced by IOUtils/PathUtils)

### New Plugin APIs

Zotero 7 introduces official registration methods for:
- Custom item tree columns via `ItemTreeManager`
- Custom item pane sections through `ItemPaneManager`
- Reader event handlers with `Reader.registerEventListener()`

These replace previous monkey-patching approaches.

## Debugging Tips

### JavaScript Console

Access the JavaScript console via:
- Tools > Developer > Error Console
- Or run JavaScript directly in the Browser Toolbox console

### Common Debug Commands

```javascript
// Check if plugin is loaded
Zotero.ODFScan

// Check plugin version
Zotero.ODFScan.version

// Debug logging
Zotero.debug("Your message here")

// Error logging
Zotero.logError(error)
```

### Inspecting Plugin Windows

When a plugin dialog is open, you can inspect it using the Browser Toolbox:
1. Launch Zotero with `-jsdebugger`
2. Open your plugin dialog
3. Use the Inspector tab to examine DOM elements
4. Use the Console tab to run JavaScript in the dialog context

## Script Loading in Dialogs

For XUL windows/dialogs, use `Services.scriptloader.loadSubScript()`:

```javascript
<script>
    Services.scriptloader.loadSubScript("chrome://zotero/content/include.js", this);
    Services.scriptloader.loadSubScript("chrome://your-plugin/content/your-script.js", this);
</script>
```

The second parameter (`this`) is the scope/context for the loaded script.

## File Operations

### Old API (deprecated):
```javascript
// Don't use these in Zotero 7
OS.File.read()
OS.Path.join()
```

### New API:
```javascript
// Use these instead
await IOUtils.read(path)
PathUtils.join(dir, filename)
await Zotero.File.getContentsAsync(path)
await Zotero.File.putContentsAsync(path, contents)
```

## FilePicker Usage

```javascript
// Import FilePicker
var { FilePicker } = ChromeUtils.importESModule("chrome://zotero/content/modules/filePicker.mjs");

// Create and show file picker
let fp = new FilePicker();
fp.init(window, "Select a file", fp.modeOpen);
fp.appendFilter("ODF Files", "*.odt");
let rv = await fp.show();
if (rv == fp.returnOK) {
    let selectedFile = fp.file; // Returns path string
}
```

## Chrome Registration

In bootstrap.js startup():

```javascript
var aomStartup = Components.classes[
    "@mozilla.org/addons/addon-manager-startup;1"
].getService(Components.interfaces.amIAddonManagerStartup);

var manifestURI = Services.io.newURI(rootURI + "manifest.json");
chromeHandle = aomStartup.registerChrome(manifestURI, [
    ["content", "your-plugin", rootURI + "content/"],
    ["locale", "your-plugin", "en-US", rootURI + "locale/en-US/"],
]);
```

This enables chrome:// URLs like:
- `chrome://your-plugin/content/dialog.xhtml`
- `chrome://your-plugin/locale/strings.ftl`

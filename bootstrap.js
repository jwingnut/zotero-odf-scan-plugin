/**
 * Zotero 7 Bootstrap for ODF Scan Plugin
 * Based on Zotero plugin template and Make It Red example
 */

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

let chromeHandle;

function install(data, reason) {}

function setDefaultPrefs(rootURI) {
    const defaults = Services.prefs.getDefaultBranch("");
    const scope = {
        pref(name, value) {
            const type = typeof value;
            if (type === "boolean") {
                defaults.setBoolPref(name, value);
            } else if (type === "number") {
                defaults.setIntPref(name, value);
            } else {
                defaults.setCharPref(name, `${value}`);
            }
        },
    };

    Services.scriptloader.loadSubScript(`${rootURI}/prefs.js`, scope);
}

async function startup({ id, version, resourceURI, rootURI }, reason) {
    // Register chrome content
    let aomStartup = Components.classes[
        "@mozilla.org/addons/addon-manager-startup;1"
    ].getService(Components.interfaces.amIAddonManagerStartup);
    let manifestURI = Services.io.newURI(rootURI + "manifest.json");
    chromeHandle = aomStartup.registerChrome(manifestURI, [
        ["content", "odf-scan", rootURI + "content/"],
        ["resource", "rtf-odf-scan-for-zotero", rootURI],
    ]);

    setDefaultPrefs(rootURI);

    /**
   * Global variables for plugin code.
   * The `_globalThis` is the global root variable of the plugin sandbox environment
   * and all child variables assigned to it is globally accessible.
   */
    const ctx = { rootURI };
    ctx._globalThis = ctx;

    // Load main script
    Services.scriptloader.loadSubScript(
        `${rootURI}/content/odf-scan.js`,
        ctx,
    );

    // Call startup hook
    if (Zotero.ODFScan && Zotero.ODFScan.hooks) {
        await Zotero.ODFScan.hooks.onStartup({ id, version, resourceURI, rootURI });
    }
}

async function onMainWindowLoad({ window }, reason) {
    if (Zotero.ODFScan && Zotero.ODFScan.hooks) {
        await Zotero.ODFScan.hooks.onMainWindowLoad(window);
    }
}

async function onMainWindowUnload({ window }, reason) {
    if (Zotero.ODFScan && Zotero.ODFScan.hooks) {
        await Zotero.ODFScan.hooks.onMainWindowUnload(window);
    }
}

async function shutdown({ id, version, resourceURI, rootURI }, reason) {
    if (reason === APP_SHUTDOWN) {
        return;
    }

    if (Zotero.ODFScan && Zotero.ODFScan.hooks) {
        await Zotero.ODFScan.hooks.onShutdown();
    }

    if (chromeHandle) {
        chromeHandle.destruct();
        chromeHandle = null;
    }
}

async function uninstall(data, reason) {}

/**
 * ODF Scan Plugin for Zotero 7
 * Main entry point and localization helpers
 */

if (!Zotero.ODFScan) {
    Zotero.ODFScan = {};
}

(function() {
    "use strict";

    /**
   * Localization helper function
   * Retrieves localized strings from Fluent localization system
   *
   * @param {string} key - The Fluent message ID (e.g., "odf-scan-title")
   * @param {Object} args - Optional arguments for parameterized strings
   * @returns {string} The localized string, or the key if not found
   */
    // Fallback strings for programmatic use (FilePicker titles, etc.)
    const STRINGS = {
        "odf-scan-title": "ODF Scan",
        "odf-scan-toolbar-label": "ODF Scan",
        "odf-scan-open-title": "Select a file to scan",
        "odf-scan-save-title": "Select a location in which to save the converted file",
        "odf-scan-file-type-odf": "Open Document Format (.odt)",
        "odf-scan-file-type-rtf": "Rich Text Format (.rtf)",
        "odf-scan-odf-scanned-file-suffix-to-citations": "(citations)",
        "odf-scan-odf-scanned-file-suffix-to-markers": "(markers)",
        "odf-scan-rtf-scanned-file-suffix-to-rtf": "(Scanned)"
    };

    Zotero.ODFScan.getString = function(key, args = null) {
        // Use hardcoded fallback strings for programmatic use
        if (STRINGS[key]) {
            return STRINGS[key];
        }
        // Return key as last resort
        Zotero.debug(`[ODF Scan] Localization key not found: ${key}`);
        return key;
    };

    /**
   * Async version of getString for use in async contexts
   *
   * @param {string} key - The Fluent message ID
   * @param {Object} args - Optional arguments for parameterized strings
   * @returns {Promise<string>} The localized string
   */
    Zotero.ODFScan.getStringAsync = async function(key, args = null) {
        try {
            // Try Zotero's localization system first
            if (Zotero.Intl && Zotero.Intl.getString) {
                return Zotero.Intl.getString("odf-scan", key, args);
            }

            // Try document.l10n
            if (typeof document !== "undefined" && document.l10n) {
                return await document.l10n.formatValue(key, args);
            }

            // Fallback
            Zotero.debug(`[ODF Scan] Localization key not found: ${key}`);
            return key;
        } catch (e) {
            Zotero.logError(e);
            return key;
        }
    };

    /**
   * Plugin lifecycle hooks for bootstrap.js
   */
    Zotero.ODFScan.hooks = {
    /**
     * Called when plugin starts up
     * @param {Object} params - Startup parameters {id, version, resourceURI, rootURI}
     */
        onStartup: async function(params) {
            Zotero.debug("[ODF Scan] Plugin starting up");
            Zotero.ODFScan.id = params && params.id;
            Zotero.ODFScan.version = params && params.version;
            Zotero.ODFScan.rootURI = params && params.rootURI;
            Zotero.debug(`[ODF Scan] Version ${(params && params.version) || "unknown"} loaded`);

            // Install the Scannable Cite translator
            await Zotero.ODFScan.installTranslator();
        },

        /**
     * Called when plugin shuts down
     */
        onShutdown: function() {
            Zotero.debug("[ODF Scan] Plugin shutting down");
            // Clean up any resources
        },

        /**
     * Called when main Zotero window loads
     * This is where we register the menu item
     * @param {Window} window - The Zotero main window
     */
        onMainWindowLoad: function(window) {
            Zotero.debug("[ODF Scan] Main window loaded, registering menu item");

            try {
                const doc = window.document;
                const toolsPopup = doc.getElementById("menu_ToolsPopup");

                if (!toolsPopup) {
                    Zotero.debug("[ODF Scan] Could not find Tools menu popup");
                    return;
                }

                const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
                // Create menu item that works across Zotero 6/7 window types
                const menuitem = doc.createXULElement
                    ? doc.createXULElement("menuitem")
                    : doc.createElementNS(XUL_NS, "menuitem");
                menuitem.id = "menu_odfScan";
                menuitem.setAttribute("label", Zotero.ODFScan.getString("odf-scan-toolbar-label"));
                menuitem.addEventListener("command", function() {
                    Zotero.ODFScan.openDialog(window);
                });

                // Insert menu item
                toolsPopup.appendChild(menuitem);

                Zotero.debug("[ODF Scan] Menu item registered successfully");
            } catch (e) {
                Zotero.logError(e);
            }
        },

        /**
     * Called when main Zotero window unloads
     * Clean up menu items and other UI elements
     * @param {Window} window - The Zotero main window
     */
        onMainWindowUnload: function(window) {
            Zotero.debug("[ODF Scan] Main window unloading, cleaning up");

            try {
                const doc = window.document;
                const menuitem = doc.getElementById("menu_odfScan");

                if (menuitem) {
                    menuitem.remove();
                    Zotero.debug("[ODF Scan] Menu item removed");
                }
            } catch (e) {
                Zotero.logError(e);
            }
        }
    };

    /**
   * Opens the ODF Scan dialog
   * @param {Window} parentWindow - Parent window for the dialog
   */
    Zotero.ODFScan.openDialog = function(parentWindow) {
        Zotero.debug("[ODF Scan] Opening ODF Scan dialog");

        try {
            const dialogURL = "chrome://odf-scan/content/odfScan.xhtml";
            const dialogFeatures = "chrome,centerscreen,resizable=yes,width=700,height=580";

            parentWindow.openDialog(
                dialogURL,
                "odf-scan-dialog",
                dialogFeatures
            );
        } catch (e) {
            Zotero.logError(e);
            parentWindow.alert("Failed to open ODF Scan dialog: " + e.message);
        }
    };

    /**
   * Install or update the Scannable Cite translator
   * Called during plugin startup to ensure the translator is available
   * @returns {Promise<boolean>} True if installation was successful
   */
    Zotero.ODFScan.installTranslator = async function() {
        try {
            Zotero.debug("[ODF Scan] Installing Scannable Cite translator");

            // Wait for Zotero schema to be ready
            await Zotero.Schema.schemaUpdatePromise;

            // Load translator file using rootURI set during startup
            const translatorPath = Zotero.ODFScan.rootURI + "resource/translators/Scannable%20Cite.js";
            const translatorCode = await Zotero.File.getContentsFromURLAsync(translatorPath);

            // Parse translator metadata and code
            // Translators have JSON metadata at the top, followed by code
            const match = translatorCode.match(/^([\s\S]+?}\n\n)([\s\S]+)/);
            if (!match) {
                throw new Error("Failed to parse translator file format");
            }

            const headerJSON = match[1];
            const code = match[2];

            // Parse the metadata JSON
            const header = JSON.parse(headerJSON);

            Zotero.debug(`[ODF Scan] Translator metadata: ${header.label} v${header.lastUpdated}`);

            // Save the translator to Zotero's database
            await Zotero.Translators.save(header, code);

            // Reinitialize translators to make the new one available
            await Zotero.Translators.reinit();

            Zotero.debug("[ODF Scan] Successfully installed Scannable Cite translator");
            return true;
        } catch (e) {
            Zotero.logError("[ODF Scan] Failed to install translator: " + e);
            // Don't throw - translator installation failure shouldn't prevent plugin from loading
            return false;
        }
    };

    Zotero.debug("[ODF Scan] Main script loaded");
})();

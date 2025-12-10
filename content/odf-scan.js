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
            const dialogURL = "chrome://odf-scan/content/rtfScan.xhtml";
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

    /**
   * Wizard Controller
   * Manages navigation between wizard pages
   */
    Zotero.ODFScan.WizardController = {
        currentPage: "intro",
        pages: ["intro", "scan", "complete"],
        canAdvanceState: false,

        /**
     * Navigate to a specific page
     * @param {string} pageId - The page to navigate to ('intro', 'scan', 'complete')
     */
        goToPage: function(pageId) {
            if (!this.pages.includes(pageId)) {
                Zotero.debug(`[ODF Scan] Invalid page ID: ${pageId}`);
                return;
            }

            Zotero.debug(`[ODF Scan] Navigating to page: ${pageId}`);

            // Hide all pages
            this.pages.forEach(page => {
                const pageElement = document.getElementById(`${page}-page`);
                if (pageElement) {
                    pageElement.hidden = true;
                }
            });

            // Show the target page
            const targetPage = document.getElementById(`${pageId}-page`);
            if (targetPage) {
                targetPage.hidden = false;
            }

            this.currentPage = pageId;
            this.updateButtons();
        },

        /**
     * Advance to the next page
     */
        advance: function() {
            const currentIndex = this.pages.indexOf(this.currentPage);
            if (currentIndex < this.pages.length - 1) {
                this.goToPage(this.pages[currentIndex + 1]);
            }
        },

        /**
     * Go back to the previous page
     */
        rewind: function() {
            const currentIndex = this.pages.indexOf(this.currentPage);
            if (currentIndex > 0) {
                this.goToPage(this.pages[currentIndex - 1]);
            }
        },

        /**
     * Check if the wizard can advance from the current page
     * @returns {boolean} True if can advance
     */
        canAdvance: function() {
            return this.canAdvanceState;
        },

        /**
     * Set whether the wizard can advance
     * @param {boolean} value - True to enable advance
     */
        setCanAdvance: function(value) {
            this.canAdvanceState = value;
            this.updateButtons();
        },

        /**
     * Update button states based on current page
     */
        updateButtons: function() {
            const backButton = document.getElementById("back-button");
            const nextButton = document.getElementById("next-button");
            const finishButton = document.getElementById("finish-button");

            if (!backButton || !nextButton || !finishButton) {
                return;
            }

            const currentIndex = this.pages.indexOf(this.currentPage);

            // Back button: enabled on all pages except first
            backButton.disabled = currentIndex === 0;

            // Next/Finish button logic
            if (currentIndex === this.pages.length - 1) {
                // Last page: show Finish button, hide Next
                nextButton.hidden = true;
                finishButton.hidden = false;
                finishButton.disabled = false;
            } else {
                // Other pages: show Next button, hide Finish
                nextButton.hidden = false;
                finishButton.hidden = true;
                nextButton.disabled = !this.canAdvanceState;
            }
        }
    };

    Zotero.debug("[ODF Scan] Main script loaded");
})();

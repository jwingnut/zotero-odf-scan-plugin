/**
 * ODF Scan Plugin for Zotero 7
 * Main entry point and localization helpers
 */

if (!Zotero.ODFScan) {
  Zotero.ODFScan = {};
}

(function() {
  'use strict';

  /**
   * Localization helper function
   * Retrieves localized strings from Fluent localization system
   *
   * @param {string} key - The Fluent message ID (e.g., "odf-scan-title")
   * @param {Object} args - Optional arguments for parameterized strings
   * @returns {string} The localized string, or the key if not found
   */
  Zotero.ODFScan.getString = function(key, args = null) {
    try {
      // Try to use Zotero's localization system
      if (Zotero.Intl && Zotero.Intl.getString) {
        // Zotero 7 built-in localization API
        return Zotero.Intl.getString('odf-scan', key, args);
      }

      // Fallback: try document.l10n if available (for dialog contexts)
      if (typeof document !== 'undefined' && document.l10n) {
        // This is async, so we need a synchronous fallback
        // For now, return a placeholder that will be replaced
        let result = key;
        document.l10n.formatValue(key, args).then(value => {
          result = value;
        });
        return result;
      }

      // Last resort: return the key itself
      Zotero.debug(`[ODF Scan] Localization key not found: ${key}`);
      return key;
    } catch (e) {
      Zotero.logError(e);
      return key;
    }
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
        return Zotero.Intl.getString('odf-scan', key, args);
      }

      // Try document.l10n
      if (typeof document !== 'undefined' && document.l10n) {
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
      Zotero.debug('[ODF Scan] Plugin starting up');
      Zotero.ODFScan.id = params.id;
      Zotero.ODFScan.version = params.version;
      Zotero.ODFScan.rootURI = params.rootURI;
      Zotero.debug(`[ODF Scan] Version ${params.version} loaded`);
    },

    /**
     * Called when plugin shuts down
     */
    onShutdown: function() {
      Zotero.debug('[ODF Scan] Plugin shutting down');
      // Clean up any resources
    },

    /**
     * Called when main Zotero window loads
     * This is where we register the menu item
     * @param {Window} window - The Zotero main window
     */
    onMainWindowLoad: function(window) {
      Zotero.debug('[ODF Scan] Main window loaded, registering menu item');

      try {
        const doc = window.document;
        const toolsPopup = doc.getElementById('menu_ToolsPopup');

        if (!toolsPopup) {
          Zotero.debug('[ODF Scan] Could not find Tools menu popup');
          return;
        }

        // Create menu item
        const menuitem = doc.createXULElement('menuitem');
        menuitem.id = 'menu_odfScan';
        menuitem.setAttribute('label', Zotero.ODFScan.getString('odf-scan-toolbar-label'));
        menuitem.addEventListener('command', function() {
          Zotero.ODFScan.openDialog(window);
        });

        // Insert menu item
        toolsPopup.appendChild(menuitem);

        Zotero.debug('[ODF Scan] Menu item registered successfully');
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
      Zotero.debug('[ODF Scan] Main window unloading, cleaning up');

      try {
        const doc = window.document;
        const menuitem = doc.getElementById('menu_odfScan');

        if (menuitem) {
          menuitem.remove();
          Zotero.debug('[ODF Scan] Menu item removed');
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
    Zotero.debug('[ODF Scan] Opening ODF Scan dialog');

    try {
      const dialogURL = 'chrome://odf-scan/content/rtfScan.xhtml';
      const dialogFeatures = 'chrome,centerscreen,resizable=yes,width=700,height=580';

      parentWindow.openDialog(
        dialogURL,
        'odf-scan-dialog',
        dialogFeatures
      );
    } catch (e) {
      Zotero.logError(e);
      parentWindow.alert('Failed to open ODF Scan dialog: ' + e.message);
    }
  };

  Zotero.debug('[ODF Scan] Main script loaded');
})();

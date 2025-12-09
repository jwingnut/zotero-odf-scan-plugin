# Tasks Document

## Phase 1: Bootstrap and Manifest Setup

- [x] 1.1 Update manifest.json for Zotero 7
  - File: `manifest.json`
  - Update plugin ID to match install.rdf
  - Set correct version constraints (strict_min_version: "6.999", strict_max_version: "8.*")
  - Add proper icon paths
  - Purpose: Ensure plugin is recognized by Zotero 7
  - _Leverage: zotero-plugin-template/addon/manifest.json_
  - _Requirements: REQ-1_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Zotero Plugin Developer | Task: Update manifest.json to be fully compatible with Zotero 7, using the zotero-plugin-template as reference. Set ID to "rtf-odf-scan-for-zotero@mystery-lab.com", version to "3.0.0", strict_min_version to "6.999", strict_max_version to "8.*" | Restrictions: Do not change the addon ID as existing users need upgrade path, keep icon paths relative to addon root | Success: manifest.json validates and Zotero 7 recognizes the plugin metadata correctly | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

- [x] 1.2 Rewrite bootstrap.js for Zotero 7 lifecycle
  - File: `bootstrap.js`
  - Implement async startup/shutdown pattern
  - Add chrome registration using aomStartup.registerChrome()
  - Add onMainWindowLoad/onMainWindowUnload hooks
  - Purpose: Enable plugin lifecycle in Zotero 7
  - _Leverage: zotero-plugin-template/addon/bootstrap.js, ZOTERO7_MIGRATION_PLAN.md_
  - _Requirements: REQ-1_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Zotero Plugin Developer with expertise in Mozilla addon lifecycle | Task: Rewrite bootstrap.js following Zotero 7 patterns from zotero-plugin-template. Use async startup with destructured params {id, version, resourceURI, rootURI}. Register chrome content at "odf-scan" path. Load main script via Services.scriptloader. Add onMainWindowLoad hook for menu registration | Restrictions: Remove old watchWindows pattern, do not use deprecated APIs, keep Zotero 6 conditional code only if needed for transition | Success: Plugin loads in Zotero 7, chrome content is registered, startup/shutdown hooks execute cleanly | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

- [x] 1.3 Create prefs.js for default preferences
  - File: `prefs.js`
  - Move preference defaults from bootstrap.js
  - Use Zotero 7 preference format
  - Purpose: Initialize plugin preferences on install
  - _Leverage: zotero-plugin-template/addon/prefs.js, current PREFS object in bootstrap.js_
  - _Requirements: REQ-7_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Zotero Plugin Developer | Task: Create prefs.js file that defines default preferences for the plugin. Migrate PREFS object from current bootstrap.js. Use pref() function format like: pref("extensions.zotero.ODFScan.fileType", "odf") | Restrictions: Keep same preference keys for backwards compatibility, use correct pref() syntax | Success: Preferences are initialized when plugin installs, existing user preferences are preserved on upgrade | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

## Phase 2: Localization Migration

- [x] 2.1 Create Fluent localization file
  - File: `locale/en-US/odf-scan.ftl`
  - Convert all DTD entities from chrome/locale/en-US/zotero.dtd
  - Convert all properties from chrome/locale/en-US/zotero.properties
  - Purpose: Provide Zotero 7 compatible localization
  - _Leverage: chrome/locale/en-US/zotero.dtd, chrome/locale/en-US/zotero.properties, zotero-plugin-template/addon/locale/en-US/addon.ftl_
  - _Requirements: REQ-6_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Localization Developer with Fluent expertise | Task: Create odf-scan.ftl with all strings from zotero.dtd and zotero.properties. Convert DTD entities like "<!ENTITY zotero.rtfScan.title ...>" to Fluent format "odf-scan-title = ...". Use kebab-case for all Fluent IDs | Restrictions: Keep all existing string values, use odf-scan- prefix for all keys, do not lose any strings | Success: All 35+ strings are migrated, file validates as valid Fluent syntax | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

- [x] 2.2 Create localization helper functions
  - File: `content/odf-scan.js` (new main script)
  - Add getString() helper function for JS access to Fluent strings
  - Set up document.l10n integration
  - Purpose: Enable programmatic string access
  - _Leverage: zotero-plugin-template/src/utils/locale.ts pattern_
  - _Requirements: REQ-6_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: JavaScript Developer | Task: Create getString() helper function that retrieves localized strings from Fluent. Use document.l10n.formatValue() or Zotero's built-in localization API. Provide synchronous fallback for places where async isn't possible | Restrictions: Handle missing keys gracefully with fallback to key name, do not use deprecated stringBundleService | Success: getString("odf-scan-title") returns correct localized string, works in both sync and async contexts | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

## Phase 3: UI Conversion (XUL to XHTML)

- [x] 3.1 Create rtfScan.xhtml wizard dialog structure
  - File: `content/rtfScan.xhtml`
  - Create XHTML document with proper namespaces
  - Add Fluent localization linkset
  - Create wizard container with page divs
  - Purpose: Replace XUL wizard with XHTML equivalent
  - _Leverage: chrome/content/rtfScan.xul structure, zotero-plugin-template/addon/content/preferences.xhtml_
  - _Requirements: REQ-2_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer with XHTML expertise | Task: Create rtfScan.xhtml as a proper XHTML dialog. Add <linkset> for Fluent localization. Create #wizard-container div with child divs for each page: intro-page, scan-page, complete-page. Add wizard navigation buttons (Back, Next, Finish). Use data-l10n-id attributes for localized text | Restrictions: Must be valid XHTML (properly closed tags, namespaces), do not use XUL elements, follow HTML5 semantics | Success: File loads without XML/HTML errors, structure matches XUL wizard layout | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

- [x] 3.2 Convert intro page UI elements
  - File: `content/rtfScan.xhtml` (continue)
  - Convert file type radio group from XUL to HTML
  - Convert file path textboxes to readonly inputs
  - Convert file chooser buttons
  - Add error message element
  - Purpose: Create functional intro page for file selection
  - _Leverage: chrome/content/rtfScan.xul intro-page section_
  - _Requirements: REQ-2_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer | Task: Convert the intro-page section from XUL to XHTML. Replace <radiogroup> with <div class="radio-group"> containing <input type="radio"> + <label> pairs. Replace <textbox readonly> with <input type="text" readonly>. Replace <button> elements. Add #odf-file-error-message span. Use fieldset/legend for grouping | Restrictions: Maintain same element IDs for JS compatibility, preserve onclick handlers (will be updated later), use data-l10n-id for all labels | Success: Intro page renders with file type selector, input/output path fields, and Choose File buttons | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

- [x] 3.3 Convert scan and complete pages
  - File: `content/rtfScan.xhtml` (continue)
  - Convert scan page with progress element
  - Convert complete page with description
  - Purpose: Complete wizard page structure
  - _Leverage: chrome/content/rtfScan.xul scan-page and complete-page sections_
  - _Requirements: REQ-2_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Developer | Task: Add scan-page div with <p> description and <progress> element (replaces <progressmeter>). Add complete-page div with completion message. Both pages should be initially hidden (class="wizard-page hidden") | Restrictions: Use HTML5 <progress> element, maintain same element IDs | Success: Scan page shows progress bar, complete page shows success message | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

- [x] 3.4 Create rtfScan.css for wizard styling
  - File: `content/rtfScan.css`
  - Style wizard container and navigation
  - Style wizard pages with show/hide classes
  - Style form elements (inputs, buttons, progress)
  - Purpose: Visual styling for XHTML wizard
  - _Leverage: Zotero 7 default styling patterns_
  - _Requirements: REQ-2_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: CSS Developer | Task: Create rtfScan.css with styles for wizard dialog. Style .wizard-page with display:none by default, .wizard-page.active with display:block. Style #wizard-buttons for bottom navigation bar. Style form elements to match Zotero 7 look. Add appropriate spacing and sizing for 700x580 dialog | Restrictions: Use Zotero's CSS variables where available, keep styling minimal and consistent with Zotero UI | Success: Wizard looks professional, pages show/hide correctly, buttons are properly positioned | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

## Phase 4: JavaScript Logic Updates

- [x] 4.1 Create main plugin script with namespace
  - File: `content/odf-scan.js`
  - Create Zotero.ODFScan namespace
  - Add hooks object (onStartup, onMainWindowLoad, etc.)
  - Set up module structure
  - Purpose: Entry point for plugin logic
  - _Leverage: zotero-plugin-template/src/hooks.ts pattern (adapted to JS), existing Zotero_ODFScan structure_
  - _Requirements: REQ-1_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: JavaScript Developer with Zotero expertise | Task: Create odf-scan.js as main entry point. Define Zotero.ODFScan namespace with hooks object containing onStartup, onMainWindowLoad, onMainWindowUnload, onShutdown. onMainWindowLoad should register the Tools menu item. Export hooks for bootstrap.js to call | Restrictions: Use IIFE pattern or proper module pattern, avoid polluting global namespace beyond Zotero.ODFScan | Success: Zotero.ODFScan.hooks.onStartup() can be called from bootstrap.js | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

- [x] 4.2 Implement menu registration
  - File: `content/odf-scan.js` (continue)
  - Add menu item to Tools menu in onMainWindowLoad
  - Open dialog when menu item clicked
  - Purpose: Provide user access to ODF Scan feature
  - _Leverage: ZOTERO7_MIGRATION_PLAN.md menu registration section_
  - _Requirements: REQ-1_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Zotero Plugin Developer | Task: In onMainWindowLoad, add "ODF Scan" menuitem to Tools menu (menu_ToolsPopup). Use DOM methods to create menuitem element. Set commandListener to open rtfScan.xhtml dialog. Ensure menu item is removed in onMainWindowUnload | Restrictions: Use standard DOM API, not ztoolkit (keeping minimal dependencies), follow existing Zotero menu patterns | Success: ODF Scan menu item appears in Tools menu, clicking opens the dialog | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

- [x] 4.3 Add wizard navigation controller
  - File: `content/odf-scan.js` (continue)
  - Add WizardController with goToPage(), advance(), rewind()
  - Track current page state
  - Enable/disable navigation buttons based on state
  - Purpose: Replace XUL wizard navigation behavior
  - _Leverage: design.md wizard state model_
  - _Requirements: REQ-2_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: JavaScript Developer with UI state management expertise | Task: Create WizardController that manages wizard page navigation. Track currentPage, implement goToPage(pageId) that hides all pages and shows target. Implement advance() and rewind() that move between pages in sequence. Update canAdvance state and button enabled states | Restrictions: Keep state in single object, pages are "intro", "scan", "complete", use class toggle for visibility | Success: Wizard navigates correctly between pages, buttons enable/disable appropriately | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

- [-] 4.4 Migrate rtfScan.js conversion logic
  - File: `content/rtfScan.js` (update existing)
  - Update DOM queries for XHTML elements
  - Replace document.documentElement.canAdvance with WizardController
  - Update event handler references
  - Purpose: Make conversion logic work with new UI
  - _Leverage: existing chrome/content/rtfScan.js, design.md component interfaces_
  - _Requirements: REQ-3, REQ-4_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: JavaScript Developer | Task: Update rtfScan.js to work with XHTML. Replace document.documentElement.canAdvance with WizardController calls. Update getElementById calls if any element IDs changed. Replace XUL-specific element access (tree.treeBoxObject, etc.) with HTML equivalents. Keep all conversion logic (Fragment class, ODFConv class, regex patterns) intact | Restrictions: Do NOT modify the core conversion regex patterns or logic, only update DOM interaction code | Success: All wizard page handlers work, conversion logic executes correctly | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

- [ ] 4.5 Update localization calls in rtfScan.js
  - File: `content/rtfScan.js` (continue)
  - Replace _getString() stringBundle calls with new getString() helper
  - Update string key names to match Fluent IDs
  - Purpose: Use Zotero 7 localization system
  - _Leverage: Task 2.2 getString() helper, locale/en-US/odf-scan.ftl keys_
  - _Requirements: REQ-6_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: JavaScript Developer | Task: Replace all _getString() calls with the new getString() helper. Update string keys from DTD/properties format to Fluent kebab-case format (e.g., "ODFScan.openTitle" -> "odf-scan-open-title"). Remove old stringBundleService code | Restrictions: Ensure all strings have matching keys in odf-scan.ftl, handle any strings that need parameters | Success: All localized strings display correctly, no stringBundle errors | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

## Phase 5: File I/O Updates

- [x] 5.1 Update ZIP file reading for Zotero 7
  - File: `content/rtfScan.js`
  - Replace XPCOM nsIZipReader with Zotero 7 compatible method
  - Use Zotero.File or IOUtils for file operations
  - Purpose: Read ODF files without deprecated APIs
  - _Leverage: design.md API changes section, Zotero 7 documentation_
  - _Requirements: REQ-5_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Zotero Plugin Developer with file I/O expertise | Task: Replace readZipfileContent() function's XPCOM ZIP code. Research Zotero 7's Zotero.File API for ZIP support. If not available, explore IOUtils + custom ZIP reading or bundling a minimal ZIP library. Extract content.xml and meta.xml from ODF file | Restrictions: Must work cross-platform, handle errors gracefully, do not use deprecated Components.classes for ZIP | Success: ODF files are read correctly, content.xml is extracted | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

- [x] 5.2 Update ZIP file writing for Zotero 7
  - File: `content/rtfScan.js`
  - Replace XPCOM nsIZipWriter with Zotero 7 compatible method
  - Implement copy-then-modify approach for ODF output
  - Purpose: Write modified ODF files without deprecated APIs
  - _Leverage: design.md API changes section_
  - _Requirements: REQ-5_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Zotero Plugin Developer with file I/O expertise | Task: Replace writeZipfileContent() function's XPCOM ZIP code. Use IOUtils.copy() to duplicate input file first. Then use Zotero 7's ZIP write API (or file replacement within archive). Update content.xml and meta.xml in the copied file | Restrictions: Must preserve all other ODF archive contents (styles, images, etc.), handle write errors gracefully | Success: Output ODF file is valid and opens in LibreOffice | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

## Phase 6: Translator Installation

- [x] 6.1 Update translator installation code
  - File: `content/odf-scan.js`
  - Update installTranslator() function for Zotero 7
  - Use correct resource URL path
  - Purpose: Install Scannable Cite translator on plugin install
  - _Leverage: existing installTranslator() in bootstrap.js_
  - _Requirements: REQ-8_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Zotero Plugin Developer | Task: Move and update installTranslator() function. Update resource URL to use new chrome path (chrome://odf-scan/content/...). Ensure Zotero.Translators.save() and reinit() are called after schema ready. Show progress window during installation | Restrictions: Keep existing translator file unchanged, handle errors gracefully | Success: Scannable Cite translator appears in Zotero's export formats after plugin install | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

## Phase 7: Build and Packaging

- [x] 7.1 Update package.json
  - File: `package.json`
  - Update version to 3.0.0
  - Add/update build scripts for XPI creation
  - Remove unnecessary dev dependencies
  - Purpose: Enable building distributable XPI
  - _Leverage: existing package.json, build.py logic_
  - _Requirements: REQ-1_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: DevOps Engineer | Task: Update package.json with version 3.0.0. Add "build" script that creates XPI (can call Python script or use Node-based approach). Update description for Zotero 7. Keep ESLint for code quality | Restrictions: Keep build simple, XPI must contain all required files | Success: npm run build creates valid XPI file | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

- [x] 7.2 Update build script for new structure
  - File: `build.py` or new build script
  - Update file paths for new directory structure
  - Include all new files (XHTML, FTL, CSS)
  - Exclude old XUL files and install.rdf
  - Purpose: Package plugin with correct structure
  - _Leverage: existing build.py_
  - _Requirements: REQ-1_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: DevOps Engineer | Task: Update build.py (or create new build script) to package new file structure. Include: bootstrap.js, manifest.json, prefs.js, content/*.xhtml, content/*.js, content/*.css, locale/**/*.ftl, resource/translators/*. Exclude: install.rdf, chrome.manifest, *.xul files | Restrictions: Output must be valid ZIP renamed to .xpi, maintain cross-platform compatibility | Success: Built XPI installs in Zotero 7 and contains all required files | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

## Phase 8: Testing and Validation

- [x] 8.1 Test plugin installation
  - Verify XPI installs in Zotero 7
  - Verify menu item appears
  - Verify dialog opens
  - Purpose: Confirm basic functionality
  - _Requirements: REQ-1, REQ-2_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer | Task: Manually test plugin installation in Zotero 7. Build XPI and install via Add-ons Manager. Verify no console errors on startup. Verify ODF Scan menu item in Tools menu. Verify clicking opens wizard dialog. Check dialog renders correctly | Restrictions: Test on Zotero 7.x, document any issues found | Success: Plugin installs, menu appears, dialog opens without errors | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

- [x] 8.2 Test ODF to citations conversion
  - Create test ODF file with citation markers
  - Run conversion
  - Verify output contains Zotero reference marks
  - Purpose: Confirm core functionality works
  - _Requirements: REQ-3_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer | Task: Create test ODF document with scannable cite markers. Test conversion to citations mode. Verify output file opens in LibreOffice. Verify reference marks are present and contain correct JSON data. Test markers with prefix, suffix, locator, suppress-author | Restrictions: Test with real ODF files, verify round-trip compatibility | Success: All citation markers converted correctly with metadata preserved | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

- [x] 8.3 Test ODF to markers conversion
  - Create test ODF file with Zotero references
  - Run reverse conversion
  - Verify output contains scannable markers
  - Purpose: Confirm reverse functionality works
  - _Requirements: REQ-4_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer | Task: Create test ODF document with Zotero reference marks (or use output from 8.2). Test conversion to markers mode. Verify output file contains scannable cite format markers. Verify all metadata (prefix, suffix, locator, suppress-author) is preserved in marker format | Restrictions: Test complete round-trip | Success: Reference marks converted back to scannable markers correctly | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

- [x] 8.4 Final cleanup and documentation
  - Remove deprecated files (install.rdf, chrome.manifest, XUL files)
  - Update README for Zotero 7
  - Document any breaking changes
  - Purpose: Clean repository and inform users
  - _Requirements: All_
  - _Prompt: Implement the task for spec zotero7-migration, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Technical Writer / Developer | Task: Remove deprecated files that are no longer needed: install.rdf, chrome.manifest, chrome/content/*.xul, chrome/locale/**. Update README.md with Zotero 7 compatibility notice and installation instructions. Document minimum Zotero version (7.0) | Restrictions: Do not delete files that might be needed for Z6 branch, ensure clean git history | Success: Repository contains only Z7-compatible files, documentation is updated | Instructions: Before starting, edit tasks.md to change [ ] to [-] for this task. After completion, use log-implementation tool to record what was done, then edit tasks.md to change [-] to [x]_

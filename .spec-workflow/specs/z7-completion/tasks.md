# Tasks: Zotero 7 Migration Completion

## Phase 1: JSZip Integration

### Task 1.1: Add JSZip Library
- [x] 1.1.1 Download jszip.min.js v3.10.1 from https://github.com/Stuk/jszip/releases/download/v3.10.1/jszip.min.js
- [x] 1.1.2 Create `content/lib/` directory and place file at `content/lib/jszip.min.js`
- [-] 1.1.3 Commit jszip.min.js to git (do NOT add to .gitignore - this is a vendored dependency)
- [x] 1.1.4 Update build.py to include `content/lib/**/*` in files_to_include glob

_Files to create: `content/lib/jszip.min.js`_

_Files to modify: `build.py`_

_Note: JSZip is vendored (committed to repo) rather than npm-installed because the plugin has no bundler. The minified file is ~100KB._

### Task 1.2: Add JSZip Script Tag to XHTML
- [x] 1.2.1 Add script tag for lib/jszip.min.js before rtfScan.js in rtfScan.xhtml

_Files to modify: `content/rtfScan.xhtml`_

### Task 1.3: Create JSZip Helper Functions in rtfScan.js
- [x] 1.3.1 Add async readODFContent(inputPath) function using JSZip and Zotero.File.getBinaryContentsAsync
- [x] 1.3.2 Add async writeODFContent(inputPath, outputPath, content, meta) function using JSZip

_Files to modify: `content/rtfScan.js`_

### Task 1.4: Replace XPCOM ZIP Methods in ODFConv Class
- [x] 1.4.1 Rewrite readZipfileContent() at line 771 to use new JSZip readODFContent helper
- [x] 1.4.2 Rewrite writeZipfileContent() at line 810 to use new JSZip writeODFContent helper
- [x] 1.4.3 Remove Components.utils.import for FileUtils.jsm and NetUtil.jsm
- [x] 1.4.4 Remove nsIZipReader and nsIZipWriter usage
- [x] 1.4.5 Remove nsIScriptableUnicodeConverter usage at line 845
- [x] 1.4.6 Make convert() method async and update caller in _scanODF to await it

_Files to modify: `content/rtfScan.js`_

## Phase 2: Dead Code Removal

### Task 2.1: Remove RTF-Specific Page Functions
- [ ] 2.1.1 Remove citationsPageShowing() function at line 1019 (RTF-only, references tree element)
- [ ] 2.1.2 Remove citationsPageRewound() function at line 1033 (references unmappedCitationsChildren)
- [ ] 2.1.3 Remove treeClick() function at line 1057 (XUL tree interaction)
- [ ] 2.1.4 Remove stylePageShowing() function at line 1138 (RTF-only, references style-listbox)
- [ ] 2.1.5 Remove stylePageAdvanced() function at line 1151 (RTF-only)
- [ ] 2.1.6 Remove formatPageShowing() function at line 1195 (RTF formatting)
- [ ] 2.1.7 Remove _formatRTF() function at line 1209 (RTF formatting)

_Files to modify: `content/rtfScan.js`_

### Task 2.2: Remove Dead Variables and Helper Functions
- [ ] 2.2.1 Remove _generateItem() function at line 934 (creates XUL treeitem elements)
- [ ] 2.2.2 Remove _matchesItemCreators() function at line 954 (RTF citation matching)
- [ ] 2.2.3 Remove _matchesItemCreator() function at line 984 (RTF citation matching)
- [ ] 2.2.4 Remove _refreshCanAdvance() function at line 1120 (references citationItemIDs)
- [ ] 2.2.5 Remove unused variables at line 50: unmappedCitationsItem, ambiguousCitationsItem, mappedCitationsItem
- [ ] 2.2.6 Remove unused variables at line 51: unmappedCitationsChildren, ambiguousCitationsChildren, mappedCitationsChildren
- [ ] 2.2.7 Remove unused variables at line 52: citations, citationItemIDs, allCitedItemIDs, contents

_Files to modify: `content/rtfScan.js`_

### Task 2.3: Verify Simplified Page Flow
- [ ] 2.3.1 Confirm wizard only uses intro, scan, complete pages (already correct in WizardController)
- [ ] 2.3.2 Verify advance() only handles intro and scan pages (update if needed)
- [ ] 2.3.3 Test dialog opens and navigates correctly after dead code removal

_Files to modify: `content/rtfScan.js` (if needed)_

## Phase 3: Localization Completion

### Task 3.1: Add Missing UI Element Keys
- [ ] 3.1.1 Add odf-scan-file-type-label for File type fieldset legend
- [ ] 3.1.2 Add odf-scan-odf-to-citations for radio button label
- [ ] 3.1.3 Add odf-scan-odf-to-markers for radio button label
- [ ] 3.1.4 Add odf-scan-file-error for error message span
- [ ] 3.1.5 Add odf-scan-back-button for Back button
- [ ] 3.1.6 Add odf-scan-cancel-button for Cancel button
- [ ] 3.1.7 Add odf-scan-next-button for Next button
- [ ] 3.1.8 Add odf-scan-finish-button for Finish button

_Files to modify: `locale/en-US/odf-scan.ftl`_

### Task 3.2: Verify Existing Keys Match XHTML data-l10n-id Attributes
- [ ] 3.2.1 Verify odf-scan-input-file matches (currently odf-scan-input-file-label in ftl)
- [ ] 3.2.2 Verify odf-scan-output-file matches (currently odf-scan-output-file-label in ftl)
- [ ] 3.2.3 Verify odf-scan-choose-file matches (currently odf-scan-file-choose-label in ftl)
- [ ] 3.2.4 Verify odf-scan-no-file-selected matches (currently odf-scan-file-none-selected-label in ftl)
- [ ] 3.2.5 Verify odf-scan-scan-description matches odf-scan-scan-page-description
- [ ] 3.2.6 Verify odf-scan-complete-description matches odf-scan-complete-page-description
- [ ] 3.2.7 Add aliases or update XHTML to use correct key names

_Files to modify: `locale/en-US/odf-scan.ftl` and/or `content/rtfScan.xhtml`_

### Task 3.3: Add Intro Page Description Keys
- [ ] 3.3.1 Verify odf-scan-intro-description-start exists or add it
- [ ] 3.3.2 Verify odf-scan-intro-link exists or add it
- [ ] 3.3.3 Verify odf-scan-intro-description2 exists or add it
- [ ] 3.3.4 Verify odf-scan-intro-example1/2/3 exist or add them

_Files to modify: `locale/en-US/odf-scan.ftl`_

## Phase 4: Build and Verification

### Task 4.1: Update Build Configuration
- [ ] 4.1.1 Verify build.py includes content/lib directory in glob patterns
- [ ] 4.1.2 Build XPI with python3 build.py
- [ ] 4.1.3 Extract XPI and verify content/lib/jszip.min.js is present
- [ ] 4.1.4 Verify locale/en-US/odf-scan.ftl is included in XPI

_Files to modify: `build.py` (if needed)_

_Note: npm install may update package-lock.json if ESLint deps are refreshed_

### Task 4.2: ESLint Compliance
- [ ] 4.2.1 Run npm install to get ESLint dependencies
- [ ] 4.2.2 Run npm test to check for lint errors
- [ ] 4.2.3 Fix any ESLint errors in modified JavaScript files

_Files to modify: Various JS files as needed, potentially package-lock.json_

### Task 4.3: Manual Testing
- [ ] 4.3.1 Install XPI in Zotero 7 and verify no console errors on load
- [ ] 4.3.2 Verify Tools menu shows ODF Scan item
- [ ] 4.3.3 Open dialog and verify intro page displays with all localized strings
- [ ] 4.3.4 Test file type radio buttons switch correctly
- [ ] 4.3.5 Test input and output file selection dialogs
- [ ] 4.3.6 Test ODF to citations conversion with sample file
- [ ] 4.3.7 Test ODF to markers conversion with sample file
- [ ] 4.3.8 Verify error handling for invalid/corrupted ODF files
- [ ] 4.3.9 Verify wizard navigation (back, next, cancel, finish buttons)

## Dependencies

```
Phase 1 (JSZip) ─────┐
                     ├──► Phase 4 (Build/Test)
Phase 2 (Dead Code) ─┤
                     │
Phase 3 (Localization)
```

- Phase 1, 2, and 3 can run in parallel
- Phase 4 depends on Phases 1, 2, and 3 completing
- Phase 4.2 (ESLint) may update package-lock.json

## Summary

| Phase | Tasks | Focus |
|-------|-------|-------|
| Phase 1: JSZip Integration | 4 | Replace XPCOM ZIP APIs |
| Phase 2: Dead Code Removal | 3 | Remove RTF-specific code |
| Phase 3: Localization | 3 | Fix missing/mismatched keys |
| Phase 4: Build/Verification | 3 | Build, lint, test |
| **Total** | **13 tasks** | |

## Key Changes from Previous Plan

1. Phase 4 (Dialog Controller) removed - `Zotero_ODFScan` already exists with init/file pickers/handlers
2. Phase 2 updated to reference specific line numbers and function names
3. Phase 3 updated to verify existing keys vs add new ones (avoid duplicates)
4. Added note about JSZip being committed to source control (vendored)
5. Added note about package-lock.json potentially changing during npm install

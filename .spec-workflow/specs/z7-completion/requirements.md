# Requirements Document: Zotero 7 Migration Completion

## Introduction

This spec addresses the remaining blocking issues preventing the ODF Scan plugin from fully functioning in Zotero 7. While the initial migration (zotero7-migration spec) established the bootstrap structure, localization, and basic UI, several critical components still use deprecated APIs or reference non-existent UI elements.

The plugin currently:
- Loads in Zotero 7 (bootstrap.js imports Services.jsm, loads prefs.js)
- Shows menu item in Tools menu
- Opens the wizard dialog with intro/scan/complete pages
- Has Fluent localization properly linked

But it fails when:
- User advances past intro page (ZIP APIs use deprecated XPCOM)
- Controller code references missing UI elements (tree widgets, style listbox)
- Citation mapping/style selection pages don't exist in XHTML

## Alignment with Product Vision

Per product.md, the plugin must:
1. Convert ODF citation markers to Zotero reference marks (and vice versa)
2. Support collaboration workflows with round-trip fidelity
3. Work seamlessly in Zotero 7.x

This spec directly addresses the Zotero 7 compatibility goal from the product vision's "Current Focus" section.

## Requirements

### Requirement 1: ZIP File Handling with Modern APIs

**User Story:** As a user, I want to convert ODF files in Zotero 7, so that I can use the plugin's core functionality.

#### Acceptance Criteria

1. WHEN user selects an ODF file and clicks Next THEN the system SHALL read content.xml and meta.xml from the ZIP archive using JSZip or equivalent pure JavaScript library
2. WHEN conversion completes THEN the system SHALL write the modified XML back to a new ODF file without using deprecated XPCOM APIs (nsIZipReader, nsIZipWriter, nsIScriptableUnicodeConverter)
3. IF the input file is corrupted or unreadable THEN the system SHALL display an error message and allow the user to select a different file
4. WHEN processing ODF files THEN the system SHALL NOT use Components.utils.import or Components.classes for ZIP operations

### Requirement 2: Simplified Wizard UI for ODF-Only Mode

**User Story:** As a user, I want a streamlined wizard that handles ODF to citations and ODF to markers conversions, so that I can complete my workflow without encountering missing UI errors.

#### Acceptance Criteria

1. WHEN the wizard opens THEN the system SHALL display the intro page with file type selection (ODF to citations, ODF to markers)
2. WHEN user selects input/output files and clicks Next THEN the system SHALL show a scan progress page
3. WHEN scan completes successfully THEN the system SHALL advance to the complete page showing success message
4. IF scan encounters errors THEN the system SHALL display the error and allow retry
5. WHEN user clicks Finish THEN the system SHALL close the dialog

Note: RTF scan mode with citation mapping, style selection, and bibliography generation is deferred to a future enhancement. The current scope focuses on ODF mode which doesn't require the complex tree/listbox UI.

### Requirement 3: Remove Dead Code Paths

**User Story:** As a developer, I want the codebase to only contain functional code paths, so that errors don't occur from calling non-existent elements.

#### Acceptance Criteria

1. WHEN the plugin loads THEN the system SHALL NOT reference UI elements that don't exist in rtfScan.xhtml (tree, treechildren, style-listbox, etc.)
2. WHEN running in ODF mode THEN the system SHALL skip citation mapping and style selection steps (these are RTF-specific)
3. IF legacy RTF code paths are reached THEN the system SHALL either gracefully skip them or show "RTF mode not yet supported in Zotero 7" message

### Requirement 4: Localization Alignment

**User Story:** As a user, I want all UI text to come from localization files, so that the plugin can be translated.

#### Acceptance Criteria

1. WHEN the wizard displays THEN all visible text SHALL come from odf-scan.ftl via data-l10n-id attributes
2. WHEN getString() is called THEN the system SHALL return the localized string from the Fluent bundle
3. IF a localization key is missing THEN the system SHALL fall back to English text from the .ftl file (not hardcoded in JS/XHTML)

### Requirement 5: Build and Lint Verification

**User Story:** As a developer, I want the build and lint processes to pass, so that I can verify code quality.

#### Acceptance Criteria

1. WHEN running `python3 build.py` THEN the system SHALL create a valid XPI file including all required files
2. WHEN running `npm test` (after npm install) THEN ESLint SHALL pass without errors
3. WHEN the XPI is installed in Zotero 7 THEN the plugin SHALL load without console errors

## Non-Functional Requirements

### Code Architecture and Modularity
- **Single Responsibility Principle**: ZIP handling should be isolated in a separate module/class
- **Modular Design**: JSZip integration should be encapsulated so it can be swapped if needed
- **Clear Interfaces**: Conversion logic should be separate from UI controller

### Performance
- ODF file processing should complete within 5 seconds for documents under 1MB
- Progress indicator should update during long operations

### Reliability
- Plugin should gracefully handle malformed ODF files
- Errors should be logged to Zotero debug console
- User should always be able to close the dialog even on error

### Compatibility
- Must work with Zotero 7.0 - 7.999 (per manifest.json)
- Should work with both LibreOffice and OpenOffice generated ODF files

## References

- Zotero 7 Developer Guide: https://www.zotero.org/support/dev/zotero_7_for_developers
- Make It Red Sample Plugin: https://github.com/zotero/make-it-red (src-2.0 for Z7-only)
- JSZip Library: https://stuk.github.io/jszip/
- Existing steering docs: .spec-workflow/steering/

# Requirements Document

## Introduction

This specification defines the requirements for migrating the ODF Scan plugin from Zotero 6 (XUL-based) to Zotero 7 (XHTML-based). The migration must preserve all existing functionality while adopting the modern Zotero 7 plugin architecture.

The migration addresses three critical areas:
1. **UI Conversion**: XUL wizard dialog to XHTML with custom wizard-like navigation
2. **API Updates**: Replace deprecated XPCOM APIs with modern JavaScript equivalents
3. **Localization**: Migrate from DTD/properties to Fluent (.ftl) format

## Alignment with Product Vision

This migration directly supports the product objectives stated in `product.md`:
- **Maintain backwards compatibility during Zotero 7 transition** - The primary goal
- **Provide reliable citation round-tripping** - All conversion modes must continue to work
- **Support users of non-Microsoft word processors** - Core functionality preservation
- **Enable Zotero usage in collaborative academic workflows** - Uninterrupted service

## Requirements

### REQ-1: Plugin Installation and Lifecycle

**User Story:** As a Zotero 7 user, I want to install the ODF Scan plugin, so that I can convert citation markers in ODF files.

#### Acceptance Criteria

1. WHEN user installs the XPI in Zotero 7 THEN the system SHALL install without errors and appear in Add-ons Manager
2. WHEN Zotero 7 starts with the plugin installed THEN the system SHALL register the "ODF Scan" menu item in the Tools menu
3. WHEN user clicks "ODF Scan" menu item THEN the system SHALL open the ODF Scan wizard dialog
4. WHEN Zotero 7 shuts down THEN the system SHALL clean up all plugin resources without errors
5. WHEN user disables or removes the plugin THEN the system SHALL unregister all menu items and release resources

### REQ-2: Wizard Dialog UI

**User Story:** As a user, I want a multi-step wizard interface, so that I can be guided through the ODF conversion process.

#### Acceptance Criteria

1. WHEN wizard opens THEN the system SHALL display the intro page with file type selector (ODF to citations, ODF to markers)
2. WHEN user selects file type THEN the system SHALL update the description text and file browser configuration
3. WHEN user clicks "Choose File" for input THEN the system SHALL open a file picker filtered for .odt files
4. WHEN user clicks "Choose File" for output THEN the system SHALL open a save dialog with suggested filename
5. WHEN user advances from intro page THEN the system SHALL proceed to scan page and begin processing
6. WHEN scan completes successfully THEN the system SHALL automatically advance to completion page
7. WHEN an error occurs during scanning THEN the system SHALL display an error message and allow user to go back
8. IF wizard is closed at any step THEN the system SHALL cancel any in-progress operations

### REQ-3: ODF to Citations Conversion

**User Story:** As a user, I want to convert scannable cite markers to Zotero reference marks, so that I can use Zotero's word processor integration.

#### Acceptance Criteria

1. WHEN processing ODF file with scannable cite markers THEN the system SHALL detect all marker formats:
   - Plain text: `{prefix | citation | locator | suffix | key}`
   - Linked markers (with hyperlinks)
   - Native Zotero reference marks (for round-trip)
2. WHEN converting markers THEN the system SHALL generate Zotero-compatible `<text:reference-mark>` elements
3. WHEN marker includes prefix THEN the system SHALL preserve prefix in the citation properties
4. WHEN marker includes locator (e.g., "p. 33") THEN the system SHALL preserve locator in the citation properties
5. WHEN marker includes suffix THEN the system SHALL preserve suffix in the citation properties
6. WHEN marker includes suppress-author flag (minus sign) THEN the system SHALL set suppress-author property
7. WHEN conversion completes THEN the system SHALL write the modified ODF file to the output path

### REQ-4: ODF to Markers Conversion (Reverse)

**User Story:** As a user, I want to convert Zotero reference marks back to scannable cite markers, so that I can share documents with collaborators.

#### Acceptance Criteria

1. WHEN processing ODF file with Zotero reference marks THEN the system SHALL extract citation data from reference mark names
2. WHEN extracting citation THEN the system SHALL reconstruct scannable cite format with all properties
3. WHEN citation has prefix THEN the system SHALL include prefix in first field position
4. WHEN citation has locator THEN the system SHALL include locator in third field position
5. WHEN citation has suffix THEN the system SHALL include suffix in fourth field position
6. WHEN citation has suppress-author THEN the system SHALL include minus sign prefix on citation text

### REQ-5: ZIP File Handling

**User Story:** As a developer, I want modern ZIP handling that works in Zotero 7, so that ODF files can be read and written.

#### Acceptance Criteria

1. WHEN reading ODF file THEN the system SHALL extract content.xml and meta.xml using Zotero 7-compatible methods
2. WHEN writing ODF file THEN the system SHALL replace content.xml and meta.xml while preserving other archive contents
3. IF ODF file is corrupted or not a valid ZIP THEN the system SHALL display a meaningful error message
4. WHEN file operations complete THEN the system SHALL properly close all file handles

### REQ-6: Localization

**User Story:** As a user, I want all UI text to be properly localized, so that I can use the plugin in my language.

#### Acceptance Criteria

1. WHEN wizard displays THEN all UI strings SHALL be loaded from Fluent (.ftl) localization files
2. WHEN error occurs THEN error messages SHALL be localized
3. WHEN localization key is missing THEN the system SHALL fall back to English string
4. IF user's locale is supported THEN the system SHALL display strings in user's language

### REQ-7: Preferences Persistence

**User Story:** As a user, I want my settings to be remembered, so that I don't have to reconfigure the plugin each time.

#### Acceptance Criteria

1. WHEN user selects file type THEN the system SHALL remember the preference for next session
2. WHEN user selects input file THEN the system SHALL remember the directory for next file picker
3. WHEN user selects output file THEN the system SHALL remember the directory for next file picker
4. WHEN plugin starts THEN the system SHALL restore last used preferences

### REQ-8: Scannable Cite Translator

**User Story:** As a user, I want to export citations as scannable cite markers, so that I can drag-and-drop them into my document.

#### Acceptance Criteria

1. WHEN plugin installs THEN the system SHALL register the Scannable Cite translator with Zotero
2. WHEN user exports item with Scannable Cite format THEN the system SHALL generate correctly formatted marker
3. WHEN translator is installed THEN the system SHALL verify successful registration

## Non-Functional Requirements

### Code Architecture and Modularity

- **Bootstrap Pattern**: Follow Zotero 7 bootstrap.js pattern with async lifecycle hooks
- **Chrome Registration**: Use `aomStartup.registerChrome()` for content registration
- **Namespace Pattern**: Maintain `Zotero.ODFScan` namespace for plugin API
- **Separation of Concerns**: UI logic separate from conversion logic where practical

### Performance

- **File Processing**: Handle documents with 500+ citations within 10 seconds
- **Memory Usage**: Clean up resources after conversion completes
- **UI Responsiveness**: Show progress indicator during long operations
- **Startup Time**: Plugin initialization should not noticeably delay Zotero startup

### Security

- **File Access**: Only access user-selected files via standard file pickers
- **No Network**: Plugin operates entirely offline, no external requests
- **Content Handling**: Properly escape/sanitize XML content to prevent injection

### Reliability

- **Error Recovery**: Handle malformed markers gracefully without crashing
- **File Integrity**: Never corrupt input files; only write to output file
- **State Management**: Clean up properly on dialog close or plugin disable

### Usability

- **Familiar UI**: Maintain wizard-like flow similar to current XUL version
- **Clear Feedback**: Show progress during scan, clear error messages on failure
- **File Defaults**: Remember last used directories and suggest appropriate filenames
- **Accessibility**: Use semantic HTML elements and proper ARIA attributes where needed

### Compatibility

- **Zotero Version**: Support Zotero 7.0 through 7.999 (strict_min_version: 6.999, strict_max_version: 8.*)
- **Platform Support**: Windows, macOS, Linux
- **ODF Version**: Support ODF files from LibreOffice 6.x and later

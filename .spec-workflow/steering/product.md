# Product Overview

## Product Purpose

ODF Scan for Zotero is a plugin that enables users to work with citation markers in OpenDocument Format (ODF) and Rich Text Format (RTF) files. It bridges the gap between word processors that don't have native Zotero integration (like LibreOffice Writer without the plugin) and Zotero's citation management system.

The plugin solves two key problems:
1. **Citation Round-tripping**: Converts human-readable citation markers (e.g., `{Author | Title | Locator | | zu:0:ITEMKEY}`) into Zotero-compatible reference marks that can be managed by Zotero's word processor integration
2. **Collaboration Workflow**: Allows users to share documents with collaborators who don't have Zotero, receive edits back, and convert the citation markers back to live Zotero citations

## Target Users

**Primary Users:**
- Academic researchers and writers using Zotero for reference management
- LibreOffice/OpenOffice users who need Zotero citation integration
- Collaborators working with shared documents across different systems
- Authors who need to convert between "scannable cite" markers and live citations

**User Pain Points:**
- Cannot easily collaborate on documents with live Zotero citations
- Need to convert documents between marker-based and citation-based formats
- Want to use word processors without native Zotero integration
- Need to maintain citation fidelity during document exchange

## Key Features

1. **ODF to Citations Conversion**: Scans ODF files for citation markers and converts them to Zotero reference marks that can be processed by Zotero's word processor integration

2. **ODF to Markers Conversion**: Reverse conversion - extracts Zotero citation data from reference marks and converts back to human-readable scannable cite markers for sharing

3. **RTF Scan Support**: Legacy support for RTF file format conversion with citation style selection and bibliography generation

4. **Multi-format Citation Markers**: Supports multiple citation marker formats including:
   - Plain text markers: `{prefix | citation | locator | suffix | key}`
   - Linked markers (with hyperlinks)
   - Native Zotero reference marks

5. **Scannable Cite Translator**: Bundled export translator that generates scannable citation markers from Zotero items

## Business Objectives

- Enable Zotero usage in collaborative academic workflows
- Support users of non-Microsoft word processors (LibreOffice, OpenOffice)
- Maintain backwards compatibility during Zotero 7 transition
- Provide reliable citation round-tripping for document exchange

## Success Metrics

- **Functionality**: All conversion modes (ODF to citations, ODF to markers, RTF scan) work correctly in Zotero 7
- **Compatibility**: Plugin installs and runs on Zotero 7.x without errors
- **Fidelity**: Citation data (authors, locators, prefixes, suffixes) preserved through round-trip conversions
- **User Experience**: Wizard-based interface guides users through conversion process

## Product Principles

1. **Preserve Citation Integrity**: Never lose or corrupt citation metadata during conversions. Citation prefixes, suffixes, locators, and item keys must survive round-trips.

2. **Support Standard Workflows**: Work seamlessly with Zotero's existing word processor integration. Output should be indistinguishable from citations created directly in the word processor.

3. **Graceful Degradation**: Handle edge cases (malformed markers, missing items, corrupt files) without crashing. Provide meaningful error messages.

4. **Minimal Dependencies**: Keep external dependencies minimal to reduce maintenance burden and improve reliability.

## Monitoring & Visibility (if applicable)

- **Interface Type**: XUL/XHTML wizard dialog within Zotero
- **Progress Feedback**: Step-by-step wizard pages showing:
  - File selection (input/output)
  - Scan progress
  - Citation mapping (for RTF mode)
  - Style selection (for RTF mode)
  - Completion status
- **Error Handling**: Error messages displayed in wizard for invalid files or conversion failures

## Future Vision

### Current Focus: Zotero 7 Migration
The immediate goal is migrating from Zotero 6 (XUL-based) to Zotero 7 (XHTML-based):
- Convert XUL wizard UI to XHTML/HTML
- Replace deprecated XPCOM APIs (especially ZIP handling)
- Update bootstrap.js for Zotero 7 lifecycle
- Migrate localization from DTD/properties to Fluent (.ftl)

### Potential Enhancements
- **Modern Build System**: Adopt zotero-plugin-scaffold for TypeScript support and better tooling
- **Improved Error Recovery**: Better handling of partially corrupted documents
- **Batch Processing**: Support for converting multiple files at once
- **Format Detection**: Automatic detection of marker format and conversion direction
